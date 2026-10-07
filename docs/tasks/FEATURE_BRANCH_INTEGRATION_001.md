# FEATURE-BRANCH-INTEGRATION-001 — integrate available feature branches

## Request and scope

The user requests all 27 new Lumenfall features, expected to exist in their own
GitHub branches, to be integrated into the game. They explicitly authorize
integration and merging; no repeated general permission is needed.

Baseline: `b6a5b6f4512872c87ab81fea958abe393d5cb98e` on `main`.
Working branch: `integration/feature-branches-2026-10-07`, isolated worktree.
The [branch inventory](../qa/feature-branch-integration/branches.json) records
every observed branch, commit, ancestry and incremental product delta.
Do not invent 27 pending implementations when the repository does not contain
them. Report integrated, already integrated, historical and missing work honestly.

Goal: integrate all available unfinished gameplay implementation while retaining
the current game, saves, offline corrections and required validation gates.
The only observed unfinished gameplay feature is LAB-MOTES-001/PR46. Its
archived B2 correction supplies the required Number/DataView arithmetic fix;
the archived whole game and Python harness must not replace current main.
Retired diagnostic/release experiments are not gameplay features.

## Sources and acceptance

- Original Lab request and payment contract:
  [request](LAB_MOTES_001_USER_REQUEST.txt),
  [requirements](LAB_MOTES_001_REQUIREMENTS.txt),
  [B1](LAB_MOTES_B1_001.md), [B2](LAB_MOTES_B2_001.md).
- PR46 head: `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.
- B2 correction commit: `013f52669dcd5cffb7c4757d7e627601dc4f3a57`;
  restored source tree: `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`.
- Current offline contract: [OFFLINE-CATCHUP-001](OFFLINE_CATCHUP_001.md).
- Preserve each exact selected speed, full per-level payment, independent
  Study Queue/Use Motes intent, reward-boundary chronology, old-save OFF,
  recovery/backup/Ascend/reset and declarative purchase order.
- Preserve resumable offline transactions, processing-time replay, daily retry,
  legacy WebView fixes, all existing game systems and unchanged save schema.
- Port only the feature-specific legacy test additions to the active Node
  harness; retain all existing assertions, CI gates and negative controls.
- Validate source, tooling, complete behavioral suite, required negatives,
  browser startup and fresh GitHub CI for the combined candidate.
- Review the complete diff. Self-review and automated checks are not independent
  review. Physical affected-phone/WebView60/TalkBack checks remain unavailable
  unless actually performed; report app acceptance separately from code merge.

## Current checkpoint

Status: integrated into main; signed APK 0.1.138 published and verified, device acceptance OPEN.
[PR57](https://github.com/karahaNx/Lumenfall/pull/57) merged at
`20aaae62a4b6e46f8d75775085918eaba4e8de29`. Its full tree equals validated
candidate `b62476dc461f00d2a7ea756f700f755bd763326e` exactly:
`e177ba6955f5673460d6201b52701563cf480467`. PR46 is now recorded merged too.

All 57 original remote heads were fetched; 50 have merged PR receipts.
Squash/rebase integrations explain why ancestry alone undercounts them.
The follow-up inventory has 58 branches, adding only this integration branch;
there is no observed set of 27 new unmerged gameplay implementations.

The PR46 conflicts preserve current resumable offline/retry/processing-time,
daily/legacy fixes and all historical bytes. The two exact B1/B2 farm functions
match the separately restored Number/DataView candidate. All 13 Lab scenarios
pass, including offline private yielded state, full payment at actual reward,
storage/simulation failure and retry, recovery failure, processing time and tail.

Fresh [CI37692669340](https://github.com/karahaNx/Lumenfall/actions/runs/37692669340)
PASS on the final candidate: full 146 default scenarios, all 12 required negative
controls, source/tooling/APK identity self-tests and guarded browser startup.
The initial local aggregate failed only the old offline baseline comparison of
new additive fields. Its corrected complete driver passes separately, explicitly
asserting zero counters/legacy defaults before retaining the full old oracle.
That failing original log and corrected output are both preserved; the first
aggregate is not labelled green. See [validation receipt](../qa/feature-branch-integration/validation.json)
and [CI acceptance lines](../qa/feature-branch-integration/ci-acceptance.txt).

Debian Chromium151 DOM export hangs on static HTML and unchanged main; a separate
official Chrome155 passes without gate changes. These diagnostics do not accept
the product. Physical affected-phone/exact WebView60/TalkBack and independent
review have not been performed. Code integration is verified; device acceptance
remains OPEN and this owner chat must remain open.

Build Android APK37694671685 PASS at the integration commit; signed APK 0.1.138
is published with package com.lumenfall.app and the established certificate.
Downloaded APK SHA256 `81b9be7edea971335a06f06d1894d91e75a92736738cc935fc2a920a26a02e1e`
matches GitHub's release digest. All 526 ZIP entries pass CRC verification and
all 15 bundled game/font/branding assets equal validated main byte-for-byte.
Raw CI/build and local test logs are preserved as gzip files in the receipt folder.
The [release and continuation receipt](../qa/feature-branch-integration/README.md)
records immutable commit/asset IDs, tools and acceptance limits.

Next: affected-phone/exact WebView60/TalkBack acceptance for these new bytes,
and any required independent review. Preserve the task/chat as open. If further
feature implementations are later pushed to GitHub, inventory and integrate them
within their actual requirements; no remaining implementation is invented from
the user's count of 27. Documentation-only receipt changes do not require a new APK.
