# F05 — approved new-depth Prism rounding

Decision date: 7 October 2026. Owner: ASCEND-PRISMS-001, chat
`01a11671-0a13-755b-9b2b-83cb96f6a044`, feature owner (original role: Lead / Architecture).
Status: user-approved design, tested in the original isolated candidate and
reconciled with current main on 8 October. Publication/integrated acceptance
remain in progress; see the [current task](../tasks/ASCEND_PRISMS_001.md).

## Exact decision and approval

The concrete question presented to the user was:

> Jeg har testet denne konkrete nye regel: “Beregn ny-dybde-bonussen fra forskellen mellem de uafrundede dybdekurver med aktuelle Tree/Lab-bonusser, og rund den op én gang. Bevar første belønning, 20%-repeat, minimum 1 og loftet på fuld belønning.” Den fjerner faldet 2→1 ved Swift-køb; i 673 prøver ændrer den kun ny-dybde-belønninger med 0 eller +1. Dine 5 ved repeat forbliver 5. Godkender du reglen? Jeg spørger, fordi din F05-bestilling kræver en konkret designbeslutning til nye afrundingsregler.

The user's answer, verbatim:

> Godkend den nye ny-dybde-regel

This approves the specified economy rule. B2 was subsequently integrated.
On 8 October the user instructed “Finish the task push to github”; current
feature ownership and standing scope authorization cover publication/delivery.
Neither instruction establishes device acceptance.

## Why a rule change was necessary

The previous calculation subtracted two separately rounded full rewards.
At actually cleared Rift 16, reward benchmark 15, completed Lab level 0:

| Swift level | Previous full | Previous benchmark full | Previous gain | Approved gain |
| --- | ---: | ---: | ---: | ---: |
| 0 | 8 | 7 | 2 | 2 |
| 1 | 8 | 8 | 1 | 2 |

Buying a Prism bonus could therefore reduce the actual Ascend payout. The
full browser motor reproduced that decrease for manual and authoritative
live/offline Auto-Ascend. It is a separate confirmed finding from the user's
reported five-Prism case; no user save was supplied or reproduced.

## Final contract

Let `c` be the actually cleared progression Rift, `b` the saved best rewarded
clear, and `M = (1 + 0.04 × Swift level) × (1 + 0.05 × completed Clarity level)`.

- Before cleared Rift 15: gain 0, Ascend remains locked.
- Full reward `F = floor(2 × sqrt(c) × M)`, minimum 1 once eligible.
- First reward (`b = 0`): gain `F`, unchanged.
- Otherwise repeat reserve `R = max(1, floor(0.20 × F))`, unchanged.
- If `c > b`, new-depth bonus `P = ceil(2 × (sqrt(c) − sqrt(b)) × M)`.
  If `c <= b`, `P = 0`.
- Gain `max(1, min(F, R + P))`, preserving the full-reward cap.

The implementation uses the algebraically equivalent
`2 × (c − b) / (sqrt(c) + sqrt(b))` before multiplying by `M` and rounding up.
This preserves small positive differences between very large representable
depths. The continuous difference is rounded once; this is not a guaranteed
extra Prism for each purchase.

Save schema, saved benchmark interpretation, permanent bonus levels, reset,
Lab completion order, currency and carry fields remain unchanged. Missing
legacy benchmark still defaults to 0. Existing auto-at-time-zero versus due
Lab completion ordering is retained and verified in both simulation modes.

## Evidence and limits

- Current baseline: main `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
  The earlier APK133 source has the same Ascend numeric functions.
- 673 full browser cases: old/new differ only by 0 or +1 in new-depth rewards;
  94 cases change. First/repeat cases are unchanged in this matrix.
- Canonical-calculation scan: 1,224,300 adjacent bonus comparisons,
  102,762 decreases before, zero with the approved rule. This is a calculation
  scan, not 1,224,300 full payout or Android tests.
- Confirmed local candidate: 673 browser cases, 11,822 assertions; matching
  DOM preview, manual payout and authoritative live/offline payout.
- Permanent behavioral contract includes the actual 2→1 regression,
  four bonus configurations, explicit repeat thresholds, farm return depth,
  boss-clear triggers, completed/pending Lab work and high-depth increments.
- Actual reload, backup restore and recovery use persisted bonus levels and
  benchmark. Causal controls remove Tree/Lab, change payout/repeat, and restore
  the old rounding rule; expected failures must be caught.

Receipts, reproduction commands and precise remaining integration/device
requirements are in [the task](../tasks/ASCEND_PRISMS_001.md) and
[the QA record](../qa/ascend-prisms-001/README.md).
