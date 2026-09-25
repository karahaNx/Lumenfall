# 02 — Gameplay / Progression Audit

_Audited: 2026-09-25_  
_Audited branch: `main` @ `81017f06a9fcffb796528ca16baf1553c9f7f66f`_  
_Gameplay source: `index.html` blob `6837b8e54dd9233391d79d203413361bdd8808fe`_

## Scope

This audit covers the 02 — Gameplay / Progression workstream defined in `docs/CHAT_OWNERSHIP.md`: combat, Rift Push/Farm, bosses, Wisps, Formation Bonds, currencies, progression, Ascension, Lab systems, Long Studies and balance.

GitHub `main` is the source of truth. This document is an audit and recommendation record only. No gameplay, balance, save, Android or workflow behavior is changed by this commit.

## Current combat loop

Lumenfall runs live combat through a 100 ms tick loop.

The live sequence is currently:

1. Check whether Auto-Ascend should trigger.
2. Apply passive Wisp DPS to the current enemy.
3. Apply boss regeneration when the current Rift is a boss.
4. Fill each Active Wisp's ability resource.
5. Trigger a Wisp ability when its resource reaches 100%.
6. Run Auto-Tap once per second after the Tireless Vigil unlock.
7. Run Auto-Empower once per second after The Lab Never Sleeps unlock.
8. Purchase queued normal Research when affordable.
9. Advance active Long Studies and fill queued Study slots.
10. Refresh combat and affordability UI.

Manual Guardian Tap is additive damage. It is rate-limited to 20 trusted pointer inputs per second. Auto-Tap strikes once per second when unlocked.

Wisp combat is built from two damage layers:

- passive Wisp DPS from Active party power;
- periodic abilities on a base six-second cycle, accelerated by Swift Recovery.

Support abilities temporarily increase party power. Damaging abilities are burst events. Ranged and druid abilities also generate Shards or Lumen.

The game separately models offline combat through `simulateOfflineRun()`. Offline simulation uses sustained averaged DPS, averaged support uptime and averaged ability output to calculate time-to-kill. This is directionally sound for an idle game, but the live and offline engines do not currently resolve high damage and automation with equivalent timing semantics.

### Primary combat consistency issue

Live passive damage can defeat at most one enemy per 100 ms passive tick because excess damage does not carry into the next enemy. Other discrete events such as Wisp abilities and taps can add additional kills, but the passive channel itself is effectively event-limited.

Offline combat instead uses:

`timeToKill = currentHP / sustainedCombatDPS`

This makes excess damage perfectly efficient and permits arbitrarily small kill times. At high power, offline Farm can therefore process enemies materially faster than equivalent live play.

This is the highest-priority gameplay risk because every economy and pacing decision depends on time-to-kill.

The `OFFLINE_MAX_KILLS = 5000` safety limit creates a second divergence. After 5,000 simulated kills, remaining time is extrapolated only from observed Lumen and Shard rates. Rift progression, Luminous rolls, Motes, Sigils, boss kills, Ascensions and other stateful events stop advancing for the extrapolated remainder.

## Current progression loop

The current macro loop is:

**Fight → earn Lumen/Shards → recruit and Empower Wisps → improve Rarity/Modules → build a Formation → Push → hit a boss/wall → Farm → buy permanent progression → Push farther → Ascend for Prisms → repeat.**

Persistent progression is layered across:

- Wisp Rarity;
- Wisp Modules;
- Wisp Ultimates;
- normal Lab Research;
- Long Studies;
- Ascension Tree nodes;
- Deeds and their unlocks;
- convenience automation;
- currencies that survive Ascension.

Run-based progression consists mainly of:

- current Rift depth;
- current Lumen;
- Wisp levels;
- current enemy state.

The overall architecture successfully creates repeated short-term rebuilding while retaining multiple permanent growth vectors.

## Push/Farm relationship

Push and Farm are explicit modes rather than hidden simulation states.

