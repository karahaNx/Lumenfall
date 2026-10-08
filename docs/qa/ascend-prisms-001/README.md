# F05 — Ascend Prisms evidence

The approved new-depth rule is reconciled with current main on 8 October.
Fresh validation/publication are in progress; historical 7 October receipts
below attest only their recorded candidate, not current integration/device acceptance.
Owner/task: [ASCEND-PRISMS-001](../../tasks/ASCEND_PRISMS_001.md).
Rule and verbatim approval: [decision](../../decisions/2026-10-07-ascend-prisms-rounding.md).

## Version and test boundary

Baseline main: `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, index SHA256
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
Candidate index SHA256:
`281626d522b8d7c5a293bd4f7a94a83772a225fd04ea5d4a65d03cb4f5d39b30`.
Earlier APK133 index SHA256:
`f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
The initial and current main Ascend numeric functions are identical.

Actual browser: official Google Chrome155.0.8059.39, binary SHA256
`9bfb381296dffe75f3419d07b6cc64525105ed117d1453a4ef3b291cb97d2b58`.
Node24.19.0 was used locally; active tools target Node20+.
The installed Chromium151 hung on about:blank, so the official Chrome155 Debian
package was downloaded and extracted into a temporary directory without a
system installation. This does not attest Android WebView60.

Browser tests execute the actual game's complete script and DOM. Controlled
hooks suppress autonomous timers, install synthetic states, observe closed
functions and drive the authoritative simulation. They do not replace the
reward or simulation functions. Oracles use the independently expressed
accepted formula. Browser state fixtures are not the user's save.

## Findings and coverage

- Before the fix, cleared Rift 16/benchmark 15/Lab level 0 pays 2 at Swift level 0 and1 at Swift level 1.
  The actual browser preview and manual/live/offline payouts agree on this bug.
- Approved new-depth rounding keeps 2 after the purchase and leaves first/repeat
  rewards unchanged in the controlled old/new matrix.
- 673 complete browser cases, 11,822 assertions pass on the candidate. They cover
  no bonus, Tree, completed Lab, both, first/repeat/new-depth, unlock, whole-Prism
  thresholds, high depths, manual/live/offline, farm return depth, actual boss
  clear, pending/completed study boundaries and timestamp collision order.
- A separate 1,224,300-comparison canonical scan observes 102,762 decreases under
  the old rounding and zero under the approved rule. It is not full motor/device
  acceptance for each of those comparisons.
- Old/new comparison: 94 of 673 rows increase by 1; remaining rows unchanged. All
  changed rows are new-depth rewards; no first/repeat changes in this matrix.
- Permanent `ascend-prisms-contract` adds 4,723 assertions, including independent
  explicit thresholds, the real Swift regression and live/offline parity.
- Actual save reload, backup restore and corrupt-primary recovery scenarios
  retain the reward benchmark and both bonus levels and pay the previewed5.
- Five local layout profiles: 320/390/430px, 320px with 130% font, 390px with 130%
  font and reduced motion. All695 checks pass. Calculation/table/page have no
  horizontal overflow; the action stays before the explanation and at least44px.
- Synthetic reported-bonus hypothesis cleared Rift 20/benchmark 219/Swift level 17/Lab level 18
  pays first 28 or repeat 5. Swift level 18/Lab level 19 remains repeat 5; Lab level 20 becomes6. This
  supports the rounding explanation and does not reproduce the user's save.

The user's actual benchmark, cleared progression depth, precise bonus levels
and save bytes remain unavailable. The earlier reported +50 at Rift20–30 is
unresolved. No new minimum purchase reward, rebalance or save migration is added.

## Reproduction commands

Use a supported working Chrome executable on PATH. All new scripts are JavaScript.
Run from the repository root; keep output directories separate from product files:

```sh
node docs/qa/ascend-prisms-001/probe.cjs index.html /tmp/f05-probe --policy=new-depth-ceil
node docs/qa/ascend-prisms-001/layout.cjs . /tmp/f05-layout
node tests/behavioral/run.cjs --web-root mobile/www --scenario ascend-prisms-contract
node tests/behavioral/run.cjs --web-root mobile/www --scenario ascend-prisms-save-reload
node tests/behavioral/run.cjs --web-root mobile/www --scenario ascend-prisms-backup-restore
node tests/behavioral/run.cjs --web-root mobile/www --scenario ascend-prisms-recovery
node docs/qa/ascend-prisms-001/validate.cjs /tmp/f05-validation
node scripts/codex/check_context.cjs --archives
```

Set `LUMENFALL_CHROME` to the browser path for the probe/layout/validation
scripts. The existing behavioral runner selects Chrome from PATH. `validate.cjs`
stages exact root HTML/fonts/branding in a separate temporary directory and
runs the existing full workflow gates plus five F05 causal controls. For a
single behavioral command, first stage current HTML/fonts/branding into
`mobile/www` as the workflow does. Each command accepts one scenario; repeating
`--scenario` only selects the last argument.

The four bonus/payout/repeat mutations and restored old rounding rule are
permanent negative scenarios named `self-test-ascend-prisms-{tree,lab,payout,repeat,rounding}`.
They must fail their intended assertions, not time out or fail to start Chrome.
All existing required harness controls also remain mandatory.
The workflow now also runs the five F05 controls on every applicable PR.
`validate.cjs` retains complete stdout, stderr, exit/status and hashes for each.

