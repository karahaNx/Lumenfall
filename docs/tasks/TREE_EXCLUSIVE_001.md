# TREE_EXCLUSIVE_001 — Eksklusive Ascension Tree-upgrades

Status: **lokalt inventar og designforslag; produktimplementation afventer**.
Ejerchat: denne featurechat, `TREE_EXCLUSIVE_001`; rolle 02 Gameplay.
Repository: `karahaNx/Lumenfall`. Ingen andre chats er omdøbt eller kontaktet.

**Final baseline update:** live main advanced during preparation. The private
branch was fast-forwarded to `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` before
freezing this proposal. The final-baseline section below takes precedence over
the initial-baseline observations; old evidence remains explicitly versioned.

## Ét mål og mandat

Fjern direkte effektduplikation fra Tree gennem Tree-delen af en fælles aftalt
effekt/currency-matrix. Tree skal have egne prestige-/run-effekter med synlig
pris, effekt, stacking og en idempotent overgang, der bevarer købsværdi.
Den aktuelle bestilling er først at inventere og foreslå; implementation følger
senere efter matrixbeslutning og de eksisterende gates.

Den aktuelle bestilling er bevaret i [USER_REQUEST.txt](TREE_EXCLUSIVE_001/USER_REQUEST.txt).
Originalkravets autoritative fil er
`docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt`:

> Vi har også et andet problem at man har de samme upgrades flere steder, bare
> med en anden currency. Der skal være nogle upgrades der er eksklusive for den
> bestemte currency, at lab har nogle specielle upgrades der tager lidt længere
> tid at få, men bruger bestemt currency, at forge har nogle upgrades ingen andre
> har men koster mere og sværere at unlocke. Det samme med ascension tree, den
> skal have sin helt helt egen eksklusive opgraderinger.

F29's matrix/stacking/save-krav står i `FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`,
linje 235–243 og 275–334 under samme `lead_context`.
`DECISIONS/FEEDBACK_REGISTERED_001.txt` har konkrete Lead-beslutninger og forrang
for TASK-forslag. Originalen har forrang for begge fortolkninger.
`FEEDBACK/EVIDENCE/FINDINGS.txt` og `FEEDBACK/Source_Index.txt` er læst.
De fire indekserede billeder vedrører andre UI-punkter; intet viser en aftalt
ny Tree-effekt, pris eller gameplayværdi.

## Baseline, miljø og writer

Observeret 7. oktober 2026, København; præcise UTC-tidspunkter i evidensfilerne.
Live main er hentet med Git; branch `feature/tree-exclusive-001` er oprettet i
eget worktree `/workspace/Lumenfall-TREE_EXCLUSIVE_001`.
Startcheckout `/workspace/Lumenfall` er bevaret på `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.

| Identitet | Observeret værdi |
| --- | --- |
| Featurebranchens baseline / live main ved opstart | `b2a1f440e8ad9fed34b37551e468224310d2a6f6` |
| Baseline-tree | `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60` |
| Uændret produktbaseline | `1ddc246eb62782a61ec5c486cd5f51ea170bb338` |
| `index.html` Git-blob | `ea44431c163569548973d9e489f75345749a07ee` |
| `index.html` SHA256 | `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4` |
| Live PR46 | open/Draft, R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d` |
| Arkiveret nyere B2 | tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; worker-PASS er rapporteret |
| B2-accept/handover | nye scoped Core-/QA-reviews mangler; 02_07-release er ukendt |
| Seneste accepterede APK ifølge aktuel projektstatus | 0.1.133, `com.lumenfall.app`, run `37363152517` |

Live `AGENTS.md`, bootstrap, egen Gameplay-række/rolle, `PROJECT_STATE.md`,
`FEATURE_WORKFLOW.md`, `CODEX_START.md` og relevante `CONTEXT_INDEX.md`-opslag
er læst. Ny B2's `START_HER.txt` og `SUMMARY/identity.json` er læst for status.
Det er ikke et B2-review, og B2 er ikke gendannet eller ændret.

