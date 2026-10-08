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
