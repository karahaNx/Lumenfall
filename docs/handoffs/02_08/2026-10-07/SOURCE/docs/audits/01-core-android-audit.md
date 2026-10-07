# 01 — Core / Android / APK Audit

_Date: 2026-09-25_  
_Audited against `main` immediately before this document was committed._  
_Base main commit: `03ebd680d7e8733f6a5629a5481bac7eb3f33025`_

## Scope

This audit covers the ownership area defined for **01 — Core / Android / APK**: Capacitor, Android lifecycle, signing, GitHub Actions, native icon/splash generation, save/load infrastructure and APK release delivery.

This is a documentation-only audit. It does not change application code, workflow behavior, Android configuration, save behavior or APK logic.

## Current Android / APK architecture

Lumenfall is an Android-only mobile application implemented as a local WebView game packaged with Capacitor. The gameplay client remains in `index.html`; Capacitor is the native shell rather than a separate application architecture.

The Android package identity is `com.lumenfall.app`, with app name `Lumenfall` and `mobile/www` as the Capacitor web directory. The configured native background color is `#081027`.

The permanent Android source footprint in the repository is intentionally small:

- `mobile/capacitor.config.json`
- `mobile/package.json`
- `mobile/package-lock.json`

The generated `mobile/android/` project and staged `mobile/www/` assets are ignored by Git. CI creates the Android project from scratch for every build using `npx cap add android`.

The current locked Capacitor generation is 6.x. At audit time the lockfile resolves `@capacitor/android` and `@capacitor/core` to 6.2.1 and `@capacitor/status-bar` to 6.0.3.

The architecture has very little custom native code. Native integration is currently limited primarily to the Capacitor container and status bar styling. That makes regenerated Android projects practical and reduces Gradle-project drift, but it also means lifecycle handling is still mostly implemented through browser/WebView events rather than Capacitor-native lifecycle APIs.

## Current build / release pipeline

The canonical pipeline is `.github/workflows/build-android.yml`.

Relevant pushes to `main` trigger the Android workflow when they touch `index.html`, branding, fonts, the `mobile/` directory or the Android workflow itself. Manual dispatch is also supported.

The pipeline currently performs the following sequence:

1. Checkout.
2. Configure Node.js 20, Java 17 and Gradle.
3. Verify the runner-provided Android SDK.
4. Restore the persistent signing keystore from the private draft release tagged `lumenfall-signing-v1`.
5. Install locked mobile dependencies with `npm ci`.
6. Run static source QA, HTML ID validation, JavaScript syntax checking and targeted lifecycle/regression assertions.
7. Stage `index.html`, fonts and branding into `mobile/www`.
8. Run a headless Chromium runtime smoke test at a 390x844 mobile viewport.
9. Generate a fresh Capacitor Android project.
10. Replace Capacitor's default Android version fields so `versionCode` equals the GitHub Actions run number and `versionName` becomes `0.1.<run_number>`.
11. Rasterize `branding/lumenfall-mark.svg` into launcher/adaptive icon and splash inputs.
12. Generate Android icon and splash resources.
13. Run `npx cap sync android`.
14. Build with `./gradlew assembleDebug --no-daemon`.
15. Copy the result to `Lumenfall.apk`.
16. Clean obsolete Actions artifacts and legacy EXE/AAB release assets.
17. Force-update the `android-latest` tag and replace the APK asset in the fixed `Lumenfall Android — Latest` release.

The most recent Android build observed during this audit was workflow run 81 from commit `1d2a52758ea9b75c6d04d939106f396dbfc10fc0`, and it completed successfully. The distributed APK is therefore versionCode 81 / versionName 0.1.81. Later documentation-only commits do not trigger a new APK build.

The current release model intentionally provides one rolling downloadable APK rather than a retained public archive of every Android build.

## Signing architecture

Update compatibility currently depends on one persistent keystore stored as the `Lumenfall-debug.keystore` asset in the private draft GitHub release `lumenfall-signing-v1`.

The workflow copies that keystore to `$HOME/.android/debug.keystore`, and the generated debug build is signed with it. This has successfully stabilized Android package signatures so current-generation APKs can update installed current-generation builds in place.

The signing design has one major weakness: if `lumenfall-signing-v1` cannot be found, the workflow automatically generates a new key and creates a replacement signing release. That behavior keeps CI green but silently breaks update compatibility with every APK signed by the previous key. Loss of the production signing identity should be a hard failure, not an automatic recovery path.

The keystore is also operationally critical infrastructure stored inside the same GitHub repository/release environment that consumes it. An independent protected backup is advisable because deletion, repository loss or permission problems can otherwise turn into a permanent inability to update installed applications.

## Save / load architecture

The primary persistent game state is stored in WebView `localStorage` under `lumenfall_save_v2`.

