# RIFT_COSMETICS_001 — synlige Deed-cosmetics på Rift

Status: **lokal kandidat / afventer koordineret writer-checkpoint og integration**.
Dette dokument og kandidaten er et lokalt forslag. Ingen produktaccept,
GitHub-publicering, PR, APK eller arkivering er udført for denne feature.

## Ét mål og originalkrav

F24: Gør hvert eksisterende optjent og valgt Deed-cosmetic synligt på Rift.
Bevar HP-læsbarhed, Guardian Tap, mindst 44px kontroller, fokus, kontrast og
et synligt reduced-motion-alternativ. Unlocked og selected er særskilte tilstande.

Originalen siger: “Når det kommer til deeds cosmetics, så synes jeg ikke de
effekter man låser op er synlige ved rift skærmen.” Den har forrang for forslag.

Autoritative kilder, læst 7. oktober 2026:

- `../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt` (fuld original).
- `../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`: F07, F24, F27, mandat/dependencies, save-overgang og verifikation.
- `../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt`.
- Feedbackens `EVIDENCE/FINDINGS.txt` og `Source_Index.txt`; billederne dokumenterer andre F-punkter. Ingen af de fire billeder er cosmetic-evidens.
- Bestillingen til denne ejerchat gemmes i `RIFT_COSMETICS_001_REQUIREMENTS.txt`.

## Ejer, baseline og writer

Ejer: denne RIFT_COSMETICS_001-featurechat, rolle **03 UI / Visuals / Branding**.
Platformens chat-id er ikke eksponeret i den tilgængelige opgavekontekst.
Ingen historisk rollechat er omdøbt eller overtaget.
Anbefalet model/effort: GPT-6.1 Sol / High; faktisk model/effort er ikke
attesteret af tilgængelig kørselsmetadata.

Opstartsbaseline observeret via fetch og GitHub 2026-10-07 kl. 15:11 København:
`b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
Produktets `index.html` er fortsat blob
`ea44431c163569548973d9e489f75345749a07ee`, SHA256
`f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
Produktbaseline/APK ifølge aktuel status: `1ddc246...` / accepteret 0.1.133.
Live AGENTS, bootstrap, egen ownership-række/rolle, PROJECT_STATE,
FEATURE_WORKFLOW, CODEX_START og JavaScript-first-beslutningen er læst.

Privat checkout: `/workspace/RIFT_COSMETICS_001`.
Lokal featurebranch: `feature/rift-cosmetics-001`, startet fra ovenstående main.
Det oprindelige `/workspace/Lumenfall` er ikke produktredigeret.

**Baseline-opdatering:** kl. 15:32:50 København viste ny live fetch main
`0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd` (offline catch-up og Node tooling).
Den private branch blev rebased uden konflikt. Den aktuelle lokale kandidat
bygger på denne main, ikke på den ældre produktbaseline. Ny main-indexblob:
`90e4678cb28fa833fdacbc01d1744d9465f6a356`; SHA256
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.
Aktuelle AGENTS, CODEX_START og ændrede scope/publiceringsbeslutninger blev
genlæst. De tidligere Python-resultater accepterer ikke den rebased kandidat;
aktuelle kontroller bruger Node.js-harnesset. Andre chats' publiceringsmandat
overfører ikke writer til denne feature. Aktuel AGENTS beder om engelsk
kommunikation; denne bestilling og dens originalkrav bevares på dansk.

