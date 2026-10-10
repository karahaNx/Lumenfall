# Tree core receipts

The current candidate result is in `review-acceptance.json` and `review-final2.stdout.json`: 5,267 assertions and 28 causal negatives, source `4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef`. The added manual-kill regression verifies that a primary-save failure returns from Auto-Ascend without suppressing the normal post-kill Deed, followed by one successful reset on retry.

`core-acceptance.json` and `final.stdout.json` preserve the earlier 5,243/27 result on source `331a371f…`. The original development attempts are retained with their fixture-correction explanations. `review-notes.json` records the two source-review findings, root corrections, and the scoped addition. No previous raw output was replaced.

`manifest.json` lists every other file in this directory with byte counts and SHA256. These are subagent test receipts, not human approval. Browser/mobile, long offline, numerical and actual V8 acceptance are separate; native Android integration is untested.
