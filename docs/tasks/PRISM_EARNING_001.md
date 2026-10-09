# PRISM_EARNING_001 — improvement 01

Prism implementation on `feature/prism-earning-001`; baseline main67373faa.
User mandate: improve returns, preserve paid value, one improvement at a time,
ONE final APK. Integrate only into PR102 development, never directly into main.

[Policy and proof](../qa/prism-earning-001/DESIGN.md).
[Closeout, ROI, raw evidence and remaining limits](../qa/prism-earning-001/CLOSEOUT.md).
Repeat:20% base plus full earned bonus, rounded once. Exact boundary arithmetic;
first/new-depth/full-cap policies and saved purchase values remain. Static intro
now agrees with the new rule. No wallet/schema/price/scheduler/Android changes.

Head859de734 full CI37916978016 and focused37916977961 PASS. Same reward code:
341654 numeric,3506 state,6651 browser checks. Closeout37925122359 PASS:12 mobile
profiles/468 checks,V8 6.0/3277 checks,180 ROI rows. Old helper failures preserved.
Intro copy corrected by65a6b060; final combined-source rerun remains required.
Next: verify development integration and its existing UI changes with full gates.
Physical Android/TalkBack/final APK remain untested; do not claim whole-economy
balance. PR102 expansion beyond task01 is not implemented by this checkpoint.
