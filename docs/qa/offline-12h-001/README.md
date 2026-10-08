# OFFLINE_12H_001 — F26 evidence

[Task](../../tasks/OFFLINE_12H_001.md) · [PR85](https://github.com/karahaNx/Lumenfall/pull/85).
PR85 integrated at91decbc8e26744b21c26a21b20742be6ebca1d8e; signed APK150 is published.
Delivery is pending combined integrated CI and remaining native acceptance.
Integrated source SHA256:84ca8f6a50d0df5046c86ddb4a354850aca6273e4581e11b94acc95b10ae885f.
Earlier combined-candidate SHA256:7461bd674f4155bde04e03a6abf0aed41c674dfbe26e8919c182f9da753c4509.

The feature shares 43200 productive seconds across rewards/combat, Lab and
automation. The old Study-only tail is removed; foreground processing replay and
the separate offline earning rate remain. Schema1→2 refunds archived Extended
Rest/Deep Rest ownership once (140/160 Comets) and every Deep Reserves level at
ceil(6 × 1.6^level) Prisms, retaining raw levels and archived ownership.

Deposits must preserve both the old balance and the original price exactly.
Unrepresentable deposits remain in an exact decimal original-currency ledger;
normal canonical saves retry after spending. Paid bits prevent repeat deposits.
The receipt stores its calculated prices, avoiding Math.pow repricing across V8
versions. Schema1 has no transaction-price ledger; migration uses the documented
price rule on the accepting runtime. Restore replaces the complete save; it does
not add a historical refund to the current balance.

Evidence on the current combined source:

- `integrated-core.json.gz`, `integrated-v8.json.gz`, `integrated-loadout.json.gz`:
  full F26/legacy engine PASS on91decbc bytes, plus1139 Forge bulk-memory checks.
- `ci-37744077662.log.gz`: head46cb51b PASS170 defaults/17 mandatory negatives and
  guarded smoke. PR78 landed immediately before integration, so full integrated
  CI must be repeated on the combined product; APK150 includes both features.
- `build-37746590452.log.gz`, `native/target-assets.json`, `native/target-identity.txt`:
  signed150 build, package/version/certificate,526 ZIP CRCs and all15 assets PASS.
  The first native144→150 update passes exact refunds, paid snapshot and matching
  primary/recovery. The ensuing cap simulation exceeded the recorder's60s wait;
  its failed receipt retains the bound update observations. Remaining native checks
  are pending a longer observation window; this is not complete native acceptance.

- `combined-main-core.json.gz`: 32 migration cases, cap boundaries, paid Lab,
  real saved Auto-Ascend ON/OFF, queues/Motes, endpoint consumption, duplicate
  return, primary/recovery/rollback, large balances, partial/deferred credit,
  dominating deposits and three causal F26 mutants.
- `combined-offline-catchup.json.gz`: existing B2 chronology, event batches,
  real production device save, processing-time live replay and clock jumps.
- `upgrade-contracts-current.log.gz`, `upgrade-effects-current.log.gz` and
  `combined-upgrade-identity-*.log.gz`: current ownership, 926 effect observations,
  chronology, save/reload, restore, recovery, mobile and reduced-motion checks.
- `ui.json`, `ui/`: nine 320/390/430px profiles at 100/150/200% text, 44px controls,
  focus/Space/rerender, contrast, reduced motion, retired controls absent and
  render purity. Latest screenshots match the current Lab ownership wording.
- `merged-current-v8.json.gz`: full product on Node8.3/V8 6.0.286.52 without
  BigInt. A paid13h Study retains3600 seconds after a24h absence. Frozen original
  receipts at levels80/200/1000 transfer both ways without repricing.
- `final-negatives.json`, `final-negative-logs/`: all35 available causal controls
  caught on the current source. The required workflow checks its17 mandated cases.
- `ci-37740953545.log.gz`: earlier head5759eaa passed161 scenarios,14 negatives
  and guarded browser smoke before the subsequent main integration.

`native/baseline.json` records the actual signed144 installed APK, real committed
schema1 primary/recovery save (100 Comets/100 Prisms, both archived purchases,
Reserves3 and paid13h Guardian study), Android8.1/API27/WebView61.0.3163.98.
`native/baseline-assets.json` validates every ZIP CRC and all15 historical assets
against commit261b1b7f863f73c324f4ac04acb5bfc95101644d.
No physical WebView60 or TalkBack claim; V8 6.0 checks its engine generation.
Review is self-review and automated checks.

Native replay uses only an isolated emulator on port5555; the driver asserts
ro.kernel.qemu=1. Prepare commits the QA fixture in the actual baseline app.
Accept verifies its installed bytes before pm install-r, checks the executing
target script against the extracted APK, and observes real private game functions
with a controlled test clock. APK/source files are never instrumented. Failed
attempts retain their observations. Do not run these QA fixtures on a player device.

```bash
node docs/qa/offline-12h-001/materialize-source.cjs INTEGRATION_SHA /tmp/f26-source
node docs/qa/offline-12h-001/verify-delivery.cjs TARGET_APK /tmp/f26-source OUTPUT_JSON
node docs/qa/offline-12h-001/native.cjs prepare BASELINE_APK BASELINE_INDEX EVIDENCE_DIR
node docs/qa/offline-12h-001/native.cjs accept TARGET_APK EXTRACTED_TARGET_INDEX EVIDENCE_DIR
```

The materializer requires a full40-character commit and a new/empty destination
outside the checkout. The asset verifier requires exactly the15 historical inputs
and matching APK/source file sets. `asset-binding-negatives.json` catches stale
source and incomplete asset roots. Local Chromium151 dump-DOM can stall; focused
browser checks use the CDP pipe adapter with identical assertions. Required CI
retains its actual Chrome CLI gates. The proposed process deadline change was not
included in the feature after the suspected CI stall completed normally.
