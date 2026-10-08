# BOND_TEXT_001 — signed Android delivery and acceptance

Observed 8 October 2026. Product integrated in [PR61](https://github.com/karahaNx/Lumenfall/pull/61)
at `210005d0ae093d21e846bae41a9bddf25af2800d`. Required CI37710741132 passes
148 default scenarios, 12 negative controls and guarded startup. Fresh integrated
checks are in [../integrated/](../integrated/README.md); mobile/source comparison
is in [../current-main/](../current-main/README.md).

## Artifact identity

[Build37712548224](https://github.com/karahaNx/Lumenfall/actions/runs/37712548224)
succeeded and published signed **0.1.141**, versionCode141,
`com.lumenfall.app`, minSdk22/targetSdk34. The [immutable APK](../../../../archive/android/bond-text-001/Lumenfall-0.1.141.apk)
contains 6,837,505 bytes, SHA256
`0b278ffce3819a40b98c44b738b79123ec2d7fb273a3820bc13ed71940214d44`.
The observed android-latest asset620323694 digest matches; later releases can
supersede it. Established certificate SHA256:
`A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.

`apk-141-identity.txt` and `apk-141-signature.txt` verify package/version,
certificate and v1/v2 signatures with real Android tools. `apk-141-assets.json`
verifies all526 ZIP CRC entries and byte equality of all15 product/font/branding
assets against integration. Extracted index SHA256 is
`1e0d51370b5b62f313dad6953f9b26bb7d7a1a886785dbccc6dfaac379779981`.
`build-141.txt.gz` preserves the downloaded GitHub job113101561232 log.
Signing configuration and credentials were not changed or copied into evidence.

## Save and installed UI results

The isolated emulator is Android8.1/API27, Google APIs x86, using **WebView69.0.3497.100**.
The actual package/service and UA are saved in `native-141-final.json`.
This is software emulation; it is not the exact WebView60 physical acceptance.

- `baseline-138-identity.txt` verifies signed0.1.138 before update.
  `baseline-native-global-fixed.json` observes the old Stone/Titan text and
  persists all eight Rarity3/Module7 fixture purchases through real Save Formation.
- `upgrade-138-141.json` PASS: install141 over138 without uninstall/data clear,
  before opening the new app. The actual47,104-byte WebView storage snapshot is
  byte-identical, SHA256 `d7b48cf7c512c8e682875716f117fd43cd2fcee80fe3d5d3d6fcef12b360438e`.
- `native-141-final.json` PASS: first launch retains all purchased tiers; all
  four Bonds identify partners in main and Encyclopedia in active, benched and
  Lv.0/pending states; all eight abilities retain the expected explanations
  without partnerships. The loaded main game script equals integrated source.
  Native390px profiles at100%/200% root text report reachable, horizontally
  contained partner rows and44px disclosure control.

`native-ui.cjs` uses Node24's WebSocket, actual installed-APK WebView debugging,
legacy-save fixtures and the real load/save path. It injects only QA storage and
an interval guard at DOMContentLoaded, so this validates presentation and data
preservation, not native timing/performance or live/offline simulation. Imported
Formation rebuild intent is explicitly set for each fixture. No QA code is
written into the APK. It is restricted to task-owned emulator-5554.

`native-formation-system-ui-anr.png` preserves the initial capture with Android's
“System UI isn't responding” overlay. After tapping its observed Wait control,
`native-formation-after-wait.png` was captured and visually inspected: all four
full partner pairs and the Gale ability text are visible without that overlay.
An OS dialog is outside the DOM assertions; no native interaction/performance
acceptance is inferred from their PASS. The app JavaScript error arrays are empty.

## Legacy engine and raw failed attempts

`apk-141-legacy-text.json` PASS parses both actual extracted APK scripts and
executes the partner helper on Node8.4.0/**V8 6.0.286.52**. This checks the syntax
and helper required by this feature; it does not certify Android lifecycle or
accessibility. `current-source-legacy-text.json` is the separate source input.

`v8-6.0-candidate.json` is earlier five-case offline-matrix evidence for candidate
SHA `feb273d2ff1fb0d514517227d73b3ccb650a850b57f0a8ba5d12bbc77af85ac3`:
Clear21/Clear20 ON8h, OFF8h, ON72h cap,96h Study beyond cap PASS. The existing
driver's generic scope string says “extracted APK”; its input here was the
earlier local candidate, not APK141. These results are not relabelled as final
APK141 long-window verification.

Initial `baseline-native*` debugger attempts lacked the expected private bindings
or paused at the wrong callback. The first global reader encountered entries
without metadata; fixed reader results are saved separately. Initial `native-141`
attempts hit a debugger-startup race. `native-141-retry` retained imported rebuild
intent, so its nominal benched fixture was active; the corrected final fixture
explicitly sets rebuild intent. Their original JSON/TXT files and earlier helper
versions remain evidence of QA failures; none is claimed as a PASS or hidden by
changing product/CI acceptance.

## Reproduction and outstanding acceptance

Use Node20+ for helpers, real Android aapt/apksigner/adb, and an isolated emulator.
The legacy syntax run intentionally uses V8 6.0. In repo root, examples:

```sh
node docs/qa/offline-catchup-001/native-release/verify-assets.cjs APK result.json extracted-index.html
/absolute/node8.4.0/bin/node docs/qa/BOND_TEXT_001/android/legacy-text.cjs extracted-index.html
LUMENFALL_QA_ADB=/absolute/sdk/platform-tools/adb node docs/qa/BOND_TEXT_001/android/native-ui.cjs result.json
```

The native helper replaces QA storage; run it only on a disposable task-owned
emulator. Native first-launch comparison requires the preserved138 fixture/update.
Do not use it on a player's device. [Physical checklist](DEVICE_ACCEPTANCE.txt)
remains **OPEN**. No physical affected-phone/exact WebView60/TalkBack result or
independent review is claimed. The owner task/chat remains open until necessary
acceptance is recorded in GitHub. `MANIFEST.json` hashes every receipt payload.
