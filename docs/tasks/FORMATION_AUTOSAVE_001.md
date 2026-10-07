# FORMATION_AUTOSAVE_001 — Formation autosave (F14)

Status: **lokal kandidat under verifikation; ikke integreret eller accepteret**.
Ejerchat: denne bestilling, “LUMENFALL — ÉN FEATURECHAT: Formation autosave”.
Rolle: Gameplay / Progression. Ingen subagenter, beskedværktøjer eller chatomdøbning.
Anbefaling: GPT-6.1 Sol · Ekstra høj. Konkret kørt modelvariant/effort er ikke
eksponeret som verificerbar runtime-metadata; anbefalingen er ikke kørselsbevis.

## Ét mål og originaler

Gem relevante Field/Bench/rosterændringer straks i det valgte Push/Farm/Boss-
preset og fjern Save-knappen. Bevar preset-isolation, tomme gemte presets og
ønskede late-game-medlemmer ved Ascend/recovery. Pending giver ingen DPS/Bonds.

Autoritativ original:
`../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt`:

> Current formation skal laves at der ikke behøver stå save, feks når man vælger push så vælger man de wisp man vil have, så skal den auto save det uden at trykke på knappen, at det er de aktuelle wisp der gemmer til den formation.

Brugerens præcisering i denne ejerchat den 7. oktober 2026 (ordret):

> Altså det jeg mente med det her autosave er, når man vælger den aktive formation, så skal den huske de wisps man har, selvfølgelig er der ikke en formation der starter med 0 wisps

Supplerende kilder: F14, dependencies og save-afsnit i
`TASK_FEEDBACK_REVISION_001.txt`; `DECISIONS/FEEDBACK_REGISTERED_001.txt`;
`FEEDBACK/EVIDENCE/FINDINGS.txt` og `FEEDBACK/Source_Index.txt`, alle under
`docs/recovery/2026-10-07/lead_context/`. Ingen af de fire screenshots er en
Formation-reference; deres APK/saveversion er ukendt. Originalen går forud for forslag.

## Baseline og ejerskab

Observeret live via GitHub og git fetch den 7. oktober 2026:

- Main: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, tree
  `60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60`.
- Main-produktbytes i index/tests/mobile/workflows matcher den accepterede
  produktbaseline `1ddc246eb62782a61ec5c486cd5f51ea170bb338` / APK 0.1.133.
- Privat worktree: `/workspace/Lumenfall-formation-autosave`; branch
  `feature/formation-autosave-001`. Det oprindelige checkout blev ikke redigeret.
- PR46: open/Draft, R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`.
- B2: arkiveret tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`;
  gendannet og hashkontrolleret separat. Ny scoped Core-/QA-accept mangler.
- 02_07s senere B2-writerrelease er ukendt. Ingen remote repo-writer er tildelt
  denne ejerchat. Lokal forberedelse er autoriseret af brugerens aktuelle ordre.

Lead-registreringen kræver PR46/B2-review og handover før nye produktændringer.
F14-kontrakten skal være stabil før F15 Formation Bonds integreres. F20/F21
er tidligere planlagte scopes, som Lead koordinerer; de implementeres ikke her.
Stående godkendelse gælder bestilt scope; ingen ny generel godkendelse kræves.

## Lokal kandidat og beslutninger

- Det valgte preset er autosave-destinationen. Field/Bench redigerer hele det
  ønskede hold, også under et delvist rebuild, og gemmer canonical/recovery straks.
- Rekruttering uden rebuild tilføjes som før til et ledigt Field-slot og gemmes
  straks i det valgte preset. Empower alene ændrer ikke medlemslisten. Betalte
  rebuild-køb bevarer ønsket hold; de gemmer ikke den midlertidige projektion.
- Presetskift vælger destinationen før den nye projektion. De øvrige presets
  overskrives ikke; pending presets er stadig valgbare.
- Fem ønskede pladser inkluderer pending. Ukendte IDs, fuldt hold, manglende
  rekruttering og sidste Bench afvises uden state-/saveændring.
- Brugerens præcisering bevarer mindst én aktiv Wisp. Nye presets starter fortsat
  med Ember. Et eksisterende tomt gemt preset bevares som `[]`; ved valg bruges
  midlertidig Ember indtil en eksplicit Field/rekruttering redigerer intent.
- `formationRebuild` kan repræsentere dette tomme, valgte preset. Tilknytningen
  er kun gyldig ved et eksakt match med det gemte preset. Ugyldig tom intent
  accepteres ikke. Der oprettes ingen ny save-key eller schema-version.
