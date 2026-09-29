# P2-06A — Rift region and boss identity

Base: `7471dd65909c1bb7ae6dfedba2ceee4521c67f9e` (PR #27 merged).
Owner: 03 — UI / Visuals / Branding. Draft delivery; no merge authorized.

## Current-source audit

This audit reads current CSS, inline SVG, rendering, progression feedback and
the existing behavioral/accessibility/viewport contracts. It is a source audit,
not a completed screenshot or physical-device acceptance review.

| Finding | Player/visual impact | Risk and mobile implications | Priority |
| --- | --- | --- | --- |
| Final stage gradient overrides the six earlier region backgrounds; all regions share the same dominant ruin arch | High: travel reads mainly as a tint change | Low: replace decorative SVG within the same absolute layer | First |
| Bosses share one crown and shoulder silhouette; trait palette selectors can lose to the base glyph selector | High: encounter identity is weak | Low: existing trait classes can select bounded decorative artwork | First |
| Wisp portraits are already unique, with active-first hierarchy, explicit role copy and accessible disclosures | Medium: identity/progression framing can improve | Medium: compact card hierarchy and accessible identity must remain intact | Next part |
| Existing milestones, Ascension, recruitment and Ultimate feedback already exist | Medium: feedback consistency needs rendered review | Medium: authoritative simulation and older damage paths must not be confused when connecting effects | Later part |
| Decorative idle, dust, startup and attention animations already exist | Performance review needed before adding effects | Device performance is not established by browser tests | Add no ambient loops here |
| Deeds/return/backup remain dense presentation surfaces | Medium | Higher: preserve reward application and overlay focus/continuations | Separate bounded follow-up |

P2-06A covers regions and boss identity. P2-06B should audit/refine Wisp identity
and progression framing; a subsequent part can address milestone/reward motion
after checking the live presentation path. These are presentation subdivisions,
not new gameplay tasks. P2-04 remains deferred; P2-05/P2-07 are outside scope.

## Implemented scope

- Use each region's existing landscape palette in the final stage gradient.
- Preserve the Verge ruin arch. Introduce five separate static landmarks:
  branching ash canopy, faceted glass outcrops, observatory rings and waterline,
  pointed basilica architecture, and eclipsed sky with floating crown fragments.
- Select exactly one landmark using existing region attributes. Existing 25-Rift
  cycling and Echo naming remain authoritative and unchanged.
- Give Regrowth branching antlers, Fractured Core separated crystal shards, and
  Guardian's Mark its crown/armour. Correct trait palette specificity and give
  boss encounters a static double arena border.
- No production JavaScript changes, timing changes, new effects or new state.
- No header/control/HP/objective dimensions changed. Landscape remains
  `aria-hidden` and pointer-transparent; regalia remains decorative. Existing
  text still communicates region and encounter identity without color alone.

## Assets and performance

Artwork is inline SVG in `index.html`, extending the existing vector system.
No bitmap downloads, fonts, dependencies, native assets or logo changes.
No new timers, animation loops, filters, blur, particles or event handlers.
Only the active region/trait group is displayed. Shapes remain inside the
existing fixed-size, clipped scenery and glyph containers.

This bounds the incremental work but does not prove Android frame pacing or
battery performance. Rendered review and device performance remain acceptance
items. Reduced-motion behavior is unchanged because no motion is added.

## Validation and review

The existing 20 viewport executions now additionally render 16 presentation
states each: all six regions, deeper echoes and each boss trait. Assertions
retain no-scroll, combat hit area, text/touch/HUD/HP/toast checks and add current
landmark/crest selection, palette distinction, decorative semantics and exact
gameplay-state equality before/after rendering. Existing test assertions are
not removed or weakened.

Local browser execution is unavailable: no Chromium binary is installed and
the browser download returned an HTML Site Unavailable page. User approved
CI-first delivery through a Draft PR. Static checks run locally; the existing
pre-merge workflow is the browser validation gate. The PR must remain Draft
until CI and rendered inspection are complete. A green automated run alone
does not establish visual quality or physical-device accessibility.

Deferred: Wisp/power framing, cosmetic previews, reward/milestone feedback,
return/Deeds/backup hierarchy, and real-device performance review. No gameplay
defect has been established by this source audit.
