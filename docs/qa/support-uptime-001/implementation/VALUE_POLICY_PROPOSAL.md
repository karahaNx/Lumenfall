# Implemented purchase-value policy

The user delegated the remaining choices with “Do what makes sense” after ordering completion and game delivery. Exact instructions are in USER_CONTINUATION.txt.

Keep Tide/Aurora Ultimate ownership, rarity/history, additive +50% strength and earned deadlines. Future casts use1.5s. No Sigil refund: the purchased Ultimate remains owned and retains its improved duration/strength over the normal1s/+25% cast.

Keep historical Swift levels while enforcing effective/purchase cap10. Refund original individually rounded prices once: sum(ceil(30 * 1.55^k), k=10..L-1), restricted to finite original prices. Legacy saves have no bulk purchase receipts; this is reconstructed individual-curve compensation, not audited exact spending. Level11/25/60 credits2402/3122089/14343675624911 Shards.

A receipt in feedbackMigration.receipts['forge.charge'] uses PR67's namespace. Refunds enter the Number wallet only when both operands are preserved exactly; otherwise exactRefundCredits.shards stores a decimal integer. Every Shard handler, preview, Max/queue and economy boundary can spend it. Small prices debit exact credits; larger purchases preserve credits when ordinary wallet spending suffices. Fractional earned Shards remain. Repeated canonicalization/reload/recovery does not refund again. Restoring an older complete backup replaces the snapshot before migration. Reset starts a fresh history; Ascend keeps Shards/receipts. No global cross-snapshot refund accumulator exists.

PR67 remains an unmerged broad candidate. Its later integration must preserve exactRefundCredits and the shared receipt, and use compatible spending helpers; do not replace this with its earlier lossy Number-only ledger. No other caps, refunds or retirements are implemented here. Native old143→new signed APK acceptance and required CI remain necessary.
