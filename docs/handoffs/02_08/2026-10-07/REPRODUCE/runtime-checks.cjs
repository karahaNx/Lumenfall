const fs=require('fs'),vm=require('vm'),cp=require('child_process'),path=require('path'),root=__dirname,acorn=require('./input/RUNTIME/QA_04_05/REPRODUCE/acorn-8.15.0.js');
const dir=path.join(root,'evidence/runtime');fs.mkdirSync(dir,{recursive:true});let records=[];
const sources={R2:'baselines/R2_index.html',blocked:'baselines/blocked_index.html',new:'repo/index.html'},legacy=path.join(root,'runtime/node-v8.17.0-linux-x64/bin/node');
for(const [label,file] of Object.entries(sources)){
 const src=fs.readFileSync(path.join(root,file),'utf8'),scripts=Array.from(src.matchAll(/<script(?:\s[^>]*)?>(.*?)<\/script>/gs),m=>m[1]);
 for(let i=0;i<scripts.length;i++){
  const dst=path.join(dir,label+'-script-'+i+'.js');fs.writeFileSync(dst,scripts[i]);let syntax=[];
  for(const ecmaVersion of [2017,2018,2019,2020]){let error=null;try{acorn.parse(scripts[i],{ecmaVersion});}catch(e){error=e.message;}syntax.push({ecmaVersion,pass:error===null,error});}
  const old=cp.spawnSync(legacy,['--check',dst],{encoding:'utf8'}),modern=cp.spawnSync(process.execPath,['--check',dst],{encoding:'utf8'});
  records.push({label,script:i,grammar:syntax,oldV8:{command:[legacy,'--check',dst],exit:old.status,stdout:old.stdout,stderr:old.stderr},modern:{exit:modern.status,stdout:modern.stdout,stderr:modern.stderr}});
 }
 const start=src.indexOf('function simulationApplyFarmPassive('),end=src.indexOf('function simulationPassiveKillSeconds('),body=src.slice(start,end);
 let context={BigInt:undefined,SIM_EPS:1e-9,state:{depth:1,enemyHp:8.03,enemyMaxHp:11},kills:0,enemyHpFor:()=>11,simulationBatchFarmKills:k=>{context.kills=k;context.state.enemyHp=11;}};vm.createContext(context);let error=null;
 try{vm.runInContext('DataView.prototype.getBigUint64=undefined;DataView.prototype.getBigInt64=undefined;'+body,context);context.simulationApplyFarmPassive(.9,1100,{},{});}catch(e){error=String(e);}
 records.push({label,type:'missing-BigInt-helper',error,kills:context.kills,hp:context.state.enemyHp,stubbedBatchSideEffects:true});
}
const newRecords=records.filter(r=>r.label==='new'),blockedRecords=records.filter(r=>r.label==='blocked');
const pass=newRecords.every(r=>r.type?!r.error&&r.kills===90:r.oldV8.exit===0&&r.modern.exit===0&&r.grammar.every(g=>g.pass))&&blockedRecords.some(r=>!r.type&&r.script===0&&r.oldV8.exit===1&&r.grammar.filter(g=>g.ecmaVersion<2020).every(g=>!g.pass))&&blockedRecords.some(r=>r.type&&/TypeError/.test(r.error));
const apiProbe=cp.spawnSync(legacy,['-p','JSON.stringify({BigInt:typeof BigInt,DataView:typeof DataView,ArrayBuffer:typeof ArrayBuffer,setFloat64:typeof DataView.prototype.setFloat64,getUint32:typeof DataView.prototype.getUint32,isFinite:typeof Number.isFinite})'],{encoding:'utf8'});
const report={status:pass?'PASS':'FAIL',versions:{modern:process.versions,oldV8:JSON.parse(cp.execFileSync(legacy,['-p','JSON.stringify(process.versions)'],{encoding:'utf8'}))},apiProbe:{exit:apiProbe.status,stdout:apiProbe.stdout,stderr:apiProbe.stderr},records,limits:'All production inline scripts tested. Actual Node8/V8 6.2 parsing and helper execution; modern grammar/API absence controls. Not physical Android or exact Chrome60 emulation.'};fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,versions:{modern:process.version,old:report.versions.oldV8.node,v8:report.versions.oldV8.v8},scripts:records.filter(r=>!r.type).length,missingBigInt:records.filter(r=>r.type)}));process.exitCode=pass?0:1;
