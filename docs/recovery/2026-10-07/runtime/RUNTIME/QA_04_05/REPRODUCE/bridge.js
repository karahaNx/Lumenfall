window.ownQA={
 upgradeCosts:()=>({titan:spiritCost(SPIRITS.find(s=>s.id==='titan')),formation:researchCostForLevels(RESEARCH.find(s=>s.id==='formation'),state.research.formation,1),momentum:nodeCost(NODES.find(s=>s.id==='momentum')),formationStudy:studyCost(LONG_STUDIES.find(s=>s.id==='formationstudy'),state.longStudyLevels.formationstudy),wispAscend:studyCost(LONG_STUDIES.find(s=>s.id==='wispascend'),state.longStudyLevels.wispascend)}),
 installOld:()=>{let original=simulationApplyFarmPassive;simulationApplyFarmPassive=function simulationApplyFarmPassive(elapsedSec,dps,policy,summary){
  if(elapsedSec<=0 || dps<=0) return;
  var damage = dps*elapsedSec;
  if(damage+SIM_EPS < state.enemyHp){
    state.enemyHp -= damage;
    return;
  }

  var maxHp = state.enemyMaxHp>0 ? state.enemyMaxHp : enemyHpFor(state.depth);
  var remainingDamage = Math.max(0,damage-state.enemyHp);
  var additionalKills = Math.floor(remainingDamage/maxHp+1e-12);
  // Avoid catastrophic cancellation from subtracting a huge kills*maxHp
  // product from a similarly huge damage value. Modulo preserves the
  // represented damage remainder directly and is compositional across the
  // fixed Farm batching boundaries.
  var leftover = remainingDamage%maxHp;
  if(leftover<SIM_EPS) leftover=0;
  if(leftover>=maxHp-SIM_EPS){
    additionalKills++;
    leftover=0;
  }

  simulationBatchFarmKills(1+additionalKills,policy,summary);
  if(leftover>0) state.enemyHp = Math.max(SIM_EPS,state.enemyMaxHp-leftover);
};return ()=>{simulationApplyFarmPassive=original;};},
 naturalDps:()=>simulationPassiveDps(Date.now()),
 runNatural:(seconds,kind='live',start=Date.now())=>{let summary=advanceAuthoritativeTime(seconds,{kind,visual:false,clockStartMs:start,offlineWindowStartMs:start,captureTimeline:true});return {state:JSON.parse(JSON.stringify(state)),summary};},
 fresh:()=>JSON.parse(JSON.stringify(freshState())),
 normalize:input=>normalizeCurrentSave(input),
 set:input=>{state=acceptPersistedState(JSON.parse(JSON.stringify(input)),'own-qa');restoreEnemyOrSpawn();return JSON.parse(JSON.stringify(state));},
 get:()=>JSON.parse(JSON.stringify(state)),
 hp:enemyHpFor,
 render:()=>renderAll(),
 prepareUI:()=>{if(startupIntroFinish)startupIntroFinish();document.querySelectorAll('.overlay,#startup-intro').forEach(el=>el.style.display='none');document.querySelectorAll('.rift-milestone,.combat-vfx').forEach(el=>el.remove());},
 manual:applySpeedTier,
 start:id=>startStudy(LONG_STUDIES.find(n=>n.id===id)),
 save:()=>saveState(),
 raw:()=>({primary:localStorage.getItem(SAVE_KEY),recovery:localStorage.getItem(RECOVERY_SAVE_KEY)}),
 export:currentSaveBackup,
 restore:code=>{document.querySelector('#save-backup-code').value=code;restoreSaveBackup();},
 reset:performReset,
 ascend:()=>doAscend(false),
 offline:applyOfflineProgress,
 run:(seconds,dps=0,kind='live',start=Date.now())=>{let original=simulationPassiveDps;simulationPassiveDps=()=>dps;try{let summary=advanceAuthoritativeTime(seconds,{kind,visual:false,clockStartMs:start,offlineWindowStartMs:start,captureTimeline:true});return window.ownLastRun={state:JSON.parse(JSON.stringify(state)),summary};}finally{simulationPassiveDps=original;}},
 tail:seconds=>{let summary=simulationSummary(seconds);summary.timeline=[];summary.captureTimeline=true;advanceStudyOnlyTime(seconds,Date.now(),summary);return {state:JSON.parse(JSON.stringify(state)),summary};},
 offlineZero:()=>{let original=simulationPassiveDps;simulationPassiveDps=()=>0;try{return applyOfflineProgress();}finally{simulationPassiveDps=original;}},
 mutate:kind=>{
  let start=commitStudyStart,plan=studyMotesPlan,boundary=simulationKillsUntilStudyMotes;
  if(kind==='free-carry')commitStudyStart=node=>{let result=start(node);if(result&&state.studyUseMotes[node.id])findActiveStudy(node.id).speedMult=state.studySpeedTargets[node.id];return result;};
  if(kind==='fallback')studyMotesPlan=node=>{let result=plan(node);if(result&&state.motes<result.cost){result.target=1.5;result.cost=14;}return result;};
  if(kind==='batch-end')simulationKillsUntilStudyMotes=()=>Infinity;
  return ()=>{commitStudyStart=start;studyMotesPlan=plan;simulationKillsUntilStudyMotes=boundary;};
 }
};