Writer: kun isoleret lokal forberedelse fra brugerens bestilling. Der er ingen
ny tildeling af remote docs-/produktwriter. Lead koordinerer GitHub-checkpoint,
integration og release efter kandidat-review og dokumenteret handover.
Stående godkendelse gælder; en ny generel godkendelse er ikke nødvendig.
Ingen push, PR, merge, dispatch/rerun, Android-build eller release i dette trin.

Agent: Codex; systemet identificerer GPT-6, men præcis modelvariant og effort
er ikke eksponeret. GPT-6.1 Sol / Ekstra høj er promptens **anbefaling**, ikke
en attestering af kørt model. Ingen subagenter eller beskedværktøjer er brugt.

## Observeret Tree-inventar

Alle syv noder købes med Prisms. Ved gammel level `l` er single-prisen
`ceil(baseCost × growth^l)`; afledte priser nedenfor gælder level 0/1/2.
Der er ingen `levelCap` i nogen af de syv baseline-definitioner.

| ID / navn | Faktisk effekt pr. level | Prisbase / vækst; første tre priser | Overlap / afhængighed |
| --- | --- | --- | --- |
| `starlight` / Starlight Affinity | +10% Lumen per kill | 1 / 1.35; 1, 2, 2 | Forge `focus`, Lab `lumenstudy` |
| `steady` / Steady Hands | +8% tap-skade | 1 / 1.30; 1, 2, 2 | Forge `resolve`, Lab `guardmastery` |
| `echo` / Echoing Rest | +5 procentpoint offline-rate fra 70%; effektivt loft level 6 før Lab | 2 / 1.40; 2, 3, 4 | Lab `riftattune`; F20 cap og save-politik |
| `bonds` / Cheaper Bonds | −3% Wisp-pris; højst 60% rabat ved level 20 | 2 / 1.45; 2, 3, 5 | Ingen direkte Forge-/Lab-dublet; F21 og navneforvirring |
| `swift` / Swift Ascension | +4% Prisms før first/repeat/new-depth-afrunding | 3 / 1.50; 3, 5, 7 | Lab `prismstudy`; F05 Prism-model |
| `momentum` / Eternal Momentum | +6% passiv Wisp-skade og Wisp-delen af tap-base | 5 / 1.55; 5, 8, 13 | Forge `formation`; Lab `wispascend`, `formationstudy`; unlock `asc5` |
| `reserves` / Deep Reserves | +2 offline-timer | 6 / 1.60; 6, 10, 16 | Deeds `offline24`/`offline48`; konflikt med valgt F26; unlock `d100` |

Fem Tree-noder deler effektoperand med Forge/Lab. Forskellig valuta, pris,
vækst eller loft gør ikke effekten eksklusiv. Deep Reserves deler timecap-operand
med Deeds; det overlap ligger uden for den snævre Forge/Lab-gruppering.

Den komplette observerede sammenligning af **7 Tree + 8 Forge + 9 Lab**-upgrades,
med currencies, pris-/arbejdsvækst, caps, unlocks og overlap, står i
[inventory.json](TREE_EXCLUSIVE_001/evidence/inventory.json). Den er genereret
fra præcist verificerede baselinebytes med
`node scripts/analysis/tree-exclusive-inventory.cjs index.html`.
Kortlægningen er en faglig klassifikation; scriptet vælger ikke et fremtidigt design.

### Faktisk stacking og køb

Baselinens kill-Lumen er
`(1 + .10 × starlight) × (1 + .08 × focus) × (1 + .08 × lumenstudy)`.
Tap-faktoren er
`(1 + .08 × steady) × (1 + .10 × resolve) × (1 + .20 × guardmastery)`.
Passive globale faktorer indeholder
`(1 + .05 × formation) × (1 + .05 × formationstudy) × synergyMult()
× (1 + .06 × momentum) × (1 + .15 × wispascend)`.
Disse faktorer påvirker også Wisp-delen af tap-basen, ikke dens konstante 5.
De er ikke generelle ability-skadebonusser.

