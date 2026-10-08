# LAB_EXCLUSIVE_001 — exclusive Lab upgrades (F29)

## Goal, owner and status

Give Lab its own research effects, with time investment, named currency,
transparent stacking/prices and preservation of purchased and active research.
Owner: this feature chat, across implementation, checks and delivery. No other
chat has been renamed or contacted and no subagents have been used.

**Proposal checkpoint; product implementation remains blocked on the agreed
UPGRADE_IDENTITY_001 matrix.** The user explicitly answered “Ingen aftalt matrix
endnu — lav forslaget” (no agreed matrix; make the proposal), then requested
“Finish the task”. These instructions authorize finishing/publishing the
proposal; they do not supply the missing gameplay values. Recommendations below
are not approved mechanics. Do not mark the full feature complete or archive it.

Original request and correction are saved in
[USER_REQUEST.txt](LAB_EXCLUSIVE_001/USER_REQUEST.txt),
[USER_DECISION_2026-10-07.txt](LAB_EXCLUSIVE_001/USER_DECISION_2026-10-07.txt) and
[continuation](LAB_EXCLUSIVE_001/USER_CONTINUATION_2026-10-08.txt).
The [full first proposal](LAB_EXCLUSIVE_001/PROPOSAL_2026-10-07.md) and its evidence
are preserved as a dated snapshot. Its old PR46/writer-gate statements apply
only to that observation and are superseded by the current checkpoint below.
Startup model/effort recommendations do not attest the actual running model.

## Original requirement and sources

Original F29 says the same upgrades currently occur in several places with a
different currency. Lab should have exclusive upgrades that take longer and use
a specified currency; Forge and Ascension Tree need their own effects too.
The original outranks suggestions in the feedback revision.

