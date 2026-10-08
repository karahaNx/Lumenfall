# WISP_ROLES_001 implementation evidence

Current candidate implements contribution visibility and necessary clock fixes.
The proposed Ember/Stone Veteran Power curve remains **unaccepted/unimplemented**.
The feature is unfinished; integration, full CI and app/device delivery are pending.
The [task](../../tasks/WISP_ROLES_001.md) is the current continuation checkpoint.
[REPORT](REPORT.md) and earlier JSONs describe the preserved historical analysis.

Baseline main214d454 product SHA256
`6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.
Original backup hash and honest post-Ascend limitations are in the task/report.
All new source/check scripts are JavaScript; only the owner checkout changed.

[Draft PR70](https://github.com/karahaNx/Lumenfall/pull/70) is published.
First head a2f1dd440e005d29fc79c1f1096d30da3115fe21. No integration/release.
[Final contribution measurement](contribution-final.json.gz) and [calibration](veteran-proposal-final.json.gz)
include all1008 team comparisons and successful finite replays. Calibration is
a hypothetical curve, never an accepted product mechanic.

Focused checks on the local candidate (Node24.19.0, Chrome155.0.8059.39):

- [Core](wisp-core-clock-final.log.gz):3,249 assertions, all56 five-Wisp teams,
  four combat contexts, source/legacy expiry, bench/pending, idempotence and
 12 live/offline whole/split60s controls. Standard continuous tolerance:
  max(1e-6 absolute,1e-12 relative). Removal reconstruction is checked at total
  DPS scale to avoid amplifying floating-point subtraction error.
- [Mobile](wisp-ui-45.log.gz), [reduced motion](wisp-ui-reduced-settled.log.gz):
  320/390/430px,100/200% text, no role-text overflow, focus survives readout
  refresh, controls>=44px even during the existing .995 panel scale, 12.78:1
  foreground/brightest-card contrast, static readouts. Existing startup finish
  callback is invoked through the QA bridge; this does not claim native input.
- [Support](wisp-support-155.log.gz):252 checks including causal mutations.
- [Required tooling](wisp-tooling-permitted.log.gz) and [APK verifier self-test](wisp-identity-selftest.log.gz):PASS.
- Original Chromium151 timeout and sandbox mock failures remain preserved;
  Chrome155 and permitted test execution resolve those environment blockers.

Clock evidence:

- [Unchanged main probe](wisp-hp-baseline.json): aligned cases stall at6s;
  fractional cases exceed strict HP tolerance. Kills/rewards match when completed.
- [Progress-guard-only candidate](wisp-hp-candidate.json): aligned cases PASS;
  fractional deltas exactly match baseline, proving the residual is pre-existing.
- [Both corrections](wisp-hp-clock-final.json):all12 controls PASS. The clock
  advances from its canonical grid; target phase never mixes whole seconds
  into the fractional calculation. No elapsed interval or damage is discarded.
- [Old guard mutation](wisp-stall-negative.log.gz):the focused check rejects
  the old guard with the intended6s/1.1102230246251565e-16 stall.

The archived exact offline-state oracle [initial correction failure](wisp-offline-clock-final.log.gz)
detects ~3e-12 changed continuous values. The [next diagnostic](wisp-offline-standard-oracle.log.gz)
detects one extra endpoint iteration with identical gameplay summary. The
intermediate [passing tolerance oracle](wisp-offline-oracle-final.json.gz) is
superseded by [the exact revised golden oracle](wisp-offline-exact-oracle.json.gz).
The [fixed fixture](../../../tests/behavioral/wisp-clock-oracle.json) records only
HP/charge/clock changes and the two exact final-segment count corrections. Every
original value is checked before applying its expected correction, then complete
state/summary equality is enforced. All economy, levels, ownership, paid work
and metadata retain exact original expectations. No general tolerance or
iteration allowance replaces this gate. The complete long-offline run PASS
includes8h/72h, Study tail, storage faults, cancel/restart, backup/recovery,
processing time and wall-clock jumps. Reverting the phase correction is
[rejected by strict HP parity](wisp-phase-negative-exact.log.gz).
The [same old-phase mutation](wisp-offline-exact-negative.log.gz) also fails the
complete-state golden oracle at Clear20/60s, confirming the gate distinguishes
the deliberate correction instead of admitting either numerical result.

[V8 6.0 engine check](wisp-v8-engine.json) PASS all3,249 existing role assertions
and12 clock replay controls on unmodified product SHA256
`0f306575fed5a2332379feedafe47a5a9286f98d2088ac72071782f82c63d3d7`.
The launcher adapts only the modern Node test driver, with no VM/product
polyfills. This is JavaScript engine evidence, not WebView60 DOM/native/device.

[Rebased core](wisp-core-rebased.log.gz) and [mobile](wisp-ui-rebased.log.gz)
preserve PR59's upgrade-folding implementation and tests. The [older full local
diagnostic](wisp-full-diagnostic.log.gz) completed174 passing executions and
one superseded offline-oracle failure, using the pre-PR59 staged149-scenario
product. It cannot establish final full-suite acceptance. [CI37711347792](ci-37711347792.json)
on48f9c15 PASS150 default scenarios, all12 required negative controls,
tooling/source and guarded startup. [Full raw job log](ci-37711347792.log.gz)
retains exact source/commands/results. The stricter fixed oracle and evidence
commits require fresh CI; the product bytes are unchanged by that checkpoint.
Mainb4d3667/PR64 documentation is incorporated without product changes.

Subsequent main641697e incorporates PR61 Bond partner text and the PR62/65
Lab checkpoints. The two merge conflicts keep both the Bond/Wisp-role module
registrations and all other chats' status rows. [Core](wisp-core-main641.log.gz),
[V8 6.0](wisp-v8-main641.json), [normal mobile](wisp-ui-main641.log.gz),
[reduced motion](wisp-ui-reduced-main641.log.gz) and [Bond contract](wisp-bond-main641.log.gz)
PASS again on product SHA256
`2abf03c62c7d311520ffd42ee1e15dee85dd3bedce99bd79af9b5a395a8a9551`.
Default suite count is now151; the older CI150 pass cannot establish final-head
acceptance. The main delta changes Bond presentation, not the damage/clock or
purchase formulas. Existing golden fixtures remain unchanged.

[All12 required negative controls](wisp-required-negatives.json) reject their
intended assertions/runtime faults on the exact candidate, with completed valid
browser QA payloads and no process timeouts. [Raw output](wisp-required-negatives.log.gz)
retains process/result/source identity. The earlier old-staging diagnostic is
not used as final acceptance evidence.

Reproduce from root:

```bash
node tests/behavioral/wisp-roles.cjs
node docs/qa/wisp-roles-001/hp-parity-probe.cjs [path/to/baseline/index.html]
node tests/behavioral/run.cjs --web-root . --scenario wisp-roles-ui
node tests/behavioral/run.cjs --web-root . --scenario wisp-roles-ui-reduced-motion
node docs/qa/wisp-roles-001/measure.cjs
node docs/qa/wisp-roles-001/check-v8-engine.cjs /path/to/node-v8.3.0
```

`measure.cjs` has an explicit analysis-only `WISP_CALIBRATION` JSON input
(coefficient/start). It overrides no product file and labels output provenance.
Do not treat calibration as an implemented or accepted rule. Historical initial
measurements use1e-10 analysis tolerance; the registered core/probe retain the
repository's stricter tolerance. Full CI, final source receipts and required
Android/WebView60/TalkBack acceptance must be recorded before completion.
