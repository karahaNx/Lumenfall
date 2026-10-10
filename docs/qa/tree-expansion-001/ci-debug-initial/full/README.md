# Initial Full CI failure and Prism adapter repair

This package preserves the failed first Full CI attempt for Tree PR #106 and the exact local adapter-only repair. It does not accept the failed CI run.

- Run: `38083769079`; job: `114305874535`; attempt: 1.
- Failed head: `0c539c528d3b950a786d0ea377fcfc59499f1a3a`.
- Synthetic merge: `3a65d44e1bb0fadc35e98ced5e0e99b7840bc7ac`; tree: `da50c4eead313efee2ad9683e43e5a0cb2ccc71f`.
- Expected and locally reproduced product SHA256: `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`.

Step 9, Exact Prism earning numerical and causal regression, aborted with `ReferenceError: treeLevel is not defined`. The isolated Prism VM extracted the new Frontier reward helpers without their catalog/level dependencies. The independent payout assertions were not reached. Steps 10–14 were skipped, including the stateful suite, all 22 original causal negatives and browser smoke. Their expected results must not be inferred from this attempt.

The upload action reported that its configured paths contained no files. GitHub returned an empty artifact list; no artifact ZIP exists for this run. The whole decoded GitHub job log is preserved as lossless gzip. Checkout identity is corroborated by the run API and synthetic commit parents/tree; the skipped stateful step never emitted its source-hash file.

The local repair changed only `tests/behavioral/prism-earning.cjs`, loading the actual production Tree catalog/index/level helper and original numeric normalizers. Independent expectations, old fixtures and all seven causal controls remain unchanged. The exact command `node tests/behavioral/prism-earning.cjs --source index.html` then passed 341,654 assertions, 277,916 formula cases, 3,780 payout cases and all seven controls, with exit 0 and empty stderr. Both the original local failure and subsequent pass are preserved. Product bytes were unchanged.

Local engine: Node v24.19.0 / V8 13.6.233.17-node.51. The failed CI used Node v20.20.2. A complete new CI run is still required. Native Android/WebView acceptance remains untested.

`manifest.json` lists every other file in this package with original and stored byte counts and SHA256. `encoding: gzip` means decompress before comparing original bytes/hash. Identity entries are copied byte-for-byte, including trailing whitespace. `source-manifest.json` preserves the earlier scratch inventory. No source HTML, private save or artifact ZIP is included.
