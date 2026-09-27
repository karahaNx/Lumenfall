# P1-05 — Shared visual language and accessibility QA preparation

Baseline: GitHub `main` at `3d23e6faffb7123806f57bc9174b0356b2487ade` (P1-04 complete). Scope: QA preparation only. No production CSS, layout, gameplay, persistence, simulation, Android signing or progression behavior is changed by this branch.

## Purpose

This preparation gives 03 — UI / Visuals / Branding deterministic acceptance criteria for P1-05 without implementing the visual/accessibility changes on 04's behalf.

The test architecture deliberately has two layers:

- **baseline audit**: runs in the ordinary behavioral suite now, records current P1-05 semantic gaps and stays green;
- **strict P1-05 contract**: available as an explicit scenario and must become green before P1-05 is considered complete.

03 should implement against the strict contract, not weaken the contract merely to make the test green.

## Files

- `tests/behavioral/accessibility.js` — P1-05 semantic/accessibility contract.
- `tests/behavioral/fixtures.json` — mixed-state and locked-state fixtures.
- `tests/behavioral/run.py` — injects the contract, adds baseline/reduced-motion/viewport scenarios and exposes the strict scenario.
- `.github/workflows/pre-merge-validation.yml` — runs two intentional accessibility negative controls.
- This report.

## Fixtures

### `accessibility-mixed-states`

A dense, high-progression fixture containing:

- five active Wisps;
- mixed Auto-Empower states;
- mixed Research/Study queue states;
- maxed Ember Rarity and Module state;
- Auto-Ascend owned/enabled;
- a claimed Daily Quest;
- unlocked cosmetics;
- an active buff;
- insufficient secondary currencies for at least one purchase path;
- one unrecruited Wisp so an actionable progression destination can be represented.

It intentionally combines active, selected, maxed, completed and unaffordable states in one reviewable fixture.

### `accessibility-locked`

A low-progression fixture containing:

- only Ember;
- no Farm availability;
- locked Wisps;
- zero currencies;
- no automation/unlocks.

It exists to verify that locked/unavailable state is distinguishable from unaffordable or maxed state.

## Acceptance invariants

### Selected and active semantics

The strict contract requires:

- bottom navigation active state to be exposed using an appropriate semantic state such as `aria-current`, `aria-selected` or another equivalent valid pattern;
- Push/Farm selected mode to have machine-readable selected/pressed/checked state;
- Auto-Empower, Research Queue, Study Queue and Auto-Ascend toggles to expose pressed/checked state;
- Lab multiplier selection and active Study speed tiers to expose selected state.

A CSS class alone does not satisfy the contract.

### Locked, unaffordable, maxed and completed state

The contract distinguishes these categories behaviorally:

- **locked**: visible unlock requirement plus a machine-testable disabled/locked state;
- **unaffordable**: disabled purchase plus an accessible reason such as insufficient/not enough/need or an equivalent explicit `data-state`/description;
- **maxed**: exposed as Maxed/completed rather than indistinguishable generic disabled styling;
- **completed/claimed**: exposed with completed/claimed language/state.

Color/opacity alone is insufficient.

### Overlay focus

The strict contract requires custom overlays to expose dialog semantics:

- role/dialog;
- modal state;
- accessible name.

Settings additionally exercises actual focus behavior:

1. focus trigger;
2. open;
3. focus must move inside;
4. an attempted background focus must not escape the modal;
5. Escape closes;
6. focus returns to the Settings trigger.

P1-04's native Rift Details dialog retains its existing independent focus-return coverage.

### Keyboard/control semantics

The contract treats the following as interactive and therefore requires native control semantics or an equivalent keyboard-operable role/tabindex implementation:

- actionable Rift objective;
- Guardian Tap target;
- unlocked cosmetic theme choices.

Non-interactive display cards such as Formation rows, encyclopedia cards and ordinary content cards must not gain fake button semantics merely for styling.

Native `button` is preferred when the interaction is button-like because browser keyboard activation then remains standard.

### Reduced motion

The ordinary suite runs `p1-05-reduced-motion` with Chromium forced to `prefers-reduced-motion: reduce`.

It protects:

- representative animation duration collapsing to effectively zero;
- representative transition duration collapsing to effectively zero;
- tab changes still working;
- Push/Farm transitions still understandable;
- Rift Details still opening/closing;
- focus return remaining functional without depending on animation completion.

Essential state must never require visible animation to become understandable.

### Theme/palette coherence

The strict contract does not prescribe exact colors.

