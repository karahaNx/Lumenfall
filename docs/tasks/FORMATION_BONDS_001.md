# FORMATION_BONDS_001 — eight useful Formation Bonds

Owner: this feature chat. Goal: implement F15 and deliver it in the game.
Status: implementation in progress; integration and app acceptance pending.

## Requirements, baseline and authorization

The [original requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
request more Formation Bonds and bonuses than the existing four. The
[revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt)
requires distinct Push/Farm/Boss choices, combinations, stacking and equal
investment comparisons. The
[registered decision](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt)
requires autosave/preset isolation first and measured comparisons before tuning.

The user continued: “Finish the feature task push to github implement to game”.
Current [rules](../../AGENTS.md) and [workflow](../project/FEATURE_WORKFLOW.md)
authorize scoped implementation, publication, integration and signed delivery.
Historical PR46/B2 writer gates are superseded; PR46 is already integrated.
No subagents, message tools or other chat changes are authorized or used.

Implementation baseline: `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
Branch: `feature/formation-bonds-001-implementation`; isolated worktree:
`/workspace/Lumenfall-bonds-implementation`. Original checkout and earlier
proposal `acab2002c62aa679fa757b720327431da342dd99` remain untouched.
Startup product SHA256: `5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c`.

Actual overlaps read: PR67 `52fa48db51ed6ce58704ec17c593ee68710394e0`
(autosave/eight Bonds), PR70 `7284cf716250355e1bf68d00590f81ab96f49a3d`
(Wisp contribution display). Use PR67's documented scoped Bond design;
do not import its Wisp power tuning, support duration, caps, refunds or matrix.
PR70's contribution work remains separate. Main integration is serialized with
a fresh baseline check. No other candidate branch is edited or merged.

## Design fixed before implementation

The earlier local coefficient placeholders are retired. These values follow the
reviewable [PR67 balance contract](https://github.com/karahaNx/Lumenfall/blob/52fa48db51ed6ce58704ec17c593ee68710394e0/docs/requirements/all-27-feedback-001/balance-contract.md)
within the user's explicit design scope; they are design decisions, not a claim
that the user individually selected every coefficient.

| Combo | Bond | Exact effect | Choice |
| --- | --- | --- | --- |
| Ember + Void | Starcaller | Passive and ability damage ×1.18 | Push |
| Tide + Aurora | Dawnpriest | Lumen, Shards and Motes ×1.25 | Farm |
| Stone + Titan | Duskguard | Passive and ability damage vs Bosses ×1.35 | Boss |
| Gale + Thorn | Pathfinder | Passive and ability damage vs non-Bosses ×1.20 | Push/Farm |
| Ember + Tide | Kindling | Guardian Tap, including Auto-Tap, ×1.25 | Active Push |
| Ember + Stone | Vanguard | Existing Boss regeneration rate ×0.80 | Boss wall |
| Stone + Gale | Quarry | Gale ability Shards ×1.20 | Shard Farm |
| Thorn + Aurora | Harvest | Thorn ability Lumen ×1.20 | Lumen Farm |

All eight are free combinations of already purchased, Fielded Wisps above
level zero. Five Field slots remain authoritative. Pending members/Bench do
not activate Bonds. Multipliers affect only named operands; Dawnpriest stacks
with Quarry/Harvest to ×1.50 before one existing per-cast rounding. Support
sources remain additive above one and retain 4s/8s durations. Damage Modules,
Rarity, Ultimates and permanent upgrades retain current formulas/prices/caps.
Vanguard changes the shared regeneration function used by live/offline, Boss
estimates and UI; it does not affect HP or enemy rewards. Kindling changes the
shared manual/Auto-Tap hit. Original four effects stay intact. No Bond currency,
new purchases, Wisp damage tuning or global campaign pacing changes.

Balance windows: new channels receive +20%/+25%, regeneration falls exactly
20%; other channels must remain equal in matched controls. Compare all eligible
five-slot choices on frozen, identical purchased accounts, recording individual
Empower, Rarity, Module and Ultimate transactions and remaining Lumen/Shards/
Sigils. Compare one-removal channel losses without summing overlapping marginals.
Demonstrate channel utility, not universal optimality or full progression balance.
The exclusive Lab/Forge/Tree matrix and WISP_ROLES_001 are separate work.

## Required dependency and preservation

FORMATION_AUTOSAVE_001 is not integrated at baseline. Bring in only the tested
F14 persistence behavior needed before F15 integration: select Push/Farm/Boss,
Field/Bench immediately updates only that preset, preserve pending intent across
Ascend, primary/recovery/backup and repeated normalization. Empty explicit
selection stays empty; no pending free power or unintended purchase. Preserve
all legacy paid progression. Additive schema-v1 marker distinguishes intentional
empty formations from damaged legacy saves; no price/level migration or refunds.

Preserve F04 Wisp upgrade display, F16 full Bond partner names/effect-only
ability text, F13 progressbar Cast/Ready accessibility, Comet Trials and ownership,
chronological simulation, deterministic purchases, fixed Luminous Motes rewards,
WebView60 syntax, `com.lumenfall.app` and signing identity.

## Acceptance, checks and next action

Full contracts/results/reproduction and budget limits are in
[feature evidence](../qa/formation-bonds-001/README.md). Required acceptance:
eight exact paid/Fielded pairs, all overlapping marks without duplicate Wisps;
exact bonuses/rounding and live/offline chronology; autosave isolation, pending/
empty/five-slot handlers, Ascend and primary/recovery/backup idempotence; equal
actual accounts across all Wisp tracks; mobile320/390/430px,200% text,44px
controls, keyboard focus, contrast and reduced motion. Preserve all existing
features and required CI, then integrate and publish the signed verified APK.

Core checks pass seven grouped contracts and catch five real mutations.
Source validation, Node tooling, signing verifier self-test, focused Formation/
Farm/role checks and12 required negative controls pass. Baseline dump-DOM timed
out; supplemental CDP formula passed. Old assertions are strengthened for the
intentional autosave/eight-Bond behavior; the archived legacy mechanics oracle
and independent fractional deadline integral remain. Full suite/mobile and
exact-head CI are being completed. No independent review is claimed.

Necessary regression fix: changed reward timings exposed a Farm-grid false
stall. Adopt only PR70s canonical crossing/remaining-clock correction and
separate whole/fraction target phase; do not import Wisp contribution UI/tuning.
Large text requires Bond label/effect word wrapping. Changed files: product
index, targeted behavioral bridge/runner/modules/native checks, feature task,
original request and evidence. No mobile/package/signing changes.

Status: candidate under verification. Next: publish current-main candidate,
pass exact-head required CI, integrate, rerun acceptance and verify signed APK.
Emulator ADB5581 is unavailable. Required physical device/WebView60/TalkBack
acceptance remains open; no archive until necessary acceptance is recorded.
