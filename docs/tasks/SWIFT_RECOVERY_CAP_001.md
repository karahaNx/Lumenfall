# SWIFT_RECOVERY_CAP_001 — Swift Recovery cap

Status: **lokal forberedelse; uafsluttet og afventer design/dependencies**.
Ejer: denne Codex-featurechat, Gameplay / Progression (02), ét mål: F19.
Dato: 7. oktober 2026, Europe/Copenhagen.
Model oplyst i sessionen: GPT-6/Codex; konkret effort kan ikke attesteres.
GPT-6.1 Sol / Ekstra høj er brugerens opstartsanbefaling, ikke et kørselsbevis.

## Originalkrav og kildeprioritet

Brugerens featurebestilling er bevaret i
[SWIFT_RECOVERY_CAP_001_REQUEST.txt](SWIFT_RECOVERY_CAP_001_REQUEST.txt).
Originalens F19-ønske:

> Jeg tænker swift recovery Skal have et cap, ellers kan vi nå et punkt, hvor abilities bliver instant.

Autoritativ original:
[USER_REQUIREMENTS_2026-10-07.txt](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
Fortolkning og accept: F19, F18 samt A/E i
[TASK_FEEDBACK_REVISION_001.txt](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
Konkrete Lead-beslutninger:
[FEEDBACK_REGISTERED_001.txt](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt).
Originalen har forrang. Balancetal i forslag er ikke accepterede produktregler.
[FINDINGS.txt](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt)
og [Source_Index.txt](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt)
er læst. De fire billeder angår andre F-punkter; ingen capværdi udledes fra dem.

## Baseline, isolation og writer

- Første live main/analysebaseline: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
  Tree: `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`.
- Ved opstart var produktkode uændret fra `1ddc246eb62782a61ec5c486cd5f51ea170bb338`.
  `index.html` blob: `ea44431c163569548973d9e489f75345749a07ee`;
  SHA256: `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
- Live main rykkede under arbejdet. Ny analysebaseline og branch-parent:
  `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
  `6e18e8485111a7a5bfa2d5854ed6b9c4735282c2` (observeret 15:28:59 CEST).
  PR51 er verificeret merged med dette commit. Index-blob er
  `90e4678cb28fa833fdacbc01d1744d9465f6a356`, SHA256
  `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
  Checkout er fast-forwardet privat, aktuelle regler er genlæst, og relevante
  checks er gentaget. Swift-data/timing er fortsat uncapped; dette proposal
  ændrer ingen produktbytes fra den nye baseline. Tidligere beviser holdes
  knyttet til den første baseline, aldrig overført som accept af nye bytes.
- Aktuelle AGENTS/CODEX_START kræver Node.js-værktøjer og engelsk kommunikation.
  De første checks brugte den daværende historiske Python-harness uændret;
  checks på ny baseline bruger `tests/behavioral/run.cjs` og Node-contextcheck.
  PROJECT_STATE beskriver fortsat PR51 som Draft; live merged-receipt har
  forrang. Denne chat retter ikke en anden features status uden writer-slot.
- Separat checkout: `/workspace/Lumenfall-swift-recovery`.
  Lokal featurebranch: `feature/swift-recovery-cap-001`.
  Det oprindelige `/workspace/Lumenfall` er ikke ændret af denne featurechat.
- Writer: kun privat lokal forberedelse efter brugerens bestilling.
  Ingen tildeling af fælles repo-writer, remote checkpoint, merge eller release.
  Én repo-writer ad gangen følger fortsat [AGENTS.md](../../AGENTS.md).
- Ved opstart: PR46 er open/Draft på R2
  `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, ikke integreret.
  Ny B2-kandidat er rapporteret på tree
  `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; nye scoped Core-/QA-reviews
  mangler i aktuelle kilder, og 02_07s writer-handover er ukendt.
  Kilder: [PROJECT_STATE.md](../PROJECT_STATE.md),
  [B2 START](../handoffs/02_08/2026-10-07/START_HER.txt) og
  [identity.json](../handoffs/02_08/2026-10-07/SUMMARY/identity.json).
- Den kendte APK er 0.1.133, package `com.lumenfall.app`; der er ingen ny APK.

## Scope og manglende beslutninger

Målet er et reelt købscap og en positiv minimumscycle for Swift Recovery,
med samme effektive loft i UI, direct handler, single/bulk/Max, Forge queue,
gennemsnitsberegninger og den kronologiske live/offline-motor. Gamle
overlevels skal miste den overskydende hastighed gennem en dokumenteret
overgang, samtidig med at ejerskab og købsværdi håndteres eksplicit.

SUPPORT_UPTIME_001 ejer den fælles duration/cycle-kontrakt før balancekodning.
På den hentede main findes intet `docs/tasks/SUPPORT_UPTIME_001.md` og ingen
verificeret ny kontrakt. Historisk support-stacking er ikke denne nye accept.
Der er ingen besluttede Swift-cap-tal i de læste Lead-kilder.

Følgende konkrete felter skal afgøres af Lead/support-ejeren:

| Beslutning | Krævet indhold | Aktuel status |
| --- | --- | --- |
| Timingkontrakt | Basecycle B, normal/Ultimate-duration, uptime-mål og cast/expiry-orden | Ny kontrakt mangler |
| Købscap C | Endeligt ikke-negativt heltal; sidste køb skal ændre faktisk effekt | Ikke besluttet |
| Minimumscycle T | Endeligt positivt sekundtal og dets sammenhæng med C/B/+8% | Ikke besluttet |
| Gamle overlevels | Refund/overført entitlement, valuta, historisk prispolitik, præcisionsgrænser | Ikke besluttet; lokal analyse nedenfor |
| Checkpoint | Lead tildeler dette afgrænsede remote writer-slot efter preflight | Ikke tildelt |

Ingen nye gameplaytal eller migrationsregler er anvendt som bindende regler.
F18-durationændringer, andre caps, nye Bonds, global balance og PR46-korrektion
tilhører deres ejerchats. Denne chat ændrer ikke deres produktmål.

## Lokal teknisk kandidat

Produktkode er ikke ændret før dependency-/designgaten. Det konkrete forslag,
prisbeviser og tests, som skal ændres, står i
[DESIGN.md](../qa/swift-recovery-cap-001/DESIGN.md).

Den fælles cap skal bo i autoritativ Swift-data/model og bruges af
`getResearchBuyPlan`, `researchEffectiveLevel`, preview og motor. Et gulv kun
i `abilityCycleSeconds()` er utilstrækkeligt: motoren læser `fillRateMult()`
direkte. Faktisk resource rate, UI-cycle, average support/DPS og casts skal
derfor afledes fra én timingmodel. Normalisering må ikke truncere raw ownership.

Observeret baseline: cycle ved level 0/7/100/1000 er henholdsvis
6 / 3.846153846 / 0.666666667 / 0.074074074 sekunder. Baseline-Ultimate har
8s duration og dermed 100% sustained uptime allerede ved level 0.
Det er baselinebeviser, ikke forslag til slutbalance.

## Acceptkriterier

1. Godkendt C/T og SUPPORT_UPTIME_001-kontrakt er gemt med præcis kilde/version.
   Ingen købbar level giver nul marginal timingeffekt.
2. UI, direkte single/bulk/Max og queue stopper ved samme C, inklusive C−1,
   C og gamle raw levels over C. Afviste køb muterer ingen valuta, level eller
   daily counter; delvise køb betaler kun den faktisk købte mængde.
3. Alle Swift-timingforbrugere respekterer T. Preview, faktisk ressourcefyld,
   eventtid, sustained damage/resources og support-uptime er konsistente.
   Klar resource ved 100% må stadig caste ved nuværende timestamp; minimum
   gælder genopladning fra 0, ikke en ekstra ventetid på et allerede klart cast.
4. Manuel/queue-opgradering i et replay ændrer kun fremtidig opladning.
   Før/ved/efter purchase, cast og expiry samt hele/delte vinduer testes live
   og offline uden ny eventorden, gratis casts eller valuta-debit.
5. Raw overlevels, Deed-progress, opnåede Deeds, queue-intent og permanente
   køb bevares. Effekt over C er ikke aktiv. Godkendt værdipolitik er testet
   idempotent på canonical, recovery og backup, inkl. gentagen gammel restore,
   storagefejl og Ascend. Ingen refund-loop eller tavs reprissætning af Labs.
6. Swift-kortet viser faktisk effektiv level, cap, cycle og overlevel-status
   uden at love aktiv effekt fra arkiverede køb. Test 320/390/430px, stor tekst,
   mindst 44px kontroller, fokus efter sidste køb, kontrast og reduced-motion.
7. WebView 60, package, signing, deterministiske køb og dokumenterede
   Luminous Motes-belønninger bevares. Relevante eksisterende gates består
   på frozen kandidat og integreret version; review fornyes ved relevante bytes.
8. Feature er først færdig efter koordineret integration, checks på main,
   nødvendig APK/deviceaccept, gemt status/beviser og scoped writer-frigivelse
   efter [FEATURE_WORKFLOW.md](../project/FEATURE_WORKFLOW.md). Først derefter
   arkiveres denne ejerchat. En lokal patch eller åben PR er ikke afslutning.

## Checks og evidens

[QA-indeks](../qa/swift-recovery-cap-001/README.md) indeholder commands,
versionsidentitet, rå stdout/stderr og begrænsninger. Nye probes og orchestration
er JavaScript. Ny baseline bruger det eksisterende Node.js-harness uændret.
Python-resultater i pakken gælder kun det oprindelige, frosne snapshot.

Context: PASS på begge baselines, 21 entrypoints og 24 lokale links.
Den målrettede baselineprobe består og viser køb uden cap, faktisk motor-rate
og forskellige historiske bulkafrundinger. Dette er udvalgte produktfunktioner
med state/UI/save-stubs; det er ikke fuldmotor- eller featureaccept.

På `0bcce84…`: standard `forge-ui-mobile` og `forge-ui-reduced-motion` PASS.
Standard `forge-contracts` er FAIL/timeout uden afsluttet QA-resultat; dette
bevis bevares. Supplerende CDP-transport kører samme uændrede Node-harness og
assertions: 9/9 målrettede gameplay/save-scenarier PASS, samt 3/3 forventede
negative assertion/parity/chronology-kontroller fanget. Source/harness er
byteidentiske før/efter. CDP er et analysebevis, ikke en påstået grøn standard-
workflowgate, WebView60/deviceaccept eller accept af den endnu ukodede cap.

Lokal regel-/link-/scopekontrol og patch/handoff følger QA-indekset. Ingen
ny bindende gameplayregel eller generel permission er nødvendig for forslaget.

## Næste handling, checkpoint og afslutning

1. Overfør lokal TXT/ZIP til Lead og support-ejeren via brugeren; ingen
   beskedværktøjer/subagenter er brugt. Afklar de konkrete felter ovenfor.
2. Lead afklarer PR46/B2-accept og faktisk handover og tildeler writer-checkpoint.
   Før remote skrivning læses live main, branch/PR/run-status og writer igen.
3. Gem dette taskdokument, originalbestilling og nødvendige beviser i GitHub
   på det koordinerede checkpoint. Det er endnu kun lokalt gemt.
4. Implementér valgt timing-/valuekontrakt på den da verificerede baseline,
   opdatér målrettede tests og få scoped Core-/QA-review. Integrér og udfør
   acceptkriterie 8. Opdatér PROJECT_STATE i det tildelte writer-slot.

Ingen remote writes, PR, integrationscommit, ny APK eller release i denne
lokale forberedelse. Fælles writer er ikke overtaget; ingen anden writer
frigives af denne chat. Chatten forbliver åben, fordi nødvendig accept mangler.
