# RIFT_CAST_TEXT_001 — remove repeated Rift ability status

Status: **product integrated and required acceptance verified**. Final delivery gate/merge receipt: PR74.
Owner: this user-created feature chat. Original F13:

> På rift skærmen skal cast teksten for wisp ability fjernes, der findes progress bar som allerede viser dette.

The [original order](RIFT_CAST_TEXT_001_REQUEST.txt) is preserved verbatim; the user
instructed “Finish the task” on 8 October 2026. Current live-main AGENTS and
[feature workflow](../project/FEATURE_WORKFLOW.md) supersede historical Lead/writer
gates. Standing authorization covers implementation, checks, integration and release.
No subagents, message tools or chat renaming were used.

## Sources, baseline and scope

Required startup and original F13/decision/dependency/save/evidence sources were read; exact links are in [earlier evidence](../qa/rift-cast-text-001/README.md). Original requirements prevail.

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

Gameplay/purchases/rewards, chronology/parity/save and Android package/signing are unchanged; no migration or missing design decision. QA fixtures never alter the APK. CSS width tolerance0.00001 percentage points covers serialization only.

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
before importing records. Three identity controls and actual already142 rejection PASS. The pre-attested138→142 update,120 states/24 casts/AX/font and bound keyboard follow-up
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

[PR74](https://github.com/karahaNx/Lumenfall/pull/74) saves status, APK and raw receipts. Its final immutable CI/merge receipt is recorded in the PR description. Completion requires a green final-head gate, remote integration/evidence verification, stopped shared-file work and an actual app-tool archive response for only this owner. Other chats are untouched.

Baseline review PRRT_kwDOUF0Vls6qLoBC: actual138 bytes are checked before snapshot/install; the combiner validates the prepared/pre-update identity. Preparation requires successful save and138 cold-launch ownership. [Update/controls](../qa/rift-cast-text-001/finish/native-baseline-bound/native-update.json) PASS; failed setup/probes are historical. CI37722694441/e25fa6b passes151/12/guarded startup; final revised-head CI/merge receipt remains in PR74.

Cold-result fields/ownership validation and historical-source asset replay were fixed after reviews PRRT_kwDOUF0Vls6qMU7L/PRRT_kwDOUF0Vls6qMU7P. Original cold receipt/log provenance is retained; three cold-evidence controls and all15 historical asset comparisons PASS. Final gate/merge evidence remains in PR74.
