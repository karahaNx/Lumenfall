# Tree checkpoint evidence — 8 October 2026

This checkpoint verifies the confirmed purchase-cap prerequisite. Exclusive
prestige/run effects and their value transition remain undecided. No full F29
acceptance, integration, app release or physical-device acceptance is claimed.

Baseline: main `214d45411ce2fb420f0e4b372063811a967679b1`, incorporated in the
private feature branch at `921f5f76d3d09f6228e665576dd47d1a57b3969e`.
Original baseline game SHA256:
`6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.
The original upgrade/deed scenario passed 941 assertions in Chrome 155.

The system Chromium 151 timed out on the unchanged game and an empty page,
including outside the filesystem sandbox. An isolated official Chrome download
in /tmp runs the same required harness successfully. Browser identity and source
SHA256 appear at the start of each browser log. No repository browser gate was
weakened to pass.

Final source/hash and evidence integrity are recorded in identity.json.

- tree-purchase.txt: actual handler/control payment, last effective level,
  canonical/recovery save, backup codec, idempotent normalization, legacy raw
  levels, invalid/forged/locked/nonfinite/unrepresentable rejection.
- tree-mobile.txt and tree-reduced-motion.txt: 320/390/430px, actual Tree text
  doubled, at least 44px controls, scrollable controls, visible focus and focus
  retention, maxed states, no gameplay/save mutation, motion policy and
  conservative gradient-aware contrast at least 4.5:1.
- source.txt, apk-verifier.txt, tooling.txt: current source/identity self-test
  and Node tooling checks.
- negative-gates.txt: all 12 required negatives completed with in-page QA
  failures; timeout/nonzero alone was insufficient to count as caught.
- behavioral.txt: broad suite started with the purchase-gate source before the
  wrapping fix (SHA256 2940ea8a6f1096d4cff59a8432e99374ff6b43fe90857f7f72b2e8f52cb43839).
  It is separate evidence and does not attest the final source. Final-source
  pre-merge CI and integrated-version acceptance remain required.

The initial mobile probe froze the panel entry animation at scale .995. Static
geometry is now measured without that compositor animation, and reduced-motion
policy is checked before doing so. With that setup corrected, the 320px doubled
text check exposed a real wrapping failure; the scoped Tree min-width and
overflow-wrap fallback fix resolves it. These observations are test setup/fix
history, not independent review or Android-device evidence.
