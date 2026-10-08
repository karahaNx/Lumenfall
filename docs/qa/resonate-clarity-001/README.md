# Resonate clarity — implementation and delivery evidence

[Feature task](../../tasks/RESONATE_CLARITY_001.md): game implemented via PR80 and
signed APK0.1.146; required physical/WebView60/native large-text/TalkBack OPEN.

- [7 October preparation](local-evidence-2026-10-07.md): original local results/raw archive.
- [8 October publication](finish-2026-10-08/README.md): refreshed baseline, negative explanation control, registered test and raw evidence.
- [Save Backup combination](combined-2026-10-08/README.md): source aac674c…,12 profiles, Save Backup driver and V8 6.0.
- [Integration/release](integration-2026-10-08/README.md): exact main/APK identity, fresh checks,15 matching assets, CI logs and device checklist.

Reproduce: `node tests/behavioral/resonate-clarity.cjs --evidence /tmp/resonate-ui`
or `node tests/behavioral/run.cjs --web-root . --scenario resonate-clarity`.
The registered check follows the selected web root. Raw test evidence is never
staged as game content. The historical default dump-dom timeout and explicit
CDP adapter remain documented; ordinary GitHub CI uses its configured browser.
