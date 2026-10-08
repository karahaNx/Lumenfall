# OFFLINE_12H_001 — F26 delivery evidence

[Task](../../tasks/OFFLINE_12H_001.md) · [implementation PR85](https://github.com/karahaNx/Lumenfall/pull/85) · [checkpoint PR95](https://github.com/karahaNx/Lumenfall/pull/95).
The feature is integrated at91decbc8e26744b21c26a21b20742be6ebca1d8e.
Signed APK0.1.150 is published and retained in
[the immutable archive](../../../archive/android/offline-12h-001/README.md).
Native Auto-Ascend24h comparison and UI/focus acceptance remain pending.

The game shares43200 productive seconds across earnings, combat/rewards, Lab and
automation. Study-only tail and purchased hours extensions are removed. The
separate earning rate and foreground processing-time live replay remain.
Schema1→2 refunds Extended Rest140/Deep Rest160 Comets and each Deep Reserves
purchase at ceil(6 × 1.6^level) Prisms, preserving archived ownership and raw levels.
Deposits must preserve the existing balance and price exactly. Unrepresentable
value stays in an exact decimal original-currency ledger; canonical saves retry
after spending. Stored prices prevent V8 repricing. Schema1 has no historical
transaction-price ledger: the documented rule is evaluated on the accepting
runtime. Paid bits and atomic primary/recovery saves prevent repeat credit;
restore replaces the complete save instead of adding value to an existing wallet.

## Integrated game checks

`final-main-receipt.json` binds main3f1b6faf9f253e6dfe8a3bf408e7f7a9891ca52d
and CI37754028270 previewe9a786a2428ab1df7c36a954382fd36e3ecb0fdb to identical
index.html SHA25666b29c9d85de4a47191acbf655e8bb88b18a2517feb18e8f405f2b9041d95709.
`ci-37754028270.log.gz`:176 deterministic scenarios,17 mandated negative controls,
Rift cosmetics checks, tooling/source and guarded browser smoke PASS.
CI37754247901 also passed; its Forge preview predates the subsequent Lab UI merge
and is retained separately. Earlier integrated CI173 and implementation CI170
remain in their own receipts/logs; they are not substituted for the exact current
product result.

- `final-main-core.json.gz`:32 records covering32 refund combinations, boundary
  seconds,12/24/72h returns, actual saved Auto-Ascend ON/OFF, paid Lab/queues/Motes,
  endpoint consumption, duplicate return, primary/recovery/failure/rollback,
  restore, huge balances, partial/deferred credit, stale/bulk handlers and three
  causal F26 mutants.
- `final-main-v8.json.gz`: full product on Node8.3/V8 6.0.286.52 without BigInt;
  paid13h Study retains3600s after24h. Earlier frozen receipts at levels80/200/1000
  transfer between old/new runtimes without repricing (`merged-current-v8.json.gz`).
- `ui.json`, `ui/`:9 profiles,320/390/430px at100/150/200% text,44px controls,
  focus/Space/rerender, contrast, reduced motion, absent retired controls and
  render purity PASS. Screenshots include current integrated Lab presentation.
- `integrated-loadout.json.gz`:1139 combined Forge bulk-memory checks PASS.
  Existing B2 chronology/event batches/live replay/clock jumps and ownership926
  effect observations remain in `combined-offline-catchup.json.gz` and
  `upgrade-*-current.log.gz`/`combined-upgrade-identity-*.log.gz`.
- `final-negatives.json`, `final-negative-logs/`:35 available causal controls
  caught before the final Forge integration. Current required CI checks all17
  mandated controls on its exact combined product.

## Signed Android evidence

`build-37746590452.log.gz`, `native/target-assets.json` and
`native/target-identity.txt` bind APK150 to the original integration, including
Forge bulk memory: package com.lumenfall.app, established signing certificate,
526 ZIP CRCs and all15 exact source assets PASS.
APK SHA2568ad8aeab6df7224e629c8a93805386a5c16851ffeb53e2f7338f42c76b0d79bc;
index SHA25684ca8f6a50d0df5046c86ddb4a354850aca6273e4581e11b94acc95b10ae885f.
This immutable release is not claimed to be the newest release from other features.

`native/baseline.json` records the actual signed144 installation and committed
schema1 save:100 Comets/100 Prisms, both archived purchases, Reserves3, paid13h
Guardian study. Baseline APK/source/15 assets are independently bound to
261b1b7f863f73c324f4ac04acb5bfc95101644d and retained in the Android archive.
Native144→150 upgrade PASS:300 Comets/32 Prisms credited once, paid snapshots/raw
history preserved, actual primary/recovery equal observed state.
OFF12h and24h results are identical apart from the consumed endpoint; duplicate
returns pay nothing. ON12h has passed the same assertions. `native/cap-progress.json`
is explicitly partial while ON24h and final UI/focus remain pending.

The native recorder uses this task's isolated Android8.1/API27 software emulator
with WebView61.0.3163.98. It asserts ro.kernel.qemu=1, installed APK byte identity
and exact executing WebView script. Private observation handles and controlled
Date/performance clocks isolate offline behavior; the signed APK/source are
unaltered. The original callback/cooperative-batch function is used throughout.
Old60s/10min/20min recorder deadlines exceeded the slow native simulation;
failed receipts retain their observations. A bound continuation reuses the
completed migration/OFF records and the still-running original ON12h job, then
runs ON24h with the same assertions. Supported CDP virtual timers are recorded
in `native/continuation.json`; the simulation's processing-time clock stays0.
This is behavior evidence, not a native performance benchmark or resolution of
B2's known event-budget limitation. No physical WebView60, TalkBack or independent
review claim. V8 6.0 separately checks the required engine generation.

## Replay

```bash
node tests/behavioral/offline-12h.cjs
node tests/behavioral/offline-12h-ui.cjs
node tests/behavioral/offline-12h-webview60.cjs
node docs/qa/offline-12h-001/materialize-source.cjs FULL_COMMIT /tmp/f26-source
node docs/qa/offline-12h-001/verify-delivery.cjs TARGET_APK /tmp/f26-source OUTPUT_JSON
node docs/qa/offline-12h-001/native.cjs prepare BASELINE_APK BASELINE_INDEX EVIDENCE_DIR
node docs/qa/offline-12h-001/native.cjs accept TARGET_APK EXTRACTED_TARGET_INDEX EVIDENCE_DIR
```

Run the engine-generation check with the documented Node8.3 binary to reproduce
V8 6.0; ordinary Node only reproduces current-engine behavior. Materialization
requires a full40-character commit and a new/empty destination outside the repo.
The verifier compares exactly15 asset inputs and rejects stale/incomplete roots
(`asset-binding-negatives.json`). Native QA fixtures must run only on the isolated
emulator. Resume is specifically bound to the20min ON12h timeout receipt and a
still-running matching app/clock; it does not skip assertions or substitute an
unrelated save. Local Chromium151 dump-DOM stalls are retained as diagnostics;
focused checks use CDP while required CI preserves its actual Chrome CLI gates.
