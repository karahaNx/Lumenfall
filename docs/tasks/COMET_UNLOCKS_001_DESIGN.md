# COMET_UNLOCKS_001 — egne Comet-unlocks i Deeds

Status: **brugervalgt designretning; lokalt forslag; produktfeature uafsluttet**.
Brugeren valgte Comet Trials plus Rift cosmetics i denne chat. De detaljerede
vilkår, kandidatpriser, refund og refresh-gate nedenfor er endnu forslag,
ikke accepteret eller implementeret produktadfærd.

## Ét mål og mandat

Erstat Comet-købene Loadout Memory, Extended Rest og Deep Rest med et lille
Deeds-katalog med egne funktionelle valg og supplerende kosmetik. Køb kun
for Comets, med synlig fast pris, effekt og cap. Bevar tidligere købsværdi.

Ejerchat: denne brugerbestilte featurechat, **COMET_UNLOCKS_001**; rolle 02
Gameplay / Progression. Platformens chat-ID er ikke tilgængeligt i den
læste kontekst; intet historisk 02_08/02_09-ejerskab overtages.
Anbefaling fra bestillingen: GPT-6.1 Sol / Ekstra høj. Kørende modelvariant og
effort er ikke verificeret og attesteres derfor ikke som denne anbefaling.

Writer: kun privat lokal forberedelse. Fælles repo-writer/remote-checkpoint
er ikke tildelt denne chat. Ingen beskedværktøjer, subagenter, PR-oprettelse,
merge, build, dispatch/rerun, release eller ændring af andre chats.

## Originalkrav og læste beslutninger

Den aktuelle featurebestilling er bevaret i
[COMET_UNLOCKS_001_REQUEST.txt](COMET_UNLOCKS_001_REQUEST.txt), sammen med
den tydeligt adskilte senere designafklaring. Brugerens svar:

> Comet Trials plus Rift cosmetics (recommended)

Det fastlægger retningen: valgfrie run-udfordringer med faste kosmetiske
gennemførelsesmærker og ingen currency/power-bonus. Det er ikke en beslutning
om de tre priser, gammel-save-refund eller den nye refresh-adgang.

Original: [USER_REQUIREMENTS_2026-10-07.txt](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt):

> Loadout memory fra deeds skal fjernes, det skal bare være indbygget i spillet.
> Det samme med deep rest. Lav cap til 12 timer og ikke mulighed for andet,
> du skal i deeds lave nogle nye unlocks der er fuldstændig eksklusivt for comet currency.

