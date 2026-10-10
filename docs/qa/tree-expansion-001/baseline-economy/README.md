# Tree economy baseline and selected Swift charter

Read-only audit of development commit `2d01049393e3bb45a90d80e07af52ae0484b0ec5`, product SHA256 `05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac`. The audit made no repository, fixture, remote or APK changes. All measurements below precede Tree implementation; the selected charter is a design model until verified against the implemented source.

## Decision supported by the measurements

The root task has selected one new paid Tree track, provisionally called **Swift charter**:

| Property | Frozen rule |
|---|---|
| Currency / price / cap | 200 Prisms once; level cap1 |
| Unlock | `maxDepthEver >= 100` **and** existing Swift level at least10 |
| Owned future Swift price | At current Swift level `k >= 10`: `60 + 6*(k-10)`, equivalently `6*k` Prisms |
| Other cases | Original `ceil(3*1.5^k)` price for unowned charter or `k < 10` |
| Existing purchases | Every raw Swift level and its original +4% contribution remains; no refund, repricing of past purchases, conversion or level grant |
| Reward | The charter itself changes no Prism bonus or reward arithmetic |

The complete measured comparator is `linearAfter10` in `economy-measurements.json`. It includes Swift50 and75, six cleared depths20/50/99/119/250/1000, and completed Clarity0/1/10/20. The later separate Frontier design is intentionally absent from this baseline model; its zero level must preserve this evidence and the existing Prism oracle.

The one-time price path should be opt-in through new ownership, not a migration that silently enables the cheap ladder. A new ID defaults to0; saved levels above its cap retain their raw value but produce the capped effect once. Its purchase must be atomic before the new Swift quote becomes active. Existing numeric rejection rules remain: a price is not spendable when the requested level increment or debit is unrepresentable. Any additional exact-range guard on the new ladder must preserve raw oversized old ownership.

## Why an additive price ladder

Current repeat reward at cleared depth D is based on `2*sqrt(D) * (0.20 + (1+0.04*Swift)*(1+0.05*Clarity)-1)`, floored by the exact protected-bonus policy. The marginal unrounded reward of one Swift level is only `0.08*sqrt(D)*(1+0.05*Clarity)`, while its price grows by1.5 for every level. The exponential price therefore overwhelms late marginal returns even after the earlier protected-bonus improvement.

The following figures are **extra-earnings payback in fixed-depth repeat Ascends**, with completed Clarity0. A useful bundle includes all consecutive Swift purchases needed to reach the next whole-Prism increase. Charter activation cost is excluded from these marginal columns and remains a separate200P payment.

| Swift / cleared depth | Old useful bundle | Doubling Swift contribution, old prices | 1.10 price growth anchored at9,976P | Selected `6*k` ladder |
|---|---:|---:|---:|---:|
|20 /20|9,976|24,940|9,976|120|
|30 /20|1,438,134|1,438,134|54,339|366|
|50 /20|1,912,864,501|1,912,864,501|174,076|300|
|30 /50|575,254|575,254|25,876|180|
|30 /99|575,254|287,627|25,876|180|
|30 /119|575,254|287,627|25,876|180|
|30 /250|575,254|287,627|25,876|180|
|30 /1000|191,752|115,051|8,626|60|

A stronger bonus can repay the bonus purchase quickly, yet leave subsequent Swift prices unhelpful. Rounding can even shift the next purchase onto a plateau. At Swift20/cleared20 the doubled contribution immediately raises repeat8 to16, but Swift21 remains16; the next useful bundle is two expensive levels. This is not evidence that doubling reduces total earned value; it shows why immediate bonus payback and future purchase ROI must be reported separately.

The selected linear ladder gives a useful high-level asymptote: price per level grows linearly while repeat reward also grows linearly with owned Swift. Ascends needed to afford another level approach a constant at fixed depth, rather than exploding. **Marginal payback still grows linearly**, so the design does not promise constant or instantaneous investment returns. At cleared94/Clarity1 the unrounded marginal reward is about0.814P per level, and the high-level price-to-current-reward ratio tends to about7.37 repeats per level.

