/* B1: independent per-enemy damage/spawn ledger; no batching formula oracle. */
window.runFarmConservationQa=function(b,ctx,assert){
  var t=b.labMotes,checks=0,clock=2000000000000,rows=[];
  function ok(v,m){checks++;assert(v,'B1 conservation oracle: '+m);}
  function near(a,c,m){ok(Math.abs(a-c)<1e-7,m+' ('+a+' vs '+c+')');}
  function fixture(depth,frac,flag,accum,needed){
    var s=b.freshStateSnapshot(),tracking=depth>60?10:0,moteLevels=depth>60?7:0,support=depth>60?5:0;
    s.riftMode='farm';s.depth=s.enemyDepth=s.farmDepth=depth;s.farmReturnDepth=depth+1;s.maxDepthEver=130;
    s.enemyMaxHp=b.enemyHpFor(depth);s.enemyHp=s.enemyMaxHp*frac;s.enemyIsLuminous=flag;s.luminousAccum=accum;
    s.lumen=s.shards=1e9;s.questDay=ctx.currentDay();s.research.luminoustracking=tracking;s.longStudyLevels.motestudy=moteLevels;
    if(support){s.activeParty=['ember','tide'];s.spirits.tide=1;s.wispModules.tide=support;}
    var reward=Math.max(1,Math.round(Math.max(1,Math.round((1+depth/8)*(1+moteLevels*.1)))*(1+support*.05)));
    var target=needed*reward>60?4:3,cost=target===4?110:60;
    s.activeStudies=[{id:'guardmastery',remainingSec:300,totalDurationSec:600,speedMult:1}];
    s.studyUseMotes.guardmastery=true;s.studySpeedTargets.guardmastery=target;s.motes=cost-needed*reward;
    return {s:s,frac:frac,flag:flag,accum:accum,needed:needed,reward:reward,cost:cost,target:target,
      chance:Math.min(.35,Math.min(.30,.03+Math.floor(depth/10)*.02)+tracking*.005),dps:s.enemyMaxHp*100};
  }
  function ledger(f,seconds){
    // Consume one enemy at a time in HP units, tracking each actual spawn/reward.
    var damage=100*seconds,hp=f.frac,acc=f.accum,flag=f.flag,kills=0,luminous=0,payment=null,spentDamage=0;
    while(damage>=hp-1e-12){
      damage-=hp;spentDamage+=hp;kills++;if(flag)luminous++;
      if(payment===null&&luminous>=f.needed)payment=spentDamage/100;
      acc+=f.chance;flag=acc+1e-12>=1;if(flag)acc-=1;hp=1;
    }
    return {kills:kills,luminous:luminous,hp:hp-damage,accum:acc,payment:payment};
  }
  function run(f,seconds,use,kind,split){
    var s=JSON.parse(JSON.stringify(f.s));s.studyUseMotes.guardmastery=use;b.setState(s);
    return t.withDps(f.dps,function(){
      if(!split)return t.direct(seconds,kind||'live',clock);
      var a=t.direct(split,kind||'live',clock),c=t.direct(seconds-split,kind||'live',clock+split*1000);
      ['kills','luminousKills','motesGained','studySpeedPurchases','studyMotesSpent','lumenGained','shardGained'].forEach(function(k){c.summary[k]+=a.summary[k];});
      c.summary.timeline=a.summary.timeline.concat(c.summary.timeline.map(function(e){var copy=Object.assign({},e);copy.elapsedSec+=split;return copy;}));return c;
    });
  }
  function verify(f,seconds,r,use,kind){
    var o=ledger(f,seconds),scale=kind==='offline'?.7:1;
    ok(r.summary.kills===o.kills,'one reward per actually defeated enemy');ok(r.summary.luminousKills===o.luminous,'spawn-by-spawn luminous kills');
    near(r.state.enemyHp/r.state.enemyMaxHp,o.hp,'remaining HP fraction');near(r.state.luminousAccum,o.accum,'spawn accumulator');
    near(r.summary.lumenGained,Math.round(5*Math.pow(1.11,f.s.depth))*o.kills*scale,'Lumen ledger');
    near(r.summary.shardGained,Math.round(Math.pow(1.09,f.s.depth))*o.kills*scale,'Shard ledger');
    var buys=use&&o.payment!==null?1:0;
    ok(r.summary.studySpeedPurchases===buys&&r.summary.studyMotesSpent===buys*f.cost,'exact full-price purchases');
    near(r.state.motes,f.s.motes+o.luminous*f.reward-buys*f.cost,'Motes ledger');
    near(r.state.activeStudies[0].remainingSec,300-seconds-(buys?(seconds-o.payment)*(f.target-1):0),'only post-payment work');
    if(buys)near(r.summary.timeline.find(function(e){return e.type==='studySpeed';}).elapsedSec,o.payment,'actual reward payment time');
    return o;
  }
  var main=fixture(1,.73,false,.975,1);
  function mainContract(){var r=run(main,.9,true);verify(main,.9,r,true);ok(r.summary.kills===90&&r.state.lumen===1000000540&&r.state.shards===1000000090,'documented B1 economy');near(r.state.activeStudies[0].remainingSec,297.3346,'documented B1 work');return r;}
  var positive=mainContract(),undo=t.mutate('double-round'),caught=false;
  try{mainContract();}catch(e){caught=/B1 conservation oracle/.test(e.message);}finally{undo();}
  ok(caught,'exact old double-round implementation must fail oracle');mainContract();
  [.01729999,.0173,.01730001,.9].forEach(function(seconds){[false,true].forEach(function(use){['live','offline'].forEach(function(kind){var r=run(main,seconds,use,kind);verify(main,seconds,r,use,kind);rows.push({seconds:seconds,use:use,kind:kind,kills:r.summary.kills,motes:r.state.motes,work:r.state.activeStudies[0].remainingSec});});});});
  [false,true].forEach(function(use){['live','offline'].forEach(function(kind){verify(main,.9,run(main,.9,use,kind,.0173),use,kind);});});
  var tested=0;
  [1,11,19,61,121].forEach(function(depth){[.13,.29,.37,.5,.61,.73,.89].forEach(function(frac){[false,true].forEach(function(flag){[.04,.13,.63,.975].forEach(function(accum){[1,2,3].forEach(function(needed){
    var f=fixture(depth,frac,flag,accum,needed),o=ledger(f,.9);if(o.payment===null)return;tested++;
    var on=run(f,.9,true),off=run(f,.9,false);verify(f,.9,on,true);verify(f,.9,off,false);
    ok(on.state.lumen===off.state.lumen&&on.state.shards===off.state.shards,'ON/OFF reward conservation');
  });});});});});
  ok(tested===826,'all 826 QA conservation fixtures remain covered');
  return {checks:checks,fixtures:tested,causalControl:'old-double-round rejected; undo passes',boundaryRows:rows,
    minimum:{kills:positive.summary.kills,luminous:positive.summary.luminousKills,motes:positive.state.motes,work:positive.state.activeStudies[0].remainingSec}};
};
