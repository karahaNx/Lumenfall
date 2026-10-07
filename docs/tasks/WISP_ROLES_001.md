# WISP_ROLES_001 — synlig værdi fra alle Wisps

Status: **lokal analyse/designkandidat; featuren er uafsluttet**. Dato: 7. oktober
2026, Europe/Copenhagen. Ét mål: dokumentér og reducer Titan-afhængighed,
vis hver Wisps faktiske rolle uden dobbeltoptælling, og giv tidlige
damage-Wisps en varig mekanisk grund til at blive valgt.

Ejerchat: denne featurechat WISP_ROLES_001. Rolle: 02 Gameplay / Progression.
Ingen subagenter, beskedværktøjer, andre chatændringer eller andre features.
Model/effort anbefalet af bestillingen: GPT-6.1 Sol / Ekstra høj. Præcis kørt
modelvariant og effort er ikke verificerbare via de tilgængelige værktøjer;
anbefalingen bruges ikke som attestering.

## Originalkrav og kilder

Original F17:

> Der er alt for meget forskel på wisp i deres dmg, late game kan man kun fokusere på titan da de andre wisp slet ikke kommer i nærheden af hvad den har som dmg, så ca 90% af ens dmg kommer fra Titan wisp alene, det giver ikke mening at de andre wisp ikke har synlig hjælp.

Aktuel bestilling: equal-budget og faktiske mid-/late-game-hold; rå skade,
marginal support, Bonds og ressourceværdi uden dobbeltoptælling. Bevar
WebView 60, package `com.lumenfall.app`, signing, deterministiske køb,
Luminous Motes-belønninger og gamle køb/data.

Autoritative/relevante kilder, læst ved opstart:

- [Originalen](../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt).
- [F17, F14/F15/F18/F19, dependencies og save-afsnit](../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt).
- [Konkrete Lead-beslutninger](../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt): equal-budget/marginalværdi før tuning; support/Swift/Bonds koordineres; ingen accepterede nye balancevinduer.
- [Fund](../recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/FINDINGS.txt) og [kildeindeks](../recovery/2026-10-07/lead_context/FEEDBACK/Source_Index.txt). Indeksets billeder vedrører andre UI-punkter og beviser ikke Titan-andelen.
- Live AGENTS, PROJECT_BOOTSTRAP, egen Gameplay-række/rolle, PROJECT_STATE,
  FEATURE_WORKFLOW og målrettede CONTEXT_INDEX/CODEX_START-opslag.
- [Original device-save og reproduktionsindeks](../qa/offline-autoascend-2026-10-07/Source_Index.txt), [B2 START](../handoffs/02_08/2026-10-07/START_HER.txt) og SUMMARY/identity.json.

Originalkrav og konkrete Lead-beslutninger har forrang for TASK-designforslag.

## Initial baseline, isolation og writer

Live main ved opstart observeret via GitHub: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
Det lokale udgangspunkt var `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`, tree
`a9361196b3d92bc769eb630f0c2c57c417cdb732`. Live main tilføjer JavaScript-reglen;
den er læst og fulgt, selv om dette miljøs checkout er ældre.

Isoleret, selvstændig Git-klon: `/workspace/Lumenfall-WISP_ROLES_001`.
Lokal branch: `feature/WISP_ROLES_001`. Andre chats' checkout og `.git` er
ikke ændret. Direkte Git-fetch kan ikke nå miljøets proxy; live GitHub-
forbindelsen er brugt read-only. Før et writer-checkpoint skal kandidaten
rebases/genoprettes på den da aktuelle main i en egen checkout.

Produktbytes i lokal checkout og live main er verificeret identiske:
`index.html` blob `ea44431c163569548973d9e489f75345749a07ee`, SHA256
`f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
Original/F17-task/Lead-beslutning/FINDINGS er også blobkontrolleret mod live main.
Produktbaseline ved opstart var `1ddc246eb62782a61ec5c486cd5f51ea170bb338`, APK 0.1.133.

PR46 observeret open/Draft, R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.
Ny B2: tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`, index SHA256
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Worker-PASS er rapporteret; nye scoped Core/QA og fysisk Android mangler.
02_07s writer-frigivelse er stadig ukendt i aktuelle kilder. Denne chat har
kun lokal forberedelse; intet remote writer-scope er overtaget eller frigivet.
Stående godkendelse gælder bestilt scope og kræver ingen ny generel godkendelse.

Stopgrænse: ingen remote commit/push/PR-oprettelse eller -ændring, integration,
dispatch/rerun, Android-build, signing eller release før koordineret Lead-
checkpoint med dokumenteret writer-handover og relevante kandidat-reviews.
Der er ikke oprettet en feature-PR eller ændret PROJECT_STATE på main.

