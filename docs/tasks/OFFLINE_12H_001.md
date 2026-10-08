# OFFLINE_12H_001 — common productive offline limit

Owner: this feature chat. Original point F26. Status: implementation/checks in
progress; delivery and native acceptance remain open. User requested finishing,
pushing to GitHub and implementing in the game on 2026-10-08.

## Requirements and decisions

Original: “Lav cap til 12 timer og ikke mulighed for andet” in
[original requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
[F26 revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt)
and [accepted decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt)
require one productive interval of at most 12h across earnings, combat/rewards,
Lab and automation, without a productive Study-only tail. Offline earning rate
remains separate. Preserve already paid/pending Lab snapshots and avoid replaying
old periods. Retire Extended Rest, Deep Rest and Deep Reserves hours.

User refund decision: “Engangsrefund i de oprindelige valutaer efter dokumenteret
prisregel; bevar rå ownership og levels som historik.” Original prices are
140/160 Comets and each Deep Reserves purchase ceil(6 × 1.6^level) Prisms.
The earlier local proposal blocked large balances; it was never published.
Current implementation preserves unrepresentable original-currency deposits in
an exact decimal ledger with a paid bit per original price. Canonical saves retry
unpaid deposits after spending. The receipt stores the original calculated prices,
so different Math.pow rounding in old/new V8 cannot reprice a saved refund. This implements exact value preservation without
inventing compensation prices or blocking legitimate large saves. Product uses
no BigInt. Migration, currency credit and receipt use existing atomic primary-save
commit and recovery behavior. Restore replaces the entire save rather than adding
refunds to the current balance.

## Baseline and dependencies

Isolated checkout `/workspace/offline-12h-preparation`, branch
`feature/offline-12h-001-current`; live main baseline
`b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
Earlier private proposal `a70cfb133efb953aaa9201e836ac0e6811c044ab` is historical.
PR46/B2 accepted through PR57 merge `20aaae62a4b6e46f8d75775085918eaba4e8de29`.
Current offline catchup and foreground processing replay are integrated.
PR77 Backup UI was incorporated from main `261b1b7f863f73c324f4ac04acb5bfc95101644d`,
retaining its placement and confirmed restore.
F27 Comet unlocks are integrated; preserve its archived legacy ownership and
Rest Stop eligibility. Current workflow supersedes historical writer-handover
gates; serialize actual main integration and refresh main before merging.
Overlapping open work includes Lab UI, backup UI and Loadout Memory. Do not
incorporate their independent goals or replace their checkout files.

## Scope and acceptance

- Fixed 43200 productive seconds; 12/24/72h returns yield identical productive
  state apart from consumed wall-clock endpoint. Foreground processing replay
  continues under the existing live policy.
- No retired purchase controls, hours bonus or stale-handler purchase; retain
  historical archive/levels and F27 catalog/entitlements.
- Schema 1→2 refunds original per-level rounded prices once. Old ownership and
  F27 archives both migrate. Preserve exact value at large balances, partial
  credit, future credit after spending, backup, restore, recovery and failures.
- Existing chronology, bulk/queue, B2 Motes, dense/boss paths and save checks pass;
  retain all mandatory CI checks and causal negative controls.
- Mobile 320/390/430px, enlarged text through 200%, 44px controls, keyboard focus,
  contrast and reduced motion; WebView60-generation runtime without BigInt.
- Preserve package `com.lumenfall.app`, established signing, deterministic prices,
  fixed Luminous Motes and all unrelated live features.
- GitHub integration, checks on merged bytes, signed APK identity/assets and
  necessary native acceptance/evidence. Keep incomplete acceptance explicit.

## Checks and next action

Focused full-product F26 regression passes locally on Node24.19.0: 32 original
refund combinations, cap/paid snapshots/queues, production device save with
Auto-Ascend ON/OFF, storage rollback/recovery, duplicate return, large balances,
partial credit, deposits that dominate existing balances and three causal mutants. Comet unlock and B2 offline integration
checks pass. Both directions of V8 6.0/modern receipt transfer preserve exact prices at levels
80/200/1000. All 14 mandatory negative controls pass locally. Native Android8.1 /
WebView61 signed144 baseline preparation passes, with installed APK SHA-256
`6e2006cb90ebe27104bd1ae38ba8c8afa700f4ede90e6fe8046bf7b2f505ca5d`.
Price-ledger checkpoint `1a2a040fc498bef9d1b07ba13b42740933ff5308`, [PR85](https://github.com/karahaNx/Lumenfall/pull/85);
Head `5759eaad48197d316cff4d35d92601790a39b230` passed full GitHub CI
[run37740953545](https://github.com/karahaNx/Lumenfall/actions/runs/37740953545):
161 scenarios, 14 expected negative controls and runtime smoke. Main then advanced
to `31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6`. Combined candidate `9c10ab2`
preserves Formation autosave, Resonate, Auto-Ascend UI and exclusive upgrade owners.
Conflicts retain both retirement guards and legacy Lab explanations with the F26
cap. New upgrade-owner expectations exclude the deliberately retired Reserves
track. Full F26 regression passes on combined bytes; refreshed CI is pending.
The suspected CI stall completed normally; the proposed unrelated process helper
fix remains private, outside this feature. Remaining receipts follow at delivery.

Next: complete current regression/UI/compatibility checks, self-review diff, push
feature PR, pass required CI, serialize integration, verify signed build and native
behavior, then save final status. This local candidate is not a completed feature.
