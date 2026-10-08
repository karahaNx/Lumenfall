
var qaLifecycleEvents = [];
// Fixed-clock UI parity cases measure progression separately from real CPU time.
// Keep the real simulation budget clock and animation frames unchanged.
if(window.__lumenfallQaContext.scenario.startsWith('offline-catchup-') && typeof offlineProcessingClock==='function'){
  offlineProcessingClock = function(){return 0;};
}
function qaLifecycleRecord(type,detail){
  qaLifecycleEvents.push({
    type:type,
    nowMs:Date.now(),
    detail:detail===undefined ? null : JSON.parse(JSON.stringify(detail))
  });
}
// Resolve only after the real startup completion callback (including its save).
// This is installed before DOMContentLoaded/init in the throwaway instrumented app.
if(window.__lumenfallQaContext.scenario==='formation-bonds-mobile' || window.__lumenfallQaContext.scenario==='formation-autosave-native' || window.__lumenfallQaContext.scenario==='formation-autosave-reduced-motion' || window.__lumenfallQaContext.scenario.startsWith('comet-unlocks-') || window.__lumenfallQaContext.scenario==='lab-motes-runtime' || window.__lumenfallQaContext.scenario==='lab-motes-native' || window.__lumenfallQaContext.scenario==='lab-motes-reduced-motion' || window.__lumenfallQaContext.scenario==='auto-ascend-target-mobile' || window.__lumenfallQaContext.scenario==='auto-ascend-target-reduced-motion' || window.__lumenfallQaContext.scenario.startsWith('forge-ui-') || window.__lumenfallQaContext.scenario.startsWith('self-test-forge-ui-') || window.__lumenfallQaContext.scenario.startsWith('rift-status-') || window.__lumenfallQaContext.scenario.startsWith('self-test-rift-status-')){
  var qaStartupResolve;
  window.__qaForgeStartup={completed:false,callbacks:0,promise:new Promise(function(resolve){qaStartupResolve=resolve;})};
  var qaOriginalPlayStartupIntro=playStartupIntro;
  playStartupIntro=function(done){
    return qaOriginalPlayStartupIntro.call(this,function(){
      if(done) done.apply(this,arguments);
      window.__qaForgeStartup.callbacks++;
      window.__qaForgeStartup.completed=true;
      qaStartupResolve({callbacks:window.__qaForgeStartup.callbacks,saves:qaLifecycleEvents.filter(function(e){return e.type==='save';}).length});
    });
  };
}
var qaOriginalSaveState = saveState;
saveState = function(){
  var beforeLastSeen = state ? state.lastSeen : null;
  if(window.__qaForgeHandler) window.__qaForgeHandler.saves++;
  var result = qaOriginalSaveState.apply(this,arguments);
  qaLifecycleRecord('save',{
    beforeLastSeen:beforeLastSeen,
    afterLastSeen:state ? state.lastSeen : null,
    hidden:document.hidden
  });
  return result;
};
var qaOriginalEnsureDaily = ensureDaily;
ensureDaily = function(){
  var beforeDay = state ? state.questDay : null;
  var beforeStreak = state ? state.loginStreak : null;
  var result = qaOriginalEnsureDaily.apply(this,arguments);
  qaLifecycleRecord('daily',{
    rolled:!!result,
    beforeDay:beforeDay,
    afterDay:state ? state.questDay : null,
    beforeStreak:beforeStreak,
    afterStreak:state ? state.loginStreak : null
  });
  return result;
};
var qaOriginalOfflineSteps = offlineProgressSteps;
offlineProgressSteps = function*(){
  var before = state ? {
    lastSeen:state.lastSeen,totalOfflineSeconds:state.totalOfflineSeconds,
    totalKills:state.totalKills,lumen:state.lumen,shards:state.shards,ascendCount:state.ascendCount
  } : null;
  var result = yield* qaOriginalOfflineSteps.apply(this,arguments);
  qaLifecycleRecord('offline',{
    before:before,result:result,
    after:state ? {lastSeen:state.lastSeen,totalOfflineSeconds:state.totalOfflineSeconds,
      totalKills:state.totalKills,lumen:state.lumen,shards:state.shards,ascendCount:state.ascendCount} : null
  });
  return result;
};

