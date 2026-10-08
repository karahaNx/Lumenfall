# BOND_TEXT_001 — Bond partners in Formation Bonds

Updated 8 October 2026. Owner: this BOND_TEXT_001 feature chat.
One goal: show Bond partner names in Formation Bonds and remove partner references
from Wisp ability explanations while preserving each ability's explanation.
Status: current local candidate; integration and Android acceptance pending.

## Requirements and sources

Original F16:

> Der behøver ikke stå i wisp ability at der laves bond med hvilken anden der bliver lavet formation bond, det skal kun stå i formation bond, hvilke wisp der giver bonussen.

[Full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
has precedence over suggestions. Read F16, F14/F15/F17, relevant dependencies,
save/acceptance sections in the
[revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Screenshot 04-17362.jpg was inspected; its APK/save identity is unknown.
User correction on 8 October: “Færdiggør featuren / Push til github / Implement
 til spillet.” This authorizes implementation, push, integration and app delivery.
Model/effort recommendation in the order is not evidence of the model run.

## Baseline, scope and dependencies

- Isolated clone `/workspace/BOND_TEXT_001`, branch `feature/bond-text-001`.
  Shared `/workspace/Lumenfall` is untouched.
- Initial candidate e5b6cafd9bc816e3cef040cc5a3fd1a8b24d741d on historical base
  67c3e99c24587f6c13fc65cfd27f8dcb8e289602. Its
  [7 October evidence](../qa/BOND_TEXT_001/README.txt) remains unchanged and
  applies only to its recorded bytes.
- Current main baseline 214d45411ce2fb420f0e4b372063811a967679b1 was verified
  and merged cleanly at 26c5f745c61650f380c290c85077916db45a5b44. Current
  AGENTS/bootstrap/workflow, ownership/visual guidance, state, context index and
  CI/build triggers were read. No open PR/overlapping implementation at startup.
- PR46/B2 is integrated via PR57 (20aaae62a4b6e46f8d75775085918eaba4e8de29).
  Preserve Number/DataView arithmetic, paid Lab speeds and current offline fix.
  Current feature-owner rules supersede the historical writer gate; no separate
  writer ceremony or new general approval is required. Serialize main integration.
- F15/new Bonds is separate. Partner names derive from the same Bond IDs used by
  simulation, so Formation definitions share one authoritative model.

`index.html`: remove Stone/Titan partnership from Breaker ability and general
Wisp Roles copy; retain heavy damage, Module and Ultimate explanations. Resolve
full names from `SPIRITS` via `FORMATION_BONDS.ids` in both Formation Bonds views.
Remove duplicated `req` strings. Other abilities, Bond IDs/bonuses/tags and
activation rules are unchanged. No new gameplay numbers or balance decisions.

`tests/behavioral/`: update Rift-status partner assertions; register focused
`bond-text.js` in the default suite. Cover every Bond active/benched/Lv.0 in both
views, eight ability explanations and render purity. Two negative controls
restore the ability partner leak or abbreviated Bond names.

No save schema/migration, purchases, bulk/queue handlers, chronology, rewards,
native configuration, workflow or signing changes. Old purchases and canonical,
backup/recovery data retain value. Preserve WebView60, `com.lumenfall.app`,
signing identity, deterministic purchases and documented Luminous Motes rewards.

## Acceptance and verification

- Full partner names in both Formation Bonds sections, active/inactive/pending;
  labels agree with simulation. Both ability views omit partner pairs and retain
  damage/resource/buff/progression explanations.
- Gameplay/persistence unchanged; relevant formation, chronology, parity and
  save/recovery checks pass on current bytes.
- Mobile widths 320/390/430, 100%/200% text, reduced motion, 44px disclosure,
  keyboard focus, readable contrast and reachable rows pass.
- Required CI passes before merge. Reverify integrated behavior, publish signed
  APK and verify bundled assets/package/version/certificate. Required physical
  Android/WebView60/TalkBack acceptance must be recorded honestly.

Fresh source SHA256: feb273d2ff1fb0d514517227d73b3ccb650a850b57f0a8ba5d12bbc77af85ac3.
`bond-text-contract`, source validation, APK verifier self-test and Node tooling
PASS on Node24.19.0/Chromium151. 14 focused positive scenarios and three negative controls PASS. Fresh probes
PASS all 12 Bond states and 12 mobile/text/motion profiles; normalized source
equality proves only presentation edits and browser mechanics match baseline.
Minimum conservative partner contrast 7.19:1. Fresh evidence is saved under
`docs/qa/BOND_TEXT_001/2026-10-08/`. Local Chromium uses the saved CDP wrapper
because dump-dom hangs here; CI uses its actual browser. An initial sandboxed
tooling check could not execute its mocked aapt subprocess; unchanged checks
PASS with subprocess access. This is an environment limitation, not game failure.

## Delivery checkpoint

No remote PR/integration/APK for this feature yet. Required physical device
acceptance is unperformed. No independent review is claimed. Next: collect fresh
checks and checkpoint/push; pass CI and merge; verify integrated behavior and
signed APK; save task/project status and evidence in GitHub. Keep this owner chat
open if required acceptance remains unavailable. Archive only after completion
under [FEATURE_WORKFLOW](../project/FEATURE_WORKFLOW.md).
