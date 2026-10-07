# 04 — Debug / QA Audit

_Last audited against GitHub `main` immediately before commit: `4551e0911b36702f3121b3e737ce5f304ffbfc76` on 2026-09-25._

## Scope and ownership

This audit covers the **04 — Debug / QA** workstream defined in `docs/CHAT_OWNERSHIP.md`: regression testing, runtime debugging, state invariants, performance checks, and Android-specific reproduction. It intentionally does **not** redesign gameplay systems and does **not** change application code or CI behavior.

GitHub `main` is treated as the source of truth. The current application remains an Android-only Capacitor app whose game UI and logic live primarily in the single `index.html` WebView payload.

## Executive summary

Lumenfall now has meaningful regression protection around several bugs that were recently found in full debugging: Rift Push scroll locking, reset-save lifecycle handling, save-restore reload protection, enemy HP persistence, source sanity validation, browser startup smoke testing, Capacitor generation, Android resource generation, and a Gradle APK build.

The current QA layer is still strongest at **protecting known implementation details** rather than proving **system behavior across stateful scenarios**. Most source guards are string/regex assertions embedded in the Android workflow, and the browser smoke test covers a clean mobile-sized startup without interactions. There are no deterministic state-fixture tests, no automated restore/reset/resume flows, no mature-save or corruption matrix, no Android emulator/device runtime gate, and no performance/soak baseline.

The highest-value next step is therefore not to add more isolated string guards. It is to add stateful behavioral regression coverage around persistence, lifecycle, Push/Farm transitions, offline simulation, and Android resume/restart behavior.

## Current regression protection

The current `.github/workflows/build-android.yml` performs several layers of protection before producing the APK:

1. **Source-structure validation**
   - Checks required HTML IDs.
   - Rejects duplicate HTML IDs.
   - Detects literal `document.getElementById(...)` references whose IDs are absent.
   - Checks `cacheEls()` for stale cached IDs.
   - Rejects known legacy/forbidden tokens.
   - Extracts inline scripts and runs `node --check` against them.
   - Requires selected feature/lifecycle tokens to remain present.

2. **Known-regression guards**
   - Reset lifecycle flags and pending-reset storage key.
   - Save-restore reload guard.
   - Tick suspension during reset/restore.
   - Enemy restore/spawn path.
   - Push scroll-lock behavior.
   - Protection against moving scroll synchronization back into the 100 ms Rift render path.

3. **Browser runtime smoke**
   - Serves staged web assets locally.
   - Launches a headless Chromium-class browser at a 390 × 844 viewport.
   - Confirms initial Rift zone runtime rendering.
   - Confirms the Rift scroll-lock class.
   - Confirms an enemy has rendered.
   - Confirms the HUD initializes.

4. **Build-chain validation**
   - Recreates the Capacitor Android project.
   - Generates icon/splash assets.
   - Runs Capacitor sync.
   - Runs a Gradle debug APK build.
   - Confirms the produced APK exists and is non-empty.

### Strengths

The source validator is effective at catching accidental deletion of known critical hooks and stale DOM references. The syntax pass is also valuable because the project currently embeds most JavaScript directly in `index.html`.

The browser smoke test is a meaningful improvement over static validation because it proves that a clean game instance can initialize and render in an actual browser engine.

The recent reset, restore, and enemy-persistence bugs are no longer protected only by developer intent; they have explicit CI guards.

### Limitations

Much of the protection is implementation-shaped rather than behavior-shaped. A refactor can fail a string check while preserving correct behavior, and a code path can still contain the expected strings while behaving incorrectly.

The workflow currently triggers automatically for relevant **pushes to `main`**, not for pull requests. Therefore the documented shared rule “merge only after CI / QA is green” is not fully enforced as a pre-merge gate by this workflow. A regression can land on `main` before the Android QA workflow detects it.

## Current runtime QA coverage

Automated runtime coverage currently proves only a narrow clean-start scenario:

- staged web assets can be served;
- the game initializes in headless Chromium;
- the first Rift zone is rendered;
- Push/Rift scroll lock is present;
- an enemy is rendered;
- the HUD initializes.

This is useful as a smoke test, but it does not currently exercise:

