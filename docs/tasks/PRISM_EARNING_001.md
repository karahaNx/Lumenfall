# PRISM_EARNING_001 — sequential improvement 01

Status: isolated implementation candidate; required full-game CI and integration pending.
Main baseline: `67373faa531f0bb791c883210ee623320861e380`.
Branch: `feature/prism-earning-001`. PR102 remains the later integration work.
The user approved improving Prism returns, preserving purchased value and doing
one improvement at a time before ONE final APK publication. Do not merge this
candidate to main or publish an APK. No new approval is needed for scoped tests.

## Candidate policy and reproduced defects

Let D be the cleared Rift and M=(1+0.04*Swift)*(1+0.05*completed Clarity).
First reward remains floor(2*sqrt(D)*M). Repeat reward becomes
max(1,floor(2*sqrt(D)*(0.20+M-1))). Thus the base remains discounted, but bought
bonus value is no longer itself reduced to 20%. New-depth rewards retain the
unrounded curve difference, rounded up once, and the full-reward cap.
This is an implementation choice within the latest mandate, not a claim that
the user personally specified its numerical formula. The older policy is
preserved in [the historical requirements](ASCEND_PRISMS_001_REQUIREMENTS.txt).

Synthetic examples at cleared20, Clarity0: Swift0/5/10 repeat pays1/3/5 instead
of1/2/2. Bonuses are not guaranteed to add one whole Prism at every purchase.
A real floating-point defect also exists: cleared25/Swift10/Clarity10 first
reward computes20 instead of the exact21. Exact integer comparisons correct
full, repeat and new-depth rounding boundaries without an arbitrary epsilon.

## Preservation and limits

No save-schema, saved wallet, ownership, paid Study, price, unlock, Auto-Ascend
control, chronological scheduler, Android package or signing changes. No refund
or new ledger is needed. The user's backup remains private and unmodified;
committed fixtures are synthetic. Oversized legacy Number values retain a
fallback, not an exact-currency guarantee. Exact arithmetic requires safe
integer depths/numerator and safely representable output; no gameplay cap is added.

## Validation and delivery

The local isolated kernel passed341654 assertions, including277916 formula
cases,3780 breakdown cases and seven causal defect controls. This is not a
full-game or Android claim. The committed [numerical test](../../tests/behavioral/prism-earning.cjs)
re-extracts actual candidate functions and binds its result to the source hash.
Existing [F05 browser tests](../../tests/behavioral/ascend-prisms.js) retain actual
manual/live/offline payouts, pending Studies, save/reload/recovery/backup routes
and gain updated independent oracles/threshold cases for the new policy.
All existing CI gates and negative controls remain; an additional numerical
gate is required. A one-shot, branch-locked preparation workflow applies the
reviewable patch to the pinned source and removes its own temporary files.

Next: run source/context/numerical checks on actual candidate, inspect full
required CI, debug every regression, verify mobile/legacy-runtime behavior,
then integrate into the development collection only after combined validation.
Physical Android/TalkBack and final signed APK acceptance are not performed.
