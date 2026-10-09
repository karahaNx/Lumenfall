# Research Lab expansion — design, ownership and acceptance

## Mandate and baseline

The user approved implementation, not just a proposal, of20+ meaningful Lab,
Forge and Tree tracks, expanded Comet upgrades, preserved paid value and red-only
unaffordable currency costs. Delivery was changed to sequential improvements with
one final APK. This is Lab/task02 only, based on PR102 development b46d148f.
Task01's Prism formula, paid-value protection and Lab focus repair remain intact.
Older LAB_EXCLUSIVE_001 proposal blockers are historical, not a new approval gate.

## Catalog and prices

There are20 purchasable projects: the6 existing Foundations and14 new projects.
The3 retired Study IDs still accept paid historical completions but are not sold
or displayed as permanent legacy cards. No existing completed levels are repriced.
All starts cost the stated Lumen AND Shards; all are timed; Motes buy acceleration.
Names below describe different mechanics, not repeated generic DPS multipliers.

| ID / Project | Unlock Rift | Cap | Base Lumen / Shards | Cost growth | Base work seconds | Work growth | Effect per completed level |
|---|---:|---:|---:|---:|---:|---:|---|
| labcapacity / Expanded Apparatus |40|2|20000 / 2000|2|1800|2|+1 concurrent Study slot; maximum2 extra|
| procurement / Research Procurement |25|10|12000 / 600|1.55|900|1.45|-2% future Lab Lumen/Shard prices; excludes itself|
| catalysis / Mote Catalysis |60|10|40000 / 1500|1.55|1200|1.45|-2% future Mote speed-tier prices|
| focusprotocol / Focused Apparatus |40|5|20000 / 800|1.60|1200|1.50|-1% future work per unused slot after starting; maximum30%; excludes itself|
| fieldnotes / Field Notes |15|10|6000 / 300|1.55|600|1.45|+2 Motes when another Study genuinely completes|
| curriculum / Balanced Curriculum |60|3|60000 / 2000|1.75|1500|1.60|-1% future work per different completed expansion subject, maximum10 subjects/30%; excludes itself|
| bossledger / Boss Survey |20|10|14000 / 500|1.55|720|1.45|+5% Lumen/Shard boss-kill rewards|
| luminousdistill / Luminous Distillation |35|10|25000 / 800|1.55|960|1.45|+10% Lumen/Shard Luminous-kill rewards; no encounter/Mote change|
| sigilcartography / Sigil Cartography |60|5|80000 / 3000|1.70|1500|1.60|+1 Sigil per boss kill|
| rarityappraisal / Rarity Appraisal |15|10|8000 / 500|1.55|600|1.45|-2% future Rarity Shard prices; Lumen unchanged|
| modulefabrication / Module Fabrication |30|10|20000 / 1000|1.55|900|1.45|-2% future Module Lumen/Shard prices|
| ultimateanalysis / Ultimate Analysis |70|10|100000 / 4000|1.60|1200|1.45|-2% future Ultimate Sigil prices; Mythic requirement stays|
| resonantefficiency / Resonance Efficiency |50|5|30000 / 1200|1.60|1000|1.50|-2 Sigils per Resonate refill,25 down to15; run limit stays|
| adaptivegrowth / Adaptive Growth |45|5|30000 / 1600|1.60|1000|1.50|-1 required Wisp level per future Rarity tier,maximum5 fewer; minimum1|

At raw level L, nominal price = round(base*costGrowth^L); nominal work =
round(baseWork*workGrowth^L). An earned Procurement discount is applied to future
starts only, rounding each discounted currency UP. It never discounts itself.
Mote Catalysis applies the same round-up policy to each complete speed-tier price,
not just a delta between tiers. Every newly started level still begins at1x.

