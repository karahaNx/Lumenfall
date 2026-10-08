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
  those credits remain available for a representable payment. Wallet debits also require exact subtraction. Prices remain unchanged;
  an unrepresentable debit is refused instead of charging a rounded/free amount. QA uses BigInt as an independent oracle.
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


## PR89 review corrections

P1: actual raw95 restitution could create a wallet above integer precision. New refunds above the safe
integer range now stay as spendable credits; existing wallets are retained. All
Tree payments now check exact wallet subtraction as well as both credit
subtractions; representable payments still use the unchanged price. Regression
covers refusal/no save for1 Prism and a real exact2-Prism debit.

P2: every receipt amount now matches the original rounded price schedule, not
only its sign/count. Exact cross-engine equality would reject valid data:
Node8/V8 6.0 and Node24 differ at1822 finite prices, by up to494 ULPs. The
exponent-scaled relative rounding envelope k*EPSILON/(1-k*EPSILON) is applied
before ceil. Small prices (including3376) require the exact integer. Stored
amounts are retained byte-for-number; validation never reprices or recredits.
Full finite price arrays pass in both engine directions; [1], [3375], [3377]
receipts reject for recovery. This numeric envelope changes no gameplay prices.

Further P2 corrections: the40% floor/60% cap is now explicitly before existing
whole-Lumen rounding (e.g. normal Ember2 costs13, discounted costs5). No price
changes. The finite original schedule and cross-engine bounds are cached once,
limited by the first nonfinite price. Completed receipts no longer rebuild a
refund array or repeat exponentiation; every persisted amount is still validated.
The redundant second receipt/history clone is removed.100 raw2000 canonical
boundaries perform zero repeated price calculations; corrupting a completed
receipt afterwards still rejects. A causal uncached-price mutation detects the
performance regression. The cache never contains player data or exposes arrays
to saved state.

Main91decbc (PR78/85) integration retains Forge memory, the common12-hour cap,
save schema2 and retired Reserves guard. F21 record version remains1 within the
schema2 save. Legacy fixtures explicitly start at schema1; v0, both old-currency
refunds, both receipts and the pre-existing F21 receipt through schema2 transition
are checked. Five added checks pass; existing full offline catch-up16 records
pass with both exact additive F21 defaults and all upstream F26 assertions.

PR89 P2 credit-record correction: every Prism credit requires a plain record,
nonempty string ID and finite positive integer amount. Own credits also require
the valid own receipt. Null/malformed/fractional entries reject for recovery;
valid foreign integer credits remain. Nine malformed cases, actual null/0.5
primary recovery and the V8 6.0 probe pass; a credit-record defect control detects
removal of validation. No legitimate price, credit or currency is rounded.

Main14d5f3a (Rift guidance and Formation delivery) merges cleanly. Current533
focused assertions,10 causal controls,926 clarity and V8 6.0 pass on the combined
source. The earlier full offline16-record check used c54856a source before the
credit-record/Rift changes; final required full CI verifies the current bytes.

Mainac0d28e includes PR66 Tree identity/cap/UI and PR95/96 acceptance records.
Its getNodeBuyPlan remains the shared handler/UI planner, preserving actual
catalog-object identity, unlock/retired nodes, finite cost, increment and Echo6
guards. Exact Prism wallet/credit payment is added to that plan; all buys use
its canonical level and payment. QA resolves real catalog nodes, separately
checks forged-object refusal, and retains all original Tree state assertions
with the explicit additive F21 history expectation. Current534 focused checks,
10 causal controls,155 Tree contract checks,693 Tree mobile checks,926 clarity
and V8 6.0 pass on81fcc461 source. Full required176-scenario CI remains pending.

PR89 automated P2 (review70e6f82) correctly identified repeated cloning/scanning
of large F21 records at each simulated Ascend. The private internal simulation
now calls the same gameplay normalizer while retaining untouched, already
canonical F21 record references. This path cannot import saves; every load,
backup restore/export and persisted save still fully validates all records.
Schema2 and all other gameplay/offline-refund normalization stay in force.
Actual14400 raw2000 auto-Ascends take323ms locally, perform zero F21 record
normalizations, preserve identity/exact values and match full normalization.
A specific ascend-copy mutation restores the slow path and is caught. Existing
chronology live/offline/split passes on0e93a8e9 source. Timing is local evidence,
not a physical-device performance claim.
