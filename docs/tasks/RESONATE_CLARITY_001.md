# RESONATE_CLARITY_001 — explain Resonate (F06)

Status: **implementation verified locally; publication/integration in progress**.
Owner: this Resonate feature chat; branch `feature/resonate-clarity-001`;
isolated worktree `/workspace/Lumenfall-resonate`. No subagents or messages used.
User continuation, 8 October 2026: “Finish the feature task push to github implement to game”.
Current AGENTS/FEATURE_WORKFLOW authorizes this owner to push, integrate and
release within scope; historical Lead/writer gates are superseded.
Recommended model/effort is not claimed as verified execution metadata.

## Goal and sources

Explain the actual action: **25 Sigils fills the selected Active Wisp's ability
resource to 100 after all Ultimates are owned; three uses total per Ascension run**.
The [full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
has priority. F06: “Samt er der noget som hedder resonate på wisps som man bruger
sigils til at opgradere, det ved jeg ikke hvad er.”
Read current startup/workflow/visual guidance and targeted CONTEXT_INDEX;
original, F06/dependencies/save sections of TASK_FEEDBACK_REVISION_001,
FEEDBACK_REGISTERED_001 decisions, FINDINGS section6 and Source_Index,
original image04-17362.jpg; B2 START/identity. Source paths are recorded in
[the original checkpoint](../qa/resonate-clarity-001/local-checkpoint-2026-10-07.md).

## Baseline, dependencies and decisions

Initial local commit09216e8 was tested on main0bcce84 (7 October). Its complete
[historical evidence](../qa/resonate-clarity-001/local-evidence-2026-10-07.md) is retained.
Publication baseline, fetched 8 October: **b0537cb46635555ba2c2e5f3f95bc8fc276aeda5**.
PR46/B2 is integrated, superseding the old pending gate. Main's F04 folding,
F13/F16 text, F23 Forge and F27 Comet changes are preserved. The rebase conflict
kept main's always-rendered Ultimate row and added only Resonate explanation.
Open draft PR67 (all27 bundle) and PR70 (Wisp roles) are separate work; neither
is integrated by this task. No queued/running Actions were observed at preflight.

Code verification confirms the handler spends25, sets only the selected
resource to100, increments one shared counter, and rejects missing Ultimates,
reserve/unrecruited Wisps, full resource, insufficient Sigils and exhausted uses.
Ascend resets uses; save normalization bounds the counter to0–3. There is no
permanent Resonate upgrade, bulk action or queue action.

The action reads **Resonate — Fill ability to100**, with **25 Sigils** (actual UI
includes ordinary spacing). Associated visible text explains refill, all-Ultimate
unlock, remaining shared uses and Ascend reset; it also appears beside an owned
Ultimate before all Ultimates are owned. Constants supply price and limit.
Only CSS/Resonate markup changes product behavior. Existing purchase/economy,
Motes rewards, handlers, saves/schema, Android identity/signing and WebView60
compatibility are preserved; no migration or balance decision is needed.

## Acceptance and checks

[Current evidence](../qa/resonate-clarity-001/README.md) records exact source hashes/results.
Required checks: explicit consumption/unlock/shared limit/reset; six handler
rejections;25/99/2 boundary; three different Wisps then fourth rejection;
reload/backup/recovery/Ascend; render/save purity; native keyboard/touch;
320/390/430px at100%/200% text, reduced motion,44px controls, focus/contrast;
existing live/offline/chronology/parity checks; complete required pre-merge CI;
integrated rerun and signed APK package/assets/legacy engine checks.

Updated-baseline feature check: **PASS**,12 profiles, six rejections,
shared limit, persistence, Ascend and maxed-Wisp folding; contrast copy9.36:1/focus8.23:1.
Seven existing scenarios and three expected negative controls pass through the
recorded CDP adapter; source/context/tooling/APK-self-test pass. V8 6.0 handler,
save and Ascend checks pass. Baseline explanation fails as expected.
The check is registered as `resonate-clarity` in the default regression suite.
Modern Chromium results do not establish native WebView60 or TalkBack acceptance.
Physical Android/WebView60, device large-text and TalkBack remain required
pending checks if no suitable device is available; the feature stays open.

## Updated dependency checkpoint

Main advanced through PR77 to261b1b7f863f73c324f4ac04acb5bfc95101644d
on8 October. Save Backup gained confirmation and two mandatory negative checks.
Both features and their shared runner parameters are preserved. Combined-source
Resonate mobile/persistence/folding and the Save Backup native-browser check PASS;
13 mechanic/save/reward function bodies match new main. V8 6.0 passes again.
Full CI must now cover153 default scenarios and14 required negative controls.

## Next action

Run source/context/tooling and relevant existing checks, publish the feature PR,
wait for full required CI, serialize main integration, rerun on exact integrated
code, verify the resulting signed APK and available legacy/device checks.
Publish precise integration/release/evidence status in GitHub and PROJECT_STATE.
Archive only this chat after all required acceptance passes and shared work stops.
