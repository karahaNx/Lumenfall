from pathlib import Path
import importlib.util,sys,shutil,subprocess,hashlib,json
root=Path(__file__).resolve().parent; repo=root/'repo'
sys.path.insert(0,str(repo/'tests/behavioral'))
spec=importlib.util.spec_from_file_location('h',repo/'tests/behavioral/run.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
bridge=(root/'QA_R2/FIXTURES/own_bridge.js').read_text()
bridge+='''
ownQA.trace=fn=>{let original=simulationApplyFarmPassive,steps=[];
simulationApplyFarmPassive=(seconds,dps,policy,summary)=>{let before={hp:state.enemyHp,H:state.enemyMaxHp,acc:state.luminousAccum,flag:state.enemyIsLuminous,depth:state.depth,lumenRate:enemyRewardFor(state.depth),shardRate:shardRewardFor(state.depth),scale:simulationRewardScale(policy),lumenSummary:summary.lumenGained,shardSummary:summary.shardGained,lumen:state.lumen,shards:state.shards},k=summary.kills,l=summary.luminousKills,lg=summary.lumenGained,sg=summary.shardGained;original(seconds,dps,policy,summary);steps.push({seconds,dps,D:dps*seconds,before,kills:summary.kills-k,luminous:summary.luminousKills-l,lumen:summary.lumenGained-lg,shards:summary.shardGained-sg,hp:state.enemyHp,after:{lumenSummary:summary.lumenGained,shardSummary:summary.shardGained,lumen:state.lumen,shards:state.shards}});};
try{return {result:fn(),steps};}finally{simulationApplyFarmPassive=original;}};
'''
marker='\n})();\n</script>\n<script>\nif(window.Capacitor'
refs={'r1':'d1e988816ed10b8f851521938a117a4d84d29e1b','r2':'3cdebc236e9ee5081a4bca4e323b11f43aa0d46d','local':None}
hashes={}
for label,ref in refs.items():
 src=subprocess.check_output(['git','show',ref+':index.html'],cwd=repo,text=True) if ref else (repo/'index.html').read_text()
 dest=root/'stage'/label;dest.mkdir(parents=True,exist_ok=True)
 for asset in ['fonts','branding']:shutil.copytree(repo/asset,dest/asset,dirs_exist_ok=True)
 assert src.count(marker)==1
 out=src.replace('<head>','<head>\n'+h.build_prelude({'fresh':{'save':None}})+'<script>__qaUiMeasurementPause(true);localStorage.setItem("lumenfall_startup_intro_last",String(Date.now()))</script>',1).replace(marker,'\n'+bridge+marker,1)
 (dest/'index.html').write_text(out);hashes[label]={'source':hashlib.sha256(src.encode()).hexdigest(),'instrumented':hashlib.sha256(out.encode()).hexdigest()}
(root/'stage/hashes.json').write_text(json.dumps(hashes,indent=2))
print(json.dumps(hashes))
