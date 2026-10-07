from pathlib import Path
import json
from fractions import Fraction as F
root=Path(__file__).resolve().parent
# JavaScript's shortest JSON decimal is a round-trip representation, not a
# precise arbitrary integer. Always round back to the original IEEE double.
def ieee(value):return F(float(value))
sets={s:json.loads((root/'evidence'/(s+'-diagnostic-trace')/'results.json').read_text())['rows'] for s in ['r1','r2','local']}
full={s:json.loads((root/'evidence'/(s+'-diagnostics')/'results.json').read_text())['rows'] for s in sets}
issues={s:[] for s in sets};carry_issues={s:[] for s in sets};count_diff=[];new_diff=[];detail=[]
for i,r in enumerate(sets['local']):
 counts={s:sets[s][i]['trace']['result']['summary']['kills'] for s in sets}
 if counts['r1']!=counts['r2']:count_diff.append({'key':r['key'],'counts':counts})
 if counts['r2']!=counts['local']:new_diff.append({'key':r['key'],'counts':counts})
 record={'key':r['key'],'originalErrors':r['originalErrors'],'counts':counts,'oldNormalizedLedgerKills':r['oracle']['kills'],'segments':{}}
 for label,rows in sets.items():
  trace=rows[i]['trace'];segments=[]
  assert trace['result']['summary']['kills']==full[label][r['index']]['result']['summary']['kills']
  for step in trace['steps']:
   D=ieee(step['D']);H=ieee(step['before']['H']);hp=ieee(step['before']['hp']);k=0 if D<hp else 1+(D-hp)//H;deficit=hp+k*H-D
   tolerated=step['kills']==k+1 and deficit>0 and (deficit<=ieee(1e-9) or deficit/H<=ieee(1e-12))
   valid=step['kills']==k or tolerated
   if not valid:issues[label].append({'key':r['key'],'exactCount':int(k),'actual':step['kills']})
   ideal_hp=H if tolerated else hp-D if k==0 else H-(D-hp)%H
   hp_error=abs(ieee(step['hp'])-ideal_hp)
   carry_valid=hp_error<=ieee(1e-9)+H*ieee(1e-12)
   if not carry_valid:carry_issues[label].append({'key':r['key'],'actualHp':step['hp'],'expectedHp':float(ideal_hp),'error':float(hp_error)})
   segments.append({'representedDamage':str(D),'partialHP':str(hp),'maxHP':str(H),'exactKills':int(k),'actualKills':step['kills'],'existingTolerance':bool(tolerated),'countSupported':valid,'carrySupported':carry_valid,'expectedHp':str(ideal_hp),'actualHp':str(ieee(step['hp'])),'nextThresholdDeficit':str(deficit)})
  record['segments'][label]=segments
 record['localExactSegmentCount']=sum(x['exactKills'] for x in record['segments']['local']);detail.append(record)
result={'cases':123,'sameR2LocalCounts':not new_diff,'r1R2CountDifferences':count_diff,'r2LocalCountDifferences':new_diff,'segmentCountIssues':issues,'segmentCarryIssues':carry_issues,'rows':detail,'representation':'Fraction(float(JSON-number)) restores incoming IEEE double; no arbitrary decimal integer oracle','status':'original diagnostics remain FAIL; separate exact-segment classification'}
(root/'evidence/diagnostic-count-classification.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'cases':123,'r1R2CountDifferences':len(count_diff),'r2LocalCountDifferences':len(new_diff),'segmentCountIssues':{s:len(v) for s,v in issues.items()},'segmentCarryIssues':{s:len(v) for s,v in carry_issues.items()}}))
