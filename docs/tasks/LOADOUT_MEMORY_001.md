# LOADOUT_MEMORY_001 / F25 — automatic Forge preference

Status: integrated; PR97 final combined CI/integration pending. Native PASS.
Owner: this chat; no agents/messages; model not exposed.

Original [F25](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
[Correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt): remove the named feature;
unreleased game. Forge remembers from first use/screens/restart. No memory
shop/name/refund/credit/new field.
Read [revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt), live rules read. Standing scope approval; no new rule.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Private
/workspace/Lumenfall-LOADOUT_MEMORY_001-live; feature/loadout-memory-001-delivery.
PR46/B2 integrated via PR57. [PR78](https://github.com/karahaNx/Lumenfall/pull/78)
merged9c19664; [PR97](https://github.com/karahaNx/Lumenfall/pull/97) delivers QA.
Preserve06b28d5 Tree/Rift/F07/F14 dependencies.

Scope: remove two ownership gates and save each choice immediately to both slots.
Reuse savedLabMultiplier/default1/1,5,10,25,50,100,Max. F27 archives rememberbulk idempotently; retain Rest Stop value.
No F25 balance/schema change.
F26 separately migrates schema2/refunds offline24/48 at140/160:125→425 once.
index.html/test/registrations/docs; Resonate browser binding retains assertions.
Native helper validates actual app-private archives.

Acceptance: seven unowned choices/touch/keyboard, immediate two slots/screens/cold
restart; malformed/legacy/repeated recovery/backup; absent name/shop/stale debit;
deterministic bulk/Max/queue, chronology/live-offline/fixed Motes;320/390/430px,
160% text/44px controls/focus/contrast/reduced-motion; WebView60/package/signing;
integrated CI, signed APK/native update and durable GitHub evidence.

[QA](../qa/loadout-memory-001/current/README.md): baseline/four mutants/missing-font/
staged-gate negatives caught;1139/six profiles,45x44px,contrast7.49:1;22 scoped
cases/ES2017/437 V8 6.0 PASS. Local transport FAIL; CDP assertions unchanged.
CI37743551318 PASS170/17; 9c19664 byte match/fresh1139 PASS.
CI37750060223 PASS173/17/all gates on14d5f3a; current-main reassessment pending.
Self/automated review only.

[Native](../qa/loadout-memory-001/native/README.md): signed/published APK150,
build37746590452/source91decbc; identity/CRC/15 assets/extracted V8/1139 PASS.
Native choices/two slots/screens/restart/mobile/keyboard/AX PASS.
Old error capture INVALID/retained. Corrected143→150 upgrade PASS:
identical validated101888-byte database/legacy25x/wallet/cold restart;
F26 credit once, no memory credit. Task-owned API27/WebView61/Node24; Node20 replay
--experimental-websocket. Real Motes accrue; pure wallet checks PASS.
No physical/TalkBack/exact native WebView60 claim.

Next: final CI/PR97/main checks; save status/evidence, stop edits, archive only
this owner after all acceptance. Missing checks stay open.
