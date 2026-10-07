from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import importlib.util,sys,shutil,subprocess,json,threading,datetime,hashlib

root=Path(__file__).resolve().parent
head=root/'head'
sys.path.insert(0,str(head/'tests/behavioral'))
spec=importlib.util.spec_from_file_location('candidate_harness',head/'tests/behavioral/run.py')
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
stage=root/'independent_stage';stage.mkdir(exist_ok=True)
shutil.copytree(head/'fonts',stage/'fonts',dirs_exist_ok=True);shutil.copytree(head/'branding',stage/'branding',dirs_exist_ok=True)
original=h.build_bridge
h.build_bridge=lambda:original()+'\n'+(root/'core_bridge.js').read_text()+'\n'+(root/'core_checks.js').read_text()
h.build_runner=lambda:''
source=(head/'index.html').read_text();instrumented=h.instrument_html(source,h.load_fixtures())
(stage/'index.html').write_text(instrumented)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(stage)))
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
cmd=['node',str(root/'independent.cjs'),str(root/'runtime/chrome-headless-shell-linux64/chrome-headless-shell'),f'http://127.0.0.1:{server.server_port}/index.html?qaScenario=core-pr46&qaFixture=fresh',str(root/'evidence/independent.json')]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
try:p=subprocess.run(cmd,capture_output=True,text=True,timeout=180)
finally:server.shutdown();server.server_close();thread.join()
(root/'evidence/independent.log').write_text(p.stdout+'\nSTDERR\n'+p.stderr)
(root/'evidence/independent_command.json').write_text(json.dumps({'command':cmd,'started_at':started,'exitcode':p.returncode,'source_sha256':hashlib.sha256(source.encode()).hexdigest(),'instrumented_sha256':hashlib.sha256(instrumented.encode()).hexdigest(),'instrumentation':'Original prelude/bridge, runner removed; own closure access and assertions in staged copy. Intervals paused by driver, save guards open during actual actions. Fixed DPS only in explicit numeric simulation fixtures; restored after each call. Real reload/backup/recovery/Ascend/Reset paths use original handlers and canonical guards.'},indent=2)+'\n')
print(p.stdout);print(p.stderr);raise SystemExit(p.returncode)
