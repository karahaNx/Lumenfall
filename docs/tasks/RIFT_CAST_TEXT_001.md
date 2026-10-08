# RIFT_CAST_TEXT_001 — remove repeated Rift ability status

Status: **implementation prepared; integration and Android acceptance pending**.
Owner: this user-created feature chat. One goal: remove repeated visible
Cast/ability status on compact Rift Wisp cards while preserving ability names
and required programmatic status. This chat remains open until delivery.

## Original requirements and continuation

Original F13:

> På rift skærmen skal cast teksten for wisp ability fjernes, der findes progress bar som allerede viser dette.

The [original feature order](RIFT_CAST_TEXT_001_REQUEST.txt) is preserved verbatim.
On 8 October 2026 the user instructed: **“Finish the task”**. Current
[feature workflow](../project/FEATURE_WORKFLOW.md) and the
[accepted workflow replacement](../decisions/2026-10-07-feature-chat-workflow.md)
authorize this owner to complete implementation, checks, GitHub integration and
release within this scope. Historical Lead/writer handover gates are superseded;
no new general approval or separate role chat is required.

Authoritative sources read: [full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F13/dependencies/save requirements](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[image/source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original requirements take precedence over suggestions. The supplied screenshots
show other screens; none directly establishes F13 behavior or an APK/save identity.

## Baseline and isolation

- Checkout: `/workspace/lumenfall-rift-cast-text-001`, branch
  `feature/rift-cast-text-001`. The original `/workspace/Lumenfall` remains untouched.
- Current live-main baseline: `210005d0ae093d21e846bae41a9bddf25af2800d`.
  PR61 Bond text merged before F13 integration and changed the shared Rift
  assertions. Its copy/partner-ID changes are merged into this private branch;
  F13 remains six product lines in `renderRiftParty()` only. Product SHA256:
  `835e1f19c4d51025a41583786c52d8b6ff09ab11cf4afcfec4a49146f40734b3`.
  Combined code checkpoint: `3df6da597f92cc9b26e86e28fc9121c4668e9e93`.
  Full CI is required on the combined head before integration.
- Previous live-main baseline: `0e9b54c8d62a873bd48625f4a20ee18078e8a8f1`.
  Main advanced from `214d45411ce2fb420f0e4b372063811a967679b1` during CI,
  integrating PR59 Wisp upgrades and PR60 Forge text. F13 rebased cleanly and
  preserves both features. Rebased candidate before this checkpoint:
  `64f42fa57fcb36a544f7c00fe7089eda242cbcd5`. Product source SHA256:
  `567d3821ff42d492a43f75e59f098f26cf354b3007a08e7b29d8ea5128b197d1`.
- Startup rules, project state, ownership, Visuals guidance and workflow were
  read from current main. No subagents, message tools or chat renaming are used.
- PR46/B2 is now integrated through PR57, commit
  `20aaae62a4b6e46f8d75775085918eaba4e8de29`. APK 0.1.138 is the current release.
  At continuation startup there are no open PRs or observed unmerged
  Guidance/Cosmetics patches. Their render selectors/classes remain intact.
  Main integration is serialized and its current head is rechecked before merge.
- Earlier preparation baselines `b2a1f440e8ad9fed34b37551e468224310d2a6f6`
  and `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, and product/test checkpoint
  `1edc0c8d935279542fab8a1b8dd3852adff1d7a9`, are historical. Their evidence
  remains in [the QA directory](../qa/rift-cast-text-001/README.md).

## Scope and decisions

Only `renderRiftParty()` in root `index.html` changes product behavior:

- Powered cards display no repeated `CAST` or `Ready`. Unpowered `Lv 0` remains.
- The existing bar retains its Wisp/ability-name `aria-label`, range, actual
  charge and timing. `aria-valuetext` exposes `Casting;` or `Ready;` when relevant,
  without a live region. Casting status expires with the existing cosmetic marker.
- Existing portraits, passive power, Bond grouping, fill, cast/attack classes,
  VFX, Formation ability names and reduced-motion behavior remain intact.
  Compact cards had no separate visible ability name; their accessible name stays.

Existing Rift assertions cover the changed contract and all eight actual casts.
A 0.00001 percentage-point tolerance addresses fractional CSS width serialization
in those newly inspected cast states, without changing gameplay expectations.
The new focused browser check uses JavaScript/Node and temporary served-copy
instrumentation; production has no QA bridge.

No balance, rewards, currencies, deterministic purchases, bulk/queue limits,
chronology, simulation, offline policy, save schema, migration, CSS/assets,
Android package, signing or workflows are changed. Existing owned values and
Luminous Motes rewards stay intact. This presentation-only change needs no migration.
WebView 60 compatibility and package `com.lumenfall.app` remain supported.

## Acceptance and evidence

Required feature acceptance:

1. Powered uncharged/charging/ready/casting cards have no repeated visible status;
   unpowered cards keep `Lv 0`.
2. Ability names, charge, timing and programmatic ready/casting/unpowered status
   are preserved; cast expiry, eight real cast identities and observer-only
   rendering remain correct.
3. Affected mobile widths, large text, 44px controls, keyboard focus, contrast and
   reduced motion are checked, with baseline differences distinguished.
4. Relevant existing save/recovery, live/offline and chronology checks pass;
   required unmodified CI passes before integration.
5. The integrated source is verified in the signed APK with package/version/cert,
   bundled assets, native Rift behavior and in-place save-preserving update checks.
6. Supported final status/evidence is saved in this task and PROJECT_STATE before
   archiving only this owner chat.

On baseline 214d454, the focused browser matrix passes 12 profiles / 384
state observations. The default local dump-DOM contract run timed out without
any completed QA result; it is a diagnostic, not a pass. Existing assertions are
also replayed through the documented local CDP transport; normal CI remains required.

[PR63](https://github.com/karahaNx/Lumenfall/pull/63) is published. Normal
[CI37708820963](https://github.com/karahaNx/Lumenfall/actions/runs/37708820963)
passes all 146 default scenarios, 12 required negatives and guarded startup on
head `d75ac294c829ebd7d030f8565d2f94a2a99615fa` / baseline214d454.
The full raw log is preserved in [current evidence](../qa/rift-cast-text-001/finish/README.md).
After main's advancement, those results are historical; updated branch CI is
required before integration. Focused/current-baseline checks are rerun.

Normal [CI37710831478](https://github.com/karahaNx/Lumenfall/actions/runs/37710831478)
also passes 147 defaults, all 12 required negatives and guarded startup on head
`d7b01c65fe179f03c8622090512f66a1851b682d` / baseline0e9b54c. This receipt predates
the PR61 dependency merge. The combined-head gate and focused checks supersede it
for integration. No failed/cancelled or superseded run is called a final pass.

The product renderer executes correctly in 32 state fixtures on V8 6.0.286.52
(Node8.3.0), Chrome60's engine generation. Actual signed APK138 is installed on
isolated Android8.1/API27/WebView61.0.3163.98. Its repeated Ready baseline and
real persisted save are verified for the subsequent signed in-place update.
This is emulator evidence, not physical WebView60 or TalkBack acceptance.

At 200% compact Wisp text, five-member names overflow on both baseline and
candidate. This unchanged layout limitation is recorded for separate Visuals
work; F13 does not claim full large-text layout acceptance or include a broader
layout change. Browser text doubling is distinct from Android system font scaling.
Exact physical WebView60/TalkBack acceptance is not implied by modern Chromium
or a native emulator; device/runtime identities and limitations must be recorded.

## Next action

Complete current-baseline checks and self-review, publish this feature PR, require
normal CI, serialize integration, verify the resulting signed APK/native behavior,
then save the delivery receipt and shared state. Independent review is not claimed.
Missing required acceptance keeps this chat open.
