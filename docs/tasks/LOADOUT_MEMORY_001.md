# LOADOUT_MEMORY_001 / F25 — automatic Forge preference

Status: integrated; PR97 final combined CI/integration pending; native PASS.
Owner: this feature chat; no subagents/messages. Model/effort not exposed.

Original [F25](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
[Correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt): remove the named feature;
game is unreleased. Remember Forge from first use/screens/restart; no memory
shop/name/refund/credit/new field. Latest order: finish/push/implement.
[Revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Live rules read; standing scope approval applies.

Baseline b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Isolated
/workspace/Lumenfall-LOADOUT_MEMORY_001-live, feature/loadout-memory-001-delivery;
PR46/B2 integrated via PR57.
[PR78](https://github.com/karahaNx/Lumenfall/pull/78) merged9c19664;
[PR97](https://github.com/karahaNx/Lumenfall/pull/97) delivers evidence/fixes.
Preserve separately accepted features.

Product: remove two ownership gates; immediate saveState/two-slot save.
Reuse savedLabMultiplier; default1 and1/5/10/25/50/100/Max unchanged. F27 removed
shop and archives owned.rememberbulk idempotently; preserve old Rest Stop value,
never a memory gate. No F25 balance/schema/refund change. F26 separately migrates
schema2/refunds offline24/48 at140/160 Comets: fixture125→425 once; other wallet,
preference/archive preserved. Preserve F26 credit, never claim it as F25.
index.html/test/registrations/docs; Resonate browser fix retains assertions.
Native capture uses app permissions and rejects error-output hashes.

Acceptance: seven unowned choices/touch/keyboard; immediate primary/recovery,
screens/cold restart; malformed/legacy/repeated recovery/backup value; absent
shop/name/stale debit rejection; deterministic bulk/Max/queue, chronology,
live/offline/fixed Motes;320/390/430px,160% text,44px controls,focus/contrast/
reduced-motion; WebView60 compatibility/package/signing. Integrated CI, signed
APK/native upgrade and GitHub evidence required; missing acceptance keeps chat open.

[QA](../qa/loadout-memory-001/current/README.md): baseline/four causal mutants/missing-font/staged-gate controls caught.1139/six profiles,45x44px
minimum/contrast7.49:1;22 scoped cases/ES2017/437 V8 6.0 PASS. Local dump-DOM timeout is FAIL; CDP retains assertions. CI37743551318
PASS170/17/all gates; [full receipt](../qa/loadout-memory-001/current/final-ci.json).
Integrated9c19664 matches validated product/test bytes; fresh1139 PASS. Later
14d5f3a F07/F14 source1139 PASS; CI37750060223 all gates PASS. Latest mainac0d28e Tree
changes must remain preserved and reassessed. Self/automated review only.

[Native](../qa/loadout-memory-001/native/README.md): signed/published APK150,
build37746590452/source91decbc (F26 after F25). Identity/CRC/all15 assets,
actual extracted V8/1139 checks PASS. Actual150 unowned taps/two-slot saves/
screens/restart/320/390/430px/keyboard/AX PASS. Old database capture was shell
error text: INVALID, retained as diagnostic. Corrected run-as/tar/data/save-key capture and143→150 upgrade PASS: identical
101888-byte database, legacy25x/wallet and repeat cold restart. Delayed Welcome flow
is awaited before input. Task-owned API27/WebView61/Node24; Node20 replay needs
--experimental-websocket. Real Motes accrue; pure migration checks exact wallet.
No physical/TalkBack/exact WebView60 claim.

Next: finish final required CI; integrate PR97,
verify final main, save task/PROJECT_STATE/APK/evidence and stop shared edits.
Archive only this owner after all acceptance; later unrelated source is separate.
