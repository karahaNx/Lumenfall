# SAVE_BACKUP_UI_001 — Backup/Restore beside Reset Save

One goal: place existing Backup/Restore in Settings → Save immediately before
the separate Reset Save action, preserving export, copy, validation, confirmed
replacement and the save/recovery contract. Original point F22.

Owner: this feature's Codex chat. Isolated checkout:
`/workspace/lumenfall-save-backup-ui-001`; branch `feature/save-backup-ui-001`.
Status: **implementation prepared; publication/integration and app acceptance in progress**.
No other checkout was edited; no subagents or message tools were used.
Available agent identity: Codex based on GPT-6; exact variant/effort is not exposed.
The recommended GPT-6.1 Sol / High is not an execution record.

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

This authorizes publishing, integrating and delivering this feature. Current
AGENTS/bootstrap/[workflow](../project/FEATURE_WORKFLOW.md) supersede historical
Lead/writer-release gates. Standing authorization applies; no new general
approval is needed. No new project rule or gameplay number is introduced.

## Baseline and actual dependencies

Initial shared checkout: clean `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
Historical preparation used `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, then
PR51/main `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
[Historical evidence](../qa/save-backup-ui-001/README.md) remains unchanged.

Current integration baseline, 8 October: **`b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`**.
The unpublished candidate was rebased onto this main. Only test-registration
conflicts required resolution; both existing and new registrations were kept,
including the Lab viewport expansion. Product hunks applied without conflicts.
PR46/B2 implementation is already integrated via PR57; its historical physical
acceptance does not block this task. Current save normalization, offline
cancellation and legacy Comet purchase handling must remain intact.

Preflight found draft PR67's feedback bundle overlaps Settings; it is not used
as this feature's implementation. Draft PR66/70 are outside this goal. No
active Android/main integration run was observed. Recheck current main and CI
before merging; preserve concurrent work and serialize this integration.

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

1. Backup appears under Save immediately before independently actionable Reset.
2. Export/copy preserve complete current progress; clipboard success and manual
   fallback work. Invalid/future-schema codes do not alter either save.
3. Valid Restore requests do not replace progress. Cancel/Back/Escape/Close
   clear pending intent; only explicit confirmation replaces the reviewed save.
   Primary-write failure rolls recovery back; restored values survive reload.
4. Old backup starts from now without duplicate offline time. Reset retains
   its own request/cancel/confirm behavior. Current engine/save contracts pass.
5. 320/390/430px × normal/200% text × normal/reduced motion: labels fit,
   controls are at least 44px, focus/order/trap work and text contrast ≥4.5:1.
6. Required CI and affected checks pass on integrated main. Publish the APK;
   verify exact packaged assets, `com.lumenfall.app`, version and established
   signing. Preserve WebView60, deterministic purchases and Motes rewards.
7. Save supported status/evidence in GitHub. Required Android/device acceptance
   must pass before completion/archiving; blocked acceptance keeps this chat open.

## Checks, limitations and next action

[Current evidence](../qa/save-backup-ui-001/2026-10-08/README.md) records commands,
versions, source hashes and outcomes. Historical 7 October passes are not
current-main acceptance. Browser tests control time/intervals only in the test
page and explicitly stub clipboard/storage-failure branches; normal engine and
lifecycle behavior is covered by the unchanged existing suite.

Current source, tooling, task context (31,329 bytes), ES2017 grammar and all 12
focused UI profiles PASS; six core backup functions match current main exactly.
The complete current default suite is running. No current feature
PR, integration, APK or physical acceptance is claimed yet. This environment
has no Android SDK/emulator, `/dev/kvm` or USB passthrough at preflight; required
physical WebView60/TalkBack observations cannot be invented. Complete available
source/APK/runtime checks, record the precise remaining device checklist, and
keep acceptance open if no device is available.

Next: finish current-baseline checks, publish the feature branch/PR, merge after
required CI and review, verify integrated bytes, publish/verify the signed APK,
then save task/PROJECT_STATE receipts. Archive only after all required acceptance.
