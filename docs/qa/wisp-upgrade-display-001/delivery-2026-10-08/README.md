# Wisp F04 — integrated game and signed0.1.140 delivery

**Implemented and published; required physical acceptance is open.**
[PR59](https://github.com/karahaNx/Lumenfall/pull/59) is merged at
0e9b54c8d62a873bd48625f4a20ee18078e8a8f1. Unfinished upgrades stay open without
a fold control. Folding requires Mythic rarity, the authoritative Module cap
and an owned Ultimate; Empower, Resonate and affordability are excluded.

Download the permanent [signed0.1.140 APK](../../../../archive/android/wisp-upgrade-display-001/Lumenfall-0.1.140.apk).
Package com.lumenfall.app, versionCode140, established certificate. SHA256:
`c0c81462151c485b16f85dc2c0e53d258ba45c60f92a32539e9e2d6a7153696d`.
The android-latest release asset is mutable; this repository copy preserves the
specific verified version. [Receipt](receipt.json) and [identity](identity.json)
record source, integration, CI/build/release IDs, versions, hashes and limits.

## Source, CI and integrated behavior

- [Required CI37708308439](https://github.com/karahaNx/Lumenfall/actions/runs/37708308439)
  PASS147 default scenarios, all12 required negative controls, source/tooling,
  APK identity self-test and guarded smoke. [Full decoded log](ci-37708308439.txt.gz)
  is compressed losslessly; decoded byte length/hash are in the receipt.
- Candidate [normal F04](normal-gate.txt), [12 profiles/12,912 assertions](scoped/wisp-upgrades-result.json)
  and [F04 plus11 relevant existing checks](existing/wisp-upgrades-result.json) PASS.
  [Fresh-main negative control](fresh-negative/wisp-upgrades-result.json) fails the
  intended incomplete-fold assertion. [15 unchanged function contracts](unchanged-contracts.json)
  preserve purchase/economy/chronology/persistence bodies against baseline214d454.
- Integrated [normal F04](integrated-normal.txt), [12 profiles/12,912 assertions](integrated-scoped/wisp-upgrades-result.json),
  [five existing hierarchy/accessibility/recovery checks](integrated-existing/wisp-upgrades-result.json)
  and [Forge contracts3,508 assertions](integrated-forge.txt) PASS. PR60's unrelated
  Forge wording is preserved and reassessed. No second full147 run against that
  unrelated post-merge text delta is claimed.
- Main advanced to210005d with PR61 Bond presentation during final receipt
  publication. That work is preserved. [Current-main normal F04](current-main-normal.txt)
  and [12 profiles/12,912 assertions](current-main-scoped/wisp-upgrades-result.json)
  PASS separately; source SHA256 is recorded in the receipt. Signed140/native
  evidence remains tied to0e9b54c, not to later builds.
- The scoped matrix covers320/390/430px, normal/200% root text and normal/reduced
  motion. It checks every finite-track completion combination across all8 Wisps,
  funded/unfunded/prerequisite gates, actual final purchases, same-Wisp focus,
  Enter folding, at least44px controls and no progression overflow. Canonical,
  recovery and backup round trips preserve purchases/currencies. Rendering and
  folding do not write saves; stale incomplete fold state is overridden.

Node24.19.0, Chromium151.0.7922.173 for CDP and official Chrome155.0.8059.39 for the
ordinary harness. Debian Chromium dump-dom times out in this environment even on
the unchanged source; the official browser runs the ordinary gate. UI fixtures
pause periodic callbacks only for immediate measurements. No test bridge ships
in the game. [ES2017 syntax check](es2017.txt) is separate from native WebView60.

## Signed APK and Android evidence

[Android build37710185974](https://github.com/karahaNx/Lumenfall/actions/runs/37710185974)
PASS on integrated0e9b54c. [Full decoded build log](android-build-140.txt.gz),
[independent aapt/apksigner identity](apk-identity-140.txt) and
[ZIP CRC/all15 source assets](apk-assets-140.json) match the downloaded APK and
GitHub asset digest. [Official Android tools/image hashes](android-tools.json)
record the test environment.

[Actual signed138→140 installation](native-update.json) PASS: WebView Local
Storage tar bytes are identical before and after upgrade, before first launch.
[Raw log](native-update.txt), [prior canonical/recovery state](native-old-save.json)
and [native storage bytes](native-storage-before-update.tar.gz) are preserved.
The decoded tar hash/size are in the update receipt. Native mutation drivers
assert ro.kernel.qemu=1; the direct adapter refuses authenticated devices. It was
needed because host adb cannot create /home/agent/.android on this read-only host.
It connects only to the task's isolated emulator, not a user's phone.

[Native F04 UI receipt](native-ui-140.json) and [raw log](native-ui-140.txt) PASS
on the actual installed signed140: old Module19/Mythic/owned Ultimate remains
visible with no fold, actual native final Module purchase reaches cap20, panel
stays open and focus remains on Ember. Native Enter folds and native tap opens;
neither save slot changes from folding. Controls measure at least44px, no page
overflow and no observed interaction errors. [Screenshot](native-wisp-140.png)
shows the completed open panel. Exact signed product JS/CSS match integrated
source; the test seeds a synthetic old save/timestamp before reload and holds
interval callbacks only during immediate measurements. This native check does
not claim the full desktop matrix or continuous live gameplay.

The [native UI driver](native-ui-140.cjs), [update driver](update-native-140.cjs),
[CDP connector](native-connect.cjs) and [ADB transport](direct-adb.cjs) use the
recorded local /tmp SDK/fixture paths and Node24 global WebSocket. A scoped rerun
requires the described isolated emulator, signed APKs, old-save fixture and the
recorded0e9b54c source checkout for the exact product-byte comparison.
Prior [scroll-target adapter failure](native-ui-prior-adapter-failure.txt) and
[asynchronous input timing failure](native-ui-prior-input-timing-failure.txt)
are retained. Centering the test target above navigation and waiting for native
input completion fixed the adapter; no product script/style was rewritten.

The emulator is Android8.1/API27/WebView61.0.3163.98 with software CPU emulation.
It is separate from the **unperformed affected-phone/exact WebView60/TalkBack
acceptance** in [DEVICE_ACCEPTANCE.md](DEVICE_ACCEPTANCE.md). Self-review and
automated checks are recorded; no independent review is claimed. The feature/chat
remains open until the required physical checks pass and results are saved.

Parent files belong to the historical7 October local candidate. The verbatim
[previous task checkpoint](previous-local-checkpoint.md) preserves that history;
it does not establish current authorization or acceptance of the integrated game.
