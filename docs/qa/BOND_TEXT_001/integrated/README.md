# Integrated BOND_TEXT_001 verification

PR61 merged at210005d0ae093d21e846bae41a9bddf25af2800d. All product, behavioral,
tooling, scripts, mobile and game-asset bytes equal validated head a4f6186;
CI37710741132 SUCCESS148 default scenarios/12 required negatives/guarded smoke.
The main-only delta at integration is concurrent documentation.
Downloaded job113095814926 log is retained in ci-37710741132.txt.gz.

Fresh integrated run PASS14 positive checks and3 negative controls, including
native Chromium mobile touch/keyboard/scroll, formula/role/pacing, Formation,
chronology, parity, save/reload/backup/recovery. Source hash
1e0d51370b5b62f313dad6953f9b26bb7d7a1a886785dbccc6dfaac379779981.
See identity.json and regressions.json plus scenario TXT logs. The reproduction
script excludes the local dump-dom wrapper when selecting the native pipe driver.

Updated-main mobile/source comparison is in ../current-main/. Android141
identity/assets/installed UI and actual V8 6.0 checks are in ../android/.
Physical exact WebView60/TalkBack acceptance remains open. Self-review and
existing automated gates are recorded; no independent review is claimed.
