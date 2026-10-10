# Research Lab scrolling regression — 2026-10-10

The expansion adds 14 priced/timed projects, raising the number of usable Research Lab controls. In PR104 the full existing regression failed under native CDP touch replay (`rift-status-stacking-mobile`, its reduced-motion variant, and `rift-status-reduced-motion`). Existing product/save calculations and separate Lab tests passed. The failures were native gesture-driver overscroll/120-second timeout, not proof that a user cannot scroll the Lab.

Original failed workflow: 38004607228, job 114070399261, timed out at120s on first scenario. Original full PR104 run37961974093 also failed. The independent diagnostic run38004273986 passed a reduced-motion profile and retained raw touch traces, demonstrating timing dependence rather than deterministic wrong Lab purchase behavior.

Isolated verification branch `fix/lab-scroll-regression-104` changes ONLY the native QA driver: preserve real CDP touchStart/touchMove/touchEnd, finish the drag without velocity, wait for natural inertial scrolling to settle, and extend the bounded native scenario process timeout from120s to300s because the extra projects require longer genuine swipe replay. Do NOT use programmatic scrollIntoView/scrollTop, skip targets, change source game code, change assertions, or count a timed-out child as pass.

The focused three-scenario gate in run38005188010 passed on the isolated candidate before this integration. Full suite is independently required on this exact PR104 commit, including 22 deliberate negative controls and guarded browser startup; keep the PR draft if it fails. No APK/main publication is authorized. Physical Android, native WebView60, OS text scaling and TalkBack remain release gates.
