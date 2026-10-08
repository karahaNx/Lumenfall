# UPGRADE_IDENTITY_001 — exclusive upgrade ownership (F29)

Owner: this feature chat. Status: implementation in progress; not complete.

Original [request](UPGRADE_IDENTITY_001/USER_REQUEST.txt) delegates the common
matrix, duplicate decisions, stacking and purchased-level value policy.
[Original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
has precedence over proposals. The [correction](UPGRADE_IDENTITY_001/USER_CORRECTION.txt)
requires unchanged Workshop currencies. On 2026-10-08 the user instructed:
“Finish the feature task push to github implement to game”.

## Baseline and scope

Private checkout /workspace/Lumenfall-upgrade-identity-001, branch
feature/upgrade-identity-001, product baseline main
b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Rebased through261b1b7 (PR77 Backup UI) onto main
4ff0ae3025a6e57ba3332280f3db6f65bf5ddf4b (Formation Autosave/Backup receipt).
Both test registrations and all17 required negatives are retained. Earlier proposal was rebased;
[historical proposal](UPGRADE_IDENTITY_001/PROPOSAL_2026-10-07.txt) and old checks
remain historical. PR46/B2 is integrated via PR57, not a current gate. Live rules
assign implementation/delivery to this chat. No subagents/message tools used.

Overlapping open drafts: PR66 Tree caps, PR67 feedback bundle, PR70 Wisp roles.
Do not overwrite/merge their work. Recheck main before integration. Lab PR62 and
Forge PR64 are proposals, not agreed product numbers.

Change the common contract, purchase/queue eligibility, legacy presentation and
necessary Deed continuity, with focused tests/evidence. Retain existing currency
recipes, prices, work, unlocks, effects and rounding on retained tracks. No new
numerical tuning, speculative mechanics or F18/F19/F26 balance changes. Deep
Reserves stays until its separate offline-cap transition.

The final [24-row contract](UPGRADE_IDENTITY_001/MATRIX.md) records all effects,
recipes, dispositions, stacking, paid-work/Inquiry/Deed value and dependencies.

## Decisions and acceptance

Fuse ten duplicate purchase tracks into existing owners: Lab owns passive/tap
damage and kill Lumen/Shards; Tree owns Prisms/offline rate. Forge retains charge,
damaging abilities, Gale/Thorn cast resources and future Luminous chance. Lab
retains Mote yield/Inquiry. Tree retains recruitment discount/Deep Reserves.
Yield, chance and cast rewards are distinct events.

Keep all 24 raw IDs and exact existing formula operands/order. Closed rows become
visible legacy contributions: no refund, conversion, invented destination levels
or repeated bonus. Direct/bulk/queued starts reject without spending. Paid
Studies finish and earn once, keeping work/paid speed. No schema bump needed;
normalization/backup/recovery remain idempotent.

Original earned Deeds/reward pool and original totals stay. Every Path Studied
targets the five remaining original buyable Studies; Inquiry excluded. Old rows
keep First Discovery/Devoted Scholar credit. Preserve slots at Rift 1/40/60/90
independently of visible choices. Inquiry keeps purchased reduction/rounding on
all retained targets; existing work snapshots unchanged. Forge 20/60 original
level thresholds remain reachable via uncapped Swift Recovery; old credit stays.

Acceptance: authoritative direct/queue/bulk rejection; exact old factors and
currencies; paid completion once; fresh Deed reachability; unchanged slots,
Inquiry/speed semantics; live/offline chronology; save/reload/backup/recovery and
Ascend; UI 320/390/430px, large text, >=44px controls, focus/contrast/reduced motion.
Required CI/integrated checks, signed APK/package com.lumenfall.app/established
signing, WebView60 and native/device acceptance. Required missing device checks
keep this open.

## Checks and continuation

Historical baseline: nine Forge/Inquiry/save/UI scenarios passed on earlier main;
one animated 43.9969px mobile run failed, retry passed. These do not validate
implementation. See historical proposal/evidence.

Candidate implemented in index.html; common contract in MATRIX.md; eight new
behavior scenarios and three causal negatives added. Existing UI/chronology tests
now exercise retained charge (closed paths have dedicated rejection coverage).
Focused contract, paid chronology, three real persistence paths and mobile
320/390/430px normal/200% text/motion pass. All four numeric profile probes match
main exactly. V8 6.0.287.53 syntax/full offline entry passes302400 kills/14400
Ascends. Source/context/tooling/APK-verifier self-test pass. Full suite running;
initial probe found obsolete closed-row expectations/mobile issues, corrected.
Queue closure also exposed a Farm clock stall. Only the two clock corrections
from PR70 head7284cf716250355e1bf68d00590f81ab96f49a3d are included; no Wisp
role/UI/catalog changes copied. A dedicated saved-queue zero/fractional-clock case
and causal old-guard negative protect this dependency. Offline baseline comparisons
keep exact full equality against the immutable engine plus only those clock fixes.
[PR90](https://github.com/karahaNx/Lumenfall/pull/90) is pushed as a draft;
all17 causal negatives now detect their intended failures.
[Candidate evidence](../qa/upgrade-identity-001/2026-10-08/README.md);
full final-source CI/integration/APK acceptance are not yet claimed.
Next: implement, verify fresh baseline/focused regressions, publish/integrate
following required CI, build/verify APK. Keep owner chat open until required
acceptance and GitHub status evidence are saved.
