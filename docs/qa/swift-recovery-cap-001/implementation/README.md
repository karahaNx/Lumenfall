# Swift implementation evidence

Candidate source SHA256: 027290e25a0f60a5a6a4df4408d13627d2a3de07fea232a623b435ac534d3ac5.
PR88: https://github.com/karahaNx/Lumenfall/pull/88. Integration/APK pending.

Current receipts: core-current.json (13 groups/110 purchase cases),
mutants-current.json (four causal mutations), offline-clock-oracle.stdout.txt
(one-second8h/72h replay, same-paid-work cap check and exact legacy state oracle),
v8-current.json and v8-current-oracle.json (actual V8 6.0/Node8.3 unchanged
product, independent Node24 integer accounting). full-final.* is in progress.

The two necessary Farm fixes retain the endpoint fraction without subtracting
large whole seconds and use the actual grid for stall detection. Their overlap
with PR70 is recorded; its Wisp role changes are excluded. The archived original
blob ea44431c163569548973d9e489f75345749a07ee is unchanged. Offline comparison
adapts only those two clock corrections in memory and disables Swift queue at
level9; complete exact summary/state comparisons remain required. The immutable
Swift60 device save uses an independent one-second replay, not old uncapped
kill/Ascend goldens. UI goldens are source-hash-bound.

Earlier full-suite/current/final diagnostics include failures fixed later, not
acceptance. Native prepare failures concern the test bridge's stale captured
state and optimized functions. Current bridge rebinds the canonical state after
actual startup save; signed APK/source are unchanged. All failures are retained.

Fractional-millisecond (123.25ms) high-power exploratory parity showed about
1.9e-6 enemy HP drift on restored fixture; actual Date.now endpoints are integer
milliseconds. Required restored whole/split checks use 0ms and123ms endpoints,
retain existing tolerances and catch the original stall. No physical Android,
TalkBack or exact WebView60 device result is claimed. Native API27/WebView61
emulator and actual V8 6.0 cover scoped compatibility separately.

Full-suite diagnostic reached offline-core process timeout300s; standalone complete
replay passes in330.358s. Only that new72h exhaustive oracle has a bounded600s
process budget. Assertions, event/work guards, browser limits and other process
timeouts remain unchanged.
