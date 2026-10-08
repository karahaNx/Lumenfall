# Lumenfall — one feature, one chat

The feature owner handles implementation, necessary fixes, tests, documentation
and delivery across all relevant areas. The user's task and standing approval
define scope. Technical guides are optional references; no permanent role chats,
Lead assignment or writer-release ceremony is required.

Keep one concrete goal per chat. Record unrelated findings for separate tasks.
Create a new chat only when the user asks; do not rename chats or use subagents/
message tools without an explicit request. A maintenance task uses this same
focused workflow.

## Start and protect the baseline

1. Read root `AGENTS.md`, bootstrap, `../PROJECT_STATE.md` and the feature task.
   Check the checkout, relevant current main/PR and actual overlapping work.
   Use an isolated branch/worktree when features run concurrently. Coordinate
   overlapping files/shared status and serialize main integration.
2. Create or update `docs/tasks/<FEATURE_ID>.md` with original requirements,
   one goal, scope, owner, baseline and acceptance criteria. Include existing
   behavior/features that the change must preserve and relevant save migrations.
   Run `node scripts/codex/check_context.cjs --task docs/tasks/<FEATURE_ID>.md`
   against this actual task; its existence, local links and startup budget must pass.
3. Read affected code and original requirements. Record relevant baseline checks
   and known failures before behavior changes; add focused regression coverage.
   Avoid unrelated refactors, broad rewrites and tooling migrations.
4. Implement small changes. Preserve other work and existing features/save data.
   Review the complete diff for accidental deletions and scope drift. Fix newly
   introduced failures; do not remove features, skip gates or weaken tests to pass.
5. Before new binding rules, tell the user the exact rule, reason and effect and
   save their decision. Clarify missing gameplay choices; do not repeatedly ask
   permission for routine work already authorized.

## Short checkpoints and continuation

Update the task after meaningful milestones and user corrections, and before
context compaction/handoff. Keep the next action precise. Commit/publish coherent
work within scope; incomplete work must be labelled as incomplete.

Save original requirements, decisions, current versions, changed files, check
results, blockers and next action in GitHub. Preserve needed raw evidence or
stable references; copy expiring artifacts before they become the only source.
Use [the handoff template](../HANDOFF_TEMPLATE.md) when continuing elsewhere.
TXT/ZIP packages are optional for requested phone/offline use.

When context becomes uncertain, reread the checkpoint and affected code before
editing. Resume the same feature from its recorded branch/version; do not expand
scope, guess missing requirements or repeat completed work. Continue in the same
chat when possible; a replacement chat requires the user's request. Record known
limitations and the next action if required acceptance is blocked.

## Completion before archiving

All relevant criteria must be verified:

- The agreed change is integrated into main; record PR and integration commit.
  A prototype, local test pass or open PR is not completion.
- Acceptance checks and required CI gates pass on the integrated version; record
  commands, outcomes and versions. Reassess affected results after conflict
  resolution or dependency changes. Review findings are fixed, or a justified
  disposition is recorded without bypassing acceptance. Do not claim independent
  review when only self-review/automated checks were performed.
- For an app feature, build/publish the required APK within authorized scope,
  verify package/version/signing and complete required Android/device acceptance.
  Missing required device acceptance keeps the feature open. Documentation-only
  work needs document/tooling checks and GitHub integration, not a new APK.
- The task and `../PROJECT_STATE.md` contain supported status, decisions,
  evidence, limitations and next action. Required context is not only in chat.
- Shared-file work for this task has stopped; do not claim another chat's work
  or historical ownership has been released. Give a short delivery with changes,
  location, check results, limitations and new rules.

Then archive only the owner chat using the app's actual chat identity and archive
tool. The user's workflow authorizes archiving after verified completion. Do not
rename/archive other chats. If tooling is missing or fails, report that manual
archiving remains; never claim success without a successful response. Blocked or
unknown acceptance remains open. GitHub retains the continuation knowledge.

## Compact task checkpoint

```text
Feature-ID and one goal:
Original requirements and corrections (paths):
Owner chat, scope and acceptance criteria:
Baseline commit, feature branch/worktree and changed files:
Existing behavior to preserve and relevant known failures:
Status: in progress / blocked / integrated, acceptance pending / complete:
Decisions and reasons, including new rules:
Checks: command, result, exact version and evidence path:
PR, integration commit and APK/run/device evidence when relevant:
Blockers/limitations, overlapping work and archive status:
Next concrete action:
```
