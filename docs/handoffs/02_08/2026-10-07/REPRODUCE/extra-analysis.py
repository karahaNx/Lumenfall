from pathlib import Path
import json,struct,math
from fractions import Fraction as F
r=Path(__file__).resolve().parent;o=r/'evidence';rows={v:json.loads((o/(v+'-extras.json')).read_text()) for v in ['r1','r2','new']};inputsEqual=all([x['input'] for x in rows['r1']['rows']]==[x['input'] for x in rows[v]['rows']] for v in ['r2','new']);diff=[]
for i,(a,b) in enumerate(zip(rows['r2']['rows'],rows['new']['rows'])):
 for field in ['state','summary']:
  if a['result'][field]!=b['result'][field]:diff.append({'index':i,'field':field,'R2':a['result'][field],'new':b['result'][field]})
rep={'cases':len(rows['new']['rows']),'sameInputsR1R2New':inputsEqual,'R2NewOutcomeDifferences':diff,'strictErrors':{k:len(v['errors']) for k,v in rows.items()},'R2NewStrictErrorsIdentical':rows['r2']['errors']==rows['new']['errors'],'status':'Original diagnostic aggregate FAIL retained; not a green stress suite'}
assert inputsEqual and not diff and rep['R2NewStrictErrorsIdentical'];(o/'extras-comparison.json').write_text(json.dumps(rep,indent=2));print(rep)
# Independently round exact rational products/additions to binary64 at each existing reward operation.
t=json.loads((o/'new-diag-trace.json').read_text());count=0;fail=[]
for row in t['rows']:
 for seg in row['trace']['steps']:
  b=seg['before']
  for rate,summary,state in [('lumenRate','lumenSummary','lumen'),('shardRate','shardSummary','shards')]:
   scaled=float(F(float(b[rate]))*F(float(b['scale'])));gain=float(F(scaled)*F(float(seg['kills'])));es=float(F(float(b[summary]))+F(gain));ev=float(F(float(b[state]))+F(gain));count+=1
   if seg['after'][summary]!=es or seg['after'][state]!=ev:fail.append({'index':row['index'],'field':state,'summaryExpected':es,'stateExpected':ev,'actual':seg['after']})
assert not fail
(o/'represented-rewards.json').write_text(json.dumps({'operations':count,'cases':len(t['rows']),'failures':fail,'oracle':'Python Fraction of restored represented binary64 values, rounded separately after rate*scale, scaled*count, previous+gain','originalStrictAggregate':'FAIL preserved'},indent=2));print({'rationalRewardOperations':count,'cases':len(t['rows']),'failures':len(fail)})
# Match exactly the historical 43 fixture keys to freshly executed scans.
original=json.loads((r/'input/CORE_01_06/WORKER_EVIDENCE/all43-comparison.json').read_text())['rows'];s={v:json.loads((o/(v+'-motor.json')).read_text())['scan'] for v in ['r1','r2','new']}
def key(f):return tuple(f[x] for x in ['depth','frac','flag','accum','needed'])
# Fresh scan.bad is the same independent 826-fixture observer used by QA.
oldkeys={key(x['fixture']) for x in original};nowkeys={key(x['fixture']) for x in s['r1']['bad']};assert oldkeys==nowkeys
assert s['new']['tested']==s['r2']['tested']==s['r1']['tested']==826 and not s['new']['bad'] and not s['r2']['bad']
(o/'all43-fresh.json').write_text(json.dumps({'exactOriginal43Keys':sorted(map(str,oldkeys)),'R1Fail':len(nowkeys),'R2Fail':len(s['r2']['bad']),'newFail':len(s['new']['bad']),'scanCases':826,'sameOriginal43':True},indent=2));print({'all43ExactOriginalKeys':True,'R1Fail':43,'R2Fail':0,'newFail':0})