It protects against the current partial-theme failure mode by comparing the effective shell and Rift theme surfaces under the browser's system-light behavior. A large shell/Rift luminance split is rejected unless the implementation has made the surfaces coherent.

Primary shell and Rift text/background pairs also receive a 4.5:1 computed contrast check where the color variables are directly measurable.

Acceptable P1-05 strategies include:

- a deliberate dark Lumenfall presentation independent of system light; or
- a genuinely complete light treatment.

The contract is intended to reject a light shell around an independently hard-coded dark combat surface.

### Wisp identity consistency

The contract maps the Wisp roster's canonical `.wisp-portrait use[href="#wisp-<id>"]` identity to the first Wisp section in Encyclopedia.

Each Wisp must use the same canonical portrait identity in both places. This catches reintroduction of the old generic geometric-symbol vocabulary without pixel/screenshot matching.

### Readable essential information

`layout-accessibility-states` reuses the P1-04 exact viewport matrix:

| CSS viewport | Simulated top/bottom inset |
| --- | --- |
| 360×800 | 0 / 0 |
| 360×780 | 0 / 0 |
| 390×844 | 0 / 0 |
| 412×915 | 0 / 0 |
| 360×640 | 24 / 24 |

The existing P1-04 checks continue to protect:

- Guardian Tap region;
- HP;
- depth;
- Push/Farm;
- objective;
- readable compact labels;
- 44 px primary controls;
- navigation clearance;
- toast clearance;
- locked Rift scrolling;
- Details readability;
- exact resource inspection.

This avoids inventing a second layout framework for P1-05.

## Scenarios

Normal suite:

```sh
python3 tests/behavioral/run.py --web-root mobile/www
```

Includes:

- `p1-05-accessibility-baseline`
- `p1-05-reduced-motion`
- `layout-accessibility-states` across all five P1-04 viewports.

Strict P1-05 contract:

```sh
python3 tests/behavioral/run.py --web-root mobile/www --scenario p1-05-accessibility-contract
```

This scenario is intentionally **not** part of the default green suite while P1-05 has not been implemented. 03 should run it during implementation and make it green before final P1-05 integration.

## Negative self-tests

Two intentional failures protect the test infrastructure itself:

- `self-test-p1-05-selected` removes selected semantics from an otherwise valid synthetic tab group and must fail for selected-state loss.
- `self-test-p1-05-focus-return` deliberately leaves focus on the wrong control and must fail the focus-return assertion.

The pre-merge workflow treats both failures as the expected successful negative-control result.

## Manual Android accessibility checklist after P1-05

Browser QA cannot certify Android accessibility. After the P1-05 implementation is integrated, manually verify on an installed APK:

- [ ] TalkBack reading order follows visual/task order on Rift, Wisps, Lab, Ascend, Deeds and Settings.
- [ ] TalkBack announces the selected bottom-navigation destination.
- [ ] TalkBack announces Push/Farm selection.
- [ ] Toggle states are announced as on/off or pressed/not pressed.
- [ ] Locked, unaffordable, maxed and claimed states are distinguishable without relying on color.
- [ ] Guardian Tap has a useful accessible name/role and does not create accidental repeated activation.
- [ ] Settings, tutorial, daily/return and Rift Details enter focus predictably.
- [ ] TalkBack focus cannot move behind an open modal.
- [ ] Android Back closes the top modal first and leaves focus on a sensible control.
- [ ] Closing Settings/Details returns focus to the opener when an opener exists.
- [ ] Switch Access / hardware keyboard can reach and activate all primary controls.
- [ ] 1.3× and 1.5× Android font scaling do not hide required labels or primary actions.
- [ ] System Remove Animations / reduced-motion setting preserves all state communication.
- [ ] System light/dark appearance does not produce a partially light, unreadable shell/Rift combination.
- [ ] Color correction/grayscale still leaves selected, locked, unaffordable and completed states understandable through text/semantics.
- [ ] Touch targets remain practically usable with gesture navigation and real safe-area insets.
- [ ] No TalkBack-critical blocker exists in the five persistent navigation destinations.

## Handoff to 03

P1-05 visual implementation remains owned by 03.

04's acceptance criteria intentionally avoid prescribing exact component styling. 03 may choose the semantic implementation pattern, provided the resulting behavior satisfies the strict contract and preserves the P1-04 viewport/layout guarantees.

Do not merge P1-06 PR #14 as part of this work. P1-05 remains ahead of P1-06 in roadmap integration order.
