# RIFT_COSMETICS_001 — visible Deed cosmetics on Rift

Status: **candidate refreshed; publishing/integration and APK acceptance pending**.
Owner: this feature chat; isolated `/workspace/RIFT_COSMETICS_001`, branch
`feature/rift-cosmetics-001`. No subagents or messaging tools.

## Goal, sources and authorization

F24: show every earned and selected cosmetic on Rift, preserve HP readability,
Guardian Tap, 44px controls, focus/contrast and a visible static reduced-motion
alternative. Keep unlocked and selected distinct. Original: “Når det kommer til
deeds cosmetics, så synes jeg ikke de effekter man låser op er synlige ved rift
skærmen.” Original requirements take precedence over suggestions.

Sources: [owner request](RIFT_COSMETICS_001_REQUIREMENTS.txt),
[original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F24/dependencies/save revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt),
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
These were read at startup with AGENTS, bootstrap, ownership/visual guide,
PROJECT_STATE, FEATURE_WORKFLOW and relevant context links. Original feedback
images concern other points; no cosmetic evidence is inferred from them.

8 October instruction: “Finish the feature task push to github implement to game”.
This authorizes implementation, GitHub publication, integration and app delivery.
Current main's AGENTS/workflow assign delivery to the feature owner; historical
writer/Lead freezes no longer gate this task. No new binding rules are introduced.
Recommended model/effort: GPT-6.1 Sol/High; exact running variant/effort unverified.

## Baseline, scope and dependencies

Original startup main `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, then
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`. Frozen local candidate
`6c79ebc698947a603363ac686e646fba0a032cbf` and its
[7 October evidence](../qa/rift-cosmetics-2026-10-07/README.md) remain historical.
They do not verify the refreshed implementation.

8 October live main baseline `b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`.
Rebased onto this baseline; both cosmetic CSS and button conflicts combine F27
Comet decorations and F24 SVG layers. Preserve all upstream gameplay and tests.
PR46/B2 are integrated via PR57 (`20aaae62a4b6e46f8d75775085918eaba4e8de29`).
F27 Comet catalog is integrated via PR69; retain purchases, toggles and marks.
Open PR67 includes overlapping cosmetic work; this isolated F24 change is based
on merged main and does not integrate that broad proposal. PR66/70 are separate.
Integration must recheck actual current main and serialize overlapping changes.

Product scope: the six existing theme effects, selection/persistence and labels.
Add focused browser regression coverage, one required CI step and own evidence/task.
No new cosmetic unlock, price, reward, currency, cap or schema. No migration:
existing purchase/ownership data and saved preferences retain their value.
Package `com.lumenfall.app`, established signing, WebView60 compatibility,
deterministic purchases and documented Luminous Motes rewards remain unchanged.
Handler/bulk/queue, chronology and live/offline rules remain upstream behavior.

F07 Guidance remains a separate layout dependency. Cosmetics sit inside the
existing tap button; do not alter Guidance flow. Existing 320px large-text region
heading clipping and Guidance-hide movement are recorded baseline limitations.
F27 Rift Trail/Starfall Crest remain independent equipped layers across themes.

## Behavior and acceptance

| Theme | Existing unlock | Visible effect |
| --- | --- | --- |
| Starlight | Built in | Existing region artwork/aura |
| Ember Veil | d50 | Orange dashed rings and warm landscape light |
| Void Bloom | asc5 | Violet nested hexagons and cool landscape light |
| Aurora Pulse | mythic | Rose/teal curved rings and gentle opacity pulse |
| Solar Crown | d250 | Gold rays/crown and warm landscape light |
| Radiant | modulemax | Six currency-colored arcs and slow orbit |

SVG is decorative, hidden from accessibility focus and pointer inert. Caption
uses opaque colors (15.41:1 contrast), below the enemy name and above HP.
Reduced motion keeps the geometry visible and removes pulse/orbit animation.
Deeds buttons show `Unlocked · Select` or `✓ Selected` and native pressed state.
Unlocking a Deed does not select it. Selection saves immediately to primary and
recovery storage. A known locked saved preference is preserved but displays
Starlight until earned; renderer does not mutate saved data.

Acceptance: correct visible effect for all six themes on normal/boss/Luminous;
one earned effective selection; unchanged HP/name/tap geometry; no input capture;
320/390/430px, large text, focus/keyboard/touch, 44px, contrast/reduced motion;
primary/recovery/backup/reload preservation; F27 equipment/purchases preserved;
relevant existing checks and full required CI; integrated verification; signed
APK package/version/asset checks and required Android/device acceptance.

## Checks and delivery checkpoint

Refreshed candidate: `node tests/behavioral/rift-cosmetics.cjs --negative --out
 docs/qa/rift-cosmetics-2026-10-08/candidate` PASS, 167 records: 162 mobile
state/theme measurements plus five persistence/input/negative contracts. Nine
profiles cover normal, 130% and 200% root text; 320/390/430px; normal and reduced
motion. Both Comet decorations remain visibly equipped with every selected theme.
Actual native browser touch attacks through the aura; Enter selects and focus
survives rerender. All six selections preserve economic/ownership data and save
immediately; real page reload, corrupt-primary recovery and backup restore pass.
Hidden-aura negative is detected. Browser Chromium151, Node24.19.

Remaining checks, PR/CI/integration/APK/native identity and evidence will be
recorded here after delivery. This is self-review and automated verification;
independent review is not claimed. Exact WebView60, physical Android and TalkBack
acceptance have not yet been performed for this candidate. Feature remains open
until required acceptance is supported. No other chat is renamed or archived.

Next: run source/context/tooling and relevant F27 regressions, publish PR, pass
required CI, merge with current main, verify integrated behavior and signed APK,
then save final evidence/status. Attempt available native checks; report genuine
missing device acceptance instead of marking a local candidate complete.
