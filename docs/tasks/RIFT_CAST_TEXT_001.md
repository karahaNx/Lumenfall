# RIFT_CAST_TEXT_001 — remove repeated Rift ability status

Status: **complete — integrated, signed APK and required F13 acceptance verified**.
Owner: this user-created feature chat. One goal: remove repeated visible Cast/Ready
status from compact Rift Wisp cards, preserving ability names and programmatic status.

## Original requirements and continuation

Original F13:

> På rift skærmen skal cast teksten for wisp ability fjernes, der findes progress bar som allerede viser dette.

The [original feature order](RIFT_CAST_TEXT_001_REQUEST.txt) is preserved verbatim.
On 8 October 2026 the user instructed: **“Finish the task”**. Current
[feature workflow](../project/FEATURE_WORKFLOW.md) and the
[accepted workflow replacement](../decisions/2026-10-07-feature-chat-workflow.md)
authorize this owner to complete implementation, checks, GitHub integration and
release within this scope. Historical Lead/writer handover gates are superseded;
no new general approval or separate role chat is required.

Authoritative sources read: [full original](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt),
[F13/dependencies/save requirements](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt),
[registered decisions](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt),
[findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) and
[image/source index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
Original requirements take precedence over suggestions. The supplied screenshots
show other screens; none directly establishes F13 behavior or an APK/save identity.

## Baseline, scope and decisions

Private checkout: /workspace/lumenfall-rift-cast-text-001, feature/rift-cast-text-001.
The original /workspace/Lumenfall checkout was untouched. Preparation history is
preserved in [earlier evidence](../qa/rift-cast-text-001/README.md).
Continuation began on main 214d45411ce2fb420f0e4b372063811a967679b1.
Final application baseline 210005d0ae093d21e846bae41a9bddf25af2800d includes
PR59 Wisp upgrades, PR60 Forge text and PR61 Bond text. All are preserved.
PR65 later exports the existing findChrome helper; execution/assertions are unchanged.
PR46/B2 was checked at startup: integrated via PR57 at 20aaae62a4b6e46f8d75775085918eaba4e8de29.
No subagents, message tools or chat renaming were used. Current live-main rules
supersede the historical Lead/writer handover gates; standing approval covers delivery.

Only six product lines in renderRiftParty() change: powered cards omit CAST/Ready;
unpowered Lv 0 stays visible. The existing progressbar retains Wisp/ability name,
range, true charge and timing. aria-valuetext exposes Ready/Casting without a live
region and follows the existing cast expiry. Formation ability names, portraits,
passive power, Bond grouping, fill, VFX/classes and reduced motion remain intact.
The compact cards previously had no separate visible ability name.

Existing Rift assertions and the focused Node driver cover this behavior. A 0.00001
percentage-point CSS serialization tolerance is limited to displayed width; numeric
simulation expectations remain unchanged. QA instrumentation is confined to served
copies or private runtime handles on the isolated emulator; the signed APK is unchanged.
No gameplay values, deterministic purchases, Luminous Motes rewards, bulk/queue
handlers, chronology, live/offline policy, save schema/migration, CSS/assets,
Android package/signing or workflows change. Existing values need no migration.
Guidance/Cosmetics rendering selectors and classes are preserved; no new design
choice or unfinished dependent proposal is required for F13.

## Acceptance and delivery evidence

[PR63](https://github.com/karahaNx/Lumenfall/pull/63) merged at
ab46c0c7f30667c24325b6271f811b46b159d0d1. Integrated application SHA256:
835e1f19c4d51025a41583786c52d8b6ff09ab11cf4afcfec4a49146f40734b3.
[Final receipt and raw evidence](../qa/rift-cast-text-001/finish/README.md)
preserve exact identities, commands, logs and supported limits.

| Required criterion | Verified result |
| --- | --- |
| No visible powered uncharged/charging/ready/casting duplicates; Lv 0 retained | Integrated 12-profile/384-observation matrix PASS; baseline-visible and missing-ARIA negative controls caught. |
| Ability names, true resource/timing, programmatic states, expiry and real casts | Existing Rift checks, V8 6.0 renderer 32 states and native 120 observations including 24 actual casts PASS. Rendering/cosmetic updates remain observer-only. |
| Mobile widths, large text, 44px controls, focus, contrast and reduced motion | Browser320/390/430px × motion × text profiles and existing accessibility checks PASS. Native three widths, 44px controls, real system font scale 2 (20px), AX progressbar and Android Tab/focus PASS. |
| Relevant save/recovery, live/offline, chronology and required CI | All12 scoped checks rerun on integration PASS. CI37713097586 on 4452f7ad3b84becda0ec3b028a603566b51cc45d passes 148 defaults,12 required negatives and guarded startup. Integrated application bytes equal the tested head; tooling/source/context also pass. |
| Signed integrated APK and update acceptance | Build37714666181 publishes 0.1.142; package/version/established cert, release digest, all ZIP CRCs and15 bundled assets PASS. Actual signed 138→142 update preserves storage byte-for-byte and ownership on first launch; native acceptance PASS. |
| Durable status and owner completion | This task, PROJECT_STATE, immutable APK and raw receipts are saved together in the final GitHub checkpoint. Only this owner chat is eligible for archive after remote verification. |

APK SHA256: ec361d641cd5c5dff62322cc90e85bfff6d42d0f5f0877630469f97c451756a0. Package com.lumenfall.app and the established
A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21
certificate are verified. [Immutable APK](../../archive/android/rift-cast-text-001/README.md).

## Following Cosmetics integration

PR69/d95205f6d8059933fac74e8699854f67cb950a7e merged during verification. F13’s renderer is byte-identical. Current-main24 default/equipped-cosmetic profiles (768 observations), all 12 scoped checks and V8 6.0 parser/renderer checks PASS. [Overlap receipt](../qa/rift-cast-text-001/finish/cosmetics-overlap/receipt.json). Native acceptance belongs to the immutable142 APK; no native143 claim is made.

## Limits and final action

The unchanged 200% compact five-Wisp name overflow has identical measured geometry
on latest baseline and candidate; broader layout acceptance is not claimed.
Native evidence uses isolated Android8.1/API27/WebView61.0.3163.98 software emulation.
V8 6.0.286.52 parses/executes the product renderer for Chrome60's engine generation;
exact physical WebView60/TalkBack testing is not claimed. WebView61 does not support
prefers-reduced-motion; modern-browser checks verify the existing motion contract.
Self-review and automated checks were performed; no independent review is claimed.

The default local Chromium151 dump-DOM timeout and two native harness failures
(startup-socket race and Android's minimum physical display size) are retained as
diagnostics. Corrected transport/display setup preserves all acceptance assertions;
the native acceptance combines the successful update/320/390px checkpoint and a same-APK continuation for 430px/AX/font/keyboard. All120 observations and 24 real casts pass. Earlier 146/147 CI receipts are historical.

The additional current-main harness attempt initially used old staged835e HTML with the new PR69 bridge, yielding queueCometTrial reference errors. It is preserved as a diagnostic; the corrected current-root run passes all 12 scoped checks.

No required F13 acceptance remains open. Verify the final GitHub checkpoint, stop
this task's shared-file work, then archive only the calling owner chat via the app
tool. Other tasks retain their own recorded acceptance. Archive success requires
an actual tool response; no archive outcome is invented in this document.
