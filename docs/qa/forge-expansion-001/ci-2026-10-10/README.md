# Rift Forge — verified development integration

This receipt is finalized at 2026-10-10 11:52:58 UTC after all mandatory candidate CI,
raw-artifact audits, the actual PR105 merge and targeted post-integration checks.
It records development acceptance only. Main and APK publication remain held.

## Exact accepted and integrated versions

| Identity | Value |
| --- | --- |
| Repository | karahaNx/Lumenfall |
| Feature PR | [PR105](https://github.com/karahaNx/Lumenfall/pull/105) |
| Destination | feature/progression-expansion-2026-10-09, behind draft [PR102](https://github.com/karahaNx/Lumenfall/pull/102) |
| Lab integration / Forge base | 5bcd1c861af51511ca3d5c4a07d9d61e72fdff03 |
| Forge implementation | 03b78ce1d13ad1a04670315bad05174c406935ab |
| Accepted repaired head | 979ed4a3cb1e106456f86efacc114c89e825a88b |
| CI synthetic merge | 8e0e4911e6821242369e8a1877a40068bab23a10 |
| Actual development merge | 2d01049393e3bb45a90d80e07af52ae0484b0ec5 |
| Accepted and actual tree | dd9e503000291554af6e93c294d99d475a09612f |
| Product SHA256 | 05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac |
| Frozen fixtures SHA256 | ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753 |
| Unchanged main | 67373faa531f0bb791c883210ee623320861e380 |

The tested synthetic merge and actual development merge have the same ordered
parents: the Lab integration followed by the accepted Forge head. Their entire
Git trees match. This evidence branch adds documentation to that integrated
version; it does not change game, test, workflow, package or signing files.

## Mandatory CI on the repaired head

| Workflow | Actual result |
| --- | --- |
| [Full pre-merge 38047024745](https://github.com/karahaNx/Lumenfall/actions/runs/38047024745) | SUCCESS: 182 deterministic scenarios, 212 PASS execution rows, zero normal FAIL rows; 22 required negative controls and all source/tooling/identity, cosmetics, Prism, currency, guard and smoke steps succeeded |
| [Lab 38047024763](https://github.com/karahaNx/Lumenfall/actions/runs/38047024763) | SUCCESS: 2,456 core assertions / 10 negatives; 2,344 boundary assertions / 388 cases / 5 negatives; 2,182 stress cases with zero mismatches; 3,506 Prism assertions / 180 payouts; 6,420 mobile assertions; 580 actual V8 assertions |
| [Forge 38047024764](https://github.com/karahaNx/Lumenfall/actions/runs/38047024764) | SUCCESS: 9,291 core assertions / 25 negatives; 598 independent currency totals and 448 paid purchases; 3,134 calibration checks / 7 negatives / 26 profiles / 128 bounds; 25,524 mobile checks; 2,452 actual V8 checks; all 17 offline scenarios |

All three runs use attempt 1 and the exact head/combined source above. Separate
Prism-only workflows are branch-filtered skips, not acceptance passes. Required
Prism behavior is covered inside the full and Lab workflows.

The full PASS-row inventory equals the previously accepted Lab inventory. The
two repaired scenarios and the three historical Research scroll regressions
pass in the final raw browser results. One request for the completed Actions job log returned `Transport closed`. The 22 negatives are evidenced by the immutable `set -euo pipefail` workflow loop and its completed/success step. Individual raw caught-message traces are unavailable and are not claimed.

### Downloaded artifact integrity

| Run | Artifact ID | ZIP bytes | SHA256 |
| --- | --- | ---: | --- |
| Full | 11668434322 | 14494600 | 91b901f1799e03e1297ed7ef7aa91c68d90232ad5af4b0e21f4a03f9be7b2a6e |
| Lab | 11668255951 | 5192547 | baa94ce212b184182b5be18c0d2f659758198a6d8cb467249675863aebd936c2 |
| Forge | 11668081599 | 5733378 | d2c3f24ccde124b5f282d48f4d09932e3a313965501d00134cb496b38b0f0f02 |

Each downloaded ZIP matches the independent GitHub artifact API size and digest
and passes CRC verification. Embedded commit/source receipts match the reviewed
tree. All six archived Lab test files and all five archived Forge test files
were compared byte for byte with Git objects from the accepted head.

## Failures found and corrected

The [design](../DESIGN.md) defines twenty active Forge tracks: four existing
tracks plus sixteen distinct additions. Original IDs, paid levels, old price
paths, retired benefits and existing Deed thresholds remain. New keys begin at
zero with queues OFF. Published caps bound new effects without deleting raw
overcaps. The save format/version and Android identity remain unchanged.

Product debugging corrected free purchases at unrepresentable wallet debits,
paid in-memory mutations surviving failed primary writes, one-unit rounding
errors in new geometric prices, invalid guaranteed boss bounds from saved
Support timing and unsafe tap counters, and old-run effects crossing a real
Auto-Ascend when a retained lifetime counter no longer increments exactly.
The [debug receipt](../DEBUG_2026-10-10.md) and its before/after synthetic
reproducers preserve the causes, fixes and exact source reconstruction evidence.

The first full Forge run, [38043830487](https://github.com/karahaNx/Lumenfall/actions/runs/38043830487),
failed with 210 PASS rows and two FAIL rows. Its later negative and guarded-smoke
steps were skipped. It is not an accepted run. The accessibility test funded an
unrepresentable 1e100 wallet; the timer mutant searched for the replaced lifetime
counter guard. Both browsers exited normally, but their QA assertions failed.

Commit 979ed4a3 changes only those two test files and failure/repair documentation.
The accessibility fixture funds the actual selected x5 quote, 481114 Shards,
while retaining poor/funded/poor transitions and every UI assertion. The timer
mutant now removes the transient run-token guard and is caught by the original
reset-resource oracle. The product and frozen fixtures are byte-identical to
03b78ce1. [Full failure and repair evidence](../failed-ci-38043830487/README.md)
retains the exact failure results, raw log, ZIP provenance and scoped repairs.

The historical first-head focused successes remain under [prior-focused](prior-focused/README.md).
Current acceptance uses only [final/full](final/full/README.md),
[final/lab](final/lab/README.md) and [final/forge](final/forge/metadata/verification.json).

## Integrated checks and retained behavior

Five fresh checks passed on the actual development merge: Lab core 2,456 checks / 10 negatives; Lab boundary 2,344 / 388 cases / 5 negatives; Prism 3,506 / 180 payouts / 8 routes; Forge core 9,291 assertions / 25 negatives / 598 price cases / 448 purchases; actual V8 6.0 Forge 2,452 checks. All five exited zero with empty stderr: 20,049 checks and 40 caught negative controls in total. Before/after commit, tree, source, frozen fixtures and test bytes match. Source validation and Forge/progression context checks also pass. Protected mobile/package/assets/APK-workflow files equal main. A missing local design link was caused by sparse checkout omission; materializing its already tracked directory resolved the context check without a source change. The exact commands, original outputs, hashes and UTC observations are retained under `postmerge/`.

The Forge offline suite includes an eight-hour Clear21 run with 302400 kills
and 14400 actual Auto-Ascends, repeated with batch sizes 256 and 31. Clear20,
Auto-Ascend OFF, capped 72/96-hour windows, cancellation, simulation/primary/
recovery write failures, processing-time and wall-clock changes also pass.
Live and offline boundary records agree on 56047 kills, 22789 Motes,
2669 Empowers, 47 research purchases and the same completed Study.

Lab checks verify actual manual/live/offline Ascends and their payout/reset
before checking retained paid levels, work, seven slots, speed choices and
legacy/new study value. Forge checks cover manual and queued exact debits,
primary/recovery/backup behavior, real Ascend retention, saved Support effects,
expanded Resonate use counts and unsafe retained counters. No complete private
LUMENFALL1 save was introduced. New fixtures and captures are synthetic; frozen
historical fixtures remain byte-identical.

Additional automatic checks on draft PR102 were observed at 2026-10-10 11:50:30 UTC: [Lab 38049484492](https://github.com/karahaNx/Lumenfall/actions/runs/38049484492) and [Forge 38049484322](https://github.com/karahaNx/Lumenfall/actions/runs/38049484322) are SUCCESS; [full 38049484284](https://github.com/karahaNx/Lumenfall/actions/runs/38049484284) remains IN_PROGRESS. These are timestamped API status observations, with no raw-artifact acceptance claimed for those additional runs. The three completed candidate workflows above, the equal entire merge tree and the actual merged-source checks establish this development acceptance.

## Verify the durable evidence

Run the following with Node.js 20+ from the repository root:

```bash
node docs/qa/forge-expansion-001/ci-2026-10-10/verify-evidence.cjs
```

The closed inventory covers every file in this directory except inventory.json
itself. It checks stored lengths/SHA256, rejects missing or extra files and
symlinks, and decompresses every .gz file to check original lengths/SHA256.
This command verifies evidence integrity; it does not rerun or replace CI.
Nested manifests bind the raw payloads to their downloaded artifact entries.
Compressed raw CI logs preserve trailing whitespace and original bytes
losslessly. Small postmerge outputs and empty stderr files retain their original
encoding and filenames. Complete HTML/DOM dumps and ZIP containers are omitted from the selected
durable subsets. The retained manifests record original paths and hashes for
selected payloads, while API metadata binds the original ZIP identities.

The [root acceptance receipt](root-final-acceptance.json) records the final
identities and audit, and [postmerge](postmerge/) contains the fresh integrated
check receipts. GitHub commit identity binds this directory and inventory.

## Limits and next step

Mobile acceptance uses Chromium at widths 320/390/430px, CSS root font 16/32px,
and both motion preferences. Root-font scaling doubles rem-relative text;
fixed-px text may remain unchanged. Actual old-engine checks use Node 8.3.0 /
V8 6.0.286.52. They syntax-check both inline scripts and execute the complete
game IIFE with controlled presentation, timers and storage. These results do not establish
physical Android, native WebView60/textZoom, OS font scaling, TalkBack or an
installed signed-app upgrade. Peer agent review is not human GitHub approval.

PR102 remains draft. Main stays unchanged. No APK build, signing or publication
was performed. The next separate planned improvement is Ascension Tree, followed
by Comet-shop/Deeds redesign and combined UI/native Android acceptance before
one final signed APK. Tree implementation was not started in this task.
