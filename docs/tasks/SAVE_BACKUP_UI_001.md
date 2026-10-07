# SAVE_BACKUP_UI_001 — Backup/Restore beside Reset Save

Owner: this feature's Codex chat, UI / Visuals (role 03). Original point: F22.
Status: **frozen local candidate; integration and app acceptance remain unfinished**.
Private checkout: `/workspace/lumenfall-save-backup-ui-001`.
Branch: `feature/save-backup-ui-001`. No remote writer has been assigned here.
No other chat's checkout has been edited; no subagents/messages were used.

Agent identity available in this session: Codex, based on GPT-6. The exact
model variant and effort setting are not exposed. The user's recommendation
is GPT-6.1 Sol / High; it is not a record of the model used.

## One goal and original requirement

Place the existing Backup/Restore entry under Settings → Save, immediately
before the separate Reset Save action. Preserve export, copying, import,
validation, replacement confirmation, and the existing recovery contract.

Original user text:

> Save backup i indstillinger menu skal være nede ved reset save, så skal backup også være mulighed.

Authoritative full original:
`../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt`.
F22 and save/dependency sections:
`../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`.
Lead ordering and decisions:
`../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt`.
Evidence boundary:
`../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt` and
`../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt`.
The four original screenshots concern other feedback points; none supplies
an F22-specific layout or APK identity. The original requirement takes priority
over suggestions in TASK.

Current user instructions additionally require separate local preparation,
one repo writer, JavaScript scripts, PR46/B2 startup checks, a coordinated
GitHub checkpoint, and verified integration/APK/device acceptance before
archiving. Standing approval covers this scope; no new general approval is
requested. Private preparation does not assign the shared repository writer.

## Baseline and dependency observations

Startup checkout was clean at `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
Live main initially verified as `b2a1f440e8ad9fed34b37551e468224310d2a6f6`;
its AGENTS added the JavaScript policy. A separate checkout/feature branch
was created from that main, with the sources/rules read there.

During validation, main advanced through merged PR51. The private code commit
was rebased cleanly onto **`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`**,
observed on 7 October 2026. Current rules and workflow were reread; final
checks use the new Node tooling. This is the final candidate's base.
PR51 was verified closed/merged at that commit. PROJECT_STATE still described
it as a Draft candidate when read; live merge metadata and code establish
the actual integration. PR51's release/device status is outside this feature.

PR46 was verified open/Draft, R2 head
`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`. The newer archived B2 tree is
`758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; the delivery's START/identity
report local stop, fresh scoped Core/QA reviews still required, and 02_07's
writer release unknown. Those gates remain dependencies. No B2 review or
handover is inferred from green R2 CI or from PR51's integration.

Settings rendering is shared with other UI work. Coordinate edits to the
Save markup, `showSettingsView`, `closeSettings`, and `init` event bindings
at the Lead checkpoint. This patch includes no other feedback goal.

## Decisions and scope

- Move the existing `save-backup-btn` to Save directly before `reset-row`;
  retain the existing Backup view, code format, and copy controls.
- The baseline's visible Restore button directly called `restoreSaveBackup`
  without confirmation. Add an inline confirmation to fulfill this task's
  explicit replacement-confirmation requirement. Validate before showing it,
  lock the reviewed input, focus Cancel, and validate again through the existing
  restore handler on explicit confirmation.
- Cancel, Back, Close, and Escape discard pending confirmation. Confirm uses
  the captured code, preventing a different code from replacing the reviewed
  input. Returning from Backup focuses its entry in Save.
- Give the Reset buttons a minimum 44px height. Their existing destructive
  confirmation remains separate from Restore.
- Keep the backup encoder/decoder, exporter, clipboard implementation, restore
  transaction/rollback, schema, canonical/recovery keys, reload/autosave guards,
  and PR51 catch-up cancellation byteidentical to the final base. No migration,
  ownership deletion, repricing, refund, balance, or gameplay change is needed.
- Add a Node/Chromium test to the existing default suite plus two causal
  negative controls. No workflow, mobile, package, signing, runtime baseline,
  deterministic purchase, or Luminous Motes reward change is included.

