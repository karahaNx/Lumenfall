# Start Lumenfall i Codex

Start from current `main` or the feature's branch in `karahaNx/Lumenfall`.
Read root `AGENTS.md`, `PROJECT_BOOTSTRAP.txt`, `docs/PROJECT_STATE.md` and
the current feature task. The user assigns scope; one owner chat handles all
affected disciplines under [the feature workflow](FEATURE_WORKFLOW.md).
Use isolated branches/worktrees for concurrent features and coordinate actual
overlap/integration. Technical guidance is optional, with no default Lead role.
Find sources through [CONTEXT_INDEX.md](../CONTEXT_INDEX.md). Record short task
checkpoints before context compaction/handoff; do not load the entire archive.
For a new account, use [ACCOUNT_RECOVERY.md](ACCOUNT_RECOVERY.md).

## Miljø

Webkode/adfærdstests kræver **Node.js 20+**, **Git** og en
Chromium-browser på PATH: `google-chrome`, `google-chrome-stable`, `chromium`
eller `chromium-browser`. Der er ingen root package.json/npm-testkommando.
Brugerens [sprogregel](../decisions/2026-10-07-javascript-first.md) gør
JavaScript/Node.js til standard for nye tests, testkørsel, CI-logik og
hjælpescripts. HTML er fortsat tilladt. The active harness, validation,
CI helpers and recovery tools now use Node.js and need no Python or extra
npm packages. Migration evidence is in
`docs/qa/offline-catchup-001/javascript-tooling/`.

Hvis miljøet understøtter et setup-script, kan det sættes til:

```bash
bash scripts/codex/setup.sh --install-browser --install-mobile
```

Scriptet kontrollerer runtimes, installerer Chrome hvis den mangler på Linux
amd64, og installerer låste mobile-afhængigheder med npm ci. Det bygger eller
publicerer ingen APK. Downloads kræver netadgang under setup. Browserens
kommando skal være tilgængelig i agentfasen; et midlertidigt export i setup
er ikke tilstrækkeligt. Med eksisterende browser og uden native-opgave:

```bash
bash scripts/codex/setup.sh
```

Lokal Android-build kræver desuden JDK17 og Android SDK. Signing/publicering
følger workflowet og opgavens scope/godkendelse. Almindelig repoanalyse/webtests kræver ingen
signingmaterialer eller Android SDK. Repoet kan ikke læse eller bevise dine
eksterne Codex-miljøindstillinger.

## Checks fra repository-roden

```bash
node scripts/codex/check_context.cjs
node scripts/codex/check_context.cjs --archives
node scripts/verify_apk_identity.cjs --self-test
node tests/tooling/run.cjs
```

Ved produktændringer følges relevante eksisterende gates i
`.github/workflows/pre-merge-validation.yml`. Staging og adfærdssuite:

```bash
mkdir -p mobile/www/fonts mobile/www/branding
cp index.html mobile/www/index.html
cp -r fonts/. mobile/www/fonts/
cp -r branding/. mobile/www/branding/
node tests/behavioral/run.cjs --web-root mobile/www
```

Læg ingen arkivkode i mobile/www. Harnesset starter selv sin lokale server/
browser. Negative kontroller i workflowet skal fejle som forventet. Moderne
browser-PASS er ikke WebView60-kompatibilitet eller fysisk Android/TalkBack.

## Fortsæt B2 fra nyeste checkpoint

Læs `docs/handoffs/02_08/2026-10-07/START_HER.txt`, `SUMMARY/identity.json`
og relevante originaler/reproducers. Hele afleveringen med 97 filer er udpakket;
SOURCE er suppleret til alle 96 kildefiler. Den historiske rods AGENTS-fil er
gemt som SOURCE/AGENTS.txt; .gitattributes ligger som GITATTRIBUTES.txt.
Begge gendannes med originale navne af restore-scriptet.

```bash
node scripts/recovery/restore_candidate.cjs /tmp/lumenfall-b2-review --evidence /tmp/lumenfall-b2-evidence
```

Destinationen skal være ny eller tom. Scriptet kontrollerer alle sourcehashes
og det kanoniske Git-tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; det
behøver ingen netadgang eller gammel branch. Reviews kører mod denne separate
kandidat. Rodens main-kode forbliver det udgivne produkt.
`--evidence` gendanner alle originale afleveringspayloads i en separat mappe,
inklusive OWN_RAW.tar.xz, hvis bytes i repoet ligger i hashkontrollerede dele.
Uden flaget gendannes kun de 96 produkt-/test-/docs-kildefiler.

This section applies only to an explicitly assigned B2 task. Verify the restored
candidate and reassess required persistence/runtime/regression checks on its
exact bytes. Historical Core/QA BLOCKED applies to earlier bytes; worker-PASS is
not independent acceptance. Check actual overlapping work before PR46/main
integration; an unknown historical chat release is not a global permission gate.
Do not create review chats/subagents or use message tools without a user request.

## Arkiver og adgangsgrænser

Lead: `docs/recovery/2026-10-07/`. Core-originaler/reproduktion:
`docs/handoffs/01_06/2026-10-07/`. Nyeste Gameplay: `docs/handoffs/02_08/2026-10-07/`.
Original Gameplay-ZIP ligger også i hashkontrollerede dele i `archive/`.
`scripts/recovery/restore_package.cjs` gendanner tidligere logiske Lead-pakker.
Originale bytes, receipts og historiske mandater er uændrede.
Historical Python commands apply only to their frozen snapshots; current tools
use Node.js. The original hash-recorded `restore_package.py` remains under
`docs/recovery/2026-10-07/publication_originals/scripts/recovery/`.

Tilgængeligt materiale fra de tre arkivgrene kan nu læses fra main. Det er
ikke et løfte om alle tidligere chatbeskeder eller eksterne filer. Den nye
offline-diagnoses fulde pakke ligger også i `docs/qa/offline-autoascend-2026-10-07/`;
se [KNOWN_ISSUES.md](KNOWN_ISSUES.md). Ældre eksterne originalpakker i
CONTEXT_INDEX hentes kun ved konkret behov.

Officiel vejledning: [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
og [Codex Cloud-miljøer](https://learn.chatgpt.com/docs/environments/cloud-environment).
Et repository-script bliver først automatisk setup, når miljøet indstilles
til at køre det.
