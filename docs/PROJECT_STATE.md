# Lumenfall — Project State

_Last updated: 2026-09-27_

## Source of truth

The current `main` branch is authoritative. New chats must read the repository before implementing work. Chat history is context, not code truth.

## Product

Lumenfall is an Android-only mobile-first idle RPG built as a single WebView game packaged with Capacitor.

Core loops currently include:

- Rift Push and Farm modes
- Auto combat plus Guardian Tap
- Wisps, recruitment and persistent Wisp progression
- Formation Bonds
- Bosses and rotating boss traits
- Ascension and permanent upgrades
- Lab Research and Long Studies
- Daily login, daily quests and Deeds
- Offline progression
- Save backup / restore
- Auto-Ascend and Auto-Empower convenience systems

## Milestone status

### P0 — complete

- P0-01 pre-merge validation gate
- P0-02 stable Android signing identity
- P0-03 stateful behavioral regression harness
- P0-04 canonical save contract and bounded recovery
- P0-05 authoritative live/offline combat and economy parity

### P1

Complete on `main`:

- P1-01 final APK identity verification
- P1-02 chronological offline automation
- P1-03 Wisp power and gameplay language contract
- P1-04 mobile Rift layout foundation

Current next integration work:

- P1-05 shared visual language and accessibility semantics — implementation pending
- P1-05 QA preparation is already integrated on `main`, including baseline accessibility audit, reduced-motion coverage, strict acceptance contract and negative self-tests
- P1-06 lifecycle/offline regression coverage is implemented and green on draft PR #14, but must remain unmerged until after P1-05

Roadmap integration order remains authoritative unless 00 updates it.

## Android delivery

- Package ID: `com.lumenfall.app`
- GitHub Actions builds the APK from `main`
- Stable signing key is preserved by the private draft signing release
- Established signing certificate SHA-256:
  `A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`
- The Gradle debug APK build is explicitly bound to the controlled signing keystore
- Android `versionCode` follows the Actions run number
- The generated `versionName` is `0.1.<run_number>`
- The exact prepared `Lumenfall.apk` is verified before publication for package ID, versionCode, versionName, APK signature validity and signing certificate
- Publication to `android-latest/Lumenfall.apk` occurs only after final APK identity verification succeeds

Older APK generations built before the signing-path correction may not be update-compatible with the current controlled signing identity and can require one uninstall/reinstall. Builds from the corrected signing pipeline use the established certificate above.

## Persistence and offline simulation

- Save schema is explicit with `SAVE_SCHEMA_VERSION = 1`
- Save loading uses explicit migration and normalization
- Bounded previous-good recovery is stored under `lumenfall_save_recovery_v1`
- Reset and restore reload protections remain enforced
- Live and offline combat/economy use the same authoritative elapsed-time simulation foundation
- Long/high-power Farm simulation remains analytically batched rather than iterating per kill
- Offline automation applies meaningful progression events chronologically, including Research, Studies, Auto-Empower and Auto-Ascend
- P0-05 compositional parity and P1-02 chronology are regression-tested

## Gameplay language

P1-03 defines the canonical contract between Wisp formulas and player-facing terms.

The contract distinguishes where relevant:

- passive Wisp damage
- damaging ability output
- support strength
- resource-generation effects
- Guardian Tap / Auto-Tap
- Formation modifiers
- Rarity, Module and Ultimate modifiers
- boss-specific ability and Tap modifiers

UI work must preserve these gameplay meanings rather than inventing new semantic rules.

## Mobile Rift foundation

P1-04 established the compact portrait Rift layout foundation.

Regression coverage protects:

- no vertical Rift document scroll in Push/Farm
- meaningful enemy / Guardian Tap space
- readable HP, mode and objective state
- stable HUD behavior with dense/long values
- practical primary touch targets
- toast clearance above bottom navigation
- nested cost/resource icon sizing
- compact secondary-detail presentation
- fresh and dense/boss viewport fixtures

## Branding

The production logo source is `branding/lumenfall-mark.svg`.

The old cross-like header sigil is retired. The same Rift Crystal mark drives the in-game brand, startup intro, launcher icon and native splash.

## Current QA guarantees

Pre-merge CI currently includes:

- source/DOM consistency validation
- JavaScript syntax validation
- stateful behavioral regression fixtures
- persistence/recovery guards
- live/offline parity checks
- chronological automation checks
- Wisp formula-contract checks
- compact mobile viewport/layout checks
- P1-05 accessibility baseline and reduced-motion preparation
- intentional negative self-tests proving the harness catches expected regressions
- mobile browser runtime smoke testing

Main Android delivery additionally verifies:

- stable signing material
- Capacitor Android generation
- Android resources
- Gradle APK build
- exact final APK identity before publication

P1-05's strict accessibility contract is intentionally available as an explicit QA target before the visual/accessibility implementation is complete.

## Current coordination

- `main` is the only production source of truth.
- P1-05 is the next production milestone.
- P1-06 PR #14 must remain draft/unmerged until P1-05 is integrated.
- P2 work should not be pulled forward merely because P1-05 is waiting on UI/visual implementation capacity.
- Production changes touching overlapping `index.html` regions should be merged sequentially unless 00 confirms they are isolated.

## Working rule

Before modifying Lumenfall, inspect current files and recent commits. Do not assume an older chat summary overrides `main`.
