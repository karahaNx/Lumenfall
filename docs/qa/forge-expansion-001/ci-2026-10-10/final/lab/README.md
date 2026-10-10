# Research Lab CI evidence — run 38047024763

This package preserves the current successful Lab CI evidence for PR #105 after the two compatibility-test repairs.

- Head: 979ed4a3cb1e106456f86efacc114c89e825a88b
- Base: 5bcd1c861af51511ca3d5c4a07d9d61e72fdff03
- CI synthetic merge: 8e0e4911e6821242369e8a1877a40068bab23a10
- Tree: dd9e503000291554af6e93c294d99d475a09612f
- Product SHA256: 05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac
- Audit UTC from clock.curr_time: 2026-10-10 11:08:45 UTC
- Run: https://github.com/karahaNx/Lumenfall/actions/runs/38047024763

## Observed CI results

| Check | Result |
| --- | --- |
| Lab core | PASS; 2456 assertions, 10 causal controls caught |
| Lab boundary | PASS; 2344 assertions, 388 cases, 5 causal controls caught |
| Boundary stress | PASS; 2182 cases, seed 104, zero unavailable predictions and zero mismatches |
| Prism state | PASS; 3506 assertions, 180 payouts, 8 routes |
| Lab mobile | PASS; 6420 assertions, 12 profiles, 24 screenshots, exit 0 |
| Actual V8 | PASS; 580 assertions, Node v8.3.0 / V8 6.0.286.52 |

All 11 job steps succeeded. The ZIP's 5192547 bytes and SHA256 were compared against the GitHub artifact API; ZIP CRC validation passed. The six archived Lab test files match the exact head commit byte for byte.

## Contents and byte verification

The ten raw lab-validation receipts and all twenty-four new screenshots are copied byte for byte from this run. Every copy was compared against the ZIP-derived file manifest before packaging. Current acceptance, final run/job/artifact API metadata, the synthetic commit, audit clock and archive integrity manifests are retained in metadata/.

The job log preserves exactly the UTF-8 bytes returned by the decoded GitHub job-log tool, with no added newline. It uses gzip level 9 and a zero timestamp. Decompression was compared byte for byte with the original log, and repeated compression produced identical bytes. manifest.json records original and stored byte counts and SHA256 for each payload. Verify the stored hash; decode gzip if declared; then verify the original hash. manifest.sha256 binds manifest.json.

The manifest covers every payload including this README. Its own manifest.json and manifest.sha256 are excluded from payloadFiles/payloadBytes to avoid self-hashing. A complete inventory and total byte count are in the accompanying scratch report outside this directory.

Historical documents and receipts, the artifact ZIP, test code, full product HTML and private save files are excluded. The omitted archive entries retain their paths, byte counts and hashes in the archive manifest. The mobile evidence uses fresh synthetic test seeds. Scale 2 sets the CSS root font from 16px to 32px, doubling rem-relative text; fixed-px text may remain unchanged. These are browser results, not native WebView textZoom or TalkBack acceptance.

No game tests, CI reruns, repository edits, remote writes or Android builds were performed during this audit and packaging task.
