# F25 native acceptance

Task-owned Android8.1/API27 software emulator, WebView61.0.3163.98, emulator37.3.3.
No phone/KVM/TalkBack or exact native WebView60 claim. Production clocks, APK and
loaded scripts remain unmodified. Node24 actual run; Node20 replay needs
--experimental-websocket. Real Android taps/Space, measured StatusBar inset,
OS screencap; isolated fixtures seeded while paused, followed by actual cold launches.

Signed APK150, source91decbc, SHA8ad8aeab6df7224e629c8a93805386a5c16851ffeb53e2f7338f42c76b0d79bc:
apk-150-identity.txt verifies com.lumenfall.app/version150/established signer;
apk-150-assets.json verifies all CRCs and15 exact source assets. Extracted-source
apk150-v8-6.0.json passes437 assertions on actual V8 6.0.286.52; desktop1139
checks separately cover160% text/reduced motion/contrast. APK149 was superseded.

native-behavior.json/screenshots record successful actual150: seven unowned
immediate primary/recovery choices, screen switches/force-stop Max,320/390/430px
44px controls, keyboard focus, AX name, no retired shop/name and no runtime errors.
Its first record's database claim is INVALID and excluded from acceptance.
invalid-storage-baseline.json, invalid-storage-update.json, invalid-storage-capture.tar,
baseline-143-first.json and baseline-storage-first.tar preserve original diagnostics:
the old shell command returned1146 bytes of permission/path errors, not a database.
Equal error hashes prove nothing. The wallet/preference/UI observations are separate.

The driver now uses run-as com.lumenfall.app and the actual app_webview/Local Storage
path. storage-tar.cjs validates tar blocks/checksums/paths, nonempty LevelDB data and
both save keys before hashing. storage-validation.txt records real valid capture plus
rejected shell errors/empty/truncated/corrupted archives. Review P1 fixed. Corrected signed143 baseline and150 update PASS:
baseline.json/baseline-storage.tar/update.json/update-storage.tar/update-native.json
record identical validated101888-byte database SHA
f1bb35469e0d063d4fc974e6d4ee93a6ce7b223d2c7973a79b5556fbe747c965.
Real updated startup and second cold restart preserve ownership/25x/17 Prisms,
Comets125→425 exactly once under F26 and existing Motes. native.json combines
these corrected receipts with the exact same APK/source UI run, excludes its
invalid first record, and hashes all JSON inputs. Replay combine-native.cjs OUTPUT.

143 baselineSHA45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7,
source5c4b3dac:125 Comets/17 Prisms/20 Motes,25x and archival ownership. Real
Farm1/return2 avoids unrelated progression Deeds. F26 separately refunds old
offline24/48 at140/160:125→425 once; F25 adds no credit. Real fixed Luminous
Motes may accrue; pure pre-gameplay migration separately proves exact wallet values.
Delayed Welcome return flow is now awaited/dismissed before real Forge input.
Setup/transport/fixture failures are retained as failures, never PASS.

Full replay using task-owned API27/ADB5555 (creates native.json):

```bash
node --experimental-websocket docs/qa/loadout-memory-001/native-memory.cjs prepare archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk BASELINE_143_INDEX OUTPUT
node docs/qa/loadout-memory-001/verify-assets.cjs NEW_APK ASSET_RECEIPT EXTRACTED_INDEX EXACT_INTEGRATION_SOURCE_ROOT
node --experimental-websocket docs/qa/loadout-memory-001/native-memory.cjs accept NEW_APK EXTRACTED_INDEX OUTPUT
```

To reproduce the recorded split receipt from a clean OUTPUT, first run the full
procedure above, preserve its UI receipt, then prepare the old APK again before
the separate update. The second prepare is required because accept expects143
to be installed. Both stages use the same supplied signed150/extracted source.

```bash
node -e "const d=process.argv[1];require('node:fs').copyFileSync(d+'/native.json',d+'/native-behavior.json');" OUTPUT
node --experimental-websocket docs/qa/loadout-memory-001/native-memory.cjs prepare archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk BASELINE_143_INDEX OUTPUT
node --experimental-websocket docs/qa/loadout-memory-001/native-memory.cjs accept NEW_APK EXTRACTED_INDEX OUTPUT --update-only
node docs/qa/loadout-memory-001/combine-native.cjs OUTPUT
```

--update-only repeats actual install/database/startup/legacy wallet/preference/cold
restart. combine-native.cjs uses the separate validated update as the authoritative
upgrade proof and the earlier same-APK UI records. The original historical first
UI record was invalid; a fresh full replay's first record can be valid but is
still excluded to keep the two stages separate. Exact timestamps/database hashes
change on replay; APK/source identities, required assertions and provenance do not.
