# FORGE_TEXT_001 — remove the Forge standard cap text

Status: integrated and signed APK published; required device acceptance remains open.
Owner: this FORGE_TEXT_001 feature chat. Branch: `feature/forge-text-001`.

## Requirement and scope

Original F23: “Der behøver ikke stå no level cap på de forge opgraderinger de står ved.”
Preserve actual levels, prices, effects and accepted caps. Sources:
[original requirement](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F23 and its dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[recorded decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
The user requested GitHub delivery and readiness for the game on 8 October 2026.

The sole product edit removes the ` · No level cap` suffix in `renderResearch()`.
Uncapped entries show `Level N`; capped entries retain `Level N / C`. Existing
Current/Next/Purchase impact, descriptions, prices, actual bulk counts, Maxed,
disabled controls, focus, queue and purchase handlers retain their existing model.
No prices, progression, deterministic rewards, purchase data or save schema change;
no migration is needed for this presentation edit.

Swift Recovery's gameplay cap/minimum cycle belongs to SWIFT_RECOVERY_CAP_001/F19,
including support balance and explicit legacy value preservation. F23 neither
invents nor changes those values; the renderer already reads authoritative
`levelCap`. Swift design is not a reason to retain the unwanted F23 standard text.

## Baseline and coordination

Live baseline: `214d45411ce2fb420f0e4b372063811a967679b1`, tree
`1048bc22972a2b650eba73186db35bc0402ded04`, observed 8 October 2026 UTC.
Product HTML SHA256:
`6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.
Private checkout: `/workspace/Lumenfall-FORGE_TEXT_001`. The original local
candidate `2bfedc16b654b6f95573245173421edb1f144a56` remains on its old private branch;
only its one-line product correction was applied to current main.

PR46/B2 is now integrated through PR57/46. The current
[feature workflow](../project/FEATURE_WORKFLOW.md) supersedes historical role/writer
gates. No open PRs or queued/in-progress runs overlapped this change at startup.
Standing authorization and the user's current request cover delivery in this scope.
Main/base/head and review results were checked immediately before merging PR60.
Parallel PR59 Wisp edits were inspected for overlap; no Forge render edit or
other chat changes were taken over. Historical writer release is not a live gate.

## Acceptance and checks

- Remove the visible standard text from every Forge card and subsequent renders.
- Keep actual levels/caps and model-derived prices/effects identical to baseline
  across locked, unaffordable, single, bulk/Max, near-cap, capped and legacy-overcap states.
- Preserve direct/bulk/queue purchase boundaries, chronology, live/offline,
  reload, backup and recovery using existing Forge scenarios.
- Compare 320/390/430 px, normal/200% text and normal/reduced motion; preserve
  44px controls, focus and contrast. Record existing overflow separately from regressions.
- Require current source/tooling gates and complete pre-merge CI without weakened
  assertions. Verify the integrated source, relevant APK/package/signing/assets,
  and required device acceptance before marking the feature complete.

Fresh checks and exact source hashes are saved in the
[verification receipt](../qa/forge-text-001/2026-10-08/README.md). Node 24.19.0 and official
Chrome 155.0.8059.39 are used locally. Debian Chromium 151 repeats the documented
DOM-export timeout on unchanged current main; this diagnostic is not a passing check.

Earlier 7 October results belong to the previous baseline and are not acceptance
of current main. Original local TXT/ZIP remain available in the workspace.
Self-review/automated checks are not independent review. Physical affected-phone,
exact WebView60 and TalkBack acceptance must not be inferred from desktop Chrome.

## Current checkpoint and next action

[PR60](https://github.com/karahaNx/Lumenfall/pull/60) merged at
`e189a3a8aba0c7cc377bad8980c62d75d1279189`; its entire tree equals validated
head `5c77129de961bb1d6a6cba6a8990f8625e146acd`.
[CI37708469018](https://github.com/karahaNx/Lumenfall/actions/runs/37708469018)
PASS: 146 default scenarios, 12 required negatives, source/tooling and guarded
startup. PR60 automated code/security review completed without reported findings;
no independent human review is claimed.

Signed **0.1.139** (build37709745605) was independently verified from that source.
Parallel PR59 product integration `0e9b54c8d62a873bd48625f4a20ee18078e8a8f1`
preserves all four Forge renderer/preview/plan functions byte-for-byte. A fresh
normal Forge contract check PASS on the exact combined source.
Verified signed **0.1.140** (build37710185974) also PASS independent package/version/
established signer/digest, internal CRC checks for all 526 ZIP entries and
byte comparisons for the 15 staged assets.
APK SHA256 `c0c81462151c485b16f85dc2c0e53d258ba45c60f92a32539e9e2d6a7153696d`.
[Combined source/APK receipt](../qa/forge-text-001/2026-10-08/combined-acceptance.json)
and [140 release identity](../qa/forge-text-001/2026-10-08/android-140-release.json)
preserve exact source and test hashes; earlier139 receipts remain historical.

Following PR61/62/65, main641697e preserves the Forge functions; fresh contract
and signed **0.1.141** package/signer, 526 internal CRCs and 15 source-assets PASS.
[Post-Bond receipt](../qa/forge-text-001/2026-10-08/post-bond-acceptance.json)
records exact source/APK hashes. Lab rows were retained during documentation rebase.

After PR63/69, main `e0fd100afc8e429227acbcbde3840adc70e9bbc8` includes Rift
wording and the accepted Comet migration. Forge preview/price/plan functions
remain unchanged. The only renderer difference is the upstream Remember Bulk
lookup from `state.owned` to preserved `state.legacyCometPurchases`; all other
renderer bytes, including actual levels/caps and this F23 correction, are identical.
Fresh Forge contracts PASS against exact HTML SHA256
`5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c`.
Signed **0.1.143**, build37715794487 from product commit `d95205f`, PASS independent
package/version/established signer, 526 internal CRCs and all 15 byte-identical
source assets. [Current integrated receipt](../qa/forge-text-001/2026-10-08/current-acceptance.json)
records exact identities. Earlier139/140/141 receipts remain historical.
Fresh mobile and reduced-motion Forge scenarios also PASS three existing
profiles each on that same source, including controls, focus and scroll behavior.

Source is integrated; the exact [verified APK143](../qa/forge-text-001/2026-10-08/APK/Lumenfall-0.1.143.apk)
is archived in GitHub and ready for the remaining device checks. Required physical affected-
phone/exact WebView60/TalkBack acceptance: NOT RUN, remains OPEN. Next: run those
checks on the verified APK and save device/version/results in GitHub; resolve any
introduced regression before completion. Existing 200% text overflow is documented.
The documentation receipt's final CI/integration belongs in its PR body, linked
from PR60. Receipt branch: `docs/forge-text-001-receipt`; only its documentation
was rebased, preserving the parallel Wisp row. Stop this feature's shared-file
work after that checkpoint; do not claim another chat's ownership is released.
Archive: keep this owner chat open pending required acceptance.
Model context identifies GPT-6; precise model variant/runtime effort is not attested.