- user interaction;
- Push → Farm → Push transitions;
- enemy damage followed by reload;
- a mature persisted save;
- legacy save migration;
- corrupted save recovery;
- save backup creation;
- save backup restore;
- reset followed by reload;
- background → foreground resume;
- cold restart after background/process death;
- offline progression;
- boss retreat/retry;
- Auto-Ascend;
- Long Studies completing offline;
- daily rollover;
- startup-intro re-entry;
- repeated pause/resume cycles;
- browser console/page errors after initial render.

There is also no automated installation and launch of the generated APK on an Android emulator/device. The Gradle build proves package generation, not Android runtime correctness.

## Save / load / reset / restore protections

### Existing protections

The persistence path has been materially hardened.

**Reset**
- `resetInProgress` prevents repeated resets.
- `RESET_PENDING_KEY` is written before the main save is deleted.
- `loadState()` sees the pending marker and forces a fresh state.
- `resetBootPending` keeps the marker until a new fresh save succeeds.
- The game UI is paused while reload begins.
- Normal save writes are blocked during reset.
- `beforeunload` does not rewrite the old in-memory save during reset.

This is a good defense against the previously dangerous reset/reload race.

**Restore**
- The decoded backup is persisted before reload begins.
- `reloadInProgress` then blocks normal autosave and `beforeunload`.
- The game tick is suspended during restore reload.
- The settings overlay is closed and the app is visually paused while reload begins.

This correctly prevents the old in-memory state from overwriting the restored state during the reload window.

**Load normalization**
`loadState()` currently repairs or normalizes several classes of persisted data:

- missing top-level fields are filled from `freshState()`;
- key nested maps are replaced if they are missing, arrays, or non-objects;
- missing Wisp/research/study entries are filled;
- legacy research/study queue fields are migrated;
- major currencies are constrained to finite non-negative values;
- Rift depth and Farm state are normalized;
- active party entries are deduplicated, validated, capped, and given an Ember fallback;
- active Long Studies are checked for valid IDs and finite durations/speeds;
- enemy depth/HP/max HP and luminous accumulator are normalized.

**Enemy persistence**
- `enemyDepth` is stored with enemy HP.
- `restoreEnemyOrSpawn()` only restores HP when the saved enemy belongs to the current depth.
- Saved HP is restored as an HP ratio against the current computed max HP, so balance changes do not blindly preserve stale absolute max-HP values.
- Bosses are prevented from being restored as luminous enemies.

### Remaining persistence weaknesses

The save format has no explicit schema version and no named migration chain. Migration is currently distributed through “missing field” logic in `loadState()`. That becomes progressively harder to reason about as progression systems evolve.

There is only one primary `localStorage` save key. There is no last-known-good copy, checksum, staged write, or fallback recovery slot if the primary payload becomes unusable.

`decodeSaveBackup()` performs only minimal structural validation before accepting a backup. It checks the prefix, parses JSON, and requires an object with `spirits` and `depth`. Full state normalization happens only after reload through `loadState()`.

A concrete integrity gap exists around `questIds`: it is not normalized to an array in the current load path, while `renderDaily()` calls `(state.questIds || []).forEach(...)`. A malformed backup with otherwise acceptable minimum fields can therefore survive backup decoding and reach a runtime type failure after reload.

Other nested gameplay values are also not comprehensively type/range checked. For example, the containers for Wisp levels, rarity, research levels, achievements, ownership flags, queues, and daily data may be structurally present while still containing invalid value types or impossible ranges.

Persistence errors are frequently swallowed with empty `catch` blocks. This prevents a storage failure from crashing the app, but it also makes silent failure possible and makes reproduction/diagnostics harder.

## Android lifecycle risks

The application has a browser-style lifecycle layer:

- autosave approximately every five seconds while visible;
- save when the document becomes hidden;
- in-memory `appHiddenAt` timestamp for foreground resume;
- offline progression applied on resume;
- `lastSeen` persisted for cold-launch offline calculation;
- UI pause class toggled on visibility changes;
- settings are closed before the resume return flow;
- startup/return overlays are sequenced after resume processing.

This design provides a reasonable fallback for cold process restart because `lastSeen` is persisted independently of the in-memory `appHiddenAt` variable. However, the exact Android WebView lifecycle has not been tested automatically.

