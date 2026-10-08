# RIFT_COSMETICS_001 continuation, 8 October

Own checkout `/workspace/RIFT_COSMETICS_001`, branch `feature/rift-cosmetics-001`.
User authorizes finish, GitHub integration and creating needed tests. No messages
or subagents. Live AGENTS assigns delivery to owner; historical Lead freeze is
obsolete. Original sources and acceptance are in the task document.

Current base `31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6`, PR77 Save Backup,
PR76 Formation, PR80 Resonate, PR84 Auto-Ascend and PR90 upgrade owners. Rebase
CSS conflict combined upstream upgrade styles with F24; no removals. Current
product SHA256 `8efe1e90c1216627dbb47392aa36a6e5c9e4031a7ab7c196478eec734f193e71`.
PR79 head `5cc602af3dc5093ba76dd54127392090fb55a9ee`. Current required CI
37743831575/job113200522573 running; Google Chrome154.0.8037.57 now passes
Resonate, incoming upgrade/Auto-Ascend cases progressing. CI37735266911 caught
region backgrounds; removed fixed palette
overrides and added six-region regression. CI37737975796 passed152 scenarios,
then new driver stalled at Target.createTarget: Chromium launcher was preferred
over working Google Chrome. Driver now follows established suite's browser order
and records executable/stderr. Full required rerun must pass before integration.
CI37740747361 passed incoming Formation cases but Resonate chose the broken
Chromium154.0.8037.0 launcher and stalled at browser-context creation. Its driver
now also follows the suite's Google Chrome order; local13 records pass. 305b832
had no new CI because newer main caused a merge conflict; latest rebase resolves
that conflict. Logs preserved as gzip; no assertions or CI gates weakened.

Focused168 records PASS on this combined product, Chromium151/Node24.19,
upgrade-candidate/results.json. Includes six themes, nine mobile/text/motion
profiles x three enemy states, persistence/reload/recovery/restore, native browser
touch/Enter/focus, region palettes and both F27 Comet layers. Tooling, source and
Formation native/contract checks pass. Save Backup12-profile and three layout15-
profile evidence predates Formation/Resonate; full CI rechecks incoming scenarios.
Local recovery adapter failed on navigation, not an assertion; failure recorded.
V8 6.0 legacy engine test passes current product (not WebView DOM evidence).

Native60 environment now created on separate API25 RiftWebView60 with pinned
LineageOS60.0.3112.78 (Git blob569b28e, SHA256dd0a6f2...). Provider replacement
needed explicit block-device remount and extracted x86/x86_64 JNI libraries.
Actual running game UA confirms Chrome60.0.3112.78. Signed143 prepared baseline
now PASS, native60/baseline-native.json: Ember + both Comet layers survive real
cold launch. API27 baseline remains intact in its own AVD.
Resolved QA failures: old CDP method uses Page.addScriptToEvaluateOnLoad;
direct storage fixture writes lost to visibility/unload autosave, so fixtures now
use actual backup Restore (+confirmation on new APK) and its production reload
guard. Cold launches isolate hooks; interval wrappers use IIFE-local captures.
Old143 does not immediately persist a clicked theme when periodic saves are
paused (old-no-immediate-save.json); old baseline is instead imported with Ember
already selected. New APK must pass immediate selection. Canonical accepted
seed data can be reused without expensive private debugger scope enumeration;
fresh emulator falls back to real freshState/accept/catalog handles. No APK edits.
Current native driver is uncommitted while CI runs; commit at delivery checkpoint.

Isolated native environment: SDK `/tmp/rift-cosmetics-android/sdk`, AVDs
`/workspace/scratch/rift-cosmetics-android/avd`. API27 RiftCosmetics on5554/5555,
Android8.1 with actual WebView61.0.3163.98. Signed APK143 baseline was installed
and selected Ember + both Comet cosmetics survived an actual cold launch.
AVD userdata retained. API26 RiftCosmetics60 was tried; actually WebView58 with
no allowed provider configuration, unusable for acceptance. Stopped that AVD.
Native driver operates only on qemu, uses real product initialization/handlers,
no APK instrumentation. Baseline and initial resolved QA binding failures are
under native/. Latest user instruction is in REQUIREMENTS.txt.

Next: pass exact-head full CI, recheck main, merge PR79, verify integrated behavior
and automatic signed APK. Download exact build, compare all15 HTML/font/branding
assets against integrated source, check package/version/established cert, then
run native-rift-cosmetics.cjs accept with baseline143 userdata,54 theme/state/
width observations, Android font_scale2 and Enter. Investigate actual60 without
claiming61/V8 is60. Persist immutable APK and final receipts/task/own PROJECT_STATE
status via delivery PR. Archive only own chat after actual required acceptance;
do not invent a physical/TalkBack gate from optional old guidance.
