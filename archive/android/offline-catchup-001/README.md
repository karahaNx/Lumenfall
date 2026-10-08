# OFFLINE-CATCHUP-001 released APK

This is the actual downloaded Android0.1.134 release, preserved unchanged for
historical verification after the moving `android-latest` release changes.
Native advanced-save startup failed on WebView61; PR54 fixes the unsupported
DOM call. This binary is historical evidence, not corrected native acceptance.

- Package: `com.lumenfall.app`; versionCode134/versionName0.1.134.
- Build commit: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
- Build: https://github.com/karahaNx/Lumenfall/actions/runs/37626819252.
- APK bytes:6833971; SHA256 `09e53527d8a968801f6457297558efcb4ffcf5b260af47f202447e57455b6f6c`.
- Established certificate SHA256 `A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.

[Release evidence and remaining device acceptance](../../../docs/qa/offline-catchup-001/release/README.md).
The signing certificate is public; this APK contains no private signing key.

APK0.1.135 is also preserved:6834577 bytes; SHA256
9c0ef841d215176db60e2bb1b41ff69f98a78421dcd2188c00346acd9c469a8e.
Build37645420468/source458dbbc25f14c06149b4379ba6475ed16ad58a57,
same package/certificate. It completes the native8h transaction, but Continue
is off-screen on WebView61; PR55 corrects functional positioning.
Receipt: ../../../docs/qa/offline-catchup-001/native-release/README.md.

APK0.1.136 is preserved unchanged:6834584bytes, SHA256
2c175583c546f64a7a0ae651803b94ed2c134fe86573bdb8e96edbf2eadbdab0,
source891f4a4/build37655590959. Its full native8h numeric/storage cases pass;
modal paint fails on WebView61. PR56 fixes the color syntax only.

Current verified APK0.1.137: 6834604bytes; SHA256
44f0bc792ad3510f006019fba6182b5551f17c8e18d9e2fc8f6816da474148f5,
source1ffdc5e3af37754bf0541207caab3a6bb4537e51/build37665516076, same package/certificate.
Native137600s UI/storage and actual extracted engine matrix PASS; required
physical exact WebView60/TalkBack acceptance remains open.
[Current receipt](../../../docs/qa/offline-catchup-001/android-137/README.md).
