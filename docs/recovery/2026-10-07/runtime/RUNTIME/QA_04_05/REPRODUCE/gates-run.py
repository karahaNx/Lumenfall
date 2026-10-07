from pathlib import Path
import subprocess,os,json,time,datetime,hashlib,shutil
r=Path(__file__).resolve().parent;repo=r.parent/'b2_qa_repo';g=r/'gates'
env=dict(os.environ,PATH=str(r.parent/'b2_qa_runtime/bin')+':'+os.environ['PATH'],PYTHONPATH=str(g),LUMENFALL_QA_EVIDENCE_DIR=str(g/'screens'))
frozen=json.loads((g/'frozen-source.json').read_text());records=[]
for gate in sorted(g.glob('gate-*')):
 before={f:hashlib.sha256((repo/f).read_bytes()).hexdigest() for f in frozen};assert before==frozen
 env['QA_PROCESS_ROOT']=str(gate/'processes');start=time.monotonic();at=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (gate/'stdout.log').open('w') as so,(gate/'stderr.log').open('w') as se:p=subprocess.run(['bash',str(gate/'command.sh')],cwd=repo,env=env,stdout=so,stderr=se)
 after={f:hashlib.sha256((repo/f).read_bytes()).hexdigest() for f in frozen};assert after==frozen
 record={'gate':gate.name,'name':(gate/'name.txt').read_text(),'started':at,'exitcode':p.returncode,'seconds':time.monotonic()-start,'frozenBeforeAfter':True};records.append(record);(g/'execution.json').write_text(json.dumps(records,indent=2));print(json.dumps(record),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
for name in ['lumenfall-dom.html','lumenfall-chrome.log','lumenfall-http.log']:
 p=Path('/tmp')/name
 if p.exists():shutil.copy2(p,g/'gate-07'/name)
(g/'final-source-unchanged.json').write_text(json.dumps({'unchanged':True,'files':len(frozen),'hashes':frozen},indent=2))
