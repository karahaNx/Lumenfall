from pathlib import Path
from fractions import Fraction as F
import struct,json,math,random,subprocess,hashlib
r=Path(__file__).resolve().parent;o=r/'evidence';rows=[]
def bits(x):return struct.pack('>d',float(x)).hex()
def add(D,H,hp,label):
 D,H,hp=map(float,[D,H,hp])
 if not(0<=D and H>0 and hp>0 and all(map(math.isfinite,[D,H,hp]))):return
 d,h,hpF=map(F,[D,H,hp]);q=d//h;k=0 if d<hpF else 1+(d-hpF)//h
 if q>2**53-1 or k>2**53-1:return
 deficit=hpF+k*h-d;remaining=hpF-d if k==0 else h-(d-hpF)%h
 rows.append({'D':bits(D),'H':bits(H),'hp':bits(hp),'q':q,'kills':k,'hpExpected':float(remaining),'deficit':float(deficit),'scope':label})
for a in json.loads((r/'historical/evidence/local-numeric.json').read_text())['rows']:add(a['damage'],a['H'],a['hp'],'same-original-7945')
counts=[0,1,2,89,65537,*[2**p+d for p in [50,51,52] for d in [-3,-1,0,1,3,19]],2**53-101,2**53-3,2**53-2,2**53-1]
for H in [11.,13.,107.,196246.,5017085352268982000.,1e40,1e125,1e200,17.25,43.1,11.5,4*math.pi,1e250]:
 for q in counts:
  x=H*q
  for D in [math.nextafter(x,0),x,math.nextafter(x,math.inf),x+H*.27,x+H*.81]:
   for hp in [H,H*.37,H*.9999999999999999,1e-7,H*2**-40]:add(D,H,hp,'new-physical-adversarial')
random.seed(208)
for i in range(4000):
 H=math.ldexp(1+random.random(),random.randint(4,830));q=random.choice([random.randrange(1,10000),random.randrange(2**50,2**53)])
 x=H*q;D=random.choice([x,math.nextafter(x,0),math.nextafter(x,math.inf)])
 add(D,H,random.choice([H,H*.37,1e-7]),'new-deterministic')
for H in [11.,196246.,1e125]:
 for hp in [H,H*.37]:add(hp-max(1e-7,H*1e-10),H,hp,'positive-deficit')
for H in [5e-324,1e-310,1e-200,1.1,1.5]:
 for q in [1,90,2**50,2**52,2**53-1]:
  for D in [H*q,math.nextafter(H*q,0),math.nextafter(H*q,math.inf)]:add(D,H,H,'isolated-nonphysical-helper')
(o/'numeric-inputs.json').write_text(json.dumps(rows,separators=(',',':')))
source=(r/'repo/index.html').read_text();body=source[source.index('function simulationApplyFarmPassive('):source.index('function simulationPassiveKillSeconds(')]
old=(r/'baselines/R2_index.html').read_text();old=old[old.index('function simulationApplyFarmPassive('):old.index('function simulationPassiveKillSeconds(')]
runner="""var fs=require('fs'),vm=require('vm');var inputs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));function num(s){return Buffer.from(s,'hex').readDoubleBE();}var c={BigInt:undefined,SIM_EPS:1e-9,state:null,kills:0,enemyHpFor:function(){return c.state.enemyMaxHp;},simulationBatchFarmKills:function(k){c.kills=k;c.state.enemyHp=c.state.enemyMaxHp;}};vm.createContext(c);vm.runInContext(BODY,c);var results=inputs.map(function(f){var D=num(f.D),H=num(f.H),hp=num(f.hp);c.state={depth:1,enemyHp:hp,enemyMaxHp:H};c.kills=0;c.simulationApplyFarmPassive(1,D,{},{});var q=c.simulationWholeHpUnits?c.simulationWholeHpUnits(D,H):null;return {q:q,kills:c.kills,hpAfter:c.state.enemyHp};});fs.writeFileSync(process.argv[3],JSON.stringify(results));"""
engines={'modern':'node','oldV8':str(r/'runtime/node-v8.17.0-linux-x64/bin/node')};reports=[]
blocked=(r/'baselines/blocked_index.html').read_text();blocked=blocked[blocked.index('function simulationApplyFarmPassive('):blocked.index('function simulationPassiveKillSeconds(')]
for label,fn in [('new',body),('blocked-modern',blocked),('old-R2',old)]:
 (o/(label+'-numeric-runner.cjs')).write_text(runner.replace('BODY',json.dumps(fn)).replace('BigInt:undefined,','' if label=='blocked-modern' else 'BigInt:undefined,'))
 for engine,node in engines.items():
  if label=='blocked-modern' and engine=='oldV8':continue
  output=o/(label+'-'+engine+'-numeric-results.json');cmd=[node,str(o/(label+'-numeric-runner.cjs')),str(o/'numeric-inputs.json'),str(output)];p=subprocess.run(cmd,capture_output=True,text=True);assert p.returncode==0,p.stderr
  results=json.loads(output.read_text());qbad=[];bad=[];hpbad=[];prom=[]
  for f,a in zip(rows,results):
   D,H,hp=map(lambda x:struct.unpack('>d',bytes.fromhex(x))[0],[f['D'],f['H'],f['hp']]);promotion=a['kills']==f['kills']+1 and f['deficit']>0 and f['deficit']<=max(1e-9,H*1e-12)
   if a['q'] is not None and a['q']!=f['q']:qbad.append({'input':f,'actual':a})
   if f['scope']!='isolated-nonphysical-helper':
    if a['kills']!=f['kills'] and not promotion:bad.append({'input':f,'actual':a})
    elif promotion:prom.append({'input':f,'actual':a})
    # Existing remainder/HP arithmetic is not the helper quotient proof.
    if not promotion and abs(a['hpAfter']-f['hpExpected'])>max(1e-7,H*2e-15):hpbad.append({'input':f,'actual':a})
  report={'source':label,'engine':engine,'command':cmd,'exit':p.returncode,'stderr':p.stderr,'inputs':len(rows),'original7945':sum(f['scope']=='same-original-7945' for f in rows),'quotientFailures':len(qbad),'countFailures':len(bad),'hpFailures':len(hpbad),'unchangedBoundaryPromotions':len(prom),'qbad':qbad,'bad':bad,'hpbad':hpbad,'promotions':prom};reports.append(report)
  assert label!='new' or not qbad