Læs originalen sammen med F24–F29 og save-afsnit E i
[TASK_FEEDBACK_REVISION_001.txt](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
Originalen har forrang; TASKs Rift Trail, Starfall Crest, Deed Contract og
Formation Spotlight er forslag. De er ikke vedtagne priser eller effekter.

[FEEDBACK_REGISTERED_001.txt](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt)
fastlægger PR46/B2-review og writer-handover først; F25 gør Forge-bulk-memory
til baseline; F26 fastlægger ét produktivt offlineinterval på højst 12h for
earnings, combat/rewards, Lab og automation. Nye Comet-effekter/priser og
save-overførsel er stadig åbne. Den nye feature giver ingen offlineforlængelse.

Evidens: [FINDINGS.txt](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt)
og [Source_Index.txt](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt).
De fire referencebilleder gælder Ascend, Lab og Wisp-layout; ingen viser et
foreslået F27-katalog. De bruges ikke som bevis for nye Comet-effekter.

## Baseline og observation

Live GitHub observeret 7. oktober 2026; præcise UTC-observationer gemmes i
[remote-snapshot.json](../qa/comet-unlocks-001/remote-snapshot.json).

| Kilde | Identitet | Status |
| --- | --- | --- |
| Live main ved opstart | `b2a1f440e8ad9fed34b37551e468224310d2a6f6`; tree `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60` | Observeret; docs-opdatering, samme produktkode som accepteret baseline |
| Ny live main / lokal kandidatbaseline | `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`; tree `6e18e8485111a7a5bfa2d5854ed6b9c4735282c2` | PR51 integreret under forberedelsen; privat branch opdateret bytepræcist |
| Produktbaseline | `1ddc246eb62782a61ec5c486cd5f51ea170bb338` | Registreret accepteret APK 0.1.133, `com.lumenfall.app` |
| Opstarts-index.html | SHA256 `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4` | Egen lokal kontrol; matcher recovery-evidens |
| Aktuel baseline-index.html | SHA256 `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607` | Egen lokal kontrol; Comet-audit genkørt efter PR51 |
| PR46 | Draft/open; head R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d` | Observeret; ingen ny produktaccept |
| Ny B2 | tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef` | Rapporteret frozen kandidat; nye Core-/QA-reviews mangler i aktuel status |
| Writer | 02_08s lokale stop dokumenteret; 02_07s senere handover ukendt | Intet nyt fælles skriveejerskab antaget |
| PR51 | Først Draft/open; derefter merged 7. oktober 2026 kl. 15:13:26 København på `0bcce84…` | Observeret integration; APK/deviceaccept ikke overført til F27 |

Privat checkout: `/workspace/lumenfall-comet-unlocks`, egen `.git` uden
hardlinks/alternates, branch `feature/comet-unlocks-001`, baseline ovenfor.
Miljøets oprindelige `/workspace/Lumenfall` står urørt på `67c3e99…`.
CLI Git-netadgang fejlede mod sessionproxy. Ændrede blobs, modes og
commitobjekter blev hentet read-only via GitHub-connectoren og gendannet
lokalt; blob-, commit- og tree-identiteter matcher live GitHub. Senere
integration af PR51 ændrede baseline og aktive checks til Node.js. Aktuel
AGENTS er genlæst; dens engelske kommunikationsregel følges fra dette delta.
Dette danske design bevarer brugerbestillingens sprog; handoff-TXT er engelsk.
PROJECT_STATE indeholder stadig pre-merge-tekst om PR51; observeret live
merge-status har forrang. Ingen historisk B2-writerrelease udledes af PR51.

Undersøgt: nuværende SHOP, Deeds, quest/login-indkomst, refresh-gate,
ownership-normalisering, Forge/Lab/Tree-effekter og relevante run-eventveje.
Ingen B2-bytes bruges som accepterede produktregler eller ændres her.

## Observeret Comet-budget

Nuværende faste køb: Auto-Ascend 100, Loadout Memory 50, Extended Rest 140,
Deep Rest 160 Comets. Fjernede Comet-køb har samlet katalogværdi **350**;
hele den nuværende butik koster **450**. Deeds giver samlet **683** Comets.
Refresh koster 25, mindst højeste questreward på 25; login belønner
5/8/12/16/20/25/40 Comets i den eksisterende syvdagescyklus.

[source-audit.json](../qa/comet-unlocks-001/source-audit.json) eksekverer
uændrede pris-/quest-/købs-/normaliseringsfunktioner i en isoleret VM.
365 syntetiske dage ved Rift 1/5/8/10/16/250 giver 17,96 Comets/dag ved
kontinuerlig login uden quests; 53,64–61,55 når alle tre udvalgte quests
antages fuldført. Det er reward-opgørelser under udtrykkelige antagelser,
ikke bevis for spillerens completion, realtid, early/mid/late-pacing eller
retfærdige priser. Deeds og refreshforbrug er udeladt af disse gennemsnit.

## Konkret kandidat til Lead-beslutning

Anbefaling: ét nyt frivilligt challenge-system plus to kosmetiske køb.
Comet-identiteten bliver selvvalgte run-udfordringer og Rift-udtryk.
De foreslåede køb ændrer ingen damage/reward-formel, Lab-slot, prisrabat, abilitycycle,
Luminous-forekomst eller Motes-belønning. Det funktionelle valg består i en
ny run-opgave med valgte vilkår, start/slut og vedvarende gennemførelse.

Kandidatpriserne **genbruger de tre eksisterende pristrin** og summerer til
350. De er et eksplicit budgetforslag med observeret kilde, ikke nye
gættede balancekonstanter eller godkendt tid til næste køb. Lead skal vælge
både denne indholdspakke og dens priser før produktkode.

| Unlock / foreslået ID | Effekt og valg | Cap | Kandidatpris | Konkret visning | Review |
| --- | --- | --- | --- | --- | --- |
| **Comet Trials** / `comettrials` | Permanent adgang til to valgfrie run-udfordringer: Quiet Guardian (ingen manuelle taps) og Single Star (højst én Active Wisp). Vælg udfordring og allerede nået cleared-Rift-mål; begynd ved næste Ascend. Første gennemførelse af hver type giver et fast, rent visuelt Trial-mærke; gentagelser giver ingen valuta eller power. | Ét køb; én pending eller aktiv Trial; ét førstegangs-mærke pr. type. Ingen ekstra questslots eller produktiv tid. | **140 Comets**, fra Extended Rest-pristrinnet | Deeds-kort med de fulde vilkår før køb; efter køb vælger man Trial/mål og ser Pending/Active/Failed/Completed. Rift viser lille stabilt statusmærke og fremskridt. | Gameplay: autoritative events, chronology/bulk/live/offline. Core: run/ownership-save. QA: ugyldige intents og gentagelser. Lead: funktionelt indhold og pris. |
| **Rift Trail** / `rifttrail` | Én valgbar Comet-bane langs Rift-kampområdets kant. Slå til/fra, kombiner med eksisterende aura. Reduced motion viser en statisk banestreg med samme identitet. | Ét køb; én valgt trail eller Off; ingen gameplayeffekt | **50 Comets**, fra Loadout Memory-pristrinnet | Deeds viser forhåndsvisning, Owned og separat Equip/Off; den valgte bane er synlig på Rift uden at dække HP, tapområde eller tekst. | F24-ejer: komposition, tydelig synlighed, mobil og reduced motion. Core/QA: unlocked versus selected. |
| **Starfall Crest** / `starfallcrest` | Én valgbar Guardian-/Ascend-emblemvariant. Ved Ascend bruges en stjernekrans; reduced motion bruger et statisk emblem. Kan vælges uafhængigt af aura og trail. | Ét køb; én valgt crest eller Off; ingen ekstra animationstid eller gameplayeffekt | **160 Comets**, fra Deep Rest-pristrinnet | Deeds har Guardian- og Ascend-preview; Rift har tydeligt emblem, og Ascend-kvitteringen bruger den valgte identitet. | F24-ejer: animation/kontrast/fokus. Gameplay/QA: styling kan aldrig forsinke eller gentage Ascend/payout. Lead: pris. |

Auto-Ascend Rituals eksisterende 100-Comet-køb bevares i dette forslag.
Placering og ON/OFF-design tilhører den særskilte Ascend-feature.
Almindelige formationer, bulk-memory, quests, gameplayforklaringer,
tilgængelighed og 12h-policy er tilgængelige uden disse nye køb.

### Comet Trials: præcis foreslået kontrakt

- Køb starter ingen Trial. Vælg type og mål; mål skal følge eksisterende
  manual-Ascend-eligibility og må ikke overstige højeste allerede cleared
  Rift. Ingen ny reward-, unlock- eller damagegrænse opfindes.
- Pending begynder først **efter** næste Ascends eksisterende payout/reset/
  formation-rebuild. Den Ascend giver aldrig credit til en Trial, som endnu
  ikke er begyndt. Mål og type er låst under aktivt forsøg; cancel afslutter
  forsøget og påvirker ikke almindelig progression. Ingen løbende Comet-pris.
- Quiet Guardian bliver Failed ved det første accepterede **manuelle**
  damage-tap. Auto-Tap er tilladt og står udtrykkeligt i vilkårene.
  `totalTaps` kan ikke anvendes som predicate: både manual og automation
  øger den på nuværende main. Brug den autoritative kilde til tap-eventet.
- Single Star kræver højst én Active Wisp under hele forsøget, også efter
  formation-rebuild og automation. Flere på Bench er tilladt; rekruttering/
  Empower ændres ikke. Første gyldige aktivering af flere Active Wisps gør
  forsøget Failed. Gamle presets og levels slettes eller omformes ikke.
- Ved næste manual/Auto-Ascend: vurder den eksisterende autoritative
  cleared-Rift og forsøgsstatus **før** reset. Valid + mål nået giver
  Completed og det ene type-mærke, ellers Failed. Almindelig Prism-payout
  fortsætter uændret. Ingen retroaktiv scanning af livstidsstatistik.
- Forsøget genstarter ikke automatisk; der er højst ét afsluttet resultat
  i den viste run-kvittering og én førstegangslatch pr. Trial-type.
  Ingen uncapped forsøgshistorik eller ny daglig kalender behøves.
- UI afspejler simulationens resultat og foretager ingen tilstandsændring
  ved render. Offline-batching må opsummere gyldighed ved eksisterende
  eventgrænser; ingen per-kill-loop eller udvidet eventbudget.
- Trials har ingen daglige tidsfrister og følger F26s produktive interval.
  Over 12h kan ingen Trial, Lab eller quest få ekstra replaycredit. En
  afbrudt/fejlet catch-up må ikke gemme en delvis Trial-payout/kvittering.

Alternativ til Lead: nye kontrakter med ekstra Comet-rewards. Det kræver
valgte mål, rewards og farming-model, som ikke er besluttet; det vælges
derfor ikke som lokal standard. Ét kosmetikkatalog alene opfylder ikke
denne kandidats funktionelle indhold.

## Eksklusivitet og fælles matrix

Alle nuværende Forge-, Lab- og Tree-upgrades er udtrukket med ID, currency,
effekt og deklareret cap i source-audit.json. Det er et observationstilskud
til F29-ejerens fælles matrix; deres fælles fil ændres ikke i denne chat.

| Område | Observeret effektfamilie | F27-afgrænsning |
| --- | --- | --- |
| Forge / Lumen-Shards | kill-income, passive/tap, charge, ability/resource factors, Luminous chance | Ingen Comet-kopi af disse faktorer |
| Lab / Lumen-Shards + tid; Motes til speed | passive/tap, offline-rate, rewards, future Study work reduction | Ingen Comet-speedup, slots, work-reduction eller Motesbonus |
| Tree / Prisms | kill-income, tap/passive, offline-rate/hours, recruit-rabat, Ascend-reward | Ingen Comet-timecap, rabat eller prestige-multiplier |
| Comets / Deeds, eksisterende | Auto-Ascend, gamle memory/hours, refresh | Memory/hours håndteres af F25/F26; refresh-gate kræver særskilt beslutning |
| Comets / dette forslag | optional Trial-state/vilkår; trail/crest-valg | Nye egne IDs og funktioner; kosmetik supplerer Trial-valget |

F29 skal bekræfte, at andre nye unlocks ikke også ejer Trial-systemet eller
de samme effekter. F28 må senere måle pacing på den valgte integrerede matrix;
denne analyse vælger ingen global kurve eller balancevinduer.

## Dependencies og gammel købsværdi

**F25:** Forge-multiplier-memory bliver indbygget; ingen gammel eller ny
Comet-gate må styre hukommelsen. Formation-autosave er en anden feature.

**F26:** Extended Rest/Deep Rest og Tree Deep Reserves-hours skal håndteres
samlet med lastprocessed/recovery. F27 ejer Comet-legacy-værdien og nye IDs;
F26/Core ejer offlineendpoint og Prisms-værdi for Reserves. Ingen blanket
refund af Prisms eller ændring af offline-rate her. Betalte/pending Labs
snapshots reprissættes ikke.

**F24:** eksisterende Deed-auraer og deres unlocks bevares. F27 giver nye
trail/crest-lag, som komponeres med F24s Rift-renderer. De eksisterende
temaers synlighedsfix, Bond-visuals og øvrigt layout er ikke dette scope.

**Save-hazard, observeret:** `normalizeCurrentSave` kopierer kun ownership
for `SHOP`-rækker. I en isoleret kopi tabes offline24/offline48/rememberbulk
når kun de tre SHOP-rækker fjernes. Arkivér derfor rå flags **før** den nye
normalisering. `restStopComplete()` bruger også `SHOP.every`: nye cosmetics
vil utilsigtet styre refresh-adgang, hvis predicate ikke ændres eksplicit.

**Foreslået værdipolitik, kræver Lead/Core-beslutning:** frivilligt anvendelig
Comet-refund med faste legacy-katalogbeløb: 50/140/160 for de respektive
ejerskaber, højst 350 på den viste baseline. Ingen tvungen cosmetic tildeling.
Gamle flags og beregningsgrundlag arkiveres i et versionsmærket save-record;
kompensation, balance og receipt skrives atomisk til samme snapshot.
Det er en *fast face-value-politik*, ikke et bevis for historisk faktisk
debit: boolske flags gemmer ikke oprindelig pris. Understøttede gamle APK-
prisversioner skal kontrolleres, eller Lead skal vedtage face-value-politikken.

Migration skal være idempotent ved normal load, canonical/recoveryvalg og
backup. En gammel backup erstatter hele den økonomiske tilstand; dens
refund må aldrig lægges oven i live balance, nyere køb eller et uafhængigt
ledger. Restore af samme backup skal give samme slutbalance/ownership,
og retry efter storagefejl skal give højst én overførsel pr. accepteret
snapshot. Schema-version/record-format og commit-recovery-protokol vælges
af Core før kode. Normalisering alene er ikke en migration. Sikker
nedgradering til gammel APK antages ikke.

**Refresh-forslag, kræver Lead-beslutning:** behold grandfathered adgang for
gamle saves, der allerede opfyldte hele den gamle fire-købs-gate. Nye saves
får adgang efter Auto-Ascend + Comet Trials, samlet 240 Comets, uden at
kræve trail/crest. Pris pr. refresh forbliver mindst højeste questreward
(nu 25); candidates/count/day og den deterministiske replacement bevares.
Tidligere ny adgang end 450 er en synlig pacingændring og skal accepteres
eller erstattes af en anden konkret gate. Ingen implicit `SHOP.every`.

## Acceptkriterier på kommende produktkandidat

- [ ] Lead vælger funktionelt indhold, caps, fast pris pr. unlock, legacy-
  refundpolitik og refresh-gate; F29-matrix/F24/F25/F26-kontrakter er afstemt.
- [ ] IDs slås op i autoritativt katalog. Ukendt ID, utilstrækkelige Comets,
  owned item, duplicate click og direkte/bulk/Max/queue-kald giver ingen
  debit uden ny ownership. One-shot køb har ingen bulk/queue-vej.
- [ ] Alle nye købsveje debiterer kun Comets til samme synlige faste pris;
  render/screen-skift, equip og Trial start/cancel opkræver intet.
- [ ] Trial-intents/gyldighed/afslutning testes ved manual/Auto-Ascend,
  farm-bulk, formation/rebuild, manual versus Auto-Tap, samme-tick hændelser,
  whole versus split replay og live/offline 0/1/6/12/24h. Reward/endpoint
  kan ikke dobbeltudbetales. Trials uden ownership kan ikke startes.
- [ ] En Trial giver ingen valuta, power eller ekstra produktiv tid;
  progression med og uden Trial ved identiske handlinger/replay er ens.
  Luminous Motes-belønninger bevares og vises korrekt.
- [ ] Alle kombinationer af tre gamle Comet-flags, intet/fuldt ejerskab,
  v0/v1/migreret save, recovery, export/restore, restore samme backup igen,
  storagefejl/retry, store lovlige balances og bevarede Labs testes.
- [ ] Cosmetic ownership og valgt/Off er separate; restart, Ascend og
  recovery bevarer valget. Existing aura-unlocks og presets bevares.
- [ ] Deeds/Rift/Ascend kontrolleres ved 320/390/430px og 200% tekst:
  kontroller mindst 44px, ingen nødvendige vandrette scrolls, synligt fokus,
  forståelige disabled/owned/pending-states og tekst/shape ud over farve.
  Tekstkontrast mindst 4,5:1 og kontrollernes relevante kontrast 3:1.
  Reduced motion har statisk tilsvarende identitet; HP/tapområde forbliver
  læsbart og betjeneligt. Fokus overlever køb/equip og overlays.
- [ ] Relevante eksisterende gates og målrettede nye JS-scenarier køres på
  frozen kandidat; scoped Core/QA-accept for de konkrete bytes foreligger.
- [ ] Efter koordineret integration gentages berørte checks på main; relevant
  signeret APK/package/version, WebView60/Android/TalkBack/deviceaccept og
  status/beviser gemmes. Ingen WebView60-brud eller native BigInt-syntax.
- [ ] GitHub-checkpoint, integration, PROJECT_STATE, writer-frigivelse og
  efterfølgende arkivering af kun denne ejerchat er dokumenteret.

## Teststatus og næste handling

Kun kildeanalyse og dokumentationskandidat er udført. Detaljer, rå output
og begrænsninger: [validation.md](../qa/comet-unlocks-001/validation.md).
kontekst- og sourcecheck på den nye Node.js-baseline består; isoleret JS-probe verificerer eksisterende kendte
køb, rewardbudget og konkret ownership-/refresh-hazard. Den eksisterende
browser-endgame-check har endnu ingen fuldført QA-assertion: Chromium
timeout efter 25s i dette miljø. Ingen browser-/UI-/migration-/gameplay-PASS
påstås for det nye design. De 19 auditerede funktioner og alle F27-audit-
resultater er identiske før/efter PR51, selv om det samlede index-hash ændres.
Produkt-, eksisterende test-, mobile- og signingbytes er urørte af F27.

Næste handling: bruger overfører denne lille forslagspakke til Lead. Lead
færdiggør detaljer/priser/refund/gate inden for den valgte retning og koordinerer F24/F25/F26/F29 samt
PR46/B2-reviews og writer-handover. Ved eksplicit writer-checkpoint gemmes
den scoped dokumentation i GitHub efter ny branch/PR/run/main-preflight.
Først derefter kan en produktkandidat for det besluttede scope forberedes
og integreres efter workflowet. Feature forbliver åben; ingen fælles
writer er overtaget eller frigivet af denne lokale aflevering.
