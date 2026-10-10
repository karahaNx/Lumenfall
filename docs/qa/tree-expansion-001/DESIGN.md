# Tree expansion — implementation and acceptance contract

Design checkpoint: 10 October 2026. Implementation follows the verified PR105
merge `2d01049393e3bb45a90d80e07af52ae0484b0ec5` (source SHA256
`05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac`).
PR102 remains draft. Main and APK work remain held by current user direction.

## Ownership and catalog

Tree owns Prism investment, the transition between Ascension runs, recruitment,
Empower decisions and offline retreat policy. It does not sell Lab kill rewards,
Study work/material discounts, Forge combat/ability factors, or protection that
already exists. The fixed12h offline cap and all existing paid benefits remain.
Echo6/Bonds20/uncapped Swift keep their original costs, caps and raw value unless
the player buys the explicit future-price Charter below. Three retired generic
IDs and refunded Reserves remain hidden compatibility records. Exactly20 active
types: the three existing rows plus these17. All prices are **Prisms**.

Every new capped row has the exact per-purchase integer ladder below. A stored
raw overcap remains stored; the effective new level clamps to its catalog cap.
Unlocks use the highest Rift ever reached, not the current reset depth. An
unlock never removes an already-paid effect. Missing new IDs normalize to0.

| ID / name | Unlock | Cap | Prices, in rank order | Exclusive effect |
|---|---:|---:|---|---|
| swiftcharter / Swift Charter | Rift100 and Swift10 | 1 | 200 | Future Swift purchases at current Swift level k≥10 cost60+6×(k−10). Existing +4% per level and all earlier/unowned prices remain. |
| lumenmemory / Lumen Inheritance | Rift15 | 5 | 8,16,28,44,64 | At Ascend keep5% of current Lumen per rank, limited to50,000 Lumen per rank. No new Lumen grant when the wallet is empty. |
| veteranrecruits / Veteran Recruits | Rift20 | 5 | 5,10,18,30,46 | Future first recruitment starts at1+rank levels for one recruitment payment. Ember starts at the same level after Ascend. Bonus levels are not paid Empowers. |
| rosterrecall / Roster Recall | Rift25 | 4 | 15,30,55,90 | At Ascend recruit the first rank additional remembered Formation members, excluding reset Ember, that were recruited in the ending run and remain unlocked. Use Veteran starting level. Pending unowned members get no free recruitment; pause when starting Single Star. |
| chargememory / Charge Memory | Rift30 | 5 | 12,22,38,60,90 | Retain20% of each Wisp's actual event-time charge per rank through Ascend, at most100. Dormant charge waits for recruitment. No new charge generation. |
| supportmemory / Lasting Blessings | Rift60 | 1 | 60 | Preserve current Support sources and the legacy buff through Ascend with exactly their existing strength and expiry. Never refresh or extend a cast. |
| phasememory / Unbroken Rhythm | Rift40 | 1 | 35 | Retain the elapsed sub-second phase of already-unlocked Auto-Tap and Auto-Empower through Ascend. The existing persisted limit999.999ms applies. No automation unlock. |
| riftstep / Familiar Paths | Rift30 | 5 | 12,24,42,68,104 | Begin the next run at Rift1+rank (at most6), before the single new-enemy spawn. Grant no skipped kill rewards, counters or new-record credit. |
| frontier / Frontier Record | Rift50 | 5 | 20,35,55,80,110 | Each newly crossed25-cleared-Rift milestone above the previously rewarded benchmark adds rank Prisms at Ascend. No repeat or retroactive grant. Canonical preview includes this separate amount. |
| stardust / Ascension Dust | Rift60 | 5 | 10,18,30,46,66 | Each20 actually earned Ascend Prisms yields rank Motes, up to10×rank Motes per Ascend. This single cross-currency Ascend reward is not a Luminous kill bonus. |
| gentlegrowth / Patient Growth | Rift40 | 5 | 12,22,38,60,90 | Future Empower prices above Wisp level25 use growth(113−rank)/100 after the first25 original1.13 steps, then the existing Bonds discount. Lower levels and rank0 use the literal original expression. New safe-integer prices round exact rational arithmetic; larger prices retain the Number/exact-debit guard. |
| formationseat / Sixth Companion | Rift75 | 1 | 120 | Allow6 chosen Active Formation slots instead of5, including presets/rebuild/load. Does not recruit or level a Wisp; the five-member Deed retains its original threshold. |
| benchmentor / Bench Mentorship | Rift35 | 5 | 10,18,30,46,66 | Every10 successful paid recruit/Empower actions gives rank levels to the lowest-level other recruited Benched Wisp (catalog-order ties). No recipient consumes the milestone; no deferred free grant. Bonus levels do not recurse. Progress persists in saves but resets at Ascend. |
| empowerbatch / Steady Instruction | Rift45 | 4 | 15,28,46,70 | Existing Auto-Empower performs up to1+rank separately quoted, exactly debited purchases per one-second event. It respects the existing per-Wisp toggles and never enables automation. |
| wallwisdom / Wall Wisdom | Rift50 | 4 | 12,22,36,54 | Reduce the uninterrupted offline grace before a genuinely unwinnable boss retreat by60s/rank, from300s to a60s floor. Preserve the conservative Forge boss assessment and the original fixed offline time cap. |
| invitations / Early Invitations | Rift15 | 3 | 4,9,16 | Future Wisp recruitment unlocks occur1 Rift earlier per rank, to a Rift1 floor. Do not mutate raw Wisp unlockDepth, which also anchors permanent upgrade prices. |
| recruitreserve / Recruitment Reserve | Rift25 | 5 | 8,16,28,44,64 | When rebuilding a chosen Formation, Auto-Empower prioritizes its next enabled unowned recruit when affordable; otherwise protects20% of that quote per rank from automatic spending on existing members. Manual purchases remain unrestricted. |

