# RIFT_GUIDANCE_001 — Stable Rift Guidance / F07

Status: integrated; final CI/native acceptance and delivery receipts pending.
Owner: this Stable Rift Guidance chat. Private checkout
`/workspace/Lumenfall-rift-guidance-001`; shared checkout untouched.

## Goal and sources

Guidance below currencies with Show hints/Hide hints. Currencies, combat, Boss
HP and Guardian Tap keep their bounds through toggle, long hints and large text;
hidden hints cannot take focus or screen-reader access.

> På rift skærmen, når man fjerner rift guideline så rykker hele billedet sig, det skal være fast. Du kan sætte rift guidance boksen lige under currencies og have det som notifikation, hvor man kan vælge show hints hide hints.

[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F07/dependencies/save](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Originals prevail; none of their images shows Rift.
8 October: “Finish the feature task push to github, implement to game” authorizes
scoped publication/integration/release under the current feature workflow.

## Baseline, scope and decisions

7 October freeze7c5ecf6 on0bcce84; [historical task](../qa/rift-guidance-001/2026-10-08/previous-task-2026-10-07.md).
8 October baselineb0537cb; PR46/B2, F13 Cast removal and F27 cosmetics integrated.
Merged newer Save Backup, Formation autosave, Resonate, Auto-Ascend, upgrade
identity, Forge memory and12h offline/refund changes without replacing them.
[PR81](https://github.com/karahaNx/Lumenfall/pull/81), head db6ba6241ccf3d7ec74bd2a1b677c19f387514d6,
merged as015e2e667afac1b4d3cf0bfebf535add3600ab01. Source SHA256
852f32974f52d757406ac8a54b668969a2e0667e7acdd85192d63dbdc31ad262.

Fixed46px slot, persistent44px native toggle; full wrapped title/detail in a
bounded44px scrolling region. Keep preference key/Settings sync and return focus
to the toggle when hiding focused content. No F07 balance/save migration, purchase,
chronology, bulk/queue, reward/Mote, package or signing changes. Preserve WebView60.
Product: index.html; tests: rift-guidance.cjs, rift-status.js/cjs, run.cjs and
scenarios.json. Other changes are this task's documents/evidence/APK.
No new rules, subagents/messages or other-chat changes.

## Acceptance and evidence

Required:320/360/390/430px,100/200% text, normal/long hints, both motion settings,
Fresh/dense/Boss/conditional Boss/Farm; >=44px controls, contrast, focus/AX,
scroll/reload/Settings/state purity; six themes, F27 cosmetics/Trial, existing
Rift/navigation, required CI, signed APK and native update/layout acceptance.

Integrated local matrix/contract/V8/source/tooling PASS; detailed counts and exact
bytes in [delivery](../qa/rift-guidance-001/2026-10-08/delivery/README.md).
PR81 CI37744052638 PASS:169 defaults/17 negative gates/smoke; it predates F25/F26.
Final documentation PR must check the integrated game with all current gates.
Automated review P1 fixed: exact nav-spirits stop plus prevented-Tab negative;
thread resolved. No independent review claim or weakened acceptance.

Build37746908017 produced signed0.1.151 from015e2e6. Package/certificate,
526 ZIP CRCs and15 exact-source assets PASS. Actual143→151 signed Android update
preserved125952 WebView-storage bytes; initial ownership/Wisp levels/old preference
PASS. Full native acceptance pending after preserved SystemUI/reload-race evidence.
Native API27/WebView61 software emulator plus V8 6.0; no physical/TalkBack/FPS claim.
Baseline-matched local Save reload timeout is documented; remote gate remains required.

Next: complete native checks, save immutable APK/final receipts, pass and merge
documentation CI, stop this task's shared-file work, then archive only this owner.
Required acceptance failures keep the task open.
