# SWIFT_RECOVERY_CAP_001 — local evidence index

Owner: this Swift Recovery feature chat (Gameplay / Progression).
Status: local preparation only; no cap, compensation or migration is implemented.
The [task](../../tasks/SWIFT_RECOVERY_CAP_001.md) and [design](DESIGN.md) contain
the original requirement, dependency gates, precise missing decisions and next action.
The user's correction, “not too easy and not too hard”, is preserved in the
[request](../../tasks/SWIFT_RECOVERY_CAP_001_REQUEST.txt).

## Baselines and sources

The initial baseline was `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, with
unchanged released product source SHA256
`f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
Main advanced during the work. The isolated feature branch was fast-forwarded
to `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
`6e18e8485111a7a5bfa2d5854ed6b9c4735282c2`, source SHA256
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
The current source/harness remained byte-identical before and after checks.

[remote-snapshot.json](remote-snapshot.json) records the read-only main/PR46
preflight and the background PR51 merge. PR46 remains open/Draft on R2.
No shared writer was acquired. PROJECT_STATE still describes PR51 as Draft;
the verified live merge is authoritative. This proposal does not edit that
other feature's shared status. No complete branch/run inventory was made,
because this chat performed no remote mutations.

Read at startup: live AGENTS, bootstrap, own ownership row/Gameplay role,
PROJECT_STATE, FEATURE_WORKFLOW and targeted CONTEXT_INDEX. Requirement
evidence: original USER_REQUIREMENTS, F19/F18 and A/E of TASK_FEEDBACK,
FEEDBACK_REGISTERED, FINDINGS and FEEDBACK/Source_Index. Source_Index is
in FEEDBACK itself, not in EVIDENCE. Its four images concern other F-points;
no Swift numeric cap is derived from them. Current rules were read again
after main advanced; active checks now use Node.js.

## Results and exact scope

| Evidence directory | Version | Outcome |
| --- | --- | --- |
| [sandbox-attempt/results.json](sandbox-attempt/results.json) | Initial b2a1f440 | Execution restrictions; no claimed gameplay PASS |
| [baseline/results.json](baseline/results.json) | Initial b2a1f440 | Context/probe and 2 native UI checks PASS; 9 standard DOM checks timeout |
| `standard-elevated-retry/` | Initial b2a1f440 | Separate standard Forge-contracts retry also times out; full process/DOM/stderr retained |
| [cdp-baseline/results.json](cdp-baseline/results.json) | Initial b2a1f440 | 6 gameplay/save checks PASS; 3 reload checks fail on CDP navigation; 3 expected negatives caught |
| [cdp-retries/results.json](cdp-retries/results.json) | Initial b2a1f440 | All 3 reload checks PASS after transport handles intentional navigation |
| [current-standard/results.json](current-standard/results.json) | Current 0bcce84 | Both native Forge UI checks PASS; standard Forge contracts timeout |
| [current-cdp/results.json](current-cdp/results.json) | Current 0bcce84 | Context/probe, 9 gameplay/save checks PASS; all 3 expected negatives caught |

Every directory preserves per-command stdout/stderr, timestamps, exit/error
status, source/harness identity and failure artifacts. The original failures
are retained. These are baseline observations, not cap-feature acceptance.

The nine focused existing scenarios are `forge-contracts`, `forge-effects`,
`forge-chronology`, `forge-save-reload`, `forge-backup-restore`, `forge-recovery`,
`support-stacking`, `buff-timing` and `buff-save-reload`.
Existing negatives: `self-test-bad-assertion`, `self-test-chronology-regression`
and `self-test-parity-regression`; each completes with a real failed QA result
and exit 1, rather than being accepted merely because of timeout or a crash.
The native UI scenarios are `forge-ui-mobile` and `forge-ui-reduced-motion`;
their existing driver measures 360/390px and other Forge items. It does not
cover every required 320/390/430px Swift cap/large-text state.

## Reproduction

On the recorded current baseline, from the repository root:

```bash
node docs/qa/swift-recovery-cap-001/baseline-probe.cjs
node docs/qa/swift-recovery-cap-001/run-baseline-checks.cjs --output new-standard --scenarios forge-contracts,forge-ui-mobile,forge-ui-reduced-motion
node docs/qa/swift-recovery-cap-001/run-baseline-checks.cjs --cdp --output new-cdp
```

Use a new evidence directory to avoid overwriting recorded output. Node 24.19.0
and Chromium 151.0.7922.173 were observed. Node is tooling, not the supported
product WebView. Browser/server access is required; the initial restricted
execution failed before valid QA completion.

[baseline-probe.cjs](baseline-probe.cjs) executes selected unchanged production
functions with state/UI/save stubs. It proves uncapped plans, actual charge
rate, cycle values and historical rounding ambiguity; it does not run the
full motor or save persistence. It allows only the two explicitly observed
source hashes. Prices already exceed Number's safe-integer range at raw
single-price level 77; no exact unbounded refund is claimed.

[run-baseline-checks.cjs](run-baseline-checks.cjs) is JavaScript orchestration.
It invokes the existing current Node.js checks unchanged. Its historical
fallback uses the unchanged old harness only when reproducing b2a1f440;
those Python files are not copied into this proposal or restored as active tools.

[cdp-dump-dom.cjs](cdp-dump-dom.cjs) is a supplemental local transport: it
launches the same installed Chromium with a CDP pipe and returns the actual
completed page DOM. The existing harness still verifies QA JSON, scenario,
runtime markers and exit. It tolerates only specific CDP navigation errors
while intentional reloads occur. The previous transport's exact bytes are
preserved as [cdp-dump-dom.initial.cjs](cdp-dump-dom.initial.cjs).
Tests, fixtures, assertions, game bytes and production time rules are unchanged.
There is no claim that this transport constitutes the standard CI gate;
the CLI timeout remains unresolved and must be addressed before accepting
a future implementation's required standard checks.

## Limits and next action

SUPPORT_UPTIME_001 must supply the shared timing contract. Lead must settle
C/T and explicit legacy value policy and coordinate the writer checkpoint.
Raw levels alone do not prove historical Shard debit: one 5x purchase from
level 0 costs 434 Shards; five singles cost 436. The design describes this
and the canonical/recovery/backup/restore-loop risks without inventing a refund.

No Swift product change, cap migration, Android build, signing change,
release, new WebView60/device/TalkBack evidence or feature integration exists
in this proposal. The feature remains open and this chat is not archived.
The local TXT/ZIP delivery contains the task, original request, design,
raw evidence, manifest and a Git patch for a coordinated writer checkpoint.
