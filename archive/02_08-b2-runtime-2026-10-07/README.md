# 02_08 — arkiv til nyt projekt

Brugeren bad 7. oktober 2026 om at pushe alt til GitHub for at starte et nyt projekt. Dette er den seneste lokale B2-runtimekandidat og hele dens afleveringspakke, bevaret på en separat arkivbranch.

## Kode

- Repository: `karahaNx/Lumenfall`
- Arkivbranch: `02/gameplay-archive-2026-10-07`
- Præcis kodecommit: `013f52669dcd5cffb7c4757d7e627601dc4f3a57`
- Præcist kandidat-tree: `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`
- Parent / R2: `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`
- Main ved kontrol: `1ddc246eb62782a61ec5c486cd5f51ea170bb338`

Koden er tilgængelig ved branchens rod. Arkivcommitten tilføjer kun dette arkiv til den præcise kodecommit. B2-helperen bruger Number/DataView til præcis binær division og kræver ikke BigInt i appen. Dette er et arbejdsarkiv; de nye scoped Core-/QA-reviews og fysisk Android-test er fortsat udestående. Main og PR46 er ikke opdateret af denne arkivering.

## Start og fulde beviser

Læs `START_HER.txt`, derefter `Source_Index.txt` og de relevante beviser. `RESULT.txt` beskriver beståede lokale checks og de bevarede fejl og begrænsninger. De gamle mandaters lokale skrivebegrænsninger beskriver historisk status før brugerens aktuelle arkiveringsordre.

Den oprindelige ZIP er bevaret tabsfrit i 25 binære dele for overførsel til GitHub. Genskab den med:

```bash
python3 archive/02_08-b2-runtime-2026-10-07/restore_archive.py
```

Scriptet kontrollerer hver del, samlet størrelse og SHA256 før det afleverer ZIP-filen. ZIP: `Lumenfall_B2_Runtime_02_08_Til_00_16_2026-10-07.zip`, 26.210.351 bytes, SHA256 `eaa9517d5a6c8b6a2847d75d6eb7721c797516aa2c5fe2199da08e1c1bc4ed6f`.

Pakken indeholder fulde originals, sourcehashes, R2→ny/blokeret→ny/main→ny diffs, reproduktionsscripts, rå testbeviser, gamle BLOCKED-reviews og dokumenterede diagnostikfejl. Den er det uændrede afleveringsarkiv, som allerede blev gemt efter det lokale arbejde.

## Validationsstatus

Den eksisterende lokale slutvalidering rapporterer 7 beståede gates, 142 scenarier og 12 fangede negative kontroller. De 1.340 diagnostikforløb har fortsat de samme 379 strikte assertionfejl på R2 og kandidaten. Fysisk Android/WebView60/TalkBack er ikke testet, og den tidligere intermittent clipping-fejls årsag er fortsat ukendt. Arkiveringen genkører ikke spiltests og giver ingen ny produktaccept.

Kun arkivbranchen oprettes/opdateres. Ingen PR, merge, workflow-dispatch, APK-build eller release er bestilt som del af arkiveringen.