Offline-rate er `min(1, .70 + .05 × echo) + .10 × riftattune`.
Lab kan aktuelt bringe totalen over 100%; ingen beslutning om at fjerne den
købte effekt følger automatisk af F20's Tree-cap.
Offline-tidsloftet er aktuelt `12 + 12 × offline24 + 24 × offline48 + 2 × reserves`
timer. Den aftalte slutpolitik er højst 12 produktive timer for alle systemer;
den er endnu ikke implementeret og ændrer ikke i sig selv offline-rate.

Prism-faktoren er `(1 + .04 × swift) × (1 + .05 × prismstudy)`.
Full-belønning er `floor(2 × sqrt(clearedRift) × prismMult)` fra clear 15.
Første Ascend får full; repeats får mindst 1 og ellers `floor(.20 × full)`
plus positiv new-depth-difference, med samlet loft full. Små køb kan derfor
give samme heltalsbelønning. F05 bestemmer den endelige Prism-kontrakt;
ingen +1-hack eller automatisk ændring af repeat-reglen er foreslået.

**Ny konkret afklaring til matrixen:** `spiritCost()` anvender `costReduction()`
på både første recruit og alle efterfølgende Empower-køb. `buySpirit()` og
`autoEmpowerTick()` bruger samme pris. Cheaper Bonds er dermed en rabat på
recruit **og Empower**, selv om beskrivelsen/F21 siger recruiting.
Det er observeret kode, ikke en ny accepteret gameplayregel. Ingen senere
tekstændring eller omdesign må i stilhed indsnævre den købte værdi.
Swift Ascension (Tree) og Swift Recovery (`charge`, Forge) er forskellige noder.

`buyNode()` kontrollerer aktuelt kun Prisms, derefter debiterer den og øger raw
level. Achievement-lock findes kun i `renderNodes()`. Direkte handler har
hverken lock- eller effektcap-gate. Tree har aktuelt ingen bulk-/Max-/queue-
køb: de kontroller tilhører Forge/Lab og skal ikke opfindes i denne feature.
Hvis matrixen senere tilføjer dem, skal de dele samme autoritative købsgate.

## Forslag til den fælles matrix — ikke accepteret design

Anbefalet retning: Tree ejer prestigeafkast og regler ved en faktisk Ascend;
nye generiske kill-/tap-/passiv-damage-multipliers tildeles ikke Tree.
De øvrige ejere vælger deres effekter i `UPGRADE_IDENTITY_001`; denne feature
ændrer ikke deres filer eller tildeler dem nye gameplaytal.

