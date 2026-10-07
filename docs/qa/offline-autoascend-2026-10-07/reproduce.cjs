const fs=require('fs'),vm=require('vm'),{performance}=require('perf_hooks');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const backup=JSON.parse(fs.readFileSync(__dirname+'/device_backup.json','utf8'));
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const bridge=`globalThis.audit={setState:s=>state=acceptPersistedState(s,'device-audit'),getState:()=>state,simulate:(s,kind,start)=>advanceAuthoritativeTime(s,{kind,visual:false,clockStartMs:start,offlineWindowStartMs:start}),metrics:()=>({dps:simulationPassiveDps(state.lastSeen),offlineRate:offlineRate(),capHours:offlineCapHours(),clearedTarget:autoAscendClearedTarget(),prismBreakdown:ascendPrismBreakdown(autoAscendTarget()),empowerCandidates:autoEmpowerCandidateIds()}),offline:()=>applyOfflineProgress()};`;
const instrumented=script.replace("if(document.readyState==='loading'){",bridge+"\nif(document.readyState==='loading'){").replace('summary.iterations++;','summary.iterations++;globalThis.auditProgress={elapsedSec:currentElapsedSec(),iterations:summary.iterations};');
const cases=JSON.parse(process.argv[2]||'[{"label":"raw","seconds":60,"kind":"offline"},{"label":"raw","seconds":300,"kind":"offline"},{"label":"raw","seconds":3600,"kind":"offline"},{"label":"disabled","seconds":3600,"kind":"offline"}]');
let records=[];
for(const c of cases){
 const ctx=vm.createContext({document:{readyState:'loading',addEventListener(){}},window:{addEventListener(){}},console});
 vm.runInContext(instrumented,ctx,{timeout:2000});
 const seed=JSON.parse(JSON.stringify(backup));
 if(c.label==='disabled')seed.autoAscendEnabled=false;
 if(c.label==='ember-on')seed.empowerQueue.ember=true;
 if(c.label==='all-on')Object.keys(seed.empowerQueue).forEach(k=>seed.empowerQueue[k]=true);
 if(c.target!==undefined)seed.autoAscendTargetDepth=c.target;
 ctx.seed=seed;ctx.testCase=c;
 vm.runInContext('audit.setState(seed)',ctx);
 const before=JSON.parse(JSON.stringify(ctx.audit.getState()));
 let normalizedDiff={};for(const k of Object.keys(before))if(JSON.stringify(before[k])!==JSON.stringify(seed[k]))normalizedDiff[k]={input:seed[k],output:before[k]};
 let record={case:c,normalizedDiff,metrics:ctx.audit.metrics()};
 const start=performance.now();
 try{const expression=c.entry==='offline-progress'?'Date.now=()=>seed.lastSeen+testCase.seconds*1000;audit.offline()':'audit.simulate(testCase.seconds,testCase.kind,seed.lastSeen)';ctx.result=vm.runInContext(expression,ctx,{timeout:30000});record.result=JSON.parse(JSON.stringify(ctx.result));}catch(e){record.error=e.message;record.errorProgress=ctx.auditProgress;}
 record.wallMs=performance.now()-start;
 const after=JSON.parse(JSON.stringify(ctx.audit.getState()));
 record.after={depth:after.depth,riftMode:after.riftMode,lumen:after.lumen,prisms:after.prisms,ascendCount:after.ascendCount,ascendsDelta:after.ascendCount-before.ascendCount,killsDelta:after.totalKills-before.totalKills,spirits:after.spirits,activeParty:after.activeParty,formationRebuild:after.formationRebuild,autoTapAccum:after._autoTapAccum,autoEmpowerAccum:after._autoEmpowerAccum};
 records.push(record);fs.writeFileSync(__dirname+'/results.json',JSON.stringify(records,null,2)+'\n');
 const compact={...record};if(compact.result){compact.result={...compact.result,ascendGains:compact.result.ascendGains?.slice(0,4)};}console.log(JSON.stringify(compact));
}
