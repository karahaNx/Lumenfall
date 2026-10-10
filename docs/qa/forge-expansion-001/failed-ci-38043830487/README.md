# First full Forge CI failure and scoped repair

This directory preserves a failed run and the subsequent local test repairs.
It is not full CI acceptance and does not authorize development integration.

## Failed run

[Run 38043830487](https://github.com/karahaNx/Lumenfall/actions/runs/38043830487)
tested head `03b78ce1d13ad1a04670315bad05174c406935ab` through combined commit
`9e99a7d6d8ac89f4f557b2144b7e8cb6f64b6ff9`. It produced 210 PASS rows and
two FAIL rows. The complete 212-row inventory is identical to the accepted
Lab suite after accounting for those two outcomes.

[The forensic package](ci/README.md) preserves the complete behavioral log,
API metadata, source/commit identities and both exact failure results.
Its ZIP digest and CRC were checked independently by the primary agent.
The two failures were explicit QA assertions, with browser exit0, no timeout
and no runtime errors. The later negative loop and guarded smoke were skipped.

## Corrective test changes

- `p1-05-control-regressions`: replace its `1e100` wallet with the exact
  selected Forge quote. Its x5 charge price was481114 Shards, which cannot be
  debited representably from1e100. Preserve every original affordability,
  disabled/state/label and accessible-name assertion. The poor-to-funded-to-poor
  transition remains the purpose of this test.
- `p2-07a-timer-boundary`: point the exact mutation anchor at the current
  `ascendRunToken` guard. Preserve the anchor assertion, `if(true)` mutation,
  original live/offline and before/at/after boundary oracles, negative old-run
  accrual assertion and restoration of the original function.

[UI results](repairs/controls/receipt.json) retain the positive scenario and
the selected/focus-return causal negatives. [Timer results](repairs/timer/receipt.json)
retain the boundary, chronology and farm-retention cases. All passed their
intended exit conditions. The timer mutation still causes a real reset-resource
failure, recorded as `negativeOldAccrual: true`. [Root checks](repairs/root-gates.json)
retain successful source, Node tooling and task-context commands; tooling
output includes intentional rejection examples from its own negative tests.
Raw `.log` files are stored losslessly as `.log.gz`, preserving their original
whitespace. [Storage mapping](raw-log-storage.json) binds both forms by hash.

The product and frozen fixtures are unchanged. Product SHA256 remains
`05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac`.
New full, Lab and Forge CI runs on the subsequently published head are still
required. PR105 stays draft until those gates and source identities are verified.
The main/APK hold remains in force.
