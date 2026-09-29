#!/usr/bin/env python3
import argparse
import html as html_lib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent
FIXTURES_PATH = ROOT / "fixtures.json"

SCENARIOS = {
    "buff-timing": "fresh",
    "buff-save-reload": "fresh",
    "forge-contracts": "fresh",
    "forge-effects": "fresh",
    "forge-chronology": "fresh",
    "forge-save-reload": "fresh",
    "forge-backup-restore": "fresh",
    "forge-recovery": "fresh",
    "forge-baseline": "fresh",
    "forge-balance": "fresh",

    "r3-destinations": "fresh",
    "r3-save-reload": "fresh",
    "research-duration": "fresh",
    "research-duration-reduced-motion": "fresh",
    "p2-07a-persistence-review": "fresh",
    "p2-07a-persist-save-reload": "fresh",
    "p2-07a-persist-backup-restore": "fresh",
    "p2-07a-persist-recovery": "fresh",
    "p2-07a-persist-reset": "fresh",
    "p2-07a-formation-reconstruction": "fresh",
    "p2-07a-save-reload": "fresh",
    "p2-07a-backup-restore": "fresh",
    "p2-07a-recovery": "fresh",
    "p2-07a-chronology": "fresh",
    "layout-p2-07a-reconstruction": "fresh",
    "p2-06b-live-feedback": "fresh",
    "p2-06b-reduced-motion": "fresh",
    "layout-fresh": "fresh",
    "layout-dense": "layout-dense",
    "layout-boss": "layout-dense-boss",
    "layout-accessibility-states": "accessibility-mixed-states",
    "p1-05-accessibility-baseline": "accessibility-mixed-states",
    "p1-05-accessibility-contract": "accessibility-mixed-states",
    "p1-05-control-regressions": "accessibility-mixed-states",
    "p1-05-reduced-motion": "accessibility-mixed-states",
    "fresh-load": "fresh",
    "midgame-load": "mid-game",
    "mature-load": "mature-high-power",
    "legacy-load": "legacy",
    "corrupted-load": "corrupted-json",
    "malformed-daily-load": "malformed-state",
    "farm-load": "farm-mode",
    "farm-roundtrip": "mid-game",
    "enemy-normal-reload": "damaged-normal-enemy",
    "enemy-boss-reload": "damaged-boss",
    "active-studies-load": "active-long-studies",
    "auto-ascend-load": "auto-ascend-enabled",
    "reset-roundtrip": "mid-game",
    "restore-roundtrip": "mid-game",
    "malformed-backup-rejection": "mid-game",
    "recovery-from-corrupt-primary": "corrupted-with-recovery",
    "unsupported-future-load": "future-schema",
    "legacy-backup-restore": "mid-game",
    "future-backup-rejection": "mid-game",
    "recovery-offline-once": "offline-recovery",
    "save-failure-warning": "mid-game",
    "parity-short": "parity-early-simple",
    "parity-medium-farm": "parity-medium-farm",
    "p2-07a-farm-retention": "parity-medium-farm",
    "p2-07a-timer-boundary": "fresh",
    "parity-long-high-power": "parity-long-high-power",
    "parity-boss-short": "parity-boss-short",
    "parity-boss-retry": "parity-boss-retry",
    "parity-auto-ascend": "parity-auto-ascend",
    "chronology-research-mid-window": "chronology-research-mid-window",
    "chronology-study-mid-window": "chronology-study-mid-window",
    "chronology-auto-empower-mid-window": "chronology-auto-empower-mid-window",
    "chronology-auto-ascend-mid-window": "chronology-auto-ascend-mid-window",
    "chronology-boss-retry": "chronology-boss-retry",
    "chronology-simultaneous-order": "chronology-simultaneous-order",
    "lifecycle-background-resume": "lifecycle-basic",
    "lifecycle-repeated-resume": "lifecycle-basic",
    "lifecycle-cold-restart": "lifecycle-basic",
    "lifecycle-partial-enemy": "lifecycle-partial-enemy",
    "lifecycle-boss-background-short": "chronology-boss-retry",
    "lifecycle-boss-retry": "chronology-boss-retry",
    "lifecycle-auto-ascend": "chronology-auto-ascend-mid-window",
    "p2-ascend-integrity": "fresh",
    "p2-03b-auto-ascend-integrity": "fresh",
    "p2-wisp-progression-pacing": "fresh",
    "p2-endgame-currency-utility": "fresh",
    "p2-03a-wisp-role-integrity": "accessibility-mixed-states",
    "p2-03a-wisp-role-integrity-mature": "mature-high-power",
    "p2-03a-wisp-role-integrity-endgame": "parity-long-high-power",
    "p2-02a-core-qol": "accessibility-mixed-states",
    "p2-02b-wisp-hierarchy": "accessibility-mixed-states",
    "p2-02b-lab-hierarchy": "accessibility-mixed-states",
    "lifecycle-long-study": "chronology-study-mid-window",
    "lifecycle-lab-queue": "chronology-research-mid-window",
    "lifecycle-daily-rollover": "lifecycle-daily",
    "wisp-formula-contract": "fresh",
}

# The strict P1-05 contract is now a mandatory default regression gate.
PREP_SCENARIOS = {}

NEGATIVE_SCENARIOS = {
    "self-test-r3-shortcut": "fresh",
    "self-test-research-duration-days": "fresh",
    "self-test-research-duration-seconds": "fresh",
    "self-test-layout-collapse": "layout-dense-boss",
    "self-test-p1-05-selected": "accessibility-mixed-states",
    "self-test-p1-05-focus-return": "accessibility-mixed-states",
    "self-test-bad-assertion": "fresh",
    "self-test-uncaught-error": "fresh",
    "self-test-unhandled-rejection": "fresh",
    "self-test-parity-regression": "parity-early-simple",
    "self-test-chronology-regression": "chronology-simultaneous-order",
    "self-test-lifecycle-duplicate": "lifecycle-basic",
    "self-test-wisp-formula-regression": "fresh",
    "self-test-wisp-pacing-regression": "fresh",
    "self-test-endgame-currency-regression": "fresh",
    "self-test-wisp-role-regression": "fresh",
}


def find_chrome():
    for candidate in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        found = shutil.which(candidate)
        if found:
            return found
    raise SystemExit("Behavioral QA failed: no supported Chromium browser found")


def load_fixtures():
    return json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))


def build_prelude(fixtures):
    fixtures_json = json.dumps(fixtures, separators=(",", ":"))
    return f'''<script id="qa-behavior-prelude">
(function(){{
  "use strict";
  var fixtures = {fixtures_json};
  var params = new URLSearchParams(location.search);
  var scenario = params.get('qaScenario') || '';
  var fixtureName = params.get('qaFixture') || '';
  var phaseKey = 'lumenfall_qa_phase_' + scenario;
  var errors = [];

  function stringifyReason(value){{
    try{{
      if(value && value.stack) return String(value.stack);
      return typeof value==='string' ? value : JSON.stringify(value);
    }}catch(e){{ return String(value); }}
  }}
  function ensureResult(){{
    var el = document.getElementById('qa-result');
    if(!el){{
      el = document.createElement('pre');
      el.id = 'qa-result';
      document.documentElement.appendChild(el);
    }}
    return el;
  }}
  function markRuntimeFailure(kind, detail){{
    errors.push({{kind:kind, detail:String(detail||'')}});
    document.documentElement.setAttribute('data-qa-runtime-error', kind);
    var el = ensureResult();
    el.setAttribute('data-status','fail');
    el.setAttribute('data-scenario',scenario);
    el.textContent = JSON.stringify({{scenario:scenario,status:'fail',runtimeErrors:errors}}, null, 2);
    if(parent!==window) parent.postMessage({{qaLayoutResult:el.textContent,status:'fail'}},location.origin);
  }}
  window.addEventListener('error', function(event){{
    markRuntimeFailure('uncaught-error', event.message || (event.error && event.error.message) || 'unknown error');
  }});
  window.addEventListener('unhandledrejection', function(event){{
    markRuntimeFailure('unhandled-rejection', stringifyReason(event.reason));
  }});

  function materialize(value){{
    if(value==='__NOW_PLUS_10M__') return Date.now()+600000;
    if(value==='__NOW__') return Date.now();
    if(value==='__NOW_MINUS_60S__') return Date.now()-60000;
    if(value==='__TODAY__'){{
      var d = new Date();
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    }}
    if(Array.isArray(value)) return value.map(materialize);
    if(value && typeof value==='object'){{
      var out = {{}};
      Object.keys(value).forEach(function(k){{ out[k]=materialize(value[k]); }});
      return out;
    }}
    return value;
  }}

  var RealDate = Date;
  var clockKey = 'lumenfall_qa_clock_' + scenario;
  var phase = localStorage.getItem(phaseKey);
  var initialClockMs = scenario==='lifecycle-daily-rollover'
    ? new RealDate(2035,0,15,23,59,50,0).getTime()
    : new RealDate(2035,0,15,12,0,0,0).getTime();

  if(phase===null){{
    localStorage.clear();
    phase = '0';
    localStorage.setItem(phaseKey, phase);
    localStorage.setItem(clockKey, String(initialClockMs));
  }}

  var fakeNowMs = Number(localStorage.getItem(clockKey));
  if(!Number.isFinite(fakeNowMs)) fakeNowMs = initialClockMs;

  class QaDate extends RealDate {{
    constructor(){{
      if(arguments.length===0) super(fakeNowMs);
      else super(...arguments);
    }}
    static now(){{ return fakeNowMs; }}
  }}
  QaDate.parse = RealDate.parse;
  QaDate.UTC = RealDate.UTC;
  window.Date = QaDate;

  function setClock(ms){{
    fakeNowMs = Number(ms);
    if(!Number.isFinite(fakeNowMs)) throw new Error('QA clock requires a finite timestamp');
    localStorage.setItem(clockKey,String(fakeNowMs));
    return fakeNowMs;
  }}
  function advanceClock(ms){{ return setClock(fakeNowMs + Number(ms||0)); }}
  function setLocalClock(year,month,day,hour,minute,second){{
    return setClock(new RealDate(year,month,day,hour||0,minute||0,second||0,0).getTime());
  }}
  function currentDay(){{
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }}

  var qaHidden = false;
  try{{
    Object.defineProperty(document,'hidden',{{configurable:true,get:function(){{ return qaHidden; }}}});
    Object.defineProperty(document,'visibilityState',{{configurable:true,get:function(){{ return qaHidden ? 'hidden' : 'visible'; }}}});
  }}catch(e){{
    markRuntimeFailure('visibility-control-error', e && e.message ? e.message : String(e));
  }}
  function setHidden(value){{ qaHidden = !!value; return qaHidden; }}

  var resolvedFixtures = materialize(fixtures);
  if(phase==='0'){{
    var fixture = resolvedFixtures[fixtureName];
    if(!fixture){{
      markRuntimeFailure('fixture-error', 'Unknown fixture '+fixtureName);
    }} else if(Object.prototype.hasOwnProperty.call(fixture,'raw')){{
      localStorage.setItem('lumenfall_save_v2', fixture.raw);
      localStorage.setItem('lumenfall_startup_intro_last', String(Date.now()));
    }} else if(fixture.save!==null){{
      localStorage.setItem('lumenfall_save_v2', JSON.stringify(fixture.save));
      localStorage.setItem('lumenfall_startup_intro_last', String(Date.now()));
    }}
    if(Object.prototype.hasOwnProperty.call(fixture,'recoveryRaw')){{
      localStorage.setItem('lumenfall_save_recovery_v1', fixture.recoveryRaw);
    }} else if(fixture.recoverySave){{
      localStorage.setItem('lumenfall_save_recovery_v1', JSON.stringify(fixture.recoverySave));
    }}
  }}

  window.__lumenfallQaContext = {{
    scenario: scenario,
    fixtureName: fixtureName,
    phaseKey: phaseKey,
    clockKey: clockKey,
    fixtures: resolvedFixtures,
    errors: errors,
    clockNow: function(){{ return fakeNowMs; }},
    advanceTime: advanceClock,
    setClock: setClock,
    setLocalClock: setLocalClock,
    currentDay: currentDay,
    setHidden: setHidden,
    getHidden: function(){{ return qaHidden; }},
    markRuntimeFailure: markRuntimeFailure
  }};
}})();
</script>'''


def build_bridge():
    return r'''
var qaLifecycleEvents = [];
function qaLifecycleRecord(type,detail){
  qaLifecycleEvents.push({
    type:type,
    nowMs:Date.now(),
    detail:detail===undefined ? null : JSON.parse(JSON.stringify(detail))
  });
}
var qaOriginalSaveState = saveState;
saveState = function(){
  var beforeLastSeen = state ? state.lastSeen : null;
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
var qaOriginalApplyOfflineProgress = applyOfflineProgress;
applyOfflineProgress = function(){
  var before = state ? {
    lastSeen:state.lastSeen,
    totalOfflineSeconds:state.totalOfflineSeconds,
    totalKills:state.totalKills,
    lumen:state.lumen,
    shards:state.shards,
    ascendCount:state.ascendCount
  } : null;
  var result = qaOriginalApplyOfflineProgress.apply(this,arguments);
  qaLifecycleRecord('offline',{
    before:before,
    result:result,
    after:state ? {
      lastSeen:state.lastSeen,
      totalOfflineSeconds:state.totalOfflineSeconds,
      totalKills:state.totalKills,
      lumen:state.lumen,
      shards:state.shards,
      ascendCount:state.ascendCount
    } : null
  });
  return result;
};

window.__lumenfallQaBridge = {
  buffTiming: {
    restoreOldCalculation: function(){
      var original=simulationBuffSecondsRemaining;
      simulationBuffSecondsRemaining=function(nowMs){return state.buffUntil?(state.buffUntil-nowMs)/1000:0;};
      return function(){simulationBuffSecondsRemaining=original;};
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
    corruptPrimary: function(){ localStorage.setItem(SAVE_KEY,'broken'); },
    // Negative controls use real production entry points with one scoped mutation.
    mutate: function(kind){
      var original = kind==='intent' ? normalizeFormationRebuild : reconcileFormationRebuild;
      if(kind==='intent') normalizeFormationRebuild=function(){return null;};
      else reconcileFormationRebuild=function(snapshot){if(snapshot.formationRebuild) snapshot.activeParty=snapshot.formationRebuild.members.slice();};
      return function(){if(kind==='intent') normalizeFormationRebuild=original;else reconcileFormationRebuild=original;};
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
  getFlags: function(){ return {resetInProgress:resetInProgress, resetBootPending:resetBootPending, reloadInProgress:reloadInProgress}; },
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
  saveFormationPreset: function(name){ return saveFormationPreset(name); },
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
      empowers:0,researchBought:0,studiesStarted:0,retreats:0,retries:0,
      fastForwardedKills:0,iterations:0,retreated:false,
      completedStudies:[],achievements:[],ascendGains:[]
    };
    function merge(part){
      [
        'lumenGained','shardGained','sigilsGained','motesGained',
        'kills','bossKills','luminousKills','ascends','autoTaps','empowers',
        'researchBought','studiesStarted','retreats','retries',
        'fastForwardedKills','iterations'
      ].forEach(function(key){ aggregate[key] += part[key]||0; });
      aggregate.retreated = aggregate.retreated || !!part.retreated;
      (part.completedStudies||[]).forEach(function(name){ aggregate.completedStudies.push(name); });
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
      boss:els['boss-regen-tag'] ? els['boss-regen-tag'].textContent : '',
      buff:els['buff-indicator'] ? els['buff-indicator'].textContent : ''
    };
  },
  freeze: function(){ reloadInProgress = true; document.body.classList.add('app-paused'); }
};
'''


