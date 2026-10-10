# Tree pre-CI audit and V8 evidence

Checkpoint: 10 October 2026, 20:21:48 UTC, from `clock__curr_time`. This directory records the independent CI audit and engine/mobile work owned by the CI audit agent. It does not accept the Tree feature for integration.

## Current candidate and checks

Product SHA256: `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`.

| Check | Result | Raw receipt |
| --- | --- | --- |
| Actual Node 8.3.0 / V8 6.0.286.52 | PASS: 2,862 assertions; both inline scripts parsed; 339 complete-IIFE instances; 94 independently priced real-purchase cases; 34 primary/recovery faults; all 20 effects | [v8.json](v8.json) |
| Workflows | PASS: 84 YAML, structure, shell and isolated mock contract checks | [workflow-verification.json](workflow-verification.json) |
| Generated Chromium driver | PASS: syntax of the complete adapted driver on Node24.19.0 | [mobile-generated-syntax.json](mobile-generated-syntax.json) |
| Actual local browser execution | BLOCKED before page execution: no supported Chrome binary; both starts report 0 checks and 0 profiles | [default start](mobile-start-default.json), [historical path start](mobile-start-historical-path.json) |

The two blocked browser starts are historical source `b4343619` and the earlier mobile-test hash recorded in each receipt. The final mobile test has not run in this environment. Its complete generated driver was syntax-checked on the candidate above; actual page behavior, screenshots and DOM acceptance remain mandatory in CI. No native Android, APK, device, TalkBack or exact WebView60 acceptance is inferred from Node/V8 or Chromium.

The standalone V8 test imports no modern harness and the actual engine has no BigInt. The full production IIFE runs; the adapter replaces only DOM presentation, storage and clocks. Tests use actual purchase/reset/simulation functions. The complete set of20 effect IDs and exact test hash are in the receipt. Fixed price and rational-result oracles include Swift10/30/50, six Patient Growth values, paid migration/refund preservation, all 17 new caps and raw overcaps, delayed boss grace, saved charge/Support/timer state, six Formation members and budgeted automatic purchases.

The final browser test covers 12 profiles (320/390/430 CSSpx; normal/200% root text; normal/reduced motion), all 20 rows, prices/caps/locks, trusted touch/Enter/Space, focus and native-frame scroll stability, six-member Formation/reload, the capacity header and every saved-preset count, actual-credit Dust preview and the huge-wallet Empower refresh defect. Its bounded precision check uses Lumen 1e30 with quote 11: initial and 500 ms-refreshed actions must remain unavailable, a trusted blocked click must write nothing, and Lumen 11 must restore one real paid Empower. Browser execution is still required to establish these results.

## GitHub baseline observation

The [baseline audit](baseline-audit.json) is preserved verbatim from 20:00:03 UTC. Baseline dev/head is `2d01049393e3bb45a90d80e07af52ae0484b0ec5`, tree `dd9e503000291554af6e93c294d99d475a09612f`; PR102 was open/draft, with main `67373faa531f0bb791c883210ee623320861e380` unchanged.

| Baseline workflow | Run | Job | Observed terminal status |
| --- | --- | --- | --- |
| Full | 38049484284 | 114205552099 | SUCCESS; 18/18 successful steps |
| Lab | 38049484492 | 114205552749 | SUCCESS; 11/11 successful steps |
| Forge | 38049484322 | 114205552303 | SUCCESS; 13/13 successful steps |

These baseline runs were verified through run/job/commit APIs. Their large artifacts were not downloaded in this audit. The preserved 182-scenario/212-PASS/0-FAIL inventory comes from the earlier accepted Forge run 38047024745 on the identical baseline tree, with provenance and original-log digest in [baseline audit](baseline-audit.json) and the lossless [inventory](baseline-positive-inventory.json.gz). It is an acceptance inventory, not a new Tree result.

Lab and Forge already run for pull requests targeting the development branch; neither has a source-branch job filter at this baseline. Their workflows were left unchanged. The specialized Prism jobs do have a source-branch filter, so the new Tree workflow explicitly runs Prism earning state, independent closeout data, actual browser payout/persistence, mobile acceptance and legacy runtime gates. The Full workflow change retains exactly the existing 22 negative controls and strict failure behavior, adding only a separate combined log and raw process evidence under `validation-evidence`.

The earlier baseline audit and compressed initial plan mention forthcoming tests and initial workflow hashes. Those fields are historical. The later [workflow verification](workflow-verification.json) contains the frozen hashes and all five present Tree entry points, including mandatory `--negative` for core, offline and economy. The loop tests listed there use deliberately marked mock processes; they are shell failure-propagation checks, not gameplay-negative results.

## Preservation and remaining gate

Raw API JSON is saved with lossless gzip in `api/`. The [manifest](manifest.json) maps every saved file to its original path, byte count and SHA256, plus stored-byte identity. API and initial-audit inputs were checked against the earlier frozen audit manifest before copying; every gzip was decompressed and compared byte-for-byte. No full product HTML, browser DOM dump or save payload is included.

Next: publish the draft Tree candidate, require successful Full/Lab/Forge/Tree jobs on its actual synthetic-merge source, and inspect source-bound raw results. Full acceptance retains the complete 182-scenario/212-PASS inventory, zero unexpected failures, all 22 named negative controls and existing tooling/Prism/currency/cosmetics/smoke gates. Preserve CI browser screenshots and failure DOM where applicable. No merge is justified by this pre-CI package alone.
