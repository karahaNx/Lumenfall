# F24 Rift cosmetics — delivery evidence

Feature RIFT_COSMETICS_001, owner checkout /workspace/RIFT_COSMETICS_001.
[Requirements/status](../../tasks/RIFT_COSMETICS_001.md),
[continuation](CURRENT_CHECKPOINT.md), [PR79](https://github.com/karahaNx/Lumenfall/pull/79).
Status: required full CI and integrated signed APK acceptance pending.

Current product SHA256 696d9e22cae0f4482becf6fda3f6db64544945952803ce1bd45870f41f83cfaf.
Main14d5f3a dependencies are preserved. Native test asserts upstream Offline12h
schema2 refund rather than treating accepted repayment as currency loss.

`guidance-candidate/results.json` is the current focused168-record acceptance:
six themes × three enemy states × nine mobile/text/motion profiles plus six
contracts. Browser Google Chrome154.0.8037.57, Node24.19.0. Commands:

```
node tests/behavioral/rift-cosmetics.cjs --chrome CHROME --source index.html --negative --out EVIDENCE
node scripts/ci/validate_source.cjs
node tests/tooling/run.cjs
node scripts/codex/check_context.cjs --task docs/tasks/RIFT_COSMETICS_001.md
node tests/behavioral/offline-12h.cjs
node tests/behavioral/loadout-memory.cjs --vm-only --source index.html
```

Source/tooling/context PASS. Incoming Offline12h32 and Loadout Memory437 PASS
(`checks/offline12h-guidance.json`, `checks/loadout-guidance.json`).
`checks/legacy-guidance.json` parses the actual scripts and verifies all themes
and both save copies on Node8.3.0/V8 6.0.286.52; this is an engine probe.
Earlier candidate folders preserve earlier baselines, including regional
geometry comparisons and Save Backup/Formation/Comet checks. Raw CI logs are
gzip; two whitespace-bearing local logs are also gzip, with original bytes intact.

CI37743831575 passed168 gameplay cases then caught large-text overflow. Local
same-version Chrome passed the old layout with a different binary/platform;
do not claim local reproduction. Added wrapping and detailed failure metrics.
CI37749249589 passed168 F24 checks, superseded by a full-width status refinement
after screenshot review. Final CI37749561577 is running, with F24 step PASS.
All required gameplay, negative controls and runtime smoke gates remain.

## Native WebView60 environment

User requested creation of needed tests. `tools/setup-webview60.cjs` configures
only isolated qemu/API25 with the pinned public LineageOS60.0.3112.78 provider;
`native60/provider.json` records exact bytes/source. The game APK is unmodified.
Actual game UA is Chrome60.0.3112.78 on Android7.1.1, not inferred from API level.
Signed143 baseline survives actual cold launch, `native60/baseline-native.json`.
Actual Android UIAutomation bounds are captured in native input preflight files.

Final command, once signed integrated APK is available:

```
node docs/qa/rift-cosmetics-2026-10-08/tools/native-rift-cosmetics.cjs accept FINAL_APK docs/qa/rift-cosmetics-2026-10-08/native60
```

It verifies real signed upgrade without clearing data, original purchase value,
second cold-launch refund idempotence,54 theme/enemy/mobile observations,
Android font_scale2, actual coordinate tap through Radiant and actual Enter.
Fixtures use real Backup Restore and confirmation/reload; clocks isolate UI
measurements after uninstrumented upgrade/cold acceptance. Old143 immediate
selection saving fails when periodic writes are paused; this old bug is recorded,
and its prepared baseline imports an already selected preference. Final APK
must pass the new immediate-save contract. Setup/CDP/fixture failures are retained.

Software emulation does not establish physical device or TalkBack acceptance.
WebView60 predates reduced-motion media support; modern browser matrix verifies
the static alternative. Actual Android font-scale setting and computed fonts
will be recorded separately. No independent review claim.
