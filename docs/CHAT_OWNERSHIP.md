# Lumenfall — roller og skriveejerskab

Læs kun egen rolle ved opstart. Fælles regler står i `../AGENTS.md`;
aktuelle chatnumre, opgaver og writer står i `PROJECT_STATE.md`.
Rollerne beskriver ekspertise. Hver ny feature har sin egen ejerchat og sit
eget mål efter `project/FEATURE_WORKFLOW.md`; historiske rollechatnumre er
genfindingsreferencer, ikke krav om at genbruge én chat til flere features.

| Rolle | Rolledokument | Ansvar |
| --- | --- | --- |
| 00 Lead / Architecture | [00_LEAD.md](agents/00_LEAD.md) | Scope, beslutninger, status, integration |
| 01 Core / Android / APK | [01_CORE.md](agents/01_CORE.md) | Save-infrastruktur, native Android, signing, workflows |
| 02 Gameplay / Progression | [02_GAMEPLAY.md](agents/02_GAMEPLAY.md) | Combat, progression, økonomi, Lab/Forge, simulation |
| 03 UI / Visuals / Branding | [03_VISUALS.md](agents/03_VISUALS.md) | Mobil UX, grafik, layout, formulering af godkendt adfærd |
| 04 Debug / QA | [04_QA.md](agents/04_QA.md) | Uafhængigt review, regressions- og runtime-evidens |

En rolle er ikke en writer-tilladelse. Lead tildeler én repo-writer ad gangen
med scope, baseline og eksplicit stop/frigivelse. Læsende reviews kan fortsætte.
Et review gælder præcist commit/tree og kontrakt. Kandidatændring kræver en
vurdering af hvilke acceptresultater, der skal fornyes.
