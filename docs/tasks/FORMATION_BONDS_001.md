# FORMATION_BONDS_001 — eight Bonds

Owner: this feature chat. Goal: implement original F15 in the game.
Status: [PR86](https://github.com/karahaNx/Lumenfall/pull/86) candidate; final combined CI/integration/APK/device acceptance pending.

[Original F15](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt): more than four Bonds with different bonuses.
[Revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt): useful Push/Farm/Boss choices, combos/stacking/equal investments.
[Decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt): autosave before integration; measure before tuning.
[Full request](FORMATION_BONDS_001_REQUEST.txt), latest: “Finish the feature task push to github implement to game”. Live [AGENTS](../../AGENTS.md)/[workflow](../project/FEATURE_WORKFLOW.md) supersede historical PR46/B2/writer gates. No subagents/messages/other-chat changes.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5; product SHA256 5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c. Branch feature/formation-bonds-001-implementation, /workspace/Lumenfall-bonds-implementation; original checkout/proposal acab2002 untouched.
Combined mainac0d28e preserves PR76/77/80/84/90/78/85/81/66: autosave, backup, Resonate, Auto-Ascend, matrix, Forge memory,12h/refunds, guidance and Tree. Change index/scoped tests/task/evidence; no native changes.

## Design and preservation

PR67 fixed scoped F14/F15 design before coding; PR70 clock correction is upstream via PR90. [Exact provenance/reproduction](../qa/formation-bonds-001/README.md).

| Partners | Bond | Effect | Choice |
| --- | --- | --- | --- |
| Ember + Void | Starcaller | Passive/ability ×1.18 | Push |
| Tide + Aurora | Dawnpriest | Lumen/Shards/Motes ×1.25 | Farm |
| Stone + Titan | Duskguard | Boss passive/ability ×1.35 | Boss |
| Gale + Thorn | Pathfinder | Non-Boss passive/ability ×1.20 | Push/Farm |
| Ember + Tide | Kindling | Guardian Tap/Auto-Tap ×1.25 | Active Push |
| Ember + Stone | Vanguard | Boss regeneration ×0.80 | Boss wall |
| Stone + Gale | Quarry | Gale ability Shards ×1.20 | Shard Farm |
| Thorn + Aurora | Harvest | Thorn ability Lumen ×1.20 | Lumen Farm |

Purchased Lv.>0 and Fielded partners only, five slots; no pending/Bench bonus. Original effects/additive4s/8s Supports stay. Dawnpriest × Quarry/Harvest =1.50 before one rounding; full stacking in QA.
Windows20%/25% per channel,20% regen. Compare56 formations at two identical purchased-account budgets with all tracks/currencies/residuals; never sum overlap marginals. Preserve roles/power/prices/caps/Motes and [paid matrix](UPGRADE_IDENTITY_001/MATRIX.md).
PR76: selected autosave, ordered pending/five slots, last-member guard, legacy empty intent/Ember. Prior marker prototype retired. F15 adds no migration; retain F26 refunds/save/recovery/backup/Ascend.

## Acceptance and next action

Require exact8 pairs/bonuses/rounding, bulk/queue/slot boundaries, chronology/live-offline/save recovery, equal actual budgets; overlapping marks/full accessible effects with each Wisp once;320/390/430px/200% text/44px/focus/contrast/reduced motion and short Boss geometry. Preserve package com.lumenfall.app/signing/WebView60.
CI273 PASS170/17. CI287 failed only wrapped Bond names (174 others PASS). Names now fit with full aria; native completion observed within1s, assertions/process limits retained. Core8/6 mutants/V8 and16 guidance profiles/160 samples PASS; current178/17 CI pending. Self-review only.
Next: pass CI, integrate/check signed APK and save GitHub receipts. Required physical Android/exact WebView60/TalkBack OPEN (ADB5581 refused; read-only home). Keep owner chat open until accepted.
