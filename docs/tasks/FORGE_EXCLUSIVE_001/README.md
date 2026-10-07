# Local Forge proposal evidence

`../FORGE_EXCLUSIVE_001.md` is the feature task. `USER_REQUEST.txt` preserves
the user's complete feature mandate. `EVIDENCE/FINAL_CHECKS.json` records the
updated baseline, real exits, exact commands and limits of these checks.
`EVIDENCE/live-receipt.json` records live PR46/main observations and writer limits.

These are analysis and diagnostic tools. No production scripts, assertions,
game data, CI, APK or signing were changed. Ordinary Chromium 151 dump-dom
timed out in this environment. `chrome-cdp.cjs` replaces that transport locally
and returns the original instrumented page DOM to the existing result parser.
It never synthesizes QA results. Native UI tests use real `/usr/bin/chromium`
through the existing `LUMENFALL_QA_CDP_CHROME` selector. Full attempted outputs,
including transport failures, are preserved in the separate TXT/ZIP handoff.

From the specified baseline checkout, reproduce the inventory with:

```sh
node docs/tasks/FORGE_EXCLUSIVE_001/inventory.cjs index.html
node scripts/codex/check_context.cjs
```

Stage the current `index.html`, `fonts/` and `branding/` in a private web root,
then run existing checks. Set the web-root and checkout arguments to real paths:

```sh
FORGE_EXCLUSIVE_WEB_ROOT=/tmp/forge-web node docs/tasks/FORGE_EXCLUSIVE_001/run-existing-checks.cjs /path/to/checkout --cdp
```

The runner writes local logs in this directory's `EVIDENCE`. To preserve frozen
evidence, run from a disposable copy. Node.js 20+ and Chromium are required;
this local adapter currently uses `/usr/bin/chromium`. Loopback sockets must be
allowed. Existing harness fixtures and assertions come from the recorded repo
baseline. Changed source requires re-review, not reuse of these PASS results.

Current coverage: seven gameplay/chronology/persistence scenarios, two native
Forge UI scenarios, and one intentional failing assertion. Scope is current
baseline behavior only. New unlocks, migrations, 320/430px and larger-text/new-
control acceptance, full CI, WebView60, APK/device and final feature acceptance
remain pending.
