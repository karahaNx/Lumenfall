# FORMATION_AUTOSAVE_001 / F14 — integrated delivery

Formation autosave is implemented and released. Selecting Push/Farm/Boss makes
that preset the immediate Field/Bench/recruitment save destination. Save is
removed. Full desired intent survives Ascend and recovery; pending members
provide no power or Bonds. Existing stored empty presets remain empty with a
temporary powered Ember; fresh game presets still start with Ember.
**Required physical-device/exact WebView60/TalkBack acceptance remains OPEN.**

## Integration and preservation

[PR76](https://github.com/karahaNx/Lumenfall/pull/76) merged at
`c5fa49704404bccb3ca54d434edb7603dbbf4913`. Its tree
`2d2a5e4c015b030cf7ec3a8bf3ad0e12078e5a32` equals final CI-validated
head `014854c36d92541eb0b381685aecdd9a01319a61`. Product index SHA256 is
`d4b0d7227b2c46ef7c2bde406ea07f2a5a2f34fc395e51fbafcf061e2562ed3e`.
Baseline b0537cb4, PR46/B2 through PR57 and subsequent Save Backup PR77/261b1b7
are retained. Existing Lab/offline/Comet payment, chronology, save migration and
Trial-validation hooks remain. No balance, purchase, signing or package changes.
PR67's broader Bonds/autosave proposal and PR70's presentation work are separate.

Main subsequently integrated Save Backup evidence PR87 and Resonate text PR80
at e2f745c. Their diff affects Resonate text/CSS and its registered scenario;
Formation handlers are unchanged. `current-main-focused/results.json` repeats
the18 Formation checks on the combined product, source SHA256
`ed7e9dc56ee3d068073c9fade277a2b357561d754d13de593420c1da0b27d96d`.
`current-main-v8.json` PASS133/three causal controls and recovered late intent;
`current-main-preservation.json` verifies11 affected gameplay/save functions
byte-identical to APK145 source. Final delivery changes only
scoped documentation/evidence and the immutable APK; no new game release trigger.

## Validation

- `ci-final.json`: [CI37737385840](https://github.com/karahaNx/Lumenfall/actions/runs/37737385840) PASS158 deterministic scenarios, all14 required negative controls, tooling/source/APK-identity self-test and guarded startup. `ci-initial.json` is the earlier157/12 run before PR77.
- `integrated-focused/results.json`: fresh merged-main PASS18 checks, real browser input, 12 Formation profiles (320/390/430px × normal/200% text × ordinary/reduced motion), measured >=44px controls, focus/contrast/save/render purity; contract, rebuild, persistence/reload/backup/recovery, chronology/Core QoL and current Save Backup UI.
- `android/apk-145-v8.json`: actual extracted released scripts on Node8.3.0/V8 6.0.286.52 PASS133 contract assertions/three causal mutant controls, Trial hooks, late intent below current unlock depth and repeated normalization. `android/apk-145-comet-v8.json`:11 Comet cases PASS.
- `combined-offline-v8.json`: existing eight-hour chronological engine case PASS302400 kills/14400 Ascends/1181 batches. V8 6.0 proves engine compatibility, not native WebView60 DOM/input acceptance.
- Self-review/automated verification only; no independent review claim.

Focused command: `PATH=/tmp/formation-tools:$PATH LUMENFALL_QA_CDP_CHROME=/usr/bin/chromium node scripts/qa/check-formation-autosave.cjs --evidence <evidence-dir>`.
Each results file retains commands, source, baseline, exits/timeouts and timings.
Local Chromium151/CDP and Chrome155 CLI; CI Chrome154/Node20.
`RAW_LOG_MANIFEST.json` identifies34 byte-exact raw focused outputs stored as
lossless `.log.gz` files; browser profile caches are excluded.

## Signed Android release

Established [build37739366918](https://github.com/karahaNx/Lumenfall/actions/runs/37739366918)
published **0.1.145/versionCode145**, package **com.lumenfall.app**.
[Immutable binary](../../../archive/android/formation-autosave-001/README.md):
6,842,365 bytes; SHA256
`a40cd30dec0227c97bd54f5d637a424234683da6a13734f830470d08d9fd5725`.
Certificate SHA256
`A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.
`android/build-145.json` preserves build/release asset620998459 metadata;
`apk-145-identity.txt` verifies version/package/certificate.
`apk-145-assets.json` verifies all526 ZIP CRC entries and all15 bundled
HTML/font/branding assets byte-for-byte against c5fa497 source. Android build
tools35/aapt/apksigner/Java21 were used; signing material was never accessed.

`android/native-acceptance.json` identifies the actual installed signed binary
and unchanged native script. Software AOSP Android8.1/API27, WebView61.0.3163.98,
emulator37.3.3.0/TCG; direct ADB and CDP expose private observation handles.
Product source/APK are unchanged. Fixed clock/held intervals isolate immediate
input observations; real cold launches exercise the normal lifecycle.

Actual signed143→145 `pm install -r` PASS. Real native local-storage TAR is
byte-identical before/after installation, before first new launch. First launch
retains roster, three presets, destination, paid ownership and all five currencies
(recorded before/after values are equal). Fixture143 cold launch is verified.
Native touch coordinates derive from actual Android WebView bounds; game window
focus is asserted before input. Real Push/Farm/Boss and Bench/Field input saves
only the selected preset immediately into primary/recovery. Five-member Ascend,
pending Bench/Field and subsequent cold launch retain full intended order.
320/390/430px installed-app controls fit and measure >=44px; no Save exists.
Native screenshots show unobstructed Formation/pending states.
`android/native-keyboard.json` additionally proves actual Android Space selects
Farm and then Boss, saves primary/recovery immediately, preserves all presets
and restores full pending intent. Focus/pressed state/visible outline persist;
recorded keydown/keyup reach the expected real buttons without runtime errors.

Command: `node docs/qa/formation-autosave-2026-10-08/native-formation.cjs accept archive/android/formation-autosave-001/Lumenfall-0.1.145.apk /tmp/formation-apk145.html docs/qa/formation-autosave-2026-10-08/android`.
The helper also supports `prepare` against signed143 and `keyboard` against145.

Earlier harness protocol/private-scope failures are retained in `android/`;
the helper was fixed for old CDP protocol and optimized private closure handles.
Keyboard setup failures are also retained: the first unpaused input did not
activate Farm; a later UIAutomator dump returned null rather than a frame;
the existing bottom navigation target is below44px. The final keyboard check
holds intervals and touches the actual >=44px Boss preset first to acquire
native WebView focus, using the previously measured unchanged window bounds.
The unaffected bottom navigation size remains a separate existing UI finding.
The baseline software emulator showed a System UI ANR, retained as XML/PNG;
Wait was selected and unobstructed game focus verified for acceptance. No physical
or performance claim follows from this software emulator.

## Remaining acceptance and continuation

[DEVICE_ACCEPTANCE.txt](DEVICE_ACCEPTANCE.txt) gives concrete update, real input,
partial/queued rebuild, background/cold launch, backup/recovery, empty stored
preset, narrow/large-text/focus/reduced-motion and TalkBack/exact WebView60 checks.
Physical affected-phone, exact native WebView60 and TalkBack are unavailable in
this environment. Save observed device/version/result evidence in GitHub;
missing required acceptance keeps the feature and this owner chat open.
Do not archive or claim full completion. Shared-file work stops after the final
delivery checkpoint; preserve other feature owners' statuses.
The delivery PR body retains its final CI and integration receipt, avoiding an
additional receipt-only commit/PR cycle after this checkpoint is merged.
