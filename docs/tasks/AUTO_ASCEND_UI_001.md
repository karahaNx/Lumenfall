# AUTO_ASCEND_UI_001 — Auto-Ascend controls on Ascend

Status: **candidate verified; integration and APK/device acceptance pending**.
Owner: this feature chat, AUTO_ASCEND_UI_001. No independent review claimed.

## Goal and original requirements

Keep the deterministic Auto-Ascend unlock in Deeds. Move operative controls to
Ascend: one Rift dropdown and a clearly separate ON/OFF. Remove Earlier/Later/
Find; preserve every valid target, including Rift219+. Target choice must never
toggle automation. Preserve the cleared-Rift trigger and persistence.

Original F01/F02/F03:
> Auto ascend skal bare have mulighed ligesom billede 2, ikk som det første billede. Hvor der er earlier later find. On off skal være meget tydeligere.
> Auto ascension bliver unlocket igennem deeds, men skal være på selve ascend skærmen så man vælger at slå fra og til derinde og præcis hvilken rift man vil ascend på.

[Full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[revision/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt),
[image2](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/IMAGES/02-17354.jpg).
Original/current order takes precedence over suggestions. Image2 save/APK unknown.

## Authorization, baseline and overlap

8 October correction: **“Finish the feature task push to github implement to game.”**
This authorizes publication, integration and necessary app delivery for this feature.
Live AGENTS/bootstrap/workflow use one owner per feature without a separate writer
grant. Historical handover stops are superseded by current rules and this order.
No subagents/message tools are used.

Remote baseline: b0537cb46635555ba2c2e5f3f95bc8fc276aeda5.
Current combination includes maine2f745c (PR76 Formation autosave, PR77/87
Save Backup UI/receipt and PR80 Resonate clarity). Their product changes and all
existing CI cases are preserved. Source SHA256
2398a7506358f9c2ee1d4390314032d878f2e0a8e866f62ba03c0280ee7e3bc0.
PR84 CI37737148141 passed on prior source61515269 (153 default scenarios and14
required negatives). Main advanced afterward; merge conflicts in status/default
scenario registration retain both features. Renew CI and focused checks before
integration. Earlier evidence applies only to its labeled source.
Real Git worktree: /workspace/AUTO_ASCEND_UI_001-github;
branch feature/auto-ascend-ui-001. Network-enabled Git restored access.
Earlier local45a5f02/0bcce84 is historical; existing game features are preserved.
PR46 is merged; B2 integrated through PR57. Its historical stress/device limits
are separate from this UI task. Open PR66/67/70 overlap index.html; none is
incorporated or accepted here. Recheck main before serialized integration.

ASCEND_PRISMS_001: one hook and focused-scroll preservation in renderAscendSummary and an independent
container before the Tree. Prism calculation/preview/payout stays unchanged.
Reassess combined renderer diffs when the other feature integrates.

## Scope and decisions

Product change: index.html Auto-Ascend UI/target handler only. Necessary bridge,
target/native-input oracles, accessibility location and scoped runner are updated.
Backup/restore is added to the default suite.

- Deeds retains Auto-Ascend100, ownership/default and Open Ascend shortcut;
  existing Comet Trials controls/focus/purchase handlers remain intact.
- Ascend has one stable labeled card; standalone ON/OFF uses text, aria-pressed,
  visible focus, contrast and48px controls.
- Up to1,000 targets: every consecutive Rift in one native select. Larger histories:
  one numeric datalist dropdown accepting any valid target in the same field,
  with at most200 suggestions plus saved target. Presentation budget, no gameplay
  cap. Huge legacy saved targets remain visible/preserved until valid replacement.
- Typing is a draft; change/Enter commits a validated integer. Invalid/repeated
  input cannot save. Target choice saves only preference/normal metadata and never
  calls Ascend or changes ON/OFF. Focused picker replacement is deferred.
- Schema1 remains: stored thresholdN means cleared RiftN−1. No migration/reset or
  ownership/value loss.22 gameplay/save functions remain
  [byte-identical](../qa/auto-ascend-ui-001/protected-functions.json) to current main.
  Prices/rewards/bulk/queue/chronology/live/offline, com.lumenfall.app and signing
  remain unchanged. WebView60 compatibility is retained as an acceptance contract.
  New tooling is JavaScript. No new binding rule or gameplay number.

## Acceptance and evidence

[Evidence/commands](../qa/auto-ascend-ui-001/README.md) records exact versions,
raw results, transport limits and subsequent CI/build receipts.

1. Deeds unlock; one Ascend dropdown and separate ON/OFF: local PASS.
2. No Earlier/Later/Find;219 and safe-integer/high legacy targets: local PASS.
3. Target choice preserves ON/OFF/currencies/progress; observer render focus/scroll,
   single-save handlers and Comet Trials interaction: local PASS.
4. Cleared Push trigger only; Farm/unbeaten/zero-time guards; manual/auto Ascend,
   save/recovery/restart/backup/lifecycle/chronology/parity: local PASS.
5.320/360/390/430px,160%/200% text,44px minimum, contrast/focus/reduced-motion:
   20 normal/reduced-motion profiles PASS. Native Android picker,
   large-font/TalkBack and exact WebView60 acceptance remain required.
6. Required CI on integrated source, signed APK identity/assets and final saved
   status/device evidence: PENDING. Owner chat remains open.

Node24.19.0 / Chromium151.0.7922.173:23 positive scoped scenarios PASS; five causal
negatives caught with valid failure payloads. Source/tooling PASS. Offline core PASS;54 V8 6.0 handler assertions PASS. Local dump-dom hangs; the supplied CDP adapter executes
original assertions without proving default virtual-time/CI equivalence.
Required GitHub CI must pass unchanged.

## Next action

Push the maine2f745c combination, renew CI/focused checks, recheck main and integrate. Renew
checks on integrated bytes; observe signed APK publication and verify identity/
assets. Complete available native checks and save supported status here and in
PROJECT_STATE. Missing required device acceptance stays OPEN. Stop this feature's
shared-file work and archive only this owner after all
[completion criteria](../project/FEATURE_WORKFLOW.md) are met.
