import subprocess,pathlib,os,json,time,datetime,hashlib,sys
root=pathlib.Path(__file__).resolve().parent;repo=root.parent/'repo'
env=dict(os.environ,PATH=str(root.parent/'runtime/bin')+':'+os.environ['PATH'],PYTHONPATH=str(root),LUMENFALL_QA_EVIDENCE_DIR=str(root/'screens'))
frozen=json.loads((root/'frozen-source.json').read_text());start_from=int(sys.argv[1]) if len(sys.argv)>1 else 1
records=[x for x in json.loads((root/'execution.json').read_text()) if int(x['gate'][-2:])<start_from] if start_from>1 else []
for gate in sorted(root.glob('gate-*')):
 if int(gate.name[-2:])<start_from:continue
 for f,digest in frozen.items():assert hashlib.sha256((repo/f).read_bytes()).hexdigest()==digest,f
 env['QA_PROCESS_ROOT']=str(gate/'processes');start=time.monotonic();at=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (gate/'stdout.log').open('w') as stdout,(gate/'stderr.log').open('w') as stderr:
  p=subprocess.run(['bash',str(gate/'command.sh')],cwd=repo,env=env,stdout=stdout,stderr=stderr)
 record={'gate':gate.name,'name':(gate/'name.txt').read_text(),'started':at,'exitcode':p.returncode,'seconds':time.monotonic()-start};records.append(record)
 (root/'execution.json').write_text(json.dumps(records,indent=2));print(json.dumps(record),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
for f,digest in frozen.items():assert hashlib.sha256((repo/f).read_bytes()).hexdigest()==digest,f
(root/'final-source-unchanged.json').write_text(json.dumps({'unchanged':True,'files':len(frozen)},indent=2))
