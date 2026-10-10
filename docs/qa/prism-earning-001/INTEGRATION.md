# Task01 — development-only integration acceptance

PR103 now targets `feature/progression-expansion-2026-10-09`, not main.
The three validation workflows accept that exact development target and retain
all their prior gates. Main/release/Android files are unchanged.

## Combined candidate and actual initial failure

Candidate12d9ad54 merges exact Prism37a1c8d and collectionf145bf2.
Product SHA256d4ac7160103da236623164445791478ff42a94d03dbf548aff11cde25f952f0a.
The previously separate PR102 source was not assumed to inherit Prism acceptance.
Its Lab price text stayed red after the wallet became sufficient: initial
combined source8ad085ec fails the real browser check at assertion100. Both
runs37926838326 and37927267361 preserve this causal original failure.

Fix:mark actual displayed prices by currency/amount, derive each color from its
own wallet, update at the existing500ms affordability refresh. Tree/shop button
eligibility also refreshes through existing authoritative plans/ownership checks.
No deficit text, new spending path, price, save or economy mutation is introduced.
A sufficiently large wallet stays normal-colored even when an independent exact
payment guard refuses a purchase. Forge formatting, Lab work and Comet ownership
remain unchanged. Unneeded concatenations with empty legacy UI are cleaned up.

## Focused integration acceptance

Prepare run37927267361:SUCCESS on37a1c8d, committed12d9ad54 only to the isolated
candidate branch, with collectionf145 retained as its second parent. It did not
advance the development collection or main.

- Actual combined source passes341654 numerical/3506 state assertions.
- Currency UI:3552 assertions/12 mobile profiles,48 trusted touch purchases,
  per-currency insufficient/enough/exact/one-short transitions without rerender,
  normal/reduced motion and100/200% root text; controls44px, focus, two-slot saves
  and all legacy levels preserved. Three deliberate defects fail through actual
  assertions:stale-refresh(100),all-white(4),retired-Tree-card-restored(2).
- All ownership/math/persistence/chronology and retired-purchase-denial assertions
  in existing tests remain. Only obsolete visible-legacy-card expectations become
  explicit absence assertions; contrast is now checked on retained active cards.
- Earlier run37926838326 failed a touch measurement before the Deeds entry
  transform completed. The driver now awaits the actual CSS animation promise;
  strict44px bounds and real input remain. That initial run is not called green.

Artifact11614273417, collection-preparation-37927267361, ZIP SHA256
261df024cfad06c70824733ea8e5bfa92c63544bd641468d1f78bfe044d347ab,
expires23October2026. It includes raw original/corrected/mutant results and
screenshots. No private save or font binaries are included in this artifact.
The earlier failed artifact11614163170 remains available separately.

## Required final acceptance and limits

The full required suite, focused Prism, mobile/old-V8 closeout, and new currency
UI gate must pass on the final combined commit after preparation cleanup.
No merged/fully accepted state is anticipated here. PR103 and PR102 will record
exact final-head CI, merge commit/tree and verified main/release hold.
The original longer mandate is archived unchanged so both actual task checkpoints
fit the32KiB context gate; no context limit is weakened.

Old-engine and desktop-mobile observations are not physical Android, native
WebView60, OS font-size or TalkBack acceptance. They remain final-release checks.
Comet redesign and Lab/Forge/Tree expansion have not been implemented by this
integration. The previously recorded late Swift ROI requires later Tree pricing
work; a passing reward test is not proof the entire economy is balanced.
