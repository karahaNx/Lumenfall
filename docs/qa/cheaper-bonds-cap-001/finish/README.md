# F21 implementation and verification

Current source SHA256:
`3f4df7318ce83cc5bf77f845f9d36b79948a2189c1b5a18f447b542b4bade6f7`.
Baseline main:14d5f3a3a78fe8b63cfa5544efc54f41217b65a5.
[Task](../../../tasks/CHEAPER_BONDS_CAP_001.md) · [Design/review](DESIGN.md).
Self-review and automated PR review are distinguished; no independent Core/QA claim.

| Check | Current evidence |
| --- | --- |
| Cap/price/effect/chronology | [candidate.json](candidate.json):388 assertions PASS |
| Exact old value and idempotence | Same report:145 assertions with independent BigInt conservation PASS |
| Mobile |12 profiles:320/390/430px ×100%/200% ×normal/reduced motion;44px controls, real touch/Tab/Enter/focus, wrapping, contrast>=9.09:1 PASS |
| Save/recovery/restore | Old21/40/2000 first launch/reload/recovery, two actual confirmed Settings restores, wrong-positive-receipt recovery, paid Labs/Ascend, primary rollback and recovery-write failure PASS |
| Causal controls | [negative-feature.json](negative-feature.json):10 mutations caught at intended assertions, exit1/valid FAIL/clean browser teardown |
| Completed refund boundaries |100 canonical raw2000 boundaries:zero repeated price calculations; changed receipt still rejected; measured time in candidate.json |
| Legacy engine | [cap-v8-6.0.json](cap-v8-6.0.json):Node8.3.0/V8 6.0.286.52,400 blocked purchases, original refunds and exact payments PASS |
| Existing clarity | [clarity-current.txt](clarity-current.txt):926 assertions PASS on current upstream upgrade ownership |
| Required full CI/integration/APK | [PR89](https://github.com/karahaNx/Lumenfall/pull/89):final run/integration/APK acceptance pending |

CI retains existing173 scenarios,17 harness negative controls, source/tooling/APK
verifier and guarded browser startup. F21 adds focused regression and8 causal
controls:handler/refund/credit/free-credit/wallet/receipt/cache/credit-record. UI/raw controls
are also saved locally. A startup failure never counts as a passing defect control.

PR89 review corrections: exact wallet debit; new unsafe refunds retained as
credits; original-price receipt validation across modern/legacy engines; bounded
schedule caching without caching player receipt validity; explicit whole-Lumen
rounding qualification. All other upstream guards, including retired Tree IDs,
remain. Swift supplies20 real3-Prism credit debits; Echo supplies exact2-Prism debit.

Reproduce with Node20+ and Chromium:

```bash
node scripts/codex/check_context.cjs --task docs/tasks/CHEAPER_BONDS_CAP_001.md
node scripts/ci/validate_source.cjs
node scripts/verify_apk_identity.cjs --self-test
node tests/tooling/run.cjs
node tests/behavioral/cheaper-recruitment.cjs --screenshot --output /tmp/f21.json
npm --cache /tmp/f21-npm-cache exec --yes --package=node@8.3.0 -- node tests/behavioral/cheaper-recruitment-v8.cjs
```

Local Chromium151 dump-DOM uses the explicitly recorded CDP adapter for existing
scenario transport, with original DOM/assertions/fixtures/result parser. Native
CDP drivers pass through. Remote CI uses its normal browser and all existing gates.

Historical files retain prior sources and diagnostic failures, never current
acceptance: migration-initial-loss caught erased old value; storage bridge and
confirmation-hidden attempts caught harness defects; clarity-initial-copy caught
changed established text; interrupted full run is not a passing full suite.
Original frozen below-cap19 gameplay snapshot comparisons remain, alongside exact
new empty migration defaults. Original price evidence is unchanged. Cross-engine
price differences are recorded in receipt-engine-prices.json and full QA arrays.

[Native baseline](native/baseline-native.json) verifies actual signed APK143,
Android27/WebView61 and21 paid old purchases19→40; raw40/wallet7342133 survives
cold launch. Final update/native acceptance is pending; modern/V8 results alone
are not Android proof. Software emulator evidence does not claim physical device
or TalkBack testing.

CI37748215097 passed all173 existing scenarios, then F21 failed before any
assertion at Target.createTarget. The full log and disposition are preserved in
ci-browser-startup-failure.log.gz/json. Remaining gates were skipped, never
claimed passing. The runner now uses repository browser priority (Google Chrome
first), respects the selected-browser environment/explicit option, records actual
executable/version and includes startup stderr. A local launcher collision
control puts a working google-chrome symlink and a failing chromium executable
on PATH; all533 assertions/25 groups and10 specific defect controls still pass.
Final required CI must run again on this runner correction; product bytes stay
at the current recorded hash.
