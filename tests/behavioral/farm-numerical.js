/* B2: consume exact represented damage/current HP, independent of production quotient. */
window.runFarmNumericalQa=function(b,ctx,assert){
  var t=b.labMotes,checks=0,rows=[],clock=2000000000000;
  function ok(v,m){checks++;assert(v,'B2 exact damage oracle: '+m);}
  function near(a,c,m){ok(Math.abs(a-c)<1e-7,m+' ('+a+' vs '+c+')');}
  function units(x){
    var v=new DataView(new ArrayBuffer(8));v.setFloat64(0,x);
    var bits=v.getBigUint64(0),e=Number((bits>>52n)&2047n);
    var mantissa=(bits&((1n<<52n)-1n))+(e?1n<<52n:0n);
    return mantissa<<BigInt(e?e-1:0);
  }
  function seed(natural,use){
    var s=b.freshStateSnapshot();Object.assign(s,{riftMode:'farm',depth:1,enemyDepth:1,farmDepth:1,farmReturnDepth:2,maxDepthEver:130,enemyMaxHp:11,enemyHp:natural?8.03:11,enemyIsLuminous:false,luminousAccum:.975,motes:natural?59:0,lumen:0,shards:0,questDay:ctx.currentDay()});
    s.activeStudies=[{id:'guardmastery',remainingSec:300,totalDurationSec:600,speedMult:1}];s.studyUseMotes.guardmastery=use;s.studySpeedTargets.guardmastery=3;
    if(natural){s.activeParty=['titan'];s.spirits.titan=1635;s.heroRarity.titan=5;s.heroRarity.ember=1;s.heroResource.titan=0;s.research.formation=500;s.longStudyLevels.formationstudy=500;s.longStudyLevels.wispascend=500;s.nodes.momentum=500;s.ascendCount=5;s.achieved.asc5=true;}
    return s;
  }
  function verifySegments(trace,kind){
    var total=0,luminous=0,lumen=0,shards=0,motes=0,damage=0n;
    trace.rows.forEach(function(r){
      var D=units(r.damage),h=units(r.before.enemyHp),H=units(r.before.enemyMaxHp);
      var expected=D<h?0:Number(1n+(D-h)/H);
      var threshold=h+BigInt(expected)*H,deficit=threshold-D;
      // Existing boundary tolerances may promote a represented near-threshold
      // input. This is a separate, explicit classification, never an extra
      // tolerance for the two quotient counterexamples.
      var tolerant=r.kills===expected+1 && deficit>0n && (deficit<=units(1e-9)||deficit<=units(r.before.enemyMaxHp*1e-12));
      ok(r.kills===expected||tolerant,'one reward per defeated HP threshold');
      var rem=expected===0?h-D:H-(D-h)%H;
      var expectedHp=tolerant?11:Number(rem>>1022n)/Math.pow(2,52);
      near(r.after.enemyHp,expectedHp,'partial HP carry for actual represented segment');
      var count=r.kills,acc=r.before.luminousAccum,chance=.03;
      // Retain the existing represented batch-spawn policy, including its
      // epsilon and summation order. Large spawn totals are not exact reals.
      var lk=(r.before.enemyIsLuminous?1:0)+(count>1?Math.floor(acc+(count-1)*chance+1e-12):0);
      var after=acc+count*chance,crossings=Math.floor(after+1e-12),final=after-crossings;
      ok(r.luminous===lk,'represented luminous spawn policy');
      near(r.after.luminousAccum,Math.max(0,Math.min(.999999999999,final)),'spawn accumulator');
      ok(r.after.enemyIsLuminous===(Math.floor(after+1e-12)>Math.floor(acc+Math.max(0,count-1)*chance+1e-12)),'next luminous enemy');
      var scale=kind==='offline'?.7:1;
      total+=count;luminous+=lk;lumen+=6*scale*count;shards+=scale*count;motes+=lk;damage+=D;
    });
    return {kills:total,luminous:luminous,lumen:lumen,shards:shards,motes:motes,damageUnits:String(damage)};
  }
  function run(natural,use,kind,split){
    var s=seed(natural,use),normalized=b.setState(s),dps=natural?t.naturalDps():2**55+16,seconds=natural?.9:1;
    if(natural){ok(dps===40052722017724424,'actual natural product DPS');var costs=t.numericCosts();Object.values(costs).forEach(function(c){if(typeof c==='object')Object.values(c).forEach(function(v){ok(Number.isFinite(v)&&v>=0,'finite normalized next price');});else ok(Number.isFinite(c)&&c>0,'finite normalized next price');});ok(normalized.spirits.titan===1635&&normalized.research.formation===500,'normalization preserves stress investments');}
    var trace=t.traceFarm(function(){
      function execute(){var a=t.direct(split||seconds,kind,clock);if(!split)return a;var z=t.direct(seconds-split,kind,clock+split*1000);['kills','luminousKills','lumenGained','shardGained','motesGained','studySpeedPurchases','studyMotesSpent'].forEach(function(k){z.summary[k]+=a.summary[k];});z.summary.timeline=a.summary.timeline.concat(z.summary.timeline.map(function(e){return Object.assign({},e,{elapsedSec:e.elapsedSec+split});}));return z;}
      return natural?execute():t.withDps(dps,execute);
    });
    var r=trace.result,o=verifySegments(trace,kind),expected=natural?3277040892359271:3275345183542180;
    ok(r.summary.kills===expected&&r.state.totalKills===expected,'documented safe kill count');
    ok(r.summary.kills===o.kills&&r.summary.luminousKills===o.luminous,'segment kill and spawn ledger');
    ok(r.summary.lumenGained===o.lumen&&r.state.lumen===o.lumen,'represented Lumen policy and sum');
    ok(r.summary.shardGained===o.shards&&r.state.shards===o.shards,'represented Shard policy and sum');
    var buys=natural&&use?1:0;
    ok(r.summary.studySpeedPurchases===buys&&r.summary.studyMotesSpent===buys*60,'one full-price actual Motes purchase');
    ok(r.state.motes===s.motes+o.motes-buys*60,'Motes ledger');
    var payment=buys?r.summary.timeline.find(function(e){return e.type==='studySpeed';}).elapsedSec:null;
    if(buys)near(payment,(8.03+11)/dps,'first enabling Luminous reward time');
    near(r.state.activeStudies[0].remainingSec,300-seconds-(buys?(seconds-payment)*2:0),'only post-payment Study work');
    ok(!r.summary.abilityCasts&&!r.summary.ascends&&!r.summary.completedStudies.length,'no unrelated economy event');
    var out={natural:natural,use:use,kind:kind,split:split,expected:expected,kills:r.summary.kills,hp:r.state.enemyHp,motes:r.state.motes,work:r.state.activeStudies[0].remainingSec,representedDamageExact:(dps*seconds).toFixed(0),ledger:o,segments:trace.rows.length};rows.push(out);return out;
  }
  [false,true].forEach(function(natural){(natural?[false,true]:[false]).forEach(function(use){['live','offline'].forEach(function(kind){[0,natural?.01:.5].forEach(function(split){run(natural,use,kind,split);});});});});
  // The actual old R2 function is embedded byte-for-byte in the private bridge.
  // Reject each minimum separately; restoration must pass both again.
  [false,true].forEach(function(natural){var undo=t.mutate('rounded-quotient'),caught=false;try{run(natural,false,'live',0);}catch(e){caught=/B2 exact damage oracle/.test(e.message);}finally{undo();}ok(caught,'exact old R2 must fail '+(natural?'natural':'Core')+' oracle');run(natural,false,'live',0);});
  return {checks:checks,rows:rows,causalControl:'both exact old-R2 minima rejected; undo passes',limit:'represented damage per segment; original spawn/reward rounding; split HP differs when represented damage differs'};
};
