# RIFT_CAST_TEXT_001 — remove repeated Rift ability status

Status: **product integrated; required acceptance passed; final delivery PR74 gate/merge pending**.
Owner: this user-created feature chat. Original F13:

> På rift skærmen skal cast teksten for wisp ability fjernes, der findes progress bar som allerede viser dette.

The [original order](RIFT_CAST_TEXT_001_REQUEST.txt) is preserved verbatim; the user
instructed “Finish the task” on 8 October 2026. Current live-main AGENTS and
[feature workflow](../project/FEATURE_WORKFLOW.md) supersede historical Lead/writer
gates. Standing authorization covers implementation, checks, integration and release.
No subagents, message tools or chat renaming were used.

## Sources, baseline and scope

Required startup/ownership/Visuals/context documents, original requirements,
F13/dependency/save revision, Lead decisions, findings and image/source index were
read. Exact source links and preparation are in [earlier evidence](../qa/rift-cast-text-001/README.md).
Original requirements take precedence; supplied screenshots do not directly prove F13.

Private checkout /workspace/lumenfall-rift-cast-text-001; product branch
feature/rift-cast-text-001, delivery branch docs/rift-cast-text-001-delivery.
/workspace/Lumenfall was untouched. Continuation baseline214d45411ce2fb420f0e4b372063811a967679b1;
final product baseline210005d0ae093d21e846bae41a9bddf25af2800d preserves PR59/60/61.
PR46/B2 startup check: integrated via PR57/20aaae62a4b6e46f8d75775085918eaba4e8de29.
[PR63](https://github.com/karahaNx/Lumenfall/pull/63) integrated F13 at
ab46c0c7f30667c24325b6271f811b46b159d0d1. PR69/d95205f6d8059933fac74e8699854f67cb950a7e
Cosmetics preserves byte-identical F13 renderer. Delivery incorporates main
06f13b820f69e8d93861b562565f7a2a6380b441 Forge/Comet documentation; application,
tests, rules and workflows are unchanged from tested Cosmetics main.

Only six product lines in renderRiftParty change: omit powered CAST/Ready text,
retain unpowered Lv0, progressbar ability name/range/charge/timing and expose
Ready/Casting through aria-valuetext without a live region. Existing expiry,
Formation names, classes, portraits, passive power, Bond grouping, fill, VFX and
reduced motion remain. Guidance/Cosmetics selectors are preserved.

No gameplay values, purchases, Luminous Motes rewards, bulk/queue handlers,
chronology, live/offline, save/migration, CSS/assets, package/signing or workflow
changes. Existing values need no migration; no missing F13 design decision.
QA fixtures use served copies/private emulator handles; signed APK unchanged.
The CSS width tolerance0.00001 percentage points addresses serialization only;
all numeric simulation assertions remain unchanged.

## Acceptance and evidence

[Final receipt/raw evidence](../qa/rift-cast-text-001/finish/README.md) records identities,
commands, diagnostics, limits and review disposition.

| Criterion | Verified result |
| --- | --- |
| No repeated visible state, names/ARIA/expiry retained | Integrated12 profiles/384 observations; baseline-visible/missing-ARIA causal controls caught. V8 6.0 renderer32 states and existing Rift checks PASS. |
| Mobile/accessibility/real gameplay | Browser320/390/430 × normal/200% text × motion PASS; 44px controls, focus/contrast checks. Native120 states/24 real casts across three widths, observer-only renders, AX progressbar, font scale2 and real Android Tab/visible outline PASS. |
| Save/recovery/live/offline/chronology | All12 scoped integrated regressions PASS. Actual signed138→142 update preserves WebView storage byte-for-byte and first-launch Wisp ownership. |
| Required CI | Original integration CI37713097586:148 defaults/12 negatives/guarded startup PASS. First delivery CI37718210381/head75d7782:151 defaults/12 negatives/guarded startup PASS; full logs saved. Final-head gate required before merge. |
| Later integration overlap | Cosmetics24 default/equipped profiles/768 observations,12 scoped checks and V8 parser/renderer PASS; later main changes docs only. |
| Signed APK | Build37714666181:0.1.142, com.lumenfall.app, established signing cert, release digest, ZIP CRCs/all15 assets PASS. [Immutable APK](../../archive/android/rift-cast-text-001/README.md). |

APK SHA256 ec361d641cd5c5dff62322cc90e85bfff6d42d0f5f0877630469f97c451756a0;
its integrated HTML SHA256835e1f19c4d51025a41583786c52d8b6ff09ab11cf4afcfec4a49146f40734b3.
Current main HTML SHA2565c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c.
Native acceptance belongs to immutable142; no native143 claim.

## Review, limits and next action

Automated review PRRT_kwDOUF0Vls6qK_0e correctly found missing resume binding.
The helper now hashes actual installed APK bytes, compares the supplied artifact,
persists source/installed identity and rejects missing/mismatched prior identities
before importing records. Three causal identity controls PASS. Fresh bound
138→142 update/120 states/24 casts/AX/font and a separately bound keyboard follow-up
replace earlier unbound evidence. Android SystemUI's ANR dialog intercepted Tab;
after dismissing that isolated dialog, APK/source and native input focus were
reconfirmed and actual Tab/visible outline passed. No oracle weakened.

Unchanged compact five-Wisp name overflow at200% has identical baseline/candidate
geometry; broader layout acceptance is not claimed. Native checks use isolated
Android8.1/API27/WebView61.0.3163.98 software emulation; physical WebView60/TalkBack
are not claimed. V8 6.0 verifies Chrome60 engine generation separately. Native61
lacks reduced-motion; modern-browser checks cover it. No independent review claim.
Earlier local browser timeout/native transport/display/segmented runs remain
historical diagnostics. Other tasks retain their own open acceptance gates.

[PR74](https://github.com/karahaNx/Lumenfall/pull/74) saves status, immutable APK and
raw receipts. Next: pass final-head required CI, resolve the addressed review,
merge and verify remote main/evidence/source, stop this task's shared-file work,
then archive only this owner chat. Final immutable CI/merge receipt is saved in
PR74's description to avoid a self-referential CI commit. Archive success requires
an actual app-tool response. An open PR is not completed delivery.
