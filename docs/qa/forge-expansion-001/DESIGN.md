# Rift Forge expansion — implementation and acceptance contract

Written before product changes, 2026-10-10. Baseline is the verified Lab merge
5bcd1c861af51511ca3d5c4a07d9d61e72fdff03. Source SHA-256:
5e8763106301b9652f3ad0b270f151c3347dfead46b1842599c06a816b487cc8.
Development integration only; main/APK release remain held by the current user.

## Ownership and catalog

The original eight IDs remain first and keep their raw paid levels, old price
calculation and old effects. focus/sense/formation/resolve remain retired shop
entries with retained benefits. charge/arcanecal/conduction/luminoustracking
remain active. Only the original five IDs count toward the existing20/60 Deeds.
The sixteen additions yield twenty active tracks; they use Lumen and Shards,
grant immediately, and add only research/researchQueue keys to the existing save.
Missing keys normalize to0/OFF; raw overcaps persist but cannot buy more or grant
effects beyond their published cap. Existing Lab work, slots, currencies, Tree,
Comet value, save version, Auto-Ascend and pending Formation intent remain.

The catalog groups, in order, are Core4, Boss craft5, Rhythm6, Resources2,
Resonance3. Within each group, use the row order below. Level is L in formulas.

| ID / name | Rift | Cap | First Lumen / Shards | Growth | Effect per level |
|---|---:|---:|---:|---:|---|
| cauterize / Cauterize |20|10|36000 / 2500|1.65|Boss regeneration ×(1−0.02L), multiplicative with Vanguard|
| fracturekey / Fracture Key |30|10|103000 / 6000|1.65|Fractured Core ability multiplier1.75+0.025L|
| guardianseal / Guardian Seal |40|5|293000 / 14500|1.7|Guardian's Mark tap multiplier3+0.10L|
| spillway / Rift Spillway |60|5|2361000 / 80500|1.7|0.04L×min(overkill,original discrete hit), once to the immediately following nonboss|
| sustainedchannel / Sustained Channel |70|5|6703000 / 191000|1.75|Non-Support damaging cast leaving the same boss alive refunds2L charge|
| tapconduit / Tap Conduit |25|5|61000 / 4000|1.65|Every manual/automatic tap gives2L charge to the first powered Active Wisp|
| guardiancadence / Guardian Cadence |35|5|174000 / 9500|1.7|Every fifth lifetime tap deals an additional10L% damage|
| relay / Resonance Relay |45|5|493000 / 22000|1.7|Support cast gives2L charge to each powered non-Support Active after the ordered ability pass|
| resonantedge / Resonant Edge |50|5|831000 / 34000|1.7|Support casts also hit for0.10L×their own Wisp Power before canonical ability factors|
| victorycharge / Victory Charge |55|5|1401000 / 52500|1.7|Boss kill gives4L charge to every powered Active before Auto-Ascend resets the run|
| amplifiertrim / Amplifier Trim |60|5|2361000 / 80500|1.7|Future Support casts add0.01L to buff strength; existing cast snapshots stay|
| dualchannel / Dual Channel |55|5|1401000 / 52500|1.7|Gale adds floor(native Shards×0.20L) Lumen; Thorn adds floor(native Lumen×0.02L) Shards|
| overflowconduit / Overflow Conduit |65|5|3978000 / 124000|1.75|Original utility cast adds floor(native reward×min(0.02L,overkill/original hit)) of its native resource|
| resonancecells / Resonance Cells |80|2|19032000 / 452500|2.5|One additional shared Resonate use per run,3→5|
| resonancecascade / Resonance Cascade |90|5|54040000 / 1071500|1.8|Manual Resonate also gives2L charge to the other powered Active Wisps|
| resonancereclaim / Resonance Reclaim |100|3|153442000 / 2536500|2|Boss kill restores up to L already-spent Resonate uses; never negative|

## Prices and transactions

New first prices use actual neutral nonboss production rewards at unlock−1,
times1000 Lumen and500 Shards. The initial payout is already rounded by the
game. This is a reproducible price anchor, not a claim about player unlock time.
Early/mid/mature60-second baseline snapshots are retained separately; purchase
queues were disabled and saved Auto-Ascend intent retained. In the mature
fixture Auto-Ascend actually resets Lumen around40seconds, so gross earnings
must not substitute for spendable funds.

For new rows, price is ceil(base×sum(growth^i)) over the purchased levels,
using exact rational growth (33/20,17/10,7/4,5/2,9/5,2). A finite precomputed
ledger covers every valid start/count; independent BigInt test arithmetic
checks all598 currency results. This prevents16 one-unit floating-point errors
in the old generic helper when applied to these new inputs. Original eight
price paths remain as shipped. Never sum individually rounded level prices.

Both funded currency subtractions must represent the exact quoted debit; the
level increment must also be exact. Capped bulk chooses the largest valid
funded count, checking later counts even if an earlier cost is unrepresentable.
Old uncapped fixed-bulk remains all-or-nothing. Max searches downward from its
affordable bound if necessary. Invalid/nonfinite/out-of-cap prices cannot buy.
An impossible queued debit must not create a zero-time simulation stall.

Manual Forge/Resonate stages a clone: failure before primary commit rolls the
whole mutation back. Once primary commits, retain its endpoint even if recovery
write fails. Keep saveState's existing return/identity contract. Queued Forge
buys stay in memory under the owning simulation/offline transaction; no save
per level. Tests must use actual faulted offline processing for queue rollback.

## Combat chronology and persistence

