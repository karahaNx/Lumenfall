# ALL-27-FEEDBACK-001 — implement all requested feedback for a playable APK

Owner: this chat. Status: verification and implementation in progress.

## User request and scope

On 8 October 2026 the user explicitly requested verification and implementation
of **all 27 earlier TXT features**, followed by an APK they can test. This single
delivery task covers the entire requested bundle. Do not stop at local plans,
handoffs, or a status audit. Preserve existing game/save behavior outside the
intentional feedback changes. No new chats, subagents, or messages are assigned.

The [exact 27 TXT requirements and hash inventory](../requirements/all-27-feedback-001/requirements.json)
are the implementation checklist. The original feedback remains under
`docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/`.
Current [project rules](../../AGENTS.md) and [workflow](../project/FEATURE_WORKFLOW.md)
supersede historical Lead/writer/B2 gate instructions in the TXT originals.

## Verified baseline

- Main: `214d45411ce2fb420f0e4b372063811a967679b1` (PR58 documentation).
- Product integration: PR57/46, `20aaae62a4b6e46f8d75775085918eaba4e8de29`.
- Existing repeat paid Lab speed queue is integrated; verify this requirement
  rather than replacing it with older local candidate code.
- Baseline CI37692669340 passed 146 scenarios and all 12 required negatives.
- Published signed APK0.1.138. Required physical acceptance remains open.
- Isolated worktree: `/workspace/Lumenfall-all-27`; branch
  `feature/all-27-feedback-001`. Existing checkout is preserved.
- Local GitHub network commands require the tool's additional network access;
  default proxy connection fails. Fetch succeeded with that access.

## Decisions and acceptance

The original requirements decide Echoing Rest cap6, Cheaper Bonds cap20,
the shared productive offline cap12h, baseline Forge multiplier memory,
Formation autosave, Auto-Ascend controls in Ascend, and the UI requirements.
The user approved Swift Recovery cap10 (minimum3.33s cycle), Tide/Aurora
buffs1s/1.5s with Ultimate, and a one-time refund in the original currency for
removed/over-cap purchases. Preserve history and refund markers in every save,
backup and recovery path. New Bonds, exclusive
systems and progression require documented effects/prices/stacking, measured
equal budgets and pacing evidence. Do not claim a proposed plan is implemented.

Every checklist row must map to production code and meaningful verification.
Cover purchase gates, queue/Max/direct/bulk handlers, live/offline chronology,
Ascend/recovery/backup and idempotent purchase-preserving transitions. Preserve
the authoritative module cap and determinism, WebView60 compatibility, package
`com.lumenfall.app` and established signing identity. Verify mobile controls,
large text, fixed hint geometry, focus and reduced motion.

Run relevant existing checks and required CI; intentional contract changes
need updated assertions with equivalent or stronger coverage, retaining baseline
failure evidence. Never weaken checks merely to obtain a pass. Review the entire
diff, integrate the accepted version, build and publish the signed APK, and verify
the published identity/assets. Deliver a 27-item user test checklist. User phone
testing follows delivery; retain that acceptance as pending until reported.

## Current checkpoint

