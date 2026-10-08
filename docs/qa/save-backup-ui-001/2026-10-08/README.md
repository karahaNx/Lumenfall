# SAVE_BACKUP_UI_001 current integration evidence

This continuation implements F22 on current game main
`b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`, under the user's 8 October instruction
to finish, push to GitHub and implement in the game. The parent evidence folder
is historical 7 October local preparation. Its recorded baseline/results remain
preserved; they do not attest to this continuation or a new APK.

The [task](../../../tasks/SAVE_BACKUP_UI_001.md) records requirements, scope,
decisions, acceptance and next action. [PR77](https://github.com/karahaNx/Lumenfall/pull/77)
merged at `261b1b7f863f73c324f4ac04acb5bfc95101644d`; its full tree equals the
validated feature head. [Integration](integration.json), [CI](ci-acceptance.json)
and [local suite](candidate-validation.json) preserve exact identities/results:
152 default scenarios / 174 results, all14 required CI negatives and guarded
startup PASS. Complete lossless logs are in the named `.txt.gz` files.

The integrated source and actual extracted APK each pass all12 browser profiles:
320/390/430px × normal/200% text × normal/reduced motion. Screenshots and JSON
use native browser input; clock/interval and failure injection are test-only.
Contrast minimum is 6.32:1. [Source preservation](source-preservation.json)
proves six core backup functions remain byteidentical; both inline scripts parse
as ES2017. [Legacy UI probe](legacy-ui.cjs) passes on Node8.3/V8 6.0, including
captured-code replacement, export, cancellation and primary/recovery equality.
Its explicit mocked DOM/storage is not native/device evidence. The existing
suite separately covers normal gameplay, lifecycle, chronology and persistence.

Signed [APK0.1.144](APK/Lumenfall-0.1.144.apk) is archived here because the
[latest APK URL](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)
is mutable. [Release identity](release.json), [asset hashes](apk-assets.json),
[badging](apk-badging.txt) and [signatures](apk-signature.txt) establish package
`com.lumenfall.app`, version144, the established certificate, v1/v2 signatures,
all15 exact source assets and all526 ZIP CRC entries. Build37736693432 passed
on the integration commit; its full raw log is preserved. APK SHA256:
`6e2006cb90ebe27104bd1ae38ba8c8afa700f4ede90e6fe8046bf7b2f505ca5d`.

Required physical Android/WebView60/TalkBack acceptance remains **OPEN**.
[Environment preflight](environment.json) supplies no connected device, emulator,
KVM or USB passthrough. Complete [the device checklist](DEVICE_ACCEPTANCE.txt)
on signed144, save observations in GitHub, and keep the feature/chat open.
Self-review and automated checks are not independent human acceptance.

Product/test changes: `index.html`, `tests/behavioral/save-backup-ui.cjs`,
`tests/behavioral/run.cjs`, `tests/behavioral/scenarios.json`, and the two new
entries in the existing pre-merge negative-control loop. Delivery changes only
this task/evidence and one row of PROJECT_STATE. No native config, save schema,
gameplay balance, ownership or migration code changed.

Replay focused checks from the repository root:

```bash
node scripts/codex/check_context.cjs --task docs/tasks/SAVE_BACKUP_UI_001.md
node scripts/ci/validate_source.cjs
node tests/tooling/run.cjs
node tests/behavioral/save-backup-ui.cjs --chrome /absolute/path/google-chrome --web-root . --evidence /tmp/save-backup-ui
node tests/behavioral/run.cjs --web-root mobile/www
```

The feature-specific negative controls are
`self-test-save-backup-placement` and `self-test-save-backup-confirmation`.
Each must fail at its causal assertion. Chrome PASS and verifier self-test are
not proof of physical Android/WebView60/TalkBack or a signed APK identity.
