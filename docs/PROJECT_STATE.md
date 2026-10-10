# Lumenfall — current project status

10 October: PR104 Lab and PR105 Forge passed required CI and merged into PR102
development at2d010493. [Tree expansion](tasks/TREE_EXPANSION_001.md) is now in
debugging. PR102 remains draft; main/APK hold persists. Earlier feature/release
checkpoints below remain historical, including [BOND_TEXT_001](tasks/BOND_TEXT_001.md),
[WISP_UPGRADE_DISPLAY_001](tasks/WISP_UPGRADE_DISPLAY_001.md) and the
[feature-chat workflow](tasks/FEATURE_CHAT_WORKFLOW_001.md).
Repository: `karahaNx/Lumenfall`. Verify relevant live state before acting;
commits below are observed checkpoints, not a promise that main never advances.

F05 [ASCEND_PRISMS_001](tasks/ASCEND_PRISMS_001.md): approved rounding fix and
calculation text in PR94. CI286 PASS177/203/22; newer Tree integration checks
PASS. Final combined CI/integration/signed APK acceptance pending.
[Evidence and report limits](qa/ascend-prisms-001/README.md).

## Product and release evidence

[LOADOUT_MEMORY_001 / F25](tasks/LOADOUT_MEMORY_001.md) COMPLETE through
[PR78](https://github.com/karahaNx/Lumenfall/pull/78)/9c19664 and
[PR97](https://github.com/karahaNx/Lumenfall/pull/97)/3f1b6fa. Automatic Forge
preference; named purchase removed, archival value retained. Integrated CI176/17,
fresh1139/V8 and signed APK150 identity/assets/native input/save/restart/upgrade
PASS. [Evidence/limits](qa/loadout-memory-001/current/README.md); F26 credit separate.
Task edits stopped; only this owner is eligible for archive.

[RIFT_GUIDANCE_001 / F07](tasks/RIFT_GUIDANCE_001.md): PR81/015e2e6 integrates
stable guidance below currencies. UI160/0px, focus/AX/state purity, Rift/navigation
and V8 6.0 PASS. Signed0.1.151 identity/assets and actual143→151 Android update,
four-width touch/large-text/keyboard/reload acceptance PASS. Later Tree/cosmetics/Lab
source checks pass. [PR98](https://github.com/karahaNx/Lumenfall/pull/98) saves the
[completion receipt](qa/rift-guidance-001/2026-10-08/delivery/README.md); completion
on main requires its final mandatory CI/merge. No physical/TalkBack/FPS claim;
archive only this owner after merge, or report unavailable app tooling.

[UPGRADE_IDENTITY_001/F29](tasks/UPGRADE_IDENTITY_001.md) is integrated via PR90/31eccfb:
14 buying tracks at integration, unchanged currencies and all24 historical levels.
Subsequent F26/PR85 retires/refunds Deep Reserves: current tracks Lab6/Forge4/Tree3.
PR90 CI167/17 and combined19 scoped scenarios/23 runs PASS. Signed APK148/151
identity/CRC526/all15 assets and actual V8 value/offline probes PASS. [Evidence/immutable APKs](qa/upgrade-identity-001/2026-10-08/README.md).
Required affected-phone/exact WebView60/TalkBack acceptance is OPEN; chat stays open.

F13 delivery added 8 October 2026: [RIFT_CAST_TEXT_001](tasks/RIFT_CAST_TEXT_001.md)
is complete via PR63/ab46c0c. Full CI151 scenarios/12 required negatives, integrated
checks and signed APK0.1.142 native acceptance PASS. Package/signing and all 15 assets
verified; actual138→142 save storage/ownership preserved. [Receipt/limits](qa/rift-cast-text-001/finish/README.md),
[immutable APK](../archive/android/rift-cast-text-001/README.md). Native evidence is
API27/WebView61 emulation plus a separate V8 6.0 probe; no physical/TalkBack claim.

F14 [FORMATION_AUTOSAVE_001](tasks/FORMATION_AUTOSAVE_001.md) integrated via
[PR76](https://github.com/karahaNx/Lumenfall/pull/76)/c5fa497. Selected-preset
Field/Bench/recruitment saves immediately; Save removed; complete late-game
intent and stored empty presets survive Ascend/recovery without pending power
or Bonds. CI158/14, fresh integrated/mobile checks and signed APK0.1.145
identity/assets/engine/native update/input/Ascend/cold launch PASS. Actual
Android8.1/API27/WebView61 emulation; required physical/exact WebView60/TalkBack
acceptance OPEN. [Receipt and immutable APK](qa/formation-autosave-2026-10-08/DELIVERY.md).


[COMET_UNLOCKS_001 / F27](tasks/COMET_UNLOCKS_001.md) catalog is integrated
through [PR69](https://github.com/karahaNx/Lumenfall/pull/69),
merge d95205f6d8059933fac74e8699854f67cb950a7e. Comet Trials140, Rift Trail50
and Starfall Crest160 replace the purchasable convenience/timecap rows;
Auto-Ascend100 and old ownership/effects/currencies retain value. Full151
pre-merge CI37713904342 passed; the latest Rift text combination was reassessed.
[Post-integration CI37716370065](qa/comet-unlocks-001/post-integration-ci.json)
passed151 defaults/12 required negatives and all required gates on unchanged
integrated game/test bytes. [Delivery PR73](https://github.com/karahaNx/Lumenfall/pull/73)
records final document validation/integration. No independent review claimed.

F27 signed APK **0.1.143**, build37715794487, package com.lumenfall.app,
established signing identity, is published and downloaded/verified. SHA256
`45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7`;
all526 CRC entries and all15 assets match integrated source. Actual extracted
APK11 Comet cases PASS on V8 6.0.286.52. Exact native WebView60/physical/TalkBack
acceptance remains OPEN: unrestricted ADB starts, but the isolated API27 emulator
fails in kernel/init before app installation. F25/F26
built-in memory/fixed12h retirement/refunds are separate dependencies.
[143 receipt, immutable APK and remaining checks](qa/comet-unlocks-001/DELIVERY.md).

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

[WISP_UPGRADE_DISPLAY_001 / F04](tasks/WISP_UPGRADE_DISPLAY_001.md) is implemented
through PR59, merge0e9b54c8d62a873bd48625f4a20ee18078e8a8f1. Unfinished Wisp
upgrades stay open without a fold control; folding requires Mythic rarity,
the authoritative Module cap and an owned Ultimate. Empower/Resonate and
affordability do not determine completion. Required CI37708308439 PASS147 default
scenarios and12 negative controls; integrated normal F04,12 mobile profiles/12,912
assertions and relevant existing checks PASS. PR60 Forge wording is preserved.

F04 verified signed APK **0.1.140**, build37710185974, package com.lumenfall.app,
established signing identity; SHA256
`c0c81462151c485b16f85dc2c0e53d258ba45c60f92a32539e9e2d6a7153696d`.
APK CRC and all15 bundled assets match integrated source. Actual signed138→140
emulator update preserves WebView save storage byte-for-byte.
Native signed140 final Module purchase/open/focus/Enter/touch folding and save
purity checks PASS on Android8.1/WebView61. Required physical
affected-phone/exact WebView60/TalkBack acceptance remains OPEN; this feature/chat
stays open. [140 receipt, immutable APK and evidence](qa/wisp-upgrade-display-001/delivery-2026-10-08/README.md).

[FORGE_TEXT_001/F23](tasks/FORGE_TEXT_001.md) is integrated via
[PR60](https://github.com/karahaNx/Lumenfall/pull/60); the unwanted standard cap
text is removed while authoritative levels/prices/effects/caps remain. Feature
CI146/12 and receipt CI151/12 PASS, including tooling/guarded startup. Fresh
integrated Forge contracts and mobile/motion checks PASS. Signed **0.1.143**,
build37715794487, PASS com.lumenfall.app/version/established signer, internal
CRC526 and all15 byte-identical source assets; required physical affected-phone/
exact WebView60/TalkBack acceptance stays OPEN. [Current receipt and archived APK143](qa/forge-text-001/2026-10-08/README.md)
preserve identities, raw checks and historical139/140/141 records. F23 changes no
balance/save schema or Swift Recovery design; accepted upstream Remember Bulk
migration is retained. This feature/chat stays open pending device acceptance.

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
| [OFFLINE_12H_001 / F26](tasks/OFFLINE_12H_001.md) | PR85 integrated; common12h and original-currency refund ledger. Signed150 identity/15 assets PASS; native144→150 migration/save slots PASS. [Evidence](qa/offline-12h-001/README.md). | Finish native cap/UI/focus checks and combined integrated CI; save final status. Owner chat OPEN. |
| [RESONATE_CLARITY_001 / F06](tasks/RESONATE_CLARITY_001.md) | PR80/main e2f745c implemented; signed APK146 package/signing/15 assets/extracted-browser/V8 checks PASS. Full159 scenarios/14 negatives PASS on exact APK146 source; fresh integrated UI/economy/save/recovery PASS. | Complete [physical WebView60/native large-text/TalkBack acceptance](qa/resonate-clarity-001/integration-2026-10-08/DEVICE_ACCEPTANCE.txt). Game update delivered; feature/chat OPEN. |
| [AUTO_ASCEND_UI_001 / F01–F03](tasks/AUTO_ASCEND_UI_001.md) | PR84 integrated; CI160/14 PASS. Signed153 signing/assets/CRC and28 focused/20 UI/54 V8 PASS. Historical148 native update/control/font/trigger PASS on emulator61. [Receipt/APKs](qa/auto-ascend-ui-001/finish-2026-10-08/README.md). | Pass/integrate PR99 CI; complete current153 [phone/exact60/TalkBack](qa/auto-ascend-ui-001/DEVICE_ACCEPTANCE.txt). Acceptance OPEN. |
| [SAVE_BACKUP_UI_001 / F22](tasks/SAVE_BACKUP_UI_001.md) | PR77 integrated; CI152 scenarios/14 negatives, integrated12 UI profiles and signed144 identity/assets/extracted-UI/V8 checks PASS. Backup is beside independent Reset; Restore requires confirmation. | Complete [physical Android/WebView60/TalkBack acceptance](qa/save-backup-ui-001/2026-10-08/DEVICE_ACCEPTANCE.txt). Required acceptance OPEN; keep owner chat open. |
| RIFT_CAST_TEXT_001 / F13 | **Complete.** PR63 integrated; CI151/12 negatives, integrated UI/save/parity/chronology checks and signed 0.1.142 native acceptance PASS. [Task/evidence](tasks/RIFT_CAST_TEXT_001.md). Existing200% name overflow is recorded separately. | Final checkpoint verified, shared-file work stopped; archive only the owner chat using the app tool. |
| [FORMATION_AUTOSAVE_001 / F14](tasks/FORMATION_AUTOSAVE_001.md) | PR76/main integrated; CI158/14 and signed145 update/native Formation checks PASS. Later Resonate/main changes preserved. Required device acceptance OPEN. | Complete [physical/exact WebView60/TalkBack checklist](qa/formation-autosave-2026-10-08/DEVICE_ACCEPTANCE.txt); save observed results in GitHub and keep owner chat open. |
| [COMET_UNLOCKS_001](tasks/COMET_UNLOCKS_001.md) / F27 | PR69/main integrated; full151 pre-merge CI and signed143 package/signing/assets/extracted-engine checks PASS. New catalogue140/50/160; legacy value/effects retained. [PR73](https://github.com/karahaNx/Lumenfall/pull/73) records final integrated-source CI. Required native acceptance OPEN. | Complete exact signed143 native update/interaction, physical WebView60 and TalkBack checklist. Keep feature/chat open; F25/F26 retirement/refunds stay separate. |
| [BOND_TEXT_001 / F16](tasks/BOND_TEXT_001.md) | PR61 integrated; CI148/12 and fresh integrated checks PASS. Signed0.1.141 identity/assets, V8 6.0 helper, native WebView69 presentation and signed update/save-value checks PASS. | Complete [physical affected-phone/WebView60/TalkBack acceptance](qa/BOND_TEXT_001/android/DEVICE_ACCEPTANCE.txt) and save observations in GitHub. Keep owner chat open. |
| [LAB_EXCLUSIVE_001](tasks/LAB_EXCLUSIVE_001.md) / F29 | [PR62 proposal checkpoint](https://github.com/karahaNx/Lumenfall/pull/62): 9 Labs inventoried, 7 duplicate rows in 6 effect families; exclusive study-work/reservation effects and value-preserving transition proposed. Actual CI/merge/integrated checks are saved in the PR body. No game behavior changed. | Obtain the agreed UPGRADE_IDENTITY_001 Lab effects/currencies/prices/work/unlocks/caps and migration policy. Full feature and chat remain open; proposed values/mechanics are not approved rules. |
| WISP_UPGRADE_DISPLAY_001 / F04 | [Integrated PR59 and signed140](tasks/WISP_UPGRADE_DISPLAY_001.md); required CI147 scenarios/12 negatives and integrated12 mobile profiles/12,912 assertions PASS. Signed138→140 native save preservation PASS. | Complete and save affected-phone/exact WebView60/TalkBack acceptance. Available implementation/delivery is published; feature/chat remains open. |
| FORGE_TEXT_001 / F23 | PR60 integrated; verified [APK143 and current-source receipt](qa/forge-text-001/2026-10-08/current-acceptance.json), with [archived signed binary](qa/forge-text-001/2026-10-08/APK/Lumenfall-0.1.143.apk). Earlier139/140/141 remain historical. Full feature146 CI and current Forge contracts PASS. | Run affected-phone/exact WebView60/TalkBack checks on archived APK143; save versions/results and keep this owner chat open pending acceptance. |
| FEATURE-CHAT-WORKFLOW-001 | Current docs/context-tooling cleanup; see task for publication/integration receipt. | Verify document/tooling checks and GitHub integration; no game build. |
| OFFLINE-CATCHUP-001 | PR51/54/55/56 integrated; signed137 verified, available source/engine/emulator checks PASS. Required physical acceptance OPEN. | Run remaining affected-phone/exact WebView60/TalkBack checklist and save results in GitHub. Keep feature/chat open. |
| FEATURE-BRANCH-INTEGRATION-001 / LAB-MOTES | PR57/46 merged; full 146 CI and signed 0.1.138 asset/signing verification PASS. Required device acceptance OPEN. | Complete affected-phone/exact WebView60/TalkBack acceptance and any required independent review. Keep task/chat open. |
| [LAB_SPEED_QUEUE_001 / F12](tasks/LAB_SPEED_QUEUE_001.md) | PR46/B2 product integrated via PR57. Payment/chronology/offline retry/save/recovery/Ascend/competition and mobile checks renewed PASS on main0e9b54c (PR60/59). Signed APK140 identity/assets and V8 Lab payment/retry PASS. No additional F12 product gap found. | Delivery tracked in PR65; complete [F12 affected-phone/WebView60/TalkBack acceptance](qa/lab-speed-queue-001/DEVICE_ACCEPTANCE.txt). Required physical acceptance OPEN; keep owner chat open. |
| B2 arithmetic integration | Number/DataView functions from archived tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef` were restored separately, matched exactly and integrated through PR57 with new regression/CI coverage. | Archived stress/physical/review limitations remain distinct from current full 146 CI. |
| FEEDBACK-REVISION-001 | 29 original points and four images preserved; not collectively implemented. | Follow dependencies in a separately assigned task. Saved next priorities: F20/F21 Echoing Rest cap 6 / Cheaper Bonds cap 20, purchase gates and old-save policy. |
| [TREE_EXCLUSIVE_001](tasks/TREE_EXCLUSIVE_001.md) | PR66/main ac0d28e integrated; CI176/17 and signed152 native update/value/UI/save PASS. Current-main154 assertions PASS; native60 signed148→153 storage/value/touch PASS. | Final available-button names corrected (160 assertions/13 focused checks); publish scoped PR and pass required CI/final APK. Physical/TalkBack acceptance OPEN; keep owner chat open. |
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
