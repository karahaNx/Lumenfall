from pathlib import Path
import zipfile, hashlib, json
from datetime import datetime, timezone

ROOT = Path('/workspace/scratch/beb9febc5cd0')
UPLOAD = ROOT / 'upload'
OUT = ROOT / 'deliverables'
OUT.mkdir(exist_ok=True)
stem = 'Lumenfall_B2_Runtime_00_16_Til_02_08_2026-10-07'
bootstrap = '''LUMENFALL — 00_16 til eksisterende 02_08 — B2-runtime genoptagelse
Model: GPT-6.1 Sol · Effort: Ekstra høj. Dansk. Omdøb ingen chats.
Lead er nu 00_16. Læs denne TXT først, derefter kun Source_Index.txt.
Læs live AGENTS.md eksplicit → kun egen række i CHAT_OWNERSHIP →
docs/agents/02_GAMEPLAY.md → PROJECT_STATE → LEAD/DECISION_00_16.txt.
Læs ikke hele ZIP'en eller råarkiverne ved opstart. Den gamle repo-status
er et snapshot, ikke evidens for aktuelle chats eller writerfrigivelse.

AKTUEL BESLUTNING
Din genaflevering er samme gamle lokale tree
4c07cd5d66cb5928eb99623ff86efaa81e268829, index SHA256
3de412b53421f173d3826ddf6336f066abf43cc09d88cbbc0e23bf6984212ed9.
Alle13 sourcefiler matcher den kandidat, som QA allerede har blokeret.
Core01_06 er nu også BLOCKED C-RT-B2. Numeriske moderne-engine-beviser
lukker de gamle minima på disse bytes, men giver ingen runtimeaccept.
Den gamle BigInt-kandidat må ikke pushes eller bruges som færdig rettelse.

GENOPTAG LOKAL FASE A NU
Følg hele RUNTIME/TASK_LAB_MOTES_B2_RUNTIME_001.txt og alle dens originale
LAB/B1/B2-krav. Bevar WebView60. Erstat obligatorisk BigInt i produktet med
baseline-kompatibel, begrundet exact arithmetic for repræsenterede Numbers.
Ingen runtimefloor-/native-/dependency-/workflow-/signing-/balanceændring.
Ingen større EPS, ny gameplaycap, per-kill-loop eller nye feedbackpunkter.
Core-pakkens forslag om alternativ runtimekontrakt er ikke valgt af Lead.
Core fandt faktisk oldV8 syntaxFAIL; brug dens reproducer efter behov.
Kør nye runtime-/motor-/oracle-/performance-/gatekontroller på nye frozen bytes.
Gamle positive reviews, CI og gates er kilder, ikke accept af den nye rettelse.

WRITER / LEVERING
Stop-TXT'en fra02_07 er kun en instruks fra Lead, ikke en stopaflevering.
02_07's senere B2-processer/ændringer/frigivelse er stadig ukendt. Genoptag
kun i egen isoleret kopi. Remote faseB holdes tilbage i denne genoptagelse,
indtil00_16 har vurderet den nye kandidat og dokumenteret writerhandover.
Ingen push/PR-metadata/kommentar/ready/merge/build/dispatch/rerun/release/cleanup.
Det kræver ikke ny generel brugerbekræftelse; det er kandidat-/writerkontrol.
Ingen subagenter/beskedværktøjer. Brugeren overfører pakker.
Aflever til00_16: lille START-TXT + ZIP med nyt fulltree/sourcehashes,
R2→ny og blokeret→ny diff, fulde originaler, sourceindex/manifest, rå evidens,
egen proceslukning og ærlige runtime-/fysiskAndroid-/clippingbegrænsninger.
Derefter udsteder00_16 nye scoped Core-/QA-reviews på den præcise nye kandidat.
'''
decision = '''00_16 — modtagelsesbeslutning, 7. oktober2026 Europe/Copenhagen
Model GPT-6.1 Sol · Effort Ekstra høj.

MODTAGET / VERIFICERET
02_08 ekstern TXT matcher RESULT.txt byteidentisk. Kandidaten er uændret:
tree4c07cd5d66cb5928eb99623ff86efaa81e268829,
indexSHA2563de412b53421f173d3826ddf6336f066abf43cc09d88cbbc0e23bf6984212ed9.
65 workerpayloads og1322 rawfiler hash-/størrelsesverificeret; ingen ekstra,
manglende eller duplikerede payloads; ZIP CRC består.
Corepakken:92 payloads,132 egne rawfiler og1322 workerrawfiler verificeret.
Alle13 Core/worker/RUNTIME kandidatfiler er byteidentiske.
Modtagelse med senere filnavn/tid er derfor ikke evidens for en ny rettelse.

CORE STATUSDELTA — RAPPORTERET, IKKE LEAD-GENKØRT MOTOR
01_06: samlet BLOCKED C-RT-B2. Begge B2-minima numerisk CLOSED alene på det
exact lokale tree under moderne engines. Core rapporterer egen48-row motor/
1088assertions og3219helperinputs med independent Fraction-oracle, plus scoped
økonomi/save-regressioner. Core har kørt Node8.17/V86.2 actual syntaxkontrol:
R2 begge inline-scriptsPASS; local hovedscriptFAIL ved32n. Det er ikke fysisk
Android/WebView60. Fuld original CORE_REPORT og egne rawbeviser er bevaret.
Core's alternativ om runtimekontrakt er ikke et autoriseret scope. Eksisterende
Leadvalg: bevar60 og ret arithmetic. Ingen native-/workflowændring her.

EGEN LEAD-KONTROL
Frisk GitHub GET 2026-10-06T22:58:37Z: main/base
1ddc246eb62782a61ec5c486cd5f51ea170bb338,
main treebfb3970b29485b3e8ece1c72bb60186eb2ba755e.
PR46 open/Draft, remoteR2/proposed parent
3cdebc236e9ee5081a4bca4e323b11f43aa0d46d, ingen merge.
Ingen fuld branch/run/writerpreflight udført i denne read-only-modtagelse.
SHA'er er checkpoints, ikke resetmål. Preflight kræves frisk før remote handling.
00_16 har genkørt den bevarede00_15 driver byteuændret på Node24.19:
R2 scripts parserES2017–20 og90kill helperPASS udenBigInt; local hovedscript
FAIL ES2017/18/19 oghelperTypeError udenBigInt. ES2020 parsingPASS.
Driveren har gammel statisk rollelabel00_15; RECEIPTS note binder kørslen til
00_16. Batchsideeffekter er stubbet. Det er ikke nyt fuldmotor-, oldV8- eller
fysiskAndroid-review og lukker ikke den eksisterende blocker.

WRITER
Den afleverede Lumenfall_Stop_02_07_Til_02_08_2026-10-06.txt indeholder en
Lead-stopinstruks, ingen02_07 svarstatus eller udtrykkelig ny frigivelse.
02_07s senereB2-processer/nyere ændringer/writerstop er stadig ukendt.
02_08s kendte egne processer er meldt afsluttet i den gamle aflevering.
FaseA lokal runtimekorrektion er autoriseret nu; intet writer-overtagelsesclaim.
Ældre betinget faseB er på hold for denne genoptagelse indtil nyt Lead-checkpoint
med rettet kandidat og dokumenteret writerhandover. Stående brugergodkendelse
gælder; der er ingen ny generel tilladelsesforespørgsel.

NÆSTE HANDLING
02_08 skal implementere og levere runtimekorrektionen til00_16 efter hele det
bevarede runtime-mandat med nye frozen bytes og nye kontroller. Ingen patch
af gammelaccept, ingen push af blokerede bytes. Lead tildeler scoped nye Core/
QA-reviews bagefter; gamle positive reviews overføres ikke automatisk.
02_07 skal returnere konkret stop-/writerstatus i svar på den eksisterende
instruks. Stopinstruks/unchangedHEAD/0runs/UIfejl beviser ikke proceslukning.
FysiskAndroid/TalkBack og intermittentmobileclipping-rootcause er uafklaret.
29 feedbackpunkter forbliver separat fremtidigt scope efterPR46.
'''
index = '''00_16 →02_08 — målrettet kildeindeks
START: BOOTSTRAP.txt →live egenrolle/regler →LEAD/DECISION_00_16.txt.
KUN DENNE ROOT-BOOTSTRAP er ny opstart; ældre START-filer er historiske.

AKTIV RUNTIMEKONTRAKT
RUNTIME/TASK_LAB_MOTES_B2_RUNTIME_001.txt: fuldt eksisterende runtimefixmandat.
Rootbootstrap/Leadbeslutning ændrer Leadmodtager til00_16 og holder remotefaseB.
RUNTIME/Source_Index.txt: målrettet navigation i den fuldt bevaredeQA-pakke.
RUNTIME/QA_04_05/ORIGINALS/LAB/* samt TASK_LAB_MOTES_B1_001.txt/B2_001.txt:
fulde originals; læs før relevant implementation. Ingen nyt feedbackscope.
RUNTIME/QA_04_05/SOURCE/: alle13filer på den blokerede exactlocalkandidat.
RUNTIME/QA_04_05/REFERENCE/: exactR1/R2index til causalcontrols.
RUNTIME/QA_04_05/BASE_SOURCES/: uændrede baselineassets; ikke et komplet repo.
Byg privat fra exactR2; overlay13sources ogverificér fulltree før ændring.
RUNTIME/QA_04_05/REPRODUCE_README.txt ogREPRODUCE/: motor/Fraction/gates.
RUNTIME/QA_04_05/RAW_EVIDENCE.tar.xz +RAW_MANIFEST.json: fuld781rawpakke.
Targetedtar læses vedQA_04_05roden; ikke fuldstartindlæsning.

NY CORELEVERING — FULD ORIGINAL OG EVIDENS
CORE_01_06/CORE_REPORT.txt: blocker/faktiskoldV8/resultater/afgrænsninger.
CORE_01_06/Source_Index.txt: præcise egne/raw/workerpaths.
CORE_01_06/reproduce/REPRODUCE.txt: commands/privatepaths efterbehov.
CORE_01_06/RUNTIME_SOURCES/: låstCapacitor6.2.1Java/config.
CORE_01_06/OWN_RAW.tar.xz +OWN_RAW_MANIFEST.json:132 egnebeviser.
CORE_01_06/WORKER_RAW_CURRENT.tar.xz +WORKER_RAW_MANIFEST.json:1322workerraw.
SOURCE/DIFF/ORIGINALS iCorepakken er bytebevarede. Dens gamleTASK_REVIEW/START
er historiske reviewmandater, ikke en ordre til02_08 om at bliveCore.

MODTAGELSESKONTROLLER
LEAD/WORKER_RESULT_RECEIVED.txt: præcis gammel02_08genaflevering.
LEAD/STOP_INSTRUCTION_RECEIVED.txt: instruks, aldrig faktisk02_07frigivelse.
RECEIPTS/input_verification.json: egen input/rawintegritet.
RECEIPTS/live_main.json +live_pr46.json: friske relevanteGETs, ikke fuldpreflight.
RECEIPTS/runtime_recheck.json +runtime_recheck_note.txt: egen afgrænsetreplay.
RUNTIME/LEAD/runtime_reproduce.cjs: genbrugt originaldriver, batchstubs/limits.
MANIFEST.json: allepayloadstørrelser/SHA256 undtagen manifestetselv.
Ingen rekursivZIP, APK, dependencies, signingmateriale ellercredentials.
'''
payloads = {'BOOTSTRAP.txt': bootstrap.encode(), 'Source_Index.txt': index.encode(),
            'LEAD/DECISION_00_16.txt': decision.encode()}
