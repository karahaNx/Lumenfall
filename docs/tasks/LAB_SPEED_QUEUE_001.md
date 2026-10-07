# LAB_SPEED_QUEUE_001 — Lab speed queue (F12)

Status: **local proposal and scoped B2 evidence prepared; feature unfinished**.
Owner: the current “LUMENFALL — ÉN FEATURECHAT: Lab speed queue” chat;
Gameplay / Progression. Feature branch: `feature/LAB_SPEED_QUEUE_001`, private
checkout `/workspace/Lumenfall-LAB_SPEED_QUEUE_001`. No shared-checkout edits.
Model exposed by the session: Codex based on GPT-6; exact variant and effort
are not exposed. Requested startup recommendation: GPT-6.1 Sol / Extra high;
this is not a claim about the model or effort actually used.

## One goal and original requirements

Save the exact selected speed tier independently of the next-Lab queue. Every
new paid level starts at 1x and pays the full selected existing tier price when
affordable. If only the Lab start is affordable, continue at 1x and retain the
speed intent. Verify offline, restart, Ascend and competing Studies.

The complete current order is preserved in
[`LAB_SPEED_QUEUE_001_REQUEST.txt`](LAB_SPEED_QUEUE_001_REQUEST.txt).
The original player feedback has precedence over proposals:
[`USER_REQUIREMENTS_2026-10-07.txt`](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
Relevant original passage:

> Speed up skal have en knap hvor man trykker også skal muligheder komme frem på skærmen, hvor man også kan vælge at queue speed up, så den bruger motes mens man er offline og ikke behøver miste sin speedup, når man har råd til den valgte speed up, når man har råd til selve lab queue og ikke speed up queue så fortsætter den bare med alm 1x speed.

Contract: F12 and relevant Lab/save sections in
[`TASK_FEEDBACK_REVISION_001.txt`](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
Lead decision: priority 0 and MOBILE-CLARITY/F12 in
[`FEEDBACK_REGISTERED_001.txt`](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
Evidence/context: FEEDBACK `Source_Index.txt`, `EVIDENCE/FINDINGS.txt`, and
original image `03-17363.jpg` (viewed; APK/save identity unknown).

## Writer and baseline

The user authorizes isolated local preparation. No remote writer has been
assigned to this chat. The current rules require one repo-writer, scoped Lead
handover and B2 acceptance before new product work. Existing standing approval
does not prove 02_07's writer release. That release remains unknown in current
status; 02_08's own frozen local stop does not release another writer.

Observed 7 October 2026, Copenhagen time (CEST):

- Initial environment checkout: `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
- Live main at 15:10: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`,
  tree `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`.
- Main moved during startup. Private feature branch now starts from
  `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
  `6e18e8485111a7a5bfa2d5854ed6b9c4735282c2` (PR51 offline/Node tooling
  integration). Current main has no `studyUseMotes` or `studySpeedTargets`.
- PR46 remains open/Draft, R2
  `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, separate from this task.
- Frozen B2 restored separately at `/workspace/Lumenfall-LAB_SPEED_QUEUE_001-b2`:
  tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index SHA256
  `7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
  All 96 source hashes were checked again after tests and remain unchanged.
- Accepted APK reported by project sources: 0.1.133, `com.lumenfall.app`,
  run `37363152517`. This does not prove acceptance of either current main's
  offline change or the frozen B2 candidate.

Startup read current AGENTS/bootstrap, ownership/Gameplay, PROJECT_STATE,
FEATURE_WORKFLOW, targeted CONTEXT_INDEX, original feedback, F12/save sections,
Lead decisions and the B2 START/identity/original payment mandate. Fresh remote
observations and baseline receipts are in `../qa/lab-speed-queue-001/`.

## Local conclusion and scope

**No additional F12 product patch is proposed before B2 acceptance.** B2 already
implements the requested separation and full-price payment contract. Reuse
that implementation after its exact-candidate reviews and integration; do not
create another payment system. This proposal adds only the task, original
order, scoped evidence, a local JavaScript review driver and a Lead statusdelta.
No prices, rewards, caps, currencies, gameplay curves, Android/signing or
workflow files change.

The authoritative maps are `studyQueue`, `studyUseMotes`, and
`studySpeedTargets`. Paid `activeStudies[].speedMult` is separate. Existing
tiers/prices are 1.5x/14, 2x/26, 3x/60, 4x/110, 5x/176, 6x/258, 7x/357,
8x/473 Motes, observed in B2 code and independently asserted by existing tests.
Each `commitStudyStart` creates a 1x work snapshot. `simulationBuyStudySpeeds`
pays the exact target after due completions/closures and new starts. Shared
Motes use LONG_STUDIES declaration order; Study starts keep their existing
start priority. Visual sorting does not decide spending.

Missing maps on old saves default to OFF; a valid paid tier may seed the
remembered target. Strict booleans/known IDs/allowed numeric tiers are required;
normalization is pure and idempotent, with no debit. Paid snapshots and raw
ownership remain intact. No new migration/refund/schema is proposed here.
No new design numbers or rules are needed for this scoped F12 contract.

F11's speed dialog and F08–F10's Lab layout are other owner scopes. This review
does not accept their implementation. At 200% text, the 320px native select can
shorten the option suffix; selected tier/price stay visible and the native
option retains its full label. No claim of whole-app large-text/device accept.

## Acceptance and local results

All results below are on frozen B2, **not an integrated F12 version**.

| Requirement | Evidence / result |
| --- | --- |
| Independent next-level queue, Motes ON/OFF, exact selected tier; manual start | `lab-motes-contracts`: PASS, 82 assertions, all eight exact prices |
| Full repayment per new level; only-start budget uses 1x; retained intent | Same contract assertions: PASS; no free carry, fallback or duplicate debit |
| Change target, paid same/higher tier, OFF after payment, invalid handler inputs | Same contract assertions: PASS |
| Competing Studies, catalogue priority vs reversed active order | Contract and chronology assertions: PASS |
| Live/offline whole/split, before/exact/after actual Luminous reward; work timing | `lab-motes-chronology`: PASS, 101 assertions, raw timelines preserved |
| Completion/start/cap/buff/reward/Ascend collisions; existing study-only policy | Chronology assertions: PASS; no retroactive work |
| Reload, backup restore, canonical recovery, Reset; paid work/intent through manual Ascend | Four unchanged persistence scenarios: PASS; auto-Ascend in chronology PASS |
| Old/malformed saves, pure idempotent normalization, known IDs, strict booleans | Contract assertions: PASS |
| Capped/overcap/locked/closed/unknown Studies cannot spend | Contract assertions: PASS |
| Render/save purity, quiet scarcity, focus and accessible state | UI and native touch/keyboard scenarios: PASS |
| Mobile 320/390/430px; minimum 44px controls; reduced motion | UI (47 assertions each) and both existing native drivers: PASS |
| 200% text, horizontal fit, visible 2px focus, named 44px controls, text contrast | Additional measured browser checks at 320/390/430px: PASS; screenshots/raw colors retained |
| Causal controls: cheaper fallback, free carry, batch-end spending | Three existing mutants rejected, restoration rechecked: PASS |
| Current-main context/archive integrity | Node context check PASS: 21 entrypoints, 24 links, 1509 archive checks, 96 B2 sources |

The CDP report is `../qa/lab-speed-queue-001/raw/cdp/review.json`.
Command: `node docs/qa/lab-speed-queue-001/review.cjs <restored-B2> <out-dir>`.
New orchestration is JavaScript. The frozen historical B2 Python staging helper
is invoked unchanged to preserve its instrumentation; it is not installed as
current tooling or edited. Existing native drivers used the frozen delivery's
runner. Chromium 151 / Node 24.19.0 are modern host checks, not WebView60 or
physical Android proof.

Failed attempts remain in the raw evidence: sandbox socket denial; two
`--dump-dom` timeouts without completed QA results (also reproduced on current
main); initial CDP reload-context race; initial computed `color(srgb ...)`
contrast parsing error. The final driver handles reload loss narrowly and
parses sRGB units correctly. Only final complete results count as PASS.
Initial network approval-review had an internal error; later authorized fetch
and loopback/browser runs succeeded. No unresolved auto-review blocker remains.

## Dependencies, next checkpoint and remaining accept

1. Lead obtains fresh Core/independent QA acceptance of the exact B2 candidate
   and documents the earlier writer/process handover. This F12 evidence is
   supplemental owner verification and does not substitute for those reviews.
2. Reconcile B2 with current main's cooperative, detached offline scheduler
   and Node tooling. B2 predates PR51; its fulltree must not replace current
   main. Integrate payment events into that scheduler and renew relevant
   chronology, persistence, interrupted/retried offline and economy checks.
3. At a coordinated writer checkpoint, publish this local task/originals/
   evidence/statusdelta to GitHub, preserving the separate feature scope.
   Recheck live branches, PRs, active runs and workflow triggers before writes.
   No F12 PR/remote commit or main edit was made by this chat.
4. After B2 acceptance/integration, compare F12 against the integrated version.
   If no gap remains, close this goal by evidence; if a gap exists, prepare only
   that delta under the assigned writer scope. Run relevant integrated gates,
   complete required APK/package/signing/WebView60/Android/TalkBack checks,
   and save their exact version/results and final status in GitHub.
5. Release only this scope's actually assigned writer, then archive only this
   owner chat under FEATURE_WORKFLOW. No archive is performed now.

Current status: **unfinished, awaiting coordinated dependency acceptance and
GitHub checkpoint**. Local preparation is frozen at the delivered commit/tree
listed in the handoff receipt; this chat never acquired remote writer, and
cannot release 02_07/02_08 or any other chat. No other feature is taken over.
