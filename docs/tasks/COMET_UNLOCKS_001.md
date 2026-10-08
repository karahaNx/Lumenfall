# COMET_UNLOCKS_001 — exclusive Comet unlocks

Status: **implementation in progress; not integrated or complete**.
Owner: this COMET_UNLOCKS_001 featurechat. No subagents or message tools.

## One goal and authorization

Replace Deeds' convenience purchases with Comet Trials and Rift cosmetics.
User direction: “Comet Trials plus Rift cosmetics (recommended)”. Latest
instruction: “Finish feature / Pust to github / Feature must work and then
implement to the game”. This authorizes implementation, GitHub delivery,
integration and the necessary app build. Current workflow has no historical
writer-handover gate. Other features remain outside scope.

Sources read: [request](COMET_UNLOCKS_001_REQUEST.txt),
[original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F27/dependencies/save revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
The [earlier detailed proposal](COMET_UNLOCKS_001_DESIGN.md) retains historical
analysis; its old writer gate and proposal status are not current rules.

## Baseline and scope

Independent checkout `/workspace/lumenfall-comet-unlocks`, branch
`feature/comet-unlocks-001`; shared checkout untouched.
Live main baseline `214d45411ce2fb420f0e4b372063811a967679b1`, tree
`1048bc22972a2b650eba73186db35bc0402ded04` (8 October 2026).
Rebased proposal `460474b9f440089e6f0017506a22f01c5eef19a0`.
PR46/B2 integrated via `20aaae62a4b6e46f8d75775085918eaba4e8de29`;
no open PRs at startup. Existing signed release 0.1.138.

Read live AGENTS, bootstrap, ownership, Gameplay, PROJECT_STATE and workflow.
Preserve chronology, Lab paid snapshots, Forge bulk/queues, formation intent,
deterministic purchases and fixed Luminous rewards. Keep WebView 60, package
`com.lumenfall.app` and signing identity.

## Decisions and dependencies

- Auto-Ascend remains 100 Comets with existing target/toggle behavior.
- Comet Trials: 140 Comets once; one pending OR active Trial. Start after the
  next Ascend, target an already-cleared Rift >=15. Quiet Guardian prohibits
  accepted manual attacks; Auto-Tap allowed. Single Star permits <=1 Active
  Wisp throughout the run, including automation/formation rebuild. Evaluate
  at the following Ascend before reset. Each type earns one permanent cosmetic
  mark; no currency/power bonus. Free cancellation/retries; no auto restart.
- Rift Trail: 50 Comets once, one optional trail slot, static reduced motion.
- Starfall Crest: 160 Comets once, one optional Guardian/Ascend crest slot.
- Equip state is independent of aura/ownership; completion marks are bounded.
- Quest Refresh requires Auto-Ascend plus Trials, retaining access for previous
  complete Rest Stop owners. Deterministic selection and >=max reward cost
  unchanged; cosmetics do not gate functional access.
- Pending scope choice: include minimal F25/F26 transition now (built-in Forge
  memory, fixed 12h including Lab, archived ownership and one-time catalog-value
  refunds), or preserve old offline entitlements until that dependency lands.
  No retirement/refund ships without this decision. Interim candidate archives
  legacy ownership and retains its effects.

## Acceptance and evidence

Required: purchase guard/duplicate/insufficient cases; Trial start/end/cancel/
failure and manual-vs-auto distinction; party/rebuild/automation; live/offline
whole/split chronology; old/current/recovery/backup saves and idempotent value
preservation; reset; Quest Refresh; 320/390/430px, 200% text, >=44px controls,
focus/contrast/reduced motion. Run required CI; verify integrated behavior and
APK package/version/certificate/assets. Required exact WebView 60/device
acceptance keeps the feature open if unavailable.

Baseline `p2-endgame-currency-utility`: Chromium 151.0.7922.173 timed out with
zero QA assertions. `about:blank` also times out in this environment, including
the allowed unsandboxed attempt. This is not a game assertion failure or PASS.
Raw evidence currently `/workspace/comet-implementation-checks/`; copy durable
evidence at the test checkpoint. Source syntax validation PASS. Other checks
and new focused coverage are in progress.

Changes so far: `index.html`, this task, historical design copy. No remote
product writes yet. No APK/device completion or independent review claimed.

## Next action

Finish focused gameplay/save and UI coverage; resolve pending legacy scope.
Publish candidate, run required CI, review full diff, integrate serially and
verify signed app. Keep the chat open until required acceptance is complete.
