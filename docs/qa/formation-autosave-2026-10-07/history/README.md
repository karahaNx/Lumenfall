# Superseded rebased check and correction

The first rebased full run has one failure: `offline-catchup-core` expects
`activeFormationPreset: ''` after a partial Ascend rebuild, while F14 requires
the saved Boss destination to persist. That complete failing suite/result
is preserved here; its aggregate exit is 1 and is not acceptance.

The corrective comparator derives the expected retained destination from
the old oracle's exactly associated saved intent. All other fields and every
summary still compare exactly. The focused rerun passes, including long
catch-up, live/offline chronology, cancellation, rollback, restart and recovery.
No product bytes changed in this correction. The subsequent clean full run
uses the frozen final source/test files; its receipt is in the parent folder.
