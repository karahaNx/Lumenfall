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

Status: integrated candidate, full validation in progress. No main merge or new
APK is claimed yet. All 57 observed remote heads were fetched; 50 have merged PR
receipts. Squash/rebase integrations explain why ancestry alone undercounts them.
No set of 27 unmerged gameplay implementations exists in this observed inventory.

The PR46 conflicts are resolved while preserving the resumable offline flow and
all historical bytes. The exact B1/B2 product functions match the restored B2
candidate. All 12 inherited Lab scenarios and the new offline-transaction
integration scenario pass. The new regression covers work budgets, payment at
the actual reward, private yielded state, primary/simulation failure and retry,
recovery-write failure, legacy OFF, processing time and the post-cap Study tail.
Source/tooling/APK-verifier checks, guarded browser startup and all 12 required
negative controls pass. All original baseline comparisons are retained: two
new zero summary counters and exact legacy OFF/remembered-tier maps are asserted
separately before the unchanged old state/summary comparison.

Environment evidence: Debian Chromium151 --dump-dom timed out on a static page
and unchanged main; its CDP checks passed. A separate official Chrome155 passes
the same DOM checks without changing gates. Interrupted/failing diagnostic runs
are not acceptance; final logs and exits must be saved after completion.

Next: finish the full 146-scenario suite and corrected baseline comparison,
publish the candidate, obtain fresh GitHub CI, then merge and check the normal
Android build. Physical device/TalkBack and independent review are not claimed.
