# FORMATION_AUTOSAVE_001 — Formation autosave (F14)

Status: **verified local candidate; GitHub checkpoint, integration and required acceptance remain open**.
Owner: this feature chat, “LUMENFALL — ÉN FEATURECHAT: Formation autosave”.
Role: Gameplay / Progression. No subagents, messaging tools or chat renaming.
Runtime: Codex based on GPT-6; exact variant and effort control are not exposed.
GPT-6.1 Sol / Extra high is the user's recommendation, not execution evidence.

## Single goal and originals

Immediately save Field/Bench and relevant recruitment changes to the selected
Push/Farm/Boss preset, and remove Save. Preserve preset isolation, stored empty
presets and the complete desired late-game lineup across Ascend and recovery.
Pending members contribute no DPS or Bonds.

Authoritative original:
[USER_REQUIREMENTS_2026-10-07.txt](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):

> Current formation skal laves at der ikke behøver stå save, feks når man vælger push så vælger man de wisp man vil have, så skal den auto save det uden at trykke på knappen, at det er de aktuelle wisp der gemmer til den formation.

User clarification in this owner chat on 7 October 2026, verbatim:

> Altså det jeg mente med det her autosave er, når man vælger den aktive formation, så skal den huske de wisps man har, selvfølgelig er der ikke en formation der starter med 0 wisps

The complete order/clarification are in [FORMATION_AUTOSAVE_001_REQUEST.txt](FORMATION_AUTOSAVE_001_REQUEST.txt).
Supporting sources: F14, dependencies and save sections of
`FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`, concrete Lead decisions in
`DECISIONS/FEEDBACK_REGISTERED_001.txt`, `FEEDBACK/EVIDENCE/FINDINGS.txt` and
`FEEDBACK/Source_Index.txt`, under `docs/recovery/2026-10-07/lead_context/`.
The four supplied screenshots concern other feedback, with unknown APK/save
versions; they are not Formation acceptance evidence. The original takes precedence.

## Baseline and writer

Observed through live GitHub and Git transport on 7 October 2026:

- Initial main: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, tree
  `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`. Its product matched the previously
  accepted `1ddc246eb62782a61ec5c486cd5f51ea170bb338` / APK 0.1.133.
- Main advanced during preparation. The candidate was rebased onto
  `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
  `6e18e8485111a7a5bfa2d5854ed6b9c4735282c2`, reconfirmed at 14:19 UTC.
  This includes offline catch-up and Node tooling. They were retained and
  relevant checks rerun. Older task/status text about PR51 awaiting merge does
  not override the observed main commit.
- Private worktree: `/workspace/Lumenfall-formation-autosave`; branch
  `feature/formation-autosave-001`. The original checkout's source was not edited.
- PR46 remains open/Draft on R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.
- Archived B2 tree: `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, restored and
  hash-verified separately. New scoped Core/QA acceptance remains missing.
- 02_07's later writer release is unknown. No remote repo-writer has been
  assigned to this owner chat. The user's order authorizes isolated preparation.

PR46/B2 review and writer handover precede remote product changes under this
mandate. F14 must stabilize before new F15 Formation Bonds integrate. Lead
coordinates F20/F21 and other features; they are not implemented here.
Standing approval applies; no new general approval is requested.

## Candidate decisions and scope

- The selected preset remains the autosave destination. Field/Bench edits the
  complete desired roster, including pending members during a partial rebuild,
  and immediately writes canonical primary and recovery saves.
- Recruitment outside a nonempty rebuild adds to an available chosen slot as
  before and saves the selected preset. Empower changes levels, not membership.
  Paid rebuild purchases retain the complete desired roster and never save
  the temporary powered projection over it.
- Switching selects the destination before projecting its saved lineup. It
  overwrites no other preset. Pending presets remain selectable.
- Five desired slots include pending. Invalid IDs, an unavailable Field member,
  a sixth member and removing the last chosen member are rejected without
  state/save mutation.
- The clarification preserves at least one actual active Wisp. Fresh presets
  still start with Ember. An existing stored `[]` remains empty; selecting it
  uses temporary Ember until explicit Field/recruitment edits its saved intent.
  This does not create an initially empty active formation.
- Empty rebuild intent is valid only when associated with an exactly matching
  selected stored preset. No new save key or schema version is added.
- Ascend captures the complete desired order before reset. Repeated Ascend,
  canonical normalization, reload, recovery and backup preserve destination,
  pending members and stored empty presets.
- Pending Bench removes only that intended member. Combat, abilities, support
  and Bonds use powered Field members. Existing unlock, price, cheapest-first
  and cadence restrictions remain in force.
- Save controls/handler are removed. Native buttons show Selected/Autosave and
  pending counts. Field/Bench targets are at least 48px so their actual animated
  bounds remain above 44px.

No new balance values or formulas. Package `com.lumenfall.app`, signing,
WebView 60 baseline, deterministic purchases and documented Luminous Motes
rewards remain unchanged. Paid ownership/currencies are preserved; normalization
buys/refunds nothing and is idempotent. No new Bonds, caps, refunds, offline
policy or B2 arithmetic are implemented.

