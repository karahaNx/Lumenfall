# F21 current implementation and verification

Current candidate source SHA256:
`acd4e1df28c81dc6562d572716bcb063be6297bbb638ec825cda94d0905acece`.
Baseline main: `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
[Task](../../../tasks/CHEAPER_BONDS_CAP_001.md) · [Save/value review](DESIGN.md) ·
[Preflight](preflight.json). Self-review only; no independent-review claim.

| Check | Result/evidence |
| --- | --- |
| Real cap/price/effect/chronology | [candidate.json](candidate.json):383 assertions PASS |
| One-time old-save restitution | Same report:116 assertions, independent BigInt conservation oracle PASS |
| Mobile |12 width/text/motion profiles at320/390/430px and100%/200%;44px controls, real touch/Tab/Enter/focus, wrapping and all note text contrast >=9.09:1 PASS |
| Actual persistence | Old21/40/2000 first launch/reload/recovery, two old-backup restores, paid Labs, Ascend, primary restore rollback and recovery-write failure PASS |
| Causal controls | [negative-feature.json](negative-feature.json):6 real source mutations caught with intended assertion,exit1/valid FAIL/clean browser teardown |
| Legacy engine | [cap-v8-6.0.json](cap-v8-6.0.json):Node8.3.0/V8 6.0.286.52,400 blocked purchases, original refunds3376/12655538 and exact credit debit PASS |
| Existing UI | [layout.txt](layout.txt):5 unchanged dense profiles PASS; [clarity.txt](clarity.txt):941 assertions PASS |
| Tooling/source/context | Source syntax/IDs, APK verifier self-test, actual task startup budget and [tooling.txt](tooling.txt) PASS |
| Required full CI/integration/APK | Pending publication and final version checks; not inferred from local tests |

The local Chromium151 dump-DOM issue uses the historical evidence folder's
explicit CDP adapter for existing local scenario transport. The same actual QA
DOM/assertions/fixtures/result parser remain; native CDP drivers pass through.
Remote required CI is unchanged except the added F21 regression/causal gates.

Preserved failed attempts are diagnostic evidence, not acceptance:
`migration-initial-loss.json` caught a small wallet erased by huge refund addition;
TwoSum fixes that actual defect. `storage-oracle-initial.json` and
`storage-oracle-private-scope.json` expose a QA write blocked by the private
reload flag; the bridge now sets that exact flag before the storage-failure test.
`clarity-initial-copy.txt` caught changed earned-text wording; the product now
retains its established recruiting wording and adds Empower explicitly. The
existing assertion was not weakened. `full-interrupted-before-record-guards.txt`
is an interrupted pre-final source run and does not count as a full pass.

Reproduce from the exact branch/source with Node20+ and Chromium:

```bash
node scripts/codex/check_context.cjs --task docs/tasks/CHEAPER_BONDS_CAP_001.md
node scripts/ci/validate_source.cjs
node scripts/verify_apk_identity.cjs --self-test
node tests/tooling/run.cjs
node tests/behavioral/cheaper-recruitment.cjs --screenshot --output /tmp/f21.json
npm --cache /tmp/f21-npm-cache exec --yes --package=node@8.3.0 -- node tests/behavioral/cheaper-recruitment-v8.cjs
```

The workflow runs the focused checks on staged source and four causal mutations:
handler, refund, credit and free-credit. Each must fail its specific assertion;
a startup/browser error is not a passing defect control. UI/raw-loss controls
are additionally saved locally. Full existing151-scenario/12-negative gates and
guarded startup remain required. APK/native acceptance is recorded separately
after actual signed delivery; modern browser/engine evidence is not Android proof.
