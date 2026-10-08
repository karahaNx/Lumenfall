# RIFT_CAST_TEXT_001 — verified delivery

F13 is integrated through [PR63](https://github.com/karahaNx/Lumenfall/pull/63),
commit ab46c0c7f30667c24325b6271f811b46b159d0d1. Powered compact Rift cards no
longer repeat CAST/Ready. The existing bar retains ability names and accessible
state/charge/timing; Lv 0 and existing visuals remain.

[Machine receipt](delivery.json) · [Task](../../../tasks/RIFT_CAST_TEXT_001.md) ·
[Immutable signed APK0.1.142](../../../../archive/android/rift-cast-text-001/README.md).

| Evidence | Result |
| --- | --- |
| [Final CI metadata/integration](ci-integration-receipt.json), [raw log](ci-37713097586.log.gz), [acceptance lines](ci-37713097586-acceptance.txt) | CI37713097586, head4452f7a:148 defaults,12 negatives, source/tooling and guarded startup PASS. |
| [Integrated matrix](integrated/candidate-matrix.json), [existing checks](integrated/existing-checks.json), raw logs in integrated/logs |12 profiles/384 observations and all 12 scoped regressions PASS on integrated bytes. |
| [Legacy renderer](integrated/integrated-v8-f13.json), [self-review](combined/self-review.json) | V8 6.0.286.52: two inline scripts parse,32 renderer fixtures PASS. Self-review only. |
| [Current baseline matrix](combined/baseline-matrix.json), [geometry comparison](combined/large-text-comparison.json), [negative controls](combined/negative-controls.json) | Same measured200% name overflow; both causal failures caught. |
| [Build/release](build-release-receipt.json), [raw build log](build-37714666181.log.gz), [local identity](native/apk-142-identity.txt), [CRC/assets](native/apk-142-assets.json) | Package com.lumenfall.app, version142, established certificate, release digest, every ZIP CRC and all 15 assets PASS. |
| [Actual native acceptance](native-review-bound/native-acceptance.json), [fresh bound run](native-review-bound/native-acceptance.log), [signed 138 baseline](native-review-bound/baseline-native.json) | Signed138→142 save storage/first-launch ownership,320/390/430px,120 observations/24 real casts, 44px controls, native AX, font scale 2 and Android Tab/focus PASS; no runtime errors. |

Product SHA256: 835e1f19c4d51025a41583786c52d8b6ff09ab11cf4afcfec4a49146f40734b3.
APK SHA256: ec361d641cd5c5dff62322cc90e85bfff6d42d0f5f0877630469f97c451756a0.

Native identity: Android8.1/API27/WebView61.0.3163.98 software emulator. No physical
WebView60, TalkBack or independent-review claim. The V8 fixture verifies the
Chrome60 engine generation separately. Native61 lacks prefers-reduced-motion;
modern-browser tests retain its existing behavior. Large-text overflow is an
unchanged limitation, not full layout acceptance.

The first native attempt's startup-socket race and second attempt's rejected
sub-200px physical display are retained in native/native-attempt-1-transport-race.log
and native/native-attempt-2-width-failure.json. Final tests correct only the harness. Earlier unbound segmented native evidence is historical. The native-review-bound state run passes120 states/24 casts, AX and font. Its earlier update records are superseded by native-baseline-bound. Its final Tab was intercepted by Android SystemUI's ANR dialog. The saved bound keyboard follow-up reconfirms actual installed APK bytes and exact source, verifies native app input focus and passes real Tab with a visible outline after dismissing the isolated system dialog.
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

The first delivery checkpoint's [CI151 receipt](ci-37718210381-receipt.json), [acceptance lines](ci-37718210381-acceptance.txt) and [full raw log](ci-37718210381.log.gz) pass151 defaults,12 negatives and guarded startup. Application/tests match current main. The final required-head gate and merge receipt are saved in [PR74](https://github.com/karahaNx/Lumenfall/pull/74), avoiding a self-referential CI receipt commit.

Review disposition: installed APK and source hashes are recorded and compared before native continuation. [Fresh bound native receipt](native-review-bound/native-acceptance.json), [keyboard follow-up](native-review-bound/keyboard-followup.json) and [identity negative controls](native-review-bound/binding-negative-controls.json) supersede earlier unbound segmented evidence. Both native phases verify the same APK bytes and exact product script. Only the final keyboard check was repeated after dismissing an Android SystemUI ANR dialog; no product change or weaker oracle.

Baseline review PRRT_kwDOUF0Vls6qLoBC addressed: the producer validates the known138 baseline and hashes actual installed APK bytes before snapshot/install. The combiner validates baseline identity and the recorded pre-update APK against it. [Pre-attested update](native-baseline-bound/native-update.json), [prepared baseline](native-baseline-bound/baseline-native.json), [cold-launch/prepare log](native-baseline-bound/baseline-prepare.log), [update log](native-baseline-bound/native-update.log), [actual already142 negative](native-baseline-bound/pre-update-negative-control.json) and [rerun identity controls](native-baseline-bound/binding-negative-controls.json) PASS. Target142 bytes/source equal all state/keyboard phases.

The baseline-diagnostics attempts are superseded QA setup/probe failures. Preparation now completes normal startup, requires a successful product save and verifies the fixture on a real138 cold launch before update. No product/save behavior changes or weaker oracle. [CI37722694441](ci-37722694441-receipt.json) passes151/12/guarded startup on e25fa6b; the final revised-head gate remains required and is recorded in PR74.
