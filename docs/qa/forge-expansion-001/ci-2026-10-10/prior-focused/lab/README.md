# Research Lab CI evidence — run 38043830489

This package contains the new, successful Lab CI evidence for PR #105.

- PR head: 03b78ce1d13ad1a04670315bad05174c406935ab
- CI synthetic merge: 9e99a7d6d8ac89f4f557b2144b7e8cb6f64b6ff9
- Tree: 118b0fcd905b3234d62d391cc5b0108c250a3bc0
- Product SHA-256: 05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac
- Run: https://github.com/karahaNx/Lumenfall/actions/runs/38043830489

## Observed results

| Check | Result |
| --- | --- |
| Lab core | PASS, 2456 assertions, 10 causal controls caught |
| Lab boundary | PASS, 2344 assertions, 388 cases, 5 causal controls caught |
| Boundary stress | PASS, 2182 cases, zero unavailable predictions and zero mismatches |
| Prism state | PASS, 3506 assertions, 180 payouts, 8 routes |
| Lab mobile | PASS, 6420 assertions, 12 profiles, 24 screenshots, exit 0 |
| Actual V8 | PASS, 580 assertions, Node 8.3.0 / V8 6.0.286.52 |

## Contents and integrity

The raw lab-validation receipts and screenshots are copied byte for byte. The
metadata directory preserves acceptance, API run/job/artifact metadata, the
verified synthetic commit and the original ZIP integrity report. The original
artifact ZIP, historical documents, test code and private save files are not
included. These mobile receipts use fresh synthetic test seeds. The six test
files already exist in the published head commit, and their archived bytes were
verified against that commit during the CI audit.

The compressed job log restores the exact UTF-8 bytes returned by the GitHub job
log tool. It uses deterministic gzip level 9, a zero timestamp, and no filename
header. manifest.json records each original file's byte count and SHA-256; the
log entry also records both compressed and original SHA-256 values. Compression
was checked for exact byte restoration and reproducibility. No game tests were
executed while preparing this package.

The manifest lists every payload file, including this README. Its own bytes are
not self-hashed. payloadBytes excludes manifest.json; payloadFiles excludes it
as well. A package inventory/size report accompanies the scratch packaging
script outside this directory.

The mobile scale-2 profiles set the CSS root font from 16px to 32px, doubling
rem-relative text. Fixed-px text may remain unchanged. This is browser evidence,
not native WebView textZoom or TalkBack acceptance.
