# Actual-engine Prism validation

Product source remains SHA2565131f9fbafdfe4e5feab69c5bb52ae5dba1363cc1eeef4cd7c02d376d6500cf9.
No further product edits accompany these additional tests.

On local Node22.16.0, the full production IIFE passes3506 checks across180
synthetic payout combinations, real manual/authoritative live and offline
Auto-Ascend, actual Swift purchase/debit, cold load, actual backup restoration,
primary corruption/recovery, failed-write retry and yielded offline rollback.
Only DOM presentation is stubbed. This is not browser layout/native acceptance.
The exact policy oracle uses independent BigInt arithmetic outside the app.

A separate real8h replay on the repository's existing historical fixture passes
302400 kills and14400 Ascends:23 Prisms each,331200 earned, plus the preexisting
2810-Prism offline-policy refund. The obsolete86400-earned assertion therefore
fails for the intended new reward policy. The full offline regression now checks
the actual payout against the independent oracle, retains the old exact86400
control on a labelled legacy-reward counterfactual, and compares every other
state field exactly. Its frozen historical clock/economy oracle remains hashed
and unchanged; only the current-side comparison restores the old reward block,
alongside its already-existing four-Bond counterfactual. No assertion is removed
and no runtime/clock tolerance is relaxed. Fresh complete CI remains required.

The local browser attempts are NOT TESTED: an organization-policy Blocked page
prevented navigation before game load. Timeout/nonzero exit is not evidence that
negative controls caught a gameplay defect. GitHub's existing browser environment
is the acceptance path. Native WebView60, physical Android/TalkBack and final APK
acceptance remain open. Main/PR102 are unchanged; no APK is published.
