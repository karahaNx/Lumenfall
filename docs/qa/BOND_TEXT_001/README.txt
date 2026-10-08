BOND_TEXT_001 — lokal F16-kandidat, 7. oktober 2026

Denne mappe indeholder beviser for en privat kandidat. Ingen remote writer,
PR, main-integration, B2-accept, APK eller fysisk Androidaccept er udført.
Opgave og scope: docs/tasks/BOND_TEXT_001.md.
Produkt-SHA256: e89495cd979d75eed9938e65e061415c2731eb83d51418d24f77224fae7a953f
Baseline-SHA256: f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4

Indeks
live-observation.json / live-AGENTS.txt / live-PROJECT_STATE.txt:
  læste live refs og regelsnapshots; ikke aktuelle writerkvitteringer senere.
regressions.json og *-cdp.log:
  12 eksisterende positive scenarier og fanget negativ kontrol, med exitkoder.
rift-status-mobile.log:
  eksisterende native pipe-driver med touch/keyboard og teardown.
ui/probe-result.json / ui/*.png:
  12 Bond-tilstande og 12 mobil-/tekst-/motionprofiler, uden render-mutation.
ui-baseline/probe-result.json:
  samme produkthjælperprobe mod den byteverificerede baseline.
source-check.json:
  fuldkilde-displaynormalisering, syntax, identiske browser-mekanikresultater
  og konservativ partnertekstkontrast. RGB-grænsen <=80 på underliggende
  mørk cardbaggrund er en deklareret antagelse, ikke screenshot-pixelmåling.
*.cjs:
  JavaScript reproductionsværktøjer. De ligger kun i QA, ikke produkt-HTML.

Reproduktion i et miljø med Node 20+, Python 3.10+ og /usr/bin/chromium
1. Fra repo-roden stages produktet som beskrevet i CODEX_START. Til dette
   checkpoint var webroot /tmp/bond-text-001-web med index.html/fonts/branding.
2. node docs/qa/BOND_TEXT_001/probe.cjs . /tmp/bond-text-ui
3. Opret en separat baseline-webroot med index.html fra den angivne baseline
   og samme fonts/branding. Kør probe.cjs med root/output og --baseline.
4. node docs/qa/BOND_TEXT_001/source-check.cjs BASELINE/index.html index.html
   /tmp/bond-text-ui/probe-result.json BASELINE_RESULT/probe-result.json
5. Kør eksisterende tests/behavioral/run.py med --web-root og --scenario.
   Den lokale Chromium 151 --dump-dom-metode hang. For samme fallback:
   chmod +x docs/qa/BOND_TEXT_001/chromium-cdp.cjs
   mkdir -p /tmp/bond-check-tools
   ln -s ABSOLUT_STI_TIL/chromium-cdp.cjs /tmp/bond-check-tools/google-chrome
   node docs/qa/BOND_TEXT_001/run-checks.cjs ABSOLUT_REPOROD ABSOLUT_OUTPUT
   Runneren bruger /tmp/bond-text-001-web og /tmp/bond-check-tools som
   lokale standardstier. Repoets assertions og produkttilstande er uændrede.
   Wrapperen returnerer virkelig DOM fra CDP; manglende resultater skal fejle.
6. Native rift-status-mobile kører gennem den eksisterende pipe-driver med
   repoets almindelige Chromium og kræver ikke dump-dom-fallback.

Full CI, WebView60/native/TalkBack og integreret version skal verificeres
ved Leadens koordinerede checkpoint og release. Lokal PASS er ikke færdig.
Telefon-ZIP'en bevarer også tidligere miljø- og inputprobe-diagnoser.