def build_runner():
    return r'''<script id="qa-behavior-runner">
(function(){
  "use strict";
  var ctx = window.__lumenfallQaContext;

  function resultEl(){
    var el = document.getElementById('qa-result');
    if(!el){ el=document.createElement('pre'); el.id='qa-result'; document.body.appendChild(el); }
    return el;
  }
  function finish(status, detail){
    if(ctx.errors.length) status='fail';
    var bridge = window.__lumenfallQaBridge;
    if(bridge && bridge.freeze) bridge.freeze();
    var el = resultEl();
    el.setAttribute('data-status',status);
    el.setAttribute('data-scenario',ctx.scenario);
    el.textContent = JSON.stringify({scenario:ctx.scenario,status:status,detail:detail||null,runtimeErrors:ctx.errors}, null, 2);
    if(parent!==window) parent.postMessage({qaLayoutResult:el.textContent,status:status},location.origin);
  }
  function assert(condition, message){ if(!condition) throw new Error(message); }
  function approx(actual, expected, epsilon, message){
    if(Math.abs(actual-expected)>epsilon) throw new Error(message+' (expected '+expected+', got '+actual+')');
  }
  function state(){ return window.__lumenfallQaBridge.getState(); }
  function phase(){ return parseInt(localStorage.getItem(ctx.phaseKey)||'0',10); }
  function nextPhase(n){ localStorage.setItem(ctx.phaseKey,String(n)); }
  function backupCode(obj){ return 'LUMENFALL1:'+encodeURIComponent(JSON.stringify(obj)); }

  // P0-05 parity contract:
  // discrete progression must be exact; continuous state uses <= 1e-6 absolute
  // or 1e-12 relative error, whichever is larger. This is intentionally far
  // below any player-visible economic unit and is not a balance fudge factor.
  var PARITY_ABS_TOL = 1e-6;
  var PARITY_REL_TOL = 1e-12;
  var PARITY_CLOCK_MS = 2000000000000;
  function parityApprox(actual,expected,label){
    var tolerance = Math.max(PARITY_ABS_TOL,Math.max(Math.abs(actual),Math.abs(expected))*PARITY_REL_TOL);
    if(!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual-expected)>tolerance){
      throw new Error(label+' parity mismatch (expected '+expected+', got '+actual+', tolerance '+tolerance+')');
    }
  }
  function assertJsonEqual(actual,expected,label){
    var a = JSON.stringify(actual);
    var b = JSON.stringify(expected);
    if(a!==b) throw new Error(label+' parity mismatch (expected '+b+', got '+a+')');
  }
  function assertProtectedParity(actual,expected,label){
    [
      'totalKills','motes','sigils','depth','maxDepthEver','riftMode','farmDepth',
      'farmReturnDepth','enemyDepth','enemyIsLuminous','ascendCount','ascendRewardedDepth','totalTaps',
      'prisms','comets','autoAscendEnabled','autoAscendTargetDepth'
    ].forEach(function(key){
      assert(
        actual[key]===expected[key],
        label+' '+key+' must match exactly (expected '+JSON.stringify(expected[key])+', got '+JSON.stringify(actual[key])+')'
      );
    });

    ['activeParty','formationRebuild','activeFormationPreset','spirits','research','longStudyLevels','achieved','dailyStats'].forEach(function(key){
      assertJsonEqual(actual[key],expected[key],label+' '+key);
    });

    ['lumen','shards','enemyHp','enemyMaxHp','luminousAccum','buffUntil','buffMult','_autoTapAccum','_autoEmpowerAccum'].forEach(function(key){
      parityApprox(Number(actual[key]||0),Number(expected[key]||0),label+' '+key);
    });

    Object.keys(expected.heroResource||{}).forEach(function(id){
      parityApprox(Number((actual.heroResource||{})[id]||0),Number(expected.heroResource[id]||0),label+' heroResource.'+id);
    });

    assert(actual.activeStudies.length===expected.activeStudies.length,label+' activeStudies length must match exactly');
    for(var i=0;i<expected.activeStudies.length;i++){
      var aStudy = actual.activeStudies[i], eStudy = expected.activeStudies[i];
      assert(aStudy.id===eStudy.id,label+' activeStudies['+i+'].id must match exactly');
      assert(aStudy.speedMult===eStudy.speedMult,label+' activeStudies['+i+'].speedMult must match exactly');
      parityApprox(aStudy.remainingSec,eStudy.remainingSec,label+' activeStudies['+i+'].remainingSec');
      parityApprox(aStudy.totalDurationSec,eStudy.totalDurationSec,label+' activeStudies['+i+'].totalDurationSec');
    }
  }
  function assertSummaryParity(actual,expected,label){
    [
      'kills','bossKills','luminousKills','sigilsGained','motesGained','ascends',
      'autoTaps','empowers','researchBought','studiesStarted','retreats','retries'
    ].forEach(function(key){
      assert((actual[key]||0)===(expected[key]||0),label+' summary '+key+' must match exactly');
    });
    parityApprox(actual.lumenGained||0,expected.lumenGained||0,label+' summary lumenGained');
    parityApprox(actual.shardGained||0,expected.shardGained||0,label+' summary shardGained');
    assertJsonEqual(actual.completedStudies||[],expected.completedStudies||[],label+' summary completedStudies');
    assertJsonEqual(actual.ascendGains||[],expected.ascendGains||[],label+' summary ascendGains');
  }
  function runParityPair(seconds,kind,referenceChunk){
    var bridge = window.__lumenfallQaBridge;
    var baseline = state();
    var reference = bridge.simulate(seconds,kind,referenceChunk,PARITY_CLOCK_MS);
    bridge.setState(baseline);
    var direct = kind==='offline'
      ? bridge.simulateOfflineDirect(seconds,PARITY_CLOCK_MS)
      : bridge.simulate(seconds,kind,seconds,PARITY_CLOCK_MS);
    try{
      assertProtectedParity(direct.state,reference.state,kind+' '+seconds+'s');
      assertSummaryParity(direct.summary,reference.summary,kind+' '+seconds+'s');
    }catch(error){
      var refDiag = bridge.simulationDiagnosticsFor(reference.state);
      var directDiag = bridge.simulationDiagnosticsFor(direct.state);
      var boundaryDiagnostics = [];
      var firstCheckpointDivergence = null;
      if(kind==='offline' && seconds===14400){
        bridge.setState(baseline);
        var uninterrupted = bridge.simulateDirectTrace(14400,'offline',60,PARITY_CLOCK_MS);
        bridge.setState(baseline);
        var chunkClock = PARITY_CLOCK_MS;
        var chunkElapsed = 0;
        var chunkStates = [];
        for(var chunkIndex=0;chunkIndex<240;chunkIndex++){
          var chunkPart = bridge.simulate(60,'offline',60,chunkClock);
          chunkElapsed += 60;
          chunkClock = chunkPart.summary.clockEndMs;
          chunkStates.push(bridge.currentSimulationTrace(chunkElapsed,PARITY_CLOCK_MS));
        }
        function firstTraceDifference(a,b){
          var scalarKeys = [
            'enemyHp','enemyMaxHp','totalKills','luminousAccum','enemyIsLuminous',
            'autoTapAccum','autoEmpowerAccum','lumen','shards','passiveDps'
          ];
          var diff = {};
          scalarKeys.forEach(function(key){
            if(a[key]!==b[key]) diff[key]={direct:a[key],chunked:b[key]};
          });
          var ids = Object.keys(a.heroResource||{});
          ids.forEach(function(id){
            var av=(a.heroResource||{})[id]||0, bv=(b.heroResource||{})[id]||0;
            if(av!==bv){
              if(!diff.heroResource) diff.heroResource={};
              diff.heroResource[id]={direct:av,chunked:bv};
            }
          });
          if(JSON.stringify(a.spirits)!==JSON.stringify(b.spirits)){
            diff.spirits={direct:a.spirits,chunked:b.spirits};
          }
          return diff;
        }
        for(var traceIndex=0;traceIndex<Math.min(uninterrupted.trace.length,chunkStates.length);traceIndex++){
          var traceDiff = firstTraceDifference(uninterrupted.trace[traceIndex],chunkStates[traceIndex]);
          if(Object.keys(traceDiff).length){
            firstCheckpointDivergence={
              checkpointSec:(traceIndex+1)*60,
              direct:uninterrupted.trace[traceIndex],
              chunked:chunkStates[traceIndex],
              diff:traceDiff
            };
            break;
          }
        }

        [120,600,3600].forEach(function(probeSec){
          bridge.setState(baseline);
          var probeChunked = bridge.simulate(probeSec,'offline',60,PARITY_CLOCK_MS);
          bridge.setState(baseline);
          var probeDirect = bridge.simulateOfflineDirect(probeSec,PARITY_CLOCK_MS);
          boundaryDiagnostics.push({
            seconds:probeSec,
            chunked:{
              enemyHp:probeChunked.state.enemyHp,
              autoTapAccum:probeChunked.state._autoTapAccum||0,
              autoEmpowerAccum:probeChunked.state._autoEmpowerAccum||0,
              emberResource:probeChunked.state.heroResource.ember,
              clockEndMs:probeChunked.summary.clockEndMs
            },
            direct:{
              enemyHp:probeDirect.state.enemyHp,
              autoTapAccum:probeDirect.state._autoTapAccum||0,
              autoEmpowerAccum:probeDirect.state._autoEmpowerAccum||0,
              emberResource:probeDirect.state.heroResource.ember,
              clockEndMs:probeDirect.summary.clockEndMs
            }
          });
        });
      }
      var firstEventDivergence = null;
      if(kind==='offline' && seconds===14400 && firstCheckpointDivergence){
        var checkpointSec = firstCheckpointDivergence.checkpointSec;
        var intervalStartSec = Math.max(0,checkpointSec-60);

        bridge.setState(baseline);
        // Run past the checkpoint so the direct trace does not gain an
        // artificial window-end event at the boundary being investigated.
        var directEvents = bridge.simulateEventTrace(
          checkpointSec+60,'offline',PARITY_CLOCK_MS,intervalStartSec,checkpointSec,0
        ).eventTrace.filter(function(event){ return event.logicalElapsedSec>intervalStartSec; });

        bridge.setState(baseline);
        var chunkTraceStartMs = PARITY_CLOCK_MS;
        if(intervalStartSec>0){
          var priorChunks = bridge.simulate(intervalStartSec,'offline',60,PARITY_CLOCK_MS);
          chunkTraceStartMs = priorChunks.summary.clockEndMs;
        }
        var chunkEvents = bridge.simulateEventTrace(
          60,'offline',chunkTraceStartMs,intervalStartSec,checkpointSec,intervalStartSec
        ).eventTrace.filter(function(event){ return event.logicalElapsedSec>intervalStartSec; });

        function eventStateDifference(a,b){
          if(!a || !b) return {missing:{direct:!!a,chunked:!!b}};
          var diff = {};
          if(JSON.stringify(a.kinds)!==JSON.stringify(b.kinds)) diff.kinds={direct:a.kinds,chunked:b.kinds};
          [
            'clockMs','stepSec','enemyHp','enemyMaxHp','totalKills','luminousAccum','enemyIsLuminous',
            'autoTapAccum','autoEmpowerAccum','lumen','shards','buffUntil','buffMult','passiveDps'
          ].forEach(function(key){
            if(a[key]!==b[key]) diff[key]={direct:a[key],chunked:b[key]};
          });
          Object.keys(a.candidates||{}).forEach(function(key){
            var av=(a.candidates||{})[key], bv=(b.candidates||{})[key];
            if(av!==bv){
              if(!diff.candidates) diff.candidates={};
              diff.candidates[key]={direct:av,chunked:bv};
            }
          });
          Object.keys(a.heroResource||{}).forEach(function(id){
            var av=(a.heroResource||{})[id]||0, bv=(b.heroResource||{})[id]||0;
            if(av!==bv){
              if(!diff.heroResource) diff.heroResource={};
              diff.heroResource[id]={direct:av,chunked:bv};
            }
          });
          if(JSON.stringify(a.spirits)!==JSON.stringify(b.spirits)){
            diff.spirits={direct:a.spirits,chunked:b.spirits};
          }
          if(JSON.stringify(a.activeStudies)!==JSON.stringify(b.activeStudies)){
            diff.activeStudies={direct:a.activeStudies,chunked:b.activeStudies};
          }
          return diff;
        }

        var eventCount = Math.max(directEvents.length,chunkEvents.length);
        var previousMatchingEvent = null;
        var firstLogicalTimeDivergence = null;
        for(var eventIndex=0;eventIndex<eventCount;eventIndex++){
          var directEvent = directEvents[eventIndex];
          var chunkEvent = chunkEvents[eventIndex];
          if(
            !firstLogicalTimeDivergence &&
            directEvent && chunkEvent &&
            directEvent.logicalElapsedSec!==chunkEvent.logicalElapsedSec
          ){
            firstLogicalTimeDivergence={
              index:eventIndex,
              direct:directEvent.logicalElapsedSec,
              chunked:chunkEvent.logicalElapsedSec,
              delta:directEvent.logicalElapsedSec-chunkEvent.logicalElapsedSec
            };
          }
          var eventDiff = eventStateDifference(directEvent,chunkEvent);
          if(Object.keys(eventDiff).length){
            firstEventDivergence={
              index:eventIndex,
              previous:previousMatchingEvent,
              direct:directEvent||null,
              chunked:chunkEvent||null,
              diff:eventDiff,
              firstLogicalTimeDivergence:firstLogicalTimeDivergence
            };
            break;
          }
          previousMatchingEvent={direct:directEvent,chunked:chunkEvent};
        }
        if(!firstEventDivergence && firstLogicalTimeDivergence){
          firstEventDivergence={stateMatched:true,firstLogicalTimeDivergence:firstLogicalTimeDivergence};
        }
      }

      error.message += ' | diagnostics=' + JSON.stringify({
        reference:{
          enemyHp:reference.state.enemyHp,
          clockEndMs:reference.summary.clockEndMs,
          autoTapAccum:reference.state._autoTapAccum||0,
          autoEmpowerAccum:reference.state._autoEmpowerAccum||0,
          heroResource:reference.state.heroResource,
          passiveDps:refDiag.passiveDps,
          sustainedDps:refDiag.sustainedDps,
          abilityCycleSec:refDiag.abilityCycleSec
        },
        direct:{
          enemyHp:direct.state.enemyHp,
          clockEndMs:direct.summary.clockEndMs,
          autoTapAccum:direct.state._autoTapAccum||0,
          autoEmpowerAccum:direct.state._autoEmpowerAccum||0,
          heroResource:direct.state.heroResource,
          passiveDps:directDiag.passiveDps,
          sustainedDps:directDiag.sustainedDps,
          abilityCycleSec:directDiag.abilityCycleSec
        },
        boundaryProbes:boundaryDiagnostics,
        firstCheckpointDivergence:firstCheckpointDivergence,
        firstEventDivergence:firstEventDivergence
      });
      throw error;
    }
    return {baseline:baseline,reference:reference,direct:direct};
  }

  function cloneJson(value){ return JSON.parse(JSON.stringify(value)); }
  function firstTimelineEvent(result,type){
    return (result.timeline||[]).find(function(event){ return event.type===type; }) || null;
  }
  function timelineEventsNear(result,elapsedSec,epsilon){
    epsilon = epsilon===undefined ? 1e-6 : epsilon;
    return (result.timeline||[]).filter(function(event){
      return Math.abs(event.elapsedSec-elapsedSec)<=epsilon;
    });
  }
  function assertChronologicalSplit(baseline,totalSec,eventSec,direct,label){
    assert(eventSec>0 && eventSec<totalSec,label+' split event must be strictly inside the simulated window');
    var chronologyBridge = window.__lumenfallQaBridge;
    chronologyBridge.setState(baseline);
    var first = chronologyBridge.simulate(eventSec,'offline',eventSec,PARITY_CLOCK_MS);
    var second = chronologyBridge.simulate(
      totalSec-eventSec,
      'offline',
      totalSec-eventSec,
      PARITY_CLOCK_MS+eventSec*1000
    );
    assertProtectedParity(second.state,direct.state,label+' split/reference');
    return {first:first,second:second};
  }
  function timelineTypes(result){
    return (result.timeline||[]).map(function(event){ return event.type; });
  }
  function consumedOfflineEvents(trace){
    return (trace||[]).filter(function(event){
      return event.type==='offline' && event.detail && event.detail.result && event.detail.result.effectiveSec>0;
    });
  }
  function assertOfflineExactlyOnce(trace,expectedSec,label){
    var consumed = consumedOfflineEvents(trace);
    assert(consumed.length===1,label+' must consume exactly one offline window, got '+consumed.length);
    parityApprox(consumed[0].detail.result.effectiveSec,expectedSec,label+' effective offline seconds');
    parityApprox(consumed[0].detail.result.elapsedSec,expectedSec,label+' elapsed offline seconds');
    return consumed[0];
  }
  function assertLifecycleState(actual,expected,label){
    var actualComparable = cloneJson(actual);
    var expectedComparable = cloneJson(expected);
    function sortedTrueMap(value){
      var out = {};
      Object.keys(value||{}).sort().forEach(function(key){ if(value[key]) out[key]=true; });
      return out;
    }
    actualComparable.achieved = sortedTrueMap(actualComparable.achieved);
    expectedComparable.achieved = sortedTrueMap(expectedComparable.achieved);
    assertProtectedParity(actualComparable,expectedComparable,label);
    ['researchQueue','studyQueue','owned','questIds','questClaimed'].forEach(function(key){
      assertJsonEqual(actual[key],expected[key],label+' '+key);
    });
    parityApprox(actual.totalOfflineSeconds,expected.totalOfflineSeconds,label+' totalOfflineSeconds');
    parityApprox(actual.lastSeen,expected.lastSeen,label+' lastSeen');
    assert(actual.schemaVersion===1,label+' must preserve save schema v1');
  }
  function expectedLifecycleState(baseline,seconds,startMs){
    var preview = window.__lumenfallQaBridge.previewOffline(baseline,seconds,startMs);
    preview.state.totalOfflineSeconds = baseline.totalOfflineSeconds + seconds;
    preview.state.lastSeen = startMs + seconds*1000;
    return preview;
  }
  function assertResumeOrdering(trace,startMs,endMs,label){
    var hideSave = trace.findIndex(function(event){
      return event.type==='save' && event.nowMs===startMs && event.detail && event.detail.hidden===true;
    });
    var daily = trace.findIndex(function(event){ return event.type==='daily' && event.nowMs===endMs; });
    var offline = trace.findIndex(function(event){
      return event.type==='offline' && event.nowMs===endMs && event.detail && event.detail.result;
    });
    var resumeSave = trace.findIndex(function(event){
      return event.type==='save' && event.nowMs===endMs && event.detail && event.detail.hidden===false;
    });
    assert(hideSave!==-1,label+' must save on background');
    assert(daily>hideSave,label+' daily check must occur after background save');
    assert(offline>daily,label+' offline simulation must occur after daily check');
    assert(resumeSave>offline,label+' resume save must occur after offline simulation');
  }
  function runResumeWindow(seconds,label){
    var lifecycleBridge = window.__lumenfallQaBridge;
    var startMs = lifecycleBridge.clockNow();
    var baseline = state();
    assert(
      Math.abs(baseline.lastSeen-startMs)<=1,
      label+' must start with lastSeen owned by the current foreground timestamp'
    );
    var expected = expectedLifecycleState(baseline,seconds,startMs);
    lifecycleBridge.clearLifecycleTrace();
    lifecycleBridge.dispatchVisibility(true);
    lifecycleBridge.advanceTime(seconds*1000);
    var endMs = lifecycleBridge.clockNow();
    lifecycleBridge.dispatchVisibility(false);
    var actual = state();
    assertLifecycleState(actual,expected.state,label);
    var trace = lifecycleBridge.lifecycleTrace();
    assertOfflineExactlyOnce(trace,seconds,label);
    assertResumeOrdering(trace,startMs,endMs,label);

    var beforeDuplicate = cloneJson(actual);
    lifecycleBridge.dispatchVisibility(false);
    var afterDuplicate = state();
    assertLifecycleState(afterDuplicate,beforeDuplicate,label+' duplicate visible signal');
    assertOfflineExactlyOnce(lifecycleBridge.lifecycleTrace(),seconds,label+' duplicate visible signal');

    return {
      startMs:startMs,
      endMs:endMs,
      baseline:baseline,
      expected:expected,
      actual:actual,
      trace:lifecycleBridge.lifecycleTrace()
    };
  }
  var FORMULA_WISP_IDS = ['ember','tide','stone','gale','thorn','void','aurora','titan'];
  function cleanFormulaState(activeIds){
    var out = cloneJson(state());
    out.lumen = 0;
    out.shards = 0;
    out.motes = 0;
    out.sigils = 0;
    out.depth = 100;
    out.maxDepthEver = 120;
    out.riftMode = 'push';
    out.farmDepth = 0;
    out.farmReturnDepth = 0;
    out.enemyDepth = 100;
    out.enemyHp = 1;
    out.enemyMaxHp = 1;
    out.enemyIsLuminous = false;
    out.luminousAccum = 0;
    out.activeParty = activeIds.slice();
    FORMULA_WISP_IDS.forEach(function(id){
      out.spirits[id] = activeIds.indexOf(id)!==-1 ? 10 : 0;
      out.heroRarity[id] = 0;
      out.heroResource[id] = 0;
      out.wispModules[id] = 0;
      out.wispUltimate[id] = false;
      out.empowerQueue[id] = false;
    });
    Object.keys(out.nodes).forEach(function(id){ out.nodes[id]=0; });
    Object.keys(out.research).forEach(function(id){ out.research[id]=0; });
    Object.keys(out.researchQueue).forEach(function(id){ out.researchQueue[id]=false; });
    Object.keys(out.longStudyLevels).forEach(function(id){ out.longStudyLevels[id]=0; });
    Object.keys(out.studyQueue).forEach(function(id){ out.studyQueue[id]=false; });
    out.activeStudies = [];
    out.achieved = {};
    out.owned = {};
    out.ascendCount = 0;
    out.totalTaps = 0;
    out.totalKills = 0;
    out.buffUntil = 0;
    out.buffMult = 1;
    out._autoTapAccum = 0;
    out._autoEmpowerAccum = 0;
    return out;
  }
  function formulaSnapshotFor(snapshot,id,depth,buffMult){
    var formulaBridge = window.__lumenfallQaBridge;
    formulaBridge.setState(snapshot);
    return formulaBridge.wispFormulaSnapshot(id,depth,buffMult);
  }

  function assertFresh(s){
    assert(s.depth===1,'fresh depth must be 1');
    assert(s.maxDepthEver===1,'fresh maxDepthEver must be 1');
    assert(s.riftMode==='push','fresh game must be in Push mode');
    assert(s.activeParty.length===1 && s.activeParty[0]==='ember','fresh party must contain only Ember');
    assert(s.spirits.ember===1,'fresh Ember level must be 1');
    assert(s.enemyDepth===1,'fresh enemy must belong to Rift 1');
    assert(s.schemaVersion===1,'fresh state must use current save schema');
    assert(s.activeFormationPreset==='push' && s.formationPresets.push.join(',')==='ember','fresh formation preset defaults must preserve Ember without a schema bump');
  }
  function run(){
    var bridge = window.__lumenfallQaBridge;
    if(!bridge || !bridge.getState){ finish('fail','test bridge unavailable'); return; }
    try{
      var s = state();
      if(ctx.scenario==='layout-p2-07a-reconstruction'){
        bridge.freeze();
        window.runP207LayoutQa(bridge,ctx,assert).then(function(detail){finish('pass',detail);},function(error){finish('fail',error.message);});
        return;
      }
      if(ctx.scenario.startsWith('layout-') || ctx.scenario==='self-test-layout-collapse'){
        bridge.freeze();
        window.runRiftLayoutQa(bridge,ctx,assert).then(function(detail){ finish('pass',detail); },function(error){ finish('fail',error.message); });
        return;
      }
      if(ctx.scenario==='buff-timing'){
        bridge.freeze();finish('pass',window.runBuffTimingQa(bridge,ctx,assert,assertProtectedParity));return;
      }
      if(ctx.scenario==='buff-save-reload'){
        bridge.freeze();window.runBuffSaveQa(bridge,ctx,assert,assertProtectedParity,phase,nextPhase,finish);return;
      }
      if(ctx.scenario.startsWith('forge-')){
        bridge.freeze();
        if(['forge-save-reload','forge-backup-restore','forge-recovery'].includes(ctx.scenario)){
          window.runForgePersistence(bridge,ctx,assert,phase,nextPhase,backupCode,finish);return;
        }
        finish('pass',window.runForgeQa(bridge,ctx,assert,assertProtectedParity,assertSummaryParity,parityApprox));return;
      }
      switch(ctx.scenario){
        case 'p2-07a-persistence-review':
          bridge.freeze();
          finish('pass',window.runP207PersistenceReview(bridge,ctx,assert));
          return;
        case 'p2-07a-formation-reconstruction':
          bridge.freeze();
          finish('pass',window.runP207FormationQa(bridge,ctx,assert,assertProtectedParity));
          return;
        case 'p2-07a-chronology':
          bridge.freeze();
          finish('pass',window.runP207ChronologyQa(bridge,ctx,assert,assertProtectedParity,assertSummaryParity));
          return;
        case 'p2-07a-persist-reset':
          bridge.freeze();
          if(phase()===0){bridge.setState(window.p207Contradictory(bridge));bridge.feedbackSave();nextPhase(1);bridge.reset();return;}
          assertFresh(s);assert(s.formationRebuild===null,'Reset clears pending intent');
          assert(bridge.formationTest.canonical(s).formationRebuild===null,'Reset cannot resurrect intent');
          finish('pass',{reset:true,intent:null});return;
        case 'p2-07a-persist-save-reload':
        case 'p2-07a-persist-backup-restore':
        case 'p2-07a-persist-recovery':
        case 'p2-07a-save-reload':
        case 'p2-07a-backup-restore':
        case 'p2-07a-recovery': {
          bridge.freeze();
          if(phase()===0){
            var target=window.p207Seed(bridge,['void','tide','stone'],'boss');
            bridge.setState(target);bridge.ascendManual();
            var pending=state();pending.lumen=60;bridge.setState(pending);bridge.formationTest.buy('tide');
            if(ctx.scenario.indexOf('p2-07a-persist-')===0) bridge.setState(window.p207Contradictory(bridge));
            // Isolate persistence from the legitimate first-login daily reward.
            var sameDay=state();sameDay.questDay=ctx.currentDay();sameDay.loginStreak=1;bridge.setState(sameDay);
            bridge.feedbackSave();
            var expected=state();
            localStorage.setItem('p207-expected',JSON.stringify(expected));
            nextPhase(1);
            if(ctx.scenario.endsWith('backup-restore')){
              bridge.setState(bridge.freshStateSnapshot());
              bridge.restoreBackup(backupCode(expected));
            }else{
              if(ctx.scenario.endsWith('recovery')) bridge.formationTest.corruptPrimary();
              bridge.suppressUnloadSave();location.reload();
            }
            return;
          }
          var expected=JSON.parse(localStorage.getItem('p207-expected'));
          ['formationRebuild','activeParty','formationPresets','spirits','empowerQueue','lumen','shards','prisms','comets','motes','sigils','heroResource'].forEach(function(key){assertJsonEqual(state()[key],expected[key],ctx.scenario+' '+key);});
          assert(state().schemaVersion===1,'partial reconstruction remains schema-v1');
          assertJsonEqual(JSON.parse(bridge.rawRecovery()).formationRebuild,expected.formationRebuild,'recovery intent');
          finish('pass',{intent:state().formationRebuild,active:state().activeParty});return;
        }
        case 'r3-destinations':
        case 'self-test-r3-shortcut':
          bridge.freeze();
          finish('pass',window.runR3DestinationsQa(bridge,ctx,assert));return;
        case 'r3-save-reload':
          bridge.freeze();bridge.resetFeedback();
          if(phase()===0){
            window.prepareR3Reload(bridge,ctx,assert);
            bridge.feedbackSave();
            localStorage.setItem('r3-expected',bridge.rawSave());
            nextPhase(1);bridge.suppressUnloadSave();location.reload();return;
          }
          finish('pass',window.checkR3Reload(bridge,ctx,assert,JSON.parse(localStorage.getItem('r3-expected'))));return;
        case 'research-duration':
        case 'research-duration-reduced-motion':
        case 'self-test-research-duration-days':
        case 'self-test-research-duration-seconds':
          bridge.freeze();
          finish('pass',window.runResearchDurationQa(bridge,ctx,assert));
          return;
        case 'p2-06b-live-feedback':
        case 'p2-06b-reduced-motion':
          bridge.freeze();
          finish('pass',window.runP206FeedbackQa(bridge,ctx,assert));
          return;
        case 'fresh-load':
          assertFresh(s);
          assert(Array.isArray(s.questIds),'fresh questIds must be an array');
          finish('pass',{depth:s.depth,enemyDepth:s.enemyDepth});
          return;

        case 'midgame-load':
          assert(s.depth===17 && s.maxDepthEver===17,'mid-game depth must load intact');
          assert(s.lumen===12500 && s.shards===420,'mid-game currencies must load intact');
          assert(s.activeParty.join(',')==='ember,tide,stone','mid-game active party must load intact');
          assert(s.schemaVersion===1,'current-version fixture must remain schema 1');
          assert(typeof s.research.focus==='number','missing research entries must be normalized');
          assert(s.enemyDepth===17 && s.enemyHp>0,'mid-game enemy must be restored/spawned at the saved depth');
          bridge.save();
          assert(JSON.parse(bridge.rawSave()).schemaVersion===1,'current save must serialize schema version');
          assert(JSON.parse(bridge.rawRecovery()).schemaVersion===1,'successful save must refresh bounded recovery');
          finish('pass',{depth:s.depth,party:s.activeParty});
          return;

        case 'mature-load':
          assert(s.depth===95 && s.maxDepthEver===120,'mature progression depth must load intact');
          assert(s.activeParty.length===5,'mature party must keep five active Wisps');
          assert(s.spirits.titan===42 && s.heroRarity.ember===5,'mature Wisp progression must load intact');
          assert(s.heroRarity.void===5 && s.heroRarity.titan===3,'existing high Rarity progression must not be reduced by future pacing');
          assert(s.wispModules.ember===20 && s.wispModules.void===20 && s.wispModules.titan===9,'existing Module progression must not be reduced by future costs');
          assert(s.research.focus===24 && s.longStudyLevels.wispascend===9,'mature Lab progression must load intact');
          assert(s.owned.autoascend===true && s.autoAscendEnabled===true,'mature automation flags must load intact');
          assert(s.comets===850 && s.sigils===210,'existing mature Comet/Sigil balances must load intact');
          assert(s.owned.autoascend && s.owned.offline24 && s.owned.offline48 && s.owned.rememberbulk,'all existing Rest Stop purchases must remain owned');
          assert(s.sigilResonanceUses===0 && s.dailyQuestRefreshes===0,'older schema-v1 saves must safely default new utility counters to zero');
          assert(s.ascendRewardedDepth===0,'existing schema-v1 saves without a benchmark must safely default to 0');
          assert(s.activeFormationPreset==='push' && s.formationPresets.push.join(',')===s.activeParty.join(','),'older schema-v1 saves must seed presets from their current Formation');
          finish('pass',{depth:s.depth,maxDepthEver:s.maxDepthEver,comets:s.comets,sigils:s.sigils,ascendRewardedDepth:s.ascendRewardedDepth});
          return;

        case 'legacy-load':
          assert(s.depth===22,'legacy depth must load');
          assert(!Object.prototype.hasOwnProperty.call(s,'labQueueOn'),'legacy labQueueOn must be migrated away');
          assert(!Object.prototype.hasOwnProperty.call(s,'activeStudy'),'legacy activeStudy must be migrated away');
          assert(s.activeStudies.length===1 && s.activeStudies[0].id==='wispascend','legacy activeStudy must migrate into activeStudies');
          assert(['focus','sense','formation','resolve','charge'].every(function(id){return s.researchQueue[id]===true;}),'legacy global queue preserves five original ON choices');
          assert(['arcanecal','conduction','luminoustracking'].every(function(id){return s.researchQueue[id]===false;}),'legacy global queue does not activate new IDs');
          assert(Object.keys(s.studyQueue).every(function(id){ return s.studyQueue[id]===true; }),'legacy autostudy flag must migrate to studyQueue');
          assert(s.autoAscendEnabled===true && s.autoAscendTargetDepth>=22,'legacy auto-ascend ownership must migrate to enabled target');
          assert(!Object.prototype.hasOwnProperty.call(s.owned,'autostudy'),'legacy owned.autostudy must be removed');
          assert(s.schemaVersion===1,'legacy save must migrate to current schema');
          assert(JSON.parse(bridge.rawSave()).schemaVersion===1,'migrated legacy save must round-trip as current schema');
          finish('pass',{activeStudies:s.activeStudies.length,autoAscendTargetDepth:s.autoAscendTargetDepth,schemaVersion:s.schemaVersion});
          return;

        case 'corrupted-load': {
          assertFresh(s);
          var corruptRaw = bridge.rawSave();
          assert(bridge.persistenceStatus().blocked===true,'corrupt primary without recovery must block destructive autosave');
          bridge.save();
          assert(bridge.rawSave()===corruptRaw,'blocked corrupt primary must be preserved instead of overwritten');
          finish('pass',{fallback:'fresh',blocked:true});
          return;
        }

        case 'malformed-daily-load':
          assert(Array.isArray(s.questIds),'malformed questIds must normalize to an array');
          assert(s.lumen===0,'negative Lumen must normalize to zero');
          assert(s.shards===0,'non-numeric Shards must normalize to zero');
          assert(s.activeParty.join(',')==='ember,tide','invalid/duplicate party entries must be removed');
          assert(s.activeStudies.length===1 && s.activeStudies[0].id==='wispascend','invalid active studies must be removed while valid study survives');
          assert(s.heroRarity.ember===5 && s.heroRarity.tide===0,'rarity values must clamp to known bounds');
          assert(s.heroResource.ember===100 && s.heroResource.tide===0,'Wisp resource values must clamp to 0..100');
          assert(s.wispModules.ember===20 && s.wispModules.tide===0,'module levels must clamp to module bounds');
          assert(s.wispUltimate.ember===false && s.wispUltimate.tide===false,'invalid/impossible Ultimate flags must normalize');
          assert(s.nodes.starlight===0 && s.nodes.steady===0,'malformed node levels must normalize');
          assert(s.research.focus===0 && s.research.sense===0,'malformed research levels must normalize');
          assert(s.questIds.join(',')==='q_tap_small','quest IDs must be known and unique');
          assert(s.dailyStats.taps===0 && s.dailyStats.kills===0 && s.dailyStats.unknown===undefined,'daily stats must normalize to known metrics');
          assert(s.savedLabMultiplier===1,'invalid remembered Lab multiplier must normalize');
          assert(s.autoAscendEnabled===false,'non-boolean Auto-Ascend flag must not be trusted');
          finish('pass',{questIds:s.questIds,party:s.activeParty});
          return;

        case 'farm-load':
          assert(s.riftMode==='farm','Farm fixture must stay in Farm mode');
          assert(s.farmReturnDepth===27,'Farm return point must be preserved');
          assert(s.farmDepth===26 && s.depth===26,'Farm depth must normalize from the return point');
          finish('pass',{farmDepth:s.farmDepth,returnDepth:s.farmReturnDepth});
          return;

        case 'farm-roundtrip':
          if(phase()===0){
            assert(s.riftMode==='push' && s.depth===17,'roundtrip must start at Push Rift 17');
            bridge.enterFarm();
            s=state();
            assert(s.riftMode==='farm' && s.farmReturnDepth===17 && s.farmDepth===16 && s.depth===16,'Push -> Farm must preserve Rift 17 as return point');
            nextPhase(1); location.reload(); return;
          }
          if(phase()===1){
            assert(s.riftMode==='farm' && s.depth===16 && s.farmReturnDepth===17,'Farm state must survive reload');
            bridge.enterPush();
            s=state();
            assert(s.riftMode==='push' && s.depth===17,'Push must return to preserved Rift 17');
            assert(s.farmDepth===0 && s.farmReturnDepth===0,'Push return must clear Farm bookkeeping');
            nextPhase(2); location.reload(); return;
          }
          assert(s.riftMode==='push' && s.depth===17 && s.farmReturnDepth===0,'returned Push state must survive reload');
          finish('pass',{depth:s.depth,mode:s.riftMode});
          return;

        case 'enemy-normal-reload': {
          var ratio = s.enemyHp/s.enemyMaxHp;
          assert(s.depth===17 && s.enemyDepth===17,'damaged normal enemy must stay on Rift 17');
          approx(ratio,0.25,0.0005,'damaged normal enemy HP ratio must be restored');
          if(phase()===0){ bridge.save(); nextPhase(1); location.reload(); return; }
          approx(state().enemyHp/state().enemyMaxHp,0.25,0.0005,'normal enemy HP ratio must survive save -> reload');
          finish('pass',{ratio:state().enemyHp/state().enemyMaxHp});
          return;
        }

        case 'enemy-boss-reload': {
          var bossRatio = s.enemyHp/s.enemyMaxHp;
          assert(s.depth===20 && s.enemyDepth===20,'damaged boss must stay on Rift 20');
          approx(bossRatio,0.40,0.0005,'damaged boss HP ratio must be restored');
          assert(s.enemyIsLuminous===false,'boss must never restore as Luminous');
          if(phase()===0){ bridge.save(); nextPhase(1); location.reload(); return; }
          s=state();
          approx(s.enemyHp/s.enemyMaxHp,0.40,0.0005,'boss HP ratio must survive save -> reload');
          assert(s.enemyIsLuminous===false,'boss must remain non-Luminous after reload');
          finish('pass',{ratio:s.enemyHp/s.enemyMaxHp});
          return;
        }

        case 'active-studies-load':
          assert(s.activeStudies.length===2,'two valid active Long Studies must load');
          assert(s.activeStudies[0].id==='wispascend' && s.activeStudies[0].remainingSec===90,'Wisp Ascendancy progress must persist');
          assert(s.activeStudies[1].id==='shardstudy' && s.activeStudies[1].speedMult===2,'Shard Study speed tier must persist');
          finish('pass',{activeStudies:s.activeStudies});
          return;

        case 'auto-ascend-load':
          assert(s.owned.autoascend===true,'Auto-Ascend unlock must load');
          assert(s.autoAscendEnabled===true,'Auto-Ascend enabled flag must load');
          assert(s.autoAscendTargetDepth===30,'Auto-Ascend target must load');
          assert(s.depth===22,'fixture must stay below Auto-Ascend target during load test');
          finish('pass',{depth:s.depth,target:s.autoAscendTargetDepth});
          return;

        case 'reset-roundtrip':
          if(phase()===0){
            assert(s.depth===17 && s.lumen===12500,'reset test must start from non-fresh state');
            assert(bridge.rawRecovery()!==null,'normal save must have a bounded recovery copy before reset');
            nextPhase(1); bridge.reset(); return;
          }
          if(phase()===1){
            assertFresh(s);
            assert(bridge.rawRecovery()===null,'reset boot must clear old recovery before fresh save');
            assert(localStorage.getItem('lumenfall_reset_pending_v1')==='1','reset pending marker must survive into fresh boot until fresh state is saved');
            bridge.save();
            assert(localStorage.getItem('lumenfall_reset_pending_v1')===null,'fresh save must clear reset pending marker');
            nextPhase(2); location.reload(); return;
          }
          assertFresh(s);
          assert(localStorage.getItem('lumenfall_reset_pending_v1')===null,'reset marker must stay cleared after subsequent reload');
          assert(JSON.parse(bridge.rawRecovery()).depth===1,'intentional reset must replace recovery with fresh progression, never resurrect old state');
          finish('pass',{depth:s.depth,reset:'durable'});
          return;

        case 'restore-roundtrip':
          if(phase()===0){
            assert(s.depth===17 && s.lumen===12500,'restore test must start from the original save');
            var target = ctx.fixtures['restore-target'].save;
            nextPhase(1); bridge.restoreBackup(backupCode(target)); return;
          }
          assert(s.depth===33 && s.maxDepthEver===44,'restored progression must be authoritative after reload');
          assert(s.lumen===777777 && s.prisms===31,'restored currencies must replace original state');
          assert(s.activeParty.join(',')==='ember,void','restored party must replace original party');
          assert(s.schemaVersion===1,'current backup restore must remain on current schema');
          assert(JSON.parse(bridge.rawRecovery()).depth===33,'successful Restore must establish restored state in recovery slot');
          finish('pass',{depth:s.depth,lumen:s.lumen,schemaVersion:s.schemaVersion});
          return;

        case 'malformed-backup-rejection': {
          var before = bridge.rawSave();
          bridge.restoreBackup('LUMENFALL1:%7B%22depth%22%3A5%7D');
          var after = bridge.rawSave();
          assert(before===after,'malformed backup must not replace authoritative save');
          assert(bridge.getFlags().reloadInProgress===false,'malformed backup must not enter reload mode');
          assert(state().depth===17,'malformed backup must leave in-memory state unchanged');
          finish('pass',{rejected:true});
          return;
        }

        case 'recovery-from-corrupt-primary': {
          assert(s.depth===17 && s.lumen===12500,'valid recovery must replace malformed primary in memory');
          assert(bridge.persistenceStatus().recovered===true,'recovery path must be observable');
          var repairedPrimary = JSON.parse(bridge.rawSave());
          var goodRecovery = JSON.parse(bridge.rawRecovery());
          assert(repairedPrimary.schemaVersion===1 && repairedPrimary.depth===17,'malformed primary must be repaired from validated recovery');
          assert(goodRecovery.schemaVersion===1 && goodRecovery.depth===17,'good recovery must never be overwritten by malformed primary');
          finish('pass',{recovered:true,depth:s.depth});
          return;
        }

        case 'unsupported-future-load': {
          assertFresh(s);
          var futureRaw = bridge.rawSave();
          assert(JSON.parse(futureRaw).schemaVersion===99,'future schema fixture must remain intact');
          assert(bridge.persistenceStatus().blocked===true,'future schema must block destructive persistence');
          bridge.save();
          assert(bridge.rawSave()===futureRaw,'future schema primary must not be rewritten as current');
          finish('pass',{blocked:true,futureSchema:99});
          return;
        }

        case 'legacy-backup-restore':
          if(phase()===0){
            var legacyTarget = ctx.fixtures['legacy'].save;
            nextPhase(1); bridge.restoreBackup(backupCode(legacyTarget)); return;
          }
          assert(s.schemaVersion===1,'legacy backup must migrate to current schema before acceptance');
          assert(s.depth===22 && s.activeStudies.length===1,'legacy backup progression and migrated study must restore');
          assert(JSON.parse(bridge.rawRecovery()).schemaVersion===1,'legacy restore must establish current-schema recovery');
          finish('pass',{schemaVersion:s.schemaVersion,depth:s.depth});
          return;

        case 'future-backup-rejection': {
          var beforeFuture = bridge.rawSave();
          bridge.restoreBackup(backupCode(ctx.fixtures['future-schema'].save));
          assert(bridge.rawSave()===beforeFuture,'unsupported future backup must not replace authoritative save');
          assert(bridge.getFlags().reloadInProgress===false,'future backup rejection must not enter reload mode');
          finish('pass',{rejectedFuture:true});
          return;
        }

        case 'recovery-offline-once': {
          var snapKey = ctx.phaseKey + '_offline_seconds';
          if(phase()===0){
            assert(bridge.persistenceStatus().recovered===true,'offline recovery scenario must use recovery');
            assert(s.totalOfflineSeconds>=55,'recovered save must receive its pending offline interval once');
            localStorage.setItem(snapKey,String(s.totalOfflineSeconds));
            nextPhase(1); location.reload(); return;
          }
          var firstOffline = Number(localStorage.getItem(snapKey));
          assert(Math.abs(s.totalOfflineSeconds-firstOffline)<1,'reloading repaired recovery must not duplicate offline progression');
          finish('pass',{offlineSeconds:s.totalOfflineSeconds});
          return;
        }

        case 'save-failure-warning': {
          var originalSetItem = Storage.prototype.setItem;
          Storage.prototype.setItem = function(key,value){
            if(key==='lumenfall_save_v2' || key==='lumenfall_save_recovery_v1') throw new Error('intentional storage write failure');
            return originalSetItem.call(this,key,value);
          };
          bridge.save();
          bridge.save();
          Storage.prototype.setItem = originalSetItem;
          var persistence = bridge.persistenceStatus();
          assert(persistence.failureCount>=2,'repeated save failures must be tracked');
          assert(persistence.warningShown===true,'repeated save failures must surface one controlled warning');
          var toast = document.getElementById('toast');
          assert(toast && toast.textContent.indexOf('Saving is failing')!==-1,'save failure warning must be visible to the player');
          finish('pass',{failureCount:persistence.failureCount,warningShown:persistence.warningShown});
          return;
        }

        case 'parity-short': {
          var shortBaseline = state();
          var livePair = runParityPair(60,'live',0.1);

          bridge.setState(shortBaseline);
          var offlinePair = runParityPair(60,'offline',0.1);

          assert(livePair.direct.summary.kills===offlinePair.direct.summary.kills,'fixed-power short live/offline combat must produce identical kills');
          assert(livePair.direct.state.depth===offlinePair.direct.state.depth,'fixed-power short live/offline combat must reach identical Rift depth');
          assert(livePair.direct.state.motes===offlinePair.direct.state.motes,'Luminous/Mote cadence must be identical when combat path is identical');
          assert(livePair.direct.state.sigils===offlinePair.direct.state.sigils,'Boss/Sigil cadence must be identical when combat path is identical');

          var liveLumenGain = livePair.direct.state.lumen-shortBaseline.lumen;
          var offlineLumenGain = offlinePair.direct.state.lumen-shortBaseline.lumen;
          parityApprox(offlineLumenGain,liveLumenGain*0.70,'explicit base offline Lumen policy');
          var liveShardGain = livePair.direct.state.shards-shortBaseline.shards;
          var offlineShardGain = offlinePair.direct.state.shards-shortBaseline.shards;
          parityApprox(offlineShardGain,liveShardGain*0.70,'explicit base offline Shard policy');

          finish('pass',{
            durationSec:60,
            liveKills:livePair.direct.summary.kills,
            offlineKills:offlinePair.direct.summary.kills,
            liveWallMs:livePair.direct.wallMs,
            offlineWallMs:offlinePair.direct.wallMs,
            tolerance:{absolute:PARITY_ABS_TOL,relative:PARITY_REL_TOL}
          });
          return;
        }

        case 'p2-07a-farm-retention':
        case 'parity-medium-farm':
          bridge.freeze();
          finish('pass',window.runP207FarmReview(bridge,ctx,assert,assertProtectedParity,assertSummaryParity,ctx.scenario==='p2-07a-farm-retention'));
          return;
        case 'p2-07a-timer-boundary':
          bridge.freeze();
          finish('pass',window.runP207TimerReview(bridge,ctx,assert,assertProtectedParity,assertSummaryParity,parityApprox));
          return;

        case 'parity-long-high-power': {
          var longBaseline = state();
          var longPair = runParityPair(14400,'offline',60);
          assert(longPair.direct.summary.kills>5000,'long parity must exceed the removed 5,000-kill cutoff');
          assert(longPair.direct.summary.fastForwardedKills>0,'long parity must use bounded Farm fast-forwarding');
          assert(longPair.direct.summary.luminousKills>0 && longPair.direct.summary.motesGained>0,'long parity must preserve Luminous/Motes through fast-forward');
          assert(longPair.direct.summary.autoTaps>0 && longPair.direct.summary.empowers>0,'long parity must exercise automated combat/progression');
          assert(longPair.direct.wallMs<5000,'representative 4-hour high-power simulation must stay computationally bounded');

          bridge.setState(longBaseline);
          var repeat = bridge.simulateOfflineDirect(14400,PARITY_CLOCK_MS);
          assertProtectedParity(repeat.state,longPair.direct.state,'long deterministic repeat');
          assertSummaryParity(repeat.summary,longPair.direct.summary,'long deterministic repeat');

          finish('pass',{
            durationSec:14400,
            kills:longPair.direct.summary.kills,
            fastForwardedKills:longPair.direct.summary.fastForwardedKills,
            luminousKills:longPair.direct.summary.luminousKills,
            motes:longPair.direct.summary.motesGained,
            wallMs:longPair.direct.wallMs,
            repeatWallMs:repeat.wallMs
          });
          return;
        }

        case 'parity-boss-short': {
          var shortBoss = runParityPair(30,'offline',0.1);
          assert(shortBoss.direct.summary.retreats===0,'beatable Boss must not retreat merely because the offline window is short');
          assert(shortBoss.direct.state.riftMode==='push' && shortBoss.direct.state.depth===20,'short Boss window must remain at the Push Boss');
          assert(shortBoss.direct.state.enemyHp>0 && shortBoss.direct.state.enemyHp<shortBoss.direct.state.enemyMaxHp,'short Boss window must preserve partial Boss damage');
          finish('pass',{
            durationSec:30,
            enemyHp:shortBoss.direct.state.enemyHp,
            enemyMaxHp:shortBoss.direct.state.enemyMaxHp,
            retreats:shortBoss.direct.summary.retreats
          });
          return;
        }

        case 'parity-boss-retry': {
          var retryPair = runParityPair(720,'offline',0.1);
          assert(retryPair.direct.summary.retreats>=1,'unwinnable Boss must retreat to Farm');
          assert(retryPair.direct.summary.retries>=1,'Auto-Empower must permit a later Boss retry once sustained damage is positive');
          assert(retryPair.direct.summary.bossKills>=1,'retried Boss must be defeatable inside the representative window');
          assert(retryPair.direct.summary.sigilsGained>=2,'Boss retry path must preserve Sigil rewards');
          finish('pass',{
            durationSec:720,
            retreats:retryPair.direct.summary.retreats,
            retries:retryPair.direct.summary.retries,
            bossKills:retryPair.direct.summary.bossKills,
            sigils:retryPair.direct.summary.sigilsGained,
            endDepth:retryPair.direct.state.depth
          });
          return;
        }

        case 'parity-auto-ascend': {
          var ascendPair = runParityPair(60,'offline',0.1);
          assert(ascendPair.direct.summary.ascends>=1,'Auto-Ascend must fire under the current arrival-depth rule');
          assert(ascendPair.direct.state.ascendCount>ascendPair.baseline.ascendCount,'Auto-Ascend must advance persistent Ascension count');
          finish('pass',{
            durationSec:60,
            ascends:ascendPair.direct.summary.ascends,
            ascendCount:ascendPair.direct.state.ascendCount,
            endDepth:ascendPair.direct.state.depth
          });
          return;
        }

        case 'chronology-research-mid-window': {
          var researchBaseline = state();
          var researchDirect = bridge.simulateTimeline(60,'offline',PARITY_CLOCK_MS);
          var researchEvent = firstTimelineEvent(researchDirect,'research');
          assert(researchEvent,'queued Research must be purchased during the offline window');
          assert(researchEvent.elapsedSec>0 && researchEvent.elapsedSec<60,'Research purchase must occur mid-window');
          assert(researchDirect.state.research.formation===1,'Formation Research must advance exactly one level in this fixture');
          var researchSplit = assertChronologicalSplit(
            researchBaseline,60,researchEvent.elapsedSec,researchDirect,
            'mid-window Research'
          );
          assert(researchSplit.first.state.research.formation===1,'Research must already be applied at its affordability timestamp');

          var researchControl = cloneJson(researchBaseline);
          researchControl.researchQueue.formation = false;
          bridge.setState(researchControl);
          var researchWithoutQueue = bridge.simulateTimeline(60,'offline',PARITY_CLOCK_MS);
          assert(
            researchDirect.state.totalKills>researchWithoutQueue.state.totalKills,
            'mid-window Formation Research must affect combat during the remaining offline time'
          );
          finish('pass',{
            eventSec:researchEvent.elapsedSec,
            formationLevel:researchDirect.state.research.formation,
            killsWithResearch:researchDirect.state.totalKills-researchBaseline.totalKills,
            killsWithoutResearch:researchWithoutQueue.state.totalKills-researchControl.totalKills
          });
          return;
        }

        case 'chronology-study-mid-window': {
          var studyBaseline = state();
          var studyDirect = bridge.simulateTimeline(60,'offline',PARITY_CLOCK_MS);
          var completion = firstTimelineEvent(studyDirect,'studyComplete');
          var studyStart = firstTimelineEvent(studyDirect,'studyStart');
          assert(completion && studyStart,'Study completion must free a slot and start the queued Study');
          parityApprox(completion.elapsedSec,10,'Wisp Ascendancy completion timestamp');
          parityApprox(studyStart.elapsedSec,completion.elapsedSec,'queued Study start timestamp');
          var sameStudyTime = timelineEventsNear(studyDirect,completion.elapsedSec);
          var studyTypes = sameStudyTime.map(function(event){ return event.type; });
          assert(
            studyTypes.indexOf('studyComplete')!==-1 &&
            studyTypes.indexOf('studyStart')>studyTypes.indexOf('studyComplete'),
            'Study completion must be ordered before queued Study start at the same timestamp'
          );
          assert(studyDirect.state.longStudyLevels.wispascend===1,'Wisp Ascendancy must complete mid-window');
          assert(
            studyDirect.state.activeStudies.some(function(active){ return active.id==='guardmastery'; }),
            'Guardian Mastery must start when the Study slot opens'
          );
          assertChronologicalSplit(studyBaseline,60,completion.elapsedSec,studyDirect,'mid-window Long Study');

          var studyControl = cloneJson(studyBaseline);
          studyControl.activeStudies[0].remainingSec = 1000;
          studyControl.activeStudies[0].totalDurationSec = 1000;
          bridge.setState(studyControl);
          var studyWithoutCompletion = bridge.simulateTimeline(60,'offline',PARITY_CLOCK_MS);
          assert(
            studyDirect.state.totalKills>studyWithoutCompletion.state.totalKills,
            'completed Wisp Ascendancy must increase combat for the remainder of the same window'
          );
          finish('pass',{
            completionSec:completion.elapsedSec,
            startedStudy:studyStart.detail && studyStart.detail.ids,
            killsWithCompletion:studyDirect.state.totalKills-studyBaseline.totalKills,
            killsWithoutCompletion:studyWithoutCompletion.state.totalKills-studyControl.totalKills
          });
          return;
        }

        case 'chronology-auto-empower-mid-window': {
          var empowerBaseline = state();
          var empowerDirect = bridge.simulateTimeline(120,'offline',PARITY_CLOCK_MS);
          var empowerEvent = firstTimelineEvent(empowerDirect,'autoEmpower');
          assert(empowerEvent,'Auto-Empower must purchase after Farm income makes a level affordable');
          assert(empowerEvent.elapsedSec>0 && empowerEvent.elapsedSec<120,'Auto-Empower purchase must occur mid-window');
          assert(empowerDirect.state.spirits.ember>1,'Auto-Empower must increase Ember level');
          var empowerSplit = assertChronologicalSplit(
            empowerBaseline,120,empowerEvent.elapsedSec,empowerDirect,
            'mid-window Auto-Empower'
          );
          assert(empowerSplit.first.state.spirits.ember>1,'Empower must be applied at its scheduled trigger timestamp');

          var empowerControl = cloneJson(empowerBaseline);
          empowerControl.achieved.labmaster = false;
          bridge.setState(empowerControl);
          var empowerDisabled = bridge.simulateTimeline(120,'offline',PARITY_CLOCK_MS);
          assert(
            empowerDirect.state.totalKills>empowerDisabled.state.totalKills,
            'chronological Auto-Empower must improve later combat in the same window'
          );
          finish('pass',{
            firstEmpowerSec:empowerEvent.elapsedSec,
            finalEmberLevel:empowerDirect.state.spirits.ember,
            killsWithEmpower:empowerDirect.state.totalKills-empowerBaseline.totalKills,
            killsWithoutEmpower:empowerDisabled.state.totalKills-empowerControl.totalKills
          });
          return;
        }

        case 'chronology-auto-ascend-mid-window': {
          var ascendBaseline = state();
          var ascendDirect = bridge.simulateTimeline(30,'offline',PARITY_CLOCK_MS);
          var ascendEvent = firstTimelineEvent(ascendDirect,'autoAscend');
          assert(ascendEvent,'Auto-Ascend must occur when the current target rule becomes satisfied');
          assert(ascendEvent.elapsedSec>0 && ascendEvent.elapsedSec<30,'Auto-Ascend must occur mid-window');
          assert(ascendDirect.state.ascendCount===ascendBaseline.ascendCount+1,'fixture must perform exactly one Auto-Ascend');
          var ascendSplit = assertChronologicalSplit(
            ascendBaseline,30,ascendEvent.elapsedSec,ascendDirect,
            'mid-window Auto-Ascend'
          );
          assert(
            ascendDirect.state.totalKills>ascendSplit.first.state.totalKills,
            'offline simulation must continue from the post-Ascend state for the remaining time'
          );
          finish('pass',{
            ascendSec:ascendEvent.elapsedSec,
            ascendCount:ascendDirect.state.ascendCount,
            killsAtAscend:ascendSplit.first.state.totalKills,
            finalKills:ascendDirect.state.totalKills
          });
          return;
        }

        case 'chronology-boss-retry': {
          var bossBaseline = state();
          var bossDirect = bridge.simulateTimeline(720,'offline',PARITY_CLOCK_MS);
          var retreatEvent = firstTimelineEvent(bossDirect,'bossRetreat');
          var bossEmpowerEvent = firstTimelineEvent(bossDirect,'autoEmpower');
          var retryEvent = firstTimelineEvent(bossDirect,'bossRetry');
          assert(retreatEvent && bossEmpowerEvent && retryEvent,'Boss chronology must include retreat, progression gain and retry');
          parityApprox(retreatEvent.elapsedSec,bridge.bossRetreatGraceSec(),'unwinnable Boss retreat grace timestamp');
          assert(
            bossEmpowerEvent.elapsedSec>retreatEvent.elapsedSec &&
            retryEvent.elapsedSec>=bossEmpowerEvent.elapsedSec,
            'Boss retry must happen only after chronological power progression'
          );
          assert(bossDirect.summary.bossKills>=1,'retried Boss must be defeated inside the fixture window');
          assert(bossDirect.summary.sigilsGained>=2,'retried Boss must preserve Sigil rewards');
          assertChronologicalSplit(bossBaseline,720,retryEvent.elapsedSec,bossDirect,'Boss retreat/progression/retry');
          finish('pass',{
            retreatSec:retreatEvent.elapsedSec,
            firstEmpowerSec:bossEmpowerEvent.elapsedSec,
            retrySec:retryEvent.elapsedSec,
            bossKills:bossDirect.summary.bossKills,
            sigils:bossDirect.summary.sigilsGained
          });
          return;
        }

        case 'chronology-simultaneous-order': {
          var simultaneousDirect = bridge.simulateTimeline(7,'offline',PARITY_CLOCK_MS);
          var researchAtBoundary = firstTimelineEvent(simultaneousDirect,'research');
          var completionAtBoundary = firstTimelineEvent(simultaneousDirect,'studyComplete');
          assert(researchAtBoundary && completionAtBoundary,'fixture must exercise Research and Study completion near the same timestamp');
          assert(
            Math.abs(researchAtBoundary.elapsedSec-completionAtBoundary.elapsedSec)<=1e-6,
            'Research and Study completion must resolve at the same effective timestamp'
          );
          var boundaryEvents = timelineEventsNear(simultaneousDirect,researchAtBoundary.elapsedSec,1e-6);
          var boundaryTypes = boundaryEvents.map(function(event){ return event.type; });
          ['ability','autoTap','autoEmpower','research','studyComplete'].forEach(function(type){
            assert(boundaryTypes.indexOf(type)!==-1,'simultaneous fixture must include '+type+' at the shared boundary');
          });
          assert(
            boundaryTypes.indexOf('ability') < boundaryTypes.indexOf('autoTap') &&
            boundaryTypes.indexOf('autoTap') < boundaryTypes.indexOf('autoEmpower') &&
            boundaryTypes.indexOf('autoEmpower') < boundaryTypes.indexOf('research') &&
            boundaryTypes.indexOf('research') < boundaryTypes.indexOf('studyComplete'),
            'same-timestamp order must be ability -> Auto-Tap -> Auto-Empower -> Research -> Study completion'
          );
          finish('pass',{
            boundarySec:researchAtBoundary.elapsedSec,
            order:boundaryTypes
          });
          return;
        }

        case 'lifecycle-background-resume': {
          var resume = runResumeWindow(30,'background/resume');
          assert(resume.actual.totalKills>resume.baseline.totalKills,'background/resume must advance combat');
          assert(resume.actual.lumen>resume.baseline.lumen,'background/resume must advance offline economy');
          assert(resume.actual.lastSeen===resume.endMs,'resume save must own the consumed window endpoint');
          finish('pass',{
            elapsedSec:30,
            kills:resume.actual.totalKills-resume.baseline.totalKills,
            lumen:resume.actual.lumen-resume.baseline.lumen,
            offlineApplications:consumedOfflineEvents(resume.trace).length,
            lastSeen:resume.actual.lastSeen
          });
          return;
        }

        case 'lifecycle-repeated-resume': {
          var windows = [15,25,40];
          var initialOffline = s.totalOfflineSeconds;
          var previousLastSeen = s.lastSeen;
          var cycleDetails = [];
          windows.forEach(function(seconds,index){
            var cycle = runResumeWindow(seconds,'resume cycle '+(index+1));
            assert(cycle.actual.lastSeen>previousLastSeen,'resume cycle timestamps must be monotonic');
            previousLastSeen = cycle.actual.lastSeen;
            cycleDetails.push({
              seconds:seconds,
              kills:cycle.actual.totalKills-cycle.baseline.totalKills,
              lastSeen:cycle.actual.lastSeen
            });
          });
          s=state();
          parityApprox(
            s.totalOfflineSeconds,
            initialOffline+windows.reduce(function(sum,value){ return sum+value; },0),
            'repeated resume total offline seconds'
          );
          finish('pass',{cycles:cycleDetails,totalOfflineSeconds:s.totalOfflineSeconds});
          return;
        }

        case 'lifecycle-cold-restart': {
          var coldKey = 'lumenfall_qa_expected_'+ctx.scenario;
          if(phase()===0){
            var coldStart = bridge.clockNow();
            var coldExpected = expectedLifecycleState(s,45,coldStart);
            localStorage.setItem(coldKey,JSON.stringify(coldExpected));
            bridge.save();
            bridge.advanceTime(45000);
            nextPhase(1);
            bridge.suppressUnloadSave();
            location.reload();
            return;
          }
          var expectedCold = JSON.parse(localStorage.getItem(coldKey));
          assert(expectedCold && expectedCold.state,'cold restart expected snapshot must persist across reload');
          assertLifecycleState(state(),expectedCold.state,'cold restart');
          var coldTrace = bridge.lifecycleTrace();
          assertOfflineExactlyOnce(coldTrace,45,'cold restart');
          var coldDailyIndex = coldTrace.findIndex(function(event){ return event.type==='daily'; });
          var coldOfflineIndex = coldTrace.findIndex(function(event){ return event.type==='offline' && event.detail && event.detail.result; });
          var coldSaveIndex = coldTrace.findIndex(function(event){ return event.type==='save' && event.nowMs===bridge.clockNow(); });
          assert(coldDailyIndex!==-1 && coldOfflineIndex>coldDailyIndex && coldSaveIndex>coldOfflineIndex,'cold-start order must be daily -> offline -> save');
          var beforeColdVisible = cloneJson(state());
          bridge.dispatchVisibility(false);
          assertLifecycleState(state(),beforeColdVisible,'cold restart stray visible signal');
          assertOfflineExactlyOnce(bridge.lifecycleTrace(),45,'cold restart stray visible signal');
          assert(JSON.parse(bridge.rawSave()).schemaVersion===1,'cold restart must preserve canonical primary schema');
          assert(JSON.parse(bridge.rawRecovery()).schemaVersion===1,'cold restart must preserve bounded recovery schema');
          finish('pass',{
            elapsedSec:45,
            offlineApplications:consumedOfflineEvents(bridge.lifecycleTrace()).length,
            totalOfflineSeconds:state().totalOfflineSeconds,
            lastSeen:state().lastSeen
          });
          return;
        }

        case 'lifecycle-partial-enemy': {
          var partial = runResumeWindow(6,'partial enemy resume');
          assert(partial.baseline.enemyDepth===3 && partial.baseline.enemyHp<partial.baseline.enemyMaxHp,'partial fixture must begin with damaged enemy');
          assert(partial.expected.summary.kills===1,'partial fixture must kill exactly the damaged enemy once');
          assert(partial.actual.totalKills===partial.baseline.totalKills+1,'damaged enemy reward/death must occur exactly once');
          assert(partial.actual.enemyDepth===partial.expected.state.enemyDepth,'next enemy depth must match authoritative simulation');
          assert(partial.actual.enemyHp>0 && partial.actual.enemyHp<partial.actual.enemyMaxHp,'offline remainder must continue into the deterministic next enemy');
          parityApprox(
            partial.actual.lumen-partial.baseline.lumen,
            partial.expected.state.lumen-partial.baseline.lumen,
            'partial enemy reward'
          );
          finish('pass',{
            startHp:partial.baseline.enemyHp,
            endDepth:partial.actual.enemyDepth,
            endHp:partial.actual.enemyHp,
            kills:partial.actual.totalKills-partial.baseline.totalKills
          });
          return;
        }

        case 'lifecycle-boss-background-short': {
          var shortBossLife = runResumeWindow(30,'short Boss background intent');
          assert(shortBossLife.baseline.riftMode==='push' && shortBossLife.baseline.depth===20,'short Boss fixture must begin on Push Boss 20');
          assert(shortBossLife.expected.summary.retreats===0,'short Boss background must not retreat');
          assert(shortBossLife.actual.riftMode==='push','short screen-off must preserve Push mode');
          assert(shortBossLife.actual.depth===20 && shortBossLife.actual.enemyDepth===20,'short screen-off must preserve Boss intent');
          assert(shortBossLife.actual.farmReturnDepth===0,'short screen-off must not create a hidden Farm return point');
          finish('pass',{
            elapsedSec:30,
            mode:shortBossLife.actual.riftMode,
            depth:shortBossLife.actual.depth,
            retreats:shortBossLife.expected.summary.retreats,
            offlineApplications:consumedOfflineEvents(shortBossLife.trace).length
          });
          return;
        }

        case 'lifecycle-boss-retry': {
          var bossLife = runResumeWindow(720,'boss retreat/Farm/retry lifecycle');
          var retreat = firstTimelineEvent(bossLife.expected,'bossRetreat');
          var retry = firstTimelineEvent(bossLife.expected,'bossRetry');
          assert(retreat && retry,'lifecycle Boss reference must retreat and retry');
          parityApprox(retreat.elapsedSec,bridge.bossRetreatGraceSec(),'Boss lifecycle retreat grace');
          assert(bossLife.expected.summary.retreats===1,'Boss lifecycle fixture must retreat exactly once');
          assert(bossLife.expected.summary.retries>=1,'Boss lifecycle fixture must retry after Farm progression');
          assert(bossLife.expected.summary.bossKills>=1,'Boss lifecycle fixture must defeat the retried Boss');
          assert(
            bossLife.actual.sigils-bossLife.baseline.sigils===bossLife.expected.summary.sigilsGained,
            'Boss Sigils must be awarded exactly once'
          );
          assert(
            bossLife.actual.totalKills-bossLife.baseline.totalKills===bossLife.expected.summary.kills,
            'Farm and Boss kills must match the authoritative offline window exactly'
          );
          finish('pass',{
            retreatSec:retreat.elapsedSec,
            retrySec:retry.elapsedSec,
            bossKills:bossLife.expected.summary.bossKills,
            farmAndBossKills:bossLife.expected.summary.kills,
            sigils:bossLife.expected.summary.sigilsGained
          });
          return;
        }

        case 'lifecycle-auto-ascend': {
          var ascendLife = runResumeWindow(30,'Auto-Ascend offline lifecycle');
          var ascendEvent = firstTimelineEvent(ascendLife.expected,'autoAscend');
          assert(ascendEvent && ascendEvent.elapsedSec>0 && ascendEvent.elapsedSec<30,'Auto-Ascend must occur chronologically inside the offline window');
          assert(ascendLife.expected.summary.ascends===1,'Auto-Ascend fixture must ascend exactly once');
          assert(ascendLife.actual.ascendCount===ascendLife.baseline.ascendCount+1,'resume must apply exactly one Ascend');
          assert(ascendLife.actual.prisms===ascendLife.expected.state.prisms,'Ascend reward must not duplicate');
          assert(
            ascendLife.actual.totalKills>ascendLife.baseline.totalKills,
            'remaining offline time must continue from the post-Ascend state'
          );
          finish('pass',{
            ascendSec:ascendEvent.elapsedSec,
            ascendCount:ascendLife.actual.ascendCount,
            prisms:ascendLife.actual.prisms,
            finalDepth:ascendLife.actual.depth
          });
          return;
        }

        case 'lifecycle-long-study': {
          var studyKey = 'lumenfall_qa_expected_'+ctx.scenario;
          if(phase()===0){
            var studyStartMs = bridge.clockNow();
            var studyExpected = expectedLifecycleState(s,60,studyStartMs);
            localStorage.setItem(studyKey,JSON.stringify(studyExpected));
            bridge.save();
            bridge.advanceTime(60000);
            nextPhase(1);
            bridge.suppressUnloadSave();
            location.reload();
            return;
          }
          var expectedStudy = JSON.parse(localStorage.getItem(studyKey));
          assertLifecycleState(state(),expectedStudy.state,'Long Study cold restart');
          assertOfflineExactlyOnce(bridge.lifecycleTrace(),60,'Long Study cold restart');
          var completion = firstTimelineEvent(expectedStudy,'studyComplete');
          var queuedStart = firstTimelineEvent(expectedStudy,'studyStart');
          assert(completion && queuedStart,'Long Study lifecycle must complete and start the queued Study');
          parityApprox(completion.elapsedSec,10,'Long Study lifecycle completion time');
          parityApprox(queuedStart.elapsedSec,completion.elapsedSec,'queued Study start time');
          assert(state().longStudyLevels.wispascend===1,'completed Long Study effect must apply once');
          assert(
            state().activeStudies.some(function(active){ return active.id==='guardmastery'; }),
            'next queued Study must survive/restart through the cold lifecycle'
          );
          var studyBeforeVisible = cloneJson(state());
          bridge.dispatchVisibility(false);
          assertLifecycleState(state(),studyBeforeVisible,'Long Study duplicate visible signal');
          finish('pass',{
            completionSec:completion.elapsedSec,
            started:queuedStart.detail && queuedStart.detail.ids,
            level:state().longStudyLevels.wispascend
          });
          return;
        }

        case 'lifecycle-lab-queue': {
          var labKey = 'lumenfall_qa_expected_'+ctx.scenario;
          if(phase()===0){
            var labStartMs = bridge.clockNow();
            var labExpected = expectedLifecycleState(s,60,labStartMs);
            localStorage.setItem(labKey,JSON.stringify(labExpected));
            bridge.save();
            bridge.advanceTime(60000);
            nextPhase(1);
            bridge.suppressUnloadSave();
            location.reload();
            return;
          }
          var expectedLab = JSON.parse(localStorage.getItem(labKey));
          assertLifecycleState(state(),expectedLab.state,'Lab queue cold restart');
          assertOfflineExactlyOnce(bridge.lifecycleTrace(),60,'Lab queue cold restart');
          var researchEvent = firstTimelineEvent(expectedLab,'research');
          assert(researchEvent && researchEvent.elapsedSec>0 && researchEvent.elapsedSec<60,'queued Research must purchase chronologically during cold offline time');
          assert(state().research.formation===1,'queued Formation Research must purchase exactly once');
          assert(state().researchQueue.formation===true,'Research queue enablement must survive save/reload');
          parityApprox(state().lumen,expectedLab.state.lumen,'Research lifecycle Lumen spending');
          parityApprox(state().shards,expectedLab.state.shards,'Research lifecycle Shard spending');
          var labBeforeVisible = cloneJson(state());
          bridge.dispatchVisibility(false);
          assertLifecycleState(state(),labBeforeVisible,'Lab queue duplicate visible signal');
          finish('pass',{
            purchaseSec:researchEvent.elapsedSec,
            formationLevel:state().research.formation,
            lumen:state().lumen,
            shards:state().shards
          });
          return;
        }

        case 'lifecycle-daily-rollover': {
          var dailyStateKey = 'lumenfall_qa_daily_'+ctx.scenario;
          if(phase()===0){
            var day0 = bridge.currentDay();
            var startComets = s.comets;
            assert(s.questDay===day0 && s.loginStreak===3,'daily fixture must begin on its seeded day/streak');
            bridge.clearLifecycleTrace();
            bridge.dispatchVisibility(true);
            bridge.advanceTime(20000);
            bridge.dispatchVisibility(false);
            var afterFirstDay = state();
            var day1 = bridge.currentDay();
            assert(day1!==day0,'deterministic clock must cross a local day boundary');
            assert(afterFirstDay.questDay===day1,'daily rollover must claim the new day exactly once');
            assert(afterFirstDay.loginStreak===4,'daily streak must advance exactly once');
            assert(afterFirstDay.comets===startComets+16,'Day 4 login reward must apply exactly once');
            assert(Object.keys(afterFirstDay.questClaimed).length===0,'daily claimed quests must reset on rollover');
            assert(afterFirstDay.questIds.length===3,'daily rollover must select three eligible quests');
            var firstDailyRolls = bridge.lifecycleTrace().filter(function(event){
              return event.type==='daily' && event.detail && event.detail.rolled;
            });
            assert(firstDailyRolls.length===1,'first daily boundary must roll exactly once');
            assertOfflineExactlyOnce(bridge.lifecycleTrace(),20,'first daily rollover offline window');

            var firstSnapshot = cloneJson(afterFirstDay);
            bridge.dispatchVisibility(false);
            assertLifecycleState(state(),firstSnapshot,'same-day duplicate visible after daily rollover');
            assert(state().comets===startComets+16 && state().loginStreak===4,'duplicate visible must not duplicate daily reward');

            localStorage.setItem(dailyStateKey,JSON.stringify({
              day:day1,
              comets:state().comets,
              streak:state().loginStreak
            }));
            bridge.save();
            nextPhase(1);
            location.reload();
            return;
          }

          var persistedDaily = JSON.parse(localStorage.getItem(dailyStateKey));
          assert(state().questDay===persistedDaily.day,'same-day reload must keep the rolled quest day');
          assert(state().comets===persistedDaily.comets,'same-day reload must not repeat login reward');
          assert(state().loginStreak===persistedDaily.streak,'same-day reload must not advance streak again');
          var initDailyRolls = bridge.lifecycleTrace().filter(function(event){
            return event.type==='daily' && event.detail && event.detail.rolled;
          });
          assert(initDailyRolls.length===0,'same-day cold reload must not roll daily state again');
          assert(consumedOfflineEvents(bridge.lifecycleTrace()).length===0,'same-time cold reload must not consume another offline window');

          bridge.setLocalClock(2035,0,16,23,59,50);
          bridge.save();
          bridge.clearLifecycleTrace();
          var beforeSecondBoundary = state();
          bridge.dispatchVisibility(true);
          bridge.advanceTime(20000);
          bridge.dispatchVisibility(false);
          var afterSecondBoundary = state();
          assert(afterSecondBoundary.questDay===bridge.currentDay(),'second deterministic boundary must update quest day');
          assert(afterSecondBoundary.loginStreak===beforeSecondBoundary.loginStreak+1,'next real day must advance streak once');
          assert(afterSecondBoundary.comets===beforeSecondBoundary.comets+20,'Day 5 login reward must apply once');
          var secondDailyRolls = bridge.lifecycleTrace().filter(function(event){
            return event.type==='daily' && event.detail && event.detail.rolled;
          });
          assert(secondDailyRolls.length===1,'second daily boundary must roll exactly once');
          assertOfflineExactlyOnce(bridge.lifecycleTrace(),20,'second daily rollover offline window');
          var secondSnapshot = cloneJson(afterSecondBoundary);
          bridge.dispatchVisibility(false);
          assertLifecycleState(state(),secondSnapshot,'second daily duplicate visible');
          assert(state().comets===secondSnapshot.comets,'second daily duplicate visible must not repeat reward');
          finish('pass',{
            firstDay:persistedDaily.day,
            secondDay:afterSecondBoundary.questDay,
            streak:afterSecondBoundary.loginStreak,
            comets:afterSecondBoundary.comets
          });
          return;
        }

        case 'wisp-formula-contract': {
          var formulaBase = cleanFormulaState(['ember']);
          var emberBase = formulaSnapshotFor(formulaBase,'ember',10,1);
          parityApprox(emberBase.wispPower,10.9,'Ember Wisp Power level curve');
          parityApprox(emberBase.passiveDps,emberBase.wispPower,'base passive Wisp damage');
          parityApprox(emberBase.abilityDamage,emberBase.wispPower*5,'base DPS ability damage');
          parityApprox(emberBase.guardianTap,5+emberBase.effectivePartyPower*0.02,'Guardian Tap Wisp-power contribution');

          var rarityState = cloneJson(formulaBase);
          rarityState.heroRarity.ember = 1;
          var emberRare = formulaSnapshotFor(rarityState,'ember',10,1);
          parityApprox(emberRare.wispPower,emberBase.wispPower*1.5,'Rarity must multiply Wisp Power');
          parityApprox(emberRare.abilityDamage,emberBase.abilityDamage*1.5,'Rarity must multiply damaging ability output');
          parityApprox(emberRare.passiveDps,emberBase.passiveDps*1.5*1.02,'Rarity must affect passive damage plus +2% collection synergy');

          var moduleState = cloneJson(formulaBase);
          moduleState.wispModules.ember = 10;
          var emberModule = formulaSnapshotFor(moduleState,'ember',10,1);
          parityApprox(emberModule.passiveDps,emberBase.passiveDps,'DPS Module must not change passive damage');
          parityApprox(emberModule.abilityDamage,emberBase.abilityDamage*1.5,'DPS Module must change ability damage only');

          var ultimateState = cloneJson(formulaBase);
          ultimateState.heroRarity.ember = 5;
          ultimateState.spirits.ember = 40;
          ultimateState.wispUltimate.ember = true;
          var ultimateOffState = cloneJson(ultimateState);
          ultimateOffState.wispUltimate.ember = false;
          var emberUltOff = formulaSnapshotFor(ultimateOffState,'ember',10,1);
          var emberUltOn = formulaSnapshotFor(ultimateState,'ember',10,1);
          parityApprox(emberUltOn.passiveDps,emberUltOff.passiveDps,'Ultimate must not change passive damage');
          parityApprox(emberUltOn.abilityDamage,emberUltOff.abilityDamage*2,'DPS Ultimate must double ability damage');

          var formationTrainingState = cloneJson(formulaBase);
          formationTrainingState.research.formation = 1;
          var formationTraining = formulaSnapshotFor(formationTrainingState,'ember',10,1);
          parityApprox(formationTraining.passiveDps,emberBase.passiveDps*1.05,'Formation Training passive-only scaling');
          parityApprox(formationTraining.abilityDamage,emberBase.abilityDamage,'Formation Training must not scale ability damage');
          assert(formationTraining.guardianTap>emberBase.guardianTap,'Formation Training must raise the Wisp-powered part of Guardian Tap');

          var ascendancyState = cloneJson(formulaBase);
          ascendancyState.longStudyLevels.wispascend = 1;
          var ascendancy = formulaSnapshotFor(ascendancyState,'ember',10,1);
          parityApprox(ascendancy.passiveDps,emberBase.passiveDps*1.15,'Wisp Ascendancy passive-only scaling');
          parityApprox(ascendancy.abilityDamage,emberBase.abilityDamage,'Wisp Ascendancy must not scale ability damage');

          var starcallerState = cleanFormulaState(['ember','void']);
          var starcaller = formulaSnapshotFor(starcallerState,'ember',10,1);
          parityApprox(starcaller.formationDamageMult,1.18,'Starcaller damage Bond');
          parityApprox(
            starcaller.passiveDps,
            starcaller.totalActivePartyPower*1.18,
            'Starcaller must scale passive Wisp damage'
          );
          var starcallerBroken = cleanFormulaState(['ember']);
          var emberNoBond = formulaSnapshotFor(starcallerBroken,'ember',10,1);
          parityApprox(starcaller.abilityDamage,emberNoBond.abilityDamage*1.18,'Starcaller must scale damaging abilities');

          var duskguardState = cleanFormulaState(['stone','titan']);
          var stoneBoss = formulaSnapshotFor(duskguardState,'stone',20,1);
          parityApprox(stoneBoss.formationDamageMult,1.35,'Duskguard Boss damage Bond');

          var pathfinderState = cleanFormulaState(['gale','thorn']);
          var galeNormal = formulaSnapshotFor(pathfinderState,'gale',19,1);
          parityApprox(galeNormal.formationDamageMult,1.20,'Pathfinder non-Boss damage Bond');

          var supportBaseState = cleanFormulaState(['tide']);
          supportBaseState.spirits.tide = 40;
          supportBaseState.heroRarity.tide = 5;
          supportBaseState.wispModules.tide = 20;
          bridge.setState(supportBaseState);
          var tideSupport = bridge.wispFormulaSnapshot('tide',100,1);
          assert(tideSupport.supportProfile.strength===1.25 && tideSupport.supportProfile.durationMs===4000,'Support strength/duration must ignore Wisp Power, Rarity and Module');
          var supportTrigger = bridge.triggerAbilityFor('tide','live',PARITY_CLOCK_MS);
          assert(supportTrigger.after.buffMult===1.25,'Support ability must apply +25% passive/Tap buff');
          assert(supportTrigger.after.buffUntil===PARITY_CLOCK_MS+4000,'Support ability must last 4 seconds without Ultimate');

          var supportUltState = cloneJson(supportBaseState);
          supportUltState.wispUltimate.tide = true;
          bridge.setState(supportUltState);
          var tideUltimate = bridge.wispFormulaSnapshot('tide',100,1);
          assert(tideUltimate.supportProfile.strength===1.5 && tideUltimate.supportProfile.durationMs===8000,'Support Ultimate must become +50% for 8 seconds');
          var supportUltTrigger = bridge.triggerAbilityFor('tide','live',PARITY_CLOCK_MS);
          assert(supportUltTrigger.after.buffMult===1.5 && supportUltTrigger.after.buffUntil===PARITY_CLOCK_MS+8000,'Support Ultimate runtime effect');

          var rewardState = cleanFormulaState(['gale','thorn','tide','aurora']);
          rewardState.wispModules.gale = 10;
          rewardState.wispModules.thorn = 10;
          rewardState.heroRarity.gale = 1;
          rewardState.heroRarity.thorn = 1;
          rewardState.heroRarity.tide = 1;
          rewardState.heroRarity.aurora = 1;
          rewardState.spirits.gale = 10;
          rewardState.spirits.thorn = 10;
          rewardState.spirits.tide = 10;
          rewardState.spirits.aurora = 10;
          rewardState.wispUltimate.gale = false;
          rewardState.wispUltimate.thorn = false;
          var galeReward = formulaSnapshotFor(rewardState,'gale',100,1);
          var thornReward = formulaSnapshotFor(rewardState,'thorn',100,1);
          assert(galeReward.formationRewardMult===1.25,'Dawnpriest must apply +25% Formation reward multiplier');
          parityApprox(
            galeReward.abilityReward.shards,
            Math.round(galeReward.wispPower*0.05*1.5*1.25),
            'Gale Module/Dawnpriest Shard ability reward'
          );
          parityApprox(
            thornReward.abilityReward.lumen,
            Math.round(thornReward.wispPower*0.10*1.5*1.25),
            'Thorn Module/Dawnpriest Lumen ability reward'
          );

          var rewardUltState = cloneJson(rewardState);
          rewardUltState.heroRarity.gale = 5;
          rewardUltState.heroRarity.thorn = 5;
          rewardUltState.spirits.gale = 40;
          rewardUltState.spirits.thorn = 40;
          rewardUltState.wispUltimate.gale = true;
          rewardUltState.wispUltimate.thorn = true;
          var rewardUltGale = formulaSnapshotFor(rewardUltState,'gale',100,1);
          var rewardUltThorn = formulaSnapshotFor(rewardUltState,'thorn',100,1);
          parityApprox(
            rewardUltGale.abilityReward.shards,
            Math.round(rewardUltGale.wispPower*0.05*1.5*2*1.25),
            'Gale Ultimate must double Shard ability output'
          );
          parityApprox(
            rewardUltThorn.abilityReward.lumen,
            Math.round(rewardUltThorn.wispPower*0.10*1.5*2*1.25),
            'Thorn Ultimate must double Lumen ability output'
          );

          var moteNoModuleState = cleanFormulaState(['tide']);
          moteNoModuleState.spirits.tide = 40;
          moteNoModuleState.heroRarity.tide = 5;
          var moteNoModule = formulaSnapshotFor(moteNoModuleState,'tide',50,1);
          var moteModuleState = cloneJson(moteNoModuleState);
          moteModuleState.wispModules.tide = 10;
          var moteModule = formulaSnapshotFor(moteModuleState,'tide',50,1);
          assert(moteNoModule.supportMoteBonus===0,'Support Module baseline Mote bonus');
          parityApprox(moteModule.supportMoteBonus,0.5,'Support Module must add +5% Motes per level');
          assert(moteModule.moteReward>moteNoModule.moteReward,'Support Module must increase Luminous Mote reward');

          var tapState = cleanFormulaState(['ember']);
          tapState.nodes.steady = 1;
          tapState.research.resolve = 1;
          tapState.longStudyLevels.guardmastery = 1;
          var tapNormal = formulaSnapshotFor(tapState,'ember',10,1);
          parityApprox(
            tapNormal.guardianTap,
            (5+tapNormal.effectivePartyPower*0.02)*1.08*1.10*1.20,
            'Guardian Tap specific upgrade stack'
          );
          var tapSupport = formulaSnapshotFor(tapState,'ember',10,1.25);
          parityApprox(tapSupport.guardianTap,tapNormal.guardianTap*1.25,'Support buff must scale Guardian Tap');

          var tapGuardianBoss = formulaSnapshotFor(tapState,'ember',30,1);
          parityApprox(tapGuardianBoss.bossTapMult,3,'Guardian Mark boss Tap multiplier');
          parityApprox(tapGuardianBoss.guardianTap,tapNormal.guardianTap*3,'Guardian Mark must triple Guardian Tap');

          var abilityRegrowth = formulaSnapshotFor(formulaBase,'ember',10,1);
          var abilityFractured = formulaSnapshotFor(formulaBase,'ember',20,1);
          parityApprox(abilityFractured.bossAbilityMult,1.75,'Fractured Core boss ability multiplier');
          parityApprox(abilityFractured.abilityDamage,abilityRegrowth.abilityDamage*1.75,'Fractured Core must boost Wisp ability hits only');

          var autoTapState = cleanFormulaState(['ember']);
          autoTapState.depth = 30;
          autoTapState.enemyDepth = 30;
          autoTapState.maxDepthEver = 120;
          autoTapState.achieved.autotap = true;
          autoTapState.ascendCount = 12;
          bridge.setState(autoTapState);
          var expectedAutoTap = bridge.wispFormulaSnapshot('ember',30,1).guardianTap;
          var autoTap = bridge.autoTapOnce(PARITY_CLOCK_MS);
          parityApprox(autoTap.damage,expectedAutoTap,'Auto-Tap must use the same Guardian Tap formula');
          assert(autoTap.processed===1 && autoTap.summary.autoTaps===1,'Auto-Tap must process exactly one automated hit');

          var languageState = cleanFormulaState(['ember','tide','void']);
          languageState.depth = 20;
          languageState.enemyDepth = 20;
          languageState.maxDepthEver = 120;
          bridge.setState(languageState);
          var language = bridge.renderGameplayLanguage();
          assert(language.wisps.indexOf('Wisp Power')!==-1,'Wisp cards must label the canonical Wisp Power stat');
          assert(language.wisps.indexOf('Boosts passive Wisp damage and Guardian Tap')!==-1,'Support card wording must name its actual targets');
          assert(language.encyclopedia.indexOf('Ability Output')!==-1 && language.encyclopedia.indexOf('Guardian Tap')!==-1,'Encyclopedia must expose canonical output terms');
          assert(language.boss.indexOf('combat DPS')!==-1,'Boss status must describe sustained combat DPS rather than generic power');

          finish('pass',{
            baseWispPower:emberBase.wispPower,
            rarityAbility:emberRare.abilityDamage,
            moduleAbility:emberModule.abilityDamage,
            supportBase:tideSupport.supportProfile,
            supportUltimate:tideUltimate.supportProfile,
            galeShards:rewardUltGale.abilityReward.shards,
            thornLumen:rewardUltThorn.abilityReward.lumen,
            guardianTap:tapNormal.guardianTap,
            guardianBossTap:tapGuardianBoss.guardianTap
          });
          return;
        }

        case 'p1-05-accessibility-baseline': {
          var accessibilityAudit = window.P105AccessibilityQa.runAudit(bridge,ctx,assert);
          finish('pass',accessibilityAudit);
          return;
        }

        case 'p1-05-accessibility-contract': {
          var accessibilityContract = window.P105AccessibilityQa.runAcceptance(bridge,ctx,assert);
          finish('pass',accessibilityContract);
          return;
        }

        case 'p1-05-control-regressions': {
          finish('pass',window.runP105ControlQa(bridge,ctx,assert));
          return;
        }

        case 'p1-05-reduced-motion': {
          var reducedMotion = window.P105AccessibilityQa.runReducedMotion(bridge,ctx,assert);
          finish('pass',reducedMotion);
          return;
        }

        case 'self-test-p1-05-selected':
          window.P105AccessibilityQa.negativeSelected(assert);
          finish('pass',{unexpected:'selected semantics regression was not detected'});
          return;

        case 'self-test-p1-05-focus-return':
          window.P105AccessibilityQa.negativeFocusReturn(assert);
          finish('pass',{unexpected:'focus-return regression was not detected'});
          return;

        case 'p2-03a-wisp-role-integrity': {
          var catalog=bridge.wispRoleContract();
          var expectedRoles={
            ember:'Burst',tide:'Amplifier',stone:'Breaker',gale:'Shard Utility',
            thorn:'Lumen Utility',void:'Burst',aurora:'Amplifier',titan:'Breaker'
          };
          var expectedTypes={
            ember:'dps',tide:'support',stone:'breaker',gale:'ranged',
            thorn:'druid',void:'dps',aurora:'support',titan:'breaker'
          };
          catalog.forEach(function(entry){
            assert(entry.role===expectedRoles[entry.id],entry.id+' must advertise its authoritative role identity');
            assert(entry.abilityType===expectedTypes[entry.id],entry.id+' ability type must match its role contract');
            var semantic=(entry.role+' '+entry.moduleName+' '+entry.description).toLowerCase();
            ['tank','aggro','threat','mitigation','armor','healing','protect allies','absorb damage'].forEach(function(term){
              assert(semantic.indexOf(term)===-1,entry.id+' role language must not claim nonexistent defensive mechanic: '+term);
            });
          });
          assert(catalog.length===8,'role contract must cover every Wisp');
          assert(Math.max.apply(null,catalog.map(function(x){return x.coefficient;}))===5,'role correction must not introduce a raw ability coefficient above the established 5x cap');

          var emberRole=catalog.find(function(x){return x.id==='ember';});
          var stoneRole=catalog.find(function(x){return x.id==='stone';});
          var galeRole=catalog.find(function(x){return x.id==='gale';});
          var thornRole=catalog.find(function(x){return x.id==='thorn';});
          var tideRole=catalog.find(function(x){return x.id==='tide';});
          assert(emberRole.coefficient===5 && emberRole.moduleEffect20==='+100% ability burst damage','Burst must retain the established highest raw ability coefficient and Module identity');
          assert(stoneRole.coefficient===4 && stoneRole.moduleEffect20==='+100% ability burst damage','Breaker must retain the former Tank 4x heavy-hit + Module mechanics exactly');
          assert(galeRole.coefficient===3 && galeRole.rewardKind==='shards','Shard Utility must be a 3x hit plus Shard generation');
          assert(thornRole.coefficient===3 && thornRole.rewardKind==='lumen','Lumen Utility must be a 3x hit plus Lumen generation');
          assert(tideRole.coefficient===0 && tideRole.abilityType==='support','Amplifier must remain a real temporary combat buff instead of direct ability damage');
          var amplifierBase=cleanFormulaState(['tide']);
          amplifierBase.spirits.tide=10;
          amplifierBase.wispUltimate.tide=false;
          var tideBaseFormula=formulaSnapshotFor(amplifierBase,'tide',19,1);
          assert(tideBaseFormula.supportProfile.strength===1.25 && tideBaseFormula.supportProfile.durationMs===4000,'Amplifier base buff must remain +25% for 4s');
          var amplifierUltimate=cloneJson(amplifierBase);
          amplifierUltimate.heroRarity.tide=5;
          amplifierUltimate.wispUltimate.tide=true;
          var tideUltFormula=formulaSnapshotFor(amplifierUltimate,'tide',19,1);
          assert(tideUltFormula.supportProfile.strength===1.5 && tideUltFormula.supportProfile.durationMs===8000,'Amplifier Ultimate must remain +50% for 8s');

          var breakerBase=cleanFormulaState(['stone']);
          breakerBase.spirits.stone=10;
          var stoneNormal=formulaSnapshotFor(breakerBase,'stone',19,1);
          parityApprox(stoneNormal.abilityDamage,stoneNormal.wispPower*4,'Breaker base hit must remain the pre-P2-03A 4x Wisp-Power formula');
          var breakerModule=cloneJson(breakerBase);
          breakerModule.wispModules.stone=10;
          var stoneModule=formulaSnapshotFor(breakerModule,'stone',19,1);
          parityApprox(stoneModule.abilityDamage,stoneNormal.abilityDamage*1.5,'Breaker Module must preserve the established +5% per level hit scaling');

          var breakerPair=cleanFormulaState(['stone','titan']);
          var stoneBossPair=formulaSnapshotFor(breakerPair,'stone',20,1);
          var breakerSolo=cleanFormulaState(['stone']);
          var stoneBossSolo=formulaSnapshotFor(breakerSolo,'stone',20,1);
          parityApprox(stoneBossPair.abilityDamage,stoneBossSolo.abilityDamage*1.35,'Stone + Titan must retain meaningful Duskguard boss utility');
          parityApprox(stoneBossPair.formationDamageMult,1.35,'Duskguard boss Bond must remain exactly +35%');

          var burstBase=cleanFormulaState(['ember']);
          var emberBurst=formulaSnapshotFor(burstBase,'ember',19,1);
          parityApprox(emberBurst.abilityDamage,emberBurst.wispPower*5,'Burst identity must remain the established 5x raw ability hit');
          assert(emberRole.coefficient>stoneRole.coefficient,'Burst and Breaker must remain mechanically distinguishable without inventing defense');

          var shardState=cleanFormulaState(['gale']);
          var galeUtility=formulaSnapshotFor(shardState,'gale',19,1);
          assert(galeUtility.abilityReward.shards>0 && galeUtility.abilityReward.lumen===0,'Gale role must map to actual Shard utility');
          var lumenState=cleanFormulaState(['thorn']);
          var thornUtility=formulaSnapshotFor(lumenState,'thorn',19,1);
          assert(thornUtility.abilityReward.lumen>0 && thornUtility.abilityReward.shards===0,'Thorn role must map to actual Lumen utility');

          var mixed=cleanFormulaState(['ember','stone']);
          var emberMixed=formulaSnapshotFor(mixed,'ember',19,1);
          var stoneMixed=formulaSnapshotFor(mixed,'stone',19,1);
          parityApprox(emberMixed.totalActivePartyPower,emberMixed.wispPower+stoneMixed.wispPower,'active-party power must remain the sum of Active Wisp Power when no Bond/global multiplier applies');

          var presetState=cloneJson(state());
          ['ember','tide','stone','gale','thorn','void','aurora','titan'].forEach(function(id){presetState.spirits[id]=Math.max(10,presetState.spirits[id]||0);});
          presetState.activeParty=['ember','void','gale','thorn','tide'];
          presetState.formationPresets={
            push:['ember','void','gale','thorn','tide'],
            farm:['tide','aurora','gale','thorn','ember'],
            boss:['ember','void','stone','titan','tide']
          };
          presetState.activeFormationPreset='push';
          bridge.setState(presetState);
          bridge.save();
          var presetRoundTrip=bridge.setState(JSON.parse(bridge.rawSave()));
          assert(JSON.stringify(presetRoundTrip.formationPresets)===JSON.stringify(presetState.formationPresets),'role correction must not alter saved Formation presets');
          assert(presetRoundTrip.activeFormationPreset==='push','role correction must preserve active Formation preset identity');

          var pushState=cleanFormulaState(presetState.formationPresets.push);
          var pushSnapshot=formulaSnapshotFor(pushState,'ember',19,1);
          parityApprox(pushSnapshot.formationDamageMult,1.18*1.20,'Push Formation must retain Starcaller + Pathfinder damage');
          assert(bridge.activeBondIds().sort().join(',')==='pathfinder,starcaller','Push Formation Bonds must remain unchanged');

          var farmState=cleanFormulaState(presetState.formationPresets.farm);
          var farmSnapshot=formulaSnapshotFor(farmState,'gale',19,1);
          parityApprox(farmSnapshot.formationDamageMult,1.20,'Farm Formation must retain Pathfinder non-Boss damage');
          parityApprox(farmSnapshot.formationRewardMult,1.25,'Farm Formation must retain Dawnpriest reward bonus');
          assert(bridge.activeBondIds().sort().join(',')==='dawnpriest,pathfinder','Farm Formation Bonds must remain unchanged');

          var bossState=cleanFormulaState(presetState.formationPresets.boss);
          var bossSnapshot=formulaSnapshotFor(bossState,'stone',20,1);
          parityApprox(bossSnapshot.formationDamageMult,1.18*1.35,'Boss Formation must retain Starcaller + Duskguard damage');
          assert(bridge.activeBondIds().sort().join(',')==='duskguard,starcaller','Boss Formation Bonds must remain unchanged');

          var liveBreaker=cloneJson(breakerBase);
          liveBreaker.depth=19;liveBreaker.enemyDepth=19;liveBreaker.enemyMaxHp=1e9;liveBreaker.enemyHp=1e9;
          bridge.setState(liveBreaker);
          var liveHit=bridge.triggerAbilityFor('stone','live',PARITY_CLOCK_MS);
          bridge.setState(liveBreaker);
          var offlineHit=bridge.triggerAbilityFor('stone','offline',PARITY_CLOCK_MS);
          parityApprox(liveHit.before.enemyHp-liveHit.after.enemyHp,offlineHit.before.enemyHp-offlineHit.after.enemyHp,'Breaker ability damage must stay coherent through live/offline authoritative paths');

          var early=bridge.freshStateSnapshot();
          bridge.setState(early);
          var earlyRun=bridge.simulate(60,'live',0.1,PARITY_CLOCK_MS);
          assert(earlyRun.summary.kills>0 && earlyRun.state.depth>1,'early progression must remain viable after role correction');

          bridge.setState(presetState);
          bridge.renderLayout();
          var language=bridge.renderGameplayLanguage();
          assert(language.wisps.indexOf('Breaker')!==-1 && language.wisps.indexOf('Burst')!==-1 && language.wisps.indexOf('Amplifier')!==-1,'Wisp UI must expose corrected role labels');
          var rendered=(language.wisps+' '+language.encyclopedia).toLowerCase();
          [' tank ','aggro','threat','mitigation','protect allies','absorb damage'].forEach(function(term){
            assert(rendered.indexOf(term)===-1,'player-facing role copy must not advertise nonexistent defense: '+term);
          });

          finish('pass',{
            roles:catalog.map(function(x){return [x.id,x.role,x.coefficient];}),
            pushMult:pushSnapshot.formationDamageMult,
            farmMult:farmSnapshot.formationDamageMult,
            farmRewardMult:farmSnapshot.formationRewardMult,
            bossMult:bossSnapshot.formationDamageMult,
            earlyKills:earlyRun.summary.kills,
            presetsPreserved:true,
            liveOfflineBreakerDamage:liveHit.before.enemyHp-liveHit.after.enemyHp
          });
          return;
        }

        case 'p2-03a-wisp-role-integrity-mature': {
          var matureState=cloneJson(state());
          assert(matureState.depth===95 && matureState.maxDepthEver===120,'mature role regression must use the canonical mature/high-power fixture');
          assert(matureState.activeParty.length===5,'mature fixture must retain its five-Wisp Formation');
          matureState.autoAscendEnabled=false;
          bridge.setState(matureState);
          var matureBefore=cloneJson(state());
          var matureRun=bridge.simulate(60,'live',0.1,PARITY_CLOCK_MS);
          assert(matureRun.summary.kills>0,'canonical mature progression must remain viable after role correction');
          assert(state().activeParty.join(',')===matureBefore.activeParty.join(','),'mature simulation must preserve the selected Formation');
          finish('pass',{depth:matureBefore.depth,kills:matureRun.summary.kills,party:matureBefore.activeParty});
          return;
        }

        case 'p2-03a-wisp-role-integrity-endgame': {
          var endgameState=cloneJson(state());
          assert(endgameState.riftMode==='farm' && endgameState.maxDepthEver===120,'endgame role regression must use the canonical high-power Farm fixture');
          endgameState.autoAscendEnabled=false;
          bridge.setState(endgameState);
          var endgameBefore=cloneJson(state());
          var endgameRun=bridge.simulate(60,'live',0.1,PARITY_CLOCK_MS);
          assert(endgameRun.summary.kills>0,'high-power Farm progression must remain viable after role correction');
          assert(state().riftMode==='farm','Farm mode must remain stable during the role-integrity check');
          assert(state().activeParty.join(',')===endgameBefore.activeParty.join(','),'endgame Farm simulation must preserve the selected Formation');
          finish('pass',{depth:endgameBefore.depth,kills:endgameRun.summary.kills,party:endgameBefore.activeParty});
          return;
        }

        case 'p2-02b-lab-hierarchy': {
          var labState=cloneJson(state());
          labState.maxDepthEver=45;labState.autoAscendEnabled=false;
          labState.lumen=1e30;labState.shards=1e30;
          var labJobs=[
            {id:'wispascend',remainingSec:600,totalDurationSec:2000,speedMult:1},
            {id:'shardstudy',remainingSec:700,totalDurationSec:2000,speedMult:2},
            {id:'guardmastery',remainingSec:800,totalDurationSec:2000,speedMult:1}
          ];
          [0,2,3].forEach(function(count){
            labState.activeStudies=labJobs.slice(0,count);
            bridge.setState(labState);bridge.renderLayout();
            var beforeLab=JSON.stringify(state());
            document.querySelector('[data-tab="battle"]').click();
            document.getElementById('rift-study-status').click();
            assert(document.activeElement===document.querySelector('[data-tab="research"]'),'Rift arrival focuses Long Studies tab');
            var status=document.querySelector('.study-slot-summary');
            assert(status===document.getElementById('study-list').firstElementChild,'occupancy leads Study content');
            assert(status.textContent.indexOf('Studies '+count+' / 3')!==-1,'slot occupancy uses authoritative count');
            assert(status.textContent.indexOf(count===3?'All slots occupied':(3-count)+' slot'+(count===2?'':'s')+' available')!==-1,'free/full slot text is explicit');
            var running=Array.from(document.querySelectorAll('[data-running-study]'));
            assert(running.length===count,'every active Study remains visible');
            if(count){
              assert(running[0].dataset.runningStudy==='shardstudy','next completion accounts for speed, without mutating queue order');
              assert(running[0].querySelector('[data-study-text]').textContent==='5m 50s remaining · 2x','remaining display preserves seconds from authoritative work divided by speed');
              var inspect=running[0].querySelector('details'),summary=inspect.querySelector('summary');
              assert(!inspect.open,'secondary speed controls begin collapsed');
              summary.focus();summary.click();bridge.renderLayout();
              inspect=document.querySelector('[data-study-inspection="shardstudy"]');
              assert(inspect.open && document.activeElement===inspect.querySelector('summary'),'inspection preserves open state and focus through rendering');
              assert(inspect.querySelectorAll('[data-speed-study]').length>0 && inspect.querySelector('.desc'),'speed controls and effect information stay reachable');
              inspect.open=false;
            }
            var choose=document.querySelector('[data-study-choose]');
            assert(!!choose===(count<3),'choose action is offered when a slot is free');
            if(choose){choose.click();assert(document.activeElement===document.getElementById('study-choices'),'choose action moves focus to existing choices');}
            if(count===3) assert(Array.from(document.querySelectorAll('[data-study]')).every(function(btn){return btn.disabled;}),'full slots preserve disabled start controls');
            assert(JSON.stringify(state())===beforeLab,'Lab inspection/navigation must not mutate gameplay');
          });
          finish('pass',{occupancy:[0,2,3],nextCompletion:'shardstudy',focus:true,stateUnchanged:true});return;
        }

        case 'p2-02b-wisp-hierarchy': {
          var beforeHierarchy=JSON.stringify(state());
          document.querySelector('[data-tab="spirits"]').click();
          var cards=Array.from(document.querySelectorAll('[data-wisp-card]'));
          var activeIds=state().activeParty;
          assert(cards.slice(0,activeIds.length).every(function(card){return activeIds.indexOf(card.dataset.wispCard)!==-1;}),'Active Wisps must precede reserve/recruitment cards');
          assert(document.querySelectorAll('.formation-member').length===activeIds.length,'current Formation must identify every Active Wisp');
          cards.forEach(function(card){
            var empower=card.querySelector('[data-empower]'),secondary=card.querySelector('.hero-ability');
            if(empower && secondary) assert(!!(empower.compareDocumentPosition(secondary)&Node.DOCUMENT_POSITION_FOLLOWING),'Empower must precede secondary progression in reading order');
          });
          var help=document.querySelector('.formation-help');
          assert(help && !help.open && help.querySelector('#bond-card'),'Bonds remain available through native disclosure');
          help.open=true;bridge.renderLayout();
          assert(help.open,'refresh must retain Formation guidance disclosure state');
          help.open=false;
          var progression=document.querySelector('.wisp-progression');
          assert(progression && !progression.open,'secondary Wisp progression starts collapsed');
          var summary=progression.querySelector('summary');
          var inspectId=summary.dataset.wispDetails;
          summary.focus();summary.click();bridge.renderLayout();
          progression=document.querySelector('[data-wisp-progression="'+inspectId+'"]');
          assert(progression.open,'Wisp disclosure remains open through refresh');
          assert(document.activeElement===progression.querySelector('summary'),'refresh preserves disclosure keyboard focus');
          assert(progression.querySelector('[data-rarity]') && progression.querySelector('.hero-ability'),'secondary upgrade information remains reachable');
          assert(JSON.stringify(state())===beforeHierarchy,'hierarchy/navigation/inspection must not mutate gameplay state');
          finish('pass',{activeFirst:true,empowerFirst:true,stateUnchanged:true});return;
        }

        case 'p2-02a-core-qol': {
          var wispIds=['ember','tide','stone','gale','thorn','void','aurora','titan'];
          var qol=cloneJson(state());
          qol.maxDepthEver=45;
          qol.depth=45;
          qol.enemyDepth=45;
          qol.enemyHp=1;
          qol.enemyMaxHp=1;
          qol.lumen=1e12;
          qol.shards=1e12;
          qol.motes=1e9;
          qol.achieved.labmaster=true;
          wispIds.forEach(function(id){qol.spirits[id]=10;});
          qol.activeParty=['ember','void','gale','thorn','tide'];
          qol.formationPresets={
            push:['ember','void','gale','thorn','tide'],
            farm:['tide','aurora','gale','thorn','ember'],
            boss:['ember','void','stone','titan','tide']
          };
          qol.activeFormationPreset='push';
          qol.activeStudies=[
            {id:'wispascend',remainingSec:90,totalDurationSec:180,speedMult:1},
            {id:'shardstudy',remainingSec:80,totalDurationSec:200,speedMult:2}
          ];
          bridge.setState(qol);
          bridge.renderLayout();

          document.querySelector('[data-tab="spirits"]').click();
          var farmPreset=document.querySelector('[data-formation-preset="farm"]');
          farmPreset.focus();
          farmPreset.click();
          var afterFarm=state();
          assert(afterFarm.activeParty.join(',')===qol.formationPresets.farm.join(','),'Farm preset must apply the exact saved Wisp Formation');
          assert(bridge.activeBondIds().sort().join(',')==='dawnpriest,pathfinder','Farm preset must recalculate the intended Formation Bonds');
          assert(document.querySelector('[data-formation-preset="farm"]').getAttribute('aria-pressed')==='true','active Formation preset must be visibly and semantically selected');
          assert(document.activeElement===document.querySelector('[data-formation-preset="farm"]'),'Formation quick-switch must preserve keyboard focus after rendering');

          var custom=cloneJson(state());
          custom.activeParty=['ember','tide','stone'];
          custom.activeFormationPreset='';
          bridge.setState(custom);
          bridge.renderLayout();
          document.querySelector('[data-save-formation="boss"]').click();
          assert(state().formationPresets.boss.join(',')==='ember,tide,stone','Save Boss must store the player-selected current Formation');
          assert(state().activeFormationPreset==='boss','saving a preset must make that exact Formation active');
          bridge.save();
          var persisted=JSON.parse(bridge.rawSave());
          var roundTrip=bridge.setState(persisted);
          assert(roundTrip.formationPresets.boss.join(',')==='ember,tide,stone' && roundTrip.activeFormationPreset==='boss','Formation presets and active identity must survive canonical save/load');

          var invalid=cloneJson(roundTrip);
          invalid.activeParty=['ember','tide'];
          invalid.activeFormationPreset='push';
          invalid.spirits.aurora=0;
          invalid.formationPresets.push=['deleted-wisp','ember','ember','aurora'];
          var normalized=bridge.setState(invalid);
          assert(normalized.formationPresets.push.join(',')==='ember,aurora','unknown and duplicate preset references must normalize safely while a known unavailable Wisp remains saved');
          var beforeInvalidParty=normalized.activeParty.join(',');
          assert(bridge.applyFormationPreset('push')===false,'a preset containing an unavailable Wisp must fail safely');
          assert(state().activeParty.join(',')===beforeInvalidParty,'failed preset activation must not partially mutate the current Formation');

          bridge.setState(qol);
          bridge.renderLayout();
          document.querySelector('[data-tab="battle"]').click();
          var studyStatus=document.getElementById('rift-study-status');
          assert(/Studies 2\/3/.test(studyStatus.textContent) && /1 slot free/.test(studyStatus.textContent),'Rift Study indicator must report occupied and available slots');
          assert(studyStatus.classList.contains('has-open'),'Rift Study indicator must visibly flag an open slot');
          studyStatus.focus();
          studyStatus.click();
          assert(document.getElementById('tab-research').classList.contains('active'),'Rift Study action must open the Lab');
          assert(document.querySelector('[data-tab="research"]').getAttribute('aria-current')==='page' && document.getElementById('study-list').closest('.tab-panel').id==='tab-research','Rift Study action must open Long Studies directly');
          assert(document.activeElement===document.querySelector('[data-tab="research"]'),'direct Rift to Long Studies navigation must move focus predictably');

          var beforeTabs=state();
          var gameplayBeforeTabs=JSON.stringify({research:beforeTabs.research,activeStudies:beforeTabs.activeStudies,studyQueue:beforeTabs.studyQueue,lumen:beforeTabs.lumen,shards:beforeTabs.shards});
          document.querySelector('[data-tab="forge"]').click();
          document.querySelector('[data-tab="research"]').click();
          var afterTabs=state();
          assert(JSON.stringify({research:afterTabs.research,activeStudies:afterTabs.activeStudies,studyQueue:afterTabs.studyQueue,lumen:afterTabs.lumen,shards:afterTabs.shards})===gameplayBeforeTabs,'Lab tab switching must not mutate gameplay state');
          document.querySelector('[data-tab="forge"]').focus();
          document.querySelector('[data-tab="forge"]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
          assert(document.activeElement===document.querySelector('[data-tab="research"]') && document.querySelector('[data-tab="research"]').getAttribute('aria-current')==='page','main destinations must support arrow-key selection and focus');

          document.querySelector('[data-tab="forge"]').click();
          var beforeResearch=state();
          var beforeResearchLevel=beforeResearch.research.focus;
          var studiesBeforeResearch=JSON.stringify(beforeResearch.activeStudies);
          var researchButton=document.querySelector('[data-research="focus"]');
          assert(researchButton && !researchButton.disabled,'funded Permanent Research action must remain available');
          researchButton.click();
          assert(state().research.focus>beforeResearchLevel,'Forge destination must preserve upgrade purchasing');
          assert(JSON.stringify(state().activeStudies)===studiesBeforeResearch,'Permanent Research must not disturb Long Studies');

          var studyState=cloneJson(state());
          studyState.activeStudies=[];
          studyState.studyQueue={};
          studyState.lumen=1e12;
          studyState.shards=1e12;
          bridge.setState(studyState);
          bridge.renderLayout();
          document.querySelector('[data-tab="research"]').click();
          var researchBeforeStudy=JSON.stringify(state().research);
          var beginStudy=document.querySelector('[data-study="guardmastery"]');
          assert(beginStudy && !beginStudy.disabled,'funded Long Study action must remain available');
          beginStudy.click();
          assert(state().activeStudies.some(function(active){return active.id==='guardmastery';}),'Long Studies tab must preserve Study start behavior');
          assert(JSON.stringify(state().research)===researchBeforeStudy,'starting a Long Study must not mutate Permanent Research');

          var automation=cloneJson(qol);
          wispIds.forEach(function(id){automation.empowerQueue[id]=id==='ember' || id==='gale';});
          bridge.setState(automation);
          bridge.renderLayout();
          document.querySelector('[data-tab="spirits"]').click();
          var globalAuto=document.querySelector('[data-empower-all]');
          assert(globalAuto && globalAuto.getAttribute('aria-pressed')==='mixed' && /MIXED/.test(globalAuto.textContent),'mixed individual Auto-Empower state must be explicit');
          globalAuto.focus();
          globalAuto.click();
          assert(wispIds.every(function(id){return state().empowerQueue[id]===true;}),'Auto-Empower All ON must enable every applicable recruited Wisp');
          assert(document.querySelector('[data-empower-all]').getAttribute('aria-pressed')==='true','global ON state must match aria-pressed');
          document.querySelector('[data-empower-all]').click();
          assert(wispIds.every(function(id){return state().empowerQueue[id]===false;}),'Auto-Empower All OFF must disable every applicable recruited Wisp');
          document.querySelector('[data-empower-queue="ember"]').click();
          assert(state().empowerQueue.ember===true && state().empowerQueue.tide===false,'individual Auto-Empower toggle must still work after global actions');
          assert(document.querySelector('[data-empower-all]').getAttribute('aria-pressed')==='mixed','individual change after global OFF must return the global state to mixed');

          var deeds=cloneJson(qol);
          deeds.totalTaps=4286;
          deeds.achieved.tap10000=false;
          deeds.maxDepthEver=55;
          deeds.achieved.d50=true;
          bridge.setState(deeds);
          bridge.renderLayout();
          document.querySelector('[data-tab="deeds"]').click();
          var tapsProgress=document.querySelector('[data-deed-progress="tap10000"]');
          assert(tapsProgress.dataset.current==='4286' && tapsProgress.dataset.target==='10000','incomplete Deed progress must use authoritative current and target counters');
          assert(/\//.test(tapsProgress.textContent),'incomplete Deed progress must expose current / target text');
          var completedProgress=document.querySelector('[data-deed-progress="d50"]');
          assert(completedProgress.dataset.current==='50' && completedProgress.dataset.target==='50','completed Deed progress must remain at its reached target');
          assert(/Completed/.test(completedProgress.closest('.ach-card').textContent),'completed Deed must remain explicitly completed');
          assert(document.querySelectorAll('[data-deed-progress]').length===document.querySelectorAll('#ach-list .ach-card').length,'every current Deed must expose deterministic progress');

          document.querySelector('[data-tab="battle"]').click();
          document.getElementById('tab-battle').getAnimations().forEach(function(animation){animation.finish();});
          assert(studyStatus.getBoundingClientRect().height>=44,'Rift Study action must retain a practical touch target');
          document.querySelector('[data-tab="spirits"]').click();
          document.getElementById('tab-spirits').getAnimations().forEach(function(animation){animation.finish();});
          Array.from(document.querySelectorAll('[data-formation-preset],[data-save-formation],[data-empower-all]')).forEach(function(control){
            assert(control.getBoundingClientRect().height>=44,'Formation and global automation controls must retain practical touch targets');
          });
          document.querySelector('[data-tab="research"]').click();
          document.getElementById('tab-research').getAnimations().forEach(function(animation){animation.finish();});
          Array.from(document.querySelectorAll('nav.tabbar .tab-btn')).forEach(function(tab){
            assert(tab.getBoundingClientRect().height>=44 && tab.getBoundingClientRect().width>=44,'main destinations must retain practical touch targets');
          });

          finish('pass',{
            formation:afterFarm.activeParty,
            bonds:bridge.activeBondIds(),
            studyStatus:studyStatus.textContent.trim(),
            destination:document.querySelector('nav.tabbar [aria-current="page"]').getAttribute('data-tab'),
            autoEmpower:'mixed-after-individual',
            deedProgress:tapsProgress.textContent.trim()
          });
          return;
        }

        case 'p2-ascend-integrity': {
          function ascendState(cleared,benchmark,autoEnabled){
            var a = cloneJson(state());
            a.depth = cleared+1;
            a.maxDepthEver = Math.max(a.maxDepthEver,cleared+1);
            a.riftMode = 'push';
            a.farmDepth = 0;
            a.farmReturnDepth = 0;
            a.enemyDepth = cleared+1;
            a.enemyHp = 1;
            a.enemyMaxHp = 1;
            a.prisms = 0;
            a.ascendCount = 0;
            a.ascendRewardedDepth = benchmark||0;
            a.spirits.ember = 50;
            a.activeParty = ['ember'];
            a.owned.autoascend = !!autoEnabled;
            a.autoAscendEnabled = !!autoEnabled;
            a.autoAscendTargetDepth = cleared+1;
            return a;
          }

          var firstState = ascendState(100,0,false);
          bridge.setState(firstState);
          var firstBreakdown = bridge.ascendBreakdown(101);
          assert(firstBreakdown.full===20,'Rift 100 baseline full Prism curve must remain 20 before Prism multipliers');
          assert(firstBreakdown.gain===firstBreakdown.full,'first meaningful Ascend must keep the full intended reward');
          var firstManual = bridge.ascendManual();
          assert(firstManual.gain===20,'first meaningful Ascend must award full 20 Prisms at cleared Rift 100');
          assert(firstManual.after.benchmark===100,'first Ascend must establish cleared Rift 100 as the reward benchmark');

          var repeatState = ascendState(100,100,false);
          bridge.setState(repeatState);
          var repeatBreakdown = bridge.ascendBreakdown(101);
          assert(repeatBreakdown.gain===4,'same-depth Rift 100 repeat must pay the 20% reserve reward');
          assert(repeatBreakdown.progressBonus===0,'same-depth repeat must have no new-depth bonus');
          var repeatManual = bridge.ascendManual();
          assert(repeatManual.gain===4,'manual same-depth repeat must award only reserve Prisms');
          assert(repeatManual.after.benchmark===100,'same-depth repeat must not move the benchmark');

          var fartherState = ascendState(200,100,false);
          bridge.setState(fartherState);
          var fartherBreakdown = bridge.ascendBreakdown(201);
          assert(fartherBreakdown.gain>repeatBreakdown.gain,'meaningfully deeper push must improve Ascend value');
          assert(fartherBreakdown.progressBonus>0,'new cleared depth must add a positive depth bonus');
          assert(fartherBreakdown.gain<=fartherBreakdown.full,'benchmark rule must never exceed the original full curve');
          var fartherManual = bridge.ascendManual();
          assert(fartherManual.gain===fartherBreakdown.gain,'manual deeper Ascend must use the benchmark breakdown exactly');
          assert(fartherManual.after.benchmark===200,'deeper manual Ascend must advance the reward benchmark');

          var wallState = ascendState(100,100,false);
          bridge.setState(wallState);
          var wallBreakdown = bridge.ascendBreakdown(101);
          assert(wallBreakdown.gain>=1,'a player hard-walled at the benchmark must retain a useful prestige path');

          var parityBaseline = ascendState(150,100,true);
          bridge.setState(parityBaseline);
          var manualExpected = bridge.ascendBreakdown(151);
          var manualAutoParity = bridge.ascendManual();
          assert(manualAutoParity.gain===manualExpected.gain,'manual Ascend must use the canonical benchmark reward');

          bridge.setState(parityBaseline);
          var liveAuto = bridge.simulateTimeline(1,'live',PARITY_CLOCK_MS);
          assert(liveAuto.summary.ascends===1,'live Auto-Ascend must fire once when already ready');
          assert(liveAuto.summary.ascendGains[0]===manualExpected.gain,'live Auto-Ascend must use the manual reward rule');
          assert(liveAuto.state.ascendRewardedDepth===150,'live Auto-Ascend must advance the same benchmark');

          bridge.setState(parityBaseline);
          var offlineAuto = bridge.simulateTimeline(1,'offline',PARITY_CLOCK_MS);
          assert(offlineAuto.summary.ascends===1,'offline Auto-Ascend must fire once when already ready');
          assert(offlineAuto.summary.ascendGains[0]===manualExpected.gain,'offline Auto-Ascend must use the same benchmark reward');
          assert(offlineAuto.state.prisms===liveAuto.state.prisms,'live and offline Auto-Ascend Prism totals must match');
          assert(offlineAuto.state.ascendRewardedDepth===liveAuto.state.ascendRewardedDepth,'live/offline Auto-Ascend benchmark must match');

          finish('pass',{
            firstReward:firstManual.gain,
            repeatReward:repeatManual.gain,
            deeperReward:fartherManual.gain,
            wallReward:wallBreakdown.gain,
            manualAutoReward:manualExpected.gain,
            finalBenchmark:offlineAuto.state.ascendRewardedDepth
          });
          return;
        }

        case 'p2-03b-auto-ascend-integrity': {
          var base=bridge.freshStateSnapshot();
          base.owned.autoascend=true;base.autoAscendEnabled=true;base.autoAscendTargetDepth=21;
          base.depth=20;base.maxDepthEver=20;base.enemyDepth=20;base.enemyMaxHp=bridge.enemyHpFor(20);base.enemyHp=base.enemyMaxHp;
          bridge.setState(base);
          var boundary=bridge.ascendEligibility();
          assert(boundary.cleared===19 && boundary.autoClearedTarget===20,'target 21 must authoritatively mean clear Rift 20');
          assert(boundary.eligible===true && boundary.autoReady===false,'manual eligibility may exist before the saved Auto target, but Auto cannot fire before target clear');
          var before=state();
          var zero=bridge.simulate(0,'offline',0,PARITY_CLOCK_MS);
          assert(zero.state.ascendCount===before.ascendCount,'transient arrival at target Boss must not Auto-Ascend');
          assert(zero.state.sigils===before.sigils,'unbeaten target Boss must not grant or consume Sigils');

          var kill=cloneJson(base);kill.enemyHp=1;kill.spirits.ember=100;kill.heroResource.ember=100;
          bridge.setState(kill);
          var afterKill=bridge.simulateTimeline(0,'offline',PARITY_CLOCK_MS);
          assert(afterKill.state.ascendCount===kill.ascendCount+1,'clearing target Rift must produce exactly one Auto-Ascend');
          assert(afterKill.state.depth===1,'Auto-Ascend must reset to Rift 1');
          assert(afterKill.summary.ascends===1,'one qualifying clear must produce one Ascension event');
          assert(afterKill.state.sigils===kill.sigils+2,'target Boss Sigils must be awarded before Ascension reset');
          assert(bridge.ascendEligibility().autoReady===false,'post-Ascension reset cannot remain eligible from stale progress');

          var stale=cloneJson(afterKill.state);stale.maxDepthEver=99;stale.depth=1;stale.enemyDepth=1;stale.enemyMaxHp=bridge.enemyHpFor(1);stale.enemyHp=stale.enemyMaxHp;
          bridge.setState(stale);
          assert(bridge.ascendEligibility().eligible===false && bridge.ascendEligibility().autoReady===false,'historical maxDepthEver must not prove current-run eligibility');
          bridge.save();
          var saved=JSON.parse(bridge.rawSave());bridge.setState(saved);
          assert(bridge.ascendEligibility().autoReady===false,'save/load must not recreate consumed Auto eligibility');

          var farm=cloneJson(base);farm.depth=19;farm.riftMode='farm';farm.farmDepth=19;farm.farmReturnDepth=21;farm.enemyDepth=19;farm.enemyMaxHp=bridge.enemyHpFor(19);farm.enemyHp=farm.enemyMaxHp;
          bridge.setState(farm);
          var farmEligibility=bridge.ascendEligibility();
          assert(farmEligibility.cleared===20 && farmEligibility.eligible===true && farmEligibility.autoReady===false,'Farm may preserve cleared Push progress but cannot trigger Auto-Ascend');
          bridge.enterPush();
          assert(bridge.ascendEligibility().autoReady===true,'returning to Push may use the same legitimate cleared target without inventing progress');

          var parity=cloneJson(base);parity.depth=19;parity.maxDepthEver=20;parity.enemyDepth=19;parity.enemyMaxHp=bridge.enemyHpFor(19);parity.enemyHp=1;parity.spirits.ember=100;
          bridge.setState(parity);var direct=bridge.simulate(120,'offline',120,PARITY_CLOCK_MS);
          bridge.setState(parity);var chunked=bridge.simulate(120,'offline',1,PARITY_CLOCK_MS);
          assert(chunked.summary.ascends===direct.summary.ascends,'chunking must not change Ascension count');
          bridge.setState(parity);var offlineDirect=bridge.simulateOfflineDirect(120,PARITY_CLOCK_MS);
          assert(offlineDirect.summary.ascends===direct.summary.ascends,'offline/direct execution must not change Ascension count');

          var manual=cloneJson(base);manual.autoAscendEnabled=false;manual.depth=16;manual.maxDepthEver=16;manual.enemyDepth=16;manual.enemyMaxHp=bridge.enemyHpFor(16);manual.enemyHp=manual.enemyMaxHp;
          bridge.setState(manual);var manualEligibility=bridge.ascendEligibility();
          assert(manualEligibility.eligible===true,'15 legitimately cleared Rifts must satisfy shared Ascension eligibility');
          var rewardBefore=bridge.ascendBreakdown(16).gain;var manualResult=bridge.ascendManual();
          assert(manualResult.gain===rewardBefore,'P2-03B must not change Ascension reward magnitude');
          var ineligible=cloneJson(manual);ineligible.depth=15;ineligible.maxDepthEver=15;ineligible.enemyDepth=15;ineligible.enemyMaxHp=bridge.enemyHpFor(15);ineligible.enemyHp=ineligible.enemyMaxHp;ineligible.autoAscendEnabled=true;ineligible.autoAscendTargetDepth=16;
          bridge.setState(ineligible);
          assert(bridge.ascendEligibility().eligible===false && bridge.ascendEligibility().autoReady===false,'Auto cannot bypass shared manual eligibility below 15 cleared Rifts');

          finish('pass',{targetClearedRift:20,bossRewardBeforeAscend:true,singleEvent:true,postResetSafe:true,saveLoadSafe:true,farmSafe:true,directChunkedAscends:direct.summary.ascends,manualReward:manualResult.gain});
          return;
        }

        case 'p2-wisp-progression-pacing': {
          var emberCurve = bridge.wispPacingContract('ember');
          var voidCurve = bridge.wispPacingContract('void');
          var titanCurve = bridge.wispPacingContract('titan');
          var rosterTotals = bridge.allWispPacingTotals();

          assert(emberCurve.rarity[0].req===8,'first Rarity must remain available at Wisp Lv.8');
          assert(emberCurve.rarity[0].shard===15 && emberCurve.rarity[0].lumen===80,'Ember first Rarity must retain the previous 15 Shard / 80 Lumen entry price');
          assert(emberCurve.rarity[4].req===65,'Mythic must require deliberate Wisp investment through Lv.65');
          assert(emberCurve.rarity[4].shard===500000,'Mythic Shard investment contract must remain 500,000');
          assert(emberCurve.rarity[4].lumen===24000,'Ember Mythic Lumen price must use the 2400× base-cost tier');
          assert(emberCurve.rarity[4].shard>emberCurve.rarity[2].shard*500,'late Rarity must be materially more serious than early/mid Rarity');

          for(var earlyModule=0;earlyModule<5;earlyModule++){
            var oldExpectedLumen=Math.round(10*4*Math.pow(1.35,earlyModule));
            var oldExpectedShard=Math.round(10*0.4*Math.pow(1.35,earlyModule));
            assert(emberCurve.module[earlyModule].lumen===oldExpectedLumen,'Module '+(earlyModule+1)+' early Lumen cost must remain unchanged');
            assert(emberCurve.module[earlyModule].shard===oldExpectedShard,'Module '+(earlyModule+1)+' early Shard cost must remain unchanged');
          }
          assert(emberCurve.moduleMax===20,'Module cap must remain 20');
          assert(emberCurve.module[5].pacing>1,'late Module pacing must begin after the first five upgrades');
          assert(emberCurve.module[19].pacing>10,'Module 20 must carry a materially stronger late-investment multiplier');
          assert(emberCurve.module[19].lumen>emberCurve.module[9].lumen*100,'Module endgame investment must widen materially versus the mid curve');

          assert(rosterTotals.rarity.shard===emberCurve.rarityTotal.shard*8,'full-roster Rarity Shard commitment must equal eight complete Wisp paths');
          assert(rosterTotals.module.shard>voidCurve.moduleTotal.shard*30,'full-roster Module commitment must be substantially longer than one representative Active Wisp');
          assert(titanCurve.moduleTotal.shard>voidCurve.moduleTotal.shard*30,'late-roster Titan Module path must remain a deliberate specialization choice');

          var maxable = cloneJson(state());
          maxable.lumen = 1e15;
          maxable.shards = 1e15;
          maxable.spirits.ember = 65;
          maxable.activeParty = ['ember'];
          maxable.heroRarity.ember = 0;
          maxable.wispModules.ember = 0;
          bridge.setState(maxable);
          for(var rarityBuy=0;rarityBuy<5;rarityBuy++) bridge.buyRarityFor('ember');
          for(var moduleBuy=0;moduleBuy<20;moduleBuy++) bridge.buyModuleFor('ember');
          var maxed = state();
          assert(maxed.heroRarity.ember===5,'one deliberately funded Wisp must still be able to reach Mythic');
          assert(maxed.wispModules.ember===20,'one deliberately funded Wisp must still be able to reach Module 20');

          var grandfathered = cloneJson(state());
          grandfathered.spirits.ember = 1;
          grandfathered.heroRarity.ember = 5;
          grandfathered.wispModules.ember = 20;
          grandfathered.spirits.titan = 1;
          grandfathered.heroRarity.titan = 5;
          grandfathered.wispModules.titan = 20;
          var acceptedGrandfathered = bridge.setState(grandfathered);
          assert(acceptedGrandfathered.heroRarity.ember===5 && acceptedGrandfathered.wispModules.ember===20,'existing maxed Ember progression must never be downgraded by new requirements');
          assert(acceptedGrandfathered.heroRarity.titan===5 && acceptedGrandfathered.wispModules.titan===20,'existing maxed Titan progression must never be downgraded by new requirements');

          assert(emberCurve.ultimateSigils===7 && titanCurve.ultimateSigils===69,'Ultimate/Sigil costs must remain unchanged by P2-01B');

          finish('pass',{
            rarityRequirements:emberCurve.rarity.map(function(x){return x.req;}),
            rarityShardCosts:emberCurve.rarity.map(function(x){return x.shard;}),
            emberRarityTotal:emberCurve.rarityTotal,
            emberModuleTotal:emberCurve.moduleTotal,
            voidModuleTotal:voidCurve.moduleTotal,
            titanModuleTotal:titanCurve.moduleTotal,
            rosterTotals:rosterTotals
          });
          return;
        }

        case 'p2-endgame-currency-utility': {
          var economy=bridge.endgameEconomyContract();
          assert(economy.ultimateSigilTotal===250,'all current Wisp Ultimates must retain the documented 250-Sigil total');
          assert(economy.sigilsThroughRift220===253,'first-clear boss sequence through Rift 220 must yield 253 Sigils before repeated runs');
          assert(economy.restStopCometTotal===450,'the four finite Rest Stop purchases must total 450 Comets');
          assert(economy.deedCometTotal===683,'current one-time Deeds must total 683 Comets');
          assert(economy.questRefreshCost>=economy.maxQuestCometReward,'Daily Quest Refresh must never be cheaper than the richest Comet quest reward');
          assert(economy.sigilResonanceCost===25 && economy.sigilResonanceRunLimit===3,'Sigil Resonance must remain fixed at 25 Sigils and 3 uses per Ascension run');

          var ids=['ember','tide','stone','gale','thorn','void','aurora','titan'];
          function endgameState(){
            var e=cloneJson(state());
            e.depth=1;e.maxDepthEver=250;e.riftMode='push';e.farmDepth=0;e.farmReturnDepth=0;
            e.enemyDepth=1;e.enemyHp=1;e.enemyMaxHp=1;e.enemyIsLuminous=false;
            e.sigils=1000000;e.comets=1000000;e.sigilResonanceUses=0;e.dailyQuestRefreshes=0;
            e.owned={autoascend:true,offline24:true,offline48:true,rememberbulk:true};
            e.autoAscendEnabled=false;
            e.activeParty=['ember','tide','stone','gale','thorn'];
            ids.forEach(function(id){
              e.spirits[id]=1;
              e.heroRarity[id]=5;
              e.heroResource[id]=0;
              e.wispUltimate[id]=true;
            });
            e.questDay=bridge.currentDay();
            e.questIds=['q_tap_small','q_kill_small','q_empower'];
            e.questClaimed={};
            e.dailyStats={taps:0,kills:0,empowers:0,research:0,bossKills:0,luminousKills:0,ascends:0};
            return e;
          }

          var endgame=bridge.setState(endgameState());
          var postCap=bridge.endgameEconomyContract();
          assert(postCap.allUltimatesOwned===true,'Sigil utility must unlock after every existing Ultimate is owned');
          assert(postCap.restStopComplete===true,'Comet refresh must unlock after all four Rest Stop purchases are owned');

          var resonance1=bridge.resonateFor('ember');
          assert(resonance1.ok===true,'Sigils must have a valid post-Ultimate Resonance spend');
          assert(resonance1.state.sigils===endgame.sigils-economy.sigilResonanceCost,'Resonance must spend exactly its Sigil cost');
          assert(resonance1.state.sigilResonanceUses===1 && resonance1.state.heroResource.ember===100,'Resonance must ready exactly the selected Active Wisp ability');
          assert(ids.every(function(id){return resonance1.state.wispUltimate[id]===true;}),'spending post-cap Sigils must preserve every earned Ultimate');

          var resonatedSnapshot=cloneJson(resonance1.state);
          bridge.setState(resonatedSnapshot);
          var liveAfterResonance=bridge.simulate(1,'live',0.1,PARITY_CLOCK_MS);
          bridge.setState(resonatedSnapshot);
          var offlineAfterResonance=bridge.simulate(1,'offline',0.1,PARITY_CLOCK_MS);
          assert(
            liveAfterResonance.state.sigils===resonatedSnapshot.sigils+(liveAfterResonance.summary.sigilsGained||0) &&
            offlineAfterResonance.state.sigils===resonatedSnapshot.sigils+(offlineAfterResonance.summary.sigilsGained||0),
            'authoritative live/offline simulation may earn Boss Sigils but must never auto-spend Resonance Sigils'
          );
          assert(liveAfterResonance.state.sigilResonanceUses===1 && offlineAfterResonance.state.sigilResonanceUses===1,'live/offline simulation must preserve the same run-bounded Resonance counter');
          assert(ids.every(function(id){return liveAfterResonance.state.wispUltimate[id] && offlineAfterResonance.state.wispUltimate[id];}),'live/offline continuation must preserve all Ultimates after a Resonance spend');

          var bounded=cloneJson(resonance1.state);
          bounded.heroResource.tide=0;
          bridge.setState(bounded);
          assert(bridge.resonateFor('tide').ok===true,'second Resonance use must remain available');
          bounded=cloneJson(state());bounded.heroResource.stone=0;bridge.setState(bounded);
          assert(bridge.resonateFor('stone').ok===true,'third Resonance use must remain available');
          bounded=cloneJson(state());bounded.heroResource.ember=0;bridge.setState(bounded);
          var beforeFourth=state();
          var fourth=bridge.resonateFor('ember');
          assert(fourth.ok===false,'fourth Resonance in the same Ascension run must be rejected');
          assert(fourth.state.sigils===beforeFourth.sigils && fourth.state.sigilResonanceUses===3,'run cap must prevent further Sigil spending or hidden power');

          var ascendReset=cloneJson(fourth.state);
          ascendReset.depth=101;ascendReset.maxDepthEver=Math.max(ascendReset.maxDepthEver,101);
          ascendReset.enemyDepth=101;ascendReset.enemyHp=1;ascendReset.enemyMaxHp=1;ascendReset.ascendRewardedDepth=100;
          bridge.setState(ascendReset);
          bridge.ascendManual();
          assert(state().sigilResonanceUses===0,'manual Ascend must reset the run-bounded Resonance allowance');
          assert(ids.every(function(id){return state().wispUltimate[id]===true;}),'Ascension must still preserve every Ultimate');

          var refreshBase=endgameState();
          bridge.setState(refreshBase);
          var refresh1=bridge.refreshQuest('q_tap_small');
          assert(refresh1.ok===true,'Comets must have a valid post-Rest-Stop Daily Quest Refresh spend');
          assert(refresh1.state.comets===refreshBase.comets-economy.questRefreshCost,'Quest Refresh must spend exactly its Comet cost');
          assert(refresh1.state.questIds.length===3 && refresh1.state.questIds[0]!=='q_tap_small','Quest Refresh must replace one quest without adding extra quest slots');
          assert(refresh1.state.dailyQuestRefreshes===1,'Quest Refresh count must persist deterministically');
          assert(refresh1.state.owned.autoascend && refresh1.state.owned.offline24 && refresh1.state.owned.offline48 && refresh1.state.owned.rememberbulk,'refreshing a quest must not invalidate any finite Rest Stop purchase');

          bridge.setState(refreshBase);
          var refresh2=bridge.refreshQuest('q_tap_small');
          assert(refresh2.ok===true && refresh2.state.questIds[0]===refresh1.state.questIds[0],'identical save/date/slot must choose the same deterministic replacement quest');

          var large=endgameState();
          large.sigils=987654321;
          large.comets=876543210;
          var largeAccepted=bridge.setState(large);
          assert(largeAccepted.sigils===987654321 && largeAccepted.comets===876543210,'large existing Sigil/Comet balances must remain valid and uncapped');

          finish('pass',{
            ultimateSigilTotal:economy.ultimateSigilTotal,
            sigilsThroughRift220:economy.sigilsThroughRift220,
            restStopCometTotal:economy.restStopCometTotal,
            deedCometTotal:economy.deedCometTotal,
            resonanceCost:economy.sigilResonanceCost,
            resonanceRunLimit:economy.sigilResonanceRunLimit,
            questRefreshCost:economy.questRefreshCost,
            maxQuestReward:economy.maxQuestCometReward,
            deterministicReplacement:refresh1.state.questIds[0]
          });
          return;
        }

        case 'self-test-bad-assertion':
          assert(s.depth===999999,'intentional harness self-test assertion');
          finish('pass');
          return;

        case 'self-test-uncaught-error':
          setTimeout(function(){ throw new Error('intentional uncaught QA self-test'); },0);
          setTimeout(function(){ finish('pass',{unexpected:'uncaught error was not detected'}); },40);
          return;

        case 'self-test-unhandled-rejection':
          Promise.reject(new Error('intentional unhandled rejection QA self-test'));
          setTimeout(function(){ finish('pass',{unexpected:'unhandled rejection was not detected'}); },40);
          return;

        case 'self-test-parity-regression': {
          var parityBaseline = state();
          var expectedParity = bridge.simulate(60,'live',0.1,PARITY_CLOCK_MS);
          bridge.setState(parityBaseline);
          var intentionallyWrong = bridge.simulate(60,'live',60,PARITY_CLOCK_MS);
          intentionallyWrong.state.totalKills += 1;
          assertProtectedParity(intentionallyWrong.state,expectedParity.state,'intentional parity regression');
          finish('pass',{unexpected:'parity comparator did not reject a one-kill regression'});
          return;
        }

        case 'self-test-chronology-regression': {
          var chronologyProbe = bridge.simulateTimeline(7,'offline',PARITY_CLOCK_MS);
          var chronologyResearch = firstTimelineEvent(chronologyProbe,'research');
          var chronologyStudy = firstTimelineEvent(chronologyProbe,'studyComplete');
          assert(chronologyResearch && chronologyStudy,'intentional chronology self-test fixture must produce both events');
          assert(
            chronologyStudy.elapsedSec < chronologyResearch.elapsedSec ||
            (Math.abs(chronologyStudy.elapsedSec-chronologyResearch.elapsedSec)<=1e-6 &&
             timelineTypes(chronologyProbe).indexOf('studyComplete') < timelineTypes(chronologyProbe).indexOf('research')),
            'intentional chronology regression: Study incorrectly expected before Research'
          );
          finish('pass',{unexpected:'chronology ordering regression was not detected'});
          return;
        }

        case 'self-test-lifecycle-duplicate': {
          var duplicateProbe = runResumeWindow(20,'lifecycle duplicate negative control');
          bridge.setLastSeen(duplicateProbe.startMs);
          bridge.applyOfflineNow();
          assertOfflineExactlyOnce(
            bridge.lifecycleTrace(),
            20,
            'intentional duplicate lifecycle regression'
          );
          finish('pass',{unexpected:'duplicate offline application was not detected'});
          return;
        }

        case 'self-test-wisp-formula-regression': {
          var formulaRegressionBase = cleanFormulaState(['ember']);
          var beforeFormulaRegression = formulaSnapshotFor(formulaRegressionBase,'ember',10,1);
          var wrongFormulaState = cloneJson(formulaRegressionBase);
          wrongFormulaState.research.formation = 1;
          var afterFormulaRegression = formulaSnapshotFor(wrongFormulaState,'ember',10,1);
          assert(
            afterFormulaRegression.abilityDamage>beforeFormulaRegression.abilityDamage,
            'intentional Wisp formula regression: passive-only Formation Training incorrectly expected to scale ability damage'
          );
          finish('pass',{unexpected:'Wisp formula regression was not detected'});
          return;
        }

        case 'self-test-wisp-pacing-regression': {
          var compressed = bridge.wispPacingContract('ember');
          assert(
            compressed.rarity[4].shard<100000,
            'intentional Wisp pacing regression: Mythic cost compression was not detected'
          );
          finish('pass',{unexpected:'Wisp pacing regression was not detected'});
          return;
        }

        case 'self-test-endgame-currency-regression': {
          var unsafeEconomy=bridge.endgameEconomyContract();
          assert(
            unsafeEconomy.sigilResonanceRunLimit>100 || unsafeEconomy.questRefreshCost<unsafeEconomy.maxQuestCometReward,
            'intentional endgame currency regression: bounded Sigil use / Comet anti-arbitrage guard was not detected'
          );
          finish('pass',{unexpected:'endgame currency regression was not detected'});
          return;
        }

        case 'self-test-wisp-role-regression': {
          var staleRoles=bridge.wispRoleContract();
          assert(
            staleRoles.some(function(entry){return entry.role==='Tank' || entry.abilityType==='tank';}),
            'intentional Wisp role regression: stale Tank semantics were not detected'
          );
          finish('pass',{unexpected:'Wisp role regression was not detected'});
          return;
        }

        default:
          throw new Error('unknown scenario '+ctx.scenario);
      }
    }catch(error){
      finish('fail',{message:error && error.message ? error.message : String(error), stack:error && error.stack ? error.stack : null});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();
})();
</script>'''


