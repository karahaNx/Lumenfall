# Lumenfall — aktuel projektstatus

Updated 7 October 2026 for OFFLINE-CATCHUP-001 (merged and published as Android0.1.134; required device acceptance pending). Repository: `karahaNx/Lumenfall`, standardbranch `main`.
Kontrollér live GitHub før handling; SHA'er er checkpoints.

## Produkt og aktuel kandidat

Produktbaseline: `1ddc246eb62782a61ec5c486cd5f51ea170bb338`, tree
`bfb3970b29485b3e8ece1c72bb60186eb2ba755e`. Live main `67c3e99c24587f6c13fc65cfd27f8dcb8e289602` was verified for this feature; its product bytes match that baseline. OFFLINE-CATCHUP-001 and the active Node.js tooling migration are now integrated in main `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`, via [merged PR #51](https://github.com/karahaNx/Lumenfall/pull/51). The user instructed: "then finish the job". The integrated tree exactly equals the validated PR head `bd71a8608d133f99971a74a79e300e1f5db254df`. [CI37625068008](https://github.com/karahaNx/Lumenfall/actions/runs/37625068008) passes132 scenarios and12 required negatives. Current release: **0.1.134**, package `com.lumenfall.app`, [successful Android build37626819252](https://github.com/karahaNx/Lumenfall/actions/runs/37626819252). The downloaded APK has verified package/version, established certificate/v1/v2 signatures, CRC and byte-identical product/font/branding assets. Physical Android/WebView60/TalkBack acceptance remains pending. Durable release evidence: `qa/offline-catchup-001/release/README.md`.
Previously accepted APK: **0.1.133**, package `com.lumenfall.app`, run `37363152517`.
Receipts: `decisions/2026-10-05-nav001-integration-release.txt`.
P0/P1, Forge/Lab, Formation, Measured Inquiry og NAV-001 er integreret.

| Arbejde | Status og næste handling |
| --- | --- |
| PR46 / LAB-MOTES | Observeret open/Draft på R2 `3cdebc236e9ee5081a4bca4e323b11f43aa0d46d`. R2s grønne CI accepterer ikke nyere bytes. |
| Tidligere lokal B2 | Tree `4c07cd5d66cb5928eb99623ff86efaa81e268829`: Core/QA BLOCKED; obligatorisk BigInt bryder WebView 60-baseline. |
| Ny B2-runtimekandidat | Tree `758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef`; kodecommit `013f526` på Gameplay-arkivgrenen. Worker rapporterer Number/DataView-fix, 7 gates, 142 scenarier og 12 fangede negatives. **Nye scoped Core-/QA-reviews mangler.** |
| FEEDBACK-REVISION-001 | 29 punkter, fuld original og fire billeder. Efter PR46: først F20/F21 Echoing Rest cap 6 / Cheaper Bonds cap 20, købsgates og gammel-save-politik. Øvrige scopes følger dependencies. |
| OFFLINE-CATCHUP-001 | Bounded/transactional catch-up and active Node.js tooling are merged in PR51 and published as verified signed APK0.1.134. Original-save/core/browser/full-suite/negative-control and extracted-APK V8 checks pass. Required physical-device/WebView60/TalkBack acceptance remains pending; concrete checks and immutable APK identity are in `qa/offline-catchup-001/release/`. Feature stays open. |

Ny kandidats index SHA256:
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
Fuld aflevering, alle 96 kildefiler og egne beviser: `handoffs/02_08/2026-10-07/`.
De 1.340 diagnostikforløb har fortsat 379 strikte assertionfejl på R2/ny kandidat
ifølge worker; ingen samlet grøn stresstest påstås. Fysisk Android/WebView60/
TalkBack og tidligere intermittent clipping-rootcause er utestet/ukendt.
Bevar runtimebaseline 60.

## Ejerskab og konkret fortsættelse

Historiske chats: Lead 00_16, Core 01_06, Gameplay 02_08; 02_09-recovery blev
udstedt før den nyere 02_08-levering; Visuals 03_05, QA 04_05.
En ny Codex-projektchat starter som Lead, medmindre brugeren tildeler en rolle.
02_08s eget lokale kandidatstop/processlukning er dokumenteret i leveringen.
02_07s senere B2-writerrelease er fortsat ukendt. Arkivpublicering tildeler
ingen ny produkt-writer og opdaterer ikke PR46.

Brugerens aktuelle docs-mandat omfatter at gøre opstart/kilder klar på main.
Dette scope frigives efter dokumenteret integration; øvrige writerforhold
ændres ikke. Stående godkendelse fra 5. oktober gælder bestilt scope.

Workflowmandat 7. oktober: `tasks/WORKFLOW_CONTINUITY_001.md` bevarer brugerens
krav om regler, én feature pr. chat og fortsættelse fra ny ChatGPT-konto.
Lead i denne ejerchat har kun docs-writer til det bestilte scope. Den konkrete
integration og writer-frigivelse registreres i opgavedokumentets PR49-receipt; produktwriter
og åbne B2-/PR46-reviews ændres ikke. Nye features følger
`project/FEATURE_WORKFLOW.md`; kontoskift følger `project/ACCOUNT_RECOVERY.md`.

Sprogregel 7. oktober: JavaScript til kode, tests, CI-logik og hjælpescripts,
hvor teknisk muligt; HTML er fortsat tilladt. Nyt og ændret arbejde følger
reglen. The active Python tooling has now been replaced by verified Node.js
tools in integrated OFFLINE-CATCHUP-001/PR51; archived originals remain intact.
The policy itself changes no product bytes. Opgave/receipt: `tasks/JAVASCRIPT_FIRST_001.md`;
beslutning: `decisions/2026-10-07-javascript-first.md`.

Næste B2-handling: kontrollér live baseline, læs ny leverings START/identity,
genskab det præcise tree separat, og udsted nye scoped Core-/QA-reviews.
Gem reviewdelta i denne status. Integrér efter kandidataccept og handover.
OFFLINE-CATCHUP-001 now has its own user mandate and isolated local branch `feature/offline-catchup-001`. It is not folded into PR46. The user explicitly authorized feature-branch/PR publication: "You must publish it to the github, so it knows it." The later instruction "then finish the job" explicitly authorizes this feature integration/release despite historical writer uncertainty. 02_07 release remains unknown; no handover is invented. PR46/B2 remain untouched. English is the current user preference.
The user also requested JavaScript in place of Python. Active tools/CI helpers now use Node.js; historical originals remain hash-preserved. This tooling follow-up changes no game bytes and is integrated with the implementation, original request, decisions and validation receipts in merged PR #51. Exact-head CI and self-review are recorded; independent review is not claimed. The final documentation checkpoint records the release/device checklist and releases this feature owner's repository writer after verified publication. Device acceptance is the next action; keep the owner chat open. See `decisions/2026-10-07-offline-catchup-integration.md`.

Historisk status: `project/PROJECT_STATE_2026-10-05_HISTORICAL.md`.
Ældre recovery-status bevares byteidentisk; denne fil er den aktuelle indgang.
P2-04/native, P2-05/release-hardening og A40 forbliver deferred/udgået.
