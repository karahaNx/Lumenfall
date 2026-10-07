# Kendte åbne problemer

Dette er et fundregister, ikke en ordre om produktændring. Aktuelt mandat og
writer findes i `../PROJECT_STATE.md`.

| ID | Evidens / begrænsning | Næste kontrol |
| --- | --- | --- |
| B2-RUNTIME | Ældre tree 4c07… er BLOCKED på BigInt/WebView60. Ny tree 758d… har worker-PASS, men mangler nye uafhængige reviews. | Scoped Core/QA på nye bytes; faktisk Android-runtime efter eget mandat. |
| OFFLINE-EVENT-LIMIT | Rapport på main 1ddc…: Auto-Ascend ON, target22/Clear21 og 8 timers offline rammer SIM_EVENT_LIMIT ved iteration 250001 efter ca. 6t36m49s simuleret tid. OFF gennemfører i samme VM-fixture. | Match APK-version; reproducér cold launch og resume/persistence. Design bounded catch-up med chronology/parity og checkpoint, ikke blot et større eventbudget. |
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
