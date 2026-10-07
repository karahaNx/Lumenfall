from pathlib import Path
from fractions import Fraction as F
import json,math
r=Path(__file__).resolve().parent;w=r.parent/'worker_raw/evidence'
def exact(v):return F.from_float(float(v))
reports={};errors=[]
for source in ['local','r2']:
 d=json.loads((w/f'{source}-numeric.json').read_text());quotient_bad=0;strict_bad=0;promotions=0;unsupported=0;classification_bad=[]
 for i,row in enumerate(d['rows']):
  D,H,hp=map(exact,[row['damage'],row['H'],row['hp']]);q=D//H;count=0 if D<hp else 1+(D-hp)//H
  if source=='local' and row['quotient']!=q:quotient_bad+=1
  if count>2**53-1 or row['kills']>2**53-1:unsupported+=1
  deficit=hp+count*H-D
  tolerance=row['kills']==count+1 and deficit>0 and (deficit<=exact(1e-9) or deficit<=H*exact(1e-12))
  if tolerance:promotions+=1
  elif row['kills']!=count:strict_bad+=1
  if row['status']=='existing-boundary-tolerance' and not tolerance:classification_bad.append(i)
 reports[source]={'rows':len(d['rows']),'exactHelperQuotientFailures':quotient_bad,'countDifferencesOutsideExistingEPS':strict_bad,'explicitExistingEPSPromotions':promotions,'outsideSafeFinalCount':unsupported,'invalidToleranceLabels':classification_bad}
 if quotient_bad or classification_bad:errors.append(source+' quotient/classification mismatch')
 if source=='local' and strict_bad:errors.append('local strict count mismatch')
diag=json.loads((w/'diagnostic-count-classification.json').read_text());local_bad=[];promotions=0;segments=0
for row in diag['rows']:
 for s in row['segments']['local']:
  segments+=1;D=F(s['representedDamage']);hp=F(s['partialHP']);H=F(s['maxHP']);count=0 if D<hp else 1+(D-hp)//H;deficit=hp+count*H-D
  tolerant=s['actualKills']==count+1 and deficit>0 and (deficit<=exact(1e-9) or deficit<=H*exact(1e-12))
  if tolerant:promotions+=1
  if s['actualKills']!=count and not tolerant:local_bad.append(row['key'])
result={'status':'PASS' if not errors and not local_bad else 'FAIL','scope':'Own rational audit of supplied raw numeric data; no fresh product execution in this command','matrix':reports,'strictDiagnosticRows':diag['cases'],'localDiagnosticSegments':segments,'localDiagnosticEPSPromotions':promotions,'localDiagnosticUnexplainedCounts':local_bad,'original1340DiagnosticAggregate':'FAIL retained: 123 rows / 379 assertions; audit does not relabel originals','errors':errors}
(r/'evidence/numeric_evidence_audit.json').write_text(json.dumps(result,indent=2));print(result);raise SystemExit(0 if result['status']=='PASS' else 1)
