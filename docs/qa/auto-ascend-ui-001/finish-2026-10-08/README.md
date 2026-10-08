# AUTO_ASCEND_UI_001 — integrated delivery checkpoint

PR84 merged at1282f0c. Its unchanged required CI37740305483 passed all160
scenarios,14 negative controls and guarded browser smoke on source2398a750.
The branch and integrated game/test/tooling bytes match; the integrated28
focused cases and mobile checks were renewed. GitHub automated code/security
review reported completion without review comments; no human review claimed.

The following main integration, PR90, superseded build147. Signed APK148 from
build37742868726/job113197564966 contains commit31eccfb and sourcef99cb0bc.
The original Auto-Ascend feature does not own PR90's upgrade/clock changes.
On the APK148 source,23 positive cases/five causal negatives,20 mobile/text/
motion profiles and54 V8 6.0.286.52 handler assertions PASS. Node24.19.0 and
Chromium151.0.7922.173 ran locally; required CI used Chrome154.0.8037.57.

[Immutable APK148](APK/Lumenfall-0.1.148.apk): SHA256
cef6c291a4f91a3921bdc3b2d2e6f772906d39560f995fcaedf420ccd9972657.
Package com.lumenfall.app, version0.1.148/code148 and established certificate
A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21
are verified. All15 assets match exact Git source and all526 ZIP entry CRCs pass.

Native update143→148 PASS: installed APK and loaded product source match the
verified bytes; actual WebView storage is byte-identical before first launch;
ownership, OFF and Rift219 persist. Native controls are still being checked.
Early observer failures are test-driver limitations: saveState replaces its
canonical object, so every observation now obtains the current closure handle.
Legacy frame-eval cannot access all variables. UiAutomator cannot export this
emulator's active hierarchy; native picker selection uses Android keys and
actual popup-focus evidence. No product asset/handler is replaced for these checks.

The saved logs are gzip-compressed exact output. Earlier prefixes retain their
source labels; formation-combined is6482a85c, resonate-combined/integrated is
2398a750, and apk148 isf99cb0bc. The initial local source receipt in the parent
folder remains historical. See checkpoint.json and native-update.json for
supported identity/phase facts. The final interaction record is pending.

Commands (repository root):

    node tests/behavioral/run-auto-ascend-ui.cjs --evidence-dir OUT --pipe-browser-dir ADAPTER
    node tests/behavioral/run.cjs --web-root mobile/www --scenario auto-ascend-target-mobile
    node tests/behavioral/run.cjs --web-root mobile/www --scenario auto-ascend-target-reduced-motion
    node docs/qa/auto-ascend-ui-001/verify-apk-assets.cjs APK EXTRACTED COMMIT
    node docs/qa/auto-ascend-ui-001/native-auto.cjs accept APK EXTRACTED/index.html OUT 148

The local CDP adapter executes existing assertions and does not prove default
dump-dom/virtual-time CI equivalence. Native mode requires the isolated API27
emulator and a prepared signed143 baseline; resume binds the existing update
receipt and repeats controls without reinstalling or resetting the application.
Emulator61 is separate from [required affected-phone/WebView60/TalkBack](../DEVICE_ACCEPTANCE.txt).
Keep the feature/chat OPEN until required acceptance is saved.
