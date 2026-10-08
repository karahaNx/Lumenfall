# Forge text verification on current main

Baseline: `214d45411ce2fb420f0e4b372063811a967679b1` (product HTML SHA256
`6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`).
Candidate HTML SHA256:
`7e12642138fd2338fc07919aca01ee9c14c5f56bd0460d0d70c1a9193f4ff307`.
Replacing the removed suffix reconstructs the entire baseline file byte-for-byte.
No gameplay, economy, save, native Android or signing bytes are changed.

Local Node 24.19.0/official Chrome 155.0.8059.39 checks are recorded in
[validation.json](validation.json). The unchanged baseline and candidate both
pass existing `forge-contracts`; it includes 336 purchase cases, legacy-overcap
preservation, four causal negative controls and exact UI/model debit checks.
Ten candidate gameplay/accessibility scenarios and both native mobile/motion
scenarios pass through the unmodified current `tests/behavioral/run.cjs`.
Complete raw logs are stored as named `.log.gz` files in this directory.

[presentation.json](presentation.json) compares all eight cards across seven
states: locked, unaffordable, one-level, bulk near cap, Max, capped, and preserved
overcap. Descriptions, visible prices, effects, queue/disabled states and complete
model plans are identical; only the unwanted suffix differs. Rendering is pure.

[viewports.json](viewports.json) contains twelve profiles, each measured on both
baseline and candidate: 320/390/430 px × normal/200% root text × normal/reduced
motion. All Forge control rectangles are at least 44×44 px; level contrast is
11.96:1; no runtime errors. Current baseline overflow at 200% text and internally
in existing bulk buttons is preserved, not fixed or misreported as an introduced
regression. This scoped text result is not full accessibility/device acceptance.

The existing documented Chromium 151 dump-DOM timeout was reproduced on unchanged
current main; [that failing diagnostic](baseline-forge-contracts.log.gz) is
preserved. Chrome 155 supplies the passing results without changing test gates.
Earlier 7 October results and their baseline remain historical, not current accept.

PR/full CI/integration/build receipts will be appended after publication.
Desktop checks do not establish physical phone, exact Android WebView60 or
TalkBack acceptance. Keep any required physical acceptance open in the
[task](../../../tasks/FORGE_TEXT_001.md).
