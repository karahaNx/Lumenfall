/* Persisted support deadlines on the existing canonical simulation clock. */
window.buffTimingSeed=function(b,ctx){
  var s=b.freshStateSnapshot();s.depth=41;s.maxDepthEver=41;s.enemyDepth=41;
  s.enemyMaxHp=b.enemyHpFor(41);s.enemyHp=s.enemyMaxHp;s.questDay=ctx.currentDay();s.loginStreak=1;
  return s;
};
window.runBuffTimingQa=function(b,ctx,assert,parity){
  var checks=0,records=[],copy=function(x){return JSON.parse(JSON.stringify(x));};
  function ok(v,m){checks++;assert(v,m);}
  function close(a,c,m){ok(Number.isFinite(a)&&Math.abs(a-c)<=1e-6,m+' (actual '+a+', expected '+c+')');}
  function seed(){return window.buffTimingSeed(b,ctx);}
  // These explicit represented deadlines and known constant rates form an
  // independent integral oracle. No production deadline helper is the oracle.
  [{start:2000000000000,deadline:2000000002234.375,seconds:2.234375},
   {start:4102444800125.25,deadline:4102444802234.375,seconds:2.109125}].forEach(function(c){
    ['live','offline'].forEach(function(kind){
      var s=seed();s.buffUntil=c.deadline;s.buffMult=1.25;b.setState(s);s=b.getState();var rate=b.wispFormulaSnapshot('ember').passiveDps;
      [c.seconds-.0005,c.seconds,c.seconds+.0005].forEach(function(seconds){
        b.setState(s);var r=b.simulate(seconds,kind,seconds,c.start);
        close(s.enemyHp-r.state.enemyHp,rate*(1.25*Math.min(seconds,c.seconds)+Math.max(0,seconds-c.seconds)),'constant-rate before/exact/after integral');
        ok(r.state.buffUntil===(seconds<c.seconds?c.deadline:0),'exact buff expiry state');
        ok(r.summary.kills===0 && r.summary.autoTaps===0,'constant-rate case remains isolated');
      });
      var duration=c.seconds+1;b.setState(s);var direct=b.simulate(duration,kind,duration,c.start);
      [c.seconds-.0005,c.seconds,c.seconds+.0005,.5].forEach(function(split){
        b.setState(s);b.simulate(split,kind,split,c.start);var tail=b.simulate(duration-split,kind,duration-split,c.start+split*1000,c.start);
        close(tail.state.enemyHp,direct.state.enemyHp,'before/exact/after/active-call split');parity(tail.state,direct.state,'buff split');
      });
      var off=copy(s);off.buffUntil=0;b.setState(off);var plain=b.simulate(duration,kind,duration,c.start);
      close(off.enemyHp-plain.state.enemyHp,rate*duration,'no active buff ignores stale multiplier');
      records.push({kind:kind,start:c.start,deadline:c.deadline,buffedSec:c.seconds,integratedDamage:s.enemyHp-direct.state.enemyHp,rate:rate});
    });
  });
  var clock=2000000000000,s=seed();s.buffUntil=clock+1000;s.buffMult=1.5;s.achieved.autotap=true;
  b.setState(s);s=b.getState();var rate=b.wispFormulaSnapshot('ember').passiveDps,tap=b.wispFormulaSnapshot('ember').guardianTap;
  var at=b.simulateTimeline(1,'live',clock);close(s.enemyHp-at.state.enemyHp,rate*1.5+tap,'tap exactly at expiry uses normal multiplier');
  var types=at.timeline.filter(function(e){return e.elapsedSec===1;}).map(function(e){return e.type;});ok(types.indexOf('buffExpire')<types.indexOf('autoTap') && types.includes('autoTap'),'expiry precedes coincident Auto-Tap');
  s=seed();s.spirits.tide=1;s.activeParty=['ember','tide'];s.buffUntil=clock+1000;s.buffMult=1.8;s.heroResource.tide=100-100/6;s.achieved.autotap=true;b.setState(s);
  var profile=b.wispFormulaSnapshot('tide').supportProfile,coincident=b.simulateTimeline(1,'live',clock);types=coincident.timeline.filter(function(e){return e.elapsedSec===1;}).map(function(e){return e.type;});
  ok(types.indexOf('buffExpire')<types.indexOf('ability') && types.indexOf('ability')<types.indexOf('autoTap'),'expiry -> support refresh -> tap event order');
  ok(coincident.state.buffUntil===0 && coincident.state.buffMult===1 && coincident.state.supportBuffs.sources.tide.until===clock+1000+profile.durationMs && coincident.state.supportBuffs.sources.tide.mult===profile.strength,'expired strength not retained across new cast');
  s=seed();s.spirits.tide=1;s.activeParty=['ember','tide'];s.buffUntil=clock+10000;s.buffMult=1.8;b.setState(s);
  b.triggerAbilityFor('tide','live',clock+500);ok(b.getState().buffUntil===clock+10000 && b.getState().buffMult===1.8 && b.getState().supportBuffs.sources.tide.until===clock+1500,'new shorter cast preserves independent legacy entitlement');
  b.triggerAbilityFor('tide','live',clock+9000);ok(b.getState().buffUntil===clock+10000 && b.getState().buffMult===1.8 && b.getState().supportBuffs.sources.tide.until===clock+9000+profile.durationMs,'source refresh extends only its own deadline, never legacy');
  var updated=b.getState();b.simulate(.25,'live',.25,clock+9000);ok(b.getState().buffUntil===updated.buffUntil,'next call derives refreshed deadline from current canonical field');
  // The original pre-purchase divergence is obligatory, including a scoped
  // negative control restoring the lossy epoch subtraction.
  function prePurchase(){
    var s=copy(ctx.fixtures['mid-game'].save);b.setState(s);s=b.getState();Object.keys(s.researchQueue).forEach(function(id){s.researchQueue[id]=false;});
    b.setState(s);var direct=b.simulate(60,'offline',60,clock);b.setState(s);var ref=b.simulate(60,'offline',1,clock);
    close(direct.state.enemyHp,ref.state.enemyHp,'pre-purchase buff timing');return {directHp:direct.state.enemyHp,referenceHp:ref.state.enemyHp};
  }
  function deadlineOracle(){
    var s=seed();s.spirits.ember=60;s.buffUntil=2000000002234.375;s.buffMult=1.25;
    s.activeStudies=[{id:'guardmastery',remainingSec:2.123456,totalDurationSec:150,speedMult:1}];
    b.setState(s);s=b.getState();var rate=b.wispFormulaSnapshot('ember').passiveDps;
    var r=b.simulate(3,'live',3,2000000000000.375);
    close(s.enemyHp-r.state.enemyHp,rate*(3+.25*2.234),'fractional-event deadline integral');
  }
  var pre=prePurchase();deadlineOracle();var undo=b.buffTiming.restoreOldCalculation(),caught='';
  try{deadlineOracle();}catch(e){caught=e.message;}finally{undo();}
  ok(caught.indexOf('fractional-event deadline integral')===0,'old deadline mutation must fail the independent integral assertion, not crash');
  return {checks:checks,isolatedIntegrals:records,pre60Gameplay:pre,negativeOldEpochSubtraction:caught};
};
window.runBuffSaveQa=function(b,ctx,assert,parity,phase,nextPhase,finish){
  var key='buff-save-evidence';
  if(phase()===0){
    var now=b.clockNow(),s=window.buffTimingSeed(b,ctx);s.buffUntil=now+12345.625;s.buffMult=1.25;b.setState(s);b.feedbackSave();
    localStorage.setItem(key,JSON.stringify({saved:b.getState(),start:now}));nextPhase(1);b.suppressUnloadSave();location.reload();return;
  }
  var record=JSON.parse(localStorage.getItem(key)),s=b.getState();
  if(phase()===1){
    assert(s.buffUntil===record.saved.buffUntil && s.buffMult===record.saved.buffMult,'active buff canonical reload preserves exact deadline/strength');
    assert(Math.abs(s.enemyHp-record.saved.enemyHp)<=1e-6,'zero-time reload adds no damage');
    record.expected=b.previewOffline(s,15,record.start);localStorage.setItem(key,JSON.stringify(record));
    b.advanceTime(15000);nextPhase(2);b.suppressUnloadSave();location.reload();return;
  }
  if(phase()===2){
    parity(s,record.expected.state,'active-buff cold resume');assert(s.buffUntil===0 && s.buffMult===1,'expired buff not extended by reload');
    assert(b.lifecycleTrace().filter(function(e){return e.type==='offline' && e.detail.result;}).length===1,'cold resume applies offline interval once');
    record.expired=s;localStorage.setItem(key,JSON.stringify(record));nextPhase(3);b.suppressUnloadSave();location.reload();return;
  }
  assert(s.buffUntil===0 && s.buffMult===1,'expired canonical reload cannot reactivate buff');parity(s,record.expired,'expired reload');
  finish('pass',{activeDeadline:record.saved.buffUntil,multiplier:record.saved.buffMult,resumeSeconds:15,finalHp:s.enemyHp,expiredReload:true,schema:s.schemaVersion});
};
