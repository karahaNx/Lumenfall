# Tree expansion — debugging checkpoint

This is an incomplete development candidate in draft PR106, not accepted
integration or a release. [First CI failures and adapter repairs](ci-debug-initial/README.md)
remain mandatory before integration. The current user authorizes sequential work behind draft PR102 and
explicitly holds main and APK work. [Design](DESIGN.md) freezes all20 active
tracks, prices, unlocks, caps and transition rules.

## Source and preserved baseline

Verified development parent: `2d01049393e3bb45a90d80e07af52ae0484b0ec5`,
the accepted Forge PR105 merge. Main remains
`67373faa531f0bb791c883210ee623320861e380`.
Baseline game SHA256:
`05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac`.
Unchanged historical fixture SHA256:
`ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753`.
No complete private user save was introduced.

Baseline witnesses in `baseline-purchases/` reproduce failed-primary mutations
in Tree purchases, Wisp purchases and manual Ascend. Both manual and automatic
Empower could also accept a cost11 purchase from Lumen1e30 with represented
debit0. The candidate stages manual transactions and rejects nonrepresentable
paid debits/level increments. A primary success followed by a recovery failure
retains the committed primary endpoint. The existing delayed F26 refund is a
separate ledger event and remains covered.

The final read-only review found two related control-flow defects. Empower's
500ms refresh still used balance>=cost after initial rendering had adopted the
exact purchase plan; it could re-enable an Unavailable button. Shared state
presentation and the recruitment-ready hint had the same assumption. All now
use the authoritative plan. Also, manual-kill Auto-Ascend reported success even
when its newly transactional reset failed; it now propagates the actual result
so normal post-kill checks run after a rollback. The pre-correction game bytes
and finding are preserved in `refresh-defect/`. Actual mobile verification and
a focused failed-Auto-Ascend causal regression are required before acceptance.

Current corrected game SHA256:
`4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`.

## Executed checks and failures

All raw stdout/stderr and source/test identities for the first existing-suite
run and its rerun are under [existing-regression/](existing-regression/manifest.json).
Node runtime:24.19.0, V8:13.6.233.17-node.51.

| Candidate | Observed result | Explanation |
| --- | --- | --- |
| `b4343619242620a196651aafa6959abe37df875be8deefd6db3140f49c645c51` | Six existing commands passed; Lab core and Forge core stopped at negative-control source anchors | New timer/reset spelling moved the literal injection sites. Their positive sections passed; this was not accepted negative coverage. |
| `cccc78de6fb784cfb6f5d1013b4bddf8ec27ad360e926dd7249cd41999c2303f` | All eight existing commands passed | Product keeps the original zero-new timer-reset and run-identity blocks. Tests, assertions and frozen fixtures are unchanged. |
| `331a371fd697be2c4e712e249ab95b7098f7d77cf4e1994e2f72317ac0fef2fb` | Tree core5,243 assertions/27 caught negatives; economy16,802/6 caught negatives | Later UI/return-value corrections require a final run on the corrected source. Core fixture/API corrections and economy negative-label correction are retained separately; none is misreported as a product failure. |
| `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef` | All eight existing commands pass again; Tree core5,267/28, offline7,691/4 and actual V8 6.0 checks2,862 PASS | Includes actual failed-Auto-Ascend post-kill Deed/return/rollback/retry coverage. Mandatory full/browser CI remains pending. |

The all-eight existing rerun includes Lab core2,456/10 negatives, boundary2,344/5,
stress2,182, Prism state3,506, Forge core9,308/25, Forge calibration3,134/7,
tooling and APK-identity **self-test only**. No APK was built.

Independent economy coverage includes3,117 new rational Empower quotes,1,824
literal legacy quotes,363 oversized-price checks,243 Swift rows and720 canonical
Prism/Frontier previews. Actual mature fixed-depth reinvestment loops reach
Swift21 after1,541 old-price Ascends versus62 with Charter, and Swift50 after247
with Charter, including its200P fee. These are modeled actual-handler repeats,
not elapsed play time or a whole-campaign balance claim. Baseline raw data and
the chosen pacing rationale are under `baseline-economy/`.

## Final focused checks and required CI

The focused offline suite passed14 ending-passive/equal-time cases, existing
Support expiry, three Wall Wisdom boundaries, four six-party/two-Support boss
bounds, and six actual8h live/offline/split/yielded routes. Each long route
completed161 Auto-Ascends,19,962 kills and1,804P; Frontier paid15P first and0 on
repeats. Batches256/31 yielded421/3,478 callbacks and exactly equal persisted
endpoints. Primary-failure retry and recovery-only failure match clean results.
An initial invalid Support fixture was correctly normalized away; its funded
replacement and original failure are preserved, not counted as a product fix.

Actual Node8.3/V8 6.0 passed2,862 assertions:339 complete-IIFE instances,94
independently priced real-purchase cases and34 primary/recovery faults. Both
inline scripts parse. This does not execute Android integration or prove a
native WebView, physical device, OS text scaling or TalkBack result.

The prior local Chrome executable is no longer present. Two attempted local
mobile starts failed before gameplay (including ENOENT); those are environment
failures, not passing mobile tests. The draft PR must run real Chromium tests
on GitHub's installed browser. Inspect all required Full/Lab/Forge/Tree jobs,
182 default scenarios, all22 original causal negatives and mobile artifacts
before integration. The Full workflow now retains each negative's raw trace
and complete strict-loop log; no assertion or gate is removed.

Mobile acceptance covers320/390/430px, normal and200% CSS root font, both motion
preferences, real touch/keyboard/focus and44px targets. Root16/32px tests are not
native textZoom and fixed-px text may remain unchanged. Preserve actual failed
runs, accept only the final exact source, verify the merge tree/parents and
perform fresh integrated checks. Comet shop/Deeds remains the next independent
improvement. Final combined native acceptance and publication remain held.
