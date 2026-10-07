from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import subprocess,json,shutil,threading,datetime
r=Path(__file__).resolve().parent;stage=r/'runtime_stage';web=stage/'mobile/www';web.mkdir(parents=True,exist_ok=True)
for a in ['fonts','branding']:shutil.copytree(r/'head'/a,web/a,dirs_exist_ok=True)
shutil.copy2(r/'head/index.html',web/'index.html');logs=[]
for name,cmd,cwd in [('apk-verifier-self-test',['python',str(r/'head/scripts/verify_apk_identity.py'),'--self-test'],r/'head'),('install-runtime-guard',['bash',str(r/'install_guard.sh')],stage)]:
 p=subprocess.run(cmd,cwd=cwd,capture_output=True,text=True);(r/'evidence'/f'{name}.log').write_text(p.stdout+p.stderr);logs.append({'name':name,'command':cmd,'exit':p.returncode});assert p.returncode==0
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(web)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
cmd=['node',str(r/'smoke_driver.cjs'),str(r/'runtime/chrome-headless-shell-linux64/chrome-headless-shell'),f'http://127.0.0.1:{server.server_port}/index.html',str(r/'evidence/runtime_smoke.json')]
try:p=subprocess.run(cmd,capture_output=True,text=True,timeout=30)
finally:server.shutdown();server.server_close();thread.join()
(r/'evidence/runtime-smoke.log').write_text(p.stdout+p.stderr);logs.append({'name':'current-Chrome-guarded-startup','command':cmd,'exit':p.returncode,'limits':'Modern desktop engine at mobile viewport, not Android WebView or device acceptance.'});(r/'evidence/runtime_gate_commands.json').write_text(json.dumps(logs,indent=2));print(p.stdout);raise SystemExit(p.returncode)
