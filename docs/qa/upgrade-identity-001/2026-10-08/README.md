# F29 implementation evidence — 8 October 2026

Private checkout: `/workspace/Lumenfall-upgrade-identity-001`, branch
`feature/upgrade-identity-001`. Original product baseline b0537cb; rebased onto
261b1b7 (Backup UI). [PR90](https://github.com/karahaNx/Lumenfall/pull/90)
is a candidate, not completed delivery. No independent review is claimed.

The final [matrix](../../../tasks/UPGRADE_IDENTITY_001/MATRIX.md) uses unchanged
recipes/effects and preserves all24 raw level fields. Four numerical profiles
in [value-parity.json](value-parity.json) match the original source exactly.

Candidate commands, run with Node20+ and Chrome155:

```sh
node tests/behavioral/run.cjs --web-root /tmp/upgrade-identity-001/candidate-web
node tests/behavioral/run.cjs --web-root /tmp/upgrade-identity-001/candidate-web --scenario upgrade-identity-farm-clock
node scripts/ci/validate_source.cjs
node tests/tooling/run.cjs
node scripts/codex/check_context.cjs --task docs/tasks/UPGRADE_IDENTITY_001.md
node scripts/verify_apk_identity.cjs --self-test
```

Focused contract/chronology/persistence/320–430px mobile, 200% text and motion
checks pass. The full suite and required GitHub CI remain in progress.
[17 causal negatives](negative-controls.json) detect their intended failures,
including the [zero/fractional Farm clock positive](farm-clock-final.txt).
The earlier fractional-only clock negative unexpectedly passed; the added
zero-phase case reproduces the original2s stall under the restored old guard.
No gate was removed.

[V8 6.0.287.53 result](v8-6.0.json) tests source parsing/full offline simulation
with the official Node8.6.0 runtime. It is not Android WebView DOM/device evidence.
Current signed APK0.1.144 was checked only as the package/signer baseline;
it does not contain F29. Integrated checks/new signed APK/native acceptance are
pending. Physical affected-phone/exact WebView60/TalkBack remain required.
