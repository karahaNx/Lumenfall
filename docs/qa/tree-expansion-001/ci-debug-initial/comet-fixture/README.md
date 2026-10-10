# Comet required-test fixture repair on the Tree candidate

The exact original command `node tests/behavioral/comet-unlocks-core.cjs` was run locally against published Tree head `0c539c528d3b950a786d0ea377fcfc59499f1a3a`, product SHA256 `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`. It exited 1 at the original assertion `recruit party intent remains` (actual 1, expected 2). This is a local prerequisite failure, not a claim that the skipped initial Full-CI stateful step ran.

The original success fixture used 1e20 Lumen to buy an unupgraded Void recruitment costing exactly 70,000. That Number wallet cannot represent the required subtraction: it debits 65,536. The Tree exact-payment guard correctly refuses it. The manual fixture also kept an old state object across a staged transaction, although a successful save installs a canonical replacement.

Only `tests/behavioral/comet-unlocks-core.cjs` is repaired. A read-only hook observes the original production price. Both manual and automatic fixtures independently require the literal 70,000 price and zero Tree ownership. Their original 1e20 wallet is preserved as an explicit false-return/no-state/no-storage-write rejection. They then fund exactly 70,000, require real purchase success, exact debit to zero, level 1 and the original Single Star failure latch. State is read again after the manual transaction. Every one of the eleven original named cases and its gameplay/persistence expectations remains.

One complete command was run after the repair: PASS, all eleven named cases, exit 0 and empty stderr. Source bytes were unchanged before/after. Raw streams and process/source/test hashes are in `before.*` and `after.*`; the patch is relative to the immutable published head. No product, archived fixture, oracle or negative-control gate was changed. This does not prove the complete pending CI run or native Android acceptance.

Node v24.19.0 / V8 13.6.233.17-node.51. All files other than this manifest are included in the closed byte/hash inventory; identity encoding preserves the original stored bytes and trailing whitespace.
