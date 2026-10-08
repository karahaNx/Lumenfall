# WISP_UPGRADE_DISPLAY_001 — unfinished Wisp upgrades stay open

Status: **local candidate verified; feature incomplete**. No remote publication,
main integration, APK build/release, device acceptance or chat archival by this
owner. GitHub publication awaits a coordinated Lead writer checkpoint.

## Goal and authoritative sources

F04 only: remove the ability to fold unfinished Wisp upgrades. Folding becomes
available after Mythic rarity, the authoritative Module cap and an owned Ultimate
are all complete. Uncapped Empower and consumable Resonate do not contribute to
the predicate. Missing currency or a purchase prerequisite does not make a Wisp
complete or hide its unfinished purchase controls.

Original user requirement, preserved without translation:

> Wisp skal ikke have den mulighed for at have pil ned, kun når alt er maxed ud på en wisp, så må man gerne kunne skjule dens upgrades.

Sources read:

- This chat's full original mandate: `WISP_UPGRADE_DISPLAY_001_REQUEST.txt`.
- `docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt`
- F04, implementation dependencies, save transition and verification sections in
  `docs/recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`
- Concrete F04 decision, sequencing and old-save policy in
  `docs/recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt`
- `docs/recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt`
  and `FEEDBACK/Source_Index.txt`; original image 4 at
  `FEEDBACK/ORIGINAL/IMAGES/04-17362.jpg` was visually inspected. Its APK/save
  version is unknown; it illustrates the unwanted disclosure, not current accept.
- Live main `AGENTS.md`, bootstrap, own ownership row/03 Visuals role,
  `docs/PROJECT_STATE.md`, feature workflow, CODEX_START and targeted context index.

The original and Lead decision take precedence over suggestions in TASK. Module
cap is 20 and Mythic is rarity index 5 on the inspected product; implementation
reads `MODULE_MAX_LEVEL` and the existing rarity catalogue rather than inventing
a balance rule. No new gameplay/design decision or project rule is introduced.

## Owner, scope and writer boundary

Owner: this feature chat, “LUMENFALL — ÉN FEATURECHAT: Wisp-upgrades åbne indtil
maxed”; expertise: 03 UI / Visuals / Branding. No other chats renamed, messaged,
created or archived; no subagents used.

Recommended startup model/effort: GPT-6.1 Sol / High. This runtime identifies the
agent as Codex based on GPT-6; its exact model variant/effort is not exposed and
the recommendation is not an attestation of the running model.

Private checkout: `/workspace/Lumenfall-WISP_UPGRADE_DISPLAY_001`.
Private branch: `feature/WISP_UPGRADE_DISPLAY_001`. This is a separate Git clone;
the original `/workspace/Lumenfall` checkout was only read.

The user authorized private analysis, candidate preparation and relevant checks.
The standing approval does not remove the one-writer/handover gate. No product
writer or remote checkpoint writer has been assigned to this owner. Stop at this
local handoff until Lead supplies the coordinated checkpoint/integration mandate.

Product changes are limited to `index.html`:

- Pure `wispUpgradesMaxed(id)` reads rarity, Module level and Ultimate ownership.
- Unfinished progression uses a labelled, permanently visible section with a
  heading. It has no native disclosure, arrow or keyboard fold control.
- Complete progression uses native details/summary, with at least 44px targets.
  It remains open at the final purchase; the player can then fold it. A chosen
  fold survives ordinary render refreshes. An incomplete restored state discards
  stale folding and remains open. Folding is presentation-only and not saved.
- Module/Ultimate prerequisites and currency shortages are shown as existing
  disabled purchase controls, with “Recruit first”/“Mythic required” where needed.
- Focus stays on the same Wisp after its final Module/Ultimate purchase or a
  complete-to-incomplete restore. The heading/summary supports larger rem text.

Tests: update only the superseded disclosure expectation in
`tests/behavioral/runner.js`; add `wisp-upgrades.js` and the standalone Node/CDP
gate `wisp-upgrades.cjs`. No changes to signing, package, workflows, arithmetic,
purchase handlers, bulk/queue rules, Resonate semantics or save schema.

## Exact baselines and dependencies

Initial live main: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, tree
`60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`. Product/test/mobile/workflow bytes
then matched released-product source `1ddc246eb62782a61ec5c486cd5f51ea170bb338`;
initial index blob was `ea44431c163569548973d9e489f75345749a07ee`.

During work, live main advanced to
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` (observed 7 October 2026, about
15:29 Copenhagen). It contains OFFLINE-CATCHUP-001 and active Node tooling.
The private branch was advanced to this baseline; Git carried the scoped test
change from the retired `run.py` into `runner.js`. The candidate was retested on
this baseline. No offline/tooling changes from that other feature are authored
by this candidate. The saved PROJECT_STATE still says PR51 is unintegrated;
the observed main commit/code takes precedence over that stale status wording.

PR46 checked at startup and again before handoff: **open/Draft**, head
`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d` (R2), not merged. Its CI does not
accept B2. New B2 identity was read from `START_HER.txt` and
`docs/handoffs/02_08/2026-10-07/SUMMARY/identity.json`: tree
`758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index SHA256
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Worker PASS is reported evidence; new scoped Core/QA acceptance and 02_07 writer
handover remain absent in the inspected state. F04 is not added to PR46.

