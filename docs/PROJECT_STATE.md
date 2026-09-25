# Lumenfall — Project State

_Last updated: 2026-09-25_

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
- Lab research and Long Studies
- Daily login, daily quests and Deeds
- Offline progression
- Save backup / restore
- Auto-Ascend and Auto-Empower convenience systems

## Android delivery

- Package ID: `com.lumenfall.app`
- GitHub Actions builds the APK from `main`
- Stable signing key is preserved by the private draft signing release
- Android `versionCode` follows the Actions run number
- Latest distributed build is published as `android-latest/Lumenfall.apk`

## Branding

The production logo source is `branding/lumenfall-mark.svg`.

The old cross-like header sigil is retired. The same Rift Crystal mark now drives the in-game brand, startup intro, launcher icon and native splash.

## Current QA guarantees

CI performs source validation, JavaScript syntax checks, mobile browser runtime smoke testing, Capacitor generation, Android resource generation and a Gradle APK build.

Rift Push vertical scroll lock, reset-save lifecycle, save-restore reload protection and enemy HP persistence have regression guards.

## Working rule

Before modifying Lumenfall, inspect current files and recent commits. Do not assume an older chat summary overrides `main`.
