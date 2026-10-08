# WISP_ROLES_001 — visible value from every Wisp

Status: **draft PR70 published; balance decision and acceptance pending**.
Owner: this feature chat. One goal: expose damage/support/Bond/resource value
without double counting and give early damage Wisps a lasting reason to field.
No subagents, message tools, other chat changes or unrelated features.

## Requirements and sources

Original F17:

> Der er alt for meget forskel på wisp i deres dmg, late game kan man kun fokusere på titan da de andre wisp slet ikke kommer i nærheden af hvad den har som dmg, så ca 90% af ens dmg kommer fra Titan wisp alene, det giver ikke mening at de andre wisp ikke har synlig hjælp.

The user requests equal-budget and actual mid/late-game comparisons, raw
damage, marginal support, Bonds and resource value without duplicate totals.
Correction on 8 October: “Færdiggør featuren og læg dem op til spillet.” This
authorizes implementation, necessary fixes, publication and app delivery.

- [Original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt) takes priority over proposals.
- [F17/dependencies/save requirements](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt), [registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
- [Original findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt), [evidence index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
- [Initial analysis and raw evidence](../qa/wisp-roles-001/REPORT.md), [original player backup](../qa/offline-autoascend-2026-10-07/Source_Index.txt).
- Current [AGENTS](../../AGENTS.md), [workflow](../project/FEATURE_WORKFLOW.md), [project state](../PROJECT_STATE.md), bootstrap and relevant technical guidance read from live main.

## Baseline, scope and decisions

Isolated checkout `/workspace/Lumenfall-WISP_ROLES_001`, branch
`feature/WISP_ROLES_001`. Local analysis was rebased onto live main
`214d45411ce2fb420f0e4b372063811a967679b1` on 8 October. Baseline product
SHA256 `6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.
PR46/B2 is now integrated (PR57/46); published APK at startup is 0.1.138.
Current feature-chat rules supersede historical writer/handover gates.
Original local analysis survives in this branch's earlier commits; its status
and old baseline/permissions are historical, not current publication blockers.

Scope: contribution model/UI, approved early damage curve, focused regression
and necessary Farm clock-progress correction. Support duration/stacking,
Swift cap, new Formation Bonds, currency/cap redesign remain separate tasks.
Preserve WebView60, package `com.lumenfall.app`, established signing,
deterministic costs, Luminous rewards, chronology, queues, online/offline,
canonical/recovery/backup data and all existing purchases.

Implemented locally: pure contribution snapshots use shared gameplay formulas.
Raw damage + sequential Bond increments + additive support = sustained preview.
Resources are actual per-cast amounts/Motes rewards, never fictional DPS.
One-Wisp removal comparisons retain other levels and permanent purchases and
are labelled overlapping. Current earned support/legacy effects are separate
from sustained forecasts, including earned boosts from benched sources.
No new save fields or migration is needed for this readout.

Farm dependency: baseline 8/16 aligned/fractional 60s replay controls pass at
the initial analysis tolerance (1e-10);
aligned controls stall at a real 1.1e-16 grid crossing at 6s. The candidate
checks progress on the canonical grid clock instead of rounded derived elapsed
time. A stricter probe also reproduces 0.000122–0.000240 HP differences on
unchanged main's fractional-clock teams (kills/rewards match). Adding whole
seconds to the start fraction loses binary phase precision. Computing target
whole seconds/fraction independently fixes all12 strict probe controls.
It retains elapsed damage/rewards and introduces no time epsilon or save field.

Gameplay question sent to the user: Veteran Power for Ember/Stone after level
70, adding `352 × max(0, level − 70)²` before Rarity to existing Wisp Power.
**Proposed, not yet accepted or implemented.** Prices/Titan/support stay intact.
Calibration at the controlled saved-permanent 10-billion-Lumen Push budget:
Titan removal impact 90.84% → 68.41%; best tested Titan-free/Titan team ratio
27.30% → 49.49%. These are equal-slot budget ceilings with residual cash,
not optimal allocation or measurements of a powered user save.

The supplied save is post-Ascend: Ember1, others0, Titan-only Auto-Empower,
Auto-Ascend22, MaxDepth220, full permanent Wisp tracks. Its presets support
controlled comparisons but do not prove the reported active late-game share.
Actual powered mid/late-game backups remain unavailable.

Overlap: PR59 Wisp folding and PR60 Forge wording are incorporated, including
PR59's tests. Mainb4d36675d916fd6e76d48526791de5201425937b adds PR64's Forge
proposal documents and is also incorporated; it adds no product behavior.
PR61 Bond wording/PR63 Cast text remain separate. Recheck live main and preserve
concurrent changes before serial integration.

## Acceptance and checks

- Contribution conservation, actual support scope/expiry/legacy, pending/bench
  zero forecast, removal counterfactuals, resource rounding and read purity.
- Agreed early damage curve: early behavior retained, lasting Ember/Stone value,
  equal-budget Push/Farm/Boss comparison, actual Boss TTK and investment costs.
- Single/bulk/queue behavior, chronology, live/offline, save/recovery/backup;
  preserve old ownership and canonical idempotence with no repeat bonus.
- UI320/390/430px, 200% text, controls44px, focus/contrast/reduced motion.
- Required CI gates on final integrated code, signed APK/package/assets and
  required Android/device acceptance; save evidence in GitHub.

Local checks so far: source validation PASS; APK verifier self-test PASS;
`node tests/behavioral/wisp-roles.cjs` PASS 3,249 checks, 56 teams × four
contexts and 12 live/offline clock replay controls at the standard 1e-6 absolute /
1e-12 relative tolerance. Candidate measurement PASS contribution invariants
and all16 finite whole/split controls (initial analysis tolerance recorded).
Browser baseline support scenario times out with no QA payload; Chromium151
also times out on about:blank. Tooling suite reaches APK mock verification
failure (`aapt output did not contain a package line`) in this sandbox.
These initial environment failures are superseded by Chrome155 and permitted
tooling execution: support252 checks PASS, mobile320/390/430 at100/200% text
PASS, focus/45px controls (>=44px during panel scaling)/12.78:1 contrast/
reduced-motion PASS, required tooling PASS. Long-offline checks PASS after the
phase correction with an explicit revised golden oracle and exact complete
states/summaries. Unmodified product JavaScript also passes all3,249 core
assertions on V8 6.0.286.52/Node8.3.0; this does not test Android DOM/device.
See [implementation evidence](../qa/wisp-roles-001/IMPLEMENTATION.md).
No independent review or device acceptance is claimed.

Publication: [draft PR70](https://github.com/karahaNx/Lumenfall/pull/70), first
published head a2f1dd440e005d29fc79c1f1096d30da3115fe21, based on e189a3a.
CI run37711347792 on head48f9c15 PASS150 default scenarios, all12 required
negative controls, tooling/source and guarded startup. The product SHA256 is
`0f306575fed5a2332379feedafe47a5a9286f98d2088ac72071782f82c63d3d7`.
New stricter oracle/evidence commits require fresh CI. The earlier local149-scenario diagnostic
finished with174 passing executions and one old-oracle failure; it is not a
passing final full suite. The updated standalone long-offline check passes.
No merge or APK release for this task.

The phase correction intentionally changes tiny clock/HP/charge values and
two short cases' final segment count. The new fixed clock-only fixture verifies
each original value, limits the permitted correction paths, and compares the
complete candidate state and summary exactly. It supersedes the intermediate
tolerance-based oracle. Economy, counters, ownership and paid metadata retain
their original exact expectations. Reverting the phase fix fails strict HP
parity. Full CI/native/device acceptance remains pending; no gate is skipped.

Next: obtain the concrete balance decision; finish/test that mechanic; validate
UI and all CI on the final head, complete draft PR70, serialize integration, verify the signed
APK and save release/device evidence. An open PR/local candidate is unfinished.
Keep this owner chat open while required acceptance is missing.
