# Replace the permanent role-chat workflow

Date: 7 October 2026. Scope: current project instructions, technical guidance,
continuation documents and their context checker. No game/release change.

The user's instructions in the workflow-cleanup chat:

> Do the changes, so our new setup is more optimized and better. I dont need long chats that suddenly removes or breaks the game.

> I would say that we really dont need the old setup anymore. This new setup with one feature one chat is better i think?

This authorizes replacing the old permanent Lead/Core/Gameplay/Visuals/QA setup
with one owner chat per feature. It supersedes default-Lead startup, role-specific
permission grants, manual role task transfers and historical writer-release
requirements as global gates for new tasks. Current instructions and standing
authorization define scope. Concurrent feature work still requires isolation,
protection of other work and coordination of overlapping edits/main integration.

The owner implements, fixes, tests, documents and delivers across all affected
areas. Useful domain guidance remains optional; legacy filenames are retained
so evidence references resolve. Historical requirements, audits, frozen candidates
and hash-controlled originals remain evidence and keep their original bytes.

New safeguards, reported to the user before application:

- "Make small, targeted changes. Avoid unrelated refactors, tooling migrations,
  unnecessary whole-file regeneration or replacement with a prototype/archive
  snapshot."
- "Preserve existing features, UI flows, assets, progression and save data outside
  the requested change." Do not silently remove systems, reset progress or
  weaken/delete tests and gates to pass; intentional contract changes require
  user requirements and relevant migration/regression checks.
- Record baseline checks and existing failures, cover behavior changes and review
  the complete diff. Fix introduced regressions before completion; blocked or
  failing required acceptance keeps the task open.
- Maintain a short task checkpoint after milestones/corrections and before
  context compaction/handoff, with exact versions, evidence and the next action.
  Reread uncertain context before editing instead of guessing or starting over.

These rules address scope drift, accidental feature removal and lost context.
TXT/ZIP packages become optional when requested or useful for phone/offline use.
The always-report-model/effort rule is removed; unavailable settings must never
be guessed. Game contracts, JavaScript preference, notice of new rules, GitHub
continuity and verified integration/app acceptance before archiving are retained.
No new general permission checkpoint is introduced.

The context checker accepts `--task docs/tasks/<FEATURE_ID>.md` and validates
that actual feature's existence, location, local links and shared-plus-task
32 KiB startup budget. Without `--task`, it reports that only shared documents
were checked. Missing/broken/oversized task controls are covered by tooling tests.

Implementation and validation: [FEATURE-CHAT-WORKFLOW-001](../tasks/FEATURE_CHAT_WORKFLOW_001.md).
