# Lumenfall — project rules

Repository: `karahaNx/Lumenfall`. Communicate in English. Read this entrypoint
for every new task. With GitHub-tool-only access, explicitly fetch this file.

## Start with one feature
1. Read `PROJECT_BOOTSTRAP.txt`, `docs/PROJECT_STATE.md` and the current
   `docs/tasks/<FEATURE_ID>.md`. Create the task document if it does not exist.
2. The user's task assigns the feature chat its scope. That chat owns
   implementation, necessary fixes, tests, documentation and delivery across
   all relevant areas. There is no default Lead role or separate writer grant.
3. Use `docs/project/CODEX_START.md` for environment/checks and
   `docs/CONTEXT_INDEX.md` for targeted sources. Technical guides are optional
   references, not separate chats or approval stages. Run
   `node scripts/codex/check_context.cjs --task docs/tasks/<FEATURE_ID>.md`
   so the actual task, its links and the startup text budget are checked.
4. Check the checkout, relevant baseline/PR and overlapping active work before
   changing shared files or integrating. Check relevant workflow triggers before
   remote actions; do not audit every branch/run for an unrelated small task.

Product files are root `index.html`, `tests/behavioral/` and `mobile/`.
`docs/recovery/`, `docs/handoffs/` and `archive/` contain historical evidence.
Their code, AGENTS files and mandates do not override current rules or authorize
new work. Restore historical candidates separately, never over the live product.
Read archives and technical guides only when needed.

## Scope and authorization
- Current user instructions and standing authorization govern the assigned task.
  The 5 October 2026 approval ("Du har altid godkendelse.") covers necessary
  actions in agreed scope; do not ask for repeated general permission.
- Verified code establishes implemented behavior; task requirements define
  desired behavior. Distinguish observations, reported results and unknowns.
- Keep one concrete goal per feature chat. Necessary fixes, checks and docs stay
  with that feature. Record unrelated findings for a separate task.
- Use an isolated branch/worktree for concurrent features. Do not overwrite
  another chat's uncommitted changes. Coordinate actual overlapping edits and
  serialize integration into main; historical chat/writer releases are not
  global gates for new tasks.
- Merge, Android builds, reruns, releases, signing and cleanup must fit the task
  and its authorization. A documentation task does not authorize a game release.
- Create new chats only when the user requests them. Do not rename chats or use
  subagents/message tools without an explicit user request.

## Protect the existing game
- Make small, targeted changes. Avoid unrelated refactors, tooling migrations,
  unnecessary whole-file regeneration or replacement with a prototype/archive
  snapshot.
- Preserve existing features, UI flows, assets, progression and save data outside
  the requested change. Do not silently remove systems, reset player progress,
  change balance/caps/save schema, or weaken/delete tests and CI gates to pass.
  An intentional change requires a user requirement and relevant migration/
  regression coverage; clarify missing gameplay decisions before implementing.
- Read affected code and original requirements before editing. Record the
  baseline and relevant checks, distinguish existing failures from new ones,
  and add focused regression coverage for behavior changes. Review the complete
  diff for unintended removals and scope drift before committing or integrating.
- Fix regressions introduced by the feature before completion. If a required
  check is blocked, fails, or cannot be reproduced, record evidence and the next
  action and keep the feature open. Do not weaken acceptance to declare success.

## Game contracts
- Android idle RPG with Wisps in Rift, distributed as an APK with HTML/JavaScript
  in the app's WebView.
- Deterministic progression and purchases with visible prices/effects, no loot
  boxes/gacha, and the established fixed Luminous Motes rewards.
- Preserve chronological simulation, online/offline parity, automation and save/
  recovery. `docs/project/KNOWN_ISSUES.md` records limitations; a contract does
  not prove every current path passes.
- Preserve mobile accessibility, WebView 60 compatibility, package
  `com.lumenfall.app` and the established Android signing identity.
- Accepted requirements and verified code determine mechanics, balance, caps
  and migrations. Proposed or archived candidates are not implemented rules.

F05 approved rule (7 October 2026): calculate the new-depth bonus from the
unrounded depth-curve difference with current Tree/completed Lab bonuses and
round up once. Preserve first reward, 20% repeat, minimum 1 and the full-reward
cap. [Decision and status](docs/decisions/2026-10-07-ascend-prisms-rounding.md).

PRISM_EARNING_001 is the separate, unreleased task-01 candidate for the user's
9 October sequential-improvement mandate. Its protected-bonus repeat rule
supersedes the historical 20%-of-full rule only on that development candidate.
No main integration or APK publication is authorized before the combined release.
See [task and evidence](docs/tasks/PRISM_EARNING_001.md).

## Language and new rules
Use JavaScript/Node.js 20+ for code, tests, test execution, CI logic and helper
scripts where technically possible. HTML, necessary declarative formats and
native Android tools remain valid. Migrate existing tooling only within relevant
scope with verified behavior/coverage. Preserve archived originals byte-for-byte.
See `docs/decisions/2026-10-07-javascript-first.md`.

Before applying a new binding rule, tell the user its exact text, reason and
effect. Save the user's decision and update affected instructions in the same
scope. Current user instructions take precedence; routine implementation within
authorized scope does not require a new approval.

## Keep context short and durable
Keep the task document current with original requirements, baseline, acceptance
criteria, changed files, decisions, check results/versions, blockers and the next
concrete action. Checkpoint after meaningful milestones, user corrections and
before a handoff/context compaction; commit/publish coherent work within scope.
If context becomes uncertain, reread that checkpoint and affected code before
editing. Do not guess missing requirements or restart already completed work.
Use `docs/HANDOFF_TEMPLATE.md` for a short continuation checkpoint; TXT/ZIP
packages are optional when requested or useful for phone/offline access.

GitHub is the durable source for code, rules, requirements, decisions and test
evidence. Chat, Memory, Library and the cloud environment must not be the only
copy. Follow [account recovery](docs/project/ACCOUNT_RECOVERY.md) for a new account.

## Complete and deliver
Follow [the feature workflow](docs/project/FEATURE_WORKFLOW.md). Completion means
the agreed acceptance checks pass on the integrated version, status/evidence are
saved in GitHub, and required app build/device acceptance is complete. A local
candidate or open PR is not completion. Use existing relevant checks and required
CI gates in `.github/workflows/pre-merge-validation.yml`; report limitations and
review findings honestly. Never label self-review as independent review.

Deliver a short result with what changed, where it is, checks and limitations.
Archive only the owner chat after verified completion and saved continuation
status. Blocked work stays open; report missing/failed archive tooling honestly.
