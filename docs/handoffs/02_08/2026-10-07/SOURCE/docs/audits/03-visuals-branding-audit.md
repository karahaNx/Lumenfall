# 03 — UI / Visuals / Branding Audit

_Audit completed: 2026-09-26._  
_Last checked against GitHub `main` immediately before committing: `5183a2da8ec6156138967eaf9faca015172ddab7`._  
_Visual measurements use the application source at `55c0855307773cba50940fb1cbf5fb3c57227ab3`; comparison with the checked main confirms that application code, fonts, branding and the Android workflow are unchanged._

## Scope and evidence

This is the **03 — UI / Visuals / Branding** workstream defined in `docs/CHAT_OWNERSHIP.md`. It covers visual language, branding, startup presentation, mobile layout, artwork, animation, feedback and interaction clarity.

This commit is documentation only. It changes no application code, gameplay rules, balance, assets, save behavior, Android configuration or CI behavior.

Sources reviewed:

- `docs/PROJECT_STATE.md`, `docs/CHAT_OWNERSHIP.md` and `README.md`.
- `branding/README.md` and `branding/lumenfall-mark.svg`.
- `docs/brand-reference/README.md` and all three archived reference images.
- Current UI markup, CSS and relevant rendering, startup, overlay and input functions in `index.html`.
- Branding/resource generation and browser smoke coverage in `.github/workflows/build-android.yml`.
- Relevant findings in the completed 01, 02 and 04 audits.

The audit produced 31 local Chromium screenshots, including startup, fresh Rift, Push/Farm, a populated boss state, Wisps, Lab, active Long Studies, eligible/locked Ascension, Deeds, Cosmetics, Settings, Encyclopedia, Save Backup, tutorial, offline return and daily login. Screenshots are investigation evidence; they are not committed by this documentation-only change.

Push/Farm was inspected at **320×568, 360×640, 390×844, 412×915 and 844×390 CSS pixels**. Light and dark system appearance were compared at 390×844. Font bytes used for the final measurements were checked against repository blob hashes.

Dense layouts were exercised with synthetic saves. Repeating interval callbacks were suppressed in the layout fixture to keep combat/progression stable; CSS animations and normal rendering still ran. Startup and offline-return views were also inspected with normal timers. These fixtures test layout combinations, not whether a particular build occurs naturally or is balanced.

No JavaScript page errors were recorded in the layout matrix. This does not establish gameplay correctness, sustained performance or native compatibility.

### Limits of this audit

No physical Android device or installed APK was exercised. Native splash, launcher masks, Android font scaling, gesture navigation, cutouts, keyboard behavior, TalkBack, GPU performance and frame pacing remain device-QA requirements. Not every unlocked/maxed/claimed state or animation combination was executed.

Findings below distinguish measured browser behavior, source observations and proposed design changes. Suggested type sizes and touch targets are project design targets, not a claim of accessibility certification.

## Current visual direction

Lumenfall is a portrait-oriented fantasy idle RPG presented through a compact WebView interface:

- Dark navy/purple surfaces, warm gold, violet and distinct currency colors.
- Moonlit ruins and regional environmental accents around faceted SVG creatures.
- Cinzel for the brand and selected headings, Manrope for interface text, and IBM Plex Mono for numeric values.
- Five persistent navigation destinations: Rift, Wisps, Lab, Ascend and Deeds.
- Layered cards, fine borders, gradients, glows and small status badges.
- Wisp portraits, creature silhouettes, boss regalia and animated combat feedback.

The strongest direction is the Rift scene: a recognizable central enemy, environmental depth, HP, party and progression context. Supporting screens are more conventional stacks of upgrade cards and explanatory text.

The stylesheet contains several successive visual passes: base styles, premium polish, mobile safeguards, fixed navigation, retention/feedback layers and the final Rift art direction. These layers are not yet one coherent component system.

## Current branding state

The production source of truth is **`branding/lumenfall-mark.svg`**, the Rift Crystal:

- A luminous faceted crystal.
- Open gold arc framing and a curved gold orbit.
- A deliberate replacement for the retired cross-like sigil.
- Intended production background `#081027`, gold near `#E6B759` and violet near `#8C78FF`.

The HUD and startup use this SVG directly. The Android workflow rasterizes the same source for launcher/adaptive-icon and native splash assets. Adaptive-icon padding is handled by the generation pipeline. This is a sound single-source branding arrangement; the mark should not be manually redrawn for individual surfaces.

The archived references are direction snapshots, not production assets:

| Reference | Stored dimensions | Intended use |
| --- | --- | --- |
| App icon | 160×160 | Ornate crystal/gold-rift direction |
| Wordmark | 320×107 | Horizontal brand direction |
| Mobile UI | 135×240 | Overall composition and atmosphere |

They cannot establish production typography, spacing, sharpness or mobile legibility. The reference wordmark is more ornamented than the current live text-and-SVG lockup; that difference should be treated as a future brand decision, not permission to replace the canonical mark.

Palette consistency is incomplete. The game shell follows system light/dark appearance while the Rift stage has hard-coded dark colors. Startup and native-related backgrounds also use several different navy/near-black values instead of a shared documented palette.

## Strongest visual areas

1. **Recognizable identity.** The crystal, gold orbit and typography give the project a usable visual anchor.
2. **Rift atmosphere on taller portrait screens.** The scene has a clear focal point, spatial layering and regional props rather than an empty battle panel.
3. **Useful Wisp identity.** Distinct portraits and color accents make the roster easier to recognize.
4. **Persistent navigation.** The five-tab model is compact and familiar; its active state combines color, icon treatment and an underline.
5. **Visible progression context.** Objectives, next-Wisp messaging, boss traits and Formation Bonds explain what the player can work toward.
6. **Ascension consequence disclosure.** The Resets/Keeps comparison is worth preserving.
7. **Existing feedback foundation.** Hit response, damage/resource floats, boss/milestone effects, recruit/rarity/ultimate pulses and Ascend feedback already exist.
8. **Some resilience is already implemented.** Safe-area CSS, reduced-motion rules, background animation pause and Rift scroll locking provide foundations to retain.

The work should refine these strengths, not replace the entire presentation with an unrelated style.

## Weakest visual areas

### 1. Combat space collapses on compact screens

A synthetic boss fixture with five active Wisps, two active Bonds and a party buff produced the following `#enemy-stage` heights:

| Viewport | Enemy/tap container height |
| --- | ---: |
| 320×568 | 0 px |
| 360×640 | approximately 47 px |
| 390×844 | approximately 189 px |
| 412×915 | approximately 260 px |
| 844×390 | 0 px |

The small-screen result is not merely less decorative: the central enemy disappears or becomes tiny, and Guardian Tap loses its normal target area. In landscape, several fixed-height elements visibly collide.

Rift main scrolling remained locked in the measured Push/Farm views. The failure is therefore **content allocation within the fixed viewport**, not a reason to remove the scroll lock.

The dense reproduction seed used Rift 30, `maxDepthEver: 90`, active party Ember/Void/Stone/Titan/Tide, all Wisp levels set to 20, Ember rarity 2, a 20% party buff and representative nonzero balances. It is a stress fixture, not a recommended gameplay build.

### 2. Typography shrinks below practical reading sizes

Computed values include:

| Element | Size |
| --- | ---: |
| Party Wisp name | 7.52 px |
| Enemy HP text | 9.44 px |
| Bond summary | 8.96 px |
| Objective detail | 8.96 px |
| Objective title | 10.88 px |
| Boss information | 8.16–9.28 px, depending on viewport |

These are necessary gameplay signals. Making them smaller to preserve every row is the wrong trade-off.

### 3. Repeated card stacks lack task priority

The Wisps screen places introductory text, roster progress and all four Bond rows before the first Wisp's primary upgrade actions. At 390×844, Empower is below the initial visible area, including on a fresh save.