PR46 kontrolleret live ved opstart: open/Draft, head
`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, endnu ikke merged.
Ny B2: tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; worker-PASS er
rapporteret. Nye scoped Core-/QA-reviews og fysisk Android mangler.
02_08s eget lokale stop er dokumenteret; 02_07s writer-frigivelse er ukendt.

**Writer:** ingen fælles/remote repo-writer tildelt denne chat. Brugerens
bestilling autoriserer privat forberedelse. AGENTS' “Én repo-writer ad gangen”
og Lead-beslutningens kandidat-review/handover først gælder stadig.
Stop: lokal freeze efter checks og handoff. Lead koordinerer checkpoint,
integration og release. Ingen gentagen generel godkendelse er nødvendig.

## Observeret før og foreslået efter

| Cosmetic | Eksisterende unlock | Baseline på Rift | Lokal kandidat på Rift |
| --- | --- | --- | --- |
| Starlight | Indbygget | Regionens standardudseende | Samme regionudseende, synligt temanavn |
| Ember Veil | Reach Rift 50 (`d50`) | Svag orange radial aura | Tydelig stiplet ember-ring og varmt Rift-lys |
| Void Bloom | Ascend 5 times (`asc5`) | Svag violet radial aura | Violet sekskant/facetter og violet lys |
| Aurora Pulse | Raise a Wisp to Mythic (`mythic`) | Enkelt rose-accent, ingen særskilt teal/puls | Rose-teal buer med rolig opacity-puls; statiske buer ved reduced motion |
| Solar Crown | Reach Rift 250 (`d250`) | Svag gylden radial aura | Gylden krone/ray-ring og gyldent lys |
| Radiant | Perfect Synergy (`modulemax`) | Svag conic-gradient, ingen farvecyklus | Seks currencyfarver i en langsom orbit; samme statiske farver ved reduced motion |

Baselinens radial aura bruger `color-mix`; Radiant bruger `conic-gradient`.
Disse CSS-funktioner findes ikke i WebView 60. Senere CSS reducerer også den
gamle auras styrke. Det er en kodeobservation; fysisk rendering er utestet.
Baseline gemmer ikke selection straks; den afhænger af senere autosave.

Kandidaten bruger dekorativ SVG og eksisterende CSS-variabler til landskabslys.
Aura og temanavn ligger absolut inden i den eksisterende Guardian Tap-knap
med `pointer-events:none`. HP, boss-status, enemy-name og Guidance-markup
får ingen nye layoutbokse. Temanavnet har en dækkende mørk baggrund og ligger
nederst i tapområdet, væk fra fjendens navn.

Deeds viser “Unlocked · Select” eller “✓ Selected” med native button og
`aria-pressed`. Valg gemmes straks gennem eksisterende `saveState`, canonical
save og recovery. Render er uden state-mutation. Et kendt, men låst, gammelt
theme-valg vises som Starlight, mens den gemte preference bevares. Dette
giver ingen unlock og sletter ingen data. Ukendte id'er følger eksisterende
normalisering. Ingen pris, reward, cap, gameplaytal eller save-schema ændres.

## Scope og beslutninger

- Kun `index.html`, målrettet JavaScript-browsercheck og feature-dokumentation.
- Alle seks eksisterende themes/unlock-flags bevares. Ingen ny Comet-content.
- SVG-mønstre er et lokalt visuelt implementeringsforslag, ikke nye spilregler.
- Ingen migration/refund er nødvendig: ingen køb, currency eller ownership fjernes.
- WebView 60, package `com.lumenfall.app`, signing og deterministiske køb bevares.
- Luminous Motes-belønninger, simulation, bulk/queue, chronology og offline-policy ændres ikke.
- Nye scripts er JavaScript. Aktuelle Node.js-harness/gates genbruges uden omskrivning af deres assertions eller arkiverede originaler.

## Dependencies og koordinering

1. PR46/B2: nye exact-candidate reviews og dokumenteret writer-handover før
   produkt-/remote-skrivning. Denne feature udvider ikke arithmetic-PR46.
2. F07 Guidance: kosmetiske lag er inde i `enemy-stage`; Guidance-ejeren kan
   placere sin notifikation separat. Integration skal genmåle HP/tap/tema
   med show/hide, lange hints og større tekst. Baseline flytter stadig
   tapområdet ved hide; dette F07-problem er ikke løst af F24.
3. F27 Comet-unlocks: ingen effekter/priser er besluttet her. Senere temaer
   kræver eksplicit unlock-definition, visuel gruppe og reduced-motion-check.
   F24 begynder med eksisterende themes; F27 er et separat mål.
4. Save/recovery-review: scoped review af straks-gemning og fallback for låst
   preference. Gamle ejerflags/købsværdi bevares; intet refund-loop introduceres.

## Acceptkriterier og lokal kontrol

- Hvert af de seks themes har korrekt synlig virkning på normal, boss og Luminous Rift.
- Kun optjente themes kan vælges; unlock vælger ikke automatisk; ét effective selected theme.
- Selected er synlig på Rift og i Deeds; et label alene tæller ikke som kosmetisk effekt.
- Ingen cosmetic flytter/dækker HP eller ændrer tapgeometri. Dekorationer fanger ingen input/fokus.
- 320/390/430px, større tekst, 44px, tastatur/fokus, kontrast og statisk reduced-motion består.
- Valg bevares straks i primary/recovery og efter faktisk reload, recovery og backup restore.
- Render/valg ændrer ikke økonomi, køb, caps eller simuleringsregler.
- Relevante eksisterende checks består på kandidat, og gentages på integreret version.
- Integrationscommit, relevante APK/signing/devicechecks, gemt GitHub-status og writer-frigivelse kræves før afslutning/arkivering.

**Lokal kandidat efter rebase:** index SHA256
`7a3b4c47c2702277982060fff737126df7994f66f6cae2921ae735b7c378f2e6`.
Ingen produktbytes blev ændret efter de nedenstående checks.

| Kontrol | Lokal status på denne kandidat |
| --- | --- |
| `node tests/behavioral/rift-cosmetics.cjs --negative` | PASS, 113 records: 108 mobile state/theme-målinger og fem handler/persistence/input/negative-kontrakter |
| Baseline versus kandidat | 108 sammenligninger; 0 ændringer i tapområde, HP-track, HP-tekst og enemy-name |
| 320×640 / 390×844 / 430×915 | Normal, boss, Luminous; alle seks themes. Reduced motion på alle tre bredder; 130% root font på 320/390 |
| Persistence | Alle seks primary/recovery og backup-code roundtrips; faktisk reload, corrupt-primary recovery og restore-handler/reload med Ember |
| Native input | Enter vælger; fokus bevares ved selection og render; touch gennem aura giver faktisk Guardian Tap damage |
| Kontrast / kontroller | Caption 15.41:1; native theme-buttons mindst 44px, selected/unlocked som tekst og ARIA. Stor tekst passer i knapperne |
| Existing Node scenarios | 9 PASS: upgrade-effects-and-deeds (941 checks), p1-05-control-regressions, p1-05-reduced-motion, rift-status-contract, rift-status-mobile, restore-roundtrip, recovery-from-corrupt-primary, parity-short, chronology-simultaneous-order |
| Negatives | Skjult aura fanges; eksisterende selected-state-negative fejler som forventet |
| Source / syntax / context | Aktuelle Node source/context-gates PASS; begge inline scripts parser ES2017 med Acorn 8.15.0; git diff --check PASS |
| APK identity verifier | Eksisterende Node self-test PASS. Ingen ny APK er bygget eller verificeret |

Rå resultater, komplette relevante logs og før/efter-PNG'er ligger i
`../qa/rift-cosmetics-2026-10-07/`. Browser: Chromium 151.0.7922.173;
Node: 24.19.0. Målrettet ny driver bruger CDP og Node built-ins, og har kun
testinstrumentering i den serverede kopi. Produktionsfilen indeholder ingen
QA-bridge. Målinger pauser intervalsimulation efter rigtig startup; eksisterende
parity/chronology-scenarier tester motoren særskilt.

Miljøbegrænsning: Chromium CLI `--dump-dom --virtual-time-budget` fik timeout
på den første opstartsbaseline. Existing scenario-resultater er kørt med en
JavaScript/CDP-adapter, der venter på det samme harness' faktiske `qa-result`
og returnerer DOM; assertions er uændrede. Den native Rift-mobile-driver kører
direkte mod `/usr/bin/chromium`. Adapter, fejlreceipt og reproduktion bevares;
almindelig CLI-/CI-accept eller en fuld default-suite på denne feature påstås ikke.

Stor tekst på 320×640 viser stadig eksisterende clipping i Rift-regionheaderen,
og Guidance hide flytter stadig tapområdet. Begge findes også på baseline;
de er ikke opstået ved cosmetic-valg og skal koordineres med F07-layoutarbejdet.
HP er læsbar, og overlayet dækker ikke HP/nav/Guardian Tap-kontrollerne.

**Mangler:** scoped Lead/Core/QA-accept, koordineret GitHub-checkpoint,
integration og ny verification på den integrerede feature, APK/package/signing,
fysisk Android/WebView60/TalkBack. Grammar/SVG-kontrol er ikke deviceaccept.
Ingen nye regler eller gameplaytal er indført. Ingen fælles writer er taget
eller frigivet. Eget arbejde freezes lokalt; ejerchatten forbliver åben.

## Næste handling

Afslut lokal check/freeze og aflever TXT/ZIP til brugerens overførsel til Lead.
Lead registrerer et koordineret writer-checkpoint, genkontrollerer live main/
PR46/B2, og aftaler relevant integration efter de eksisterende gates. Derefter
verificeres det konkrete Rift-look på integreret main og relevant APK/device.
Gem status/beviser i GitHub, frigiv writer, og arkivér kun denne ejerchat.
Indtil dette er opfyldt er featuren **uafsluttet**; chatten forbliver åben.
