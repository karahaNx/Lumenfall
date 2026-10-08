/* Literal cap/price oracle against real preview, handler and queue entrypoints. */
window.runSwiftRecoveryQa=function(b,ctx,assert,parity){
  var f=b.forge,checks=0,cases=0,T=2000000000000.375;
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(level){var s=window.forgeSeed(b,ctx);s.research.charge=level;s.lastSeen=T;return s;}
  function price(level,count){var sum=0;for(var i=0;i<count;i++)sum+=30*Math.pow(1.55,level+i);return Math.ceil(sum);}
  var node=f.nodes().find(function(n){return n.id==='charge';});
  ok(node.levelCap===10,'Swift authoritative cap10');
  [0,8,9,10,11,25,100].forEach(function(level){
    [1,5,10,25,50,100,'max',0,-1,1.5].forEach(function(request){
      ['funded','one','empty'].forEach(function(budget){
        var s=seed(level);s.lumen=0;s.shards=budget==='funded'?1e30:budget==='one'?price(level,1):0;
        b.setState(s);var before=b.getState(),plan=f.plan('charge',request);
        var valid=request==='max'||Number.isInteger(request)&&request>0;
        var expected=!valid||level>=10||budget==='empty'?0:Math.min(10-level,budget==='one'?1:request==='max'?10:request);
        ok(plan.buyCount===expected,'Swift count '+level+'/'+request+'/'+budget);
        ok(plan.cost.shard===(expected?price(level,expected):0)&&plan.cost.lumen===0,'Swift rounded geometric total');
        var preview=f.preview('charge',request);
        ok(Math.abs(preview.current.cycle-6/(1+.08*Math.min(level,10)))<1e-12,'Swift actual current cycle');
        ok((preview.next===null)===(level>=10),'Swift no next effect at cap');
        f.buy('charge',request);var after=b.getState();
        ok(after.research.charge===level+expected,'Swift raw history/purchased delta');
        ok(after.shards===before.shards-(expected?price(level,expected):0),'Swift exact handler debit');
        ok(after.lumen===before.lumen,'Swift never charges Lumen');
        if(!expected)same(after,before,'Swift rejected purchase is pure');
        cases++;
      });
    });
  });
  [9,10,25,100].forEach(function(level){
    var s=seed(level);s.shards=1e30;s.researchQueue.charge=true;b.setState(s);var before=b.getState();
    f.queue();var after=b.getState();ok(after.research.charge===Math.max(10,level),'Queue stops at10; old history retained');
    ok(after.shards===before.shards-(level===9?price(9,1):0),'Queue no charge at cap');
    ok(after.researchQueue.charge,'Queue intent retained at cap');
    ['live','offline'].forEach(function(kind){b.setState(s);var r=b.simulateTimeline(1,kind,T);ok(r.state.research.charge===Math.max(10,level),'simulation queue cap '+kind);ok(r.summary.researchBought===(level===9?1:0),'actual simulation purchase count');});
  });
  // Real last-level purchase changes subsequent charge speed identically online/offline.
  var s=seed(9);s.shards=price(9,1);s.researchQueue.charge=true;s.spirits.tide=s.spirits.aurora=1;s.activeParty=['tide','aurora'];
  s.heroRarity.tide=s.heroRarity.aurora=5;s.wispUltimate.tide=s.wispUltimate.aurora=true;
  b.setState(s);var live=b.simulateTimeline(20,'live',T);b.setState(s);var offline=b.simulateTimeline(20,'offline',T);
  parity(live.state,offline.state,'Swift last queued purchase live/offline');
  ok(live.summary.researchBought===1&&offline.summary.researchBought===1,'one last Swift purchase');
  ok(live.state.research.charge===10&&live.state.shards===0,'last level paid once');
  // UI exposes historical ownership and capped effect; preview/render stay pure.
  s=seed(25);s.shards=1e30;b.setState(s);b.renderLayout();var before=b.getState();
  var card=document.querySelector('[data-forge-card="charge"]');
  ok(card.textContent.includes('Level 25 / 10')&&card.textContent.includes('3.3333s ability cycle'),'old Swift level and effective cycle visible');
  ok(card.querySelector('[data-research="charge"]').disabled,'cap button disabled');
  ok(card.textContent.includes('Next: Maxed'),'no false next-level promise');
  b.renderLayout();same(b.getState(),before,'Swift render has no payment or migration');
  // Paid manual readiness uses the same cast duration and cannot bypass the
  // existing three-use run limit. Same-source recasts do not stack strength.
  ctx.setClock(T);s=seed(10);s.sigils=1000;s.activeParty=['tide','aurora'];
  Object.keys(s.wispUltimate).forEach(function(id){s.wispUltimate[id]=true;s.heroRarity[id]=5;});
  s.spirits.tide=s.spirits.aurora=1;b.setState(s);
  ['tide','aurora','tide'].forEach(function(id){
    ok(b.supportTest.resonate(id),'real paid Resonate accepted');
    b.simulateTimeline(0,'live',T);
    ok(b.getState().supportBuffs.sources[id].until===T+1500,'Resonate uses actual1.5s cast');
  });
  before=b.getState();ok(before.sigilResonanceUses===3,'existing Resonate run limit retained');
  ok(!b.supportTest.resonate('aurora'),'fourth manual readiness rejected');
  same(b.getState(),before,'rejected Resonate no payment');
  ok(b.supportTest.factor(T)===2,'manual recasts retain additive pair; no self stacking');
  b.simulateTimeline(1.5,'live',T);ok(b.supportTest.factor(T+1500)===1,'manual cast pair expires exactly with a gap');
  return {checks:checks,purchaseCases:cases,queueCases:4,resonate:true,rawHistory:true,cycleMinimum:10/3};
};