Lead sequencing remains PR46/B2 acceptance/handover first, then F20/F21 before
MOBILE-CLARITY integration. Parallel private preparation is permitted. No
arithmetic, effect-cap, offline-policy, formation, Resonate explanation or global
balance work is part of this feature.

## Acceptance and local results

Final local evidence is under `docs/qa/wisp-upgrade-display-001/`. `identity.json`
records the final base/tree, product/test hashes, timestamp and tool versions;
`MANIFEST.json` hashes the evidence. These are local proposed checkpoint files,
not evidence of publication or main acceptance.

| Criterion/check | Local result |
| --- | --- |
| All eight combinations of three finite tracks across eight Wisps, funded/unfunded | PASS; 128 fixtures per profile |
| Unrecruited Wisp and level-/rarity-gated controls stay visible and disabled | PASS |
| Authoritative Module-cap dependency, uncapped Empower, exhausted Resonate | PASS; cap mutation is test-only and restored |
| Actual final Module/Ultimate purchase, exact existing price debit, same-Wisp focus | PASS |
| Fold/refresh are pure observers; incomplete restore discards stale fold | PASS |
| Canonical, recovery and backup preserve purchase/level/currency/schema data | PASS |
| 320/390/430px × normal/200% root text × normal/reduced motion | PASS; 12 profiles, 12,804 assertions; no horizontal progression overflow, controls ≥44px, native Enter and focus outline |
| Existing hierarchy, QoL/bulk/automation, Wisp pricing/roles/formulas, accessibility/layout, live/offline parity, chronology, backup/recovery/lifecycle | PASS; 20 existing scenarios through the active harness instrumenter via CDP |
| All 12 workflow negative controls | Caught at their intended assertion/runtime error; deliberately nonzero exit |
| Unchanged final baseline under the new F04 gate | Rejected at “fold available iff all three tracks complete”; deliberately nonzero exit |
| Context check, source/ID/lifecycle syntax gate, APK identity verifier self-test, Node tooling checks | PASS |
| ES2017 parsing of both production script blocks | PASS with Acorn 8.15.0; syntax evidence only |
| Heading contrast | Conservative existing-card gradient/tint estimate ≥5.46:1; existing accessibility acceptance reports no findings |
| 15 purchase/economy/chronology/persistence functions vs final baseline | Byte-identical; hashes in `unchanged-contracts.json` |

Browser: Chromium 151; Node: 24.19.0. Scope UI checks pause periodic simulation
in the throwaway instrumented page; existing engine/lifecycle assertions use
the production Node harness instrumenter. No test bridge enters product HTML.

The regular `run.cjs --scenario p2-02b-wisp-hierarchy` browser CLI timed out with
no completed QA result. That failed result and raw output are preserved separately.
The earlier Python aggregate likewise timed out/aborted during profile cleanup.
The CDP pass is separately labelled; no default full-suite or ordinary CI PASS is
claimed. Initial-baseline diagnostics are not acceptance of the final baseline.

No migration is needed: no ownership, raw level, paid snapshot, currency, schema
or save path is altered. The existing canonical/recovery/backup policy and
Luminous Motes contracts remain in the unchanged code. Package
`com.lumenfall.app` and signing files remain untouched. Physical WebView60,
Android/TalkBack, signed APK and independent Core/QA acceptance remain pending.

## Reproduce and next action

Run from the private candidate repository:

```sh
node tests/behavioral/wisp-upgrades.cjs --evidence /tmp/wisp-f04
node scripts/codex/check_context.cjs
node scripts/ci/validate_source.cjs
node scripts/verify_apk_identity.cjs --self-test
node tests/tooling/run.cjs
```

The exact existing scenario/negative commands are in the evidence README and
`validation.json`; `--existing` imports the active harness instrumenter and
assertions. It is an alternate browser transport, not a claim that the ordinary
CLI succeeded. At writer checkpoint, investigate/resolve the environment's
ordinary browser timeout and run the required normal CI gates on the exact head.

Next: Lead verifies fresh main/branches/open PRs/active runs and writer state,
finishes the PR46/B2 prerequisites and issues the scoped checkpoint. Publish
this task, candidate and raw evidence to GitHub in that checkpoint; rebase/review
if dependencies changed. Then integrate, rerun the concrete F04 behavior and
required gates on the integrated head, perform the relevant signed APK/device
checks, update PROJECT_STATE and this task, release this feature writer, and
archive only this owner chat. No generic approval is requested again.

Integration PR/commit: none. APK/run/device acceptance: none. Writer release:
not applicable yet; no shared writer was acquired. Chat remains open because
required integration and app acceptance are incomplete.
