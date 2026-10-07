from pathlib import Path
import os,json,time,datetime,hashlib,subprocess,shutil
r=Path(__file__).resolve().parent;repo=r/'repo';g=r/'gates';frozen=json.loads((r/'evidence/frozen.json').read_text());records=[]
env=dict(os.environ,PATH=str(r/'runtime/bin')+':'+os.environ['PATH'],PYTHONPATH=str(g),LUMENFALL_QA_EVIDENCE_DIR=str(g/'screens'))
for gate in sorted(g.glob('gate-*')):
 before={p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in frozen};assert before==frozen
 env['QA_PROCESS_ROOT']=str(gate/'processes');start=time.monotonic();record={'gate':gate.name,'name':(gate/'name.txt').read_text(),'started':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':['bash',str(gate/'command.sh')],'cwd':str(repo)}
 (gate/'before.json').write_text(json.dumps(before,indent=2))
 with (gate/'stdout.log').open('w') as so,(gate/'stderr.log').open('w') as se:p=subprocess.run(record['command'],cwd=repo,env=env,stdout=so,stderr=se)
 after={p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in frozen};assert after==frozen
 (gate/'after.json').write_text(json.dumps(after,indent=2));record.update(exitcode=p.returncode,seconds=time.monotonic()-start,frozenUnchanged=True);records.append(record);(g/'execution.json').write_text(json.dumps(records,indent=2));print(json.dumps(record),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
for name in ['lumenfall-dom.html','lumenfall-chrome.log','lumenfall-http.log']:
 p=Path('/tmp')/name
 if p.exists():shutil.copy2(p,g/'gate-07'/name)
(g/'final-source-unchanged.json').write_text(json.dumps({'unchanged':True,'files':len(frozen)},indent=2))