No new project rule or gameplay number is proposed.

## Acceptance criteria

1. Backup appears in Save immediately before a separately actionable Reset.
2. Opening/copying Backup preserves progress and exports the complete current
   save. Clipboard success, unavailable-API, and rejected-write fallbacks work.
3. Invalid prefix/encoding/root or future-schema codes replace neither canonical
   nor recovery save and do not start a reload or confirmation.
4. A valid Restore request changes no save. Cancel/Back/Escape/Close clear pending
   intent; safe focus and editable input return. Explicit confirmation alone
   replaces progress; a primary-write failure rolls recovery back.
5. Confirmed Restore survives reload, establishes matching primary/recovery
   state, resets `lastSeen` to now, and grants no replay from an old backup.
   Reset retains its own request/cancel/confirm behavior and clears only after
   its explicit confirmation.
6. 320/390/430px, normal/200% root text and normal/reduced motion: controls fit,
   labels wrap, controls are at least 44px, keyboard order/focus/trapping work,
   and relevant text contrast is at least 4.5:1.
7. Existing relevant persistence, chronology, live/offline, accessibility and
   workflow checks pass on the candidate. Subsequent integration must preserve
   WebView 60, `com.lumenfall.app`, signing, purchases and documented rewards.
8. Completion additionally requires coordinated GitHub/main integration,
   checks on that integrated version, a relevant APK and required physical
   Android/WebView60/TalkBack acceptance, saved status, writer release, then
   archiving only this owner chat.

## Validation and evidence

Evidence: [QA index](../qa/save-backup-ui-001/README.md), including source
identities, commands, full logs, screenshots and negative-control results.
The final UI check uses real native touch/keyboard dispatch on the production
page. Its test-only clock/interval controls permit exact nonmutation snapshots;
clipboard and storage-failure branches are stubbed explicitly. The existing
suite independently covers normal engine/lifecycle/save behavior.

Final candidate index SHA256:
`b247680333f2a732c952221dd83a80237d9ffe6b320021c533e636f19eb8947c`.
Code/test freeze: `e4f39c83226067d6a808823f2da20a185c1ae429`, tree
`2b6eea397c85f3d1724e074edc0ad7692e36ca94`.
Final preflight: 7 October 2026, 15:40 CEST (13:40 UTC); main and PR46 still
match the recorded baselines. The original shared checkout remains clean at
`67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
Core backup functions are byteidentical to the final integrated base.
Local validation: 133 default scenarios / 153 viewport-expanded results PASS;
12 existing and 2 new negative controls caught. Final UI rerun: all 12
profiles PASS, including Close cancellation. Source, Node tooling, guarded
smoke, APK-verifier self-test, archive/context, ES2017 syntax and diff checks
PASS. The APK-verifier result is its self-test, not verification of a new APK.
After extending only the UI test with an explicit Close case, that affected
scenario was rerun on the final test bytes; product/runner/registration bytes
remained fixed. Local results and identity are in `validation.json`.
A UI-only patch also passes `git apply --check` against a separately
hash-verified frozen B2 reconstruction; it was not applied to that tree and
this is not B2 acceptance.

Modern Chrome is not physical WebView60, Android or TalkBack evidence.
There is no new APK, remote PR, CI run, integration or device acceptance for
SAVE_BACKUP_UI_001. This chat remains open.

## Next action and writer checkpoint

Freeze the local candidate and supply its TXT/ZIP/patch to Lead. Lead must
resolve the PR46/B2 review/handover gates and coordinate the Settings edit,
then assign one writer for saving this task, code and evidence in GitHub.
Recheck live branches, PRs, workflow runs, main and writer before any remote
operation; reassess/rebase the patch if the integration baseline changes.
Use the task's standing approval within that coordinated scope.

After integration, verify the actual integrated bytes, APK identity/signing
and necessary device behavior; save the receipts and PROJECT_STATE, release
this feature's writer, and archive only this owner chat. Until then all of
those items remain unfinished; no other writer is released here.
