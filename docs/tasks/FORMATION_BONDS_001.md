# FORMATION_BONDS_001 — eight useful Bonds

Owner: this feature chat. Goal: deliver F15 in the game.
Status: PR86 candidate; integration/APK/device acceptance pending.

## Requirements and authorization

[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt): more than four Bonds with different bonuses.
[Revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt): useful Push/Farm/Boss combos, stacking and equal investment evidence.
[Lead decision](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt): autosave/preset isolation first; measure before tuning.
The complete [request](FORMATION_BONDS_001_REQUEST.txt) is preserved.
Latest instruction: “Finish the feature task push to github implement to game”.
Current [AGENTS](../../AGENTS.md) and [workflow](../project/FEATURE_WORKFLOW.md)
authorize scoped implementation, merge and signed delivery. Historical PR46/B2
gates are superseded; PR46 is integrated. No subagents/messages/other-chat changes.

## Baseline and scope

Implementation baseline: b0537cb46635555ba2c2e5f3f95bc8fc276aeda5.
Startup product SHA256: 5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Branch: feature/formation-bonds-001-implementation; private worktree:
/workspace/Lumenfall-bonds-implementation. Original checkout and proposal
acab2002c62aa679fa757b720327431da342dd99 remain untouched.
Current main incorporated: c5fa49704404bccb3ca54d434edb7603dbbf4913
(PR76 Formation autosave, retaining PR77 Backup).
[PR86](https://github.com/karahaNx/Lumenfall/pull/86) contains this feature.

Actual overlaps read: PR67 52fa48db51ed6ce58704ec17c593ee68710394e0 and
PR70 7284cf716250355e1bf68d00590f81ab96f49a3d. Use only PR67's documented
F14/F15 contract, not its Wisp power/support duration/cap/refund/matrix changes.
PR70 contribution display remains separate. Main merges are serialized against
fresh main; no other candidate is edited or merged.
Changed files: root index, targeted behavioral modules/runner/bridge/native
checks, this task, original request and feature evidence. No native/signing edits.

## Design fixed before coding

These are scoped design decisions from the reviewable
[PR67 contract](https://github.com/karahaNx/Lumenfall/blob/52fa48db51ed6ce58704ec17c593ee68710394e0/docs/requirements/all-27-feedback-001/balance-contract.md),
within the user's design request; not individually user-selected coefficients.

| Combo | Bond | Effect | Choice |
| --- | --- | --- | --- |
| Ember + Void | Starcaller | Passive/ability damage ×1.18 | Push |
| Tide + Aurora | Dawnpriest | Lumen/Shards/Motes ×1.25 | Farm |
| Stone + Titan | Duskguard | Passive/ability Boss damage ×1.35 | Boss |
| Gale + Thorn | Pathfinder | Passive/ability non-Boss damage ×1.20 | Push/Farm |
| Ember + Tide | Kindling | Guardian Tap including Auto-Tap ×1.25 | Active Push |
| Ember + Stone | Vanguard | Boss regeneration ×0.80 | Boss wall |
| Stone + Gale | Quarry | Gale ability Shards ×1.20 | Shard Farm |
| Thorn + Aurora | Harvest | Thorn ability Lumen ×1.20 | Lumen Farm |

Both partners must be purchased above level zero and Fielded. Five slots;
Bench/pending members never give power. Only named operands change.
Dawnpriest × Quarry/Harvest = ×1.50 before one existing payout rounding.
Support remains additive, with existing 4s/8s durations. No prices/caps/Wisp
power/reward policy/matrix tuning. Vanguard shares live/offline/estimate/UI
regen; Kindling shares manual/Auto-Tap. Original four effects remain.
Balance windows are exact +20%/+25% channel bonuses and 20% regen reduction;
other channels stay equal. Frozen purchased accounts compare all 56 five-slot
teams at two budgets, recording all tracks/currencies/residuals. One-removal
marginals are not summed. Evidence establishes channel utility, not universal
optimality or full campaign balance; Wisp roles/matrix remain separate.

## Dependency and preservation

FORMATION_AUTOSAVE_001 integrated through PR76 while this candidate was tested.
Its current code/tests are preserved exactly: Field/Bench saves the selected
preset, ordered pending intent includes all five slots; at least one chosen
member remains. Legacy empty presets retain intent and temporary Ember.
The earlier bundled F14 proposal/marker is retired; no new save field/schema.
Pending gives no Bond. Paid values, idempotence, primary/recovery/backup remain.
Preserve upgrade UI, full partner/effect text, Cast/Ready/progressbar access,
Comet Trials/ownership, deterministic chronology/purchases/Motes, WebView60,
com.lumenfall.app and established signing.
Changed reward timings exposed a false Farm stall. Only PR70's canonical
crossing/remaining guard and separate whole/fraction target correction are
used. Keep strict fractional-clock tests. Overlapping pairs each get their own
mark/name without duplicate cards. Large text wraps; short Boss status keeps
regen/DPS visible and full Net accessible so Formation cannot overlap boost.

## Acceptance and checkpoint

[Evidence and reproduction](../qa/formation-bonds-001/README.md): eight exact
pairs/bonuses/rounding; pending/Bench exclusion; live/offline/one-second/split
chronology; isolated/legacy-empty/five-slot handlers; legacy value/recovery/backup;
equal actual investments; mobile320/390/430,200% text,44px controls, focus,
contrast/reduced motion; existing regressions and required CI; integrated APK.

Core passes eight groups and catches six real mutations. Source/tooling/signing
self-test and focused Formation/Farm/role checks pass; initial12 negatives
caught. Main adds two Backup negatives, both caught by direct native checks.
Combined candidate now includes160 default scenarios/14 required negatives. Prior full CI
run37737240652 failed old overlapping-adjacency and exact-legacy assertions;
raw logs retained. Corrected overlap checks preserve adjacency for disjoint
primary pairs and require every membership mark/name. Old numeric policy keeps
an exact archived counterfactual; actual new policy retains long/split checks.
Local daily retry exceeds its60s harness budget; hosted CI passed that scenario.
Reconciled source8a19001f: eight core groups/six mutations, nine focused
checks, autosave contract and12 mobile profiles PASS. V8 6.0 probe PASS.
No timeout/acceptance tolerance is weakened. Reconciliation preserves every integrated F14 function and test; only F15
mechanics/presentation/clock hunks apply above main. No independent review claimed.

Next: publish corrected current-main candidate, pass exact-head required CI,
merge, verify integrated behavior and signed APK; save final receipts/status.
ADB5581 unavailable. Physical Android/WebView60/TalkBack acceptance remains
open. Keep this owner chat open until required device acceptance is recorded.