### Push

Push advances Rift depth after each kill. Bosses occur every 10 Rifts. Progress is recorded in `maxDepthEver`, and `progressionDepth()` represents the player's meaningful Push position.

### Farm

Farm preserves the exact Push return point in `farmReturnDepth` and repeatedly fights the highest cleared non-boss Rift through `highestFarmableDepth()`.

Farm therefore:

- does not advance Push depth;
- does not repeatedly farm bosses for Sigils;
- retains the player's Push point;
- uses normal combat rewards and Luminous encounters;
- is also used by offline boss fallback.

This relationship is one of the stronger current systems. The player understands that Push is for progress and Farm is for power accumulation.

### Farm balance concern

Normal enemy HP grows by approximately 14.5% per Rift, while base Lumen reward grows by approximately 11% and base Shard reward by approximately 9%.

At equal player power, reward per enemy HP therefore declines with depth:

- Lumen efficiency factor per depth is approximately `1.11 / 1.145 ≈ 0.970`;
- Shard efficiency factor per depth is approximately `1.09 / 1.145 ≈ 0.952`.

The game forces Farm onto the highest valid cleared non-boss Rift, so players cannot exploit an older mathematically optimal depth. However, the reward curve itself does not currently guarantee that a deeper Farm target is more efficient.

Do not retune these exponents until live/offline combat parity is fixed.

## Wisps and party systems

There are eight Wisps:

- Ember — Rift 1;
- Tide — Rift 3;
- Stone — Rift 6;
- Gale — Rift 9;
- Thorn — Rift 12;
- Void — Rift 18;
- Aurora — Rift 24;
- Titan — Rift 32.

Up to five Wisps may be Active.

Each Wisp has:

- a base cost;
- base power;
- level;
- Rarity tier;
- Module progression;
- an Ultimate;
- a class/role;
- an ability type;
- an ability resource bar.

Wisp level power follows:

`basePower × level × (1 + 0.01 × (level - 1))`

Empower cost grows by approximately 13% per level. This makes repeated levels increasingly expensive while Rarity milestones provide larger permanent jumps.

### Rarity

Rarity tiers are Common, Uncommon, Rare, Epic, Legendary and Mythic with power multipliers:

`1x, 1.5x, 2.25x, 3.5x, 5.5x, 9x`

Rarity upgrades require Wisp levels 8, 16, 24, 32 and 40.

A hidden global collection bonus also exists: every Rarity tier across the whole roster adds 2% through `synergyMult()`.

That bonus is meaningful. A complete eight-Wisp Mythic roster represents +80% global power from this hidden layer alone. Because the global bonus per tier is identical while Lumen Rarity cost scales with Wisp base cost, cheap early Wisps are disproportionately efficient sources of global permanent power.

### Modules and Ultimates

Modules have 20 levels.

- DPS/Tank modules increase ability burst damage.
- Ranged modules increase ability-generated Shards.
- Druid modules increase ability-generated Lumen.
- Support modules increase Motes from Luminous kills while that support Wisp is Active.

Ultimates require Mythic Rarity and Sigils. They generally double ability output; Support Ultimates instead increase both buff strength and duration.

### Formation Bonds

There are four two-Wisp Bonds:

- Starcaller — Ember + Void: +18% Wisp damage;
- Dawnpriest — Tide + Aurora: +25% Lumen, Shards and Motes;
- Duskguard — Stone + Titan: +35% Wisp damage against bosses;
- Pathfinder — Gale + Thorn: +20% Wisp damage against non-bosses.

Because the pairs do not overlap and there are only five Active slots, the player can activate at most two complete Bonds simultaneously. This creates a real build tradeoff between Push, Farm and Boss specialization.

### Wisp scaling inconsistency

Several global "party/Wisp power" systems affect passive damage through `effectivePartyPower()` but do not equivalently scale damaging ability burst through `abilityBurstDamage()`.