| Kandidat | Egen Tree-effekt | Pris / cap / stacking | Matrixafhængighed |
| --- | --- | --- | --- |
| **First Light** (nyt ID vælges efter beslutning) | En synlig Lumen-startreserve efter reset ved en gyldig Ascend. Giver tidligere run-køb, ikke flere Lumen fra hvert kill. | Prisms; beløb, levelcap, pris og unlock afventer beslutning. En engangstildeling i reset-transaktionen; ingen kill-/offline-rate-multiplication. | Økonomi-/pacing-ejer måler time-to-rebuild og Ascend/time. Reserven må ikke belønne load/render/restore eller stable sig oven på forrige runs Lumen. |
| **Ascension Anchor** (nyt ID vælges efter beslutning) | Bevar første recruit af et begrænset, valgt sæt allerede rekrutterede og unlockede Wisps ved næste Ascend. Ekstra Empower-levels følger stadig reset. | Prisms; antal pladser, pris, unlock og evt. levels afventer beslutning. Én rosterprojektion efter reset, ingen separat DPS-multiplier. | Formation-rebuild skal bruge samme autoritative roster; ingen fri genkøbsløkke, Sigils, ability-resource eller buff-uptime. Titan/support-fordelen skal måles. |
| **Echoing Rest** | Tree er eneste nye købskilde til den valgte offline-rate-effekt. | Kendt Tree-effektloft 6 bevares. Anbefaling: behold eksisterende pris/effekt i første korrekthedstrin. Slutstacking afhænger af Lab-overgangen. | Lab `riftattune` skal omformes/fusioneres med bevaret købsværdi af sin ejer, hvis denne retning vælges. Ellers er Tree-effekten fortsat en dublet. |
| **Wisp Pacts** (navneforslag for `bonds`) | Run-økonomi: tydelig rabat på Wisp recruit og Empower som den faktiske baseline. | Kendt effektloft 20, pris mindst 40%. Anbefaling: behold eksisterende pris/effekt. Ingen Formation-Bond-bonus. | F21 skal først afgøre, om teksten præciseres eller mekanikken ændres; indsnævring kræver værdiovergang. |
| **Swift Ascension** | Tree er eneste nye upgrade-kilde til Prism-faktoren. | Eksisterende +4% og pris er baseline, ikke ny balanceaccept. Endeligt cap/pris og afrunding afventer F05/matrix. | Lab `prismstudy` skal omformes/fusioneres med købsværdi bevaret af sin ejer. Aktive betalte Lab-snapshots må ikke reprissættes. |

Forslaget kræver ikke én erstatning pr. gammelt ID. `starlight`, `steady` og
`momentum` foreslås pensioneret som købbare generiske multipliers. `reserves`
foreslås pensioneret som +hours-node. Gamle levels arkiveres og kompenseres
efter valgt værdi-politik; de genbruges ikke automatisk som levels i nye effekter.
Rådamage eller timecap omdøbt til en ny titel opfylder ikke F29.

To nye run-effekter er konkrete valg til Lead; der er **ingen foreslåede
numeriske beløb** uden måling. Udvid ikke scope med en ny valuta, skip-Rifts,
Comet-unlocks, generel formation-editor eller ny global balancekurve.
Prism-multiplication, kostrabat og offline-rate må kun have flere ejere som
en eksplicit, afgrænset legacy-overgang, aldrig som en udokumenteret ny dublet.

### Beslutninger der mangler før produktkode

1. `UPGRADE_IDENTITY_001`: accepteret matrixversion og præcise effekt-ejere;
   vælg First Light/Anchor eller konkrete alternativer.
2. Nye noder: synlig effektfunktion, Prisms-prisfunktion, unlock, levelcap,
   køb-til-run-timing og målbare pacingvinduer. For Anchor: hvilke Wisps,
   allerede rekrutteret-predicate og forholdet til formationRebuild.
3. F05: first/repeat/new-depth, rounding, høje tal og preview=payout.
   Flytning af en Lab-bonus må ikke nulstille `ascendRewardedDepth`.
4. F20/F21: effektgates og værdipolitik for Echo-overlevels og Bonds-overlevels;
   afklar recruit-versus-Empower før teksten kaldes korrekt.
5. F26: fælles 12h-migration og rækkefølge ved `lastSeen`/offline catch-up;
   ingen produktiv study-only hale. Tree omfatter Reserves, ikke Deeds-køb.
6. Lead/Core: kompensationsstrategi, historisk prisgrundlag, høje raw levels,
   fælles schemaovergang og crash-/restore-kontrakt.

## Forslag til værdibevarelse og idempotent overgang

Dette afsnit er et reviewoplæg til Lead/Core, ikke en implementeret migration.
Anbefaling: pensionerede Tree-køb får en deterministisk Prism-kompensation
baseret på en **accepteret, versionsbundet** cost-politik; raw levels bevares.
Echo/Bonds beholder effektlevels til henholdsvis 6/20 og kompenserer accepteret
overskud. En effektmigration til nye noder er et alternativ, men en automatisk
1:1-level-konvertering beviser ikke samme købsværdi.

