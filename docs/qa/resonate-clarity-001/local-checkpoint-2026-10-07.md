# RESONATE_CLARITY_001 — explain Resonate (F06)

Status: **local candidate ready; feature open, not integrated**.
Owner: this featurechat, »LUMENFALL — Resonate forklares«; role 03 UI / Visuals.
Branch: `feature/resonate-clarity-001`; private worktree `/workspace/Lumenfall-resonate`.
Remote writer: not assigned. No remote writes, PR changes, build or release.
Recommended model/effort: GPT-6.1 Sol · High. Actual model/effort is not exposed
and is not recorded as verified execution metadata.

## One goal and original requirements

Explain the actual Sigil consumption action and shared run limit. The current
order specifies: »25 Sigils for at fylde ability-resource til 100 efter alle
Ultimates er købt, med højst tre anvendelser samlet pr. run.«
The [full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt)
takes precedence over proposals. Its F06 passage is: »Samt er der noget som
hedder resonate på wisps som man bruger sigils til at opgradere, det ved jeg
ikke hvad er.«

Sources read: live AGENTS/PROJECT_BOOTSTRAP, own CHAT_OWNERSHIP row,
03_VISUALS, PROJECT_STATE, FEATURE_WORKFLOW, targeted CONTEXT_INDEX/CODEX_START;
full original, F06 and dependencies/save sections in
`docs/recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`;
concrete decisions in `DECISIONS/FEEDBACK_REGISTERED_001.txt`, `FEEDBACK/EVIDENCE/FINDINGS.txt`
section 6, and `FEEDBACK/Source_Index.txt` under that lead_context.
Original image 04-17362.jpg was inspected; its APK/save identity is unknown.
New B2 START_HER and SUMMARY/identity were read to verify dependency status.

## Baseline and dependency observations

Initial live main, fetched 7 October 2026 around 15:10 CEST:
`b2a1f440e8ad9fed34b37551e468224310d2a6f6`; index blob
`ea44431c163569548973d9e489f75345749a07ee`, SHA256
`f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
Initial candidate checks passed there. They do not substitute for the final
reruns. PR51 was initially open/Draft on `bd71a860…`.

Main changed during preparation. Live observation at **15:35:48 CEST** showed
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` (PR51 integrated), with PR52's
separate status/release CI in progress. The private branch was rebased to that
main with the same UI patch. Current AGENTS/PROJECT_STATE/CODEX_START and gates
were reread: active tooling is Node.js and communication is English.
PROJECT_STATE still described PR51 as unintegrated; live Git is authoritative.
This chat does not edit that shared status or take over the other feature.

**Final tested baseline:** `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`.
Baseline index blob `90e4678cb28fa833fdacbc01d1744d9465f6a356`, SHA256
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
Candidate index blob `59da7aef768afa929777961d1622a62537e3f43d`, SHA256
`f045c90acf57fbe59f4f40bdf9439430421c5961137d819233dd98c0a74df46d`.