Examples include permanent multipliers such as Formation Training, Eternal Momentum and Wisp Ascendancy.

If active abilities are intentionally a separate scaling channel, their descriptions should explicitly communicate that. If "Wisp power" is meant to include ability damage, the formulas are inconsistent.

## Bosses and difficulty scaling

Bosses appear every 10 Rifts.

Boss HP uses the normal exponential HP curve multiplied by 6.

Boss traits rotate every 30 Rifts:

1. **Regrowth** — 0.9% max HP regeneration per second.
2. **Fractured Core** — 0.5% max HP regeneration per second and Wisp abilities deal 1.75x damage.
3. **Guardian's Mark** — 0.6% max HP regeneration per second and Guardian Tap deals 3x damage.

Bosses award enhanced Lumen and Shards plus deterministic Sigils based on boss depth.

The rotating traits are a meaningful strength. They create different optimal damage sources without adding separate combat modes.

Boss difficulty is primarily a DPS threshold:

`net DPS = player sustained DPS - boss max HP × regeneration rate`

Because enemy HP scales exponentially, the raw DPS needed to overcome regeneration also grows exponentially.

### Offline boss behavior

If an offline boss cannot be finished within the remaining offline window, the simulation switches into the same explicit Farm mode used online, saves the boss as the Push return point and farms the highest valid non-boss Rift.

If Auto-Empower later makes the party strong enough and enough offline time remains, the simulation retries the boss.

This is substantially better than letting offline progress stall completely at an unbeaten boss.

However, the rule means even a technically beatable boss is abandoned if its estimated kill time exceeds the remaining background interval. That behavior should remain deliberate and tested, because short app suspensions can alter mode state.

## Ascension

Ascension unlocks after clearing 15 Rifts.

Prism gain is:

`floor(2 × sqrt(cleared Rifts) × Prism multiplier)`

The square-root base curve makes deeper Ascensions more rewarding without making Prism generation explode linearly with depth.

Ascension currently resets:

- Rift depth;
- Push/Farm run state;
- Lumen;
- Wisp levels;
- Wisp ability resources;
- temporary support buff state;
- Auto-Tap and Auto-Empower accumulators.

Ascension keeps:

- Wisp Rarity;
- Modules;
- Ultimates;
- normal Research;
- Long Study levels and active Study state;
- Shards;
- Motes;
- Sigils;
- Comets;
- Prisms;
- Ascension Tree nodes;
- Deeds;
- owned convenience unlocks.

### Ascension Tree

The current nodes improve:

- Lumen income;
- Guardian Tap;
- offline earning rate;
- Wisp recruiting cost;
- Prism gain;
- party power;
- offline duration cap.

Eternal Momentum unlocks after five Ascensions. Deep Reserves unlocks after reaching Rift 100.

### Ascension state inconsistency

`applyAscendMutation()` resets Wisp levels but retains the prior `activeParty` IDs in memory. This permits the previous formation to be rebuilt by Auto-Empower while the same app session continues.

On reload, `loadState()` removes Active-party IDs whose Wisp level is zero.

Therefore formation memory after Ascension differs depending on whether the player closes/reloads the app. The intended contract should be chosen explicitly and made invariant.

### Auto-Ascend target ambiguity

Auto-Ascend targets use current/progression depth. Current depth represents the enemy the player has reached, not strictly the deepest enemy already defeated.

Example: clearing Rift 19 moves the player to Rift 20. A stored Auto-Ascend target of Rift 20 can therefore trigger before boss 20 is defeated.

That can skip the target boss and its Sigil reward on repeated automated loops. Auto-Ascend should be defined using an explicit **cleared Rift** target, not ambiguous current depth.

## Lab / Long Studies

The Lab has two permanent systems.

### Normal Research

Five repeatable nodes exist:

