# RIFT_GUIDANCE_001 — local verification

Status: local candidate PASS; coordinated GitHub checkpoint, integration and
required APK/device acceptance remain pending. This evidence accepts only the
listed local source bytes, not PR46/B2 or another feature.

Baseline: live main `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
`6e18e8485111a7a5bfa2d5854ed6b9c4735282c2`.
Candidate index SHA256:
`18c4a9d82c3b6b57e815223c88d1db92640e0ed510146d0627abcbb984e1a24f`;
Git blob `166706d88645338f224ac7d573d2eec744ae9dec`.
Verification date: 7 October 2026, Europe/Copenhagen (CEST).
Environment: Node.js 24.19.0, Chromium 151.0.7922.173 on Linux.

## What passed

- `guidance/results.json`: 16 profiles, 160 shown/hidden measurements and
  96 cosmetic pairs. Widths 320/360/390/430px, heights 640/640/844/932px,
  safe insets 0/24px, normal/200% root text and both motion preferences.
  Fresh, dense, Boss, conditional Boss and Farm, each with normal and synthetic
  long hints. Every protected x/y/width/height has **0px toggle delta**.
  Normal/long and normal/200% text comparisons also preserve protected boxes.
- Minimum Guardian Tap height: **121px**. Native controls are at least 44px;
  the enlarged Show hints/Hide hints text fits. Minimum title/detail/toggle
  text contrast: **8.29:1**. Hint type badges are omitted from the compact
  notification so readable title/detail text gets the available width.
- 80 native touch-scroll cases and keyboard End/Tab/Shift+Tab checks pass.
  Touch scrolling does not activate a hint destination or move combat.
  Hidden hint nodes are ignored in partial and full Chrome accessibility trees,
  cannot receive programmatic focus and are skipped by native keyboard traversal.
  Hiding focused content returns focus to the visible hints control.
- Real reload preserves the existing hidden device preference. The Settings
  toggle restores it, retains modal focus and returns focus correctly on Escape.
  Full game-state JSON and all other localStorage bytes remain unchanged by toggles.
  Every existing selected/unlocked cosmetic preserves these bounds; this is not
  acceptance of F24's future visibility improvements.
- `contract/results.json`: existing Rift contract **1,528 assertions** and
  NAV-001 **295 assertions** pass via CDP, including state/primary/recovery purity.
- Existing `rift-status-mobile` and `rift-status-reduced-motion` pass on the
  current Node harness. Source syntax/ID/lifecycle gate, context/link check and
  APK identity verifier fixture self-test pass. The self-test does not verify
  a newly built APK; no new APK was produced for this feature.
- Existing Node tooling checks pass after registering the F07 scenario,
  including runner/source/smoke failure controls and exact archive restoration.
- The test is registered as `rift-guidance-mobile` in the default behavioral
  suite. `registered-guidance.log` proves execution through the ordinary runner.
  Its causal DOM control catches a collapsed reservation before restoration.

## Original failure and limits

`baseline/results.json` uses the exact unmodified current main index:
SHA256 `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
At 390×844 with 24px safe insets, hiding the original guidance moves Guardian
Tap **50px upward** and grows its height by **50px**. The driver records that
failure as an expected baseline probe, not a passing feature implementation.

Long hints are synthetic rendering stress: 12 repeated title sentences, an
unbroken 100-character word and eight detail sentences. They introduce no new
gameplay text or mechanic. Root-font scaling is browser evidence, not proof of
Android system font scaling. The modern Chrome accessibility tree is not a
physical TalkBack test. WebView60/physical Android, integrated-version reruns,
APK identity/signing checks and user/device acceptance remain outstanding.

Earlier preparation used the then-active Python harness on main `b2a1f44…`.
Its dump-DOM Rift contract timed out locally; CDP executed the same existing
assertions successfully. After live main integrated the Node tooling and
offline catch-up, the isolated candidate was rebased and the final evidence
above was regenerated with the current JavaScript tooling. Early larger
reservations and timing/fixture errors are abandoned diagnostics, not acceptance.

## Reproduce

Run from the repository root with Node.js 20+ and Chromium installed:

```bash
mkdir -p mobile/www/fonts mobile/www/branding
cp index.html mobile/www/index.html
cp -r fonts/. mobile/www/fonts/
cp -r branding/. mobile/www/branding/
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-guidance-mobile --raw-artifacts /tmp/rift-guidance-evidence
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-status-mobile
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-status-reduced-motion
node tests/behavioral/rift-guidance.cjs chromium mobile/www /tmp/rift-guidance-contract --existing-contract
node scripts/ci/validate_source.cjs
node scripts/codex/check_context.cjs
node scripts/verify_apk_identity.cjs --self-test
```

For the before-probe, stage baseline `0bcce84…` index and its assets in a
separate directory and pass `--baseline-probe` to the JavaScript driver.
All raw outputs and screenshots above are preserved locally in this directory;
`SHA256.json` verifies their bytes. Publish them only at the coordinated writer
checkpoint. Do not overwrite another chat's checkout or declare this feature done.
