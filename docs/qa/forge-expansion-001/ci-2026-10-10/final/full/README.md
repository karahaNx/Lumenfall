# PR105 repaired full pre-merge CI evidence

This directory preserves the new repaired full-CI raw evidence and current API acceptance receipts; failed run 38043830487 remains separate history. The ZIP remains outside this subset; its GitHub API digest and downloaded bytes were independently compared.

Every raw .log/.txt file and large text/JSON file uses deterministic lossless gzip. manifest.json records original and stored byte counts and SHA256. Verify the stored digest, decode gzip where declared, then verify the original bytes/digest. manifest.sha256 binds the manifest.

Currency folders stale-refresh, all-white and retired-card-returns contain EXPECTED failing causal controls. Their acceptance requires exit code 1; they are distinct from failures of the unmodified game.

The 22 mandatory harness negatives are supported by the immutable strict-loop workflow and the successful GitHub step. The complete Actions job log was unavailable through the connector (Transport closed); individual raw caught-message traces are therefore not claimed. The full behavioral log is preserved.

Full DOM/product HTML and historical artifacts are excluded. Omitted artifact entries retain their original paths, byte counts and hashes. CI fixtures/screenshots are synthetic; no private user save is introduced. Physical Android, native WebView 60, TalkBack, signed APK and release acceptance are not claimed.
