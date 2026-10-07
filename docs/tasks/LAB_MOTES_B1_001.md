# LAB-MOTES-B1-001 — farm kill conservation

Subsequent R2 review found B2 in quotient recovery at large safe counts. The
local correction and exact represented-input proof are documented in
`LAB_MOTES_B2_001.md`; this B1 record is historical evidence, not R2 acceptance.

R1 PR46 is blocked: a Motes boundary exposed a pre-existing double rounding
in simulationApplyFarmPassive. The kill quotient could round up and its modulo
remainder could count that same kill again. Fixed scope: this arithmetic and
permanent behavioral conservation regression; all prices, rewards, boundaries,
SIM_EPS, persistence, navigation and workflows remain unchanged.

Decompose total represented damage into full-HP units and modulo remainder BEFORE
subtracting the current partially damaged enemy's HP. Recover the integer quotient
from that same decomposition. Snap the remainder at its boundary once, then compare
it to current HP to account for the partial enemy. This prevents both double carry
and cancellation of small current HP from huge damage. Existing 1e-12 quotient
and 1e-9 HP tolerances are retained. Supported inputs are positive finite HP/damage
and safely representable kill counts; double precision cannot represent arbitrary
sub-ULP damage or exact unbounded totals. Independent exact-rational BigInt checks
cover 576 fixtures across HP scales through1e250 and counts through2^50; those are
arithmetic checks with batch side effects stubbed, not full-engine balance proof.

The default lab-motes-conservation scenario covers QA's 826 fixtures using an
independent per-enemy damage/spawn/reward ledger, ON/OFF comparison, explicit
split and live/offline before/exact/after checks. The documented minimum yields
90 kills, 3 Luminous, ON Motes2/work297.3346 and OFF Motes62/work299.1.
The exact R1 farm function is installed only in private test instrumentation:
the oracle must fail, then undo must pass. No production test hooks are added.

R2 requires fresh full local workflow validation and ordinary same-head PR CI,
followed by new Core chronology/economy and independent QA review. R1 acceptance
is not transferred. PR46 remains Draft; no merge, ready, build, rerun or release.
Physical Android/TalkBack are untested. Lead00_13 issued the scoped writer mandate;
complete original mandate and raw evidence remain in the delivery packet.
