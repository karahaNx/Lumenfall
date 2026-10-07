from pathlib import Path
import subprocess,json,sys,os,time
r=Path(__file__).resolve().parent;commands=[]
for label in ['r1','r2','new']:
 for fixture,output in [('own_motor.js','motor'),('extra_cases.js','extras'),('diag-trace.js','diag-trace')]:commands.append((label+'-'+output,['node','motor.cjs',label,fixture,'evidence/'+label+'-'+output+'.json'],1 if fixture in ['own_motor.js','extra_cases.js'] and label=='r1' or fixture=='extra_cases.js' else 0))
for label in ['r2','blocked','new']:commands.append((label+'-motor-performance',['node','motor.cjs',label,'motor-performance.js','evidence/'+label+'-motor-performance.json'],0))
receipts=[]
for name,cmd,expected in commands:
 p=subprocess.run([sys.executable,'capture.py',name,*cmd],cwd=r,capture_output=True,text=True);receipt=json.loads((r/'evidence'/name/'exit.json').read_text());receipt['expectedExit']=expected;receipts.append(receipt);(r/'evidence/post-gates-execution.json').write_text(json.dumps(receipts,indent=2));print(json.dumps({'name':name,'exit':p.returncode,'expected':expected}),flush=True)
 if p.returncode!=expected:print(p.stderr,p.stdout);raise SystemExit(1)
for name,cmd in [('trace-classification',['python3','trace-classify.py']),('extras-analysis',['python3','extra-analysis.py'])]:
 p=subprocess.run([sys.executable,'capture.py',name,*cmd],cwd=r,capture_output=True,text=True);print(p.stdout,p.stderr,flush=True)
 if p.returncode:raise SystemExit(p.returncode)
