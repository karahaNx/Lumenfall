# Lumenfall — optional technical guidance

Each feature has one owner chat under [the feature workflow](project/FEATURE_WORKFLOW.md).
The user's task defines scope; the owner handles all necessary disciplines.
There is no permanent Lead/worker hierarchy, default role or separate writer grant.
These legacy filenames remain so existing evidence references still resolve.

Read only guidance relevant to the feature; none is mandatory startup context.

| Topic | Guidance | Use when |
| --- | --- | --- |
| Architecture and integration | [Architecture](agents/00_LEAD.md) | Scope, dependencies, checkpoints, integration |
| Android and persistence | [Android](agents/01_CORE.md) | Save infrastructure, lifecycle, APK identity, signing |
| Gameplay and simulation | [Gameplay](agents/02_GAMEPLAY.md) | Combat, progression, economy, Lab/Forge, parity |
| UI and visuals | [Visuals](agents/03_VISUALS.md) | Mobile UX, accessibility, graphics, branding |
| Testing and debugging | [Testing](agents/04_QA.md) | Reproduction, regression, failure paths, runtime |

Concurrent features use isolated branches/worktrees and coordinate actual file
overlap and integration. Review results apply to their precise version and scope;
reassess relevant checks when code or dependencies change. Historical ownership
references do not assign current permissions or globally block new features.
