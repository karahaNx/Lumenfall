# LAB-MOTES-B2-001 — exact represented farm quotient

R2 (`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`) is blocked by Core C-B2
and QA B2. Subtracting a modulo remainder from a large double can round back
to the original damage; rounding the resulting division then creates an extra
safe-integer kill. The local 02_08 candidate corrects that quotient only.

`simulationWholeHpUnits` divides represented damage by represented maximum HP
using integer arithmetic. Game maximum HP is integral: for positive integral H,
floor(floor(D)/H) = floor(D/H), and BigInt conversion preserves those exact
represented integers. Fractional finite H is decoded as a binary significand
and exponent; shifting to a common exponent and integer division produces the
same exact floor. The IEEE exponent range bounds the work; there is no loop
over kills and no gameplay cap. Conversion back to Number is exact when the
quotient/final count is safe. Existing modulo, partial-HP carry, 1e-12 relative
and SIM_EPS=1e-9 absolute boundary rules are unchanged.

Supported certification: finite positive damage and maximum/current HP in the
physical game range (maximum HP starts at 11), safely representable kill counts.
Nonphysical tiny-HP worlds, Infinity/overflow, unsafe counts and arbitrary
sub-ULP accumulated work remain outside certification. The nonfinite fallback
does not certify such inputs. No prices, reward/spawn policies, Motes boundaries,
Study intent, persistence, navigation, native configuration or workflows change.
Exact kills do not imply exact large rewards: represented multiplication,
summation and existing offline 0.7 policy still apply. Distinct represented
whole/split damage can legitimately produce different HP or rounded totals.

The permanent `lab-motes-numerical` scenario exercises the real scheduler,
farm/reward/spawn and Study engine for Core's `2**55+16` minimum and QA's
normalized Titan1635/Mythic natural-DPS stress state without overriding DPS.
It decodes actual per-segment damage and consumes current enemy HP in its
independent oracle, checking kills, HP, spawn policy, represented rewards,
Motes payment and post-payment work across whole/split and live/offline cases.
The exact old R2 farm function must fail each minimum; undo passes. The old
R1 double-round and three LAB causal controls remain required separately.

Private deterministic boundary verification covers 7,945 represented inputs,
ordinary counts, 2^50/2^51/2^52 and the safe-integer limit, integral/fractional
HP through 1e250, neighboring representable multiples, partial/full HP and
cancellation. It checks quotient threshold inequalities directly. The 167
inputs inside existing boundary tolerances are explicitly classified rather
than presented as exact-rational equality. R2 has 370 count failures in this
matrix; the local candidate has zero quotient/count failures outside those
unchanged boundary rules. This matrix has stubbed batch side effects and is
not full-engine economy evidence. Original reviewer diagnostics remain sources,
not acceptance; all seven final gates and exact-candidate Core/QA review apply.

Writer handover from 02_07 is undocumented at the start of this local recovery.
02_08 phase A permits local proposals/tests only. This file is not a remote
R3, writer-release receipt, integration approval or release instruction.
Physical Android/TalkBack and BigInt execution on a physical WebView are untested.