1. Arkivér originale `nodes` før normalisering, sammen med kildeschema,
   anvendt cost-policy og konverteringskvittering. Fjernes ID'et fra `NODES`,
   dropper den nuværende `normalizeCurrentSave()` ellers levelen. Nye IDs
   må ikke arve ukendt gammel effekt uden en valgt mapping.
2. Brug aldrig nuværende runtime-wallet som grundlag for en gammel backups
   refund. Migration er en ren transformation `M(S)` af den importerede
   snapshot, og `M(M(S)) = M(S)`. Parsing af både primary og recovery må ikke
   have sideeffekter eller hver udbetale samme kompensation.
3. Restore erstatter hele den migrerede snapshot, inklusive wallet, ownership,
   raw-arkiv og kvittering. Den må ikke merge gamle refunds med nuværende
   wallet eller bevare senere køb fra en anden snapshot. Gentagen import af
   samme gamle backup skal give samme state, ikke kumulativ Prisms-minting.
   En marker i den aktuelle save alene løser ikke dette ved gammel restore.
4. Canonical save, recovery, backup-export/import og schema-step bruger samme
   migrator og normalisering. Test crash mellem slot-writes, korrupt primary,
   storage-failure og reload; returnér ikke delvist krediteret runtime-state.
   Skemanummeret koordineres med Core og andre relevante migrationer.
5. Historisk faktisk betaling kan **ikke** bevises alene af raw levels:
   baseline gemmer ingen Tree-prishistorik. Hvis Lead vælger den frosne
   v1-pris som kompensationsgrundlag, skal den kaldes den politik, ikke
   en rekonstruktion af ukendt historisk betalt beløb.
6. En policy baseret på gamle single-priser skal summere
   `C(id,L) = sum(k=0..L-1, ceil(baseCost × growth^k))`.
   For `starlight` level 4 er det 8 Prisms; `ceil(geometricSum)` giver 7.
   Uendelige/unsafe summer og enorme gamle levels kræver et afgrænset,
   værdibevarende Core-design. Ingen unbounded loop, BigInt-runtimekrav,
   tavs clipping, NaN/Infinity eller gættet refund.
7. Migration må ikke nulstille Prism-benchmark, genudbetale Motes/Deeds,
   flytte betalt Lab-work eller genafvikle en gammel offlineperiode.
   Den fælles aftalte chronology/12h-overgang bestemmer hvilket regelsæt
   en gammel uafviklet periode bruger; dette er en blokerende designafhængighed.

En eventuel midlertidig bevarelse af gamle multipliers kræver en eksplicit
legacy-policy med slutpunkt. Det er ikke slutaccept af eksklusive upgrades.
Ingen sikker downgrade til gammel APK er påstået.

## Scope og acceptkriterier

Lokalt nu: Tree-inventar, konkrete effektforslag, cross-system-afhængigheder,
værdiovergang og relevante baselinechecks. Kun eget opgavedokument, analyse-
script og evidens ændres. `index.html`, tests, mobile, signing, workflows,
`AGENTS.md`, originals og fælles statusfiler bevares.

Senere produktaccept kræver alle punkter:

- [ ] Accepteret fælles matrixreferencen med pris/effekt/unlock/cap og stacking.
  Nye Tree-effekter må ikke blot kopiere købbare Forge-/Lab-operander.
- [ ] Handleren afviser ugyldigt ID, låst node, manglende Prisms, effektivt cap
  og ikke-finite priser før debit. UI og eventuelle nye bulk/Max/queues bruger
  samme model; ingen betaling uden effekt og ingen render-/tabmutation.
- [ ] First Light/Anchor, hvis valgt, aktiveres præcist én gang pr. gyldig Ascend,
  aldrig ved purchase mid-run, load, render eller restore. Manual/auto og
  live/offline bruger samme reset-transaktion og deterministiske rækkefølge.
