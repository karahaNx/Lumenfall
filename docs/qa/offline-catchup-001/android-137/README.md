# OFFLINE-CATCHUP-001 — signed Android0.1.137

Integrated and published. Available emulator, source and engine checks pass.
Required physical exact WebView60/TalkBack acceptance remains OPEN under original
request point7; the feature/owner chat is not ready to archive.

| Evidence | Verified identity/result |
| --- | --- |
| Final correction | [PR56](https://github.com/karahaNx/Lumenfall/pull/56), merged |
| Exact validated head | 187e09f1a44e7baf3e5af83d2f7c480d2a265628 |
| Integrated/build commit | 1ffdc5e3af37754bf0541207caab3a6bb4537e51 |
| Integrated tree | 9635b53032c53ac9f3cf91599bcc8f642df58d0e; equals validated head |
| Product SHA256 | 6fae43e9c558f1752d580d7289e49f2a7c875f673874ff426a4b0247304ba8f2 |
| Game JavaScript SHA256 | 36c9911d8913534e484f3cefeb5fc712cc48ee662144d40f1d4baf898572f81f; byte-identical to135/136 |
| Required CI | [37663184859](https://github.com/karahaNx/Lumenfall/actions/runs/37663184859), job112936048840, success |
| Coverage/runtime | 133 scenarios/12 required negatives/guarded startup; Node20.20.2/Chrome154.0.8037.57 |
| Android build | [37665516076](https://github.com/karahaNx/Lumenfall/actions/runs/37665516076), job112943591426, success |
| Package/version | com.lumenfall.app; versionCode137/versionName0.1.137 |
| Actual public APK | 6834604bytes; asset619437240 |
| APK SHA256 | 44f0bc792ad3510f006019fba6182b5551f17c8e18d9e2fc8f6816da474148f5 |
| Established certificate SHA256 | A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21 |
| Signed update | Actual136→137 in-place; private WebView save storage byte-identical before first launch |

[Preserved APK](../../../../archive/android/offline-catchup-001/Lumenfall-0.1.137.apk).
[Latest APK](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)
is a moving URL: confirm version/hash before later acceptance. Official Android
build-tools35 aapt/apksigner verify package/version/certificate and v1/v2 signatures.
ZIP CRC and all15 product/font/branding assets match integrated source exactly.
Only public APKs/certificate information are preserved; no private signing key.

Actual extracted137 product passes V8 6.0.286.52/Node8.3.0: ON Clear21 8h
302400 kills/14400 ascends; Clear20 8h291959/14597; OFF8h773/0;72h combat cap
2721600/129600;96h keeps combat capped and finishes eligible80h Guardian's
Mastery Study beyond the cap. This engine matrix is separate from native DOM.

Actual signed137 at https://localhost runs in Android8.1/API27/AOSP WebView
61.0.3163.98. The isolated software emulator uses TCG/no KVM, physical override
200x422/density80, rendering400x820 CSS px/dpr0.5. Native137 cases use600s windows,
not8h. Cold Clear21 completes6300 kills/300 ascends with one primary commit,
matching recovery and progressing real native frames. The return gradient is
painted and opaque, its overlay covers the viewport, Continue receives native
input, and repeated return/live play pass. Background interruption, force-stop/
relaunch, actual primary-write failure/retry, corrupt-primary recovery, real
Settings backup/restore and advancing processing-clock checks pass. No observed
game/protocol runtime errors. Screenshot: native-return.png, from the third137
cold600s attempt on the same APK/stylesheet; its later debugger failure is
separately preserved, so that attempt is not a full PASS.

Full native8h evidence belongs to [signed136](../android-136/README.md):302400/
14400, one commit/recovery,1708 frames/no errors. Its modal paint fails separately.
137 changes only one CSS color syntax; exact game JavaScript identity connects
that long native transaction with137, without claiming a137 native8h rerun.
Long cap/96h/Clear20/OFF engine checks do not establish native long-window timing.

Native controls seed derivatives of the unchanged original save only in the
emulator, through a DOMContentLoaded debugger pause. Exact parity cases freeze
Date/performance.now and hold intervals while real frames/input/storage remain.
They test the256-event work bound, not the8ms clock target. The additional
advancing Date/monotonic case tests actual processing progress without enlarging
offline accounting. Executed game script and stylesheet equal137 source before
testing; no APK/product assets or stylesheet override are used for acceptance.
The adapter retries only expected empty pidof exit1 during process startup.

The final receipt is a composite: nine completed cases from the strictly
hash-pinned native-integration-second.json, plus a new600s fixture, distinct-state
Restore and advancing processing checks. It is not one uninterrupted fresh run.
The prerequisite SHA256/case set/runtime/source/APK identity are checked before
reuse, so a partial or other-runtime receipt cannot become PASS. A third
interrupted attempt hit a legacy debugger reload race and stays preserved.
The remaining driver waits for a settled document and ignores events from stale
WebSocket connections. native-integration.cjs is the prepared full reproduction
with those guard changes; it has not been rerun through every case.

Reproduce the accepted remaining-case run with Node22+ and matching signed APK:

    LUMENFALL_QA_REPO=/absolute/repo LUMENFALL_QA_ADB=/absolute/sdk/platform-tools/adb LUMENFALL_QA_APK=/absolute/Lumenfall-0.1.137.apk node docs/qa/offline-catchup-001/android-137/native-integration-remaining.cjs /tmp/native-results.json

Use emulator-5554/port5554 and foreground com.lumenfall.app/.MainActivity. Never
run the save-seeding driver on a player's installation. SDK/native tools and
Node are required. Active tooling is JavaScript; historical originals are intact.

Before/after failures are preserved under legacy-webview, legacy-layout and
legacy-paint. Both PR51 findings and PR54 clock-jump/second-midnight findings
were reproduced and fixed. PR56's evidence-preservation finding is addressed
by committed136 corrected adapter/pass records in187e09f. Later review identifies
import/runtime/restore limits in that historical driver: its backup establishes
export/UI reload only. The prepared future136 adapter pins the committed input
and asserts actual runtime (not rerun);137 verifies actual Android/
SDK/WebView and restores over distinct in-memory/primary/recovery progress.
The original137 adapter connected before the bundled document loaded; its
failure/driver stay preserved. A second adapter attempted private state from
the global scope; that failure/driver is also preserved. Private-scope and click
breakpoint adaptations are preserved as failed helpers. The final remaining driver loads changed saved progress at a
controlled relaunch, verifies a second real export saves that changed loaded
state, then pastes/restores the original backup over it.
It waits explicitly for the product document before identity checks. No failed
adapter is game acceptance. This is self-review and automated review/checks;
no independent human approval is claimed.

Complete raw CI/build logs and receipts are listed in MANIFEST_SHA256.txt.
PR52 saves release/native evidence and current status without product/mobile/
signing/workflow changes; its final CI/integration receipt is in its PR body.
The concrete remaining phone matrix is DEVICE_ACCEPTANCE.txt. Keep untested
physical WebView60/TalkBack rows pending; no new feature or archive follows.
