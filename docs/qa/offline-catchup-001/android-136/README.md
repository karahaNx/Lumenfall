# OFFLINE-CATCHUP-001 — signed Android0.1.136

Status: historical signed release. Numeric/storage/lifecycle subset passes; legacy
modal paint fails and is corrected by PR56. Required
physical WebView60/TalkBack acceptance remains open under the original request.

| Evidence | Verified identity/result |
| --- | --- |
| Positioning PR | [55](https://github.com/karahaNx/Lumenfall/pull/55), merged |
| Exact validated head | a12459c0c62ec459fc102fc50ebc95a2a574a92b |
| Integrated/build commit | 891f4a4484197702848a3cd7b1cb51b1ff645c96 |
| Integrated tree | 032a21cd6de86ff7b9f575f0435c4d6ac5909ec7; equals validated head |
| Product SHA256 | 64699bd6ba907f145523bb9633a36a2661b28ef3391c69b4e4216e06e378ecb8 |
| Required CI | [37654060758](https://github.com/karahaNx/Lumenfall/actions/runs/37654060758), job112904558428, success |
| CI coverage/runtime | 133 scenarios/12 required negatives/guarded startup; Node20.20.2/Chrome154.0.8037.97 |
| Android build | [37655590959](https://github.com/karahaNx/Lumenfall/actions/runs/37655590959), job112910707643, success |
| Package/version | com.lumenfall.app, versionCode136/versionName0.1.136 |
| Actual public APK | 6834584bytes, asset619268839 |
| APK SHA256 | 2c175583c546f64a7a0ae651803b94ed2c134fe86573bdb8e96edbf2eadbdab0 |
| Established certificate SHA256 | A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21 |
| Actual in-place update | Signed135→136; existing private WebView save storage byte-identical before first launch, no uninstall/reset |

[Preserved APK](../../../../archive/android/offline-catchup-001/Lumenfall-0.1.136.apk).
The [latest release](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)
is moving; check version/SHA256 before later acceptance. Official build-tools35
aapt/apksigner verify package/version/certificate and v1/v2. ZIP CRC and all15
product/font/branding assets match integrated source byte-for-byte.

The actual extracted APK product passes the V8 6.0.286.52 matrix on Node8.3.0:
Clear21 8h302400 kills/14400 ascends; Clear20 8h291959/14597; OFF8h773/0;
72h cap2721600/129600;96h retains capped combat and finishes the existing
80h Guardian's Mastery Study. This is engine evidence, separate from native DOM.

Android8.1/API27/AOSP WebView61.0.3163.98 runs the actual signed APK at
https://localhost in an isolated emulator with no KVM (TCG). Android physical
override200x422/density80 renders400x820 CSS px,dpr0.5. Native QA seeds derivatives
of the unchanged original device save only in this emulator. The driver verifies
executed product JavaScript and stylesheet equal released source before testing.
A DOMContentLoaded debugger pause sets clock/interval/error/write observation
controls before initialization. Product/APK/assets are unchanged.

Exact parity cases freeze Date/performance.now and hold tick/save intervals;
real native frames, Android input/background/resume and WebView storage remain.
The256-event bound still applies; these cases do not measure the8ms clock target.
The additional advancing-clock case separately tests processing time with the
real monotonic work clock. Native numeric/storage/lifecycle checks now pass;
readability remains separately failed in136, so overall UI acceptance is not PASS.
No physical timing/geometry/TalkBack acceptance is inferred from this setup.

The full native8h Clear21 transaction completes +302400 kills/+14400 ascends
with one primary commit/matching recovery,1708 frames and no runtime errors.
The software-emulator receipt observes a primary write at991838.395ms from QA
initialization; wall time after seed initialization is982087ms. This is TCG
software timing, not a phone benchmark. Continue/repeated return/live play and
600s background interruption/retry pass. The initial adapter stops at expected
empty pidof exit1 during process startup; its raw failure stays preserved.
The corrected remaining-case adapter retries only this expected empty status.
Its receipt imports the first four completed cases, then passes600s force-stop/
relaunch, actual primary-write failure/retry, corrupt-primary recovery, actual
Settings backup/restore and advancing Date/performance processing time. The last
case earns7075 kills/336 ascends, including foreground processing beyond6300/300,
while offline accounting stays600s, with one primary commit/matching recovery.
See native-integration-initial.{json,txt}, native-numeric-storage.{cjs,json,txt}.

Unmodified136 computed styles show backgroundImage none/backgroundColor
transparent: WebView61 lacks color-mix and eight-digit hex syntax. The modal
text overlaps battle art in native-return.png. PR56 changes only the one
modal color syntax to equivalent rgba; product JavaScript is unchanged.
The candidate diagnostic is instrumented; final signed acceptance belongs
to the newer release, not this historical APK. See ../legacy-paint/README.md.

Node22+ reproduction with an isolated checkout of891f4a4 and signed136 installed:

    LUMENFALL_QA_REPO=/absolute/repo LUMENFALL_QA_ADB=/absolute/sdk/platform-tools/adb LUMENFALL_QA_APK=/absolute/Lumenfall-0.1.136.apk node docs/qa/offline-catchup-001/android-136/native-integration.cjs /tmp/native-results.json

The original full driver retains its adapter failure. For remaining-case
reproduction, copy native-integration-initial.json to
/tmp/lumenfall-native-136-integration.json, then run native-numeric-storage.cjs
with the same environment variables. Do not mix this136 adapter with later
source stylesheets.

Use emulator-5554/port5554 with Android8.1/API27/default x86_64 system image,
foreground com.lumenfall.app/.MainActivity and matching viewport above. Never
run the save-seeding driver on a player's installation. SDK setup, native tools
and Node are required; no Python or npm test dependency. The standalone engine
probe accepts an extracted APK HTML and repository path.

APK134 fails native advanced-save startup on replaceChildren; PR54 fixes that
DOM call plus reproduced processing/daily retry findings. APK135 completes the
native8h transaction but Continue is off-screen because inset is unsupported.
PR55 uses equivalent positioning longhands only for functional overlay/intro;
product JavaScript is byte-identical to135. [Before/after positioning evidence](../legacy-layout/README.md)
and [historical135 receipt](../native-release/README.md) preserve actual failures,
including inconclusive initial adapters. No historical/instrumented failure is PASS.

GitHub confirms the normal non-forced Git merge after connector mutation errors
and unavailable CLI API. No gate/protection changes. Complete raw CI/build logs
retain original decoded bytes; length/content checks match connector receipts.
Their hashes and all receipts are listed in MANIFEST_SHA256.txt. Existing build
metadata warnings remain in raw logs. No independent human review is claimed.

[PR52](https://github.com/karahaNx/Lumenfall/pull/52) reconciles these releases and
current task/project status without product/mobile/signing/workflow changes.
Its final exact-head validation/integration receipt belongs in its PR body/checks.
Keep the feature and owner chat open until required acceptance is recorded.

Automated review of the historical adapter identifies limits: it trusted an
import by APK hash only, stamped API27 rather than reading the SDK property,
and tested export/restore over unchanged progress. The observed Android/UA and
raw four prerequisite cases remain preserved; older backup coverage establishes
export/UI reload, not replacement of distinct state. Do not reuse that raw
adapter as future acceptance. native-numeric-storage-validated.cjs is a
prepared future adapter with a hash-pinned committed first-stage receipt, actual
Android/API/WebView assertions and distinct in-memory/primary/recovery sentinel
for Restore; that revised136 adapter has not been rerun. Final137 verifies actual runtime and restores distinct state separately; its
composite proof pins the known completed first-stage receipt, rather than
claiming one uninterrupted fresh run.

For the prepared validated136 reproduction, copy this136 evidence folder into
the isolated891f4a4 checkout as well, so its hash-pinned prerequisite exists.
The current137 receipt and checklist supersede this historical version.
