# FORGE_TEXT_001 — remove the Forge standard cap text

Status: validated implementation ready for GitHub CI and integration; app acceptance pending.
Owner: this FORGE_TEXT_001 feature chat. Branch: `feature/forge-text-001`.

## Requirement and scope

Original F23: “Der behøver ikke stå no level cap på de forge opgraderinger de står ved.”
Preserve actual levels, prices, effects and accepted caps. Sources:
[original requirement](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F23 and its dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[recorded decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
The user requested GitHub delivery and readiness for the game on 8 October 2026.

The sole product edit removes the ` · No level cap` suffix in `renderResearch()`.
Uncapped entries show `Level N`; capped entries retain `Level N / C`. Existing
Current/Next/Purchase impact, descriptions, prices, actual bulk counts, Maxed,
disabled controls, focus, queue and purchase handlers retain their existing model.
No prices, progression, deterministic rewards, purchase data or save schema change;
no migration is needed for this presentation edit.

Swift Recovery's gameplay cap/minimum cycle belongs to SWIFT_RECOVERY_CAP_001/F19,
including support balance and explicit legacy value preservation. F23 neither
invents nor changes those values; the renderer already reads authoritative
`levelCap`. Swift design is not a reason to retain the unwanted F23 standard text.

## Baseline and coordination

Live baseline: `214d45411ce2fb420f0e4b372063811a967679b1`, tree
`1048bc22972a2b650eba73186db35bc0402ded04`, observed 8 October 2026 UTC.
Product HTML SHA256:
`6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.
Private checkout: `/workspace/Lumenfall-FORGE_TEXT_001`. The original local
candidate `2bfedc16b654b6f95573245173421edb1f144a56` remains on its old private branch;
only its one-line product correction was applied to current main.

PR46/B2 is now integrated through PR57/46. The current
[feature workflow](../project/FEATURE_WORKFLOW.md) supersedes historical role/writer
gates. No open PRs or queued/in-progress runs overlapped this change at startup.
Standing authorization and the user's current request cover delivery in this scope.
Recheck main and relevant overlapping changes before integration.

## Acceptance and checks

- Remove the visible standard text from every Forge card and subsequent renders.
- Keep actual levels/caps and model-derived prices/effects identical to baseline
  across locked, unaffordable, single, bulk/Max, near-cap, capped and legacy-overcap states.
- Preserve direct/bulk/queue purchase boundaries, chronology, live/offline,
  reload, backup and recovery using existing Forge scenarios.
- Compare 320/390/430 px, normal/200% text and normal/reduced motion; preserve
  44px controls, focus and contrast. Record existing overflow separately from regressions.
- Require current source/tooling gates and complete pre-merge CI without weakened
  assertions. Verify the integrated source, relevant APK/package/signing/assets,
  and required device acceptance before marking the feature complete.

Fresh checks and exact source hashes are saved in the
[verification receipt](../qa/forge-text-001/2026-10-08/README.md). Node 24.19.0 and official
Chrome 155.0.8059.39 are used locally. Debian Chromium 151 repeats the documented
DOM-export timeout on unchanged current main; this diagnostic is not a passing check.

Earlier 7 October results belong to the previous baseline and are not acceptance
of current main. Original local TXT/ZIP remain available in the workspace.
Self-review/automated checks are not independent review. Physical affected-phone,
exact WebView60 and TalkBack acceptance must not be inferred from desktop Chrome.

## Current checkpoint and next action

Source/syntax gate, APK identity verifier self-test and Node tooling checks PASS.
Ten candidate Forge/gameplay/accessibility scenarios and both native mobile/motion
scenarios PASS; `forge-contracts` also passes on unchanged current baseline.
All 56 card/state comparisons and twelve paired viewport profiles verify the
targeted change. Existing 200% text overflow is documented as preserved baseline
behavior; no unrelated layout changes or new Swift gameplay decisions are included.
Publish the verified candidate, require full CI,
then integrate the validated version within the user's authorized scope. Verify
the resulting Android build and preserve receipts in this task and project status.

PR/integration/APK: pending. Required physical acceptance: not performed.
Archive: keep this chat open until all required acceptance is documented.
Model context identifies GPT-6; precise model variant/runtime effort is not attested.
