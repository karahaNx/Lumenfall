# Lumenfall Development Roadmap

_Last consolidated: 2026-09-26_  
_Consolidated against `main` @ `829dd303fe9d5b608198565fa0cd87947bb85fcf` before this roadmap commit._

## Purpose

This roadmap consolidates the four specialist audits into one implementation order:

- `01 — Core / Android / APK`
- `02 — Gameplay / Progression`
- `03 — UI / Visuals / Branding`
- `04 — Debug / QA`

GitHub `main` remains the source of truth. The audits are evidence and recommendations, not independent backlogs that may be implemented in arbitrary order.

The project should be hardened incrementally. Do not rewrite the application, replace Capacitor, or perform a broad file/module split merely because `index.html` is large. Structural changes must solve a demonstrated integration, testability, reliability or maintainability problem.

## Cross-workstream decisions

The audits overlap in several areas. The following ownership and sequencing decisions resolve those overlaps.

### GitHub Actions and QA

`01` owns GitHub Actions, Android build/release behavior and signing. `04` owns regression-test behavior, fixtures, runtime assertions and QA acceptance criteria.

Therefore:

- workflow trigger/job/publish changes are implemented by **01**;
- behavioral tests and fixtures are implemented by **04**;
- `00` resolves conflicts and controls merge order.

The current workflow runs automatically after relevant pushes to `main`, while `main` is not branch-protected. Pre-merge validation is therefore the first roadmap task.

### Save architecture and persistence testing

`01` owns the save/load/backup/restore implementation. `04` owns behavioral persistence coverage.

The sequence is:

1. `04` provides deterministic fixtures and regression coverage;
2. `01` changes the persistence contract;
3. `04` validates migrations, recovery, reset, restore and corruption handling.

Do not redesign persistence without regression fixtures first.

### Gameplay simulation and QA

`02` owns combat, rewards, automation and offline simulation semantics. `04` owns parity tests and state invariants.

Balance tuning is blocked until live/offline simulation parity is established. The current live and offline timing models can produce materially different progression, and the 5,000-kill fallback stops advancing several stateful rewards/systems.

### Visual work and gameplay meaning

`03` owns layout, hierarchy, accessibility presentation, branding and visual feedback. It does not define gameplay rules.

Ambiguous gameplay wording — Wisp power, Tank meaning, Auto-Ascend target semantics, currency sources, Formation recommendations — must be resolved by `02` before `03` presents it as authoritative.

### Shared `index.html`

Most gameplay, state and UI behavior still lives in one file. That makes simultaneous implementation by `01`, `02` and `03` a merge and regression risk.

Multiple workstreams may investigate, design, prepare fixtures and work on isolated files in parallel. Production changes to overlapping `index.html` regions should be merged sequentially unless `00` explicitly confirms the branches are non-overlapping.

---

# P0 — Protect progression, releases and the simulation contract

P0 tasks prevent irreversible update breakage, progression loss, unsafe merging or economy corruption. New content and broad balance work are blocked by the applicable P0 dependencies.

## P0-01 — Pre-merge validation gate

**Primary owner:** 01 — Core / Android / APK  
**Supporting owner:** 04 — Debug / QA  
**Coordinator:** 00 — Lead / Architecture

### Goal

Move meaningful validation to the correct side of the merge boundary without changing the existing signed `main` release behavior.

### Required work

- Run non-publishing validation for pull requests/feature branches.
- Preserve the current signed APK build/publish path for relevant pushes to `main`.
- Ensure PR validation cannot move `android-latest`, upload/clobber release assets, delete release assets/artifacts, create/replace signing material or otherwise mutate distribution state.
- Keep a stable named validation check suitable for branch protection.
- Fail browser runtime validation on uncaught JavaScript errors/unhandled promise failures when the test layer supports it.
- Enable a required pre-merge check on `main` if repository permissions permit; otherwise document the exact repository-setting action still required.

### Dependencies

None. This is first.

### QA checkpoint

04 confirms that the PR path executes the intended static/runtime checks and that a deliberately broken fixture/source change fails before merge.