- Battle Focus — Lumen income;
- Shard Sense — Shard income;
- Formation Training — party power;
- Guardian's Resolve — Guardian Tap;
- Swift Recovery — ability charge speed.

Bulk buying supports 1x, 5x, 10x, 25x, 50x, 100x and Max.

Each Research node has an independent Queue toggle. Live play repeatedly buys affordable queued levels.

### Long Studies

Eight repeatable Long Studies exist, unlocking progressively through Rift 90.

They improve:

- Wisp power;
- Guardian Tap;
- offline earning rate;
- Shard income;
- Lumen income;
- formation power;
- Mote income;
- Prism gain.

Studies consume real elapsed time. More Study slots unlock as more Study types become available, eventually reaching five simultaneous slots.

Motes can increase an active Study from 1x speed through tiers up to 8x.

### Offline Research ordering problem

Offline combat is simulated first. Only after the combat simulation finishes does `applyOfflineProgress()` repeatedly call the Research Queue buyer.

Equivalent live play would purchase queued Research as soon as currency became available, allowing those Research levels to affect later combat during the same time window.

Offline play therefore under-applies Research power/income during the interval and then spends the accumulated currency at the end.

### Long Study Queue problem

Offline time is applied once to every currently active Study.

If a Study finishes, its excess elapsed time is discarded. The queue then fills the empty slot, but the newly started queued Study receives none of the remaining offline time.

Example: a 3-minute Study followed by another queued Study during an 8-hour absence completes only the first level. The queue starts the next level on return rather than approximately 7h57m earlier.

This contradicts the current user-facing promise that queued Studies begin as soon as both a slot and the currencies are available.

### Mote speed-tier trap

`applySpeedTier()` charges the full cost of the selected speed multiplier and permits the player to skip directly to a higher tier.

Buying 1.5x, then 2x, then 3x pays all three full prices. Waiting and buying 3x directly pays only the 3x price.

Intermediate purchases are therefore strictly inefficient. That creates a knowledge trap rather than an interesting upgrade decision.

## Currencies and rewards

### Lumen

Sources:

- normal and boss kills;
- Thorn/druid-style ability income;
- applicable reward multipliers.

Uses:

- recruit and Empower Wisps;
- Wisp Rarity;
- Modules;
- normal Research;
- Long Studies.

Lumen resets on Ascension.

### Shards

Sources:

- normal and boss kills;
- Gale/ranged-style ability income.

Uses:

- Wisp Rarity;
- Modules;
- Research;
- Long Studies.

Shards persist through Ascension.

### Motes

Source:

- deterministic Luminous enemies.

Uses:

- Long Study speed multipliers.

Luminous appearance uses a deterministic accumulator rather than loot RNG. The chance starts at 3%, increases by 2 percentage points per 10 Rifts and caps at 30%.

### Prisms

Sources:

- Ascension;
- the seventh daily-login reward also grants Prisms.

Uses:

- Ascension Tree nodes.

The in-game currency description currently says Prisms are earned only by Ascending, which is not fully accurate because the login cycle also grants them.

### Comets

Sources:

- Deeds;
- Daily Quests;
- daily login rewards.

Uses:

- four one-time convenience purchases in the Comet Rest Stop.

The current currency description says Comets are earned only from Deeds, which is no longer accurate.

The four current Comet purchases total 450 Comets. After they are owned, Comets have no repeatable sink. Continued Daily/Deed/Login rewards therefore eventually become a dead currency unless more sinks are intended.

### Sigils

Source:

- boss kills.

Use:

- one-time Ultimate unlocks for Mythic Wisps.

The total current Ultimate cost across all eight Wisps is finite. Once every Ultimate is unlocked, Sigils have no further sink while bosses continue generating them.

## Progression pacing

### Early game: Rift 1–15

The early progression cadence is strong:

- Ember starts immediately;
- new Wisps arrive at Rifts 3, 6, 9 and 12;
- first boss at Rift 10;
- Farm becomes useful as resistance rises;
- first Ascension becomes available after clearing Rift 15;
- early Long Studies already establish persistent progression.

