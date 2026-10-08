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
