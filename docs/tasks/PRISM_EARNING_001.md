# PRISM_EARNING_001 — improvement 01

Isolated candidate on `feature/prism-earning-001`, baseline main67373faa.
User mandate: improve Prism returns, preserve paid value, one change at a time,
ONE final APK. Do not merge to main or release. PR102 is the later collection.

[Design, exact policy, defects, evidence and limits](../qa/prism-earning-001/DESIGN.md).
Repeat:20% of base plus full earned bonus, rounded once. First/new-depth/cap
semantics remain; exact integer thresholds fix floating-point mistakes.
No save, ownership, paid work, prices, scheduler or Android identity changes.

Actual patched source5131f9fb passes341654 numerical assertions/seven defect
controls locally. Run37912815161 source PASS; startup budget FAIL. Shorten this
checkpoint, not the gate. Full browser/CI/native acceptance remains pending.
Next: prepare validated candidate, run full CI, debug regressions, then verify
integration into development only. No physical or independent-review claim.
