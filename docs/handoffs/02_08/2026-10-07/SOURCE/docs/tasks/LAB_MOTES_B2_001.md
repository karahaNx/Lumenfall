# LAB-MOTES-B2-001 — exact quotient on the existing runtime

R2 (`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`) is blocked by Core C-B2
and QA B2: subtraction of the modulo remainder can round back to damage,
then rounding the recovered quotient creates an extra safe-integer kill.
The previous local tree `4c07cd5d66cb5928eb99623ff86efaa81e268829` fixes the
arithmetic on modern engines but is blocked by C-RT-B2 / QA-B2-RUNTIME-01.
Its mandatory BigInt syntax/API fails on the existing WebView baseline.
Lead 00_16 authorizes this isolated phase-A replacement, preserving WebView 60.

## Exact represented-Number rule

`simulationWholeHpUnits` decodes each positive finite binary64 into an integer
significand M and exponent E: value = M * 2^E. The two 32-bit words reconstruct
M with integer multiplication/addition, exactly within 2^53-1. Normal values
have 2^52 <= M < 2^53. At most 52 exact left shifts normalize each subnormal,
decrementing its exponent to preserve the value. D < H returns zero directly.

For normalized D >= H, s = E_D - E_H is nonnegative. A safe quotient requires
s <= 53: for s >= 54, M_D/M_H > 1/2 implies D/H > 2^53. For s <= 53, binary
long division processes s+1 bits (at most 54), computing
floor((M_D/M_H) * 2^s). Initially M_D < 2*M_H. At each step, compare the exact
remainder to M_H and subtract M_H once if necessary. The resulting remainder
is an integer below M_H <= 2^53-1 and is exactly representable. Its doubling
is an even integer below 2^54 and is also exact. The next successful subtraction
again yields an exactly representable integer below M_H (also a Sterbenz
subtraction). Each quotient prefix is an integer no larger than the final
safe quotient, so q*2 plus the next bit is exact. This proves the floor without
an ambiguous rounded division or a loop per kill. Integer and fractional HP
follow the same rule. The algorithm uses existing Number/DataView APIs;
production contains no native BigInt syntax/API, polyfill or new dependency.

The shift>53 fallback preserves the existing out-of-contract Number result;
it imposes no gameplay cap and does not certify unsafe counts or overflow.
Supported certification remains finite positive damage and physical maximum/
current HP, with safely representable final kill counts. Physical max HP starts
at 11. Nonphysical tiny-HP worlds, nonfinite values, unsafe final counts and
arbitrary sub-ULP accumulated work remain outside certification.

Modulo, partial-HP carry, SIM_EPS=1e-9 and relative 1e-12 boundary rules remain
unchanged. Near-threshold promotions are classified explicitly; exact quotient
is not a claim that these historical tolerances implement strict real damage.
Exact kills also do not make huge rewards exact reals: actual represented
multiplication, summation, spawn policy and offline 0.7 scale still apply.
Whole/split represented damage may differ; only equal damage justifies equal HP.
Prices, tiers, rewards, Motes boundaries, Study/Queue intent, chronology, save/
recovery, NAV, combat balance, native files and workflows are unchanged.

## Permanent controls and delivery

`lab-motes-numerical` retains both original minima on the real scheduler and
natural Titan1635/Mythic DPS, including old-R2 FAIL / undo PASS. The original
B1 826-fixture ledger, 43 counterexamples and old-R1 / three LAB mutants remain.
`lab-motes-runtime` runs startup, Push, B1, both minima and fractional HP across
ON/OFF, whole/split and live/offline, with native BigInt and DataView BigInt
APIs unavailable in the app. Its independent damage-threshold oracle executes
in the external modern Node driver, so the app never needs that API. Fractional
HP uses a private fixture override; it is not a new game HP policy.

The full scripts additionally require ES2017 grammar, actual older V8 syntax/
helper execution and API checks. Grammar and modern Chrome with APIs removed
are scoped evidence, not physical WebView 60 emulation. Exact source/tree,
independent Fraction matrices, motor/reward traces, bounded-cost measurements,
seven workflow gates and raw outputs are recorded in the phase-A handoff.
All original diagnostics and the prior intermittent mobile clipping FAIL are
preserved. No UI fix is claimed; clipping root cause remains unknown.

No remote R3, writer takeover, integration or release is authorized by this
file. Remote phase B is held by 00_16 until candidate review and documented
02_07 writer handover. Known own processes must finish before delivery.
Physical Android/WebView/TalkBack remain untested. Changed bytes require new
scoped Core and QA review; historical positive reviews are evidence only.
