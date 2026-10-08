# JavaScript som projektsprog — 7. oktober 2026

Brugerens originale instruktion:

> Everything in this project should use javascript if it can for testing and so on. HTML is still fine.

Beslutning: brug JavaScript til kode, tests, testkørsel, CI-logik og hjælpescripts,
hvor det er teknisk muligt. HTML er fortsat tilladt. Nye scripts bruger
JavaScript/Node.js; Node.js 20+ er den eksisterende toolingbaseline. Spillets
JavaScript skal fortsat understøtte Android WebView 60; toolingbaseline ændrer
ikke produktets runtimekrav.

Nødvendige deklarative formater, styles/assets og native Android-værktøjer
beholder deres formater. Andre scriptsprog vælges kun ved en konkret teknisk
begrænsning; begrundelsen gemmes i den relevante opgave. Reglen er meldt til
brugeren og gentages i AGENTS, bootstrap, projektinstruktioner og CODEX_START.

## Overgang

Denne levering gemmer sprogreglen for nyt og ændret arbejde. En samtidig
omlægning af alle eksisterende Python-værktøjer er ikke udført. Eksisterende
aktive værktøjer omlægges i det relevante scope med bevaret testdækning,
resultater, exitkoder, fejlkontrol og relevante CLI-kontrakter, før de erstattes.
Det aktuelle harness er `tests/behavioral/run.py`; aktive CI-workflows samt
APK-verifikation, context-check og recoveryværktøjer bruger også Python.
CODEX_START viser de eksisterende commands uden at påstå en gennemført migrering.

Historiske originaler, rå testbeviser, manifester og kandidatkopier i
`docs/recovery/`, `docs/handoffs/` og `archive/` bevares byteidentisk.
En sprogomlægning må ikke omskrive disse kilder eller gøre gamle testresultater
til evidens for nye bytes. Produkt-/writer-/reviewscopes følger stadig den
konkrete opgave.

Integration og kontrol gemmes i [opgavedokumentet](../tasks/JAVASCRIPT_FIRST_001.md)
og dets PR-receipt.