- Ascend gemmer det fulde ønskede hold før reset; gentaget Ascend, canonical
  save, recovery og backup beholder valg/order/pending og tomme gemte presets.
- Pending kan benches uden at slette andre ønskede medlemmer. Combat/Bonds
  anvender fortsat kun faktisk powered Field; automation har eksisterende
  unlock-, pris-, billigst-først- og cadencegrænser.
- Save-knapper/handler fjernes. Valgt preset viser Autosave/Selected og pending
  vises særskilt. Native knapper og eksisterende fokusbevarelse anvendes.

Ingen nye gameplaytal eller balanceformler. Ingen ny projektregel.
F15/F16/F17/F18/F19/F25/F26, køb/caps/refunds, offline-policy, signing, package,
workflow-triggere og B2-aritmetik ændres ikke. Betalt ownership og currencies
bevares; normalisering har ingen køb/refund og testes for idempotens.

Alle nye scripts/tests er JavaScript. Det eksisterende Python-harness får
kun registrering af JavaScript-scenarier/drivere samt opdatering af indlejrede
JavaScript-assertions for den nye kontrakt. Det eksisterende harness og workflow-
checks genbruges via en JavaScript-runner; en total harnessmigrering er et andet mål.

## Acceptkriterier

1. Push/Farm/Boss isoleres gennem valg → Field/Bench/rekruttering → skift → retur.
   Primary og recovery indeholder redigeringen straks, uden manuel Save.
2. Ét til fem faktiske Field-medlemmer; fem ønskede pladser også med pending.
   Tomme gemte presets kan vælges/redigeres uden automatisk Ember-overskrivning.
3. Delvist og gentaget Ascend bevarer hele ønskede hold/order og destination.
   Pending giver ingen combat-, ability-, support- eller Bond-fordel.
4. Canonical/reload/backup/recovery bevarer presets, valg og pending; malformed/
   legacy behandles deterministisk. Gentagen normalisering er idempotent, og
   eksisterende betalt værdi bevares.
5. Eksisterende kronologi, Luminous/Motes, live/offline, queue og economy-ledgers
   består relevante regressionschecks. Tre scoped autosave-mutants fanges.
6. UI består 320/390/430px, 200% relevant tekst, native touch/tastatur, ≥44px,
   synligt fokus, kontrast, reduceret bevægelse og render uden save-sideeffekter.
7. Koordineret writer-checkpoint gemmer opgave/kode/beviser i GitHub. Efter
   integration verificeres den konkrete integrationsversion; nødvendig APK,
   package/signing, fysisk Android/WebView60/TalkBack-accept og writerrelease
   registreres. Først derefter arkiveres kun denne ejerchat.

## Verifikation og begrænsninger

Foreløbigt observeret lokalt: 128 autosave-assertions, alle tre causal mutants
fanget, native touch/tastatur ved seks normale og seks reduced-motion-profiler
(320/390/430 × normal/200% tekst), immediate primary/recovery, fokus/renderpurity.
Mindste målt tekstkontrast i presetdetaljer 6.57:1; kontroller ≥44px.
Begge produkt-inline-scripts parser ECMAScript 2017 med Acorn 8.15.0.
Produktpatchens `git apply --check` består på det separat gendannede B2-tree.

Fuld eksisterende pre-merge-suite, persistence og chronology er under kørsel.
Rå kilderesultater og endelige exits indsættes ved lokalt freeze. Kørsel:

```bash
node scripts/qa/check-formation-autosave.cjs --full --evidence /tmp/formation-checks
```

Miljøets Chromium 151 `--dump-dom` hænger også på about:blank; de indledende
afbrudte forsøg er ikke produktfejl eller PASS. Native CDP virkede med denne
browser. En isoleret Google Chrome 155-installation blev derefter anvendt til
de eksisterende CLI-gates. Browseridentitet/sourcehash/exit og rå logs bevares.
Moderne browser- og grammar-PASS er ikke fysisk Android eller WebView60-accept.

## Næste handling, stop og færdigstatus

Afslut lokale checks og freeze kandidat/patch/TXT/ZIP til brugeroverført Lead-review.
Derefter skal Lead gennemføre PR46/B2-accept og dokumenteret writerhandover,
tildele konkret checkpoint, kontrollere live main/branches/PRs/runs og gemme
denne feature i GitHub. Genbasér på accepteret main og gentag relevante checks.
Ingen push, PR, integration, build, rerun, release eller remote docs-skrivning
er udført i denne ejerchat. Ingen produkt-writer er erhvervet eller frigivet.
Main-status ændres først ved koordineret integration. APK/deviceaccept mangler;
featuren og ejerchatten forbliver åbne.
