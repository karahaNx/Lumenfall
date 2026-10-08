# LOADOUT_MEMORY_001 — automatic Forge bulk preference (F25)

Status: in progress; current-main candidate prepared, integration/APK acceptance pending.
Owner: this feature chat. No subagents or message tools used. Runtime model/effort
identity is not verifiably exposed; the original recommendation is not an execution receipt.

## Goal and sources

Remove the purchasable/nameable convenience feature; Forge remembers its bulk
choice automatically from the start, across screen changes and restarts. Formation
F14, offline-cap F26 and the new Comet content F27 are separate tasks.

Original [F25 requirement](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
The user's [exact correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt) says to remove
it entirely because the game is not on the market. Applied decision: no shop row,
product name, refund, wallet credit, historical UI message or new save field;
retain automatic remembering and existing save value. Latest instruction,
8 October 2026: “Finish the feature task push to github implement to game”.

[Revision/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[evidence findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt)
and [source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt)
were read in the earlier local preparation. Original feedback outranks proposals.
Current [AGENTS](../../AGENTS.md), [bootstrap](../../PROJECT_BOOTSTRAP.txt),
[state](../PROJECT_STATE.md), [workflow](../project/FEATURE_WORKFLOW.md),
[setup](../project/CODEX_START.md), [context index](../CONTEXT_INDEX.md),
[ownership guidance](../CHAT_OWNERSHIP.md) and [gameplay guidance](../agents/02_GAMEPLAY.md)
were reread from live main at resumption. Current rules supersede historical
Lead/writer gates; assigned scope and standing authorization cover delivery.

## Baseline, implementation and preserved behavior

Live baseline: b0537cb (8 October 2026); index SHA256
5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Isolated worktree /workspace/Lumenfall-LOADOUT_MEMORY_001-live, branch
feature/loadout-memory-001. Original checkout and prior local proposal remain untouched.
PR46 is merged at20aaae62; B2 is integrated through PR57. At startup there were
no open PRs or active runs in the relevant latest-run snapshot. Main is rechecked
before integration to serialize any overlapping work.

F27/PR69 already removed the old catalog row and preserves ownership in
legacyCometPurchases. Its catalog prices, Trial/cosmetic mechanics, Auto-Ascend,
legacy Rest Stop completion and offline effects remain unchanged. No older local
product patch is replayed over this live baseline.

The remaining two legacy-ownership gates in Forge selection/init are removed.
Every valid choice uses the existing immediate saveState path (primary/recovery)
and normalized savedLabMultiplier on startup. Default1x and allowed
1/5/10/25/50/100/Max are unchanged. Existing canonicalization transfers old raw
owned.rememberbulk into legacyCometPurchases; that archival value remains
idempotent and is used only by the accepted historical Rest Stop entitlement,
never as a Forge-memory gate. Repeated import/recovery retains the full wallet
snapshot without refunds. No balance, schema, Formation or paid Lab work changes.

Changed files: root index.html; focused tests/behavioral/loadout-memory.cjs;
run.cjs/scenarios.json register two default regression scenarios; this task,
user-decision record and scoped evidence/status. Existing assertions/gates are retained.

## Acceptance

- All seven choices available without ownership; real touch/keyboard choice,
  immediate two-slot save, screen switching and cold reload preserve the choice.
- No retired product name/shop row; stale/unknown purchase calls cannot debit.
- Legacy/current malformed saves, recovery and repeated backup restore preserve
  ownership, currency and unrelated game state. No new compensation fields.
- Preserve deterministic Forge bulk/Max/queue plans, chronological simulation,
  live/offline parity, Lab payments and fixed Luminous Motes rewards.
- Verify320/390/430px,160% text,44px controls, keyboard focus, contrast and reduced
  motion; preserve WebView60-compatible source, package com.lumenfall.app and signer.
- Relevant current CI gates pass before merge; reassess integrated bytes and
  publish/verify APK. Record necessary native/device acceptance honestly.
- Save task/status/evidence in GitHub; stop shared edits. Archive this chat only
  after required acceptance. An open PR or published APK alone is not completion.

## Checks and next action

Evidence: [current baseline reproduction](../qa/loadout-memory-001/current/baseline.json).
The focused test fails on baseline at “cold start restores unowned25x” after438
checks, proving the old ownership gate. Harness adaptation's initial syntax error
was corrected before this reproduction; it was a test-edit error, not game behavior.
Current source validation, APK-verifier self-test and Node-tooling checks PASS.
Focused candidate:1127 checks PASS, six320/390/430px normal/160% reduced-motion
profiles. Four causal mutation controls PASS (expected exit1): stale purchase
debit, lost archived ownership, old startup gate and missing immediate save.
Both inline scripts parse as ES2017 (Acorn8.19.0). Screenshots320px/large and
390px/normal inspected. Stock local forge-contracts still times out with
Chromium151; this limitation is recorded, not counted as PASS. Required normal
GitHub CI is next. Native timing is not inferred from these paused-
interval fixtures; existing simulation assertions will be reassessed separately.
Self-review is not independent review. No physical device or TalkBack result is claimed.

Previous local candidate20b8b2e/baselineb2a1f44 and its1133 checks are historical;
its refund proposal was dropped and none of those receipts accept current bytes.
Current F27 normalization/catalog supersede that candidate's local save/shop edits.

Next: finish current checks, publish coherent branch/PR, wait for required CI,
merge only this small delta, verify integrated source and signed APK, save the
remaining required device checklist. Feature/chat remains open until acceptance.