This gives frequent goals without exposing the entire system at once.

### Early-mid game: Rift 16–32

The game adds:

- Void at 18;
- boss 20;
- Aurora at 24;
- first region transition at 26;
- boss 30;
- Titan at 32.

At this point the full Wisp roster exists and the build game shifts from collection toward Rarity, Modules, Ultimates, Formation optimization, Research and repeated Ascensions.

### Mid/late game

Long Studies continue unlocking at Rifts 40, 60 and 90. Additional Deed gates exist at Rift 50, 100 and 250, while Auto-Tap arrives after 12 Ascensions.

The late game currently relies primarily on numerical scaling of the existing systems:

- only eight Wisps;
- four Formation Bonds;
- three boss traits repeating every 30 Rifts;
- six visual Rift regions repeating as deeper Echoes;
- repeatable Research/Studies/Ascension nodes.

This is acceptable for the current vertical-slice stage, but after the core balance is stable the game will eventually need new mechanical decisions rather than only larger numbers.

### Permanent multiplier density

The player can stack power/income from Rarity, hidden Rarity synergy, Formation Bonds, Research, Long Studies, Ascension nodes, Modules and Ultimates.

Layering is good for an idle RPG, but many uncapped or repeatable multipliers are multiplicative across system boundaries. That makes later balance difficult to reason about manually and strengthens the case for automated progression simulations before tuning.

## Current strengths

1. **Push and Farm are explicit and understandable.** Progress is preserved and boss rewards cannot be trivially farmed.
2. **Formation Bonds create genuine roster decisions.** Five slots prevent all four two-Wisp Bonds from being simultaneously active.
3. **Boss traits alter damage priorities.** Regrowth, Fractured Core and Guardian's Mark are mechanically distinct.
4. **Progression is deterministic.** Luminous encounters use a deterministic accumulator and upgrades do not rely on loot-box/gacha randomness.
5. **Ascension has a clear reset/keep contract.** The run rebuilds while most long-term investment remains.
6. **Permanent progression has multiple horizons.** Rarity, Modules, Ultimates, Research, Studies and Prisms give short-, medium- and long-term goals.
7. **Offline boss fallback is player-friendly.** The simulation farms rather than wasting an entire absence against an impossible wall.
8. **Early unlock cadence is strong.** New Wisps, the first boss and first Ascension arrive quickly enough to teach the core loop.
9. **Automation is earned rather than immediate.** Auto-Tap, Auto-Empower and Auto-Ascend arrive through progression/convenience systems rather than replacing early play.

## Weak / redundant systems

### 1. Live and offline combat are two different timing models

This is not just implementation duplication; it directly affects rewards and progression speed.

### 2. Wisp resource names are mostly presentation

Mana, Harmony, Rage, Focus and Energy all currently behave as the same 0–100 timed ability meter with the same base fill model. The labels add fantasy identity but not meaningful resource-management decisions.

### 3. Tank is not mechanically a tank

There is no party HP, enemy attack loop, mitigation or threat system. Tank Wisps are currently another burst-damage archetype with a different multiplier/name. This is acceptable as flavor in a vertical slice, but the role label promises more differentiation than exists.

### 4. Rift Regions are currently visual rather than mechanical

Regions change every 25 Rifts, but they do not currently change combat rules, rewards or build priorities.

### 5. Repeating late-game content has limited novelty

Three boss traits and the same Formation structure repeat indefinitely. Once all eight Wisps are collected, the remaining progression is predominantly numerical.

### 6. Some currencies have finite sinks but infinite sources

Comets and Sigils eventually stop supporting decisions while remaining visible and earnable.

### 7. Queue automation uses raw mixed-currency totals

Normal Research Queue and Long Study auto-fill compare `Lumen cost + Shard cost` when determining the nominal cheapest option.

