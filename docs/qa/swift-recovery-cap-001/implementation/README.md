# Swift implementation evidence

Merged-main candidate source SHA256: 6caf17feb92ad1feef3d10de1ebb253ceac188d7f262d12846fa7e8111b3d83e.
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

PR88 head33be7cc43a4e5a777c49a4381a1a02e65d9a5113 includes main
e2f745cd0ce0dc9e41b06efd842062fd08d7fab4. Conflicts combine Swift startup/test
registration with F14 and retain F14's exact partial-rebuild selected-preset
expectation. Source-hash-bound goldens regenerated; all four8h kill/Ascend counts
remain unchanged. Merged-source core-integrated.json, mobile-merged.*,
motion-merged.*, v8-merged*.json and smoke-merged.* pass. full-integrated.* and
CI run37741028367 remain in progress.

Signed baseline143 verified independently with aapt/apksigner and real installed
bytes. native-prepared/baseline-native.json and baseline-storage.tar prove a
real cold reload of raw Swift12, Deed ownership and huge original Shard wallet.
The stored app is stopped awaiting an in-place signed update. Updated-native
acceptance will verify unchanged storage before launch, migration once, Forge
geometry and Android keyboard/touch spending, system font_scale2 and cold reload.

Rollback/overlap: after migration or exact debits, some original wallet value can
reside in the same-currency hex escrow. An older APK that ignores this optional
field cannot read that credit; a rollback must retain the migration-aware reader
or restore the complete pre-migration backup (including original raw levels).
Never strip the receipt or independently add its refund to the Number wallet.
Future PR67 integration must reconcile its generic refund record with this exact
Swift receipt once, while retaining remaining spendable credit.

When another index.html change intentionally changes the tested source, regenerate
the source-bound UI receipt with:
`node tests/behavioral/offline-catchup.cjs --generate-swift-golden > tests/behavioral/offline-swift-golden.json`
This invokes the independent one-second replay; do not hand-edit reward counts.
The F18 owner must update the current4s preservation assertion when integrating
the approved1s/1.5s duration implementation.

Merged local full suite:162 default scenarios PASS. CI37741028367 fails only
Resonate browser setup: the standalone driver silently selected Chromium154
despite the runner selecting Google Chrome154. CDP createBrowserContext timed
out before any assertions (records=[]). The runner now supplies its selected
browser with --chrome; the driver honors it, with existing explicit environment
override/default for standalone use. No test, timeout or assertion is skipped.
Failure excerpt: ci-37741028367-failure-excerpt.stdout.txt.

Main advanced to31eccfb: PR84 Auto-Ascend UI and PR90 exclusive upgrade owners
are retained in this checkout. Retirement keeps original effects/raw levels;
Swift remains its own buyable track. Core13 groups pass after changing the
existing Forge credit consumer from retired Shard Sense to current Arcane
Calibration. The native baseline is re-prepared with Lumen for that120-Shard
real purchase; previous native preparation remains historical evidence.
Cap10 plus the newly retired tracks makes Forge20/60 fresh progression impossible.
The explicit proposed continuation and pending user question are recorded in
deed-continuity-proposal.md. No progression rule is implemented pending choice.
