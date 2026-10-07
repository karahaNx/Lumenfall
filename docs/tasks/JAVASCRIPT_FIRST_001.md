# JAVASCRIPT-FIRST-001 — JavaScript som projektstandard

Dato: 7. oktober 2026. Rolle/writer: Lead, kun dette dokumentationsscope.
Ejerchat: den aktuelle Codex-chat for JAVASCRIPT-FIRST-001.
Baseline: main `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
Brugerens aktuelle instruktion tildeler scope; stående godkendelse gælder.

## Originalkrav og mål

> Everything in this project should use javascript if it can for testing and so on. HTML is still fine.

Gem JavaScript som projektets standard for kode, tests, testkørsel, CI-logik
og hjælpescripts, hvor teknisk muligt. HTML er fortsat tilladt. Reglen skal
kunne genfindes ved en ny chat eller konto. Den konkrete regel er meldt til
brugeren før anvendelse.

## Scope og acceptkriterier

1. AGENTS, bootstrap, projektinstruktioner, README og CODEX_START beskriver
   samme JavaScript-regel. Nye scripts bruger JavaScript/Node.js.
2. Beslutningen bevarer originalkravet og skelner mellem reglen og den endnu
   ikke udførte omlægning af eksisterende aktive værktøjer. De erstattes med
   verificeret adfærd og testdækning i relevant scope.
3. Produkt, tests, workflows, mobile, signing og historiske originaler har
   ingen byteændringer i denne dokumentationslevering. WebView 60 bevares.
4. Dokumentations-/linkkontrol består på kandidaten og integrationen; reglen
   gemmes i GitHub via PR og main. Ingen APK/devicegate er relevant her.

## Status, kontrol og afslutning

Branch: `docs/javascript-first-2026-10-07`. PR-titel:
`docs: make JavaScript the project default`.
Status og afslutning aflæses i PR'ens live merged-status og receipt nedenfor;
før succesfuld main-integration er leveringen en dokumentationskandidat.
Live preflight 7. oktober kl. 14:31 CEST: main matcher baseline;
kun PR46 er open/Draft på R2
`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`; ingen aktive runs blandt de ti
seneste observerede runs. Seneste docs-writer er frigivet efter PR49;
øvrige produkt-writerforhold ændres ikke af dette scope.

PR-beskrivelsen bliver afsluttende receipt for integrationscommit, CI-run,
kontrol på den integrerede version, docs-writer-frigivelse og arkivstatus.
Aktuel PR/HEAD/merge-status læses live. Arkivér først efter verificeret
integration og gemt afslutningsreceipt. En åben PR afslutter ikke opgaven.

Kandidatkontrol:
- JavaScript-dokumentkontrol: PASS; 8 dokumenter, 19 relative links, UTF-8
  og lukkede code fences.
- `git diff --check`: PASS; kun de otte forventede dokumenter er ændret/tilføjet.
- Eksisterende `check_context.py --archives`: PASS; 21 entrypoints, 24 lokale
  links, Lead-opstart 16.308 bytes, 1.509 arkiv-/coveragechecks og 96 B2-kilder
  på oprindeligt tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`.
- Direkte sammenligning med baseline: produkt-, test-, workflow-, script-,
  mobile-, font-, branding- og arkivstier er byteidentiske.
- Dokumentationsscope kræver ingen APK/deviceaccept. Eksisterende Python-gates
  er kontrolleret som overgangsværktøjer; ingen ny Python-kode er skrevet.

Næste handling: kontroller dokumenter og bevarede bytes, gem kandidaten i
GitHub, afvent krævet CI, integrér og verificér main. En bred værktøjsmigrering
er et særskilt konkret scope, hvis brugeren bestiller den nu.