## Undersøgelse og resultater

[Rapporten](../qa/wisp-roles-001/REPORT.md) indeholder tabeller og fortolkning;
[rå resultater](../qa/wisp-roles-001/results.json) indeholder eksakte levels,
afrundede omkostninger, restbudgetter, marginaler, ressourceflow, next-upgrade
DPS/Lumen, summaries og Boss-kill-tider. [Måleren](../qa/wisp-roles-001/measure.cjs)
kører den uændrede produkt-IIFE i Node VM med DOM-init holdt tilbage. Én
observer registrerer motorens allerede udførte kills ved timeline-events;
ingen gameplayformel eller deadline ændres. Det er ikke browser-/deviceaccept.

Der er målt 1.008 fem-Wisp-kombinationer: alle 56 hold, tre Lumen-lofter,
to permanente profiler og Push/Farm/Boss. Lige budget betyder samme loft
og samme allokering pr. slot, med synligt ubrugt cash; præcis lige spend og
optimal investering påstås ikke. Permanent ownership holdes identisk på
save-profilen; gamle historiske køb kan ikke omregnes til en præcis betalt pris.

Ved 10 mia. Lumen-loft på det konstruerede Push-preset: Titan-fjernelse
taber 90,84% af samlet skade. Ember bidrager kun ca. 1,54 mio. rå DPS, men
fjernelse taber ca. 5,08 mia. DPS / 15,26% gennem Starcaller. På Farm-preset
giver hver aktiv Ultimate-support ca. 18,62 mia. ekstra DPS; Titan-fjernelse
taber 74,13%. Det er kontrollerede hold, ikke måling af brugerens rapporterede
90% på et faktisk opbygget save. Den bedste målte Titan-frie formation
leverer 27,30% af den bedste med Titan ved samme 10 mia.-loft/allokering
og samme late-game-permanentprofil i Push-konteksten.

Den igen indsendte backup har de samme relevante post-Ascend-værdier som
den bevarede original: Rift 1, Ember 1, øvrige 0, kun Titan Auto-Empower ON,
Auto-Ascend target 22, MaxDepthEver 220 og fulde permanente Wisp-spor.
Arkiveret backuptekst er dekodet og kontrolleret mod device_backup.json.
En powered mid-game- eller late-game-snapshot er endnu ikke modtaget.
Presets/formationRebuild giver ikke medlemmer power. Med uændrede indstillinger
giver 60/600/3600s simuleret live-tid nul Empowers. Kontrol med kun Auto-Ascend
OFF giver Titan 23/98/98 + startup-Ember. Disse er simulerede kontrolforløb,
ikke nye reelle brugersaves eller produktændringer.

12 fuldmotor-Boss-vinduer med alle tre traits måler startup og konkrete
kill-tider, separat fra gennemsnitsestimat. Eksempel Rift 180: de konstruerede
Push/Farm/Boss-hold dræber efter 36/14/18s; Titan-frit alternativ dræber
ikke inden 60s. Upgrade-wait og Ascend/time kræver efterfølgende sammenhængende
forløb med valgte køer og faktisk valuta; next-purchase ROI er ikke et
bevis for de endelige progressionstal.

## Konkret forslag til synlig værdi

Én autoritativ, afledt rolle-snapshot bruges af UI og relevant simulation:

1. Additivt holdregnskab: rå passive skade + ability-DPS + Wisp-afledt
   Auto-Tap + Guardians grundbidrag; derefter Bond-ekstra, derefter support-
   ekstra. Summen skal matche motorens total. Vis nuværende earned output
   og sustained-estimat med tydelig forskel, så første cast ikke foregives aktivt.
2. Hver Wisp viser egen rå skade, support-ekstra, aktive Bond-partnere og
   Lumen/Shards pr. cast eller Motes pr. Luminous kill. Vis varighed/uptime og
   conditions. Pending/Bench har nul earned effekt. Legacy-buff er særskilt
   eksisterende entitlement, ikke automatisk attribution til en aktiv Wisp.
3. Separat "tab ved fjernelse" holder de øvrige levels/køb faste. Den omfatter
   mistede Bonds og ressourceeffekter. Den må aldrig summeres, vises som
   100%-fordeling eller lægges oven på skade-totalen. Bond-interaktioner allokeres
   i fast rækkefølge i sumregnskabet; marginalvisningen bevarer fuld interaktion.
4. Ressourcer vises i egne enheder. Ingen opdigtet Lumen/Shards/Motes→DPS-kurs.
   Sidste heltalsafrunding ligger i den autoritative reward-funktion.

