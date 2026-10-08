# FORMATION_AUTOSAVE_001 — local evidence

Historical local candidate. The 8 October continuation rebases onto newer main
and performs fresh integration/delivery checks; see
[current evidence](../formation-autosave-2026-10-08/README.md) and the task.

Private candidate on `feature/formation-autosave-001`, rebased onto main
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`. No Formation integration or APK/device acceptance.
Final product SHA256: `2eda7ffd83e95d2a114403706f488d8c58723726d81314c873fb1393e793bc1b`.

Final clean run: **PASS**, 14:09:20–14:21:58 UTC, Node 24.19.0.
All 138 default scenarios / 158 expanded results pass, plus all 12 required
negative controls, context/tooling/source/APK-verifier-self-test and guarded
runtime smoke. `results.json` records commands, exits, durations and source hash.
`SOURCE_MANIFEST.json` identifies the checked product/test/runner bytes.
`behavioral-suite.log` preserves the existing suite plus six F14 scenarios.
Native results record actual browser identity, 320/390/430px, normal/200%
relevant text, normal/reduced motion, touch/keyboard, render purity, focus and
contrast. `screenshots/` contains the twelve F14 profiles.
The twelve required `self-test-*.log` show the intended failures; the harness
exits 1 while Chrome exits 0 with valid QA payloads, without timeout.
`negative-replay.json` independently replays those observations;
`negative-raw.zip` holds all complete original HTML/stderr/process files and its
own hash manifest. Its 37 entries pass CRC/size verification.
Three autosave mutations are caught inside the contract and native scenarios;
each contract invocation performs 133 checks. Both native JSON receipts contain
six passing profiles, for twelve total. The existing smoke verifier's separate
receipt is `runtime-smoke-existing.log`.

Code checkpoint: `0e6185e825424a0d212179c3dbb24c11dd49c0b7`.
The runner started at `977a11c` plus working-tree edits; recorded source hash
and SOURCE_MANIFEST match the subsequently committed code. No product/test
bytes changed during or after the clean run. Later commits add receipts/docs only.

`es2017.json` records the Acorn 8.15.0 grammar check, not an Android test.
`b2-compatibility.json` records exact archived B2 restoration and dry product
patch application; it does not accept/integrate B2.
`baseline.json` records live main/PR46 and local checkout identity.
`PROJECT_STATE_DELTA.txt` proposes this feature's status for Lead's checkpoint.

Run from the repository root:

```bash
node scripts/qa/check-formation-autosave.cjs --full --evidence /tmp/formation-checks
```

The JavaScript orchestrator uses current Node checks/harness. Workflows,
APK build/signing and remote state are unchanged. CLI gates use Google Chrome
155; native input uses Chromium 151. Temporary Chrome/npm files use `/tmp`,
without repurposing `$HOME` or adding project dependencies.

Earlier Chromium CLI attempts hung on an empty page. Earlier candidate runs
predate the main rebase or final touch-target fix and are historical only.
The first rebased offline core run rejected the intentionally retained Boss
selection against the old oracle. The scoped assertion update preserves all
other state/summary comparisons. Original failure and corrective rerun are
retained in `history/`, separately from the subsequent clean final acceptance.

No physical Android, WebView60 or TalkBack acceptance exists. See the task for
writer, GitHub checkpoint, integration, APK/device and archive requirements.
