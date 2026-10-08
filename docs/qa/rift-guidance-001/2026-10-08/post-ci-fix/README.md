# CI label-fit correction

CI37735423348 failed only rift-guidance-mobile: at320px/200% text, the toggle
failed its full-label fit assertion. All other defaults passed; later negative
controls/smoke did not run. The complete failed log is retained here.

Preserve44px control/46px reservation and text size; increase available maximum
width to70%, reduce padding and line height, and prevent label wrapping. Full hint
text still wraps/scrolls. The assertion is retained with complete font/size/UA
diagnostics; no checks or features are removed.

Corrected source SHA256:3e00ddb3ba57ab5963ec88695e1fd2c62ee08d1b316aafc6dc261349e5e8dcc9.
Chromium151 fresh full matrix PASS:16 profiles/160 measurements,96 themes,
48 Comet cosmetic pairs/16 visible Trials,80 touch scrolls,0px protected shift.
V8 6.0.286.52 parses both product scripts and passes23 guidance assertions.
Source validation PASS. Existing contract replay and full remote CI follow.
Earlier parent receipts accept earlier bytes and stay unchanged.
