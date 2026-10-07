window.__coreBootComplete=false;
var coreOriginalStartup=playStartupIntro;
playStartupIntro=function(done){return coreOriginalStartup.call(this,function(){if(done)done.apply(this,arguments);window.__coreBootComplete=true;});};
window.__core = {
  get:function(){return JSON.parse(JSON.stringify(state));},
  fresh:freshState,
  normalize:normalizeCurrentSave,
  accept:acceptPersistedState,
  ids:function(){return LONG_STUDIES.map(function(n){return n.id;});},
  seed:function(){
    var s=freshState();s.maxDepthEver=101;s.lumen=1e9;s.shards=1e9;
    s.questDay=window.__lumenfallQaContext.currentDay();s.loginStreak=1;
    s.activeParty=['tide'];s.formationPresets={push:['tide'],farm:['tide'],boss:['tide']};
    SPIRITS.forEach(function(sp){s.spirits[sp.id]=0;});
    s.spirits.tide=1;
    ACHIEVEMENTS.forEach(function(a){if(a.id!=='autotap' && a.id!=='labmaster')s.achieved[a.id]=true;});
    s.enemyDepth=s.depth;s.enemyMaxHp=s.enemyHp=enemyHpFor(s.depth);s.lastSeen=Date.now();
    return s;
  },
  set:function(s){state=acceptPersistedState(s,'core-own-fixture');restoreEnemyOrSpawn();return this.get();},
  run:function(seconds,kind,start,dps){
    var original=simulationPassiveDps;
    if(Number.isFinite(dps))simulationPassiveDps=function(){return dps;};
    try{var summary=advanceAuthoritativeTime(seconds,{kind:kind||'live',visual:false,clockStartMs:start||Date.now(),offlineWindowStartMs:start||Date.now(),captureTimeline:true});return {state:this.get(),summary:summary};}
    finally{simulationPassiveDps=original;}
  },
  tail:function(seconds){var summary=simulationSummary(seconds);advanceStudyOnlyTime(seconds,Date.now(),summary);return {state:this.get(),summary:summary};},
  killsBoundary:simulationKillsUntilStudyMotes,
  price:speedTierCost,
  hp:enemyHpFor,
  start:function(id){return startStudy(LONG_STUDIES.find(function(n){return n.id===id;}));},
  manual:applySpeedTier,
  save:function(){var guard=reloadInProgress;reloadInProgress=false;try{return saveState();}finally{reloadInProgress=guard;}},
  guard:function(value){reloadInProgress=!!value;},
  raw:function(){return {primary:localStorage.getItem(SAVE_KEY),recovery:localStorage.getItem(RECOVERY_SAVE_KEY)};},
  backup:currentSaveBackup,
  offline:function(dps){var original=simulationPassiveDps;if(Number.isFinite(dps))simulationPassiveDps=function(){return dps;};try{return applyOfflineProgress();}finally{simulationPassiveDps=original;}},
  render:function(){renderAll();},
  ready:function(){return !!state && window.__coreBootComplete;},
  setLastSeen:function(value){state.lastSeen=value;},
  events:function(){return qaLifecycleEvents.slice();},
  keys:function(){return Object.keys(localStorage).filter(function(k){return /^lumenfall_(save|reset_pending|rift_guidance|startup_intro)/.test(k);}).sort();}
};