Lab places all ordinary Research ahead of active Long Studies. Deeds mixes daily tasks, achievements, convenience purchases and cosmetics in a long stream. The screens expose systems but do not consistently prioritize the action a returning player wants next.

## UI/UX inconsistencies

### HUD height depends on balances

Currency chips use flex wrapping. Different values and widths produce layouts such as 4+2, 3+3 or 2+3+1 chips. The HUD can consume another row as balances grow, reducing combat space without an explicit layout-mode change.

Use a stable grid and predictable number formatting. Full balances can be available through a detail interaction.

### Toasts cover the bottom navigation

The welcome-gift toast visibly overlaps tab labels/icons. Its `bottom:22px` placement conflicts with navigation that is at least 48–54 px tall before safe-area padding.

Place notifications above the navigation's top edge and verify their stacking against overlays.

### Cost icons inherit illustration dimensions

`.node-card .shape` sets 30×30 px and outranks the 9×9 px `.cost-icon` rule. Lab and Ascension price icons consequently become much larger than intended.

Scope the large node illustration separately from nested cost icons.

### Theme treatment is split

System light appearance produces a light HUD and navigation around the dark Rift. Other tabs become light while the combat scene remains dark.

Recommendation: use a deliberate dark Lumenfall default based on the approved direction. If a light variant is retained, it needs a complete, tested design rather than automatic partial recoloring.

### Wisp identity is inconsistent across screens

The roster and combat use Wisp portraits. Encyclopedia still uses the older geometric symbols. Reuse the same portrait vocabulary while preserving distinct resource glyphs.

### Interaction semantics are incomplete

The enemy tap target and actionable objective are div-based controls. Cosmetic choices are clickable divs. Tab and Queue selection states are not consistently exposed as semantic selected/pressed states. Settings has dialog semantics, but the smaller tutorial/return/daily overlays do not share that treatment.

Focus entry, containment and return are not systematically managed for overlays. This is a source-observed accessibility gap; TalkBack behavior requires native verification.

### Gameplay language needs the owning workstream

The 02 audit identifies ambiguity in Wisp power, Tank roles, currency sources and Auto-Ascend depth. Visual changes must not invent a new rules contract to make labels easier to write.

Also review the presentation of “Best now” Bonds when their members are still locked and the omission of Shards from the visible Ascension Keeps list. Resolve authoritative wording with 02.

## Screens or flows that still feel like a prototype

- **Wisps:** a long configuration sheet where explanation and secondary systems precede the main upgrade.
- **Lab:** repeated generic node shapes, oversize price glyphs and active timed work buried below Research.
- **Deeds:** several unrelated jobs in one undifferentiated scroll, with important future rewards far down the page.
- **Cosmetics:** small swatches and many “???” cards communicate little about the visual reward being earned.
- **Offline return:** one paragraph contains currency totals, boss retreat, saved Push position and completed research.
- **Daily return:** a second modal follows the offline modal, adding another interruption before play.
- **Save Backup:** mechanically useful but visually dominated by raw save text and two similarly prominent operations.
- **Compact/landscape Rift:** content compression looks like the desktop-style card layout has been squeezed rather than deliberately recomposed.

These are presentation assessments, not a proposal to add more systems.

## Readability and mobile usability issues

Besides the small type and collapsing combat area:

- Push/Farm buttons measure 27–34 px high depending on screen height.
- Field/Bench, Queue and quest-claim controls are approximately 32 px high.
- Settings controls are approximately 40×40 px.
- Lab bulk selectors are approximately 34 px high.
- Locked and unaffordable states rely heavily on opacity, weakening already small explanatory text.
- The viewport disables user zoom, so zoom cannot be relied upon as a reading fallback.
- Detail strings often use ellipsis; the player needs an accessible route to any necessary full information.
- Compact-screen rules hide party labels and objective detail, while still allowing essential combat space to collapse.

Suggested design targets:

