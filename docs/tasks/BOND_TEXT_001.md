# BOND_TEXT_001 — Bond partners in Formation Bonds

Updated 8 October 2026. Owner: this BOND_TEXT_001 feature chat.
Goal: show Bond partners in Formation Bonds, remove them from Wisp ability text,
and preserve correct ability explanations.
**Status: integrated and signed APK published; required physical acceptance open.**

## Requirement and authorization

Original F16:

> Der behøver ikke stå i wisp ability at der laves bond med hvilken anden der bliver lavet formation bond, det skal kun stå i formation bond, hvilke wisp der giver bonussen.

[Original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
prevails over proposals. Read F16/F14/F15/F17, dependencies, save and acceptance
sections of the [revision](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Screenshot04-17362.jpg was inspected; its APK/save identity is unknown.
User continuation8 October: “Færdiggør featuren / Push til github / Implement til
spillet.” Implementation, push, merge, signed build/publication are authorized.
Model/effort recommendation is not evidence of the actual model run.

## Baseline and dependencies

Isolated clone `/workspace/BOND_TEXT_001`; product branch `feature/bond-text-001`;
receipt branch `docs/bond-text-001-delivery`. Shared `/workspace/Lumenfall` is untouched.
Initial candidate e5b6cafd9bc816e3cef040cc5a3fd1a8b24d741d on67c3e99; its
[7 October evidence](../qa/BOND_TEXT_001/README.txt) remains historical.
Current startup main214d45411ce2fb420f0e4b372063811a967679b1 was verified and
merged. Current AGENTS/bootstrap/workflow, ownership/visual guidance, state,
context index and CI/build triggers were read. PR46/B2 is integrated via PR57;
Number/DataView arithmetic, paid Lab speeds and offline correction are preserved.
Current feature-owner rules supersede historical writer ceremonies.

PR59 Wisp upgrades and PR60 Forge text advanced main to0e9b54c8d62a873bd48625f4a20ee18078e8a8f1.
Candidate merge9e6ec1f preserved their product changes; the test-registration
conflict retains both Wisp-upgrade and Bond bridges/modules. Later Forge/Lab
proposal and F12 receipt merges add documentation; no related product change.
F15/new Bonds remains separate. An open broader PR67 also changes Bonds;
partner names resolve from the same `FORMATION_BONDS.ids` used by simulation.

## Implementation and preservation

`index.html`: remove Stone/Titan partnership from Breaker ability and general
Wisp Roles copy. Keep heavy damage, Module and Ultimate explanations. Both
Formation Bonds views resolve full names from `SPIRITS`; duplicated `req` strings
are removed. Other abilities, IDs, bonuses, tags and activation rules are unchanged.
`tests/behavioral/`: update Rift-status partner assertions and add default
`bond-text-contract` plus two deliberate regression controls.

No gameplay numbers, save schema/migration, purchase/bulk/queue handlers,
chronology, rewards, native config, workflow or signing changes. Old purchases
retain value; no migration is required for presentation-only definitions.
WebView60, `com.lumenfall.app`, established signing, deterministic purchases and
fixed Luminous Motes rewards are preserved.

Acceptance criteria: both Bond views name each pair from the simulation's IDs
in active, benched and Lv.0/pending states; all eight ability explanations retain
their effects without partner instructions; other gameplay/save/purchase behavior
is preserved. Mobile/text/focus/contrast/motion checks and required CI must pass
on integrated code. Signed artifact identity, update preservation and necessary
physical affected-phone/WebView60/TalkBack acceptance must be recorded before
full completion. Available checks pass; the physical criterion remains open.

## Integration and acceptance evidence

[PR61](https://github.com/karahaNx/Lumenfall/pull/61) merged at
**210005d0ae093d21e846bae41a9bddf25af2800d**. Final validated head
a4f61869d837fc467ce83a26c065cad7968958a3. CI37710741132 PASS148 default scenarios,
12 required negative controls, source/tooling and guarded startup. Earlier
CI37708765963 PASS147 belongs to the earlier base and is preserved separately.
Product/test/tool/native/assets at integration equal the validated head.
Product SHA256: `1e0d51370b5b62f313dad6953f9b26bb7d7a1a886785dbccc6dfaac379779981`.

- Fresh [integrated checks](../qa/BOND_TEXT_001/integrated/README.md):14 positives
  and3 negatives PASS; Formation, role/formula/pacing, chronology, parity,
  save/reload/backup/recovery and native browser touch/keyboard/scroll.
- [Updated-main UI/source](../qa/BOND_TEXT_001/current-main/README.md):12 Bond
  states and12 width/text/motion profiles PASS (320/390/430,100%/200%,reduced
  motion),44px disclosure, focus, scroll reachability and contrast>=7.19:1.
  Normalized source equality and actual-browser mechanics match the baseline.
- [Android141 receipt](../qa/BOND_TEXT_001/android/README.md): package/version,
  certificate/v1/v2,526 ZIP CRC entries/all15 assets PASS. Actual extracted
  scripts parse and the partner helper executes on V8 6.0. Signed138→141 preserves
  47,104-byte WebView save-storage snapshot exactly; purchased Rarity/Module
  tiers survive first launch. Installed Android8.1/API27/WebView69 DOM checks
  PASS12 active/benched/pending states, both Bond views, eight ability descriptions
  and native100%/200% text profiles. QA fixtures/interval guard are not shipped.

Build37712548224 published **0.1.141**, versionCode141. APK SHA256
`0b278ffce3819a40b98c44b738b79123ec2d7fb273a3820bc13ed71940214d44`.
[Immutable APK/receipt](../../archive/android/bond-text-001/README.md).
Local runtime Node24.19.0/Chromium151; CI Node20/real browser; legacy engine
Node8.4.0/V8 6.0.286.52. Local dump-dom uses the documented wrapper; native pipe
checks use actual Chromium. Initial wrapper, debugger/reader/launch and imported
rebuild-fixture failures remain saved and distinguished from corrected PASS.
The initial native screenshot captured a System UI ANR in software emulation;
raw capture and subsequent observation are preserved. This does not certify
native performance or physical-device interaction. Self-review/automated checks
are recorded; no independent review is claimed.

## Remaining acceptance and continuation

Required physical affected-phone/exact WebView60/TalkBack acceptance is unperformed.
Record device/WebView/version and confirm readable partner names, own ability
explanations, text scaling, focus and screen-reader navigation on the signed APK;
preserve player progress and normal backup/recovery. See the Android receipt.
Do not label the feature fully accepted while this is missing.

The delivery receipt is on `docs/bond-text-001-delivery`; its PR body records
the required CI/integration receipt and latest-main verification. Shared-file product
work for this task is finished; no other chat's writer is claimed or released.
Only this owner chat can be archived after verified acceptance and saved status
under [FEATURE_WORKFLOW](../project/FEATURE_WORKFLOW.md); it remains open now.
