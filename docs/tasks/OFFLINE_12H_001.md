# OFFLINE_12H_001 — common productive offline limit

Owner: this F26 feature chat. Integrated through
[PR85](https://github.com/karahaNx/Lumenfall/pull/85), commit
91decbc8e26744b21c26a21b20742be6ebca1d8e. Signed APK0.1.150 is published.
Native update and combined integrated CI acceptance remain OPEN; do not archive.
The user explicitly requested finishing, pushing to GitHub and implementing in game.

## Requirement and refund decision

“Lav cap til 12 timer og ikke mulighed for andet”:
[original F26](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[revision/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
One productive interval of at most12h covers earnings, combat/rewards, Lab and
automation. Remove productive Study-only tail and retired hours extensions.
Keep offline earning rate separate, paid/pending Lab work and endpoint consumption.

User decision: “Engangsrefund i de oprindelige valutaer efter dokumenteret
prisregel; bevar rå ownership og levels som historik.”
Extended Rest140/Deep Rest160 Comets; each Reserves purchase ceil(6 × 1.6^level)
Prisms. Schema1→2 retains archived ownership/raw levels and refunds each purchase
once. Deposits must preserve both balance and price exactly; otherwise retain
original-currency value in an exact decimal ledger. Canonical saves retry after
spending. Store calculated prices so V8 cannot reprice existing receipts. Schema1
has no transaction-price ledger; use the documented rule on the accepting runtime.
No BigInt in product. Currency and receipt commit through atomic primary save;
restore replaces the whole save instead of adding refunds to the current balance.

## Baseline, scope and preservation

Own checkout /workspace/offline-12h-preparation; original live-main baseline
b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Implementation branch
feature/offline-12h-001-current, validation head46cb51b; delivery branch
docs/offline-12h-001-delivery. Private proposal a70cfb1 was not shipped.
PR46/B2 accepted through PR57/20aaae62a4b6e46f8d75775085918eaba4e8de29.
Retain F27 archive/Rest Stop entitlement, PR77 confirmed restore, Formation autosave,
Resonate, Auto-Ascend UI, exclusive upgrade owners and PR78 Forge bulk memory,
which landed just before F26 integration. Current workflow supersedes historical
writer handover; only this checkout/task is modified.

index.html changes: fixed43200s policy, retired Reserves handlers/UI, refund
migration/ledger and relevant Deeds/Lab/encyclopedia/return copy. Focused tests and
affected schema/tail/refund expectations are in tests/behavioral.
[Evidence/replay](../qa/offline-12h-001/README.md).
Preserve chronology, queues/bulk, foreground processing-time live replay,
com.lumenfall.app, established signing and deterministic Luminous Motes.

## Acceptance and next action

- Full F26 regression PASS on integrated bytes:32 refund combinations,12/24/72h
  boundaries, paid Lab/queues/Motes, saved Auto-Ascend ON/OFF, endpoint/duplicate,
  failures/recovery/restore, huge balances and partial/deferred credit. Three F26
  causal mutants caught.
- Current ownership/926 effect observations, chronology/save/recovery/UI PASS.
  PR78 combined test PASS1139 checks. Nine320/390/430px profiles through200% text:
  44px/focus/contrast/reduced-motion/render purity PASS. All35 available negatives
  caught before the final PR78 merge.
- Integrated V8 6.0.286.52 without BigInt PASS; paid13h Study retains3600s after24h.
  Old/new receipts transfer at levels80/200/1000 unchanged.
- [CI37744077662](https://github.com/karahaNx/Lumenfall/actions/runs/37744077662)
  PASS170 scenarios/17 required negatives/smoke before PR78. Combined integrated
  full CI acceptance remains pending.
- [Android37746590452](https://github.com/karahaNx/Lumenfall/actions/runs/37746590452)
  PASS. APK150 package/version/signing,526 ZIP CRCs/all15 integrated assets PASS.
  Source SHA84ca8f6a50d0df5046c86ddb4a354850aca6273e4581e11b94acc95b10ae885f;
  APK SHA8ad8aeab6df7224e629c8a93805386a5c16851ffeb53e2f7338f42c76b0d79bc.
- Native signed144→150 update PASS: paid snapshot,300 Comets/32 Prisms credited
  once and matching primary/recovery. Dense cap replay exceeded the recorder's60s
  observation window; remaining native checks are OPEN. Physical WebView60,
  TalkBack and independent review are not claimed.

Next: finish native update/12h-vs24h/duplicate/UI/focus acceptance; pass combined
integrated CI; save immutable APKs/receipts and final PROJECT_STATE/task status in
GitHub. Stop shared-file work and archive only this chat after verified completion.
