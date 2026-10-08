# FORMATION_AUTOSAVE_001 — Formation autosave (F14)

Status: game integrated via PR76; signed APK145 published and native checks PASS.
Required physical-device/exact WebView60/TalkBack acceptance OPEN.
Owner: this Formation feature chat; Codex based on GPT-6, exact variant/effort
not exposed. The recommended model/effort is not execution evidence.

## Goal, originals and authorization

Immediately autosave Field/Bench and relevant recruitment changes into the
selected Push/Farm/Boss preset; remove Save. Preserve preset isolation, stored
empty presets and complete late-game intent through Ascend/recovery. Pending
members grant no power or Bonds.

Original [F14 requirement](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):

> Current formation skal laves at der ikke behøver stå save, feks når man vælger push så vælger man de wisp man vil have, så skal den auto save det uden at trykke på knappen, at det er de aktuelle wisp der gemmer til den formation.

User clarification, verbatim:

> Altså det jeg mente med det her autosave er, når man vælger den aktive formation, så skal den huske de wisps man har, selvfølgelig er der ikke en formation der starter med 0 wisps

Current instruction, 8 October 2026:

> Finish the task push to github and implement to the game

The [complete order/corrections](FORMATION_AUTOSAVE_001_REQUEST.txt) and original
supporting evidence are preserved. Original requirements take precedence.
Current instructions authorize owner delivery, GitHub integration and release.

## Baseline, scope and overlap

Private worktree `/workspace/Lumenfall-formation-autosave`, branch
`feature/formation-autosave-001`; final evidence branch
`formation/autosave-delivery-2026-10-08`. Starting main on 8 October:
`b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`, tree
`080eb52968f1861ebf76c6f5abfa1e910b036ef2`.

PR46/B2 integrated through PR57/46 at `20aaae62`. Existing offline/Lab,
Wisp/Bond/Rift and Comet fixes/legacy value handling are retained.
Overlapping PR67 autosave/Bonds and PR70 Wisp presentation remain separate.
PR77 Save Backup/confirmed restore at261b1b7 and its two CI negatives are retained.

PR76/c5fa497 matches validated head014854c3. Later main PR87/80 Save Backup/
Resonate and PR84/90 Auto-Ascend/upgrades at31eccfb are preserved. Repeat
Formation checks on that combination; see the delivery receipt for exact hashes.

Product: `index.html`; tests: `formation-autosave.js/.cjs`, six scenarios and
scoped harness updates. Preserve Lab/Comet oracle comparisons and Trial hooks.

[7 October evidence](../qa/formation-autosave-2026-10-07/README.md) is historical.

## Decisions and acceptance

- Field/Bench/recruitment save immediately to the selected preset, never another
  preset. Edit full desired intent, including pending; max5 desired slots.
  Paid/queued rebuild and Empower never overwrite intent with a powered subset.
- Fresh presets/actual party start with Ember. Stored[] survives with temporary
  Ember until explicit Field/recruitment. Never start with zero powered Wisps.
  Invalid/unavailable/sixth Field and last-chosen Bench are no-ops; pending Bench
  preserves all other intent.
- Ascend/normalize/reload/backup/recovery retain ordered intent/destination;
  pending grants no power/Bonds. No new save schema, purchase or balance rule.
- Preserve deterministic prices/paid data/rewards, queue/bulk/cadence,
  chronology/live-offline parity, WebView60, package/signing. Verify320/390/430px,
  200% text, >=44px controls, touch/keyboard/focus/contrast/reduced motion and
  render/save purity. Required CI, integrated checks and signed APK/device
  acceptance must pass with GitHub evidence before completion/archiving.

## Checks and delivery checkpoint

[Delivery receipt](../qa/formation-autosave-2026-10-08/DELIVERY.md) records exact
commands/sources/versions. Product CI37737385840 PASS158/14/all gates; fresh
integrated and later Resonate/main checks PASS18, including12 mobile profiles,
200% text/reduced motion, save/recovery and chronology. Actual APK/V8 6.0 PASS133
assertions/three causal controls plus11 Comet cases; eight-hour offline PASS.

Signed0.1.145/build37739366918: package/signing/all15 assets and526 ZIP CRCs PASS.
Actual signed143→145 native update preserves save/paid value; API27/WebView61
real touch/Ascend/pending edit/cold launch and320/390/430px checks PASS.
[Immutable APK](../../archive/android/formation-autosave-001/README.md) retained;
engine/emulator evidence is separate from physical/exact60/TalkBack acceptance.
Self-review/automation only; no independent review claim.

The delivery PR body records final checkpoint CI/integration.
Next: complete the [affected-device checklist](../qa/formation-autosave-2026-10-08/DEVICE_ACCEPTANCE.txt)
on a physical phone, exact WebView60 and TalkBack and save observed results in
GitHub. Missing required device acceptance keeps this feature/chat open;
do not archive. Shared-file work stops after the checkpoint.
