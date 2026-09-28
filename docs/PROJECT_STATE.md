# Lumenfall — Project State

_Last updated: 2026-09-29_
_Consolidated against `main` @ `2f3a65ce974953cb0f216e25ea10a242bd9a6a7c`._

## Source of truth
GitHub `main` is authoritative. New chats reconstruct current state from the repository. Merged implementation and automated contracts override stale planning text.

## Product
Lumenfall is an Android-only, mobile-first idle RPG packaged with Capacitor. Core systems include Rift Push/Farm, auto combat and Guardian Tap, Wisps and Formation Bonds, bosses, Ascension/permanent upgrades, Lab Research/Long Studies, Deeds/dailies, offline progression, backup/restore, Auto-Ascend and Auto-Empower.

## Milestone status

### P0 — complete
P0-01 through P0-05 are complete.

### P1 — complete
P1-01 through P1-06 are established, including final APK identity, chronological offline automation, Wisp semantics, mobile Rift layout, accessibility coverage and deterministic lifecycle/offline regression coverage.

### P2 — completed product improvements
Integrated on `main`:
- P2-01A — Ascension integrity plus boss/background behavior.
- P2-01B — Wisp rarity/module progression pacing.
- P2-01C — Sigil/Comet endgame utility.
- P2-02A — Formation quick access/presets, Rift Long Study visibility, Permanent Upgrades/Long Studies split, Auto-Empower All and Deed progress.
- P2-02B — Wisp and Lab mobile hierarchy.
- P2-03A — Wisp role integrity aligned with actual combat mechanics.
- P2-03B — Auto-Ascend cleared-Rift integrity.

The gameplay/UX improvement program represented by these tasks is substantially complete.

### P2-04 — blocked/deferred, not merged
Native Android lifecycle validation remains unmerged. APK build/identity, emulator boot/install and packaged WebView execution were demonstrated, but GitHub-hosted Android emulator/ADB transport instability prevented a complete green native lifecycle smoke and required 3/3 unchanged-code stability.

No production gameplay/save regression was demonstrated by the P2-04 failures. Do not continue emulator parameter roulette without new causal evidence. P2-04 is not a global blocker for independent product development.

## Current direction
**Next product milestone: P2-06 — Artwork, motion and late-game presentation refinement.**

P2-06 improves the existing game rather than adding systems for their own sake: stronger region identity, Wisp/boss differentiation, cosmetic/milestone presentation, motion/feedback and overall visual progression while preserving compact mobile readability, no-scroll Rift behavior, accessibility, frame pacing and battery behavior.

**After P2-06: P2-07 — Late-game system expansion decision.** Lead + Gameplay reassess the current game and decide whether additional mechanics are justified by a concrete player decision/problem.

**P2-05 — Production release hardening** is deferred until the product is closer to a release candidate. It must preserve established signing and APK identity guarantees.

## Coordination
- `main` is the only production source of truth.
- 03 owns P2-06 presentation; 02 reviews gameplay meaning; 04 owns performance/accessibility/regression acceptance; 00 controls scope and merge order.
- Do not redefine gameplay semantics from UI code.
- Overlapping `index.html` production changes merge sequentially unless 00 confirms isolation.
- P2-04 stays isolated and unmerged until its native acceptance criteria can genuinely be satisfied.
- P2-05 is not active.
- New late-game mechanics wait for P2-07.

## Current QA baseline
Preserve established behavioral, persistence, live/offline parity, chronology, Wisp formula, compact viewport, accessibility, negative-self-test, browser-runtime and APK identity contracts. P2-06 must add presentation without weakening these guarantees.

## Immediate next action
03 — UI / Visuals / Branding audits current `main` specifically for P2-06, produces a bounded implementation plan from current product evidence, then implements and validates the highest-value presentation refinements. 02 and 04 review semantics/performance where affected. 00 prevents scope expansion into P2-07 mechanics during P2-06.