One Lumen is not economically equivalent to one Shard, so this ordering is arbitrary and can produce unintuitive spending.

### 8. Auto-Empower optimizes only nominal cost

Auto-Empower selects the cheapest enabled Active Wisp level rather than evaluating power gain per Lumen or a player-defined priority. It is simple, but it can heavily favor early cheap Wisps.

## Balance risks

### Critical — live/offline parity

High-powered offline combat can process kills much faster than live passive ticks because offline damage has perfect continuous carry-through.

If closing the app is materially more profitable than leaving it open, the idle economy cannot be reliably tuned.

### Critical — 5,000-kill extrapolation loses stateful progression

After the simulation safety cap, only Lumen and Shards are extrapolated. Other rewards and progression stop.

This can disproportionately suppress:

- Motes;
- Sigils;
- boss completions;
- Rift advancement;
- Auto-Ascensions;
- deterministic Luminous progression.

### High — offline automation is not chronological

Research purchases and queued Long Studies do not occur at the same simulated timestamps as live play. Progress earned early in an offline window therefore does not correctly affect the remainder of that window.

### High — ability scaling contract is unclear

Permanent "Wisp/party power" upgrades can increase passive DPS without increasing Wisp ability burst. Ability builds can become proportionally weaker as permanent progression grows.

### Medium — Auto-Ascend can encode arrival depth instead of cleared depth

Automated cycles can Ascend before defeating the boss at the stored target and therefore skip expected Sigils.

### Medium — formation persistence differs across reload

An Ascended formation can remain queued in memory until the app is restarted, after which zero-level members are removed.

### Medium — deeper Farm does not inherently mean better efficiency

HP outscales base Lumen and Shard rewards. Highest-depth farming is enforced by rule, not validated by reward-per-time math.

### Medium — cheap Wisp Rarity has outsized global ROI

Every Rarity tier grants the same hidden +2% global synergy regardless of which Wisp receives it, while early Wisp Rarity costs much less Lumen. This encourages globally upgrading cheap early Wisps first even when they are not part of the desired formation.

### Medium — Mote speed upgrades punish incremental spending

Buying intermediate speed tiers wastes Motes compared with saving for a higher tier directly.

### Medium — permanent multipliers can become difficult to tune

Multiple repeatable systems multiply together. Without simulation-based balance tests, small coefficient changes can have large late-game effects.

### Low — tap objectives become passive after Auto-Tap

Auto-Tap increments tap totals and Daily Quest tap progress. After its unlock, "Strike the Rift" objectives no longer necessarily represent player tapping.

### Low — currency descriptions have drifted from implementation

Prism and Comet descriptions do not list all current sources.

## Prioritized gameplay recommendations

### P0 — Establish one authoritative combat/economy simulation contract

Before changing balance numbers, define what one second of equivalent live and offline play must produce.

The target should be deterministic parity for:

- enemy kills;
- Lumen;
- Shards;
- Luminous/Motes;
- boss regeneration;
- Wisp abilities;
- support buffs;
- Auto-Tap;
- Auto-Empower;
- Push/Farm state;
- boss retreat/retry;
- Auto-Ascend.

The implementation does not have to execute identically online and offline, but its results must be equivalent within a deliberately small tolerance.

Add regression scenarios for one minute, one hour and a capped long absence using identical starting saves.

### P0 — Replace or redesign the 5,000-kill fallback

Do not extrapolate only Lumen and Shards after the safety cap.

Use either:

- chunked/event-based simulation that continues all meaningful state transitions; or
- an analytical fast path for stable Farm periods that also advances Luminous cadence, Motes, automation and relevant state.

Fast simulation must not silently stop boss/Sigil/Ascension progression.

### P1 — Make offline automation chronological

Offline simulation should advance to the next meaningful event:

- enemy death;
- ability event if required by the chosen model;
- Auto-Empower purchase;
- queued Research purchase;
- Study completion;
- queued Study start;
- boss retreat/retry;
- Auto-Ascend.

