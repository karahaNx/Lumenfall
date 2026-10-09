# Prism task 01 — closeout and development integration

## Scope and protected baseline

Main67373faa and published Android remain unchanged. Task01 is developed in
PR103; PR102 is the separate, unreleased integration collection. User authorizes
one improvement at a time and only ONE final APK. Do not use main as staging.
No full private user backup is included in these commits or artifacts.

## Observed acceptance, before final introductory-copy correction

Product SHA2565131f9fbafdfe4e5feab69c5bb52ae5dba1363cc1eeef4cd7c02d376d6500cf9.
Full pre-merge37916978016 passed all gates on859de734; focused37916977961 passed
341654 numerical assertions,3506 state assertions,6651 actual-browser assertions,
five completed in-page causal failures, and long offline/save regression.

Closeout37925122359 onb3cf376b PASS, all steps:
- Actual Chromium:468 assertions,12 profiles (320/390/430px,100/200% root text,
  normal/reduced motion),72 reward/layout samples. No horizontal clipping in
  measured Prism explanations; unchanged save snapshots on render. Real CDP
  keyboard changes target, real touch switches Auto-Ascend ON, Enter switches OFF,
  real touch Ascend credits4 once into both save slots. Focus/scroll and AX names
  retained. Screenshot and trusted input-event traces are preserved per profile.
- Actual pinned Node8.3.0/V8 6.0.286.52:both complete product scripts parse,
  1248 independently calculated reward cases/3277 assertions/600 storage writes.
  Actual manual payout, paid Tree/Lab retention and backup roundtrip pass with
  BigInt unavailable. This is old-engine execution, NOT native Android WebView.
- Actual price/reward ROI:180 rows/540 checks, independent reward oracle. No
  price edits and no unmeasured minutes/hour claims.

Artifact11614031837 (prism-closeout-37925122359), ZIP SHA256
cc7fc6cc7a19055200a1971478890aab3b13a973e0c886c77690ef45d3226cd1,
expires23October2026. Scripts are committed for repeatability.
Screenshots exposed the old static introductory paragraph still describing the
20%-of-full policy. Commit65a6b060 replaces that one paragraph and adds explicit
regression assertions; numerical and state tests passed before its bot commit.
Full final-source checks must still pass; old-source checks are not relabelled.

## Failures and their correction

37924414516:two new helpers used a non-existent currentDay symbol. Fixed to the
actual todayStr helper; this was a test setup failure, not a game defect.
37924721879:V8 and ROI passed; mobile driver reached34 checks then failed native
Enter. The driver omitted the Enter text event and could race the430ms intro
completion. Complete keyDown/text+keyup and bounded observed intro completion
corrected the driver; trusted event traces and screenshots retained. No assertion
was deleted, programmatic click substituted, or product behavior changed to pass.
These failed runs/artifacts remain evidence. The later clean run is source-bound.

## Upgrade return analysis

Assume repeated fixed cleared Rift20, completed Clarity0, no other price changes.
The actual Swift single price is ceil(3*1.5^currentLevel).

| Current Swift | Repeat payout | Next price | Next payout | First useful level | Total price to useful level | Extra-earnings payback, Ascends |
|---|---:|---:|---:|---:|---:|---:|
|7|4|52|4|9|129|129|
|10|5|173|5|12|433|433|
|20|8|9976|9|21|9976|9976|
|30|12|575254|12|32|1438134|1438134|

At cleared119/Clarity0, Swift7 gives10 on a pure repeat; level8 gives11 for52.
The supplied progression's new-record case119/benchmark89 instead receives14;
repeat and new-record scenarios must not be confused.

Conclusion:protected bonus improves upgrade returns, but exponential prices still
outgrow fixed-depth marginal rewards, and whole-Prism plateaus remain. Do not
claim late-game pricing balanced. Carry this measured finding into the later
Ascension Tree pricing/catalog task; do not silently reprice existing purchases
inside this small reward correction. No automatic +1 per bought level is added.

## Development collection and remaining acceptance

PR102 contains initial color spans and removes retired read-only shop cards.
Its code must be tested with Prism rather than inheriting Prism-only acceptance.
Dynamic wallet refresh and old visibility-test expectations need inspection;
paid ownership/work/purchase-denial assertions must remain intact when adapting
UI assertions to the user's explicitly requested removal of those cards.

Three validation workflows include the exact development collection as a target
so the PR can be tested/merged there without a main push or APK publication.
All previous required gates remain. Final run/head/tree and integration result
will be recorded in PR103/PR102 receipts, not anticipated here.

Physical Android/TalkBack, OS text scaling, native WebView60 and final signed APK
acceptance remain separate and unperformed. Automated V8/Chromium is not a claim
of them. Screenshots also show crowded global header text at200% on320px; this is
outside the measured Prism fields and is recorded for the later shared UI pass.
