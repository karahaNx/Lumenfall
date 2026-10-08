# RIFT_GUIDANCE_001 — Stable Rift Guidance

Status: **locally verified candidate; feature remains open**.
Owner: this feature chat, “LUMENFALL — Stabil Rift Guidance”; role 03 UI / Visuals.
Shared repository writer: **not assigned**. No remote write, PR, APK or archive.
Recommended startup model/effort: GPT-6.1 Sol · High. Actual model variant and
effort are not exposed in this session; the recommendation is not run evidence.

## One goal and original requirement

Put Rift guidance immediately below currencies with Show hints/Hide hints.
Currencies, combat, Boss HP and Guardian Tap keep their position and size
across both states, long hints and enlarged text. Hidden hints cannot capture
focus or screen-reader access.

Authoritative original, preserved unchanged in the repository:

> På rift skærmen, når man fjerner rift guideline så rykker hele billedet sig, det skal være fast. Du kan sætte rift guidance boksen lige under currencies og have det som notifikation, hvor man kan vælge show hints hide hints.

Sources: [original requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F07 contract, F13/F24 dependencies and save section E](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt)
and [image/source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
None of the four original images depicts Rift; their APK/save identity is unknown.

## Baseline, isolation and writer gate

Initial shared checkout: `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`, clean.
Initial live main: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, tree
`60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`, observed about 15:10 CEST,
7 October 2026. Its product index matched the accepted product baseline
`1ddc246eb62782a61ec5c486cd5f51ea170bb338`.

Main changed during preparation. Final working baseline, observed at 15:36
CEST and fetched/rebased in the isolated clone:
**`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`**, tree
`6e18e8485111a7a5bfa2d5854ed6b9c4735282c2`.
This commit integrates offline catch-up and Node tooling; its actual Git/code
identity takes precedence over still-unupdated Draft status in the saved docs.
Baseline product blob: `90e4678cb28fa833fdacbc01d1744d9465f6a356`.
Baseline index SHA256:
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.

Private clone: `/workspace/Lumenfall-rift-guidance-001`.
Private branch: `feature/rift-guidance-001`.
The original shared checkout remains clean at its original SHA. Initial live
docs/tree/commits were hash-verified through the GitHub API; later network
fetch succeeded outside the socket-restricting command sandbox. All final
checks use the current Node tooling.

PR46 was rechecked at 15:35 CEST: open/Draft on R2
`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.
B2 tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef` remains reported by its
worker; fresh scoped Core/QA acceptance and 02_07 writer release are unknown.
02_08's own local stop is documented. Publication of another feature does
not transfer writer ownership to this chat. Existing standing approval covers
this feature's scope; the user explicitly keeps remote checkpoint/integration
coordinated with Lead. No repeated general permission is needed.

## Candidate decisions and scope

- Reserve a fixed **46px** notification directly beneath currencies on Rift.
  The persistent native Show hints/Hide hints control is **44px** high and uses
  `aria-expanded`/`aria-controls`. Only the content receives `hidden`.
- Wrap and scroll title/detail text inside a bounded **44px** hint body.
  Preserve readable full text without an overlay on combat. Omit the redundant
  type badge in the compact notification to give text room at 200% size.
- Keep the existing device preference key and Settings access. Hiding focused
  content returns focus to the visible hints control. Use `:focus` styling
  compatible with the established WebView baseline.
- Keep canonical/recovery/backup data, old purchase value, queue/bulk/payment
  logic, chronology, live/offline rewards and Luminous Motes amounts unchanged.
  No migration is needed because no game data or preference key changes.
- F13 Cast removal and F24 cosmetic visibility belong to other owner chats.
  Compare their integrated layout with this candidate at the writer checkpoint.
  Existing six cosmetics are checked here only for geometry and input safety.
- Preserve WebView 60, package `com.lumenfall.app`, Android/signing/workflows
  and deterministic purchase contracts. No balance numbers or new rules are invented.

## Acceptance and local results

1. Guidance immediately below currencies, exact labels and correct semantics:
   **local PASS**.
2. Same x/y/width/height for currencies, combat, Boss HP and Guardian Tap across
   toggle, long/normal hints and normal/200% root text: **local PASS**.
   16 profiles, 160 measurements, 320/360/390/430px; maximum toggle delta **0px**.
3. Fresh/dense/Boss/conditional Boss/Farm, safe insets, both motion settings,
   six cosmetics, 44px controls, keyboard/touch/AX and contrast: **local PASS**.
   Minimum Tap height **121px**, minimum text contrast **8.29:1**;
   80 native hint-scroll cases; hidden focus/AX exclusion and focus return pass.
4. Actual reload, Settings sync and state/save-byte purity: **local PASS**.
   The existing Rift contract passes **1,528 assertions** and NAV-001 **295**.
   Existing mobile/reduced-motion checks, source/context gates and APK identity
   verifier fixture self-test pass.
5. Regression: current unmodified main moves Tap **50px upward** and grows it
   **50px** when guidance hides. Candidate delta is **0px**. The new
   `rift-guidance-mobile` check is registered in the default behavioral suite;
   ordinary runner execution and a caught causal negative are preserved.
6. Coordinated GitHub checkpoint, scoped review, integration, integrated-version
   reruns, APK identity/signing and physical Android/WebView60/TalkBack acceptance:
   **pending; feature is not complete**.

Candidate index SHA256:
`18c4a9d82c3b6b57e815223c88d1db92640e0ed510146d0627abcbb984e1a24f`;
Git blob `166706d88645338f224ac7d573d2eec744ae9dec`.
Full raw results, screenshots, commands and limits:
[local verification](../qa/rift-guidance-001/README.md).
The complete default game suite has not been rerun locally for this UI-only
candidate; no full-suite or independent QA acceptance is claimed.

## Next action and stop

Freeze and deliver this local patch, task and TXT/ZIP evidence to Lead.
After PR46/B2 review and documented handover, assign the coordinated writer
checkpoint and publish this feature's task/code/evidence. Recheck main and
F13/F24 integration delta, obtain scoped acceptance and rerun the relevant
checks on the actual integrated version. Complete necessary APK/device checks,
save PROJECT_STATE/task/receipts in GitHub and release this scope's writer.

No shared writer was acquired or released here. The chat stays open and is
not archived while the coordinated checkpoint or any necessary acceptance is
missing. This proposal is locally reviewable; it is not an implemented release.
