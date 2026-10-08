# F29 implementation contract

The user delegated duplicate decisions to UPGRADE_IDENTITY_001 and instructed
implementation/publication on 2026-10-08. Workshop currencies stay unchanged.
This contract chooses **fusion into existing effects**, using verified current
prices/work instead of inventing values for speculative replacements.

`k` is the raw purchased/completed level; capped Forge effects use `min(k,10)`.
L = Lumen, S = Shards, P = Prisms. A recipe `L800 S80 ×1.8` means both currencies
grow by that factor per level. Existing rounding and bulk geometric-sum rules
remain authoritative. Closed rows retain their original raw data and operands.

| System / raw ID | Effect and stacking operand | Original recipe | Future buying owner |
| --- | --- | --- | --- |
| Lab wispascend | passive Wisp factor `1+.15k`, also Wisp-powered tap base | L800 S80 ×1.8; work180s ×1.6; Rift1 | Retain here |
| Lab guardmastery | tap factor `1+.20k` | L600 S40 ×1.8; work150s ×1.6; Rift1 | Retain here |
| Lab riftattune | offline rate `+.10k` percentage-point operand | L500 S100 ×1.8; work240s ×1.6; Rift1 | Close; Tree echo |
| Lab shardstudy | kill Shards factor `1+.08k` | L400 S150 ×1.8; work200s ×1.6; Rift15 | Retain here |
| Lab lumenstudy | kill Lumen factor `1+.08k` | L1400 S120 ×1.8; work260s ×1.6; Rift25 | Retain here |
| Lab formationstudy | passive Wisp factor `1+.05k` | L2200 S220 ×1.8; work320s ×1.6; Rift40 | Close; Lab wispascend |
| Lab motestudy | fixed Luminous Mote yield factor `1+.10k` before original rounding | L3200 S320 ×1.8; work380s ×1.6; Rift60 | Retain here |
| Lab prismstudy | Ascend Prism factor `1+.05k` before original reward flooring | L4800 S480 ×1.8; work450s ×1.6; Rift90 | Close; Tree swift |
| Lab measuredinquiry | future original Study work reduction `.02min(k,10)`, no self-discount | L30000 S1200 ×1.8; work600s ×1.6; Rift60; cap10 | Retain here |
| Forge focus | kill Lumen factor `1+.08k` | L200 ×1.5 | Close; Lab lumenstudy |
| Forge sense | kill Shards factor `1+.08k` | L150 S20 ×1.5 | Close; Lab shardstudy |
| Forge formation | passive Wisp factor `1+.05k` | S40 ×1.6 | Close; Lab wispascend |
| Forge resolve | tap factor `1+.10k` | L150 ×1.45 | Close; Lab guardmastery |
| Forge charge | ability fill factor `1+.08k`; cycle `6/(1+.08k)` seconds | S30 ×1.55 | Retain here; F19 tuning separate |
| Forge arcanecal | damaging ability factor `1+.03min(k,10)` | L15000 S120 ×1.6; Rift12; cap10 | Retain here |
| Forge conduction | Gale/Thorn cast resource factor `1+.04min(k,10)`, rounded each cast | L90000 S280 ×1.6; Rift18; cap10 | Retain here |
| Forge luminoustracking | future non-Boss Luminous chance `+.005min(k,10)`, combined cap.35 | L2500000 S1500 ×1.6; Rift32; cap10 | Retain here |
| Tree starlight | kill Lumen factor `1+.10k` | P1 ×1.35 | Close; Lab lumenstudy |
| Tree steady | tap factor `1+.08k` | P1 ×1.30 | Close; Lab guardmastery |
| Tree echo | offline base rate `min(1,.70+.05k)` | P2 ×1.40 | Retain here; effective purchase-cap PR66 separate |
| Tree bonds | recruit/Empower discount `min(.6,.03k)` | P2 ×1.45 | Retain here; effective purchase-cap PR66 separate |
| Tree swift | Ascend Prism factor `1+.04k` | P3 ×1.50 | Retain here |
| Tree momentum | passive Wisp factor `1+.06k` | P5 ×1.55; Ascend5 Deed | Close; Lab wispascend |
| Tree reserves | offline cap `+2k` hours | P6 ×1.60; Rift100 Deed | Retain pending separate F26 transition |

