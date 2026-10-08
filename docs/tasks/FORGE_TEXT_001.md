# FORGE_TEXT_001 — remove the Forge standard cap text

Status: source and signed APK integrated; required physical acceptance OPEN.
Owner: this FORGE_TEXT_001 feature chat. Product branch: feature/forge-text-001.

## Requirement, scope and decisions

Original F23: “Der behøver ikke stå no level cap på de forge opgraderinger de står ved.”
Keep actual levels, prices, effects and authoritative caps. Sources:
[original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F23/dependencies/save requirements](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
The user requested GitHub delivery and readiness for the game on 8 October 2026.

The sole product edit removes “ · No level cap” in renderResearch(). Uncapped
cards show Level N; capped cards retain Level N / C. Prices, Current/Next/
Purchase impact, descriptions, bulk/Max counts, Maxed, disabled controls, focus,
queue and purchase handlers retain their model. F23 changes no balance, rewards,
purchase data or save schema; no migration is needed. Preserve old values,
deterministic purchases, Luminous Motes, WebView60, com.lumenfall.app and signing.
Swift Recovery cap/minimum cycle belongs to SWIFT_RECOVERY_CAP_001/F19; do not
invent its design values. Forge reads the accepted authoritative levelCap.

## Baseline and coordination

Baseline 214d45411ce2fb420f0e4b372063811a967679b1, tree
1048bc22972a2b650eba73186db35bc0402ded04; index SHA256
6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca.
Private checkout /workspace/Lumenfall-FORGE_TEXT_001. Historical candidate
2bfedc16b654b6f95573245173421edb1f144a56 remains on its old private branch;
only its one-line correction was applied to current main. PR46/B2 is integrated
through PR57/46. Current [workflow](../project/FEATURE_WORKFLOW.md) supersedes
historical role/writer gates. Standing authorization covers this delivery.
Check relevant live main/base/head before integration; preserve other chats' code,
status and checkouts. No subagents/message tools were used.

## Acceptance and verified delivery

- Remove the suffix on every Forge card and subsequent renders; preserve model
  values across locked/unaffordable/single/bulk/Max/capped/legacy-overcap states.
- Preserve direct/bulk/queue boundaries, chronology, live/offline and save/recovery.
- Check 320/390/430 px × normal/200% text × normal/reduced motion (12 profiles),
  44px controls and focus/contrast.
- Require integrated checks, relevant CI and verified APK identity/assets;
  complete required physical acceptance before declaring completion or archiving.

[PR60](https://github.com/karahaNx/Lumenfall/pull/60) merged at
e189a3a8aba0c7cc377bad8980c62d75d1279189, entire tree equal to validated
head 5c77129de961bb1d6a6cba6a8990f8625e146acd. CI37708469018 PASS146
scenarios/12 negatives/tooling/guarded startup. Source, existing Forge/save/
accessibility checks, 56 card comparisons and 12 paired viewport profiles PASS.
Existing 200% text overflow remains documented; it was not introduced by F23.

[PR68](https://github.com/karahaNx/Lumenfall/pull/68) saves detailed source/CI/APK
receipts, merged at 06f13b820f69e8d93861b562565f7a2a6380b441.
CI37719344736 PASS151 scenarios/12 negatives/tooling/guarded startup on current
product SHA256 5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Fresh contracts PASS336 purchase cases/four causal negatives; both mobile/motion
scenarios PASS three profiles each. Post-merge contracts and all15 APK source-assets PASS.
PR69's accepted legacy Remember Bulk lookup is preserved; preview/plan/card-update
functions and all other renderer bytes remain identical. F23 owns no Comet migration.

Signed **0.1.143**, build37715794487 from d95205f, is archived in GitHub;
package/version/established signer, CRC526/all15 staged assets PASS. APK SHA256
45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7.
[Receipt and raw evidence](../qa/forge-text-001/2026-10-08/README.md),
[current identity](../qa/forge-text-001/2026-10-08/current-acceptance.json),
[exact APK143](../qa/forge-text-001/2026-10-08/APK/Lumenfall-0.1.143.apk).
Earlier139/140/141 are historical. Current V8 6.0 engine probe PASS; desktop Chrome
155.0.8059.39/Node24.19.0 and engine results do not establish native/physical acceptance.
Debian Chromium151 DOM-export times out on unchanged baseline; the preserved
diagnostic is not a passing check. Use the recorded official Chrome155 for reruns.
PR60 automated code/security reviews completed with no reported findings.
PR68 documentation review findings were fixed, as recorded in its linked PR body;
no independent human review is claimed.

## Open acceptance and next action

Documentation checkpoint: [PR75](https://github.com/karahaNx/Lumenfall/pull/75),
branch docs/forge-text-001-context-fix, baseline06f13b820f69e8d93861b562565f7a2a6380b441.
Changed files: docs/tasks/FORGE_TEXT_001.md and docs/PROJECT_STATE.md (F23 paragraph only).
PR75's body records the exact final head, CI and integration commit; its metadata
identifies the current head without a self-referential hash inside this commit.

Combined post-merge documentation exceeded the 32 KiB startup gate. This follow-up
compacts only F23's task/status text; relevant context/CI/integration results are
recorded in its PR body and linked from PR68. No product or other owner entry changes.
Required affected-phone/exact WebView60/TalkBack acceptance: NOT RUN/OPEN.
Next: install verified APK143, record Android/WebView/app versions and actual
Forge/large-text/TalkBack results in GitHub; fix introduced regressions. Stop this
feature's shared-file work after the documentation checkpoint. Keep this owner
chat open; archive only after required acceptance and saved evidence.
Model context: GPT-6; precise runtime variant/effort is not attested.
