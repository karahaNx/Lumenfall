# P2-03A — Wisp combat-role integrity audit

Audited against `main` @ `d0a373133cdc1c09b1f00d89a736891e044a8d5c`.

## Authoritative findings

The combat model has enemy HP and boss regeneration, but no player/Wisp HP, incoming enemy damage, Wisp death, healing, threat/aggro, armor or mitigation path. Failure is inability to overcome enemy HP/regeneration, not defensive collapse.

The persisted save does not store Wisp roles. `role` is presentation metadata. Authoritative behavior is selected by `abilityType`, active-party membership, Wisp level/Rarity, Modules/Ultimates, Formation Bonds, boss traits and the shared live/offline simulation.

## Current roster audit

| Wisp | Current label | Authoritative mechanic | Audit |
| --- | --- | --- | --- |
| Ember Wisp | DPS | 5× Wisp-Power ability hit; DPS Module scales the hit; Ultimate doubles it | Mechanically a burst-damage Wisp |
| Tide Sprite | Support | No direct ability hit; +25% passive Wisp/Tap buff for 4s, or +50% for 8s with Ultimate | Genuine amplification/support |
| Stoneheart Golem | Tank | 4× Wisp-Power ability hit; Module scales the hit; Stone+Titan Duskguard Bond gives +35% passive/ability damage vs bosses | “Tank” is invalid; no defensive mechanic exists |
| Gale Dancer | Ranged | 3× ability hit plus Shards; Module scales ability Shards; Ultimate doubles damage+Shards | “Ranged” implies no authoritative range/position mechanic; actual identity is Shard utility |
| Thornback | Support | 3× ability hit plus Lumen; Module scales ability Lumen; Ultimate doubles damage+Lumen | Broad “Support” hides its actual Lumen-economy identity |
| Voidling | DPS | 5× Wisp-Power ability hit; DPS Module scales the hit; Ultimate doubles it | Mechanically a burst-damage Wisp |
| Aurora Seer | Support | No direct ability hit; +25% passive Wisp/Tap buff for 4s, or +50% for 8s with Ultimate | Genuine amplification/support |
| Starforged Titan | Tank | 4× Wisp-Power ability hit; Module scales the hit; Stone+Titan Duskguard Bond gives +35% passive/ability damage vs bosses | “Tank” is invalid; no defensive mechanic exists |

## Role dependency audit

No authoritative combat formula branches on `sp.role`. It is rendered in Wisp cards, recruitment/milestone copy and the Encyclopedia. Formation presets store only Wisp IDs and therefore do not depend on role labels.

`abilityType` does have gameplay meaning:
- DPS: 5× ability coefficient; Module scales ability damage.
- Tank: 4× ability coefficient; Module scales ability damage.
- Ranged: 3× damage + Shard generation.
- Druid: 3× damage + Lumen generation.
- Support: temporary passive-Wisp/Guardian-Tap amplification.

Formation identity is class-based, not role-based:
- Starcaller: Ember + Void, +18% passive & ability damage.
- Dawnpriest: Tide + Aurora, +25% Lumen/Shards/Motes.
- Duskguard: Stone + Titan, +35% passive & ability damage vs bosses.
- Pathfinder: Gale + Thorn, +20% passive & ability damage vs non-bosses.

## Resolution

P2-03A does not add a defensive subsystem and does not rebalance combat.

Player-facing roles become:
- Ember / Void: **Burst**
- Tide / Aurora: **Amplifier**
- Stone / Titan: **Breaker**
- Gale: **Shard Utility**
- Thorn: **Lumen Utility**

The internal `tank` ability type is renamed to `breaker` so the authoritative code no longer advertises a nonexistent defensive model. Its coefficient remains 4× and its Module scaling remains exactly unchanged.

Stone/Titan remain meaningful through heavy ability hits plus their existing Duskguard boss Bond. Ember/Void remain distinct as the highest raw ability coefficient at 5×. No damage, reward, Formation, progression, Ascension or economy multiplier changes in P2-03A.