window.__lumenfallQaBridge = {
  comet: {render:renderAll,shop:renderShop,cosmetics:renderCosmetics,tab:activateTab,ascend:function(){doAscend(false);},queue:queueCometTrial,cancel:cancelCometTrial},
  offlineTest: {
    seed:function(){return JSON.parse(JSON.stringify(window.__lumenfallQaContext.fixtures['offline-catchup-device'].save));},
    failNext:function(){var original=simulationResolveTimestamp;simulationResolveTimestamp=function(){simulationResolveTimestamp=original;throw new Error('injected offline failure');};}
  },
  labMotes: {
    withHp: function(hp,fn){var original=enemyHpFor;enemyHpFor=function(){return hp;};try{return fn();}finally{enemyHpFor=original;}},
    naturalDps: function(){return simulationPassiveDps(2000000000000);},
    numericCosts: function(){return {titan:spiritCost(SPIRITS.find(function(s){return s.id==='titan';})),formation:researchCostForLevels(RESEARCH.find(function(s){return s.id==='formation';}),state.research.formation,1),momentum:nodeCost(NODES.find(function(s){return s.id==='momentum';})),formationStudy:studyCost(LONG_STUDIES.find(function(s){return s.id==='formationstudy';}),state.longStudyLevels.formationstudy),wispAscend:studyCost(LONG_STUDIES.find(function(s){return s.id==='wispascend';}),state.longStudyLevels.wispascend)};},
    traceFarm: function(fn){
      var original=simulationApplyFarmPassive,rows=[];
      simulationApplyFarmPassive=function(seconds,dps,policy,summary){
        var before=JSON.parse(JSON.stringify(state)),kills=summary.kills,luminous=summary.luminousKills;
        original(seconds,dps,policy,summary);
        rows.push({seconds:seconds,damage:dps*seconds,before:before,after:JSON.parse(JSON.stringify(state)),kills:summary.kills-kills,luminous:summary.luminousKills-luminous});
      };
      try{return {result:fn(),rows:rows};}finally{simulationApplyFarmPassive=original;}
    },
    manual: function(id,speed){return applySpeedTier(id,speed);},
    direct: function(seconds,kind,start){var result=advanceAuthoritativeTime(seconds,{kind:kind||'live',visual:false,clockStartMs:start||2000000000000,offlineWindowStartMs:start||2000000000000,captureTimeline:true});return {state:JSON.parse(JSON.stringify(state)),summary:result};},
    withDps: function(dps,fn){var original=simulationPassiveDps;simulationPassiveDps=function(){return dps;};try{return fn();}finally{simulationPassiveDps=original;}},
    mutate: function(kind){
      var start=commitStudyStart,plan=studyMotesPlan,boundary=simulationKillsUntilStudyMotes,farm=simulationApplyFarmPassive;
      if(kind==='double-round')simulationApplyFarmPassive=function simulationApplyFarmPassive(elapsedSec,dps,policy,summary){
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
};
      if(kind==='rounded-quotient')simulationApplyFarmPassive=function simulationApplyFarmPassive(elapsedSec,dps,policy,summary){
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
};
      if(kind==='free-carry')commitStudyStart=function(node){var result=start(node);if(result&&state.studyUseMotes[node.id])findActiveStudy(node.id).speedMult=state.studySpeedTargets[node.id];return result;};
      if(kind==='fallback')studyMotesPlan=function(node){var result=plan(node);if(result&&state.motes<result.cost){result.target=1.5;result.cost=speedTierCost(1.5);}return result;};
      if(kind==='batch-end')simulationKillsUntilStudyMotes=function(){return Infinity;};
      return function(){commitStudyStart=start;studyMotesPlan=plan;simulationKillsUntilStudyMotes=boundary;simulationApplyFarmPassive=farm;};
    }
  },
  inquiry: {
    nodes: function(){return JSON.parse(JSON.stringify(LONG_STUDIES));},
    originals: function(){return LEGACY_STUDY_IDS.slice();},
    plan: function(id){return getStudyStartPlan(typeof id==='string'?LONG_STUDIES.find(function(n){return n.id===id;}):id);},
    start: function(id){return startStudy(typeof id==='string'?LONG_STUDIES.find(function(n){return n.id===id;}):id);},
    autoFill: function(){return autoFillStudySlots();},
    queued: function(){var summary=simulationSummary(0);simulationStartQueuedStudies(summary);return summary;},
    tail: function(seconds){var summary=simulationSummary(seconds);advanceStudyOnlyTime(seconds,2000000000000,summary);return {state:JSON.parse(JSON.stringify(state)),summary:summary};},
    due: function(){var summary=simulationSummary(0);return {handled:simulationCompleteDueStudies(summary),summary:summary};},
    oldComplete: function(seconds){return advanceActiveStudies(seconds);},
    boundary: function(){return simulationKillsUntilEconomyMutation(1);},
    cost: function(id,k){return studyCost(LONG_STUDIES.find(function(n){return n.id===id;}),k);},
    duration: function(id,k){return studyDuration(LONG_STUDIES.find(function(n){return n.id===id;}),k);},
    speedCost: function(speed){return speedTierCost(speed);},
    mutate: function(kind){
      var original=kind==='entry' ? simulationCompleteDueStudies : kind==='handled' ? simulationCompleteDueStudies : studyDuration;
      if(kind==='entry'){
        var first=true;simulationCompleteDueStudies=function(summary){if(first){first=false;return 0;}return original(summary);};
      }else if(kind==='handled'){
        simulationCompleteDueStudies=function(summary){var before=summary.completedStudies.length;original(summary);return summary.completedStudies.length-before;};
      }else studyDuration=function(node,k){var work=original(node,k);return node.id==='measuredinquiry'?Math.round(work*(1-measuredInquiryReduction())):work;};
      return function(){if(kind==='entry'||kind==='handled')simulationCompleteDueStudies=original;else studyDuration=original;};
    }
  },
  autoTarget: {
    render: function(){renderShop();},
    find: function(value){return findAutoAscendRift(value);},
    shift: function(direction){return shiftAutoAscendWindow(direction);},
    flags: function(){return {resetInProgress:resetInProgress,reloadInProgress:reloadInProgress,offlineBusy:!!offlineCatchup,offlinePending:offlinePending,resumeFlowBusy:resumeFlowBusy};},
    input: function(value){var old=reloadInProgress;reloadInProgress=false;try{return setAutoAscendClearedTarget(value);}finally{reloadInProgress=old;}},
    change: function(value){var old=reloadInProgress;reloadInProgress=false;try{var el=els['shop-list'].querySelector('[data-autoascend-target]');el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}finally{reloadInProgress=old;}},
    check: function(){var old=reloadInProgress;reloadInProgress=false;try{return checkAutoAscend();}finally{reloadInProgress=old;}},
    manual: function(){var old=reloadInProgress;reloadInProgress=false;try{return doAscend(false);}finally{reloadInProgress=old;}},
    visibility: async function(hidden){var old=reloadInProgress;reloadInProgress=false;try{var result=window.__lumenfallQaBridge.dispatchVisibility(hidden);while(offlineCatchup)await new Promise(function(resolve){setTimeout(resolve,0);});return result;}finally{reloadInProgress=old;}},
    shopItem: function(){return JSON.parse(JSON.stringify(SHOP.find(function(x){return x.id==='autoascend';})));}
  },
  upgradeClarity: {
    render: function(){renderNodes();renderLongStudies();renderAchievements();},
    metrics: function(){return {lumen:lumenMult(),tap:tapMult(),momentum:momentumMult(),offline:offlineRate(),costReduction:costReduction(),offlineCap:offlineCapHours(),prisms:prismMult()};},
    effects: function(){return {nodes:NODES.map(function(n){return {id:n.id,text:nodeEarnedEffect(n.id)};}),projects:LONG_STUDIES.map(function(n){return {id:n.id,text:projectEarnedEffect(n.id)};})};}
  },
  uiMeasurementPause: function(paused){ window.__qaUiMeasurementPause(paused); },
  supportTest: {
    factor: function(now){return simulationBuffMult(now===undefined?Date.now():now);},
    next: function(now){return simulationNextBuffSeconds(now);},
    average: function(){return averageSupportBuffMult();},
    manual: function(id){triggerAbility(SPIRITS.find(function(sp){return sp.id===id;}),state.spirits[id]||0);},
    logicalCast: function(id,now,clock){simulationTriggerAbility(SPIRITS.find(function(sp){return sp.id===id;}),state.spirits[id],now,simulationPolicy('live',{visual:false}),simulationSummary(0),clock);},
    ready: function(ids){ids.forEach(function(id){state.heroResource[id]=100;});},
    outputs: function(){updateBattleFast();return {passive:idleDps(),tap:tapDamage(),chip:chipEffectivePower('ember'),text:els['buff-indicator'].textContent};},
    // Scoped mutations live only in the throwaway instrumented test page.
    mutate: function(kind){
      var factor=simulationBuffMult,cast=applySupportCast;
      if(kind==='max' || kind==='multiply' || kind==='legacy') simulationBuffMult=function(now,clock){
        var entries=state.supportBuffs ? Object.values(state.supportBuffs.sources).filter(function(e){return supportDeadlineSecondsRemaining(e.until,now,clock)>0;}) : [];
        var legacy=simulationBuffSecondsRemaining(now,clock)>0?state.buffMult:1;
        if(kind==='max')return Math.max.apply(null,[legacy].concat(entries.map(function(e){return e.mult;})));
        if(kind==='multiply')return Math.max(legacy,entries.reduce(function(n,e){return n*e.mult;},1));
        return legacy+entries.reduce(function(n,e){return n+e.mult-1;},1)-1;
      };
      else applySupportCast=function(sp,now,clock){
        var old=state.supportBuffs && state.supportBuffs.sources[sp.id];cast(sp,now,clock);
        if(kind==='self' && old && old.until>now)state.supportBuffs.sources[sp.id].mult+=old.mult-1;
        if(kind==='deadline' && state.supportBuffs){var entries=Object.values(state.supportBuffs.sources),until=Math.max.apply(null,entries.map(function(e){return e.until;}));entries.forEach(function(e){e.until=until;});}
      };
      return function(){simulationBuffMult=factor;applySupportCast=cast;};
    }
  },
  buffTiming: {
    restoreOldCalculation: function(){
      var original=supportDeadlineSecondsRemaining;
      supportDeadlineSecondsRemaining=function(until,nowMs){return until?(until-nowMs)/1000:0;};
      return function(){supportDeadlineSecondsRemaining=original;};
    }
  },
  forge: {
    nodes: function(){return JSON.parse(JSON.stringify(RESEARCH));},
    plan: function(id,n){return getResearchBuyPlan(RESEARCH.find(function(x){return x.id===id;}),n);},
    preview: function(id,n){return researchPreview(RESEARCH.find(function(x){return x.id===id;}),n);},
    buy: function(id,n){labMultiplier=n;buyResearch(RESEARCH.find(function(x){return x.id===id;}));},
    queue: function(){return autoLabQueueTick();},
    cost: function(id,k,n){return researchCostForLevels(RESEARCH.find(function(x){return x.id===id;}),k,n);},
    canonical: function(s){return acceptPersistedState(s,'forge-qa');},
    chance: function(d){return eliteChance(d);},
    spawn: function(){spawnEnemy();return JSON.parse(JSON.stringify(state));},
    rewards: function(d){return {lumen:enemyRewardFor(d),shards:shardRewardFor(d),motes:motesDropFor(d),sigils:sigilsFromBoss(d)};},
    rawResource: function(id){var sp=SPIRITS.find(function(x){return x.id===id;});return abilityRewardRaw(sp,state.spirits[id]);},
    deeds: function(){return {total:ACHIEVEMENTS.reduce(function(n,a){return n+a.reward;},0),items:ACHIEVEMENTS.map(function(a){return {id:a.id,eligible:a.check(state),progress:deedProgress(a,state),text:deedProgressText(a,!!state.achieved[a.id]),reward:a.reward};})};},
    achievements: function(){return applyAchievementChecks();},
    auditEconomy: function(assert){
      var original={research:autoLabQueueTick,empower:autoEmpowerTick,study:simulationStartQueuedStudies,ascend:applyAscendMutation};
      var ledger={lumen:0,shards:0,resetLumen:0,researchLevels:0,studyStarts:0,forge:{lumen:0,shards:0}};
      var copy=function(){return JSON.parse(JSON.stringify(state));};
      function record(before,expected,label){
        assert(before.lumen>=expected.lumen && before.shards>=expected.shards,label+' affordable');
        assert(state.lumen===before.lumen-expected.lumen && state.shards===before.shards-expected.shards,label+' paid exactly once');
        ledger.lumen+=expected.lumen;ledger.shards+=expected.shards;
      }
      autoLabQueueTick=function(){
        var before=copy(),result=original.research(),cost={lumen:0,shards:0},count=0;
        RESEARCH.forEach(function(n){
          var k=before.research[n.id],end=state.research[n.id];
          if(end>k){
            assert(before.researchQueue[n.id] && before.maxDepthEver>=(n.unlockDepth||1),'queued purchase eligible');
            assert(n.levelCap===undefined || end<=n.levelCap,'queue cap');
            for(;k<end;k++){var c=researchCostForLevels(n,k,1);cost.lumen+=c.lumen;cost.shards+=c.shard;count++;}
          }
        });
        assert(count<=20,'existing per-call queue limit');ledger.researchLevels+=count;ledger.forge.lumen+=cost.lumen;ledger.forge.shards+=cost.shards;record(before,cost,'Forge queue');return result;
      };
      autoEmpowerTick=function(){
        var before=copy(),costs={};SPIRITS.forEach(function(sp){costs[sp.id]=spiritCost(sp);});
        var result=original.empower(),cost={lumen:0,shards:0};
        SPIRITS.forEach(function(sp){if(state.spirits[sp.id]>before.spirits[sp.id])cost.lumen+=costs[sp.id];});
        record(before,cost,'Auto-Empower');return result;
      };
      simulationStartQueuedStudies=function(summary){
        var before=copy(),result=original.study(summary),cost={lumen:0,shards:0};
        state.activeStudies.forEach(function(a){if(!before.activeStudies.some(function(old){return old.id===a.id;})){
          var n=LONG_STUDIES.find(function(n){return n.id===a.id;}),c=studyCost(n,before.longStudyLevels[a.id]);cost.lumen+=c.lumen;cost.shards+=c.shard;ledger.studyStarts++;
        }});record(before,cost,'Study');return result;
      };
      applyAscendMutation=function(){var before=state.lumen,result=original.ascend();ledger.resetLumen+=before-state.lumen;return result;};
      return {ledger:ledger,restore:function(){autoLabQueueTick=original.research;autoEmpowerTick=original.empower;simulationStartQueuedStudies=original.study;applyAscendMutation=original.ascend;}};
    },
    mutate: function(kind){
      var saved={plan:getResearchBuyPlan,migrate:migrateSaveV0ToV1,deed:legacyResearchLevels,passive:passiveWispDpsAt};
      if(kind==='cap') getResearchBuyPlan=function(node,n){
        if(node.id==='arcanecal' && researchLevel(node.id)>=10)return {affordable:true,buyCount:1,count:1,cost:researchCostForLevels(node,researchLevel(node.id),1)};
        return saved.plan(node,n);
      };
      if(kind==='migration') SAVE_MIGRATIONS[0]=function(s){var n=saved.migrate(s);if(s.labQueueOn && s.researchQueue===undefined)n.researchQueue.arcanecal=true;return n;};
      if(kind==='deed') legacyResearchLevels=function(s){return RESEARCH.reduce(function(n,r){return n+(s.research[r.id]||0);},0);};
      if(kind==='effect') passiveWispDpsAt=function(d){return saved.passive(d)*researchFactor('arcanecal');};
      return function(){getResearchBuyPlan=saved.plan;SAVE_MIGRATIONS[0]=saved.migrate;legacyResearchLevels=saved.deed;passiveWispDpsAt=saved.passive;};
    }
  },

  formationTest: {
    canonical: function(s){return acceptPersistedState(s,'qa-review');},
    rates: function(){return {fill:(100/ABILITY_BASE_CYCLE_SEC)*fillRateMult(),dps:simulationPassiveDps(2000000000000)};},
    // Observe real mutation entry points. Assertions run before and after them;
    // no replacement simulator or production-only testing switch is introduced.
    audit: function(assert,mutation){
      var originals={retry:simulationMaybeRetryBoss,ascend:applyAscendMutation,
        auto:simulationApplyAutoAscend,buy:autoEmpowerTick,death:simulationDefeatEnemy,
        reconcile:reconcileFormationRebuild,advance:advanceAuthoritativeTime};
      var counts={retries:0,ascends:0,purchases:0,rebuildPurchases:0,deaths:0};
      var copy=function(x){return JSON.parse(JSON.stringify(x));};
      function party(){
        assert(state.activeParty.length>0 && state.activeParty.length<=5,'audit powered party bounds');
        assert(state.activeParty.every(function(id){return state.spirits[id]>0;}),'audit powered-only party');
        if(state.formationRebuild){
          var ids=state.formationRebuild.members.filter(function(id){return state.spirits[id]>0;});
          assert(state.activeParty.join(',')===(ids.length?ids:['ember']).join(','),'audit ordered intended projection');
        }
      }
      simulationMaybeRetryBoss=function(policy,summary){
        var before=copy(state),n=summary.retries;
        var eligible=policy.allowBossRetreat && before.riftMode==='farm' && before.farmReturnDepth>0 &&
          isBoss(before.farmReturnDepth) && isFinite(estimatedBossKillSeconds(before.farmReturnDepth));
        var result=originals.retry(policy,summary);
        if(mutation==='farm-exit' && before.riftMode==='farm' && !eligible){state.riftMode='push';result=true;}
        if(result || state.riftMode!==before.riftMode){
          assert(eligible,'audit unauthorized Farm exit');
          assert(state.riftMode==='push' && state.depth===before.farmReturnDepth && state.farmReturnDepth===0 && state.farmDepth===0,'audit legal Boss retry destination');
          assert(summary.retries===n+1,'audit retry counted once');counts.retries++;
        }
        return result;
      };
      applyAscendMutation=function(){
        var before=copy(state),intended=before.formationRebuild?before.formationRebuild.members:before.activeParty;
        assert(autoAscendReady() && ascendEligible() && clearedProgressionRift()>=autoAscendClearedTarget(),'audit premature Ascension');
        var gain=originals.ascend();
        if(mutation==='duplicate') originals.ascend();
        assert(state.ascendCount===before.ascendCount+1,'audit duplicate Ascension');
        assert(state.depth===1 && state.riftMode==='push','audit Ascension resets progression');
        assert((state.formationRebuild?state.formationRebuild.members:state.activeParty).join(',')===intended.join(','),'audit Ascension preserves intent');
        SPIRITS.forEach(function(sp){assert(state.spirits[sp.id]===(sp.id==='ember'?1:0),'audit normal reset levels');});
        counts.ascends++;party();return gain;
      };
      simulationApplyAutoAscend=function(summary){
        if(mutation==='premature' && !autoAscendReady()) applyAscendMutation();
        return originals.auto(summary);
      };
      autoEmpowerTick=function(){
        var before=copy(state),costs={},candidates=autoEmpowerCandidateIds();
        SPIRITS.forEach(function(sp){costs[sp.id]=spiritCost(sp);});
        var result=originals.buy();
        if(mutation==='free' && result && before.formationRebuild && before.formationRebuild.members.some(function(id){return before.spirits[id]===0 && state.spirits[id]>0;})) state.lumen=before.lumen;
        if(result){
          var changed=SPIRITS.filter(function(sp){return state.spirits[sp.id]!==before.spirits[sp.id];});
          assert(changed.length===1,'audit one purchase');var id=changed[0].id;
          assert(before.achieved.labmaster && before.empowerQueue[id]!==false && candidates.indexOf(id)!==-1 && before.maxDepthEver>=changed[0].unlockDepth,'audit eligible purchase candidate');
          assert(before.lumen>=costs[id] && state.lumen===before.lumen-costs[id],'audit paid exactly once');
          assert(state.spirits[id]===before.spirits[id]+1,'audit one paid level');
          assert(state.enemyHp===before.enemyHp && state.enemyDepth===before.enemyDepth && state.totalKills===before.totalKills,'audit purchase cannot apply retrospective damage');
          candidates.forEach(function(other){if(before.empowerQueue[other]!==false) assert(costs[id]<=costs[other],'audit cheapest-next-purchase');});
          counts.purchases++;
          if(before.formationRebuild && before.formationRebuild.members.indexOf(id)!==-1 && before.spirits[id]===0) counts.rebuildPurchases++;
          party();
        }
        return result;
      };
      simulationDefeatEnemy=function(policy,summary){
        var before=copy(state),count=summary.kills;
        var result=originals.death(policy,summary);
        assert(summary.kills===count+1,'audit one defeated enemy');
        if(state.ascendCount===before.ascendCount){
          assert(state.riftMode===before.riftMode,'audit unauthorized death mode transition');
          assert(state.depth===(before.riftMode==='farm'?before.farmDepth:before.depth+1),'audit legal Push progression');
        }
        counts.deaths++;party();return result;
      };
      if(mutation==='persist') reconcileFormationRebuild=function(s){
        if(s.formationRebuild && !s.formationRebuild.members.some(function(id){return s.spirits[id]>0;}) && !s.spirits.ember)return;
        originals.reconcile(s);
      };
      if(mutation==='timer'){
        var source=String(originals.advance),guard='if(state.ascendCount===ascendsBeforePassive){';
        assert(source.indexOf(guard)!==-1,'timer mutation anchor');
        advanceAuthoritativeTime=eval('('+source.replace(guard,'if(true){')+')');
      }
      return {counts:counts,restore:function(){
        simulationMaybeRetryBoss=originals.retry;applyAscendMutation=originals.ascend;
        simulationApplyAutoAscend=originals.auto;autoEmpowerTick=originals.buy;
        simulationDefeatEnemy=originals.death;reconcileFormationRebuild=originals.reconcile;
        advanceAuthoritativeTime=originals.advance;
      }};
    },

    buy: function(id){ buySpirit(SPIRITS.find(function(sp){return sp.id===id;})); },
    cost: function(id){ return spiritCost(SPIRITS.find(function(sp){return sp.id===id;})); },
    tick: function(){ return autoEmpowerTick(); },
    spent: function(before,after){
      var saved=state,total={lumen:0,shards:0};
      try{
        state=JSON.parse(JSON.stringify(before));
        SPIRITS.forEach(function(sp){
          for(var level=before.spirits[sp.id];level<after.spirits[sp.id];level++){
            state.spirits[sp.id]=level;total.lumen+=spiritCost(sp);
          }
        });
        RESEARCH.forEach(function(node){
          for(var level=before.research[node.id];level<after.research[node.id];level++){
            var cost=researchCostForLevels(node,level,1);total.lumen+=cost.lumen;total.shards+=cost.shard;
          }
        });
        after.activeStudies.forEach(function(active){
          if(before.activeStudies.some(function(old){return old.id===active.id;})) return;
          var node=LONG_STUDIES.find(function(node){return node.id===active.id;});
          var cost=studyCost(node,before.longStudyLevels[node.id]||0);total.lumen+=cost.lumen;total.shards+=cost.shard;
        });
        return total;
      }finally{state=saved;}
    },
    toggle: function(id){ toggleActive(id); },
    mutateAutosave: function(kind){
      var commit=commitFormationMembers,reconcile=reconcileFormationRebuild,apply=applyFormationPreset;
      if(kind==='lost-destination') commitFormationMembers=function(members){commit(members);state.activeFormationPreset='';};
      if(kind==='projection-save') reconcileFormationRebuild=function(snapshot){reconcile(snapshot);if(snapshot.activeFormationPreset)snapshot.formationPresets[snapshot.activeFormationPreset]=snapshot.activeParty.slice();};
      if(kind==='switch-overwrite') applyFormationPreset=function(name){var leaving=state.activeFormationPreset,result=apply(name);if(leaving)state.formationPresets[leaving]=state.activeParty.slice();return result;};
      return function(){commitFormationMembers=commit;reconcileFormationRebuild=reconcile;applyFormationPreset=apply;};
    },
    corruptPrimary: function(){ localStorage.setItem(SAVE_KEY,'broken'); },
    // Negative controls use real production entry points with one scoped mutation.
    mutate: function(kind){
      var original = kind==='intent' ? normalizeFormationRebuild : reconcileFormationRebuild;
      if(kind==='intent') normalizeFormationRebuild=function(){return null;};
      else reconcileFormationRebuild=function(snapshot){if(snapshot.formationRebuild) snapshot.activeParty=snapshot.formationRebuild.members.slice();};
      return function(){if(kind==='intent') normalizeFormationRebuild=original;else reconcileFormationRebuild=original;};
    }
  },
  riftStatus: {
    visualMetrics: function(){return {regen:state.enemyMaxHp*bossRegenRate(state.depth),dps:sustainedCombatDps(state.depth),cycle:abilityCycleSeconds()};},
    emit: function(id){emitCombatVfx('ability','#abcdef',id);},
    slots: function(){return studySlotCount();},
    projects: function(){return LONG_STUDIES.map(function(n){return {id:n.id,unlock:n.unlockDepth||1};});},
    bonds: function(){return JSON.parse(JSON.stringify(FORMATION_BONDS));},
    powered: function(){return poweredActiveIds();},
    active: function(){return JSON.parse(JSON.stringify(activeFormationBonds()));},
    update: function(){updateBattleFast();},
    mutate: function(kind){
      var name=kind==='badge'?renderLabCapacityBadge:(kind==='bond'?activeFormationBonds:updateBattleFast);
      if(kind==='badge')renderLabCapacityBadge=function(){name();els['lab-capacity-badge'].textContent='99';els['lab-capacity-badge'].hidden=false;};
      if(kind==='bond')activeFormationBonds=function(){return FORMATION_BONDS.slice();};
      if(kind==='buff')updateBattleFast=function(){var text=els['buff-indicator'].innerHTML;name();els['buff-indicator'].innerHTML=text;};
      return function(){if(kind==='badge')renderLabCapacityBadge=name;else if(kind==='bond')activeFormationBonds=name;else updateBattleFast=name;};
    }
  },
  r3: {
    catalogues: function(){return {upgrades:RESEARCH.map(function(n){return n.id;}),projects:LONG_STUDIES.map(function(n){return n.id;})};},
    plan: function(id){return getResearchBuyPlan(RESEARCH.find(function(n){return n.id===id;}));},
    project: function(id){var n=LONG_STUDIES.find(function(n){return n.id===id;});return {duration:studyDuration(n,state.longStudyLevels[id]||0),cost:studyCost(n,state.longStudyLevels[id]||0)};},
    wrongShortcut: function(){
      var original=activateTab;
      activateTab=function(name){original(name==='research'?'forge':name);};
      return function(){activateTab=original;};
    }
  },
  studyPresentation: {
    format: function(sec){ return fmtStudyDuration(sec); },
    remaining: function(active){ return studyRemainingText(active); },
    shared: function(sec){ return fmtDuration(sec); },
    update: function(){ updateStudyProgress(); },
    preview: function(id){ var node=LONG_STUDIES.find(function(n){return n.id===id;}); return studyDuration(node,state.longStudyLevels[id]||0); },
    // One scoped presentation mutation per negative control, restored by caller.
    mutate: function(kind){
      var original=fmtStudyDuration;
      fmtStudyDuration=kind==='days' ? function(sec){return original(sec%86400);} : function(sec){return original(sec).replace(/ \d{2}s$/,'');};
      return function(){fmtStudyDuration=original;};
    }
  },
  feedbackTick: function(enabled){
    var presenter=presentLiveRiftResult;
    if(enabled===false) presentLiveRiftResult=function(){};
    reloadInProgress=false;
    try { tick(); } finally { presentLiveRiftResult=presenter; reloadInProgress=true; }
    return JSON.parse(JSON.stringify(state));
  },
  resetFeedback: function(){
    if(startupIntroFinish) startupIntroFinish();
    document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});
    liveRiftFeedbackAt=-Infinity;
    document.querySelectorAll('.rift-milestone,.combat-vfx').forEach(function(el){el.remove();});
  },
  feedbackSave: function(){
    reloadInProgress=false;
    try { saveState(); } finally { reloadInProgress=true; }
  },
  refreshAffordability: function(){ lastAffordabilityAt=0; checkAffordability(); },
  renderLayout: function(){ renderAll(); updateBattleFast(); },
  toast: function(message){ showToast(message); },
  getState: function(){ return JSON.parse(JSON.stringify(state)); },
  getFlags: function(){ return {resetInProgress:resetInProgress, resetBootPending:resetBootPending, reloadInProgress:reloadInProgress, offlineBusy:!!offlineCatchup, offlinePending:offlinePending, resumeFlowBusy:resumeFlowBusy}; },
  rawSave: function(){ return localStorage.getItem(SAVE_KEY); },
  rawRecovery: function(){ return localStorage.getItem(RECOVERY_SAVE_KEY); },
  persistenceStatus: function(){ return persistenceStatus(); },
  save: function(){ return saveState(); },
  clockNow: function(){ return window.__lumenfallQaContext.clockNow(); },
  advanceTime: function(ms){ return window.__lumenfallQaContext.advanceTime(ms); },
  setLocalClock: function(year,month,day,hour,minute,second){
    return window.__lumenfallQaContext.setLocalClock(year,month,day,hour,minute,second);
  },
  currentDay: function(){ return window.__lumenfallQaContext.currentDay(); },
  dispatchVisibility: function(hidden){
    window.__lumenfallQaContext.setHidden(hidden);
    document.dispatchEvent(new Event('visibilitychange'));
    return {
      hidden:document.hidden,
      state:JSON.parse(JSON.stringify(state)),
      trace:JSON.parse(JSON.stringify(qaLifecycleEvents))
    };
  },
  lifecycleTrace: function(){ return JSON.parse(JSON.stringify(qaLifecycleEvents)); },
  clearLifecycleTrace: function(){ qaLifecycleEvents.length = 0; },
  applyOfflineNow: function(){ return applyOfflineProgress(); },
  setLastSeen: function(value){ state.lastSeen=Number(value); return state.lastSeen; },
  suppressUnloadSave: function(){ reloadInProgress=true; },
  previewOffline: function(snapshot,seconds,startMs){
    var previousState = state;
    var previousDailyReward = pendingDailyReward;
    try{
      state = acceptPersistedState(JSON.parse(JSON.stringify(snapshot)),'qa-lifecycle-preview');
      restoreEnemyOrSpawn();
      var result = advanceAuthoritativeTime(seconds,{
        kind:'offline',
        visual:false,
        clockStartMs:startMs,
        offlineWindowStartMs:startMs,
        captureTimeline:true
      });
      return {
        state:JSON.parse(JSON.stringify(state)),
        summary:JSON.parse(JSON.stringify(result)),
        timeline:JSON.parse(JSON.stringify(result.timeline||[]))
      };
    } finally {
      state = previousState;
      pendingDailyReward = previousDailyReward;
    }
  },
  enterFarm: function(){ enterFarmMode(); },
  enterPush: function(){ enterPushMode(); },
  reset: function(){ performReset(); },
  restoreBackup: function(code){
    var textarea = document.getElementById('save-backup-code');
    textarea.value = code;
    restoreSaveBackup();
  },
  enemyHpFor: function(depth){ return enemyHpFor(depth); },
  ascendBreakdown: function(depth){ return JSON.parse(JSON.stringify(ascendPrismBreakdown(depth))); },
  ascendEligibility: function(){ return {eligible:ascendEligible(),cleared:clearedProgressionRift(),autoReady:autoAscendReady(),autoClearedTarget:autoAscendClearedTarget()}; },
  ascendManual: function(){
    var before = {prisms:state.prisms,ascendCount:state.ascendCount,benchmark:state.ascendRewardedDepth||0};
    doAscend(false);
    return {
      before:before,
      after:{
        prisms:state.prisms,
        ascendCount:state.ascendCount,
        benchmark:state.ascendRewardedDepth||0,
        depth:state.depth
      },
      gain:state.prisms-before.prisms
    };
  },
  bossRetreatGraceSec: function(){ return OFFLINE_BOSS_RETREAT_GRACE_SEC; },
  freshStateSnapshot: function(){ return JSON.parse(JSON.stringify(freshState())); },
  wispRoleContract: function(){
    return SPIRITS.map(function(sp){
      var module=MODULE_INFO[sp.abilityType];
      return {
        id:sp.id,
        name:sp.name,
        heroClass:sp.heroClass,
        role:sp.role,
        abilityType:sp.abilityType,
        abilityName:sp.abilityName,
        coefficient:abilityDamageCoefficient(sp),
        moduleName:module ? module.name : '',
        moduleEffect20:module ? module.effect(20) : '',
        description:ABILITY_DESC[sp.abilityType]||'',
        rewardKind:sp.abilityType==='ranged'?'shards':(sp.abilityType==='druid'?'lumen':'none'),
        supportProfile:sp.abilityType==='support'?supportAbilityProfile(sp):null
      };
    });
  },
  endgameEconomyContract: function(){
    var restStopTotal=SHOP.reduce(function(sum,item){return sum+item.cost;},0);
    var deedTotal=ACHIEVEMENTS.reduce(function(sum,item){return sum+item.reward;},0);
    var sigilsThrough220=0;
    for(var depth=10;depth<=220;depth+=10) sigilsThrough220+=sigilsFromBoss(depth);
    return {
      ultimateSigilTotal:totalUltimateSigilCost(),
      restStopCometTotal:restStopTotal,
      deedCometTotal:deedTotal,
      sigilsThroughRift220:sigilsThrough220,
      sigilResonanceCost:SIGIL_RESONANCE_COST,
      sigilResonanceRunLimit:SIGIL_RESONANCE_RUN_LIMIT,
      questRefreshCost:dailyQuestRefreshCost(),
      maxQuestCometReward:maxDailyQuestCometReward(),
      allUltimatesOwned:allUltimatesOwned(),
      restStopComplete:restStopComplete()
    };
  },
  resonateFor: function(id){
    var sp=SPIRITS.find(function(item){return item.id===id;});
    if(!sp) throw new Error('Unknown Wisp '+id);
    var before={sigils:state.sigils,uses:state.sigilResonanceUses||0,resource:state.heroResource[id]||0};
    var ok=useSigilResonance(sp);
    return {ok:ok,before:before,state:JSON.parse(JSON.stringify(state))};
  },
  refreshQuest: function(id){
    var before={comets:state.comets,refreshes:state.dailyQuestRefreshes||0,questIds:(state.questIds||[]).slice()};
    var ok=refreshDailyQuest(id);
    return {ok:ok,before:before,state:JSON.parse(JSON.stringify(state))};
  },
  wispPacingContract: function(id){
    var sp = SPIRITS.find(function(item){ return item.id===id; });
    if(!sp) throw new Error('Unknown Wisp '+id);
    var rarity = [];
    var module = [];
    var rarityTotal = {lumen:0,shard:0};
    var moduleTotal = {lumen:0,shard:0};
    for(var tier=0;tier<5;tier++){
      var rc = rarityCost(sp,tier);
      rarity.push({tier:tier,req:rarityReq(tier),lumen:rc.lumen,shard:rc.shard});
      rarityTotal.lumen += rc.lumen;
      rarityTotal.shard += rc.shard;
    }
    for(var level=0;level<MODULE_MAX_LEVEL;level++){
      var mc = moduleCost(sp,level);
      module.push({level:level,lumen:mc.lumen,shard:mc.shard,pacing:modulePacingMult(level)});
      moduleTotal.lumen += mc.lumen;
      moduleTotal.shard += mc.shard;
    }
    return {
      id:id,
      rarity:rarity,
      rarityTotal:rarityTotal,
      module:module,
      moduleTotal:moduleTotal,
      moduleMax:MODULE_MAX_LEVEL,
      ultimateSigils:ultimateSigilCost(sp)
    };
  },
  allWispPacingTotals: function(){
    var out={rarity:{lumen:0,shard:0},module:{lumen:0,shard:0}};
    SPIRITS.forEach(function(sp){
      var contract=this.wispPacingContract(sp.id);
      out.rarity.lumen+=contract.rarityTotal.lumen;
      out.rarity.shard+=contract.rarityTotal.shard;
      out.module.lumen+=contract.moduleTotal.lumen;
      out.module.shard+=contract.moduleTotal.shard;
    },this);
    return out;
  },
  buyRarityFor: function(id){
    var sp=SPIRITS.find(function(item){return item.id===id;});
    if(!sp) throw new Error('Unknown Wisp '+id);
    buyRarity(sp);
    return JSON.parse(JSON.stringify(state));
  },
  buyModuleFor: function(id){
    var sp=SPIRITS.find(function(item){return item.id===id;});
    if(!sp) throw new Error('Unknown Wisp '+id);
    buyModule(sp);
    return JSON.parse(JSON.stringify(state));
  },
  setState: function(next){
    state = acceptPersistedState(JSON.parse(JSON.stringify(next)),'qa-simulation');
    restoreEnemyOrSpawn();
    return JSON.parse(JSON.stringify(state));
  },
  applyFormationPreset: function(name){ return applyFormationPreset(name); },
  activeBondIds: function(){ return activeFormationBonds().map(function(bond){return bond.id;}); },
  autoEmpowerAll: function(enabled){ setAutoEmpowerAll(!!enabled); return JSON.parse(JSON.stringify(state.empowerQueue)); },
  simulate: function(seconds,kind,chunkSec,startMs,windowStartMs){
    var begin = performance.now();
    var remaining = Math.max(0,Number(seconds)||0);
    var chunk = Math.max(0,Number(chunkSec)||remaining||0);
    var clock = Number.isFinite(startMs) ? startMs : 2000000000000;
    var offlineWindowStartMs = Number.isFinite(windowStartMs)?windowStartMs:clock;
    var aggregate = {
      lumenGained:0,shardGained:0,sigilsGained:0,motesGained:0,
      kills:0,bossKills:0,luminousKills:0,ascends:0,autoTaps:0,
      empowers:0,researchBought:0,studiesStarted:0,studySpeedPurchases:0,studyMotesSpent:0,retreats:0,retries:0,
      fastForwardedKills:0,iterations:0,retreated:false,
      completedStudies:[],closedStudies:[],achievements:[],ascendGains:[]
    };
    function merge(part){
      [
        'lumenGained','shardGained','sigilsGained','motesGained',
        'kills','bossKills','luminousKills','ascends','autoTaps','empowers',
        'researchBought','studiesStarted','studySpeedPurchases','studyMotesSpent','retreats','retries',
        'fastForwardedKills','iterations'
      ].forEach(function(key){ aggregate[key] += part[key]||0; });
      aggregate.retreated = aggregate.retreated || !!part.retreated;
      (part.completedStudies||[]).forEach(function(name){ aggregate.completedStudies.push(name); });
      (part.closedStudies||[]).forEach(function(name){ aggregate.closedStudies.push(name); });
      (part.achievements||[]).forEach(function(id){ if(aggregate.achievements.indexOf(id)===-1) aggregate.achievements.push(id); });
      (part.ascendGains||[]).forEach(function(gain){ aggregate.ascendGains.push(gain); });
      aggregate.endDepth = part.endDepth;
      aggregate.pushDepth = part.pushDepth;
      aggregate.clockEndMs = part.clockEndMs;
    }
    var guard = 0;
    while(remaining>1e-9){
      if(++guard>100000) throw new Error('QA simulation chunk guard exceeded');
      var dt = chunk>0 ? Math.min(chunk,remaining) : remaining;
      var part = advanceAuthoritativeTime(dt,{
        kind:kind||'live',
        visual:false,
        clockStartMs:clock,
        offlineWindowStartMs:(kind||'live')==='offline' ? offlineWindowStartMs : undefined
      });
      merge(part);
      clock = part.clockEndMs;
      remaining = Math.max(0,remaining-dt);
    }
    return {
      state:JSON.parse(JSON.stringify(state)),
      summary:aggregate,
      wallMs:performance.now()-begin
    };
  },
  simulateOfflineDirect: function(seconds,startMs){
    var begin = performance.now();
    var offlineStartMs = Number.isFinite(startMs)?startMs:2000000000000;
    var result = simulateOfflineRun(seconds,{clockStartMs:offlineStartMs,offlineWindowStartMs:offlineStartMs});
    return {
      state:JSON.parse(JSON.stringify(state)),
      summary:result,
      wallMs:performance.now()-begin
    };
  },
  simulateTimeline: function(seconds,kind,startMs){
    var begin = performance.now();
    var timelineStartMs = Number.isFinite(startMs)?startMs:2000000000000;
    var result = advanceAuthoritativeTime(seconds,{
      kind:kind||'offline',
      visual:false,
      clockStartMs:timelineStartMs,
      offlineWindowStartMs:(kind||'offline')==='offline' ? timelineStartMs : undefined,
      captureTimeline:true
    });
    return {
      state:JSON.parse(JSON.stringify(state)),
      summary:result,
      timeline:JSON.parse(JSON.stringify(result.timeline||[])),
      wallMs:performance.now()-begin
    };
  },
  simulateDirectTrace: function(seconds,kind,everySec,startMs){
    var traceStartMs = Number.isFinite(startMs)?startMs:2000000000000;
    var result = advanceAuthoritativeTime(seconds,{
      kind:kind||'offline',
      visual:false,
      clockStartMs:traceStartMs,
      offlineWindowStartMs:(kind||'offline')==='offline' ? traceStartMs : undefined,
      traceEverySec:everySec
    });
    return {
      state:JSON.parse(JSON.stringify(state)),
      summary:result,
      trace:JSON.parse(JSON.stringify(result.trace||[]))
    };
  },
  simulateEventTrace: function(seconds,kind,startMs,fromSec,toSec,offsetSec){
    var eventStartMs = Number.isFinite(startMs)?startMs:2000000000000;
    var eventOffsetSec = offsetSec||0;
    var result = advanceAuthoritativeTime(seconds,{
      kind:kind||'offline',
      visual:false,
      clockStartMs:eventStartMs,
      offlineWindowStartMs:(kind||'offline')==='offline' ? eventStartMs-eventOffsetSec*1000 : undefined,
      traceEventsFromSec:fromSec,
      traceEventsToSec:toSec,
      traceOffsetSec:eventOffsetSec
    });
    return {
      state:JSON.parse(JSON.stringify(state)),
      summary:result,
      eventTrace:JSON.parse(JSON.stringify(result.eventTrace||[]))
    };
  },
  currentSimulationTrace: function(elapsedSec,startMs){
    var clockStartMs = Number.isFinite(startMs)?startMs:2000000000000;
    var nowMs = clockStartMs + elapsedSec*1000;
    var dps = simulationPassiveDps(nowMs);
    var rewardScale = simulationRewardScale(simulationPolicy('offline',{}));
    return {
      elapsedSec:elapsedSec,
      enemyHp:state.enemyHp,
      enemyMaxHp:state.enemyMaxHp,
      totalKills:state.totalKills,
      luminousAccum:state.luminousAccum,
      enemyIsLuminous:!!state.enemyIsLuminous,
      autoTapAccum:state._autoTapAccum||0,
      autoEmpowerAccum:state._autoEmpowerAccum||0,
      heroResource:JSON.parse(JSON.stringify(state.heroResource||{})),
      lumen:state.lumen,
      shards:state.shards,
      spirits:JSON.parse(JSON.stringify(state.spirits||{})),
      passiveDps:dps,
      nextEvents:{
        ability:simulationNextAbilitySeconds(),
        autoTap:simulationNextAutoTapSeconds(),
        autoEmpower:simulationNextAutoEmpowerSeconds(),
        study:simulationNextStudySeconds(),
        farmGrid:state.riftMode==='farm' ? 1 : Infinity,
        economy:state.riftMode==='farm' ? simulationFarmEconomyBoundarySeconds(dps,rewardScale) : Infinity
      }
    };
  },
  simulationDiagnosticsFor: function(snapshot){
    var previous = state;
    state = JSON.parse(JSON.stringify(snapshot));
    var out = {
      passiveDps:passiveWispDpsAt(state.depth),
      sustainedDps:sustainedCombatDps(state.depth),
      abilityCycleSec:abilityCycleSeconds(),
      offlineRate:offlineRate()
    };
    state = previous;
    return out;
  },
  wispFormulaSnapshot: function(id,depth,partyBuffMult){
    var sp = SPIRITS.find(function(item){ return item.id===id; });
    if(!sp) throw new Error('Unknown Wisp '+id);
    var level = state.spirits[id]||0;
    var targetDepth = Number.isFinite(depth) ? depth : state.depth;
    var reward = abilityRewardPerCast(sp,level);
    var support = sp.abilityType==='support' ? supportAbilityProfile(sp) : null;
    return {
      wispPower:wispPower(sp,level),
      totalActivePartyPower:totalActivePartyPower(),
      passiveGlobalPowerMult:passiveGlobalPowerMult(),
      effectivePartyPower:effectivePartyPower(),
      passiveDps:passiveWispDpsAt(targetDepth),
      abilityDamage:abilityBurstDamage(sp,targetDepth),
      abilityReward:reward,
      supportProfile:support,
      guardianTap:guardianTapDamageAt(targetDepth,partyBuffMult===undefined?1:partyBuffMult),
      formationDamageMult:formationContextDamageMult(targetDepth),
      formationRewardMult:formationRewardMult(),
      bossAbilityMult:bossAbilityDamageMult(targetDepth),
      bossTapMult:bossTapDamageMult(targetDepth),
      moduleMult:moduleMult(id),
      ultimateMult:abilityUltimateMult(sp),
      supportMoteBonus:supportMoteBonus(),
      moteReward:Math.max(1,Math.round(motesDropFor(targetDepth)*(1+supportMoteBonus())))
    };
  },
  triggerAbilityFor: function(id,kind,nowMs){
    var sp = SPIRITS.find(function(item){ return item.id===id; });
    if(!sp) throw new Error('Unknown Wisp '+id);
    var before = {
      lumen:state.lumen,
      shards:state.shards,
      enemyHp:state.enemyHp,
      buffUntil:state.buffUntil||0,
      buffMult:state.buffMult||1
    };
    var summary = simulationSummary(0);
    simulationTriggerAbility(
      sp,
      state.spirits[id]||0,
      Number.isFinite(nowMs)?nowMs:2000000000000,
      simulationPolicy(kind||'live',{visual:false}),
      summary
    );
    return {
      before:before,
      after:{
        lumen:state.lumen,
        shards:state.shards,
        enemyHp:state.enemyHp,
        buffUntil:state.buffUntil||0,
        buffMult:state.buffMult||1
      },
      summary:summary
    };
  },
  autoTapOnce: function(nowMs){
    var beforeHp = state.enemyHp;
    state._autoTapAccum = 1000;
    var summary = simulationSummary(0);
    var processed = simulationProcessAutoTap(
      Number.isFinite(nowMs)?nowMs:2000000000000,
      simulationPolicy('live',{visual:false}),
      summary
    );
    return {
      processed:processed,
      damage:beforeHp-state.enemyHp,
      state:JSON.parse(JSON.stringify(state)),
      summary:summary
    };
  },
  renderGameplayLanguage: function(){
    renderSpirits();
    renderEncyclopedia();
    updateBattleFast();
    return {
      wisps:els['spirit-list'] ? els['spirit-list'].textContent : '',
      encyclopedia:document.getElementById('encyclopedia-content') ? document.getElementById('encyclopedia-content').textContent : '',
      boss:els['rift-objective'] ? els['rift-objective'].textContent : '',
      buff:els['buff-indicator'] ? els['buff-indicator'].textContent : ''
    };
  },
  freeze: function(){ if(window.__qaUiMeasurementPause)window.__qaUiMeasurementPause(true); reloadInProgress = true; document.body.classList.add('app-paused'); }
};
