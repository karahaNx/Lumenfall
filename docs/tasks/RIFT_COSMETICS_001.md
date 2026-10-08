# RIFT_COSMETICS_001 — visible Deed cosmetics on Rift

Status: PR79 open; focused checks pass; required CI and APK acceptance pending.
Owner: this chat, /workspace/RIFT_COSMETICS_001, feature/rift-cosmetics-001.
No subagents/messages. Current AGENTS/workflow assigns delivery to owner; the
historical Lead/writer freeze is superseded. No new binding rule.

## Original goal and sources

F24: show every earned and selected cosmetic on Rift; preserve HP readability,
Guardian Tap, 44px controls, focus/contrast and static reduced-motion effects.
Separate unlocked from selected. Original: “Når det kommer til deeds cosmetics,
så synes jeg ikke de effekter man låser op er synlige ved rift skærmen.”
Original requirements take precedence over suggestions.

[Owner request and corrections](RIFT_COSMETICS_001_REQUIREMENTS.txt):
8 October “Finish the feature task push to github implement to game” and
“If theres not a test, then create one” authorize implementation, tests,
GitHub integration and app delivery.

Read: [original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F24/dependencies/save revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt),
plus AGENTS/bootstrap/ownership/visual guide/PROJECT_STATE/workflow/context index.
Original images address other feedback, not cosmetics.
Model/effort recommendation GPT-6.1 Sol/High; running variant unverified.

## Baseline and scope

Initial b2a1f440, then0bcce84; frozen 7 October candidate6c79ebc is historical
([evidence](../qa/rift-cosmetics-2026-10-07/README.md)).
8 October resumed from b0537cb46635555ba2c2e5f3f95bc8fc276aeda5.
Current base 31eccfbad40622f65cf3d34d268f0d7ef3c6a4a6 includes PR77 Save Backup,
PR76 Formation, PR80 Resonate, PR84 Auto-Ascend and PR90 upgrade owners.
CSS conflicts preserve upstream controls/styles plus F24; F27 layers were combined.
preserve all upstream code/tests and recheck main before integration.

PR46/B2 verified merged via PR57/20aaae62. F27 catalog/equipment integrated via
PR69; preserve prices, purchases, marks, Trail/Crest toggles and both visible layers.
F07 Guidance layout is separate (PR81); cosmetics remain inside the existing
attack button. PR67 overlaps a broad proposal; do not adopt it. Only this goal
and necessary regression/test/delivery fixes are included.

Files: index.html, focused tests/behavioral/rift-cosmetics.cjs, one required CI
step, own task/evidence. A one-line Resonate test browser-order repair is necessary
for merged-main validation; it changes no assertions or Resonate product behavior.
No new unlock/price/reward/currency/cap/schema/migration. Preserve old purchase
value, saved preferences, deterministic purchases, documented Luminous rewards,
handler/bulk/queue, chronology and live/offline/save recovery contracts.
Keep WebView60, package com.lumenfall.app and established signing.

## Behavior and acceptance

| Theme | Existing unlock | Visible effect |
| --- | --- | --- |
| Starlight | Built in | Existing regional artwork/aura |
| Ember Veil | d50 | Orange dashed rings, warm glow |
| Void Bloom | asc5 | Violet nested hexagons |
| Aurora Pulse | mythic | Rose/teal curves, gentle pulse |
| Solar Crown | d250 | Gold rays/crown |
| Radiant | modulemax | Six currency-colored arcs, slow orbit |

Decorative SVG is pointer inert and accessibility hidden. Opaque caption has
15.41:1 contrast, away from HP/name. Reduced motion keeps static geometry.
All six regional palettes are preserved. Deeds use native pressed buttons,
“Unlocked · Select” and “✓ Selected”. Earning does not select. Selection saves
immediately to primary/recovery. Known locked preferences remain saved but show
Starlight until earned; rendering never grants unlocks or changes saved value.

Acceptance: six themes x normal/boss/Luminous; one earned effective selection;
unchanged HP/name/tap geometry; 320/390/430px, 130%/200% text, keyboard/touch/focus,
44px, contrast/reduced motion; immediate saves, actual reload/corrupt-primary
recovery/backup restore; independent F27 layers; relevant checks/full required CI;
integrated verification; signed APK assets/package/version/cert and Android tests.

## Checks and next action

[Current continuation](../qa/rift-cosmetics-2026-10-08/CURRENT_CHECKPOINT.md)
and [raw checks](../qa/rift-cosmetics-2026-10-08/checks/) record exact sources,
commands, versions and failures. Current source SHA256
2d8ec37a57c84c30455dbf4f8d81834cd6191aa352927e02808331389b2f6cc1.
Focused168 records PASS (chrome154-wrap/results.json), Google Chrome154.0.8037.57:
162 mobile measurements plus region, persistence, input and negative contracts.
Combined Save Backup12 profiles, Formation native/contract, source/context/tooling
and V8 6.0 engine fixture PASS. Actual browser touch/Enter and reload paths tested.

CI37735266911 caught a region palette regression; removed overrides and added
coverage. CI37737975796 passed152 scenarios, stalled at own browser startup.
CI37740747361 passed the incoming Formation cases but failed Resonate's Chromium
startup. Both drivers now follow the suite's Google Chrome selection order.
CI37743831575 passed168 gameplay scenarios, then found large-text card overflow
on runner Chrome154. Add wrapping to card rows, names/descriptions and status;
local same-version browser passes (different binary/platform from runner).
Own check now runs before expensive full suite; all mandatory gates retained.

Signed143 baseline cold-launch passes API27/WebView61. Exact60 environment is now
created from a pinned historical LineageOS provider on isolated AOSP API25;
signed143 cold launch preserves Ember and both Comet effects on actual60.
Final APK acceptance is pending. Provider setup/CDP failures are preserved.
No physical/TalkBack or independent-review claim. Baseline large-text region
heading/Guidance movement limitations are outside this goal.

Next: publish repaired test setup, pass required CI, merge PR79 against checked
main, verify integrated game and signed APK/update, persist final receipts and
own PROJECT_STATE status. Keep open for missing required checks; archive only
this chat after verified delivery.
