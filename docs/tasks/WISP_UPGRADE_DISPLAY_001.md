# WISP_UPGRADE_DISPLAY_001 — unfinished Wisp upgrades stay open

Status: **integrated and published in signed APK0.1.140; physical acceptance open**.
PR59 is merged, required CI is green and integrated F04 checks pass. Required
physical/exact WebView60/TalkBack acceptance is unperformed, so the feature/chat
remains open. This is implemented game code and a signed release.

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
  CI37708308439 passes147 default scenarios, all12 required negatives and guarded startup.
- Historical: heading contrast estimate >=5.46:1 and ES2017 parsing passed;
  physical/exact WebView60/TalkBack is not claimed by desktop checks.

Node24.19.0, Chromium151.0.7922.173 (CDP), official Chrome155.0.8059.39 (normal CLI).
Debian Chromium151 dump-dom still times out on this environment; use the installed
unmodified official browser. This changes neither product bytes nor CI gates.
Checks pause periodic callbacks only during immediate throwaway UI measurements;
normal existing lifecycle/gameplay assertions retain their production test harness.
Only self-review/automated checks are performed, not independent review.

## Integration, APK and remaining acceptance

[PR59](https://github.com/karahaNx/Lumenfall/pull/59) merged at
0e9b54c8d62a873bd48625f4a20ee18078e8a8f1; full tree aafad1b738a188f429405eae856e750c468d2a89
equals the locally reviewed merge preview. It preserves PR60's unrelated Forge
text change. Integrated source SHA256:
a64747dcec3c26c0b5dea3f2e5c1bac521de557e38547b1195b5a3660234b0df.

[Required CI37708308439](https://github.com/karahaNx/Lumenfall/actions/runs/37708308439)
passes147 defaults, all12 required negative controls, source/tooling/identity gates
and guarded smoke on head3c1c99bf96c9f6e0602a996ce2798d5ba972e0ce. Full decoded
CI text is saved compressed in the current evidence folder. On integrated0e9b54c,
the normal F04 harness, 12 mobile profiles/12,912 assertions, five existing
Wisp/accessibility/recovery checks and Forge contracts3,508 assertions PASS.
No blanket rerun of all147 on the post-merge Forge wording is claimed; its
unrelated text delta is retained and the affected checks were reassessed.

Main advanced again to210005d when PR61 Bond presentation merged during final
receipt publication. The non-fast-forward push was rejected without overwriting
that work; the receipt rebased cleanly. Normal F04 and all12 mobile profiles/
12,912 assertions PASS on that source, SHA256
1e0d51370b5b62f313dad6953f9b26bb7d7a1a886785dbccc6dfaac379779981.
Signed140 and native receipts below remain tied to0e9b54c, not later APKs.

[Android build37710185974](https://github.com/karahaNx/Lumenfall/actions/runs/37710185974)
passes on the integration commit and publishes signed0.1.140, versionCode140,
package com.lumenfall.app and the established certificate. A fresh downloaded
APK passes aapt/apksigner, every container CRC and all15 bundled asset byte checks.
APK SHA256 matches GitHub release digest:
c0c81462151c485b16f85dc2c0e53d258ba45c60f92a32539e9e2d6a7153696d.
An immutable [signed APK copy](../../archive/android/wisp-upgrade-display-001/Lumenfall-0.1.140.apk)
is preserved because android-latest can be replaced by later builds.

Actual signed138 to140 emulator installation succeeds and preserves native
WebView Local Storage tar bytes exactly before launch. The emulator is Android8.1
/API27/WebView61.0.3163.98 using software CPU emulation, not a physical phone.
Actual signed140 native Wisp UI PASS: incomplete Module19 remains visible without
a fold, final Module native tap reaches the existing cap20 and retains open/focus,
native Enter/tap folds/opens, and folding changes neither save slot. At least44px
controls/no page overflow/no observed interaction errors. Exact bundled product
JS/CSS matches source; synthetic emulator save/timestamps and held interval
callbacks during immediate measurement are documented. Prior adapter scrolling/
input timing failures and the successful rerun are preserved; no product fix was
needed. This is WebView61 emulator evidence, not physical/exact60/TalkBack.
Host platform-tools failed on read-only /home/agent/.android; the scoped direct
protocol adapter refuses authenticated devices and mutations require ro.kernel.qemu=1.

Remaining: affected-phone/exact native WebView60/TalkBack acceptance. A device
availability question was sent to the user after APK publication; no answer or
physical results are assumed. Self-review/automation is not independent review.
The available implementation, CI, integrated checks, signed140 and native checks
are delivered. This final scoped GitHub checkpoint saves receipt/task/PROJECT_STATE,
raw evidence and an immutable signed140 APK; shared-file work stops after its
publication. Next required action: run the linked physical
acceptance checklist on the affected phone/exact WebView60/TalkBack and save results
in GitHub. Keep this owner chat open until that required acceptance passes; do not
archive another chat. No generic approval is needed again.
