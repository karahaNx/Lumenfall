# Current-main continuation — RIFT_CAST_TEXT_001

Baseline `214d45411ce2fb420f0e4b372063811a967679b1`, 8 October 2026.
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
