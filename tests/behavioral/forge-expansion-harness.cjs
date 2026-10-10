'use strict';
// Execute the complete production IIFE. Only presentation, timers and storage
// faults are controlled; all positive cases use production purchases/combat/save.
const assert = require('node:assert/strict');
const P = 'lumenfall_save_v2', R = 'lumenfall_save_recovery_v1';
const CLOCK = 2000000000000;
const clone = value => JSON.parse(JSON.stringify(value));

function app(source, saved) {
  let now = CLOCK, next = 0, failPrimary = false, failRecovery = false, reloads = 0;
  const timers = [], writes = [], storage = new Map(saved || []), area = {value: ''};
  const localStorage = {
    getItem: key => storage.get(key) || null,
    removeItem: key => storage.delete(key),
    setItem(key, value) {
      if ((failPrimary && key === P) || (failRecovery && key === R)) throw Error('injected write failure');
      writes.push({key, value: String(value)});
      storage.set(key, String(value));
    }
  };
  const window = {addEventListener() {}, matchMedia: () => ({matches: true})};
  const stage = {classList: {add() {}, remove() {}}};
  const document = {
    readyState: 'loading', hidden: false, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getElementById: id => id === 'save-backup-code' ? area : null,
    body: {classList: {add() {}, remove() {}}}
  };
  const hooks = `
  renderAll=renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=renderResearch=renderLongStudies=showAscendFlash=function(){};
  showToast=spawnFloatNum=emitCombatVfx=flashBattleStage=pulseWispCard=renderDynamic=function(){};
  function qaSpirit(id){return SPIRITS.find(function(sp){return sp.id===id;});}
  function qaResearch(id){return RESEARCH.find(function(node){return node.id===id;});}
  window.qa={
    fresh:freshState,get:function(){return state;},set:function(s){state=acceptPersistedState(s);},accept:acceptPersistedState,load:function(){state=loadState();},day:todayStr,
    defs:function(){return RESEARCH;},projects:function(){return LONG_STUDIES;},node:qaResearch,sp:qaSpirit,
    level:function(id,s){return forgeLevel(id,s);},
    cost:function(id,l,n){return researchCostForLevels(qaResearch(id),l,n);},
    plan:function(id,n){return getResearchBuyPlan(qaResearch(id),n);},rawPlan:getResearchBuyPlan,
    effect:function(id,l){return researchEffectPreview(qaResearch(id),l);},
    preview:function(id,n){return researchPreview(qaResearch(id),n);},
    previewText:function(id,n){var node=qaResearch(id);return researchPreviewText(node,researchPreview(node,n));},
    buy:function(id,n){var old=labMultiplier;labMultiplier=n===undefined?1:n;try{return buyResearch(qaResearch(id));}finally{labMultiplier=old;}},
    queue:autoLabQueueTick,
    power:function(id,l){return wispPower(qaSpirit(id),l===undefined?state.spirits[id]:l);},
    burst:function(id,l){return abilityRawBurst(qaSpirit(id),l===undefined?state.spirits[id]:l);},
    abilityDamage:function(id,d){return abilityBurstDamage(qaSpirit(id),d===undefined?state.depth:d);},
    abilityReward:function(id,l){return abilityRewardPerCast(qaSpirit(id),l===undefined?state.spirits[id]:l);},
    abilityRawReward:function(id,l){return abilityRewardRaw(qaSpirit(id),l===undefined?state.spirits[id]:l);},
    coefficient:function(id){return abilityDamageCoefficient(qaSpirit(id));},
    supportProfile:function(id){return supportAbilityProfile(qaSpirit(id));},
    buff:simulationBuffMult,passive:passiveWispDpsAt,tap:tapDamage,tapAt:guardianTapDamageAt,
    regen:bossRegenRate,bossAbility:bossAbilityDamageMult,bossTap:bossTapDamageMult,formationDamage:formationContextDamageMult,
    fill:fillRateMult,cycle:abilityCycleSeconds,dps:sustainedCombatDps,sustained:sustainedCombatDps,estimatedBoss:estimatedBossKillSeconds,enemyHp:enemyHpFor,
    autoDps:function(d){return automatedGuardianDps(d===undefined?state.depth:d);},
    profile:function(d){return forgeChargeProfile(d===undefined?state.depth:d);},
    assessment:function(d,hp){return forgeBossAssessment(d===undefined?state.depth:d,hp);},
    policyActive:function(){return forgeBossPolicyActive();},
    advance:advanceAuthoritativeTime,offline:applyOfflineProgress,
    cast:function(id,kind,at){var summary=simulationSummary(0);simulationTriggerAbility(qaSpirit(id),state.spirits[id],at===undefined?Date.now():at,simulationPolicy(kind||'live'),summary);return summary;},
    abilities:function(kind,at){var summary=simulationSummary(0);var count=simulationProcessAbilities(at===undefined?Date.now():at,simulationPolicy(kind||'live'),summary);return {count:count,summary:summary};},
    manualCast:function(id){return triggerAbility(qaSpirit(id),state.spirits[id]);},
    manualTap:function(){return doTap(qaStage);},
    spawn:spawnEnemy,manualKill:defeatEnemy,
    kill:function(kind){var summary=simulationSummary(0);simulationDefeatEnemy(simulationPolicy(kind||'live'),summary);return summary;},
    passiveStep:function(seconds,kind){var summary=simulationSummary(seconds);simulationApplyPushPassive(seconds,simulationPassiveDps(Date.now()),simulationPolicy(kind||'live'),summary);return summary;},
    ascend:function(){return doAscend(false);},prismPreview:ascendPrismBreakdown,
    save:saveState,export:currentSaveBackup,encode:encodeSaveBackup,decode:decodeSaveBackup,restore:restoreSaveBackup,
    resonate:function(id){return useSigilResonance(qaSpirit(id));},resonanceCost:sigilResonanceCost,
    ultimate:function(id){return buyUltimate(qaSpirit(id));},ultimateText:function(id){return ultimateEffectText(qaSpirit(id));},
    slots:studySlotCount,lumen:enemyRewardFor,shards:shardRewardFor,sigils:sigilsFromBoss,motes:motesDropFor,
    achievementDefs:function(){return ACHIEVEMENTS;},deed:function(id){return ACHIEVEMENTS.find(function(a){return a.id===id;}).check(state);},achievements:applyAchievementChecks,
    disable:function(id){
      var old=forgeLevel;
      forgeLevel=function(key,snapshot){return key===id?0:old(key,snapshot);};
      return function(){forgeLevel=old;};
    },
    losePaidAscend:function(){
      var old=applyAscendMutation;
      applyAscendMutation=function(){var gain=old();state.research.relay=0;return gain;};
      return function(){applyAscendMutation=old;};
    },
    ignoreBurstGuard:function(){
      var old=forgeBossAssessment;
      forgeBossAssessment=function(depth,hp){var result=old(depth,hp);if(result.upperDps<=result.regen)result.verdict='wall';return result;};
      return function(){forgeBossAssessment=old;};
    },
    bypassExactDebit:function(){
      var old=forgeExactDebit;
      forgeExactDebit=function(wallet,cost){return Number.isFinite(wallet) && Number.isFinite(cost) && cost>=0 && wallet>=cost;};
      return function(){forgeExactDebit=old;};
    },
    corruptPrice:function(){
      var old=researchCostForLevels;
      researchCostForLevels=function(node,level,count){var cost=old.apply(this,arguments);if(node.id==='relay' && level===0 && count===1) return {lumen:cost.lumen+1,shard:cost.shard};return cost;};
      return function(){researchCostForLevels=old;};
    },
    leakPrimaryMutation:function(){
      var old=forgeCommitPaidMutation;
      forgeCommitPaidMutation=function(apply){apply();return saveState();};
      return function(){forgeCommitPaidMutation=old;};
    },
    oldCadenceAverage:function(){
      var old=automatedGuardianDps;
      automatedGuardianDps=function(depth){return state.achieved.autotap ? guardianTapDamageAt(depth,averageSupportBuffMult(depth),0)*(1+0.10*forgeLevel('guardiancadence')/5) : 0;};
      return function(){automatedGuardianDps=old;};
    },
    observeCalibration:function(observer){
      var oldCast=simulationTriggerAbility,oldPassive=simulationApplyPushPassive,oldTap=simulationProcessAutoTap,oldDamage=simulationDealDiscreteDamage,damageSource=null;
      simulationTriggerAbility=function(sp,level,nowMs,policy,summary,clock){
        observer({type:'cast',id:sp.id,level:level,nowMs:nowMs});
        var previous=damageSource;damageSource='ability';
        try{return oldCast.apply(this,arguments);}finally{damageSource=previous;}
      };
      simulationApplyPushPassive=function(elapsedSec,dps,policy,summary){
        observer({type:'interval',seconds:elapsedSec,dps:dps,baseDps:passiveWispDpsAt(state.depth),depth:state.depth});
        return oldPassive.apply(this,arguments);
      };
      simulationProcessAutoTap=function(nowMs,policy,summary,clock){
        var before=state.totalTaps,result,previous=damageSource;damageSource='autoTap';
        try{result=oldTap.apply(this,arguments);}finally{damageSource=previous;}
        if(result)observer({type:'tap',count:result,nowMs:nowMs,before:before,after:state.totalTaps});
        return result;
      };
      simulationDealDiscreteDamage=function(amount,policy,summary){
        observer({type:'damage',amount:amount,depth:state.depth,source:damageSource});
        return oldDamage.apply(this,arguments);
      };
      return function(){simulationTriggerAbility=oldCast;simulationApplyPushPassive=oldPassive;simulationProcessAutoTap=oldTap;simulationDealDiscreteDamage=oldDamage;};
    }
  };
  `;
  const script = source.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const marker = "if(document.readyState==='loading'){";
  assert.equal(script.split(marker).length, 2, 'one complete-game observation hook');
  new Function('window', 'document', 'localStorage', 'Date', 'setTimeout', 'clearTimeout', 'performance', 'BigInt', 'location', 'navigator', 'qaStage', script.replace(marker, hooks + marker))(
    window, document, localStorage, class extends Date { static now() { return now; } },
    fn => { timers.push({id: ++next, fn}); return next; },
    id => { const i = timers.findIndex(timer => timer.id === id); if (i >= 0) timers.splice(i, 1); },
    {now: () => 0}, undefined, {reload: () => reloads++}, {}, stage
  );
  const q = window.qa;
  if (saved) q.load(); else q.set(q.fresh());
  return {
    q, storage, area, writes, clock: value => { now = value; },
    fail: (primary, recovery) => { failPrimary = primary; failRecovery = recovery; },
    reloads: () => reloads,
    drain() {
      let count = 0;
      while (timers.length) {
        timers.shift().fn();
        assert(++count < 100000, 'bounded pending callback drain');
      }
    }
  };
}

function seed(q) {
  const s = q.fresh();
  s.maxDepthEver = 250; s.questDay = q.day(); s.lastSeen = CLOCK;
  s.lumen = 1000000000000; s.shards = 1000000000000;
  s.motes = 10000; s.sigils = 10000; s.prisms = 23; s.comets = 115;
  s.depth = 101; s.enemyDepth = 101; s.enemyHp = s.enemyMaxHp = 1e12;
  s.autoAscendEnabled = false;
  for (const key of ['empowerQueue', 'researchQueue', 'studyQueue', 'studyUseMotes']) {
    Object.keys(s[key]).forEach(id => { s[key][id] = false; });
  }
  return s;
}

module.exports = {app, seed, clone, P, R, CLOCK};
