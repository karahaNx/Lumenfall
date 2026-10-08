# RIFT_CAST_TEXT_001 — verified delivery

F13 is integrated through [PR63](https://github.com/karahaNx/Lumenfall/pull/63),
commit ab46c0c7f30667c24325b6271f811b46b159d0d1. Powered compact Rift cards no
longer repeat CAST/Ready. The existing bar retains ability names and accessible
state/charge/timing; Lv 0 and existing visuals remain.

[Machine receipt](delivery.json) · [Task](../../../tasks/RIFT_CAST_TEXT_001.md) ·
[Immutable signed APK 0.1.142](../../../../archive/android/rift-cast-text-001/README.md).

| Evidence | Result |
| --- | --- |
| [Final CI metadata/integration](ci-integration-receipt.json), [raw log](ci-37713097586.log.gz), [acceptance lines](ci-37713097586-acceptance.txt) | CI37713097586, head4452f7a:148 defaults,12 negatives, source/tooling and guarded startup PASS. |
| [Integrated matrix](integrated/candidate-matrix.json), [existing checks](integrated/existing-checks.json), raw logs in integrated/logs |12 profiles/384 observations and all 12 scoped regressions PASS on integrated bytes. |
| [Legacy renderer](integrated/integrated-v8-f13.json), [self-review](combined/self-review.json) | V8 6.0.286.52: two inline scripts parse,32 renderer fixtures PASS. Self-review only. |
| [Current baseline matrix](combined/baseline-matrix.json), [geometry comparison](combined/large-text-comparison.json), [negative controls](combined/negative-controls.json) | Same measured200% name overflow; both causal failures caught. |
| [Build/release](build-release-receipt.json), [raw build log](build-37714666181.log.gz), [local identity](native/apk-142-identity.txt), [CRC/assets](native/apk-142-assets.json) | Package com.lumenfall.app, version142, established certificate, release digest, every ZIP CRC and all 15 assets PASS. |
| [Actual native acceptance](native/native-acceptance.json), [continuation log](native/native-resume.log), [signed 138 baseline](native/baseline-native.json) | Signed138→142 save storage/first-launch ownership,320/390/430px,120 observations/24 real casts, 44px controls, native AX, font scale 2 and Android Tab/focus PASS; no runtime errors. |

Product SHA256: 835e1f19c4d51025a41583786c52d8b6ff09ab11cf4afcfec4a49146f40734b3.
APK SHA256: ec361d641cd5c5dff62322cc90e85bfff6d42d0f5f0877630469f97c451756a0.

Native identity: Android8.1/API27/WebView61.0.3163.98 software emulator. No physical
WebView60, TalkBack or independent-review claim. The V8 fixture verifies the
Chrome60 engine generation separately. Native61 lacks prefers-reduced-motion;
modern-browser tests retain its existing behavior. Large-text overflow is an
unchanged limitation, not full layout acceptance.

The first native attempt's startup-socket race and second attempt's rejected
clamped sub-200px physical display are retained in native/native-attempt-1-transport-race.log
and native/native-attempt-2-width-failure.json. Final tests correct only the harness. Successful native update/320/390px results are preserved in native/native-attempt-3-width430-failure.json; the same unchanged signed 142 continues at 430px and completes AX/font/keyboard acceptance.
The default local Chromium151 dump-DOM timeout is in logs/default-local-timeout.txt;
scoped local checks use the documented CDP adapter, while required CI is unmodified.
Earlier CI146/147 logs and initial214d454/0e9b54c evidence remain historical.

Replay (Node22+ for native WebSocket; existing product keeps WebView60 compatibility):

```bash
node tests/behavioral/rift-cast-text.cjs . /tmp/f13-matrix
node docs/qa/rift-cast-text-001/run-checks.cjs . /tmp/f13-existing
node docs/qa/rift-cast-text-001/finish/direct-adb.cjs wm size 320x675
node docs/qa/rift-cast-text-001/finish/direct-adb.cjs wm density 128
node docs/qa/rift-cast-text-001/finish/native-f13.cjs prepare BASELINE_138_APK BASELINE_INDEX EVIDENCE_DIR
node docs/qa/rift-cast-text-001/finish/native-f13.cjs accept FINAL_142_APK EXTRACTED_INDEX EVIDENCE_DIR
```

Native tooling requires the isolated unauthenticated API27 emulator on port5555
and already-installed signed 138. It asserts ro.kernel.qemu=1. Prepare replaces
only its QA save; accept performs pm install-r without clearing storage. Real
private function handles/paused test clock supply fixtures after exact product
verification. APK assets are not instrumented. Do not use these fixtures on a
user's device/save. [ADB transport](direct-adb.cjs), [native driver](native-f13.cjs),
[asset verifier](verify-assets.cjs), [legacy probe](v8-f13.cjs) are saved for replay.

Following PR69/d95205f, the F13 renderer is byte-identical. [Current-main overlap](cosmetics-overlap/receipt.json) records 24 default/equipped-cosmetic profiles (768 observations), all 12 scoped checks and legacy parser/renderer PASS. The earlier stale-stage harness failures are preserved in cosmetics-overlap/stale-stage-diagnostic and superseded by the current-root run. Native acceptance is for the immutable142 APK.

For APK142 source/asset replay use integration ab46c0c; current main contains later Cosmetics code. The successful native receipt combines the signed update and 320/390px checkpoint with the same-APK 430px/AX/font/keyboard continuation. Each phase retains its raw evidence. The emulator silently clamps forced physical dimensions to 200px minimum and twice its initial size; density 128 keeps all three requested CSS widths within those limits.
