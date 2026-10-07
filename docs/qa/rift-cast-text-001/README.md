# Local RIFT_CAST_TEXT_001 evidence

Candidate only. Base main: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
Product/test checkpoint: `1edc0c8d935279542fab8a1b8dd3852adff1d7a9`.
The [task](../../tasks/RIFT_CAST_TEXT_001.md) records writer dependencies and
missing integration/APK/device acceptance.

`identity.json` records the exact source/test hashes, baseline, browser and
observation time. `matrix-summary.json`, `existing-checks.json` and
`negative-controls.json` describe the local results. `candidate-matrix.json`
and `baseline-matrix.json` retain all 384 state observations per matrix.
Logs retain the existing scenario results, including accessibility contrast,
native focus/controls, save/recovery, support timing and short parity/chronology.
Representative screenshots include normal and doubled Wisp text on candidate
and baseline. The full phone handoff ZIP retains all screenshots and diagnostic
attempts; earlier checkpoint results are historical.

## Replay

Use Node 20+, a Chromium browser and the repository root:

```bash
mkdir -p mobile/www/fonts mobile/www/branding
cp index.html mobile/www/index.html
cp -r fonts/. mobile/www/fonts/
cp -r branding/. mobile/www/branding/
node scripts/codex/check_context.cjs
node scripts/ci/validate_source.cjs
node scripts/verify_apk_identity.cjs --self-test
node tests/behavioral/rift-cast-text.cjs mobile/www /tmp/f13-evidence
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-status-contract
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-status-mobile
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-status-reduced-motion
```

The remaining existing scenarios are listed in `existing-checks.json` and can
be run with the same `--scenario` argument. On this environment, Chromium 151's
default dump-DOM invocation timed out without a completed result. The local
JavaScript `cdp-browser/google-chrome` adapter waited for the same instrumented
document's existing QA result over CDP, using the same real browser. It changes
only test transport, not assertions, fixtures or the product. Native mobile
drivers ran directly with `/usr/bin/chromium`, without the adapter.

To replay the documented transport:

```bash
chmod +x docs/qa/rift-cast-text-001/cdp-browser/google-chrome
node docs/qa/rift-cast-text-001/run-checks.cjs . /tmp/f13-existing
```

The adapter currently selects `/usr/bin/chromium`; adjust that tooling path if
the same browser is installed elsewhere. Its result is separate from ordinary
CI-harness acceptance. The original timeout and early adapter mistakes are
retained as diagnostics in the complete handoff, not counted as PASS.

For the baseline comparison, stage `index.html` from the base SHA with the
same fonts/branding and run the focused driver with `--observe-baseline`.
That mode is an observation, not a pass of F13. Running the unmodified baseline
without this flag is a negative control: it must fail on repeated visible text.
The second negative removes the new accessible status prefix from a temporary
served copy; it must fail on the ready-state accessibility assertion. Mutations
are confined to disposable copies; `negative-controls.json` records their
source hashes and failures.

## Results and limits

- F13: 12 profiles, 8 Wisps × 4 states per profile, preserved ability names,
  charge, cast expiry/classes and observer-only state. Native keyboard focus
  and 44px targets pass.
- Twelve existing scenarios pass. Native mobile coverage includes 360×640
  with safe insets and 390×844, fresh/dense/Boss states, genuine touch/keyboard
  input, navigation and persisted Guidance controls.
- CSS serialization may round a fractional percentage. The revised existing
  assertion allows only 0.00001 percentage points for CSS width; authoritative
  charge and gameplay calculations are not changed.
- Large-text overflow is observed at doubled Wisp text in five-member parties.
  Candidate and unmodified base have identical measured overflow. Full
  large-text acceptance remains unresolved; see `large-text-comparison.json`.
- ES2017 grammar passes for both inline product scripts using Acorn (version
  recorded in `es2017.json`).
  No new product API or syntax requirement is introduced. This is not an actual
  WebView60 execution test.
- APK verifier self-test uses fixtures; no new APK, signing or physical
  Android/TalkBack acceptance was performed. No full suite or GitHub CI pass is
  claimed. Save/currency ownership and migration bytes are unchanged by F13.
