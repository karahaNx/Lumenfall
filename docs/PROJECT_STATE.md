# Lumenfall — aktuel projektstatus

Snapshot: 2026-10-05T10:01:28.209Z. Repository: `karahaNx/Lumenfall`.
Produkt/main før dette docs-checkpoint: `635896267023a7e166a6dbbfa1dd745e896fbbf4`;
tree `0e2264f89021e3f4544b47189ee44f74e7d3dfca`. `android-latest` peger på dette produktcommit.
SHA'er er checkpoints; kontrollér live før handling. Dette er kort status,
ikke originalkrav eller en ny writer-/merge-/buildtilladelse.

## Produkt og afsluttet arbejde
Android-only idle RPG med Capacitor/WebView. P0/P1, region-/bossfeedback,
Formation reconstruction, Forge/Lab-separation, Forge v1 og PR36–40 er integreret.
PR42 context setup blev merged først; PR41 Measured Inquiry derefter.
Begge er closed/merged. Measured Inquiry har scoped Core+QA+Lead-accept;
merged produkt-/testbytes matcher den frosne kandidat. AGENTS, egne roller,
kort status, opgavekort og kildeindeks er nu på main.

| Opgave | Status |
| --- | --- |
| LAB-001 Measured Inquiry | Afsluttet, integreret og udgivet i 0.1.132. Originalkrav: `tasks/MEASURED_INQUIRY_001_REQUIREMENTS.txt`. |
| CTX-001 context setup | Afsluttet via PR42; aktuelle opgavekort og denne status ajourført efter integration. |
| Core/QA-review | 01_06:30 scenarier+13 egne checks; 04_05:129 scenarier/149 cases,12 negative controls+585 egne checks. Scoped ACCEPT; Lead har valideret evidensen. |

Lead: **00_09**. Core: **01_06**. Gameplay: **02_07**. Visuals: **03_05**. QA: **04_05**.
Ingen aktiv repo-writer efter dette checkpoint; ingen nye specialistopgaver.
02_07s stop/freeze/frigivelse er workerens rapport; remote kandidat blev
genverificeret uændret. Ingen lokal procesmåling i den anden chat er påstået.

## Låste beslutninger og næste scope
Measured Inquiry: unlock60, cap10,2% mindre work pr. completed level, max20%,
kun nye betalte legacy8-starter. Aktive snapshots og rå levels bevares;
ingen selvdiscount eller legacy-capnerf. Schema1; sikker downgrade er ikke lovet.
Opening Focus er parkeret; flere Forge-upgrades er ønsket senere, uden mandat.
Samsung A40 og crDroid-specifik support er udgået af aktiv backlog og alle
fremtidige accept-/releasekrav på brugerens instruks; historiske originals bevares.
P2-04/native og P2-05/release-hardening er deferred. Signing-diagnosebranch
`01/signing-metadata-diagnose-131` bevares; ingen merge/cleanup bestilt.
Find-P3 announcement er separat/nonblocking; Farm recommended kræver præcisering.

## Accepteret Android og næste handling
**0.1.132**, package `com.lumenfall.app`, run `37293151872`, attempt1/success.
Release `396102072`, asset `612166562`,6830500 bytes; download-SHA256
`d59d24f2d9bf54c6329efe1f5bec9142773e7663b03a89fd7ba9ae4b5e9d49a4`.
Eksisterende signatur er verificeret både i CI og lokalt med repoets verifier.
APK-index,fonts og branding matcher det accepterede produktcommit.
Fysisk Android/TalkBack/install er ikke testet her. Ingen manuel rerun/dispatch
eller signingændring udført. Run131 attempt1-rootcause er stadig ukendt.

Ved snapshot:40 branches,0 åbne PR'er og0 runs i hver af de fem aktive queries.
Næste Lead-handling: læs kort opstart og fastlæg brugerens næste konkrete scope;
genstart ikke afsluttede opgaver. Læs `CONTEXT_INDEX.md` efter behov.
Integration/release-receipts: `decisions/2026-10-05-integration-release.txt`.
