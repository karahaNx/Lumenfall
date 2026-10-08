# UPGRADE_IDENTITY_001 — fælles effekt-/currency-kontrakt

Status: **lokal designkandidat v1; uafsluttet**. Originalpunkt F29.
Ejerchat: denne featurechat, »Fælles matrix for eksklusive upgrades«.
Rolle: Lead/designkontrakt. Andre Lab-/Forge-/Tree-chats implementerer først
efter samlet kontraktfreeze; dette dokument tildeler dem ingen writer.
Model/effort: brugerens opstartsanbefaling er GPT-6.1 Sol · Ekstra høj.
Faktisk kørt model/effort er ikke verificeret via miljøet.

## Ét mål og originalkrav

Fastlæg én fælles matrix for Lab, Forge og Ascension Tree, vælg behandling af
dubletter, og beskriv stacking samt værdibevarelse før systemimplementation.

Autoritativ original: [brugerkravene](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
Det relevante originale krav er:

> Vi har også et andet problem at man har de samme upgrades flere steder,
> bare med en anden currency. Der skal være nogle upgrades der er eksklusive
> for den bestemte currency, at lab har nogle specielle upgrades der tager
> lidt længere tid at få, men bruger bestemt currency, at forge har nogle
> upgrades ingen andre har men koster mere og sværere at unlocke. Det samme
> med ascension tree, den skal have sin helt helt egen eksklusive opgraderinger.

Denne chats aktuelle bestilling er gemt ordret som UTF-8 tekst i
[USER_REQUEST.txt](UPGRADE_IDENTITY_001/USER_REQUEST.txt). Ingen global
rebalance, Comet-implementation, F20/F21-fix eller PR46-aritmetik bestilles
gennem dette dokument. Dependencies registreres, så designet kan implementeres
uden at overtage deres features.

**Autoritativ rettelse i denne chat:** »Workshop skal bruge samme currencies,
det skal ikke ændres. Kun anderledes upgrades«. Originalrettelsen står i
[USER_CORRECTION.txt](UPGRADE_IDENTITY_001/USER_CORRECTION.txt). Den har forrang
for kandidatens tidligere valutaidé. Alle eksisterende currencies og
prisopskrifter beholdes; kun upgradeindhold og effekt-ejerskab ændres.

Kildeprioritet: originalen og denne bestilling → konkrete
[Lead-beslutninger](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt)
→ F29/dependencies/save-afsnit i
[feedbackopgaven](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
Tal i TASKs forslag er ikke accepterede produktbeslutninger.
[Findings](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt)
og [Source_Index](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt)
afgrænser de tidligere beviser. Billede 03-17363 viser et aktivt betalt Lab-level
og speedtiers; APK-/save-identitet er ukendt. Intet af billederne beviser en
komplet F29-matrix eller balance. Billedet er inspiceret, originals er bevaret.

## Checkout, baseline og PR46/B2

Observeret 7. oktober 2026, Europe/Copenhagen. Præcise tider og kommandoer:
[BASELINE.json](UPGRADE_IDENTITY_001/BASELINE.json).

| Punkt | Præcis identitet/status |
| --- | --- |
| Oprindelig checkout, læst | `/workspace/Lumenfall`, branch `work`, HEAD `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`; ingen filer ændret dér |
| Særskilt checkout | `/workspace/Lumenfall-upgrade-identity-001`, selvstændig `.git`, branch `feature/upgrade-identity-001` |
| Første live main ved opstart | `b2a1f440e8ad9fed34b37551e468224310d2a6f6`; oprindelige checks er bevaret som historik |
| Live main genkontrolleret, kandidat rebaset | `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, »Merge verified offline catch-up and Node.js tooling« |
| Nuværende main tree | `6e18e8485111a7a5bfa2d5854ed6b9c4735282c2` |
| Nuværende produkt-index | blob `90e4678cb28fa833fdacbc01d1744d9465f6a356`, SHA256 `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`; størrelse står i inventory |
| PR46 offentlig head-ref, hentet | `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, R2 |
| PR46 open/Draft | Frisk GitHub-webside viser `pullRequest.state=DRAFT`; [receipt](UPGRADE_IDENTITY_001/evidence/pr46-receipt.json). API-opslag blev `Forbidden`; CI-status er ikke frisk verificeret |
| Ny arkiveret B2 | tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index SHA256 `7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b` |
| B2 accept/handover | Worker-PASS er rapporteret; nye scoped Core-/QA-reviews mangler ifølge aktuel status. 02_07-writerrelease er ukendt |

Live-main AGENTS, bootstrap, Lead-rækken/rolle, PROJECT_STATE, FEATURE_WORKFLOW,
CODEX_START og det målrettede CONTEXT_INDEX er læst. Efter drift til `0bcce84`
er nye regler/status/harness genlæst. Aktive toolingchecks bruger nu Node.js.
Gamle Python-resultater gælder kun den oprindelige `b2a1f44`-baseline og er
bevaret som historik. Denne kandidat ændrer ingen tooling-/produktbytes.

Alle 24 katalogdefinitioner og de isolerede formelobservationer er sammenlignet
før/efter main-driften og er identiske. Ny main ændrer offline catch-up og
save-timing, så de relevante 9 scenarier gentages med det aktuelle Node-harness.
PROJECT_STATEs PR51-tekst siger fortsat Draft/ikke integreret; den observerede
merge og produktbytes på `0bcce84` har forrang for denne ældre statustekst.
Der påstås ingen ny APK-/deviceaccept. PR46/B2-status er særskilt uændret.

Undersøgt: alle 9 Lab-, 8 Forge- og 7 Tree-køb, deres faktiske formler,
prisfunktioner, unlocks/caps, betaling/start/queue/completion, Deeds-tællere,
Ascend og canonical/recovery/backup-normalisering. B2-handoffets START og
identity er læst som dependency; denne chat foretager intet B2-review.

Writer: kun isoleret lokal forslagsskrivning er bestilt. Ingen remote lease,
push, PR, merge, workflowdispatch, build, release eller signing. Fælles
PROJECT_STATE ændres ikke lokalt; [LEAD_CHECKPOINT.txt](UPGRADE_IDENTITY_001/LEAD_CHECKPOINT.txt)
indeholder det konkrete statusdelta til et koordineret docs-checkpoint.

## Lokalt designvalg: systemernes identitet

Følgende er kandidatens konkrete anbefaling, ikke et integreret produktmandat.
Der oprettes ingen ny projektregel i AGENTS.

| System/valuta | Eksklusivt ansvar | Adfærd der adskiller effekten |
| --- | --- | --- |
| Lab: eksisterende Lumen + Shards + arbejde/tid | Langsigtet forskning: passive power, Guardian Tap, kill-Lumen, kill-Shards, Mote-yield og forskningsarbejde | Effekt optjenes først ved completion; køb er et betalt work-snapshot |
| Forge: eksisterende Lumen/Shards-opskrift pr. upgrade | Wisp-abilitymekanik: charge, ability damage, ability resources og fremtidige Luminous encounters | Direkte deterministisk crafting; senere mekanikker har eksisterende Rift 12/18/32-unlocks og større priser |
| Tree: Prisms | Prestige/run-økonomi: recruit-rabat, offline-basisrate og Ascend-Prisms | Permanente prestigevalg; ingen ekstra almindelig +passive/+tap/+kill-bonus |
| Motes | Lab-speedup | Køber kun arbejde pr. sekund for et aktivt level; tildeler ingen effekt før completion |
| Lumen uden Lab | Wisp recruitment/Empower i aktuel run | Eksisterende run-sink bevares; Ascend-reset og anti-loop bevares |
| Sigils | Ultimates/Resonate | Resonate er forbrug, ikke et permanent upgradelevel |
| Comets | Deeds-unlocks og cosmetics | Egne unlockeffekter, ingen kopier af de tre kataloger |

Currency-spørgsmålet er **besvaret**: Workshop-valutaer ændres ikke.
Lab bevarer Lumen+Shards; hver fortsat Forge-række bevarer sin nuværende
opskrift (Swift Recovery er Shards-only; de tre senere mekanikker er Lumen+Shards).
Tree bevarer Prisms; Motes bevarer speeduprollen. Der konverteres ingen
wallets, priscomponenter eller historisk spending til en anden valuta.

Begrundelse: de allerede implementerede Forge-mekanikker har særskilte operands;
Lab kan være eneste nye købsvej til permanent output; Tree får sine egne
prestigeeffekter. F29 opfyldes ved effektens ejerskab og købsadfærd. Et andet
navn, betinget kosmetik eller anden valuta er ikke i sig selv en ny effekt.

### Komplet baseline-matrix og disposition

`k` er eksisterende rå købt/afsluttet level. `L/S/P` er Lumen/Shards/Prisms.
Alle nedenstående tal er aflæst i uændret produktkode, ikke nye balancevalg.
»Fusion« lukker den gamle nye-købsvej og beholder købte bidrag under én samlet
effekt. Det giver ikke ekstra levels på destinationssporet.

| System · ID / navn | Eksakt eksisterende effekt | Betaling, unlock og faktisk loft | V1-disposition / eneste nye købsvej |
| --- | --- | --- | --- |
| Lab `wispascend` · Wisp Ascendancy | `1 + .15k` passiv power; indgår også i tap-base | L+S+tid, Rift 1, intet levelcap | Behold; Lab ejer passiv power. Fusionér Formation Training, Formation Insight og Eternal Momentum hertil |
| Lab `guardmastery` · Guardian's Mastery | `1 + .20k` tapfaktor | L+S+tid, Rift 1, intet cap | Behold; Lab ejer tapfaktor. Fusionér Steady Hands og Guardian's Resolve hertil |
| Lab `riftattune` · Rift Attunement | `+.10k` procentpoint offline-rate efter Tree-cap, også over 100% | L+S+tid, Rift 1, intet cap | Fusionér i Tree/Echoing Rest som arkiveret additivt bidrag; ingen nye Lab-ratekøb |
| Lab `shardstudy` · Shard Attunement | `1 + .08k` Shards pr. kill | L+S+tid, Rift 15, intet cap | Behold; eneste nye kill-Shards-spor. Shard Sense fusioneres |
| Lab `lumenstudy` · Lumen Wellspring | `1 + .08k` Lumen pr. kill | L+S+tid, Rift 25, intet cap | Behold; eneste nye kill-Lumen-spor. Battle Focus og Starlight Affinity fusioneres |
| Lab `formationstudy` · Formation Insight | `1 + .05k` passiv power; også tap-base | L+S+tid, Rift 40, intet cap | Fusionér i Lab/Wisp Ascendancy; intet selvstændigt fremtidigt køb |
| Lab `motestudy` · Luminous Sense | `1 + .10k` Motes fra Luminous-kill | L+S+tid, Rift 60, intet cap | Behold; yield pr. encounter er eksklusivt Lab. Chance/Module/Bond-kilder beskrives separat |
| Lab `prismstudy` · Ascendant Clarity | `1 + .05k` Ascend-Prismfaktor | L+S+tid, Rift 90, intet cap | Fusionér i Tree/Swift Ascension som arkiveret faktor; ingen nye Lab-Prismkøb |
| Lab `measuredinquiry` · Measured Inquiry | `2% * min(k,10)` mindre work; max 20%; kun fremtidige legacy8-starter | L+S+tid, Rift 60, cap 10 | Behold Lab-eksklusiv. Ingen selvdiscount; ændret targetliste kræver D03 |
| Forge `focus` · Battle Focus | `1 + .08k` Lumen pr. kill | L, Rift 1, intet cap | Fusionér i Lab/Lumen Wellspring |
| Forge `sense` · Shard Sense | `1 + .08k` Shards pr. kill | L+S, Rift 1, intet cap | Fusionér i Lab/Shard Attunement |
| Forge `formation` · Formation Training | `1 + .05k` passiv power; også tap-base | S, Rift 1, intet cap | Fusionér i Lab/Wisp Ascendancy |
| Forge `resolve` · Guardian's Resolve | `1 + .10k` tapfaktor | L, Rift 1, intet cap | Fusionér i Lab/Guardian's Mastery |
| Forge `charge` · Swift Recovery | `cycle = 6 / (1 + .08k)` sekunder | S, Rift 1, intet cap | Behold kun Forge-charge; cap/mincycle/senere unlock afgøres sammen med F18/F19 i D02 |
| Forge `arcanecal` · Arcane Calibration | `1 + .03*min(k,10)` ability damage; alle damaging Wisps | L+S, Rift 12, cap 10 | Behold; ingen passive-/tapbonus. Eksisterende prisopskrift bevares |
| Forge `conduction` · Resource Conduction | `1 + .04*min(k,10)` på Gale-Shards/Thorn-Lumen pr. cast | L+S, Rift 18, cap 10 | Behold; ingen killrewardbonus. Eksisterende prisopskrift bevares |
| Forge `luminoustracking` · Luminous Tracking | `+.005*min(k,10)` chancepoint; samlet chance ≤35%, aldrig Boss | L+S, Rift 32, cap 10 | Behold; ændrer kun fremtidige encounters, ingen reroll eller Mote-yieldbonus |
| Tree `starlight` · Starlight Affinity | `1 + .10k` Lumen pr. kill | P, fra start, intet cap | Fusionér i Lab/Lumen Wellspring |
| Tree `steady` · Steady Hands | `1 + .08k` tapfaktor | P, fra start, intet cap | Fusionér i Lab/Guardian's Mastery |
| Tree `echo` · Echoing Rest | `min(1,.70 + .05k)` offline-basisrate | P, fra start; effektloft 6, købsgate mangler | Behold kun Tree-rate. F20 har allerede valgt cap 6. Arkiveret Rift Attunement lægges til efter dette cap |
| Tree `bonds` · Cheaper Bonds | `min(.60,.03k)` recruit-rabat, prisgulv 40% | P, fra start; effektloft 20, købsgate mangler | Behold kun Tree-recruitpris; klar label »Recruit-rabat«. F21 har valgt cap 20. Ingen Formation Bond-effekt |
| Tree `swift` · Swift Ascension | `1 + .04k` Prisms pr. Ascend | P, fra start, intet cap | Behold kun Tree-Prismfaktor; arkiveret Ascendant Clarity bevares |
| Tree `momentum` · Eternal Momentum | `1 + .06k` passiv power; også tap-base | P, Deed `asc5`, intet cap | Fusionér i Lab/Wisp Ascendancy |
| Tree `reserves` · Deep Reserves | `+2k` timer til offline-cap | P, Deed `d100`, intet cap | Luk nye timecap-køb pga. accepteret F26. Rå levels bevares; erstatningsværdi er D04, ikke en bortgemt >12h-effekt |

Resultat: 6 fortsatte Lab-spor, 4 Forge-spor, 3 Tree-spor; 10 dubletspor
fusioneres, 1 timecap-spor kræver separat F26-overgang. Det er en konkret
katalogdisposition med uændrede valutaer/priser; relevante cap- og
migrationsafhængigheder er endnu ikke accepterede produktbytes.

### Priser og work på baselinen

Priser og work for fortsatte native spor beholdes præcis som nedenfor.
Fusion reprissætter ingen købt level eller aktivt snapshot. Prisdata for
lukkede spor bevares som historisk bevis, ikke som konverteringskurser.
Komplette data, beskrivelser, line-referencer og syntetiske formelobservationer
findes i [inventory.json](UPGRADE_IDENTITY_001/evidence/inventory.json).
Reproduktion: `node docs/tasks/UPGRADE_IDENTITY_001/inventory.cjs index.html`.

Lab-starter betaler `round(L0 * 1.8^k)` L og `round(S0 * 1.8^k)` S.
Work er `round(W0 * 1.6^k)` sekunder, med Inquiry-discount som beskrevet
nedenfor. Unlock afhænger af historisk `maxDepthEver`.

| Lab ID | L0 | S0 | W0 sekunder |
| --- | ---: | ---: | ---: |
| wispascend | 800 | 80 | 180 |
| guardmastery | 600 | 40 | 150 |
| riftattune | 500 | 100 | 240 |
| shardstudy | 400 | 150 | 200 |
| lumenstudy | 1400 | 120 | 260 |
| formationstudy | 2200 | 220 | 320 |
| motestudy | 3200 | 320 | 380 |
| prismstudy | 4800 | 480 | 450 |
| measuredinquiry | 30000 | 1200 | 600 |

Forge bulk betaler `ceil(sum(base * growth^(k+i), i=0..count-1))` pr. valuta
via den eksisterende geometriske sum. **Ikke** summen af individuelt rundede
priser. Single og queue bruger count 1. Capped køb trimmes til reelt antal.

| Forge ID | L0 / growth | S0 / growth |
| --- | --- | --- |
| focus | 200 / 1.5 | 0 / 1 |
| sense | 150 / 1.5 | 20 / 1.5 |
| formation | 0 / 1 | 40 / 1.6 |
| resolve | 150 / 1.45 | 0 / 1 |
| charge | 0 / 1 | 30 / 1.55 |
| arcanecal | 15000 / 1.6 | 120 / 1.6 |
| conduction | 90000 / 1.6 | 280 / 1.6 |
| luminoustracking | 2500000 / 1.6 | 1500 / 1.6 |

Tree betaler `ceil(P0 * growth^k)`. P0/growth:
starlight 1/1.35; steady 1/1.30; echo 2/1.40; bonds 2/1.45;
swift 3/1.50; momentum 5/1.55; reserves 6/1.60.

Eksisterende Mote-tiers/priser ændres ikke: 1.5×=14, 2×=26, 3×=60,
4×=110, 5×=176, 6×=258, 7×=357, 8×=473. Direkte valgt tier betales på hvert
level efter PR46/F12; ingen opdigtet exchange rate mellem currencies.

### Foreslået indhold og grænse til andre ejerchats

Denne v1 tilføjer ingen nyt generisk +damage-spor. Lab/Forge/Tree-systemchats
skal knytte nye forslag til matrixen nedenfor med effekt-ID, købsvaluta,
unlock, pris/work, cap, operand, rounding, stacking, saveværdi og bevis.
Et forslag må ikke dele en direkte operand med en anden købbar matrixrække.

| Kendt forslag | Valuta/effekt | V1-beslutning og dependency |
| --- | --- | --- |
| Opening Focus, historisk Forge-forslag | Resource seed/first cast | Forbliver parkeret efter Lead 4. oktober. Må ikke genindføres som pris på nødvendig formation/rebuild-funktion |
| Flere Forge-upgrades, historisk 8+8-katalog | Fulde oprindelige forslag er ikke tilgængelige i de læste repo-kilder | Ukendt indhold; ingen konstrueret liste eller genbrug af gamle tal. En præcis ny systemlevering skal vurderes før freeze |
| Rift Trail | Comets; valgbart trail på Rift | F27-kandidat, ingen Lab/Forge/Tree-outputbonus; pris/ownership/44px/reduced-motion afventer Comet-ejer |
| Starfall Crest | Comets; valgbart Guardian-/Ascend-udtryk | F27-kandidat; ingen nye damage-/Prismprocenter |
| Formation Spotlight | Comets; valgbare Bond-visuals | F27-kandidat; læsbar standardvisning og nødvendig rolleinformation er baseline |
| Deed Contract | Comets; ekstra daglig kontrakttype | F27-funktionelt forslag, endnu ikke valgt. Reward/pris/cap og earn-spend-loop kræver måling; ingen free-Comet/refund-loop |

F27 opfyldes ikke alene ved cosmetics eller dette dokument. Forge bulk-memory
bliver baseline i F25. F26 kræver ét fælles produktivt interval ≤12h til både
combat, rewards, Lab og automation; Echo-rate er en separat dimension.
Extended Rest (140 Comets), Deep Rest (160) og Loadout Memory (50) står i
inventory som aktuelle køb. Deres ejerskab og erstatningsværdi må ikke
forsvinde ved katalogændringen. Auto-Ascend (100 Comets) ændres ikke her.

## Stacking: én effekt med dokumenterede kildebidrag

Notation: `T(id)`, `F(id)`, `L(id)` er købte Tree-, Forge- og afsluttede
Lab-levels. Til den valgte familie bevares alle eksisterende kildeled i
**samme aritmetiske rækkefølge** som produktionen. Lukket kilde fryses efter
eventuelle allerede betalte Lab-completions. Fremtidige køb øger kun
familieejerens eksisterende level; nulstilling til billigt level 0 er forbudt.

| Samlet familie / ejer | Bevarede formelled og rækkefølge |
| --- | --- |
| Kill-Lumen / Lab lumenstudy | `(1+.10*T(starlight)) * (1+.08*F(focus)) * (1+.08*L(lumenstudy))` |
| Kill-Shards / Lab shardstudy | `(1+.08*F(sense)) * (1+.08*L(shardstudy))` |
| Tapfaktor / Lab guardmastery | `(1+.08*T(steady)) * (1+.10*F(resolve)) * (1+.20*L(guardmastery))` |
| Passive power / Lab wispascend | `formationMult * synergyMult * (1+.06*T(momentum)) * (1+.15*L(wispascend))`; `formationMult=(1+.05*F(formation))*(1+.05*L(formationstudy))` |
| Offline-rate / Tree echo | `min(1,.70+.05*T(echo)) + .10*L(riftattune)`; cap 6 på nye echo-køb, Lab-bidrag arkiveres |
| Ascend-Prismfaktor / Tree swift | `(1+.04*T(swift)) * (1+.05*L(prismstudy))` |

På profilen Tree=2, Forge=3, Lab=4 giver kill-Lumen faktoren
`1.2*1.24*1.32 = 1.96416`; at lægge 20%+24%+32% sammen ville give 1.76 og
ødelægge købsværdi. Tapfaktoren er 2.7144. Offline-rate er 120%: Tree 80% plus
arkiveret Lab 40 procentpoint. Luminous yield, encounterchance og produktive
timer er tre forskellige størrelser. Fresh spillere har ingen arkiveret Lab-rate.

Fusionsvisningen viser familiens totale nuværende effekt, næste reelle køb og
købte historiske bidrag. Den viser ikke et fiktivt destinationslevel, som om
Prism-, Lumen- og Shard-køb havde identisk værdi. Historiske rå levels og navne
er tilgængelige for spilleren som købshistorik; der er ingen gammel købsknap.

Eksisterende sekundære operands bevares også:

- Tap-base er `5 + .02 * effectivePartyPower`; fusion af passive power må
  ikke utilsigtet fjerne dens bidrag til taps. Auto-Tap bruger samme hit.
- Ability damage: Wisp Power, koefficient, relevant Module, Ultimate,
  Arcane Calibration, relevante damage Bonds og Boss-faktor. Passive-/tap-
  familie og supportbuff må ikke lægges på abilityhits.
- Gale/Thorn-ressourcer beregnes pr. cast og rundes som nu. Resource Conduction
  multiplicerer den kilde; kill-Lumen/kill-Shards gør ikke.
- Luminous Tracking lægger chancepoint til fremtidige tilladte encounters;
  samlet chance capper ved .35; Bosses er aldrig Luminous. Luminous Sense
  multiplicerer yield. Support Modules/Bonds bevares som særskilte Wispvalg.
- Motes pr. Luminous-kill følger den eksisterende `motesDropFor` plus det
  eksisterende supportbidrag/rounding. Faste dokumenterede rewards bevares;
  ingen random reward range eller reroll ved køb.
- Prisms beregnes efter samme cleared Rift, benchmark, first/repeat/new-depth,
  floors, 20% repeatreserve og anti-loop som nu. UI-preview og payout skal
  kalde samme model; ingen +1 pr. upgrade-hack.
- Supports bidrag er additive (+25%/+50% pr. aktiv buff) indtil F18 vælger
  et andet konkret design. Charge-cap uden duration/cycle-review løser ikke
  permanent Ultimate-uptime.
- Inquiry: først round af grundwork, dernæst round efter capped discount;
  ingen selvdiscount og ingen ændring af allerede betalte work/speed-snapshots.

## Værdibevarelse og idempotent overgang

**Valgt lokal overgang for de ti dubletspor:** bevar den faktiske købte
effekt som et arkiveret, ikke-købbart kildebidrag til én familie. Ingen refund
til spendable valuta og ingen matematisk konvertering til nye levels.
Det bevarer effekt, rå ejerskab og nuværende wallets uden en restore-bonus.
Historisk betalt pris kan ikke rekonstrueres eksakt fra raw level alene:
Forge-bulk runder totalsummen, og tidligere prisversioner er ikke en købskvittering.

Overgangens krævede algoritme, endnu ikke implementeret:

1. Valider gammelt root/schema først. Bevar en byteidentisk original i
   backup/recovery-pakken. Identitetsmigration skal være en eksplicit
   versionsmigration før katalogbaseret normalisering; ellers kasserer den
   aktuelle whitelist ukendte/retired IDs.
2. Flyt/kopiér hvert lukket raw ID til én versionsmærket ownership-post med
   oprindeligt system/ID/raw level og effektformelversion. Destinationens
   eksisterende native level ændres ikke. Gem aktive retired Lab-records med
   deres original-ID og allerede betalte remaining/total/speed-snapshots.
3. En migrated inputpost erstattes, aldrig lægges oveni den samme familiekilde.
   Migreret save bruger ledgeren; det læser ikke også shadow-kopier som ekstra
   effekt. Gamle raw felter bevares som revisionsdata uden dobbelt medregning.
4. Aktive retired Labs færdiggør det allerede købte level efter den oprindelige
   effekt- og workkontrakt og øger den pågældende arkiverede kilde én gang.
   Betalt Mote-speed bevares. Ingen ny retired queue-start; gamle queue-/speed-
   intents arkiveres og aktiverer ikke automatisk spending på et andet projekt.
5. Persistér hele resultatet gennem samme accepterede canonical/recovery-path.
   Genåbning, export, recovery og restore bruger samme migrering/validator.
   Retry efter write failure må ikke fuldføre arbejde eller flytte værdi igen.
6. Restore erstatter hele state inkl. wallet, ledger og native levels; den
   fusionerer aldrig med den aktuelle state. Restore af samme gamle backup
   giver samme output, ikke kumulerede bidrag. Eksisterende restore starter
   fra nu, så gamle offlineperioder ikke genudbetales.

Obligatoriske egenskaber: `M(M(s)) = M(s)`; normalisering bevarer ledger og
pending records; repeated restore er replacement, ikke append; endelig
produktstate har én autoritativ operand pr. kilde. Ingen påstand om sikker
nedgradering til en gammel APK, der ikke kender nye schema/ownership-felter.
Schema-ID vælges med Core efter B2; det må ikke kollidere med en anden migration.
På den nye main guarder `saveState(clockMs)` igangværende/pending offline
catch-up. Identitetsmigration skal færdiggøres før et sådant job oprettes;
en in-flight working/base-state må ikke migreres hver for sig eller overskrives
af et UI-save. Dette nye samspil hører til D05s Core-review, ikke til en F29-
rettelse af OFFLINE_CATCHUP_001.

F20/F21-overlevels arkiveres råt; deres ekstra køb gav ingen effekt. De kan
derfor ikke »bevares« blot ved en capped formel. Konkrete erstatningsrettigheder
for disse køb og Swift-overcap samt fjernede timecap/Comet-køb er D04.
Kandidatens arkivstrategi løser **ikke** automatisk disse særlige køb.
For F26 må man ikke bevare købsdata ved stadig at yde >12h produktivt arbejde.
Offline processed-time/restore skal koordineres, så overgang ikke replay'er
en gammel periode. Der påstås ingen refundbeløb uden prisproveniens.

## Beslutninger der skal fryses før implementation

| ID | Konkret manglende beslutning/bevis | Ansvar og freeze-gate |
| --- | --- | --- |
| D01 — besluttet | Workshop bevarer alle eksisterende currencies og prisopskrifter; fortsatte native levels beholder deres nuværende pris/work/unlock, med F19 som særskilt dependency | Brugerrettelsen er autoritativ; ingen ny valutafordeling eller prisomlægning. F28 måler senere pacing efter fusion |
| D02 | Swift Recovery maxlevel, positiv mincycle, senere unlock og support-duration/uptime samlet | F18/F19-ejer + kontraktejer; 8s Ultimate mod 6s grundcycle er allerede permanent ved charge 0. Tal mangler; ingen cap gættes |
| D03 | Lab-slot progression, Inquiry-targetliste, Deeds-credits og automation-unlocks efter fusion | Slots må ikke genberegnes ud fra 6 i stedet for legacy8. Første/25/all8 og original5 Forge-20/60 må ikke låse fresh spillere ude ved caps/retirement. Bevar optjent credit; vælg nåelige nye predicates før kode |
| D04 | Erstatningsværdi for Echo>6, Bonds>20, kommende Swift-overcap, Deep Reserves/Rest og Loadout Memory | Relevant cap/F25/F26-ejer og Core. Prisproveniens, immutable erstatningsownership eller sikker refund-policy skal vælges. Restore/cross-feature dobbeltkompensation skal bevises |
| D05 | Eksakt ownership/schema, aktive retired Labs, canonical/recovery/backup og write-failure-transaktion | Core-review på samlet overgang; versions-/migrationrækkefølge inkl. PR46-settings og F26-clock skal fryses |
| D06 | Modtagne nye Lab/Forge/Tree-forslag med sammenligneligt budget/priser/caps | Brugeren overfører systemleveringer. Ingen subagenter/beskeder; deres individuelle forslag er ikke bindende før denne fælles freeze |

F29s komponenter kan inventeres parallelt lokalt, men D01–D06 må ikke
splittes i inkompatible selvstændige valuta-, save- eller stackingbeslutninger.
F28s fulde curve simulation følger den valgte identitet og overgang.

## Acceptkriterier og checks

| Accept | Kriterium og nødvendig evidens | V1-status |
| --- | --- | --- |
| A1 baseline | Alle 24 IDs dækket med observed effekt/pris/cap/unlock og præcis source | Opfyldt lokalt; inventory og uændret sourcehash |
| A2 identitet | Ingen to fremtidigt købbare Lab/Forge/Tree-spor deler direkte effekt; hver systemrække har egen mekanik | Konkret disposition valgt; endelig review/freeze mangler |
| A3 købsdesign | Priser, work, caps og unlocks er numeriske, redelige og deterministiske; Forge dyrere/senere er målt | Uændrede pris/work-data besluttet; F19/D02 og unlock-/Deed-afhængigheder D03 åbne |
| A4 værdi | Dubletkøb, overskydende caps, timecap og Comet-ejerskab er dækket uden deletion/dobbelt bonus | Dubletstrategi beskrevet; D04/D05 åbne, ingen kørt migration |
| A5 handler/queue | Retired single/bulk/Max/direct/queue afviser uden debit; aktive paid Labs gennemføres én gang | Krav defineret; ingen produktkandidat endnu |
| A6 chronology | Completion før nye starts og speedbetaling ved samme boundary; korrekt Luminous-affordability/live/offline/whole/split | Eksisterende baseline-checks; ny model kræver PR46 og egne tests |
| A7 UI | 320/390/430px, stor tekst, kontroller ≥44px, fokus, kontrast, reduced-motion; tydelig aktuel/next/history og valuta | Baselinekontrol hvor relevant; intet nyt UI implementeret |
| A8 integration | Koordineret GitHub-checkpoint, kontraktfreeze, integrationscommit og kontrol på integreret version | Mangler; lokal kandidat er uafsluttet |

For dette design/dokumentationsscope kræves docs-/link-/katalogkontrol og
integration. APK/device er ikke nødvendig for selve dokumentet. Efterfølgende
system-appfeatures kræver integreret adfærdstest, nødvendige APK-/devicechecks,
WebView 60, package `com.lumenfall.app` og eksisterende signing. Ingen moderne
Chrome-PASS er fysisk Android/TalkBack eller WebView60-accept.

Kørt på uændret produkt ved den ovenstående live-main baseline:

- Aktuel Node context-check: PASS, 21 entrypoints, 24 links, 17805 startupbytes.
- Original `formula_probe.cjs`: PASS; output matcher tidligere results JSON
  byteidentisk, inklusive 40 Prism-cases og bevis for Echo/Bonds-køb uden effekt.
- JavaScript-inventory: 9+8+7=24 IDs; 6 dubletfamilier og 4 syntetiske profiler.
  Isolerede data/formler, ikke fuldmotor eller migreringsaccept.
- Eksisterende `upgrade-effects-and-deeds`: PASS, 941 checks, 23 Deeds.
  Chrome 155.0.8059.39, samme sourcehash. Første forsøg med system-Chromium151
  fik server/socket-afvisning i sandbox og derefter timeout; rå fejl bevares.
  Gentagelse med miljøets eksisterende Chrome-wrapper bestod. Disse indledende
  browserfejl gælder opstartsbaselinen og står i `history-b2a1f44/`.
- Yderligere 8 eksisterende scenarier bestod: Forge-contracts (3508 checks,
  336 købscases og cap/migration/Deed/effect-negatives), Forge-chronology,
  Inquiry-contracts/chronology, Forge-backup-restore/recovery og Forge-UI
  mobile/reduced-motion. UI-harnesset prøvede 360×640 og 390×844, safe inset
  0/24px, touch/keyboard/fokus og 44×44px bulk-kontroller. 320/430px, stor
  tekst og særskilt kontrastkontrol er ikke prøvet i denne dokumentlevering.
- På den nye main fejlede første normale mobilecheck under animation på
  en målt højde 43.996887px. Samme uændrede check bestod ved separat gentagelse;
  reduced-motion bestod. Første fejl er bevaret i `forge-ui-mobile-first.log`.
  Dette er en observeret intermittent baseline-fejl, ikke en accepteret 44px-
  garanti for alle animationsframes. Produkt-UI ændres ikke i denne chat.
- `node scripts/codex/check_context.cjs --archives`: PASS, 1509 arkiv-/coveragechecks og alle 96
  oprindelige B2-kilder på korrekt tree. Ingen kandidatkode er ændret.
- Brugerrettelsen om valutaer er indarbejdet; tidligere forslag om valutaomlægning er trukket tilbage.
- Øvrige resultater/kommandoer gemmes i
  [CHECKS.json](UPGRADE_IDENTITY_001/CHECKS.json) og evidence-logfilerne.

Ingen brede B2-reruns, ændrede regressionorakler eller testkode, der alene
spejler dokumentets implementeringsforslag. Baselinechecks verificerer de
observerede formler/kontrakter; de accepterer ikke en ny migration eller balance.

## Checkpoint, integration og næste handling

Lokal kandidat og mobilhentbar TXT/ZIP forberedes med manifest og kildehenvisninger.
GitHub-checkpoint, PR og integrationscommit: **ingen**. Writer-release for denne
chat: ingen remote lease taget; lokalt forslag fryses ved aflevering.
Arkivstatus: **åben**, da nødvendige beslutninger/integration mangler.

Næste konkrete handling for Lead er at afklare det aktuelle writercheckpoint,
API/preflight og PR46/B2-accept/handover, og derefter gemme den afgrænsede
docs-kandidat i GitHub. Brugeren overfører [LEAD_CHECKPOINT.txt](UPGRADE_IDENTITY_001/LEAD_CHECKPOINT.txt);
det er ingen ny generel godkendelsesforespørgsel. Kontraktejeren samler
systemleveringer og fryser D01–D06 før deres produktimplementation.
Efter docs-integration genkøres relevante dokumentations-/sourcechecks, status
gemmes i PROJECT_STATE og denne opgave, og docs-writer frigives. Ejerchatten
arkiveres først efter hele dette bestilte kontraktscope er verificeret integreret.