Forslaget ændrer ikke Bonds, support-stacking, priser eller saves. Der er
endnu ikke kodet produkt-UI; dette er en konkret, reviewbar modelkontrakt.

## Varig grund til at vælge tidlige damage-Wisps — design der mangler

Observation: Empower-prisen vokser eksponentielt (1,13 pr. level), mens
level-power kun vokser kvadratisk. Billige tidlige Wisps får flere levels
for samme budget, men det opvejer ikke den sene basePower-forskel. At vise
Ember/Stone som Bond-partner løser synlighed, men opfylder ikke i sig selv
kravet om en varig selvstændig damage-rolle. Rå DPS-lighed er ikke målet.

Anbefalet designretning til Lead: en positiv, afledt mastery-komponent for
tidlige damage-Wisps knyttet til allerede købte Empower-milestones, med
effektvækst kalibreret mod den eksisterende investeringskurve. Burst og
Breaker beholder forskellige roller. Ingen ny currency eller Bond er
foreslået i dette feature-scope. Den nuværende power er en bevaret basis;
ownership/levels slettes eller nedskrives ikke. Det er et forslag, ikke
en bindende gameplayregel eller en implementeret bonus.

Lead skal konkret beslutte før balancekode:

| Beslutning | Konkret åbent valg / nødvendigt bevis |
| --- | --- |
| Rolle og målgruppe | Hvilke tidlige damage-Wisps skal have selvstændig Push/Boss-niche ud over deres eksisterende Bonds? |
| Mastery-formel | Start-milestone, vækstfunktion og størrelse pr. kvalificerende level; dokumentér hvor i passive/ability/Tap den virker. Ingen tal er gættet. |
| Acceptvinduer | Maksimal Titan-afhængighed pr. fase/kontekst, minimal nyttig marginalværdi, TTK, upgrade-wait og Ascend/time. Ingen universel DPS-lighed eller ét hold der vinder alt. |
| Investeringsmodel | Lige slotbudget og optimal/realistisk allocation som separate følsomhedskontroller; separat budgetvektor for permanente currencies. |
| Support/Swift | F18-varighed/uptime og F19-cap/mincycle på fælles baseline; cap alene løser ikke Ultimate-uptime. Ingen ændring af de andre features her. |
| Gamle køb/data | Konkrete før/efter-effekter for alle gamle levels; hvis devaluerede effekter/ny state kræves: værdibevarelse og idempotent canonical/recovery/backup-migration med Core-review. |

Efter disse valg måles en lokal produktkandidat mod samme baseline og
faktiske powered mid-/late-game-saves. Generelle bonusser eller nye Bonds
indføres ikke som skjult erstatning for det manglende design.

## Dependencies og acceptkriterier

- PR46/B2-kandidataccept og dokumenteret writer-handover før produkt-/remote
  arbejde. F20/F21 følger den gemte prioritering før senere tuning.
- F14 preset-isolation/Ascend-rebuild afklares før udvidede F15 Bonds.
  F17 deler ingen writer eller filer i en anden chats checkout.
- F18/F19 support/Swift og F15-effekter genmåles, hvis relevante bytes ændres.
- F25–29 progression/currency-identitet kan ændre balancebaseline; globale
  pacingtal fastlægges efter de relevante beslutninger.
- Faktiske powered mid-/late-game-saves og konkrete numeric designvinduer mangler.

Produktaccept skal omfatte: additiv conservation, ingen muterende renders,
pending/bench-zero, source-aware buff/expiry, alle Bond-contexts, rounded
resourceværdi, equal-budget og faktiske hold; relevante handler/bulk/queue-
grænser og chronology/live/offline; reload/recovery/backup og gammel ownership.
Hvis UI implementeres: 320/390/430px, stor tekst, mindst 44px kontroller,
tastaturfokus, kontrast og reduced-motion. WebView 60, package/signing og
deterministiske Motes-rewards skal bevises på integreret appkandidat.

## Checks, fund og præcise begrænsninger

- Eksisterende `check_context.py`: PASS på lokalt udgangspunkt (21 entrypoints,
  22 lokale links). Nye værktøjer i denne levering er JavaScript.
- Eksisterende original `formula_probe.cjs`: PASS; output er deepEqual med
  arkiveret formula_probe_results.json, inklusive charge/uptime.
- Ny måler: PASS på additiv damage/Bond-conservation, read-purity,
  backup-decode, pending-zero og to negative double-count-kontroller.
  Forkert summering af removal-deltas bliver 173,72% i Farm-eksemplet.
