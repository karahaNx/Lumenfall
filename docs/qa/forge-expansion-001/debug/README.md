# Independent Forge calibration and conservative-bound debugging

These are synthetic fixtures executed through the complete production game
IIFE. Observation wrappers call each original scheduler, cast, tap and damage
function with its original arguments and return value. They do not replace the
combat model. No user save was loaded or altered by this work.

## Findings and repairs

### Persisted Support deadline precision

The initial proposed lower bound credited the theoretical four-second Support
uptime. The production scheduler retains a finer time phase than the saved
epoch-millisecond deadline. A cast can consequently expire slightly earlier
than its exact mathematical duration.

The fixed witness has only level-50 Aurora active, Auto-Tap off, Swift Recovery
zero, Amplifier Trim five, and initial charge `17.0001`. The clock starts at
`2000000000000`. With maximum HP `253299999.5`, remaining HP `100000000`, and
regeneration `1519799.997` per second, the old assessment returned `sustained`
with a purported lower DPS of `1519800`.

After 600 seconds of warmup, 6,000 seconds of original production simulation
delivered `1519799.993444882` DPS. The boss **gained** `21.330758929252625` HP over
the thousand complete cast cycles. The lower-bound error exceeded the original
numerical slack. The raw before receipt is [support-clock-before.json](support-clock-before.json),
bound to candidate source `dfd3dbc41e1c298ec2f02f9bb4a2133683c397e92cacd2f664f8cb30d04bee1a`.

The repaired lower bound uses unbuffed passive damage. Support remains in the
HUD estimate and in the conservative upper bound. The same physical witness
now returns `uncertain`; its actual damage and HP trajectory remain identical.
The calibration suite recreates the old exact-uptime calculation as a causal
mutation and rejects it against observed gameplay.

### Cadence and a retained Number lifetime counter

The original save normalizer preserves finite integer lifetime counters above
`Number.MAX_SAFE_INTEGER`. At some such values, incrementing by one stops
changing the represented Number. A stalled multiple of five receives Cadence
on every tap; a stalled nonmultiple receives none. Counters immediately below
the unsafe boundary can enter this condition within the measured window.

At `totalTaps = 9007199254741000`, with level-one Ember, Guardian Cadence five
and Auto-Tap on at boss Rift 120, the original proposed average-based upper
bound promised at most `211.58333336323264` damage in ten seconds, including its
burst allowance. Original gameplay applied `240.9`. At a stalled nonmultiple,
the average Cadence bonus instead overstated the guaranteed lower damage.
[cadence-counter-before.json](cadence-counter-before.json) records four full
sixty-second fixtures on source `9d81f0e3e1179f33108492cc0006ab3926e9b85ddfb5955c4a214de27adc22fc`.

The repair leaves all counters and saves intact. The lower bound credits no
Cadence bonus; the upper bound allows the full bonus on every tap. These bounds
are conservative even if a presently safe counter reaches the unsafe region
later. Separate causal mutations reinstate each invalid average bound and fail
against the original damage applications.

The first HUD repair recognized an already stalled next ordinal, but missed a
transition two taps away. [hud-counter-transition-before.json](hud-counter-transition-before.json)
preserves the source-`29125cd559e449381820260e163ba5bfb361eab8995bad236f388ee966905fe7`
witness. The completed HUD repair evaluates sixty increments on a local
counter when that interval reaches unsafe arithmetic. It changes no saved
counter and matches all four actual sixty-second fixtures. A seventh causal
negative verifies this correction.

## Independent acceptance coverage

The executable [forge-expansion-calibration.cjs](../../../../tests/behavioral/forge-expansion-calibration.cjs)
includes:

- Twenty-six fixed formations, charge upgrades, Swift levels, initial phases,
  Support arrangements and valid Ultimates. Each uses 1,024 natural warmup
  cycles and 4,096 measured cycles through the full production scheduler.
- Exact observation of cast and Auto-Tap counts, passive damage, discrete
  damage, and time-integrated Support strength. Every run asserts unchanged
  Wisp/Forge levels and formation, with no kills, Ascends or purchases.
- 128 deterministic finite-window bound fixtures with partial/full bars, varied
  tap phases, party orders, powers, old/new levels, and saved source/legacy buffs.
  The upper-rate inequality includes the separate initial burst allowance.
- Four physically attained mixed saved/future Support envelopes: `1.85`, `1.80`,
  `2.10`, and an opaque legacy entitlement of `3`. An inactive saved source
  remains part of the bound.
- A near-ready Titan cast after the full offline retreat grace. Its sustained
  rate loses to regeneration, but the real pending cast kills the boss. Removing
  the burst guard instead causes a premature retreat.
- The Support-clock and four unsafe/transitioning counter witnesses above.
- Ten targeted precision checks: Swift `0/1/6/60` with natural/refunded cycles
  all produce exactly 1,024 casts; two fine Auto-Tap phases produce exactly
  6,000 taps over 6,000 seconds. These timers use the scheduler's precise phase,
  not a rounded persisted deadline. Their observed numerical difference is far
  smaller than the bound's relative slack.
- Seven causal negative controls, each reaching an assertion coupled to actual
  production simulation rather than failing during initialization.

The HUD reference is a bounded estimate. In the recorded formation matrix,
canonical boss cast-rate error is at most approximately `0.092%`; canonical
nonboss error is approximately `0.265%`. An arbitrary starting phase changes
the first Ember rate by up to `4.6875%` in one nonboss fixture because grants
clip, while its utility-Wisp rates differ by approximately `0.265%` and its
aggregate damage estimate differs by approximately `0.0045%`. This is reported
separately from numerical quantization. The entire measured aggregate HUD-DPS
matrix is checked within one percent. None of these point-estimate tolerances
is used to authorize an automatic Push/Farm transition.

## Reproduction and source binding

From the repository root:

```sh
node tests/behavioral/forge-expansion-calibration.cjs index.html --negative
node docs/qa/forge-expansion-001/debug/bounds-repro.cjs
```

[calibration.json](calibration.json) contains the full source digest, actual
measurements, assertion count and negative-control failures for the repaired
candidate. [bounds-repro-after.json](bounds-repro-after.json) retains full
synthetic starting states and the post-repair physical observations. The
portable [bounds-repro.cjs](bounds-repro.cjs) can accept an explicit candidate
HTML path. [receipt.json](receipt.json) binds these files and the executable
calibration/harness to their SHA-256 digests.

The original failing HTML was also recovered byte-for-byte from the frozen
compatibility-stage fixture; its SHA-256 matches the original before receipt.
[bounds-hud-fix.patch](bounds-hud-fix.patch) preserves the 3,449-byte change from
that `dfd3…` source to `f571…`. Applied together with the independently retained
[unsafe-ascend-fix.patch](unsafe-ascend-fix.patch), it connects the original
failure to final source `05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac`.
[bounds-source-identity.json](bounds-source-identity.json) records a verified
reverse and forward round trip in an isolated directory. Replaying the
reconstructed original source reproduced the original assessment, DPS, and HP
gain exactly, without keeping a second complete HTML file in the repository.

This focused evidence complements the mandatory core, legacy compatibility,
mobile UI, old-V8 and full required CI gates. It makes no device, native WebView,
TalkBack or APK-release acceptance claim.
