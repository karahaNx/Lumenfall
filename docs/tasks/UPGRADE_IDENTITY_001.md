# UPGRADE_IDENTITY_001 — exclusive upgrade ownership (F29)

Owner: this feature chat. Integrated; required device acceptance OPEN.

[User request](UPGRADE_IDENTITY_001/USER_REQUEST.txt): common Lab/Forge/Tree effect
and currency matrix, duplicate decisions, stacking and purchased-level value.
[Original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
takes precedence over proposals. [User correction](UPGRADE_IDENTITY_001/USER_CORRECTION.txt):
Workshop currencies stay unchanged. On8 October: “Finish the feature task push
to github implement to game”.

## Baseline and scope

Private checkout `/workspace/Lumenfall-upgrade-identity-001`, branch
`feature/upgrade-identity-001`; original baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5.
Candidate78885d61 passed CI; [PR90](https://github.com/karahaNx/Lumenfall/pull/90)
merged31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6 including PR84 Auto-Ascend.
Delivery PR93 rebases docs only onto14d5f3a3a78fe8b63cfa5544efc54f41217b65a5,
preserving subsequent F07/F25/F26/F14 integrations/tests. PR46/B2 merged via PR57.
No subagents/messages or other-chat edits.
[Original proposal/checks](UPGRADE_IDENTITY_001/PROPOSAL_2026-10-07.txt) stay historical.

Scope:24-row contract, purchase/queue eligibility, legacy UI, Deeds and clock fixes.
Preserve recipes/work/rounding, deterministic purchases/Mote rewards, save/recovery,
WebView60, com.lumenfall.app and signing.

## Decisions and dependencies

[Final matrix](UPGRADE_IDENTITY_001/MATRIX.md): fuse ten duplicate buying tracks
into existing verified effects; fourteen remained at PR90. Lab owns damage/kill
research, Mote yield/work reduction; Forge owns ability charge/damage/cast resources/
encounter chance; Tree owns Ascend/offline/recruitment.
All24 raw IDs/old operands/order remain. Closed paid bonuses are read-only;
no F29 refund/conversion/destination credit/extra ledger/schema bump. Closed
starts reject without spending; old ON queues stay inert. Paid closed Studies
finish once with original work/speed/selected Mote intent. Recovery is idempotent.

Original Deed credit/683-Comet pool stay; Every Path targets five original retained
Studies. Slots stay2/3/4/5 at Rift1/40/60/90. Inquiry rounding/reduction and paid
snapshots stay. Forge20/60 remain reachable through uncapped charge.

F26/PR85 subsequently retires/refunds Deep Reserves in original currencies using
an idempotent schema2 receipt; current tracks Lab6/Forge4/Tree3. Shared12-hour
productive window supersedes the old Study-only tail; old Lab offline-rate value
stays. F25/PR78 remembers bulk without purchase ownership. F18/F19/F28 tuning,
Tree caps PR66 and proposed Lab PR62/Forge PR64 mechanics stay separate.
PR70/7284cf7 canonical-grid/endpoint-fraction fixes resolve the saved-queue2s Farm
stall. Its other work is excluded; old-engine comparisons keep exact assertions.

## Acceptance, checks and next action

Verify authoritative handler/bulk/queue rejection, old values/paid work once,
Deeds/slots/Inquiry, chronology/live/offline and real save/reload/backup/recovery/
Ascend. UI320/390/430px,200% text,44px controls, focus/contrast/reduced motion.
[Delivery receipts](../qa/upgrade-identity-001/2026-10-08/README.md): CI37740566328
PASS167 defaults/17 negatives/all gates; integrated19 scenarios/23 runs and
Auto-Ascend mobile PASS. Four numerical profiles exact; self-review only.

Signed APK0.1.148/build37742868726: package/signing/release digest/526 CRC/all15
assets PASS; actual extracted V8 6.0 PASS129 checks plus8h302400 kills/14400
Ascends. Immutable148 proves31eccfb; later moving releases are separate versions.
Delivery PR93 body records current combined CI head/run/outcome.

Next: [required native/device checks](../qa/upgrade-identity-001/2026-10-08/DEVICE_ACCEPTANCE.txt)
on immutable148, saving observed results in GitHub. No phone/USB/ADB/emulator
runtime here; affected-phone/exact WebView60/TalkBack OPEN. Keep task/chat open.
