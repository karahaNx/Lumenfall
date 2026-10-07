# SAVE_BACKUP_UI_001 — local candidate evidence

Final base: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` (merged PR51).
Final index SHA256: `b247680333f2a732c952221dd83a80237d9ffe6b320021c533e636f19eb8947c`.
Code/test freeze: `e4f39c83226067d6a808823f2da20a185c1ae429`.
This packet is local preparation for a coordinated writer checkpoint.
It is not GitHub integration, independent Core/QA acceptance or an APK release.

## Commands

Run from the feature checkout with Node.js 20+ and a working Chrome on PATH:

```sh
node scripts/codex/check_context.cjs --archives
node scripts/ci/validate_source.cjs
node scripts/verify_apk_identity.cjs --self-test
node tests/tooling/run.cjs
node tests/behavioral/run.cjs --web-root mobile/www --raw-artifacts /tmp/save-backup-ui-evidence
node tests/behavioral/run.cjs --web-root mobile/www --scenario self-test-save-backup-placement
node tests/behavioral/run.cjs --web-root mobile/www --scenario self-test-save-backup-confirmation
```

Stage `index.html`, `fonts/` and `branding/` as described in CODEX_START.
The last two commands must exit 1 with a completed failing result. The twelve
existing workflow negative controls must likewise fail as expected.
The current workflow's guarded browser smoke was run on a throwaway staged
copy; its result is in `smoke.log`.

Standalone UI command (also registered as `save-backup-ui` in the default suite):

```sh
node tests/behavioral/save-backup-ui.cjs --chrome /path/to/chrome --web-root mobile/www --evidence /tmp/save-backup-ui
```

## Results, evidence and limits

PASS: 133 default scenarios, 153 viewport-expanded results; all 14 expected
negative controls caught. The final native UI rerun passes all 12 profiles.
Source, tooling, archive/context, APK-verifier self-test, guarded smoke and
ES2017 syntax pass. Full logs retain earlier failed browser attempts separately.

- `source.log`, `context.log`, `apk-identity.log`, `tooling.log`, `smoke.log`:
  existing source/archive/tooling/APK-verifier/smoke gates.
- `full-suite.log.gz`, `full-suite-summary.txt` and `validation.json`:
  final-suite status and source identity. Gzip was verified against the original
  bytes before replacing the large log; it preserves every individual result.
- `current-raw/save-backup-ui/ui-result.json` and its PNGs: 12 native input
  profiles: 320×568, 390×844, 430×932 × 100%/200% root text × normal/reduced
  motion. Current final browser: Google Chrome 155.0.8059.39.
- `final-ui.log`, `final-ui/save-backup-ui/ui-result.json` and its PNGs:
  rerun after adding the explicit Close-cancellation case to the test. The
  product bytes did not change; this is the final UI-test version.
- UI covers placement, 44px, text fit, keyboard focus/order/trapping, full
  export, clipboard success/unavailable/rejection, validation, Cancel/Back/
  Escape/Close, failed-write rollback, confirmed reload, old-backup offline guard,
  and independently confirmed Reset. Static gradient endpoints are verified;
  actual text/action colors give a conservative minimum 6.32:1 contrast.
- `webview-syntax.log`: all two inline scripts parse as ES2017 with Acorn
  8.16.0. This is syntax evidence and does not claim physical WebView60 acceptance.
- Test-only clock/interval control isolates UI actions from gameplay ticks;
  clipboard/storage failure stubs exercise failure branches. Gameplay and
  persistence regression coverage comes from the separate existing suite.
- `negative-controls.json` and per-control logs: existing twelve expected
  failures plus two new UI causal controls. The new controls move Backup out
  of Save or bypass replacement confirmation, and are caught at the changed
  behavior. None modifies repository product bytes.
- Large raw logs/HTML are losslessly compressed to `.gz`; `compressed-logs.json`
  maps the names. The full-suite log is separately preserved as `full-suite.log.gz`.
- `product.patch`, `b2-patch-check.log`: the UI-only patch applies cleanly to
  the independently reconstructed frozen B2 tree. No B2 bytes were changed
  and no B2 runtime/review/device acceptance is claimed.

Earlier `ui/`, `ui.log`, `negative-*` and `raw/` entries are diagnostic evidence
from the initial b2a1f440 base. The installed Chromium 151.0.7922.173 passed
the native UI driver but hung on minimal CLI `dump-dom` and existing harness
checks, including fresh-load. These timeouts are retained as environment
failures. An official Google Chrome package extracted into `/tmp` passed the
CLI probe and was used for final checks; no repository setup/workflow was
changed to hide the failure. Final results use the rebased source and Node
tooling, not those initial timeout attempts.

Physical Android, WebView60 and TalkBack, a relevant signed APK, remote CI,
main integration and writer release for this feature remain pending. Follow
[the task](../../tasks/SAVE_BACKUP_UI_001.md) before publishing or archiving.
