from pathlib import Path
import json,subprocess,hashlib,shutil,importlib.util,sys,yaml
r=Path(__file__).resolve().parent;repo=r/'repo';out=r/'evidence';src=repo/'index.html'
paths=subprocess.check_output(['git','ls-files'],cwd=repo,text=True).splitlines();paths+=['tests/behavioral/farm-runtime.cjs']
paths=sorted(set(paths));frozen={p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in paths}
(out/'frozen.json').write_text(json.dumps(frozen,indent=2));subprocess.run(['git','add','index.html','tests/behavioral/run.py','tests/behavioral/farm-runtime.cjs','docs/tasks/LAB_MOTES_B2_001.md'],cwd=repo,check=True)
tree=subprocess.check_output(['git','write-tree'],cwd=repo,text=True).strip();(out/'frozen-identity.json').write_text(json.dumps({'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'tree':tree,'indexSHA256':frozen['index.html'],'files':len(frozen)},indent=2))
for label,index in [('r1',r/'input/RUNTIME/QA_04_05/REFERENCE/R1_index.html'),('r2',r/'baselines/R2_index.html'),('blocked',r/'baselines/blocked_index.html'),('new',src)]:
 dest=r/'stages'/label;dest.mkdir(parents=True,exist_ok=True)
 for name in ['fonts','branding']:shutil.copytree(repo/name,dest/name,dirs_exist_ok=True)
 sys.path.insert(0,str(repo/'tests/behavioral'));sp=importlib.util.spec_from_file_location('h',repo/'tests/behavioral/run.py');h=importlib.util.module_from_spec(sp);sp.loader.exec_module(h)
 text=index.read_text();bridge=(r/'input/RUNTIME/QA_04_05/REPRODUCE/bridge.js').read_text();marker='\n})();\n</script>\n<script>\nif(window.Capacitor';assert text.count(marker)==1
 stage=text.replace('<head>','<head>\n'+h.build_prelude({'fresh':{'save':None}})+'<script>__qaUiMeasurementPause(true);localStorage.setItem("lumenfall_startup_intro_last",String(Date.now()))</script>',1).replace(marker,'\n'+bridge+marker,1)
 (dest/'index.html').write_text(stage)
steps=[s for s in yaml.safe_load((repo/'.github/workflows/pre-merge-validation.yml').read_text())['jobs']['validation']['steps'] if 'run' in s];assert len(steps)==7
for i,s in enumerate(steps,1):
 d=r/'gates'/f'gate-{i:02d}';d.mkdir(parents=True,exist_ok=True);(d/'name.txt').write_text(s['name']);(d/'command.sh').write_text(s['run'])
shutil.copy2(r/'input/gates/sitecustomize.py',r/'gates/sitecustomize.py')
print({'tree':tree,'files':len(frozen),'stages':4,'gates':len(steps)})
