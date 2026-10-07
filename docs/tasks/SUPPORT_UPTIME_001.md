# SUPPORT_UPTIME_001 — Tide/Aurora support-uptime

Status: **uafsluttet; numerisk brugerbeslutning og privat profile-patch til review**.
Ingen produktændring, remote skrivning, PR, integration, APK eller featureaccept.

## Ét mål og originalkrav

F18: gør permanent Tide/Aurora-boost sværere med konkrete early/mid/late-mål,
og verificér varighed, cyklus, stacking, faktiske cast/expiry-ticks og live/offline.
Originalens ordlyd: “Angående passive boost fra tide og aurora, så skal det være
sværere at gøre deres boost til permanent.”

Autoritativ original: `../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt`.
Denne chats bestilling er bevaret i `../qa/support-uptime-001/USER_REQUEST.txt`,
og brugerens nye svar i `../qa/support-uptime-001/USER_DECISIONS.txt`.
Fortolkning/dependencies/savekrav: samme pakkes `TASK_FEEDBACK_REVISION_001.txt`,
F18/F19 samt A, C, D og E. Lead-beslutninger: pakkens
`../DECISIONS/FEEDBACK_REGISTERED_001.txt`. Formel-evidens: `EVIDENCE/FINDINGS.txt`.
`FEEDBACK/Source_Index.txt` er læst; de fire billeder vedrører andre F-punkter,
og beviser hverken F18-timing eller APK/save-identitet.

Brugerrettelser i denne ejerchat den 7. oktober 2026:

- “Nej, der skal altid være pauser, også med begge supports”. Dette er nu
  bindende for det nye design: også mindst-én-buff-uptime skal være under 100 %
  ved optimal faseforskydning, to Ultimates og maksimal tilladt Swift-effekt.
- “Nej ikke noget endnu” om Lead/Swift-cap, minimumscyklus og stage-mål,
  før det konkrete numeriske forslag blev fremlagt.
- “Ja, fastlæg disse tal til Lead/Swift-review” om normal1s, Ultimate1.5s,
  cap10/mincycle10/3s og uptime ved charge0/5/10. Disse tal er nu fastlagt
  til koordinering og review; implementation/integration er ikke accepteret.

## Ejer, writer, model og baseline

Ejerchat: denne featurechat, `SUPPORT_UPTIME_001`; rolle 02 Gameplay / Progression.
Appens præcise chat-ID er ikke eksponeret i den anvendte opstartskontekst.
Anbefaling: GPT-6.1 Sol · Ekstra høj. Faktisk runtime-model/effort er ikke
eksponeret; anbefalingen attesterer ikke kørt model.

Privat checkout: `/workspace/Lumenfall-SUPPORT_UPTIME_001`.
Privat branch: `feature/support-uptime-001`, separat Git-repository; ingen
ændring af `/workspace/Lumenfall` eller en anden chats checkout.

Live main hentet 7. oktober 2026, observation senest kl. 15:23 København:

- Commit `b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
- Tree `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`.
- `index.html`: blob `ea44431c163569548973d9e489f75345749a07ee`,
  SHA256 `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`,
  488044 bytes. Produkt/tests/mobile/workflows matcher produktbaseline
  `1ddc246eb62782a61ec5c486cd5f51ea170bb338`.
- PR46 observeret open/Draft på R2
  `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`; ikke integreret.
- Ny B2: rapporteret tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`.
  Den arkiverede index er selv hashverificeret mod
  `7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`
  og blob `20fe6830640db792ddee7b9133115d1d720278cb`. Dette scoped opslag
  genskaber/accepterer ikke hele B2-tree. START_HER og identity er læst.

Fælles writer: **ikke tildelt denne chat**. PROJECT_STATE/Lead kræver nye
scoped B2-Core/QA-reviews og konkret writer-handover før produkt-/PR46-skrivning.
02_08s lokale stop er dokumenteret; 02_07s senere release er fortsat ukendt.
Brugerens stående godkendelse gælder scope, men er ikke en samtidig writerlease.
Ingen beskedværktøjer, subagenter eller chatomdøbning er anvendt.

Stop: lokalt forslag og evidens fryses til brugerens overførsel til Lead.
Remote checkpoint kræver Lead-koordineret docs-writer, frisk main/branches/
åbne PR'er/aktive runs-preflight og dokumenteret scope/stop. Ingen generel
brugergodkendelse genindhentes. Denne ejerchat arkiveres først ved fuld accept.

## Observeret adfærd

Swift Recovery er Forge `research.charge`, ikke Tree `nodes.swift` (Prism-effekt).
Cyklus er `6 / (1 + 0.08 * chargeLevel)` uden nuværende cap.
Normal support: +25 % i 4s. Ultimate: +50 % i 8s. Hver kilde lægges additivt
til passiv Wisp-damage og Guardian Tap; samme kilde stacker ikke med sig selv.
Offensive abilities og reward-formler får ikke support-multiplieren.
Support-Modules/Motes og Dawnpriest reward-Bond er særskilte bidrag.

