# Initial Tree CI: Forge offline adapter failure

Candidate `0c539c52`, synthetic merge `3a65d44e`, product SHA256 `4e4707af…`. Forge run38083768789 failed only step7; Lab38083768886 passed all11 steps. Full source/commit/API identities and actual mobile/V8 counts are recorded in `existing-regression-summary.json`.

The historical reward counterfactual replaced the entire region from `ascendFullPrismGainForCleared` to `ascendPrismGain`. New Tree helpers now live inside that region, so the adapter deleted `treeAscendMotesForWallet` while the actual Ascend handler still called it. The original CI error and exact local reproduction are preserved. This does not demonstrate an actual production eight-hour failure.

The repair changes only `offline-catchup.cjs`: copy the bodies of the two intended historical reward functions individually, leaving unrelated helpers intact. Before full historical state comparison, assert all17 explicitly named new Tree nodes and training progress are exactly0, then project only those verified additions out. Every existing historical reward, ownership, scheduler, save and numeric assertion remains. Product, fixtures, independent reward reference and original historical product/save bytes match the published candidate; no private save payload or complete product HTML is copied here.

The one exact full local invocation started after clock.curr_time20:33:07 UTC: `node tests/behavioral/offline-catchup.cjs --source index.html`. At this checkpoint it is still running with no stderr. `repair-status.json` deliberately makes no terminal PASS claim; its terminal output will be preserved separately. No second invocation is planned.

`ci-job.log.gz` is a lossless gzip of the complete decoded GitHub job-log tool content, re-encoded as UTF-8 without appending a newline. `manifest.json` binds both stored gzip and original decoded bytes. The API-verified artifact ZIPs, complete extraction and all48 fresh screenshots remain in scratch for final evidence. Main, APK, product and frozen fixtures are unchanged.
