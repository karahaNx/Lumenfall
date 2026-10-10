# LAB_EXPANSION_001 — sequential improvement 02

User: expand Research Lab to at least20 meaningful purchasable tracks; preserve
paid value, work, saves and Auto-Ascend; one improvement at a time, ONE final APK.
Baseline: development b46d148f, main67373faa unchanged. Branch feature/lab-expansion-001.
Target only PR102 development; no main push, APK build or publication.

[Design/catalog and acceptance](../qa/lab-expansion-001/DESIGN.md).
14 new timed Lumen/Shard projects plus6 existing active projects; Motes accelerate.
Existing paid legacy levels/work stay, without permanent shop cards or new refunds.
New queues/speed choices default OFF; old Deeds and Inquiry targets stay fixed.
No Forge/Tree/Comet catalog, save-schema, package, signing or offline-cap changes.

10 October review: baseline CI passed, then found a no-op Ascend test and
owned-Luminous purchase-boundary errors. [Corrections/reproducers and receipts](../qa/lab-expansion-001/DEBUG_2026-10-10.md).
Head bda35664 passed full CI38039208483 (182 scenarios/22 negatives) and
Lab CI38039208491. PR104 merged only into development at5bcd1c86; actual tree
49fcd913 equals the validated combined tree. Post-merge core/boundary/Prism/
V8/source/context PASS. Final CI and raw log are in the linked QA directory.
Next: separate FORGE_EXPANSION_001. Physical Android/WebView60/TalkBack and
final APK acceptance remain open; this is a development integration receipt.
