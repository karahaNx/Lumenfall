from pathlib import Path
from datetime import datetime, timezone
import zipfile, json, hashlib, re

ROOT=Path('/workspace/scratch/beb9febc5cd0')
OUT=ROOT/'deliverables'
REF=ROOT/'lead16_review'
source=OUT/'Lumenfall_B2_Runtime_00_16_Til_02_08_2026-10-07_Context.zip'
stem='Lumenfall_02_09_B2_Runtime_Recovery_2026-10-07'

bootstrap='''Du er 02_09 — Gameplay / Progression for Lumenfall.
Lead: 00_16. Repository: karahaNx/Lumenfall. Dansk. Omdøb ingen chats.
Model: GPT-6.1 Sol · Effort: Ekstra høj.

Læs denne TXT først, derefter Source_Index.txt. Læs live AGENTS.md eksplicit,
kun din egen rolle i docs/CHAT_OWNERSHIP.md, docs/agents/02_GAMEPLAY.md og
docs/PROJECT_STATE.md. Læs derefter CURRENT_STATE.txt og
LEAD/TASK_02_09_RECOVERY_001.txt. Læs ikke hele ZIP'en eller råarkiverne.
Den gamle repo-status er et dateret snapshot; Lead er nu 00_16.

HVORFOR NY CHAT
02_08 kan ifølge brugeren ikke modtage nyt arbejde og viser gentagne
forbindelsesafbrydelser. Dens nyere lokale kode, testresultater og processer
er ukendte. Dette er recovery fra sidste verificerede aflevering, ikke en
påstand om et fuldført handoff fra 02_08. Dens arbejde må ikke overskrives.

OPGAVE OG CHECKPOINT
Afslut B2-runtimekorrektionen lokalt efter det fulde bevarede mandat i
RUNTIME/TASK_LAB_MOTES_B2_RUNTIME_001.txt og alle LAB/B1/B2-originalerne.
Bevar WebView60 og erstat obligatorisk BigInt i produktet med kompatibel,
begrundet præcis aritmetik. Ingen nye gameplaycaps, større tolerancer,
native-/dependency-/workflow-/signingændringer eller nyt feedbackscope.

Live kontrol 2026-10-07T08:31:12Z: main/base
1ddc246eb62782a61ec5c486cd5f51ea170bb338; PR46 stadig open/Draft/R2
3cdebc236e9ee5081a4bca4e323b11f43aa0d46d. Verificér igen før beslutninger.
Seneste verificerede lokale tree er 4c07cd5d66cb5928eb99623ff86efaa81e268829;
index SHA256 3de412b53421f173d3826ddf6336f066abf43cc09d88cbbc0e23bf6984212ed9.
Denne gamle BigInt-kandidat er BLOCKED hos både Core og QA og må ikke pushes.
Ingen nyere runtimefix er modtaget af Lead.

EJERSKAB / NÆSTE HANDLING
Lokal fase A i en ny, egen privat kopi er autoriseret nu. Ingen remote writes
eller writer-overtagelse; 02_07's senere frigivelse og 02_08's processtatus
er ukendte. Rør ikke deres mapper, processer, logs eller kandidater.
Ingen subagenter/beskedværktøjer. Brugeren overfører filer.
Bekræft kort adgang og baseline, byg privat fra exact R2 + SOURCE-overlay,
verificér tree/hashes, læs krav og begynd den afgrænsede rettelse. Arbejd med
synlige milepæle og gem checkpoints; undgå blind gentagelse af hele suiten.
Aflever ny frozen kandidat med egne runtime/motor/oracle/performance/gates,
originaler, rå beviser, processtatus, lille TXT og ZIP til Lead00_16.
'''

