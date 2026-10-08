# LOADOUT_MEMORY_001 / F25 — automatic Forge bulk preference

Status: in progress; [PR78](https://github.com/karahaNx/Lumenfall/pull/78)
pushed, current combined CI and signed APK/native acceptance pending.
Owner: this feature chat; no subagents/message tools. Runtime model/effort is
not exposed verifiably; the startup recommendation is not an execution receipt.

## Requirement and decisions

Original [F25](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):
“Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.”
The user's [correction](LOADOUT_MEMORY_001_USER_CORRECTION.txt) removes the named
feature entirely because the game is not released. Forge remembers automatically
from first use, screen switches and restart. No shop/name/refund/credit/history
message/new save field. Existing wallet and raw ownership retain value.
Latest instruction: “Finish the feature task push to github implement to game”.

Read original, [revision/dependencies](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original/user correction outrank proposals. Current live AGENTS/bootstrap,
PROJECT_STATE, CHAT_OWNERSHIP, 02_GAMEPLAY, CONTEXT_INDEX, CODEX_START and
FEATURE_WORKFLOW were read. Current standing scope authorization supersedes
historical Lead/writer holds. No new binding rule introduced.

## Baseline and scope

Initial live main b0537cb; index SHA256
5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Isolated /workspace/Lumenfall-LOADOUT_MEMORY_001-live,
feature/loadout-memory-001. Original checkout and old20b8b2e proposal untouched.
PR46/B2 already integrated via PR57. F14 Formation, F26 timecap and F27 Comet
content remain separate. Current main e2f745c was merged as4923329 after PR77
Save Backup, PR76 Formation and PR80 Resonate. Test-registration conflicts keep
both features' scenarios. Current index SHA256
fe11176fd6b9d2d3406ed0d49bd056d712f9b975ef1cce6ab31084f3548ac5f3.

Product delta: remove two legacy ownership gates in selection/init; every choice
immediately saves existing savedLabMultiplier through saveState (both slots).
Default1x and choices1/5/10/25/50/100/Max remain. F27 already removed the shop row
and archives raw owned.rememberbulk in legacyCometPurchases idempotently. Preserve
that old Rest Stop entitlement, all currency and F27 prices/effects; it never
gates Forge memory. No balance/schema/migration/Formation/Lab changes.
Changed root index.html, focused behavioral test and two default scenario
registrations, task/user decision and scoped QA evidence/helpers.

## Acceptance and evidence

- All seven unowned choices, touch/keyboard, immediate primary/recovery saves,
  screen switching, cold reload, malformed/legacy/repeated restore preservation.
- No named shop feature; stale calls cannot debit or erase old entitlement.
- Preserve deterministic bulk/Max/queue, chronology/live-offline parity,
  documented fixed Luminous Motes, package com.lumenfall.app, signing/WebView60.
- Verify320/390/430px,160% text,44px controls, focus/contrast/reduced motion.
- Required current CI and integrated behavior pass; publish and verify signed
  APK/assets, complete relevant native acceptance; save status in GitHub.
  Missing required acceptance keeps chat open; archive only this owner afterward.

[Current evidence](../qa/loadout-memory-001/current/baseline.json) reproduces
baseline failure at unowned25x cold startup (438 checks). Focused candidate and
successive combinations pass1127 checks/six profiles; four causal mutations
fail as expected. Minimum controls45x44px, contrast7.49:1. ES2017 parsing,
actual Node8.3/V8 6.0.286.52 VM437 checks, source/tooling/APK-verifier/context PASS.
Existing22 scoped cases (20 positives/two negatives) PASS on unchanged assertions
using the existing local CDP adapter. Stock local Chromium151 dump-dom timeout is
retained as a failure, not counted as acceptance. Normal GitHub CI is mandatory.

Initial CI37735117429 PASS153 defaults/12 negatives/all gates. Combination
CI37737114019 failed browser creation before UI; the new driver now receives the
exact harness-selected browser and staged source and retains stderr. Subsequent
CI37739565902 passed both feature scenarios; combination37741036030 is superseded
by the final QA fix: selected-artifact fonts/branding, correct CSS MIME, hashed
asset responses. Current1133 checks PASS (six added asset assertions); same-source
missing-fonts and staged old-gate artifacts fail as expected. Final CI pending.
Review browser/source/assets/current-receipt findings are addressed. No assertions/
gates removed. Self-review is not independent review.
Historical20b8b2e/1133 checks and refund proposal do not accept current bytes.

Task-owned Android8.1/API27 software emulator booted; exact signed143 installed.
Native driver checks installed source, actual save database, upgrade/cold start,
real Android taps/keyboard and AX. Initial failures were test transport/inset/
fixture issues, retained in QA. Invalid farmReturnDepth0 normalized to Push and
earned the existing Rift10 Deed (+5 Comets); corrected test uses valid Farm1 /
return2 to isolate wallet. Native acceptance still pending. No physical device,
exact WebView60 or TalkBack execution is claimed; record actual runtime/limits.

Next: finish current CI/native baseline, merge PR78 after actual overlap check,
reassess integrated bytes, verify published signed APK/native update and persist
final task/PROJECT_STATE/evidence. [Continuation](LOADOUT_MEMORY_001_CONTINUATION.txt)
records environment and concrete commands; do not restart completed work.
