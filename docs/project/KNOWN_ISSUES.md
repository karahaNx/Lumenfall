# Kendte åbne problemer

This is a findings register, not an instruction to change the product. Current
feature status is in `../PROJECT_STATE.md`; the user's task defines scope.

| ID | Evidens / begrænsning | Næste kontrol |
| --- | --- | --- |
| B2-RUNTIME | Ældre tree 4c07… er BLOCKED på BigInt/WebView60. Ny tree 758d… har worker-PASS, men mangler nye uafhængige reviews. | Verify persistence/runtime/regression contracts on the new bytes and required independent/device acceptance within the B2 task. |
| OFFLINE-EVENT-LIMIT | Rapport på main 1ddc…: Auto-Ascend ON, target22/Clear21 og 8 timers offline rammer SIM_EVENT_LIMIT ved iteration 250001 efter ca. 6t36m49s simuleret tid. OFF gennemfører i samme VM-fixture. | Fix integrated by [PR51](https://github.com/karahaNx/Lumenfall/pull/51) at 0bcce84. Check current build/release and required physical Android/WebView60 acceptance; earlier task text is a pre-merge checkpoint. See `../tasks/OFFLINE_CATCHUP_001.md` and current PROJECT_STATE. |
| OFFLINE-PROCESSING-TIME | PR51 finding reproduced on unchanged released bytes: processing time is lost. PR54 revision bc33707 replays monotonic foreground time with existing live policy; 8h/72h parity and ±7-day wall-clock corrections pass. | Follow exact-head CI/integration and corrected APK/native acceptance in `../tasks/OFFLINE_CATCHUP_001.md`; raw before/after evidence: `../qa/offline-catchup-001/legacy-webview/README.md`. |
| OFFLINE-DAILY-RETRY | PR51 failure/retry finding reproduced. PR54 review also reproduced pending-prompt overwrite at another midnight. Revision bc33707 queues prompts; real UI shows both in order, each award/presentation once. | Verify exact-head CI and corrected release acceptance; same focused evidence/task. |
| OFFLINE-LEGACY-POSITION | Actual135 native8h transaction completes, but Continue is off-screen on WebView61 because CSS inset is unsupported. PR55 uses equivalent top/right/bottom/left for overlay/intro; released-source regression fails without timeout, corrected geometry/input passes. | Exact-head CI/integration/signed native acceptance pending; evidence: `../qa/offline-catchup-001/legacy-layout/README.md`. |
| OFFLINE-LEGACY-DOM | Actual signed APK0.1.134 advanced-save startup fails on Android8.1/WebView61: select.replaceChildren is unavailable. PR54 uses supported removeChild/appendChild while preserving select/focus; missing-API startup/return regression passes. | Corrected bundled APK/native checks and required physical WebView60/TalkBack acceptance remain open until recorded. |
| MOBILE-CLIPPING | Historisk intermittent gate04-fejl bevaret. Ny workersuite rapporterer PASS; årsag er stadig ukendt. | Relevant QA-vurdering; gamle PASS/FAIL er ikke fysisk Androidaccept. |
| FEEDBACK-29 | 29 originale krav og fire billeder er registreret, ikke samlet implementeret. | Følg feedbackprioriteringer og dependencies. |

Fuld offline-diagnose: [SAVE_OFFLINE_AUTOASCEND_DIAGNOSE_2026-10-07.txt](SAVE_OFFLINE_AUTOASCEND_DIAGNOSE_2026-10-07.txt).
Kilden rapporterer ni fokuserede Node24 VM-kørsler og samme exception via
applyOfflineProgress. Rapporten er importeret uændret; denne docs-opgave har
ikke genkørt reproduktionen. Den fulde ZIP, original save, rå JSON og driver
er bevaret via PR47 i `../qa/offline-autoascend-2026-10-07/`; læs
`Source_Index.txt` og `README_REPRO.txt`. Ti SHA256-kontroller og ZIP CRC er
verificeret. Brug index.html fra baseline 1ddc… med den oplyste blob-identitet.
Rapporten alene beviser ikke Androidsymptomer.

Prism-eksemplet i den konkrete save forklares af repeat-regel og afrunding:
bonusser anvendes, men Clear20 giver 5 repeat-Prisms. Tooltip/balancering er
et særskilt designspørgsmål, ikke en bevist manglende bonus.