### Complete when

- a PR can exercise validation without publishing;
- a successful PR produces a stable green check;
- a failing PR cannot be considered merge-ready;
- the `main` push path still produces the signed rolling APK;
- publication side effects occur only from the intended `main` path;
- branch protection is active with the check required, or the remaining external GitHub setting is explicitly documented if connector permissions prevent changing it.

---

## P0-02 — Lock the Android signing identity

**Primary owner:** 01 — Core / Android / APK  
**QA owner:** 04

### Goal

Make loss or replacement of the established signing identity a hard failure rather than a silent new signing generation.

### Required work

- Remove automatic signing-key regeneration from normal build behavior.
- Record and verify the expected signing certificate fingerprint.
- Fail the publishing workflow if the signing material is missing, corrupt or mismatched.
- Document recovery expectations for the exact existing keystore.
- Maintain an independent protected backup of the established keystore outside the normal build control path; this is an operator/security requirement, not a reason to commit secret material to the repository.

### Dependencies

P0-01 should land first so future release changes pass pre-merge validation.

### QA checkpoint

04/01 verify that missing or mismatched signing material fails before publication and that the correct key still builds an update-compatible APK.

### Complete when

- normal CI can never silently create a replacement production signing identity;
- the expected certificate fingerprint is deterministic and checked;
- recovery requirements are documented;
- the current APK signing generation remains unchanged.

---

## P0-03 — Stateful behavioral regression harness

**Primary owner:** 04 — Debug / QA  
**Supporting owners:** 01 and 02

### Goal

Replace regression-by-source-string as the primary safety model with deterministic state/action/result tests.

### Initial fixtures

At minimum:

- fresh game;
- representative mid-game save;
- representative mature/high-power save;
- prior-format/legacy save;
- malformed/corrupted save;
- Farm-mode save;
- damaged normal enemy and damaged boss;
- active Long Studies;
- Auto-Ascend enabled.

### Initial behavioral cases

- load/normalization invariants;
- enemy HP/depth save → reload;
- Push → Farm → reload → Push return;
- Reset → reload;
- Restore → reload;
- malformed backup rejection;
- non-array/invalid daily state such as `questIds`;
- uncaught runtime errors fail the suite.

### Dependencies

P0-01.

### QA checkpoint

The harness itself must demonstrate one intentional failing case before it is treated as a gate.

### Complete when

- fixtures can be launched deterministically;
- tests assert state transitions, not only DOM/source tokens;
- the suite is runnable from CI and organized outside large workflow heredocs where practical;
- existing reset/restore/enemy regression protections remain covered.

---

## P0-04 — Canonical save contract and bounded recovery

**Primary owner:** 01 — Core / Android / APK  
**QA owner:** 04  
**Gameplay review:** 02 for state semantics

### Goal

Make persistent player progression explicitly versioned, migratable, validated and recoverable.

### Required work

- Add an explicit save schema/version.
- Centralize the flow as: parse → identify version → migrate → validate/normalize → accept.
- Validate important nested maps, arrays, booleans, IDs, ranges and timestamps.
- Validate backup candidates before they replace the authoritative save.
- Add a bounded previous-good/recovery strategy for primary save corruption.
- Preserve current reset and restore transaction guards.
- Stop repeated persistence failure from remaining completely silent; surface a controlled warning without spamming the player.
- Consider immediate persistence after infrequent high-value permanent transitions while keeping the regular autosave model.

### Dependencies

P0-03 must exist before implementation.

### Sequential constraint

Do not merge P0-04 concurrently with a large `02` combat/offline rewrite because both affect central state behavior in `index.html`.

### QA checkpoint

04 verifies fresh, current, legacy, malformed, recovery, reset and restore paths, including that invalid/future-incompatible backups do not replace a valid current save.

### Complete when

- every accepted save has a known schema version;
- migrations are explicit and repeatable;
- invalid state cannot become authoritative merely because it is valid JSON;
- one corrupt primary slot does not automatically destroy the last usable state;
- reset and restore remain race-safe;
- all persistence fixtures pass.

---

