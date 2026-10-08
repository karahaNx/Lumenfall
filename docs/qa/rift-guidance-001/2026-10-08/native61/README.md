# Exact signed151 Android acceptance

native-acceptance.json and accept151-pass.txt are the final PASS:
Android8.1/API27, actual WebView61.0.3163.98,29 records and no runtime errors.
The APK/source identities bind every claim to signed151/015e2e6. Earlier
baseline143 receipts attest actual installed bytes, seeded QA ownership and
Wisp levels, old hint preference and a cold launch. No player storage was used.

native-update.json proves125952 identical WebView-storage bytes across pm install -r
before first new launch. native-initial-launch.json preserves the actual first
updated ownership/levels/preference check. resume never reinstalls/downgrades143
or clears storage; it requires those exact receipts and reattests installed151.

16 native normal/long and100/200% root-text cases at320/360/390/430px pass.
4 hardware gestures produce observed touchscreen down/move/up, scroll27/28px,
retain all protected boxes and other storage, and do not navigate the hint.
Hidden content cannot capture focus and is ignored by the actual AX tree.
Android Tab reaches Guardian Tap, reload retains preference, actual OS font scale2.0
computes root32px/toggle28px and passes control/geometry checks. Font restored1.0.
cleanup.json confirms only the verified task QEMU stopped, with userdata retained.

The official AOSP API27r01 image replaces an earlier WebView69 preflight.
Provisioning receipts bind its checksum/version. The software emulator has no
KVM/performance claim. Separate actual V8 6.0 runs preserve Chrome60 JS generation.
No physical Android, TalkBack, FPS or independent human review is claimed.

Failures remain intact: old61 synchronous Runtime.evaluate protocol, reload
readiness seeing the old document, the API27 window-frame format, and timed
Android input swipes. A diagnostic saw only down/up on a startup reward overlay;
the helper now waits for explicit overlay absence and a harmless F24-key event
to pass the actual catch-up input gate. Another timed swipe opened selection.
The console's normalized-coordinate attempt emitted no touches; its documented
screen-pixel form emits real moves and scrolls. That diagnostic reused passive
listeners, so duplicate events remain in its raw record; final native acceptance
uses a fresh context and removes its observer after each gesture.

native-console.cjs verifies task AVD identity and reads its local console token
without logging it. It queues complete touchscreen hardware events; actual
viewport transforms handle letterboxing. No product stylesheet/selection rule,
input retry, scroll correction, assertion relaxation or data reset was used.
Only clock/root-font/long-text measurement fixtures are injected via DevTools.
Whole-APK acceptance covers151; newer game versions require their own receipts.