Important Android-specific risks remain:

- WebView/process death can occur without the same timing guarantees as a desktop browser close.
- A process kill between autosaves can lose the most recent transient combat/state changes.
- Repeated background/foreground cycles may expose re-entrancy problems around `resumeFlowBusy`, startup intro timers, return overlays, and daily rollover.
- No automated test currently distinguishes simple visibility changes from a full Android activity/process recreation.
- Capacitor/native status-bar behavior and packaged asset loading are not covered by the browser smoke test.
- Actual upgrade-in-place behavior is part of release correctness but is outside the current runtime smoke coverage.

The APK build is therefore build-valid, but not yet lifecycle-validated.

## State integrity risks

### Global mutable state

Most gameplay systems directly mutate one global `state` object. This is simple, but it means unrelated systems can violate each other's invariants without a transaction boundary.

High-risk invariant groups include:

- `depth`, `maxDepthEver`, `riftMode`, `farmDepth`, and `farmReturnDepth`;
- `enemyDepth`, `enemyHp`, `enemyMaxHp`, and `enemyIsLuminous`;
- active party membership versus owned Wisp levels;
- queued and active research/studies;
- Auto-Ascend state versus owned unlocks;
- daily date, quest IDs, progress, claims, and login streak;
- currencies and permanent progression before/after Ascension.

### Partial validation

The current validator protects several numeric top-level values well, but state validation is not yet comprehensive enough to define one canonical “valid state” contract.

Examples of values that deserve explicit validation include:

- arrays such as `questIds`;
- every nested Wisp/research/study numeric level;
- boolean feature flags and ownership values;
- rarity/module bounds;
- daily quest IDs against the current quest pool;
- claimed quest keys against active quests;
- impossible active-study combinations;
- enemy luminous flag consistency;
- timestamp sanity;
- unexpectedly huge values that are finite but pathological.

### Backup trust boundary

Backup restore should be treated as untrusted input even when the player created the code themselves. Copy truncation, manual editing, older versions, or future format changes can produce valid JSON with invalid game state.

The current restore path accepts the minimally parsed object first and relies on the subsequent reload/load normalization to make it safe. A stronger model would validate/migrate the candidate state before it replaces the authoritative save.

## Performance risks

The current game is small enough that the implementation is likely acceptable on normal devices, but there is no automated performance baseline.

### Hot loops

The main tick runs every 100 ms and can perform:

- combat damage;
- boss regeneration;
- ability-resource updates for the active party;
- Auto-Tap;
- Auto-Empower;
- Lab queue processing;
- Long Study progression;
- fast battle UI updates;
- party bar updates;
- affordability checks.

Affordability checks are throttled to 500 ms, but they still query multiple button collections in the DOM.

The starfield uses `requestAnimationFrame` and targets a roughly 50 ms draw interval when motion is enabled. This is separate from the game tick.

These loops should eventually have measured budgets rather than relying only on subjective device testing.

### Offline simulation

`simulateOfflineRun()` has a hard `OFFLINE_MAX_KILLS = 5000` safety cap. When the cap is reached with offline time remaining, the remaining time is extrapolated from prior Lumen/Shard rates.

That protects runtime cost, but it changes simulation semantics after the cap. The extrapolated tail does not equivalently continue every discrete event such as:

- boss kills and Sigil rewards;
- luminous kills and Mote rewards;
- depth changes;
- boss retreat/retry;
- total kill accounting;
- subsequent Auto-Ascend opportunities.

This can become a correctness issue for mature/high-DPS saves even if early-game players rarely hit the cap.

### No soak tests

There is no automated check for:

- long-running memory growth;
- accumulating timers/listeners;
- repeated tab changes;
- repeated overlay open/close;
- repeated background/resume;
- very large state values;
- worst-case offline simulation duration;
- slow/mobile-class CPU behavior.

## Areas currently under-tested

The largest gaps are:

1. **Persisted-state startup**
   - fresh save;
   - mature save;
   - legacy save;
   - partially missing save;
   - malformed/corrupted save.

2. **Lifecycle behavior**
   - save → reload;
   - reset → reload;
   - restore → reload;
   - hide → resume;
   - hide → process death → cold launch;
   - rapid/repeated pause-resume.

