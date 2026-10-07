from pathlib import Path
import json,collections
from fractions import Fraction as F
r=Path(__file__).resolve().parent;result={}
for label in ['r1','r2','local']:
 raw=json.load(open(r/'evidence'/f'{label}-diag-trace.json'));rows=[];bad=[];totals=collections.Counter()
 for row in raw['rows']:
  segments=[]
  for t in row['trace']['steps']:
   b=t['before'];D,h,H=F(t['D']),F(b['hp']),F(b['H']);expected=0 if D<h else 1+(D-h)//H;deficit=h+expected*H-D;promoted=t['kills']==expected+1 and deficit>0 and (deficit<=F(1e-9) or deficit<=F(b['H']*1e-12));classification='exact-represented-count' if t['kills']==expected else 'unchanged-threshold-promotion' if promoted else 'count-mismatch'
   rewards=[]
   for rate,summary,state in [('lumenRate','lumenSummary','lumen'),('shardRate','shardSummary','shards')]:
    gain=b[rate]*b['scale']*t['kills'];rewards.append({'field':state,'gain':gain,'expectedSummaryAfter':b[summary]+gain,'actualSummaryAfter':t['after'][summary],'expectedStateAfter':b[state]+gain,'actualStateAfter':t['after'][state],'sameOperationOrder':t['after'][summary]==b[summary]+gain and t['after'][state]==b[state]+gain})
   rec={'seconds':t['seconds'],'DExact':str(D),'hpExact':str(h),'HExact':str(H),'expected':expected,'actual':t['kills'],'nextThresholdDeficit':str(deficit),'classification':classification,'rewards':rewards};segments.append(rec);totals[classification]+=1
   if classification=='count-mismatch' or not all(x['sameOperationOrder'] for x in rewards):bad.append({'index':row['index'],'segment':rec})
  rows.append({'index':row['index'],'segments':segments,'oldWholeLedgerCount':row['oracle']['kills'],'actualAggregateKills':row['trace']['result']['summary']['kills'],'segmentedExactCountSum':sum(s['expected'] for s in segments)})
 result[label]={'rows':len(rows),'classifications':dict(totals),'bad':bad,'detail':rows}
(r/'evidence/own-represented-diagnostic-traces.json').write_text(json.dumps(result,indent=2));print(json.dumps({l:{k:v[k] for k in ['rows','classifications']}|{'bad':len(v['bad'])} for l,v in result.items()}))
