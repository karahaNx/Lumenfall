# FORMATION_AUTOSAVE_001 — lokale beviser

Privat kandidat på `feature/formation-autosave-001`, fra main
`b2a1f440e8ad9fed34b37551e468224310d2a6f6`. Ingen integration eller APK/deviceaccept.

`results.json` indeholder commands, exits, varighed og produktets SHA256.
`SOURCE_MANIFEST.json` identificerer de verificerede produkt-/test-/runnerbytes.
`behavioral-suite.log` er den komplette eksisterende suite med nye F14-scenarier.
De to native F14-results indeholder faktiske CDP-browseridentiteter, 320/390/430px,
normal/200% relevant tekst, normal/reduced motion, touch/tastatur, render-purity,
fokus og kontrast. `screenshots/` viser disse tolv profiler.
De tolv `self-test-*.log` skal fejle med de forventede kausale assertions.
Scoped autosave-mutants køres i `formation-autosave-contract` og begge native tests.

`es2017.json` er grammar-kontrol med Acorn 8.15.0; det er ikke en Androidtest.
`b2-compatibility.json` registrerer gendannelse af det præcise arkiverede B2-tree
og en tør anvendelse af kun produktpatchen. B2 er hverken integreret eller
accepteret af denne kontrol.
`baseline.json` har live main/PR46-observation og lokal checkout-identitet.

Kør igen fra repository-roden:

```bash
node scripts/qa/check-formation-autosave.cjs --full --evidence /tmp/formation-checks
```

Runneren er JavaScript og genbruger de eksisterende Python-værktøjer og uændrede
workflow-checks. Den bygger/publicerer ingen APK og ændrer ingen remote tilstand.
Ved en ny browserinstallation i dette miljø blev npm-cache og Chrome-filer lagt
separat under `/tmp`, uden ændring af `$HOME` eller projektets afhængigheder.

Tidlige forsøg med systemets Chromium 151 `--dump-dom` fejlede/hang også på en
tom side. En tidligere kandidatkørsel blev stoppet efter en afgrænset korrektion
af første rekruttering i et tomt gemt preset. De tæller ikke som acceptbeviser.
De endelige CLI-gates bruger Google Chrome 155; native input bruger Chromium 151.
Ingen fysisk Android, WebView60 eller TalkBack er testet. Se opgavekortet for gates
til koordineret GitHub-checkpoint, integration, APK/deviceaccept og arkivering.
