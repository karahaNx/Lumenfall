# UPGRADE_IDENTITY_001 — exclusive upgrades (F29)

Owner: this feature chat. Integrated; required native/device acceptance OPEN.
[Original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
and [user request](UPGRADE_IDENTITY_001/USER_REQUEST.txt): common Lab/Forge/Tree
effect/currency matrix, duplicate decisions, stacking and bought-level value.
[Correction](UPGRADE_IDENTITY_001/USER_CORRECTION.txt): Workshop currencies stay.
8 October: “Finish the feature task push to github implement to game”.

## Baseline and scope

Private `/workspace/Lumenfall-upgrade-identity-001`, branch `feature/upgrade-identity-001`.
[PR90](https://github.com/karahaNx/Lumenfall/pull/90)
merged31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6 including late PR84 Auto-Ascend.
Delivery PR93: docs/artifacts only, rebased onto ac0d28e589bd1caef4b9c70f2383a8b3ee384acd,
preserves F07/F25/F26/F14/Tree66; PR46/B2 merged via57. No subagents/messages.
[Original baseline/proposal](UPGRADE_IDENTITY_001/PROPOSAL_2026-10-07.txt).
Scope: ownership/purchase eligibility/legacy UI/Deeds/clock fixes.
Preserve prices/work/rounding, deterministic purchases/Motes,
save/recovery, WebView60, com.lumenfall.app and signing.

## Decisions and dependencies

[Matrix](UPGRADE_IDENTITY_001/MATRIX.md): fuse ten duplicate buying tracks into
verified existing effects; fourteen remained at PR90. Lab owns damage/kill
research/Motes/work; Forge ability charge/damage/cast resources/encounter chance;
Tree Ascend/offline/recruitment. All24 raw IDs/operands/order stay. Old bonuses
are read-only; no F29 refund/conversion/ledger/schema bump.
Closed starts cannot spend; old ON queues stay inert. Paid closed Studies finish
once with original work/speed/Mote intent; backup/recovery remain idempotent.

Deed credit/683-Comet pool stay; Every Path targets five retained original Studies.
Slots2/3/4/5 at Rift1/40/60/90; Inquiry reduction/rounding/paid snapshots
stay. Forge20/60 remain reachable through charge. Two PR70/7284cf7 clock fixes
resolve the2s Farm stall.

F26/85 retires/refunds Reserves in original currencies, idempotent schema2:
Lab6/Forge4/Tree3 remain. Shared12h replaces the Study-only tail; old Lab rate stays.
F25/78 remembers bulk without purchase ownership.
PR66 caps Echo6/Bonds20 and enforces exact Prism debits, preserving old raw levels.
PR89 refunds/naming, PR88 charge cap and Lab62/Forge64 proposals stay separate.

## Acceptance and next action

Check purchases/queues/old values/paid completion, Deeds/slots/Inquiry,
chronology/live/offline/save/recovery/Ascend;
UI320/390/430px,200% text,44px controls, focus/contrast/reduced motion.
[Receipts](../qa/upgrade-identity-001/2026-10-08/README.md): CI37740566328 PASS167
scenarios/17 negatives/all gates; integrated19/23 and Auto-Ascend mobile PASS.
Signed148/151 identity/digest/CRC526/all15 assets, extracted19/23 and V8129+8h
PASS. Version-bound evidence stays historical. Self-review only.
PR93 body records current full CI/head/outcome and final integrated checks.

Next: [required native checks](../qa/upgrade-identity-001/2026-10-08/DEVICE_ACCEPTANCE.txt),
saving exact APK/device/results in GitHub. No phone/USB/ADB/emulator supplied;
affected-phone/exact WebView60/TalkBack OPEN. Keep task/chat open.
