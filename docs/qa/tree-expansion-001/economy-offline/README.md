# Tree expansion: economy and offline acceptance

These local checks passed against product SHA256
`4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`.
The checkout was based on development merge
`2d01049393e3bb45a90d80e07af52ae0484b0ec5`; the Tree candidate was still an
uncommitted working tree. This receipt does not claim a later GitHub commit or
merge. The original public fixture file remains SHA256
`ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753`.

## Commands and results

Run from the repository root:

```sh
node tests/behavioral/tree-expansion-economy.cjs index.html --negative
node tests/behavioral/tree-expansion-offline.cjs index.html --negative
```

| Check | Assertions | Genuine negative controls | Process result | Elapsed |
|---|---:|---:|---|---:|
| Economy | 16,802 | 6 | exit0; empty stderr | 3.143 seconds |
| Offline and chronology | 7,691 | 4 | exit0; empty stderr | 72.519 seconds |

The scripts execute the complete production IIFE. The shared harness replaces
presentation, clocks and storage, while the production purchase, Ascend,
simulation and persistence functions still execute. BigInt is absent inside the
product. The independent new price oracle uses Node BigInt outside the game and
imports the unchanged historical Prism reference.

## Economy findings

The Charter sweep covers243 rows through Swift80, actual200P Charter purchase,
its Rift100/Swift10 gate, low-level preservation, future purchases at9/10/11/20/
30/50/75, cold load and actual backup restore. Charter changes no paid level or
Prism bonus. Its future Swift50 quote is300P.

Patient Growth has3,117 exact new-curve quote checks,1,824 original literal
Number-path checks, and363 explicit oversized-price branch checks. Independent
BigInt calculations locate and cross the safe-integer boundary for every Wisp,
rank1–5 and Bonds0/5/20. The old Titan100 quote stays446,958,323,302L, including
the witnessed historical one-unit rounding difference. The new rank5 Titan100
quote is15,002,561,973L. This does not claim exact arithmetic for arbitrary
oversized wallets or change the inherited unowned formula.

There are720 independent Prism/Frontier preview cases and39 actual payout
calls, plus Dust floor/cap and represented-wallet tests. A huge Prism wallet
whose represented increase is0 grants0Motes. The simulation summary reports the
represented Mote change, including a huge Mote wallet. At clear100 with Frontier5,
the original20P plus20P Frontier yields40P and10Motes at Dust5. Repeating that
already rewarded record grants4P and no additional Dust.

The actual mature fixture begins at452P/Swift6/Clarity1. Its original420P plus
32P historical Reserves compensation is checked before reinvestment. A synthetic
fixed cleared94/rewarded94 repeat loop buys upgrades through the real handlers:

| Target | Charter | Actual Ascends | Actual Prisms spent | Prisms left |
|---|---|---:|---:|---:|
| Swift21 | Unowned legacy path | 1,541 | 29,865 | 12 |
| Swift21 | Paid Charter | 62 | 1,470 | 0 |
| Swift50 | Paid Charter | 247 | 7,560 | 24 |

The200P Charter fee is included. These are repeat/purchase counts at a fixed
cleared Rift, not elapsed time, time to unlock, or a combat playtest. Three
separately funded early/mid/mature combinations perform real Ascends followed
by60/120/300-second live versus split simulations. Their explicit synthetic
funding, unlock records, purchases and outcomes are retained in the raw JSON.

## Eight-hour and boundary findings

All six8h runs retain the public mature fixture's paid Lab and Forge levels,
original Auto-Ascend target130 and historical offline rate1.7. They buy the new
Tree combination using a separate exact Prism funding ledger. Six chosen Wisps
have Auto-Empower enabled; the Forge and Study purchase queues are OFF. Live and
offline policies are compared separately because their reward rates differ.

| Route | Actual Ascends | Kills | Actual Prism credit | Yields/callbacks |
|---|---:|---:|---:|---:|
| Live, one interval | 161 | 19,962 | 1,804 | 0 |
| Live, four intervals | 161 | 19,962 | 1,804 | 0 |
| Offline, one interval | 161 | 19,962 | 1,804 | 0 |
| Offline, split resumable cursor | 161 | 19,962 | 1,804 | 420 yields |
| Actual offline transaction,256 events | 161 | 19,962 | 1,804 | 421 callbacks |
| Actual offline transaction,31 events | 161 | 19,962 | 1,804 | 3,478 callbacks |

The two transaction endpoints are exactly equal, including all persisted
numbers. Their individual primary and recovery bytes also agree. The31-event
source is an explicit test-only replacement of the single batch-size constant;
its hash appears separately in the raw result. No repository product edit was
made to run that control. The first actual Ascend pays44P, including15P Frontier;
each subsequent repeat pays11P with0Frontier. Ascension Dust contributes6Motes
once, while ordinary kill Motes remain separately included in the total summary.

Fourteen actual ending-passive cases cover live/offline, zero-new ownership,
charge-only, phase-only, combined memory, an accepted ascendCount1e30, equal-time
automation and a newly reset ready caster. They prove old-run final-interval
accrual, no double accrual, no bench charge generation, passive death before a
ready cast, and the explicit999.999ms retained-phase ceiling. One due event then
buys three separately quoted Empowers. Support sources and the legacy buff keep
their exact original deadlines. Wall Wisdom0/1/4 retreats at300/240/60 seconds
and retains the12h cap.

Four600-second actual six-member/two-Support profiles stay inside conservative
boss-assessment bounds, including Support order changes, no Auto-Tap, and a
stagnant1e30 tap ordinal. The60-second offline primary-failure/retry and
recovery-only-failure cases reach exactly the clean transaction endpoint.

## Provenance and corrected test fixtures

Original stdout, stderr and execution metadata are retained byte-for-byte.
`manifest.json` records sizes and SHA256 values. The receipt contains actual UTC
clock-tool observations as well as process timestamps. No full product HTML,
private save or APK is included.

Two initial harness-fixture issues are preserved in `failures/` with their exact
test bytes and raw failed output. The economy negative helper removed paid
ownership after applying the carry; its actual ownership assertion correctly
failed, but the expected label named the carry assertion. The corrected tests
separately check missing carry and lost ownership. The first offline Support
seed supplied1.3 strength without paid Amplifier Trim; canonical validation
correctly removed it. The corrected seed includes the required paid Forge rank,
uses only valid stored Support strengths, and explicitly asserts that both
requested sources survive normalization. Neither correction changed product
logic or the historical fixtures.

The offline process loaded harness SHA15fdf3e8 before three unused Auto-Ascend
observation hooks were added. Its exact previous bytes were reconstructed by
the harness owner and verified against the prior core receipt. The imported
economy helper also predates a reporting-only payout-counter correction made
during the run. `dependency-history/` preserves both loaded versions and exact
diffs to the final files; none of the offline-imported helper behavior changed.
The short final economy run binds all final dependency hashes before and after.
At the lead's direction the72.5-second offline test was not repeated solely for
these additive/reporting-only edits. Candidate CI must execute the final files.

These receipts are local Node acceptance. They do not replace mandatory GitHub
regression, browser/mobile testing, actual V8 6.0 execution or post-merge checks.