- [ ] Prism-preview=payout: første/repeat/new-depth, cleared-Rift-grænse,
  bonus-thresholds, farm progression, manuelle/automatiske og høje tal.
- [ ] Echo 6/Bonds 20 og legacy-overlevels følger fælles caps/værdipolitik;
  recruit/Empower og formation-rebuild mister ikke udokumenteret købsværdi.
- [ ] F26's fælles højst 12 produktive timer er verificeret ved 0/1/6/12/24h;
  Tree genindfører ikke +hours. Offline-rate testes uafhængigt af tidsloftet.
- [ ] Raw køb bevares; `M(M(S))=M(S)`; canonical/recovery/backup og gentagen
  gammel restore kan ikke skabe kumulativ refund/currency-loop. Aktive Lab-
  snapshots, lastSeen og ikke-afviklet offline-tid følger besluttet chronology.
- [ ] Relevante UI-checks ved 320/390/430px og stor tekst: mindst 44px kontroller,
  fokus, contrast, læsbare pris/effekt/cap og reduced motion. Kontrol af legacy-
  værdi eller næste-run-effekt må ikke kun afhænge af farve.
- [ ] WebView 60, `com.lumenfall.app`, signing, deterministiske køb og faste
  dokumenterede Luminous Motes-belønninger består.
- [ ] Scoped checks/reviews på frosne bytes og derefter integreret main;
  relevant APK/package/signing og nødvendige devicechecks er dokumenteret.
- [ ] GitHub-checkpoint, integration, status/evidens og writer-frigivelse gemt;
  arkivér kun denne ejerchat efter `FEATURE_WORKFLOW.md`.

## Testresultater og begrænsninger

Detaljer: [source-checks.json](TREE_EXCLUSIVE_001/evidence/source-checks.json),
[checks.json](TREE_EXCLUSIVE_001/evidence/checks.json) og rå TXT-output i samme mappe.
Alle spilprober/checks her vedrører uændret `index.html` på den oplyste baseline.

| Kontrol | Resultat / evidensgrænse |
| --- | --- |
| Oprindelig context-check på `b2a1f44` | PASS: 21 entrypoints, 24 lokale Markdown-links |
| Ny read-only Node-inventering og syntakskontrol | 24 upgrades kortlagt, 7 Tree-rækker; ingen produktkode eksekveret af inventaret |
| Eksisterende `formula_probe.cjs` genkørt | Resultat byteidentisk med original JSON; 40 Prism-kombinationer og Echo/Bonds-overcap reproduceret |
| Browserbaseline: upgrade-effects/deeds, Ascend, parity, chronology, restore, recovery | Forsøgt; endnu ingen gyldige QA-resultater i dette miljø. Se logs; ingen PASS påstås |
| Negativ parity-control | Ikke accepteret som fanget: timeout/ingen gyldig QA-record kan ikke tælle som en forventet assertionfejl |
| Ny Tree-adfærd, migration, UI, fysisk Android/WebView60/TalkBack | Ikke implementeret eller accepteret; alle relevante produktchecks står åbne |

Formelproben er isoleret eksekvering med stubs, ikke fuldmotoraccept. Den viser
konkret level6→7 debit på 16 Prisms uden ny Echo-effekt og level20→21 debit på
3376 uden ny Bonds-effekt. Disse er kendte baselineproblemer, ikke rettelser.
Moderne Node/Chromium kan ikke attestere fysisk WebView60-kompatibilitet.
Den oprindelige baseline havde et Python-harness, som blev brugt uændret.
Aktuel main har siden erstattet det med Node.js-værktøjer; se næste afsnit.
Ingen harness-/CI-sprogomlægning er udført af denne featurechat.

## Final live baseline and current-rule update

Observed live main at 15:26 Copenhagen on 7 October 2026:
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, tree
`6e18e8485111a7a5bfa2d5854ed6b9c4735282c2`. Final `index.html` blob:
`90e4678cb28fa833fdacbc01d1744d9465f6a356`; SHA256:
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.

