# OFFLINE-CATCHUP-001 — long offline Auto-Ascend

Owner: this feature chat. Communication: English. Codex is based on GPT-6; exact variant/effort controls are not exposed.

Status: initial implementation/Node migration integrated via PR51 and published as APK0.1.134. Acceptance is OPEN. The user asked whether testing could run here; an isolated Android8.1/API27/WebView61 emulator now runs locally. It reproduced an unsupported replaceChildren call in the advanced-save Auto-Ascend selector before catch-up. Two automated PR51 review findings were also reproduced: processing time is lost before a later save, and the daily overlay is missing after failed rollover/retry. A focused follow-up fixes these within the same feature. No new gameplay rule or other feature.

Original request: [unaltered request](OFFLINE_CATCHUP_001_REQUEST.txt). Original diagnostics/save: ../qa/offline-autoascend-2026-10-07/. Preserve originals. User follow-ups authorize JavaScript in place of Python, GitHub publication and "then finish the job"; the latest user asks: "Cant we test it directly inside here?". Standing authorization covers necessary fixes, tests, integration and established Android publication. Current [feature workflow](../project/FEATURE_WORKFLOW.md) supersedes historical role/writer ceremonies; do not invent an old handover.

## Goal and preservation

Finish the permitted window with Auto-Ascend without total-event exhaustion, blocked normal return, lost/duplicate progress or broken save/recovery. Preserve chronology, online/offline parity, balance/caps/rewards/accounting, formation intent, Study beyond combat cap, mobile accessibility, WebView60, package com.lumenfall.app and established signing. No schema or native identity change. No PR46/B2 work, subagents, messages, new/renamed chats or next feature.

## Baselines and durable evidence

Original product blob ea44431c163569548973d9e489f75345749a07ee/main67c3e99c24587f6c13fc65cfd27f8dcb8e289602 fails ON Clear21/stored22 at8h after250001 events/23808.744627645367s, with unchanged normalization; OFF8h passes. Archived originals and raw reruns: [QA index](../qa/offline-catchup-001/README.md).

PR51 exact head bd71a8608d133f99971a74a79e300e1f5db254df passed CI37625068008 (132 scenarios/12 required negatives) and merged at0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd. Android build37626819252 produced0.1.134, versionCode134,6833971bytes, SHA25609e53527d8a968801f6457297558efcb4ffcf5b260af47f202447e57455b6f6c. Official aapt/apksigner, certificate/v1/v2, CRC, all15 product/font/branding assets and extracted V8 6.0 probe pass. Those engine/modern-browser results did not establish legacy DOM/device acceptance. PR52 retains the release checkpoint and raw logs; it must be reconciled with current main and the corrected release before integration.

Follow-up baseline: main e0775c5 (focused-chat docs/context-tooling update); product still SHA2564a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607. Isolated branch feature/offline-catchup-legacy-webview, worktree /workspace/lumenfall-legacy. Existing current-main rules and other task status must be preserved. [Follow-up evidence](../qa/offline-catchup-001/legacy-webview/README.md) records native startup failure and before/after regressions.

## Implementation and checks

Original fix keeps the scheduler clock/grid across bounded generator batches (256 events;8ms target checked every32 events), resolves whole timestamps atomically, uses detached working state, commits a complete endpoint via primary before recovery, and preserves base/retry on cancellation/error. Study-only tail is cooperative; busy flags clear and stale intro callbacks are invalidated. Active scripts/CI/recovery now use Node20+, with byte-identical historical originals.

Follow-up replaces only selector child replacement with removeChild/appendChild, keeping the select/focus/handlers. It simulates suspended foreground processing through the existing live scheduler before the atomic commit, at existing100ms live-tick granularity, without expanding offline cap/accounting. Pending daily presentation survives failed/cancelled retries and is consumed only when shown (or fresh welcome gift presented).

Acceptance: original Clear21/Clear20/OFF8h,72h cap/96h Study, Motes/automation/accounting and whole/split numerical policy; cold/resume/repeated return, interruption/restart/failure/recovery and primary/recovery/backup; full suite/12 negatives, selector focus behavior and missing replaceChildren DOM regression; actual new APK package/version/certificate/assets and native lifecycle/storage cases. Modern desktop/native WebView61 is not exact WebView60/TalkBack/physical-device acceptance. Keep any required untested acceptance open.

Changed files: root index.html; targeted behavioral runner/prelude/registrations, offline core/UI regressions; this task and focused evidence. No balance/cap/schema/assets/mobile/signing/workflow changes in the follow-up. Self-review and automated findings must be recorded honestly; independent human review is not claimed.

## Next action

Finish focused before/after checks, required exact-head CI/review, publish/integrate the corrected source and verify its new signed APK. Run the installed-app native cases here, record results/limits and dispose of both PR51 findings. Reconcile PR52 with current main, preserving other docs changes and recording the latest release/native evidence. Do not archive or mark complete until required acceptance is recorded; no next feature.
