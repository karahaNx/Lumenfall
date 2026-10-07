# OFFLINE-CATCHUP-001 — complete long offline Auto-Ascend

Owner: current Codex feature-owner chat; Lead / Architecture. Codex is based on GPT-6; exact variant and effort control are not exposed. Communication: English.

Status: **implemented, integrated and published as Android0.1.134; required physical-device acceptance pending**. The feature and owner chat remain open. No next feature has started. The final documentation checkpoint releases this owner's repository writer after verified publication; no other writer is declared released.

Original request: [unaltered user request](OFFLINE_CATCHUP_001_REQUEST.txt). Preserved diagnostics/save: `../qa/offline-autoascend-2026-10-07/`. Current release/CI/device instructions: [release evidence](../qa/offline-catchup-001/release/README.md).

## Authorization and scope

The original mandate owns reproduction, implementation, review, integration, Android build/publication and verification, with standing user authorization. Follow-ups on 7 October 2026:

> If Javascript can be used instead of all the python, then lets do that aswell.
>
> You must publish it to the github, so it knows it.
>
> then finish the job

The latest completion instruction supersedes the earlier publication-only stop and authorizes necessary feature integration/release. Historical 02_07 writer release remains **unknown**; no handover is invented. PR46/B2 were untouched. The current authorization/decision is preserved in [integration decision](../decisions/2026-10-07-offline-catchup-integration.md); [publication decision](../decisions/2026-10-07-offline-catchup-publication.md) preserves the earlier narrower checkpoint.

One goal: finish the entire permitted offline window with Auto-Ascend without total-event exhaustion, UI blockage, partial/duplicate progress or broken save/recovery. Preserve chronology, online/offline parity, balance, caps, rewards, accounting, formation intent, studies beyond the combat cap, mobile accessibility, WebView60 and established package/signing. No new gameplay rule, schema or UI feature.

## Baseline and original reproduction

