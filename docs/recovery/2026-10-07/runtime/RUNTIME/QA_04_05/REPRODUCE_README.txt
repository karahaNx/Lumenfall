04_05 QA evidence is standalone and read-only. No product change/commit is
authorized by this package. Scripts show the actual review workspace paths;
adapt only private paths if reproducing elsewhere, preserving SOURCE bytes.

Dependencies used: Python3.12.14 with PyYAML, Node24.19.0, runtime Playwright,
Chrome for Testing153.0.8010.0 linux64 headless shell. Chrome archive:
https://storage.googleapis.com/chrome-for-testing-public/153.0.8010.0/linux64/chrome-headless-shell-linux64.zip
binary SHA2561346545781835e04ece3434a16d656ad5cbe60a6a179a43dff43f79a21f9a4ad
Acorn8.15.0 is a private reviewer grammar-check dependency, not product code.
SOURCE contains the thirteen frozen candidate files. BASE_SOURCES supplies
unchanged assets, behavioral scripts, workflows, APK verifier and mobile
configuration. REFERENCE supplies exact R1/R2 index bytes for controls.

The actual run started with a private R2 clone; overlay only SOURCE paths,
preserving existing modes. A separate GIT_INDEX_FILE read-tree R2 / add13 paths
/ write-tree gave4c07cd5d66cb5928eb99623ff86efaa81e268829. Never stage own logs,
runtime files or mobile/www in the product index. No commit was made.

Own commands are recorded in OWN/evidence/*execution.json and
OWN/own-initial-execution-receipt.json. REPRODUCE/setup.py prepares R1/R2/local
throwaway browser stages and seven commands extracted unchanged from the
workflow. engine.cjs hosts and closes each browser in the same process/network
namespace. Own fixtures run on private engine bindings. adversarial.py uses
Python Fraction inputs, followed by adversarial.cjs. runtime-check.cjs uses
grammar-target parse and a deliberately missing BigInt availability control.

gates-run.py records full aggregate stdout/stderr, before/after frozen hashes,
commands, exits and every observed nested process output. Its observer changes
no return values/timeouts. Stage-only runtime guard is the unchanged workflow
gate. verify-gates.py validates actual DOM/JSON payloads separately from exit0.
Run mobile/target-rift checks separately from full gate04; no simultaneous own
browser investigations occurred during the final suite. after-gates.py then
traces all123 diagnostic rows on R1/R2/local and supplements full-engine safe
counts. trace-classify.py uses exact Python represented-segment arithmetic.

All original LAB/B1/B2 requirements are byte-identical in ORIGINALS. Original
worker mobile FAIL is complete in ORIGINAL_FAIL, even though own targeted R2
and local probes pass. Input RAW_CURRENT's1322 hashes were checked; unrelated
worker runtime output is not duplicated in this phone package. Own raw output
is complete for the actual gates, probes, controls and diagnostics. CRC and
root manifest cover every packaged payload. Huge JSON can be inspected by
index; use Source_Index.txt for targeted reading.

The phone ZIP uses RAW_EVIDENCE.tar.xz for solid lossless compression of all
large raw JSON/DOM/logs/screens. Extract it at package root before replaying
verification scripts. RAW_MANIFEST.json covers every original raw byte; the
root MANIFEST.json covers the archive and all direct package files. No raw
screen, failed process or assertion result was discarded for compression.
