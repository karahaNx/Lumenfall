# Prism earning 01 — design and validation notes

## Authorized scope

The user approved improving repeat-Ascend returns and preserving paid value,
then requested sequential improvements with a single final Android publication.
This isolated candidate must not merge to main or publish an APK yet. PR102 is
the separate integration collection. No private backup is committed; all new
fixtures are synthetic. Baseline: main67373faa531f0bb791c883210ee623320861e380.

## Policy

For cleared depth D and M=(1+0.04*Swift)*(1+0.05*completed Clarity):

- First reward: floor(2*sqrt(D)*M), with existing eligibility/minimum.
- Repeat: max(1,floor(2*sqrt(D)*(0.20+M-1))). The unupgraded base retains the
  20% factor; the earned upgrade portion is retained in full.
- New-depth bonus: ceil(2*(sqrt(D)-sqrt(benchmark))*M), only beyond benchmark.
- Total remains at most the current full-depth reward. Purchased levels, saved
  currencies, Study snapshots, scheduler order, prices and schema are untouched.

This numerical policy is the implementation choice within the latest approved
goal, not a claim that the user dictated the exact formula. It supersedes only
the repeat rule in the historical F05 requirements. Whole-Prism plateaus remain:
an upgrade is not promised to add one immediate Prism regardless of its size.

At cleared20, Clarity0, Swift0/1/5/7/10/20 repeats become1/2/3/4/5/8. The former
values were1/1/2/2/2/3. With no upgrades, the repeat curve is unchanged. The
continuous new repeat minus the old one is0.8*base*(M-1), nonnegative for M>=1.
This is a bounded improvement, not full first-reward farming on every repeat.
Exponential Tree prices stay unchanged and must be reassessed with later catalog
work; this patch does not establish complete early/mid/endgame pacing acceptance.

## Arithmetic defects and proof boundary

At cleared25/Swift10/Clarity10, binary floating point produces a full reward20
instead of the mathematically exact21. At cleared25/benchmark16/Swift35/Clarity5,
it can ceil a new-depth increment to7 instead of6. Exact comparisons fix both;
existing saved Prisms are not debited or repriced.

P=(25+Swift)*(20+Clarity), denominator500. For full/repeat flooring, compare
n^2*500^2 with4*D*P^2 (repeat uses P-400). For the difference ceil, first check
the sign of4*P^2*(D+B)-k^2*500^2; if positive, compare its square to64*P^4*D*B.
The sign check prevents an extraneous root from squaring. A bounded binary search
corrects only candidates crossing an exact integer boundary. Base32768 limb
multiplication keeps each product/carry below2^31, using existing Number APIs.
No runtime BigInt, arbitrary epsilon, new gameplay cap or external dependency.

Exact certification requires safe integer depths/P/output. Oversized legacy
Number states retain their fallback, not an exact-currency guarantee. Future
Comet or catalog multipliers must extend the rational factor and its oracle;
they cannot be added only to presentation. Global oversized-wallet accounting
is not silently certified by this reward calculation.

## Evidence and remaining gates

The isolated local kernel passed341654 assertions:277916 formula cases,
3780 breakdown cases, seeded fuzzing, monotonicity, pending-study purity and
seven causal defect controls. The actual patched source5131f9fbafdfe4e5feab69c5bb52ae5dba1363cc1eeef4cd7c02d376d6500cf9
also passed that numerical test locally on Node22.16.0.

Preparation run37912815161 applied the exact pinned patch and source validation
passed. It then stopped at the existing32KiB startup budget. Its immutable
artifact11606654674 preserves source/patch/logs. No candidate commit or release
was made by that failed run. Details are moved here, not a relaxed size gate.

Existing browser tests retain real DOM/manual/live/offline, primary/recovery,
reload/backup and paid-completion boundaries. Their policy oracles/thresholds
are updated, not removed. The five existing F05 negative controls stay required,
with Tree/Lab mutations targeting the actual new arithmetic operands. All other
existing gates remain and a source-bound numerical gate is added.

Full required CI, integrated-source mobile measurements, exact old V8/native
WebView60, physical Android/TalkBack and final APK acceptance remain unverified.
Self-review and automation are not independent human review.
