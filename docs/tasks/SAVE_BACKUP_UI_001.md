# SAVE_BACKUP_UI_001 — Backup/Restore beside Reset Save

One goal: place existing Backup/Restore in Settings → Save immediately before
the separate Reset Save action, preserving export, copy, validation, confirmed
replacement and the save/recovery contract. Original point F22.

Owner: this feature's Codex chat. Isolated checkout:
`/workspace/lumenfall-save-backup-ui-001`; branch `feature/save-backup-ui-001`.
Status: **integrated and signed APK144 published; physical acceptance OPEN**.
No other checkout was edited; no subagents or message tools were used.
Agent: Codex based on GPT-6; exact variant/effort unavailable. Recommended
GPT-6.1 Sol / High is not an execution record.

## Requirements and authorization

Original:

> Save backup i indstillinger menu skal være nede ved reset save, så skal backup også være mulighed.

Sources: [full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F22/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original text takes priority over proposals. No original image is F22-specific.

User correction, 8 October 2026:

> Finish the feature task push to github implement to game

This authorizes publication/integration/delivery. Current AGENTS/bootstrap/
[workflow](../project/FEATURE_WORKFLOW.md) supersede historical writer gates.
No new approval, project rule or gameplay number is needed.

## Baseline and actual dependencies

Initial shared checkout: clean `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
[Historical evidence](../qa/save-backup-ui-001/README.md) preserves initial
preparation and its baselines.

Current integration baseline, 8 October: **`b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`**.
Rebase preserved both test registrations and Lab viewport expansion; product
hunks applied without conflicts.
PR46/B2 implementation is already integrated via PR57; its historical physical
acceptance does not block this task. Current save normalization, offline
cancellation and legacy Comet purchase handling must remain intact.

Draft PR67 overlaps Settings; its bundle is not used here. Draft PR66/70 are
outside scope. No active Android/main run was observed; main integration was
serialized after rechecking its baseline.

## Scope and decisions

- Move existing Backup entry directly before Reset, retaining the Backup view.
- Baseline Restore replaced the save immediately. Add inline confirmation:
  validate first, capture and lock the reviewed input, focus Cancel, and invoke
  the existing restore handler only after explicit confirmation.
- Cancel, Back, Close and Escape discard pending replacement. Returning from
  Backup focuses its entry. Failed restore returns focus to Restore.
- Keep Reset's independent confirmation; set its controls to at least 44px.
- Preserve backup format, encode/decode/export/clipboard/restore transaction,
  schema, save/recovery keys, rollback, reload/autosave guards and gameplay.
  No migration, purchase deletion, refund, balance or native/signing change.
- Register focused native browser input coverage and two causal negative
  controls in existing tests/CI; preserve all existing gates.

## Acceptance

1. Backup is under Save immediately before independently actionable Reset.
2. Complete export/copy and clipboard/manual fallback work. Invalid/future-schema
   codes alter neither save.
3. Restore request is nonmutating; Cancel/Back/Escape/Close clear intent. Only
   explicit confirmation replaces the captured code. Failed primary writes roll
   recovery back; restored values persist through reload.
4. Old backups start from now without duplicate offline time. Reset retains its
   independent request/cancel/confirm behavior; current engine/save contracts pass.
5. 320/390/430px × normal/200% text × normal/reduced motion: labels fit,
   controls ≥44px, focus/order/trap work and text contrast ≥4.5:1.
6. Required CI/affected checks pass on integrated main. Published APK matches its
   source, package/version/certificate; preserve WebView60, deterministic purchases,
   Motes rewards and existing data. No migration is needed.
7. GitHub status/evidence is saved; required Android/device acceptance passes
   before completion/archiving. Blocked acceptance keeps this chat open.

## Checks, delivery and next action

[Current evidence](../qa/save-backup-ui-001/2026-10-08/README.md) records exact
commands, versions, source hashes, raw logs, screenshots and the immutable APK.

[PR77](https://github.com/karahaNx/Lumenfall/pull/77) merged at
`261b1b7f863f73c324f4ac04acb5bfc95101644d`; full tree equals validated head
`35fa2c8da59b5db457a84adfae8ec468e3a5fcfe` (tree `321a4d98e4da8ef2efee8916ec40b17a9e80a854`).
CI `37735085451`: source/tooling, 152 scenarios / 174 results, all 14 required
negative controls and guarded startup PASS. Local full suite likewise PASS.
Six core backup functions match the baseline exactly; both inline scripts parse
as ES2017. Self-review/automated checks only; no human review or inline finding was observed.

Integrated-source UI and extracted-APK UI each PASS all 12 profiles. Browser
clock/interval control and clipboard/storage-failure injection are test-only;
normal engine/save/lifecycle behavior is covered by the unchanged existing suite.
Exact extracted APK script additionally PASS on V8 6.0 with minimal mocked
DOM/storage; this is engine evidence, not physical WebView60 acceptance.

Signed APK **0.1.144**, build `37736693432` on the integration commit, is
published. Package `com.lumenfall.app`, version144, established certificate and
v1/v2 signatures PASS; all15 source assets match, all526 ZIP entries pass CRC.
SHA256: `6e2006cb90ebe27104bd1ae38ba8c8afa700f4ede90e6fe8046bf7b2f505ca5d`.
[APK/receipt](../qa/save-backup-ui-001/2026-10-08/README.md) preserves the binary
because the latest-release URL is mutable. No package/signing change or migration.

Required physical Android/WebView60/TalkBack acceptance remains **OPEN**.
This environment provides no connected device/emulator, KVM or USB passthrough.
[Device checklist](../qa/save-backup-ui-001/2026-10-08/DEVICE_ACCEPTANCE.txt)
covers signed update/save preservation, actual clipboard, native reload/storage,
layout/accessibility and independent Reset. No native/device pass is invented.

Next: complete and save the physical checklist on signed144. Shared-file work
for this feature stops after this delivery checkpoint. Keep the feature/chat open until required acceptance passes;
archive only this owner chat afterward. No other chat's work is released here.
