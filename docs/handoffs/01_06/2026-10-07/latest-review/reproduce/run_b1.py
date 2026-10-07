from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import importlib.util,sys,shutil,subprocess,json,threading,datetime,hashlib
root=Path(__file__).resolve().parent
head=root/'head';sys.path.insert(0,str(head/'tests/behavioral'))
spec=importlib.util.spec_from_file_location('candidate_harness',head/'tests/behavioral/run.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
stage=root/'b1_stage';stage.mkdir(exist_ok=True)
for n,source_root in [('local',head),('r2',root.parent/'r2')]:
 d=stage/n;d.mkdir(exist_ok=True)
 for assets in ['fonts','branding']:shutil.copytree(source_root/assets,d/assets,dirs_exist_ok=True)
 # Same minimal Core bridge and prelude on both sources. No product fixes.
 src=(source_root/'index.html').read_text();marker='\n})();\n</script>\n<script>\nif(window.Capacitor';assert src.count(marker)==1
 bridge=(root/'core_bridge.js').read_text()
 out=src.replace('<head>','<head>\n'+h.build_prelude(h.load_fixtures()),1).replace(marker,'\n'+bridge+'\n'+(root/'b1_checks.js').read_text()+marker,1)
 (d/'index.html').write_text(out)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(stage)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
cmd=['node',str(root/'b1_driver.cjs'),str(root/'runtime/chrome-headless-shell-linux64/chrome-headless-shell'),f'http://127.0.0.1:{server.server_port}',str(root/'evidence/b1_motor.json')]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
try:p=subprocess.run(cmd,capture_output=True,text=True,timeout=180)
finally:server.shutdown();server.server_close();thread.join()
(root/'evidence/b1_motor.log').write_text(p.stdout+'\nSTDERR\n'+p.stderr)
(root/'evidence/b1_motor_command.json').write_text(json.dumps({'command':cmd,'started_at':started,'exitcode':p.returncode,'local_source_sha256':hashlib.sha256((head/'index.html').read_bytes()).hexdigest(),'R2_source_sha256':hashlib.sha256((root.parent/'r2/index.html').read_bytes()).hexdigest()},indent=2))
print(p.stdout,p.stderr);raise SystemExit(p.returncode)
