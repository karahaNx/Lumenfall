# RIFT_COSMETICS_001 — synlige Deed-cosmetics på Rift

Status: **lokal kandidat / afventer koordineret writer-checkpoint og integration**.
Dette dokument og kandidaten er et lokalt forslag. Ingen produktaccept,
GitHub-publicering, PR, APK eller arkivering er udført for denne feature.

## Ét mål og originalkrav

F24: Gør hvert eksisterende optjent og valgt Deed-cosmetic synligt på Rift.
Bevar HP-læsbarhed, Guardian Tap, mindst 44px kontroller, fokus, kontrast og
et synligt reduced-motion-alternativ. Unlocked og selected er særskilte tilstande.

Originalen siger: “Når det kommer til deeds cosmetics, så synes jeg ikke de
effekter man låser op er synlige ved rift skærmen.” Den har forrang for forslag.

Autoritative kilder, læst 7. oktober 2026:

- `../recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt` (fuld original).
- `../recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt`: F07, F24, F27, mandat/dependencies, save-overgang og verifikation.
- `../recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt`.
- Feedbackens `EVIDENCE/FINDINGS.txt` og `Source_Index.txt`; billederne dokumenterer andre F-punkter. Ingen af de fire billeder er cosmetic-evidens.
- Bestillingen til denne ejerchat gemmes i `RIFT_COSMETICS_001_REQUIREMENTS.txt`.

## Ejer, baseline og writer

Ejer: denne RIFT_COSMETICS_001-featurechat, rolle **03 UI / Visuals / Branding**.
Platformens chat-id er ikke eksponeret i den tilgængelige opgavekontekst.
Ingen historisk rollechat er omdøbt eller overtaget.
Anbefalet model/effort: GPT-6.1 Sol / High; faktisk model/effort er ikke
attesteret af tilgængelig kørselsmetadata.

Observeret live main via fetch og GitHub 2026-10-07 kl. 15:11 København:
`b2a1f440e8ad9fed34b37551e468224310d2a6f6`.
Produktets `index.html` er fortsat blob
`ea44431c163569548973d9e489f75345749a07ee`, SHA256
`f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`.
Produktbaseline/APK ifølge aktuel status: `1ddc246...` / accepteret 0.1.133.
Live AGENTS, bootstrap, egen ownership-række/rolle, PROJECT_STATE,
FEATURE_WORKFLOW, CODEX_START og JavaScript-first-beslutningen er læst.

Privat checkout: `/workspace/RIFT_COSMETICS_001`.
Lokal featurebranch: `feature/rift-cosmetics-001`, startet fra ovenstående main.
Det oprindelige `/workspace/Lumenfall` er ikke produktredigeret.

PR46 kontrolleret live ved opstart: open/Draft, head
`3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`, endnu ikke merged.
Ny B2: tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; worker-PASS er
rapporteret. Nye scoped Core-/QA-reviews og fysisk Android mangler.
02_08s eget lokale stop er dokumenteret; 02_07s writer-frigivelse er ukendt.

**Writer:** ingen fælles/remote repo-writer tildelt denne chat. Brugerens
bestilling autoriserer privat forberedelse. AGENTS' “Én repo-writer ad gangen”
og Lead-beslutningens kandidat-review/handover først gælder stadig.
Stop: lokal freeze efter checks og handoff. Lead koordinerer checkpoint,
integration og release. Ingen gentagen generel godkendelse er nødvendig.

## Observeret før og foreslået efter

| Cosmetic | Eksisterende unlock | Baseline på Rift | Lokal kandidat på Rift |
| --- | --- | --- | --- |
| Starlight | Indbygget | Regionens standardudseende | Samme regionudseende, synligt temanavn |
| Ember Veil | Reach Rift 50 (`d50`) | Svag orange radial aura | Tydelig stiplet ember-ring og varmt Rift-lys |
| Void Bloom | Ascend 5 times (`asc5`) | Svag violet radial aura | Violet sekskant/facetter og violet lys |
| Aurora Pulse | Raise a Wisp to Mythic (`mythic`) | Enkelt rose-accent, ingen særskilt teal/puls | Rose-teal buer med rolig opacity-puls; statiske buer ved reduced motion |
| Solar Crown | Reach Rift 250 (`d250`) | Svag gylden radial aura | Gylden krone/ray-ring og gyldent lys |
| Radiant | Perfect Synergy (`modulemax`) | Svag conic-gradient, ingen farvecyklus | Seks currencyfarver i en langsom orbit; samme statiske farver ved reduced motion |

