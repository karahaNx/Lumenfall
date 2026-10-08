# Swift Recovery — lokalt implementerings- og værdiforslag

Dette er et reviewbart forslag, først analyseret på
`b2a1f440e8ad9fed34b37551e468224310d2a6f6` og derefter opdateret til
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` efter live main rykkede.
C, T, supportkontrakt og kompensation er ikke valgt. Ingen produktpatch eller
save-schemaændring er aktiveret. [Opgaven](../../tasks/SWIFT_RECOVERY_CAP_001.md)
fastlægger ét mål og de åbne beslutninger.

## Autoritativ timing og køb

Baseline Swift hedder `RESEARCH.charge`, med +0.08 fill-faktor pr. level,
0 Lumen, 30 Shards base og prisgrowth 1.55. Basecycle er 6 sekunder.

Lad L være bevaret raw level, C valgt købscap, B valgt basecycle og T valgt
positivt cycle-gulv. Med uændret +8%-regel er et muligt fælles modeludtryk:

```text
E(L) = min(normaliseret L, C)
cycle(L) = max(T, B / (1 + 0.08 * E(L)))
fillPerSecond(L) = 100 / cycle(L)
```

Udtrykket er en parameteriseret implementeringsmulighed; valgte værdier skal
komme fra SUPPORT_UPTIME_001 og Lead. T og C skal passe sammen, så alle
købte levels frem til C faktisk sænker cycle. Ved C > 0 skal
`cycle(C) < cycle(C−1)`, og ved alle levels under C skal næste køb give effekt.
Et højere C end første saturerende level tillader betaling uden ny effekt.
Hvis T vælges som præcis `B/(1+0.08*C)`, er +8%-beskrivelsen og alle køb
konsistente. Hvis et selvstændigt gulv skærer sidste levels effekt af,
skal sidste købs effekt og UI beskrives tilsvarende; ingen tavs nul-effekt.

Undgå recursion: `fillRateMult()` og `abilityCycleSeconds()` må ikke kalde
hinanden begge veje. En fælles pure timinghelper kan returnere raw/effective
level, faktisk cycle, fill-rate og maxed. Købsplanen bruger samme autoritative
C, som effektmodel og kort bruger. Raw ownership anvendes kun til historik,
Deeds og den valgte migrationspolitik.

| Aktuel kode | Nødvendig lokal ændring efter beslutning |
| --- | --- |
| `RESEARCH.charge` omkring index.html:2870 | Godkendt C og tydelig timingbeskrivelse |
| `researchEffectiveLevel`, `researchBonus`, `fillRateMult`, `abilityCycleSeconds` omkring 3931–3956 | Effektclamp og fælles faktisk timing; ingen rå overlevel-rate |
| `getResearchBuyPlan` omkring 4819 | Capgate og actual count for alle multipliers; finite priser; ingen betaling uden effekt |
| `buyResearch`, `autoLabQueueTick` omkring 4894–4930 | Genbrug samme plan, behold 20-købs guard og queue-intent ved cap |
| `researchEffectPreview/Text`, `updateResearchCard`, `renderResearch` omkring 4845–4889 og 5968 | Current/Next/impact og Maxed følger motor, overlevels synlige som historik |
| `simulationNextAbilitySeconds`, `simulationAdvanceAbilityResources` omkring 6786–6804 | Begge bruger 100/cycle eller ækvivalent fælles fill-rate |
| `averageSupportBuffMult`, `averageAbilityDps`, `abilityResourceRates`, Wisp-bars | Brug samme cycle og support-ejerens duration/expiry-kontrakt |
| `acceptPersistedState`, `normalizeCurrentSave`, backup/recovery/Ascend | Raw ownership og godkendt engangsovergang bevares i alle pathways |

De nuværende capped Forge-items har already shared purchase gates og delvis
affordability. Cap på charge ændrer legacy fixed-bulk fra all-or-nothing til
actual capped count ved C-grænsen. Det skal beskrives i accept, og kun charge
flyttes ud af legacy-uncapped-testens forventning. De andre fire legacy-items
beholder deres nuværende kontrakter i dette scope.

Bevar eksisterende heroResource-procent 0–100 ved indlæsning og mid-cycle-køb;
ny hastighed anvendes først efter købets timestamp. En procent, som allerede
er 100, kan caste straks; minimumscycle betyder tid fra tom til fuld resource.
Resonate er en separat betalt ready-resource-handling og omdesignes ikke her.
Persisted aktive support-deadlines håndteres af supportkontrakten; en Swift-
normalisering må ikke forlænge, forkorte eller slette dem i stilhed.

## Gamle overlevels: data er ikke hele købsværdien

Bevar `state.research.charge=L` samt queue-intent; brug E(L) til gameplay.
Dermed bevares historisk ownership, original-Forge Deed-tælling og optjente
Deeds. Det løser kun ejerskabsdelen. Begrænsning af tidligere aktiv effekt
kræver stadig en eksplicit accepteret valuepolitik og synlig forklaring.

Save schema v1 lagrer raw level, men ingen købsledger, bulkgrupper eller
historisk timing/prisversion. `researchCostForLevels` runder det geometriske
batchtotal op én gang. Queue betaler separate afrundede enkeltkøb.
Den målrettede probe viser fx level 0→5: 434 Shards som ét 5x-køb, 436 Shards
som fem enkeltkøb. Begge ender på raw level 5. En eksakt historisk refund kan
derfor ikke udledes af level alene. En batch, som krydser C, gør desuden
fordelingen mellem beholdte og overskydende levels tvetydig.

Reviewbare valg til Lead/Core:

| Politik | Hvad skal fastlægges | Begrænsning |
| --- | --- | --- |
| Shard-kompensation | Historisk priskatalog, beregning for overskud, afrunding og finite/præcise beløb | Må kaldes kompensationsregel; raw levels beviser ikke eksakt betalt sum |
| Overført entitlement | Konkret værdi/indløsningsregel, lagring, visning og økonomisk equivalence | Ingen ny uncapped speed eller uspecificeret generisk bonus |
| Kun raw arkiv | Synlig historik og bevarede Deeds | Beviser ikke økonomisk værdibevarelse; kan ikke alene erklæres accepteret |

Ingen af valgene er implementeret eller godkendt i denne levering.
Refundberegninger må ikke bruge `ceil(geometricSum(C,L−C))` som påstået
historisk betalt sum. Prøven finder allerede ved singlepris-level 77 en pris,
som ligger uden for Number safe-integer-området. Ved meget høje raw levels
kan powers give Infinity. Store gamle levels må ikke lave Infinity-valuta,
silent truncation eller et uendeligt iterativt refund-loop. Politik for disse
data og numerisk repræsentation kræver scoped Core-review. Ingen produkt-BigInt
kan indføres under WebView 60-kontrakten.

## Idempotens, restore og storagefejl

En valgt migration skal holde raw L og beslutningsversion, inputgrundlag,
overført/kompenseret beløb og consumed-status i canonical serialisering.
`normalizeCurrentSave` whitelist-er felter: en ny receipt, som blot tilføjes
før normalization, bliver ellers slettet. Samme for backup/recovery/Ascend.

En migrationflag alene inde i det konverterede save er utilstrækkelig som
bevis mod alle restore-loops: en gammel backup indeholder ikke flaget.
Hvis restore altid erstatter både progression og valuta fra backup, kan en
deterministisk engangsprojection i sig selv være sikker, men det skal bevises
med gentagen gammel restore og alle relaterede valuefelter. Hvis noget
kompenseret bevares uden for den erstattede snapshot, kræves en fælles
dedupliceringskontrakt. En lokalStorage-sideflag er heller ikke alene sikkert
ved recovery, appdata-tab og restore på en anden installation.

Afklar valgt scope for identitet og datatab: der findes ikke en serverledger
i denne baseline. Påstå ikke global exactly-once på tværs af installationskopier.
Kompensation og receipt skal serialiseres i samme canonical payload; en
storagefejl mellem primary/recovery-writes må ikke forbruge værdien uden at
kunne gendanne den. Bevar lastSeen/offline chronology, betalte study-snapshots
og fremtidig-schema-beskyttelse. Nedgradering til gammel APK garanteres ikke.

## Målrettet testdelta efter valgt kontrakt

- `forge-contracts`: charge flyttes ud af uncapped legacy-forventning;
  C−1/C/C+1/store raw levels × 1/5/10/25/50/100/Max × nul/exact/rigelig valuta;
  tjek preview, actual count, cost, counters og fuld no-op på afvisning.
- `forge-chronology`: kø tæt på C, flere konkurrerende køer, sidste køb
  finansieret af et faktisk resource-event, før/ved/efter purchase og casts;
  live/offline og hele/delte vinduer. Ingen retrospektiv resource acceleration.
- Direkte motorbevis: resource 0/50/100 ved C og overlevel; faktisk eventtid
  og advance er konsistente med cycle-gulvet. Gennemsnit/expiry følger det
  integrerede SUPPORT_UPTIME_001-design; kontrol både med og uden Ultimate.
- Save/canonical/recovery/backup/Ascend: raw og compensation-receipt består,
  migration gentages uden ekstra værdi; gammel backup restore igen efter køb,
  efter Ascend og efter simuleret storagefejl. Aktive Labs reprissættes ikke.
- UI: Swift sidste køb/Maxed/overlevel, fokus til samme Queue, 320/390/430px,
  stor tekst, 44px, læsbar kontrast og reduced-motion. Nuværende Forge-driver
  måler 360/390px og mest andre Forge-items; dens PASS accepterer ikke den
  fremtidige Swift-visning eller alle krævede bredder.
- Negatives: fjern charge-cap, lad motor læse raw level, gulv kun i preview,
  gentag migrationdebit/refund. Hver mutant skal fejle en relevant adfærds-
  assertion, og restoration skal bestå. Ingen højere tolerancer for at få PASS.

Fysisk Android/WebView60/TalkBack og APK/signingaccept kræves efter integration
efter det eksisterende featureworkflow. Baselinechecks nedenfor accepterer
ikke B2-kandidaten, nye cap-tal eller migration.
