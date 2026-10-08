# CHEAPER_BONDS_CAP_001 — clear recruiting floor, stop ineffective purchases

Owner: this feature chat. Status: **implementation and verification in progress**.
One goal/F21: explain the 40% normal-price floor / maximum 60% discount,
enforce the existing effective level-20 cap, and preserve old purchase value.

## Requirements and authorization

[Original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Feks forstår jeg ikke cheaper bonds opgradering i ascension tree, der hvor der står floor 40%.”
The initial user task specifies cap20, no ineffective debit, preserved purchase
value, deterministic prices, WebView60, existing package/signing and relevant
save/chronology/mobile checks. The [complete initial requirements](../requirements/CHEAPER_BONDS_CAP_001.txt)
are preserved byte-identically from PR67's requirement inventory.

User correction: **“Find en balance”**. On 8 October the user explicitly requested
**“Finish the task push to github, implement to tame”** (interpreted as game).
This authorizes feature publication, integration and necessary APK delivery.
Current [rules](../../AGENTS.md), [workflow](../project/FEATURE_WORKFLOW.md) and
[workflow decision](../decisions/2026-10-07-feature-chat-workflow.md) supersede
historical role/writer/Core-approval ceremonies. No new general permission is
required. No messages/subagents or other-chat changes are authorized or used.

Historical F21 decisions remain in
[FEEDBACK_REGISTERED_001](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt);
retain their original bytes. The old local checkpoint and full chosen transition
are [preserved](../qa/cheaper-bonds-cap-001/pre-integration-task-2026-10-07.md).
Domain/save review is performed here; no independent Core/QA approval is claimed.

## Baseline, isolation and overlap

- Current main rechecked 8 October: `261b1b7f863f73c324f4ac04acb5bfc95101644d`.
  PR77 Save Backup merged cleanly at e6cfa70; F21 tests use its visible confirmation.
  Private branch `feature/cheaper-bonds-cap-001`, worktree
  `/workspace/CHEAPER_BONDS_CAP_001`; clean original checkout untouched.
- Original local freeze9342dbd on main0bcce84 is preserved in Git history and the
  historical evidence package. Its patch rebased cleanly onto current main.
- PR46/B2 is now merged at20aaae62a4b6e46f8d75775085918eaba4e8de29. Current main
  contains the paid Lab/Number-DataView/offline fixes and APK143 delivery evidence.
  This feature neither reimplements nor changes those systems.
- Open Draft [PR66](https://github.com/karahaNx/Lumenfall/pull/66), head1a476ba7,
  adds Echo/Bonds purchase plans within TREE_EXCLUSIVE_001. Open Draft
  [PR67](https://github.com/karahaNx/Lumenfall/pull/67), head52fa48db, proposes
  broad feedback and original-currency refunds. Neither branch is edited here;
  neither is merged as part of this single feature. Initial preflight had no active run; current PR89 CI is running. Recheck actual overlap/main immediately before integration.
- The F21 receipt uses PR67's `feedbackMigration.receipts['node.bonds']` and
  `refundCredits.prisms` shapes to prevent duplicate compensation. Later PR67
  integration must preserve these fields and exact arithmetic/credit checks.

## Targeted implementation and value policy

Cheaper Recruitment keeps persisted ID bonds and the existing recruitment/Empower
discount, rounded prices and level20 benefit. Canonical/stale direct callers and
UI cannot pay above20. Old raw levels are retained. Above20 purchases receive
their original Prism price once; exact credits preserve additions/subtractions
that cannot be represented beside huge wallets. Primary/recovery/restore keep
wallet, credits and receipt together; invalid partial markers reject safely.

[Concrete value/save design and review](../qa/cheaper-bonds-cap-001/finish/DESIGN.md)
records formula, receipt compatibility, bounded unpriced history, downgrade
limits and preservation of other features. No other balance/effects are changed.

## Acceptance and current evidence

Require exact cap/no-debit on all existing paths; full original value or exact
retained credits; raw history; old/current save/recovery/backup and repeated
restore/rollback; Ascend and paid-Lab preservation; live/offline boundaries;
320/390/430px at100%/200%,44px controls, native touch/keyboard/focus, contrast and
reduced motion. Run all existing CI gates, focused cap/refund regressions and
causal defect controls on the final integrated version. Then verify signed APK
package/version/certificate/source assets and relevant actual Android behavior.
Do not turn unavailable required acceptance into a passing claim.

[Historical evidence](../qa/cheaper-bonds-cap-001/README.md) includes the first
cap-only candidate's132 scenarios/383 checks; those are not current acceptance.
The first new migration oracle caught erased original value at extreme raw2000;
[raw failure](../qa/cheaper-bonds-cap-001/finish/migration-initial-loss.json) is
preserved. The final local candidate passes499 assertions/12 mobile profiles,
6 causal controls, V8 6.0 cap/refund/credit, dense layout and941 clarity checks.
[Current versions/results](../qa/cheaper-bonds-cap-001/finish/README.md) distinguish
them from required full CI, integration and APK acceptance. Required CI gains focused checks/four causal mutations. Frozen offline state now
asserts exact below-cap migration defaults; original gameplay comparisons remain.

## Next concrete action and completion

Finish current-source focused/refund/mobile tests, baseline existing checks and
complete diff review; push the current combined source to PR89. Obtain required CI,
address findings, recheck main/overlap and integrate serially. Recheck integrated
bytes, verify the resulting signed APK and relevant Android acceptance; save
task/PROJECT_STATE/evidence in GitHub and stop shared-file work.

PR: [89](https://github.com/karahaNx/Lumenfall/pull/89), published. Integration/APK: pending. Archive status: **open**. An open PR or local pass
is not a finished feature. Archive only this owner chat after verified completion.
