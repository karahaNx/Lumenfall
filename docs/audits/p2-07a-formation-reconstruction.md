# P2-07A — Formation reconstruction (review handoff)

Status: review corrections implemented; **Draft, do not merge**. The original
implementation and #89 results below are historical. The 02_05 review-resolution
section records current validation and known limits. 01 must re-review persistence
and 04 must re-review Farm/timer coverage at the final correction SHA.
P2-04 remains deferred/unmerged; P2-05/P2-08 untouched.

Baseline: `df310f48128c5f131588521ac8873973f0fadf17` (GitHub main, reverified before
publication). No open PRs were returned by the direct GitHub open-PR collection.
Branch: `02/p2-07a-formation-reconstruction`.

## Reproduction before production edits

Added `p2-07a-formation-reconstruction` to the existing browser harness, then ran
it against unchanged main. Chosen Boss Formation:
`[tide, stone, gale, thorn, void]`, all initially level 10, cleared Rift 100.
After `doAscend(false)` and `saveState()`, actual party was `[ember]`,
`activeFormationPreset` was empty, and the Boss preset still contained all five
original IDs. The intent assertion failed with no runtime exception.

The inspected path is `applyAscendMutation()` → level/resource reset and Ember
startup mutation → `saveState()` / `normalizeCurrentSave()` → powered-only party
filter → cleared preset association. `simulationApplyAutoAscend()` uses the same
mutation followed by `acceptPersistedState()`; `autoEmpowerTick()` previously saw
only the resulting actual party. Merely changing purchase priority cannot recover
the original selection, particularly an unsaved custom formation.

## Implementation contract

- Optional `formationRebuild: {members: [...], preset: ''|'push'|'farm'|'boss'}`,
  or `null`, distinguishes intent from the actual powered `activeParty`.
- Capture membership/order before Ascension changes the party. If reconstruction
  is already pending, preserve its original target across another Ascension.
- Keep all existing level/resource resets and the Ember level-1 grant. No levels,
  currencies, unlocks, rewards, prices or permanent progression are in the record.
- Actual party is the powered target subsequence, preserving target order.
  Ember is temporary startup support only while **no** intended member is powered.
  If Ember is intended, it remains in its intended position. There are never more
  than five active members. Completion restores the exact target and clears intent.
- Restore the remembered preset only if its current membership and order match.
  No preset is overwritten to store a custom target.
- Successful Field/Bench, preset Apply, or explicitly saving the current Formation
  cancels intent. Failed actions do not. Manual recruitment alone is not a Formation
  selection; unrelated manual recruits remain reserve during rebuilding.
- Manual and automated purchases both reconcile membership after the paid level.
  Existing powered-only combat/Bond checks remain intact.

### Auto-Empower

Candidates are active Wisps followed by missing intended Wisps, deduplicated and
unlock-checked. Existing iteration/tie behavior for current members, cheapest
`spiritCost()`, one-purchase cadence and Research/Study ordering remain unchanged.
No level-0-first rule, reservation, reserve shopping or additional automation.
Every candidate respects its own OFF toggle, including temporary Ember. All OFF
also includes pending members. No purchase runs before `labmaster` unlock.

### Persistence / schema compatibility — 01 review required

Keep schema **1**. The record is additive and optional; fresh, existing v1 and
legacy saves default to `null`. The existing canonical save/load/recovery/backup
pipeline carries it. Normalization keeps at most five unique known, unlocked IDs
in order, strips unknown fields and invalid/mismatching preset references, and
drops empty/invalid intent. Reconciliation never raises a level or grants money.
The existing powered-party validation and its established Ember recovery fallback
are retained. No broad persistence rewrite or automatic schema bump.

Older application binaries do not know this optional field and can discard it on
resave; downgrade continuity is not guaranteed by schema-v1 compatibility.

### Minimal UI

Existing Formation card lists intended members as Active or Pending, explicitly
states pending members provide no power/Bonds, identifies temporary Ember, and
shows pending Auto-Empower OFF/ON (or manual recruitment before unlock).
Pending Wisp cards expose the existing per-Wisp Auto-Empower control. No new menu,
roster layout, progression UI or Rift presentation system.

