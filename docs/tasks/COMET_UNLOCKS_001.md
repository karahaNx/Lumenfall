# COMET_UNLOCKS_001 — exclusive Comet unlocks

Status: **catalog candidate passed full CI; combined-main CI, integration and
required device acceptance pending**.
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

Rebased onto subsequent live main `0e9b54c8d62a873bd48625f4a20ee18078e8a8f1`
after PR59/60 (Wisp display and Forge text) landed. The only conflict was
scenario registration; retain both Wisp and Comet checks. Product candidate
`f3296003c71346ff589d67234ff89bb19f739ecc` is based on this integration.

Combined subsequent main `20efc396a5307560bafa4b2e7d4c9f11bf2b35b4`
(Bond text and Lab/Forge proposal receipts). The encyclopedia conflict keeps
both the new Comet utility description and the integrated Bond role wording.
Preserve all incoming tests and documentation; no other owner's files are
edited for this feature.

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
- Current catalog scope preserves old offline entitlements until F25/F26 lands,
  following the original requirement to keep this chat's goal separate. An async
  question offers broadening to the minimal full transition (built-in memory,
  fixed12h including Lab and catalog-value refunds); no answer has arrived.
  Integration of the verified new catalog is authorized by the user's finish
  request. Retirement/refunds remain excluded until explicitly resolved.

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
Root cause established with a tiny HTML probe: browser navigation returns
`net::ERR_BLOCKED_BY_ADMINISTRATOR`. No policy changes or gate bypasses.
Supplementary in-memory HTML preview (embedded local fonts, storage shim)
checks native input, focus, geometry and text scaling; it does not establish
real browser storage, HTTP startup, Android or WebView60 acceptance.

Evidence: [11 focused cases](../qa/comet-unlocks-001/implementation-core.json),
[existing long-offline regression](../qa/comet-unlocks-001/implementation-offline-core.json),
[source](../qa/comet-unlocks-001/implementation-source.log),
[context](../qa/comet-unlocks-001/implementation-context.log),
[tooling](../qa/comet-unlocks-001/implementation-tooling.log). These passed;
tooling required the allowed unsandboxed run for executable subprocess fixtures.
APK verifier self-test passed. The long-offline result predates the PR59/60
rebase; full CI must recheck the combined candidate.
Full pre-merge CI [run37711556550](https://github.com/karahaNx/Lumenfall/actions/runs/37711556550)
passed on `efb5bc97ff1cb58d63342dfc42319579510c1ebb`: all150 default scenarios,
required negative controls, tooling, identity self-test and browser smoke.
Product source SHA256 `7771f36a0b111c5dd229a686783c125a404c2992fd081064ac2f1a106303c4d6`.
This precedes the latest Bond combination; rerun all gates on the combined head.
The [implementation evidence](../qa/comet-unlocks-001/IMPLEMENTATION.md) records
12 supplementary mobile/text/motion profiles and their strict limitations.

Changes: `index.html`, focused core/native UI checks and their registration,
explicit additive-save assertions in the existing offline/endgame checks,
task/request/design and evidence. GitHub: [PR69](https://github.com/karahaNx/Lumenfall/pull/69),
attached to this chat. No main integration, APK/device completion or independent
review claimed. Current overlapping drafts include Ascension caps (PR66), a
broad feedback candidate (PR67) and Wisp roles (PR70). Do not absorb their scope;
recheck main and serialize integration. Full offline retirement/refunds remain
outside the current catalog integration until the dependency decision arrives.

## Next action

Push the combined candidate and run required CI. Review the full diff, integrate
serially, verify integrated checks and the signed published APK, then save a
delivery receipt in this task and PROJECT_STATE. Keep the chat open while
required device acceptance or the wider F25/F26 transition remains incomplete.
