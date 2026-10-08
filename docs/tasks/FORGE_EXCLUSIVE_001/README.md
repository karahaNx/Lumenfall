# Forge proposal and baseline evidence

[Current task](../FORGE_EXCLUSIVE_001.md) records scope and unresolved decisions.
USER_REQUEST.txt preserves the complete initial mandate; PROPOSAL_2026-10-07.md
preserves the detailed earlier draft. Its historical Lead/writer gates and PR46
status are superseded by current rules and the current task.

EVIDENCE/CONTINUATION records refreshed baseline 214d454. All 24 catalogue rows,
price examples and isolated stacking probes equal the previous baseline. Twenty
of 21 reviewed consumer functions are byte-identical. normalizeCurrentSave now
preserves Lab paid-speed preferences and avoids mutating input active records;
the Forge research reconstruction/legacy migration is unchanged. The upstream
Lab/B2/offline work belongs to other tasks. Product files are unchanged here.

Earlier EVIDENCE/FINAL_CHECKS.json and live-receipt.json identify their historical
0bcce84/PR46 observations only. Earlier transport failures remain preserved;
none is overwritten or converted to PASS.

Reproduce inventory and the actual task-aware context check from the repo root:

```sh
node docs/tasks/FORGE_EXCLUSIVE_001/inventory.cjs index.html
node scripts/codex/check_context.cjs --task docs/tasks/FORGE_EXCLUSIVE_001.md
```

Stage the current index.html, fonts/ and branding/ in a private web root, then
use a new output directory so frozen evidence remains intact:

```sh
FORGE_EXCLUSIVE_WEB_ROOT=/tmp/forge-web node docs/tasks/FORGE_EXCLUSIVE_001/run-existing-checks.cjs /path/to/checkout --cdp --output-dir /tmp/forge-checks
```

Node.js 20+, Chromium and allowed loopback sockets are required. Chromium 151
ordinary dump-dom previously timed out here. chrome-cdp.cjs replaces only that
local transport and returns the original instrumented DOM to the existing
parser; it never synthesizes results. Native UI scenarios use real
/usr/bin/chromium through LUMENFALL_QA_CDP_CHROME. Fixtures/assertions and
required CI gates are unchanged. The runner records real exits/commands and
requires nine positive scenarios plus the intentional bad-assertion failure.

Coverage is existing baseline behavior: contracts/effects/chronology,
baseline/save-reload/backup-restore/recovery, mobile and reduced-motion UI.
These checks do not accept unimplemented proposals, new migrations, 320/430px,
large-text/new-control behavior, WebView60 or APK/device delivery. Full required
CI is separate and must pass before integrating the documentation checkpoint.
