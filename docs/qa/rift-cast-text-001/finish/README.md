# Current-main continuation — RIFT_CAST_TEXT_001

Initial continuation baseline `214d45411ce2fb420f0e4b372063811a967679b1`,
8 October 2026. Main subsequently advanced to `0e9b54c8d62a873bd48625f4a20ee18078e8a8f1`;
the task records the rebased identity and required fresh CI.
Product SHA256 `3f201d135b89ceb6f0c518d0094284130f958ee98e6bf20d6821b72a284205be`.
Integration/APK acceptance is pending; see [the task](../../../tasks/RIFT_CAST_TEXT_001.md).
Evidence in the parent directory is historical preparation on a different baseline.

- [Current receipt](current-receipt.json): 12 profiles / 384 F13 observations pass;
  baseline-visible-status and removed-accessible-status negative controls both fail
  at their intended assertions.
- [Candidate matrix](candidate-matrix.json) and [baseline observation](baseline-matrix.json):
  320/390/430px, normal/reduced motion, normal/200% compact text. Eight Wisps and
  four ability states. Names, charge, timing, expiry, observer-only state, native
  keyboard focus and 44px affected controls are checked.
- [Existing checks](existing-checks.json): all 12 scoped scenarios pass. Raw logs
  in `logs/` preserve Rift real casts/mobile/reduced-motion, accessibility contrast,
  support save/reload/backup/recovery/visibility, short parity and chronology.
  The local CDP adapter changes transport only; it does not establish normal CI.
- `logs/default-local-timeout.txt` records the default Chromium151 dump-DOM timeout
  with no completed QA result. It is not counted as PASS.
- `logs/tooling.txt` is the current `node tests/tooling/run.cjs` result. Source
  validation, APK verifier self-test and actual-task context checks also pass.

The same pre-existing large-text overflow elements occur on both versions.
Measured overflow is equal, except one 320px profile improves by 0.1875–0.203125px.
This is checked geometry, not full large-text layout acceptance. A broader compact
party text layout fix belongs to a separate feature. Browser text doubling does
not represent Android font scale or TalkBack. Actual native acceptance and APK
identity must be recorded after release; no independent review is claimed.

Replay the focused driver and existing checks using the parent README commands,
but use this baseline/source identity. Required normal CI remains unchanged.

Normal [CI37708820963](https://github.com/karahaNx/Lumenfall/actions/runs/37708820963)
passes 146 scenarios, all 12 required negatives and guarded startup on the initial
continuation head d75ac294. [Full raw log](ci-37708820963.log.gz) and
[acceptance lines](ci-37708820963-acceptance.txt) survive Actions retention.
This is historical after the clean PR59/60 rebase; new-head CI remains required.

[V8 renderer probe](v8-f13.cjs), [32-state result](v8-f13.json) and the actual
[signed138 baseline](baseline-native.json) are separately identified. The native
driver uses direct ADB protocol to the isolated unauthenticated emulator because
the SDK client requires writing to the read-only user home. [Transport](direct-adb.cjs)
and [native driver](native-f13.cjs) are verification tooling, not product changes.
Private runtime handles and a paused test clock supply fixtures; APK assets stay
unchanged. Reproduce with Node22+ and the isolated emulator's local port5555:

```bash
node docs/qa/rift-cast-text-001/finish/native-f13.cjs prepare BASELINE_APK index.html EVIDENCE_DIR
node docs/qa/rift-cast-text-001/finish/native-f13.cjs accept FINAL_APK EXTRACTED_INDEX EVIDENCE_DIR
```

The first command replaces only the isolated emulator's QA save. The second
compares actual WebView storage across `pm install -r` before first launch and
then checks the real signed app; it must not be run against a user's device/save.
