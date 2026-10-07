# Lumenfall — current project status

Updated 7 October 2026 for [OFFLINE-CATCHUP-001](tasks/OFFLINE_CATCHUP_001.md),
preserving the integrated [feature-chat workflow](tasks/FEATURE_CHAT_WORKFLOW_001.md).
Repository: `karahaNx/Lumenfall`. Verify relevant live state before acting;
commits below are observed checkpoints, not a promise that main never advances.

## Product and release evidence

Observed main at this task's start: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`,
verified via remote Git refs. [PR51](https://github.com/karahaNx/Lumenfall/pull/51)
is merged at this commit: offline catch-up and active Node.js tooling are integrated.
Its earlier task/publication records describe the pre-merge checkpoint. PR51's
body records exact-head CI success in run `37625068008`; required physical
Android/WebView60/TalkBack acceptance remains pending in that receipt. This
cleanup does not establish a new release or device acceptance.

[PR52](https://github.com/karahaNx/Lumenfall/pull/52), observed open during this
cleanup, reports release **0.1.134**, build `37626819252`, established signing
and APK hash `09e53527d8a968801f6457297558efcb4ffcf5b260af47f202447e57455b6f6c`.
APK134 is historical evidence: actual Android8.1/WebView61 advanced-save startup
failed on replaceChildren. [PR54](https://github.com/karahaNx/Lumenfall/pull/54)
is now integrated at `458dbbc25f14c06149b4379ba6475ed16ad58a57`, fixing that path,
lost processing time and retry daily prompts, including clock corrections and
another-midnight edges. Exact-head CI37642617607 passes133 scenarios/12 negatives;
the entire integrated tree equals validated headbc33707.

Corrected signed APK **0.1.135**: build37645420468, actual APK SHA256
`9c0ef841d215176db60e2bb1b41ff69f98a78421dcd2188c00346acd9c469a8e`.
Official package/version/certificate/v1/v2 verification, ZIP CRC, all15 game
assets and actual extracted V8 6.0 execution pass. In-place134→135 emulator
installation preserves actual WebView save storage byte-for-byte. Actual135 native8h completes (+302400 kills/+14400 ascends), one primary
commit/matching recovery,3262 frames/no errors, but Continue is off-screen on
WebView61 due to unsupported CSS inset. PR55 fixes functional positioning with
unchanged product JavaScript and passes all133 scenarios/12 required negatives
in CI37654060758. It is integrated at891f4a4484197702848a3cd7b1cb51b1ff645c96;
the whole tree equals validated heada12459c. Android136/run37655590959 is queued.
Corrected APK/native UI verification and physical WebView60/TalkBack acceptance
remain open. Receipts: `qa/offline-catchup-001/native-release/README.md`,
`qa/offline-catchup-001/legacy-layout/README.md`.

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
| OFFLINE-CATCHUP-001 | PR51/54/55 integrated. Signed135 native transaction passes but legacy Continue fails;55 fixes geometry/input with full CI. Android136 queued; physical acceptance open. | Verify corrected signed APK/native UI/storage, integrate reconciled PR52 evidence and finish required physical WebView60/TalkBack acceptance. Keep feature/chat open while required checks remain. |
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
