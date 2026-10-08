# CHEAPER_BONDS_CAP_001 — Cheaper Recruitment cap and explanation

Status: **local candidate; not integrated or product-accepted**.
One goal: explain the recruiting price floor, enforce the existing level-20
effect cap, prevent ineffective purchases and preserve old purchase value.

## Owner, authorization and exact baseline

- Owner: this separate CHEAPER_BONDS_CAP_001 feature chat, Gameplay / Progression.
  Chat ID is not exposed by execution metadata. No other chats are messaged,
  delegated to, renamed or archived.
- User request: F21, 7 October 2026. Standing approval covers this scope.
  Isolated local preparation is authorized. **No shared/remote writer is assigned.**
- Recommended model/effort: GPT-6.1 Sol / Extra high. Actual model/effort selection
  is not independently verifiable from available runtime metadata; this is not
  an execution attestation.
- Worktree: `/workspace/CHEAPER_BONDS_CAP_001`; branch `feature/cheaper-bonds-cap-001`.
  Original checkout `/workspace/Lumenfall` was not edited.
- Initial live main: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, tree
  `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`, product HTML blob `ea44431…`, SHA256
  `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
- Main advanced during testing to **`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`**.
  The private patch rebased cleanly onto this offline catch-up/Node tooling merge.
  Its baseline HTML blob is `90e4678…`, SHA256
  `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
  Other feature bytes are inherited from main, not authored here.
- Candidate HTML SHA256 after the compatible word-wrap fallback:
  **`fc0d985d5a23c111b7e5c4dc7fbf67a2117081d7b3769bfd32a85e6142017de8`**.
- Latest PROJECT_STATE still says OFFLINE-CATCHUP is Draft, although live commit
  comparison proves its merge. That discrepancy proves no APK/device acceptance
  or writer release. Accepted APK receipt remains 0.1.133, `com.lumenfall.app`.
  No build/signing/release/workflow changes were made by this feature.

## Original requirement and sources

Authoritative original:
`docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt`:

> Feks forstår jeg ikke cheaper bonds opgradering i ascension tree, der hvor der står floor 40%.

This feature request concretizes: at least 40% of normal recruiting price means
at most 60% discount; use the existing level-20 effect cap; stop payment without
effect; preserve old purchase value. Original requirements outrank suggestions.

Read live AGENTS/bootstrap, own Gameplay ownership row/role, PROJECT_STATE,
FEATURE_WORKFLOW, targeted CONTEXT_INDEX/CODEX_START; TASK F21 plus dependencies
and save sections; `lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt`; FINDINGS
and both relevant Source_Index files; new B2 START_HER/identity. None of the four
original images shows this node, so none is claimed as F21 rendering evidence.

Lead explicitly requires cap 20, no ineffective debit, preserved raw levels/value,
and concrete save design plus scoped Core review **before implementing** the
one-time transfer/refund strategy. This chat owns F21 only.

## Local candidate and scope

- Rename display to **Cheaper Recruitment**; persisted ID `bonds` remains.
  Show +3 percentage points recruiting discount per level, maximum 60%, price
  floor 40%, cap 20, and actual earned discount/current price share.
- `buyNode` resolves current catalog metadata before checking cap. At 20+ it
  returns before debit, mutation, save or UI work, including stale direct caller
  objects missing cap metadata. The same predicate drives UI/accessible status.
- Show **Maxed** without another price. Old overlevels show effective `20 / 20`
  and the exact preserved raw purchase count separately.
- Keep existing discount and recruiting integer rounding. Last effective purchase
  19→20 costs **2,329 Prisms**; former ineffective 20→21 cost **3,376**.
  Total original cost through level 20: **7,507**. The price floor describes the
  existing multiplier before ordinary integer rounding; no new price-rounding
  policy is introduced.
- Keep raw `nodes.bonds`, save schema, currencies and paid running Lab snapshots
  through canonical save/recovery/backup/Ascend. No refund or migration has run.
- This Tree has single-buy only: no bulk/Max-buy, Tree queue or automated Tree
  purchaser. Existing Auto-Empower/rebuild separately uses recruiting discount.
- Tree text fits 320px/200% text. Supported `break-word` fallbacks precede
  `overflow-wrap:anywhere` for older WebViews.

Excluded: F20/Echoing Rest, Swift/support, Formation, PR46 arithmetic, offline
12h policy, other Tree effects and global balance. Current main's unrelated
offline/tooling changes remain. New feature tests/runners use JavaScript.

## Purchase-value proposal for Core review

User reply: **“Find en balance”**. This delegates the proposal choice, not the
specified Core review. Chosen proposal: **full one-time Prism restitution for
documented purchases above 20, preserving raw levels as history**. It returns
investment in the same currency while retaining the maximum 60% effect and
prices below cap. No replacement effect or guessed refund percentage is added.

The initial main's complete relevant history was examined: **103 index commits**,
all with base cost 2, growth 1.45 and the same ceiling price calculation. Original
history report is preserved inside `qa/cheaper-bonds-cap-001/baseline-b2.zip`.

```text
refund(L) = sum(ceil(2 * 1.45^k), k=20..L-1), for L>20
L<=20: no refund
L=21: 3,376 Prisms
L=40: 12,655,538 Prisms
```

These are design amounts, not credited currency. Saves have levels, not individual
price receipts. Unrecorded external APK prices are not proved by Git history;
Lead/Core must confirm the applicable documented price policy.

