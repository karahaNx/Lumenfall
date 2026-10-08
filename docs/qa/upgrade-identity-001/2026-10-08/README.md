# F29 delivery evidence — 8 October 2026

The game feature is integrated through [PR90](https://github.com/karahaNx/Lumenfall/pull/90),
merge31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6. Signed APK0.1.148 is published.
Required native/device acceptance remains OPEN; owner chat stays open.
[Task](../../../tasks/UPGRADE_IDENTITY_001.md) · [final24-row matrix](../../../tasks/UPGRADE_IDENTITY_001/MATRIX.md)
· [immutable signed148 APK](../../../../archive/android/upgrade-identity-001/README.md).

## Bound results

| Check | Evidence/result |
| --- | --- |
| Required pre-merge CI | [metadata/integration](ci-integration.json), [full raw log](ci-37740566328.txt.gz): run37740566328/head78885d61 PASS167 defaults/17 negatives and every required gate. |
| Exact purchased value | [four integrated numerical profiles](integrated-value-parity.json), independent old operands in production contract tests; all24 saved IDs remain. |
| Combined integration | [19 scoped scenarios/23 runs](integrated-focused/results.json), raw compressed logs alongside it; [Auto-Ascend mobile](integrated-auto-ascend-mobile.txt.gz) PASS on source f99cb0bc. PR84 landed immediately before PR90; integration includes it. |
| Android release | [build/release](build-release.json), [raw build log](build-37742868726.txt.gz), [identity](apk148-identity.txt), [CRC/assets](apk148-assets.json): package com.lumenfall.app/version148/established signer/release digest/526 entries/all15 assets PASS. |
| Actual extracted APK engine | [legacy results](apk148-v8/results.json): V8 6.0.287.53 parses both scripts, PASS129 value/closed-handler/backup/paid-work checks; original26-Mote speed intent on three closed paid Studies pays78 once. Full8h offline entry PASS302400 kills/14400 Ascends. |
| Actual extracted APK desktop behavior | [19 scoped scenarios/23 runs](apk148-focused/results.json), compressed raw logs alongside it; mobile320/390/430, normal/200% text and normal/reduced motion included. |
| Required combined CI | The final delivery PR body records its exact head/run/outcome. Combined source and test bytes equal integration31eccfb;168 defaults/17 required negatives apply. |

Integrated/actual APK index SHA256:
`f99cb0bcd46d2849977a39cf31bb0dd1a7bb8c0ca7a370f2490ad66ec67a6ec1`.
APK SHA256:
`cef6c291a4f91a3921bdc3b2d2e6f772906d39560f995fcaedf420ccd9972657`.
Self-review/automated checks only; no independent review is claimed.

## Replay

Run from the clone root using Node20+ and a Chromium browser. For the engine
probe, explicitly supply the official Node8.6.0 runtime (V8 6.0.287.53).
The orchestrator uses modern Node; only the existing compatibility harness and
full supplied product execute in the legacy child. Product source is unmodified.

```sh
node docs/qa/upgrade-identity-001/2026-10-08/verify-apk-assets.cjs archive/android/upgrade-identity-001/Lumenfall-0.1.148.apk SOURCE_ROOT cef6c291a4f91a3921bdc3b2d2e6f772906d39560f995fcaedf420ccd9972657 /tmp/f29-assets.json /tmp/f29-apk/index.html
node docs/qa/upgrade-identity-001/2026-10-08/run-focused.cjs /tmp/f29-apk /tmp/f29-focused
node docs/qa/upgrade-identity-001/2026-10-08/run-legacy.cjs NODE8_RUNTIME /tmp/f29-apk/index.html /tmp/f29-v8
node scripts/verify_apk_identity.cjs --self-test
node scripts/codex/check_context.cjs --task docs/tasks/UPGRADE_IDENTITY_001.md
```

Use historical source31eccfb for `SOURCE_ROOT` (detached checkout if main advances).
The verifier requires the external release digest and exact source match. The
[old144 APK control](old-apk-negative.txt) is rejected for mismatched index.html.
[Device checklist](DEVICE_ACCEPTANCE.txt) covers actual signed update/storage,
interaction/background/offline/recovery, affected-phone/exact WebView60/TalkBack.
Desktop Chromium and mocked engine probes do not establish those native results.

## Historical candidate evidence

[261b candidate full suite](candidate-261b-suite.json) PASS160 defaults/186 runs;
[raw log](candidate-261b-suite.txt.gz). [17 causal negatives](negative-controls.json),
[raw negative logs](negative-controls.txt.gz). A fractional-only clock negative
initially passed unexpectedly; the zero-phase case restores the original2s stall
under the old guard. No gate was removed. [Positive clock](farm-clock-final.txt).

Exploratory [first full failures](historical-full-suite.txt.gz) and
[later failures](historical-final-suite.txt.gz) are superseded snapshots, not
acceptance. Closed-row expectations, chronology budgets and mobile wrapping were
corrected before final CI. [Combined e2 focused](combined-e2-focused/results.json),
[exact offline reference](combined-e2-offline-core.txt.gz) and
[earlier V8 offline](combined-e2-v8-offline.json) record reassessment through
Formation Autosave/Backup/Resonate. Original proposal/baseline receipts retain
their original dates and versions; they do not establish implementation acceptance.
