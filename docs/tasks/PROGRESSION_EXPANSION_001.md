# PROGRESSION_EXPANSION_001 — approved gameplay mandate (2026-10-09)

Status: implementation NOT STARTED. No APK or release claimed.

## User-approved design
- Expand Research Lab, Rift Forge, and Ascension Tree substantially (target at least 20 meaningful, distinct purchasable upgrade types per system, subject to coherent balancing and technical validation). Each system has exclusive mechanics and purchases in its own existing currencies; no duplicated effects merely sold elsewhere.
- Remove read-only permanent legacy-upgrade *shop entries*. Preserve every previously purchased benefit and paid work without double-grant, lost value, or unsafe save conversion. Migrate legacy entitlements into the new catalog or a non-shop compatibility ledger; never silently delete them.
- Replace Comet Trials, Rift Trail, Starfall Crest with special Comet purchases: a combination of one-time ability unlocks and permanent multi-level upgrades. Retain Auto-Ascend and its existing unlock, target, toggle, saves, and automation behavior. Redesign Comet-related Deed unlocks coherently, preserve earned Deeds, paid Comet value, existing saves, and accessibility.
- Currency prices: each independently unaffordable currency cost is red; affordable costs use normal white/default text. No "need X", deficit numbers, additional warning text or extra price UI. Apply across Lab, Forge, Tree, Comet shop, including live refresh and large text.

## Acceptance
1. Audit current `index.html`, all catalog IDs/effects/prices/unlocks, `docs/tasks/UPGRADE_IDENTITY_001/MATRIX.md`, Comet and Deed handlers, and save migration. Design concrete effect/currency/level/cost/unlock/cap table before implementation; avoid arbitrary overlapping multipliers.
2. Implement in isolated branch, preserve current gameplay/Android package/signing and WebView60 grammar. Include explicit deterministic old-save migration and paid-value regression cases (primary/recovery/backup, repeated load, Ascend, offline).
3. Validate actual UI at 320/390/430px, 200% font, focus, touch/keyboard, reduced motion, and red-only missing currency; run full behavioral suite, negative controls, source/tooling/context and browser startup, plus Android build and asset/signature/version checks.
4. Merge to main only after all required CI succeeds; publish signed APK with established certificate, verify release source and version. Report physical Android/TalkBack acceptance separately as open unless actually tested.

## Current GitHub baseline
main `67373faa531f0bb791c883210ee623320861e380`.
Earlier PR90 intentionally retired duplicate shop entries but preserved historical bonuses. This new user direction supersedes that presentation/catalog choice, not the paid-value preservation contract.
Previous PR67/#82/#88/#89/#70 contain partially overlapping draft or unmerged changes: cherry-pick only reviewed compatible logic, never merge wholesale.
