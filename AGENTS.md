# Lumenfall — fælles agentregler

Repository: `karahaNx/Lumenfall`. Læs denne korte indgang ved hver ny opgave.
Codex med et lokalt checkout bruger denne rodindgang. Ved adgang alene gennem
GitHub-værktøjer skal opstartsprompten eksplicit bede om filen.

## Opstart
1. Læs `PROJECT_BOOTSTRAP.txt`. Uden tildelt rolle starter en ny projektchat
   som Lead / Architecture; det tildeler ingen produkt-writer.
2. Læs kun egen række i `docs/CHAT_OWNERSHIP.md`, egen rollefil og
   `docs/PROJECT_STATE.md`. Følg brugerens konkrete opgave.
3. Brug `docs/project/CODEX_START.md` til miljø/checks og `docs/CONTEXT_INDEX.md`
   til kilder efter behov. Kør `node scripts/codex/check_context.cjs`.
4. Verificér relevant live baseline før beslutninger og alle branches, åbne PR'er,
   aktive runs samt skriveejerskab før remote skrivning. SHA'er er checkpoints.

Produktet ligger i root `index.html`, `tests/behavioral/` og `mobile/`.
Use JavaScript/Node.js 20+ for active tooling, per the user's 7 October 2026
preference. Archived Python originals remain evidence and retain their hashes.
`docs/recovery/`, `docs/handoffs/` og `archive/` er versionsmærkede kilder;
kopier af kode, AGENTS og mandater dér er historiske reviewdata. Nyeste B2-
kandidat kan genskabes fra `docs/handoffs/02_08/2026-10-07/` via
`scripts/recovery/restore_candidate.cjs`; den er endnu ikke produktaccept.
Læs ikke alle arkiver eller alle rollefiler ved opstart.

## Kilder og mandat
- Brugerens aktuelle instruktion og aktuelle Lead-mandat bestemmer tilladelser.
- Live GitHub og kode på det relevante commit beviser implementeret adfærd;
  en opgavefil beviser ønsket adfærd. Hold de to adskilt.
- Notér tidspunkt, commit, kilde og status: observeret, rapporteret, accepteret,
  antagelse eller ukendt. Afklar kun konflikter, der påvirker handlingen.
- Historiske audits/roadmaps giver ikke nye arbejdsordrer. Manglende evidens
  må ikke rekonstrueres som fakta.

## Spilregler
- Lumenfall er et Android idle RPG med Wisps i Rift. Produktet distribueres
  som APK; HTML/JavaScript kører i appens WebView.
- Progression og køb er deterministiske med synlige priser/effekter. Bevar
  kontrakten uden loot boxes/gacha og de faste Luminous Motes-belønninger.
- Bevar kronologisk simulation, online/offline-parity, automation og save/
  recovery. Kendte fejl står i `docs/project/KNOWN_ISSUES.md`; et krav om parity
  er ikke bevis for, at alle nuværende forløb består.
- Bevar mobiltilgængelighed, WebView 60-baseline, package `com.lumenfall.app`
  og den eksisterende Android-signering. Konkrete mekanikker, caps, balance
  og migrationer følger accepterede krav og kode på verificeret commit.
Detaljer findes via `docs/CONTEXT_INDEX.md`; kandidater og historiske mandater
må ikke præsenteres som implementerede spilregler.

## Nye eller ændrede regler
Fortæl brugeren, når en ny regel er nødvendig, før den anvendes som bindende
regel: angiv den konkrete tekst, hvorfor den behøves, og hvilken adfærd eller
arbejdsgang den påvirker. Gem brugerens beslutning og begrundelsen i GitHub,
opdatér denne fil og berørte krav i samme scope, og nævn regelændringen ved
levering. Opfind ikke gameplaybeslutninger; afklar dem, hvis de mangler.
Brugerens aktuelle instruktioner har forrang, og stående godkendelse gælder
fortsat nødvendige handlinger i bestilt scope.

## Én chat, én feature
Hver ny feature har én ejerchat med ét konkret mål og et opgavedokument i
`docs/tasks/`. Hold nødvendige fixes, tests og dokumentation i samme feature;
andre features får hver sin nye chat. Roller er ekspertise, ikke permanente
featurechats. Opret kun nye chats, når brugeren beder om det.
Følg [featureworkflowet](docs/project/FEATURE_WORKFLOW.md): færdig betyder
implementeret, verificeret på den integrerede version og gemt i GitHub.
En lokal kandidat eller åben PR afslutter ikke featuren. Arkivér ejerchatten
efter verificeret afslutning, gemt status og writer-frigivelse; rapportér det,
hvis arkivværktøjet mangler. Blokeret/ukendt arbejde forbliver åbent.

## Fortsættelse uafhængigt af ChatGPT-konto
GitHub er den varige kilde til kode, regler, krav, beslutninger, checkpoints,
testbeviser og næste handling. Gem nye kritiske oplysninger løbende og før
arkivering; chat, Memory, Library og cloudmiljø må ikke være eneste kopi.
Følg [kontoskiftguiden](docs/project/ACCOUNT_RECOVERY.md) ved ny konto.
En ny ChatGPT-konto kræver fortsat adgang til GitHub og et nyt miljøsetup;
gamle chats og forbindelser følger ikke automatisk med.

## Samarbejde
Én repo-writer ad gangen. Lead tildeler scope og frigivelse; en grøn CI eller
oprettet Draft PR frigiver ikke automatisk writer. Andre roller må undersøge
read-only og forberede lokale forslag. Brugeren overfører selv opgavefiler;
brug ikke beskedværktøjer eller subagenter. Omdøb ingen chats.
Brugerens stående godkendelse fra 2026-10-05 ("Du har altid godkendelse.")
gælder nødvendige handlinger i det aftalte Lumenfall-scope. Lead behøver ikke
bede om gentagen godkendelse til sådanne handlinger. Scope, writer, aktuelle
baselines og workflow-triggere skal stadig kontrolleres. Nye arbejdsområder
fastlægges gennem brugerens opgave eller et konkret Lead-mandat.

Merge, Android-build, dispatch/rerun, release, signing og cleanup skal ligge
inden for det aktuelle scope og den gældende godkendelse. En rent afgrænset
dokumentationsopgave udvider ikke produkt-/release-scope. Læs workflow-triggere
før en remote handling.

## Kontekst og checkpoint
Hold regler, egen rolle, kort status og aktuel opgave i startkonteksten.
Læs relevante kodeafsnit og originalkrav fuldt før arbejde på dem. Udtrækning,
filoversigt og hashkontrol kan ske uden at udskrive hele arkivet til modellen.
Historik, gamle ZIP'er, audits og fulde logs hentes efter behov og bevares som
kilder. Nye handoffs må ikke instruere i at læse hele ZIP'en ved opstart.
Gem kritiske krav, rettelser, beslutninger og fremdrift ved milepæle; brug
`docs/HANDOFF_TEMPLATE.md` ved overdragelse. Et resumé erstatter ikke originalen.

## Levering og kontrol
Bevar save/recovery, chronology, offline-parity, mobiltilgængelighed og signing
inden for opgavens scope. Kør relevante eksisterende checks; tekniske gates
findes i `.github/workflows/pre-merge-validation.yml`. Oplys begrænsninger.
Communicate in English. State the model and available effort setting honestly for each new task. Lever filer,
så brugeren kan hente TXT og ZIP på telefonen uden manuel samling.
