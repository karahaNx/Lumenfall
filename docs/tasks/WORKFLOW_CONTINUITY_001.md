# WORKFLOW-CONTINUITY-001 — regler og fortsætteligt projekt

Dato: 7. oktober 2026. Scope: dokumentation i `karahaNx/Lumenfall`.
Ejerchat: `Add project workflow to AGENTS.md` (Codex-thread
`01a11602-5000-708b-8138-0fc877e42069`). Rolle/writer: Lead, kun dette docs-scope.
Baseline: main `eb00fdf32593b96967752d34c29420aeaa847f8a`.
Brugerens bestilling og stående godkendelse autoriserer nødvendig integration
af dokumentationen. Ingen produkt-writer eller releaseopgave er tildelt.

## Originalkrav

> We must have an agents.md with the games rules and when we need to add a new rule, you must tell me that aswell.
> When we have to make a new feature to the game, then it means 1 chat 1 feature, when its done we have to be sure its done and implemented, then we archive that chat.
> I don't want to be worried if one day my account is gone, then i should be able to create a new account on CGPT and then just continue my project.

Brugeren valgte specifikt `Lumenfall (karahaNx/Lumenfall on GitHub)`.

## Acceptkriterier

1. Rodens AGENTS.md samler etablerede spil-/arbejdsregler og kræver besked
   til brugeren, når en ny eller ændret regel er nødvendig.
2. Én feature pr. ejerchat; konkrete acceptkriterier, implementering,
   verificeret integration og gemt status før arkivering.
3. Guide/startprompt til en ny ChatGPT-konto med fortsat GitHub-adgang.
   Recoverygrænser, miljøsetup, selvstændig backup og signing er beskrevet.
4. Bootstrap, projektinstruktioner, rolle-/status-/handoffdocs og README følger
   samme workflow. Historiske originals/kandidater bevares uændret.
5. Dokumentationen er integreret i main, beviser er gemt, og afsluttende
   context/link-/scopekontrol består. Derefter frigives docs-writer og ejerchat
   arkiveres; ingen APK/devicegate er relevant for denne dokumentationsopgave.

## Beslutninger og nye regler

De tre arbejdsregler er brugerbesluttede: fortæl om nye regler; én feature pr.
chat med verificeret afslutning før arkivering; gem projektviden uden for
ChatGPT-kontoen. De er meldt til brugeren i ejerchatten. Spilafsnittet samler
eksisterende kontrakter fra README, status, workflow og produktkoden; ingen
ny mekanik/cap/balancebeslutning tilføjes.

## Levering

Status: dokumentationskandidat klar til GitHub-integration. Docs-writer aktiv
indtil dokumenteret integration. GitHub PR/integrationscommit og afsluttende
beviser tilføjes ved levering.
Arkivstatus: afventer verificeret afslutning og succes fra appens arkivværktøj.
Næste handling: dokumentationskontrol, GitHub-integration og writer-frigivelse.

Kandidatkontrol:
- `git diff --check`: PASS.
- `python3 scripts/codex/check_context.py --archives`: PASS; 21 indgange,
  22 lokale Markdown-links, obligatorisk Lead-opstart 15.017 bytes; 1.509
  archive/coveragechecks og alle 96 B2-kildefiler på oprindeligt tree bestod.
- De 13 ændrede/tilføjede dokumenter: 25 relative links uden manglende targets;
  UTF-8 og code fences bestod. Kun AGENTS/README/bootstrap/instruktioner/docs.
- Produktbytes og historiske originals er bevaret. APK/devicechecks er ikke
  relevante; almindelig PR-CI kører efter GitHub-publicering.