(o/'numeric-verification.json').write_text(json.dumps({'oracle':'Python Fraction of IEEE binary64 inputs passed by hex, independent of product significand division','reports':reports},indent=2));print(json.dumps([{k:v for k,v in a.items() if k not in ['command','stderr','qbad','bad','hpbad','promotions']} for a in reports]))
newResults=json.loads((o/'new-modern-numeric-results.json').read_text());blockedResults=json.loads((o/'blocked-modern-modern-numeric-results.json').read_text());oldResults=json.loads((o/'new-oldV8-numeric-results.json').read_text());assert newResults==blockedResults==oldResults
(o/'numeric-policy-parity.json').write_text(json.dumps({'rows':len(rows),'newEqualsBlockedModern':True,'newOldV8EqualsModern':True,'strictCountDifferences':reports[0]['countFailures'],'strictHpDifferences':reports[0]['hpFailures'],'classification':'Unchanged policy diagnostics, not strict-green stress results. Exact quotient verified independently for every row. Both composed-EPS count rows and residual snap HP rows are preserved in numeric-verification.json.'},indent=2))
# Replay original equal-damage half splits on new bytes; six historical EPS rows remain separate.
split=json.loads((r/'historical/evidence/split-numeric.json').read_text());srows=split['rows']+split['boundary']
code=runner[:runner.index('var results=')]+"var results=inputs.map(function(f){var D=f.D,H=f.H,hp=H*f.f;var outcomes=[false,true].map(function(split){c.state={depth:1,enemyHp:hp,enemyMaxHp:H};var kills=0;for(var i=0;i<(split?2:1);i++){c.kills=0;c.simulationApplyFarmPassive(1,split?D/2:D,{},{});kills+=c.kills;}return {kills:kills,hp:c.state.enemyHp};});return {input:f,outcomes:outcomes};});fs.writeFileSync(process.argv[3],JSON.stringify(results));"
(o/'split-inputs.json').write_text(json.dumps(srows));(o/'split-runner.cjs').write_text(code.replace('BODY',json.dumps(body)));p=subprocess.run(['node',str(o/'split-runner.cjs'),str(o/'split-inputs.json'),str(o/'split-results.json')],capture_output=True,text=True);assert p.returncode==0,p.stderr
actual=json.loads((o/'split-results.json').read_text());bad=[]
for i,a in enumerate(actual[:len(split['rows'])]):
 f=a['input'];D,H,hp=map(F,[float(f['D']),float(f['H']),float(f['H'])*f['f']]);k=0 if D<hp else 1+(D-hp)//H
 if any(z['kills']!=k for z in a['outcomes']) or abs(a['outcomes'][0]['hp']-a['outcomes'][1]['hp'])>max(1e-7,float(H)*2e-15):bad.append(a)
assert not bad
(o/'split-verification.json').write_text(json.dumps({'exactCases':len(split['rows']),'unchangedBoundaryExcluded':len(split['boundary']),'failures':bad,'commandExit':p.returncode},indent=2));print({'equalDamageHalfSplits':len(split['rows']),'boundarySeparate':len(split['boundary']),'bad':len(bad)})