Existing Inquiry keeps its original8 target IDs (including historical paid IDs),
cap and self-exclusion. Focus and Curriculum then multiply separate remaining-work
fractions into the future snapshot, rounded to one second and never below1.
Only the number of unused slots immediately after this start counts. Later filling
slots or earning discounts cannot stretch or shorten already-paid snapshots.
Curriculum counts earned different expansion IDs, excluding itself and capped at10;
raw duplicate/over-cap levels do not count extra subjects. Focus/Curriculum can
shorten each other, but neither shortens its own study via its own effect.

First new project work is600–1800 seconds at1x. Finite new caps bound discounts
and reward growth. Capacity is deliberately a material/time investment and remains
independent of the number of catalog entries. There is no measured time-to-reach
claim for a complete campaign. The recorded late Swift ROI belongs to the later
Tree pricing task, not a silent economy rewrite here.

## Integration contracts

- Defaults add zero levels,OFF queue andOFF Mote spending. Existing schema2 and
  save/recovery keys remain. No past purchase refund or ownership conversion.
- Raw over-cap new levels survive, with effects capped and new starts refused.
- Normalize up to5 plus earned capacity records (maximum7), preserving every
  known paid total/remaining work/speed. Ordinary old saves retain the5 limit.
- A completion grants one level, then removes its record. Field Notes pays once
  on another earned completion, never on itself/over-cap closure/load/render.
  Ties retain the established reverse active-record completion order; a newly
  earned Field Notes level can affect later completions at that same timestamp.
- Queues keep the existing chronological completion/start/speed order and whole
  prices. Discounts never turn pending work into completed effects prematurely.
- Positive whole-currency Lab and Mote debits require an exactly representable
  subtraction. An unavailable huge-wallet purchase does not get a false red
  insufficient-currency label; spending remains refused rather than free.
- Boss/Luminous percentages add a rounded bonus to the original rounded kill
  reward. Bosses are not Luminous. Ability/Prism/Mote amounts and encounter chance
  are not multiplied by these new reward tracks. Sigil Cartography is boss-only.
- Farm batching counts actual deterministic Luminous kills. The earliest
  affordable purchase boundary uses the same normal/Luminous batch rewards,
  so extra drops cannot silently delay queued purchases to a later event.
- Refinement changes material costs/required Wisp level, not power, role, Rarity,
  Module or Ultimate effect formulas. Resonate stays manually triggered with its
  original unlock and three-per-run cap; only the visible price can decrease.
- Every Path still requires the original five active foundations. Catalog growth
  does not retroactively move earned Deed thresholds or invent Comet grants.
- UI retains Lab navigation/focus and makes the20 tracks readable in four groups.
  Each missing currency amount is red independently, without a shortage label.

## Evidence plan and limitations

Committed core tests execute the complete product IIFE with only presentation
stubbed. They cover each unlock,price/cap boundary, delayed grant, pure rejection,
seven paid slots, defaults/idempotence, cold load/backup/Ascend,discount exactness,
actual material buys,kills,earliest purchase boundary and live/offline rollback.
Independent test BigInt accounting is not shipped in the WebView.

Browser tests use the existing CDP transport and actual input at320/390/430px,
100/200% root text, normal/reduced motion. They require20 actual purchasable cards,
all14 new starts and completions, independent currency transitions,real discounted
speed,queue/focus,seven-slot reload and no runtime errors. V8 6.0 checks are separate.
Required full existing CI and22 negative controls remain. Original catalog-only
assertions now protect all original entries plus the additive14; the Inquiry
matrix still tests every original target against its unchanged independent oracle.

Local browser receipt has zero completed assertions:127.0.0.1 is explicitly blocked
by environment policy. It is not a product pass. Initial core fixtures also exposed
existing offline boss retry and minimum5-second catch-up semantics; fixtures now
isolate the intended comparison without changing those product policies.

No native Android, physical-phone,OS text-scaling,TalkBack or signed APK acceptance
is claimed. No full private user save or font binaries are included in evidence
commits. Final PR receipt must state exact validated commit/tree/source and results.
