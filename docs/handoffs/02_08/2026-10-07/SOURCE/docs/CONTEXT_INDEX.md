# Lumenfall — kildeindeks

Dette indeks læses ved opslag. Det er ikke en ordre om at læse alle kilder.
Filer i samme række er kandidater; indlæs kun det, som den konkrete opgave kræver.

| Behov | Kilde | Hvornår |
| --- | --- | --- |
| Arbejdsregler og læserækkefølge | `../AGENTS.md` | Opstart |
| Egen rolle | `CHAT_OWNERSHIP.md` → én fil i `agents/` | Opstart |
| Aktuelt snapshot, writer og åbne opgaver | `PROJECT_STATE.md` | Opstart; kontrollér live drift |
| Measured Inquiry | `tasks/MEASURED_INQUIRY_001.md`, `tasks/MEASURED_INQUIRY_001_REQUIREMENTS.txt` | Originalkrav før implementering/review |
| Forge/Lab-beslutning og begrundelser | `decisions/2026-10-04-forge-lab.txt` | Ved scope-/designspørgsmål |
| PR41 Core/QA/Lead-accept | `decisions/2026-10-05-pr41-review.txt` | Ved integration eller vurdering af reviewgrænser |
| NAV-001 kontrakt og afsluttet opgave | `tasks/NAV_001.md`, `tasks/NAV_001_REQUIREMENTS.txt` | NAV-review, regression eller nye nav-ændringer |
| NAV-integration, APK133 og stående godkendelse | `decisions/2026-10-05-nav001-integration-release.txt` | Aktuel release/status/mandat |
| Afsluttet integration og APK132 | `decisions/2026-10-05-integration-release.txt` | Ved release-provenance eller statuskontrol |
| Context integration | `tasks/CONTEXT_SETUP_001.md` | Kun dokumentationsopgaven |
| Overdragelse/checkpoint | `HANDOFF_TEMPLATE.md` | Ved milepæl/handoff |
| Produktkode | `../index.html` på relevant commit | Målrettede afsnit; udvid ved afhængigheder |
| Adfærd, parity og negative controls | `../tests/behavioral/` | Relevante scenarier og harness før QA/ændring |
| CI-checks | `../.github/workflows/pre-merge-validation.yml` | Før PR-validering; run.py viser aktuelle controls |
| Android/signing/publish | `../.github/workflows/build-android.yml`, `../scripts/verify_apk_identity.py`, `../mobile/` | Kun Core/release-opgave og triggerkontrol |
| Branding og mobilreferencer | `../branding/README.md`, `brand-reference/README.md` | Relevant UI/branding-opgave |
| Historisk program og audits | `ROADMAP.md`, `audits/` | Baggrund til en konkret beslutning; ikke automatisk backlog |

## Eksterne originalpakker
Bevar originalerne. Lokal hashkontrol beviser intakte inkluderede bytes, ikke
at hele den tidligere samtale er bevaret. Indekset nedenfor giver genfinding;
pakken skal uploades igen, hvis den ikke kan hentes i den nye chat.

| Original | Tilgængeligt referencepunkt | SHA256 |
| --- | --- | --- |
| Lead-handoff 00_09, 2026-10-04(1).zip | Brugerfil `libfile_de53d551910c81919c17a5a928067548` | `c22fe271b921195242a1912d5c7e65c3513e0cb9d43b15d7fc7610b3e864bf9b` |
| Forge/Lab Design 02_07, 2026-10-04.zip | Brugerfil `libfile_d3cbc0aaf84c8191aca6610c5a246bf4` | `0ac450b68321a68a5938f6dcd137c6e2619c65836e91f2f39938eb39ccca79ca` |
| Measured Inquiry Implementation 00_09, 2026-10-04.zip | Original Lead-pakke; søg præcist filnavn eller få brugerupload | `97a3454fb8747c319f198a4bbee4391a7b2044aafabdbc9ba71f4de9069b8e64` |
| Lumenfall_PR41_Core_Review_01_06_00_09_2026-10-05.zip | Brugerupload `file_000000003ef08210b421370081edf75c`; søg præcist originalfilnavn ved ny chat | `d7c786d098b33bdacdaaf3a0ff36026c5ad8bb0d1bb9be595497dbf5ec882e4d` |
| Lumenfall_PR41_QA_04_05_2026-10-05.zip | Brugerupload `file_00000000e54482109bd802aef412335a`; søg præcist originalfilnavn ved ny chat | `fa83079b0d23c15cedf12fb384dc72409b7b63cb05200dbb578c889c631bf0d1` |

Originalmandatets SHA256 er `1df86fd6eefa6416b8b6225051d244dbe79797769777537017b273f92a1732db`.
GitHub-diff/CI: PR41 og run37209757818 på kandidat10f2ff5f… er observerede
receipts. Core+QA+Lead har scoped accept på exact kandidat; PR41 er efterfølgende merged
og APK132 accepteret. Se den daterede integrationsbeslutning for receipts.
Ingen ny writer-/merge-/buildtilladelse følger af indekset. Kopier er versionsmærkede;
opdater ikke historiske originals for at få dem til at ligne nuværende status.

## Projektets Kilder
Brug én kort bootstrap med repository og eksplicit læserækkefølge som indgang.
Vedligehold den aktuelle status i GitHub; kildekopier mærkes med commit/dato.
Læg ikke hele historikarkivet, lange logs eller alle tidligere handoffs ind som
obligatorisk opstartsmateriale. Adgang til en kilde er ikke det samme som at
dens indhold er indlæst i modellens arbejdskontekst.

## NAV-001 originaler
Lumenfall_NAV_001_Lead_Accept_00_11_2026-10-05.zip er den komplette
Lead-evidenspakke med Core/QA-originaler, v4-krav og raw-indeks.
Library `libfile_680a4122c4a08191a8b757b3c25b7d56`, SHA256
`0217c9ba97cf9b32c290a54061d750fbd1a0827f00eea86447ebc7218150544a`. Pakkens pre-integration-status er historisk;
den nye daterede integrationsbeslutning og PROJECT_STATE er aktuelle.
Ved næste LAB-scope: Lumenfall_00_11_Lead_Context_2026-10-05.zip,
Library `libfile_d42a1d05bf08819186ed6f4943028979` → Source_Index.txt →
LAB/LAB_MOTES_001_LOCAL.zip; læs kun originale LAB-krav og relevante kilder.
Lokale prototypes, testhooks og storageprefixer må ikke promoveres til produktet.
