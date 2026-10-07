# Codex-projektopstart — 7. oktober 2026

Brugerordre: Når et nyt Codex-projekt vælger Lumenfall GitHub-miljøet, skal
det kunne læse projektets kilder og arbejde videre. Kontroller placeringerne.
Denne ordre giver et afgrænset dokumentations-/arkivintegrationsscope på main.
Ingen produkt-writer eller PR46-accept følger af den.

## Fund og løsning

Main 1ddc246 havde PROJECT_STATE fra 5. oktober med forældet LAB-status.
Senere Lead/Core/Gameplay-materiale lå kun på separate arkivgrene:

| Kildecommit | Bevarede stier |
| --- | --- |
| a74427359be0978f183cfdd411b5a3b6cae887bd | docs/recovery, docs/project/RECOVERY_CURRENT_STATE.md, scripts/recovery/restore_package.py |
| bfcb89270a63ae083df6eb31682a2a5c48f0a4fd | docs/handoffs/01_06/2026-10-07 — 45 originale TXT/ZIP-filer og reviewkilder |
| 158eb6219544526a3c5d983238fdf4f6576cef60 | archive/02_08-b2-runtime-2026-10-07 og LAB-opgavekilder; rodens kandidatkode kopieres ikke til produktet |

Den nyeste Gameplay-ZIP er gendannet fra 25 dele og hash-/CRC-verificeret.
Alle 97 filer (96 payloads og manifest) er udpakket til docs/handoffs/02_08/2026-10-07. SOURCE er
suppleret fra exact tree 758d9a3f… til alle 96 filer, så review ikke kræver en
ekstern branch eller netadgang. SOURCE/AGENTS.txt gendannes som AGENTS.md;
SOURCE_SNAPSHOT_MANIFEST.json registrerer logisk sti/mode/blob/bytes/SHA256.
Det eksisterende afleveringsmanifest bevares byteidentisk; ekstra snapshot-
filer har deres eget manifest. Ny B2 kræver nye scoped Core-/QA-reviews.
Det nye OWN_RAW.tar.xz ligger i hashkontrollerede dele af hensyn til
overførsel. restore_candidate.py --evidence gendanner hele afleveringen.
Arkivstier er markeret -text i .gitattributes, så Git ikke normaliserer
originale CRLF-bytes. Historiske patch-whitespace bevares; kun ny aktiv
dokumentation/kode skal opfylde whitespacekontrollen.

Opstart fra AGENTS, bootstrap, egen rolle og opdateret PROJECT_STATE.
CODEX_START viser miljø/checks; CONTEXT_INDEX giver aktuelle kildeindgange.
Ny offline-diagnose er importeret uændret fra rapporten med identitet
libfile_a20c56b79a40819191a6b120915c33f1. Ved frisk slutpreflight fandtes PR47
med fuld reproduktions-ZIP/driver/raw/save. Ti hashes og ZIP CRC bestod;
PR47s krævede CI129 var success på exact head ee427cb…. Den er integreret som
docs-only via merge 45dd25bf8926edda7d053ea9ebad83997fe4e914, inden dette
samlede checkpoint. QA-kilderne ligger uændret under docs/qa/offline-autoascend-2026-10-07/.
Ingen offline-produktrettelse eller ny reproduktion er udført her.

## Historiske manifeststier

Det gamle recovery-MANIFEST registrerer to rootfiler, som nu er aktive indgange.
Deres originale bytes ligger i `docs/recovery/2026-10-07/publication_originals/`:
PROJECT_BOOTSTRAP.txt og PROJECT_INSTRUCTIONS.txt. Resten beholder sine stier.
check_context.py bruger dette bevaringskort ved historisk hashkontrol.
Den gamle PROJECT_STATE ligger i docs/project/PROJECT_STATE_2026-10-05_HISTORICAL.md.
Ingen andre originalmanifestpayloads opdateres til ny status.

## Validering og integration

Kontroller kildehenvisninger, alle tre arkivers manifester/parts, original
afleveringscoverage og 96-fil-kandidatens kanoniske Git-tree. Ingen spiltests
tilføjes for dokumentationsændringen. Main-produktbytes sammenlignes direkte
med baseline; remote PR skal bestå den eksisterende krævede pre-merge-CI.
Main kræver PR og statuscheck; intet bypass. Android-workflowets paths matcher
ikke docs/rootinstruktioner/scripts/codex/recovery, så denne ændring bestiller
ingen APK. Ingen manuelle dispatch/reruns eller ændrede workflowregler.

Docs-writer frigives efter verificeret integration. 02_07s produkt-writer-
release er fortsat ukendt; gammel stopinstruks og fravær af aktive runs er
ikke processtop. Den aktuelle brugerordre erstatter tidligere arkivgrenes
begrænsning til kun arkivering for dette docs-scope.

Lokal kontrol før PR: 21 entrypoints, 16 lokale Markdown-links og 11.037
bytes obligatorisk Lead-opstart. 1.509 arkiv-/coveragekontroller består;
96 kandidatfiler gendannes med exact tree 758d9a3f…. En frisk export af
Git-indexens tree består samme hashkontrol efter CRLF-bevaringsreglen.
APK-verifierens eksisterende selvtest og shell-syntaxkontrol består.
Produkt-, test-, mobile-, workflow-, font- og brandingstier har ingen diff.
Arkivernes gamle patch-whitespace er bevidst uændret.
