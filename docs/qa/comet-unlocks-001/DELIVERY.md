# COMET_UNLOCKS_001 delivery — 8 October 2026

The catalog is integrated through [PR69](https://github.com/karahaNx/Lumenfall/pull/69),
commit `d95205f6d8059933fac74e8699854f67cb950a7e`, tree
`28c52a315396850e3464c7475dfa7777325f5ceb`. It equals the locally reassessed
combination with mainfe52747, preserving Wisp/Bond/Rift and other owners' work.
No independent review is claimed. Required native acceptance remains OPEN.

## Implemented behavior

Deeds offers Trials140, Trail50 and Crest160, with Auto-Ascend100 preserved.
The three replacement prices reuse the existing350-Comet catalogue budget;
no damage/reward formula or productive-time benefit is added. User selected
Trials plus Rift cosmetics and then requested implementation/GitHub/game delivery.

One pending/active Trial starts after the next Ascend and ends at the following
Ascend. Targets must already have been cleared and be >=15. Quiet Guardian
forbids manual attacks, allowing Auto-Tap. Single Star tracks <=1 Active Wisp
across recruitment, presets, rebuild and Auto-Empower. Failures latch for the
whole run. Each type earns one permanent cosmetic mark; retries/cancellation
are free. Trail/Crest equip independently of aura and have reduced-motion styles.

Old Rest ownership/effects remain in legacyCometPurchases; currencies, Deep
Reserves and paid Lab snapshots retain value. Normalization, recovery and full
backup restore are idempotent. F25/F26 built-in memory/fixed12h retirement and
refund decisions remain separate; the catalog does not implement that transition.

## Checks and exact app

- [Pre-merge151-scenario CI](combined-ci.json): run37713904342 on a7a5bc3;
  all required steps,12 negative controls, tooling and smoke passed.
  [Feature-specific actual CI process records](combined-scenarios.json) contain
  core11 cases and12 native browser mobile/text/motion profiles.
- Latest Rift-text combination: [focused core](integrated-core.json),
  [V8 engine](integrated-v8-core.json) and [six limited previews](latest-main-preview.json)
  passed. The previews use in-memory HTML/storage and are supplementary;
  actual HTTP/storage/browser behavior is checked in full CI.
- Signed [Android build143](android-143.json), run37715794487, passed source,
  browser startup, build, stable-key verification, final identity and publication.
  This Android workflow does not run the full behavioral suite. The delivery
  publication PR runs it again on unchanged integrated game/test assets and
  records the exact final validation head/run/result in its body.
- [Published identity](published-identity.txt): package com.lumenfall.app,
  versionCode143/name0.1.143, established signing SHA256. Verified independently
  from the downloaded actual APK using aapt/apksigner.
- [Downloaded assets](published-assets.json): all526 ZIP entries pass CRC;
  all15 bundled HTML/font/branding files equal integrated source. APK SHA256
  `45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7` matches
  GitHub release digest; source SHA256
  `5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c`.
- [Actual extracted APK Comet engine cases](published-v8-core.json):11 PASS
  on Node8.3.0/V8 6.0.286.52. [Generator](prepare-v8.cjs) ports harness imports,
  strict-assert aliases and two object-spreads; product source remains untouched.
  Engine evidence is separate from legacy DOM/Android/TalkBack acceptance.

[Immutable signed APK](../../../archive/android/comet-unlocks-001/Lumenfall-0.1.143.apk)
is retained for device acceptance even when android-latest advances.

## Remaining acceptance

[Native/device checklist](DEVICE_ACCEPTANCE.txt) remains OPEN. Cloud ADB/emulator
attempts cannot create their default Android configuration paths on the
read-only home mount. No physical phone or hardware acceleration is attached.
Exact WebView60, native update/interaction and TalkBack for this APK are unverified.
Keep this owner chat open and record device results in GitHub before completion.
The full F25/F26 transition remains its separate dependency. Shared-file edits
stop after this delivery checkpoint; no other owner's release is claimed.
