# Lumenfall — handoff og checkpoint

Brug ved milepæle og før ny chat. Gem kritiske nye krav og brugerrettelser straks
i et relevant opgave-/beslutningsdokument; vent ikke på et fuldt handoff.
Dokumentér writer og præcis kandidat ved freeze. Lead opdaterer kort status.
En worker uden docs-writer afleverer en statusdelta i sin pakke i stedet for
at skrive samtidig i PROJECT_STATE.

## Lille start-TXT
Foreslået mål: højst 400 ord; udvid kun med nødvendige uafsluttede oplysninger.

    Rolle/chat og aktuel Lead:
    Repository og relevant branch:
    Model og effort:
    Aktuel opgave + originalkravets sti:
    Checkpoint og observationstid:
    Writer, tilladelser og stopbetingelse:
    Færdigt / igang / blokeret / ukendt:
    Næste konkrete handling:
    Nye oplysninger som endnu ikke er i repository:
    Læs ved opstart: AGENTS.md, egen rolle, PROJECT_STATE og aktuel opgave.
    Hent øvrige kilder via indeks efter behov. Læs ikke hele ZIP'en ved opstart.

## Kildepakke
- Start-TXT, kompakt filindeks og manifest med relative stier, størrelse og SHA256.
- Alle aktuelle originalkrav og endnu ikke integrerede rettelser/beslutninger.
- Aktuel leveringsstatus og nødvendige receipts, reproduktioner og begrænsninger.
- Referencer til afsluttet evidens: præcis fil/commit/version/digest og adgangsvej.
  Inkludér originalen, hvis den ellers ikke kan genfindes. Undgå rekursive kopier
  af gamle handoffarkiver. Manifestet selv er ikke en selvhashende payload.

## Kontrol før levering
1. Dækning: mål, gældende krav, alle nye rettelser, beslutninger/begrundelser,
   permissions/writer, aktuel kandidat, åbne problemer og næste handling har kilder.
2. Integritet: ZIP CRC og alle manifestpayloads, fuld filoversigt, ingen manglende
   eller uventede filer. Kontrollér originale krav byteidentisk.
3. Genfinding: åbne/fornyede krav er tilgængelige for næste chat; ekstern reference
   er ikke en adgangsgaranti. Angiv præcist manglende materiale.
4. Startup: målt tekstmængde for de obligatoriske fælles filer; ingen ordre om
   at udskrive/læse hele arkivet. Ingen påstand om præcis kontekstprocent.
5. Status: observationer, workerpåstande og accepterede resultater er adskilt.

Fuld semantisk bevarelse af en chatopsummering kan ikke garanteres. Arkivér
tilgængelige originaler og kritiske facts løbende. Ved manglende adgang: rapportér
det; gæt ikke. At læse filer ind fylder kontekst, uanset om de hedder AGENTS.md.
