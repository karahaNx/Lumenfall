# TREE_EXCLUSIVE_001 — exclusive Ascension Tree upgrades

Status: **in progress; new-effect design decision pending**. No Tree changes are integrated or released yet.
Owner: this feature chat. Repository: karahaNx/Lumenfall.
Branch: feature/tree-exclusive-001. Private worktree: /workspace/Lumenfall-TREE_EXCLUSIVE_001.
Agent: Codex, identified as GPT-6; precise variant/effort unavailable. The prompt's model recommendation is not a runtime attestation. No subagents or message tools used.

## Goal and original requirements

Give the Ascension Tree exclusive prestige/run effects with visible prices, effects and stacking, and preserve purchased value through an idempotent transition. F29 requires distinct effects across Tree, Lab and Forge; different currencies alone do not satisfy it.

The initial [user request](TREE_EXCLUSIVE_001/USER_REQUEST.txt) and [historical inventory/proposal](TREE_EXCLUSIVE_001/proposal-2026-10-07.md) remain available. The later instruction, “Færdiggør featuren og læg det ind til spillet”, authorizes necessary implementation, checks, GitHub integration and app delivery in this scope.

Authoritative sources read:
- docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt (original takes precedence).
- Relevant F29, dependency and save sections in FEEDBACK/TASK_FEEDBACK_REVISION_001.txt under the same lead_context.
- DECISIONS/FEEDBACK_REGISTERED_001.txt: concrete accepted caps, Prism questions, 12h policy and save/value preservation.
- FEEDBACK/EVIDENCE/FINDINGS.txt and FEEDBACK/Source_Index.txt: indexed evidence contains no agreed new Tree prices/effects.

Current live-main AGENTS.md, bootstrap, ownership/Gameplay references, PROJECT_STATE.md, FEATURE_WORKFLOW.md, CODEX_START.md and targeted CONTEXT_INDEX.md sources were read. Current workflow supersedes historical Lead/writer handover gates: the feature owner implements and delivers the assigned scope; actual overlapping edits and main integration still need protection. Repository communication and new checkpoints use English; new scripts use JavaScript/Node 20+.

## Baseline and dependencies

Resume baseline: live main 214d45411ce2fb420f0e4b372063811a967679b1 (8 October 2026). Incorporated into this branch at 921f5f76d3d09f6228e665576dd47d1a57b3969e, tree 3bf2d61a210a30fa73f7f37eb65bfa75da7e493a. Original shared checkout /workspace/Lumenfall is untouched.

Earlier proposal b85240845c023e04732aa0e5a29fda0d5cd8c2ad was based on 0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd; its observations/checks are historical, not current acceptance.

PR46/B2 is merged through 20aaae62a4b6e46f8d75775085918eaba4e8de29 (verified from live GitHub). Main includes Lab paid repeat speed queue, exact Number/DataView farm arithmetic and offline catchup fixes. There were no open PRs at resume. No accepted UPGRADE_IDENTITY_001 matrix was found in current tasks/decisions or matching Tree/identity/upgrade branches. This missing gameplay dependency remains real even though the old writer gate is gone.

Latest reported APK is 0.1.138, package com.lumenfall.app; current PROJECT_STATE records physical-phone/exact WebView 60 and accessibility acceptance as open. That APK is not acceptance of this feature.

## Inventory and decisions

Seven Tree nodes exist. Starlight duplicates Forge/Lab kill-Lumen effects; Steady duplicates tap effects; Momentum duplicates passive Wisp and Wisp-powered tap effects; Echo overlaps Lab offline-rate studies; Swift overlaps Lab Prism studies. Reserves adds offline hours and must be reconciled with the chosen eventual 12 productive-hour policy without silently deleting paid value. Bonds currently discounts both recruitment and Empower, including automation; its description must reflect that.

