# RIFT_COSMETICS_001 — local evidence

This is a private proposal, awaiting Lead's coordinated writer checkpoint.
It is not integrated feature acceptance, a published PR or an APK release.
See [the feature task](../../tasks/RIFT_COSMETICS_001.md) for scope and remaining acceptance.

Final preparation baseline: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
Baseline index SHA256: `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
Candidate index SHA256: `7a3b4c47c2702277982060fff737126df7994f66f6cae2921ae735b7c378f2e6`.
Browser: Chromium 151.0.7922.173, Node.js 24.19.0. Tooling requires Node.js 20+.
Gameplay scripts parsed as ES2017 with Acorn 8.15.0. This does not establish
physical Android/WebView 60 compatibility.

- `after/`: actual F24 browser results and screenshots. 113 records include
  108 theme/state/mobile measurements, unlock/selection/persistence, keyboard,
  native touch, actual reload/recovery/restore and the hidden-aura negative.
- `before/`: the same 108 visual fixtures rendered from the final main baseline.
- `current-checks/`: current Node harness results, source/context checks and
  the comparison of baseline/candidate geometry. All 108 comparisons match.
- `tools/chromium-cdp.cjs`: diagnostic adapter for the environment's hanging
  Chromium `--dump-dom --virtual-time-budget` path. It preserves scenario
  assertions and returns DOM only after their actual `qa-result` completes.
  The native Rift-mobile driver runs against `/usr/bin/chromium` directly.
- `initial-cli-timeout/`: original process identity/stderr for the CLI timeout
  on the older startup baseline. This failed attempt is not acceptance evidence.
- `MANIFEST.json`: file sizes and SHA256 values, excluding the manifest itself.

The images hide startup overlays after completing the real startup callback.
UI measurements pause registered simulation intervals; CSS motion remains
active unless reduced motion is requested. Economic purity is checked
separately, and existing parity/chronology scenarios execute the motor.

The 320px / 130% font boss screenshots preserve existing clipped region text;
the baseline shows it too. Guidance hide still changes the tap area's position.
F07 coordination is required; F24 does not claim to fix these baseline issues.

Run from the repository root:

```sh
node tests/behavioral/rift-cosmetics.cjs --negative --out /tmp/rift-cosmetics-review
node docs/qa/rift-cosmetics-2026-10-07/reproduce.cjs
```

The second command stages current product assets in a temporary directory,
runs current Node source/context/APK-verifier self-tests and the nine selected
existing scenarios, then checks that the selected-state negative is rejected.
It uses the saved CDP adapter on Linux with `/usr/bin/chromium`; no installation,
network download, Git write or product modification is performed.

No full default-suite, ordinary CI, independent Core/QA, APK/signing or physical
device/TalkBack acceptance is claimed. Test again on the actual integrated
feature version and save those receipts before releasing writer/archiving.
