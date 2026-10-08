# SWIFT_RECOVERY_CAP_001 — bounded ability recovery

Status: implementation in progress; not integrated or released complete.
Owner: this Swift Recovery feature chat. Branch `feature/swift-recovery-cap-001`,
private checkout `/workspace/Lumenfall-swift-recovery`. No subagents/messages.

One goal: enforce one purchase/effect cap and positive ability cycle across
Forge UI, direct handler, single/bulk/Max/queue and live/offline simulation,
with explicit preservation of old purchase value.

## Requirements and baseline

[Original feature request and corrections](SWIFT_RECOVERY_CAP_001_REQUEST.txt).
Original F19: “Jeg tænker swift recovery Skal have et cap, ellers kan vi nå et
punkt, hvor abilities bliver instant.” Source:
[original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F18/F19 and save/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
User's balance intent: “not too easy and not too hard”. On 8 October the user
explicitly requested finishing implementation and pushing to GitHub.

Implementation baseline: main `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
PR46/B2 is merged via PR57 `20aaae62a4b6e46f8d75775085918eaba4e8de29`.
Current AGENTS/FEATURE_WORKFLOW replace historical Lead/writer permission gates;
this feature owns implementation and delivery. Current open PR67 overlaps Swift
and saves; its 27-feature bundle is not main and is not imported as a product.
PR70 concerns Wisp roles; PR66 concerns Tree caps. Keep those objectives separate.
Historical local preparation is preserved in
[the frozen checkpoint](../qa/swift-recovery-cap-001/preparation-task-2026-10-07.md)
and its existing evidence directories; those passes are not current acceptance.

## Concrete decisions and dependencies

The user-approved contract recorded in PR67 is preserved
[byte-for-byte](../qa/swift-recovery-cap-001/implementation/approved-balance-contract.md).
Source: `52fa48db51ed6ce58704ec17c593ee68710394e0`,
`docs/requirements/all-27-feedback-001/balance-contract.md`,
[PR67](https://github.com/karahaNx/Lumenfall/pull/67).
That record establishes cap10, support duration1s/1.5s and original-currency refunds.
It supplies the missing F18/F19 design dependency; no guessed balance numbers.

- Purchase cap10; effective level `min(raw,10)`. Keep +8% fill per effective level.
- Cycle `max(10/3, 6/(1+0.08*effectiveLevel))` seconds. Both motor fill and UI
  derive from this same function. A ready resource can cast immediately; paid
  Resonate remains allowed. Purchasing keeps current resource percent.
- F18 duration implementation remains a separate feature: main still uses
  normal4s/Ultimate8s. The approved1s/1.5s contract yields normal16.67→30% and
  Ultimate25→45% uptime from level0→10. This cap alone does not change buffs.
- Retain raw old levels, earned Deeds, queue intent and paid active Study work.
  Refund Shards for raw purchases above10 using `ceil(30*1.55^oldIndex)` per
  individual historical level. Saves lack bulk transaction receipts, so this is
  the approved single-price compensation policy, not an exact bulk reconstruction.
- Schema1 optional `swiftRecoveryRefund` records range, exact refund, remaining
  spendable credit and first nonfinite price. Exact integer credit uses hex strings,
  no product BigInt. Keep every finite historical price; never invent a refund
  for a purchase whose original price is nonfinite. Huge raw levels stay history.
  Bounded migration loops stop at the finite price boundary, not the raw level.
- Credit and receipt normalize/save together. Full backup restore replaces the
  complete money/progression snapshot; replaying an old backup cannot accumulate
  refunds on top of later money. Ascend retains Shards/receipt; Reset clears all.
  All existing Shard spending paths consume the same available value.
- PR67 integration must preserve this migration/credit contract and reconcile its
  overlapping compensation implementation, avoiding a second refund. No unrelated
  Tree, offline, Wisp power, Comet, support or eight-Bond changes are included here.

## Acceptance and preservation

Verify real purchase counts/prices and cap rejection, queue intent/counters,
UI previews and fallback focus; before/exact/after cast times, purchase chronology,
live/offline and split parity; old/malformed saves, primary/recovery/backup,
storage failures, Ascend/Reset, huge-wallet refund precision and bounded migration.
Mobile320/390/430px, 200% text, 44px controls, visible focus/contrast/reduced motion.
Run required CI and repeat affected checks on integrated main, then signed APK
identity/assets and required native acceptance. An open PR/local pass is unfinished.

Preserve package `com.lumenfall.app`, established signing, WebView60 syntax/runtime,
chronological simulation, existing bulk price rounding, deterministic purchases,
fixed Luminous Motes rewards and all unrelated systems. No archive originals change.

Changed product/check files: root index.html; targeted behavioral harness/Forge
expectations; new Swift core and UI regression coverage. Existing assertions for
other four uncapped legacy upgrades and all other Forge mechanics remain required.

## Checks and next action

Focused core:12 groups,110 purchase boundary/budget cases pass on Node24.19.0.
Includes independent BigInt accounting oracle only in Node tests, actual cast
chronology/live/offline, save/recovery/backup and storage failure. Source syntax
validation passes. Baseline context check exposed startup-budget overflow in the
old proposal; this shorter task replaces it while preserving the original checkpoint.
Mobile12 profiles pass (320/390/430px, doubled text, normal/reduced motion). V8 6.0 runs unchanged product and passes exact refund/debit checks. Full-suite diagnostics caught stale Swift60 offline goldens; one-second8h/72h reference and current-source CI are pending. Integrated checks, APK and native acceptance are pending.
No independent review, physical device/TalkBack pass or completion is claimed.

Next: finish native browser/mobile coverage and negative controls, run required
regression gates, publish a scoped PR, integrate after successful CI, verify the
signed release and persist exact receipts/remaining acceptance. Keep this chat
open until required acceptance is complete; archive only this owner afterwards.