Original verified main: `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`; product blob `ea44431c163569548973d9e489f75345749a07ee`. Previously accepted APK0.1.133/package com.lumenfall.app/build37363152517. Original open PR46: Draft, head `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.

Unchanged archived Node24 driver/original save: normalization changes no fields. ON Clear21/stored target22,8h, throws after250001 iterations at23808.744627645367 elapsed seconds. OFF8h completes106128 iterations/773 kills. A meaningful regression rejects the immutable original failure. Raw receipts remain in `../qa/offline-catchup-001/baseline/`; these are VM results, not Android acceptance.

## Implementation and local acceptance

The scheduler retains its exact clock/grid across bounded generator batches; each timestamp resolves atomically before yielding. Maximum 256 events/batch,8ms target checked every32 events. Study-only time beyond combat cap is cooperative too. Catch-up uses detached working state, so tick/input/autosave cannot consume partial progress. A successful primary save commits one captured endpoint; recovery-write failure does not undo that primary commit. Cancellation/background/failure preserve the base and retryable window. Busy flags clear; return generations invalidate stale startup callbacks. The terminal guard excludes a successfully reached endpoint. No game balance/cap/schema or native identity changes.

Product SHA256: `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`; Git blob `90e4678cb28fa833fdacbc01d1744d9465f6a356`.

Core evidence covers original ON Clear21/Clear20/OFF8h,72h cap,96h Study beyond cap, exact work-budget equivalence, existing whole/split numerical policy, research/Study/Motes/Empower ordering, earned/spent accounting, formation intent, interruption/restart, runtime/primary/recovery failures and backup/recovery. Fixed original ON8h completes302400 kills/14400 ascends. Browser tests cover real startup, pointer Claim, visibility/resume/repeated return, event-loop progress, reload interruption and retry. Self-review checks the full contract; no independent reviewer approval is claimed. Modern Chrome results do not establish native Android/WebView60/TalkBack acceptance.

The user-requested migration replaces all six active Python scripts and inline CI helpers with Node.js20+. Original browser assertions/registrations/source contract are retained; shared recovery/ZIP/process/server helpers and additional tooling controls pass. Archived originals remain byte-identical, including the hash-recorded recovery helper under `publication_originals/`. Established Android Java/Gradle/SDK formats/signing/release steps remain unchanged. No active Python runtime is required.

Local gates:132 scenarios/152 expanded PASS results;12 required negatives plus5 translated-mutation negatives;31 raw-result controls, real timeout and two causal mutation/undo checks. Node20.19.5 syntax/tooling/process checks and five layout viewports pass. Context/source/smoke/APK verifier self-test/fixture-tool checks pass;1509 archive checks and the exact96-file B2 tree/modes remain intact. Original local/fix/migration evidence: [QA index](../qa/offline-catchup-001/README.md).

## Publication, integration and Android release

Publication-only checkpoint: feature branch `feature/offline-catchup-001`, initial head `82ed0518c3efac43c7662cf97dc5e747fb0e6a82`, Draft PR51 opened12:57:28 UTC on 7 October 2026 against docs-only main `b2a1f440e8ad9fed34b37551e468224310d2a6f6`. First CI37624792096 was cancelled after the publication receipt updated the head and is not final acceptance.

Final implementation head: `bd71a8608d133f99971a74a79e300e1f5db254df`. [Exact-head CI37625068008](https://github.com/karahaNx/Lumenfall/actions/runs/37625068008) succeeds, including132 scenarios,12 required negatives, Node tooling/source/staging and guarded startup. It used Node20/Chrome154.0.8037.97. Full raw logs are saved in the release evidence.

[PR51](https://github.com/karahaNx/Lumenfall/pull/51) was marked ready, then merged with the expected validated head into **`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`**. Live main/52 branches/open PRs/recent runs were inspected before integration; PR46 was unchanged and no competing active run was observed. The integrated tree exactly equals the tested head. Integrated source/context/archive checks pass; no relevant implementation/test/workflow delta required a repeated full suite.

The normal main push produced [Android build37626819252](https://github.com/karahaNx/Lumenfall/actions/runs/37626819252), run number134, success at13:15:58 UTC. No unnecessary dispatch. Release0.1.134/package com.lumenfall.app/versionCode134 uses the established certificate:
`A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.

The actual [published APK](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk), asset618745109,6833971 bytes, has SHA256 **`09e53527d8a968801f6457297558efcb4ffcf5b260af47f202447e57455b6f6c`**. Official build-tools35 aapt/apksigner verify package/version, unchanged certificate and v1/v2 signatures. CRC passes and all 15 product/font/branding assets match main. Actual extracted APK product passes Node8.3.0/V8 6.0.286.52 ON8h execution,302400 kills/14400 ascends,1181 cooperative batches. This is an engine probe, not native device acceptance.

## Required remaining acceptance and next action

No physical Android device/emulator is connected. Signing-compatible installation, native lifecycle/storage, supported WebView60 DOM and TalkBack acceptance remain **pending**. The original request says: "If physical device access is absent, finish available work and request the concrete remaining device test; keep the feature open until required acceptance is recorded."

Use [DEVICE_ACCEPTANCE.txt](../qa/offline-catchup-001/release/DEVICE_ACCEPTANCE.txt): upgrade preserving the real backup/save, original ON Clear21/8h return/Claim/live play, Clear20/OFF, cap/Study, repeated return, background/force-stop during catch-up then restart, save/reload/backup/recovery, WebView60 and TalkBack. Report installed app/device/Android/WebView versions, elapsed offline windows and each PASS/FAIL/NOT TESTED. Backup restoration resets lastSeen; importing an old backup timestamp alone is not a long-window device test.

Save concrete results in GitHub after rechecking live baseline; fix any reproduced failure within this feature. Do not mark feature complete or archive until required acceptance is recorded. The final documentation checkpoint's PR description provides its publication/validation receipt and actual release of this owner's repository writer scope. Historical 02_07 release stays unknown, and PR46/B2 ownership/reviews remain unchanged. No repository writer is reserved during the device-test wait.