- Primary UI text: generally 14–16 px.
- Necessary secondary text: at least 12 px.
- Primary interactive target area: 48×48 CSS pixels, including an invisible hit area where appropriate.
- A deliberate minimum budget for the enemy/tap area; 120 px height is a proposed compact-layout starting target to validate.
- Stable HUD rows and no overlap among fixed navigation, notifications and essential controls.

These targets require recomposition and progressive disclosure, not uniform scaling of the current screen.

## Animation and feedback gaps

Feedback already exists; the gap is hierarchy and coverage.

- Routine numbers, ability effects, buffs, objectives and milestones can compete for attention. Reserve the strongest treatment for meaningful events.
- The first-goal milestone covers the central encounter temporarily while the welcome toast covers navigation. First-start feedback needs a calmer sequence.
- The startup lasts about 3.25 seconds before its leaving transition and can recur after a three-hour cooldown. It is skippable, but the skip label is small and faint. Returning players should reach their results quickly.
- Offline earnings deserve structured numeric rewards, with retreat and completed-study information separated from the main gains.
- Locked, unaffordable, active and maxed states need a consistent visual grammar and readable reasons.
- Reduced-motion CSS and starfield handling exist. Their complete interaction with startup, dynamically created combat effects and transitions has not been behaviorally verified.
- Effects have not been profiled on a physical Android device. Do not equate browser screenshots or CSS animation presence with smooth or battery-efficient behavior.

## First-impression risks

1. A small phone can show little or no enemy in a dense state, undermining the game's central fantasy.
2. Six currencies and numerous systems are presented before the new player understands their immediate purpose.
3. The first useful Wisp action is below explanation-heavy content.
4. A phone using light system appearance sees a different overall product identity from the approved dark reference.
5. New-player milestone and reward feedback can obstruct the scene and navigation.
6. Marketing/reference expectations may exceed the implemented artwork: the archived ornate wordmark/icon should not be presented as proof that the full app already has that level of finish.

The existing Rift 3/next-Wisp goal is valuable. Keep a clear immediate objective while reducing competing information.

## Long-term visual retention risks

These are design risks, not measured retention outcomes:

- Eight Wisp identities, a small creature silhouette vocabulary and repeating regional treatment may become visually familiar quickly.
- Progression often changes numbers and badges more than the visible encounter or character presentation.
- Long repeated card lists make late-game management feel administrative.
- Cosmetic rewards are poorly previewed, reducing anticipation.
- Routine glows and frequent feedback can make genuine milestones less distinctive.
- Layered CSS overrides make future visual additions fragile; the cost-icon collision is a concrete example.
- Showing impressive new art in a cramped or unreadable layout would amplify inconsistency rather than fix it.

Improve differentiation through existing regions, portraits, boss presentation and cosmetic previews before proposing new gameplay content.

## Prioritized visual recommendations

| Priority | Recommendation | Intended result |
| --- | --- | --- |
| P1 | Recompose compact Rift layouts and reserve enemy/tap space | Essential combat remains visible and operable without vertical Rift scrolling |
| P1 | Stabilize HUD rows and currency sizing | Balance changes do not unexpectedly shrink the scene |
| P1 | Raise necessary type sizes and touch targets | Routine play is readable and comfortable on a phone |
| P1 | Fix toast placement and nested cost-icon selectors | Remove confirmed overlap and hierarchy defects |
| P1 | Add proper control/state semantics and overlay focus handling | Critical interactions remain usable with assistive navigation |
| P2 | Consolidate the palette, typography and component states | One consistent Lumenfall identity |
| P2 | Prioritize active formation and Empower on Wisps | The common action is reachable immediately |
| P2 | Surface active Long Studies and simplify Lab hierarchy | Timed work and next actions are easy to scan |
| P2 | Organize Deeds and restructure Ascend/return summaries | Rewards, consequences and destinations are clear |
| P2 | Reuse Wisp portraits and provide better cosmetic previews | Consistent recognition and stronger reward anticipation |
| P3 | Improve region, Wisp and boss visual differentiation | More visual progression without adding gameplay rules |
| P3 | Tune startup and effect intensity against device measurements | Clear feedback with controlled motion and rendering cost |