- **Samlet måler exit 1**: 16 Farm whole/split-kontroller bevarer motor-
  exceptions på main. Save-clockens whole 60s afsluttes, mens split 10s
  staller ved windowEnd-rest; aligned-control staller ved farmGrid. Ingen
  ændrede tolerancer eller bortfiltrerede failures. Den præcise nye B2-index
  har også failures i [b2-results.json](../qa/wisp-roles-001/b2-results.json).
  Det er scoped VM-evidens, ikke et færdigt uafhængigt B2-review eller Androidfund.
- Forsøgte eksisterende browserchecks: upgrade-effects-and-deeds,
  support-stacking, buff-timing, support-backup-restore, support-recovery og
  p2-07a-chronology. Standard-sandbox blokerer lokal serversocket. Support-
  stacking med ekstra adgang og escalation giver 25s timeout/ingen færdig
  QA-payload. Raw logs er gemt; de er **miljøblokerede/ikke accepteret**,
  ikke et bevis for en gameplay-assertionfejl. Fysisk Android/TalkBack utestet.
- Produkt-, tests-, workflow-, mobile- og signingbytes er uændrede.
  Kun egen task og lokale analyse/evidensfiler er kandidatens ændringer.

## Checkpoint og næste handling

Lokal kandidat og telefonvenlig TXT/ZIP forberedes i denne checkout. Lokal
commit og manifest leveres med pakken; ingen remote commit eller PR er
oprettet. GitHub-checkpoint af task/resultater er udestående og kræver
koordineret writer-slot. Før det: live main/branches/åbne PR'er/aktive runs
og writer genkontrolleres efter workflow-triggere.

Næste Lead-handling: gennemse rapport, behold de nye chronology-reproducers
som B2/reviewdependency, færdiggør PR46/B2-review/handover, tildel dokumentations-
checkpoint for denne feature, og registrér ovenstående rolle-/balancevalg.
Derefter forbereder denne ejerchat den afgrænsede produktkandidat og checks.

Færdig først efter koordineret integration, relevante checks på integrations-
commit, nødvendig APK/deviceaccept, gemt PROJECT_STATE/task/evidens og writer-
frigivelse. **Ingen integration, APK/release, writer-frigivelse eller arkivering
er udført.** Denne ejerchat holdes åben efter FEATURE_WORKFLOW.

## Latest live-main receipt — supersedes current-status claims above

During this analysis, PR51 merged to main at
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` (observed merged via GitHub).
PR46 remains open/Draft on the same R2. PROJECT_STATE on that new commit still
describes PR51 as Draft; the observed merge and code take precedence. No
Android release/device acceptance for PR51 or WISP_ROLES_001 is inferred.

Current AGENTS/bootstrap/state/CODEX_START were reread. Active tooling now
uses Node.js, and the shared communication rule is English. The earlier Danish
analysis is retained as the initial checkpoint; this continuation uses English.
No new rule was introduced by WISP_ROLES_001.

A separate read-only review export is in
`/workspace/Lumenfall-WISP_ROLES_001-live-review`. Forty imported source/tooling
files were individually checked against their GitHub blob IDs. This is a
verified source export over the initial local Git history, not a claim that
its local HEAD equals the new main. Original feature checkout remains isolated.

Latest product index blob: `90e4678cb28fa833fdacbc01d1744d9465f6a356`.
SHA256: `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
[Latest-main measurements](../qa/wisp-roles-001/latest-main-results.json)
repeat the complete analysis against these exact bytes. All 1,008 equal-budget
outputs and the 24 individual-Wisp outputs deepEqual the initial baseline.
All 12 Boss kill times also match. Thus the role/balance findings remain valid
on this integrated main, subject to the same generated-team limitations.

Latest Farm whole/split results: **8/16 pass**. The eight saved-fractional-clock
cases now complete and agree. The eight aligned-clock cases still stall at
farmGrid around 6s with a tiny positive residual. The aggregate analysis
therefore correctly exits 1. Initial-main and frozen-B2 failures are preserved
in separate files and are not presented as the current-main result.

Current `node scripts/codex/check_context.cjs`: PASS (21 entrypoints,
23 local Markdown links, startup 17,805 bytes) in the verified source export.
Current Node browser support-stacking was attempted with the existing harness;
Chromium still produced no completed QA result. A diagnostic single-process
launch also timed out and was stopped; its launcher/configuration and raw
process evidence are recorded. No browser acceptance is claimed.

Writer/handover and missing design decisions remain unresolved. Local GitHub
publication is still held for the coordinated writer checkpoint required by
this task. The next implementation must use current main plus the accepted
support/Swift/Bond dependencies; do not replay a product patch from the old
baseline. Only analysis/task files are in this local feature candidate.
