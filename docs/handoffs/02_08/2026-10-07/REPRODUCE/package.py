from pathlib import Path
import shutil,json,hashlib,tarfile,zipfile,subprocess,datetime,os
r=Path(__file__).resolve().parent;bundle=r/'bundle';dest=r/'delivery';bundle.mkdir(exist_ok=True);dest.mkdir(exist_ok=True);e=r/'evidence';repo=r/'repo';ident=json.loads((e/'identity.json').read_text());tree=ident['newTree'];frozen=json.loads((e/'frozen.json').read_text());assert all(hashlib.sha256((repo/p).read_bytes()).hexdigest()==v for p,v in frozen.items())
assert subprocess.check_output(['git','write-tree'],cwd=repo,text=True).strip()==tree
# Verify the supplied thirteen blocked sources against the reconstructed fulltree.
blocked=[]
for p in (r/'input/RUNTIME/QA_04_05/SOURCE').rglob('*'):
 if not p.is_file():continue
 path=p.relative_to(r/'input/RUNTIME/QA_04_05/SOURCE').as_posix();blob=subprocess.check_output(['git','rev-parse','4c07cd5d66cb5928eb99623ff86efaa81e268829:'+path],cwd=repo,text=True).strip();actual=subprocess.check_output(['git','hash-object',str(p.resolve())],cwd=repo,text=True).strip();assert actual==blob;blocked.append({'path':path,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'gitblob':blob})
(e/'blocked-identity-verification.json').write_text(json.dumps({'fulltree':'4c07cd5d66cb5928eb99623ff86efaa81e268829','sources':blocked,'sourceCount':len(blocked),'reconstructedBeforeEditing':True,'allBlobsMatch':True},indent=2))
def copy(src,rel):
 p=bundle/rel;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,p)
for a in ident['source']:copy(repo/a['path'],'SOURCE/'+a['path'])
for f in ['main_to_new.patch','R2_to_new.patch','blocked_to_new.patch']:copy(e/f,'DIFF/'+f)
for f in ['identity.json','frozen.json','frozen-identity.json','scope-proof.json','input-verification.json','raw-input-verification.json','process-stop.json','blocked-identity-verification.json','minimum-ledger.json','all43-fresh.json','extras-comparison.json','represented-rewards.json','composed-eps-diagnostics.json','numeric-policy-parity.json','split-verification.json','performance-comparison.json']:
 copy(e/f,'SUMMARY/'+f)
copy(e/'runtime/verification.json','SUMMARY/runtime-verification.json');copy(r/'gates/execution.json','SUMMARY/gates-execution.json')
for f in ['R2_index.html','blocked_index.html']:copy(r/'baselines'/f,'REFERENCE/'+f)
copy(r/'input/RUNTIME/QA_04_05/REFERENCE/R1_index.html','REFERENCE/R1_index.html')
originals=r/'input/RUNTIME/QA_04_05/ORIGINALS'
for p in originals.rglob('*'):
 if p.is_file():copy(p,'ORIGINALS/'+p.relative_to(originals).as_posix())
for f in ['BOOTSTRAP.txt','Source_Index.txt','LEAD/DECISION_00_16.txt','LEAD/STOP_INSTRUCTION_RECEIVED.txt','LEAD/WORKER_RESULT_RECEIVED.txt']:
 copy(r/'input'/f,'CURRENT_MANDATE/'+f)
