# Forge text verification on current main

Baseline: `214d45411ce2fb420f0e4b372063811a967679b1` (product HTML SHA256
`6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`).
Candidate HTML SHA256:
`7e12642138fd2338fc07919aca01ee9c14c5f56bd0460d0d70c1a9193f4ff307`.
Replacing the removed suffix reconstructs the entire baseline file byte-for-byte.
No gameplay, economy, save, native Android or signing bytes are changed.

Local Node 24.19.0/official Chrome 155.0.8059.39 checks are recorded in
[validation.json](validation.json). The unchanged baseline and candidate both
pass existing `forge-contracts`; it includes 336 purchase cases, legacy-overcap
preservation, four causal negative controls and exact UI/model debit checks.
Ten candidate gameplay/accessibility scenarios and both native mobile/motion
scenarios pass through the unmodified current `tests/behavioral/run.cjs`.
Complete raw logs are stored as named `.log.gz` files in this directory.

[presentation.json](presentation.json) compares all eight cards across seven
states: locked, unaffordable, one-level, bulk near cap, Max, capped, and preserved
overcap. Descriptions, visible prices, effects, queue/disabled states and complete
model plans are identical; only the unwanted suffix differs. Rendering is pure.

[viewports.json](viewports.json) contains twelve profiles, each measured on both
baseline and candidate: 320/390/430 px × normal/200% root text × normal/reduced
motion. All Forge control rectangles are at least 44×44 px; level contrast is
11.96:1; no runtime errors. Current baseline overflow at 200% text and internally
in existing bulk buttons is preserved, not fixed or misreported as an introduced
regression. This scoped text result is not full accessibility/device acceptance.

The existing documented Chromium 151 dump-DOM timeout was reproduced on unchanged
current main; [that failing diagnostic](baseline-forge-contracts.log.gz) is
preserved. Chrome 155 supplies the passing results without changing test gates.
Earlier 7 October results and their baseline remain historical, not current accept.

## GitHub integration and signed APK

