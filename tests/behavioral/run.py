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
}

NEGATIVE_SCENARIOS = {
    "self-test-bad-assertion": "fresh",
    "self-test-uncaught-error": "fresh",
    "self-test-unhandled-rejection": "fresh",
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
  }}
  window.addEventListener('error', function(event){{
    markRuntimeFailure('uncaught-error', event.message || (event.error && event.error.message) || 'unknown error');
  }});
  window.addEventListener('unhandledrejection', function(event){{
    markRuntimeFailure('unhandled-rejection', stringifyReason(event.reason));
  }});

  function materialize(value){{
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

  var resolvedFixtures = materialize(fixtures);
  var phase = localStorage.getItem(phaseKey);
  if(phase===null){{
    localStorage.clear();
    phase = '0';
    localStorage.setItem(phaseKey, phase);
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
    fixtures: resolvedFixtures,
    errors: errors,
    markRuntimeFailure: markRuntimeFailure
  }};
}})();
</script>'''


def build_bridge():
    return r'''
window.__lumenfallQaBridge = {
  getState: function(){ return JSON.parse(JSON.stringify(state)); },
  getFlags: function(){ return {resetInProgress:resetInProgress, resetBootPending:resetBootPending, reloadInProgress:reloadInProgress}; },
  rawSave: function(){ return localStorage.getItem(SAVE_KEY); },
  rawRecovery: function(){ return localStorage.getItem(RECOVERY_SAVE_KEY); },
  persistenceStatus: function(){ return persistenceStatus(); },
  save: function(){ return saveState(); },
  enterFarm: function(){ enterFarmMode(); },
  enterPush: function(){ enterPushMode(); },
  reset: function(){ performReset(); },
  restoreBackup: function(code){
    var textarea = document.getElementById('save-backup-code');
    textarea.value = code;
    restoreSaveBackup();
  },
  enemyHpFor: function(depth){ return enemyHpFor(depth); },
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
  }
  function assert(condition, message){ if(!condition) throw new Error(message); }
  function approx(actual, expected, epsilon, message){
    if(Math.abs(actual-expected)>epsilon) throw new Error(message+' (expected '+expected+', got '+actual+')');
  }
  function state(){ return window.__lumenfallQaBridge.getState(); }
  function phase(){ return parseInt(localStorage.getItem(ctx.phaseKey)||'0',10); }
  function nextPhase(n){ localStorage.setItem(ctx.phaseKey,String(n)); }
  function backupCode(obj){ return 'LUMENFALL1:'+encodeURIComponent(JSON.stringify(obj)); }
  function assertFresh(s){
    assert(s.depth===1,'fresh depth must be 1');
    assert(s.maxDepthEver===1,'fresh maxDepthEver must be 1');
    assert(s.riftMode==='push','fresh game must be in Push mode');
    assert(s.activeParty.length===1 && s.activeParty[0]==='ember','fresh party must contain only Ember');
    assert(s.spirits.ember===1,'fresh Ember level must be 1');
    assert(s.enemyDepth===1,'fresh enemy must belong to Rift 1');
    assert(s.schemaVersion===1,'fresh state must use current save schema');
  }
  function run(){
    var bridge = window.__lumenfallQaBridge;
    if(!bridge || !bridge.getState){ finish('fail','test bridge unavailable'); return; }
    try{
      var s = state();
      switch(ctx.scenario){
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
          assert(s.research.focus===24 && s.longStudyLevels.wispascend===9,'mature Lab progression must load intact');
          assert(s.owned.autoascend===true && s.autoAscendEnabled===true,'mature automation flags must load intact');
          finish('pass',{depth:s.depth,maxDepthEver:s.maxDepthEver});
          return;

        case 'legacy-load':
          assert(s.depth===22,'legacy depth must load');
          assert(!Object.prototype.hasOwnProperty.call(s,'labQueueOn'),'legacy labQueueOn must be migrated away');
          assert(!Object.prototype.hasOwnProperty.call(s,'activeStudy'),'legacy activeStudy must be migrated away');
          assert(s.activeStudies.length===1 && s.activeStudies[0].id==='wispascend','legacy activeStudy must migrate into activeStudies');
          assert(Object.keys(s.researchQueue).every(function(id){ return s.researchQueue[id]===true; }),'legacy lab queue flag must migrate to researchQueue');
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
    source = source.replace("</body>", build_runner() + "\n</body>", 1)
    return source


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass


def run_scenario(chrome, base_url, scenario, fixture):
    with tempfile.TemporaryDirectory(prefix=f"lumenfall-qa-{scenario}-") as profile:
        url = base_url + "/index.html?" + urlencode({"qaScenario": scenario, "qaFixture": fixture})
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

    if passed:
        print(f"PASS {scenario}")
        return True

    print(f"FAIL {scenario}")
    print(f"  chrome exit: {completed.returncode}")
    print(f"  qa status: {status!r}")
    if runtime_marker:
        print(f"  runtime error marker: {runtime_marker.group(1)}")
    result_text = re.search(r'<pre[^>]*\bid="qa-result"[^>]*>(.*?)</pre>', dom, flags=re.S)
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
    parser.add_argument("--scenario", choices=sorted(set(SCENARIOS) | set(NEGATIVE_SCENARIOS)))
    args = parser.parse_args()

    web_root = Path(args.web_root).resolve()
    index_path = web_root / "index.html"
    if not index_path.is_file():
        raise SystemExit(f"Behavioral QA failed: {index_path} not found")

    fixtures = load_fixtures()
    chrome = find_chrome()

    selected = {args.scenario: (SCENARIOS | NEGATIVE_SCENARIOS)[args.scenario]} if args.scenario else SCENARIOS

    with tempfile.TemporaryDirectory(prefix="lumenfall-behavioral-") as td:
        stage = Path(td) / "www"
        shutil.copytree(web_root, stage)
        source = (stage / "index.html").read_text(encoding="utf-8")
        (stage / "index.html").write_text(instrument_html(source, fixtures), encoding="utf-8")

        handler = partial(QuietHandler, directory=str(stage))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = f"http://127.0.0.1:{server.server_address[1]}"

        failures = []
        try:
            for scenario, fixture in selected.items():
                if not run_scenario(chrome, base_url, scenario, fixture):
                    failures.append(scenario)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    if failures:
        raise SystemExit("Behavioral QA failed: " + ", ".join(failures))

    print(f"Behavioral QA passed: {len(selected)} deterministic scenario(s).")


if __name__ == "__main__":
    main()