Baselinens radial aura bruger `color-mix`; Radiant bruger `conic-gradient`.
Disse CSS-funktioner findes ikke i WebView 60. Senere CSS reducerer også den
gamle auras styrke. Det er en kodeobservation; fysisk rendering er utestet.
Baseline gemmer ikke selection straks; den afhænger af senere autosave.

Kandidaten bruger dekorativ SVG og eksisterende CSS-variabler til landskabslys.
Aura og temanavn ligger absolut inden i den eksisterende Guardian Tap-knap
med `pointer-events:none`. HP, boss-status, enemy-name og Guidance-markup
får ingen nye layoutbokse. Temanavnet har en dækkende mørk baggrund og ligger
nederst i tapområdet, væk fra fjendens navn.

Deeds viser “Unlocked · Select” eller “✓ Selected” med native button og
`aria-pressed`. Valg gemmes straks gennem eksisterende `saveState`, canonical
save og recovery. Render er uden state-mutation. Et kendt, men låst, gammelt
theme-valg vises som Starlight, mens den gemte preference bevares. Dette
giver ingen unlock og sletter ingen data. Ukendte id'er følger eksisterende
normalisering. Ingen pris, reward, cap, gameplaytal eller save-schema ændres.

## Scope og beslutninger

- Kun `index.html`, målrettet JavaScript-browsercheck og feature-dokumentation.
- Alle seks eksisterende themes/unlock-flags bevares. Ingen ny Comet-content.
- SVG-mønstre er et lokalt visuelt implementeringsforslag, ikke nye spilregler.
- Ingen migration/refund er nødvendig: ingen køb, currency eller ownership fjernes.
- WebView 60, package `com.lumenfall.app`, signing og deterministiske køb bevares.
- Luminous Motes-belønninger, simulation, bulk/queue, chronology og offline-policy ændres ikke.
- Nye scripts er JavaScript. Eksisterende Python-harness/gates genbruges uden omskrivning af deres assertions eller arkiverede originaler.

## Dependencies og koordinering

1. PR46/B2: nye exact-candidate reviews og dokumenteret writer-handover før
   produkt-/remote-skrivning. Denne feature udvider ikke arithmetic-PR46.
2. F07 Guidance: kosmetiske lag er inde i `enemy-stage`; Guidance-ejeren kan
   placere sin notifikation separat. Integration skal genmåle HP/tap/tema
   med show/hide, lange hints og større tekst. Baseline flytter stadig
   tapområdet ved hide; dette F07-problem er ikke løst af F24.
3. F27 Comet-unlocks: ingen effekter/priser er besluttet her. Senere temaer
   kræver eksplicit unlock-definition, visuel gruppe og reduced-motion-check.
   F24 begynder med eksisterende themes; F27 er et separat mål.
4. Save/recovery-review: scoped review af straks-gemning og fallback for låst
   preference. Gamle ejerflags/købsværdi bevares; intet refund-loop introduceres.

## Acceptkriterier og lokal kontrol

- Hvert af de seks themes har korrekt synlig virkning på normal, boss og Luminous Rift.
- Kun optjente themes kan vælges; unlock vælger ikke automatisk; ét effective selected theme.
- Selected er synlig på Rift og i Deeds; et label alene tæller ikke som kosmetisk effekt.
- Ingen cosmetic flytter/dækker HP eller ændrer tapgeometri. Dekorationer fanger ingen input/fokus.
- 320/390/430px, større tekst, 44px, tastatur/fokus, kontrast og statisk reduced-motion består.
- Valg bevares straks i primary/recovery og efter faktisk reload, recovery og backup restore.
- Render/valg ændrer ikke økonomi, køb, caps eller simuleringsregler.
- Relevante eksisterende checks består på kandidat, og gentages på integreret version.
- Integrationscommit, relevante APK/signing/devicechecks, gemt GitHub-status og writer-frigivelse kræves før afslutning/arkivering.

Lokale resultater og næste handling udfyldes ved freeze; rå logs/billeder,
kandidatidentitet og reproduktionskommandoer følger den telefonvenlige ZIP.

## Næste handling

Afslut lokal check/freeze og aflever TXT/ZIP til brugerens overførsel til Lead.
Lead registrerer et koordineret writer-checkpoint, genkontrollerer live main/
PR46/B2, og aftaler relevant integration efter de eksisterende gates. Derefter
verificeres det konkrete Rift-look på integreret main og relevant APK/device.
Gem status/beviser i GitHub, frigiv writer, og arkivér kun denne ejerchat.
Indtil dette er opfyldt er featuren **uafsluttet**; chatten forbliver åben.