copy(r/'input/RUNTIME/TASK_LAB_MOTES_B2_RUNTIME_001.txt','ORIGINALS/TASK_LAB_MOTES_B2_RUNTIME_001.txt')
for src,rel in [('CORE_01_06/CORE_REPORT.txt','HISTORICAL/CORE_REPORT.txt'),('RUNTIME/QA_04_05/QA_REPORT.txt','HISTORICAL/QA_REPORT.txt'),('CORE_01_06/OWN_RAW.tar.xz','HISTORICAL/CORE_OWN_RAW.tar.xz'),('CORE_01_06/OWN_RAW_MANIFEST.json','HISTORICAL/CORE_RAW_MANIFEST.json'),('CORE_01_06/WORKER_RAW_CURRENT.tar.xz','HISTORICAL/WORKER_RAW_CURRENT.tar.xz'),('CORE_01_06/WORKER_RAW_MANIFEST.json','HISTORICAL/WORKER_RAW_MANIFEST.json')]:copy(r/'input'/src,rel)
for f in ['AGENTS.md','docs/agents/02_GAMEPLAY.md','docs/PROJECT_STATE.md']:copy(repo/f,'RULES/'+f)
copy(e/'live-start/OWN_ROLE.txt','RULES/OWN_ROLE.txt')
for f in ['Bridge.java','CapConfig.java','capacitor.config.json','package.json','package-lock.json']:copy(r/'input/CORE_01_06/RUNTIME_SOURCES'/f,'RUNTIME_BASELINE/'+f)
for p in r.glob('*.py'):copy(p,'REPRODUCE/'+p.name)
for p in r.glob('*.cjs'):copy(p,'REPRODUCE/'+p.name)
for p in r.glob('*.js'):copy(p,'REPRODUCE/'+p.name)
copy(r/'input/RUNTIME/QA_04_05/REPRODUCE/acorn-8.15.0.js','REPRODUCE/acorn-8.15.0.js')
# Solid lossless archive of every own raw observation, including development failures.
raw={};paths=[]
for name in ['evidence','gates']:
 for p in (r/name).rglob('*'):
  if p.is_file() and '__pycache__' not in p.parts and 'packaging-final' not in p.parts:paths.append(p)
for p in sorted(paths):raw[p.relative_to(r).as_posix()]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(bundle/'RAW_MANIFEST.json').write_text(json.dumps(raw,indent=2));print({'ownRawFiles':len(raw),'bytes':sum(v['bytes'] for v in raw.values())},flush=True)
with tarfile.open(bundle/'OWN_RAW.tar.xz','w:xz',preset=5) as tar:
 for p in sorted(paths):tar.add(p,arcname=p.relative_to(r),recursive=False)
# Verify the resulting archive independently, before packing.
seen=set()
with tarfile.open(bundle/'OWN_RAW.tar.xz') as tar:
 for p in tar:
  if not p.isfile():continue
  seen.add(p.name);data=tar.extractfile(p).read();a=raw[p.name];assert len(data)==a['bytes'] and hashlib.sha256(data).hexdigest()==a['sha256']
