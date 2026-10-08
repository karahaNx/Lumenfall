# Required CI313 failure disposition

Run37757811435/head339fbe5/source55676982 failed before gameplay in the new
Rift cosmetics gate: Target.createTarget timed out. Source/tooling/identity
checks passed. Local binary AND shell-launcher runs pass168 cosmetics samples
and the negative control. The timeout root cause is unconfirmed; do not claim
a reproduced launcher failure. Chrome's launcher redirects descriptors, so
the driver now selects its installed ELF or the established QA binary override
to remove that dependency. No game changes, skipped assertions, relaxed
deadlines or added retries. GitHub CI must establish whether this resolves it.
Raw redacted CI log: ci-313-failure.log.gz. Local browser identities, selection
and all passing samples are retained. Unknown swift-recovery-contract and
lab-ui-contract invocations were scenario-name errors, corrected to the
actual catalogue scenarios. Required full CI still blocks integration.
