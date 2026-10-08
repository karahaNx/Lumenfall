# Formation autosave — 8 October integration and delivery

Game integrated via PR76/c5fa497; signed APK0.1.145 released and installed-app
update/input/Ascend/cold-launch checks PASS. Required physical-device/exact
WebView60/TalkBack acceptance remains OPEN. See [delivery receipt](DELIVERY.md)
and [remaining device checks](DEVICE_ACCEPTANCE.txt).

Current baseline: main b0537cb46635555ba2c2e5f3f95bc8fc276aeda5,
tree080eb52968f1861ebf76c6f5abfa1e910b036ef2. Candidate rebased while retaining
all integrated Lab/B2/offline, Wisp/Bond/Rift and Comet changes.

`baseline/` contains the existing main Formation reconstruction, persistence and
Core QoL runs. `focused/` records current source SHA256, commands/exits and
targeted autosave/Ascend/recovery/browser input checks. `integrated-focused/`
repeats these on c5fa497; `current-main-focused/` checks the later Resonate
combination. `android/` holds actual signed APK145/native receipts. Earlier
7 October evidence is historical.

Publication/integration is explicitly authorized by the user's current request.
Available integrated checks are recorded separately from remaining physical
Android/WebView60/TalkBack acceptance. See the task for the next action.

Initial PR76 CI37734955018 passes157 scenarios/12 negatives and guarded startup;
`ci-initial.json` preserves its checkout/source/steps and result lines. Main then
integrated PR77 at261b1b7 (Save Backup placement and confirmed restore). This
main update merged cleanly into the isolated F14 branch; no upstream UI or gate
was removed. `combined-focused/` repeats Formation/save/chronology, 12 mobile
browser profiles and the current Save Backup UI checks against the combined
source. `combined-v8.json` repeats133 assertions/three causal controls and Comet
validation on unchanged product scripts in V8 6.0. `ci-final.json` records final
full CI158/14/all gates PASS. Mobile browser input is separate from the actual
API27/WebView61 installed-app work in `android/native-acceptance.json`.
