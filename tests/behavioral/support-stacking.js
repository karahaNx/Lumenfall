/* Source identity is persisted; damage/time oracles below are independent. */
window.supportStackSeed=function(b,ctx,ids){
  var s=b.freshStateSnapshot();s.depth=101;s.maxDepthEver=101;s.enemyDepth=101;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(101);
  Object.keys(s.spirits).forEach(function(id){s.spirits[id]=0;s.heroResource[id]=0;});
  (ids||['ember']).forEach(function(id){s.spirits[id]=1;});s.activeParty=(ids||['ember']).slice();s.questDay=ctx.currentDay();s.loginStreak=1;
  return s;
};
window.runSupportStacking=function(b,ctx,assert,parity){
  var q=b.supportTest,T=2000000000000.375,checks=0,records=[],negatives=[],copy=x=>JSON.parse(JSON.stringify(x));
  function ok(v,m){checks++;assert(v,m);}
  function near(a,c,m){ok(Number.isFinite(a)&&Math.abs(a-c)<=1e-6,m+' actual='+a+' expected='+c);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(ids,ults){ctx.setClock(T);var s=window.supportStackSeed(b,ctx,ids);(ults||[]).forEach(id=>{s.heroRarity[id]=5;s.wispUltimate[id]=true;});b.setState(s);return b.getState();}
  function cast(id,t,manual){ctx.setClock(t);if(manual)q.manual(id);else b.triggerAbilityFor(id,'live',t);}
  function factor(t,value,label){near(q.factor(t),value,label);}
  ['manual','live','offline'].forEach(function(kind){
    [[],['aurora'],['tide','aurora']].forEach(function(ults){
      [['tide','aurora'],['aurora','tide']].forEach(function(ids){
        seed(ids,ults);if(kind==='manual')ids.forEach(id=>cast(id,T,true));else{q.ready(ids);b.simulateTimeline(0,kind,T);}
        var expected=1.5+ults.length*.25;factor(T,expected,'simultaneous additive '+kind+' '+ids+' '+ults);
        var s=b.getState();ok(s.buffUntil===0&&s.buffMult===1,'new cast leaves legacy untouched');
        ids.forEach(id=>{ok(s.supportBuffs.sources[id].mult===(ults.includes(id)?1.5:1.25),'cast-time source strength');ok(s.supportBuffs.sources[id].until===T+(ults.includes(id)?1500:1000),'cast-time source deadline');});
        near(q.average(),1+ids.reduce((n,id)=>n+(ults.includes(id)?.5:.25)*(ults.includes(id)?1.5/6:1/6),0),'additive mean forecast');
        records.push({kind,ids,ults,factor:expected,records:s.supportBuffs});
      });
    });
  });
  ['tide','aurora'].forEach(id=>{seed([id]);cast(id,T);factor(T,1.25,'single support');});
  function stagger(){seed(['tide','aurora'],['aurora']);cast('aurora',T);cast('tide',T+1000);factor(T+1499.999,1.75,'stagger before');factor(T+1500,1.25,'stagger exact');factor(T+1500.001,1.25,'stagger after');factor(T+2000,1,'last expiry');ok(q.next(T+1000)===.5,'earliest independent expiry');}
  stagger();
  function refresh(){seed(['tide'],['tide']);cast('tide',T);var s=b.getState();s.wispUltimate.tide=false;b.setState(s);cast('tide',T+250);factor(T+250,1.5,'same source max strength');ok(b.getState().supportBuffs.sources.tide.until===T+1500,'same source shorter refresh');cast('tide',T+1000);ok(b.getState().supportBuffs.sources.tide.until===T+2000,'same source longer refresh');factor(T+1000,1.5,'same source no self stacking');cast('tide',T+2000);factor(T+2000,1.25,'expired source cannot pass old strength');}
  refresh();
  function legacy(){seed(['tide','aurora']);var s=b.getState();s.buffUntil=T+7000;s.buffMult=1.8;b.setState(s);cast('tide',T);cast('aurora',T+1000);factor(T+1000,1.8,'legacy floor without double counting');ok(b.getState().buffUntil===T+7000&&b.getState().buffMult===1.8,'legacy exact entitlement unchanged');factor(T+7000,1,'expired legacy neutral');}
  legacy();seed(['tide','aurora']);var ls=b.getState();ls.buffUntil=T+3000;ls.buffMult=1.25;b.setState(ls);cast('tide',T);cast('aurora',T);factor(T+500,1.5,'known sources exceed legacy without duplication');
  // Earned records remain after a Formation change to a constant-rate Ember.
  [T,4102444800125.25].forEach(function(start){['live','offline'].forEach(function(kind){
    var s=seed(['ember']);s.supportBuffs={version:1,sources:{tide:{mult:1.25,until:start+2234.375},aurora:{mult:1.5,until:start+4109.125}}};b.setState(s);s=b.getState();var rate=b.wispFormulaSnapshot('ember').passiveDps;
    function oracle(t){return rate*(t+.25*Math.min(t,2.234375)+.5*Math.min(t,4.109125));}
    [2.233875,2.234375,2.234875,4.108625,4.109125,4.109625,5].forEach(function(duration){b.setState(s);var r=b.simulate(duration,kind,duration,start);near(s.enemyHp-r.state.enemyHp,oracle(duration),'independent multi-source integral');ok(r.summary.kills===0,'integral no discrete kills');});
    b.setState(s);var direct=b.simulate(5,kind,5,start);[.5,2.234375,4.109125].forEach(function(split){b.setState(s);b.simulate(split,kind,split,start);var tail=b.simulate(5-split,kind,5-split,start+split*1000,start);parity(tail.state,direct.state,'support direct/split');});
    b.setState(s);var reference=b.simulate(5,kind,1,start);parity(reference.state,direct.state,'support one-second reference');
    records.push({kind,start,integral:s.enemyHp-direct.state.enemyHp,oracle:oracle(5)});
  });});
  // A rounded epoch can equal the stored deadline while the logical phase
  // is still just before it. Refresh must use the passed canonical position.
  var phaseSeed=seed(['tide']);phaseSeed.supportBuffs={version:1,sources:{tide:{mult:1.5,until:2000000001000.125}}};b.setState(phaseSeed);
  q.logicalCast('tide',2000000001000.125,{wholeSec:2000000001,remainingSec:.99987505});
  ok(b.getState().supportBuffs.sources.tide.mult===1.5,'logical pre-deadline refresh retains earned strength');
  b.setState(phaseSeed);q.logicalCast('tide',2000000001000.125,{wholeSec:2000000001,remainingSec:.999875});
  ok(b.getState().supportBuffs.sources.tide.mult===1.25,'logical exact-deadline refresh drops old strength');
  // Expiry, support recast and Auto-Tap at the same canonical boundary.
  var s=seed(['ember','tide']);s.supportBuffs={version:1,sources:{tide:{mult:1.5,until:T+1000}}};s.heroResource.tide=100-100/6;s.achieved.autotap=true;b.setState(s);var r=b.simulateTimeline(1,'live',T),types=r.timeline.filter(e=>e.elapsedSec===1).map(e=>e.type);
  ok(types.indexOf('buffExpire')>=0&&types.indexOf('buffExpire')<types.indexOf('ability')&&types.indexOf('ability')<types.indexOf('autoTap'),'source expiry -> ability -> Tap order');ok(r.state.supportBuffs.sources.tide.mult===1.25,'coincident recast drops old strength');
  // Actual offensive/resource functions remain outside support scope.
  [101,100].forEach(function(depth){s=seed(['ember','stone','gale','thorn','void']);s.depth=depth;s.enemyDepth=depth;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(depth);Object.keys(s.spirits).forEach(id=>{s.heroRarity[id]=5;s.wispModules[id]=3;s.wispUltimate[id]=true;});b.setState(s);var ids=s.activeParty,before=ids.map(id=>b.wispFormulaSnapshot(id,depth)),rewards=b.forge.rewards(depth),outputs=q.outputs();s=b.getState();s.supportBuffs={version:1,sources:{tide:{mult:1.25,until:T+4000},aurora:{mult:1.5,until:T+8000}}};b.setState(s);ids.forEach((id,i)=>same(b.wispFormulaSnapshot(id,depth),before[i],'support cannot alter ability/power/resource formulas '+id));same(b.forge.rewards(depth),rewards,'support cannot alter kill rewards');var boosted=q.outputs();near(boosted.passive,outputs.passive*1.75,'actual passive scope');near(boosted.tap,outputs.tap*1.75,'actual manual Tap scope');near(boosted.chip,outputs.chip*1.75,'displayed passive share');ok(boosted.text.includes('+75%')&&boosted.text.includes('next expiry 4s'),'Rift shows sum and next expiry');
    s.achieved.autotap=true;b.setState(s);var tap=b.autoTapOnce(T);near(tap.damage,outputs.tap*1.75,'actual Auto-Tap scope');
  });
  seed(['tide']);s=b.getState();s.spirits.aurora=1;b.setState(s);cast('aurora',T);ok(!b.getState().supportBuffs,'reserve cannot create boost');s.spirits.tide=0;s.formationRebuild={members:['tide','aurora'],preset:''};s.spirits.aurora=0;b.setState(s);cast('tide',T);ok(!b.getState().supportBuffs,'pending zero-level cannot create boost');
  seed(['tide','aurora']);cast('tide',T);cast('aurora',T);s=b.getState();s.spirits.ember=1;s.activeParty=['ember'];b.setState(s);factor(T,1.5,'earned boost survives Formation choice');b.ascendManual();ok(b.getState().supportBuffs===null&&b.getState().buffUntil===0&&b.getState().buffMult===1,'Ascension clears all sources');ok(b.getState().activeParty.every(id=>b.getState().spirits[id]>0),'Ascension powered-only');
  seed(['tide','aurora']);cast('tide',T);cast('aurora',T);b.ascendManual();s=b.getState();
  ok(s.formationRebuild.members.join(',')==='tide,aurora' && s.spirits.tide===0 && s.spirits.aurora===0,'Ascension keeps ordered intent, resets support power');
  s.lumen=1e8;b.setState(s);var price=b.formationTest.cost('tide'),funds=b.getState().lumen;b.formationTest.buy('tide');
  near(funds-b.getState().lumen,price,'reconstruction Wisp paid exactly once');ok(!b.getState().supportBuffs,'recruitment alone creates no boost');
  q.ready(['tide','aurora']);b.simulateTimeline(0,'live',T);
  ok(Object.keys(b.getState().supportBuffs.sources).join(',')==='tide' && b.getState().activeParty.join(',')==='tide','only rebuilt powered intended member casts');
  ok(b.getState().formationRebuild.members.join(',')==='tide,aurora','partial reconstruction retains exact intent');
  // Parsing is bounded, source order deterministic, and independent of clock.
  s=seed(['ember']);s.buffMult=3.25;s.buffUntil=T+100;s.supportBuffs={version:1,sources:{aurora:{mult:1.5,until:T-1000},tide:{mult:1.25,until:T+4000},gale:{mult:1.5,until:T+1e9}}};var canonical=b.formationTest.canonical(s);ok(canonical.supportBuffs.sources.aurora.until===T-1000,'normalize retains expired-now record for catch-up');same(b.formationTest.canonical(canonical),canonical,'fixed-clock canonical idempotence');ok(!canonical.supportBuffs.sources.gale&&canonical.buffMult===3.25,'known IDs only; legacy mult preserved');
  [{version:2,sources:{}},{version:1,sources:[]},{version:1,sources:{tide:{until:Infinity,mult:1.25},aurora:{until:T+1,mult:5}}},null].forEach(raw=>{s.supportBuffs=raw;var n=b.formationTest.canonical(s);ok(!n.supportBuffs||!Object.keys(n.supportBuffs.sources).length,'malformed map cannot grant power');});
  ['max','multiply','deadline','self','legacy'].forEach(function(kind){var undo=q.mutate(kind),caught='';try{if(kind==='deadline')stagger();else if(kind==='self')refresh();else if(kind==='legacy')legacy();else{seed(['tide','aurora']);cast('tide',T);cast('aurora',T);factor(T,1.5,'causal additive');}}catch(e){caught=e.message;}finally{undo();}ok(caught.startsWith(kind==='deadline'?'stagger':kind==='self'?'same source':kind==='legacy'?'legacy floor':'causal additive'),'causal mutation '+kind+' fails intended assertion: '+caught);negatives.push({kind,caught});});
  return {checks,records,negatives,schema:1};
};
window.runSupportPersistence=async function(b,ctx,assert,parity,phase,nextPhase,backupCode,finish){
  var key='support-persist-'+ctx.scenario,copy=x=>JSON.parse(JSON.stringify(x)),q=b.supportTest;
  if(phase()===0){
    var now=b.clockNow(),s=window.supportStackSeed(b,ctx,['ember']);s.buffUntil=now+8000;s.buffMult=1.8;s.supportBuffs={version:1,sources:{tide:{mult:1.25,until:now+12345.625},aurora:{mult:1.5,until:now+9234.375}}};
    s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:123,speedMult:2}];s.studyQueue.guardmastery=true;s.research.arcanecal=4;s.researchQueue.arcanecal=true;s.lumen=37;s.shards=42;
    b.setState(s);b.feedbackSave();var expected=b.getState();localStorage.setItem(key,JSON.stringify({saved:expected,start:now}));nextPhase(1);
    if(ctx.scenario==='support-reset'){b.reset();return;}
    if(ctx.scenario==='support-backup-restore'){b.setState(b.freshStateSnapshot());b.restoreBackup(backupCode(expected));return;}
    if(ctx.scenario==='support-recovery')b.formationTest.corruptPrimary();
    b.suppressUnloadSave();location.reload();return;
  }
  var record=JSON.parse(localStorage.getItem(key)),s=b.getState();
  if(ctx.scenario==='support-reset'){assert(!s.supportBuffs&&s.buffUntil===0&&s.buffMult===1,'Reset clears every boost');finish('pass',{reset:true,schema:s.schemaVersion});return;}
  if(phase()===1){
    ['supportBuffs','buffUntil','buffMult','spirits','activeParty','formationRebuild','activeStudies','studyQueue','research','researchQueue','lumen','shards'].forEach(k=>assert(JSON.stringify(s[k])===JSON.stringify(record.saved[k]),'source persistence '+k));
    assert(s.enemyHp===record.saved.enemyHp,'zero-time reload adds no damage');assert(JSON.stringify(JSON.parse(b.rawRecovery()).supportBuffs)===JSON.stringify(s.supportBuffs),'recovery source map exact');
    if(!ctx.scenario.endsWith('resume')){finish('pass',{route:ctx.scenario,sources:s.supportBuffs,legacy:{until:s.buffUntil,mult:s.buffMult}});return;}
    record.expected=b.previewOffline(s,15,record.start);localStorage.setItem(key,JSON.stringify(record));
    if(ctx.scenario==='support-visibility-resume'){
      b.clearLifecycleTrace();b.autoTarget.visibility(true);b.advanceTime(15000);await b.autoTarget.visibility(false);
      while(b.getFlags().offlineBusy) await new Promise(resolve=>setTimeout(resolve,0));
      parity(b.getState(),record.expected.state,'source visibility resume');var before=copy(b.getState());b.dispatchVisibility(false);parity(b.getState(),before,'duplicate visibility adds no time/damage');
      assert(b.lifecycleTrace().filter(e=>e.type==='offline'&&e.detail.result).length===1,'visibility catch-up exactly once');finish('pass',{visibilityResumeSeconds:15,sources:b.getState().supportBuffs});return;
    }
    b.advanceTime(15000);if(ctx.scenario==='support-recovery-resume')b.formationTest.corruptPrimary();nextPhase(2);b.suppressUnloadSave();location.reload();return;
  }
  if(phase()===2){
    parity(s,record.expected.state,'source cold resume');assert(!Object.keys(s.supportBuffs.sources).length&&s.buffUntil===0&&s.buffMult===1,'all old records expired through chronological catch-up');assert(q.factor(b.clockNow())===1,'expired source neutral');
    assert(b.lifecycleTrace().filter(e=>e.type==='offline'&&e.detail.result).length===1,'source offline applied once');record.expired=copy(s);localStorage.setItem(key,JSON.stringify(record));
    nextPhase(3);b.suppressUnloadSave();location.reload();return;
  }
  parity(s,record.expired,'expired source reload');assert(q.factor(b.clockNow())===1,'no expired source resurrection');finish('pass',{coldResumeSeconds:15,expiredSources:s.supportBuffs,schema:s.schemaVersion});
};
