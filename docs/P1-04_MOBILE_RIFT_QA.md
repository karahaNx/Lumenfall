# P1-04 — Mobile Rift layout foundation

Implementation baseline: GitHub `main` at `b2e80654cea070be8d717d7bbee0e26b424817a1` (P1-03 complete). Scope: 03 UI / Visuals / Branding, with deterministic layout coverage in the existing behavioral harness.

## Layout contract

- The shell still uses `100dvh`. Rift Push and Farm keep the existing `rift-scroll-locked` overflow and `pan-x` touch policy. Other tabs retain their existing scrolling behavior.
- The HUD uses three `minmax(0,1fr)` columns and exactly two currency rows beneath the 44 px title/settings row. Amounts cannot create extra rows; existing `formatNum` output remains unchanged. All six currency labels remain visible. The details sheet exposes full locale-formatted balances, including amounts truncated in the HUD.
- Bounded heading, mode, objective and footer rows surround the flexible enemy region. `enemy-stage` has a **120 px minimum**, while its wrapper reserves another 36 px for HP and separation. Tested usable heights are below. This is a portrait layout contract, not an assertion that arbitrary landscape heights can fit.
- Enemy identity, HP, mode, depth, objective, Guardian Tap and the two existing combat estimates remain on the combat screen. HP is 12 px, objective title 13 px, objective detail 11 px, mode 12 px, and essential compact labels at least 10 px.
- Push, Farm, Settings, Details and Close have at least 44 px targets. Bottom navigation targets are 54 px normally and 48 px at reduced heights. Guardian Tap retains its original trusted-pointer handler, rate limit and formula; its whole region is the target.
- The native HTML details dialog contains the existing Active party, charge/power displays, Formation Bond wording, boss DPS/regen explanation, buff countdown, mode explanation and Guardian tutorial text. It also exposes the complete current objective and balances. Its body scrolls independently; Close remains outside the scroller. Native dialog focus containment, Escape dismissal and return focus are retained. A compact “Boost active” status remains visible on the Details button while boosted.
- Navigation, main spacing and toasts share `--nav-height` and the existing safe-area values through `--safe-top` / `--safe-bottom`. No native orientation, inset or lifecycle behavior changes. Toasts sit 8 px above navigation plus its bottom inset; existing last-message coalescing prevents stacking. The passive 64 px stats footer accommodates the longest current fixed toast without covering HP, Guardian Tap or mode controls. Toast text is allowed to wrap, not clipped.
- Cost icons use a shared `.85em` rule after generic art sizing. Large node artwork is restricted to direct children, preventing 30 px dimensions from leaking into nested costs.
- Rift Crystal assets, region illustrations, typography families and existing animation remain unchanged. The detailed party presentation deliberately moves out of the combat viewport; no Wisp, Formation, boss or progression semantics change.

## Deterministic fixtures and invariants

`tests/behavioral/layout.js` is injected only by the existing test harness. It is not a production asset. Exact-size iframe viewports avoid differences between Chromium window size and its usable CSS viewport; no new browser dependency or screenshot framework is needed in CI.

Three scenarios run automatically with the ordinary full behavioral command:

- `layout-fresh`: the existing empty-save fixture, Rift 1 and Ember; Farm remains unavailable.
- `layout-dense`: Rift 1229, large progression/balances, five Active Wisps, two Formation Bonds and an active buff.
- `layout-boss`: Rift 1230 boss with the same density and very large HP. Both dense scenarios exercise real Push → Farm → Push button transitions and verify the original Push depth is restored.

All scenarios additionally inject a long formatted amount into every HUD cell; verify two rows and unchanged HUD height; open, scroll and close Details; verify party/resource information and return focus; navigate through generated Wisp/Lab/Ascend purchase rows to check nested icons; and return to a locked Rift.

Assertions cover document/main overflow, attempted vertical drift, minimum enemy height, center-point hit testing of Guardian Tap, visibility/readability of mode/objective/HP, control sizes, stage/navigation separation, toast/navigation/HP separation, single-toast coalescing, and independent sheet scrolling. The longest current fixed recovery message is used for toast clearance.

## Viewport results

Settled Chromium CSS-pixel measurements are identical for fresh, dense normal and dense boss states because secondary content no longer changes the combat height.

| CSS viewport | Simulated top/bottom insets | HUD height | Minimum Guardian Tap region |
| --- | --- | ---: | ---: |
| 360 × 800 | 0 / 0 px | 129 px | 311 px |
| 360 × 780 | 0 / 0 px | 129 px | 291 px |
| 390 × 844 | 0 / 0 px | 129 px | 355 px |
| 412 × 915 | 0 / 0 px | 129 px | 426 px |
| 360 × 640 | 24 / 24 px | 145 px | 125 px |

Fresh state remains balanced around the existing enemy illustration, an explicit Guardian Tap label and the next-Wisp objective. Dense/boss content fits without sacrificing HP or the enemy target. All 15 viewport/fixture combinations pass without vertical Rift scrolling, HUD growth or toast/navigation collision. Dark-theme fresh/boss and Details renders were also visually reviewed at compact and larger portrait sizes.

## Regression and validation

Commands (after the existing workflow stages `index.html`, fonts and branding into `mobile/www`):

```sh
python3 tests/behavioral/run.py --web-root mobile/www
python3 tests/behavioral/run.py --web-root mobile/www --scenario layout-boss
# Deliberately fails: proves the layout guard detects a collapsed interaction area.
python3 tests/behavioral/run.py --web-root mobile/www --scenario self-test-layout-collapse
```

The complete suite passes: **34 existing behavioral scenarios plus 15 layout executions** (37 named scenarios). Coverage retains persistence/recovery, save/reload, boss and Farm transitions, P0-05 simulation parity, P1-02 chronological automation, and P1-03 formula/language contracts. The six existing negative controls and the added collapse negative control all reject their intentional failures.

The existing pre-merge validation remains the merge gate: source/ID/cache/lifecycle checks, JavaScript syntax, APK identity verifier self-test, complete behavioral suite, existing negative controls and guarded browser startup smoke. Workflow/release/signing files are not changed. Local browser runs used the available Playwright-driven headless Chromium runtime with the same instrumented harness; CI runs the unmodified standard Chrome command path. PR check status records validation of the final branch commit.

## Limits and handoff

Safe-area tests simulate inset values through the same CSS variables used by `env()`. They do not claim physical-device, Android WebView/Back-button or native lifecycle certification. Native verification remains with 01/04. Below the tested 360 × 640 effective viewport (including 48 px of inset loss), or with large system font scaling, additional QA is needed. Broad accessibility/theme/component consolidation is still P1-05; no later roadmap work is included here.