Implemented local prerequisite: Echo effective level cap 6; Bonds cap 20; no payment without an effect. The shared purchase plan now rejects invalid/forged, locked, capped, unaffordable and unrepresentable buys before payment. UI shows Maxed/Unavailable and preserves the raw over-cap level. Existing raw levels/effects remain intact pending the new-effects value transition. Bonds text correctly includes Empower. Scoped text wrapping handles 320px/doubled text with a WebView-compatible fallback. No bulk/Max/queue buying was added to the single-purchase Tree.

Pending design: an asynchronous question asks whether to develop and measure First Light (once-per-Ascend starting Lumen) and Ascension Anchor (bounded retention of previously recruited/unlocked Wisps), or use an existing agreed matrix supplied by the user. Prices, amounts, caps, unlocks, selection and legacy transition have not been accepted. Elapsed time is not an answer. Dependent product changes wait for that decision; current baseline checks and confirmed purchase gates can proceed.

Do not introduce Prism rounding hacks. Preserve first/repeat reward floors and benchmarks, paid Lab snapshots, fixed Luminous Motes rewards, formation rebuild, chronological live/offline/manual/automatic simulation, save/recovery and cancel/retry atomicity. Existing paid offline extensions cannot be erased implicitly. Any new value transition must transform each complete save snapshot deterministically and satisfy M(M(S)) = M(S), with no restore/refund duplication.

## Scope and acceptance

Targeted Tree behavior, required migration, related UI, regression checks and delivery documentation. No unrelated Forge/Lab redesign or archived prototype replacement.

- [ ] Accepted matrix: effects, prices, caps, unlocks, stacking and all affected ownership decisions documented.
- [x] Deterministic handler rejects invalid, locked, capped and unaffordable buys before payment; UI matches handler (confirmed prerequisite).
- [ ] New effects run only at their intended boundary, including manual/automatic Ascend and live/offline paths.
- [ ] Purchased value preserved explicitly; old/over-cap saves, backup/recovery and repeated migration/restore verified.
- [ ] Prism computation, paid Lab contracts, 12h policy and Motes contracts preserved or changed only by an accepted decision.
- [ ] Relevant 320/390/430px mobile, large-text, 44px controls, focus, contrast and reduced-motion checks pass.
- [ ] Source/tooling/context checks and all required behavioral/negative CI gates pass on candidate and integrated version.
- [ ] GitHub integration, signed APK identity and required Android/device acceptance complete; evidence/status saved.
- [ ] Archive only this owner chat after verified completion. Missing acceptance keeps the feature open.

## Checks, evidence and next action

Historical inventory/formula probes passed on their recorded old baseline. Historical Chromium probes timed out even on an empty page; they are inconclusive failures, not gameplay passes. See the preserved proposal and its evidence links. The first current context check found the historical task too large for the 32 KiB startup budget; that proposal has been retained separately and this compact checkpoint replaces it.

Current checks: source, APK verifier self-test, tooling and task context PASS. Original baseline upgrade-effects-and-deeds PASS (941 assertions) in Chrome 155. Chromium 151 remained inconclusive/timeouts, including outside the sandbox. New tree-purchase-contract PASS; canonical/recovery save and backup codec retain cap/over-cap levels and normalization is idempotent. Tree UI PASS at 320/390/430px, doubled actual text, 44px controls, focus, reduced motion and conservative gradient-aware text contrast. All 12 required negative gates produced completed in-page failures. The broad suite is still running against the pre-wrapping candidate source 2940ea8a6f1096d4cff59a8432e99374ff6b43fe90857f7f72b2e8f52cb43839; it is not final-source acceptance. See [current evidence](TREE_EXCLUSIVE_001/evidence/current-2026-10-08/README.md) for exact hashes and results. Final-source CI and integrated checks remain required.

Next: save the confirmed prerequisite as a clearly incomplete GitHub checkpoint, finish required gates, and obtain the pending gameplay decision before new-effects/migration implementation. Full exclusive feature completion, independent review, integration, signed app release and archival are not claimed.
