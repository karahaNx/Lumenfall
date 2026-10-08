# TREE_EXCLUSIVE_001 local evidence

This folder records analysis, not implemented feature acceptance.

- `source-checks.json`, `inventory.json`, `formula-probe.json` and the original
  browser attempts refer to main `b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
- `live-baseline-update.json` and the `current-*` files refer to main
  `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
- `checks.json` records six inconclusive positive browser attempts and an
  inconclusive negative attempt. A nonzero process exit without a completed,
  valid QA record does not count as a caught negative.
- `environment-attempt.*` records the initial local-server permission failure;
  the game did not execute in that attempt.
- `browser-raw-*` preserves the available failed browser subprocess outputs
  and process/QA metadata. Original stderr `.log` files are copied byte-for-byte
  as `.txt`. Some early attempts failed during temporary profile cleanup;
  their full harness output remains in the corresponding scenario TXT.
- Chromium also timed out on an empty local file, and the current Node harness
  timed out with zero QA records. These results are infrastructure-inconclusive,
  not proof of a new game regression or compatibility acceptance.
- No own recorded browser profile remains running (`own-process-stop.json`).

Historical read-only reproduction, from repository root (explicit frozen source):

```sh
git show 0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd:index.html > /tmp/tree-exclusive-0bcce84.html
node --check scripts/analysis/tree-exclusive-inventory.cjs
node scripts/analysis/tree-exclusive-inventory.cjs /tmp/tree-exclusive-0bcce84.html
node docs/recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/formula_probe.cjs /tmp/tree-exclusive-0bcce84.html
```

These commands reproduce the historical inventory, not current product acceptance.
Current implementation/checks are recorded in [the task](../../TREE_EXCLUSIVE_001.md)
and [finish evidence](../../../qa/tree-exclusive-001/finish/README.md).

The formula JSON from both baselines matches the preserved original result
byte-for-byte. The inventory script refuses unknown product hashes. Existing
Tree operands and normalization sections were compared directly, as listed in
`live-baseline-update.json`; full-engine results do not transfer across the
offline lifecycle change.

Authored Markdown/request/script whitespace checks pass. Full evidence diff
whitespace checks report original trailing spaces in Chromium stderr; raw
diagnostics are preserved without reformatting. This is documented evidence
preservation, not a changed repository gate or a claim of all checks passing.

Original sources, prices, proposed effects, open decisions and acceptance are
in [the task](../../TREE_EXCLUSIVE_001.md). No gameplay numbers, matrix choices,
refund policy, schema step, migration, APK or writer handover are accepted here.
