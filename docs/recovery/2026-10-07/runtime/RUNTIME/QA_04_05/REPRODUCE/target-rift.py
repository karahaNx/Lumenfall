from pathlib import Path
import shutil,subprocess,os,json,time
r=Path(__file__).resolve().parent;repo=r.parent/'b2_qa_repo';env=dict(os.environ,PATH=str(r.parent/'b2_qa_runtime/bin')+':'+os.environ['PATH'],PYTHONPATH=str(r/'gates'))
records=[]
for label,ref in [('r2','3cdebc236e9ee5081a4bca4e323b11f43aa0d46d'),('local',None)]:
 d=r/'target-rift'/label;web=d/'web';web.mkdir(parents=True,exist_ok=True)
 src=subprocess.check_output(['git','show',ref+':index.html'],cwd=repo) if ref else (repo/'index.html').read_bytes();(web/'index.html').write_bytes(src)
 for asset in ['fonts','branding']:shutil.copytree(repo/asset,web/asset,dirs_exist_ok=True)
 command=['python3','tests/behavioral/run.py','--web-root',str(web),'--scenario','rift-status-stacking-mobile','--raw-artifacts',str(d/'failed-raw')];env['QA_PROCESS_ROOT']=str(d/'processes');env['LUMENFALL_QA_EVIDENCE_DIR']=str(d/'screens');start=time.monotonic()
 with (d/'stdout.log').open('w') as so,(d/'stderr.log').open('w') as se:p=subprocess.run(command,cwd=repo,env=env,stdout=so,stderr=se)
 row={'label':label,'command':command,'exitcode':p.returncode,'seconds':time.monotonic()-start};records.append(row);(r/'target-rift/execution.json').write_text(json.dumps(records,indent=2));print(json.dumps(row),flush=True)
