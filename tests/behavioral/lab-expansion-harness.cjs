'use strict';
// Run the complete production IIFE. Only presentation/timers are stubbed.
// No catalog, purchase, reward, normalization or scheduler function is replaced.
const assert=require('node:assert/strict');
const P='lumenfall_save_v2',R='lumenfall_save_recovery_v1';
const clone=v=>JSON.parse(JSON.stringify(v));
function app(source,saved){
 let now=2000000000000,next=0,failPrimary=false,failRecovery=false,reloads=0;
 const timers=[],storage=new Map(saved||[]),area={value:''};
 const localStorage={getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k),setItem(k,v){if(failPrimary&&k===P||failRecovery&&k===R)throw Error('injected write failure');storage.set(k,String(v));}};
 const window={addEventListener(){},matchMedia:()=>({matches:true})};
 const document={readyState:'loading',hidden:false,addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},getElementById:id=>id==='save-backup-code'?area:null,body:{classList:{add(){}}}};
 const hooks=`
 renderAll=renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=renderResearch=renderLongStudies=showAscendFlash=function(){};
 showToast=spawnFloatNum=emitCombatVfx=flashBattleStage=pulseWispCard=renderDynamic=function(){};
 window.qa={fresh:freshState,get:function(){return state;},set:function(s){state=acceptPersistedState(s);},accept:acceptPersistedState,load:function(){state=loadState();},
 projects:function(){return LONG_STUDIES;},expansion:function(){return LAB_EXPANSION;},level:labExpansionLevel,day:todayStr,
 plan:function(id){return getStudyStartPlan(LONG_STUDIES.find(function(n){return n.id===id;}));},rawPlan:getStudyStartPlan,
 start:function(id){return startStudy(LONG_STUDIES.find(function(n){return n.id===id;}));},
 startRaw:startStudy,finish:advanceActiveStudies,slots:studySlotCount,speed:applySpeedTier,speedCost:speedTierCost,
 cost:function(id,l){return studyCost(LONG_STUDIES.find(function(n){return n.id===id;}),l);},
 duration:function(id,l){return studyDuration(LONG_STUDIES.find(function(n){return n.id===id;}),l);},effect:projectEarnedEffect,
 discount:labDiscountCost,curriculum:labCurriculumSubjects,
 advance:advanceAuthoritativeTime,offline:applyOfflineProgress,ascend:function(){doAscend(false);},preview:ascendPrismBreakdown,
 save:saveState,export:currentSaveBackup,encode:encodeSaveBackup,decode:decodeSaveBackup,restore:restoreSaveBackup,
 sp:function(id){return SPIRITS.find(function(n){return n.id===id;});},moduleCost:moduleCost,rarityCost:rarityCost,rarityReq:rarityReq,ultimateCost:ultimateSigilCost,resonanceCost:sigilResonanceCost,
 module:buyModule,rarity:buyRarity,ultimate:buyUltimate,resonate:useSigilResonance,
 prices:{rarityShards:RARITY_SHARD_COSTS,rarityLumen:RARITY_LUMEN_BASE_MULTS,rarityLevels:RARITY_LEVEL_REQUIREMENTS},
 lumen:enemyRewardFor,shards:shardRewardFor,sigils:sigilsFromBoss,motes:motesDropFor,lumenMult:lumenMult,shardMult:shardMult,formationReward:formationRewardMult,
 ability:abilityRewardPerCast,burst:abilityRawBurst,tap:tapDamage,power:effectivePartyPower,
 batch:function(count,kind){var sum=simulationSummary(0);simulationBatchFarmKills(count,simulationPolicy(kind||'live'),sum);return sum;},
 kill:function(kind){var sum=simulationSummary(0);simulationDefeatEnemy(simulationPolicy(kind||'live'),sum);return sum;},manualKill:defeatEnemy,
 boundary:function(cost,scale){var d=state.farmDepth||state.depth;return simulationLabCurrencyKillsNeeded(cost,enemyRewardFor(d)*scale,shardRewardFor(d)*scale,scale);},
 chance:eliteChance,summary:simulationSummary,queue:function(){var sum=simulationSummary(0);simulationStartQueuedStudies(sum);return sum;},
 speeds:function(){var sum=simulationSummary(0);simulationBuyStudySpeeds(sum,0);return sum;},
 deed:function(id){return ACHIEVEMENTS.find(function(a){return a.id===id;}).check(state);},achievements:applyAchievementChecks};
 `;
 const script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1],marker="if(document.readyState==='loading'){";
 assert.equal(script.split(marker).length,2,'one complete-game observation hook');
 new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance','BigInt','location','navigator',script.replace(marker,hooks+marker))(
 window,document,localStorage,class extends Date{static now(){return now;}},fn=>{timers.push({id:++next,fn});return next;},id=>{const i=timers.findIndex(t=>t.id===id);if(i>=0)timers.splice(i,1);},{now:()=>0},undefined,{reload:()=>reloads++},{});
 const q=window.qa;if(saved)q.load();else q.set(q.fresh());
 return {q,storage,area,clock:v=>now=v,fail:(p,r)=>{failPrimary=p;failRecovery=r;},reloads:()=>reloads,drain(){let n=0;while(timers.length){timers.shift().fn();assert(++n<100000,'bounded pending callback drain');}}};
}
function seed(q){const s=q.fresh();s.maxDepthEver=250;s.questDay=q.day();s.lastSeen=2000000000000;s.lumen=1e9;s.shards=1e9;s.motes=10000;s.sigils=10000;s.prisms=23;s.comets=115;s.autoAscendEnabled=false;Object.keys(s.empowerQueue).forEach(id=>s.empowerQueue[id]=false);return s;}
module.exports={app,seed,clone,P,R};