`saveState()` updates `state.lastSeen` and serializes the complete state object. Runtime autosave occurs every five seconds while the document is visible. The application additionally saves when it receives a browser `visibilitychange` to hidden and on `beforeunload`, subject to the reset/restore guards.

`loadState()` is more than a raw JSON read. It provides backward-compatibility/default merging, validates important object structures, normalizes currencies and numeric state, repairs invalid party data, migrates older queue/automation fields, normalizes Rift Push/Farm state and sanitizes persisted enemy state.

This is a reasonable lightweight migration strategy for the current single-file architecture.

### Reset safety

Reset uses `lumenfall_reset_pending_v1` as a persistent transaction marker.

`performReset()` sets the marker before deleting the main save and initiating reload. On the next boot, `loadState()` sees the marker, removes the main save again, creates fresh state and leaves `resetBootPending` set until a successful fresh save clears the marker.

This protects reset against reload timing and stale in-memory autosave races.

### Backup / restore safety

Manual backups use the text prefix `LUMENFALL1:` followed by URI-encoded JSON.

Restore writes the imported state directly to the primary save, sets `reloadInProgress`, pauses the old runtime and reloads. The `reloadInProgress` guard blocks autosave and `beforeunload` from overwriting the newly restored disk state with the old in-memory state.

The race that could previously destroy a restore is therefore explicitly guarded.

### Offline progression and resume

`lastSeen` is the time basis for offline progression. On normal startup, offline progress is calculated before startup code advances and saves the timestamp.

While the process remains alive, `visibilitychange` records when the app was hidden. When it becomes visible again after at least one second, daily state and offline progress are recalculated, the state is saved and the UI is re-rendered.

This provides functional Android background/resume behavior through WebView visibility semantics.

## Technical debt and risks

### 1. Signing identity can silently rotate

This is the highest release risk.

The workflow treats a missing signing release as permission to generate a replacement key. A successful build after such a loss would produce an APK Android correctly refuses to install over existing signed installations.

**Recommendation:** once a production signing identity exists, missing/corrupt signing material must fail the workflow loudly. Initial key creation should be a separate, explicit bootstrap operation, not normal build behavior.

### 2. Signing key has no independent recovery path documented in the build architecture

The private draft release is persistent, but it is still inside the same repository/release control plane.

**Recommendation:** maintain an offline or separately secured backup of the exact keystore and document its certificate fingerprint and recovery procedure. The recovery copy must never be regenerated as a substitute.

### 3. Distributed APK is a debug variant

The workflow builds `assembleDebug`. Stable signing makes it update-compatible, but a debug variant is not the correct long-term production artifact.

**Recommendation:** plan a controlled transition to a release build that uses the existing signing identity so package update compatibility is preserved. Do not switch signing certificates merely to rename the build type.

### 4. Primary save is a single point of failure

There is one active `localStorage` save slot. If the stored JSON becomes unreadable, `loadState()` falls back to `freshState()`. Once a new state is subsequently saved, recoverable old data may be lost permanently.

**Recommendation:** add a lightweight previous-good recovery snapshot or journal before replacing the primary save. Recovery should be bounded and deterministic, not a growing history.

### 5. Save errors are swallowed

`saveState()` catches storage/serialization exceptions without surfacing them. A player can therefore continue playing while persistence has stopped.

**Recommendation:** track save success/failure and expose a non-intrusive but explicit persistence warning after repeated failures. CI/QA should be able to exercise the failure path.

### 6. Backup validation is shallow

Backup decoding currently validates the prefix, JSON structure and a small number of expected fields. Full normalization only occurs after the subsequent reload through `loadState()`.

**Recommendation:** introduce an explicit backup/save schema version and validate/migrate imported data before making it authoritative. Invalid or future-incompatible backups should fail without replacing the current save.

### 7. Lifecycle relies on WebView browser events

The app currently uses `document.hidden`, `visibilitychange` and `beforeunload`. These cover normal behavior well, but Android process death is not a browser unload contract, and `beforeunload` must never be treated as guaranteed.

The five-second autosave substantially reduces exposure, and saving on hidden is useful, but the implementation is not native lifecycle-aware.

**Recommendation:** add `@capacitor/app` when native lifecycle reliability becomes a priority and handle app state transitions explicitly. Browser events can remain as complementary guards.

### 8. Up to roughly five seconds of foreground progress can be lost on abrupt process death

Because normal foreground persistence is periodic, an immediate kill before the next autosave can lose the newest mutations.

For the current game this is probably acceptable operationally, but it should be a conscious durability budget rather than an accidental property.

**Recommendation:** retain periodic saving but consider immediate saves after infrequent high-value transactions such as Ascension, major purchases, unlocks or settings that materially affect permanent progression. Avoid saving on every combat tick.

### 9. Rolling release publication is not atomic

