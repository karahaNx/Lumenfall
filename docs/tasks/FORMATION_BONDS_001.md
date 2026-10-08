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
Current incorporated main e2f745cd0ce0dc9e41b06efd842062fd08d7fab4 preserves
PR76 autosave, PR77 Backup and PR80 Resonate clarity. Recheck main before merge.
Changed files: root index, scoped behavioral checks/bridge/runner, task and
feature evidence. No mobile/package/signing changes.

## Design fixed before coding

Use only F14/F15 design from inspected PR67
52fa48db51ed6ce58704ec17c593ee68710394e0
([contract](https://github.com/karahaNx/Lumenfall/blob/52fa48db51ed6ce58704ec17c593ee68710394e0/docs/requirements/all-27-feedback-001/balance-contract.md)).
These are scoped design decisions, not individually user-selected numbers.
PR70 7284cf716250355e1bf68d00590f81ab96f49a3d contributes only its necessary
Farm precision correction; neither candidate branch is edited or merged.

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
New rewards exposed a false Farm stall: canonical crossing/remaining progress
and separate whole/fraction target phase fix it without skipped elapsed time.
Overlapping Bonds each retain marks/full accessible effects without duplicate
Wisps. Wrapping and compact Boss status preserve short-screen geometry.
Keep full partner text, Cast/Ready/progressbar,44px controls, focus/contrast,
reduced motion, WebView60, com.lumenfall.app and established signing.

[Evidence/reproduction](../qa/formation-bonds-001/README.md): require eight exact
pairs/bonuses/rounding, all handlers/pending/five-slot boundaries, save/recovery,
live/offline/one-second/split chronology, equal actual budgets, mobile320/390/430
and200% text, existing regressions and required CI, then integrated signed APK.

Current product SHA256: 7e49fd411cd2eb1c630a6f56eacc1a771ee1e16fc8e71fc213c187cc0091b0ed.
Core eight groups/six real mutations PASS; combined autosave contract/nine
focused checks/12 mobile profiles/V8 6.0 PASS. Corrected SRGB contrast handling
also passes12 profiles. Normal/reduced Rift checks pass three profiles each.
Source/tooling/context/signing self-test PASS. Required CI now covers161 default
scenarios/14 negatives; exact final head must pass. Prior CI failures and local
transport/time-budget limits are retained; no timeout/tolerance is weakened.
Self-review only; no independent review claimed.

Next: pass final CI, integrate exact reviewed bytes, verify integrated behavior
and signed APK, save receipts and project status in GitHub. ADB5581 refuses
connection; ADB cannot create its directory on this environment's read-only
home. Required physical Android/exact WebView60/TalkBack acceptance remains
open. Keep this owner chat open until necessary device acceptance is recorded.
