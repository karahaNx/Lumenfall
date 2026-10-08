# RIFT_GUIDANCE_001 — 8 October integration evidence

Status: refreshed local checks PASS; required CI/integration/APK acceptance pending.
Baseline: b0537cb46635555ba2c2e5f3f95bc8fc276aeda5. Isolated branch feature/rift-guidance-001.
Original7 October evidence is retained separately; it does not accept these bytes.

The user's follow-up authorizes publication/implementation. Current rules
supersede the earlier global writer-release gate. PR46/B2 and F13 are integrated.
Preserve F27 cosmetics/Trial status and all newer game/test changes.

Fresh matrix, contract, tooling and build receipts are stored here.
Modern Chromium/root-font scaling do not prove physical WebView60/TalkBack.
Native preflight: no emulator on local port5555; no native pass is claimed.

The first matrix attempt completed147 observations before a post-fling touch was
suppressed. Its raw failure is retained in first-attempt/. The driver now waits
for native scroll position to settle before the next tap, without retries,
scroll correction, product changes or weaker assertions. F27 coverage is added. The second attempt correctly rejected cosmetics that the
fixture had not applied; corrected fixtures now invoke the actual theme/cosmetic
selection handlers before measuring, and assert the equipped DOM classes.

Replay after staging index.html/fonts/branding in mobile/www:

```bash
node scripts/codex/check_context.cjs --task docs/tasks/RIFT_GUIDANCE_001.md
node scripts/ci/validate_source.cjs
node tests/behavioral/run.cjs --web-root mobile/www --scenario rift-guidance-mobile --raw-artifacts /tmp/rift-guidance-evidence
node tests/behavioral/rift-guidance.cjs chromium mobile/www /tmp/rift-guidance-contract --existing-contract
node tests/tooling/run.cjs
```

Fresh results: summary.json, registered/rift-guidance-mobile/results.json and
source-identity.json. 160 observations/96 actual theme selections/48 Comet
cosmetic pairs/16 visible Trials, 0px protected movement and80 native touch
scrolls PASS. Rift1,618/navigation295/F13 12-profile matrix and source/context/
tooling checks PASS. Actual V8 6.0.286.52 parses both product scripts and runs
23 preference/focus/storage/tab assertions plus the preserved F13 renderer.

The current task supersedes the earlier writer-gated historical handoff.