assert seen==set(raw)
rawgate=json.loads((r/'gates/verified-raw-results.json').read_text());perf=json.loads((e/'performance-comparison.json').read_text())['cases'];numeric=json.loads((e/'numeric-verification.json').read_text())['reports'][0]
report=f'''LUMENFALL — 02_08 til 00_16 — B2-runtimekorrektion, 7. oktober 2026
Model: GPT-6.1 Sol · Effort: Ekstra høj. Dansk. FASE A / lokal FORREVIEW.

RESULTAT OG IDENTITET
Obligatorisk BigInt er erstattet i produktets Farm-helper med exact binær
division af repræsenterede Number-significands. WebView 60-baseline bevares.
Ny lokal kandidat, ikke remote R3 eller Core-/QA-accept:
base/main 1ddc246eb62782a61ec5c486cd5f51ea170bb338
base tree bfb3970b29485b3e8ece1c72bb60186eb2ba755e
parent/lokal HEAD R2 3cdebc236e9ee5081a4bca4e323b11f43aa0d46d
parent tree 70073a55d7f5fe428ae82223627603498cc372b6
blokeret tree 4c07cd5d66cb5928eb99623ff86efaa81e268829
NY FULLTREE {tree}
NY index SHA256 {ident['indexSHA256']}
Alle {len(ident['source'])} main→ny sourcefiler, Gitblobs/modes/størrelser/SHA256:
SUMMARY/identity.json. Alle 96 tracked kildebytes frozen før/efter gates og
slutkontrol. R2→ny ændrer seks filer; blokeret→ny fire. Alle øvrige produktbytes
uden for Farm-funktionsområdet er byteidentiske med exact R2. Ingen commit lavet.

NUMERISK REGEL OG KOST
M*2^E-dekodning bruger kun Number, ArrayBuffer/DataView og 32-bit words.
Normaliserede significands er heltal i [2^52,2^53). Ved safe quotient er
exponentforskellen højst53: binær division kræver højst54 bits. Remainder
holdes under divisor efter hver subtraktion; fordobling er et præcist lige
heltal under2^54, og næste subtraktion giver et repræsenterbart heltal under2^53.
Hvert quotient-prefix er safe. Subnormal-normalisering er højst52 shifts pr.
input. Ingen produktloop pr.kill, cap, polyfill, dependency eller runtimefloor-
ændring. Fuld proof/mellemregningsgrænser står i SOURCE/docs/tasks/B2-taskkortet.
Modulo, partialHP/carry og gamle SIM_EPS=1e-9 / relative1e-12 regler bevares.

20606 IEEE-bitkodede inputs med uafhængig Python Fraction-oracle: 0 quotient-
fejl på Node24 og faktisk Node8/V8 6.2. De oprindelige7945 inputs genkøres;
nye ordinary/near-multiple/2^50/51/52/MAX_SAFE/fractional/physical skalaer,
partial/fullHP, cancellation og positive deficits supplerer dem. Isolerede
nonphysical inputs certificerer kun helperen, ikke økonomi i tiny-HP worlds.
426 præcis lige-damage halves:0 fejl;6 historiske near-boundaryrows særskilt.

Matrixens COUNT/HP er ikke omdøbt til strict-green stresstest. Der er
{numeric['unchangedBoundaryPromotions']} klassificerede gamle boundarypromotions,
2 yderligere strict-count-diagnostikrows fra sammensatte eksisterende EPS-
grænser og296 strict-HP-residualforskelle (gamle snaps/representation). Alle
20606 nye outputs er identiske med den gamle exact BigInt-helper på moderne
engine; de to EPS-branches forklares eksplicit i SUMMARY/composed-eps-diagnostics.
Ingen tolerance ændret. Exact quotient er uafhængigt bevist for alle rows.
Old-R2 har1151 strict-countforskelle i samme matrix; kandidatens2 er bevarede
EPS-diagnostik, ikke nye quotientfejl. Rå misfits og inputs findes i OWN_RAW.

RUNTIME OG FAKTISK MOTOR
Alle to app-inline scripts: ny PASS ES2017/18/19/20 og actual Node8.17.0 /
V8 6.2.414.78 syntaxcheck. Blokeret kandidat FAIL i hovedscriptet på oldV8 og
ES2017/18/19 ved BigInt-literal; moderne API-fravær giver TypeError. Ny helper
og R2 giver B1s90 kills uden BigInt; batchsideeffekter er stubbet kun i dette
isolerede API-check. Node8 har faktisk udført alle20606 helper-/Farm-probes.
Det er ikke fysisk WebView60 eller et fuldt old-browser-motorreview.

Permanent NY lab-motes-runtime:40 faktiske motorrows/1029assertions på
Chrome153.0.8010.0 med BigInt/getBigInt64/getBigUint64 utilgængelige i appen.
Oracle kører eksternt i Node. Startup, almindelig Push, B1, begge B2-minima,
fractionalHP, ON/OFF, whole/split, live/offline, spawn/HP/rewards/Motes/work
består. FractionalHP er en privat fixture, ingen ændring i game-HP-policy.
Den eksisterende permanente lab-motes-numerical og alle gamle controls bevares.
Begge exact-old-R2 minima afvises af oraklen; restoration består.

Core original: repræsenteret D=36028797018963984, HP11 giver3275345183542180
kills, rest4/HP7; OFF whole og.5+.5 samme damage/count/HP, live/offline.
Natural original: faktisk product DPS40052722017724424, elapsed.9, partial8.03 /
max11 giver3277040892359271 kills. Ingen DPS-stub i denne naturlige vej.
Finite normalisering/priser, reward/spawn, enabling60-køb og post-paymentwork
kontrolleres. Natural OFF-split har15/4 mindre faktisk damage; HP-forskel er
legitim. UseON har actual traced rewardsegments og korrekt betalingstid.
Separat ny browserkørsel på exact R2-source reproducerer begge OFF/whole FAILs
(+1 kill), med exit1/fuld raw/teardown. Shortest JSON-numbertekst bruges aldrig
som et vilkårligt præcist integer-oracle; minimum-ledger har IEEE-restored values.

B1 / LAB / DIAGNOSTIK
Alle826 conservationfixtures består. De præcise43 gamle fixturekeys genfindes:
R1 FAIL43, R2 FAIL0, NY FAIL0. Egne100 QA-motorgrupper/16193assertions består
på ny source uden BigInt. B1 minimum90 kills/3Luminous: ON2Motes/work297.3346,
OFF62/work299.1;60-betalingen.0173 og split samt før/exact/efter bevares.
Old-R1 double-round og tre LAB-mutationer samt persistence, pris/repeat, Queue,
strict/pure normalisering, chronology, paid active snapshots, Inquiry/legacy8,
NAV, actual offline/study-only tail og Farm/Push kontrolleres i gates/motor.

Samme1340 diagnostikinputs R1/R2/NY er genkørt. R1:809 strikte assertionfejl;
R2/NY:379 identiske strikte fejl. Alle R2/NY resultater/state/summaries er ens.
123 originale diagnostikrows traces:311 segments, NY271 exact counts/40 gamle
EPS-promotions,0 uforklarede count-/rewardoperationer.622 reward-operationer
består en Fraction-oracle med binary64-rounding efter rate*scale, product*count
og previous+gain. Original strict aggregate er fortsat FAIL; ingen grøn
stresstest påstås. R1/R2s96 countdeltarows blandt1340 bevares separat.

SLUTGATES OG PERFORMANCE
Alle7 uændrede workflow-gates exit0 på NY frozen bytes; ingen source-/test-
ændring under eller efter dem.142 defaultscenarier,164 printedPASSinvocations,
162 faktisk replayverificerede browser/nativeoutputs/140 real scenarios plus
2 processmetakontrakter;12 required negatives faktisk FAIL/fanget. Komplet
aggregate, cmds/stdout/stderr/exits/teardown/screens/før-efterhashes bevares.
Ny gate04 exit0 på første kørsel,500.925sekunder. Ingen CI på dette lokale tree.

Helpermedians ca0.8–0.9us på oldV8 og1.0–1.1us på modern Node. R2s ubeviste
hurtige arithmetic er billigere. Faktiske engine medians R2→NY (ms/forløb):
'''+''.join(f"{x['case']}: {x['R2ms']:.4f} → {x['newMs']:.4f}; scheduleriterations {x['iterationsR2']} → {x['iterationsNew']}.\n" for x in perf)+'''
Der er målbar meromkostning; ingen påstand om identisk performance. Ved1time
simuleret offline er forskellen ca1.6ms, uændret4202 scheduleriterations;
huge safe-count-flow er omtrent uændret, uden per-kill skalering. Browser-
wallclock/snapshot og timingstøj begrænser målingen; fysisk mobil er ukendt.
Første benchmark på R2 med verbose captureTimeline:true ramte dens gamle
traceguard. FAIL/raw bevares; normal captureTimeline:false bruges i ny scoped
måling uden nogen produktguardændring. En første kandidatmåling overlappede
et senere causalbrowsercheck; den er bevaret. NY blev målt igen alene, og kun
den isolerede kandidatmåling indgår i sammenligningen. Ingen gate blev genkørt. Første egen pakkekontrol afviste et stadig åbent
assembly-log i rawarkivet. Den afsluttede FAIL er bevaret; den endelige aktive
assembly-receipt holdes uden for sit eget arkiv, så hashkontrollen er stabil.

ÆRLIGE LIMITS OG PROVENIENS
Fysisk Android/WebView60/TalkBack/install er ikke udført. Node8 oldV8 er relevant
legacy engine, ikke præcisChrome60 emulering. Normaliseret Titanstress er ikke
bevis for gennemspillet progression. Overflow/nonfinite/unsafe counts,
nonphysical tiny-HP worlds og arbitrary sub-ULP accumulated work er ikke
certificeret. Exact kills lover ikke exact-real huge rewards.

Original worker mobileclipping-FAIL, komplet raw/exit/commands, bevares i
HISTORICAL/WORKER_RAW_CURRENT.tar.xz: evidence/initial-gate04. Den nye suites
mobileprofiler består; rootcause for den tidligere intermittens er fortsat
ukendt. Ingen UI-fix/toleranceændring eller påstand om fremtidig fejlfri CI.
De tre initiale nye runtime-driverFAILs var private observerfejl: forkert
startuphook, betaling efter første splitpart og reward-summationens gruppering.
De fulde developmentoutputs/teardowns bevares. Rettet driver blev frozen før
slutgates. Produktquotienthelperen ændredes ikke efter første implementation.

Inputmanifest257entries/256payloads/CRC/hashcoverage består. Worker1322raw,
Core132raw og QA781raw er alle fuldt hash-/størrelsesverificeret. Afleveringen
inkluderer fulde fem LAB/B1/B2-originaler plus runtime-mandat, aktuelle Lead-
originaler, fulde Core/QA-rapporter og original workerraw1322/Core raw132.
QA's store781rawarkiv genleveres ikke, da det allerede er modtaget af Lead;
modtagelses-/hashreceipt bevares. Ingen rekursiv gammel ZIP, APK, dependencies,
credentials eller signingmateriale. OWN_RAW er tabsfri, fuldt manifestverificeret.

EJERSKAB / STOP / NÆSTE SKRIDT
Frisk read-only slut-GET: main/base og PR46/R2 uændret; PR46 open/Draft. Ingen
fuld branch/run/writerpreflight, da remote handling ikke udføres. Ingen egen
push/commit/PRmetadata/comment/ready/merge/build/dispatch/rerun/release/cleanup.
Alle kendte egne kode-, browser- og serverprocesser er afsluttet;96 sourcebytes
og fulltree er uændrede. Eget lokale phaseA-kodearbejde STOP/frozen. Ingen
remote repo-writer blev overtaget eller frigivet på02_07s vegne.
02_07 senereB2-processer/ændringer/writerrelease er stadig UNKNOWN. Stop-TXT
beviser kun en Leadinstruks. Remote phaseB holdes efter00_16s beslutning indtil
review af nye bytes og dokumenteret handover. Ingen ny generel brugertilladelse
er nødvendig; Lead-kandidat/writercheckpoint mangler, ikke stående godkendelse.
00_16 skal nu tildele scoped nye Core-/QA-reviews på dette præcise tree. Gamle
positive reviews/CI/gates bliver ikke automatisk accept af ændrede bytes.
Brugeren overfører selv START-TXT og ZIP; ingen subagenter/beskedværktøjer/chats
omdøbt. SOURCE-index styrer målrettet læsning; læs ikke hele archive ved opstart.
'''
(bundle/'RESULT.txt').write_text(report)
start=f'''LUMENFALL — 02_08 til 00_16 — NY B2-runtimekandidat
7. oktober2026. Model: GPT-6.1 Sol · Effort: Ekstra høj. Dansk.
Læs denne TXT først, derefter Source_Index.txt. Ingen hel-archiveopstart.

FASE A LOKAL / FORREVIEW — ikke Core-/QA-accept eller remote R3.
Ny fulltree {tree}
indexSHA256 {ident['indexSHA256']}
base/main 1ddc246eb62782a61ec5c486cd5f51ea170bb338
parent/lokalHEAD R2 3cdebc236e9ee5081a4bca4e323b11f43aa0d46d

Obligatorisk BigInt er erstattet med Number/DataView exact binær division.
Højst54 quotientbits for safe counts; ingen per-kill-loop/cap/runtimefloor-
ændring. Integer/fractional HP og oprindelige EPS/rewards/boundaries bevares.
Alle scripts parser ES2017 og faktisk Node8/V8 6.2; blokeret kandidat FAIL
på samme grammar/API-fravær. Motor startup/Push/B1/B2/fractional whole/split
ON/OFF live/offline består med BigInt utilgængelig; oracle er ekstern.

Nye frozen kontroller:7gates exit0,142scenarier,12negatives fanget;
20606 exact quotients på moderne/oldV8;826 B1 og alle43 originalkeys;
begge exactR2 minima FAIL, ny/restoration PASS.1340 diagnoser har samme379
strikte fejl på R2/NY og bevares somFAIL;622 reward-operationer består.
Matrixens gamle EPS-/HP-diagnoser er eksplicit bevaret, ikke strict-green.
Runtimekost målt på helper og actual live/offline engine; se RESULT.txt.
Alle14sources/hashes,96frozenbytes, R2→ny/blokeret→ny/main→ny diff,
fulde originals, rå outputs og manifest følger ZIP.

Eget lokalt kodearbejde STOP/frozen; kendte egne test/serverprocesser lukket.
Ingen remote commit/push/PRændring/CI/merge/build/rerun/release/cleanup.
02_07s nye writer/processrelease er fortsat ukendt; STOPinstruks er ikke release.
RemoteB forbliver holdt af00_16 indtil nyt kandidatcheck og dokumenteret handover.
00_16 tildeler nu nye scoped Core-/QA-reviews på dette præcise tree.
FysiskAndroid/WebView60/TalkBack utestet; gammel mobileclipping-rootcause ukendt.
Gamle positive reviews og ny gates-PASS erstatter ikke disse reviewtrin.
'''
(bundle/'START_HER.txt').write_text(start)
(bundle/'Source_Index.txt').write_text('''02_08 → 00_16 — målrettet navigation
START_HER.txt → RESULT.txt → SUMMARY/identity.json → relevante egne beviser.
Aktuel rolle bestemmes af modtagers liveAGENTS/egenrolle og00_16s mandat.
CURRENT_MANDATE/ indeholder fulde modtagne originals; gamle rollelabels er
historiske. Ingen ordre om at overtage Gameplay-writer gennem reviewpakken.

SOURCE/14filer: overlay på exactR2, bevar modes i identity.json; fulltree skal
blive758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef. Resten kommer fraR2, ikke main.
DIFF/R2_to_new.patch, blocked_to_new.patch, main_to_new.patch.
ORIGINALS/: fulde LAB user/requirements/mandat, B1/B2 og runtime-mandat.
RULES/: læste egenGameplay-regler og PROJECT_STATE (gammelt snapshot).
RUNTIME_BASELINE/: låst6.2.1 Java/config/package-lock, ingen ændrede produktbytes.
REFERENCE/: exactR1/R2 og gammel blokeretindex til controls.

SUMMARY/: præcis identitet/96frozenhashes, input/rawkontrol, runtimegrammar/
actualoldV8/API-fravær, minimumsledger, 43-fresh,1340comparison,622rewards,
EPSdiagnostik,426splits, performance/gates og proceslukning.
OWN_RAW.tar.xz + RAW_MANIFEST.json: alle egne rawoutputs/commands/exits/scripts,
gates/scenarios/control/screens og developmentfailures. Udpak ved roden:
logical evidence/ og gates/; sourcebytes må aldrig ændres under review.
Vigtige rawpaths efter udpakning:
 evidence/runtime/verification.json: alle app-scripts/oldV8/missingBigInt.
 gates/verified-raw-results.json:162 browser/nativepayloads+12negatives.
 gates/gate-04/processes/*: lab-motes-runtime1029checks/40rows og native-teardown.
 evidence/r2-{core,natural}-raw.json: nye exactR2 fuldmotor FAILs.
 evidence/numeric-inputs.json og *numeric-results/verification:20606rows.
 evidence/own-represented-diagnostic-traces.json, {r1,r2,new}-extras/diag-trace.
 evidence/{r1,r2,new}-motor.json:100motorgrupper +826 grid/full43-keycontrol.
 evidence/performance-comparison.json + *performance*final/isolation + failedraw.
 evidence/development/: initiale private driverfejl, aldrig skjult eller grønnet.

HISTORICAL/CORE_REPORT.txt og QA_REPORT.txt: komplette tidligere BLOCKED-
reviews; ikke accept af nye bytes. WORKER_RAW_CURRENT.tar.xz/manifest indeholder
1322originalworkerrawfiler, herunder evidence/initial-gate04 clippingFAIL og
original1340strictdiagnostik. Udpak i separat historisk mappe, ikke over nye raw.
CORE_OWN_RAW/manifest:132originalCorebeviser. QA781raw er integritetsverificeret
men ikke dubleret i denne overdragelse;00_16s modtagne originalpakke har dem.
REPRODUCE/: private scripts og læseplan, ingen produkt-/remoteautorisering.
MANIFEST.json dækker alle payloads undtagen sig selv; ZIPCRC og rå hashes består.
''')
(bundle/'REPRODUCE/README.txt').write_text('''Genprøve er kun privat lokal og read-only remote. Ingen dependency/native/
workflowændring autoriseres. Byg repo fra exactR2 og overlay SOURCE14/modes;
verificér fulltree. Placer scripts ved privat projektrod ved siden af repo/,
input/, baselines/, stages/, runtime/, evidence/, gates/. OWN_RAW genskaber
logical evidence/gates. Rawcommands har originalabsolute paths; adaptér kun
private paths. Ordnet afhængighed: prepare.py → runtime/numeric/gates →
verify-gates → motor/minima/performance/diagnostic analyses → identity/stop.

prepare.py viser den anvendte private instrumentering og de syv uændrede
workflowcommands. Den henviser til den modtagne00_16-inputstruktur; original
modtagelsespakke er nødvendig for disse historical paths. De relevante bridge/
fixtures er også direkte i REPRODUCE for målrettet replay. Brug Source_Index.
run.py i SOURCE er den permanente aktuelle142-scenarieharness; gatescommand
kan køres direkte på den frosne repo med lokalChrome og Node20+.

Chrome153.0.8010.0 binary SHA256:
1346545781835e04ece3434a16d656ad5cbe60a6a179a43dff43f79a21f9a4ad.
https://storage.googleapis.com/chrome-for-testing-public/153.0.8010.0/linux64/chrome-headless-shell-linux64.zip
Node8.17.0/V86.2 actuallegacy syntax/helper/perf:
https://nodejs.org/dist/v8.17.0/node-v8.17.0-linux-x64.tar.xz
Node24.19.0/Python3.12/Playwright via primaryruntime bruges af private probes.
Acorn8.15 er grammar-testmateriale, aldrig en appdependency.

Fuldappgrammarkontrol og API-fravær har expectedFAIL på blocked; matrixhelper
på Node8 harBigInt utilgængelig. farm-runtime.cjs har ekstern moderne oracle,
appcontext udenBigInt. Fraction-orakler bruger IEEEhex/float-restoration.
Den oprindelige post-gates-batch exit1 skyldes det bevarede R2 verbose-timeline-
benchmarkFAIL; ni motor/diagkommandoer var allerede afsluttet. Performance
blev derefter kørt separat med normal captureTimeline:false; ikke rerun afgates.
Ingen fysisk Android/TalkBack/WebView60 emulering; ingen acceptclaim ud fra
historical grønne gates eller samlede checkcounts alene.
''')
manifest={}
for p in sorted(bundle.rglob('*')):
 if p.is_file() and p.name!='MANIFEST.json':manifest[p.relative_to(bundle).as_posix()]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(bundle/'MANIFEST.json').write_text(json.dumps({'schema':1,'issuedBy':'02_08','to':'00_16','created':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newFulltree':tree,'payloads':manifest},indent=2))
base='Lumenfall_B2_Runtime_02_08_Til_00_16_2026-10-07';txt=dest/(base+'_START.txt');txt.write_text(start);zpath=dest/(base+'.zip')
with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(bundle.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(bundle).as_posix())
with zipfile.ZipFile(zpath) as z:
 assert z.testzip() is None;assert set(z.namelist())==set(manifest)|{'MANIFEST.json'}
 for p,a in manifest.items():
  data=z.read(p);assert len(data)==a['bytes'] and hashlib.sha256(data).hexdigest()==a['sha256']
 assert z.read('START_HER.txt')==txt.read_bytes()
receipt={'TXT':str(txt),'ZIP':str(zpath),'zipBytes':zpath.stat().st_size,'zipSHA256':hashlib.sha256(zpath.read_bytes()).hexdigest(),'payloads':len(manifest),'rawFiles':len(raw),'rawCoverage':'PASS','zipCRC':'PASS','sourceFrozen':True,'tree':tree};(dest/'packaging-receipt.json').write_text(json.dumps(receipt,indent=2));print(receipt,flush=True)
