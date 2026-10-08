# Exclusive upgrade matrix — proposal awaiting the user's design choice

This is a reviewable proposal, not implemented behavior. The user has approved
original-currency refunds for removed/over-cap purchases. The outstanding choice
is whether reshaped duplicate upgrades keep their old bonuses as legacy value or
instead remove those bonuses and refund their prices. Active paid Study work,
duration and speed snapshots remain intact in either option.

## Inventory and proposed division

| System | Existing effects | Proposed unique responsibility | Purchase currency |
|---|---|---|---|
| Forge | Kill Lumen/Shards, passive damage, Guardian Tap, ability charge, ability damage/resources, Luminous encounter chance | Keep these direct combat/resource effects and the three existing cap10 exclusives | Existing Lumen/Shards curves |
| Lab | Passive damage, Guardian Tap, offline rate, kill Lumen/Shards, passive Formation damage, Motes, Prisms, future Study work | Boss regeneration, temporary support strength, Boss Sigils, Motes and future Study work; paid time remains essential | Existing Lumen/Shards; Motes purchase speed |
| Tree | Kill Lumen, Guardian Tap, offline rate, Empower discount, Prisms, passive damage, offline hours | New-run starting resources/ability readiness/recruitment, plus offline efficiency and prestige rewards | Existing Prisms curves |

The original Lab damage/Tap/kill-resource/Prism effects overlap Forge or Tree.
Tree Starlight/Steady/Momentum overlap direct Forge effects. Deep Reserves is
already retired and refunded under the approved12h requirement.

Candidate Lab changes: retain Luminous Sense and Measured Inquiry; reshape
Guardian's Mastery into Boss-regeneration research, Formation Insight into
support-strength research, and Rift Attunement into Sigil research. Retire the
four duplicate projects Wisp Ascendancy, Shard Attunement, Lumen Wellspring and
Ascendant Clarity from future purchase. Retain all paid running records and their
old completion semantics. Candidate Tree changes: new-run Lumen, initial ability
resource on recruitment and a new-run recruitment benefit replace the three
direct damage/resource duplicates. The proposed division must be confirmed
before these mechanics and their final measured numbers are implemented.

## Stacking and value preservation

- Forge damage/resource factors multiply only their documented operands.
- Lab regeneration multiplies Boss regeneration, then Vanguard applies its0.80
  factor. Support research changes the bonus strength, preserving the approved
  fixed1s/1.5s duration and Swift cap10. Tide/Aurora remain additive sources.
- Lab Sigils and Motes affect their named rewards only and round once at payout.
  Measured Inquiry changes future paid-work snapshots, never existing records.
- Tree new-run grants occur once during an actual Ascend or legitimate first
  recruitment. Loading, preview, failed purchases and backup do not grant them.
- Keep raw historical purchases separate from new effective levels. For the
  legacy option, old bonuses/paid completions remain explicitly identified
  legacy value. For the refund option, removed effects receive original-currency
  receipts once; huge wallets use the already implemented exact credit ledger.

Final progression measurements must cover all eight systems after this decision.
The current equal-budget Wisp evidence is not a full campaign/pacing approval.

## Comet replacements awaiting choice

| Price | Proposed unlock | Concrete behavior |
|---|---|---|
|140 Comets|Constellation Trials|Optional Formation challenges with visible fixed conditions and cosmetic completion marks; no random rewards or compulsory progression gate|
|50 Comets|Comet Trail|Selectable decorative trail in Rift; persists, respects reduced motion and never intercepts taps|
|160 Comets|Guardian Crest|Selectable Guardian/Ascend emblem; persists and has no hidden combat multiplier|

Each unlock is a one-time purchase. Old Extended Rest/Deep Rest/Loadout Memory
ownership does not silently purchase a replacement: their approved140/160/50
Comet refund leaves the player free to choose. Auto-Ascend remains100 Comets.
The alternative requested in the pending question replaces Trials with a purely
cosmetic unlock. Do not ship either alternative before the user's answer.
