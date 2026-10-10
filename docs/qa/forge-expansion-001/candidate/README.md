# Verified local Forge candidate

Product SHA-256:
`05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac`.
Baseline development commit: `5bcd1c861af51511ca3d5c4a07d9d61e72fdff03`.
All results below apply to that product hash unless explicitly labelled earlier.
They precede the required GitHub CI; the PR body records its final results and
development integration. Main/APK/native-device acceptance remains held.

| Executed gate | Result | Retained output |
|---|---|---|
| Forge core | 9,291 assertions; 25 causal negatives; 598 independent prices; 448 actual funded purchases | [Direct primary-run stdout](core-stdout.json), [subagent run](core.json) |
| Authoritative charge/boss calibration | 3,134 assertions; 26 long profiles; 128 bounds; 7 causal negatives | [calibration.json](calibration.json) |
| Actual mobile Forge input | 25,524 assertions; 12 profiles; 24 screenshots; browser exit0 | [Lossless full receipt](mobile.json.gz), [manifest](mobile-artifact-manifest.json) |
| Actual Node8.3 / V8 6.0.286.52 | 2,452 assertions; 2 full scripts parsed; large-counter Auto-Ascend included | [forge-v8.json](forge-v8.json) |
| Original Luminous Tracking mobile scenarios | Both unchanged scenarios pass; 3 original viewport/safe-inset profiles each | [retained-mobile.json](retained-mobile.json) |
| Lab core and causal controls | 2,456 assertions; 10 causal negatives | [lab-core.json](lab-core.json) |
| Lab purchase boundaries | 2,344 assertions; 388 cases; 5 causal negatives | [lab-boundary.json](lab-boundary.json) |
| Lab boundary stress | 2,182 cases; zero mismatches or refused predicted purchases | [lab-stress.json](lab-stress.json) |
| Prism saved-state/real Ascends | 3,506 assertions; 180 payouts | [prism-state.json](prism-state.json) |
| Lab on actual V8 6.0 | 580 assertions; 84 storage writes | [lab-v8.json](lab-v8.json) |

The mobile matrix is320/390/430px, CSS root font16/32px, and both motion modes.
Root font32px doubles rem-relative text; fixed-px text can remain unchanged.
This is not native WebView textZoom or TalkBack testing. Native touch/keyboard,
real animation frames, independent literal effects/prices/colors, actual paid
writes/reload, and immediate/settled final-row focus/scroll are exercised.

The full mobile JSON is800,338 bytes, SHA-256
`9dd1741d05792cd31b6267c7227ce9fc242397a35e4961e6852dad59c198f7ae`.
Its32,618-byte gzip was decompressed and compared byte-for-byte before saving.
All24 screenshots are reproduced by CI; two root-reviewed narrow/large-root-font
examples are retained here:

- [Final row before input](forge-last-before-320-2-no-preference.png).
- [Final row after reaching cap](forge-last-cap-320-2-no-preference.png).

The primary agent also passed source syntax/IDs/lifecycle guards, the APK
identity verifier's self-test, Node tooling regression, task context checks
for Forge/Lab/Prism/progression and whitespace checks. These checks do not
build an APK. The full existing fixtures file retains SHA-256
`ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753`.

The [subagent review](subagent-review.json) covers the entire product diff and
records the fixed unsafe-Ascend counter defect. It is not human approval.
The direct primary core stdout provides an additional raw execution receipt.

Earlier13-scenario compatibility and17-case frozen offline results belong to
source `dfd3dbc4…`, before the subsequent bounds/run-token fixes. Their receipts
are kept under `../baseline/` and must not be relabelled as final-source results.
The Forge CI includes the full eight-hour/capped offline oracle on its exact
checkout, in addition to the mandatory existing182-scenario full regression.
