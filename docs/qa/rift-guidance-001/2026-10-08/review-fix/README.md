# Reviewed keyboard assertion and feature-head acceptance

Automated review PRRT_kwDOUF0Vls6qPbmK found that a prevented Tab could leave
focus on the hints toggle and pass the previous predicate. Require exact
nav-spirits focus; a captured/prevented actual Tab must fail the same oracle
before the normal case runs. The review thread is resolved.

Feature head db6ba6241ccf3d7ec74bd2a1b677c19f387514d6 passed
[CI37744052638](https://github.com/karahaNx/Lumenfall/actions/runs/37744052638):
169 defaults,17 required negative gates and guarded smoke. Full decoded job
log is preserved as ci-37744052638.log.gz. Earlier160-scenario CI is retained.

These receipts cover source480687e98116e68e139402455c70eb21300ef5731a7b72914546e77e8e379011,
after main31eccfb and before F25/F26. They do not accept the newer merged bytes.
Use [final delivery](../delivery/README.md) for integrated acceptance.

Local PASS:16 profiles/160 measurements,0px shift,96 theme/48 Comet/16 Trial
pairs,80 touch scrolls, Tap>=121px, contrast>=8.2966:1. Rift1,618/navigation255,
three mobile profiles including the prevented-Tab negative, source/tooling/context,
and23 guidance assertions on actual V8 6.0 pass. No product gate was weakened.
