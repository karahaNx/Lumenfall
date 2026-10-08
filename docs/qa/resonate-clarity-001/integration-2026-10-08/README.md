# Integrated Resonate delivery,8 October 2026

PR80/e2f745c, product SHA256ed7e9dc56ee3d068073c9fade277a2b357561d754d13de593420c1da0b27d96d.
`integrated-results.json`: source/context/tooling/APK-self-test,12 Resonate
profiles, seven existing scenarios and three expected negatives PASS.
`preservation.json`:13 unchanged bodies versus immediate main parent4ff0ae3.
`ci-combined-153.txt.gz`: full feature CI153/14/guarded smoke PASS;
`ci-before-pr77.txt.gz`: earlier152-source run PASS, retained as historical.
`android-build-146.txt.gz` preserves the signed build/release log.

`release-receipt.json`, `apk-146-identity.txt`, `apk-assets.json` and extracted
`apk-v8-results.json` identify signed APK146, stable package/certificate,
15 exact asset matches and Chrome60-generation engine checks. Extracted APK
passes the same12 browser profiles. Raw logs/DOM/all36 screenshots are in
`raw-evidence.zip`; `RAW_MANIFEST.json` records archived payload hashes.
Selected screenshots remain directly viewable. `run-integrated-checks.cjs`
and `check-apk-assets.cjs` reproduce available checks from the exact checkout.

The full159-scenario integrated-source CI must pass before this delivery
checkpoint merges. Final run/commit/result are recorded in PR80's linked
publication PR; additional final raw evidence is retained on this feature's
delivery branch. `DEVICE_ACCEPTANCE.txt` and `device-environment.json` explain
remaining required phone/WebView60/native large-text/TalkBack acceptance.
Feature/chat stay OPEN; no independent review or native acceptance is claimed.
