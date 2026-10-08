# LAB_UI_001 — compact Lab cards and Speed up panel

Status: focused candidate checks pass; corrected CI run/integration/APK pending.
Published PR: [83](https://github.com/karahaNx/Lumenfall/pull/83).
Owner: this LAB_UI_001 feature chat. Exact chat ID/model variant/effort are not
exposed; GPT-6.1 Sol / High was the user's recommendation, not a runtime receipt.
Latest instruction, 8 October 2026: “Finish the feature task push to github
implement to game”. Necessary publication, integration and app delivery are
authorized by that request and current [project rules](../../AGENTS.md).

## Goal and original requirements

One goal, F08–F11: merge remaining time and actual speed into the progress bar;
one title and current level; show the effect before starting; one Speed up
button opens a closable accessible panel with tier, price and queue controls.

The [original user requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
take precedence. Relevant phrases: “skriv tiden indeni selve progress baren”,
“kun det lvl man er igang med”, no repeated “guardians mastery igen med pil
ned”, “der skal stå hvad lab gør, før man starter den”, and “Speed up skal
have en knap … hvor man også kan vælge at queue speed up”.
Sources read: F08–F12 and dependency/save sections in
[revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Image 3 was inspected during preparation; its APK/save identity is unknown.

## Baseline and dependencies

Fresh isolated checkout: `/workspace/Lumenfall-LAB_UI_001-current`, branch
`feature/LAB_UI_001`; baseline `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
Baseline index SHA256: `5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c`.
Original `/workspace/Lumenfall` and private B2 proposal remain untouched.
Root AGENTS/bootstrap/state/workflow, context index and Visuals guidance read.
Current rules supersede historical writer gates; no separate writer grant.

PR46 is merged (`20aaae62a4b6e46f8d75775085918eaba4e8de29`); accepted B2
arithmetic is integrated by PR57. LAB_SPEED_QUEUE_001/F12 is already implemented
and verified on main. This task reuses its handlers and saved fields.
Open PR67 overlaps Lab presentation as part of a broader draft bundle; it is
not the baseline or an accepted gameplay replacement. Keep this scoped change
separate and serialize integration against fresh main. No messages/subagents.

Private B2 candidate b46e06a is historical preparation, not current acceptance;
its Python harness was not restored. Current game features/assets are preserved.
Main subsequently integrated PR77 Save Backup UI at
`261b1b7f863f73c324f4ac04acb5bfc95101644d`; merged into this branch,
with Settings controls and its additional negative CI gates preserved.
Current main e2f745c Formation/Resonate changes are merged; renewed Lab checks
pass on source352c0b0 (full hashes/receipts in QA begin/). A reproduced Begin Study
focus loss is fixed; real Enter now retains same-Study visible focus, panel closed.

## Scope and decisions

- Presentation only in index.html: earned/completion effects, readable bar,
  ARIA and disclosure focus. No simulator, payment, tier/cost/reward, save-schema,
  unlock/cap, package/signing or native-source change; no migration is needed.
- Active cards show one title and one current level. Idle cards show next
  level/effect/cost/time. Earned and completion effects are distinct; saved
  overcap purchases remain preserved and capped effects remain accurate.
- An opaque text surface keeps bar contrast independent of fill. Progressbar
  name/range/value and time/speed update together, including pending completion.
- Inline disclosure, aria-expanded/controls and named region, one open panel.
  Opening retains opener focus; Tab enters available controls. Close/Escape
  return focus; native select owns Escape. Purchase/completion restores opener
  when a focused tier disappears or becomes disabled. Rendering preserves focus.
- “Queue speed up” and “Queued speed” label existing studyUseMotes and
  studySpeedTargets. Study Queue stays separate. Each new level starts 1x;
  full exact tier price is paid when affordable, including offline. OFF retains
  paid speed. No cheaper fallback, free carry or second economy path.
- No new binding rule or guessed gameplay number. Tests use Node.js and current
  JS harness. Self-review and automated checks are not independent review.

## Acceptance and checks

1. Readable time/speed at 0/50/99.999/100%, long durations and reduced motion;
   meaningful progress ARIA. One visible title/level and clear earned/next effect.
2. Closed panels have no accessible/focusable controls. Named panel, selected
   speed, prices, queue controls, 44px targets and correct keyboard/touch focus.
3. Mobile 320/390/430px, 100/200% text, contrast and reduced motion pass.
4. Open/close/render never mutate gameplay/save. Existing handler, chronology,
   competition, live/offline, reload/backup/recovery/Ascend contracts pass.
5. Required CI and focused checks pass on integrated source. Build/publish APK;
   verify com.lumenfall.app, version, established signer and source assets.
   Record actual Android/WebView60/device acceptance and limitations honestly.

Baseline source, tooling and native Lab checks PASS (Chromium151, Node24).
Candidate: 19 regressions and 12 mobile/text/motion profiles PASS. Source,
tooling, task context, ES2017 and unchanged-authority byte comparison PASS.
11 additional layout/accessibility/navigation checks and actual V8 6.0 product
parsing/presentation/offline probes PASS. Android27/WebView61 emulator booted;
signed143 baseline/save prepared. This is preparation, not feature acceptance.
Local full-suite attempt hit Chromium151 dump-dom timeout; required GitHub CI
must pass independently. Results: [QA checkpoint](../qa/LAB_UI_001/README.md).
Automated review caught premature 100% ARIA while work remained; fixed and
verified with an old-rounding mutation that fails the relevant assertion.
CI 37737685149 ran all 152 scenarios: four Rift scroll tests selected the hidden
panel Close button. Their selectors now use visible controls; all four real-touch
scroll/hit-test checks pass locally. Full CI is rerun with every gate retained.

## Next action

Pass corrected required CI on PR83 and integrate against current main. Verify
integrated behavior and the
automatic signed APK release; save results and update PROJECT_STATE. Required
device acceptance must be recorded before completion/archival. Chat stays open
while any required acceptance is blocked or unknown.