### Chronological reset integration

The new mid-window test exposed elapsed time being credited to reset ability and
Auto-Empower accumulators after a passive kill triggered Ascension at the interval
endpoint. The narrow guard skips that old-run accrual when `ascendCount` changes
during passive damage. Studies still receive their elapsed time. No scheduler
order, purchase cadence or pricing change. Timeline purchase capture examines all
Wisp levels so changing the active party cannot hide a legitimate purchase.

The focused offline run Ascends at 1.57359670372901 seconds and makes its first
post-Ascension purchase at 19.57359670372901 seconds. Uninterrupted, 0.1-second
reference, offline wrapper, and exact split at Ascension agree under the existing
strict parity tolerances. The fixture performs four Ascensions in 300 seconds.
A separate boundary check proves no rebuilt damage applies before purchase;
additional damage appears only in subsequent time.

## Validation

Local Chromium 153 via a scratch-only Playwright CLI adapter (the available
headless shell does not implement the harness's Chrome `--dump-dom` contract).
The existing harness, scenarios and assertions run unchanged through that adapter;
CI uses its existing Chrome path. No dependency or workflow edits.

- Formation contract: **323 assertions pass**, including two scoped negative
  mutations (lost intent and unpowered active slots), both detected.
- Partial reconstruction: real page reload, backup restore and corrupt-primary
  recovery all pass, retaining `[void,tide,stone]` intent with only Tide active.
- Chronology/cadence/affordability/reference/split tests pass.
- Research/Study/Wisp contention: 7 Wisp purchases, 10 Research purchases and 1 Study
  start; exact Lumen and Shard ledgers balance, no double spend.
- Existing strict accessibility passes with zero findings; pending toggle semantics
  and reachability are additionally tested directly.
- Existing viewport matrix: 20/20. Pending Formation matrix: 5/5, including
  360×640 with 24px top/bottom safe areas. Smallest pending layout visually inspected.
- All 13 existing negative controls fail for their expected test assertions/runtime
  markers; none fail from browser launch errors.
- Static validation from the existing pre-merge workflow passes: two script syntax
  checks, 17 required unique IDs, cache/state lifecycle guards. Python compile,
  new test JavaScript syntax and `git diff --check` pass.
- Full suite: **69/70 scenarios; 89/90 viewport-expanded executions pass**. One unresolved scenario, `parity-medium-farm`; all other scenarios
  pass. Its strict live/reference parity comparison itself passes, then the
  pre-existing final-mode assertion fails. **Full suite is not green.**

Commands (using local browser adapter on PATH):

```sh
python tests/behavioral/run.py --web-root <staged-assets>
python tests/behavioral/run.py --web-root <staged-assets> --scenario p2-07a-formation-reconstruction
python tests/behavioral/run.py --web-root <staged-assets> --scenario p2-07a-chronology
python tests/behavioral/run.py --web-root <staged-assets> --scenario p2-07a-save-reload
python tests/behavioral/run.py --web-root <staged-assets> --scenario p2-07a-backup-restore
python tests/behavioral/run.py --web-root <staged-assets> --scenario p2-07a-recovery
python tests/behavioral/run.py --web-root <staged-assets> --scenario layout-p2-07a-reconstruction
# Each NEGATIVE_SCENARIOS entry is required to return an assertion/runtime failure.
```

### Unresolved Farm contract — Lead/04 decision required

`parity-medium-farm` starts in Farm at Rift 89, with a Rift-90 Boss return,
automatic Boss retry, and Auto-Ascend enabled at target 130. Main passes its final
“remain Farm / return depth 90” assertions. With reconstruction it retries and
continues through repeated Ascensions with the player's rebuilt Formation,
ending in Push at Rift 60 after 11 Ascensions and one retry, with Ember/Tide active. No Farm/retry/Ascension eligibility or reward formula was edited.

This may be an endpoint expectation that depended on the old loss of Formation;
it is **not accepted as harmless solely because that explanation is plausible**.
Lead/04 must distinguish intended post-Ascension progression from a Farm regression
and approve an appropriate regression contract or identify a scoped production fix.
The old assertion, fixture and checks were not removed, disabled or relaxed.
Additional failure diagnostics report mode, depth, Ascensions, retries and party.

## Required coverage mapping

| Handoff items | Evidence |
|---|---|
| 1 | Failing new intent assertion on unchanged main, described above |
| 2–7 | `p2-07a-formation-reconstruction`: manual, Ember, five without Ember, small and unsaved custom; chronology covers authoritative Auto |
| 8–10 | Exact reset, every paid manual level, automated cost and shared economy ledger |
| 11–16 | Cheaper powered Ember beats level-0 Tide; cadence boundary; per-Wisp/All OFF; pre-unlock; locked/manual/unrelated reserve checks |
| 17–20 | Pending versus no-intent formula/simulation equality; Ember support; target subsequence/exact order; slot invariants at every purchase |
| 21–22 | `p2-07a-save-reload`, `p2-07a-backup-restore`, `p2-07a-recovery` |
| 23–24 | Repeated partial Ascension; failed and successful Field/Bench/preset actions; explicit current-Formation save |
| 25–30 | `p2-07a-chronology`: mid-window Auto, affordable purchases, no retrospective damage, both policies/reference, exact split and shared ledger |
| 31–34 | Fresh/v1/legacy/malformed in new contract plus existing load/restore/recovery suite |
| 35 | Existing `p2-ascend-integrity` and `p2-03b-auto-ascend-integrity` pass |
| 36–37 | Existing Wisp formula, pacing, role and currency contracts pass; Farm endpoint blocker remains explicit |
| 38 | P2-06 live/reduced-motion feedback scenarios and 20 existing viewport executions pass |

## Scope and required reviews

Files: `index.html`, `tests/behavioral/run.py`, new
`tests/behavioral/formation.js`, and this focused contract. Production diff is
limited to Formation/Ascension/Auto-Empower integration, optional persistence,
minimal existing UI text/controls and the demonstrated reset-boundary accrual guard.
No workflows, signing, Android, dependencies, currencies, gear, progression layers,
best-build selection, region modifiers, Boss traits, or P2-06 presentation logic.

**01 persistence review is still required. 04 QA review is still required.**
Neither review has been performed by this implementation session. Draft PR only;
no merge, no Android release and no main mutation.

## 02_05 review resolution — 2026-09-29

Continuation of Draft PR #30, not a new implementation. Remote main was verified
as `df310f48128c5f131588521ac8873973f0fadf17`, and the remote branch/history/PR/checks
still matched reviewed HEAD `71418803dab2b3f97a2ed8124ea9f966fd3babff`. A new local
checkout of the existing branch was used. #89 logs independently confirmed the
old composite endpoint assertion; no old workflow was rerun.

### PERSIST-01 reproduction and minimal correction

Before modifying production, the new `p2-07a-persistence-review` scenario ran
against the exact reviewed production file. With unlocked `[tide,stone]`, both
at zero, Ember zero, Gale one and `activeParty=['gale']`, it failed with
`PERSIST-01 unrelated Gale retained: ["gale"]`; Chrome exited normally and there
were no runtime errors.

Production correction relative to reviewed HEAD is eight added lines:

1. `reconcileFormationRebuild()` projects to an empty party when neither an
   intended member nor Ember is powered, instead of retaining unrelated members.
2. After that projection, `normalizeCurrentSave()` applies the existing
   empty-party Ember recovery (`max(1, current Ember level)`) if necessary, then
   reconciles again **inside the same normalization pass**.

No powered intended members: powered Ember supplies startup support; if Ember
also has zero power, canonical empty-party recovery supplies exactly level 1.
One or more powered intended members: the actual party is their exact ordered
subsequence, and unrelated Ember/Gale are not fielded. Non-Ember pending members
remain level zero. Gale's level, ability resource and reserve progression remain
intact; currencies, costs and automation settings are unchanged.

The recovery grant is the established canonical Ember exception, not a purchase
or free reconstruction of another Wisp. Reconciliation itself never grants a
level. The second projection matters when Ember is intended: an Ember-only intent
can finish and restore its matching preset in the **first** pass. Otherwise the
ordered pending intent remains. On another pass the party is already valid, so
there is no additional grant, projection change or stale-intent resurrection.

Executed persistence coverage:

- 162 focused assertions: exact contradiction, powered Ember, one/multiple powered
  intended members, intended Ember, Ember-only completion, ordered completion,
  malformed/absent intent, reserve/currency/resource preservation and cancellation.
- Seven canonical cases each compare the **entire canonical object** after four
  fixed-clock repetitions and after advancing the clock; all are identical.
- No automatic reserve purchase with intended members/Ember OFF and Gale ON.
- New actual page reload, backup restore and corrupt-primary recovery cases for
  the corrected contradiction, plus the original partial reconstruction cases.
  Exact roster, currency and resource comparisons are retained. Fixtures mark
  today's login as already handled to isolate persistence from the legitimate
  five-Comet first-login reward, rather than weakening currency assertions.
- Reset clears pending intent; repeated partial Ascension, explicit cancellation,
  fresh/current-v1/legacy/malformed compatibility remain in the complete suite.
- The negative control restores the old Gale fall-through and fails the
  projection assertion. Schema stays at 1; no downgrade-continuity promise.

### Farm contract separation

The original medium fixture is unchanged in `fixtures.json`. Its automatic Boss
retry and Auto-Ascend permit Farm → Boss retry → Push → Ascension → reconstruction.
An unconditional final Farm assertion therefore asserted retention beyond its
preconditions, instead of validating the allowed transitions.

Contract A, `p2-07a-farm-retention`, derives a controlled state from that fixture
with Push return **91**, a non-Boss encounter. Existing `highestFarmableDepth()`
normalizes its Farm depth to 89. No automatic Boss retry can become eligible,
regardless of economic growth. Auto-Tap, Auto-Empower, Research, Studies and
Auto-Ascend remain enabled. Across 3600 seconds, it requires exact Farm mode,
Farm depth, return depth, zero retries and zero Ascensions. Direct/offline
one-second reference and live one-second reference comparisons are strict.

Contract B retains `parity-medium-farm` and all its economic coverage. Test-only
wrappers observe actual production entry points, recording preconditions before
mutations and checking their results:

- Retry requires the existing offline policy, Farm mode, a Boss return and a
  finite kill estimate; exactly one retry clears Farm fields and returns to that
  exact Boss. Enemy defeat preserves Farm or advances Push by exactly one Rift.
- Every Ascension requires eligibility and the cleared target before mutation;
  count advances once, normal reset occurs, and exact intended order survives.
- Every Auto-Empower purchase is unlocked/enabled, among allowed candidates,
  cheapest, affordable, exactly one level and exactly one exact Lumen debit.
  Enemy HP/depth/kills cannot change inside a purchase. Pending level-zero and
  unrelated reserve members cannot contribute to the actual party.
- Audited counts must match simulation summaries. The unmodified composite must
  actually retry, Ascend and buy missing intended members. Observed counts are
  diagnostics, **not hardcoded expected endpoints**.
- Existing strict state/summary comparisons retain the original 3600-second
  offline run against one-second reference; the integrated fractional split is
  1234.5 + 2365.5 seconds. Live one-second reference also passes.
- The existing focused chronology scenario separately proves identical damage
  through the purchase boundary and additional rebuilt damage only afterward,
  including strict 0.1-second reference and exact Ascension split.

Targeted mutations force an unauthorized Farm exit, premature Ascension, duplicate
Ascension, and refund a genuine missing-member reconstruction purchase. Each must
fail its specific causal assertion, not merely throw or fail browser startup.

### Exact reset-boundary timer coverage

`p2-07a-timer-boundary` constructs a passive kill at 0.25 seconds, before automation
or ability events, with both automation unlocks, nonzero old-run accumulators,
three powered members and an ongoing Study. For both live/offline it checks:

- 0.2499 seconds: no Ascension; normal ability/timer accrual.
- 0.25 seconds: one Ascension; all reset ability bars and both timers exactly zero.
- 0.2501 seconds: only the 0.0001 seconds after reset accrues to the new run.
- Study progress remains continuous, and an Auto-Ascend-OFF control retains normal
  non-Ascension accrual.
- Strict 0.01-second reference and splits before, exactly at and immediately after
  the boundary agree. Existing `1e-6` absolute / `1e-12` relative tolerances stand.
- A test-only mutation replaces the existing accrual guard with its former
  unconditional behavior and must fail the reset-ability assertion.

No additional simulator production change was made; the reviewed narrow guard
is retained verbatim.

### Additional diagnostic limits for 04 / Lead

Two exploratory tests outside the existing medium fixture's one-second reference
contract exposed **pre-existing main behavior**, reproduced with the same inputs
on unchanged `df310f4` as well as the correction:

1. Medium Farm live 60-second direct vs 0.1-second chunks: total kills 50166 vs
   50164. This occurs without Ascension and is not caused by reconstruction.
2. The new isolated non-Boss-return fixture, offline 3600 seconds split at 1234.5:
   enemy HP differs by approximately `1.9525e-6`, beyond the unchanged relative
   tolerance of approximately `1.7127e-6`. Integer-grid split at 1234 passes.

These diagnostic failures are **not counted as passes**. The isolated retention
contract uses the established one-second reference and an integer-grid split;
Contract B keeps its passing fractional split. No numeric tolerance was relaxed,
no production Farm code was changed, and no general arbitrary-window equivalence
is claimed for all Farm fixtures. 04/Lead should triage these baseline limitations
separately; this bounded review correction does not redesign the simulator.

### Validation and publication

Current local results are recorded below after the final complete run. Local
browser is Chromium 153.0.8010.0 through the inspected scratch-only Playwright
CLI adapter; repository dependencies and workflows are unchanged. The adapter
runs the real harness and waits for its result, including reloads and iframe
viewport checks. CI uses its normal installed Chrome.

- Final complete local suite: **77/77 scenarios, 97/97 expanded executions pass**.
  Includes all seven newly added review scenarios, original Formation/chronology,
  fresh/v1/legacy/malformed persistence, restore/recovery/Reset, all live/offline
  reference and lifecycle scenarios, Ascension/Auto-Ascend integrity, Wisp formula,
  pacing/role/economy contracts and both P2-06 feedback motion modes.
- Focused persistence: **162 assertions**; original Formation contract rerun:
  **323 assertions**, including its original two detected mutations.
- Six new targeted mutations detected: retained Gale, unauthorized Farm exit,
  premature Ascension, duplicate Ascension, free missing-member reconstruction,
  old-run reset-timer accrual. These execute in default positive scenarios, so
  normal CI covers them without workflow changes.
- Existing negatives: **13/13 scenarios, 17/17 viewport-expanded failures detected**,
  each from expected assertion/runtime markers; no browser-launch failure.
- Existing mobile matrix **20/20** and pending Formation matrix **5/5** pass.
  Strict P1-05 accessibility reports **zero findings**.
- Existing workflow static-source validation passes: two inline JS syntax checks,
  17 unique required IDs, cache/state/lifecycle guards. Test JS and Python syntax,
  APK identity verifier self-test and `git diff --check` pass.
- Composite diagnostics: one legitimate retry, 11 eligible Ascensions, 3593 paid
  purchases including 41 missing intended-member purchases. These are observations
  from the run, not expected constants in tests. Isolated retention has zero
  retries/Ascensions and retains Farm 89 / Push return 91.
- Runtime smoke step and final GitHub CI result are to be reported from the **new
  automatic PR run** in the PR body/handoff. No old CI rerun or Android/native
  lifecycle build is claimed locally.

Scope review versus reviewed HEAD: only the eight-line persistence correction,
focused Farm/timer/persistence tests and this review-resolution documentation.
Combined diff versus main: the same four intended files only; original Formation
implementation and narrow timer guard retained. `fixtures.json`, workflows,
signing, Android/native configuration, dependencies, formulas/rewards/balance,
P2-06 presentation, regions and Boss traits are unchanged by this correction.

Publication remains one coherent review-resolution commit on the existing branch.
PR #30 stays Draft and unmerged. Green CI alone is not merge approval: **01 must
verify the correction SHA; 04 must verify that same SHA's Farm/timer contracts and
consider the explicitly documented baseline diagnostic limits.**
