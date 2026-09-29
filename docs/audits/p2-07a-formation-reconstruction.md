# P2-07A — Formation reconstruction (review handoff)

Status: implemented for review; **not merge-ready**. The existing medium-Farm
endpoint assertion remains red. Do not merge before Lead/04 resolve that contract
and 01 reviews persistence. P2-04 remains deferred/unmerged; P2-05/P2-08 untouched.

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
