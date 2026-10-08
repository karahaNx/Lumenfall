# LAB_SPEED_QUEUE_001 — Lab speed queue (F12)

Status: **product integrated; scoped integrated checks and APK identity PASS;
required physical Android/WebView60/TalkBack acceptance OPEN**.
Owner: this Lab speed queue feature chat. Repository: `karahaNx/Lumenfall`.
Private branch: `feature/LAB_SPEED_QUEUE_001`; checkout:
`/workspace/Lumenfall-LAB_SPEED_QUEUE_001`. No other checkout is changed.
Model exposed: Codex/GPT-6; exact variant/effort unavailable. GPT-6.1 Sol /
Extra high was a startup recommendation, not a claim about the run.

## One goal and sources

Save the exact selected speed tier separately from the next-Lab queue. Each
new paid level starts at 1x and pays the full selected tier price when affordable.
If only the Lab start is affordable, continue at 1x and retain the tier intent.
Verify offline, restart, Ascend and competing Studies.

The [original feature order](LAB_SPEED_QUEUE_001_REQUEST.txt) is unchanged.
User continuation on 8 October: **“Finish the rest”**.
Original feedback takes precedence over proposals:
[original player requirements](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).

> Speed up skal have en knap hvor man trykker også skal muligheder komme frem på skærmen, hvor man også kan vælge at queue speed up, så den bruger motes mens man er offline og ikke behøver miste sin speedup, når man har råd til den valgte speed up, når man har råd til selve lab queue og ikke speed up queue så fortsætter den bare med alm 1x speed.