| Charge | Faktisk cyklus | Normal sustained uptime | Ultimate sustained uptime |
| --- | ---: | ---: | ---: |
| 0 | 6s | 66.67 % | 100 % |
| 3 | 4.838710s | 82.67 % | 100 % |
| 6 | 4.054054s | 98.67 % | 100 % |
| 7 | 3.846154s | 100 % | 100 % |
| 10 | 3.333333s | 100 % | 100 % |
| 25 | 2s | 100 % | 100 % |
| 100 | 0.666667s | 100 % | 100 % |

Tom charge ved start giver første cast efter én cyklus. Ved charge 0 gennem
72s er normal Tide aktiv 44s (61.11 % inkl. startup), Ultimate Tide 66s
(91.67 % inkl. startup). Sustained forecast er henholdsvis 66.67/100 %;
startup må ikke forveksles med permanent pauseret adfærd.

Med normal Tide/Aurora ved charge 0, resources 0/50, caster Aurora ved 3s,
Tide ved 6s og derefter forskudt. Motoren måler mindst én aktiv buff i 57 af
60s: fra første cast ved 3s er boostet allerede sammenhængende. Et design som
kun giver hver kilde en pause, opfylder derfor ikke brugerens nye krav.

Gældende tidsrækkefølge bevares: elapsed passive damage/death/Auto-Ascend,
expiry, Active-party abilities, Auto-Tap, Auto-Empower, Research-kø, Study
completion/start, boss retry/retreat. Gemte source-deadlines er actual earned
entitlements; legacy `buffUntil/buffMult` er en separat max-floor uden duplication.

## Konkret numerisk brugerbeslutning til Lead/Swift-review

Brugeren har valgt følgende kontrakt til Lead og `SWIFT_RECOVERY_CAP_001`:
**normal 1.0s, Ultimate 1.5s, charge-cap 10, minimumscyklus 10/3s**.
Bevar +25/+50 og additive kilder. Den konkrete numeriske beslutning er gemt
i USER_DECISIONS.txt; product-main følger stadig den gamle profil.
Swift-ejeren ejer cap/købsgates/overlevels. F18 må ikke indføre en skjult
uafhængig charge-cap eller ændre andre Wisps' abilities som et sidefix.

| Numerisk testanker | Charge | Cyklus | Normal/kilde | Ultimate/kilde | To Ultimates, højst mindst én aktiv |
| --- | ---: | ---: | ---: | ---: | ---: |
| Early | 0 | 6s | 16.67 % | 25 % | 50 % |
| Mid | 5 | 4.285714s | 23.33 % | 35 % | 70 % |
| Late | 10 | 3.333333s | 30 % | 45 % | 90 % |

Charge-ankrene er valgt til uptime-mål; Rift-/budget-/ownership-definition
til faktiske progression-fixtures og eventuelle acceptvinduer koordineres med Lead.
Ultimate-kolonnen er en separat ownership-fixture, ikke et løfte om tidlig
Ultimate-adgang. To sene Ultimates giver mindst 10 % samlet pause pr. cyklus
(1/3s ved optimalt forskudte casts), og gennemsnitlig support-factor 1.45.
Synkroniserede Ultimates har 55 % pause; timing ændrer overlap, ikke additive
gennemsnitsbidrag. Mixed ownership skal også måles.

Generelt, med samme cyklus C og varigheder dT/dA, er højeste union-uptime
`min(1,(dT+dA)/C)`. Brugerens krav kræver `dT+dA < Cmin` med en positiv,
besluttet margin. Ved identiske Ultimates kræves `2*dUltimate < Cmin`.
Hvis Swift-ejeren vælger en anden mincycle, skal varigheder og alle stage-tal
genberegnes og besluttet margin opfyldes. Et cap alene kan ikke løse 8s/6s.

Det tidligere sammenligningseksempel 2s/3s med cap 10 ville give per-source
33.33→46.67→60 % og 50→70→90 %, men to Ultimates kan dække 100 %.
Det er **udelukket af brugerens rettelse**, ikke en valgmulighed.
Beregningsrækker ligger i `../qa/support-uptime-001/design-options.json` og
er formelberegninger, ikke motoraccept af en integreret kandidat.

`PROFILE_ONLY.patch` ændrer kun supportens varighed og de to tilhørende
beskrivelsestekster. `build-proposal.cjs` genskaber den i en særskilt tempfil;
`git apply --check` består. Root-index er uændret. `proposal-contract.json`
og `proposal-results.json` dokumenterer modelprøven med eksplicit cap10 som
Swift-katalogstub; ingen Swift-produktrettelse eller save-migration er indført.
Det er et profileforslag: eksisterende 4s/8s new-cast-oracles skal opdateres
til den valgte kontrakt i en fuld kandidat, mens allerede earned legacy 4s/8s
fixtures bevares. Baselinesuitens PASS er ikke den private patchs suiteaccept.