Concrete migration contract:

1. Preserve raw levels; add a versioned receipt with original raw level, price
   policy and credited amount. Never silently clamp ownership or add a new effect.
2. Pure canonical conversion reads the original wallet, computes restitution once,
   and emits wallet plus receipt together. Valid receipt prevents another credit;
   repeat normalization is idempotent.
3. Canonical/recovery/export/restore share the transformation. Both save slots
   retain wallet and receipt together. Invalid receipts and partial writes must
   not drop the record and later repeat a refund.
4. Restore replaces the complete normalized snapshot; it never adds an old
   backup's refund to today's wallet. Repeated restore produces the same
   compensated snapshot, not an additive currency loop.
5. Preserve paid Lab snapshots/chronology. Test old/current backups, repeat
   normalization/restore, recovery fallback, write rollback, Ascend and reset.
6. Resolve amounts exceeding safe Number precision/finite wallet representation
   explicitly. No silent truncation, amount cap or BigInt dependency. Extreme raw
   data remains preserved pending a reviewed policy; this unresolved edge is not
   final purchase-value acceptance.

**Migration implementation awaits scoped Core review.** The local patch preserves
ownership/current benefit but does not complete the value-transition requirement.
Coordinate name/ID/history with future F29 Tree identity; do not fold F29 here.

## Dependencies and remote checkpoint

PR46 remains open/Draft on `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, tree
`70073a55d7f5fe428ae82223627603498cc372b6`. New archived B2 tree:
`758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index SHA256
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Worker-PASS is reported; fresh scoped Core/QA acceptance is still missing in
PROJECT_STATE. 02_08 local stop is documented; later 02_07 writer release is unknown.
Another feature's publication/merge assigns no writer to this chat.

Lead's checkpoint must recheck branches, open PRs, active runs, exact bytes and
writer, then save task/patch/evidence in GitHub. Reassess/rebase after actual B2
integration if relevant bytes change. No remote write/PR/merge/build/dispatch or
release occurred here. Standing approval is not replaced by a new permission ask.

## Acceptance and verification

- Clear recruiting identity, floor/discount explanation and truthful cap/earned UI.
- Original exact prices through 20; zero mutation/debit/save at 20+ on every
  existing path, including repeated/stale direct invocation.
- Raw purchases, currencies/permanent state and paid Labs survive canonical,
  reload, recovery, backup/restore and Ascend. Reviewed idempotent value migration
  is implemented before final acceptance.
- Relevant live/offline/split chronology and Auto-Empower boundaries are preserved.
- 320/390/430px, 100%/200% text, 44px controls, real touch/keyboard, visible focus,
  contrast and reduced motion. Actual Android/WebView60/TalkBack still required.
- Exact integrated commit, gates, APK/package/signing/device acceptance, GitHub
  status/evidence and writer release precede completion/archiving.

Focused current result: **383 contract assertions**, **12 mobile combinations**,
raw 21/40/2000 actual reload, corrupt-primary recovery, two real backup restores
and Ascend: PASS. Minimum measured text contrast **9.09:1**. Native touch/Tab/Enter,
post-cap focus movement, 44px controls, 200% fit and reduced motion pass.

Node 8.3.0 / V8 6.0.286.52 parsed/executed the actual candidate: **400 blocked
old-object purchases**, levels 20/21/40/2000, **zero writes**. This engine check
does not establish Android DOM/lifecycle/TalkBack acceptance.

Current source/context/APK self-test/tooling gates and guarded browser smoke pass.
All **132 existing scenarios / 152 browser-driver result groups** pass (exit 0).
All **12 required workflow negatives** and **4 F21 defect controls** are caught
with the expected exit 1 and valid failure results. Dense layout at five existing
profiles and the **941-assertion clarity check** pass on the final HTML.

The full suite tested source SHA256
`36cadb249a6107cc18c811ef102cbaa5ea724a99fb0c8cfc56d0f419c7ebe513`.
The only later difference is the single CSS `break-word` compatibility fallback;
exact byte comparison confirmed this. Focused/mobile, cap V8, final dense layout,
clarity, negatives, gates and smoke test the final `fc0d985…` HTML. Gameplay code
is identical between those versions. Evidence index: `qa/cheaper-bonds-cap-001/README.md`.
Own results are not independent Core/QA.
Earlier diagnostics/interrupted older-baseline suites are hash-preserved in
`baseline-b2.zip` and do not count as current-candidate acceptance.

Chromium 151 `--dump-dom` hangs here, even on a data diagnostic. The explicit
local CDP adapter reads the unchanged harness's completed actual QA DOM via its
existing pipe protocol. Assertions, fixtures, result parser and failure tolerances
are unchanged; native drivers pass through to actual Chromium. Ordinary CI on
the integrated version remains required. See the evidence README for reproduction.

## Next action and completion state

The local candidate is checked and frozen; TXT/ZIP provide the user's Lead
handoff. Lead coordinates B2 review/writer handover, confirms value design
and obtains Core review before migration implementation. Preserve everything in
GitHub at the writer checkpoint; verify integrated behavior and required APK/device
acceptance, update PROJECT_STATE/task evidence and release this feature's writer.

GitHub checkpoint: **missing**. Integration: **missing**. Value migration:
**pending Core/design**. APK/device: **missing**. Remote writer: **not assigned**.
Archive status: **open**. This is not a finished feature.
