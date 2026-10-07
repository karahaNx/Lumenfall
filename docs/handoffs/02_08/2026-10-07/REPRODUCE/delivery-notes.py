from pathlib import Path
import json,struct
from fractions import Fraction as F
r=Path(__file__).resolve().parent;o=r/'evidence';raw=json.loads((r/'gates/verified-raw-results.json').read_text());native=next(x['payload'] for x in raw['positive'] if x['scenario']=='lab-motes-runtime');rows=[]
for a in native['records']:
 if a['type'] in ['core','natural','b1']:
  parts=a['parts'];last=parts[-1]['state'];dps=F(float(a['dps']));damage=sum((F(float(s['damage'])) for s in a['trace']),F(0));rows.append({'type':a['type'],'UseMotes':a['use'],'policy':a['kind'],'split':a['split'],'DPSExact':str(dps),'representedDamageSum':str(damage),'kills':a['oracle']['summary']['kills'],'nextHP':last['enemyHp'],'Motes':last['motes'],'work':last['activeStudies'][0]['remainingSec'],'payment':a['oracle']['payment'],'spawnAndRewardOracle':'PASS'})
(o/'minimum-ledger.json').write_text(json.dumps({'rows':rows,'APIAbsence':native['availability'],'checks':native['checks'],'wholeSplitNote':'Core OFF equal total damage. Natural OFF split has 15/4 less represented damage; next HP can differ. ON has traced enabling reward segments and post-payment work.'},indent=2))
print({'minimumRows':len(rows),'CoreOFF':[(x['policy'],x['split'],x['kills'],x['nextHP']) for x in rows if x['type']=='core' and not x['UseMotes']]})
