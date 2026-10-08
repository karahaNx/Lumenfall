# F25 current-main candidate evidence

Baseline b0537cb; source SHA256 3c962a5024efe3735903897ba92afc502e968d74b91b6b6b47b593a7c6f9d73b.

- baseline.json: expected failure restoring unowned25x on untouched main.
- contract.json/screenshots:1127 checks, six profiles; real handlers/reloads/restore,
  controlled simulation intervals. Minimum45x44px; conservative text contrast7.49:1.
- negative-controls.json: four expected failures, correct causal assertions.
- source.txt, es2017.json, tooling.txt, apk-identity-self-test.txt, context.txt:
  source/tooling/identity-self-test/context PASS; ES2017 is not device acceptance.
- forge-contracts-stock.txt: local Chromium151 stock dump-DOM timeout, recorded FAIL.

Self-review only. Current F27 catalog/archive retained; no wallet compensation.
Normal GitHub CI, integrated checks, real APK identity/assets and required device
acceptance remain pending. Historical local-candidate evidence accepts older bytes.
