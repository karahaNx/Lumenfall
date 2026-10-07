from pathlib import Path
from fractions import Fraction
import math,struct,json,subprocess,random,hashlib
r=Path(__file__).resolve().parent;out=r/'evidence'
def bits(x):return struct.pack('>d',float(x)).hex()
rows={}
def add(D,H):
 if not(math.isfinite(D) and math.isfinite(H) and D>=0 and H>0):return
 q=Fraction.from_float(D)//Fraction.from_float(H)
 if q>2**53-2:return
 rows[(bits(D),bits(H))]={'D':bits(D),'H':bits(H),'expected':q}
for H in [1.,11.,33.,196246.,1.1,1.5,3.3,1e-8,1e-200,1e-80,1e20,1e100,1e220,1e250]:
 for q in [0,1,3,127,2**50-1,2**50,2**50+1,2**51-1,2**51,2**52-1,2**52,2**52+1,2**53-2]:
  x=H*q
  for D in [x,math.nextafter(x,0),math.nextafter(x,math.inf),x+H*.07,x+H*.4999,x+H*.99999]:add(D,H)
add(2**55+16,11.);add(40052722017724424*.9,11.)
random.seed(106)
for i in range(2500):
 H=math.ldexp(1+random.random(),random.randint(-800,800));q=random.choice([random.randrange(1,10000),random.randrange(2**50,2**53-2)])
 D=H*q
 add(random.choice([D,math.nextafter(D,0),math.nextafter(D,math.inf)]),H)
inputs=list(rows.values());(out/'arithmetic_inputs.json').write_text(json.dumps(inputs))
src=(r/'head/index.html').read_text();a=src.index('function simulationWholeHpUnits(');b=src.index('function simulationPassiveKillSeconds(',a);fn=src[a:b].strip()
code="const fs=require('fs');"+fn+"\nfunction num(hex){return Buffer.from(hex,'hex').readDoubleBE();} const rows=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); const out=rows.map(r=>{const D=num(r.D),H=num(r.H);return {...r,actual:simulationWholeHpUnits(D,H),oldR2:Math.round((D-D%H)/H)};});fs.writeFileSync(process.argv[3],JSON.stringify(out));"
(r/'arithmetic_runner.cjs').write_text(code)
cmd=['node',str(r/'arithmetic_runner.cjs'),str(out/'arithmetic_inputs.json'),str(out/'arithmetic_results.json')];p=subprocess.run(cmd,capture_output=True,text=True,timeout=30)
results=json.loads((out/'arithmetic_results.json').read_text());bad=[v for v in results if v['actual']!=v['expected']];old=[v for v in results if v['oldR2']!=v['expected']]
report={'status':'PASS' if p.returncode==0 and not bad and old else 'FAIL','inputs':len(inputs),'localFailures':len(bad),'oldR2Failures':len(old),'localFailureRows':bad,'oldR2FailureRows':old,'exit':p.returncode,'command':cmd,'stderr':p.stderr,'functionSHA256':hashlib.sha256(fn.encode()).hexdigest(),'oracle':'Python Fraction.from_float division, inputs passed by IEEE bits, safe quotient <= MAX_SAFE_INTEGER-1','limits':'Isolated actual helper only, no reward/partial/chronology side effects. Product motor is independently tested by run_b2.py.'}
(out/'arithmetic_verification.json').write_text(json.dumps(report,indent=2));print({k:v for k,v in report.items() if k not in ['localFailureRows','oldR2FailureRows','command','stderr']});raise SystemExit(0 if report['status']=='PASS' else 1)
