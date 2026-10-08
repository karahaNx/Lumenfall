# RIFT_GUIDANCE_001 — 8 October evidence index

Use [delivery/README.md](delivery/README.md) for the final integrated source,
APK, Android acceptance, CI status and limits. Earlier receipts below describe
their named source hashes and do not accept the final version.

- [7 October task](previous-task-2026-10-07.md): original frozen proposal.
- [First publication baseline](source-identity.json) and [summary](summary.json).
- first-attempt/ and second-attempt/: preserved test failures and fixture fixes.
- [Label-fit correction](post-ci-fix/README.md): required CI caught enlarged text.
- merged-main/ and current-main/: successive dependency refreshes.
- [Review correction](review-fix/README.md): exact keyboard next stop, negative
  control and successful169-scenario feature-head CI before newer F25/F26.
- [Integrated publication](integrated/publication.json), [APK identity](integrated/apk-identity.txt)
  and [asset/CRC proof](integrated/apk-assets.json): exact015e2e6/0.1.151.
- native/: earlier WebView69 emulator preflight, with failures retained.
- native61/: actual WebView61 signed143 baseline,151 update and native checks.
  SystemUI/reload/window-format diagnostic failures stay alongside final results.

Replay after staging root index.html/fonts/branding in mobile/www:

```bash
node scripts/codex/check_context.cjs --task docs/tasks/RIFT_GUIDANCE_001.md
node scripts/ci/validate_source.cjs
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-guidance-mobile --raw-artifacts /tmp/rift-guidance-evidence
node tests/behavioral/rift-guidance.cjs chromium mobile/www /tmp/rift-guidance-contract --existing-contract
node tests/tooling/run.cjs
```

Actual V8 6.0 replay uses Node8.3.0 with legacy-guidance.cjs and the exact index.
Native helpers operate only on the task-owned AVD; never player storage.
No physical Android, TalkBack, frame-rate or independent human review is claimed.
