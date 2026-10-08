# FORMATION_BONDS_001 — eight Bonds

Owner: this feature chat. Goal: implement original F15 in the game.
Status: [PR86](https://github.com/karahaNx/Lumenfall/pull/86) candidate; final combined CI/integration/APK/device acceptance pending.

[Original F15](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt): more than four Bonds with different bonuses.
[Revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt): useful Push/Farm/Boss choices, combos/stacking/equal investments.
[Decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt): autosave before integration; measure before tuning.
[Full request](FORMATION_BONDS_001_REQUEST.txt), latest: “Finish the feature task push to github implement to game”. Live [AGENTS](../../AGENTS.md)/[workflow](../project/FEATURE_WORKFLOW.md) supersede historical PR46/B2/writer gates. No subagents/messages/other-chat changes.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5; product SHA256 5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c. Branch feature/formation-bonds-001-implementation, /workspace/Lumenfall-bonds-implementation; original checkout/proposal acab2002 untouched.
Combined main14d5f3a3a78fe8b63cfa5544efc54f41217b65a5 preserves PR76 autosave,77 backup,80 Resonate,84 Auto-Ascend,90 upgrade matrix,78 Forge memory,85 shared12h/refunds and81 Rift guidance. Changed root index, scoped behavioral checks and task/evidence; no native changes.

## Design and preservation

PR67's scoped F14/F15 design fixed effects before coding; PR70 clock correction is now upstream via PR90. Exact provenance/reproduction: [QA](../qa/formation-bonds-001/README.md). Numbers are design decisions, not individual user selections; no other candidate branch is edited/merged.

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

Both partners must be purchased above Lv.0 and Fielded within five slots; Bench/pending grants no Bond. Original effects stay. Dawnpriest × Quarry/Harvest =1.50 before one existing rounding; Starcaller × Pathfinder =1.416 non-Boss, × Duskguard =1.593 Boss. Two25% Supports add to1.50, then Kindling gives1.875 Tap;4s/8s stay. Vanguard changes only regen.
Balance windows:20%/25% per channel,20% regen reduction. Compare56 formations at each of two identical purchased-account budgets with all tracks/currencies/residuals; never sum overlapping removal marginals. Results establish utility, not optimal spending/campaign balance. Preserve Wisp roles/power/prices/caps, fixed Motes, deterministic purchases and [24-row paid matrix](UPGRADE_IDENTITY_001/MATRIX.md).
F14 prerequisite PR76 stays intact: selected-preset autosave, ordered pending intent/five slots, last-member guard, legacy empty intent/temporary Ember. Prior marker/zero-party prototype retired. F15 adds no schema/migration; retain F26's idempotent value refunds and all save/recovery/backup/Ascend rules.

## Acceptance and next action

Require exact8 pairs/bonuses/rounding, bulk/queue/slot boundaries, chronology/live-offline/save recovery, equal actual budgets; overlapping marks/full accessible effects with each Wisp once;320/390/430px/200% text/44px/focus/contrast/reduced motion and short Boss geometry. Preserve package com.lumenfall.app/signing/WebView60.
CI273 PASS170/17/all gates. Combined CI287 failed only the Bond summary's one-line guidance contract;174 other defaults passed. All names now fit with a full accessible label. Native key-up completion is observed within1s; process limits/assertions stay. Core8 groups/6 mutations/V8 and Rift checks PASS; final175/17 CI pending. Self-review only.
Next: pass combined required CI, integrate, verify integrated behavior/signed APK and save delivery/status in GitHub. Required physical Android/exact WebView60/TalkBack remains OPEN: ADB5581 refuses connection and local ADB encounters read-only home. Keep this owner chat open until necessary acceptance passes.