3. **Rift invariants**
   - Push/Farm mode transitions;
   - Push-point preservation;
   - farm depth recalculation;
   - enemy HP persistence across restart;
   - boss retreat/retry;
   - luminous pity behavior during UI mode changes.

4. **Offline progression**
   - partial enemy HP;
   - boss regeneration;
   - retreat to Farm;
   - retry Push;
   - Luminous rewards;
   - Auto-Tap;
   - Auto-Empower;
   - Lab queue;
   - Long Studies;
   - Auto-Ascend;
   - 5000-kill cutoff behavior.

5. **Daily systems**
   - same-day restart;
   - next-day rollover;
   - missed days;
   - invalid stored quest IDs;
   - claim idempotency;
   - rollover during background/resume.

6. **Android-specific runtime**
   - APK installation;
   - cold launch;
   - background/foreground;
   - activity recreation;
   - process recreation;
   - update over an existing signed build;
   - storage continuity after update.

7. **Failure diagnostics**
   - browser console exceptions;
   - rejected promises;
   - `localStorage` write failure;
   - malformed backup reason reporting.

8. **Performance**
   - tick duration;
   - DOM/render frequency;
   - memory growth;
   - offline simulation wall time.

## Likely regression hotspots

### 1. `index.html` monolith

Gameplay rules, state persistence, UI rendering, offline simulation, lifecycle events, and input handling live in one large file. Cross-system changes can therefore introduce regressions far outside the visually edited section.

### 2. Persistence lifecycle

The highest-risk functions/flows are:

- `freshState()`;
- `loadState()`;
- `saveState()`;
- `decodeSaveBackup()`;
- `restoreSaveBackup()`;
- `performReset()`;
- initialization;
- `beforeunload`;
- `visibilitychange`.

These flows decide whether long-term player progression survives.

### 3. Push / Farm / enemy state

The relationships among:

- `enterPushMode()`;
- `enterFarmMode()`;
- `highestFarmableDepth()`;
- `spawnEnemy()`;
- `restoreEnemyOrSpawn()`;
- online kills;
- offline retreat/retry

are tightly coupled. A seemingly small change can duplicate rare-enemy rolls, lose a Push point, heal/reset an enemy unexpectedly, or persist mismatched depth/HP.

### 4. Offline simulation

Offline simulation mirrors significant parts of online combat and automation. Any gameplay change that is implemented only in the online loop can create online/offline divergence.

### 5. Ascension and automation

Ascension mutates many progression fields at once. Auto-Ascend can trigger from both active and offline progression, multiplying the number of state transitions that need invariant checks.

### 6. Embedded QA logic in the workflow

Because detailed QA assertions are embedded directly inside `build-android.yml`, they are harder to unit test themselves and can become formatting-sensitive as `index.html` is refactored.

## Recommended QA improvements

### Behavioral state-fixture harness

Create a repeatable test harness that can launch the current web payload with seeded `localStorage` fixtures and assert state after deterministic actions.

Initial fixtures should include:

- fresh game;
- representative mid-game save;
- representative late-game save;
- previous-format save;
- corrupted/malformed values;
- Farm-mode save;
- damaged boss save;
- active Long Studies;
- Auto-Ascend enabled.

The important shift is from “does this source string exist?” to “given state X and action Y, is resulting state Z valid?”

### Explicit state validation and migrations

Define a canonical state schema/version and centralized migration/validation pipeline.

Conceptually:

`parse → identify version → migrate → validate/normalize → accept`

A backup should pass this pipeline before becoming authoritative.

### Persistence recovery strategy

Maintain a last-known-good save or equivalent rollback mechanism before overwriting the primary save. This is particularly valuable for an idle RPG where save loss is disproportionately damaging.

### Interactive browser regression tests

Extend runtime QA to interact with the app rather than only dumping initial DOM.

Priority scenarios:

- damage enemy → save/reload → HP ratio preserved;
- enter Farm → reload → Farm state preserved;
- return to Push → Push point restored;
- restore known backup → reload → restored values visible;
- reset → reload → fresh state remains fresh;
- simulated background/resume → offline progress applied once.

The browser runner should also fail on uncaught JavaScript exceptions and unhandled promise rejections.

### Android runtime smoke