with zipfile.ZipFile(UPLOAD/'Lumenfall_00_16_Lead_Context_2026-10-07.zip') as src:
    for name in src.namelist():
        if name.startswith('B2_RUNTIME/'):
            payloads['RUNTIME/'+name[len('B2_RUNTIME/'):]] = src.read(name)
with zipfile.ZipFile(UPLOAD/'Lumenfall_B2_Local_Core_BLOCKED_01_06_Til_00_15_2026-10-06.zip') as src:
    for name in src.namelist():
        payloads['CORE_01_06/'+name] = src.read(name)
payloads['LEAD/WORKER_RESULT_RECEIVED.txt'] = (UPLOAD/'Lumenfall_B2_Local_02_08_Til_00_15_2026-10-06.txt').read_bytes()
payloads['LEAD/STOP_INSTRUCTION_RECEIVED.txt'] = (UPLOAD/'Lumenfall_Stop_02_07_Til_02_08_2026-10-06.txt').read_bytes()
for name in ['input_verification.json','live_main.json','live_pr46.json']:
    payloads['RECEIPTS/'+name] = (ROOT/'lead16_review'/name).read_bytes()
payloads['RECEIPTS/runtime_recheck.json'] = (ROOT/'lead16_review/B2_RUNTIME/LEAD/runtime_reproduce.json').read_bytes()
payloads['RECEIPTS/runtime_recheck_note.txt'] = '''00_16 independently executed the unchanged 00_15 driver on 2026-10-06T22:58:58Z.
The driver's static role field still says 00_15; it is preserved unchanged.
Command: node lead16_review/B2_RUNTIME/LEAD/runtime_reproduce.cjs; exit0.
Same input SHA256 values confirmed. Batch effects stubbed; no full engine,
actual older runtime or physical Android run by00_16. Core oldV8 is reported
and byte-preserved Core evidence, not a00_16 engine execution.
'''.encode()
manifest = {name:{'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()} for name,data in sorted(payloads.items())}
manifest_bytes = (json.dumps({'schema':1,'issued_by':'00_16','to':'02_08','created_at':datetime.now(timezone.utc).isoformat(),'payloads':manifest},ensure_ascii=False,indent=2)+'\n').encode()
txtpath=OUT/(stem+'_BOOTSTRAP.txt');txtpath.write_bytes(payloads['BOOTSTRAP.txt'])
zippath=OUT/(stem+'_Context.zip')
with zipfile.ZipFile(zippath,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for name,data in sorted(payloads.items()):z.writestr(name,data)
    z.writestr('MANIFEST.json',manifest_bytes)
with zipfile.ZipFile(zippath) as z:
    assert z.testzip() is None
    assert z.read('BOOTSTRAP.txt') == txtpath.read_bytes()
    assert set(z.namelist()) == set(manifest)|{'MANIFEST.json'}
    for name,row in manifest.items():
        b=z.read(name);assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
print(json.dumps({'files':[str(txtpath),str(zippath)],'payloads':len(payloads),'zip_bytes':zippath.stat().st_size,'all_checks':'PASS'},ensure_ascii=False))
