# P1-05 — Shared visual language and accessibility implementation

Baseline: GitHub main `2c13afb01be59e13acea46ef3333341ca5bdfcb0`. Scope is 03 presentation and control semantics. P1-06 draft PR #14 is not changed or merged.

## Production changes

- One intentional dark palette and dark color-scheme replace the partial system-light shell. Rift surfaces inherit shared text/resource tokens; existing Rift Crystal assets, regions, fonts and combat layout remain.
- Shared control states expose `data-state`: available, selected, locked, unaffordable, unavailable, maxed and completed. Locked cards retain visible unlock requirements and expose their locked/disabled state without becoming controls. Resource shortages say which currency is needed; full Study slots remain distinct from insufficient resources. Maxed Modules, completed Deeds, owned purchases and claimed Quests use explicit text.
- Disabled controls retain readable contrast instead of fading the whole control. Selection uses an inset outline plus existing ON/OFF, Equipped, underline or checkmark cues. Selected Lab multiplier and Study-speed controls use readable dark fills. Inline currency icons have accessible names, included in purchase-button labels.
- Navigation exposes `aria-current`. Push/Farm, automation queues, Auto-Ascend, Lab multiplier and current Study speed expose pressed state. Lower acquired speed tiers remain disabled and say Unlocked; only the actual current speed is selected. Purchase eligibility and speed-up mechanics are unchanged.
- Guardian Tap is a native button. Trusted pointer-down still applies the original hit immediately. Native keyboard/assistive clicks enter the same trusted-event/rate-limit gate only when they are not the duplicate pointer click. Held-key repeats are suppressed; damage, timing, Auto-Tap and boss modifiers are unchanged.
- Actionable Rift objectives gain button role, focusability, an accessible name and Enter/Space activation. Informational objectives do not masquerade as controls. Unlocked cosmetic choices are native pressed-state buttons; ordinary cards remain informational.
- Encyclopedia uses the same canonical Wisp portrait symbols as the roster and Active party.
- Settings, tutorial, return and daily overlays share focus entry, inert background, Tab/Shift+Tab containment, Escape dismissal through existing continuation handlers and return focus. Settings subviews and reset confirmation move focus to a visible control. Startup retains its existing timers/continuation and now has modal semantics and an operable Skip intro button. Native Rift Details retains its existing behavior and yields to a new return overlay if necessary.
- Live control re-rendering restores focus to the corresponding control, or a sensible available control if the previous one becomes disabled. The existing affordability refresh also refreshes visible/semantic reasons so stale “Need” labels do not survive a balance change.
- Necessary shared controls have 44 px target heights, including queue controls and modal close/back controls. Existing reduced-motion styles remain active. Toasts announce as polite status messages.

No combat formulas, progression, save schema, Wisp language contract, simulation, native orientation/signing, artwork or release workflow changes are included.

## QA contract and regression gate

04's `tests/behavioral/accessibility.js`, prepared fixtures and P1-04 `layout.js` are unchanged. The strict P1-05 contract is promoted from opt-in preparation to the default suite. It is not weakened or replaced by the baseline audit.

Supplementary `accessibility-controls.js` checks gaps beyond the prepared contract:

- toggle semantics agree with actual gameplay state after activation;
- focused controls survive their own re-render and a later live refresh;
- affordability reasons transition both ways as balances change;
- acquired Study speeds stay disabled, only the current tier is selected, and completed Studies cannot leave stale speed controls actionable;
- selected multiplier and speed text have at least 4.5:1 contrast;
- Settings focus wraps in both directions, subviews move focus correctly, and tutorial Escape returns focus;
- synthetic/untrusted Guardian events cannot deal damage.

Measured selected text contrast: multiplier **10.82:1**, Study speed **10.86:1**.

Commands after normal web-asset staging:

```sh
python3 tests/behavioral/run.py --web-root mobile/www --scenario p1-05-accessibility-contract
python3 tests/behavioral/run.py --web-root mobile/www --scenario p1-05-control-regressions
python3 tests/behavioral/run.py --web-root mobile/www
```

The default suite now includes 42 named scenarios / 58 executions, including 20 exact viewport cases. Existing negative controls remain intact; all nine negative scenarios are also exercised locally, including the deliberate layout collapse.

## P1-04 preservation

Fresh, dense normal, dense boss and mixed-accessibility states use the existing matrix. Guardian Tap region heights remain unchanged:

| CSS viewport | Top / bottom test insets | Minimum target region |
| --- | --- | ---: |
| 360 × 800 | 0 / 0 px | 311 px |
| 360 × 780 | 0 / 0 px | 291 px |
| 390 × 844 | 0 / 0 px | 355 px |
| 412 × 915 | 0 / 0 px | 426 px |
| 360 × 640 | 24 / 24 px | 125 px |

The matrix continues to require locked vertical Rift scrolling, stable HUD rows, readable HP/objective/mode, minimum 120 px enemy region, 44 px primary targets, toast/nav/HP clearance, nested cost-icon sizing and independent Details scrolling/focus return.

## Additional browser review

A local Playwright-driven mobile Chromium review used 360 × 780 with both system-light and system-dark settings. Both produce the same intentional dark presentation. Rift, Wisps, Lab, Deeds/cosmetics and Encyclopedia were visually inspected.

Trusted Enter, Space and pointer taps each produced one Guardian hit; held Enter did not add repeats. Settings, tutorial, daily and return focus entry, containment, Escape and return were exercised. Queue keyboard activation preserved focus and updated semantic state. Theme/objective keyboard activation, live affordability transitions and selected contrast were checked.

Local runs use the available headless Chromium runtime through a temporary Playwright adapter. Repository CI continues to use its standard Chrome CLI and unchanged pre-merge workflow. The final PR check is the source of truth for validation of the branch head.

## Remaining Android acceptance gate

Browser checks do not certify TalkBack, Switch Access, native Android Back, actual gesture-navigation insets or 1.3×/1.5× Android font scaling. The installed-APK checklist in `docs/P1-05_ACCESSIBILITY_QA.md` remains the 01/04 device handoff. No physical Android acceptance result is claimed by this report. P1-06 must remain draft/unmerged until P1-05's integration/acceptance decision is complete.
