# Lumenfall — aktuel projektstatus

Snapshot: 2026-10-05T19:32:23.429865+00:00. Repository: `karahaNx/Lumenfall`.
Produktcommit: `d32c0043b73d8ddc9f7600022c4f7a133899652e`; tree
`8c07e411458cad5e39b27e8b577910ce20aa0d0e`. `android-latest` peger på produktet.
SHA'er er checkpoints; kontrollér live før handling. Originalkrav og receipts
hentes via CONTEXT_INDEX; dette er kort status.

## Afsluttet produkt og review
Android-only idle RPG med Capacitor/WebView. P0/P1, region-/bossfeedback,
Formation reconstruction, Forge/Lab-separation, Forge v1 og PR36–41 er integreret.
Measured Inquiry er udgivet siden0.1.132; context setup er integreret via PR42/43.

| Opgave | Status |
| --- | --- |
| NAV-001 | PR44 merged: fem bunddestinationer, Workshop Forge/Lab, fast hævet Rift, stille valutamangel med action/pris bevaret. Se `tasks/NAV_001.md`. |
| Core/QA/Lead | Scoped ACCEPT på `5be2c0319b9ce11fd8a29f0bb795d7de606858ae`. Merge-tree matcher præcist kandidaten. Core36 scenarier+162 egne assertions; QA130 scenarier/148 browser-/driverresultater+12 negatives+367 native+564 egne checks+6 mutationer. |
| LAB-MOTES-001 | Lokalt forslag; ingen produktimplementation/writer/PR. Næste scope planlægges mod korrekt live base efter NAV. |

Lead: **00_11**. Core:**01_06**. Gameplay:**02_07**. Visuals:**03_05**. QA:**04_05**.
Efter dette docs-checkpoint er00_11s integrationswriter frigivet; ingen næste
writer tildelt. 03_05 meldte frigivelse; Core/QA meldte read-only stop.
Brugerens stående godkendelse5. oktober2026 gælder nødvendige handlinger i
det aftalte scope uden gentagen forespørgsel; se AGENTS og integrationsbeslutningen.

## Accepteret Android
**0.1.133**, package `com.lumenfall.app`, run `37363152517`, attempt1/success,
produkt-head ovenfor; alle27 jobtrin success. Release `396102072`, asset
`613482246`,6832416 bytes. SHA256
`1d508a80233001ded14791aa6dd0d49c65615753b28072c4acd8b36c71e74581`.
Final APK-identitet/signatur bestod både CI og lokal repo-verifier. Alle15
indlejrede index/font/branding-filer matcher kandidaten; GitHub-digest og CRC består.
Fysisk Android/TalkBack/install er ikke udført. Ingen manuel dispatch/rerun
eller signingændring. Det eksisterende workflows normale cleanup/publicering fulgte runnen.
Receipts: `decisions/2026-10-05-nav001-integration-release.txt`.

## Bevarede beslutninger og næste handling
Measured Inquiry: unlock60, cap10,2% mindre work pr. completed level, max20%,
kun nye betalte legacy8-starter. Aktive snapshots/rå levels og schema1 bevares;
ingen selvdiscount/legacy-capnerf eller lovet sikker downgrade.
Opening Focus parkeret; flere Forge-upgrades ønskes senere. A40/crDroid er
udgået af aktiv backlog/fremtidige acceptkrav; originals bevares. P2-04/native
og P2-05/release-hardening deferred. Signing-diagnosebranch131 bevares;
Run131 attempt1-rootcause ukendt. Find-P3 separat/nonblocking; Farm recommended
kræver brugerens ønskede adfærd præciseret.
Testværksted0.2:52 lokale prototypechecks;7 manuelle punkter ikke accepteret.
De52 checks er ikke NAV-/Android-accept. Server/browserstatus fra tidligere
chat er ikke genmålt. Næste Lead-scope: planlæg LAB-MOTES via originale krav
og korrekt live base; ingen bred historisk audit eller automatisk genstart af færdige opgaver.

## Tillæg 2026-10-07 — save/offline-diagnose arkiveret

Denne chats diagnosearbejde er lagt på main efter brugerens direkte mandat.
Se `qa/offline-autoascend-2026-10-07/START_DIAGNOSE.txt` via CONTEXT_INDEX.
Offline Auto-Ascend eventlimit-fejl er reproduceret på ovenstående main-base;
ingen rettelse eller fysisk APK-test. Kun dokumentations-/evidenswriter i
denne handling; frigivet efter upload. Ældre rolletildelinger/status ovenfor
er historiske og skal verificeres mod nyere Lead-handoffs.
Live kontrol før upload: PR46 er Draft på `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`;
nyere arkiver findes på `00/recovery-project-2026-10-07`,
`01/core-archive-2026-10-07` og `02/gameplay-archive-2026-10-07`.
De er ikke integreret/acceptet af denne upload. Ingen aktive runs blandt seneste fem.