## P0-05 — Authoritative live/offline combat and economy parity

**Primary owner:** 02 — Gameplay / Progression  
**QA owner:** 04  
**Lead review:** 00

### Goal

Define one authoritative simulation contract so equivalent live and offline time produces equivalent progression within an explicitly chosen tolerance.

### Required contract

Parity must cover, where applicable:

- enemy kills;
- Lumen and Shards;
- deterministic Luminous cadence and Motes;
- boss regeneration;
- passive Wisp damage and abilities;
- support effects;
- Guardian/Auto-Tap;
- Auto-Empower;
- Push/Farm state;
- boss retreat/retry;
- Auto-Ascend;
- Research/Study progression that affects combat/economy.

### Required implementation outcomes

- Remove the passive live one-kill-per-tick economic distortion or otherwise make offline results equivalent to the intended live contract.
- Replace/redesign the `OFFLINE_MAX_KILLS = 5000` fallback so long absences do not stop advancing Motes, Sigils, bosses, Rift progress, Ascensions or other required stateful outcomes.
- Add deterministic comparisons for short, medium and long durations, including a case that exceeds 5,000 kills.

### Dependencies

P0-03 is mandatory. P0-04 should merge first to avoid simultaneous high-risk edits to persistence/state foundations.

### QA checkpoint

04 runs identical starting fixtures through live/reference and offline paths for agreed durations and verifies all protected outputs remain within the documented tolerance.

### Complete when

- closing the app is not materially more profitable or less complete than equivalent intended live play because of simulation architecture;
- 5,000+ kill absences preserve all explicitly required stateful rewards/transitions;
- parity tests are CI-protected;
- no broad balance retune was used to hide simulation divergence.

---

# P1 — Make the stable core production-credible and mobile-readable

P1 work begins after the applicable P0 foundations exist. Some P1 tasks may be developed in parallel on isolated branches, but `index.html` merges remain coordinated by 00.

## P1-01 — Final APK identity verification

**Owner:** 01  
**QA:** 04  
**Depends on:** P0-02

Add a post-build gate that verifies the actual distributable APK:

- package ID;
- versionCode/versionName;
- expected signing certificate;
- non-empty valid APK.

**Complete when:** the exact artifact that will be published is inspected and a mismatch blocks publication.

---

## P1-02 — Chronological offline automation

**Owner:** 02  
**QA:** 04  
**Depends on:** P0-05

Offline progression should advance through meaningful events in chronological order rather than applying Research/Study/automation mainly at the end of the window.

Events include:

- enemy death;
- automation purchase when affordable;
- Research purchase;
- Study completion/start;
- boss retreat/retry;
- Auto-Ascend.

**Complete when:** an offline window applies progression-changing automation at the correct simulated time and parity fixtures protect the behavior.

---

## P1-03 — Define the Wisp power and gameplay language contract

**Owner:** 02  
**Presentation partner:** 03  
**QA:** 04  
**Depends on:** P0-05

Define what each multiplier affects:

- passive damage;
- damaging abilities;
- support strength;
- Guardian Tap;
- ability-generated resources;
- boss-specific modifiers.

Also resolve ambiguous player-facing terms that 03 must not invent independently.

**Complete when:** formulas and player-facing language describe the same behavior and regression tests cover representative modifiers.

---

## P1-04 — Mobile Rift layout foundation

**Owner:** 03 — UI / Visuals / Branding  
**QA:** 04  
**Coordination:** 00; 01 for native orientation/safe-area policy  
**Depends on:** P0-01. Merge timing must avoid conflicting P0-04/P0-05 edits.

### Required work

- reserve usable enemy/Guardian Tap space on compact portrait screens;
- preserve no-scroll Rift behavior;
- stabilize HUD rows as balances grow;
- increase necessary text readability;
- raise practical touch target areas;
- move toasts above bottom navigation;
- correct nested cost-icon sizing;
- ensure secondary detail can be inspected without consuming the entire combat viewport.

The dense boss fixture must remain usable. The measured 0 px/near-zero combat area on compact screens is not acceptable.

**Complete when:**