[PR60](https://github.com/karahaNx/Lumenfall/pull/60) merged at
`e189a3a8aba0c7cc377bad8980c62d75d1279189`.
[integration.json](integration.json) proves full-tree equality with validated
head `5c77129de961bb1d6a6cba6a8990f8625e146acd`; integrated HTML is the exact
candidate already checked above. No conflict resolution altered product bytes.

[CI receipt](ci-acceptance.json) and [complete raw log](ci-37708469018.log.gz):
146 deterministic default scenarios PASS, all 12 required negative controls
caught, source/tooling gates and guarded mobile startup PASS. GitHub automated
code/security reviews completed with no reported suggestions or inline findings
in the [observed review snapshot](automated-review.json). No independent human
review is claimed.

**Signed APK 0.1.139**
was published by [build37709745605](https://github.com/karahaNx/Lumenfall/actions/runs/37709745605)
from that exact integration commit. [Release receipt](android-139-release.json),
[identity output](android-139-identity.log.gz), [all-assets/CRC receipt](android-139-assets.json)
and [complete build log](android-build-139.log.gz) preserve verification.

Commands on the downloaded APK: existing `scripts/verify_apk_identity.cjs` with
Android build-tools35 `aapt`/`apksigner`, expected package `com.lumenfall.app`,
version code139/name0.1.139 and the established SHA256 certificate; existing
`docs/qa/offline-catchup-001/android-137/verify-assets.cjs` checks every ZIP CRC
and byte-compares all staged assets. Both PASS. APK SHA256
`827d364f7071ab6c32e39ebd6efe3a758fa1741568fc26ca21589aaaace27551` matches
GitHub's release digest; 6,837,160 bytes, 526 ZIP entries and 15 matched assets.
The latest release URL is mutable; the recorded version/digest/source identify
the APK accepted by these checks.

[webview60-engine.json](webview60-engine.json) records the existing
`tests/behavioral/offline-catchup-v8.cjs` probe on Node8.3.0/V8 6.0.286.52:
PASS (8h, 302400 kills, 14400 ascends). This intentionally uses the legacy
engine to probe compatibility, not as a new tooling standard or native device test.

Required physical affected-phone, exact Android WebView60 and TalkBack acceptance
remain NOT RUN/OPEN. The app is ready to install; the feature/chat is not archived
or labelled fully accepted until those required checks are saved.
The documentation receipt's own final CI/integration is recorded in its PR body
and referenced from PR60 to avoid a self-referential follow-up commit loop.

## Combined main after the parallel Wisp merge

PR59 advanced main to `0e9b54c8d62a873bd48625f4a20ee18078e8a8f1`.
[combined-acceptance.json](combined-acceptance.json) byte-compares `renderResearch`,
`researchPreview`, `getResearchBuyPlan` and `updateResearchCard` with the accepted
Forge integration. All four are unchanged. The fresh staged source and normal
[Forge contract log](integrated-forge-contracts.log.gz) match HTML SHA256
`a64747dcec3c26c0b5dea3f2e5c1bac521de557e38547b1195b5a3660234b0df` and PASS.
An initial post-rebase probe used the previous staged HTML and was excluded;
only the fresh, SHA-verified source is claimed as combined acceptance.

Latest published signed APK **0.1.140**, build37710185974, also PASS independent
package/version/established signer and all asset/CRC checks against that exact
combined source. [Release metadata](android-140-release.json),
[identity output](android-140-identity.log.gz) and [assets](android-140-assets.json)
preserve evidence: SHA256
`c0c81462151c485b16f85dc2c0e53d258ba45c60f92a32539e9e2d6a7153696d`,
6,837,509 bytes, 526 ZIP entries and 15 matching assets. The earlier139 records
identify this feature's own integration build; the latest URL served140 at this recorded checkpoint.
[Latest APK download](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)
is mutable; use the recorded version/digest when reproducing a historical check.
Required physical acceptance remains open. The parallel Wisp implementation and
dedicated task were preserved. Its shared status row records the observed merge/
APK while retaining its own requirements and referring acceptance to its owner.

## Subsequent Bond/Lab integration checkpoint

Main `641697e4208ac41a6116b903ab136e54571818bd` incorporates PR61 Bond text and
PR62/65 Lab documentation. Rebase resolved the shared status-row conflict by
retaining both Lab rows and the supported Forge/Wisp metadata. No game file was
changed by this documentation checkpoint.
[post-bond-acceptance.json](post-bond-acceptance.json) verifies all four Forge
functions remain byte-identical, the unwanted phrase is absent, and a fresh
[normal Forge contract check](post-bond-forge-contracts.log.gz) passes against
staged/source HTML SHA256
`1e0d51370b5b62f313dad6953f9b26bb7d7a1a886785dbccc6dfaac379779981`.

Verified signed **0.1.141** from
[build37712548224](https://github.com/karahaNx/Lumenfall/actions/runs/37712548224)
also PASS: established package/signer, code141/name0.1.141, internal CRC for all
526 ZIP entries and byte-identical source for all 15 staged assets.
[Release metadata](android-141-release.json), [identity](android-141-identity.log.gz)
and [assets](android-141-assets.json) preserve its exact digest/source.
APK SHA256 `0b278ffce3819a40b98c44b738b79123ec2d7fb273a3820bc13ed71940214d44`.
Earlier139/140 receipts remain tied to their recorded source versions.
Physical acceptance stays open; a latest-download URL does not identify a
historical APK. Check installed version/digest before reproducing results.

The exact [signed APK141 binary](APK/Lumenfall-0.1.141.apk) remains archived for
that historical checkpoint. Actions-artifact cleanup and latest-release replacement
do not delete committed binaries. Current pending device acceptance uses APK143 below.

## Current integrated APK143 checkpoint

Main `e0fd100afc8e429227acbcbde3840adc70e9bbc8` includes PR63 Rift wording and
PR69 Comet Trials/Rift cosmetics. The [current receipt](current-acceptance.json)
compares the Forge functions with the accepted PR60 source. Preview, purchase plan
and card-update functions are unchanged. `renderResearch` has one upstream change:
Remember Bulk reads preserved `state.legacyCometPurchases.rememberbulk` instead
of `state.owned.rememberbulk`. All other renderer bytes are identical. F23 adds no
migration and preserves the accepted upstream migration; no other chat's code was edited.

Fresh [Forge contracts](current-forge-contracts.log.gz) PASS on staged/root HTML
SHA256 `5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c`:
3,508 assertions, 336 purchase cases and four causal negative controls.
An initial comparison assumed all four functions remained byte-identical; it
identified the upstream lookup change before staging and is not claimed as acceptance.
The final run explicitly staged and verified the current source hash.

Fresh [mobile controls/focus](current-forge-ui-mobile.log.gz) and
[reduced-motion controls](current-forge-ui-reduced-motion.log.gz) PASS three
existing profiles each on the same verified source. They exercise actual touch/
keyboard actions, bulk/Max limits, queue changes, capped purchases, focus and
scroll preservation, 44px bulk controls and browser teardown.

The [current V8 6.0 engine probe](current-webview60-engine.json) also PASS the
existing offline8h case: 302,400 kills/14,400 ascends, with current HTML byte-identical
to APK143. This verifies engine parsing/execution, not native WebView/device behavior.
All combined/post-Bond/current function hashes use the documented declaration-through-
closing-brace range, excluding separator newlines. The machine-readable
`latestVerifiedAPK` in validation.json points to143;140/141 pointers are historical.

Signed **0.1.143** from [build37715794487](https://github.com/karahaNx/Lumenfall/actions/runs/37715794487),
source `d95205f6d8059933fac74e8699854f67cb950a7e`, PASS independent
[identity](android-143-identity.log.gz) and [source assets](android-143-assets.json):
package com.lumenfall.app, code143/name0.1.143, established signer, all 526 internal
CRC entries and 15 byte-identical game/font/branding assets. [Release metadata](android-143-release.json)
records the matching released digest. APK SHA256
`45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7`;
6,841,573 bytes. Its extracted game HTML is byte-identical to this checkpoint.

Use the archived [signed APK143](APK/Lumenfall-0.1.143.apk) for affected-phone,
exact WebView60 and TalkBack acceptance, recording installed app/Android/WebView
versions, source/APK identity and actual Forge observations. Those physical checks
remain NOT RUN/OPEN. Earlier builds do not establish acceptance of this integrated
source. The final PR body links the immutable APK143 commit URL and final CI/merge receipt.
