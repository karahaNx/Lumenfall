# LAB_UI_001 — compact Lab cards and Speed up panel

Status: candidate on current main; required CI/integration/APK pending.
[PR83](https://github.com/karahaNx/Lumenfall/pull/83). Owner: this feature chat;
actual chat ID/model/effort not exposed. GPT-6.1 Sol/High was a recommendation.
The 8 October request “Finish the feature task push to github implement to game”
authorizes implementation, integration and app delivery under current AGENTS.
No new rule, subagents or message tools. Current rules supersede historical gates.

## Original goal and sources

One goal, F08–F11: remaining time and actual speed in the progress bar; one title
and current level; effects before starting; one Speed up button opens a closable,
named panel with tier/price and queue controls, retaining readability/ARIA/focus.
Original phrases: “skriv tiden indeni selve progress baren”, “kun det lvl man er
igang med”, no repeated title, “der skal stå hvad lab gør, før man starter den”,
and “Speed up skal have en knap … hvor man også kan vælge at queue speed up”.

Read original [requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
F08–F12/dependency/save sections of [revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original takes precedence. Image3 inspected; its APK/save identity unknown.
AGENTS/bootstrap/ownership/Visuals/state/workflow/context read from live main.

## Baseline, scope and dependencies

Private `/workspace/Lumenfall-LAB_UI_001-current`, `feature/LAB_UI_001`;
initial baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Original checkout and
private B2 proposal untouched. Main31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6
includes Save Backup, Formation, Resonate, Auto-Ascend and Upgrade Identity.
Preserve them through merge/conflict resolution. PR46/B2 is integrated by PR57
(20aaae6); LAB_SPEED_QUEUE_001/F12 is implemented. Reuse authoritative handlers.
PR67 is a separate overlapping draft, not an accepted baseline.

Product changes only in index.html Lab presentation/focus; necessary JS
regressions and QA/docs. No authority/payment/cost/reward/save-schema/native/
package/signing changes relative to current main. No migration added. Preserve
its exclusive upgrade owners, all raw purchased contributions, paid legacy work/
speed/completion and idempotent save/recovery. Inquiry text reflects five current
Studies. Retired rows are read-only preserved bonuses; no starts reintroduced.

## Decisions and acceptance

Active cards: one title/current level, earned and completion effects. Idle:
next level/effect/cost/time. Opaque bar text maintains contrast at every fill;
positive work never announces100%, zero-work pending completion shows Finishing
and actual speed. Overcap purchases remain preserved with capped effects.
One inline named panel, aria-expanded/controls and hidden controls absent from
accessible traversal. Begin/open/render/buy/finish/Close retain useful focus;
Close/Escape return to opener and native select owns Escape. Disclosure is
unsaved ephemeral UI and never purchases or advances work.
Queue speed up/Queued speed label existing saved fields; Study Queue remains
independent. New levels start1x, paying the full selected price when affordable,
including offline. OFF keeps paid speed; no fallback/free carry or new economy.

Accept: readable bars/ARIA/one title/level/pre-start effects; named panel/selected
speed/prices; >=44px targets; 320/390/430px,100/200% text, keyboard/touch/focus,
contrast/reduced-motion; relevant handler/bulk/queue/chronology/live/offline/save/
recovery; required CI and integrated checks; published APK identity/assets and
native update. Record physical/WebView60/TalkBack observations/limits honestly.

## Checks and next action

[QA checkpoint](../qa/LAB_UI_001/README.md) binds historical and renewed receipts.
Earlier12 profiles/19 regressions/V8 6.0/source/tooling pass. Automated review's
premature100% ARIA, stale evidence hash and Begin focus findings corrected. Old
rounding is rejected; Begin focus fails on old source and passes real Enter on
all12 profiles. Four old Rift scroll selectors included hidden Close controls;
visible selectors preserve real-touch viewport/hit assertions and all four pass.
No independent human review claimed. Source authority/ES2017 checks pass after
current-main merge; renew affected checks and all168 default/17 negative CI gates.
Android27/WebView61 emulator has attested signed143 save prepared: level2/paid3x,
work/queue choices. This is preparation, not feature APK acceptance.

Next: finish current-main candidate checks, publish, pass full CI and integrate
PR83. Verify integrated behavior, signed APK/package/version/signer/assets and
native update/save/focus. Save delivery receipts/status in GitHub through protected
main's PR workflow. Missing required device acceptance stays open; archive only
this owner chat after verified completion under FEATURE_WORKFLOW.

Retired completion focus regression reproduced and fixed: focus moves to the
preserved card and survives rendering. Renewed12 profiles/19 regressions/V8 pass
on source2de645b; public pinned Acorn makes source proof reproducible without
Node internals. Receipts in QA retired/; all original gates retained.
