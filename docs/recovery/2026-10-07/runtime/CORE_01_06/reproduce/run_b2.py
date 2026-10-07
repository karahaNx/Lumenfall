from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from fractions import Fraction
import importlib.util,sys,shutil,subprocess,json,threading,datetime,hashlib,struct,math
root=Path(__file__).resolve().parent;head=root/'head';sys.path.insert(0,str(head/'tests/behavioral'))
spec=importlib.util.spec_from_file_location('candidate_harness',head/'tests/behavioral/run.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
stage=root/'b2_stage';stage.mkdir(exist_ok=True)
old=(root.parent/'r2/index.html').read_text();start=old.index('function simulationApplyFarmPassive(');end=old.index('function simulationPassiveKillSeconds(',start);oldfn=old[start:end].strip()
for version,source_root in [('r2',root.parent/'r2'),('local',head)]:
 d=stage/version;d.mkdir(exist_ok=True)
 for assets in ['fonts','branding']:shutil.copytree(source_root/assets,d/assets,dirs_exist_ok=True)
 src=(source_root/'index.html').read_text();marker='\n})();\n</script>\n<script>\nif(window.Capacitor';assert src.count(marker)==1
 bridge=(root/'core_bridge.js').read_text()+'\nvar coreExactOldR2Farm=('+oldfn+');\n'+(root/'b2_own.js').read_text()
 out=src.replace('<head>','<head>\n'+h.build_prelude(h.load_fixtures()),1).replace(marker,'\n'+bridge+marker,1);(d/'index.html').write_text(out)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(stage)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
cmd=['node',str(root/'b2_driver.cjs'),str(root/'runtime/chrome-headless-shell-linux64/chrome-headless-shell'),f'http://127.0.0.1:{server.server_port}',str(root/'evidence/b2_motor_raw.json')]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
try:p=subprocess.run(cmd,capture_output=True,text=True,timeout=180)
finally:server.shutdown();server.server_close();thread.join()
(root/'evidence/b2_motor.log').write_text(p.stdout+'\nSTDERR\n'+p.stderr)
raw=json.loads((root/'evidence/b2_motor_raw.json').read_text());checks=0;reports=[]
def exact(bits):return Fraction.from_float(struct.unpack('>d',bytes.fromhex(bits))[0])
for v in raw['versions']:
 for r in v['rows']:
  failures=[];classified=[];sum_damage=Fraction(0);oracle_kills=0
  def ok(value,message):
   global checks
   checks+=1
   if not value:failures.append(message)
  reward_lumen=0.0;reward_shards=0.0;reward_motes=0
  for t in r['trace']:
   D,hp,H=map(exact,[t['damageBits'],t['hpBits'],t['maxBits']]);sum_damage+=D
   count=0 if D<hp else 1+(D-hp)//H;oracle_kills+=count
   deficit=hp+count*H-D
   tolerant=t['kills']==count+1 and deficit>0 and (deficit<=Fraction.from_float(1e-9) or deficit<=H*Fraction.from_float(1e-12))
   if tolerant:classified.append({'type':'unchanged-boundary-EPS','deficit':str(deficit)})
   ok(t['kills']==count or tolerant,'segment exact represented kill count')
   remaining=hp-D if count==0 else H-(D-hp)%H
   if tolerant:remaining=H
   ok(abs(t['after']['enemyHp']-float(remaining))<1e-7,'segment partial HP')
   ok(t['kills']<=2**53-1,'safe segment count')
   actual=t['kills'];before=t['before'];scale=.7 if r['kind']=='offline' else 1.0
   luminous=(1 if before['enemyIsLuminous'] else 0)+(math.floor(before['luminousAccum']+(actual-1)*.03+1e-12) if actual>1 else 0) if actual else 0
   ok(t['luminous']==luminous,'unchanged represented batch Luminous policy')
   gain_lumen=(6.0*scale)*actual;gain_shards=scale*actual
   ok(t['after']['lumen']==float(before['lumen'])+gain_lumen,'actual represented Lumen addition')
   ok(t['after']['shards']==float(before['shards'])+gain_shards,'actual represented Shard addition')
   reward_lumen+=gain_lumen;reward_shards+=gain_shards;reward_motes+=luminous
  expected=3277040892359271 if r['natural'] else 3275345183542180
  ok(r['result']['kills']==expected,'documented minimum count')
  ok(r['state']['totalKills']==expected,'persistent totalKills')
  ok(r['result']['kills']==oracle_kills,'exact segment count sum')
  ok(float(r['result']['lumenGained'])==reward_lumen and float(r['result']['shardGained'])==reward_shards,'represented reward sums')
  ok(r['result']['motesGained']==reward_motes,'Luminous Motes ledger')
  if not r['natural']:ok(r['state']['enemyHp']==7,'Core minimum HP7')
  if r['natural']:
   ok(exact(r['dpsBits'])==40052722017724424,'actual natural DPS')
   def finite_cost(x):return all(finite_cost(v) for v in x.values()) if isinstance(x,dict) else isinstance(x,(float,int)) and math.isfinite(x) and x>=0
   ok(finite_cost(r['costs']),'finite normalized next costs')
   ok(r['normalized']['spirits']['titan']==1635 and r['normalized']['research']['formation']==500,'normalization keeps fixture investments')
  buys=1 if r['natural'] and r['use'] else 0
  ok(r['result']['studySpeedPurchases']==buys and r['result']['studyMotesSpent']==buys*60,'full price once')
  ok(r['state']['motes']==r['seed']['motes']+r['result']['motesGained']-60*buys,'Motes ledger')
  payment=None;offset=0
  for summary in r['summaries']:
   for event in summary['timeline']:
    if event['type']=='studySpeed':payment=offset+event['elapsedSec']
   offset+=summary['elapsedSec'] if 'elapsedSec' in summary else (r['split'] if offset==0 and r['split'] else r['seconds']-offset)
  if buys:ok(payment is not None and abs(payment-(8.03+11)/r['dps'])<1e-15,'actual enabling Luminous boundary')
  work=300-r['seconds']-(2*(r['seconds']-payment) if buys and payment is not None else 0)
  ok(abs(r['state']['activeStudies'][0]['remainingSec']-work)<1e-7,'work only after payment')
  ok(not r['result']['ascends'] and not r['result']['empowers'] and not r['result']['studiesCompleted'],'no bonus mutation explains difference')
  reports.append({'version':v['version'],'phase':r['phase'],'natural':r['natural'],'use':r['use'],'kind':r['kind'],'split':r['split'],'representedDamageSum':str(sum_damage),'expectedKills':expected,'actualKills':r['result']['kills'],'hp':r['state']['enemyHp'],'payment':payment,'boundaryClassifications':classified,'failures':failures,'assertionExit':1 if failures else 0})
unexpected=[r for r in reports if (r['version']=='r2' or r['phase']=='exact-old-R2')!=(bool(r['failures']) and not r['split'] and not r['use']) and bool(r['failures'])]
# Expected old source failures must include both minima/policies, while all local/restored rows pass.
control_failures=[r for r in reports if r['assertionExit']]
valid=not raw.get('pageErrors') and not raw.get('error') and p.returncode==0 and len(control_failures)==8 and all(r['phase']=='exact-old-R2' or r['version']=='r2' for r in control_failures) and all(not r['split'] and not r['use'] for r in control_failures)
result={'status':'PASS' if valid else 'FAIL','checks':checks,'rows':reports,'expectedControlFailures':len(control_failures),'browserExit':p.returncode,'command':cmd,'started_at':started,'oldR2FunctionSHA256':hashlib.sha256(oldfn.encode()).hexdigest(),'oracle':'Python Fraction decoded independently from binary64 hex bits; original strict assertions, no decimal integer interpretation','sourceSHA256':hashlib.sha256((head/'index.html').read_bytes()).hexdigest()}
(root/'evidence/b2_verification.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k not in ['rows','command']}));raise SystemExit(0 if valid else 1)
