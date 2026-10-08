# Current BOND_TEXT_001 candidate verification

Baseline: 214d45411ce2fb420f0e4b372063811a967679b1. Product SHA256:
`feb273d2ff1fb0d514517227d73b3ccb650a850b57f0a8ba5d12bbc77af85ac3`.
Node24.19.0, Chromium151.0.7922.173. Self-review and automated checks only.

14 focused positives and three negative controls pass; see regressions.json and
scenario TXT files. The new contract is also registered in the default CI suite.
Local dump-dom hangs with Chromium151; PATH selects the preserved ../chromium-cdp.cjs
wrapper, which returns the actual browser DOM to the unchanged Node harness.
Native rift-status-mobile-current.txt uses its existing real-browser pipe driver.
First wrapper launch failure and a mistakenly stale staged-source check are
retained; their filenames/source hashes distinguish them from the current PASS. No CI gate is weakened.

Production probes cover all four Bonds active, benched and Lv.0; both Bond
views; all eight ability descriptions; 320/390/430 widths, text100/200%, reduced
motion on/off, 44px disclosure, real Enter, focus outline and scroll reachability.
Four 390px screenshots and raw measurements are in ui/. baseline-probe.json
records the current baseline's actual simulation samples. source-check.json
proves unchanged non-presentation bytes, definition identity, browser mechanics
and conservative partner-text contrast >=7.19:1. No gameplay/save migration.

Reproduce from the repo root with Node20+ and Chromium:

- node docs/qa/BOND_TEXT_001/2026-10-08/run-checks.cjs
- node docs/qa/BOND_TEXT_001/probe.cjs /absolute/repo /absolute/output
- node docs/qa/BOND_TEXT_001/probe.cjs /absolute/baseline /absolute/baseline-output --baseline
- node docs/qa/BOND_TEXT_001/source-check.cjs baseline/index.html index.html output/probe-result.json baseline-output/probe-result.json

Current GitHub CI, integration and signed APK acceptance are pending. These
checks are modern-browser evidence, not physical Android/WebView60/TalkBack.
Historical 7 October files and their manifest are preserved unchanged.
