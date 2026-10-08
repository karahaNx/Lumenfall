# COMET_UNLOCKS_001 candidate verification

Candidate code is in PR69; original baseline main214d454, rebased onto
main0e9b54c (PR59/60). Product code checkpoint f329600; subsequent commits
update test expectations and measurement timing only. Required CI must pass
on the final candidate. Catalog is now integrated via PR69 and signed143
published/verified; required native/device acceptance remains outstanding.
Current [delivery receipt](DELIVERY.md) supersedes candidate-only status below.

Pre-merge [run37711556550](https://github.com/karahaNx/Lumenfall/actions/runs/37711556550)
completed successfully on efb5bc97ff1cb58d63342dfc42319579510c1ebb:
all150 default scenarios, required negative self-tests, tooling, source,
identity-verifier self-test and startup smoke. Job113098635562 reports all
steps success. Retrieved logs explicitly show all three Comet scenarios PASS;
the API log response was truncated, so the complete raw log is not claimed.

Combined main20efc396 (Bond text and proposal receipts) preserves all incoming
tests and both encyclopedia changes. Focused core and source/context checks
passed after conflict resolution; the full combined CI run is required before
integration.

Available local checks (Node24.19.0): source syntax, APK identity verifier
self-test, actual feature context gate, tooling and 11 focused production
gameplay/save cases PASS. Existing long-offline regression PASS before the
PR59/60 rebase; full CI rechecks it on the combined source.
See implementation-core.json, implementation-offline-core.json and
implementation-{source,context,tooling}.log. Tooling’s executable fixtures
required the authorized unsandboxed invocation; the sandbox attempt failed.

Managed Chromium151.0.7922.173 blocks HTTP/file navigation with
`net::ERR_BLOCKED_BY_ADMINISTRATOR`. The original p2 endgame baseline produced
zero completed assertions before timing out. No browser/network policy was
changed; no original browser gate is disabled or replaced.

## Supplementary in-memory preview — limited evidence

preview-mobile.json and preview-reduced.json cover 320/390/430px at 100/200%
text. A private preview driver sent the instrumented, locally read HTML through
CDP Page.setDocumentContent on about:blank. Local font bytes were embedded and
localStorage used a bounded test Map. Thus these are UI previews and do **not**
prove actual browser storage/HTTP startup, native Android, WebView60 or TalkBack.
The committed default native driver instead loads the real staged HTTP page
with real browser storage in CI; no preview fallback is installed in the gates.

Native touch queues a Trial, Space cancels it, touch equips Trail and Enter
equips Crest. Draft input node/focus survive shop rendering; control geometry
is >=44px, text/ring contrast meets the checked thresholds, both cosmetic slots
retain the aura, reduced motion stops the Trail, and a visibly rendered Crest
preserves the HP bar and Guardian tap hit target. Selected screenshots under
preview/ show the scope; seed balances and the welcome toast are QA fixtures.

CI367a206’s animated case caught controls scaled to 43.78px. The new native
scenarios were missing from the DOM dispatcher's native-driver handoff, so
its unknown-case failure froze the panel animation at its first frame.
Register the Comet handoff and assert its ready flag/no generic failure in
the native driver. Also wait for normal panel transitions before measurement.
The earlier reduced-motion preview and core cases passed; full CI is rerun.
Old purchase selectors/ownership assertions were updated to the intentionally
replaced catalog and explicit legacy archive, preserving exact debit, one save,
focus and existing ownership/value checks. No test scenario/gate was removed.

## Value and scope

Current catalog delivery preserves existing Rest ownership and effects in
legacyCometPurchases. Raw Deep Reserves levels and currencies remain intact.
Normalization, canonical/recovery saves and whole-snapshot backup restore are
idempotent; no refund or additive credit exists in this candidate.
Full fixed-12h and built-in-memory retirement remain F25/F26 dependencies.
Do not describe the full original transition or required device acceptance as
complete. Integration, final CI and signed APK receipts must be added later.
