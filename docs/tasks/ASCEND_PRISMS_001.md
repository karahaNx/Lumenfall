# ASCEND-PRISMS-001 — F05

Status: approved fix; publication/integrated acceptance in progress, not complete.
Owner chat:01_ASCEND_PRISMS_001,01a11671-0a13-755b-9b2b-83cb96f6a044.
Updated8October2026. Goal: understandable Ascend rewards and preview/payout parity.
[Verbatim requirements/follow-ups](ASCEND_PRISMS_001_REQUIREMENTS.txt),
[approved decision](../decisions/2026-10-07-ascend-prisms-rounding.md),
[full QA/provenance](../qa/ascend-prisms-001/README.md),
[workflow](../project/FEATURE_WORKFLOW.md). Standing scope approval applies.
User says finish/push and notify when complete so they can archive; no auto-archive.

Original sources:docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/
USER_REQUIREMENTS_2026-10-07.txt; FEEDBACK/TASK_FEEDBACK_REVISION_001.txt
(F05/dependencies/save/review); FEEDBACK/EVIDENCE/FINDINGS.txt,formula_probe.cjs,
formula_probe_results.json; DECISIONS/FEEDBACK_REGISTERED_001.txt.
Original archives stay immutable; F01–F03, unrelated offline bugs/caps/rebalance
are separate tasks. Preserve their integrated changes; no save migration.

## Baseline and implementation

APK133/main index blob ea44431c163569548973d9e489f75345749a07ee matches feedback.
Historical hashes/receipts remain in QA. PR46/B2 is merged; current workflow
removes historical writer releases as global gates. No subagents/chat messages.
Latest reconciled main:14d5f3a (PR81/92), fetched8October. Worktree:
/workspace/Lumenfall-f05-implementation; branch:feature/ascend-prisms-001-live.
Preserves Auto-Ascend, Formation, Backup, Resonate, Lab/Wisp/Forge/Rift changes
and all current tests/CI gates. PR94 is open. QA receipts distinguish b0537cb,91decbc and latest14d5f3a.
Changed:47-line index patch; one behavioral module/registration/five causal
negatives; scoped AGENTS/context/state, task/requirements/decision/QA evidence.

Confirmed old bug:cleared16/benchmark15/Lab0 pays2 at Swift0 but1 at Swift1.
Approved:unrounded depth-curve difference with current Tree/completed Lab
bonuses, rounded up once. Preserve first,20%repeat,minimum1,full cap and saves.
No automatic+1 per purchase. Canonical breakdown serves preview/manual/auto.
Player text shows cleared depth/base/bonuses/completed levels/full/benchmark/
repeat/new-depth/rounding/exact-now. Ascend action precedes calculation details.

## Report boundary

User:APK133; encounter220 boss uncleared; earlier fast+50 around20–30; about90%
Forge and70%Tree. Exact save,current cleared progression,saved benchmark,Swift/
completed Lab levels unknown. Uncleared220 establishes at most cleared219,
not the reward benchmark. Forge has no Prism multiplier here; Swift4% and
completed Lab Clarity5% per level apply. Tree17/18+Lab18 are hypotheses only.
Synthetic cleared20/benchmark219 first/repeat:none8/1,Tree17only15/3,Lab18only16/3,
both28/5;Tree18Lab18 gives29/5,Lab19 still29/5,Lab20 gives30/6. Bonuses work;
whole-Prism rounding hides small purchases. User save/+50 remains unreproduced.

## Acceptance, evidence and next action

Required:equal-depth none/Tree/Lab/both;first/repeat/new-depth/unlock/thresholds;
actual preview/manual/live/offline parity;farm/boss-clear;pending/completed Lab
and timestamp order;reload/backup/recovery;phone/font/motion;current full CI;
integrated verification,signed APK identity/assets and relevant native/legacy.
Self-review is not independent review. Physical WebView60/TalkBack not attested.

Historical passes/failed baseline wrapper are retained in QA. At91decbc:
673motorcases/11,822assertions,695layout,4permanent contract/persistence
scenarios,22required negatives/smoke and V8 6.0(168/2,215)PASS. No full
local-wrapper pass claimed; prior offline UI timeout reproduces on unchanged
main. Native signed142 cold restart preserves100Prisms/benchmark219/Tree17/
Lab18; target update acceptance pending. Redundant DOM snapshots omitted
after automatic approval rejection; original hashes/readable receipts retained.

Next:finish combined-main checks;PR94 exact-head CI;merge;
integrated checks;signed APK digest/package/version/certificate/all15assets;
available native/legacy acceptance;save final status/evidence in GitHub.
PR94/current-head CI and integration/build/native receipts pending. Native helpers bind actual
installed APK/source and restrict fixtures to a disposable emulator. Keep chat
open until required acceptance passes; notify user honestly before archiving.
