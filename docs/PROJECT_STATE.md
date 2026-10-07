# Lumenfall — aktuel projektstatus

Opdateret 7. oktober 2026 ved brugerens bestilling af et selvstændigt Codex-
projekt. Repository: `karahaNx/Lumenfall`, standardbranch `main`.
Kontrollér live GitHub før handling; SHA'er er checkpoints.

## Produkt og aktuel kandidat

Produktbaseline: `1ddc246eb62782a61ec5c486cd5f51ea170bb338`, tree
`bfb3970b29485b3e8ece1c72bb60186eb2ba755e`. Dette docs-checkpoint ændrer ingen
produkt-, test-, mobile-, signing- eller workflowbytes fra den baseline.
Accepteret APK: **0.1.133**, package `com.lumenfall.app`, run `37363152517`.
Receipts: `decisions/2026-10-05-nav001-integration-release.txt`.
P0/P1, Forge/Lab, Formation, Measured Inquiry og NAV-001 er integreret.

| Arbejde | Status og næste handling |
| --- | --- |
| PR46 / LAB-MOTES | Observeret open/Draft på R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`. R2s grønne CI accepterer ikke nyere bytes. |
| Tidligere lokal B2 | Tree `4c07cd5d66cb5928eb99623ff86efaa81e268829`: Core/QA BLOCKED; obligatorisk BigInt bryder WebView 60-baseline. |
| Ny B2-runtimekandidat | Tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; kodecommit `013f526` på Gameplay-arkivgrenen. Worker rapporterer Number/DataView-fix, 7 gates, 142 scenarier og 12 fangede negatives. **Nye scoped Core-/QA-reviews mangler.** |
| FEEDBACK-REVISION-001 | 29 punkter, fuld original og fire billeder. Efter PR46: først F20/F21 Echoing Rest cap 6 / Cheaper Bonds cap 20, købsgates og gammel-save-politik. Øvrige scopes følger dependencies. |
| Offline / Auto-Ascend | Ny diagnose på produktbaseline: 8 timers offline ON rammer eventbudgettet i VM-test. Se `project/KNOWN_ISSUES.md`. Ingen lifecycle-/Androidaccept eller produktrettelse. |

Ny kandidats index SHA256:
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Fuld aflevering, alle 96 kildefiler og egne beviser: `handoffs/02_08/2026-10-07/`.
De 1.340 diagnostikforløb har fortsat 379 strikte assertionfejl på R2/ny kandidat
ifølge worker; ingen samlet grøn stresstest påstås. Fysisk Android/WebView60/
TalkBack og tidligere intermittent clipping-rootcause er utestet/ukendt.
Bevar runtimebaseline 60.

## Ejerskab og konkret fortsættelse

Historiske chats: Lead 00_16, Core 01_06, Gameplay 02_08; 02_09-recovery blev
udstedt før den nyere 02_08-levering; Visuals 03_05, QA 04_05.
En ny Codex-projektchat starter som Lead, medmindre brugeren tildeler en rolle.
02_08s eget lokale kandidatstop/processlukning er dokumenteret i leveringen.
02_07s senere B2-writerrelease er fortsat ukendt. Arkivpublicering tildeler
ingen ny produkt-writer og opdaterer ikke PR46.

Brugerens aktuelle docs-mandat omfatter at gøre opstart/kilder klar på main.
Dette scope frigives efter dokumenteret integration; øvrige writerforhold
ændres ikke. Stående godkendelse fra 5. oktober gælder bestilt scope.

Workflowmandat 7. oktober: `tasks/WORKFLOW_CONTINUITY_001.md` bevarer brugerens
krav om regler, én feature pr. chat og fortsættelse fra ny ChatGPT-konto.
Lead i denne ejerchat har kun docs-writer til det bestilte scope. Den konkrete
integration og writer-frigivelse registreres i opgavedokumentets PR49-receipt; produktwriter
og åbne B2-/PR46-reviews ændres ikke. Nye features følger
`project/FEATURE_WORKFLOW.md`; kontoskift følger `project/ACCOUNT_RECOVERY.md`.

Næste B2-handling: kontrollér live baseline, læs ny leverings START/identity,
genskab det præcise tree separat, og udsted nye scoped Core-/QA-reviews.
Gem reviewdelta i denne status. Integrér efter kandidataccept og handover.
Offline-fejlen kræver eget mandat; den foldes ikke ind i PR46.

Historisk status: `project/PROJECT_STATE_2026-10-05_HISTORICAL.md`.
Ældre recovery-status bevares byteidentisk; denne fil er den aktuelle indgang.
P2-04/native, P2-05/release-hardening og A40 forbliver deferred/udgået.
