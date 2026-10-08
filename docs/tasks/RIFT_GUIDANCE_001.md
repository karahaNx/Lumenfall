# RIFT_GUIDANCE_001 — Stable Rift Guidance / F07

Status: acceptance passed; complete after PR98 merges with required CI PASS.
Owner: this feature chat. Private /workspace/Lumenfall-rift-guidance-001;
feature/rift-guidance-001 and docs/rift-guidance-001-delivery. Shared checkout untouched.

## Goal, sources and baseline

Guidance below currencies with Show hints/Hide hints. Currency/combat/Boss HP/Tap
bounds stay fixed through toggle, long hints and large text. Hidden hints exclude focus/AX.
Original: “når man fjerner rift guideline så rykker hele billedet sig, det skal være fast.”
[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F07/dependencies/save](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
Originals prevail; receipt links Lead/findings/index.

Freeze7c5ecf6/main0bcce84; refreshb0537cb verified PR46/B2 and F13/F27.
[PR81](https://github.com/karahaNx/Lumenfall/pull/81) head db6ba6241ccf3d7ec74bd2a1b677c19f387514d6
merged as015e2e667afac1b4d3cf0bfebf535add3600ab01. Later main is preserved;
Tree/F24/Lab combinations checked. Finish instruction authorizes delivery.

## Scope and decisions

Fixed46px slot/44px toggle; full wrapped hint scrolls inside44px. Existing preference/
Settings sync; hiding focused hints returns focus to toggle. index.html and guidance/
status/runner/scenario tests; this task's evidence/status/APK. Other goals remain separate.
Preserve WebView60, package/signing, gameplay/save/value/Mote rewards, chronology,
bulk/queue; no F07 migration. No subagents/messages or other-chat changes.

## Acceptance and next action

Required320/360/390/430px,100/200% text, both motion settings, long hints and
Fresh/dense/Boss/conditional Boss/Farm. >=44px controls, contrast, focus/AX,
touch/reload/Settings/state purity; themes/F27/Trials, contracts, CI, signed native update.
[Final receipt](../qa/rift-guidance-001/2026-10-08/delivery/README.md) records exact
versions, commands, failures and limits. UI160/0px, contracts/V8 PASS; review P1 fixed.
Signed151/015e2e6 identity/526 CRCs/15 assets and actual143→151 storage/ownership PASS.
Android8.1/WebView61 touch/layout/Tab/reload/OS200% font PASS; no runtime errors.
No physical/TalkBack/FPS/human-review or newer-APK claim.

CI37752425389 passed176 defaults/17 negatives/smoke on Tree source. Final PR98
requires current cosmetics/default/negative/smoke gates before merge; no weakened gates.
Emulator stopped/font restored/data retained. After merge archive only this owner;
confirm app response or report manual archival. Missing required acceptance keeps this open.
