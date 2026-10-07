# BOND_TEXT_001 — Bond-partnere ét sted

Status: lokal kandidat verificeret og frosset til Lead-checkpoint; remote checkpoint og integration blokeret af koordinationsgaten. Featuren er uafsluttet.

## Ét mål og originalkrav

Vis Bond-partnernavne i Formation Bonds, og fjern partnerpar fra Wisp ability-tekster. Evnerne skal fortsat forklare deres egne effekter korrekt.

Brugerens original, F16:

> Der behøver ikke stå i wisp ability at der laves bond med hvilken anden der bliver lavet formation bond, det skal kun stå i formation bond, hvilke wisp der giver bonussen.

Kilder læst: `docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt` (fuld original); `FEEDBACK/TASK_FEEDBACK_REVISION_001.txt` F16, F14/F15/F17, rækkefølge og save-/acceptafsnit; `DECISIONS/FEEDBACK_REGISTERED_001.txt`; `FEEDBACK/EVIDENCE/FINDINGS.txt`; `FEEDBACK/Source_Index.txt`. Alle sidstnævnte stier er relative til samme `lead_context/`. Billede 04-17362.jpg er inspiceret; dets APK/save-identitet er ukendt. Originalen har forrang for forslag.

## Ejer, baseline og mandat

- Ejerchat: denne featurechat **BOND_TEXT_001**, rolle 03 UI / Visuals / Branding. Ingen historisk chats identitet genbruges.
- Anbefaling fra bestillingen: GPT-6.1 Sol · High. Faktisk kørt model/effort kan ikke verificeres gennem miljøværktøjerne og attesteres ikke.
- Privat checkout: `/workspace/BOND_TEXT_001`; branch `feature/bond-text-001`. Oprettet som selvstændig lokal clone uden hardlinks. `/workspace/Lumenfall` ændres ikke.
- Præcis lokal Git-baseline: `67c3e99c24587f6c13fc65cfd27f8dcb8e289602`.
- Live main observeret gennem GitHub-connectoren 7. oktober 2026 ca. 15:10 CEST: `b2a1f440e8ad9fed34b37551e468224310d2a6f6`. Nyere docs indeholder JavaScript-reglen; de aktuelle regler er læst fra live main og har forrang for den lokale snapshotkopi.
- Produktets `index.html` er verificeret identisk mellem lokal baseline og dette live main: Git-blob `ea44431c163569548973d9e489f75345749a07ee`, SHA256 `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`. Git transport fejler mod miljøets proxy; GitHub-connectorens læsninger lykkes. Dette er ikke et checkout af det nyere docs-commit.
- Writer: kun privat lokal forberedelse er bestilt. Ingen tildelt fælles repo-writer eller remote checkpoint; stående godkendelse kræver ikke ny generel tilladelse.
- Stop: fryset lokal aflevering; ingen remote push/PR/merge/build/release før Lead har koordineret checkpoint og dependencies.

## Scope og beslutninger

`ABILITY_DESC.breaker` mister Stone/Titan-parret, men bevarer heavy ability damage, Module og Ultimate. Øvrige ability-effekter bevares. Begge ability-visninger (Wisps og Encyclopedia) bruger denne fælles tekst. Den generelle Wisp Roles-tekst mister også det ekstra partnerpar, så par-opslag samles under Formation Bonds.

Formation Bonds viser fulde navne fra `SPIRITS` gennem `FORMATION_BONDS.ids`, både på Wisps og i Encyclopedias Formation Bonds-afsnit. De fire manuelle `req`-tekstkopier fjernes; id'er, bonusser, tags, simulation og aktive/pending-regler bevares. Den eksisterende Rift-statusassertion læser forventede navne fra Wisp-id'erne.

Ingen nye Bonds, bonusser, priser, caps eller gameplaytal besluttes. F15 tilhører sin egen featurechat. Ingen save-schema-/migrationændring er nødvendig: Bond-definitionernes displayfelter er ikke købte eller gemte levels. Canonical/recovery/backup og gammel købsværdi bevares. WebView 60, package `com.lumenfall.app`, signing, deterministiske køb og Luminous Motes-regler ændres ikke.

## Acceptkriterier

1. Alle Bonds viser netop de Wisp-navne, som deres autoritative `ids` kræver, ved aktive, inaktive, låste og pending medlemmer.
2. Wisp abilities på Wisps og Encyclopedia har ingen Bond-partnerpar, men beskriver egne damage/resource/support-, Module- og Ultimate-effekter korrekt.
3. Samme Bond-model og multipliers bruges fortsat i live/offline/average-simulation. Køb, bulk, queues, chronology, save/reload og recovery ændres ikke.
4. Relevante mobilbredder 320/390/430px, 200% tekst, mindst 44px eksisterende disclosurekontrol, fokus, kontrast og reduced motion verificeres. Alle fulde partnernavne og effekter skal kunne læses uden vandret overflow eller clipping.
5. Koordineret GitHub-checkpoint, integration og kontrol på integreret version samt nødvendig APK/signing/deviceaccept dokumenteres før afslutning og arkivering.

## Dependencies

PR46 kontrolleret live: open/Draft, R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, branch `02/lab-motes-repeat-v1`. Ny B2-kandidat er rapporteret på tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; `START_HER.txt` og `SUMMARY/identity.json` er læst. Nye scoped Core-/QA-reviews og 02_07 writer-handover mangler ifølge aktuel status. PR46s tidligere grønne CI er ikke accept af B2 eller denne feature.

