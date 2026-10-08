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

## Checkpoint and next action

Fresh baseline and all27 original requirements are preserved. Product UI changes
are in progress in index.html: Ascend controls/Prism explanation, fixed hint slot,
unfinished Wisp visibility, Resonate explanation, Lab cards/speed panels,
Formation autosave, cast text, save controls, Forge multiplier memory and Rift
cosmetic presentation. Existing paid Lab speed queue behavior remains intact.

Preliminary Playwright verification passed at320/390/430px without runtime
errors, covering these changed interactions and fixed hint geometry. This is
supplementary evidence, not the final required CI gate. The baseline native
dump-DOM upgrade-effects-and-deeds scenario timed out locally at25s; keep this
failure open and distinguish it from product failures. Native CDP verification
and required remote CI remain necessary. Next: approved caps/support durations,
shared12h offline policy and idempotent original-currency refunds, then the
exclusive upgrade/Bond/progression changes. Update the matrix at each milestone.

### Implementation checkpoint: UI and approved mechanics

The approved caps, support durations, fixed12h policy and retirement/refunds are
implemented. `tests/behavioral/all-27-core.cjs` passes six independent groups:
direct/bulk/Max/automation caps, exact original-currency compensation,
reload/recovery/backup idempotence, tiny-credit preservation beside1e250 wallets,
support downtime and the shared12h paid-Study limit, plus Prism preview/payout.
Native CDP touch/keyboard verification passes at320/390/430px with large hint
text, both motion modes, persistent distinct themes and no runtime errors.
Evidence is under [all27 QA](../qa/all-27-feedback-001/).

Eight Bonds and bounded older-Wisp catch-up are implemented as described in the
[measured balance contract](../requirements/all-27-feedback-001/balance-contract.md).
Five-slot marginal/support/resource evidence and final pacing remain pending.
The first supplemental existing-suite run has102 passes and27 failures so far:
some intentionally outdated4s/8s, Study-tail, native-selector and save/refund
expectations; genuine Farm clock/focus/geometry/lifecycle concerns must be fixed.
The Farm stall guard now recognizes progress in the authoritative split grid,
even if a tiny residual rounds to unchanged display time. Reverify parity and
the independent Farm conservation/numerical gates before declaring it fixed.

Two asynchronous user design questions remain pending: preserve legacy bonus
value while reshaping Lab/Tree duplicates vs remove/refund; and the concrete
140/50/160 Comet Trials/Trail/Crest proposal. Do not implement dependent choices
until the answer arrives. Continue meaningful regression/native/formation/
balance work meanwhile. Register the new native/core tests in required CI;
finish all remaining regressions and matrix/pacing before integration/release.