- agreed compact portrait fixtures retain a meaningful enemy/tap area;
- HP, mode and primary objective state remain readable;
- HUD height is stable with long balances;
- essential controls meet the agreed target-size policy;
- no toast/navigation overlap exists;
- Push/Farm still does not vertically drift/scroll;
- fresh and dense saves pass 04's viewport matrix.

---

## P1-05 — Shared visual language and accessibility semantics

**Owner:** 03  
**QA:** 04  
**Depends on:** P1-04

- consolidate palette/theme behavior around the approved Lumenfall direction;
- avoid partial system-light theming unless a complete light theme is intentionally designed;
- consolidate component states for active/locked/unaffordable/maxed;
- use consistent Wisp identity assets;
- add proper control semantics/selected states;
- improve overlay focus entry/containment/return;
- retain reduced-motion support.

**Complete when:** common components use one coherent state grammar, necessary information is readable, keyboard/semantic behavior is testable, and Android accessibility checks find no critical navigation blocker.

---

## P1-06 — Lifecycle and offline regression coverage

**Owner:** 04  
**Core partner:** 01  
**Gameplay partner:** 02  
**Depends on:** P0-03, P0-04 and P0-05

Protect:

- background/resume;
- cold restart;
- partial enemy HP;
- boss retreat → Farm → retry;
- Auto-Ascend offline;
- Long Study completion;
- Lab queue progression;
- daily rollover;
- repeated resume cycles.

**Complete when:** these scenarios are deterministic regression tests and offline progress applies exactly once per lifecycle transition.

---

# P2 — Refine systems, native lifecycle and long-term presentation

P2 should not be pulled forward merely because an item is easy. These tasks depend on the P0/P1 contracts being stable enough that later tuning is meaningful.

## P2-01 — Gameplay semantic and economy cleanup

**Owner:** 02  
**QA:** 04  
**Depends on:** P0-05 and P1-02/P1-03 as applicable

Resolve deliberately:

- Auto-Ascend in cleared-Rift terms;
- formation memory across Ascension/reload;
- Long Study speed-tier economics;
- hidden Rarity synergy;
- Farm efficiency after measured parity;
- Research/Study/Auto-Empower priority semantics.

**Complete when:** each behavior has one explicit rule shared by live, offline and UI paths, with focused regression tests.

---

## P2-02 — Wisps and Lab task hierarchy

**Owner:** 03  
**Gameplay review:** 02  
**QA:** 04  
**Depends on:** P1-03 and P1-05

- prioritize active formation and Empower;
- make Bonds/Rarity/Modules/Ultimates secondary but reachable;
- surface active Long Studies above generic Research;
- preserve all costs, queues and unlock rules.

**Complete when:** primary returning-player actions are visible without scrolling through explanatory/secondary content first, and no gameplay rule changes were introduced by presentation work.

---

## P2-03 — Ascend, Deeds, offline return and backup presentation

**Owner:** 03  
**Partners:** 01 for persistence, 02 for rewards/rules, 04 for lifecycle  
**Depends on:** P0-04, P1-05 and P1-06

- lead Ascend with gain while preserving explicit Resets/Keeps;
- organize Deeds into clearer destinations;
- structure offline rewards, boss retreat and Study completion instead of one dense paragraph;
- improve backup/restore hierarchy without weakening safeguards;
- reduce stacked interruptions from return/daily flows only if reward/lifecycle semantics remain exact.

**Complete when:** return/Ascend/backup flows are readable, preserve all rewards/state transitions and pass lifecycle regression tests.

---

## P2-04 — Native Android lifecycle gate

**Owner:** 01  
**QA:** 04  
**Depends on:** P1-06

Add native lifecycle handling only where it provides measurable reliability. Browser visibility guards remain complementary rather than being discarded automatically.

Add an Android emulator/device smoke path covering:

- APK install;
- cold launch;
- background/resume;
- force-stop/relaunch;
- save continuity.

**Complete when:** packaged Android lifecycle behavior is verified beyond Chromium-on-Linux and the same progression is not double-applied or lost through tested transitions.

---

