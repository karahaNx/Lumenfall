# F25 native acceptance

Task-owned software emulator: Android8.1/API27, default x86_64 image r01,
emulator37.3.3, WebView61.0.3163.98. No phone/KVM. Actual provider is recorded
in webview-provider.txt; the native product clock and APK scripts are unmodified.
The recorded run uses Node24. Node20 replay requires --experimental-websocket
to enable its built-in WebSocket client. The driver uses direct-ADB and WebView CDP
target. Real Android input taps/Space and OS screencap; measured StatusBar inset.
Only isolated test saves are seeded while paused, followed by actual cold launches.

baseline.json and baseline-storage.tar are the successful signed143 proof:
installed APK equals archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk,
SHA25645d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7,
exact5c4b3dac product, archived old ownership,125 Comets/17 Prisms/20 Motes and25x
persist through real force-stop/restart. Both save slots and raw storage hash
are retained. The driver rejects a wrong/already-upgraded installed baseline.
The new APK update/native receipt is still pending.
During an advancing-clock update, Farm1 can earn the existing fixed Luminous
Motes. Native checks preserve the exact database before first launch, require
unchanged Comets/Prisms and no lost Motes afterward; the pure production VM
checks exact pre-gameplay wallet equality/idempotence without offline rewards.

Prepare failures are superseded setup/transport/fixture diagnostics, never PASS:
old CDP touch schema/dispatch; full-screen inset included navigation bar; private
debugger scope; invalid Farm return0 normalized to Push and earned the existing
Rift10 Deed5 Comets (the earlier daily-roll filename was a misdiagnosis); CDP
screenshot timeout. Final fixture is valid Farm1/return2, isolates unrelated
progression rewards and retains the real default Ember. Final screenshot uses
Android screencap. prepare-adb-screenshot.log.gz records the successful rerun.

Replay on a task-owned API27 emulator/ADB port5555:

```bash
node --experimental-websocket docs/qa/loadout-memory-001/native-memory.cjs prepare archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk BASELINE_143_INDEX OUTPUT
node docs/qa/loadout-memory-001/verify-assets.cjs NEW_APK ASSET_RECEIPT EXTRACTED_INDEX EXACT_INTEGRATION_SOURCE_ROOT
node --experimental-websocket docs/qa/loadout-memory-001/native-memory.cjs accept NEW_APK EXTRACTED_INDEX OUTPUT
```

Extract the baseline index from exact b0537cb; verify the new APK against an
explicit checkout of its recorded integration, including all fonts/branding.
accept requires the prepared baseline identity/storage and compares raw save
database bytes before/after install, then checks native startup, all seven
unowned choices, immediate two-slot saves, screen changes, actual cold restart,
320/390/430px controls, keyboard focus, AX button name and retired shop absence.
Actual installed new APK and script are compared with the supplied artifact.
Desktop160% text/reduced-motion/contrast and V8 6.0 runtime are separate receipts;
no physical/TalkBack or exact native WebView60 run is inferred.
