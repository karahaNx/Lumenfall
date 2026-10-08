# OFFLINE-CATCHUP-001 — corrected Android0.1.135

Historical135 receipt: integrated/published; native eight-hour transaction passes,
but Continue is off-screen on WebView61 and native UI acceptance fails.
The functional positioning correction follows in PR55; physical WebView60/TalkBack
acceptance remains open.

- [PR54](https://github.com/karahaNx/Lumenfall/pull/54), exact validated head
  `bc3370777f6ecdf05b3fa55f1397872d6071790d`, integrated main
  `458dbbc25f14c06149b4379ba6475ed16ad58a57`.
- The entire integrated tree equals the validated head. Product SHA256:
  `006213815911c04f273d7568e3ea410df7c0114c956f48dd534e3ec2a31911e0`.
- [CI37642617607](https://github.com/karahaNx/Lumenfall/actions/runs/37642617607),
  job112865675821, success: all133 scenarios, all12 required negatives, guarded
  startup, tooling/source/staging. Node20.20.2, Chrome154.0.8037.57.
- [Android37645420468](https://github.com/karahaNx/Lumenfall/actions/runs/37645420468),
  job112874786533, success; versionCode135/versionName0.1.135.
- Actual public APK:6834577 bytes; asset619085430; SHA256
  `9c0ef841d215176db60e2bb1b41ff69f98a78421dcd2188c00346acd9c469a8e`.
  [Preserved APK](../../../../archive/android/offline-catchup-001/Lumenfall-0.1.135.apk).
  The moving [latest APK](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)
  must be rechecked if it changes.
- Package `com.lumenfall.app`; established certificate SHA256
  `A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.
  Official build-tools35 aapt/apksigner verify package/version and v1/v2.
  ZIP CRC and all15 product/font/branding assets match main byte-for-byte.
- Actual extracted APK product passes V8 6.0: ON8h302400 kills/14400 ascends,
  1181 cooperative batches. This engine probe is separate from native DOM.
- `upgrade.json`: actual signed in-place134→135 install passes; existing private
  WebView save storage is byte-identical before first launch. No uninstall/reset.

The Android8.1/API27 AOSP x86_64 emulator runs WebView61.0.3163.98 without KVM.
APK134's native advanced-save startup failed on replaceChildren; PR54 fixes
that path and both reproduced PR51 P2 findings. Its review revision also fixes
wall-clock corrections and prompts across another midnight. See the
[focused before/after evidence](../legacy-webview/README.md).

Native QA seeds derivatives of the unchanged original device save only in the
isolated emulator. A DOMContentLoaded debugger pause sets clock/interval/storage
observation controls before product initialization, without changing APK/source.
The executed135 case freezes Date.now/monotonic clocks and intervals while
retaining real native frames/input. The planned additional cases are not135 PASS.
The small render-surface configuration is400x820 CSS px, dpr0.5 (Android physical
override200x422,density80); the original390x844/density160 run hit the15-minute
driver deadline without a completed primary save or runtime exception. That is
diagnostic evidence, not acceptance. The controlled adapter allows45 minutes per long case in software emulation.
Its host was interrupted for read-only progress inspection while the Android job
continued. Collection observes +302400 kills/+14400 ascends, one completed primary
write, matching recovery and3262 frames/no errors. Completion is observed within
25 minutes of seeding; the commit was not timed, so this is an upper bound.
Continue then fails: y1047 in820px viewport. Preserved native geometry/screenshot
and the registered missing-inset regression reproduce this legacy CSS issue.
A diagnostic with candidate longhands permits real native Continue input, but
that instrumented page is not corrected signed-release acceptance. See
[legacy positioning](../legacy-layout/README.md). Physical timing/TalkBack are not inferred.

Temporary HTTP candidate attempts opened the system WebView shell; they do not
count as installed-app acceptance. Their adapter failures are historical
diagnostics. Only the signed135 app at https://localhost is the native target.

Full decoded CI/build logs retain their original bytes; lengths/content checks
match the connector receipts and cryptographic file hashes are recorded. Build
logs retain existing metadata warnings. APK134 is preserved separately as failed
legacy-DOM historical evidence; no replacement signing identity was introduced.
The user's original request keeps acceptance/chat open until required checks
are recorded. No independent human review or physical-device PASS is claimed.

`v8-matrix.json` also passes actual135 extracted source on V8 6.0 for
Clear21/Clear20/OFF8h,72h cap and96h Study beyond combat cap. It records
2721600 kills/129600 ascends at the cap and unchanged combat beyond it.
This is engine evidence, separate from the native failed Continue check.