ownQA.installR2=()=>{let saved=simulationApplyFarmPassive;simulationApplyFarmPassive=function simulationApplyFarmPassive(elapsedSec,dps,policy,summary){
  if(elapsedSec<=0 || dps<=0) return;
  var damage = dps*elapsedSec;
  if(damage+SIM_EPS < state.enemyHp){
    state.enemyHp -= damage;
    return;
  }

  var maxHp = state.enemyMaxHp>0 ? state.enemyMaxHp : enemyHpFor(state.depth);
  // Decompose damage before subtracting the partially damaged enemy. This
  // avoids both a rounded quotient/modulo counting the same boundary twice
  // and cancellation of a small current HP from a huge damage value.
  var remainder = damage%maxHp;
  var kills = Math.round((damage-remainder)/maxHp);
  // Retain the existing 1e-12 quotient and SIM_EPS HP boundary tolerances,
  // applying a carry once to this shared decomposition, never twice.
  if(remainder>=maxHp-SIM_EPS || remainder/maxHp+1e-12>=1){
    kills++;
    remainder=0;
  }
  var difference = remainder-state.enemyHp;
  var leftover;
  if(difference>=-SIM_EPS || difference/maxHp>=-1e-12){
    kills++;
    leftover=Math.max(0,difference);
  } else {
    leftover=maxHp+ difference;
  }
  if(leftover<SIM_EPS) leftover=0;

  simulationBatchFarmKills(kills,policy,summary);
  if(leftover>0) state.enemyHp = Math.max(SIM_EPS,state.enemyMaxHp-leftover);
};return ()=>simulationApplyFarmPassive=saved;};

ownQA.trace=fn=>{let saved=simulationApplyFarmPassive,steps=[];
simulationApplyFarmPassive=(seconds,dps,policy,summary)=>{let before={hp:state.enemyHp,H:state.enemyMaxHp,acc:state.luminousAccum,flag:state.enemyIsLuminous,depth:state.depth,lumenRate:enemyRewardFor(state.depth),shardRate:shardRewardFor(state.depth),scale:simulationRewardScale(policy),lumenSummary:summary.lumenGained,shardSummary:summary.shardGained,lumen:state.lumen,shards:state.shards},k=summary.kills,l=summary.luminousKills;saved(seconds,dps,policy,summary);steps.push({seconds,dps,D:dps*seconds,before,kills:summary.kills-k,luminous:summary.luminousKills-l,hp:state.enemyHp,acc:state.luminousAccum,flag:state.enemyIsLuminous,after:{lumenSummary:summary.lumenGained,shardSummary:summary.shardGained,lumen:state.lumen,shards:state.shards}});};try{return {result:fn(),steps};}finally{simulationApplyFarmPassive=saved;}};