The new main includes an offline catch-up/lifecycle change and Node.js tooling.
Current `AGENTS.md`, bootstrap, project status and `CODEX_START.md` were read.
They now require Node.js tooling and English communication. These are existing
live rules, not new rules proposed by this feature. The earlier Danish proposal
and original request are preserved; this continuation records the new baseline
in English. Current commands use `node scripts/codex/check_context.cjs` and
`node tests/behavioral/run.cjs`.

All four relevant upgrade/shop declarations and 22 Tree/economy/normalization
functions were compared byte-for-byte with the original baseline: all 26 match.
See [live-baseline-update.json](TREE_EXCLUSIVE_001/evidence/live-baseline-update.json).
The complete inventory was regenerated as
[current-inventory.json](TREE_EXCLUSIVE_001/evidence/current-inventory.json).
The original formula probe was rerun on current main and remains byteidentical
to its original results; see
[current-formula-probe.json](TREE_EXCLUSIVE_001/evidence/current-formula-probe.json).
This validates the reported Tree operands, not the changed full engine.

`saveState()` now blocks saving during pending catch-up and treats a successful
primary write as the authoritative endpoint even if recovery subsequently fails.
Offline work uses a detached working state and yields between batches. Future
Tree migration/run-start mutations must respect that transaction and its
cancellation/reset/restore guards. Full chronology and persistence acceptance
must use this newer pipeline; earlier full-engine results do not transfer.
The existing study-only tail still exists: F26's future shared 12h policy is
not inferred from the catch-up fix.

Git history and product bytes show the offline change on main, while its
`PROJECT_STATE.md` still describes PR51 as Draft/pending integration. This is
an observed status discrepancy for Lead; this chat does not rewrite another
feature's status or infer its writer release, APK/device acceptance or B2 accept.
PR46 was reread and remains open/Draft on R2; receipt:
[remote-pr46.json](TREE_EXCLUSIVE_001/evidence/remote-pr46.json).
There is still no Tree writer assignment or accepted shared identity matrix.

Current Node context-check and the read-only inventory succeed. A new attempt
of the existing Node Ascend browser scenario is recorded separately in
[current-ascend-browser.txt](TREE_EXCLUSIVE_001/evidence/current-ascend-browser.txt).
It exits 1 with a 25-second timeout and zero completed QA records; the result
is inconclusive infrastructure evidence. Full available browser subprocess
output/metadata is retained under `evidence/browser-raw-*`; copied `.log`
payloads use `.txt` filenames without changing their contents.
The static Chromium smoke on an empty local page also timed out with empty
stdout, including without sandbox. No browser PASS, expected-negative catch,
new Tree behavior, native Android or migration acceptance is claimed.
The final own-process check finds no running processes from these recorded
browser profiles; see `evidence/own-process-stop.json`. No other chat's
processes or writer ownership were changed.

## Dependencies og næste handling

`UPGRADE_IDENTITY_001` er blokerende designafhængighed. F05 Prism-model,
F20/F21 caps/save-design, F26 fælles 12h-policy og PR46/B2-review/handover er
koordineringsafhængigheder. Forge/Lab/Comet-implementation og global F28-tuning
hører til deres egne featurechats.

Næste konkrete handling: brugeren overfører denne lokale pakke til Lead og
matrix-ejeren. Lead vælger/registrerer matrix, nye pris-/effektparametre og
værdipolitik, afslutter PR46/B2-gaten og tildeler et koordineret writer-checkpoint.
Derefter genkontrolleres live main/branches/åbne PR'er/runs/workflows/writer og
den lokale forslagspatch gemmes i GitHub inden produktimplementation.

Feature-PR: ingen. Integrationscommit: ingen. APK/deviceaccept for denne feature:
mangler. Remote writer er ikke taget; ingen anden writer er frigivet. Denne
chat forbliver åben. En lokal kandidat er ikke en færdig feature.
