# First Tree CI attempt and adapter repairs

Candidate PR106 head `0c539c528d3b950a786d0ea377fcfc59499f1a3a` is **not
accepted**. Its synthetic merge `3a65d44e1bb0fadc35e98ced5e0e99b7840bc7ac`
has ordered parents `[2d01049393e3bb45a90d80e07af52ae0484b0ec5,
0c539c528d3b950a786d0ea377fcfc59499f1a3a]` and complete tree
`da50c4eead313efee2ad9683e43e5a0cb2ccc71f`.

Product SHA256 remains
`4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`.
Frozen fixture SHA256 remains
`ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753`.
The repairs below change test adapters only. No product, old expected reward,
frozen save, original negative control or workflow gate is weakened.
The current Forge count is9,308, as recorded in the final local raw stdout
and initial CI. The prior summary's9,291 was copied from the older Forge-only
baseline; the17 additional assertions preserve the17 new Tree fields. This
documentation correction does not change the test or its results.

## Actual terminal CI results

| Workflow | Run / job | Result and remaining gate |
| --- | --- | --- |
| [Full](https://github.com/karahaNx/Lumenfall/actions/runs/38083769079) | 38083769079 / 114305874535 | FAILURE at step9 Prism numeric regression. Currency,182 default scenarios,22 required negatives, guard and smoke were skipped. |
| [Lab](https://github.com/karahaNx/Lumenfall/actions/runs/38083768886) | 38083768886 / 114305874057 | SUCCESS, all11 steps including actual mobile and V8. This does not accept the failed combined candidate. |
| [Forge](https://github.com/karahaNx/Lumenfall/actions/runs/38083768789) | 38083768789 / 114305873968 | FAILURE at step7 historical offline comparison. Core, calibration, actual mobile and V8 succeeded. |
| [Tree](https://github.com/karahaNx/Lumenfall/actions/runs/38083768940) | 38083768940 / 114305874246 | FAILURE: step8 ROI adapter, step10 mobile legacy fixture; step12 Prism V8 then lacked the generated input. Core/offline/economy, Prism mobile and Tree V8 passed; actual Prism browser step9 was skipped. |

Full produced no artifact: the upload action reported no matching files because
execution stopped before its evidence directory was created. The API confirms
an empty list. The original complete job log, failed-step metadata and local
reproduction are retained under `full/`; no missing182/22 results are inferred.

## Confirmed causes and scoped corrections

**Prism adapters:** `prism-earning.cjs` and `prism-closeout-data.cjs` extract the
canonical reward block into a separate VM. The block now calls the real
`treeLevel` through Frontier Record, but the adapters did not include the new
catalog and helper. Both failed with `ReferenceError: treeLevel is not defined`
before their affected assertions. Load the actual NODES/TREE_EXPANSION index,
`treeLevel`, and original numeric normalizers. Missing new IDs remain zero via
the real production helper; no stub forces a result. All prior independent
reward formulas, price expectations and causal mutants stay unchanged.

The corrected numerical command passes341,654 assertions,277,916 formula
cases,3,780 payout cases and all seven original causal controls locally.
Exact source/test/runtime identities and raw failure/pass outputs are in `full/`.
The corrected closeout command also passes540 checks and generates all1,248
original old-engine cases. The unchanged actual Node8.3/V8 6.0 Prism driver
then passes3,277 assertions and600 writes using those generated cases. These
are local repair checks; their complete required CI steps remain pending.

**Offline counterfactual:** `legacyPrismPolicy()` replaced a whole source span
to install the original Prism reward policy. That span now also contains Tree
transition helpers; removing it caused `treeAscendMotesForWallet` to be absent.
Replace only the two intended named historical Prism function bodies. Before
the complete unchanged historical-state oracle, explicitly require all17 new
named Tree IDs and training progress to be zero, then project only those
verified additive defaults. Existing Lab/Forge/value assertions remain intact.
The exact full local command subsequently passed all17 records in301.083s
(process301.230s), exit0 with empty stderr. Clear21 eight-hour runs produce
302,400 kills and14,400 Ascends with identical256/31 endpoints; the72h/96h
capped cases produce453,600 kills and21,600 Ascends. Its terminal evidence is
under `offline-local-final/`; the earlier `forge/repair-status.json` remains an
unchanged, correctly timed pending snapshot.

**Mobile cold-load fixture:** the first profile wrote its raw schema1 save
into a running fresh game's storage, then reloaded. The real `beforeunload`
handler correctly saved the still-fresh in-memory state over those injected
slots. The screenshot/DOM therefore show a fresh run; the retained paid-level
assertion failed after two checks. Install the raw synthetic fixture once at
the next document start before the game IIFE, then remove that injection before
the second reload. Keep the outgoing lifecycle save, actual migration and every
raw paid-value/refund assertion. The repaired driver records the synthetic seed
hash, pre-load slot equality and loaded state for diagnosis.

The initial Tree artifact is3,368,615 bytes, SHA256
`b31a7502ef3a6e69248581693df82870c03ba153ad55255672b71da44d280064`;
downloaded size/digest and ZIP CRC were verified. Its original mobile receipt,
failure image and lossless DOM are retained under `tree/`. Browser execution
of the corrected driver remains required; generated-driver syntax alone is
not mobile acceptance.

## Additional stale contracts in previously skipped Full scenarios

Pre-publication review found that `comet-unlocks-core.cjs` used1e20 Lumen to
demonstrate a70,000-Lumen Void recruitment. At that magnitude, subtraction
represents65,536 instead, so the new exact-debit guard correctly rejects it.
The test also retained the old in-memory object after a staged manual purchase.
The exact original command reproduces `recruit party intent remains` with
one active member instead of two. Both original extreme wallets are now kept
as strict manual/automatic rejection and full-state/storage/no-write tests.
The success paths independently require the original70,000 price, use exactly
70,000 Lumen and re-read the committed state. All11 original named cases and
Single Star expectations pass. See `comet-fixture/` for the original failure,
exact test patch and complete passing command output.

The Rift-status reconstruction scenario has the same oversized-wallet fixture
assumption; its historical UI/Bond expectations remain required. The legacy
identity scenario also projects all active Tree nodes while expecting only the
original three price rows. Its retained-price oracle must select the three
original IDs, independently require20 active tracks, and explicitly keep new
Tree ownership zero in historical-factor probes. These scoped corrections are
recorded under `rift-fixture/` and `identity-fixture/`. Actual Full browser
execution and every original negative control remain mandatory.
The bounded Rift reproduction uses an independent3,000,000-Lumen wallet:
four actual recruits debit70,000/60/400,000/360, leaving2,529,580 and restoring
all four original Bonds. The original1e20 probe retains full state and storage
with zero writes. The identity probe confirms the actual20-versus3 catalog
mismatch and exact retained prices after projection, and compiles the generated
base/three original identity-mutant documents. These are production-VM and
syntax results, not a claim that the skipped Full browser scenarios ran.

## Next action and evidence scope

Publish the coordinated test-only repair and run every mandatory workflow on
that exact head. Inspect all previously skipped gates, all22 individual raw
negative traces and actual mobile artifacts. Keep PR106 and PR102 draft until
the Tree candidate is accepted for development integration; never change main
or build/publish an APK in this task. Native/physical/TalkBack acceptance remains
open. Raw logs and patch snapshots are preserved byte-for-byte, including any
historical whitespace; code/test changes receive their own diff checks.
