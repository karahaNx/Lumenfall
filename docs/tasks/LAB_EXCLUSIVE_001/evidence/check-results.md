# LAB_EXCLUSIVE_001 — lokale checks

Version: main b2a1f440e8ad9fed34b37551e468224310d2a6f6.
Index SHA256: f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4.
7. oktober 2026, Europe/Copenhagen. Der er kun et designforslag; ingen nye
Lab-mekanikker eller migrering er implementeret.

| Check | Resultat | Evidens og grænse |
| --- | --- | --- |
| Live-baseline kopi | PASS | startup-receipt.json; GitHub delta, blobs, fulltree og signed commit SHA matcher |
| Uændrede produkt/test/mobile/workflowbytes | PASS | git diff --exit-code 1ddc246eb62782a61ec5c486cd5f51ea170bb338 HEAD -- index.html tests/behavioral mobile .github; lokal arbejdsdiff også tom for disse paths |
| Eksisterende contextcheck | PASS, exit 0 | python3 scripts/codex/check_context.py; check-context.log: 21 entrypoints, 24 links |
| Read-only inventering | PASS, exit 0 | node docs/tasks/LAB_EXCLUSIVE_001/evidence/inventory.cjs; 9 Lab + 8 Forge + 7 Tree, 36 price/work-rækker, 7 independently computed mixed-factor expectations |
| Original formula_probe | PASS, exit 0 | genkørt med index.html; cmp mod original formula_probe_results.json er byteidentisk; formula-probe.json |
| Relevant Lab-source på nyere live main | PASS, exit 0 | main 0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd, index blob 90e4678cb28fa833fdacbc01d1744d9465f6a356; fem katalog/formel/snapshot-afsnit byteidentiske; main-drift-analysis.json |
| Formula_probe på nyere main | PASS, exit 0 | formula-probe-latest-main.json er byteidentisk med før-drift original; accepterer ikke den ændrede offline-engine |
| inquiry-contracts, uden local-network grant | BLOCKED, exit 1 | local socket kunne ikke åbnes (PermissionError); ingen gameplayresultater |
| inquiry-contracts, med local-network grant | FAIL/ufuldført, exit 1 | 25s browser-timeout; ingen færdig QA-payload; inquiry-contracts.log og raw artifacts |
| inquiry-chronology | FAIL/ufuldført, exit 1 | samme 25s timeout; inquiry-chronology.log og baseline-checks.json |
| inquiry-save-reload | FAIL/ufuldført, exit 1 | samme 25s timeout; inquiry-save-reload.log og baseline-checks.json |
| inquiry-contracts, uden command-sandbox | FAIL/ufuldført, exit 1 | samme 25s timeout; inquiry-contracts-unsandboxed.log og raw artifacts |
| Minimal Chromium about:blank probe | FAIL/ufuldført, exit 124 | timeout 12s, stdout 0 bytes; browser-probe.log, browser-probe.html |

Browser: Chromium 151.0.7922.173 (Debian trixie); Node v24.19.0.
Harness-loggene indeholder browser-/sourceidentitet og exit/timeout.
Selv about:blank producerede intet dump før timeout. Fejlårsagen er ukendt:
disse resultater beviser ikke en produktfejl og må ikke omklassificeres
til PASS. Gentagne checks blev stoppet; resten af de planlagte scenarier
har ingen acceptresultater. En eventuel afbrudt inquiry-backup-restore-log
er markeret afbrudt, ikke et testresultat.

Ikke kørt færdigt: inquiry-backup-restore/recovery/reset/ui/ui-reduced-motion,
active-studies-load, chronology-study-mid-window, upgrade-effects-and-deeds,
forge-effects. Mobilbredder, stor tekst, kontrast/fokus/reduced-motion og
reelle save/recovery-/fuldmotorchecks har derfor ingen ny accept i denne chat.
Ingen B2-review, fuld suite, candidate/integrationaccept, migration,
balance-ROI, fysisk Android, WebView60, TalkBack eller APK/signingcheck.

Inventarscriptet eksekverer isolerede faktiske baselinefunktioner. Det
kontrollerer formlerne med egne forventninger; det simulerer ikke faktisk
indtjening, historiske køb, fuldmotor eller nye forskningsregler. Nuværende
priser er nominale og kan ikke bruges som original-cost refund-ledger.

Reproduktion: kør inventory.cjs fra en kopi af repositoryet på exact baseline.
Den eksisterende formula_probe.cjs findes under
docs/recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/.
run-baseline-checks.cjs kalder det uændrede eksisterende harness og stopper
nu efter første fejl. Det er en historisk reproducer på den frosne b2a1-baseline.
Aktuelle checks bruger node tests/behavioral/run.cjs og
node scripts/codex/check_context.cjs på nyere main; de er ikke kørt her.
Kør nye browserchecks først efter konkret miljødiagnose;
gem nye logs separat fra de bevarede fejlforsøg.