state='''02_09 — CURRENT STATE fra Lead00_16, 7. oktober2026

OBSERVERET LIVE
2026-10-07T08:31:12Z (10:31 København): main/base
1ddc246eb62782a61ec5c486cd5f51ea170bb338,
tree bfb3970b29485b3e8ece1c72bb60186eb2ba755e.
PR46 open/Draft; branch02/lab-motes-repeat-v1; R2/proposed parent
3cdebc236e9ee5081a4bca4e323b11f43aa0d46d.
Dette er relevant read-only baseline, ikke fuld branch/run/writerpreflight.

SENESTE VERIFICEREDE LOKALE LEVERING
Tree4c07cd5d66cb5928eb99623ff86efaa81e268829.
index SHA2563de412b53421f173d3826ddf6336f066abf43cc09d88cbbc0e23bf6984212ed9.
13 main→local SOURCE-filer, fem R2→local ændringer. Ingen remoteR3.
02_08-genafleveringen er byteidentisk med gammel QA/Core-kandidat, ikke ny fix.
Worker65 payloads/1322raw; Core92payloads/132ownraw/1322workerraw blev
hash-/størrelses-/CRC-verificeret af00_16. Alle13sourcefiler matcher.

ACCEPT OG BLOCKER
QA04_05 BLOCKED QA-B2-RUNTIME-01; Core01_06 BLOCKED C-RT-B2.
Numeriske minima er lukket på gamle bytes i moderne engines ifølge reviews;
produktets BigInt/literals bryder eksisterende WebView60-baseline.
Core rapporterer faktisk Node8.17/V86.2 parserFAIL ved32n for hovedscriptet;
R2 parserPASS. Lead har selv genkørt boundedgrammar/API-fravær-kontrol på
Node24 med batchstubs; ingen ny fysiskAndroid eller fuldmotoraccept.
Bevar60. Ingen alternativ runtime-upgrade er valgt eller tilladt.

UKENDT / RAPPORTERET
Brugeren rapporterer, at02_08 vedvarende viser forbindelsesafbrydelse og
ikke kan lave nyt arbejde, også efter forsøg på en lille statusbesked.
Screenshot viste "Connection interrupted. Waiting for the complete answer".
Det beviser ikke, at lokale processer er stoppet. Dens arbejde siden gamle
frozen aflevering er ukendt; ingen ny kode eller beviser er modtaget.
02_07's senereB2-processer/ændringer/frigivelse er stadig ukendt.
Den modtagne stop-TXT er en Leadinstruks, ikke02_07's faktiske svar.
Ingen adgang til eller sikker gendannelse af02_08's nyere scratch påstås.

TILLADELSE
02_09 må arbejde lokalt i en ny egen isoleret kopi, uafhængigt af gammel
writerfrigivelse. Ingen remote writes, docswrite, push, PR-kommentar/metadata,
ready/merge/build/dispatch/rerun/release/signing/cleanup. Ingen parallelle
repo-writers. Gamle betingede faseB-instrukser er på hold for denne recovery.
Stående brugergodkendelse gælder; der kræves ingen ny generel bekræftelse.

BEVAREDE LIMITS / ANDRE SCOPES
1340 diagnostics har123strict rows/379assertionfejl; gamle rawFAILs bevares.
Intermittentmobileclipping er uafklaret; ingen accepteretUI-fix.
FysiskAndroid/WebView/TalkBack utestet. A40 er udgået af aktive krav.
Alle29 feedbackpunkter er separate fremtidige scopes efterPR46; ikke del af
denne arithmetic-recovery. Ingen bred audit/genstart af færdige opgaver.
'''