## Scope og save-/værdi-afhængigheder

Til en senere tildelt kandidat: central support-profile, tilhørende faktisk
beskrivelsestekst, average-forecast og relevante motor-/persistencechecks.
Ingen ændring af reward-regler, priser, Titan/F17, global pacing/F28,
Formation Bonds/F15, B2-arithmetic, offline-cap/F26, signing eller workflows.

Foreslået overgang til Core-review, endnu ikke accepteret:

- Bevar alle købte `wispUltimate`-flags, raw `research.charge`, betalte Labs
  og andre ownership-data. Ingen normalisering som sletter gammel købsdata.
- Bevar allerede optjente `{until,mult}` og legacy floor uændret frem til
  deres eksisterende kronologiske expiry. Nye casts følger den accepterede
  profil. Ingen wall-clock-baseret omskrivning under load/render.
- Et engangs-grandfathered cast er ikke sustained-accept: mål efter udløb af
  gamle casts, med effektivt Swift-cap også for gamle overlevels.
- Det bevarer earned aktive entitlements, men er ikke alene en accepteret
  købsværdi-politik for den store Ultimate-varighedsændring. Lead skal konkret
  beslutte, om fremtidig effektændring uden Sigil-kompensation er acceptabel,
  eller fastlægge engangsoverførsel/refund. Swift-overlevelkompensation ejes
  af Swift-scope; den må ikke dubleres i F18.
- Hvis migration/refund vælges, kræves eksplicit version/ownership-ledger,
  idempotens på canonical/recovery/backup, og bevis for at samme gamle backup
  ikke giver en restore/refund-currency-loop. Ingen stiltiende reprissætning.

Dependencies: PR46/B2-accept og writer-handover; `SWIFT_RECOVERY_CAP_001`
(numerisk cap, positiv mincycle, direct/bulk/Max/queue/legacy-gates);
fælles fixture-/value-beslutninger; scoped Core/QA og senere APK/deviceaccept.
Der er ingen Swift-taskfil i den læste main. Brugerens håndoverpakke skal
derfor bringe denne kontrakt til Swift-ejeren; ingen besked er sendt.

## Acceptkriterier for en implementeret kandidat

1. Dokumenteret valgt dNormal/dUltimate, cap/mincycle, early/mid/late-fixtures,
   acceptable uptime-vinduer og mindste samlede pause. Brugerens strengere
   mindst-én-buff-krav består ved synkron/forskudt/mixed ownership/max charge.
2. Faktiske cast-/expiry-events og uafhængig intervalintegral stemmer med
   forecast, inkl. 0/50/100 initial resource, før/på/efter grænser, store epochs,
   fractional phase, 100ms live ticks, whole/split offline og samtidigt Auto-Tap.
   Ingen generisk epsilon må spise materiel tid/damage eller skabe instant casts.
3. Additive +25/+50-kilder, ingen selvstacking; korrekt scope på passive/Tap;
   ingen reward-/burst-/Motes-regression. Reserve og pending zero-level caster
   ikke; Formation-skift bevarer earned casts, Ascend og Reset nulstiller dem.
4. Live/offline, manual trigger/Resonate, køkøb ved samme tick og gennem
   Swift-cap ændring bruger samme model. Charge single/bulk/Max/queue-gates
   verificeres sammen med Swift-ejerens kandidat, også zero-cost/no-effect cases.
5. Canonical, reload, cold/visibility resume, recovery, backup/restore og gentagen
   gammel restore opfylder valgt værdi-/migrationspolitik. Ingen dubbele offline
   rewards, gentagne refunds, save-loss eller flyttet paid snapshot.
6. Tekst viser rigtig styrke/varighed/cyklus. Relevant 320/390/430px, stor tekst,
   44px kontroller, native fokus, kontrast og reduced motion; WebView 60 og
   fysisk Android/TalkBack, hvor det kræves. Ingen fysisk accept udledes af Node.
7. Featuren er integreret på main efter scoped accept. Relevante checks genkøres
   mod integrationens relevante bytes; APK/package `com.lumenfall.app`, signing
   og nødvendige devicechecks er verificeret. Gem PROJECT_STATE/task/evidens,
   frigiv tildelt writer og arkivér derefter kun denne ejerchat.

## Testbeviser og åbne begrænsninger

