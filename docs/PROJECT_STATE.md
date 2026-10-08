# Lumenfall — current project status

Updated 8 October 2026 for [BOND_TEXT_001](tasks/BOND_TEXT_001.md),
preserving the integrated [feature-chat workflow](tasks/FEATURE_CHAT_WORKFLOW_001.md).
Repository: `karahaNx/Lumenfall`. Verify relevant live state before acting;
commits below are observed checkpoints, not a promise that main never advances.

## Product and release evidence

[BOND_TEXT_001 / F16](tasks/BOND_TEXT_001.md) is integrated via
[PR61](https://github.com/karahaNx/Lumenfall/pull/61) at210005d0ae093d21e846bae41a9bddf25af2800d:
full partner names appear in both Formation Bonds views; ability text retains
its effects without partnership instructions. Bond IDs/effects/simulation and
save/purchase rules are unchanged. Final CI37710741132 PASS148 scenarios/12
negatives/guarded startup; fresh integrated checks PASS.

Verified signed APK **0.1.141**, build37712548224, package com.lumenfall.app,
established certificate/v1/v2; SHA256
`0b278ffce3819a40b98c44b738b79123ec2d7fb273a3820bc13ed71940214d44`.
526 ZIP CRC entries/all15 assets match integration. Actual APK V8 6.0 syntax/helper,
signed138→141 storage preservation, first-launch purchased tiers and installed
Android8.1/API27/WebView69 Bond/ability DOM checks PASS. The initial native capture
has a System UI ANR overlay; the subsequent unobstructed capture is preserved.
No native performance or physical acceptance is inferred. Required affected-phone/
exact WebView60/TalkBack acceptance remains OPEN; owner chat stays open.
[Android evidence](qa/BOND_TEXT_001/android/README.md) and
[immutable141 APK](../archive/android/bond-text-001/README.md). Later releases
may supersede this observed artifact; check live identity for new delivery.

[FEATURE-BRANCH-INTEGRATION-001](tasks/FEATURE_BRANCH_INTEGRATION_001.md) integrates
repeat paid Lab Study speeds and the exact Number/DataView B2 farm correction
with current offline catch-up. PR57 merged at 20aaae62a4b6e46f8d75775085918eaba4e8de29;
full tree equals validated candidate b62476dc461f00d2a7ea756f700f755bd763326e.
PR46 is now merged too. Fresh CI37692669340 PASS 146 default scenarios,
12 required negative controls, source/tooling checks and guarded startup.

Earlier verified signed APK **0.1.138**, build 37694671685, package com.lumenfall.app,
established signing certificate; APK SHA256
`81b9be7edea971335a06f06d1894d91e75a92736738cc935fc2a920a26a02e1e`.
Downloaded release digest/526 ZIP CRC entries/all 15 bundled assets match the
validated integration. No native/device acceptance of 138 is claimed. Required
physical affected-phone/exact WebView60/TalkBack acceptance and independent
review remain OPEN. [138 receipt and raw evidence](qa/feature-branch-integration/README.md).

Inventory: 57 original branches, 50 already-merged PR receipts and one distinct
unfinished gameplay implementation (Lab), now integrated. Recheck 58 adds only
our integration branch. The repository does not supply 27 distinct new unmerged
feature implementations; historical diagnostics/archives are not invented features.

Earlier offline release evidence below belongs to its recorded source/APK versions:

[OFFLINE-CATCHUP-001](tasks/OFFLINE_CATCHUP_001.md) implementation and active Node
tooling are integrated via PR51/54/55/56. Final correction PR56 is merged at
1ffdc5e3af37754bf0541207caab3a6bb4537e51; entire tree equals validated head187e09f1a44e7baf3e5af83d2f7c480d2a265628.
CI37663184859 passes133 scenarios/12 required negatives/guarded startup.

Previous verified signed APK **0.1.137**, build37665516076, package com.lumenfall.app,
established certificate/v1/v2; APK SHA256
`44f0bc792ad3510f006019fba6182b5551f17c8e18d9e2fc8f6816da474148f5`.
CRC/all 15 assets match source. Actual extracted V8 6.0 Clear21/Clear20/OFF8h,
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
| [BOND_TEXT_001 / F16](tasks/BOND_TEXT_001.md) | PR61 integrated; CI148/12 and fresh integrated checks PASS. Signed0.1.141 identity/assets, V8 6.0 helper, native WebView69 presentation and signed update/save-value checks PASS. | Complete [physical affected-phone/WebView60/TalkBack acceptance](qa/BOND_TEXT_001/android/DEVICE_ACCEPTANCE.txt) and save observations in GitHub. Keep owner chat open. |
| [LAB_EXCLUSIVE_001](tasks/LAB_EXCLUSIVE_001.md) / F29 | [PR62 proposal checkpoint](https://github.com/karahaNx/Lumenfall/pull/62): 9 Labs inventoried, 7 duplicate rows in 6 effect families; exclusive study-work/reservation effects and value-preserving transition proposed. Actual CI/merge/integrated checks are saved in the PR body. No game behavior changed. | Obtain the agreed UPGRADE_IDENTITY_001 Lab effects/currencies/prices/work/unlocks/caps and migration policy. Full feature and chat remain open; proposed values/mechanics are not approved rules. |
| WISP_UPGRADE_DISPLAY_001 / F04 | [Feature candidate](tasks/WISP_UPGRADE_DISPLAY_001.md) verified against main214d454: unfinished upgrades stay open; folding requires Mythic, authoritative Module cap and owned Ultimate. 12 mobile profiles/12,912 assertions and the normal focused harness PASS. | Publish/pass required CI, integrate, verify integrated bytes and signed APK/device acceptance. Feature remains open. |
| FEATURE-CHAT-WORKFLOW-001 | Current docs/context-tooling cleanup; see task for publication/integration receipt. | Verify document/tooling checks and GitHub integration; no game build. |
| OFFLINE-CATCHUP-001 | PR51/54/55/56 integrated; signed137 verified, available source/engine/emulator checks PASS. Required physical acceptance OPEN. | Run remaining affected-phone/exact WebView60/TalkBack checklist and save results in GitHub. Keep feature/chat open. |
| FEATURE-BRANCH-INTEGRATION-001 / LAB-MOTES | PR57/46 merged; full 146 CI and signed 0.1.138 asset/signing verification PASS. Required device acceptance OPEN. | Complete affected-phone/exact WebView60/TalkBack acceptance and any required independent review. Keep task/chat open. |
| [LAB_SPEED_QUEUE_001 / F12](tasks/LAB_SPEED_QUEUE_001.md) | PR46/B2 product integrated via PR57. Payment/chronology/offline retry/save/recovery/Ascend/competition and mobile checks renewed PASS on main0e9b54c (PR60/59). Signed APK140 identity/assets and V8 Lab payment/retry PASS. No additional F12 product gap found. | Delivery tracked in PR65; complete [F12 affected-phone/WebView60/TalkBack acceptance](qa/lab-speed-queue-001/DEVICE_ACCEPTANCE.txt). Required physical acceptance OPEN; keep owner chat open. |
| B2 arithmetic integration | Number/DataView functions from archived tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef` were restored separately, matched exactly and integrated through PR57 with new regression/CI coverage. | Archived stress/physical/review limitations remain distinct from current full 146 CI. |
| FEEDBACK-REVISION-001 | 29 original points and four images preserved; not collectively implemented. | Follow dependencies in a separately assigned task. Saved next priorities: F20/F21 Echoing Rest cap 6 / Cheaper Bonds cap 20, purchase gates and old-save policy. |
| FORGE_EXCLUSIVE_001 | [Task/proposal](tasks/FORGE_EXCLUSIVE_001.md): 24 catalogue rows inventoried, four Forge duplicate families identified and three exclusive mechanic candidates proposed. Documentation checkpoint published in [PR64](https://github.com/karahaNx/Lumenfall/pull/64), whose receipt records CI/integration; gameplay not implemented. | Obtain agreed UPGRADE_IDENTITY_001 Forge rows, including prices/caps/stacking and old-purchase value policy, before implementation. Keep feature/chat open. |

B2 original sources/evidence: `handoffs/02_08/2026-10-07/`, index SHA256
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Earlier B2 tree `4c07cd5d66cb5928eb99623ff86efaa81e268829` was blocked on
BigInt/WebView60. Historical B2 diagnostics contain 379 strict failures in
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