task='''TASK_02_09_RECOVERY_001 — aktuelt mandat fra00_16
Model GPT-6.1 Sol · Effort Ekstra høj. Repository karahaNx/Lumenfall.

MÅL OG KILDEPRIORITET
Genskab den sidste verificerede B2-kandidat privat og afslut den manglende
runtimekorrektion med nye frozen bytes og faktiske egne kontroller. Den fulde
runtimekontrakt i RUNTIME/TASK_LAB_MOTES_B2_RUNTIME_001.txt og de fem originale
LAB/B1/B2-krav gælder uændret. Denne fil supplerer dem med rolle02_09,
Lead00_16, recovery-afgrænsning og remotehold. Ældre opstarts-/reviewfiler er
historiske kilder; de gør dig ikke til02_08, Core eller QA.

HVAD RECOVERY BETYDER
02_08 er praktisk utilgængelig ifølge brugeren. Vi har hverken en ny kandidat,
et processtop eller dokumenteret nyere arbejdsstatus fra den chat. Forsøg
ikke at rekonstruere dens ukendte fremdrift som fakta. Gamle worker/Core/QA
sources og rå beviser er fuldt bevaret her. En ny egen implementering på disse
kendte bytes er autoriseret; ingen genbrug af ukendt nyere produktkode.
Eventuel senere02_08-levering skal gemmes særskilt og vurderes af Lead; ingen
automatisk overlay eller overskrivning af din nye kandidat.

OPSTART OG PRIVAT GENSKABELSE
1. Læs den korte startup, live fællesregler og kun egen Gameplayrolle. Den
   gamle PROJECT_STATE dateret5oktober er ikke nutidigt writerbevis.
2. Verificér live main ogPR46. SHA'er er checkpoints, ikke resetmål. Rapportér
   afvigelser og vurder deres betydning; fortsæt read-only undersøgelse uden
   at retargete, rebase, force-pushe eller skrive remote.
3. Opret en ny privat kopi fra exactR2. Overlæg de13 SOURCE-filer fra
   RUNTIME/QA_04_05/SOURCE, kontroller hver hash og beregn fulltree. Uændrede
   filer kommer fra R2; BASE_SOURCES er ikke et komplet repository.
   Det genskabte tree skal matche4c07cd5d66cb5928eb99623ff86efaa81e268829.
4. Brug ikke02_07/02_08's mapper/processer. Kontroller og registrer kun egne
   processer; stop ikke ukendte processer. Bevar alle inputbeviser.
5. Giv en kort første opdatering om adgang, baseline og privat arbejdsmappe.
   Manglende originaler/bytes rapporteres konkret, ikke med gæt eller PASS.

IMPLEMENTATION / ACCEPT
Læs det fulde runtime-mandat og fulde originals før relevant kodearbejde.
Bevar WebView60 og alle eksisterende arithmetic/runtime/productgrænser.
Erstat nativeBigInt-afhængighed med begrundet baseline-kompatibel beregning
af quotient for repræsenterede Numbers. Ingen per-kill-loop, nycap, størreEPS,
billigereMotes, ændret schema, native/dependencies/workflows/signing/balance.
Core's rapport nævner alternativ runtimekontrakt; den er ikke autoriseret.

Alle runtime-mandatets acceptpunkter1–6 gælder for dine nye frozen bytes:
samtlige inline-scripts, API-fravær, faktisk motor udenBigInt, startup/Push,
90-killB1, begge B2-minima med naturalDPS, independent represented-number
oracle, fractionalHP, safe-count-skalaer, whole/split/live/offline, payment/
chronology/persistence,826B1fixtures/43oldR1cases/mutants, performance og alle
syv endelige workflowgates med12requirednegatives og fuld aktuel suite.
Bevar1340diagnosticFAILs, rewards-policy, numericlimits ogmobileclippinglogs.
Tidligere positive moderne-runtime-tests overføres ikke som ny accept.

KØRSLER OG CHECKPOINTS
Arbejd sekventielt: baseline/control → helperbevis → actualmotor/kausale
kontroller → relevante regressioner → freeze → endeligegates → aflevering.
Brug eksisterende drivere og sourceindex; ingen bred historiklæsning.
Undgå samtidige egne browser/testkørsler, som gør ressourcer og fejl uklare.
Registrer kommando/session, start, output, exit/timeout og sourcehashes.
Lad lange processer yield/polle, så du kan give opdateringer undervejs.
Gem et lille checkpoint efter genskabelse, efter egen helper/motorverification
og efter slutgates. Ingen ny brugerbesked kræves for hver milepæl.
Efter et tooltimeout: kontroller egen session/output før nyt forsøg; skab
ikke duplikerede kørsler. Diagnosticér en konkret fejl før nødvendigt repeat.
Det ændrer ingen assertions, thresholds eller requiredgate-kontrakter.

REMOTE / STOPBETINGELSER
Kun lokal faseA er åben. Ingen writer-overtagelse, push, commit til remote,
docswrite/PR-kommentar/metadata, ready/merge/build/dispatch/rerun/release/
signing/cleanup. Historiske conditionalfaseB-mandater åbner ikke remote nu.
Lead skal vurdere ny kandidat, tildele scoped Core/QA-review og dokumentere
gammel writer-/proceshandover før et nyt konkret remotecheckpoint.
Ingen ny generel brugergodkendelse kræves i det allerede autoriserede scope.
Ingen subagenter/beskedværktøjer eller chatomdøbning. Brugeren overfører filer.

LEVERING TIL00_16
Lever lille START-TXT og målrettetZIP med exactbase/proposedparent/newtree,
alle13eventuelt yderligere scopedsourcehashes, R2→ny ogblokeret→nydiff,
begrundet regel/mellemregningsgrænser/runtimekost, dine faktiske egne kontroller,
færdige råcommands/outputs/exits/controls, sourcehashes før/efterslutgates,
fulde originaler, sourceindex/manifest og ærlige limits. Ingen rekursiveZIP'er.
Afslut kendte egne processer og rapportér phaseA/ingenremote-writer. Det
frisætter ikke02_07/02_08. Kandidaten fryses; nye reviews kræves på ændredebytes.
Hvis færdiggørelse blokeres, aflever konkret checkpoint/årsag/filer; påstå ikke
færdig runtimefix eller accept. Ved lang chat: samme lillebootstrap/context-
metode og dokumenteret egen kandidat/processtatus.
'''

