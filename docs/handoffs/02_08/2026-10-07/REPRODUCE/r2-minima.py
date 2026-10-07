from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import threading,shutil,sys,importlib.util,subprocess,json,hashlib
r=Path(__file__).resolve().parent;repo=r/'repo';sys.path.insert(0,str(repo/'tests/behavioral'));sp=importlib.util.spec_from_file_location('h',repo/'tests/behavioral/run.py');h=importlib.util.module_from_spec(sp);sp.loader.exec_module(h);stage=r/'r2-minima-stage';stage.mkdir(exist_ok=True)
for asset in ['fonts','branding']:shutil.copytree(repo/asset,stage/asset,dirs_exist_ok=True)
src=(r/'baselines/R2_index.html').read_text();(stage/'index.html').write_text(h.instrument_html(src,h.load_fixtures()))
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(stage)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();reports=[]
try:
 for label in ['core','natural']:
  driver=r/('r2-'+label+'.cjs');code=(repo/'tests/behavioral/farm-runtime.cjs').read_text().replace("['b1','core','natural','fractional','fractional-high']","['"+label+"']");driver.write_text(code)
  cmd=['node',str(driver),str(r/'runtime/bin/google-chrome'),'http://127.0.0.1:'+str(server.server_port)+'/index.html?qaScenario=lab-motes-runtime&qaFixture=fresh','lab-motes-runtime'];p=subprocess.run(cmd,capture_output=True,text=True,timeout=90)
  (r/'evidence'/('r2-'+label+'-raw.json')).write_text(p.stdout);(r/'evidence'/('r2-'+label+'-stderr.txt')).write_text(p.stderr);a=json.loads(p.stdout);assert p.returncode==1 and a['status']=='fail' and 'threshold count' in a['message'];row=a['records'][-1];actual=row['parts'][-1]['summary']['kills'];expected=3275345183542180 if label=='core' else 3277040892359271;assert actual==expected+1
  reports.append({'case':label,'command':cmd,'exit':p.returncode,'oracleFailure':a['message'],'actual':actual,'expected':expected,'DPS':row['dps'],'sourceSHA256':hashlib.sha256(src.encode()).hexdigest(),'BigIntUnavailableInApp':True,'teardown':a['teardown']})
finally:server.shutdown();server.server_close();thread.join()
(r/'evidence/r2-minima-verification.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports))
