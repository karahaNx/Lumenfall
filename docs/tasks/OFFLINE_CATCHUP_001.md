# OFFLINE-CATCHUP-001 — complete long offline Auto-Ascend

Owner: current Codex feature-owner chat; Lead / Architecture. Codex is based on GPT-6; exact variant and effort control are not exposed. Communication: English (current user instruction).

Status: implementation and local verification pass; feature remains open. GitHub feature-branch and PR publication is explicitly authorized by the user on 7 October 2026. The prior writer status remains unknown; no release by 02_07 is inferred. Main integration, Android release and required device acceptance remain pending.

Baseline: live main `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`, verified against Git transport and GitHub connector on 7 October 2026. Product index blob `ea44431c163569548973d9e489f75345749a07ee`. Accepted APK reported as 0.1.133, package com.lumenfall.app, build 37363152517. Only open PR: #46, Draft, head 3cdebc236e9ee5081a4bca4e323b11f43aa0d46d; no recent active workflow. PR46/B2 are outside scope.

Original request: [unaltered request](OFFLINE_CATCHUP_001_REQUEST.txt). Original diagnostics/save remain unchanged in `docs/qa/offline-autoascend-2026-10-07/`.

User follow-up, 7 October 2026: "If Javascript can be used instead of all the python, then lets do that aswell." This authorizes the active tooling migration in this owner chat. All six active Python scripts and inline CI helpers have JavaScript/Node.js replacements. Archived originals remain byte-identical, including the hash-recorded recovery helper preserved under `publication_originals/`. Node.js 20+ is the only script runtime needed for current setup/tests/recovery/build support. The Android build itself still uses its established Java/Gradle/SDK tools. Evidence: `../qa/offline-catchup-001/javascript-tooling/`. The Node runner passes132 scenarios (152 expanded results), all12 required negatives and5 extra translated-mutation controls. Node20 tooling/process checks and five layout viewports pass; all41 active JS files parse on Node20. Archive checks remain1509; original source/tree/modes and recovery payloads remain exact. Existing game bytes and signing/release steps are preserved. Workflow helpers and their new dependency paths are tracked by the Android trigger.

## Contract and acceptance

Complete the entire permitted offline window with Auto-Ascend, preserving chronology, online/offline gameplay, balance, formation intent, rewards and accounting. Yield to the UI with bounded work; no larger total event limit. Commit only complete catch-up; interruption, failures and storage errors must preserve an authoritative save and allow retry without partial or duplicate awards. Clear lifecycle busy flags on every exit. Preserve studies beyond the combat cap, backup/recovery, package/signing and WebView 60.

Test original ON Clear21, ON Clear20, OFF, long absence/72-hour cap, research/Study and automation/Motes boundaries, whole/split numerical policy, cold start/resume/repeated return/cancellation/restart/recovery. Run full pre-merge gates and 12 required negatives. Review exact bytes, integrate only after writer handover, build/publish and verify immutable Android identity, then obtain required Android/device acceptance. Keep this feature open until all required acceptance is recorded. No next feature or archive early.

## Evidence

Unchanged archived driver with Node 24.19.0 and exact product blob: ON through applyOfflineProgress at 8 hours throws after 250001 iterations, elapsed 23808.744627645367 seconds; normalization changes no fields. OFF completes 8 hours, 106128 iterations and 773 kills. Original raw rerun files are stored in `docs/qa/offline-catchup-001/baseline/` (VM evidence, not Android).

## Decisions and next action

Implementation index SHA256: `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`; Git blob `90e4678cb28fa833fdacbc01d1744d9465f6a356`. Publication branch: `feature/offline-catchup-001`, isolated worktree `/workspace/lumenfall-offline`. Prepared against current main `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, whose delta from the original baseline contains only JavaScript-policy documentation. Product/test/workflow/script bytes are unchanged by incorporating that main checkpoint. No integration/new APK exists.

Retain the authoritative scheduler and its internal clock across cooperative work batches, and isolate catch-up from live state until completion. No new gameplay/workflow rule. Persist English preference in active AGENTS/bootstrap/project instructions/new-account prompt; historical originals remain unchanged.

Next: publish the validated branch and open its feature PR under the latest explicit user instruction; prior-writer handover remains required before main integration. All132 full-suite scenarios and12 required negatives pass; source/context/archive/smoke/APK-verifier-self-test checks pass. V8 6.0 product-script execution passes. Self-review and exact evidence are in `../qa/offline-catchup-001/README.md` and `validation.json`. Required physical-device acceptance remains pending. Publication scope is this feature branch, its PR, and continuation evidence. The prior product writer has not been declared released.


## Integration and Android acceptance still required

1. The user explicitly instructed: "You must publish it to the github, so it knows it." This authorizes publication on this feature branch and its PR despite the previously unknown writer status. The observed 02_07 release remains unknown; record it as unknown rather than inventing handover. Before main integration, resolve the prior product-writer handover. Recheck live main, branches/open PRs/active runs before writes. PR46/B2 remain outside scope.
2. Publish this candidate and evidence on its feature branch; create a feature PR and attach it to this owner chat. Read current workflow triggers; normal PR CI must pass on the exact candidate. Review any integration delta before merge.
3. Merge exact validated bytes. The existing Android workflow automatically runs on main product-index changes; do not add an unnecessary dispatch. Verify integrated product bytes, rerun relevant integrated gates, and verify the successful APK's package `com.lumenfall.app`, workflow versionCode/versionName, source commit and certificate SHA256 `A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`. Use only the existing signing identity. Preserve the resulting APK hash and release/run receipt.
4. On the exact new APK, preserve an original backup and test cold return/resume for Clear21/20 and OFF, long absence/cap, return-panel claim and subsequent live play, repeated return, background/force-stop during catch-up then restart, save/reload/backup/recovery. Record installed version, device/Android/WebView version (including supported WebView60), signing-compatible upgrade and results. Obtain required physical-device/TalkBack acceptance; modern Chrome and V8 probes do not replace it.
5. Save decisions/test receipts/integration/APK/device identity and actual writer release in GitHub. Archive only this owner chat after all required acceptance; do not start another feature early. Currently there is no remote writer for this feature to release.

## GitHub publication authorization and preflight

User instruction, 7 October 2026:

> You must publish it to the github, so it knows it.

This current instruction authorizes a scoped publication checkpoint: the existing OFFLINE-CATCHUP-001 implementation, JavaScript tooling migration, original request, decisions, test receipts and remaining acceptance steps on `feature/offline-catchup-001`, plus a draft PR to main. The instruction supersedes the earlier publication stop; it does not prove the earlier writer released ownership. Main integration and Android/device acceptance remain open.

Preflight at 12:54 UTC: main `b2a1f440e8ad9fed34b37551e468224310d2a6f6`; all advertised branch refs inspected; only open PR is Draft #46 on `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`; no active runs among the latest 30. The requested feature branch does not already exist remotely. The latest JavaScript-policy documentation is incorporated, with the environment guide updated to the verified Node tools. Pre-merge CI runs on PR creation/update; Android builds require main changes or explicit dispatch. Published PR/head/CI status will be recorded in this task’s publication receipt.
