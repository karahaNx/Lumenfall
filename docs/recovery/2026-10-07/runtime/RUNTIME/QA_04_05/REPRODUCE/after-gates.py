from pathlib import Path
import subprocess,os,json,time
r=Path(__file__).resolve().parent;env=dict(os.environ,LUMENFALL_CHROME=str(r.parent/'b2_qa_runtime/bin/google-chrome'));records=[]
for label,fixture,out in [('local','b2-own.js','local-b2-exact'),('r1','diag-trace-own.js','r1-diag-trace'),('r2','diag-trace-own.js','r2-diag-trace'),('local','diag-trace-own.js','local-diag-trace'),('local','engine-safe-counts.js','local-engine-safe-counts')]:
 command=['node',str(r/'engine.cjs'),label,'fixtures/'+fixture,'evidence/'+out+'.json'];start=time.monotonic()
 with (r/'evidence'/f'{out}.stdout.log').open('w') as so,(r/'evidence'/f'{out}.stderr.log').open('w') as se:p=subprocess.run(command,env=env,stdout=so,stderr=se)
 row={'source':label,'command':command,'exitcode':p.returncode,'seconds':time.monotonic()-start};records.append(row);(r/'evidence/after-gates-execution.json').write_text(json.dumps(records,indent=2));print(json.dumps(row),flush=True)