Add an Android emulator/device stage after the browser behavior suite is stable. The minimal native smoke should:

- install the generated APK;
- cold launch;
- verify the WebView reaches a ready state;
- background and resume;
- force-stop and relaunch;
- confirm persisted state survives.

This should validate lifecycle behavior that Chromium-on-Linux cannot prove.

### Performance baseline

Measure rather than guess.

Useful starting budgets:

- worst-case `tick()` execution time;
- offline simulation wall time for representative late-game fixtures;
- memory after repeated tab/overlay/resume cycles;
- number of expensive full renders during common loops.

The goal is regression detection, not premature micro-optimization.

### QA code organization

Move substantial validation/test logic out of long inline workflow heredocs into dedicated versioned test scripts when implementation begins. The workflow should orchestrate QA; test behavior should live in files that can be run locally and reviewed independently.

## Prioritized QA tasks

### P0 — Protect `main` before merge

1. Run the relevant QA/build workflow for pull requests or otherwise establish a pre-merge required check.
2. Preserve the current `main` push build/publish behavior separately from pre-merge validation.
3. Fail runtime testing on uncaught browser errors, not only missing DOM markers.

**Why P0:** current CI is strongest after code is already on `main`. With multiple workstreams, that is the wrong side of the merge boundary.

### P0 — Persistence regression suite

1. Add deterministic fixtures for fresh, mature, legacy, Farm, and damaged-enemy saves.
2. Test load normalization and invariants.
3. Test Reset → reload.
4. Test Restore → reload.
5. Add malformed backup/state cases, including non-array `questIds`.
6. Verify enemy HP/depth persistence.

**Why P0:** save corruption or progression loss is the highest-impact failure class.

### P1 — Lifecycle and offline behavior

1. Test background/resume and cold restart.
2. Test offline progression from partial enemy HP.
3. Test boss retreat → Farm → retry.
4. Test Auto-Ascend offline.
5. Test Long Study completion and Lab queue progression offline.
6. Test daily rollover across resume/restart.

### P1 — Canonical state contract

1. Add an explicit save schema version.
2. Centralize migration and normalization.
3. Validate nested types/ranges.
4. Validate backup candidates before replacing the current save.
5. Add a recovery/last-known-good strategy.

### P2 — Android runtime gate

1. Install the APK in an emulator.
2. Cold launch.
3. Background/resume.
4. Force-stop/relaunch.
5. Confirm save continuity.
6. Add update-over-existing-build coverage when the release pipeline needs stronger upgrade guarantees.

### P2 — Offline simulation correctness

1. Build representative high-DPS fixtures that hit `OFFLINE_MAX_KILLS`.
2. Compare capped/extrapolated results with a deterministic reference simulation.
3. Decide explicitly which discrete systems must remain exact after the cap.
4. Protect that policy with regression tests.

### P3 — Performance and soak coverage

1. Establish tick timing baseline.
2. Establish worst-case offline simulation budget.
3. Repeatedly cycle tabs, overlays, Push/Farm, and background/resume.
4. Track memory/timer/listener growth.
5. Add thresholds only after representative measurements exist.

## Recommended QA acceptance criteria for future workstreams

For high-risk changes touching gameplay state or lifecycle, 04 should expect all of the following before considering the change protected:

- clean source validation;
- JavaScript syntax validation;
- behavioral fixture tests for the affected state transition;
- clean browser runtime with no uncaught errors;
- existing regression scenarios still passing;
- Android build success;
- Android lifecycle smoke when the change is native/lifecycle-sensitive.

A visual-only change does not need unnecessary gameplay assertions, but it must not remove required DOM hooks or break the runtime smoke.

## Final assessment

The current project is materially safer than it was before the recent full-debug pass. The reset race, restore race, enemy persistence, Push scroll behavior, and initial runtime startup all have explicit protection.

The QA system is nevertheless still **reactive and regression-specific**. It knows several bugs that must never return, but it does not yet encode the broader behavioral contract of a persistent idle RPG.

The next QA milestone should therefore be a **stateful behavioral regression layer**, followed by a **real Android lifecycle smoke layer**. That will convert the current collection of targeted guards into a durable QA system capable of supporting parallel workstreams and continued progression-system growth.
