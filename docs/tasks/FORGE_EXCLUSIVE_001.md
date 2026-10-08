# FORGE_EXCLUSIVE_001 — Exclusive Forge upgrades

Status: **inventory and proposals complete and published; gameplay implementation blocked on the agreed matrix**. Original point F29. This owner chat remains open. A published proposal does not complete the app feature.

## Goal, requirements and ownership

One goal: give new Forge purchases their own mechanics, greater investment and later unlocks through the agreed cross-system matrix, with explicit prices, caps, stacking and preservation of old purchase value.

The complete [user mandate](FORGE_EXCLUSIVE_001/USER_REQUEST.txt) orders inventory/proposals first and Forge implementation later, depending on UPGRADE_IDENTITY_001. The continuation instruction is “Finish the task”. Neither supplies the missing numerical design. The [original requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt) take precedence over suggestions:

> Vi har også et andet problem at man har de samme upgrades flere steder, bare med en anden currency. Der skal være nogle upgrades der er eksklusive for den bestemte currency, at lab har nogle specielle upgrades der tager lidt længere tid at få, men bruger bestemt currency, at forge har nogle upgrades ingen andre har men koster mere og sværere at unlocke. Det samme med ascension tree, den skal have sin helt helt egen eksklusive opgraderinger.

Read F29, F18/F19, F23/F25 and save/dependency sections of [TASK_FEEDBACK_REVISION_001](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt), concrete historical [registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt), [findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and [source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt). The four supplied images show Auto-Ascend/Lab/Wisps, not Forge acceptance. [Earlier Forge/Lab decisions](../decisions/2026-10-04-forge-lab.txt) preserve old purchases and park Opening Focus; this proposal does not revive it.

Owner: this user-assigned FORGE_EXCLUSIVE_001 feature chat; opaque app chat identity is not exposed. Checkout: /workspace/Lumenfall-FORGE_EXCLUSIVE_001, branch feature/FORGE_EXCLUSIVE_001. No subagents, message tools or other chat renames. Current [AGENTS](../../AGENTS.md), bootstrap, ownership/gameplay guides, project state and [workflow](../project/FEATURE_WORKFLOW.md) were read from live main. Current rules replace historical Lead/writer ceremonies with isolated work and serialized integration within standing authorization. No new binding rule is introduced.

## Baseline and scope

Continuation main: 214d45411ce2fb420f0e4b372063811a967679b1; tree 1048bc22972a2b650eba73186db35bc0402ded04. Product index.html blob b0bff3729e1fd0047c13d3e3acb74212722a6824; SHA256 6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca. The isolated proposal was rebased onto this baseline. The other checkout is untouched.

PR46/B2 is now merged through PR57 at 20aaae62a4b6e46f8d75775085918eaba4e8de29. Signed 0.1.138, CI146 and remaining physical/review limits belong to that task. No open PR was observed at continuation startup; later PR59 (Wisp display) and PR60 (Forge text) appeared. Their product edits and any other project-state rows remain owned by those tasks; no overlapping product edit is made here. No agreed UPGRADE_IDENTITY_001 task or Forge matrix was found on main; check again before implementation/integration.

Current changes are confined to this task, its evidence/diagnostic directory and its project-state row. No game, save, CI, mobile, signing or release changes. The [historical detailed draft](FORGE_EXCLUSIVE_001/PROPOSAL_2026-10-07.md) is optional evidence; its old PR46/writer gates are superseded. Frozen earlier evidence is retained under this task directory.

## Verified inventory and proposed direction

The read-only [inventory tool](FORGE_EXCLUSIVE_001/inventory.cjs) extracts 24 catalogue rows: 8 Forge, 9 Lab, 7 Tree. Forge is RESEARCH/state.research; Lab is LONG_STUDIES/longStudyLevels. Current price bases below grow geometrically from stored level k. Forge rounds the whole geometric bulk sum upward, rather than summing rounded singles. Unlocks use maxDepthEver.

| Forge ID | Current currency base / growth | Unlock / cap | Observed effect or overlap |
| --- | --- | --- | --- |
| focus | Lumen 200 / 1.50 | 1 / none | Kill-Lumen: 1+.08k; overlaps Tree starlight and Lab lumenstudy. |
| sense | Lumen 150 + Shards 20 / 1.50 | 1 / none | Kill-Shards: 1+.08k; overlaps Lab shardstudy. |
| formation | Shards 40 / 1.60 | 1 / none | Party passive and Wisp portion of Tap: 1+.05k; overlaps Tree momentum and Lab wispascend/formationstudy. |
| resolve | Lumen 150 / 1.45 | 1 / none | Tap/Auto-Tap: 1+.10k; overlaps Tree steady and Lab guardmastery. |
| charge | Shards 30 / 1.55 | 1 / none | Ability cycle 6/(1+.08k); coordinate Swift-cap and support uptime. |
| arcanecal | Lumen 15000 + Shards 120 / 1.60 | 12 / 10 | Damaging abilities: +.03 to their factor per effective level. |
| conduction | Lumen 90000 + Shards 280 / 1.60 | 18 / 10 | Gale Shards/Thorn Lumen: +.04 to resource factor before per-cast rounding. |
| luminoustracking | Lumen 2500000 + Shards 1500 / 1.60 | 32 / 10 | +.005 future eligible Luminous chance per effective level; total cap .35; no extra Motes per kill. |

Independent sources multiply: one level in Forge/Tree/Lab kill-Lumen gives 1.28304; Forge/Lab kill-Shards 1.1664; Forge/Tree/Lab Tap 1.4256. The last three Forge rows already address distinct operands and are candidates to retain. Forge currently uses Lumen and/or Shards, so a Shards-only identity would require an explicit currency decision.

Proposals for review, **not agreed mechanics**:

| Candidate | Exclusive mechanic | Suggested later prerequisite | Missing decisions |
| --- | --- | --- | --- |
| Impact Reservoir | Bounded fresh ability overkill carried to that Wisp’s next damaging cast; stored damage cannot bank itself. | Completed Arcane Calibration plus a later milestone. | Fraction, capacity, level cap, prices, unlock, factor order, resets and save semantics. |
| Conduit Remainder | Gale/Thorn fractional ability-resource carry between actual casts. | Completed Resource Conduction plus a later milestone. | Prices/cap/unlock and payout policy: replacing current Math.round can reduce old rewards. |
| Luminous Anchor | Defer an already-earned deterministic Luminous encounter to an eligible non-boss spawn. | Completed Luminous Tracking plus a later milestone. | Prices/cap/unlock, release choice, accumulator/Ascend/offline rules; deferral to deeper depth can increase rewards. |

No new gameplay number is selected. Opening Focus stays parked. Coordinate the matrix with Swift-cap, Loadout Memory and Forge text so no candidate duplicates their behavior.

## Old purchase value and dependencies

Recommended migration for review: retain old raw ownership and its current combined effect as explicit legacy value; close new duplicate purchases; add separately owned exclusive rows. This avoids currency minting on restore. The matrix must explicitly accept grandfathered effects. Transfer/refund alternatives require a precise historical-cost and restore policy: bulk rounding differs from singles, raw levels do not prove actual spend, and a marker alone does not prevent repeated imports of an unmigrated backup.

Removing a RESEARCH ID currently drops that ownership during normalization. Preserve/explicitly migrate known IDs, over-cap raw levels and their bounded effective levels. Legacy Forge levels count toward existing 20/60-level Lab deeds; do not revoke earned unlocks or grant Comet twice. Preserve Lab active/queued paid work, repeat speed snapshots, queue controls and chronology. Coordinate changed save readers with Loadout Memory. Swift’s cap alone cannot solve support uptime: an 8-second support duration already exceeds its base 6-second cycle.

Required design input: agreed Forge rows of UPGRADE_IDENTITY_001, covering effect operands/units, currency/base/growth/rounding, unlock, cap, stacking order, bulk/queue eligibility and old-purchase migration. An asynchronous clarification requests those rows or explicit design delegation. The missing matrix is a design dependency, not a general permission/writer blocker.

## Checks and acceptance

Historical evidence: nine existing Forge scenarios passed on 0bcce84, and the intentional bad-assertion control exited 1. Those are earlier baseline checks, not evidence of new gameplay or current integration. See [evidence README](FORGE_EXCLUSIVE_001/README.md). [Continuation receipt](FORGE_EXCLUSIVE_001/EVIDENCE/CONTINUATION/CHECKS.json): nine current-baseline Forge scenarios PASS, expected bad-assertion exit 1 confirmed by the actual intentional harness assertion; Node24.19.0/Chromium151.0.7922.173. Task-aware context, source validation, Node tooling and four local-script syntax checks PASS. All 24 rows/prices/stacking are unchanged; 20/21 consumer hashes match. The normalization delta is upstream paid Lab preferences/input-copy handling. Raw logs and a hash manifest are saved separately. Required PR CI remains unchanged and is pending. Complete self-review found only scoped docs/diagnostics and the added project-state row; no independent review is claimed.

Acceptance for this proposal checkpoint: all catalogue rows/overlaps inventoried; exclusive candidates and unresolved numbers/value policy explicit; original requirements/owner/baseline/current dependencies saved; task-aware startup check and relevant existing checks pass; complete scoped diff reviewed; checkpoint integrated and verified on main. No APK is needed for documentation-only delivery.

Full feature acceptance remains pending: agreed matrix implemented; deterministic handler/bulk/queue boundaries and previews; cap/unlock/stacking contracts; chronology and live/offline parity; idempotent old-save/recovery/backup migration preserving purchase value and paid Lab snapshots; relevant existing and focused regression checks on integrated code. UI checks include relevant 320/360/390/430px widths, large text, 44px controls, keyboard focus/contrast/reduced motion. Preserve WebView60, com.lumenfall.app, signing and fixed documented Luminous Motes rewards. Required APK and affected-device acceptance must pass before feature completion/archive. Modern Chromium baseline results do not satisfy those requirements.

## Next action

Checkpoint delivery: [PR64](https://github.com/karahaNx/Lumenfall/pull/64) records the exact validated head, required CI, merge identity and integrated checks in its final delivery receipt. Follow that receipt when resuming; an open PR is not integrated acceptance. Dependent: obtain the concrete agreed matrix; implement only its Forge rows and migration, complete integrated app acceptance and record evidence. Keep this feature/chat open while those requirements are missing. No other task is claimed complete or archived.