def instrument_html(source, fixtures):
    if source.count("<head>") != 1:
        raise SystemExit("Behavioral QA failed: expected exactly one <head> marker")
    source = source.replace("<head>", "<head>\n" + build_prelude(fixtures), 1)

    marker = "\n})();\n</script>\n<script>\nif(window.Capacitor"
    if source.count(marker) != 1:
        raise SystemExit("Behavioral QA failed: main game IIFE marker changed; test bridge could not be installed")
    source = source.replace(marker, "\n" + build_bridge() + marker, 1)

    if source.count("</body>") != 1:
        raise SystemExit("Behavioral QA failed: expected exactly one </body> marker")
    source = source.replace(
        "</body>",
        "<script>" + (ROOT / "layout.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "accessibility.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "accessibility-controls.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "r3-destinations.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "research-duration.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "feedback.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "formation.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "forge.js").read_text(encoding="utf-8") + "</script>" +
        "<script>" + (ROOT / "buff-timing.js").read_text(encoding="utf-8") + "</script>" +
        build_runner() + "\n</body>",
        1,
    )
    return source


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass


# Exact CSS viewports are hosted in an iframe: Chrome window chrome must not
# silently turn a requested 360x800 viewport into 360x713 in CI.
LAYOUT_VIEWPORTS = [(360,800,0,0),(360,780,0,0),(390,844,0,0),(412,915,0,0),(360,640,24,24)]
LAYOUT_HOST = """<!doctype html><html><body><script>
var p=new URLSearchParams(location.search), frame=document.createElement('iframe');
frame.style.cssText='border:0;width:'+Number(p.get('width'))+'px;height:'+Number(p.get('height'))+'px';
frame.src='index.html?'+p.toString();document.body.appendChild(frame);
addEventListener('message',function(e){
  if(e.origin!==location.origin || e.source!==frame.contentWindow || !e.data.qaLayoutResult)return;
  var result=document.getElementById('qa-result') || document.createElement('pre');result.id='qa-result';result.dataset.status=e.data.status;
  result.textContent=e.data.qaLayoutResult;document.body.appendChild(result);
});
</script></body></html>"""


def run_scenario(chrome, base_url, scenario, fixture, viewport=None):
    with tempfile.TemporaryDirectory(prefix=f"lumenfall-qa-{scenario}-") as profile:
        params = {"qaScenario": scenario, "qaFixture": fixture}
        page = "/index.html"
        if viewport:
            params.update(zip(("width","height","safeTop","safeBottom"), viewport))
            page = "/layout.html"
        url = base_url + page + "?" + urlencode(params)
        command = [
            chrome,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--no-first-run",
            "--window-size=390,844",
            "--virtual-time-budget=1500",
            f"--user-data-dir={profile}",
            "--dump-dom",
            url,
        ]
        if scenario in ("p1-05-reduced-motion", "p2-06b-reduced-motion", "research-duration-reduced-motion"):
            command.insert(-1, "--force-prefers-reduced-motion")
        completed = subprocess.run(command, capture_output=True, text=True, timeout=25)
        dom = completed.stdout
        stderr = completed.stderr

    tag_match = re.search(r'<[^>]*\bid="qa-result"[^>]*>', dom)
    status = None
    if tag_match:
        status_match = re.search(r'\bdata-status="([^"]+)"', tag_match.group(0))
        if status_match:
            status = status_match.group(1)

    runtime_marker = re.search(r'\bdata-qa-runtime-error="([^"]+)"', dom)
    passed = completed.returncode == 0 and status == "pass" and runtime_marker is None
    result_text = re.search(r'<pre[^>]*\bid="qa-result"[^>]*>(.*?)</pre>', dom, flags=re.S)

    if passed:
        print(f"PASS {scenario}" + (f" {viewport}" if viewport else ""))
        if result_text and (viewport or scenario in ("parity-long-high-power", "parity-medium-farm") or scenario.startswith("chronology-") or scenario.startswith("p1-05-") or scenario.startswith("p2-07a-") or scenario.startswith("forge-") or scenario.startswith("buff-")):
            try:
                payload = json.loads(html_lib.unescape(re.sub(r'<[^>]+>', '', result_text.group(1))).strip())
                print("  detail: " + json.dumps(payload.get("detail"), sort_keys=True))
            except Exception:
                pass
        return True

    print(f"FAIL {scenario}")
    print(f"  chrome exit: {completed.returncode}")
    print(f"  qa status: {status!r}")
    if runtime_marker:
        print(f"  runtime error marker: {runtime_marker.group(1)}")
    if result_text:
        print("  result:")
        print(html_lib.unescape(re.sub(r'<[^>]+>', '', result_text.group(1))).strip())
    if stderr.strip():
        print("  Chromium stderr tail:")
        print(stderr[-4000:])
    if not tag_match:
        print("  DOM tail:")
        print(dom[-8000:])
    return False


def main():
    parser = argparse.ArgumentParser(description="Lumenfall stateful browser regression harness")
    parser.add_argument("--web-root", default="mobile/www", help="staged web root containing index.html")
    parser.add_argument("--scenario", choices=sorted(set(SCENARIOS) | set(PREP_SCENARIOS) | set(NEGATIVE_SCENARIOS)))
    args = parser.parse_args()

    web_root = Path(args.web_root).resolve()
    index_path = web_root / "index.html"
    if not index_path.is_file():
        raise SystemExit(f"Behavioral QA failed: {index_path} not found")

    fixtures = load_fixtures()
    chrome = find_chrome()

    all_scenarios = SCENARIOS | PREP_SCENARIOS | NEGATIVE_SCENARIOS
    selected = {args.scenario: all_scenarios[args.scenario]} if args.scenario else SCENARIOS

    with tempfile.TemporaryDirectory(prefix="lumenfall-behavioral-") as td:
        stage = Path(td) / "www"
        shutil.copytree(web_root, stage)
        source = (stage / "index.html").read_text(encoding="utf-8")
        (stage / "index.html").write_text(instrument_html(source, fixtures), encoding="utf-8")

        (stage / "layout.html").write_text(LAYOUT_HOST, encoding="utf-8")

        handler = partial(QuietHandler, directory=str(stage))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = f"http://127.0.0.1:{server.server_address[1]}"

        failures = []
        try:
            for scenario, fixture in selected.items():
                viewports = LAYOUT_VIEWPORTS if scenario.startswith('layout-') or scenario=='self-test-layout-collapse' else [None]
                for viewport in viewports:
                    if not run_scenario(chrome, base_url, scenario, fixture, viewport):
                        failures.append(f"{scenario} {viewport}")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    if failures:
        raise SystemExit("Behavioral QA failed: " + ", ".join(failures))

    print(f"Behavioral QA passed: {len(selected)} deterministic scenario(s).")


if __name__ == "__main__":
    main()
