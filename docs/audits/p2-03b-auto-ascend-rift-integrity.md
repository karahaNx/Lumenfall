# P2-03B — Auto-Ascend cleared-Rift integrity

Root cause: Auto-Ascend compared the current encounter directly with its target, one Rift ahead of authoritative cleared progression. `clearedProgressionRift()` and `ascendEligible()` now define shared current-run eligibility for manual and automatic Ascension. The schema-v1 legacy target representation is translated without migration. Historical max depth cannot grant current-run eligibility. No balance formulas changed.