## Why threshold10, rather than20

The repository's mature fixture has **Swift6**, notSwift20. Its canonical balance is452P: the original420P plus the existing one-time32P refund for Reserves3. It has maxDepth120, current depth95, completed Clarity1 and an unrounded Prism multiplier1.302.

For a reproducible numerical illustration, keep cleared94 and Clarity1 fixed, assume pure repeats after that benchmark, start from canonical452P/Swift6, and spend only on Swift and the selected charter. These are reinvestment calculations using independent exact rewards and actual legacy prices; they are **not combat replay, time-to-unlock or minutes/hour estimates**. The unchanged fixture itself has benchmark0 and a first reward25; that first reward is deliberately not counted in this pure-repeat illustration.

| Target Swift | Original path: Ascends / spend | Linear ladder after20: Ascends / spend | Selected after10: Ascends / spend |
|---|---:|---:|---:|
|20|1,066 /19,889P|1,066 /19,889P|57 /1,350P|
|21|1,541 /29,865P|1,078 /20,149P|62 /1,470P|
|30|43,964 /1,150,450P|1,111 /20,959P|117 /2,820P|
|40|1,939,045 /66,343,942P|1,156 /22,429P|181 /4,890P|
|50|90,202,893 /3,825,728,953P|1,207 /24,499P|247 /7,560P|

From Swift6, the original route costs280P to reach10 but19,889P to reach20. Threshold20 leaves that large barrier intact. Threshold10 requires meaningful prior Swift investment (345P from level0), then becomes reachable in the actual mature fixture. The Rift100 gate prevents this price intervention from becoming an immediate early Tree purchase.

## Existing Tree prices and effects remain distinct

| Track | Original price | Buying cap | Existing effect |
|---|---|---:|---|
|Echoing Rest|`ceil(2*1.4^k)`; prices2,3,4,6,8,11; total34P|6|Offline earning rate70% plus5 percentage points per level, capped at100% before historical Rift Attunement |
|Cheaper Bonds|`ceil(2*1.45^k)`; total7,507P to level20|20|Recruitment **and** Empower Lumen cost reduced by3 percentage points per level, to40% of original cost |
|Swift Ascension|`ceil(3*1.5^k)`|Uncapped|+4% Prism factor per level, multiplicative with completed historical Clarity |

All109 observed Tree price rows matched an independent rational-ceiling calculation over Echo0–6, Bonds0–20 and Swift0–80. The selected opt-in ladder does not rewrite this historical path. Raw over-cap Echo/Bonds ownership must remain; future charges at their caps must remain impossible.

Recruitment and Empower share `round(baseCost * 1.13^currentWispLevel * (1-min(0.60,0.03*Bonds)))`. The audit records448 quotes across all8 Wisps,7 requested levels and8 Bonds levels. A valid active Tide formation is used when testing an Ember0 quote, because empty-party canonical recovery otherwise supplies Ember1. Each quote now asserts the requested level survived acceptance.

One existing numerical difference is preserved as an observation: Titan level100/Bonds0 quotes446,958,323,302 Lumen; exact rational1.13 arithmetic rounds to446,958,323,303. This audit does not change the original Number price path. No cross-currency exchange rate is invented to express Bonds' Lumen savings as a Prism payback.

Offline policy remains a fixed12 productive hours. Echo scales offline Lumen and Shards; it does not extend time or scale Prisms/Sigils/Motes. Historical Rift Attunement remains additive above100% (mature fixture rate1.7000000000000002 under ordinary Number arithmetic). An actual ordinary Rift20 boss kill yields322L/28S/2Sigils live. Offline at Echo0/3/6 and no old Attunement gives225.4/273.7/322L and19.6/23.8/28S; Sigils remain2. The JSON keeps original floating bytes, including225.39999999999998.

## Existing test map and required preservation