For historical source comparison, run `probe.cjs` against the appropriate
unmodified baseline HTML without the policy flag. The two prepare scripts can
reconstruct the candidate from the exact baseline in separate directories:
UI first, then approved rounding. They are reproduction helpers, not new policy
approval or a safe automatic merge into arbitrary later main.

## Receipts and unresolved gates

Final local validation passed on 7 October 2026 at 14:06:51 UTC:
[24 process steps](evidence/validation/receipt.json), 136 named default scenarios,
156 PASS lines including additional viewport instances, all 12 existing required
negative controls and all 5 F05 controls. Source/tooling/APK-verifier self-test
and browser runtime smoke pass. The APK-verifier self-test is not an APK build
or identity verification for this candidate. Final
[validated input hashes](evidence/meta/validated-inputs.json) and
[baseline formula identity](evidence/meta/baseline-formulas.json) are preserved.

The `evidence/` directory contains selected raw outputs, results and process
receipts, with gzip preserving original raw bytes. Its manifest records both
stored and uncompressed hashes. Final `validation/receipt.json` controls local
full-gate acceptance. Initial failed validation is preserved: a new test hook
assumed a scenario argument when the full-suite command had none. The guard
was fixed; product bytes were unchanged for that correction.

Verify retained receipts after checkout with
`node docs/qa/ascend-prisms-001/evidence.cjs verify docs/qa/ascend-prisms-001/evidence`.
Compressed entries can be read using Node's `zlib.gunzipSync`; the manifest
lists each original size and SHA256. `evidence.cjs collect NEW_OUTPUT LABEL=DIRECTORY ...`
creates a new byte-checked collection; it does not overwrite old evidence.

## 8 October continuation

Current baseline: `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
PR46/B2 is merged and the current feature-owner workflow removes the historical
writer gate. The user asked “Finish the task push to github”. The actual fresh
full-motor probe passes 673 rows/11,822 assertions. Fresh full validation, scoped
self-review, PR CI, integration and APK/native evidence will be added here.
No independent review, physical WebView60 or TalkBack claim is made.

Current source SHA256: `f3aa5bb55db62b492d00d25725c9101c013ef010b73ae0fa1e20e28a3992ce28`.
[Fresh raw receipt collection](live-evidence/manifest.json): motor673/11,822,
layout695, permanent contract4,723 and3 persistence routes PASS. All17 negatives
and guarded smoke PASS ([post receipt](live-evidence/current/post/receipt.json)).
V8 6.0.287.53 passes168 cases/2,215 assertions; V8 6.2 is supplemental.
The full local wrapper timed out at900s after55 PASS instances and2 offline UI
failures; the same daily-rollover timeout reproduces on unchanged main.
Raw outputs and failed receipt are retained; this is not a full-suite pass.
The helper allows30min for the larger suite and an explicitly selected
`--post-behavioral` mode; CI gates are preserved.

Automatic approval review rejected several opaque compressed DOM dumps because
it could not verify sensitivity. All42 redundant HTML snapshots are omitted
from the published historical collection. Original-manifest bytes and each
omitted hash are retained; raw stdout/stderr, JSON results, process receipts and
source remain. The complete original local collection and TXT/ZIP were preserved.
No approval rejection is bypassed and no check result is changed.

APK/native helpers: `apk.cjs` verifies release digest, identity and all15 source
assets; `native.cjs` requires an isolated emulator and both expected APK digests,
binds actual installed bytes/source and covers a real signed update plus
preview/manual/live/offline and phone/AX. Native execution is pending.
`legacy.cjs SOURCE_HTML OUTPUT_JSON` runs the product on V8 6.0 with no native
DOM/device claim (use the documented legacy runtime). Native tooling uses
Node22+ for its built-in WebSocket; the active project otherwise targets20+.

Publication selection also omits duplicate smoke DOM outputs and two auxiliary
Chrome stderr captures rejected by automatic approval. Manifests record all
omitted hashes; result/step receipts remain. Latest rebase preserves PR84,
Formation/Backup/Resonate and current19 CI negatives. Latest-main motor673/11,822
passes; exact new source/layout/focused receipts follow in the PR checkpoint.
The isolated API27 emulator now boots; native APK acceptance remains pending.

## PR94 current-main checkpoint

Combined baseline91decbc8e26744b21c26a21b20742be6ebca1d8e (PR85);
PR head50df5cdf2ecc0a21165f251e242a31440501e6de. Exact product SHA256
`895e699607de45d87afd292db825d6f82d5eef72895dc61dfa5e0874937eece5`.
[Motor/layout/persistence matrix](combined-evidence/manifest.json):673cases/11,822
assertions,695layout checks and all4 permanent scenarios PASS.
[Current controls](combined-controls/manifest.json):all22 required negative
controls and guarded smoke PASS (25process steps). Existing Backup negatives
now emit native-process JSON; the local wrapper requires their exact mutant
and causal assertion. Its earlier format failure is retained, not a product failure.
The product diff remains42 additions/5 deletions and preserves current upgrade
ownership, legacy paid Clarity levels/work, offline12h refunds, Forge/Formation
memory and relocated Auto-Ascend controls. Self-review found no unrelated
product changes; no independent reviewer is claimed.

[PR94](https://github.com/karahaNx/Lumenfall/pull/94), required CI275/run37747203857
on head50df5cd: in progress. Native bridge calibration originally failed because
WebView61 cannot resolve private lexical names in debugger eval; use the existing
F13 approach: actual closure handles and rebind after state replacement. That
failed harness receipt is preserved. APK/integrated/native acceptance pending.
