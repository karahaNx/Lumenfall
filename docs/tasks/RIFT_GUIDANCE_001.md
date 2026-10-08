# RIFT_GUIDANCE_001 — Stable Rift Guidance / F07

Status: **publication/integration in progress; APK/device acceptance pending**.
Owner: this Stable Rift Guidance chat. Isolated branch `feature/rift-guidance-001`
in `/workspace/Lumenfall-rift-guidance-001`. Shared checkout untouched.

## One goal and originals

Guidance below currencies with Show hints/Hide hints. Currencies, combat, Boss
HP and Guardian Tap keep their bounds across hidden/shown, long hints and large
text. Hidden hints cannot take focus or screen-reader access.

> På rift skærmen, når man fjerner rift guideline så rykker hele billedet sig, det skal være fast. Du kan sætte rift guidance boksen lige under currencies og have det som notifikation, hvor man kan vælge show hints hide hints.

[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F07/dependencies/save contract](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Originals stay unchanged; no original image depicts Rift.

8 October follow-up: **“Finish the feature task push to github, implement to game”**.
This authorizes scoped publication, integration and existing Android release.
[Current workflow](../decisions/2026-10-07-feature-chat-workflow.md) supersedes
the earlier global writer gate. No repeated approval, subagents/message tools
or other-chat changes; serialize actual overlapping main integration.

## Baseline, decisions and scope

7 October freeze `7c5ecf609613007c07c9bc12a417351b3ae1dd40` used main
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`. Preserve its
[task](../qa/rift-guidance-001/2026-10-08/previous-task-2026-10-07.md) and
[evidence](../qa/rift-guidance-001/README.md) as historical results.
Refreshed baseline, fetched 8 October: `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
Bring in subsequent main261b1b7 (PR77 Save Backup). Preserve its product,
registered UI checks and two new negative gates; share sourceWebRoot in runner.
Subsequent main e2f745c adds Formation autosave and Resonate clarity; merge
without removing their product or checks. Latest main receipt governs release.
Current baseline31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6 adds Auto-Ascend UI
and exclusive upgrade owners. Preserve its gameplay, migrations and gates.
PR46/B2, F13 Cast removal and F27 cosmetics/Trial status are integrated.
Open PR70 Wisp roles, PR67 feedback bundle and PR66 tree caps stay separate.

- Fixed46px notification; persistent44px native toggle with expanded/controls
  semantics. Full title/detail wraps in bounded44px scrolling content; redundant
  type badge omitted from compact view. Existing hint navigation remains.
- Keep `lumenfall_rift_guidance_hidden_v1` and Settings sync. Hiding focused
  content returns focus to visible toggle; hidden hints leave focus/AX trees.
- Preserve game data, purchased value, queue/bulk/payment, chronology, offline/
  live, rewards/Motes and main's migrations. No F07 migration needed. Preserve package
  `com.lumenfall.app`, WebView60 and established signing.
- Resolve runner conflict by retaining newer offline legacy-DOM/timeout and Lab
  viewport checks while adding F07. No existing gates removed/weakened.

Product: `index.html`. Tests: `rift-guidance.cjs`, `rift-status.js/cjs`,
`run.cjs`, `scenarios.json` under tests/behavioral. Task/evidence only beyond
that; no F13/F24/F27 product redesign or broad tooling changes.

## Acceptance and next action

Required: protected x/y/width/height at320/360/390/430px, normal/200% text,
normal/long hints and both motion settings; Fresh/dense/Boss/conditional Boss/Farm;
>=44px controls, contrast, focus/AX, native scroll, reload/Settings/save purity.
Check six themes, F27 trail/crest/visible Trial, existing Rift/navigation and CI.

Corrected-source local PASS:160 observations,96themes,48Comet cosmetics,16Trial pairs;
80touch scrolls,0px protected movement, minimum Tap121px and contrast8.30:1.
Existing Rift1,618/navigation295/F13 matrix/tooling/source/context PASS. Legacy
V8 6.0 exact scripts and23 guidance-function assertions PASS. CI37735423348
caught a320px/200% label-fit failure; preserve the assertion and correct only
toggle width/padding/line-height. The full failed log and fresh passing matrix
are in [post-ci-fix](../qa/rift-guidance-001/2026-10-08/post-ci-fix/README.md). Required CI,
integrated reruns, APK and native acceptance remain pending.
[Fresh evidence](../qa/rift-guidance-001/2026-10-08/README.md) records exact source,
commands, results and limits. No independent/physical/TalkBack pass claimed.

Publication: [PR81](https://github.com/karahaNx/Lumenfall/pull/81), head
dc0285fffba7bf2b04e9a852d9fc4359fdbb580f passed full CI37741048919:
160 defaults/14 negatives/smoke. New-main169 defaults and review fix require
fresh current-head CI. Review P1: require Tab to reach nav-spirits, with an
actual prevented-Tab negative; unchanged focus cannot pass.
Signed143 native baseline PASS on Android8.1/WebView61: cold-launch QA ownership,
Wisp levels and hidden preference verified. Upgrade/feature acceptance pending.
[Delivery checkpoint](../qa/rift-guidance-001/2026-10-08/delivery/README.md).

Next: pass required CI and merge;
rerun on integrated bytes, build/download/verify signed APK and available native
checks. Save PR/merge/build/status/limits in task and PROJECT_STATE. Stop shared
file work after scope. Missing necessary acceptance keeps feature/chat open;
archive only this chat after verified completion.
