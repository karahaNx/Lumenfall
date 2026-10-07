# Lumenfall — short continuation checkpoint

Use the feature task as the normal checkpoint. Update it after meaningful
milestones/user corrections and before context compaction or handoff. Commit/
publish coherent work within scope. A separate package is only needed when
requested or useful for phone/offline access.

## Checkpoint

Aim for at most 400 words of current status, with paths to detailed originals
and evidence. Include necessary unfinished facts even if that requires more.

```text
Feature-ID, one goal and owner chat:
Original requirements and corrections (paths):
Repository, baseline commit, branch/worktree and working-tree state:
Scope, acceptance criteria and existing behavior to preserve:
Changed files, decisions/reasons and new rules:
Complete / in progress / blocked / unknown:
Checks: command, outcome, exact version and evidence path:
PR and integration commit; APK/run/device evidence when relevant:
Known failures, unresolved reviews and actual overlapping work:
Archive status:
Next concrete action:
Required information not yet in GitHub:
Startup: AGENTS.md, PROJECT_STATE.md and this feature's task/checkpoint.
Read affected code and originals as needed; do not read the entire archive.
```

On continuation, verify the current checkout/relevant PR and reread uncertain
requirements before editing. Resume this feature; do not restart completed work
or use an old candidate to overwrite the live product. No Lead/role/writer
handoff is required. Coordinate actual overlapping edits or main integration.

## Optional export package

Include the checkpoint, compact file index, required original requests/corrections,
decisions and evidence that cannot be retrieved reliably. Reference already saved
sources by exact path/commit/version; avoid recursive copies of old handoffs.
For a package, include a manifest of relative paths, sizes and SHA256 values and
verify payload hashes and ZIP CRC. Keep original evidence byte-identical.

## Verify before delivery

- Requirements, decisions, changed files, versions, check results, blockers and
  next action have sources. Distinguish reported results from verified evidence.
- Original requirements and needed evidence are retrievable without the old chat;
  external references alone do not establish future access.
- Completion satisfies [the feature workflow](project/FEATURE_WORKFLOW.md), with
  integrated checks and required app acceptance. Open or blocked work stays open.
- Record actual archive success or that archiving remains. Do not archive other
  chats or claim another feature's work has stopped.

A summary does not replace original requirements or raw evidence. Save critical
facts continuously; report missing material rather than reconstructing it.
