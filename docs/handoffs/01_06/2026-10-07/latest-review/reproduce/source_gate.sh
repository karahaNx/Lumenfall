python3 - <<'PY'
from pathlib import Path
import re, sys, tempfile, subprocess

src = Path("index.html").read_text(encoding="utf-8")

required_ids = [
    "settings-btn", "settings-overlay", "startup-intro",
    "enemy-stage", "enemy-glyph", "rift-objective",
    "spirit-list", "roster-journey",
    "research-list", "study-list", "node-list", "ach-list",
    "daily-card", "rift-push-btn", "rift-farm-btn", "ascend-btn"
]

all_ids = re.findall(r'\sid="([^"]+)"', src)
duplicates = sorted({x for x in all_ids if all_ids.count(x) > 1})
if duplicates:
    raise SystemExit(f"QA failed: duplicate HTML ids: {duplicates}")

id_set = set(all_ids)
for element_id in required_ids:
    count = all_ids.count(element_id)
    if count != 1:
        raise SystemExit(f"QA failed: id={element_id!r} occurs {count} times")

literal_id_refs = set(re.findall(r'document\.getElementById\([\'"]([^\'"]+)[\'"]\)', src))
missing_refs = sorted(literal_id_refs - id_set)
if missing_refs:
    raise SystemExit(f"QA failed: getElementById references missing from HTML: {missing_refs}")

cache_match = re.search(r'function cacheEls\(\)\{(.*?)\n\}', src, flags=re.S)
if not cache_match:
    raise SystemExit("QA failed: cacheEls() not found")
cached_ids = set(re.findall(r"'([^']+)'", cache_match.group(1)))
stale_cached_ids = sorted(cached_ids - id_set)
if stale_cached_ids:
    raise SystemExit(f"QA failed: cacheEls references missing from HTML: {stale_cached_ids}")

forbidden = [
    'data-tab="about"',
    'Lumenfall-Setup.exe',
    'serviceWorker.register',
    'manifest.webmanifest',
    'BOSS_REGEN_PER_SEC',
    'studio-splash',
    'Xarib Productions',
    'intro-overlay',
    'prismGain()',
    'offline-preview',
    'function renderOfflinePreview(',
    'function computeOfflinePreview(',
    'id="luminous-tag"',
    'Luminous — bonus Motes on defeat'
]
for token in forbidden:
    if token in src:
        raise SystemExit(f"QA failed: forbidden legacy token remains: {token}")

scripts = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', src, flags=re.S)
if not scripts:
    raise SystemExit("QA failed: no inline JavaScript found")

with tempfile.TemporaryDirectory() as td:
    for i, code in enumerate(scripts, start=1):
        p = Path(td) / f"script-{i}.js"
        p.write_text(code, encoding="utf-8")
        result = subprocess.run(["node", "--check", str(p)], capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stdout)
            print(result.stderr, file=sys.stderr)
            raise SystemExit(f"QA failed: inline script {i} has a syntax error")

required_features = [
    "function sustainedCombatDps(depth)",
    "function renderEncyclopedia()",
    "function restoreSaveBackup()",
    "var BOSS_TRAITS = [",
    "var RIFT_ZONES = [",
    "function playStartupIntro(done)",
    "STARTUP_INTRO_COOLDOWN_MS = 3 * 60 * 60 * 1000",
    "function nextRiftObjective()",
    "function showRiftMilestone(",
    "function renderRosterJourney()",
    "function showAscendFlash(",
    "function ascendPrismGain(",
    "function dailyQuestEligible(q,s)",
    "var resetInProgress = false;",
    "var resetBootPending = false;",
    "var reloadInProgress = false;",
    "RESET_PENDING_KEY = 'lumenfall_reset_pending_v1'",
    "localStorage.setItem(RESET_PENDING_KEY,'1');",
    "if(resetInProgress || reloadInProgress) return;",
    "if(!resetInProgress && !reloadInProgress) saveState();",
    "function restoreEnemyOrSpawn()",
    "reloadInProgress = true;",
    "restoreEnemyOrSpawn();",
    "spawnEnemy(false);",
    "if(battleActive && main.scrollTop!==0) main.scrollTop = 0;",
    "Lumenfall visual system",
    "branding/lumenfall-mark.svg"
]
for token in required_features:
    if token not in src:
        raise SystemExit(f"QA failed: required feature missing: {token}")

restore_match = re.search(r'function restoreSaveBackup\(\)\{(.*?)\n\}', src, flags=re.S)
if not restore_match or "reloadInProgress = true;" not in restore_match.group(1):
    raise SystemExit("QA failed: save restore is not protected from reload/autosave overwrite")
if "function tick(){\n  if(document.hidden || resetInProgress || reloadInProgress) return;" not in src:
    raise SystemExit("QA failed: game loop is not suspended during reset/restore reload")

if "renderRiftMode();\n  renderRiftObjective();" not in src:
    raise SystemExit("QA failed: expected Rift fast-render path changed")
rift_mode_match = re.search(r'function renderRiftMode\(\)\{(.*?)\n\}', src, flags=re.S)
if rift_mode_match and "syncMainScrollMode" in rift_mode_match.group(1):
    raise SystemExit("QA failed: scroll sync regressed into the 100ms Rift render loop")

print(f"QA passed: {len(scripts)} scripts syntax-checked, {len(required_ids)} unique IDs verified, cache/state lifecycle guards present.")
PY
