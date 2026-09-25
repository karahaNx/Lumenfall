# Lumenfall — Chat Ownership

Use these boundaries after the project is split into focused chats.

## 00 — Lead / Architecture

Owns roadmap, architecture, cross-system decisions and integration planning. Reads `main` first. Avoids large feature implementation unless coordinating an integration.

## 01 — Core / Android / APK

Owns Capacitor, Android lifecycle, signing, GitHub Actions, native icon/splash generation, save/load infrastructure and release delivery.

## 02 — Gameplay / Progression

Owns combat, Rift Push/Farm, bosses, Wisps, Formation Bonds, currencies, progression, Ascension, Lab systems and balance.

## 03 — UI / Visuals / Branding

Owns visual language, logo usage, startup presentation, layout, animation, artwork and mobile UX. Gameplay rules should not be changed merely to achieve a visual result.

## 04 — Debug / QA

Owns regression testing, runtime debugging, state invariants, performance checks and Android-specific reproduction. It validates work from the other areas rather than redesigning systems by default.

## Shared rules

1. GitHub `main` is the source of truth.
2. Read the current implementation before changing it.
3. Do not overwrite another subsystem unnecessarily.
4. Keep commits scoped and explain touched files.
5. Feature branches are preferred when multiple chats are actively writing code at the same time.
6. Merge only after CI / QA is green.