PR46 remains open/Draft on R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.
Archived B2 tree: `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index SHA256
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Worker-PASS is reported; new Core/QA reviews and physical Android remain pending
in the saved status. 02_08's own stop is documented; 02_07's writer release is
unknown. No CI result or other feature release grants this chat writer ownership.
PR46/B2 review/handover and Lead's coordinated checkpoint precede remote
publication/integration. Standing authorization applies; no new general approval.

## Verified mechanism, scope and decisions

On both baselines, `canSigilResonate`/`useSigilResonance` require all Ultimates,
a recruited Active Wisp, resource below 100, fewer than three shared uses and
at least 25 Sigils. The handler spends 25, increments `sigilResonanceUses`, and
sets only the chosen Wisp's `heroResource` to 100. Ascend resets the counter;
canonical normalization preserves it in 0–3. There is no permanent Resonate
level/bonus, bulk action or queue action.

The button reads **Resonate — Fill ability to 100**, with **25 Sigils**.
A visible, associated paragraph explains refill versus permanent upgrade,
all-Ultimate unlock, remaining uses shared by all Wisps, and reset on Ascend.
It also appears beside an owned Ultimate before the all-Ultimate unlock.
`aria-describedby` links the action and explanation. Existing constants supply
price and limit. This is a presentation decision within the ordered scope.

Product changes: one CSS rule and Resonate markup in `index.html`. The standalone
JavaScript check and feature evidence/documentation are part of this scope.
F04 folding, other feedback, PR46 arithmetic, balance, save-schema, Android and
signing logic are unchanged. No new gameplay/workflow rule or migration is needed.
Purchased ownership/value is preserved; no old data is deleted or repriced.

## Acceptance criteria and final local results

Evidence index: [README](../qa/resonate-clarity-001/README.md). Results apply to
the candidate index SHA256 above on the rebased baseline; Chromium 151 and
Node.js 24.19.0 were used.

| Required behavior/check | Local result |
| --- | --- |
| Explicit price, resource 100, unlock and refill explanation | PASS; old main fails the explanation assertion |
| One shared limit across three Wisps; fourth action rejected; Ascend reset | PASS |
| Missing Ultimate, reserve/unrecruited Wisp, full resource, 24 Sigils, exhausted uses | PASS: no debit or state mutation |
| Last valid boundary: 25 Sigils, resource 99, uses 2 | PASS: 0 Sigils, resource 100, uses 3 |
| Reload, actual backup restore/reload, corrupt-primary recovery | PASS: counter/resources/Sigils/Ultimates preserved |
| Rendering without state/save mutation; focus after render/action/ordinary intervals | PASS |
| 320/390/430px × 100%/200% text × normal/reduced motion | PASS: 12 profiles, native keyboard/touch, no horizontal clipping |
| At least 44px controls, focus and contrast | Height ≥48.78px; copy ≥9.36:1, focus ≥8.23:1, 2px outline |
| Existing endgame/chronology/parity/restore/recovery/Auto-Ascend scenarios | 7 PASS via explicit CDP adapter |
| Currency/parity/chronology negative controls | All 3 rejected, exit 1 |
| Current source/context/APK verifier self-test/tooling gates | PASS, each exit 0 |
| Mechanic/platform preservation | 13 function bodies and 65 existing tracked files byte-identical to baseline |
| Diff whitespace and new JavaScript syntax | PASS |

Existing scenarios: `p2-endgame-currency-utility`, `chronology-simultaneous-order`,
`parity-short`, `parity-auto-ascend`, `restore-roundtrip`, `recovery-offline-once`,
`p2-03b-auto-ascend-integrity`. The endgame scenario verifies that live/offline
simulation never auto-spends Resonate Sigils and preserves the shared counter.
Native inputs invoke production handlers. Fixtures pause timers for exact
measurements and then exercise ordinary production intervals for 350ms.

Limitation: the default Chromium `--dump-dom` invocation timed out without a QA
result, also on a minimal page. Existing scenarios were rerun through a recorded
CDP-pipe adapter. Raw DOM, exits, adapter source and initial failures are preserved.
No full default suite, ordinary CI, Android/WebView60 or TalkBack acceptance is
claimed. The standalone feature check runs explicitly, outside the shared runner.

## Checkpoint, stop and next action

Local code/check preparation is frozen; own browsers exited and servers closed.
No product writer was acquired or released. GitHub checkpoint, feature PR/main
integration, integrated checks and relevant APK/device acceptance are **pending**.
The ownerchat remains open; a local candidate/open PR does not complete it.

Lead: resolve PR46/B2 review/handover, assign a coordinated writer checkpoint,
inspect patch/evidence and refresh main/branches/PRs/runs/writer. Publish this
task, patch and evidence to GitHub, then integrate in the coordinated order.
Rerun relevant checks on the exact integrated version; build/verify its APK
(`com.lumenfall.app`, existing signing, WebView 60) and obtain required device,
large-text and TalkBack acceptance. Save status/evidence in PROJECT_STATE and
this task, release this scope's writer, then archive only this chat under
FEATURE_WORKFLOW. The standing approval is sufficient for the agreed scope.