`../qa/support-uptime-001/probe.cjs` observerer den uændrede fulde motor med
DOM-init suspenderet. 49 kombinationer × live/offline, faktisk 12 casts/kilde,
startup/sustained, deadlines, 100ms splits og forskudt normal pair:
2121 assertions består på heltals-epoch. 98 yderligere fractional-start-cases
har **6 FAIL** på både main og den nye B2-index. Samlet probe exit **1**;
der påstås ikke samlet PASS. JSON indeholder præcise fejl, events og sourcehashes.

Repro-minimum: én Mythic Ultimate Tide (eller Aurora), charge 0, ingen andre
aktive Wisps/automation, Rift121, start `2000000000000.375`, 72s, live/offline.
Motoren når elapsed=72, remaining=0, forsøger en rest på
`5.329070518200751e-15s` og kaster
`Authoritative simulation stalled without elapsed-time or state progress`.
Det findes også med begge Ultimates. Dette er et konkret eksisterende
chronology-/slutgrænsefund; ingen bred schedulerrettelse er foldet ind i F18.
Alle seks fejl er gentaget med samtlige observer-wrappers deaktiveret; fejlen
skyldes ikke eventlog-instrumenteringen. Controls er bevaret i begge JSON-filer.
Det skal vurderes som nødvendig dependency eller særskilt afgrænset fix,
før relevante timingkriterier kan accepteres.

`probe-results.json` og `b2-probe-results.json` er egne reproduktioner.
`b2-support-delta.json` viser scoped tekstsammenligning; ikke uafhængigt B2-review.
Normale numeric probes bruger 1e-6; 100ms HP-subtraction på stor HP bruger
1e-4 absolut, mens uptime-deadlinechecks bevarer 1e-6/0.001ms opløsning.
Dette er diagnostik, ikke valgt produkt-/balance-accepttolerance.

Den private profile-patch har SHA256
`51ca81b243b840abebe03631cb07c6e869a3d71502be089c5d991e78a19e06bb`
og index-blob `95c4dd4a4ddc52cf33c612144cbbe393035cdb79` (488048 bytes).
Proposal-proben: 49 kombinationer/2121 numeric assertions består. 48 af 50
fasecases består; alle 10 sene fasecases viser pauser, højeste union90 % ved
50 % resource-forskydning (27 aktive/3 inaktive sekunder over 9 cyklusser).
**8 fractional-start FAIL og 2 fase-FAIL** bevares, samlet exit1.
Fase-minima: charge0, Tide-resource100, Aurora10 eller30, begge Ultimates,
Rift121, start2000000000000, første6s; samme stalled slutgrænsefejl også uden
observer-wrappers. F18 er ikke timingaccepteret. Swift-stubben tester cyklus,
men er ikke cap-handler-/queue-/migrationsaccept fra Swift-ejeren.

Eksisterende context check: PASS, 21 entrypoints og 24 lokale Markdown-links
før nye filer. Browsercheckstatus og rå logs: `check-results.json` og
`check-results-chromium151.json`. Den første Chromium151-run har 13 timeouts
uden completed QA-resultat; eksisterende native CDP Rift-stacking mobile og
reduced-motion består ved 360/390px. Det er ikke 320/430 eller fysisk Android.
De 13 checks er derefter genkørt med Google Chrome155 og består alle: stacking,
buff-timing, syv support-persistenceruter, buff reload, Forge contracts/chronology
og simultaneous chronology. Chrome155 var udpakket lokalt fra Googles officielle
DEB; eksisterende harness og assertions er uændrede. 15 relevante eksisterende
scenarier består samlet på baseline (13 på Chrome155, 2 native CDP på Chromium151).
Første timeouts og rå fejl er bevaret særskilt; de omskrives ikke til PASS.
Den private profile-patch har ingen integreret UI-, cap-, migration- eller
Androidaccept. 320/430px og stor tekst ud over de eksisterende scopes afventer
den konkrete fulde kandidat.

## Næste handling og checkpoint

1. Lead/Swift-ejer registrerer brugerens nu valgte mincycle/cap/varigheder,
   numeriske stages og gap; koordinerer fulde fixtures og kommende writer-scope.
2. Lead/Core beslutter købsværdi-/legacy-politik og placering af det konkrete
   slutgrænsefund. Registrér originals og beslutninger ved writer-checkpoint.
3. Efter PR46/B2-review og faktisk handover: tildel scoped writer, kontrollér
   ny baseline, implementér denne feature, frys exact kandidat og udsted
   nødvendige reviews via brugerens opgavefiler.
4. Integrér/verificér/release først efter relevant accept. Gem denne task og
   egne evidensfiler i GitHub ved det koordinerede checkpoint. Ingen nye
   kritiske oplysninger må være alene i cloudmiljø/chat ved afslutning.

Writer-frigivelse: ingen fælles writer er erhvervet, så denne chat frigiver
ingen anden writer. Lokal freeze og pakke dokumenteres ved aflevering.
Arkivstatus: åben; nødvendig accept og GitHub-checkpoint mangler.
