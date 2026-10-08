# Reviewed keyboard assertion and latest main

Automated review PRRT_kwDOUF0Vls6qPbmK identified a weak predicate in the existing
Rift driver: a prevented Tab could leave focus on the hints toggle and still
pass. Require the exact next nav-spirits control. Add a captured/prevented actual
Tab in the first profile: the same oracle must reject it before the normal Tab
case runs. Product behavior and other assertions remain intact.

Prior head dc0285f passed CI37741048919,160 defaults/14 required negatives and
guarded smoke. That check predates main31eccfb (PR84 Auto-Ascend UI, PR90 exclusive
upgrade owners) and this assertion fix. Preserve all newly integrated product,
migrations and169 current default scenarios. New exact-source verification and
required current-head CI follow; earlier receipts do not accept these bytes.

Source SHA256:480687e98116e68e139402455c70eb21300ef5731a7b72914546e77e8e379011.
Native signed143 baseline now prepared on actual Android8.1/WebView61.0.3163.98,
with separate V8 6.0 proof. Signed feature APK/integrated/native acceptance pending.

Current-source local PASS:16 profiles/160 measurements,0px protected movement,
96 theme/48 Comet cosmetic/16 Trial pairs,80 touch scrolls, minimum Tap121px and
contrast8.2966:1. Rift1,618/navigation255 pass; navigation count follows main's
new Auto-Ascend placement. Existing native mobile driver passes all3 profiles
including the exact next stop and prevented-Tab negative. Review thread resolved.
V8 6.0 parses both scripts and passes23 guidance assertions. CI37744052638 is
running on db6ba6241ccf3d7ec74bd2a1b677c19f387514d6; final acceptance pending.