Ten buying tracks close; fourteen remain. Ability cast resources, kill resources,
Mote yield and encounter chance act on distinct events. Arcane Calibration does
not affect passive/Tap; Conduction does not affect kill rewards; Tracking never
rerolls the current enemy and does not increase Motes per enemy. Existing fixed
Mote rewards, Modules/Bonds, Sigils/Ultimates/Resonate and Comet unlocks stay.
The existing later/more expensive exclusive Forge unlocks remain unchanged.

## Exact value preservation

No level conversion, currency refund, destination-level credit, schema bump or
extra purchased benefit. All 24 IDs stay in fresh/canonical saves. Ownership is
the existing raw fields, not a new ledger that could apply the value twice.
Closed fields still contribute through the original formulas in the same order:

- Kill Lumen: `(1+.10 starlight) × (1+.08 focus) × (1+.08 lumenstudy)`.
- Kill Shards: `(1+.08 sense) × (1+.08 shardstudy)`.
- Tap factors: `(1+.08 steady) × (1+.10 resolve) × (1+.20 guardmastery)`.
- Passive Wisp factors retain Formation Training × Formation Insight,
  existing synergy, Eternal Momentum and Wisp Ascendancy in their original order.
  Other Wisp/support/ability formulas remain untouched.
- Offline rate: `min(1,.70+.05 echo) + .10 riftattune`. Old paid Lab value may
  therefore still exceed100%; no clamp silently discards that entitlement.
- Prism multiplier: `(1+.04 swift) × (1+.05 prismstudy)`, before unchanged
  Ascend eligibility, base reward and flooring.

Read-only preserved rows show the actual old contribution and the new owner.
No owned row is deleted. Closed direct/bulk/queue actions cannot pay for another
level; old ON choices remain inert, rather than redirecting spending intent.
Paid closed Studies keep their work snapshots, paid speed and selected Mote
retry intent. They complete and earn one final original level, then cannot
restart. Actual elapsed work/completion order is unchanged, including offline.
Re-normalization/reload/backup/recovery cannot mint currency or duplicate value.
An intentionally restored old backup retains that backup's original ownership.

## Progression continuity

Slot capacity stays2 at Rift1,3 at40,4 at60 and5 at90. The retained historical
catalogue anchors those thresholds independently of currently buyable rows.
First Discovery and Devoted Scholar still count all original eight raw Study
IDs, including closed paid completions; Inquiry remains excluded. Every Path
Studied now requires one level in each of the five retained original Studies.
Earned Deeds stay sticky; the one-time reward pool is still683 Comets.

Forge20/60 Deeds keep all five original IDs and thresholds; new exclusive levels
do not retroactively change that contract. Old levels keep full credit. A fresh
player can still reach both through uncapped charge. This concentrates that
future route in charge; its pacing belongs to F28/F19, not invented replacement
prices in this identity feature. Study automation/speed policies remain intact.

Purchased Inquiry levels retain the same2% per level up to20%, original nested
rounding and no self-discount, on every remaining eligible future Study. Their
reduction remains permanent and does not alter any already paid work snapshot.
The three closed targets no longer accept starts; Inquiry's future target set
therefore has five paths. This scope change is explicit, not a numerical refund
claim or a promise of work reduction on instantaneous Tree purchases.

## Other proposals and dependencies

Lab PR62 Shared Apparatus/Staged Research and Forge PR64 Impact Reservoir,
Conduit Remainder/Luminous Anchor were proposals needing their own prices,
limits/reset rules. They are not implemented or assumed approved by this matrix.
Tree PR66 caps and PR67/70 gameplay work remain separate. No unrelated branch
is merged, overwritten or archived. F18/F19 support/charge tuning, F26 offline
cap/refunds and F28 full economy pacing remain their own acceptance goals.

The closed-queue Farm regression requires the two small clock corrections from
PR70 head7284cf716250355e1bf68d00590f81ab96f49a3d: canonical-grid progress
detection and a separately computed endpoint fraction. Its Wisp/catalog/UI
changes are excluded. Exact old-engine state/summary comparisons retain the
immutable original with only those clock fixes; a real saved-queue negative
restores the old guard and must detect the stall.
