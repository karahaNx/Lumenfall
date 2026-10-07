# OFFLINE-CATCHUP-001 integration and release

The user followed the publication request with:

> then finish the job

This instruction and the original feature mandate authorize completing the
review, integration, established Android build/publication, verification and
durable GitHub handoff for this feature and its requested JavaScript migration.
It supersedes the earlier publication-only stop. The historical 02_07 writer
release remains unknown; this decision does not assert that a handover occurred.
PR46 and the B2 candidate remain outside scope and were not changed.

Before integration, main was `b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
All 52 advertised branches, open PRs and recent workflows were inspected.
PR46 remained Draft at `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`;
no competing active run or changed baseline was observed.

Self-review covered the scheduler, atomic timestamps, isolated working state,
endpoint commit, cancellation/retry, primary/recovery failure and stale return
callbacks. Immutable original-oracle comparisons, browser return-flow tests,
the full regression suite and completed negative controls provide the recorded
review evidence. This is self-review; no independent reviewer approval is
claimed. The user prohibits subagents and message tools.

[PR51](https://github.com/karahaNx/Lumenfall/pull/51) passed exact-head
[CI37625068008](https://github.com/karahaNx/Lumenfall/actions/runs/37625068008)
at `bd71a8608d133f99971a74a79e300e1f5db254df`, was marked ready and merged
with that expected head into `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
The integrated tree exactly matches the validated PR head. Integrated source,
context and archive checks pass. No game/test/script/workflow delta was
introduced by the merge.

The normal main push automatically produced Android **0.1.134** in
[run37626819252](https://github.com/karahaNx/Lumenfall/actions/runs/37626819252),
which completed successfully at 13:15:58 UTC on 7 October 2026. No dispatch,
replacement signing identity or native package change was introduced.
The downloaded public APK was verified with official Android build-tools35
`aapt` and `apksigner`: package/version, established certificate, v1/v2
signatures, ZIP CRC and all 15 product/font/branding assets pass.

Release and raw CI/build evidence are preserved in
[`../qa/offline-catchup-001/release/`](../qa/offline-catchup-001/release/README.md).
The APK's actual extracted product also passes the V8 6.0 eight-hour probe.
These checks do not establish Android lifecycle, WebView60 DOM or TalkBack
acceptance. There is no connected Android device/emulator in this environment.
The original request explicitly requires keeping the feature open until
required physical-device acceptance is recorded.

The final documentation checkpoint changes only status, decisions and evidence;
it does not match the Android build path filters. Its verified publication
releases this owner's repository writer scope while device acceptance remains
pending. No other writer is declared released. Recheck live state before any
later acceptance-recording write. No next feature or chat archive is authorized
by a partial acceptance result.