- `tests/behavioral/tree-purchases.js`: final Echo/Bonds prices11/2,329; one-short/exact budgets; one actual handler save; full-state purchase mutation; cap and raw over-cap retention; retired Reserves refund6+10+16 once; retired generic IDs cannot spend; malformed IDs rejected; Swift1,000,000 nonfinite quote; huge-wallet3P rejection and exact2P acceptance; named controls. Preserve every assertion. New default0 IDs may expand full snapshots, but must not remove old operands or oracle values.
- `tests/behavioral/upgrade-identity.js`, contract branch: the `Object.keys(s.nodes).forEach(...=k)` factor fixture must assign only the original7 Tree IDs after expansion and explicitly assert each new ID is0 before using the historical factor oracle. The exact active Tree price catalog assertion currently expects Echo/Bonds/Swift only; project those original IDs and add separate new-catalog assertions. Keep closed-purchase, full snapshot, paid-work, Ascend and persistence assertions.
- `tests/behavioral/prism-earning-reference.cjs`: independent BigInt reward oracle remains unchanged for charter ownership. `prism-earning-state.cjs` covers real Swift7→8 for52P, paid retention, two-slot saves, backup replacement, recovery and offline rollback. Add charter-owned purchase cases separately; keep all original cases.
- `tests/behavioral/prism-closeout-data.cjs`: preserve the180 actual legacy ROI rows/540 checks. Its extracted `nodeCost` must include any new helper dependencies without weakening the legacy price expectation. Independent new charter-price and ROI coverage should separately activate the new ownership and test k9/10/11,50/75, low/high/invalid balances, exact increments, save failures and zero-path equality.
- New offline/run reconstruction effects require actual manual/Auto-Ascend, live/offline, chunk splitting and persisted-return tests. Preserve the fixed12h interval and distinguish old-run elapsed timers from new-run retained state. No optional effect may fire on a zero-ownership path.

The code-audit agent independently captured a preexisting product defect in `../audit-code/tree-purchase-baseline.json`: all3 active Tree handlers retain a live mutation when the primary write fails; a recovery-only failure correctly retains the successful primary commit. Swift20P/level0 becomes live17P/level1 despite storage20P/level0, and retry then advances to12P/level2. Tree acceptance must fix the primary-failure transaction without rolling back a primary-committed/recovery-failed purchase. That receipt is referenced, not rerun by this audit. Its SHA256 is `6bd517642136c7616c2cc2305fcd8961a3aba1bbe37bc5805b2f2201fc23897a`.

## Execution receipts and limits

`baseline-execution.json` preserves exact commands, original stdout/stderr hashes, source/fixture/test identities, Node executable/version and process times. The two existing baseline commands passed:

```
node tests/behavioral/prism-earning-state.cjs index.html
node tests/behavioral/prism-closeout-data.cjs index.html /workspace/scratch/0848c4e4f365/tree-work/audit-economy/existing-roi
```

Results: Prism state3,506 checks/180 payouts/8 routes; existing ROI540 checks/180 rows/1,248 synthetic old-engine cases. No browser matrix was run in this design audit.

`measure-economy.cjs` performs full-IIFE observations and independent math without editing product code. Final measurement passes1,744 assertions and records109 old price rows,36 offline effect rows,448 Wisp quotes,4 public fixture projections,36 actual kill samples,960 counterfactual ROI rows and25 reinvestment illustrations. The sole failed measurement attempt was the invalid Ember0 seed described above; its exact script, raw failure and correction are retained in `failures/seed-normalization/`. No product fix was made to satisfy it.

`economy-measurements.json` is the complete numeric deliverable; `measure.stdout.json` is its concise executed summary. No complete HTML, private save, APK or historical source snapshot is copied into this evidence package. Root owns the remaining16 new track definitions and the complete20-track design; this audit does not pad the catalog with redundant effects or claim their prices are calibrated before their mechanics are specified.

Primary code anchors at this source: NODES3171; retired ownership3448; formula operands4712/4739–4743; Wisp/Tree prices4897/4902; actual purchases5644/5825; exact Tree eligibility5837; protected Prism arithmetic6298–6369; reset mutation6373; Auto-Empower8150; offline scale8221 and actual kill reward8533.
