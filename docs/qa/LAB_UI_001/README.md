# LAB_UI_001 validation

Current baseline: b0537cb46635555ba2c2e5f3f95bc8fc276aeda5.
This evidence replaces the earlier private B2 proposal as current acceptance.
Source, tooling and native Lab baseline checks pass. Rebased source/task/tooling
checks, ES2017 parser and byte-level non-presentation statement comparison pass.
The simulator, payments, save/recovery and native bridge match the fresh baseline.

[RESULTS.json](RESULTS.json) binds these scoped results to source SHA256
efd89f017cf118c0febb90b4d6952b8993d3d43ce558f6312ddb682844c3c935.
The real-browser checks pass at 320/390/430px × 100/200% root text × normal/reduced
motion (12 profiles), with keyboard/touch, focus, hidden/expanded accessibility
tree, >=44px controls, fill-independent contrast, 0/50/99.999/100% bar text,
long durations and exact live 60-Motes purchase. Four representative screenshots
show closed cards and the expanded panel; enlarged text wraps within Lab bounds.
Existing header branding has limited space at 320px/200%; outside this patch.

The 19 existing Lab/Inquiry/duration/clarity/navigation regressions pass via
lab-ui-regression.cjs using the current fixtures/assertions. Raw outputs are
native.txt.gz, reduced-motion.txt.gz and regression.txt.gz; baseline/source/tooling
logs are also retained. The full default local attempt hit an existing-style
Chromium151 dump-dom timeout in wisp-upgrade-display (no result, not an assertion
failure); the diagnostic is retained. Required ordinary GitHub CI remains a
separate integration gate. No weakened gates or skipped default scenarios.

No physical Android, exact WebView60 or TalkBack acceptance is claimed yet.