The workflow force-moves `android-latest` before uploading/clobbering the APK asset. A failure between those operations can leave the tag and downloadable asset representing different builds.

**Recommendation:** publish/verify the candidate artifact before moving the public latest pointer, or otherwise structure release publication so the visible tag and APK become consistent only after successful validation.

### 10. Public rollback provenance is weak

`android-latest` is a mutable release and the APK is clobbered. Git history preserves source, but the exact previously distributed binaries are not retained as a release history.

**Recommendation:** preserve enough release metadata to reproduce or retrieve a known-good APK when investigating upgrade failures. This does not require presenting users with multiple download choices.

### 11. The final APK itself is not fully attested after build

CI validates source and verifies that Gradle produces a non-empty APK. It does not currently make package ID, versionCode and signing certificate verification of the final file an explicit release gate.

**Recommendation:** after build, use Android tooling to assert the package name, versionCode/versionName and signing certificate fingerprint of `Lumenfall.apk` before publication.

### 12. Generated Android project limits native customization

Regenerating `mobile/android/` on every run is currently a strength because native changes are minimal. It becomes a liability if future work requires persistent manifest changes, custom Android code, plugins requiring manual configuration or non-generated Gradle customization.

**Recommendation:** keep the generated-project model while native requirements remain small. Reconsider committing the Android project only when persistent native customization provides a concrete benefit that cannot be reliably expressed through Capacitor configuration or build automation.

## Android-specific weaknesses

The main Android-specific weaknesses are not current functional failures; they are durability and release-engineering gaps.

- The app does not yet have explicit native app lifecycle events.
- Abrupt Android process death can bypass browser unload handling.
- The distributed artifact is a debug build.
- Signing continuity depends on one keystore whose absence currently triggers unsafe automatic replacement.
- APK verification happens indirectly through the build rather than through post-build inspection of the actual distributable.
- The rolling `android-latest` release is convenient but weak for rollback/provenance.
- Direct sideloading means the project itself owns update/signing discipline; there is no Play-managed signing or staged rollout safety net.

## Recommended improvements

The current architecture should be hardened incrementally instead of being replaced.

First secure the release identity. Make the established signing key immutable from the build's point of view, create a separate recovery copy, record the expected certificate fingerprint and make any mismatch or missing key fail the build.

Second improve save durability. Add a bounded last-known-good snapshot, schema/version metadata and explicit validation before restore. Preserve the existing reset and restore transaction guards because they already solve real race conditions.

Third harden the APK release gate. Verify the completed APK's identity, version and signature, then transition deliberately from a debug artifact to a properly configured release artifact while retaining the same certificate.

Fourth add native lifecycle integration only where it provides measurable reliability. The current WebView visibility logic should not be discarded; Capacitor app lifecycle events should complement it.

Finally improve release provenance so a known-good binary can be identified when diagnosing update or device-specific problems without making the user-facing download flow complicated.

## Prioritized next tasks

| Priority | Task | Why |
| --- | --- | --- |
| P0 | Make missing or changed production signing key a hard CI failure | Prevents silently producing an APK that cannot update existing installs |
| P0 | Create and document an independent protected backup of the existing signing keystore and certificate fingerprint | Loss of this key is otherwise unrecoverable for installed-app update continuity |
| P1 | Add post-build APK checks for package ID, versionCode/versionName and signing certificate | Verifies the exact artifact being published |
| P1 | Design a primary + previous-good save strategy | Removes the single-slot corruption failure mode |
| P1 | Add explicit save schema/version and stronger restore validation | Makes future migrations and backup compatibility safer |
| P1 | Stop silently swallowing persistent save failures; surface a controlled warning after repeated errors | Prevents invisible progression loss |
| P2 | Add Capacitor-native app lifecycle handling while keeping existing visibility guards | Improves Android pause/resume/process lifecycle robustness |
| P2 | Define a controlled `assembleRelease` migration using the existing signing certificate | Moves distribution away from a debug artifact without breaking updates |
| P2 | Make latest-release publication consistent/atomic and retain sufficient build provenance for rollback | Reduces tag/asset mismatch and debugging ambiguity |
| P3 | Reassess whether generated `mobile/android/` remains appropriate if native customization grows | Avoids unnecessary Android project ownership until it is actually needed |

## Overall assessment

The current Android path is operational and substantially more robust than a minimal Capacitor wrapper. Builds are reproducible enough for the current scope, the stable signing generation fixes the previous APK update problem, and the save/reset/restore lifecycle contains deliberate race-condition protection.

The largest remaining risks are not gameplay defects. They are **signing continuity**, **single-slot save durability** and **release artifact verification**.

Those should be addressed before adding unnecessary Android complexity. The current generated Capacitor architecture is appropriate for Lumenfall as long as native requirements remain limited and the release/save durability gaps are hardened deliberately.
