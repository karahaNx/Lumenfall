# Tree delivery evidence — 8 October 2026

Combined private source follows PR90/main31eccfb's 24-row identity contract.
Source/check/log hashes are in identity.json. Focused runs use Chrome155.0.8059.39.

- Tree contract:145 real handler/UI/save/backup assertions PASS, including caps6/20,
  closed IDs, exact prices, forged inputs and unrepresentable payment rejection.
- Normal/reduced Tree UI:320/390/430px, actual200% text,44px controls, focus preservation,
  disabled caps and conservative gradient-aware text contrast>=5.504 PASS.
- Existing shared identity contracts, chronology, real reload/recovery/backup PASS.
- Source, tooling, APK identity self-test and actual task-context PASS.

merge-missing-motion-flag.txt is a failed merge-resolution probe. The test caught
an omitted browser motion-preference flag; restored registration passes without
changing production or weakening the preference assertion. Earlier context overflow
was corrected by compacting this task, preserving historical evidence.

Full candidate/integrated CI, signed release and native/device acceptance remain pending.
Self-review and automated checks only. Old evidence/CI belongs to its recorded source.

Automated review fixes: the payment must subtract exactly its displayed cost, including
partially rounded large-wallet debits. review-fix/contract.txt passes151 assertions;
restoring the old guard produces the intended completed in-page failure in the causal
negative. Historical inventory instructions now use explicit0bcce84 source and were run.
Preceding logs/hashes above remain versioned; review-fix/identity.json identifies the new source.

combined-14d5 incorporates the now-integrated F25/F26/Rift-guidance dependency.
The Tree shared plan respects both retirement flags.154 focused assertions PASS,
including Reserves history/original6+10+16 refund/idempotence/no future payment.
Fresh F26, matrix chronology/persistence, normal/reduced320/390/430px UI, source,
context/tooling and V8 Tree/F26 probes PASS. identity.json versions these exact bytes.
Earlier checks belong to their earlier sources; final combined CI/delivery still pending.
