# Failed initial Tree CI — diagnosis and scoped test repairs

**Historical FAILED attempt. This package does not accept the candidate for integration.** Audited 10 October 2026, 20:36:24 UTC from `clock__curr_time`.

| Identity | Exact value |
| --- | --- |
| PR / run / job | PR 106 / 38083768940 / 114305874246, attempt 1 |
| Feature head | `0c539c528d3b950a786d0ea377fcfc59499f1a3a` |
| Development base | `2d01049393e3bb45a90d80e07af52ae0484b0ec5` |
| Synthetic merge | `3a65d44e1bb0fadc35e98ced5e0e99b7840bc7ac` |
| Tree | `da50c4eead313efee2ad9683e43e5a0cb2ccc71f` |
| Product SHA256 | `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef` |
| Fixture SHA256 | `ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753` |
| Artifact | 11681523118; 3,368,615 bytes; SHA256 `b31a7502ef3a6e69248581693df82870c03ba153ad55255672b71da44d280064` |

The downloaded ZIP matched the GitHub API size/digest and passed CRC validation. Its 44 files and 12 included test scripts were audited; the test Git blobs match the checkout inventory. The artifact commit/tree/source/fixture match the identities above. Its `parents.txt` is blank because checkout is shallow; both synthetic parents are independently verified in the GitHub commit metadata. [Raw audit](failed-ci-audit.json), [ZIP receipt](zip-verification.json), [preservation manifest](manifest.json).

## Actual failures

1. **Step 8, independent Prism closeout:** `ReferenceError: treeLevel is not defined`, through `treeFrontierBonus` → `treeAppendFrontier` → `ascendPrismBreakdown`. The preceding Prism state command passed 3,506 assertions. The old selective closeout adapter included the changed Prism function but omitted its new production Tree dependencies. The exact Node command reproduced exit 1 on the unchanged product. The companion full-workflow Prism adapter was handled separately.
2. **Step 10, Tree mobile:** `raw old paid level retained starlight`, after 2 assertions and before any completed profile or trusted input. Chrome started successfully and closed with exit 0; the test command failed. The actual screenshot/DOM show a fresh 0 Lumen / 0 Prisms / 5-Comet run. The driver had written a different raw legacy payload into storage immediately before `Page.reload`; the unchanged production `beforeunload` handler saves the current in-memory state. Source and DOM therefore identify a fixture ordering conflict. The initial receipt did not retain raw before/after storage, so this is not presented as a proven product save-loss defect.
3. **Step 12, Prism V8:** `ENOENT tree-validation/prism/legacy-cases.json`. Step 8 had aborted before generating that input. Tree V8 itself passed 2,862 assertions in the same step. The browser Prism payout step 9 was skipped following step 8.

Original evidence: [mobile receipt](mobile/receipt.json.gz), [actual failure screenshot](mobile/failure.png), [complete failure DOM](mobile/failure-dom.html.gz), [mobile command output](mobile/command.log.gz), [complete job log](job.log.gz). All compressed content is lossless; the DOM is the original synthetic test page, including its product/observation script, and is retained specifically for reproducing this failure.

## Scoped repairs and local verification

- `prism-closeout-data.cjs` now extracts the actual production catalog/index/treeLevel and numeric dependencies. It does not substitute a zero-returning stub, normalize away the old fixtures or change any existing price, reward, ROI loop or oracle assertion. The exact repaired Node command passes 540 checks and generates all 1,248 legacy cases. [Before process receipt](local-step8/prism-closeout.process.json), [after process receipt](local-step8-repaired/prism-closeout.process.json), [after output](local-step8-repaired/prism-closeout.stdout.log.gz).
- The unchanged Prism legacy runner then executes those generated cases on actual Node 8.3.0 / V8 6.0.286.52: PASS 3,277 checks, 1,248 cases and 600 storage writes. [Process receipt](local-step12-repaired/prism-v8.process.json), [raw output](local-step12-repaired/prism-v8.stdout.log.gz).
- The Tree mobile fixture now seeds both raw schema 1 slots with a one-use `Page.addScriptToEvaluateOnNewDocument` registration, before the next production IIFE loads. The registration is removed after real readiness and before the second reload. Production lifecycle/save handlers remain active; every old paid-value/refund/reload assertion is retained. The observation handle is cleared before each reload so readiness cannot accept the outgoing document. The repaired driver also records the synthetic seed hash, document-start observations, loaded paid fields, and raw synthetic storage on failure. [Complete generated-driver syntax result](mobile/generated-syntax-repaired.json).

Product source remains `4e4707af`. Repaired closeout test SHA256: `3d809e42d59d32b4add58034520148b97797a689fe2f45f013062cc39d9a4dff`. Repaired mobile test SHA256: `8ffec748df96ec66558385fbf6da1a07d7d41f8f3a1980b38baa020b5e0f36de`. The original mobile receipt binds the failed test `62d3dce9`; it is preserved unchanged. Generated-driver syntax is not actual browser acceptance; the repaired mobile suite must pass in subsequent CI.

## Successful receipts within this failed run

| Gate | Actual result |
| --- | --- |
| Tree core | 5,267 assertions; 28 killed causal controls |
| Tree offline | 7,691 assertions; 4 caught controls; 14 ending boundaries; 6 long routes; 4 six-party bounds |
| Tree economy | 16,802 assertions; 6 caught controls |
| Prism state | 3,506 assertions; 180 payouts |
| Tree actual V8 | 2,862 assertions; 94 real-purchase cases; 34 storage-fault cases |
| Existing Prism mobile | 468 assertions; 12 profiles; 12 screenshots |

The complete verified ZIP and extracted artifact remain in scratch for later immutable evidence preservation. Duplicate test bodies and all existing Prism assets are not copied into this compact repair package. The raw audit records their hashes/counts. Visual inspection covered the Tree failure screenshot/DOM and two existing Prism 200% screenshots; the new all-row Tree browser checks were not reached. Required Full/Lab/Forge/Tree gates, including the original 22 Full negative controls, remain prerequisites for integration. No native Android, APK, exact WebView60, physical-device or TalkBack acceptance is claimed.
