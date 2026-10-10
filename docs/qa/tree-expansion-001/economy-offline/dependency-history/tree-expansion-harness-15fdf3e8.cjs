'use strict';
// The complete production game IIFE executes. The bridge only replaces DOM
// presentation, clocks and storage; purchases, simulation and saves stay real.
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
  function qaNode(id){return NODES.find(function(node){return node.id===id;});}
  function qaCost(id,level){
    var node=qaNode(id);
    if(level===undefined) return nodeCost(node);
    var before=state;
    state=JSON.parse(JSON.stringify(state));state.nodes[id]=level;
    try{return nodeCost(node);}finally{state=before;}
  }
  function qaSpiritCost(id,level){
    var sp=qaSpirit(id);
    if(level===undefined) return spiritCost(sp);
    var before=state;
    state=JSON.parse(JSON.stringify(state));state.spirits[id]=level;
    try{return spiritCost(sp);}finally{state=before;}
  }
  function qaProcessEmpower(){var summary=simulationSummary(0);var count=simulationProcessAutoEmpower(summary);return {count:count,summary:summary};}
  window.qa={
    fresh:freshState,get:function(){return state;},set:function(s){state=acceptPersistedState(s);},accept:acceptPersistedState,load:function(){state=loadState();},day:todayStr,now:function(){return Date.now();},
    defs:function(){return NODES;},nodeDefs:function(){return NODES;},expansion:function(){return TREE_EXPANSION;},node:qaNode,
    sp:qaSpirit,spDefs:function(){return SPIRITS;},spirits:function(){return SPIRITS;},projects:function(){return LONG_STUDIES;},forgeDefs:function(){return RESEARCH;},
    level:function(id,snapshot){return treeLevel(id,snapshot);},treeLevel:function(id,snapshot){return treeLevel(id,snapshot);},
    cost:qaCost,nodeCost:qaCost,plan:function(id){return getNodeBuyPlan(qaNode(id));},nodePlan:function(id){return getNodeBuyPlan(qaNode(id));},rawPlan:getNodeBuyPlan,
    buy:function(id){return buyNode(qaNode(id));},buyNode:function(id){return buyNode(qaNode(id));},rawBuy:buyNode,
    effect:function(id,level){return treeExpansionEffect(id,level);},unlocked:function(id,snapshot){return treeNodeUnlocked(qaNode(id),snapshot);},
    spiritCost:qaSpiritCost,spiritPlan:function(id){return getSpiritBuyPlan(qaSpirit(id));},rawSpiritPlan:getSpiritBuyPlan,
    buySpirit:function(id){return buySpirit(qaSpirit(id));},rawBuySpirit:buySpirit,paidEmpower:function(id,plan){return treePaidEmpower(qaSpirit(id),plan);},
    autoEmpower:function(){return autoEmpowerTick();},processAutoEmpower:qaProcessEmpower,training:function(){return state.treeTrainingProgress;},
    capacity:function(snapshot){return treeFormationCapacity(snapshot);},formationCapacity:function(snapshot){return treeFormationCapacity(snapshot);},
    unlock:function(id,snapshot){return treeWispUnlockDepth(qaSpirit(id),snapshot);},recruitUnlock:function(id,snapshot){return treeWispUnlockDepth(qaSpirit(id),snapshot);},
    chosen:chosenFormationMembers,intended:intendedFormationIds,candidates:autoEmpowerCandidateIds,commitFormation:commitFormationMembers,
    toggle:toggleActive,field:toggleActive,bench:toggleActive,preset:applyFormationPreset,presetMembers:formationPresetMembers,reconcile:function(){return reconcileFormationRebuild(state);},
    frontier:function(cleared,benchmark){return treeFrontierBonus(cleared,benchmark);},dust:function(gain){return treeAscendMotes(gain);},dustForWallet:function(gain,wallet){return treeAscendMotesForWallet(gain,wallet);},
    prismPreview:ascendPrismBreakdown,prismBreakdown:ascendPrismBreakdown,prismGain:ascendPrismGain,prismMult:prismMult,costReduction:costReduction,
    offlineRate:offlineRate,offlineCap:offlineCapHours,policy:simulationPolicy,
    save:saveState,export:currentSaveBackup,encode:encodeSaveBackup,decode:decodeSaveBackup,restore:restoreSaveBackup,
    ascend:function(){return doAscend(false);},runToken:function(){return ascendRunToken;},advance:advanceAuthoritativeTime,offline:applyOfflineProgress,
    autoReady:autoAscendReady,queueTrial:queueCometTrial,cancelTrial:cancelCometTrial,
    spawn:spawnEnemy,manualKill:defeatEnemy,
    kill:function(kind){var summary=simulationSummary(0);simulationDefeatEnemy(simulationPolicy(kind||'live'),summary);return summary;},
    cast:function(id,kind,at){var summary=simulationSummary(0);simulationTriggerAbility(qaSpirit(id),state.spirits[id],at===undefined?Date.now():at,simulationPolicy(kind||'live'),summary);return summary;},
    abilities:function(kind,at){var summary=simulationSummary(0);var count=simulationProcessAbilities(at===undefined?Date.now():at,simulationPolicy(kind||'live'),summary);return {count:count,summary:summary};},
    manualCast:function(id){return triggerAbility(qaSpirit(id),state.spirits[id]);},manualTap:function(){return doTap(qaStage);},
    passiveStep:function(seconds,kind){var summary=simulationSummary(seconds);simulationApplyPushPassive(seconds,simulationPassiveDps(Date.now()),simulationPolicy(kind||'live'),summary);return summary;},
    power:function(id,l){return wispPower(qaSpirit(id),l===undefined?state.spirits[id]:l);},
    burst:function(id,l){return abilityRawBurst(qaSpirit(id),l===undefined?state.spirits[id]:l);},abilityDamage:function(id,d){return abilityBurstDamage(qaSpirit(id),d===undefined?state.depth:d);},
    supportProfile:function(id){return supportAbilityProfile(qaSpirit(id));},buff:simulationBuffMult,passive:passiveWispDpsAt,tap:tapDamage,tapAt:guardianTapDamageAt,
    regen:bossRegenRate,fill:fillRateMult,cycle:abilityCycleSeconds,dps:sustainedCombatDps,sustained:sustainedCombatDps,estimatedBoss:estimatedBossKillSeconds,enemyHp:enemyHpFor,
    profile:function(d){return forgeChargeProfile(d===undefined?state.depth:d);},assessment:function(d,hp){return forgeBossAssessment(d===undefined?state.depth:d,hp);},policyActive:forgeBossPolicyActive,
    autoDps:function(d){return automatedGuardianDps(d===undefined?state.depth:d);},
    slots:studySlotCount,lumen:enemyRewardFor,shards:shardRewardFor,sigils:sigilsFromBoss,motes:motesDropFor,
    rarityCost:function(id,tier){return rarityCost(qaSpirit(id),tier);},moduleCost:function(id,l){return moduleCost(qaSpirit(id),l);},ultimateCost:function(id){return ultimateSigilCost(qaSpirit(id));},
    achievementDefs:function(){return ACHIEVEMENTS;},deed:function(id){return ACHIEVEMENTS.find(function(a){return a.id===id;}).check(state);},achievements:applyAchievementChecks,
    disable:function(id){
      var old=treeLevel;treeLevel=function(key,snapshot){return key===id?0:old(key,snapshot);};return function(){treeLevel=old;};
    },
    ignoreUnlock:function(){var old=treeNodeUnlocked;treeNodeUnlocked=function(){return true;};return function(){treeNodeUnlocked=old;};},
    losePaidAscend:function(){
      var old=applyAscendMutation;applyAscendMutation=function(){var gain=old.apply(this,arguments);state.nodes.lumenmemory=0;return gain;};return function(){applyAscendMutation=old;};
    },
    doubleFrontier:function(){
      var old=treeFrontierBonus;treeFrontierBonus=function(cleared,benchmark){return old(cleared,0);};return function(){treeFrontierBonus=old;};
    },
    bypassNodeExactDebit:function(){
      var old=getNodeBuyPlan;getNodeBuyPlan=function(node){var plan=old(node);if(plan.reason==='unavailable' && Number.isFinite(plan.cost) && plan.cost>=1 && state.prisms>=plan.cost){plan.affordable=true;plan.reason='available';}return plan;};return function(){getNodeBuyPlan=old;};
    },
    bypassSpiritExactDebit:function(){
      var old=forgeExactDebit;forgeExactDebit=function(wallet,cost){return Number.isFinite(wallet) && Number.isFinite(cost) && cost>=0 && wallet>=cost;};return function(){forgeExactDebit=old;};
    },
    leakPrimaryMutation:function(){
      var old=forgeCommitPaidMutation;forgeCommitPaidMutation=function(apply){apply();return saveState();};return function(){forgeCommitPaidMutation=old;};
    },
    loseRollbackToken:function(){
      var old=doAscend;doAscend=function(){var result=old.apply(this,arguments);if(result===false)ascendRunToken={};return result;};return function(){doAscend=old;};
    },
    corruptPrice:function(){
      var old=nodeCost;nodeCost=function(node){var result=old.apply(this,arguments);return node.id==='lumenmemory' && state.nodes[node.id]===0?result+1:result;};return function(){nodeCost=old;};
    },
    observeAscends:function(observer){
      var old=applyAscendMutation;
      applyAscendMutation=function(){var before=JSON.parse(JSON.stringify(state)),gain=old.apply(this,arguments);observer({before:before,after:JSON.parse(JSON.stringify(state)),gain:gain});return gain;};
      return function(){applyAscendMutation=old;};
    },
    observeSpawns:function(observer){
      var old=spawnEnemy;spawnEnemy=function(){var result=old.apply(this,arguments);observer({depth:state.depth,enemyDepth:state.enemyDepth});return result;};return function(){spawnEnemy=old;};
    },
    observeCalibration:function(observer){
      var oldCast=simulationTriggerAbility,oldPassive=simulationApplyPushPassive,oldTap=simulationProcessAutoTap,oldDamage=simulationDealDiscreteDamage,damageSource=null;
      simulationTriggerAbility=function(sp,level,nowMs,policy,summary,clock){
        observer({type:'cast',id:sp.id,level:level,nowMs:nowMs});var previous=damageSource;damageSource='ability';
        try{return oldCast.apply(this,arguments);}finally{damageSource=previous;}
      };
      simulationApplyPushPassive=function(elapsedSec,dps,policy,summary){observer({type:'interval',seconds:elapsedSec,dps:dps,baseDps:passiveWispDpsAt(state.depth),depth:state.depth,charge:JSON.parse(JSON.stringify(state.heroResource)),tapPhase:state._autoTapAccum,empowerPhase:state._autoEmpowerAccum});return oldPassive.apply(this,arguments);};
      simulationProcessAutoTap=function(nowMs,policy,summary,clock){
        var before=state.totalTaps,result,previous=damageSource;damageSource='autoTap';
        try{result=oldTap.apply(this,arguments);}finally{damageSource=previous;}
        if(result)observer({type:'tap',count:result,nowMs:nowMs,before:before,after:state.totalTaps});return result;
      };
      simulationDealDiscreteDamage=function(amount,policy,summary){observer({type:'damage',amount:amount,depth:state.depth,source:damageSource});return oldDamage.apply(this,arguments);};
      return function(){simulationTriggerAbility=oldCast;simulationApplyPushPassive=oldPassive;simulationProcessAutoTap=oldTap;simulationDealDiscreteDamage=oldDamage;};
    }
  };
  `;
  const match = source.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert(match, 'complete inline game script exists');
  const script = match[1], marker = "if(document.readyState==='loading'){";
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
    q, storage, area, writes, clock(value) { if (value !== undefined) now = value; return now; },
    fail: (primary, recovery) => { failPrimary = primary; failRecovery = recovery; },
    reloads: () => reloads, pending: () => timers.length,
    drain(limit = 100000) {
      let count = 0;
      while (timers.length) { assert(count++ < limit, 'bounded pending callback drain'); timers.shift().fn(); }
      return count;
    }
  };
}

function seed(q) {
  const s = q.fresh();
  s.maxDepthEver = 250; s.questDay = q.day(); s.lastSeen = CLOCK;
  s.lumen = 1000000000000; s.shards = 1000000000000;
  s.motes = 10000; s.sigils = 10000; s.prisms = 10000; s.comets = 115;
  s.depth = 101; s.enemyDepth = 101; s.enemyHp = s.enemyMaxHp = 1e12;
  s.autoAscendEnabled = false;
  for (const key of ['empowerQueue', 'researchQueue', 'studyQueue', 'studyUseMotes']) Object.keys(s[key]).forEach(id => { s[key][id] = false; });
  return s;
}

module.exports = {app, seed, clone, P, R, CLOCK};