All new tooling/tests use JavaScript. The final candidate uses the current
Node harness (`bridge.js`, `prelude.js`, `runner.js`, `run.cjs`, `scenarios.json`).
The offline regression's old scheduler oracle compares summaries and every
state field exactly, except that expected partial-rebuild selection now retains
the matching preset as required by F14. Historical oracle bytes are intact.

## Acceptance criteria

1. Push/Farm/Boss stay isolated through select → Field/Bench/recruit → switch
   → return. Primary and recovery contain the edit immediately, without Save.
2. At least one actual Field member; five desired slots including pending.
   Stored empty presets remain selectable/editable without automatic overwrite.
3. Partial/repeated Ascend preserve complete desired order and selected
   destination. Pending grants no combat/ability/support/Bond benefit.
4. Canonical/reload/backup/recovery retain presets, selection and pending.
   Malformed/legacy handling is deterministic and idempotent, preserving paid value.
5. Relevant chronology, rewards, live/offline, queue and economy checks pass.
   Three causal autosave mutations must be detected.
6. UI passes 320/390/430px, 200% relevant text, native touch/keyboard, actual
   targets ≥44px, focus, contrast, reduced motion and rendering without saves.
7. At a coordinated writer checkpoint, save the task, implementation and evidence
   to GitHub. Verify integrated bytes and required APK/package/signing,
   Android/WebView60/TalkBack checks. Release writer before archiving only this
   chat. A local candidate/open PR does not meet this criterion.

## Verification and limits

Final source SHA256:
`2eda7ffd83e95d2a114403706f488d8c58723726d81314c873fb1393e793bc1b`.
Evidence and exact exits: [local QA receipt](../qa/formation-autosave-2026-10-07/README.md).

Code checkpoint: `0e6185e825424a0d212179c3dbb24c11dd49c0b7`, tree
`5cea4fac44e9103ce86b68be40f598069b03e02d`. Final receipts/documentation are a
subsequent local commit; the delivery packet identifies that final head/tree.
The runner started at local HEAD `977a11c` with the final working-tree changes;
its recorded product hash and the unchanged SOURCE_MANIFEST bind the checked
bytes to the code checkpoint. No code/test bytes changed after test startup.

Observed final clean run, 14:09:20–14:21:58 UTC, Node 24.19.0:

- All 138 default scenarios / 158 expanded results pass; behavioral exit 0.
- All 12 workflow negatives produce valid intentional QA failures and harness
  exit 1, without timeout. Complete outputs and independent replay are preserved.
- Context, Node tooling, APK-verifier self-test, source and guarded runtime
  smoke pass. The existing smoke verifier also passes on the saved DOM.
- 133 autosave assertions per contract invocation; all three causal mutations
  detected. Immediate primary/recovery, real reload, backup and recovery pass.
- All twelve 320/390/430px × normal/200% relevant-text × normal/reduced-motion
  profiles pass native touch/keyboard, actual ≥44px bounds, focus, contrast,
  unobstructed hit-testing, render purity and resumed production combat.
  Preset detail contrast ≥6.57:1; focus contrast ≥5.77:1; twelve screenshots saved.
- Both inline scripts parse as ECMAScript 2017 using Acorn 8.15.0. Product patch
  dry application to restored B2 passes, without functional B2 acceptance.

The first rebased full run's obsolete offline-selection assertion failed and
was corrected while preserving exact comparisons for all other state and reward
summaries. Both that failure and corrective rerun remain in the history folder.
Only the subsequent clean run is final local acceptance.

System Chromium 151 CLI `--dump-dom` hung even on about:blank; early interrupted
runs are diagnostic, not acceptance. Native CDP works with Chromium 151. CLI
gates use isolated Google Chrome 155. Browser identity/source hashes/raw complete
outputs are retained. Modern browser/grammar checks do not replace physical
Android, WebView60 or TalkBack acceptance.

Reproduce from the repository root with Node 20+ and compatible Chrome:

```bash
node scripts/qa/check-formation-autosave.cjs --full --evidence /tmp/formation-checks
```

## Next action and completion gate

The local task, patch, source/commit bundle, evidence and TXT/ZIP are frozen for
user-transferred Lead review; archive CRC and every manifest payload are checked.
Lead must resolve PR46/B2 acceptance and documented writer handover, assign
the checkpoint, recheck main/branches/PRs/runs and save this feature to GitHub.
Review any integration delta and rerun relevant checks on integrated bytes.
Use existing Android workflow triggers; verify immutable APK identity and
required device acceptance. Save receipts/status and release this scope's
writer before archiving this owner chat.

No push, feature PR, integration, APK build/release, workflow dispatch/rerun or
remote document write was performed here. No product writer was acquired or
released. GitHub persistence, integration and APK/device acceptance remain open;
this chat remains unarchived. The delivery packet records the exact local commit/tree.
