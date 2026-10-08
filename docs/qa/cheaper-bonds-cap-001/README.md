# CHEAPER_BONDS_CAP_001 evidence

Historical 7 October cap-only candidate. Current implementation/acceptance is
tracked by `docs/tasks/CHEAPER_BONDS_CAP_001.md` and the `finish/` evidence.
The hashes and acceptance limits below belong to the historical candidate.
Baseline: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
Final HTML SHA256: `fc0d985d5a23c111b7e5c4dc7fbf67a2117081d7b3769bfd32a85e6142017de8`.

## Read first

- `current/validation.json`: exact source versions, commands, exits and limitations.
- `current/candidate.json`: 383 contract assertions; 12 width/text/motion profiles;
  raw levels 21/40/2000 through real reload, recovery, repeated restore and Ascend.
- `current/cap-v8-6.0.json`: actual product parsed/executed on Node 8.3.0,
  V8 6.0.286.52; 400 blocked purchases with zero writes.
- `current/negative-feature.json`, `current/negative-workflow.json`: four targeted
  defect controls and all 12 required workflow negatives caught.
- `current/gates.txt`, `current/smoke.json`, `current/mobile-cap-390.png`:
  current source/context/APK verifier/tooling gates, guarded smoke and screenshot.
- `current/archive-integrity.json`: archive identities, CRC/membership checks and
  SHA256 verification of every original evidence file against its manifest.
- `current/raw-checks.zip`: complete current regression/native output, actual QA
  result payloads, final layout/clarity outputs, negative raw DOM/process evidence,
  smoke DOM and engine probe. Its embedded manifest verifies each original file.
- `baseline-b2.zip`: all 136 earlier local evidence files, including the 103-commit
  price-history report, diagnostics and interrupted older-baseline suite. Historical
  evidence is not acceptance of the final candidate. Embedded manifest is included.

The full current suite passed **132 scenarios / 152 result groups**, exit 0, on
source `36cadb249a6107cc18c811ef102cbaa5ea724a99fb0c8cfc56d0f419c7ebe513`.
The only later HTML delta is a CSS wrapping fallback. Exact comparison verified
that fact; final focused/mobile, V8 cap, dense layout, clarity, required negatives,
gates and guarded smoke use final `fc0d985…` source. No gameplay bytes differ.

## Reproduce

From the repository root, on the frozen branch:

```bash
node scripts/codex/check_context.cjs
node scripts/verify_apk_identity.cjs --self-test
node scripts/ci/validate_source.cjs
node tests/tooling/run.cjs
node tests/behavioral/cheaper-recruitment.cjs --screenshot --output /tmp/f21-candidate.json
npm --cache /tmp/f21-npm-cache exec --yes --package=node@8.3.0 -- node tests/behavioral/cheaper-recruitment-v8.cjs
```

Targeted mutation runs must exit 1 with their specific assertions:

```bash
node tests/behavioral/cheaper-recruitment.cjs --mutation handler --output /tmp/f21-no-cap.json
node tests/behavioral/cheaper-recruitment.cjs --mutation ui --output /tmp/f21-bad-ui.json
node tests/behavioral/cheaper-recruitment.cjs --mutation raw --output /tmp/f21-data-loss.json
```

On this environment Chromium 151 `--dump-dom` hangs even on a data-only page.
The supplied `legacy-cdp.cjs` adapter uses the repository's existing Chrome pipe
protocol to await the **same real completed QA DOM**. Assertions/fixtures/result
parser/failure tolerances are unchanged, incomplete/nonzero results stay failures,
and normal native/CDP driver calls pass through to actual `/usr/bin/chromium`.
For plain smoke HTML it captures after the requested wall-clock smoke interval;
this is explicitly recorded and is not a virtual-time/device equivalence claim.

To select it without changing active tooling, create a temporary PATH directory
containing an executable `google-chrome` symlink to this adapter. The underlying
browser may be selected with `LUMENFALL_F21_BROWSER`. Then run the unchanged Node
harness commands with that PATH prefix:

```bash
node tests/behavioral/run.cjs --web-root .
node tests/behavioral/run.cjs --web-root . --scenario layout-dense
node tests/behavioral/run.cjs --web-root . --scenario upgrade-effects-and-deeds
```

`LUMENFALL_F21_LEGACY_RAW` selects a directory for actual QA result payloads.
Current logs identify the adapter and Chromium version. Ordinary CI on the exact
integrated version must still run in its own environment.

## Acceptance limits

No independent Core/QA approval, coordinated GitHub checkpoint, refund migration,
integration, new APK/package/signing/device or TalkBack acceptance is claimed.
The compensation design remains pending its explicitly required Core review.
V8 6.0 tests JavaScript syntax/handler execution, not Android DOM/lifecycle/storage.
No remote writer was assigned or released by this local evidence package.