## Save and purchase rules

Keep schema2. `nodes` adds the17 IDs, all default0. The only additional persisted
operating counter is `treeTrainingProgress`, normalized to an integer0..9 and
reset at Ascend. It starts0 in old saves and when no Mentorship is owned. Six
slots require normalized new node ownership before party/preset/rebuild limits
are computed. A snapshot helper must not accidentally read the global state.

Tree keeps its current **single purchase only** UI. Bulk and queue are explicitly
not supported, not silently passed tests. Every row is covered at0/1/cap/cap+1,
unlocked/locked, insufficient/exact/large wallet, cap/no-op and primary/recovery
fault boundaries. Retired IDs remain unpurchasable. Quotes and represented
debits must match exactly, and paid level increments must be representable.

Manual Tree/Wisp purchases and manual Ascend stage the whole mutation. A failed primary write
restores the original in-memory state, including training/formation/refund
ledger. A primary success followed by a recovery failure retains the committed
endpoint. A delayed historical F26 refund can correctly accompany the debit;
do not count that separate refund as a purchase-price discrepancy. Automatic
Empower changes are in-memory steps owned by the surrounding offline/live save
transaction and use the same quote/debit/paid-level helper.

## Ascend and chronology

Only the actual `applyAscendMutation` grants transition effects. Load, render,
Tree purchase and backup import never replay an Ascend. Capture ending-run
Formation intent and recruited status before resetting. Recall pauses entirely
when starting a pending Single Star trial. Its normal one-Wisp reset party and
saved full intent remain; later player recruitment can still fail the trial.
No purchased rule changes Auto-Ascend ownership, toggle, target or eligibility.

Frontier adds to the existing canonical payout as a separately visible term.
The base/Swift/Clarity exact floor/ceil kernel remains unchanged; with Frontier0
the complete old breakdown is identical. Frontier requires safe cleared/block
counts and an exactly representable addition to the nominal gain; preserve the
old fallback outside that range without inventing a credited bonus. Update the
rewarded benchmark once after payout, so repeated/restored Ascends cannot replay
milestones. Dust uses the lesser of nominal gain and actual represented Prism
wallet credit; a zero-credit huge wallet grants no Motes. Apply once in manual
and simulation paths; summaries report the actual represented Mote increase.

An ending passive interval belongs to the old run. When charge or phase memory
is owned, accrue its ability resources/timers before applying its passive kill,
then snapshot at the actual Ascend. This does not fire abilities/taps/purchases
before the kill. The zero-new ordering remains literally unchanged. No second
accrual to the new run and no discarded final old-run fraction. Keep unchanged
Support deadlines so no wall-clock substitute or offline extension is needed.
Familiar Paths affects only the next run's starting enemy, once. Forge overkill
and pending relay retain their transient run-token guard.

## Economy and independent acceptance

Baseline actual mature fixture: Swift6/Clarity1/452P/maxRift120. Measure real
first/repeat/new-record gains and reinvestment pacing, plus levels0..50 and
cleared20/50/119/250/1000. At Swift30 the old cleared20/Clarity0 next useful
bundle costs1,438,134P. Charter thresholds and the200P fee must be included in
payback comparisons; do not equate repeats with elapsed time or claim a playtest.
Cross-run start/carry/recall combinations need bounded early/mid/late profiles,
not merely isolated helper assertions. No additional raw stat multiplier.

Test the complete production IIFE with independent cost/effect oracles, every
new ID causing a real behavior difference, actual purchases, primary/recovery/
backup/repeated load and old paid/raw-overcap fixtures. Preserve original
failure witnesses and source hash. Causal negatives must fail real assertions,
including both payment bugs, missing effects, lost ownership, chronology,
incorrect eligibility and double Frontier credit. Do not count harness errors.

Chronology: live/manual/Auto/offline, unsplit/split/yielded, time0/equal-time,
passive ending-hit carry, delayed ability, trial boundaries, restored saves,
8h repeated Auto-Ascend, exact debit barriers and different event batch sizes.
Six-party/two-Support cases require conservative boss-assessment bounds.

UI: all20 rows at320/390/430px; normal/200% root font, normal/reduced motion,
44px targets, keyboard/focus preservation, visible effect/cost/unlock/cap,
independent red-only unaffordable Prisms, no deficit or warning price UI.
Run both inline script syntax checks and execute the game IIFE on actual
Node8.3/V8 6.0; this is not Android/native WebView or TalkBack acceptance.

Require full182-scenario/22-negative CI, source/tooling/context/smoke, existing
Lab and Forge workflows, new Tree workflow with Prism state/ROI/browser/mobile
checks, and exact source/fixture hashes. Collect raw negative logs as well as
strict CI success. Integrate the accepted head into development, verify actual
merge tree and fresh post-integration checks, then preserve an immutable receipt.
