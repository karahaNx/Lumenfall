# LOADOUT_MEMORY_001 / F25 — automatic Forge bulk preference

Status: integrated; delivery PR97 CI/native acceptance pending.
Owner: this feature chat; no subagents/message tools. Runtime model/effort is not
verifiably exposed; startup recommendation is not an execution receipt.

## Requirement and decisions

Original [F25](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
The [user correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt) removes the named
feature because the game is not released. Forge remembers automatically from
first use, screen changes and restart. No memory shop/name/refund/credit/history
message/new save field. Preserve raw ownership, wallet and saved preference.
Latest instruction: “Finish the feature task push to github implement to game”.

Read [revision/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original/user correction outrank proposals. Live startup/workflow/ownership/gameplay rules read; standing scope approval
supersedes historical writer holds. No new rule.

## Baseline, scope and integration

Initial main b0537cb; index SHA256
5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Isolated /workspace/Lumenfall-LOADOUT_MEMORY_001-live,
feature/loadout-memory-001; original checkout/old20b8b2e proposal untouched.
PR46/B2 already integrated via PR57. F14/F26/F27 are separate features.

[PR78](https://github.com/karahaNx/Lumenfall/pull/78) merged at
9c19664a80e4637b10dd955bb63630f776acacde. Product/test/tooling/workflow bytes
equal validated e1115f6. Later F26/PR85 merged at91decbc; its build150 superseded
cancelled149. Memory gates remain removed. Final receipt checks the150 combination.

Product delta: remove two legacy ownership gates and immediately save every
selection through existing saveState/two slots. Reuse savedLabMultiplier;
default1x and1/5/10/25/50/100/Max unchanged. F27 already removed the shop and
archives owned.rememberbulk idempotently in legacyCometPurchases. Keep that old
Rest Stop value; it never gates memory. Preserve other systems/schema/balance.
F26 separately refunds old offline24/48 for documented140/160 Comets, preserves
history and moves saves to schema2; F25 adds no memory refund. Actual143 test save
owns both caps: expected150 wallet425=125+300, unchanged17 Prisms/20 pre-gameplay
Motes, preference25 and archive. F26 credit must occur once.

Changed index.html, focused test/default registrations, task/decision/QA.
Resonate launcher forwards the selected browser; assertions/behavior unchanged.

## Acceptance and checks

- Seven unowned choices, touch/keyboard, immediate primary/recovery save, screen
  switches/cold restart, malformed/legacy/repeated backup/recovery preservation.
- Retired name/shop absent; stale calls cannot debit or erase entitlement.
- Deterministic bulk/Max/queue, chronology/live-offline parity and fixed Motes.
-320/390/430px,160% text,44px controls, focus/contrast/reduced motion;
  WebView60-compatible source, package com.lumenfall.app and established signer.
- Required CI on integrated bytes, signed APK/assets/native upgrade acceptance,
  GitHub task/state/evidence checkpoint; archive only this owner after acceptance.

Evidence in [current QA](../qa/loadout-memory-001/current/README.md) and
[native QA](../qa/loadout-memory-001/native/README.md). Baseline fails unowned25x
cold start; causal mutants catch purchase debit, lost ownership, old init gate
and missing immediate save. Missing staged fonts/old staged gate also rejected.
1139 checks/six profiles,45x44px minimum, contrast7.49:1;22 scoped cases,
ES2017/437 V8 6.0 contracts PASS. Stock local dump-DOM timeout is FAIL;
unchanged assertions pass via CDP. Browser fixtures do not prove native timing.

CI37743551318 PASS170 defaults/17 required negatives/all gates on e1115f6;
[receipt](../qa/loadout-memory-001/current/final-ci.json) and full compressed log
retained. Review findings resolved; superseded failures retained. Self-review only;
old20b8b2e/refund proposal never accepts current product.

Signed APK150 published; identity/CRC/all15 source assets and extracted V8 checks
PASS. Exact143 native cold restart/database/archive/value/preference PASS on
task-owned Android8.1/API27/WebView61.0.3163.98. Native150 upgrade underway:
database/credit once/choices/slots/screens/restart/geometry/taps/Space/focus/AX.
Advancing farm may earn documented Motes; pure normalization checks exact wallet
before gameplay. No physical/TalkBack/exact native WebView60 run claimed.
Replay: Node20 --experimental-websocket; actual runtimeNode24.

Next: complete150 native/combined CI, save final task/PROJECT_STATE/APK receipts
in GitHub, stop shared edits, then archive only this owner if all acceptance passes.
