# Purchase-value choices still pending

The two asynchronous questions in this chat have not received answers. The
approved timing contract is implemented and published; no proposed answer is
treated as a submitted answer. This document is a reviewable save-transition
proposal, not an implemented migration or release approval.

## Tide/Aurora Ultimates

Keep Ultimate ownership, rarity, paid history, additive strength and already-earned
buff expiry. Future casts follow the approved1.5s duration. The question is whether
that retained ownership should receive no Sigil refund, or whether the reduced
future duration needs additional compensation before release. If compensation is
chosen, record its exact rule before changing currency balances. Do not reset or
resell an owned Ultimate.

## Swift above10

Proposed: keep raw historical levels, apply cap10 to effects/purchases, and credit
the original individually rounded Shard curve above10 once. For historical levelL,
the nominal refund is `sum(ceil(30 * 1.55^k), k=10..L-1)`, restricted to the original
finite representable purchase range. Measured nominal examples:

| Stored level | Nominal Shard credit |
|---|---:|
|11|2,402|
|25|3,122,089|
|60|14,343,675,624,911|

Legacy saves do not record whether purchases used single-level or bulk rounding.
This is reconstructed individual-curve compensation, not a claim of exact audited
historical spending. Preserve an idempotent receipt and any small credit that would
round away beside a large Number wallet; credited value must remain spendable.
Primary/recovery/backup canonical reload must retain it. Restoring a complete old
snapshot must not add a refund to balances retained from a different snapshot.

PR67's task and balance contract report approval for original-currency overcap
refunds and use the same individual-curve policy. That is reported coordination
evidence; this chat's pending answers are not inferred from it. After approval,
reconcile the receipt namespace with that dependency to avoid duplicate credits.

Required transition checks: levels0/9/10/11/25/60/100; direct/bulk/Max/queue gates;
no value loss beside large wallets; repeated normalize/load/save/recovery/backup
restore; malformed/extreme history; live/offline purchases and exact debit; old
Ultimates/earned deadlines; signed in-place native update and cold/resume recovery.
Run required CI again after any product/save transition change. Until then, keep
PR82 draft and the feature open; no main integration or APK release is claimed.
