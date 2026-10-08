# Feature branch integration and Android 0.1.138 receipt

The user authorized integration of all 27 expected feature branches. The original
[inventory](branches.json) covers all 57 observed remote branches:50 have merged
PR receipts and one distinct unfinished gameplay implementation was present,
LAB-MOTES. The gameplay archive supplies its B2 correction, not a second feature.
The [recheck](branch-recheck.json) has 58 branches, adding only our integration
branch. There is no observed set of 27 new unmerged implementations. Retired
native/signing diagnostics and already-preserved archives are not gameplay work.

PR57 integrates independent saved Use Motes intent and exact Study speed targets,
full per-level payment at actual reward boundaries, and the Number/DataView exact
farm quotient correction. Current resumable offline catch-up, processing time,
failure/retry, recovery, legacy defaults, Ascend/reset and existing systems remain
covered. Historical code/evidence is unchanged. No balance, schema, dependencies,
workflows, signing identity or native code changes are included.

- Baseline: `b6a5b6f4512872c87ab81fea958abe393d5cb98e`.
- Validated head: `b62476dc461f00d2a7ea756f700f755bd763326e`.
- [PR57](https://github.com/karahaNx/Lumenfall/pull/57) integration:
  `20aaae62a4b6e46f8d75775085918eaba4e8de29`.
- Integrated full tree equals the validated tree:
  `e177ba6955f5673460d6201b52701563cf480467`.
- PR46 is recorded merged through the integration commit, preserving its history.
- Product HTML SHA256:
  `6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.

[CI37692669340](https://github.com/karahaNx/Lumenfall/actions/runs/37692669340)
passes all146 default scenarios, all 12 required negative controls, source/tooling
checks, APK identity self-tests and guarded startup. The integrated tree is exactly
the tested tree. [Full raw CI log](ci-37692669340.log.gz),
[acceptance lines](ci-acceptance.txt) and [machine-readable receipt](validation.json)
are saved here; Actions retention is not the only evidence source.

The initial local full-suite aggregate exits1 only on its old comparison of new
additive offline state/summary fields. That output is preserved in
[the initial log](local-full-suite-first-attempt.log.gz). The final comparison
asserts exact legacy OFF/remembered-tier maps and zero new counters separately,
then retains the complete original oracle. Its [complete rerun](local-offline-core-corrected.log.gz)
exits0. The initial aggregate is not called green. All other defaults pass in
that original run; fresh final CI passes the entire suite together.
Local [negative controls](local-negative-controls.log.gz),
[guarded startup](local-smoke.log.gz) and [Lab contracts](local-lab-contracts.log.gz)
are also preserved. Local checks use Node24.19.0 and official Chrome155.0.8059.39;
GitHub uses the configured Node20.20.2 and Chrome154.0.8037.97.
Debian Chromium151 DOM export hangs even on static HTML and unchanged main.
Diagnostic/aborted attempts are not acceptance and did not change any gate.

[Android build 37694671685](https://github.com/karahaNx/Lumenfall/actions/runs/37694671685)
passes at the integration commit and publishes **0.1.138**, versionCode 138,
package `com.lumenfall.app`. The existing final APK gate verifies package,
versions and signer with aapt/apksigner. The established certificate SHA256 is
`A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.
[Raw build log](android-build-138.log.gz) is preserved.

The published APK was downloaded and verified with the existing Node ZIP/asset
verifier, not a reconstructed APK. All 526 container entries pass CRC checks;
all 15 game/font/branding assets match main byte-for-byte. Its SHA256 matches
GitHub's release digest:
`81b9be7edea971335a06f06d1894d91e75a92736738cc935fc2a920a26a02e1e`.
[Asset receipt](android-138-assets.json) lists every asset hash. Release ID 396102072,
asset ID 619954273, size 6,837,151 bytes. The `android-latest` tag points to the
integration commit at verification time; a future build may replace that tag/file.

[Download Lumenfall APK](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk).

Code integration, CI, signed release and delivered asset identity are verified.
Physical affected-phone/exact WebView60/TalkBack acceptance and independent review
have not been performed for these new bytes. Prior APK137 native/emulator evidence
belongs to that older version. Historical B2 stress failures/clipping uncertainty
remain recorded; the full 146 suite does not claim a fully passing historical
stress matrix. Required device acceptance remains OPEN, so this task/chat remains
open. Next: complete those checks and save results in GitHub. Any later feature
implementations must be inventoried and integrated from their actual requirements.

These receipt/checkpoint changes affect documentation only; the delivered product
and tested scripts retain the validated hashes. See
[the task checkpoint](../../tasks/FEATURE_BRANCH_INTEGRATION_001.md).
