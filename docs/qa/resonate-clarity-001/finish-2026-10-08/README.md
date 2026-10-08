# Publication check evidence, 8 October 2026

Baseline b0537cb; source SHA25627c73b6dc1d0911bd557b32fe8e90bce3d8d4a0056302cb11e2c89f1bc5720f8.
Browser/source/context/tooling/APK-self-test, registered scenario, seven unchanged
existing scenarios and three expected negative controls passed. The unchanged
baseline fails the explanation assertion. New folding fixture first failed from
an unexposed constant in the test; corrected test passes with real reload.
That diagnostic is retained in test-fixture-scope-failure.json.

V8 results execute the unmodified product script with DOM side effects stubbed;
real normalization/handler/save code runs. No physical/WebView DOM/TalkBack claim.
All18 screenshots and complete raw DOM are in raw-evidence.zip; RAW_MANIFEST.json
records every archived payload. Selected screenshots remain directly viewable.
The explicit CDP adapter is retained for unchanged legacy harness scenarios.
Final integrated/CI/APK results will be recorded separately.
