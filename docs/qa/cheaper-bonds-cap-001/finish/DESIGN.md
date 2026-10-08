# F21 implementation and save/value review

Self-review of this feature only; no independent Core/QA approval claimed.
Current rules supersede old role-approval stages.

## Targeted implementation and value policy

- Display **Cheaper Recruitment**, keep persisted ID `bonds`. Explain recruiting
  and Empower discount accurately: +3 percentage points per level, maximum60%,
  minimum40% of normal price, cap20. Existing integer recruiting rounding remains.
- Canonical catalog metadata guards direct/stale/repeated calls before mutation,
  payment or save. UI shows Maxed and effective20/20, with raw history separately.
  Tree has no bulk/Max/queue/automation buyer. Existing achievement behavior for
  other nodes is outside F21; Echo/Formation/Tree-exclusive work stays separate.
- Original prices remain:19→20 costs2329, total through20 costs7507.
- Full one-time restitution in original Prisms for levels above20:
  `sum(ceil(2 * 1.45^k), k=20..raw-1)`. Level21:3376; level40:12655538.
  The103-commit price history is preserved in the historical archive. PR67's
  recorded user-approved original-currency policy agrees with this choice.
- Raw levels remain. Finite original prices are returned; levels beyond the
  first nonfinite/unpayable old price remain recorded as unpriced history.
  No guessed refund percentage, replacement effect, amount cap or BigInt product
  dependency is added. Exact original Number prices define the restitution.
- Exact TwoSum detection checks both operands. A refund that cannot be added
  without loss/overflow remains a same-currency credit, never silently truncated.
  Tree payments consume credits only when both subtractions are exact; otherwise
  those credits remain available for a representable payment. Existing Number
  wallet debit semantics are preserved. QA uses BigInt as an independent oracle.
- Wallet, remaining credits and versioned receipt share the same canonical
  snapshot. Existing save/restore transactions persist them together. Repeated
  normalization/reload/recovery/restore is idempotent. Restore replaces the whole
  normalized snapshot; it never adds the old refund to the current wallet.
  Partial/orphan receipts reject for recovery instead of silently recrediting.
- Generic receipt/credit history from other features is retained. Schema remains
  additive v1. Unsupported/newer markers fail safely. Old-APK downgrade that
  strips additive receipts is not supported; use new-APK backups for restoration.
- Paid Lab snapshots, other currencies, chronology/offline and permanent
  ownership survive. No prices/effects/caps outside F21, signing/assets/package,
  unrelated tools or historical originals are changed.

