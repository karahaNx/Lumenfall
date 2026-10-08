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

Continuation at the user's request to test here: an isolated Android8.1/API27
WebView61 emulator is now available. The absence above describes the earlier
checkpoint. APK134 advanced-save startup failed on unsupported replaceChildren;
PR54 fixes that DOM path and both reproduced PR51 P2 findings. Its revised
bc33707 uses monotonic processing time and queues prompts across another midnight,
with failing first-candidate and passing revised regression evidence. The current
feature-chat workflow supersedes the older writer-release ceremony. Historical
02_07 uncertainty is preserved, not used as a global gate. Corrected release and
native results follow verified PR54 integration; acceptance remains open.

PR55 fixes a second native finding:135 completes the original8h transaction,
but CSS inset leaves Continue off-screen on WebView61. Its exact head
a12459c0c62ec459fc102fc50ebc95a2a574a92b passes CI37654060758/job112904558428
(all133 scenarios/12 required negatives/guarded startup). Connector merge/update
returned internal errors; the CLI API was unavailable. A normal non-forced Git
merge/push integrated the validated head at891f4a4484197702848a3cd7b1cb51b1ff645c96.
GitHub confirms PR55 merged and the whole tree equals the validated head. No
gate/protection changes were made. The normal push queues Android run37655590959,
number136. Functional overlay/intro positioning uses legacy longhands; product
JavaScript is byte-identical to actual135. New signed-release/native verification
and the documentation checkpoint remain necessary before delivery.

Final continuation: PR56 validated head187e09f1a44e7baf3e5af83d2f7c480d2a265628, full CI37663184859/
job112936048840133/12, is integrated at1ffdc5e3af37754bf0541207caab3a6bb4537e51; whole tree equals
validated head. The single equivalent rgba color fixes actual136 modal paint.
The automated review evidence finding is addressed by187e09f committed corrected
136 adapter/pass receipt. Later historical adapter findings are disposed by
hash-pinned guarded future136 reproduction (not rerun) and actual137 composite
runtime-asserting/distinct-state restore acceptance. The older backup result
proves export/UI reload only; raw executed adapters/receipts are preserved.
No independent human review is claimed.

Normal main publication produces signed137 in run37665516076, same package/
certificate, APK SHA25644f0bc792ad3510f006019fba6182b5551f17c8e18d9e2fc8f6816da474148f5. Official signature/identity/CRC/all15 assets,
actual extracted V8 6.0 full matrix, signed in-place136→137 storage preservation
and actual137 native600s UI/lifecycle/failure/recovery/backup/processing checks
PASS. Full native8h remains separately136 proof on identical game JavaScript.
Physical exact WebView60/TalkBack checks remain pending under original point7.
[Final release evidence](../qa/offline-catchup-001/android-137/README.md).
PR52 saves current status/evidence without product/test/mobile/workflow delta;
its exact-head CI and final documentation integration are recorded in its PR
body to avoid a self-referential commit receipt. Shared-file work stops after
that integration; no other writer release is asserted. Feature/chat stays open.
