const fs=require('fs'),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const [,,binary,url,out]=process.argv;
(async()=>{
 const browser=await chromium.launch({executablePath:binary,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript(()=>{window.__coreIntervalsPaused=true;const set=window.setInterval.bind(window);window.setInterval=(fn,delay,...args)=>set(()=>{if(!window.__coreIntervalsPaused)fn(...args);},delay);});
 const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
 let result={records:[],checks:0,passed:0,total:0};
 const ready=async()=>{await page.waitForFunction(()=>window.__core?.ready());await page.evaluate(()=>{window.__core.guard(false);window.__lumenfallQaBridge.resetFeedback();});};
 const collect=async(name,fn)=>{try{const r=await fn();result.records.push({name,status:'PASS',...r});}catch(e){result.records.push({name,status:'FAIL',error:String(e),stack:e.stack});}};
 try{
  await page.goto(url);await ready();result=await page.evaluate(()=>window.__coreChecks());
  await collect('real-save-reload-backup-recovery-ascend-and-reset',async()=>{
   let n=0;const ok=(v,m)=>{n++;if(!v)throw Error(m);},same=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m);
   const fixture=await page.evaluate(()=>{const c=window.__core,s=c.seed();s.studyUseMotes.guardmastery=true;s.studySpeedTargets.guardmastery=8;s.studyQueue.riftattune=true;s.studyUseMotes.riftattune=false;s.studySpeedTargets.riftattune=2;s.longStudyLevels.measuredinquiry=17;s.activeStudies=[{id:'guardmastery',remainingSec:673,totalDurationSec:1200,speedMult:4},{id:'measuredinquiry',remainingSec:219,totalDurationSec:600,speedMult:8}];s.motes=0;c.set(s);c.guard(false);if(!c.save())throw Error('real save failed');localStorage.setItem(window.__lumenfallQaContext.phaseKey,'1');return c.get();});
   const fields=['schemaVersion','motes','activeStudies','studyUseMotes','studySpeedTargets','studyQueue','longStudyLevels'];
   const verify=async(stage)=>{const d=await page.evaluate(()=>({state:__core.get(),disk:__core.raw()}));for(const k of fields)same(d.state[k],fixture[k],stage+' runtime '+k);for(const key of ['primary','recovery'])for(const k of fields)same(JSON.parse(d.disk[key])[k],fixture[k],stage+' '+key+' '+k);return d;};
   await page.reload();await ready();const reload=await verify('real reload');
   const backup=await page.evaluate(()=>window.__core.backup());
   await page.evaluate(()=>{const c=window.__core;c.set(c.seed());c.guard(false);c.save();});
   await Promise.all([page.waitForEvent('domcontentloaded'),page.evaluate(code=>window.__lumenfallQaBridge.restoreBackup(code),backup)]);await ready();const restored=await verify('valid backup restore');
   await page.evaluate(()=>{window.__core.guard(true);localStorage.setItem('lumenfall_save_v2','{bad-json');});await page.reload();await ready();const recovered=await verify('canonical recovery');
   // Unsupported primary must survive; valid recovery may load but saves remain blocked.
   const future=JSON.stringify({...fixture,schemaVersion:999});await page.evaluate(raw=>{window.__core.guard(true);localStorage.setItem('lumenfall_save_v2',raw);},future);await page.reload();await ready();
   const protectedFuture=await page.evaluate(()=>({state:__core.get(),raw:__core.raw(),status:__lumenfallQaBridge.persistenceStatus()}));
   same(protectedFuture.raw.primary,future,'future primary preserved');ok(protectedFuture.status.blocked,'future schema blocks save');same(protectedFuture.state.studyUseMotes,fixture.studyUseMotes,'valid recovery intent survives future primary');same(protectedFuture.state.activeStudies,fixture.activeStudies,'future guard keeps paid snapshots');
   await Promise.all([page.waitForEvent('domcontentloaded'),page.evaluate(code=>window.__lumenfallQaBridge.restoreBackup(code),backup)]);await ready();
   const ascent=await page.evaluate(()=>{const c=window.__core,s=c.get();s.depth=s.enemyDepth=32;s.enemyHp=s.enemyMaxHp=c.hp(32);c.set(s);c.guard(false);const before=c.get();window.__lumenfallQaBridge.ascendManual();return {before,after:c.get(),disk:c.raw()};});
   ok(ascent.after.ascendCount===ascent.before.ascendCount+1,'real manual Ascend happened');for(const k of ['studyUseMotes','studySpeedTargets','studyQueue','activeStudies','longStudyLevels'])same(ascent.after[k],fixture[k],'Ascend preserves '+k);same(JSON.parse(ascent.disk.primary).activeStudies,fixture.activeStudies,'Ascend paid snapshots on disk');
   await Promise.all([page.waitForEvent('domcontentloaded'),page.evaluate(()=>{window.__core.guard(false);window.__lumenfallQaBridge.reset();})]);await ready();
   const reset=await page.evaluate(()=>({state:__core.get(),raw:__core.raw()}));ok(reset.state.schemaVersion===1&&reset.state.motes===0&&!reset.state.activeStudies.length,'real Reset clears work and Motes');ok(Object.values(reset.state.studyUseMotes).every(x=>x===false)&&Object.values(reset.state.studySpeedTargets).every(x=>x===1.5),'real Reset OFF/default targets');same(JSON.parse(reset.raw.primary).studyUseMotes,reset.state.studyUseMotes,'Reset canonical disk matches');
   return {checks:n,detail:{fields,fixture,reload,restored,recovered,protectedFuture,ascent,reset,backupPrefix:backup.slice(0,11)}};
  });
  result.pageErrors=pageErrors;result.runtimeErrors=await page.evaluate(()=>window.__lumenfallQaContext.errors);
  result.records.push({name:'runtime-errors',status:pageErrors.length===0&&result.runtimeErrors.length===0?'PASS':'FAIL',checks:1,detail:{pageErrors,runtimeErrors:result.runtimeErrors}});
  result.total=result.records.length;result.passed=result.records.filter(x=>x.status==='PASS').length;result.checks=result.records.reduce((a,x)=>a+(x.checks||0),0);result.browser=await browser.version();result.node=process.version;
 }catch(e){result.records.push({name:'driver',status:'FAIL',error:String(e),stack:e.stack});result.total=result.records.length;result.passed=result.records.filter(x=>x.status==='PASS').length;result.pageErrors=pageErrors;}
 finally{await browser.close();fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');}
 console.log(JSON.stringify({passed:result.passed,total:result.total,checks:result.checks,failures:result.records.filter(x=>x.status!=='PASS').map(x=>({name:x.name,error:x.error}))}));
 if(result.passed!==result.total)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
