# SAVE_BACKUP_UI_001 current integration evidence

This continuation implements F22 on current game main
`b0537cb46635555ba2c2e5f3f95bc8fc276aeda5`, under the user's 8 October instruction
to finish, push to GitHub and implement in the game. The parent evidence folder
is historical 7 October local preparation. Its recorded baseline/results remain
preserved; they do not attest to this continuation or a new APK.

The [task](../../../tasks/SAVE_BACKUP_UI_001.md) records requirements, scope,
decisions, acceptance and next action. Current source/UI/CI/integration/APK
receipts will be saved here. Browser screenshots and JSON use production UI
with native input; clock/interval and failure injection are explicitly test-only.

Replay focused checks from the repository root:

```bash
node scripts/codex/check_context.cjs --task docs/tasks/SAVE_BACKUP_UI_001.md
node scripts/ci/validate_source.cjs
node tests/tooling/run.cjs
node tests/behavioral/save-backup-ui.cjs --chrome /absolute/path/google-chrome --web-root . --evidence /tmp/save-backup-ui
node tests/behavioral/run.cjs --web-root mobile/www
```

The current feature-specific negative controls are
`self-test-save-backup-placement` and `self-test-save-backup-confirmation`.
Each must fail at its causal assertion. Chrome PASS and verifier self-test are
not proof of physical Android/WebView60/TalkBack or a signed APK identity.
