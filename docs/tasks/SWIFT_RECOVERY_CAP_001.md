# SWIFT_RECOVERY_CAP_001 — bounded ability recovery

Status: [PR88](https://github.com/karahaNx/Lumenfall/pull/88), blocked on Deed
progression choice; not integrated/released. Owner: this feature chat.
Branch `feature/swift-recovery-cap-001`, `/workspace/Lumenfall-swift-recovery`.
No subagents/messages. Current workflow supersedes historical Lead/writer gates.

One goal: one cap and positive cycle across UI, single/bulk/Max/queue handlers
and live/offline simulation, with preserved old purchase value.

## Requirements and baseline

[Original request/corrections](SWIFT_RECOVERY_CAP_001_REQUEST.txt). F19:
“Jeg tænker swift recovery Skal have et cap, ellers kan vi nå et punkt, hvor
abilities bliver instant.” Sources:
[original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
F18/F19/save and registered-decision source paths are in the original request.
User wants balance neither too easy nor too hard and requested finishing,
pushing to GitHub and implementing in the game on 8 October.

Initial main: `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
PR46/B2 merged via PR57 `20aaae62a4b6e46f8d75775085918eaba4e8de29`.
Current candidate includes main14d5f3a: PR84/90, remembered bulk, shared12h
offline/schema2 and stable Rift guidance. Preserve those changes.

## Decisions and dependencies

[Approved contract](../qa/swift-recovery-cap-001/implementation/approved-balance-contract.md)
copied from PR67 commit52fa48db51ed6ce58704ec17c593ee68710394e0,
`docs/requirements/all-27-feedback-001/balance-contract.md`:

- Cap10, effective level `min(raw,10)`, +8% per effective level;
  cycle `max(10/3,6/(1+0.08*effectiveLevel))` seconds in UI/motor.
  Ready resources/paid Resonate remain; buying preserves current charge percent.
- F18 duration stays separate: current4s/8s retained, approved1s/1.5s recorded.
- Keep raw levels, earned Deeds, queue intent and paid Study work. Refund
  purchases above10 at `ceil(30*1.55^oldIndex)` Shards each. Approved individual
  prices compensate old saves; missing bulk receipts prevent reconstruction.
- Optional Swift receipt v1 coexists with save schema2. Exact hex refund/credit
  records raw range and first nonfinite price. No product BigInt; bounded
  migration preserves finite prices and huge raw history, inventing no prices.
- Money/receipt persist together; all Shard consumers use the credit. Backup
  replaces the whole snapshot; Ascend retains; Reset clears. Future PR67
  compensation must reconcile this receipt once, avoiding a second refund.
- Farm fixes are upstream; Study work derives from the same canonical grid.
  Durations/speeds/tolerances remain. Exact reference adaptation is documented.

PR90 retires the other four original Forge buying tracks; cap10 makes fresh
Forge20/60 Deeds unreachable. [Pending proposal](../qa/swift-recovery-cap-001/implementation/deed-continuity-proposal.md):
keep thresholds/rewards and count future completed replacement-Lab levels,
with a one-time baseline and no retroactive Lab credit. User choice is pending;
no such rule is implemented. Do not integrate the broken progression route.

## Acceptance and checkpoint

Changed: index.html, targeted behavioral harness/Forge checks, Swift core/UI
coverage and own QA/task docs. Preserve retired tracks/effects, chronology,
deterministic purchases, fixed Motes, WebView60, com.lumenfall.app and signing.
Required: cap/price/budget/queue boundaries; cast timing; live/offline/split;
old/malformed saves, primary/recovery/backup/failures, Ascend/Reset, huge-wallet
value;320/390/430px,200% text,44px controls, focus/contrast/reduced motion.
Current CI, integrated checks and signed APK/native update must pass.

Current319e69d: core14/110, five mutants, shared12h/replay, mobile12 and V8 pass.
Full CI/integration/signed update pending.
Earlier passes/diagnostics are source-labelled in QA; no superseded full claim.
Signed143 cold/storage
preparation passes with Auto-Empower OFF; Swift update pending.
[Evidence/limitations](../qa/swift-recovery-cap-001/implementation/README.md).
No independent review, physical Android, TalkBack or exact WebView60 claim.

Next: complete current-main checks/push, record the Deed choice, implement its
agreed continuity and pass CI before integration; then signed APK/native
acceptance and durable final status. Keep this chat open until all acceptance;
archive only its owner after completion. A local candidate/PR is unfinished.
