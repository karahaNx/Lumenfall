# LOADOUT_MEMORY_001 / F25 — automatic Forge bulk preference

Status: integrated; PR97 delivery CI/native acceptance pending.
Owner: this feature chat; no subagents/messages. Model/effort not verifiably exposed.

Original [F25](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
[User correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt): remove the named feature
because the game is not released. Forge remembers from first use/screens/restart;
no memory shop/name/refund/credit/new field. Latest order: finish/push/implement.
Read [revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original/correction outrank proposals. Live startup/ownership/gameplay/workflow
read; standing scope approval supersedes old writer holds. No new rule.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Isolated
/workspace/Lumenfall-LOADOUT_MEMORY_001-live, feature/loadout-memory-001;
original checkout/old proposal untouched. PR46/B2 integrated via PR57.
[PR78](https://github.com/karahaNx/Lumenfall/pull/78) merged9c19664;
[PR97](https://github.com/karahaNx/Lumenfall/pull/97) saves delivery evidence.
F14/F26/F27 and other integrated features retain their separate scope.

Product delta: two ownership gates removed, immediate saveState/two-slot save.
Reuse savedLabMultiplier; default1x and1/5/10/25/50/100/Max unchanged. F27 already
removed the shop and archives owned.rememberbulk in legacyCometPurchases
idempotently; retain that old Rest Stop value, never a memory gate.
No F25 balance/schema/refund change. F26 separately migrates schema2/refunds old
offline24/48 at documented140/160 Comets: native fixture125→425 once, other
wallet/preference/archive preserved. Do not remove F26 credit or claim it as F25.
Changes: index.html, focused test/two registrations, task/decision/QA; necessary
Resonate selected-browser binding, with behavior/assertions retained.

Acceptance: seven unowned choices/touch/keyboard; immediate primary/recovery,
screen switches/cold restart; malformed/legacy/repeated recovery/backup value;
absent name/shop, stale debit rejection; deterministic bulk/Max/queue,
chronology/live-offline/fixed Motes;320/390/430px,160% text,44px controls,
focus/contrast/reduced-motion; WebView60 compatibility/package/signing.
Integrated gates, signed APK/native upgrade, GitHub status/evidence required;
missing necessary acceptance keeps chat open.

[QA](../qa/loadout-memory-001/current/README.md): baseline unowned25x failure;
four causal mutants plus missing-font/old staged-gate controls caught.
1139/six profiles,45x44px minimum, contrast7.49:1;22 scoped cases/ES2017/
437 V8 6.0 contracts PASS. Stock local dump-DOM timeout is FAIL; CDP runs unchanged
assertions. CI37743551318 PASS170/17/all gates; [receipt/full log](../qa/loadout-memory-001/current/final-ci.json).
Integrated9c19664 matches validated product/test bytes. Latest combined CI pending;
self-review only. Historical refund proposal/older receipts are superseded.

[Native](../qa/loadout-memory-001/native/README.md): signed APK150, build37746590452,
source91decbc (F26 after F25);149 superseded. Identity/CRC/all15 assets/extracted
V8 and1139 checks PASS. Exact143 cold restart/storage/value/preference baseline
PASS. First150 UI attempt hit a delayed Welcome dialog; driver now waits for a
normal save and dismisses return flow; attested baseline/update rerun pending.
Test-owned API27/WebView61, Node24; Node20 replay --experimental-websocket.
Real Motes may accrue; pure normalization verifies exact wallet before gameplay.
No physical/TalkBack/exact native WebView60 run claimed.

Next: finish native143→150/update/restart/handlers/geometry/AX and combined CI,
save final task/PROJECT_STATE/APK receipts, stop shared edits; archive only this
owner after all acceptance. Later source changes do not replace pinned receipts.
