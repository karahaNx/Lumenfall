# Legacy return-panel positioning

The actual signed APK0.1.135 completes the original native Clear21 eight-hour
window: +302400 kills/+14400 ascends, one full primary save, matching recovery,
3262 native frames and no runtime errors. Android8.1/API27/WebView61.0.3163.98
software emulation took about25 minutes with controlled clocks/intervals.
Its Continue input then fails: the modal uses the unsupported CSS inset
shorthand, leaving the button off-screen (y1047 in an820px viewport).
This is a failed overall UI check, not device acceptance.

The focused correction replaces inset:0 with top/right/bottom/left:0 only
for the functional overlay and startup intro. Product JavaScript is unchanged
from PR54/main458dbbc25f14c06149b4379ba6475ed16ad58a57; no game/save/balance
behavior changes. Corrected product SHA256:
64699bd6ba907f145523bb9633a36a2661b28ef3391c69b4e4216e06e378ecb8.

The registered legacy DOM regression now strips authored inset declarations
while retaining authored longhands, in addition to removing replaceChildren.
It verifies viewport coverage, on-screen Continue, hit-testing and real input.
before.txt fails on unchanged released source with the exact geometry assertion
and no timeout; after.txt records the corrected source. Native JSON/screenshot
record the actual135 completed transaction and off-screen panel separately.

Command: node tests/behavioral/run.cjs --web-root . --scenario offline-catchup-legacy-dom
(Node24, Chrome155.0.8059.39 locally). Required full CI, integration, signed
Android build and unmodified corrected native UI checks follow publication.
Physical exact WebView60/TalkBack acceptance remains open.

The candidate-native-style-diagnostic receipt adds the exact positioning
longhands to the135 page and real Android Continue input works. It is a
diagnostic only: the page was instrumented, not the corrected released APK.