index='''02_09 — målrettet kildeindeks
OPSTART: BOOTSTRAP.txt → liveAGENTS/egenrolle/PROJECT_STATE → CURRENT_STATE.txt
→ LEAD/TASK_02_09_RECOVERY_001.txt. Historiske START-filer læses ikke ved opstart.

FØR IMPLEMENTATION
RUNTIME/TASK_LAB_MOTES_B2_RUNTIME_001.txt: hele runtimefix-kontrakten.
RUNTIME/QA_04_05/ORIGINALS/LAB/{USER_REQUEST,REQUIREMENTS,TASK_LAB_MOTES_001}.txt
RUNTIME/QA_04_05/ORIGINALS/TASK_LAB_MOTES_B1_001.txt ogTASK_LAB_MOTES_B2_001.txt:
alle fem fuldeoriginals. Lokal faseA/Lead00_16/rolle02_09 følger dette rootmandat.
RUNTIME/QA_04_05/OWN/identity.json: blokeret tree/sourcehashes.
RUNTIME/QA_04_05/SOURCE/:13overlayfiler. Øvrige bytes hentes fra exactR2.
RUNTIME/QA_04_05/REFERENCE/: exactR1/R2kontroller.

RUNTIME/B2/MOTOR/GATES — EFTER BEHOV
RUNTIME/Source_Index.txt ogRUNTIME/QA_04_05/Source_Index.txt: præcise bevispaths.
RUNTIME/QA_04_05/REPRODUCE_README.txt ogREPRODUCE/: actualmotor/Fraction/gates.
RUNTIME/QA_04_05/OWN/RUNTIME_BLOCKER.txt ogQA_REPORT.txt: gammelblokering.
RUNTIME/QA_04_05/BASE_SOURCES/mobile/* ogOWN/runtime-sources/: låstCapacitor.
RUNTIME/QA_04_05/RAW_EVIDENCE.tar.xz ogRAW_MANIFEST.json: fuld781rawpakke.
RUNTIME/LEAD/runtime_reproduce.cjs/.json: begrænset grammar/API-kontrol medstubs.
CORE_01_06/CORE_REPORT.txt ogSource_Index.txt: fulloriginal CoreBLOCKED.
CORE_01_06/reproduce/REPRODUCE.txt ogRUNTIME_SOURCES/: actualoldV8kontrol.
CORE_01_06/OWN_RAW.tar.xz +OWN_RAW_MANIFEST.json:132egnebeviser.
CORE_01_06/WORKER_RAW_CURRENT.tar.xz +WORKER_RAW_MANIFEST.json:1322workerraw.
Targetedtar udtrækkes i egenkopi med filter=data. Ingen fuld loglæsning vedstart.

PROVENIENS / STATUS
LEAD/WORKER_RESULT_RECEIVED.txt: gamle02_08levering, ikke ny runtimefix.
LEAD/STOP_INSTRUCTION_RECEIVED.txt: gammelLeadinstruks, ikke writerfrigivelse.
LEAD/DECISION_00_16.txt: tidligere modtagelsesbeslutning; nyereCURRENT_STATE og
TASK_02_09_RECOVERY_001 gælder forchat/rolle/recovery/remotehold.
RECEIPTS/live_main_02_09.json oglive_pr46_02_09.json: freshGETs08:31:12Z.
RECEIPTS/RULES/: aktuelle indgange som snapshots; læs live ved opstart.
RECEIPTS/startup_measurement_02_09.json: måltt tekst/ord, ikke kontekstprocent.
RECEIPTS/input_verification.json: egenkontrol af tidligereworker/Coreinput.
RECEIPTS/runtime_recheck.json ognote:00_16boundedreplay, ikke fuldmotor.
HISTORY/*: tidligere02_08opstart/index ogmanifest, ingen aktivordre.
MANIFEST.json: allepayloads undtagenmanifestetselv. Ingen rekursiveZIP'er.
'''

