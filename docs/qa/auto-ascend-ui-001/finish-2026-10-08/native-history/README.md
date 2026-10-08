# Native diagnostic history (not a full native pass)

The original stale state handle was an observer defect: product saveState replaces
its canonical object. The final driver reads the actual current closure each time.
Legacy Debugger.evaluateOnCallFrame could not access all variables. A stopped
intermediate refresh-not-enabled driver is retained without a PASS claim.
UiAutomator returned null root even while the real native popup was visible.
A fixed500ms popup wait failed; observed-focus polling replaced it. Hardware
UP/Enter did not choose218, so the final driver uses actual Android touch.

The touch-run's first snapshots precede popup paint. The separately captured
native-select-218/219-observed.png images show the actual rows used for taps;
touch JSON preserves both request and observed image hashes. Choosing218 and219,
all widths, typing9999 ON/OFF, the accessible label and cold persistence were
asserted successfully. The touch run then timed out removing a legacy Debugger
breakpoint during the system-font relaunch; full native acceptance did not pass
in that attempt. A read-only Node inspector recovered its completed records;
those match the eventual failure receipt exactly. Closing its own stalled HTTP
socket helped diagnose progress and did not supply product input/assertions.

native-controls.json records only completed exact-artifact cases. The finish mode
validates their APK/source identities and individual cases, then runs the remaining
font/guard checks. A final full pass, if present, is native/native-acceptance.json.
Neither this history nor emulator61 proves physical/exact60/TalkBack acceptance.
