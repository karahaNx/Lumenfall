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
- Current live-main baseline: `214d45411ce2fb420f0e4b372063811a967679b1`.
  Rebased candidate: `689390aa205fcdf6da3467117fe046ae5c378e68` before the
  continuation documentation checkpoint. Product source SHA256:
  `3f201d135b89ceb6f0c518d0094284130f958ee98e6bf20d6821b72a284205be`.
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

On the current baseline, the focused browser matrix passes 12 profiles / 384
state observations. The default local dump-DOM contract run timed out without
any completed QA result; it is a diagnostic, not a pass. Existing assertions are
also replayed through the documented local CDP transport; normal CI remains required.

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