Draft [PR67](https://github.com/karahaNx/Lumenfall/pull/67) is attached to this
chat. Branch feature/all-27-feedback-001 preserves all work; the original
checkout remains untouched. The initial published checkpoint65385aac is followed
by0b138d4, then current main20efc396 merged as b5c4c55. Compatibility/evidence
checkpointcd1ec51 is published. Current main includes PR59 Wisp display, PR60
Forge text and PR61 centralized full Bond partner names; all are preserved.

The inventory records21 implemented/existing features and six pending
matrix/pacing/Comet rows. **Zero are declared integrated/released complete.**
The [exclusive matrix and Comet proposal](../requirements/all-27-feedback-001/exclusive-matrix-proposal.md)
makes two unanswered gameplay choices reviewable: preserve historical bonuses
when reshaping duplicate Lab/Tree upgrades vs remove/refund; and140/50/160
Comet Trials/Trail/Crest vs purely cosmetic replacements. The user has approved
original-currency refunds, Swift10 and1s/1.5s buffs, not these additional choices.
Do not implement dependent changes until their answer arrives. Latest Lab
proposal documentation explicitly records that no final matrix is agreed.

## Implemented behavior and regression corrections

Ascend has one editable Rift dropdown and independent ON/OFF after the Deeds
unlock. Fixed hint geometry, complete unfinished Wisp tracks, Resonate clarity,
Lab progress/time/speed display, Formation autosave, hidden repeated Cast text,
Backup/Restore beside Save/Reset, baseline Forge multiplier memory, visible
persistent cosmetics and capped Forge purchases are implemented. Eight Bonds
and bounded older-Wisp catch-up follow the
[balance contract](../requirements/all-27-feedback-001/balance-contract.md).
Equal-budget measurements include real Rarity/Module/Ultimate spending and unused
currency; full eight-system campaign pacing remains dependent on the matrix.

Swift10, Echo6, Bonds20, all productive offline work capped12h and one-time
original-currency refunds are implemented. Raw purchase history is retained;
small refunds beside huge wallets remain spendable exact credits through primary,
recovery and backup. Active paid work remains intact. Paid Study speed tiers and
future queue purchases keep the already-integrated independent payment contract.

Formation preserves empty pending presets and an explicit Field of Ember during
rebuilding. Field/Bench updates retain still-unrecruited intent in only the
selected preset; pending members produce no DPS/Bonds. Medium-Farm parity is
fixed by sharing absolute-second boundaries between Push/Farm. The original
lossy-deadline mutation is still detected by an independent fractional-event
integral at the unchanged1e-6 tolerance. Intentional old4s/8s, manual Formation
Save, separate Study tail and native-select assertions were replaced by equivalent
or stronger requirements; conservation/projection tolerances remain unchanged.

Rift preserves fixed44/48px hints, ability names, all overlapping Bond marks,
compact effects with full accessible text and short-screen Boss geometry. The
new fallback follows actual tab classes instead of unsupported CSS :has and
uses legacy rgba gradients. Physical WebView60 acceptance remains unverified.

## Verified checks and evidence

- Supplemental existing suite:131/131 pass after main integration; all12 required
  negative controls detected. This uses actual embedded assertion modules over
  Playwright, not the required dump-DOM transport.
- Native Rift: all four normal/reduced/stacking profiles pass, including360x640
  and390x844 with safe insets. Auto-Ascend and Lab normal/reduced pass.
- Native offline cold/resume/restart, cancellation, daily rollover, Lab offline
  and Farm runtime pass. Forge UI and process guards pass.
- New core cap/refund/save/Prism checks and equal-budget balance checks pass;
  native all27 mobile passes four profiles including unsupported modern CSS
  removed at360x640. Separate Wisp gate passes12 profiles/12912 checks.
- Offline core passes in135s: full-state one-second8h ON/OFF and12h references,
  byte-verified archived-product oracle for unchanged fixtures, cancellation,
  primary/recovery failures, CPU-time replay and wall-clock corrections.
- Source validation, Node tooling and task-context checks pass. Additional
  network permission is needed for reliable local child-process output; default
  sandbox capture falsely returned empty aapt output.

[Local verification](../qa/all-27-feedback-001/local-verification.json) records
source/checkpoint limits; [offline proof](../qa/all-27-feedback-001/offline-verification.json)
records the actual windows. The required default suite contains151 scenarios.
Local dump-DOM times out even on the original baseline; keep this open rather
than replacing required CI with supplementary evidence. Required remote CI must
pass on the exact published head, then on the final integrated main version.

## Remaining work

Preserve this complete checkpoint and its recorded CI. Resolve the two
pending gameplay questions, implement the final Lab/Tree/Comet matrix and measure
full eight-system pacing. Reverify changed mechanics and the complete required
suite, integrate and publish the correctly signed APK with verified assets,
version/hash and the [27-item phone checklist](../qa/all-27-feedback-001/phone-checklist.md).
User phone acceptance follows delivery and stays pending until reported. Keep
the task open while any required decision/check is missing. A partial APK does
not fulfill the all27 request.

Latest continuation: current main fe52747a02fd008ebcedf2f1e78950ef5c8ae363 is
merged as5fe3a6a43e65493ab690ecac0b9bcd1a3eefbe6d. PR63 Cast/Ready status in
chargebar aria-valuetext is preserved. Overlap tests and12 native Cast profiles
pass. All four final Rift profiles pass; four real Auto-target/Bond mutations
are caught, including the updated40-option window mutation anchor.

[Required CI37714789186](../qa/all-27-feedback-001/ci-verification.json) passes
151 scenarios,12 required negatives, source/tooling/signing-verifier guards and
runtime smoke. It checked head20e877c1 and test-merge45574115; product SHA256
373bf4b502995f58ad885e3676c70e5233c9cb475375e84fff5cc64b2a9bdc5a matches
current production bytes. Subsequent checkpoint/final main must retain their own
required CI. The Forge row is corrected to partial: three existing cap10 rows
do not establish the final agreed Forge identity. Current count is21 implemented/
existing, six matrix/Comet/pacing pending, zero complete releases. Two gameplay
questions are still unanswered. No dependent implementation or partial APK is
released; continue with the final approved matrix after the answers arrive.
