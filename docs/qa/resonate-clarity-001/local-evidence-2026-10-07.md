# Resonate clarity — local evidence

This is a local F06 candidate, not integrated app acceptance. The exact baseline,
candidate index hashes, scope, ownership and remaining gates are in
[the task](../../tasks/RESONATE_CLARITY_001.md).

`browser-results.json` records all 12 mobile/text/motion profiles and the
eligibility, shared-limit, persistence and Ascend checks. Screenshots show the
390px normal-text action and the complete 320px explanation at 200% text.
`baseline-negative.json` records the expected failure on the unmodified baseline.

`existing-results.json` records seven unchanged Node harness scenarios and
three expected negative controls. `gate-results.json` and `preservation.json`
record the source/context/APK self-test/tooling checks and byte comparisons.
`live-preflight.json` records dependency observations, including main's change
during preparation. Its writer status is not inferred from CI.

`raw-evidence.zip` contains complete scenario DOM/logs, all 18 final screenshots,
the CDP adapter, reproducible check scripts and initial diagnostic failures.
The ordinary Chromium `--dump-dom` path timed out on this environment; the
existing harness was run through the explicit adapter. The first adapter's
reload-handling diagnostic and final PASS are both preserved. No full default
suite or ordinary pre-merge CI is claimed. All state fixtures are synthetic.

Reproduce the feature check from the repository root:

```bash
node tests/behavioral/resonate-clarity.cjs --evidence /tmp/resonate-ui
```

To reproduce the existing checks on this environment, extract raw-evidence.zip
to a separate directory, make its `chromium-cdp.cjs` executable, create
`cdp-bin/google-chrome` as a symlink to that adapter, then run:

```bash
node /absolute/evidence/path/run-existing.cjs /absolute/repository/path
```

The runner prepends only that adapter directory to PATH, runs the unchanged
`tests/behavioral/run.cjs`, checks its exits/result markers and captures raw DOM.
Normal CI should use its configured browser and ordinary workflow gates.
The feature script is not registered in the shared default runner.

Modern browser checks are not physical Android, WebView60, large-text device or
TalkBack acceptance. A new APK and integrated-version checks remain pending.
Raw scripts/pages are test evidence and must never be staged into `mobile/www`.