- [Original requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
- [F29/dependencies/save feedback](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
- [Recorded Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
- [Evidence findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt)
  and [source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
- [Measured Inquiry requirements](MEASURED_INQUIRY_001_REQUIREMENTS.txt),
  [paid Lab requirements](LAB_MOTES_001_REQUIREMENTS.txt) and
  [Forge/Lab decisions](../decisions/2026-10-04-forge-lab.txt).

Current root AGENTS, bootstrap, PROJECT_STATE and FEATURE_WORKFLOW govern work.
CHAT_OWNERSHIP/02_GAMEPLAY and archived mandates were consulted as historical
technical sources. Current rules remove the old separate Lead/writer gate;
actual overlapping changes and main integration still require coordination.

## Current baseline and scope

Resume baseline: main **214d45411ce2fb420f0e4b372063811a967679b1**;
tree **1048bc22972a2b650eba73186db35bc0402ded04**;
index.html SHA256 **6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca**.
Isolated worktree `/workspace/Lumenfall-LAB_EXCLUSIVE_001-current`, branch
`feature/lab-exclusive-001-checkpoint`. Original shared checkout and previous
private proposal remain untouched. No open PRs were observed at resume;
UPGRADE_IDENTITY_001 and this feature task were absent from live main.

PR46/R2 and Number/DataView B2 are now integrated via PR57/46 at
20aaae62a4b6e46f8d75775085918eaba4e8de29. Saved upstream CI covers 146 scenarios;
signed APK 0.1.138 exists, with required device/independent-review acceptance
still open. This receipt is upstream evidence, not new Lab-feature acceptance.
Historical B2/PR46 review and writer handover are no longer startup blockers.

This checkpoint changes only this task/evidence directory and its PROJECT_STATE
row. It inventories current behavior and proposes Lab rows for the shared
identity matrix. No game, tests, mobile files, saves, balance, signing, workflow
or release behavior changes. Forge/Tree/Comet redesign and F26 offline policy
remain outside this feature's implementation scope.

## Inventory and stacking

There are nine Labs. Seven rows overlap six existing effect families:

| Lab ID | Current earned effect per raw level | Overlap |
| --- | --- | --- |
| wispascend | +15% passive power and Wisp tap base | formationstudy; Forge formation; Tree momentum |
| guardmastery | +20% tap-specific power | Forge resolve; Tree steady |
| riftattune | +10 percentage points offline rate after the Tree cap | Tree echo |
| shardstudy | +8% Shards per kill | Forge sense |
| lumenstudy | +8% Lumen per kill | Forge focus; Tree starlight |
| formationstudy | +5% formation power and Wisp tap base | wispascend; Forge formation; Tree momentum |
| prismstudy | +5% Prisms per Ascend | Tree swift |
| motestudy | +10% Motes per actual Luminous kill | Different from Forge encounter chance; check Modules/Bonds in shared matrix |
| measuredinquiry | -2% future paid work, capped at completed level 10 / 20% | Existing exclusive study-work effect; preserve pending target decision |

Actual source formulas multiply distinct ownership factors; percentages are not
summed into one cross-system level. Offline Tree contribution is capped before
the additive Lab contribution. Paid study work uses frozen total/remaining work
and speed snapshots; Inquiry never discounts itself. Current costs grow by
1.8 per raw level and nominal work by 1.6. Inquiry targets are the frozen eight
legacy Labs. Current speed tiers cost 14/26/60/110/176/258/357/473 Motes for
1.5/2/3/4/5/6/7/8x. These are observed values, not proposed replacements.

The [current inventory](LAB_EXCLUSIVE_001/evidence/current/inventory.json) and
[price/work CSV](LAB_EXCLUSIVE_001/evidence/current/prices-and-work.csv) contain
all nine unlocks/base prices/work times, 36 level checkpoints, Forge/Tree rows,
slot boundaries and an independently calculated mixed-stack example. Current
prices do not reconstruct historical spend. The pinned read-only
[inventory script](LAB_EXCLUSIVE_001/evidence/current/inventory.cjs) rejects a
different source hash rather than silently claiming new-version verification.

## Proposed Lab rows for UPGRADE_IDENTITY_001

| Proposed row | Distinct effect and time tradeoff | Proposed funding | Decisions still needed |
| --- | --- | --- | --- |
| Shared Apparatus | Donate idle study-slot base work to one chosen active study; choose focused completion versus parallel research. Each donor is counted once; the target's paid speed does not amplify donated work. | Shards for research unlock/levels; existing project retains its own agreed currency. | Work/price/unlock/cap, donation amount, eligible slots, selection and chronology. |
| Staged Research | Prepay/reserve a future study with frozen cost/work while a slot is occupied. A reservation earns no work/level before execution, survives Ascend and is consumed once without another debit. It starts at 1x. | Shards for the exclusive unlock; each reserved project pays its agreed named currency. | Work/price/unlock/cap, reservation limit, cancellation/value return, priority and save schema. |
| Measured Inquiry (retain) | Reduce future paid study work using completed levels; preserve paid work snapshots. | Preserve existing Lumen + Shards funding unless matrix explicitly changes it. | Replacement eligible targets and treatment of existing ownership after retiring duplicates. |
| Luminous Sense (conditional retain) | Increase fixed quantity per actual Luminous kill; no random purchase or encounter duplication. | Preserve existing Lumen + Shards pending matrix. | Confirm exclusive owner versus Modules/Bonds and retain documented reward arithmetic. |

No new gameplay numbers are invented. Matrix review must provide a measured
pacing/return-on-investment rationale and exact values before implementation.

Recommended transition: stop future sales of the seven duplicate rows; preserve
earned raw ownership and separate multiplicative factors as visible legacy
entitlements associated with the matrix's chosen effect owner. Do not convert
them into another raw level or sum separate factors. Already-paid legacy studies
finish with original remaining/total work, speed and effect, then grant their
entitlement once. Derive legacy entitlement canonically from saved ownership
instead of issuing repeat refunds. Migrate queue/speed intent without starting
new spending automatically. This transition is a proposal, not an agreed policy.

## Blocking decisions and preserved contracts

UPGRADE_IDENTITY_001 must supply the accepted effect/owner/currency for every
retired or new row; exact prices/work/unlocks/caps; and the old-save value policy.
Also decide Inquiry's target set, study1/study25/allstudies Deeds and sticky
rewards, slot progression, donor/reservation event priority and cancellation.
Retiring seven Inquiry targets without replacement would reduce already-owned
Inquiry value; that cannot be silently accepted. Slots currently progress to
2/3/4/5 at depths 1/40/60/90 and must not depend accidentally on catalog size.

Keep PR46 repeat payments, study-work snapshots, manual/bulk/queue gates and
full per-level costs; new studies start at 1x, paid tiers cannot downgrade.
Completion precedes start and speed purchase at a shared timestamp; preserve
other scheduler order and declared Mote budget priority. Keep live/offline and
save/recovery deterministic. A migration must be idempotent, preserve old paid
value explicitly and survive repeat load/backup restore without double grants.
Preserve WebView60, com.lumenfall.app, signing and documented fixed Mote rewards.

## Acceptance and continuation

Proposal acceptance: current nine-row inventory, explicit duplicates, distinct
effect/time/currency proposals, unresolved design decisions, price/work and
stacking evidence; task-context/document/tooling checks; integrated GitHub task
and PROJECT_STATE status. No APK is needed for this documentation-only stage.

Full feature acceptance remains pending: agreed matrix implemented; transparent
UI at relevant mobile widths/large text, 44px controls, keyboard focus/contrast
and reduced motion; targeted manual/bulk/queue boundaries, exact chronology,
online/offline parity, active-payment preservation and idempotent save/recovery
coverage; required CI, integrated-version checks, APK/signing and necessary
device acceptance. Never reuse the old baseline-only inventory as that proof.

Current checks/publication results: see
[current verification receipt](LAB_EXCLUSIVE_001/evidence/current/check-results.md).
Old Chromium timeouts and raw artifacts remain dated evidence; they are not
passes. Self-review is not independent review. Publication/integration receipt
is appended after actual checks and merge.

Next action: finish this proposal's GitHub checkpoint, then obtain the exact
agreed Lab matrix fields above and implement only those Lab rows. Product work
and full-feature completion stay open while those decisions are missing.
