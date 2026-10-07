# RIFT_CAST_TEXT_001 — remove repeated Rift ability status

Status: **local candidate; unfinished feature**. Prepared on 7 October 2026.
No remote branch, PR, integration, Android build, release or writer release has
been performed by this owner chat. GitHub publication awaits a coordinated
writer checkpoint. This chat remains open.

## Goal and authoritative request

Remove repeated visible Cast/ability status from Rift Wisp cards whose resource
bar already represents ability progress. Preserve the ability name and necessary
programmatic status.

Original F13 sentence:

> På rift skærmen skal cast teksten for wisp ability fjernes, der findes progress bar som allerede viser dette.

Sources read:

- [This feature's original order](RIFT_CAST_TEXT_001_REQUEST.txt).
- [Full user original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
- [F13, dependencies and save/verification requirements](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt), sections A, F13, C and E.
- [Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
- [Findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and [source/image index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).

The four original screenshots cover Auto-Ascend, Lab and Formation upgrades;
none is a direct F13 screenshot. Their APK/save identities remain unknown.
This proposal uses the verified production rendering as its F13 baseline.

## Owner, writer and baseline

- Owner: the current user-created RIFT_CAST_TEXT_001 feature chat; role 03
  UI / Visuals / Branding. No historical chat number is reassigned.
- Recommended model/effort: GPT-6.1 Sol / High. Actual specific runtime model
  and effort are not attestable from the session; the recommendation is not an
  execution receipt.
- Private checkout: `/workspace/lumenfall-rift-cast-text-001`; branch
  `feature/rift-cast-text-001`. The original `/workspace/Lumenfall` checkout was
  only read. No subagents, message tools or chat renaming were used.
- Initial live-main baseline: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`;
  initial index SHA256 `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
- At 13:22:51 UTC / 15:22:51 Copenhagen, live main advanced to
  `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, integrating offline catch-up and
  Node tooling. The private candidate was rebased, current rules reread, and
  relevant checks rerun with the Node harness. Earlier evidence is historical.
- Validated product/test commit after rebase:
  `1edc0c8d935279542fab8a1b8dd3852adff1d7a9`. Later documentation checkpoints
  do not change these validated product/test bytes. See the evidence identity
  for exact source hashes and timestamps.
- Writer: **no shared repository writer allocation**. AGENTS and the Lead
  feedback registration require B2 review/handover and scoped coordination.
  Standing approval is retained; no new general approval is requested.

## Scope and implementation decisions

The only product change is in `renderRiftParty()` in root `index.html`:

1. Powered cards no longer display `CAST` or `Ready` as repeated visible text.
   Unpowered `Lv 0` remains a useful level/Empower indication.
2. The existing bar keeps its ability-name `aria-label`, percentage range,
   real charge value and seconds-to-next-ability calculation. `aria-valuetext`
   adds `Casting;` or `Ready;` for the corresponding state. No live region is
   introduced; status expires with the existing cosmetic cast marker.
3. Wisp portraits, passive power, Bond grouping, bar fill, cast/attack classes,
   VFX and reduced-motion behavior are retained. Ability names elsewhere,
   including Formation, are retained. The baseline does not show a separate
   visible ability name on the compact Rift cards; its existing accessible
   ability name is preserved.

Existing Rift assertions are adapted to F13 and now inspect all eight real
Wisp casts. A `0.00001` percentage-point tolerance is limited to CSS width
serialization of fractional charge; no gameplay numeric tolerance changes.
The focused browser driver is JavaScript and uses Node built-ins.

No balance, currency, rewards, buying handlers, bulk/Max gates, queue rules,
save schema, owned data, migration, simulation, offline policy, Android package,
signing, assets, CSS or workflows are changed relative to the revised baseline.
No new gameplay number or project rule is introduced. There is no save/value
migration requirement for this presentation-only delta.

## Dependencies and coordination

- PR46 was read live at startup: open/Draft, unmerged, head
  `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`. The live discussion returned no
  comments. Its green R2 CI does not accept the newer B2 bytes.
- Latest archived B2 tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index
  SHA256 `7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`,
  remains a worker candidate requiring new Core/QA reviews and documented
  02_07 writer handover. Its freeze/identity were read, not edited.
- `renderRiftParty()` was identical on the initial main baseline and frozen B2.
  The later offline integration leaves the F13 function unchanged. The patch
  must still be checked against the eventual coordinated integration bytes.
- Guidance owns its placement/toggle objective; Cosmetics owns visual effects.
  This candidate preserves their selectors, classes and render calls. Lead
  should compare their actual patches at integration. No acceptance or contact
  with those owner chats is claimed. The user transfers this handoff.
- The unrelated offline feature is inherited from the new main baseline; its
  changes are absent from the F13 patch. Its release/device acceptance is not
  asserted here. Package `com.lumenfall.app` and signing remain baseline bytes.

## Acceptance and verification

Local acceptance targets:

- No visible Cast/Ready/countdown duplication on charging, ready and casting
  powered cards; `Lv 0` remains on the unpowered renderer state.
- Ability name, actual progress, ready/casting/unpowered state and charge timing
  remain accessible. Cast state clears after its existing deadline.
- All eight real Wisp casts retain their VFX identity and reduced-motion rules.
- Repeated rendering/navigation leaves state unchanged and matches the same
  controlled ticks without observers.
- Relevant mobile widths, native keyboard focus, 44px targets, contrast,
  reduced motion, save/recovery and chronology are checked.

Evidence and exact replay commands:
[docs/qa/rift-cast-text-001/README.md](../qa/rift-cast-text-001/README.md).

The focused F13 matrix checks 320/390/430px at 844px height, normal/reduced
motion and 100%/200% Wisp name/power text. **Large-text overflow is observed**
in the five-member compact party at 200%; comparison with unmodified revised
main shows identical overflow geometry. It is a pre-existing accessibility
limitation, not full large-text acceptance. Android system font scaling and
TalkBack are not represented by this browser font-size probe. It remains for
Lead/Visuals coordination and device acceptance; no broader layout fix is
included in F13.

Final local results: F13 passes in 12 profiles (384 ability-state observations);
12 existing scoped Node scenarios pass; both F13 negative controls are caught.
Source validation, ES2017 syntax, context and APK-identity verifier self-test pass.
These are candidate checks, not integrated F13 or device acceptance. Results,
source hashes and replay commands are recorded in the evidence identity/summary.
Early dump-DOM timeout and local transport-adapter failures are diagnostics,
not passes. CDP reruns retain the existing served instrumentation/assertions;
they do not establish default CI-harness or physical Android acceptance.

## Next action and completion gate

Lead receives the TXT/ZIP handoff, resolves PR46/B2 candidate review and writer
handover, coordinates Guidance/Cosmetics, and allocates a scoped GitHub writer
checkpoint for this patch/task/evidence. Recheck live branches, open PRs,
active runs and workflow triggers before any remote writing. Do not overwrite
current shared PROJECT_STATE from this private checkout.

After coordinated integration, rerun the relevant checks on its actual commit,
resolve required large-text acceptance, build/publish the required APK through
the existing workflow, verify package/version/signing and perform necessary
Android/WebView60/TalkBack/device checks. Save the integration/release evidence,
update this task and shared PROJECT_STATE during that writer scope, and record
writer release. Only then archive this owner chat under FEATURE_WORKFLOW.

Missing acceptance: GitHub checkpoint, integrated F13 behavior, required review,
large-text/device acceptance, new APK/signing/device receipts and writer release.