payloads={}
with zipfile.ZipFile(source) as z:
    oldmanifest=json.loads(z.read('MANIFEST.json'))['payloads']
    assert z.testzip() is None
    assert set(z.namelist())==set(oldmanifest)|{'MANIFEST.json'}
    for name,row in oldmanifest.items():
        data=z.read(name)
        assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
        if name=='BOOTSTRAP.txt': dest='HISTORY/BOOTSTRAP_00_16_TO_02_08.txt'
        elif name=='Source_Index.txt':dest='HISTORY/Source_Index_00_16_TO_02_08.txt'
        else:dest=name
        payloads[dest]=data
    payloads['HISTORY/MANIFEST_00_16_TO_02_08.json']=z.read('MANIFEST.json')
payloads.update({'BOOTSTRAP.txt':bootstrap.encode(),'CURRENT_STATE.txt':state.encode(),
 'Source_Index.txt':index.encode(),'LEAD/TASK_02_09_RECOVERY_001.txt':task.encode()})
for name in ['live_main_02_09.json','live_pr46_02_09.json']:
    payloads['RECEIPTS/'+name]=(REF/name).read_bytes()
for name in ['AGENTS_02_09.md','HANDOFF_TEMPLATE_02_09.md','02_GAMEPLAY_02_09.md','PROJECT_STATE_02_09.md','OWN_ROLE_02_09.txt']:
    payloads['RECEIPTS/RULES/'+name]=(REF/name).read_bytes()
startup=['BOOTSTRAP.txt','Source_Index.txt','CURRENT_STATE.txt','LEAD/TASK_02_09_RECOVERY_001.txt',
 'RECEIPTS/RULES/AGENTS_02_09.md','RECEIPTS/RULES/OWN_ROLE_02_09.txt',
 'RECEIPTS/RULES/02_GAMEPLAY_02_09.md','RECEIPTS/RULES/PROJECT_STATE_02_09.md']
measure={n:{'bytes':len(payloads[n]),'words':len(payloads[n].decode().split())} for n in startup}
payloads['RECEIPTS/startup_measurement_02_09.json']=(json.dumps({'files':measure,
 'total_bytes':sum(r['bytes'] for r in measure.values()),'total_words':sum(r['words'] for r in measure.values()),
 'limit':'Text measurement only; no claim of exact context percentage. Original runtime mandate and requirements read fully before implementation; raw logs excluded from startup.'},ensure_ascii=False,indent=2)+'\n').encode()
payloads['RECEIPTS/RECOVERY_SOURCE_PROVENANCE.json']=(json.dumps({'source_zip':source.name,
 'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'verified_payloads':len(oldmanifest),
 'source_library_file_id':'libfile_af3498ad38088191af4849bde0f600dd','copies_preserved_byte_for_byte':True,
 '02_08_newer_work':'unknown, not received','02_08_process_stop':'unknown',
 'recovery_role':'02_09','scope':'private local phase A only'},indent=2)+'\n').encode()
manifest={n:{'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for n,b in sorted(payloads.items())}
txt=OUT/(stem+'_BOOTSTRAP.txt');txt.write_bytes(payloads['BOOTSTRAP.txt'])
dst=OUT/(stem+'_Context.zip')
with zipfile.ZipFile(dst,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for n,b in sorted(payloads.items()):z.writestr(n,b)
    z.writestr('MANIFEST.json',json.dumps({'schema':1,'issued_by':'00_16','to':'02_09',
     'created_at':datetime.now(timezone.utc).isoformat(),'payloads':manifest},ensure_ascii=False,indent=2)+'\n')
with zipfile.ZipFile(dst) as z:
    assert z.testzip() is None
    assert set(z.namelist())==set(manifest)|{'MANIFEST.json'}
    assert z.read('BOOTSTRAP.txt')==txt.read_bytes()
    assert len(z.namelist())==len(set(z.namelist()))
    for n,r in manifest.items():
        b=z.read(n);assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
    for n,r in oldmanifest.items():
        if n=='BOOTSTRAP.txt':dest='HISTORY/BOOTSTRAP_00_16_TO_02_08.txt'
        elif n=='Source_Index.txt':dest='HISTORY/Source_Index_00_16_TO_02_08.txt'
        else:dest=n
        assert hashlib.sha256(z.read(dest)).hexdigest()==r['sha256']
print(json.dumps({'files':[str(txt),str(dst)],'payloads':len(payloads),'zip_bytes':dst.stat().st_size,
 'bootstrap_words':len(bootstrap.split()),'startup_words':sum(r['words'] for r in measure.values()),
 'original_payloads_preserved':len(oldmanifest),'checks':'PASS'},ensure_ascii=False))
