# OFFLINE-CATCHUP-001 integrated Android release

Historical release receipt for **0.1.134**. Native advanced-save startup failed
on Android8.1/WebView61 because `select.replaceChildren` is unavailable. The
focused correction is [PR54](https://github.com/karahaNx/Lumenfall/pull/54).
Do not use this historical build as corrected native acceptance.

| Identity | Verified value |
| --- | --- |
| Implementation PR | [51](https://github.com/karahaNx/Lumenfall/pull/51), merged |
| Validated PR head | `bd71a8608d133f99971a74a79e300e1f5db254df` |
| Integrated/build commit | `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` |
| Product Git blob | `90e4678cb28fa833fdacbc01d1744d9465f6a356` |
| Product SHA256 | `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607` |
| Exact-head PR CI | [37625068008](https://github.com/karahaNx/Lumenfall/actions/runs/37625068008), success |
| Android build | [37626819252](https://github.com/karahaNx/Lumenfall/actions/runs/37626819252), success, run number134 |
| Package | `com.lumenfall.app` |
| versionCode / versionName | `134` / `0.1.134` |
| Preserved historical APK | [Lumenfall-0.1.134.apk](../../../../archive/android/offline-catchup-001/Lumenfall-0.1.134.apk) |
| Asset ID / size | `618745109` / `6833971` bytes |
| APK SHA256 | `09e53527d8a968801f6457297558efcb4ffcf5b260af47f202447e57455b6f6c` |
| Certificate SHA256 | `A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21` |

The `android-latest` tag was observed pointing to the integrated commit.
It is a moving release: check version and SHA256 before later acceptance.
`identity.json` preserves the immutable build/asset identities. The build's
artifact API returned no downloadable workflow artifacts; the actual public APK
is therefore preserved byte-for-byte under `archive/android/offline-catchup-001/`.

`ci-pr51.txt` and `android-build-134.txt` preserve the full decoded GitHub job
logs, including their BOM, line endings and diagnostic spacing. The earlier
first PR run was cancelled after the publication receipt changed the head;
it is not final-head acceptance. CI37625068008 passed all 132 scenarios,
all 12 required negative controls, tooling/source/staging and guarded startup.
It used Node20 and Google Chrome154.0.8037.97. Self-review and original-oracle
controls are documented in the parent QA README; independent reviewer approval
is not claimed.

`apk-badging.txt` and `apk-signature.txt` are official build-tools35 output
from the actual downloaded APK. The verifier confirms the expected package,
version and established signing certificate. `apksigner` verifies v1 and v2
signatures. Its metadata warnings are preserved verbatim in the raw report.
ZIP CRC passes. `assets.json` proves all 15 product/font/branding files match
the integrated source byte-for-byte. `apk-v8.txt` records actual extracted
APK product execution on Node8.3.0 / V8 6.0.286.52: ON8h completes302400 kills
and14400 ascends over1181 cooperative batches.

Integrated context and archive checks pass:21 entrypoints,24 links, startup
context17805 bytes,1509 immutable archive checks. Source validation finds
two scripts and16 required IDs. The complete integrated tree equals the
exact-head validated PR tree, so integration required no repeated full suite.

An isolated Android8.1/API27/WebView61 emulator now runs here at the user's
request. APK134 installed and fresh-save UI rendered; advanced-save startup
failed before catch-up. The native exception and focused before/after regressions
are preserved with PR54. Corrected APK lifecycle/storage checks follow its
verified integration. Physical supported WebView60 and TalkBack acceptance
remain **pending**, not inferred from desktop Chrome, V8 or WebView61 results.
Use [`DEVICE_ACCEPTANCE.txt`](DEVICE_ACCEPTANCE.txt) for the concrete remaining
checks and report format. Keep the feature and owner chat open until the
required acceptance is saved in GitHub. The documentation checkpoint's PR
description records its own final publication/validation receipt.

`MANIFEST_SHA256.txt` lists the preserved receipt hashes. Historical baseline,
original failure, fix and JavaScript migration evidence remain unchanged in
the parent directory. No gameplay rule or balance/cap/schema change was added.
