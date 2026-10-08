# Auto-Ascend UI evidence

Feature: [AUTO_ASCEND_UI_001](../../tasks/AUTO_ASCEND_UI_001.md).
Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5; no independent review claimed.
Product SHA256 d3588dbdcfab2efa41a45239b312203ae46938e3e0575aa6a8ad7618b79a4df8.

Node24.19.0 / Chromium151.0.7922.173. Local scoped runner:23 positive scenarios
PASS and five expected causal negatives caught with valid failure payloads.
The supplied [CDP adapter](chrome-cdp) executes the original instrumented pages
and assertions because local dump-dom hangs, also on unchanged earlier product.
It does not establish default virtual-time/CI equivalence. Required GitHub CI,
integration and app acceptance are recorded at subsequent checkpoints.

Normal/reduced-motion native-input checks cover320/360/390/430px,100%/160%/200% text:20 profiles PASS. Native touch/keyboard, picker focus/identity/scroll,
real interval damage, Deed-triggered render/frontier expansion,219/safe endpoint,
ON/OFF, invalid/no-op/duplicate saves, Deeds unlock and Comet Trials remain covered.
Controls are at least44px with visible focus; measured native/OFF text contrast
exceeds12:1; ON CSS colors calculate9.81:1. Modern-browser evidence is not physical
Android/WebView60/TalkBack acceptance.

The existing offline-catchup core driver PASS on current product.22 protected
gameplay/save functions are byte-identical to baseline; see protected-functions.json.
V8 6.0.286.52 (Node8.3.0) product parsing and54 target-handler assertions PASS.
Source, existing Node tooling, APK identity verifier self-test and diff checks PASS.
Raw logs/results are preserved under local/ with a SHA256 manifest. Gzipped files
retain their exact original bytes; unzip by gunzip or Node zlib.gunzipSync.

```bash
node scripts/codex/check_context.cjs --task docs/tasks/AUTO_ASCEND_UI_001.md
node scripts/ci/validate_source.cjs
node scripts/verify_apk_identity.cjs --self-test
node tests/tooling/run.cjs
node tests/behavioral/run-auto-ascend-ui.cjs --evidence-dir /absolute/evidence
node tests/behavioral/run.cjs --web-root mobile/www --scenario auto-ascend-target-mobile
node tests/behavioral/run.cjs --web-root mobile/www --scenario auto-ascend-target-reduced-motion
node tests/behavioral/offline-catchup.cjs
```

For this environment only, prepend this directory's adapter on PATH or pass its
directory with --pipe-browser-dir. Preserve default CI; do not replace or skip gates.
The adapter filename needs a google-chrome symlink in a temporary directory.

Required remaining device observations after the signed APK is available:
Deeds purchase/retained ownership; one Ascend picker and separate ON/OFF;219 and
larger targets; keyboard/datalist behavior on exact WebView60;200% Android text;
TalkBack label/status/focus; reduced motion; target changes with both ON and OFF;
manual/automatic cleared-Rift trigger; restart/offline/save/recovery and signed
update preserving old progress/preferences. Record device/OS/WebView/APK versions,
actions and observed outcomes. Keep the feature/chat open if required acceptance
is missing or failed. No physical result is inferred from an emulator or V8 probe.

At200% text, long input values scroll inside the native field; the full value,
caret/focus and control/page geometry are checked. Select fit assertions remain.
A real reward-preview wrap moved main scroll while the picker was focused.
renderAscendSummary now flushes layout and restores that scroll; the renewed
20 profiles assert exact scroll preservation. No gameplay calculation changed.
