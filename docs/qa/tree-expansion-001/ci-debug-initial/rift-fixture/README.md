# Rift reconstruction fixture — exact-debit repair

This is a dormant Full-gate fixture defect found before publishing the first
Tree test-repair commit. It was reproduced against the unchanged production
source `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`.
The initial CI run had stopped earlier, so this is a local state reproduction,
not an assertion that the failed initial Full run reached this scenario.

## Cause and correction

The original `rift-status.js` reconstruction fixture assigned `1e20` Lumen,
then called the actual `formationTest.buy` bridge for missing members. The
current exact-debit guard correctly rejects purchases whose quoted debit
cannot be represented at that wallet magnitude. For the actual longest-Bond
formation, all four missing recruits were unavailable. Each attempt left the
complete state and both save slots unchanged and made zero storage writes.
The fixture's reconstruction predicate was false.

The fixture now uses **3,000,000 Lumen**. An independent ledger of the eight
unchanged level-zero recruit prices totals **2,684,530**, so this wallet covers
any selected five. Every debit and remaining wallet is an integer below
`Number.MAX_SAFE_INTEGER`. The fixture remains a fresh, Bonds-0, zero-new-Tree
state before its actual Ascend; no discounts or extra recruitment levels apply.

The existing selector chooses Ember, Void, Tide, Aurora and Stone. Ember is
already powered after Ascend; the four actual paid recruits are:

| Wisp | Exact debit | Paid level | Wallet after purchase |
|---|---:|---:|---:|
| Void | 70,000 | 1 | 2,930,000 |
| Tide | 60 | 1 | 2,929,940 |
| Aurora | 400,000 | 1 | 2,529,940 |
| Stone | 360 | 1 | 2,529,580 |

Each joins the actual intended Formation and performs the two normal save
writes. The final ordered party matches the original intent, clears the
pending rebuild, and restores Starcaller, Dawnpriest, Kindling and Vanguard.

The browser test adds nine state assertions for exact debit, level, membership
and final ordering. All **144 original assertion-bearing source lines** remain
byte-for-byte, including the final visible Bond-text assertion. Product code,
helpers, scenario inventory and negative-control hooks are unchanged.

## Evidence and limits

- [Original reproduction](original.stdout.json): 10 probe assertions pass,
  proving rejection and the original fixture's **false** reconstruction
  predicate. Its `status: pass` describes the reproduction, not UI acceptance.
- [Fixed reproduction](fixed.stdout.json): 20 probe assertions pass, including
  the nine new fixture assertions and the **true** reconstruction predicate.
- [Syntax receipt](syntax.json): the changed source passes `node --check`;
  all **29 inline scripts** in the actual generated Full document parse;
  all 144 original assertion-bearing lines are present.
- [Receipt](receipt.json) binds the original/fixed test hashes, unchanged
  product source, process results and patch round trip.
- [Manifest](manifest.json) records original and stored bytes/SHA256 for every
  payload. Gzipped stderr and patch bytes are preserved without redaction.

[The reproduction script](reproduce.cjs) executes the complete production game
IIFE using the existing Tree harness. It injects only observation references
and calls the original browser bridge's exact `setState`, `ascendManual` and
`formationTest.buy` functions. The original fixture seed, longest-party
selector and reconstruction purchase block execute directly from the selected
`rift-status.js`. Gameplay, purchases, Ascend, reconciliation and saves are
not replaced. DOM rendering uses the existing harness's no-op presentation;
the probe reads actual powered Bonds directly instead of synthesizing a DOM.

**Actual Full browser execution is still required.** No local Chrome was
launched, no native-input or layout success is claimed, and this fixture repair
does not accept PR106 or replace any required positive/negative gate.

## Reproduction and patch

Use Node 20+ and supply a trusted UTC timestamp. The optional first two
arguments are the repository root and the selected original or fixed test file:

```sh
node docs/qa/tree-expansion-001/ci-debug-initial/rift-fixture/reproduce.cjs \
  /path/to/Lumenfall /path/to/rift-status.js 2026-10-10T20:44:06Z
```

The original file is present at candidate
`0c539c528d3b950a786d0ea377fcfc59499f1a3a:tests/behavioral/rift-status.js`.
The [gzipped fixture patch](rift-status.patch.gz) contains only the test change.
Both reverse application (fixed to original) and forward application were
verified in a separate scratch copy against their exact hashes. No repository
files were changed during that patch verification.

Original test SHA256:
`b48be63c2b2a3853c5492fb24a752a360c68681a250f0bdf6b8ed3bb54db7280`.

Fixed test SHA256:
`879a7a0ab5c71dbf398694ed76dd036fe44351f44294643a58002ab3a903df42`.

No staging, commits, remote writes, reruns, main changes or APK actions were
performed by this audit. The feature owner publishes the coordinated repair.
