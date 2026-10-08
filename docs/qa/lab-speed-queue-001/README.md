# F12 integrated verification

The [task](../../tasks/LAB_SPEED_QUEUE_001.md) records original requirements,
baseline, scope and remaining acceptance. PR46/B2 is integrated through PR57 at
20aaae62a4b6e46f8d75775085918eaba4e8de29. Main advanced through PR60/59 during CI;
latest baseline is0e9b54c8d62a873bd48625f4a20ee18078e8a8f1, product SHA256
a64747dcec3c26c0b5dea3f2e5c1bac521de557e38547b1195b5a3660234b0df.
All F12 replays pass again on this source and published APK0.1.140.
No additional F12 product patch is needed.

## Reproduce fresh integrated checks

Use Node20+ and a supported Chromium browser on PATH, with loopback/browser access:

```sh
node docs/qa/lab-speed-queue-001/integrated-review.cjs . /tmp/f12-integrated-cdp
node docs/qa/lab-speed-queue-001/integrated-drivers.cjs . /tmp/f12-integrated-drivers
node scripts/codex/check_context.cjs --task docs/tasks/LAB_SPEED_QUEUE_001.md
```

The first driver uses the current Node harness's unchanged instrumentation and
assertions via CDP: contracts82, chronology101, conservation16735, numerical340,
four persistence paths, UI47 at each of320/390/430px, and additional measured
200% Lab text/focus/contrast/reduced-motion checks. Minimum control text contrast
is8.00127:1. All14 records pass with clean browser teardown.
[Complete report](raw/integrated-cdp/review.json) and individual JSON/screenshots
are retained. Intentional reloads retry only lost execution contexts; completed
QA JSON, scenario identity and a clean runtime-error list remain mandatory.

Both replay scripts use the harness's existing browser lookup, exposed by an
additive export. Google Chrome, Google Chrome Stable, Chromium and
chromium-browser are supported. An optional third argument or
LUMENFALL_QA_CDP_CHROME supplies an explicit browser path. Actual selected path
and version are recorded. The automated-review fix passes both complete replays;
the existing lookup also passes a Google-Chrome-only PATH check using a host
Chromium alias. No claim of a separate Google Chrome binary is made.
Latest current-main evidence is in raw/current-main-140/. Prior review revision
evidence is in raw/replay-revision/; initial integrated results remain in
raw/integrated-cdp/ and raw/integrated-drivers/. Each retains its own source hash.

The second driver invokes existing process-aware Lab offline/runtime/touch/
keyboard/reduced-motion drivers unchanged. All four pass. “Native” in these
scenario names means browser input, not physical Android. Runtime covers1029
assertions with BigInt/getBigUint64 unavailable. Its large raw log is losslessly
gzip-compressed; other logs/results/screenshots are in raw/integrated-drivers/.
Offline covers detached work, failure/retry, once-only payment, legacy saves,
recovery failure, processing time and the existing cap/tail.
[Driver result](raw/integrated-drivers/results.json).

## Released APK and legacy engine

Current APK0.1.140/versionCode140 was built at main0e9b54c by run37710185974.
Fresh aapt/apksigner identity, all15assets/526CRC entries and the actual V8 6.0
Lab offline/payment/retry assertions PASS. Current release asset620269725 is
6,837,509bytes; SHA256c0c81462151c485b16f85dc2c0e53d258ba45c60f92a32539e9e2d6a7153696d
matches GitHub's digest. Results: raw/current-main-140/identity.txt, assets.json
and integrated-apk-v8-lab.json. No new release was requested by this chat.
The original published signed140APK is preserved unchanged in
[the Android archive](../../../archive/android/lab-speed-queue-001/README.md)
for exact-version device acceptance after android-latest changes.
The following138 evidence remains historical and is not claimed as140 acceptance.

The actual release APK was freshly downloaded and checked with existing tools:
aapt/apksigner identity gate and the unchanged Node ZIP/asset verifier.
[Identity](raw/integrated-apk-identity.txt):
0.1.138/versionCode138, com.lumenfall.app, established certificate
A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21.
[Assets](raw/integrated-apk-assets.json): 526 CRC entries/all15 assets match main;
APK SHA25681b9be7edea971335a06f06d1894d91e75a92736738cc935fc2a920a26a02e1e
matches GitHub asset619954273, size6837151.

```sh
node docs/qa/offline-catchup-001/native-release/verify-assets.cjs APK_PATH /tmp/f12-assets.json /tmp/f12-apk-index.html
node docs/qa/lab-speed-queue-001/legacy-engine.cjs NODE_8_3_PATH /tmp/f12-apk-index.html /tmp/f12-v8
NODE_8_3_PATH docs/qa/offline-catchup-001/native-release/v8-release-matrix.cjs /tmp/f12-apk-index.html . > /tmp/f12-v8-matrix.json
```

The modern legacy-engine orchestrator executes the existing Lab integration
assertions on actual V8 6.0.286.52/Node8.3.0 using the extracted released HTML.
Only builtin import names, equivalent strict assert aliases, and source path
are adapted. All assertion statements and product bytes are unchanged.
[Lab result](raw/integrated-apk-v8-lab.json) records original/adapted hashes.
The existing release matrix checks Clear21/Clear20/OFF8h,72h cap and96h Study
tail; its138 raw JSON/text record five passing cases. These are engine checks,
not native DOM/lifecycle/TalkBack acceptance.
Initial adapter failures (old Node cannot classify modern socket stdout or
import assert/strict) were host tooling failures. Regular-file output and strict
assert aliases fix the adapters; retained attempt2 is not called PASS.

Integrated full CI146 defaults/12 negatives/guarded startup and signed build
evidence are already durable in
[the integration receipt](../feature-branch-integration/README.md).
This evidence checkpoint also runs required pre-merge CI. Build workflow
paths do not include these docs; no replacement APK is published.

## Historical candidate evidence and remaining work

validation.json, remote-snapshot.json, review.cjs and raw/cdp/ describe the
7 October frozen B2 proposal, not current status. review.cjs deliberately retains
the original B2 Python instrumentation, source hash and assertions; it is a
historical replay, not current product tooling. Earlier sandbox/dump-dom,
reload-context and incorrect-color-parser attempts remain unchanged in raw/.
Debian Chromium151 DOM export also hangs on static/unchanged main; CDP is used
locally without weakening assertion gates. Full required CI uses its normal
configured browser and harness.

At 320px/200% text the select can shorten the option suffix; tier/price remain
visible and the full option label is retained. Whole-app large-text, F11 dialog,
other layout features and historical B2 stress acceptance are not claimed.
Self-review is not independent review. Required affected-phone/exact WebView60/
TalkBack acceptance remains OPEN; use [the checklist](DEVICE_ACCEPTANCE.txt).
Do not archive this feature chat until the remaining acceptance passes.
Raw adb preflight failures are in raw/device-preflight/: the read-only Android
configuration mount prevents enumeration and this host exposes no USB/KVM.

Source_Index.txt and START_HERE.txt describe the current continuation.
PROJECT_STATE_DELTA.txt is the superseded local proposal retained for history,
not current policy. manifest.json inventories payloads except itself.
No costs, rewards, schema, game/Android files, signing or workflows change.
The existing browser lookup is exported for these replay scripts; no test
assertion, instrumentation or acceptance gate changes.