## Recommended implementation order

### UI-01 — Mobile layout foundation

Fix HUD stability, compact Rift composition, target sizes, toast placement and cost-icon scoping.

Preserve the Rift scroll lock. Move secondary Bonds/buff/objective details into accessible expandable information where necessary. Do not hide essential state without a way to inspect it.

Affected production scope should be limited to the relevant CSS, markup and UI-rendering sections in `index.html`. Coordinate portrait/orientation policy with 00 and 01; do not silently change Android behavior to conceal layout failures.

### UI-02 — Shared visual language and accessible components

Introduce consistent semantic tokens for surfaces, text, spacing, borders, resource accents and actionable states. Keep the approved crystal source.

Adopt the agreed dark-theme policy, reuse Wisp portraits, and address control semantics/focus in each touched component. Avoid adding another global override layer.

### UI-03 — Wisps and Lab task hierarchy

Put active formation and Empower first. Make Bonds, Rarity, Modules and Ultimates available through a clearer secondary hierarchy. Surface active Long Studies above the ordinary Research list.

Preserve costs, queue behavior, unlock rules and the five-Wisp cap. Coordinate any wording about build recommendations with 02.

### UI-04 — Ascend, Deeds and return flows

Lead Ascend with the gain and keep Resets/Keeps explicit. Organize Deeds into understandable destinations or sections. Present offline currencies and run results as separate, readable items.

Any combined daily/offline flow must preserve reward application and lifecycle behavior and be reviewed with 01/02. Improve backup/restore presentation without modifying the persistence contract in a visual PR.

### UI-05 — Artwork and motion refinement

Once component dimensions are stable, improve regional silhouettes/props, Wisp and boss differentiation, cosmetic previews and milestone emphasis.

Coordinate native icon/splash usage with 01. Validate motion and performance with 04 before increasing rendering complexity.

## Acceptance criteria and workstream handoff

Before approving visual implementation:

- Test fresh and dense saves at all agreed supported portrait sizes.
- Include five active Wisps, multiple Bonds, active buff, long boss text, luminous encounters and long formatted balances.
- Verify enemy/tap space does not collapse and HP, mode and primary information remain visible.
- Verify HUD row count remains stable as balances grow.
- Retain no-scroll Rift behavior while allowing other tabs and modals to reach their final actions.
- Verify readable unavailable/locked states and explain why an action cannot be taken.
- Keep notifications above navigation and ensure modal/keyboard interactions remain usable.
- Test control names, selected states, focus movement and reduced motion.
- Verify physical Android safe areas, font scaling, rotation policy, splash, icon masks and TalkBack.
- Check frame pacing and rendering cost on an actual supported device before expanding effects.
- Preserve existing runtime DOM hooks and relevant regression guards.
- Do not alter combat results, formulas, currencies, unlocks, save schema or offline payouts as a side effect of visual work.

The existing CI browser smoke test checks a narrow startup render and the scroll-lock class. It is not a visual regression gate and does not detect the measured enemy-container collapse.

Ownership:

- **03:** visual language, layout, artwork, animation, UI semantics and presentation.
- **00:** cross-workstream scope, shared-file coordination and implementation priority.
- **01:** native orientation, safe areas, icon/splash pipeline, lifecycle and save mechanics.
- **02:** gameplay meaning, authoritative copy, rules, costs and progression.
- **04:** state/screenshot matrix, regressions, physical Android accessibility and performance validation.

Use small feature branches for implementation, refresh main before each phase, and merge after relevant CI/QA is green. Avoid a simultaneous full rewrite or file split of the shared `index.html`.

## Recommended next visual task

Start with **UI-01: mobile layout foundation**. The first reviewable change should prove that a populated boss encounter remains readable and tappable on a compact portrait screen.

Additional artwork should follow that proof. It cannot compensate for a combat area that has no space.
