# Current verification — LAB_EXCLUSIVE_001

Recorded 2026-10-08T00:36:24.332Z. Baseline 214d45411ce2fb420f0e4b372063811a967679b1; index SHA256
6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca. Node v24.19.0.
This is proposal/baseline verification, not implemented-feature acceptance.

- PASS pinned inventory: 9 Lab / 8 Forge / 7 Tree rows; 36 nominal price/work
  rows, slot boundaries and independently calculated mixed stacking.
- PASS inventory comparison: all catalog/prices/work/slots/speed tiers/mixed
  factors match the original observed inventory; source line positions differ.
- PASS actual feature context: 29 entrypoints, 56 local links, 27433 startup bytes.
- PASS Node tooling checks with local-network grant. Initial restricted-sandbox
  run failed at the fixture aapt subprocess; its log is preserved separately.
- PASS APK identity verifier self-test; this does not build or accept an APK.
- PASS existing lab-motes-offline-integration scenario on current source: paid
  repeated research, snapshots and chronological offline/live behavior.
- BLOCKED local inquiry-contracts browser check: Chromium151 process timed out
  at 25s with no QA DOM. Raw stderr/stdout/process metadata retained in raw/.
  This is not a passing browser scenario. Required repository CI remains intact.

Full commands/exits are in [check-results.json](check-results.json); individual
logs are stored alongside. Tooling's smoke checks exercise fixture/guard
contracts, not an actual successful Chromium game launch.

Publication/integration pending. Full feature remains blocked on the approved
UPGRADE_IDENTITY_001 matrix. No APK/device acceptance of new Lab mechanics is
claimed. Self-review only; no independent review claimed.

Original 7 October evidence is retained one directory above unchanged. Its
Python harness and failures belong to that frozen source, not active tooling.
