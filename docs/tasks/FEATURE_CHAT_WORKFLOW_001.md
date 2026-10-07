# FEATURE-CHAT-WORKFLOW-001 — focused feature chats

Owner: the current workflow-cleanup chat. Date: 7 October 2026.
Baseline: main `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, verified via Git
remote refs. Branch: `docs/feature-chat-workflow-2026-10-07`.
Goal: replace the five permanent role chats with one feature owner and clear
game-preservation/context safeguards. Original requests and reasons are saved
in [the decision](../decisions/2026-10-07-feature-chat-workflow.md).

## Scope and acceptance

- Align AGENTS, bootstrap, project instructions, README, optional technical
  guides, feature workflow, context index, account recovery and handoff template.
- Update the context checker to measure shared feature startup without requiring
  a default Lead role and validate links in the current workflow/guidance.
- Keep existing game contracts and completion/device acceptance requirements.
  Product code, assets, save schema, behavior tests, CI/release workflows and
  historical originals must remain unchanged.
- Correct current status pointers using observed evidence; do not mark another
  feature/device acceptance complete or turn a reported finding into a proven bug.
- Pass context/link/archive checks, existing tooling regression checks and diff/
  scope review. Publish/integrate this documentation/tooling scope in GitHub and
  verify the integrated version. No APK build/device gate applies to this task.

## Status and continuation

Status: local candidate verified; GitHub CI/review and integration pending.
Changed areas: active project/workflow/guidance documents and
`scripts/codex/check_context.cjs`; no product edits.
Baseline context check: PASS, 21 entrypoints, 24 links, old Lead startup 17,805 bytes.
Candidate validation (Node.js 24.19.0; exact published head recorded in PR receipt):
- `node scripts/codex/check_context.cjs --archives`: PASS, 30 entrypoints, 35
  local links; shared startup is measured separately from the current task. All 1,509
  archive/coverage checks and the exact 96-source B2 tree/modes remain intact.
- `node --check scripts/codex/check_context.cjs`: PASS.
- `node tests/tooling/run.cjs`: PASS, including archive/recovery, hash/CRC,
  overwrite/traversal rejection, APK identity, source/smoke negative controls
  and actual local HTTP checks. Intentional negative fixtures were rejected.
- `git diff --check`: PASS. Full scope/diff review: only active docs and the
  context checker change. `git diff --exit-code` against the baseline for game,
  mobile/assets, tests, CI/release workflows and historical evidence: PASS.
These checks validate this documentation/tooling task, not physical game/device
acceptance. Final GitHub CI/integration results belong in the PR receipt.
Decisions: no permanent role gates; task-based scope, optional expertise, isolated
concurrent work, small edits, regression preservation and durable short checkpoints.
Known limitations: PR51 is merged at the baseline. Concurrent PR52 saves its
release/device checkpoint and overlaps PROJECT_STATE/KNOWN_ISSUES; preserve that
evidence when reconciling main before integration. Current status distinguishes
integration/reported release from pending device acceptance and review findings.
Next action: publish a PR, verify required CI/review, integrate and verify this
exact documentation/tooling scope.
Archive status: pending verified completion; do not archive unrelated chats.

The PR description will hold final CI/integration/checkpoint/archive receipts,
including the integration commit, so a separate documentation PR is not required
to insert a commit's own hash. Verify live merged status and the receipt on resume.