## P2-05 — Production release hardening

**Owner:** 01  
**QA:** 04  
**Depends on:** P0-02 and P1-01; ideally P2-04

Plan and execute deliberately:

- controlled transition from debug artifact to release build using the same established signing certificate;
- more atomic `android-latest` publication;
- enough provenance to identify/recover a known-good distributed build.

Do not change signing identity as part of changing build type.

**Complete when:** the release artifact remains update-compatible, publication cannot expose a tag/asset mismatch as a normal failure mode, and known-good build provenance exists.

---

## P2-06 — Artwork, motion and late-game presentation refinement

**Owner:** 03  
**Gameplay review:** 02  
**Performance QA:** 04  
**Depends on:** P1-04/P1-05 and measured performance baseline

Improve existing regions, Wisp/boss differentiation, cosmetic previews and milestone hierarchy before adding visual complexity for its own sake.

**Complete when:** visual progression is more distinct without reducing readability, accessibility, frame pacing or battery behavior on supported Android devices.

---

## P2-07 — Late-game system expansion decision

**Owner:** 00 with 02  
**Visual input:** 03  
**QA input:** 04  
**Depends on:** P0-05 and P2-01

Only after the simulation/economy is stable, decide whether Lumenfall needs additional mechanical depth.

Candidate problems to solve, not automatic features:

- finite Comet/Sigil sinks;
- repeating boss traits;
- largely visual Rift Regions;
- role/resource labels that do not create decisions;
- late-game progression that becomes mostly numerical.

**Complete when:** any proposed new system has a defined player decision it adds, a state/save impact assessment, a balance model and QA plan. “More content” alone is not sufficient justification.

---

# Recommended implementation order

The merge order below is authoritative unless 00 updates this roadmap after new evidence.

1. **P0-01 — Pre-merge validation gate** — 01 + 04.
2. **P0-02 — Lock signing identity** — 01.
3. **P0-03 — Stateful behavioral regression harness** — 04.
4. **P0-04 — Canonical save contract and recovery** — 01, validated by 04.
5. **P0-05 — Live/offline combat/economy parity** — 02, validated by 04.
6. **P1-01 — Final APK identity verification** — 01.
7. **P1-02 — Chronological offline automation** — 02.
8. **P1-03 — Wisp power/gameplay language contract** — 02 with 03.
9. **P1-04 — Mobile Rift layout foundation** — 03.
10. **P1-05 — Shared visual language/accessibility** — 03.
11. **P1-06 — Lifecycle/offline regression expansion** — 04.
12. **P2 tasks** in dependency order, with 00 selecting the next one based on current product evidence.

This list is a merge/integration order, not a ban on parallel preparation.

---

# What can safely run in parallel

After P0-01 is established:

- **01 signing hardening** can run in parallel with **04 fixture/harness preparation** because they primarily touch workflow/release code versus QA assets.
- **03 mobile-layout investigation/prototyping** can run while 01/04 work on signing/tests, provided it stays on its own branch and does not redefine gameplay semantics.
- **02 simulation design/reference calculations** can proceed while 04 builds fixtures, but production parity changes should wait for the harness.
- **03 artwork/reference work** can proceed without merging production `index.html` changes.
- **04 test cases** can be prepared ahead of the implementation they are intended to guard.

---

# What must be sequential

- Pre-merge validation must precede broad parallel feature work.
- Persistence fixtures must precede the canonical save rewrite.
- Canonical save/state changes should merge before the large combat/offline simulation rewrite.
- Simulation parity must precede broad balance/Farm retuning.
- The Wisp/gameplay semantics contract must precede UI copy that claims those semantics.
- Mobile layout foundation must precede additional artwork/motion complexity.
- Lifecycle regression coverage should precede native lifecycle changes.
- Signing continuity must be locked before release-build migration.
- Production changes from multiple workstreams that overlap the same `index.html` regions should be rebased and merged one at a time.

---

# Major risks

## Technical risks

