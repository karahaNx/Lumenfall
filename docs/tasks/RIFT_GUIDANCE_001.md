# RIFT_GUIDANCE_001 — Stable Rift Guidance / F07

Status: acceptance receipt; complete on main after PR98 merges with required CI PASS.
Owner: this Stable Rift Guidance chat; private /workspace/Lumenfall-rift-guidance-001.
Branches: feature/rift-guidance-001 and docs/rift-guidance-001-delivery.
Shared checkout remains untouched.

## Goal and originals

Guidance directly below currencies with Show hints/Hide hints. Currencies,
combat, Boss HP and Guardian Tap keep their bounds through toggle, long hints
and large text. Hidden hints cannot take focus or screen-reader access.

> På rift skærmen, når man fjerner rift guideline så rykker hele billedet sig, det skal være fast. Du kan sætte rift guidance boksen lige under currencies og have det som notifikation, hvor man kan vælge show hints hide hints.

[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F07/dependencies/save](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
Decision/evidence paths are in the receipt. Originals prevail. The 8 October instruction “Finish the feature task push to
github, implement to game” authorizes scoped integration/release.

## Baseline, scope and decisions

7 October freeze7c5ecf6 on0bcce84; [historical task](../qa/rift-guidance-001/2026-10-08/previous-task-2026-10-07.md).
8 October refreshb0537cb; PR46/B2, F13 Cast removal and F27 integrated.
[PR81](https://github.com/karahaNx/Lumenfall/pull/81), head db6ba6241ccf3d7ec74bd2a1b677c19f387514d6,
merged as015e2e667afac1b4d3cf0bfebf535add3600ab01. Later main product changes are preserved; F13/F27/F24 interaction is checked.
Other feature goals remain separate.

Fixed46px slot with persistent44px native toggle; wrapped full title/detail
scrolls inside44px. Keep preference key/Settings sync, return focus on hiding
focused content; hidden hints leave focus/AX. Preserve gameplay/save/value/rewards,
chronology, bulk/queue, package and signing; no F07 migration.
WebView60 stays supported. No new rules, subagents/messages or other-chat changes.
Product: index.html; tests/behavioral guidance/status/runner/scenarios. Other
edits are this task's evidence, status and archived APK.

## Acceptance and receipts

Required:320/360/390/430px,100/200% text, normal/long hints, both motion settings;
Fresh/dense/Boss/conditional Boss/Farm; >=44px controls, contrast, focus/AX,
scroll/reload/Settings/state purity, themes/F27 cosmetics/Trial, existing contracts,
required CI, signed APK and native update/layout acceptance.

[Final receipt](../qa/rift-guidance-001/2026-10-08/delivery/README.md): full identities,
commands, failures, later source checks and limits.
Matrix160/0px, themes/Comet/Trial, touch/focus, contrast, Rift/navigation and
V8 6.0 PASS; exact counts in receipt.
CI37752425389 accepts Tree45ae4c62:176 defaults/17 negative gates/smoke.
Final PR98 CI also requires the new cosmetics gate on06b28d5/c1e23bb5.
Review P1 fixed with exact nav-spirits stop and prevented-Tab negative; resolved.

Signed0.1.151/build37746908017 from015e2e6: package/certificate,526 ZIP CRCs,
15 exact assets and actual143→151 storage/ownership/preference preservation PASS.
Native Android8.1/WebView61 geometry/touch/focus/AX, Tab/reload and OS200% font
PASS; no runtime errors.
Emulator stopped, font restored, data retained. No physical/TalkBack/FPS or
independent human review claim; no native acceptance of a newer APK is inferred.

Next: merge PR98 after final required CI, stop shared-file work and archive only
this owner. App calls timed out; confirm archive response or report manual archival.
Missing required acceptance keeps the task open.
