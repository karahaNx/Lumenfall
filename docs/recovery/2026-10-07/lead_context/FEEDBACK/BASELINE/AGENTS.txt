# Lumenfall — fælles agentregler

Repository: `karahaNx/Lumenfall`. Læs denne korte indgang ved hver ny opgave.
Ved GitHub-værktøjer skal opstartsprompten eksplicit bede om filen; antag ikke
automatisk indlæsning fra et eksternt repository.

## Opstart
1. Læs kun egen rolle fra tabellen i `docs/CHAT_OWNERSHIP.md`.
2. Læs `docs/PROJECT_STATE.md` og den aktuelle Lead-opgave/handoff.
3. Find detaljer via `docs/CONTEXT_INDEX.md`, når opgaven kræver dem.
4. Verificér relevant live baseline før beslutninger og alle branches, åbne PR'er,
   aktive runs samt skriveejerskab før remote skrivning. SHA'er er checkpoints.

## Kilder og mandat
- Brugerens aktuelle instruktion og aktuelle Lead-mandat bestemmer tilladelser.
- Live GitHub og kode på det relevante commit beviser implementeret adfærd;
  en opgavefil beviser ønsket adfærd. Hold de to adskilt.
- Notér tidspunkt, commit, kilde og status: observeret, rapporteret, accepteret,
  antagelse eller ukendt. Afklar kun konflikter, der påvirker handlingen.
- Historiske audits/roadmaps giver ikke nye arbejdsordrer. Manglende evidens
  må ikke rekonstrueres som fakta.

## Samarbejde
Én repo-writer ad gangen. Lead tildeler scope og frigivelse; en grøn CI eller
oprettet Draft PR frigiver ikke automatisk writer. Andre roller må undersøge
read-only og forberede lokale forslag. Brugeren overfører selv opgavefiler;
brug ikke beskedværktøjer eller subagenter. Omdøb ingen chats.
Brugerens stående godkendelse fra 2026-10-05 ("Du har altid godkendelse.")
gælder nødvendige handlinger i det aftalte Lumenfall-scope. Lead behøver ikke
bede om gentagen godkendelse til sådanne handlinger. Scope, writer, aktuelle
baselines og workflow-triggere skal stadig kontrolleres. Nye arbejdsområder
fastlægges gennem brugerens opgave eller et konkret Lead-mandat.

Merge, Android-build, dispatch/rerun, release, signing og cleanup skal ligge
inden for det aktuelle scope og den gældende godkendelse. En rent afgrænset
dokumentationsopgave udvider ikke produkt-/release-scope. Læs workflow-triggere
før en remote handling.

## Kontekst og checkpoint
Hold regler, egen rolle, kort status og aktuel opgave i startkonteksten.
Læs relevante kodeafsnit og originalkrav fuldt før arbejde på dem. Udtrækning,
filoversigt og hashkontrol kan ske uden at udskrive hele arkivet til modellen.
Historik, gamle ZIP'er, audits og fulde logs hentes efter behov og bevares som
kilder. Nye handoffs må ikke instruere i at læse hele ZIP'en ved opstart.
Gem kritiske krav, rettelser, beslutninger og fremdrift ved milepæle; brug
`docs/HANDOFF_TEMPLATE.md` ved overdragelse. Et resumé erstatter ikke originalen.

## Levering og kontrol
Bevar save/recovery, chronology, offline-parity, mobiltilgængelighed og signing
inden for opgavens scope. Kør relevante eksisterende checks; tekniske gates
findes i `.github/workflows/pre-merge-validation.yml`. Oplys begrænsninger.
Svar på dansk. Angiv model og effort for hver ny arbejdsopgave. Lever filer,
så brugeren kan hente TXT og ZIP på telefonen uden manuel samling.

