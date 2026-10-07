REPRODUKTION
1. Hent index.html fra commit 1ddc246eb62782a61ec5c486cd5f51ea170bb338 i
   karahaNx/Lumenfall og læg filen ved siden af reproduce.cjs.
2. Kontrollér med git hash-object index.html:
   ea44431c163569548973d9e489f75345749a07ee
3. Node.js24: node reproduce.cjs
4. Lang case og kontrol:
   node reproduce.cjs '[{"label":"raw","seconds":28800,"kind":"offline"},{"label":"disabled","seconds":28800,"kind":"offline"}]'
5. Faktisk offline entry:
   node reproduce.cjs '[{"label":"raw","seconds":28800,"kind":"offline","entry":"offline-progress"}]'
Output skrives til results.json. Cases er friske instanser af samme backup.
Der er timeout30 sekunder pr. case. CPU-/VM-tider er ikke Androidtider.
Produktets IIFE har en observerbridge; DOM-init bliver ikke kørt.
Kun en diagnostisk iterationsvariabel er tilføjet. Ingen gameplay override.
