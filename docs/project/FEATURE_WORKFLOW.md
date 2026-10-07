# Lumenfall — én chat, én feature

Brugerens regel fra 7. oktober 2026: hver ny feature har én ejerchat. Rollerne
i `../CHAT_OWNERSHIP.md` beskriver ekspertise; tidligere rollechatnumre er historik.
Nødvendige fixes, relevante reviews, tests og dokumentation hører til featuren.
Et andet produktmål kræver sin egen chat. Brugeren opretter/bestiller næste chat;
agenten opretter ikke selv flere chats eller subagenter.

## Start og løbende checkpoint

1. Læs rodens `AGENTS.md`, bootstrap, egen rolle og `../PROJECT_STATE.md`.
   Kontrollér live main, relevant kandidat/PR og skriveejerskab.
2. Opret eller opdatér ét `docs/tasks/<FEATURE_ID>.md` med originalkrav,
   ét mål, scope, ejerchat, writer, baseline, acceptkriterier og næste handling.
   Brugerens bestilling fastlægger scope; stående godkendelse gælder fortsat.
3. Gem krav, brugerrettelser, beslutninger og nødvendige originaler i GitHub
   ved milepæle. Bevar rå testbeviser eller stabile præcise referencer til dem.
   Kopiér nødvendige udløbende CI-/Library-filer, før de bliver eneste kilde.
4. Hvis en ny regel behøves, fortæl brugeren den konkrete regel og begrundelsen
   før bindende anvendelse. Gem beslutningen og opdatér AGENTS/berørte krav.
   Gameplayvalg uden beslutning afklares; rutineimplementering kræver ikke en
   ny generel godkendelse.

## Afslutning før arkivering

Alle relevante punkter skal være opfyldt og kunne kontrolleres:

- Featuren findes i den integrerede kode på main. Angiv PR og integrationscommit;
  en prototype, worker-PASS eller åben PR er fortsat igangværende arbejde.
- Acceptkriterier er opfyldt med relevante checks på den integrerede version.
  Bevar hvad der blev kørt, resultat og præcis version. Tidligere review/CI skal
  vurderes igen, hvis integration ændrer relevante bytes eller afhængigheder.
- For en appfeature: den relevante APK er bygget/publiceret, dens package,
  version og signing er verificeret, og nødvendige Android-/devicechecks er
  udført. Manglende påkrævet deviceaccept holder opgaven åben. Dokumentation
  kræver dokumentationskontrol og GitHub-integration; APK/device er ikke relevant.
- `docs/PROJECT_STATE.md` og opgavedokumentet har status, beslutninger, beviser,
  kendte begrænsninger og næste handling. Intet nødvendigt findes kun i chatten.
- Writer er frigivet efter dette scope. Frigivelse gælder ikke andre writers.
- Giv brugeren en kort aflevering: hvad der er implementeret, hvor det findes,
  kontrolresultater og eventuelle nye regler.

Arkivér derefter kun ejerchatten med appens arkivværktøj. Brugerens workflowregel
autoriserer denne arkivering efter dokumenteret afslutning. Brug den faktiske
chatidentitet; omdøb eller arkivér ikke andre chats. Hvis værktøjet ikke er
tilgængeligt eller fejler, oplys at manuel arkivering mangler. Meld aldrig en
arkivering som udført uden succesrespons. Blokeret/ukendt arbejde forbliver åbent.
Arkivering er oprydning; GitHub indeholder den fortsættelige projektviden.

## Kort opgaveskabelon

```text
Feature-ID og ét mål:
Originalkrav og rettelser (stier):
Ejerchat, rolle, writer og stopbetingelse:
Baseline og observationstid:
Scope og acceptkriterier:
Status: igang / blokeret / verificeret integreret:
Beslutninger, begrundelser og nye regler:
PR, integrationscommit og APK/run hvis relevant:
Testbeviser og begrænsninger på integrationsversionen:
Writer-frigivelse og arkivstatus:
Næste konkrete handling:
```

Ved større overdragelser bruges [HANDOFF_TEMPLATE.md](../HANDOFF_TEMPLATE.md).
