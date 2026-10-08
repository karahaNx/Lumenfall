# COMET_UNLOCKS_001 — local evidence

This is a design checkpoint. No new Comet gameplay or UI is implemented.
Source audit results establish facts about the named unchanged baseline;
they do not accept the proposed Trials, migration, prices or cosmetics.

Current candidate base: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
`6e18e8485111a7a5bfa2d5854ed6b9c4735282c2`. Initial base:
`b2a1f440e8ad9fed34b37551e468224310d2a6f6`. PR51 merged during preparation;
the isolated branch was refreshed exactly from read-only connector data.
Live observations and the user's direction choice: [remote-snapshot.json](remote-snapshot.json).

| Check | Result | Evidence / limit |
| --- | --- | --- |
| Exact current baseline reconstruction | PASS | All indexed paths/modes/blobs match the live recursive tree; `git write-tree` equals `6e18e848…`. Commit IDs also hash-match. No remote write. |
| Current context gate | PASS, exit 0 | [current-context.log](current-context.log): 21 entrypoints, 24 local links. `node scripts/codex/check_context.cjs`. |
| Current existing source gate | PASS, exit 0 | [current-source-validation.log](current-source-validation.log): 2 scripts syntax-checked, 16 unique IDs, lifecycle guards. `node scripts/ci/validate_source.cjs`. |
| F27 source audit | PASS, exit 0 | [source-audit.cjs](source-audit.cjs), [source-audit.json](source-audit.json); VM of exact extracted functions/tables with save/UI stubs. Known purchase debit/duplicate/insufficient-funds, reward tables, and ownership/gate hazard. Not full engine or actual migration. |
| Relevant change after PR51 | PASS | [relevant-delta.json](relevant-delta.json): all 19 audited functions hash-identical; all audit outcomes identical. Initial results: [source-audit-startup.json](source-audit-startup.json). |
| Existing feedback formula replay on initial source | PASS, exit 0; exact `cmp` match | [startup-formula-probe.json](startup-formula-probe.json). Original probe and expected output remain in recovery evidence. This was an isolated initial-source replay, not current engine acceptance. |
| Initial existing Comet browser check | INCOMPLETE, process timeout | [startup-endgame.log](startup-endgame.log). Initial restricted attempt could not open loopback; rerun with network permission reached Chromium but timed out at 25s without any QA result. |
| Current existing Comet browser check | INCOMPLETE, exit 1 | [current-endgame.log](current-endgame.log), [browser-process.json](browser-process.json), [browser-stderr.log](browser-stderr.log), [browser-stdout.html](browser-stdout.html). `node tests/behavioral/run.cjs --web-root mobile/www --scenario p2-endgame-currency-utility`. Local process/network permissions were granted; Chromium still timed out at 25s and stdout is empty. No product assertion ran to completion. |
| Browser startup diagnostic | INCOMPLETE, timeout exit 124 | `about:blank` also failed to complete within 15s. The exact root cause is unknown; this is an environment/driver diagnostic, not evidence of a Comet defect. No further repeated browser runs were performed. |
| Feature Markdown links and JS syntax | PASS, exit 0 | Every relative feature link exists and `node --check` accepts the new audit. [feature-docs.log](feature-docs.log). |
| Product/mobile/signing scope | No F27 changes | Final staged diff is limited to `docs/tasks/COMET_UNLOCKS_001*` and `docs/qa/comet-unlocks-001/`. No shared-checkout mutation. |
| New Trials/cosmetics, migration, mobile accessibility, Android/WebView60/TalkBack | NOT RUN / NOT IMPLEMENTED | Acceptance remains open. Source PASS and a local proposal cannot replace integrated behavior or device evidence. |

The new audit script uses Node.js, following the live JavaScript rule. The
existing initial Python checks were run before PR51 replaced active tooling;
no historical original was rewritten. Current checks use the integrated
Node.js tools. Node version: 24.19.0. Browser identified by the harness:
Chromium 151.0.7922.173, SHA256
`2c8d32d29dc6781c35ae196ea83299d507ac88fc339301abe74672feda299779`.
These versions do not establish WebView60/device compatibility.

No price/effect tuning, shared upgrade-matrix edits, PR46/B2 changes, API
messages, GitHub writes, workflow dispatches, Android builds or releases
were performed by this chat. Lead coordination and a scoped writer
checkpoint are still required. The feature remains open.

Raw log whitespace is preserved by this evidence folder's local
`.gitattributes`; it extends the repository's existing raw-receipt practice.
Authored documents/code and the complete staged diff pass whitespace checks.
