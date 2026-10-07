# Lumenfall — fortsæt fra en ny ChatGPT-konto

Projektet skal kunne fortsættes fra `karahaNx/Lumenfall` uden den gamle
ChatGPT-konto. Kode, regler, opgaver, beslutninger, status og nødvendige
originaler/beviser gemmes løbende i GitHub. Det er en arbejdsregel; repositoryet
kan ikke genskabe chatbeskeder eller filer, der aldrig blev gemt der.

## Sådan starter du igen

1. Behold adgang til din GitHub-konto/repositoryet uafhængigt af ChatGPT.
   Repositoryet er offentligt ved dette checkpoint, men skrivning kræver
   GitHub-adgang. Hvis GitHub-kontoen også mistes, kræves en uafhængig backup
   og adgang til et repository, du kan skrive til.
2. Opret den nye ChatGPT-konto og forbind GitHub igen med adgang til Lumenfall.
   Åbn projektet på `main`, eller klon det til et nyt checkout. Forbindelser,
   Codex-miljøer, Memory og gamle chats følger ikke automatisk med.
3. Brug startprompten nedenfor. Læs aktuelle regler og status fra GitHub;
   kontrollér live branches, PR'er og relevante releases i stedet for at antage,
   at gamle checkpoints stadig er aktuelle.
4. Opsæt miljøet efter [CODEX_START.md](CODEX_START.md), og kør
   `node scripts/codex/check_context.cjs` fra repository-roden.
5. Vælg én feature og start dens ejerchat. Fortsæt fra opgavedokumentets
   næste handling og eksisterende acceptbeviser. Gentag ikke allerede
   implementeret arbejde, og promover ikke arkiverede kandidater til produktet.

## Startprompt til den nye konto

```text
Fortsæt Lumenfall fra GitHub-repositoryet karahaNx/Lumenfall, branch main.
Læs AGENTS.md og PROJECT_BOOTSTRAP.txt, kun egen række i docs/CHAT_OWNERSHIP.md,
egen rollefil og docs/PROJECT_STATE.md. Uden anden rolletildeling: Lead.
Use JavaScript/Node.js for active tools; keep archived originals unchanged.
Følg docs/project/CODEX_START.md; kør node scripts/codex/check_context.cjs.
Kontrollér live main, åbne PR'er, relevante releases og skriveejerskab.
Læs docs/project/FEATURE_WORKFLOW.md. Én feature pr. ejerchat; arkivér efter
verificeret integration, gemt status og writer-frigivelse. Fortæl mig, når
en ny regel er nødvendig. Gem krav, beslutninger og testbeviser løbende i GitHub.
Brug docs/CONTEXT_INDEX.md til målrettet opslag. Læs ikke hele arkivet.
Brug ikke subagenter/beskedværktøjer. Communicate in English.
Min konkrete feature/opgave: [indsæt ét mål eller en sti i docs/tasks/].
```

Filen `PROJECT_INSTRUCTIONS.txt` kan også bruges til nye projektinstruktioner.
AGENTS.md skal efterspørges eksplicit ved adgang alene gennem GitHub-værktøjer.

## Backup uden for ChatGPT

En ny ChatGPT-konto med fortsat GitHub-adgang er den normale genstart. Behold
også en kopi på en enhed eller lagring, du selv kontrollerer, hvis du ønsker
beskyttelse mod tab af selve repositoryet:

```bash
git clone --mirror https://github.com/karahaNx/Lumenfall.git Lumenfall-backup.git
git -C Lumenfall-backup.git bundle create ../Lumenfall-backup.bundle --all
git -C Lumenfall-backup.git bundle verify ../Lumenfall-backup.bundle
git clone Lumenfall-backup.bundle Lumenfall-restored
git -C Lumenfall-restored switch main
```

Gentag backup efter vigtige integrationer. Et mirror/bundle bevarer de Git-refs,
det faktisk hentede; det indeholder ikke automatisk releases, Actions-artifacts,
issues, secrets, miljøkonfiguration eller eventuelle LFS-objekter. Gem nødvendig
featureevidens i repositoryet før arkivering. En kilde-ZIP bevarer et snapshot;
en mirror/bundle bevarer også den hentede Git-historik og branches.

Den eksisterende Android-signeringsnøgle skal have en særskilt beskyttet backup
uden for den normale build/release-vej. Den må ikke gemmes i Git, en almindelig
kilde-ZIP eller chatten. Se [README.md](../../README.md) og det gældende workflow.
Repositoryet beviser ikke, at denne backup findes. En ny nøgle kan ikke erstatte
den gamle uden at bryde opdateringer af installerede builds.

Spillerens save er separat fra projektkoden. Gem et save code fra appens
Settings → Save Backup, hvis også spilfremskridt skal gendannes på en ny enhed.

## Kontrol af fortsættelighed

Et friskt checkout skal kunne læse regler, status, aktuel opgave og originale
krav og bestå context-check uden gammel chat/Library. Ved historiske kandidater
bruges de hashkontrollerede restore-scripts i CODEX_START. Rapportér manglende
originaler konkret; [CONTEXT_INDEX.md](../CONTEXT_INDEX.md) skelner mellem
repo-bevarede kilder og ældre eksterne pakker. Git-restorekontrol beviser
genfinding af gemte bytes, ikke login fra en anden konto eller fuld chathistorik.
