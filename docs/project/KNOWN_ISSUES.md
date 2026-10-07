# Kendte åbne problemer

This is a findings register, not an instruction to change the product. Current
feature status is in `../PROJECT_STATE.md`; the user's task defines scope.

| ID | Evidens / begrænsning | Næste kontrol |
| --- | --- | --- |
| B2-RUNTIME | Ældre tree 4c07… er BLOCKED på BigInt/WebView60. Ny tree 758d… har worker-PASS, men mangler nye uafhængige reviews. | Verify persistence/runtime/regression contracts on the new bytes and required independent/device acceptance within the B2 task. |
| OFFLINE-EVENT-LIMIT | Rapport på main 1ddc…: Auto-Ascend ON, target22/Clear21 og 8 timers offline rammer SIM_EVENT_LIMIT ved iteration 250001 efter ca. 6t36m49s simuleret tid. OFF gennemfører i samme VM-fixture. | Fix integrated by [PR51](https://github.com/karahaNx/Lumenfall/pull/51) at 0bcce84. Check current build/release and required physical Android/WebView60 acceptance; earlier task text is a pre-merge checkpoint. See `../tasks/OFFLINE_CATCHUP_001.md` and current PROJECT_STATE. |
| OFFLINE-PROCESSING-TIME | Automated PR51 review reports that wall-clock time spent in cooperative catch-up may be lost when a later save advances lastSeen. [Reported finding](https://github.com/karahaNx/Lumenfall/pull/51#discussion_r4207393562); not reproduced by this docs task. | Reproduce on the current feature version and record disposition/regression evidence in the offline task. |
| OFFLINE-DAILY-RETRY | Automated PR51 review reports that daily-rollover overlay state may be lost after cancelled/failed catch-up and retry. [Reported finding](https://github.com/karahaNx/Lumenfall/pull/51#discussion_r4207393577); not reproduced by this docs task. | Reproduce the rollover/retry flow and record disposition/regression evidence in the offline task. |
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
