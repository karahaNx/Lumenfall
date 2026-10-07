# Lumenfall — current project status

Updated 7 October 2026 for [OFFLINE-CATCHUP-001](tasks/OFFLINE_CATCHUP_001.md),
preserving the integrated [feature-chat workflow](tasks/FEATURE_CHAT_WORKFLOW_001.md).
Repository: `karahaNx/Lumenfall`. Verify relevant live state before acting;
commits below are observed checkpoints, not a promise that main never advances.

## Product and release evidence

[OFFLINE-CATCHUP-001](tasks/OFFLINE_CATCHUP_001.md) implementation and active Node
tooling are integrated via PR51/54/55/56. Final correction PR56 is merged at
1ffdc5e3af37754bf0541207caab3a6bb4537e51; entire tree equals validated head187e09f1a44e7baf3e5af83d2f7c480d2a265628.
CI37663184859 passes133 scenarios/12 required negatives/guarded startup.

Current verified signed APK **0.1.137**, build37665516076, packagecom.lumenfall.app,
established certificate/v1/v2; APK SHA256
`44f0bc792ad3510f006019fba6182b5551f17c8e18d9e2fc8f6816da474148f5`.
CRC/all15 assets match source. Actual extracted V8 6.0 Clear21/Clear20/OFF8h,
72h cap/96h Study PASS. Actual signed136→137 emulator update preserves WebView
save storage byte-for-byte. Signed137 native600s return/paint/Continue, repeated
return/live play, background/force-stop retry, primary failure/recovery/backup and
advancing processing time PASS on Android8.1/API27/WebView61. Signed136 separately
supplies full native8h302400/14400;137 game JavaScript is identical. Historical
134 DOM startup,135 positioning and136 paint failures remain preserved.

Required physical affected-phone/exact WebView60/TalkBack acceptance is still
OPEN under original point7. Available work is published; the feature/chat stays
open. Current release, immutable APK and precise controls/limits:
[137 receipt](qa/offline-catchup-001/android-137/README.md). PR52 saves current
status/evidence; its final CI/integration receipt belongs in its PR body.

Previously saved accepted APK: **0.1.133**, package `com.lumenfall.app`,
run `37363152517`, with receipt in
`decisions/2026-10-05-nav001-integration-release.txt`. This historical accepted
record is not evidence of the latest release; check live release/build identity
when doing app delivery. P0/P1, Forge/Lab, Formation, Measured Inquiry and NAV-001
were recorded as integrated.

## Active work and next actions

| Work | Evidence/status | Next action within its own task |
| --- | --- | --- |
| FEATURE-CHAT-WORKFLOW-001 | Current docs/context-tooling cleanup; see task for publication/integration receipt. | Verify document/tooling checks and GitHub integration; no game build. |
| OFFLINE-CATCHUP-001 | PR51/54/55/56 integrated; signed137 verified, available source/engine/emulator checks PASS. Required physical acceptance OPEN. | Run remaining affected-phone/exact WebView60/TalkBack checklist and save results in GitHub. Keep feature/chat open. |
| PR46 / LAB-MOTES | Last saved checkpoint: Draft R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`. Its CI does not accept newer candidate bytes. | Recheck live PR only when assigned this task. |
| New B2 runtime candidate | Archived tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, codecommit `013f526`; reported Number/DataView fix, 7 gates, 142 scenarios, 12 caught negatives. Required review of these bytes remains pending in the saved checkpoint. | Restore separately and verify relevant persistence/runtime/regression contracts. |
| FEEDBACK-REVISION-001 | 29 original points and four images preserved; not collectively implemented. | Follow dependencies in a separately assigned task. Saved next priorities after PR46: F20/F21 Echoing Rest cap 6 / Cheaper Bonds cap 20, purchase gates and old-save policy. |

B2 original sources/evidence: `handoffs/02_08/2026-10-07/`, index SHA256
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Earlier B2 tree `4c07cd5d66cb5928eb99623ff86efaa81e268829` was blocked on
BigInt/WebView60. Reported B2 diagnostics still contain 379 strict failures in
1,340 runs; no fully passing stress suite or physical Android/WebView60/TalkBack
acceptance is claimed. Intermittent clipping root cause remains unknown.
See `project/KNOWN_ISSUES.md` and `CONTEXT_INDEX.md` for targeted evidence.

## Current working model

One owner chat per feature/task, responsible for implementation, fixes, tests,
documentation and delivery. User instructions/standing authorization define
scope. Technical guides are optional; there is no default Lead, permanent role
chat hierarchy or global historical writer-release gate. Use isolated branches/
worktrees for concurrent work, protect other changes and coordinate actual file
overlap/main integration. Follow `project/FEATURE_WORKFLOW.md` for checkpoints,
completion and archiving; `project/ACCOUNT_RECOVERY.md` for a new account.

The [current decision](decisions/2026-10-07-feature-chat-workflow.md) supersedes
old role permissions in bootstrap, project instructions and older task mandates.
Historical chat IDs, freezes and release uncertainty remain evidence, not current
assignments. Preserve originals under recovery/handoffs/archive unchanged.
JavaScript is the active-tooling standard; see
`decisions/2026-10-07-javascript-first.md`. P2-04/native, P2-05/release-hardening
and A40 remain recorded as deferred/retired. Earlier status:
`project/PROJECT_STATE_2026-10-05_HISTORICAL.md`.
