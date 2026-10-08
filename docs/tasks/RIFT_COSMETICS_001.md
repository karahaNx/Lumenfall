# RIFT_COSMETICS_001 — visible Deed cosmetics on Rift

Status: PR79 open; required CI and final APK acceptance pending.
Owner: this chat, /workspace/RIFT_COSMETICS_001, feature/rift-cosmetics-001.
No subagents/messages. Current AGENTS/workflow assigns delivery to owner;
historical Lead/writer freeze is superseded. No new binding rule.

## Original goal and sources

F24: show every earned and selected cosmetic on Rift; preserve HP readability,
Guardian Tap, 44px controls, focus/contrast and static reduced-motion effects.
Separate unlocked from selected. Original: “Når det kommer til deeds cosmetics,
så synes jeg ikke de effekter man låser op er synlige ved rift skærmen.”
Original requirements take precedence over suggestions.

[User corrections](RIFT_COSMETICS_001_REQUIREMENTS.txt) authorize implementation,
GitHub integration, app delivery and creation of needed tests.
Read [original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt),
AGENTS/bootstrap/ownership/visual guide/PROJECT_STATE/workflow/context index.

## Baseline and scope

Historical baseline/candidate: [7Oct evidence](../qa/rift-cosmetics-2026-10-07/README.md).
Current main baseline14d5f3a3a78fe8b63cfa5544efc54f41217b65a5 merged into
own branch. Preserve Guidance, F27, Save Backup, Formation, Resonate,
Auto-Ascend, upgrades, Loadout Memory and Offline12h. Conflicts retain upstream.
PR46/B2 verified merged via PR57/20aaae62; F27 PR69 layers/toggles preserved.

Files: index.html, focused behavioral test, required CI step, own docs/helpers;
Resonate browser fallback repair retains upstream CLI and assertions.
No new unlocks/prices/rewards/caps/schema/migration by F24. Preserve deterministic
purchases, Luminous rewards, chronology/live/offline/queues/save, WebView60,
com.lumenfall.app and signing. Test incoming schema2 refund without changing it.

## Behavior and acceptance

| Theme | Existing unlock | Visible effect |
| --- | --- | --- |
| Starlight | Built in | Existing regional artwork/aura |
| Ember Veil | d50 | Orange dashed rings, warm glow |
| Void Bloom | asc5 | Violet nested hexagons |
| Aurora Pulse | mythic | Rose/teal curves, gentle pulse |
| Solar Crown | d250 | Gold rays/crown |
| Radiant | modulemax | Six currency-colored arcs, slow orbit |

Decorative SVG is pointer inert/accessibility hidden. Caption contrast15.41:1,
away from HP/name. Reduced motion keeps static shapes; all six regions retain
their palettes. Native pressed buttons distinguish “Unlocked · Select” from
“✓ Selected”; earning does not select. Selection immediately saves both copies.
Known locked preferences remain saved, with effective Starlight until earned.
Rendering never grants unlocks or mutates the saved preference.

Acceptance: six themes x normal/boss/Luminous; unchanged HP/name/tap geometry;
320/390/430px, 130%/200% text, keyboard/touch/focus, 44px, contrast/reduced motion;
primary/recovery/reload/corruption/restore; independent F27 layers; full required
CI; integrated checks; signed APK identity/assets/update and Android acceptance.

## Evidence and next action

[Checkpoint](../qa/rift-cosmetics-2026-10-08/CURRENT_CHECKPOINT.md) and
[checks](../qa/rift-cosmetics-2026-10-08/checks/) contain exact versions/failures.
Current product SHA256 c84660dd0849a9c101184cd3d242bf2ec0ec0ac1a7d33c20a009d5558e7a9da1.
Focused168 PASS; source/tooling/V8 checks PASS. Checkpoint records browser versions,
CI failures/fixes and prior Save Backup/Formation/region checks; no gate weakened.
Created isolated API25/pinned LineageOS WebView60.0.3112.78: signed143 cold launch
preserves Ember/both Comet effects. Final APK pending. Native upgrade verifies
documented140-Comet offline24 refund once, preserving raw history/cosmetics.
No physical/TalkBack/independent review claim. Modern tests cover reduced motion.

Next: push combined candidate, pass required CI, integrate PR79, verify integrated
game/signed APK on actual60, archive APK/evidence and update own PROJECT_STATE.
Keep open for missing acceptance; archive only this chat after verified delivery.
