# Pending progression choice after PR90

Main31eccfb retires future purchases of focus/sense/formation/resolve. Its matrix
explicitly leaves Forge20/60 progression dependent on uncapped Swift. Cap10
therefore removes the fresh-player route to those Deeds, including Auto-Empower.
The approved Swift cap and original thresholds cannot both ship unchanged with
that route removed. The user has been asked to choose the continuation rule.

Recommended concrete candidate (not implemented or approved):

- Keep Swift cap10, minimum10/3 seconds, original20/60 thresholds and rewards.
- Count all original raw Forge levels, including overcap historical Swift.
- Add only future completed levels in lumenstudy, shardstudy, wispascend and
  guardmastery: the four actual Lab successors chosen by PR90.
- Capture their current levels once as an optional schema-v1 baseline on first
  migration. Fresh games start with zero baselines. No retroactive credit for
  already completed Lab levels; earned Deeds stay sticky.
- Primary/recovery/backup retain that baseline atomically. Restore replaces the
  whole snapshot; Ascend retains it; Reset clears it. No price, work, combat
  multiplier, fixed Mote reward or old raw level changes.
- Explain the progression scope in both Deed descriptions. Verify reachability,
  threshold edges, paid completion exactly once, huge/legacy levels, save/recovery
  and snapshot restore without duplicate reward.

Until the user's choice is recorded, prepare the merge/refund checks and keep
integration open. A different Deed requirement needs concrete approved values.
