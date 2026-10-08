# LOADOUT_MEMORY_001 / F25 — automatic Forge preference

Status: integrated; PR97 final combined CI/integration pending. Native PASS.
Owner: this feature chat; no subagents/messages; model/effort not exposed.

Original [F25](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
[Correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt): remove the named feature;
unreleased game. Forge remembers from first use/screens/restart. No memory
shop/name/refund/credit/new field. Latest order: finish/push/implement.
Read [revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt), live startup
and ownership/gameplay/workflow. Standing scope approval applies; no new rule.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Private
/workspace/Lumenfall-LOADOUT_MEMORY_001-live; feature/loadout-memory-001-delivery.
PR46/B2 integrated via PR57. [PR78](https://github.com/karahaNx/Lumenfall/pull/78)
merged9c19664; [PR97](https://github.com/karahaNx/Lumenfall/pull/97) delivers QA.
Current06b28d5 includes separately accepted Tree/Rift/F07/F14 changes; preserve them.

Scope: remove two ownership gates and save each choice immediately to both slots.
Reuse savedLabMultiplier/default1/1,5,10,25,50,100,Max. F27 retired shop and archives
rememberbulk idempotently; retain old Rest Stop value. No F25 balance/schema change.
F26 separately migrates schema2/refunds offline24/48 at140/160:125→425 once.
Changes: index.html/test/registrations/docs; necessary Resonate browser fix retains
assertions. Native helper now validates app-private archives instead of error hashes.

Acceptance: seven unowned choices/touch/keyboard, immediate two slots/screens/cold
restart; malformed/legacy/repeated recovery/backup; absent name/shop/stale debit;
deterministic bulk/Max/queue, chronology/live-offline/fixed Motes;320/390/430px,
160% text/44px controls/focus/contrast/reduced-motion; WebView60/package/signing;
integrated CI, signed APK/native update and durable GitHub evidence.

[QA](../qa/loadout-memory-001/current/README.md): baseline/four mutants/missing-font/
staged-gate negatives caught;1139/six profiles,45x44px,contrast7.49:1;22 scoped
cases/ES2017/437 V8 6.0 PASS. Local dump-DOM timeout is FAIL; CDP retains assertions.
CI37743551318 PASS170/17; integrated9c19664 product/test bytes match; fresh1139 PASS.
CI37750060223 PASS173/17/all gates on14d5f3a; current-main reassessment pending.
Self/automated review only.

[Native](../qa/loadout-memory-001/native/README.md): signed/published APK150,
build37746590452/source91decbc; identity/CRC/15 assets/extracted V8/1139 PASS.
Actual150 unowned choices/two slots/screens/cold restart/mobile/keyboard/AX PASS.
Old database error capture INVALID, retained. Corrected143→150 upgrade PASS:
identical validated101888-byte database, legacy25x/wallet/repeated cold restart;
F26 credit once, no memory credit. Task-owned API27/WebView61/Node24; Node20 replay
--experimental-websocket. Real Motes accrue; pure migration checks exact wallet.
No physical/TalkBack/exact native WebView60 claim.

Next: final required CI, PR97 integration, final main check and saved status/evidence;
stop shared edits, archive only this owner after all acceptance. Missing checks stay open.