F12 and Lab/save dependencies:
[feedback contract](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[registered Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
Original image 03-17363.jpg was viewed; its APK/save identity is unknown.

## Baseline, dependencies and decisions

- Original environment baseline: `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
  Local preparation started from `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
  Frozen B2 was restored separately, never over live main: tree
  `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, 96 source hashes/modes verified.
  Its original source SHA256 is
  `7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
- Original local documentation/evidence checkpoint:
  `ee9adf622f2836aa655b94a99f4f2fabb7dd8517`. Those results are historical
  candidate evidence, not proof of the later integrated version.
- Continuation live-main baseline:
  `214d45411ce2fb420f0e4b372063811a967679b1`.
  Merged into the private branch at `61d50a892cc1f958e3c18743de164b52c7e8476c`.
- Direct dependency [PR46](https://github.com/karahaNx/Lumenfall/pull/46) is
  merged. [PR57](https://github.com/karahaNx/Lumenfall/pull/57) integrates its
  F12 implementation and Number/DataView B2 correction with the current
  resumable offline scheduler at `20aaae62a4b6e46f8d75775085918eaba4e8de29`.
  Full tree `e177ba6955f5673460d6201b52701563cf480467` equals tested candidate
  `b62476dc461f00d2a7ea756f700f755bd763326e`.
- Integrated product HTML SHA256:
  `6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca`.
  **No remaining F12 product gap was found; no second payment system is added.**
- Current live AGENTS/feature workflow supersede archived role/writer mandates:
  the feature owner may finish scoped checks, GitHub publication and integration
  under standing authorization. Historical writer release is not a current
  global gate. No new binding rule or gameplay design number is introduced.
- Relevant overlap checked: open PR59 concerns Wisp upgrades, including shared
  PROJECT_STATE. Our shared status change adds only the F12 row; main is
  rechecked before integration. No other feature is accepted or taken over.

The authoritative saved maps are `studyQueue`, `studyUseMotes` and
`studySpeedTargets`; paid `activeStudies[].speedMult` remains separate.
Existing observed tiers/prices: 1.5x/14, 2x/26, 3x/60, 4x/110, 5x/176, 6x/258,
7x/357, 8x/473 Motes. New starts create a 1x work snapshot. Full selected-tier
payment follows due completions/closures and new starts, at actual enabling
reward timestamps. Shared Motes follow LONG_STUDIES catalogue order, independent
of active/UI order; existing start priority is preserved.

Missing old-save maps default to OFF. A valid paid tier can seed the remembered
target; paid work survives. Known IDs, allowed numeric tiers and strict booleans
are enforced. Normalization is pure/idempotent and cannot debit/refund currency.
No schema, balance, fixed Luminous reward, cap, package, signing or native changes.

## Acceptance and evidence

All following fresh results use the integrated product hash above.
[Evidence and commands](../qa/lab-speed-queue-001/README.md).

| Acceptance criterion | Result |
| --- | --- |
| Independent speed intent/next-level queue, manual start, all eight full prices | PASS: 82 existing contract assertions |
| Each new level starts 1x; full repayment, only-start budget, retained target; no cheap fallback/free carry/double debit | PASS: contract plus causal payment mutants |
| Competing Studies, catalogue priority, invalid/locked/capped/closed/unknown inputs | PASS: contracts and chronology |
| Live/offline whole/split, reward boundaries, completion/start/cap/buff/Ascend collisions | PASS: 101 chronology assertions and batch-end mutant |
| Exact farm work/reward ledger and numerical boundaries | PASS: 16,735 conservation + 340 numerical + 1,029 runtime assertions |
| Detached offline transaction, budgets 1/2/31/256, no partial save; primary/simulation failure and once-only retry | PASS: unchanged integration driver |
| Recovery-write failure, legacy OFF, processing time, existing cap/study-only tail | PASS: same integration driver |
| Reload, backup/restore, canonical recovery, Reset; paid speed/intent through manual and auto Ascend | PASS: four existing persistence scenarios plus chronology |
| 320/390/430px, named controls >=44px, touch/keyboard, focus, reduced motion | PASS: UI 47 assertions per width and both existing browser input drivers |
| 200% Lab text, no horizontal overflow, visible focus, control text contrast | PASS: three measured width checks; minimum 8.00:1 |
| Actual released JavaScript on V8 6.0.286.52 | PASS: Lab offline/payment/retry assertions and all five existing release matrix cases |
| Signed APK 0.1.138 identity and asset preservation | PASS: fresh aapt/apksigner, GitHub digest, 526 ZIP CRC entries, all 15 bundled assets |
| Integrated full required CI | PASS: CI37692669340, 146 default scenarios/12 required negatives/source/tooling/APK self-tests/guarded startup |
| Affected physical phone, exact WebView60, TalkBack | **OPEN: no device acceptance supplied for APK138** |

Modern local host: Node24.19.0 / Chromium151. Test names containing “native”
refer to browser touch/keyboard input drivers, not Android native acceptance.
200% checks measure Lab controls only; at 320px the native select can shorten
the option suffix while tier/price remain visible and the full label is retained.
F11's dialog and other layout/progression tasks remain outside this goal.
Self-review/automated evidence is not independent review; PR57 has no submitted
review at observation. Historical B2 stress failures remain historical findings.

## Delivery, changed files and continuation

This feature's continuation changes this task/original order, scoped QA
documentation/JavaScript replay drivers/raw evidence, and one F12 status row in
PROJECT_STATE. The behavioral harness additionally exports its existing browser
lookup for the replay scripts. Game/native files, existing assertions and release
workflows are unchanged. [Delivery PR65](https://github.com/karahaNx/Lumenfall/pull/65)
contains the final CI/integration receipt in its body.

Automated review found a hard-coded Chromium path in the replay scripts. The
revision reuses the existing supported-browser lookup and accepts an explicit
browser path; both replay drivers pass again and preserve all assertions.
Device preflight finds no USB/KVM exposed here. Current adb and29.0.6 cannot
start because /home/agent/.android is on a read-only mount; no device enumeration
or physical pass is claimed. Raw attempts and the precise next action are saved.

Existing [signed release receipt](../qa/feature-branch-integration/README.md):
APK0.1.138, versionCode138, package `com.lumenfall.app`, build37694671685,
established certificate. Asset619954273, 6,837,151 bytes, SHA256
`81b9be7edea971335a06f06d1894d91e75a92736738cc935fc2a920a26a02e1e`.
The mutable android-latest URL must be checked against that digest.
No new APK is needed for documentation-only continuation.

The delivery checkpoint is tracked in PR65, which must pass required CI before
integration; its final receipt records the integrated source/evidence identities.
Next feature action: complete the scoped
[device checklist](../qa/lab-speed-queue-001/DEVICE_ACCEPTANCE.txt) on the affected
phone/exact WebView60 with TalkBack and save exact version/results in GitHub.
A device-availability question was sent while independent work continued; no
physical results are assumed. Shared edits stop after the saved checkpoint.
**Feature/chat remains open until necessary device acceptance passes.**
Only this owner chat may be archived after verified completion.
