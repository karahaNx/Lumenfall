# Native preparation — not feature acceptance

The immutable signed `archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk`
was installed on an isolated AOSP API27 x86 emulator. `baseline-native.json`
attests the actual installed APK hash, exact unchanged product script, package,
version, user agent and successful cold-launch preservation of Swift25 and both
owned support Ultimates. The APK source SHA256 is
`5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c`.

Run with Node20+:

```text
node docs/qa/support-uptime-001/implementation/native-support.cjs prepare archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk /tmp/lumenfall-support-baseline-143-index.html docs/qa/support-uptime-001/implementation/native
```

The index argument is extracted with ZIP CRC verification from the signed APK's
`assets/public/index.html`. The helper uses debugger handles in the real installed
WebView; it never modifies the APK. It asserts `ro.kernel.qemu=1` before using the
isolated emulator's unauthenticated direct ADB transport.

Emulator37.3.3.0 build16489710, Android8.1/API27, WebView61.0.3163.98. The downloaded
official API27 AOSP x86 r01 image runs with software CPU/GPU,390×844 at160dpi.
This is an emulator observation, not physical-device/TalkBack acceptance or a
claim that WebView61 is WebView60. Exact V8 6.0 motor verification is separate.

Preparation first exposed a missing screenshot helper, then an overly strict
ownership assertion: with default Auto-Empower queue intent, normal cold-return
progress bought additional Wisp levels. The helper was corrected and the fixture's
queues explicitly disabled; `prepare-failure.json` retains the second attempt.
No product change was needed. The successful fixture includes paid history and
Ultimates for the later signed update check.

The emulator was paused after preparation to release CPU. Candidate installation,
signed in-place update/storage preservation, selected value migration and native
support acceptance remain pending. Neither this baseline nor an open PR completes
SUPPORT_UPTIME_001.