Lead-rækkefølgen holder B2-review/handover før nye produktændringer og F20/F21 før MOBILE-CLARITY. Privat F16-analyse/kandidat er autoriseret nu. Før integration skal Lead kontrollere eventuelle F15-definitioner og nye Bonds: partnernavne skal fortsat komme fra de samme `ids`; nyt design må ikke udledes fra tekst. Ingen anden chats checkout eller mål ændres.

Afgrænset lokal kompatibilitetskontrol: produktpatchens `git apply --check` består mod en separat kopi af det hashverificerede nye B2-index (`7c25b0…f4d9b`), og de fire Bond-definitioner/Wisp-navne er identiske. Dette er patch-/modelkompatibilitet, ikke review eller accept af B2. Bevis: `../qa/BOND_TEXT_001/b2-compatibility.json`.

## Kontrol og begrænsninger

Opstart: eksisterende `python3 scripts/codex/check_context.py` PASS (21 entrypoints, 22 links); `git diff --check` PASS. APK identity-verifierens eksisterende self-test PASS. Eksisterende Python-gates bruges som dokumenteret overgang, nye scripts skrives i JavaScript.

Kandidatens produkt-SHA256: `e89495cd979d75eed9938e65e061415c2731eb83d51418d24f77224fae7a953f`. Beviser og reproduktion: [README.txt](../qa/BOND_TEXT_001/README.txt), [regressions.json](../qa/BOND_TEXT_001/regressions.json), [source-check.json](../qa/BOND_TEXT_001/source-check.json), [UI-resultat](../qa/BOND_TEXT_001/ui/probe-result.json) og [live-observation.json](../qa/BOND_TEXT_001/live-observation.json).

- PASS: 12 eksisterende positive scenarier: Wisp-formler/roller/pacing, Rift/Bond-status, Formation-rebuild, chronology, save/reload, backup/restore, recovery, live/offline-parity (kort og Farm) og support-stacking. `self-test-wisp-formula-regression` fanges som forventet (exit 1). Rå logs og exitkoder bevares.
- PASS: repoets native `rift-status-mobile` i Chromium 151 på 360x640 og 390x844 med safe-insets, rigtig touch/keyboardnavigation, aktive/inaktive Bonds og processlukning.
- PASS: egen produktbrowserprobe for fire Bonds × aktiv/benched/pending (12 tilstande). Alle partner-id'er matcher fulde navne i begge Formation Bonds-visninger; render ændrer ikke gameplaystate. Alle otte abilities på Wisps og Encyclopedia er uden partnerpar; Stone/Titan bevarer egen Module/Ultimate-forklaring.
- PASS: 320/390/430 × 100/200% tekst × normal/reduced-motion (12 profiler). Rem-baseret partnertekst og abilityforklaringer forstørres; intet vandret overflow/clipping på de ændrede tekster. Hver komplet Bond-række kan scrolles frem. Native Enter åbner disclosure med bevaret fokus, 44px højde og synlig 2px outline. Screenshots ved 390px ligger i `ui/`.
- PASS: baseline og kandidat har identiske Bond-aktiveringer, damage/reward-multipliers og average ability-output i de 12 browsertilstande. Automatisk fuldkildesammenligning efter præcis displaynormalisering viser ingen øvrige gameplay/save/pris/reward/lifecycleændringer. To inline scripts syntaxkontrolleret.
- PASS: målt partnertekstfarve mod konservativ mørk baggrundsgrænse giver mindst 7,19:1 kontrast; grænsens antagelse og rå farver står i `source-check.json`. Aktive/inaktive tilstande bruger eksisterende markup.

Miljø-/probegrænser: første browserforsøg blev blokeret af sandboxens lokale socket-begrænsning. Chromium 151s CLI `--dump-dom` timed out uden et QA-resultat; efterfølgende uændrede harnessassertions blev kørt med en lokal JavaScript/CDP-wrapper, der returnerer den virkelige DOM efter et fuldført QA-resultat. En manglende QA-markør accepteres ikke. Native pipe-driveren kører uden denne fallback. De to første egne UI-prober brugte utilstrækkelige rawKeyDown-events; det blev rettet til native Enter keyDown med char-tekst, og alle profiler består. Fejlforsøg bevares i telefon-ZIP'en som diagnostik, ikke PASS.

Moderne Chromium er ikke fysisk Android/WebView60/TalkBack-accept. Den nye formatter bruger allerede understøttede `var`, `map` og `find`; faktisk legacy-runtime er ikke kørt. Ingen fuld CI-/B2-accept eller ny release påstås. Ingen migration udføres; køb/bulk/queues er byteidentiske, og eksisterende chronology/rebuildtests kontrollerer legitim auto-purchase/debit.

## Integration, frigivelse og næste handling

PR/integrationscommit/APK: ingen for denne feature. Ingen nødvendig fysisk Android/WebView60/TalkBack-accept udført. Ingen fælles writer er taget eller frigivet. Chatten forbliver åben.

Lokalt arbejde er STOP/frozen efter kandidat/checks og telefonvenlig TXT/ZIP. Kandidatens præcise lokale commit/tree står i ZIP'ens `IDENTITY.json` og `START_HER.txt`. Brugeren overfører afleveringen til Lead, som koordinerer B2-accept, rækkefølge og konkret writer-checkpoint. Før remote skrivning genkontrolleres main, alle branches, åbne PR'er, aktive runs og writer; rebasing/checks sker på den koordinerede baseline. Efter integration verificeres adfærd igen, nødvendig APK/deviceaccept gemmes, status og writerfrigivelse dokumenteres, og kun denne ejerchat arkiveres efter `FEATURE_WORKFLOW.md`. Ingen ny generel godkendelse behøves.
