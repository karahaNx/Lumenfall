from pathlib import Path
import sys,importlib.util,subprocess,json,hashlib,shutil,yaml
r=Path(__file__).resolve().parent;repo=r.parent/'b2_qa_repo';inp=r.parent/'b2_local_input'
sys.path.insert(0,str(repo/'tests/behavioral'))
sp=importlib.util.spec_from_file_location('h',repo/'tests/behavioral/run.py');h=importlib.util.module_from_spec(sp);sp.loader.exec_module(h)
bridge=(inp/'REPRODUCE/QA_R2/FIXTURES/own_bridge.js').read_text()
r2=subprocess.check_output(['git','show','3cdebc236e9ee5081a4bca4e323b11f43aa0d46d:index.html'],cwd=repo,text=True)
old=r2[r2.index('function simulationApplyFarmPassive('):r2.index('function simulationPassiveKillSeconds(')]
bridge+='\nownQA.installR2=()=>{let saved=simulationApplyFarmPassive;simulationApplyFarmPassive='+old.strip()+';return ()=>simulationApplyFarmPassive=saved;};\n'
bridge+='''
ownQA.trace=fn=>{let saved=simulationApplyFarmPassive,steps=[];
simulationApplyFarmPassive=(seconds,dps,policy,summary)=>{let before={hp:state.enemyHp,H:state.enemyMaxHp,acc:state.luminousAccum,flag:state.enemyIsLuminous,depth:state.depth,lumenRate:enemyRewardFor(state.depth),shardRate:shardRewardFor(state.depth),scale:simulationRewardScale(policy),lumenSummary:summary.lumenGained,shardSummary:summary.shardGained,lumen:state.lumen,shards:state.shards},k=summary.kills,l=summary.luminousKills;saved(seconds,dps,policy,summary);steps.push({seconds,dps,D:dps*seconds,before,kills:summary.kills-k,luminous:summary.luminousKills-l,hp:state.enemyHp,acc:state.luminousAccum,flag:state.enemyIsLuminous,after:{lumenSummary:summary.lumenGained,shardSummary:summary.shardGained,lumen:state.lumen,shards:state.shards}});};try{return {result:fn(),steps};}finally{simulationApplyFarmPassive=saved;}};
'''
(r/'bridge.js').write_text(bridge)
marker='\n})();\n</script>\n<script>\nif(window.Capacitor';hashes={}
for label,ref in {'r1':'d1e988816ed10b8f851521938a117a4d84d29e1b','r2':'3cdebc236e9ee5081a4bca4e323b11f43aa0d46d','local':None}.items():
 src=subprocess.check_output(['git','show',ref+':index.html'],cwd=repo,text=True) if ref else (repo/'index.html').read_text();dest=r/'stage'/label;dest.mkdir(parents=True,exist_ok=True)
 for asset in ['fonts','branding']:shutil.copytree(repo/asset,dest/asset,dirs_exist_ok=True)
 assert src.count(marker)==1
 out=src.replace('<head>','<head>\n'+h.build_prelude({'fresh':{'save':None}})+'<script>__qaUiMeasurementPause(true);localStorage.setItem("lumenfall_startup_intro_last",String(Date.now()))</script>',1).replace(marker,'\n'+bridge+marker,1)
 (dest/'index.html').write_text(out);hashes[label]={'source':hashlib.sha256(src.encode()).hexdigest(),'instrumented':hashlib.sha256(out.encode()).hexdigest()}
(r/'stage/hashes.json').write_text(json.dumps(hashes,indent=2))
(r/'evidence').mkdir(exist_ok=True);(r/'fixtures').mkdir(exist_ok=True)
for f in ['own_motor.js','extra_cases.js','natural_high.js']:
 shutil.copy2(inp/'REPRODUCE/QA_R2/FIXTURES'/f,r/'fixtures'/f)
workflow=repo/'.github/workflows/pre-merge-validation.yml';g=r/'gates';g.mkdir(exist_ok=True)
steps=[x for x in yaml.safe_load(workflow.read_text())['jobs']['validation']['steps'] if 'run' in x];assert len(steps)==7
for i,s in enumerate(steps,1):
 d=g/f'gate-{i:02d}';d.mkdir(exist_ok=True);(d/'name.txt').write_text(s['name']);(d/'command.sh').write_text(s['run'])
frozen={x['path']:x['sha256'] for x in json.loads((r/'identity.json').read_text())['source']};frozen['.github/workflows/pre-merge-validation.yml']=hashlib.sha256(workflow.read_bytes()).hexdigest();(g/'frozen-source.json').write_text(json.dumps(frozen,indent=2))
shutil.copy2(inp/'REPRODUCE/gates/sitecustomize.py',g/'sitecustomize.py')
print(json.dumps({'stages':hashes,'gates':len(steps),'frozenFiles':len(frozen)}))
