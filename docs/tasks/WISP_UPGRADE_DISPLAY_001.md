# WISP_UPGRADE_DISPLAY_001 — unfinished Wisp upgrades stay open

Status: **candidate verified; publishing and integration in progress**. Required
GitHub CI, integrated verification, signed APK and native/device acceptance are
pending. A local candidate or open PR does not complete this app feature.

## One goal and original requirements

F04 only: no fold arrow/control until Mythic rarity, the authoritative Module cap
and an owned Ultimate are all complete. Empower and Resonate are excluded.
Insufficient currency or prerequisites leave unfinished purchases visible.

> Wisp skal ikke have den mulighed for at have pil ned, kun når alt er maxed ud på en wisp, så må man gerne kunne skjule dens upgrades.

The full original feature mandate is preserved in
[WISP_UPGRADE_DISPLAY_001_REQUEST.txt](WISP_UPGRADE_DISPLAY_001_REQUEST.txt).
Original point F04, image4 and the concrete decision are preserved under
[the original feedback](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[revision/dependencies/save requirements](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[Lead decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
The original overrides suggestions; image4 was inspected in the first turn.

User continuation on 8 October 2026, preserved verbatim:

> Færdiggør featuren, læg gå github og skal implementes i spillet

This authorizes scoped GitHub publication, main integration and Android delivery.
Current [AGENTS](../../AGENTS.md) and [feature workflow](../project/FEATURE_WORKFLOW.md)
supersede historical role/writer-release gates. No new rule is introduced.

## Owner, baseline and scope

Owner: this WISP_UPGRADE_DISPLAY_001 feature chat, handling implementation, checks,
documentation and delivery. No other chats/subagents/messages/renames are used.
Recommended GPT-6.1 Sol/High is a recommendation, not a runtime attestation;
Codex based on GPT-6 is exposed, exact variant/effort is unavailable.

Isolated checkout: /workspace/Lumenfall-WISP_UPGRADE_DISPLAY_001.
Branch: feature/WISP_UPGRADE_DISPLAY_001. Original /workspace/Lumenfall is untouched.

Fresh baseline observed 8 October 2026: 214d45411ce2fb420f0e4b372063811a967679b1.
The 7 October candidate 3ab30e2e13e243710705e8bb3e841bfe5aa4e317 was prepared on
0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd; it was rebased cleanly onto current main.
[The previous checkpoint](../qa/wisp-upgrade-display-001/delivery-2026-10-08/previous-local-checkpoint.md)
retains historical facts and limitations; its old permissions do not govern now.

PR46 is observed merged at 20aaae62a4b6e46f8d75775085918eaba4e8de29. PR57 integrated
Number/DataView B2 and current offline catch-up; signed138 is the prior release.
No open PR or active overlapping run was found at startup. Historical physical
B2 acceptance remains unclaimed. This feature changes no B2 arithmetic, F20/F21
balance or unrelated MOBILE-CLARITY goal. Recheck overlap/main before merging.

Product scope is index.html only: a pure completion predicate, labelled open
sections for unfinished Wisps, native details for finished Wisps, open/focus
preservation at completion/refresh/restore and visible disabled Module/Ultimate
controls with prerequisite reasons. Affordability refresh must preserve the new
visible controls' recruitment/Mythic gates. No purchase handler, cap, price,
Luminous Motes reward, queue/bulk policy, chronology, offline logic or save schema
changes. No migration is needed; existing purchases/levels/currencies are preserved.
Package com.lumenfall.app, WebView60 compatibility and established signing remain.

Test changes: focused F04 browser assertions/shared test-only bridge/CDP runner;
register wisp-upgrade-display in the existing default suite and update its
superseded collapsed-by-default hierarchy expectation. No test gate is removed.

## Acceptance and checks

[Current evidence](../qa/wisp-upgrade-display-001/delivery-2026-10-08/README.md)
records exact source hashes and versions. Parent evidence belongs to the older
local candidate; it is not acceptance of the current game.

- PASS: 12 profiles, 320/390/430px, normal/200% root text and normal/reduced motion;
  12,912 assertions cover all8 finite-track input combinations across all8 Wisps,
  funded/unfunded controls, same-Wisp focus, native Enter folding and >=44px controls.
- PASS: canonical/recovery/backup round trips, stale folded-state restoration,
  no render/fold writes, final Module/Ultimate deterministic purchases and final
  Rarity remaining open until Ultimate is bought. No horizontal progression overflow.
- PASS: funded locked controls stay disabled after ordinary affordability refresh;
  disabled Module click cannot change the old recruitment prerequisite.
- PASS: ordinary run.cjs --scenario wisp-upgrade-display on official Chrome155;
  current F04 plus11 relevant existing scenarios also pass through CDP/active assertions.
- PASS: source validation and Node tooling regression checks. Required full GitHub
  gates remain pending until their actual completion is observed.
- Historical: heading contrast estimate >=5.46:1 and ES2017 parsing passed;
  physical/exact WebView60/TalkBack and new APK are not claimed by desktop checks.

Node24.19.0, Chromium151.0.7922.173 (CDP), official Chrome155.0.8059.39 (normal CLI).
Debian Chromium151 dump-dom still times out on this environment; use the installed
unmodified official browser. This changes neither product bytes nor CI gates.
Checks pause periodic callbacks only during immediate throwaway UI measurements;
normal existing lifecycle/gameplay assertions retain their production test harness.
Only self-review/automated checks are performed, not independent review.

## Checkpoint and next action

PR/integration/APK: pending. Shared original checkout is untouched. Chat remains
open until relevant integration/app acceptance and saved status are complete.

Next: publish this branch/task/evidence, pass unchanged required CI, verify the
full diff/current main and merge with expected head. Verify F04 on integrated
bytes; observe the triggered signed Android build and verify release digest,
bundled assets/package/version/signer. Run available native/legacy checks, save
remaining required device limitations in this task and PROJECT_STATE, and archive
only after all necessary acceptance is complete.