Then apply the state change and continue with the remaining elapsed time.

This fixes Research Queue and Long Study Queue semantics at the architecture level rather than with more end-of-window patches.

### P1 — Define the Wisp power contract

Explicitly decide which multipliers affect:

- passive Wisp damage;
- damaging abilities;
- Guardian Tap;
- ability-generated Lumen/Shards;
- support strength;
- boss-specific modifiers.

Then make naming and formulas match that contract.

A player reading "+15% power for every Wisp" should not need source-code knowledge to know whether Nova Burst also gains 15%.

### P1 — Add gameplay invariants to QA

At minimum, test:

- online/offline reward parity;
- Push → Farm → Push returns to the exact saved Rift;
- Farm cannot repeatedly award boss Sigils;
- Ascend before/after app reload preserves the intended formation behavior;
- Long Study Queue consumes all applicable elapsed time;
- Auto-Ascend does not skip a target boss unless that is explicitly the rule;
- Luminous accumulator produces deterministic equivalent results;
- 5,000+ kill simulations preserve every relevant reward type.

### P2 — Define Auto-Ascend in cleared-Rift terms

Store a target such as "Ascend after clearing Rift N" rather than using current enemy depth.

The UI and simulator should use the same definition.

### P2 — Decide formation memory behavior across Ascension

Either:

- preserve the selected five-Wisp formation as a separate loadout independent of current Wisp level; or
- intentionally reset the formation.

Do not let reload decide the outcome.

### P2 — Fix Long Study speed-tier economics

Use incremental upgrade cost, cumulative target cost minus already-paid cost, or a single direct speed purchase model.

There should be no mathematically correct reason to avoid lower tiers because they permanently waste Motes.

### P2 — Re-evaluate hidden Rarity synergy

Choose one:

- expose the global collection bonus clearly and balance early-vs-late Wisp Rarity costs around it;
- make the global bonus depend on meaningful collection milestones rather than every cheap tier;
- remove it if Rarity is intended to be individual-Wisp power only.

### P2 — Rebalance Farm after simulation parity is locked

Once timing parity is reliable, measure actual:

- Lumen/hour;
- Shards/hour;
- Motes/hour;
- time-to-next Empower;
- time-to-next Rarity;
- time-to-break each boss wall.

Then decide whether deeper Farm should always be more efficient, merely yield larger per-kill numbers, or deliberately trade efficiency for another reward.

### P2 — Define automation priorities

For Research Queue, Study Queue and Auto-Empower, prefer explicit player priority or meaningful ROI logic over raw `Lumen + Shard` totals / cheapest nominal level.

Keep the interface simple; do not turn automation into a spreadsheet.

### P3 — Repair finite-sink currency design

Before expanding the late game, decide the long-term purpose of:

- Comets after the four Rest Stop purchases;
- Sigils after all Ultimates.

Possible future sinks should preserve the game's deterministic/no-pay-to-win direction.

### P3 — Reduce semantic systems that do not create decisions

Do not add more resource names, roles or regions unless they produce gameplay differences.

If Tank, Mana, Rage or a Rift Region remains primarily flavor, keep the presentation but avoid building unnecessary mechanics around the label.

### P3 — Add late-game mechanical variety only after the core simulation is stable

Future depth should come from decisions, not more overlapping percentages.

Candidates can include new boss interactions, formation constraints, region modifiers or Wisp-specific build choices, but these should wait until combat parity, automation timing and progression invariants are locked.

## Recommended next gameplay task

The next 02 workstream implementation should **not** be new content or broad numeric rebalance.

The correct next task is:

> Build deterministic gameplay simulation parity tests and then unify/correct live versus offline combat and automation timing.

Until that is complete, tuning Wisp costs, Rift HP, rewards, boss regeneration or Ascension yields would be tuning against two different effective games.
