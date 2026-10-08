# FORMATION_BONDS_001 — eight useful Bonds

Owner: this feature chat. Goal: deliver original F15 in the game.
Status: [PR86](https://github.com/karahaNx/Lumenfall/pull/86) candidate;
required CI, integration, APK and device acceptance pending.

## Requirements and baseline

[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt): more than four Formation Bonds and different bonuses.
[Revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt): useful Push/Farm/Boss combos, stacking and equal investments.
[Lead decision](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt): autosave isolation before integration; measure before tuning.
[Complete request](FORMATION_BONDS_001_REQUEST.txt) is preserved. Latest correction:
“Finish the feature task push to github implement to game”. Current
[AGENTS](../../AGENTS.md)/[workflow](../project/FEATURE_WORKFLOW.md) authorize scoped
implementation, merge and signed delivery. PR46 is integrated; historical B2/
writer gates are superseded. No subagents/messages/other-chat changes are used.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5; startup product SHA256
5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Private branch feature/formation-bonds-001-implementation, worktree
/workspace/Lumenfall-bonds-implementation. Original checkout and earlier proposal
acab2002c62aa679fa757b720327431da342dd99 untouched.
Current incorporated main31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6 also preserves
PR84 Auto-Ascend and PR90 upgrade matrix. Recheck main before merge.
Changed files: root index, scoped behavioral checks/bridge/runner, task and
feature evidence. No mobile/package/signing changes.

## Design fixed before coding

Use only F14/F15 design from inspected PR67
52fa48db51ed6ce58704ec17c593ee68710394e0
([contract](https://github.com/karahaNx/Lumenfall/blob/52fa48db51ed6ce58704ec17c593ee68710394e0/docs/requirements/all-27-feedback-001/balance-contract.md)).
These are scoped design decisions, not individually user-selected numbers.
PR70 7284cf716250355e1bf68d00590f81ab96f49a3d supplies the clock correction
now integrated via PR90. No candidate branch is edited or merged.

| Combo | Bond | Exact effect | Choice |
| --- | --- | --- | --- |
| Ember + Void | Starcaller | Passive/ability damage ×1.18 | Push |
| Tide + Aurora | Dawnpriest | Lumen/Shards/Motes ×1.25 | Farm |
| Stone + Titan | Duskguard | Passive/ability Boss damage ×1.35 | Boss |
| Gale + Thorn | Pathfinder | Passive/ability non-Boss damage ×1.20 | Push/Farm |
| Ember + Tide | Kindling | Guardian Tap including Auto-Tap ×1.25 | Active Push |
| Ember + Stone | Vanguard | Boss regeneration ×0.80 | Boss wall |
| Stone + Gale | Quarry | Gale ability Shards ×1.20 | Shard Farm |
| Thorn + Aurora | Harvest | Thorn ability Lumen ×1.20 | Lumen Farm |

Both partners must be purchased above Lv.0 and Fielded, within five slots.
Bench/pending members grant no Bond. Only named operands change. Dawnpriest
× Quarry/Harvest = ×1.50 before one existing rounding. Support stays additive
and keeps4s/8s. Preserve original effects, Wisp power/tracks/prices/caps,
deterministic purchases, fixed Motes and Comet ownership/Trials. No global
pacing/matrix tuning, refunds or native changes; Wisp roles/matrix stay separate.
Exact balance windows: +20%/+25% channels,20% regen reduction; other channels
stay equal. Compare56 five-slot teams at two identical purchased-account
budgets, recording all tracks/currencies/residuals. Do not sum overlapping
one-removal marginals. Evidence proves channel utility, not optimal spending
or complete campaign balance.

## Dependency and acceptance

FORMATION_AUTOSAVE_001 integrated via PR76 during review. Preserve its product
functions/tests: selected preset saves immediately; ordered pending intent
counts toward five slots; at least one chosen member remains; legacy empty
intent retains temporary Ember. The earlier bundled F14 marker/zero-party
proposal is retired. No new field/schema. Preserve paid values and idempotent
primary/recovery/backup/Ascend behavior, chronology and live/offline parity.
PR90 already integrates the necessary PR70 Farm clock correction; retain it.
Preserve all24 raw upgrade IDs/paid effects and the matrix
[contract](UPGRADE_IDENTITY_001/MATRIX.md), with no extra F15 migration.
Overlapping Bonds each retain marks/full accessible effects without duplicate
Wisps. Wrapping and compact Boss status preserve short-screen geometry.
Keep full partner text, Cast/Ready/progressbar,44px controls, focus/contrast,
reduced motion, WebView60, com.lumenfall.app and established signing.

[Evidence/reproduction](../qa/formation-bonds-001/README.md): require eight exact
pairs/bonuses/rounding, all handlers/pending/five-slot boundaries, save/recovery,
live/offline/one-second/split chronology, equal actual budgets, mobile320/390/430
and200% text, existing regressions and required CI, then integrated signed APK.

Current product SHA256: 4d131993079d7932c696314be761321b350af42d0f2ead294b357d28e826c5e9.
Core eight groups/six real mutations PASS; combined autosave contract/nine
focused checks/12 mobile profiles/V8 6.0 PASS. Corrected SRGB contrast handling
also passes12 profiles. Normal/reduced Rift checks pass three profiles each.
Matrix combination: core/V8/nine focused/12 mobile and Resonate checks PASS. Combined CI now covers170 defaults/17 negatives; final head must pass.
CI254 passed all F15/Rift cases; Resonate Chromium startup timed out.
Harness now uses the selected browser and awaits actual init before DOM access.
Actual equal-budget live Boss160 clears with Vanguard at1002s; highest-net
non-Vanguard remains walled after1288s, matching whole/one-second simulation. Prior CI failures and local
transport/time-budget limits are retained; no timeout/tolerance is weakened.
Self-review only; no independent review claimed.

Next: pass final CI, integrate exact reviewed bytes, verify integrated behavior
and signed APK, save receipts and project status in GitHub. ADB5581 refuses
connection; ADB cannot create its directory on this environment's read-only
home. Required physical Android/exact WebView60/TalkBack acceptance remains
open. Keep this owner chat open until necessary device acceptance is recorded.