All charge grants clip at100 and require a recruited Active recipient. Tap
charge is applied before damage, so a lethal Auto-Ascend clears old-run grants.
Manual/Auto-Tap share the stored lifetime ordinal; the fifth-tap phase survives
Ascend. Relay accrues during the ordered ability pass and is delivered afterward
only if its cast's run still exists. It never targets Support, so it cannot
create feedback loops. Newly ready recipients fire at the existing next
zero-time ability pass, preserving Auto-Tap/Forge/Study phase order.

All same-run guards use a transient object identity replaced by each actual
Ascend. Saved ascendCount can stagnate beyond integer precision and therefore
cannot identify a run. Preserve that counter byte-for-byte where addition does
not change it. The same identity protects the existing passive-interval guard
from crediting old-run time to new-run charge/automation. No save field is added.

Spillway applies to discrete taps and abilities, never passive damage. It can
hit only the immediately following nonboss and never crosses Ascend, recurses,
or feeds source-overkill resource bonuses. Utility conversion uses the original
native rounded reward, so conversions/overkill cannot compound recursively.
Existing offline reward scaling applies exactly once to all cast currencies.
Support pulses use Arcane, contextual Bonds, boss factors and Ultimate×2; they
do not use passive Support buffs or the Support Mote Module as damage factors.

Amplifier Trim only changes future casts. Saved original strengths1.25/1.5
remain valid; new allowed strengths are exactly those expressions plus0.01k,
integer k from0 through the retained effective level. Do not round malformed
values onto this lattice or delete paid cast snapshots when buying a level.
Normalization reads research before validating those snapshots and the expanded
Resonate limit. Spent fourth/fifth uses survive save/load; purchase of capacity
must not reset the counter. Lab Resonance Efficiency continues to affect price.

## Estimates and automatic boss policy

A fluid charge-rate sum is inaccurate because grants can clip at100. The HUD
uses a bounded, cached charge-event reference with current powered formation,
natural fill, Support profiles, end-pass Relay, nonlethal boss refunds and1Hz
Auto-Tap. Burn64 natural cycles, measure256, resolving the burn endpoint before
counting and including the final endpoint. Integrate actual reference Support
uptime. Cache excludes current charge/wallet/Wisp power; power is applied after
rates. No enemy/state mutations are allowed. Current bars display a natural
charge estimate when conditional grants can fire earlier.

This reference is an estimate, never authority to force Push/Farm changes.
New combat mechanics activate conservative analytical bounds. Let f be natural
charge/sec, T=100−1e−7, tap rate r=1000/(1000−1e−7), q_i the first powered
Wisp's Auto-Tap grant (otherwise0), Q the Relay grant and R the non-Support
nonlethal boss refund. Support casts have count bound a_s+r_s*t, where
a_s=(100+q_s)/T and r_s=(f+q_s*r)/T. Non-Support bounds use
a_n=(100+q_n+Q×sum(a_s))/(T−R) and
r_n=(f+q_n*r+Q×sum(r_s))/(T−R). Natural/refunded lower rates are f/100 and
f/(100−R); clipping can only improve those maximum-cycle bounds.

Lower damage ignores incidental positive gifts and all Support buff uptime.
Saved epoch deadlines can quantize an expiry earlier; an exact-duration uptime
average is therefore not a guaranteed lower bound. Support remains in the HUD
reference and upper bound. Upper passive/tap buffs include
the strongest saved or future cast for each Support source and the opaque old
buff entitlement; mixed old/future sources must not be omitted. Count every
possible initial cast plus one full cadence tap in a separate burst budget.
Retain lifetime tap counters even beyond safe integer precision. Such an
ordinal can stop incrementing and trigger Cadence on every tap or none. The
controller therefore excludes Cadence from its lower bound and allows its full
bonus on every tap in the upper bound, independent of the ordinary HUD average.
If the next60 taps cross safe integer precision, the HUD averages those actual
60 counter increments. This handles both already-stalled and transitional
ordinals without rewriting their saved value; ordinary counters retain1/5.
LowerDPS>regen with numerical slack permits sustained retry. UpperDPS<regen
with slack and currentHP>burstBudget permits retreat after the existing grace.
Otherwise preserve current intent. Nonfinite bounds are uncertain. Current
Push uses actual saved enemyMaxHp; Farm retry uses canonical future boss HP.
Zero new ownership retains the original controller and numerical paths.

## Required verification and delivery limits

Every new row: independent0/1/cap/overcap effects and price/unlock oracles,
single/bulk/queue exact debit, primary/recovery/backup/idempotence and real
Ascend retention. Assert actual Ascend/reset/payout before preservation checks.
Cover manual/live/offline, lethal Support Auto-Ascend, split/yielded windows,
simultaneous purchases, two-Support order, clipping, saved buffs and huge wallets.
Causal negatives must reach gameplay assertions, not merely fail initialization.

Keep frozen old fixtures and reward oracles; assert new fields0/OFF before
projecting them out for old whole-state comparisons. Run the full182-scenario
suite and its22 negative controls, focused Lab/Prism/Forge suites, V8.6,
source/tooling/task context and guarded startup. Actual browser acceptance uses
320/390/430px × CSS root font16/32px × both motion modes: all twenty cards, native
Current/Next/Purchase impact, separate currency colors, touch/keyboard44px,
focus and real last-row scroll. Retain the old Luminous Tracking regression.
Root-font scaling doubles rem-relative text; fixed-px text can remain unchanged.
It does not establish native WebView textZoom or TalkBack acceptance.

Only integrate the source-bound green candidate into the PR102 development
branch. Physical Android, native WebView60 and TalkBack remain separate and
open; this work neither builds nor publishes an APK and never changes main.
