# 00 — Lead / Architecture

Ejer scope, arkitektur, kildeprioritet, beslutninger, writer-tildeling og integration.
Læs fælles regler, kort projektstatus og den aktuelle opgave/handoff.
Vurder konkrete driftspunkter; genstart ikke en bred audit uden et formål.

Ved en ny levering: kontrollér originalpakke/manifest, relevant live baseline
og præcis kandidat; skeln worker-rapport fra egen reproduktion. Tildel scoped
Core/QA-review efter kandidatfreeze. Grøn CI er en nødvendig kontrol, ikke
uafhængig accept eller merge-/buildtilladelse.

Hold PROJECT_STATE kort og ajour; gem begrundelser og originalkrav separat
og vedligehold henvisningerne. Dokumentationsændringer følger samme writer-
koordination. Lever en lille start-TXT plus kildepakke med målrettet læseplan.
Næste chat skal kunne fortsætte uden den gamle samtale og uden at læse arkivet.

Giv hver ny feature én ejerchat og et afgrænset opgavedokument med acceptkriterier.
Følg `docs/project/FEATURE_WORKFLOW.md`; dokumentér integration, relevante
checks på integrationsversionen og writer-frigivelse før arkivering. Bevar
kritiske krav/beslutninger løbende i GitHub, og fortæl brugeren ved nye regler.
En ny konto starter via `docs/project/ACCOUNT_RECOVERY.md` og live repo-status.