1. **Signing identity loss or silent rotation** — can permanently break updates for installed builds.
2. **Single-slot/corrupt save loss** — player progression is the highest-value persistent data.
3. **Global mutable state in one large file** — unrelated changes can violate cross-system invariants.
4. **Post-merge-only CI** — regressions can currently land before validation.
5. **String-sensitive QA** — protects known source shapes more than behavior.
6. **WebView lifecycle assumptions** — browser events do not prove Android process-death behavior.
7. **Mutable rolling release** — weak rollback/provenance and possible tag/asset mismatch.
8. **Growing CSS/JS override layers** — visual changes can create non-local regressions.

## Gameplay risks

1. **Live/offline economic divergence** makes balance numbers untrustworthy.
2. **5,000-kill fallback** can suppress stateful progression during long absences.
3. **Non-chronological offline automation** changes the value of Research/Studies.
4. **Unclear multiplier semantics** can make abilities/builds drift from player expectations.
5. **Auto-Ascend/formation inconsistencies** can vary based on reload timing.
6. **Permanent multiplier density** makes late-game tuning unstable without simulation.
7. **Finite-sink currencies and repeating mechanics** may flatten late-game decisions.

## Visual / UX risks

1. **Enemy/tap area can collapse to 0 px on compact screens.**
2. **Necessary text reaches sub-10 px sizes.**
3. **HUD wrapping changes combat space as balances grow.**
4. **Long card stacks bury the common returning-player action.**
5. **Toasts/overlays can obstruct navigation or combat.**
6. **Partial light/dark theming weakens the approved brand direction.**
7. **Inconsistent semantics/focus behavior creates accessibility risk.**
8. **Adding art before fixing layout can make the interface more crowded rather than more polished.**

---

# Required QA checkpoints

Every implementation task must use the smallest checkpoint appropriate to its risk, but the following gates are mandatory.

## Gate A — Pre-merge baseline

For every code/workflow PR:

- static/source validation;
- JavaScript syntax validation where applicable;
- browser/runtime smoke where applicable;
- no unexpected publish/release side effects;
- relevant behavioral regressions green.

## Gate B — Persistent-state changes

Additionally require:

- fresh/current/legacy fixture load;
- malformed-state rejection/normalization;
- save/reload;
- reset/reload;
- restore/reload;
- previous-good recovery behavior;
- no progression duplication/loss across the changed path.

## Gate C — Gameplay/economy changes

Additionally require:

- deterministic reference fixtures;
- live/offline comparison for affected systems;
- Push/Farm invariants;
- boss/Sigil/Luminous behavior where affected;
- Ascension/automation invariants where affected;
- long-absence path when simulation behavior changes.

## Gate D — Visual/UI changes

Additionally require:

- fresh and dense state fixtures;
- agreed compact portrait sizes;
- long formatted balances;
- boss/long-text state;
- five active Wisps/multiple Bonds/buff state;
- no-scroll Rift preserved;
- touch/readability/overlay checks;
- reduced-motion and focus/semantic checks where affected.

## Gate E — Native/release changes

Additionally require:

- APK package/version/signature attestation;
- install/cold launch when Android runtime gate exists;
- background/resume and force-stop/relaunch for lifecycle-sensitive work;
- update-over-existing-build for signing/release changes;
- publication/provenance verification.

---

# Definition of done for major work

A major task is not complete merely because the visible bug is gone or the code builds.

It is complete only when:

1. the owning workstream's implementation matches the authoritative rule documented for the task;
2. dependencies have been satisfied;
3. relevant QA gate(s) pass;
4. no unrelated subsystem behavior changed without explicit review;
5. save compatibility is preserved or intentionally migrated;
6. Android build/release behavior remains correct when applicable;
7. user-facing wording matches gameplay semantics;
8. the branch is rebased/refreshed against current `main` before merge;
9. CI is green;
10. the task's specific completion criteria in this roadmap are satisfied.

---

# Lead rule for new work

Until P0 is complete, do not prioritize new systems, broad numeric rebalance, additional currencies, additional progression layers or large visual-art expansion.

The current product already has enough systems to prove the game. The immediate job is to make those systems reliable, economically coherent, testable and readable on the devices the Android build targets.
