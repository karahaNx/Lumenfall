# All27 phone acceptance — use only after the complete signed build is published

Build version, APK SHA256 and integrated commit: pending. This checklist does
not mean the candidate is released or that phone acceptance has passed.
First export a backup of the player's current save. Test an existing save and a
separate fresh save, including restart and background/foreground transitions.

| # | Feature | Observable acceptance |
|---|---|---|
|1|Ascend Prisms|Preview matches the actual increase for first, repeated and higher cleared Rifts; factors and rounding are understandable.|
|2|Auto-Ascend|Buy in Deeds, operate in Ascend; choose219 or another earned Rift from one dropdown; changing the target preserves ON/OFF; clearing the selected Rift triggers once.|
|3|Rift hints|Show/Hide preserves currency, Boss HP and tap-area positions; long/large text remains readable; hidden text receives no focus.|
|4|Wisp upgrades|Unfinished Mythic/Module/Ultimate tracks stay visible despite insufficient currency; folding appears only when all three are complete.|
|5|Resonate|After all Ultimates, spend25 Sigils for100 ability resource; three uses shared per run; reload cannot restore spent uses.|
|6|Lab display|One current level/title; remaining time and speed inside progress bar; one accessible Speed up panel; bonus explained before Start.|
|7|Lab speed queue|Remember the exact tier separately from Queue; each next paid level pays its own full speed price; insufficient Motes leaves it running1x.|
|8|Rift ability text|Visible ability names and charge bars; no repeated CAST labels; accessible status remains available.|
|9|Formation autosave|Field/Bench saves selected Push/Farm/Boss immediately; other presets stay intact; empty and pending presets survive Ascend and restart.|
|10|Formation Bonds|Eight distinct Bonds explain partners/effects; overlapping pairs activate correctly; Push/Farm/Boss offer useful choices.|
|11|Bond text|Partner names appear in Formation Bonds; generic ability descriptions still explain abilities without partner requirements.|
|12|Wisp roles|Older Wisps remain useful at comparable spending; contribution display distinguishes damage, support, Bonds and resources.|
|13|Support uptime|Tide/Aurora have visible downtime; new buffs last1s or1.5s with Ultimate in live and offline play.|
|14|Swift Recovery|Cap10; direct, bulk, Max and Queue cannot buy another ineffective level; existing excess is refunded once.|
|15|Echoing Rest|Cap6; effective offline rate stops at100%; historical excess is refunded once.|
|16|Cheaper Bonds|Cap20; recruiting cost floor is40%; historical excess is refunded once.|
|17|Backup controls|Export/Restore sit beside Save/Reset; export then restore reproduces progress and does not repeat refunds.|
|18|Forge text|No redundant “No level cap” filler; actual effects/prices remain visible.|
|19|Rift cosmetics|Every earned choice visibly changes Rift and survives restart; reduced motion and tapping still work.|
|20|Loadout Memory|Forge multiplier persists without purchasing a Comet unlock; the retired50-Comet purchase is refunded once.|
|21|Offline12h|Long absence awards at most12h of combat and paid Lab work; retired hour purchases are refunded once; restart does not award the consumed tail.|
|22|Comet replacements|Pending final approved unlocks: price, one-time purchase, visible behavior and persistence must match the published contract.|
|23|Progression|Pending final matrix/pacing: fresh, middle and late progression exercise all eight systems without a compulsory Comet gate.|
|24|Upgrade identity|Pending final matrix: Forge/Lab/Tree effects have distinct jobs and clear stacking; old purchases retain their approved value treatment.|
|25|Lab exclusives|Pending final matrix: unique effects, paid time and independently paid speed tiers work across offline completion and reload.|
|26|Forge exclusives|Pending final matrix: existing three cap10 upgrades remain correct; verify the agreed Forge identity, prices, unlocks, stacking and purchase-value transition.|
|27|Tree exclusives|Pending final matrix: prestige effects are unique; new-run/recruitment grants occur once and cannot repeat on loading or preview.|

Record each item as pass/fail with device model, Android/WebView version, build
version and a concrete reproduction. Do not mark an untested item complete.
