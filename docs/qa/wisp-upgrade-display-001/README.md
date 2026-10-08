# WISP_UPGRADE_DISPLAY_001 local evidence

Final candidate base: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
These are proposed checkpoint files, not remote/main/device acceptance.
See `../../tasks/WISP_UPGRADE_DISPLAY_001.md` for the contract and stop condition.

`scoped/` holds the raw 12-profile result and mobile PNGs. `existing-cdp/` holds
20 unmodified existing scenario results, except the explicitly updated obsolete
Wisp disclosure expectation. `existing-negatives/` holds all 12 intended failures.
`negative-baseline/` holds the explicit F04 rejection of the final baseline.
`official-hierarchy/` and its log preserve the failed ordinary browser CLI result.

Reproduce the scoped UI/persistence gate:

```sh
node tests/behavioral/wisp-upgrades.cjs --evidence /tmp/wisp-scoped
node tests/behavioral/wisp-upgrades.cjs --existing p2-02b-wisp-hierarchy,p2-02a-core-qol,p2-wisp-progression-pacing,p2-endgame-currency-utility,p2-03a-wisp-role-integrity,p1-05-control-regressions,p1-05-accessibility-contract,p1-05-reduced-motion,layout-dense,layout-fresh,parity-short,parity-medium-farm,chronology-auto-empower-mid-window,chronology-simultaneous-order,restore-roundtrip,legacy-backup-restore,recovery-from-corrupt-primary,recovery-offline-once,lifecycle-background-resume,wisp-formula-contract --evidence /tmp/wisp-existing
```

The alternative transport imports `run.cjs.instrumentHtml()` and `loadFixtures()`.
It runs the actual existing JS assertions through CDP; it does not bypass their
failures or repair the normal CLI timeout. The scoped UI page disables periodic
interval callbacks during measurements; the existing scenario page uses the
ordinary instrumenter. Both bridges are test-only in-memory HTML.

Expected failures (command exits nonzero; inspect each intended failure):

```sh
node tests/behavioral/wisp-upgrades.cjs --existing self-test-bad-assertion,self-test-uncaught-error,self-test-unhandled-rejection,self-test-parity-regression,self-test-chronology-regression,self-test-wisp-formula-regression,self-test-wisp-pacing-regression,self-test-endgame-currency-regression,self-test-wisp-role-regression,self-test-p1-05-selected,self-test-p1-05-focus-return,self-test-lifecycle-duplicate --evidence /tmp/wisp-negatives
git show 0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd:index.html > /tmp/wisp-baseline.html
node tests/behavioral/wisp-upgrades.cjs --source /tmp/wisp-baseline.html --evidence /tmp/wisp-baseline-negative
```

Other checks: `node scripts/codex/check_context.cjs`,
`node scripts/ci/validate_source.cjs`,
`node scripts/verify_apk_identity.cjs --self-test`, `node tests/tooling/run.cjs`.
`es2017.txt` is an Acorn 8.15.0 parse of both product script blocks at
`ecmaVersion: 2017`. `unchanged-contracts.json` records 15 byte-identical
function bodies against the exact base. `heading-contrast.json` describes the
conservative existing-card gradient/tint estimate and its limits.

Normal CLI attempt: stage root HTML/fonts/branding under ignored `mobile/www`,
then `node tests/behavioral/run.cjs --web-root mobile/www --scenario
p2-02b-wisp-hierarchy --raw-artifacts /tmp/wisp-official`. It timed out locally;
the complete stderr/stdout/metadata are retained. No full-suite/ordinary-CI PASS
is asserted. Physical Android/WebView60/TalkBack and APK/signing acceptance were
not performed. No remote writer, publication, merge or archive action occurred.
