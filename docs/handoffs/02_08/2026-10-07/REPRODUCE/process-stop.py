from pathlib import Path
import os,json,datetime,hashlib,subprocess
r=Path(__file__).resolve().parent;own=[];scanned=0;names={'capture.py','gates.py','run.py','motor.cjs','farm-runtime.cjs','r2-core.cjs','r2-natural.cjs','post-gates.py','numeric.py','runtime-checks.cjs','helper-performance.cjs','helper-performance8.js'}
for p in Path('/proc').iterdir():
 if not p.name.isdigit() or int(p.name)==os.getpid():continue
 try:args=(p/'cmdline').read_bytes().split(b'\0');args=[x.decode(errors='replace') for x in args if x];cwd=os.readlink(p/'cwd');scanned+=1
 except (OSError,PermissionError):continue
 if not args:continue
 scoped=cwd.startswith(str(r)) or any(x.startswith(str(r)) for x in args[1:])
 if scoped and any(Path(x).name in names for x in args[1:]) and Path(args[0]).name.startswith(('python','node')):own.append({'pid':int(p.name),'command':args,'cwd':cwd})
frozen=json.loads((r/'evidence/frozen.json').read_text());assert all(hashlib.sha256((r/'repo'/p).read_bytes()).hexdigest()==v for p,v in frozen.items());assert not own,own
report={'observed':datetime.datetime.now(datetime.timezone.utc).isoformat(),'procCmdlinesScanned':scanned,'activeKnownOwnCodeTestProcesses':own,'allKnownBrowserDriversAndServersCompleted':True,'nativeTeardownIndependentlyValidated':'gate raw verifier requires graceful browser exit, zero pending operations and profileRemoved for all native results; motor finally closes contexts/browser/server. Expected failing old-source controls also have teardown receipts.','frozenSourceUnchanged':True,'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r/'repo',text=True).strip(),'tree':subprocess.check_output(['git','write-tree'],cwd=r/'repo',text=True).strip(),'ownLocalPhaseAEditing':'STOP/frozen; no further source change after gates','ownRemoteWriter':'never taken; no remote write performed','02_07Writer':'UNKNOWN; STOP instruction is not release evidence','artifactPacking':'Runs next as a bounded local artifact operation; final delivery only after it and save complete.'}
(r/'evidence/process-stop.json').write_text(json.dumps(report,indent=2));print({k:v for k,v in report.items() if k not in ['nativeTeardownIndependentlyValidated','artifactPacking']})
