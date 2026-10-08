# F25 evidence by source revision

Baseline b0537cb has SHA2565c4b3dac. Initial candidate3c962a50 is historical.
Combined PR77 receipts use34e044cc; Formation combination usesd757fabd.
Previous reviewed game SHA256:
fe11176fd6b9d2d3406ed0d49bd056d712f9b975ef1cce6ab31084f3548ac5f3.

- baseline.json: expected failure restoring unowned25x on untouched main.
- Initial contract.json/screenshots:1127 checks, six profiles; real handlers/reloads/restore,
  controlled simulation intervals. Minimum45x44px; conservative text contrast7.49:1.
- negative-controls.json: four expected failures, correct causal assertions.
- source.txt, es2017.json, tooling.txt, apk-identity-self-test.txt, context.txt:
  source/tooling/identity-self-test/context PASS; ES2017 is not device acceptance.
- forge-contracts-stock.txt: local Chromium151 stock dump-DOM timeout, recorded FAIL.

Self-review only. Current F27 catalog/archive retained; no wallet compensation.
final-contract.json/final-screenshots:1133 checks/six profiles on current game,
including six new selected-artifact asset assertions. Every font/branding response
is hashed; assets come from the HTML's own web root with correct CSS MIME type.
final-negative-controls.json: all four causal mutants caught. missing-artifact-fonts.json
rejects a same-HTML artifact without its fonts at the asset assertion (exit1).
staged-artifact-old-gate.txt: normal run.cjs --web-root invocation rejects the
staged old startup gate, rather than reading the passing checkout (exit1).
final-scoped/results.json:20 positive/two negative existing cases PASS. Raw negative
DOM/process records and gzipped full per-case logs are retained. final-v8-6.0.json:
437 production VM assertions PASS on Node8.3/V8 6.0.286.52; final-es2017.json PASS.

Initial CI37735117429 passed153/12/all gates; full log and metadata retained.
These historical receipts do not accept later combined source. Renewed full CI,
integrated checks, signed APK/native acceptance remain pending. Review findings
about selected browser/source/assets and source-bound receipts are addressed;
no self-review is represented as independent review.

Latest main31eccfb combination (Auto-Ascend UI/Upgrade Identity), SHA256
6c6ba30e37ea19edd547ad5a904fb063495cece477b93d193f7b1a8bd5b33e1c:
identity-combination.json/screenshots1139 checks/six profiles PASS;
identity-scoped22 cases, identity-v8-6.0/identity-es2017/source PASS.
identity-resonate.txt and identity-registered-core.txt check normal registration.
Resonate's upstream separate-browser startup timeout is retained; the necessary
fix forwards the harness browser, preserving all its assertions. Native143
baseline/cold restart/database proof is now in ../native; new APK still pending.
