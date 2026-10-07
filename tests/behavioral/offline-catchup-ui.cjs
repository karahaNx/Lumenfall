/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.cjs registers this in the default suite.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-auto-target-'));
const browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',stderr='',session,records=[];const pending=new Map(),listeners=[],shutdownEvents=[];
let browserClosed=false;
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
const browserCompletion=new Promise(resolve=>{
 browser.once('error',error=>{rejectPending(error.message);resolve({error:error.message});});
 browser.once('close',(code,signal)=>{browserClosed=true;shutdownEvents.push({event:'browser-close',code,signal,pending:pending.size});rejectPending('browser closed');resolve({code,signal});});
});
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',error=>rejectPending('CDP pipe '+error.message));
async function boundedCompletion(ms){let timer;try{return await Promise.race([browserCompletion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout '+ms+'ms')),ms);})]);}finally{clearTimeout(timer);}}
async function teardown(){
 const diagnostic={pendingBeforeClose:pending.size,events:shutdownEvents};
 assert(pending.size===0,'all prior protocol requests settled before browser close');
 // Browser.close may close the pipe before replying; the process close event is
 // authoritative. Await it before deleting a profile Chrome may still write.
 if(!browserClosed){await send('Browser.close',{},null).catch(error=>{diagnostic.closeRequest=error.message;});}
 try{diagnostic.browser=await boundedCompletion(5000);}catch(error){
  diagnostic.forced=error.message;browser.kill('SIGTERM');
  try{diagnostic.browser=await boundedCompletion(2000);}catch(_){browser.kill('SIGKILL');diagnostic.browser=await boundedCompletion(2000);}
 }
 diagnostic.pendingAfterClose=pending.size;
 assert(browserClosed,'browser exited before profile removal');
 await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
 diagnostic.profileRemoved=!fs.existsSync(profile);shutdownEvents.push({event:'profile-removed',browserClosed});
 assert(!diagnostic.forced&&!diagnostic.browser.error&&diagnostic.browser.code===0,'graceful browser termination: '+JSON.stringify(diagnostic));
 return diagnostic;
}
browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else listeners.slice().forEach(f=>f(m));}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(v,m){if(!v)throw Error(m);}

const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(expression,label,timeout=60000){
 const start=Date.now();while(Date.now()-start<timeout){const errors=await evaluate('window.__lumenfallQaContext ? window.__lumenfallQaContext.errors : []');assert(errors.length===0,'runtime error during '+label+': '+JSON.stringify(errors));if(await evaluate(expression))return;await delay(20);}throw Error(label+' timed out');
}
async function stateSummary(){return evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.getState(),p=JSON.parse(b.rawSave());return {flags:b.getFlags(),kills:s.totalKills,ascends:s.ascendCount,lastSeen:s.lastSeen,offline:s.totalOfflineSeconds,primaryKills:p.totalKills,primaryLastSeen:p.lastSeen,recoveryMatches:b.rawSave()===b.rawRecovery(),heartbeat:window.offlineHeartbeat,errors:window.__lumenfallQaContext.errors.length};})()`);}
async function click(id){const r=await evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...r});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...r});}
async function run(){
 const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Page.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.offlineHeartbeat={frames:0,maxGap:0,last:0};function beat(t){const h=window.offlineHeartbeat;if(h.last)h.maxGap=Math.max(h.maxGap,t-h.last);h.last=t;h.frames++;requestAnimationFrame(beat);}requestAnimationFrame(beat);`});
 await send('Page.navigate',{url});
 await until('!!window.__offlineCatchupReady','cold startup ready');
 let before=await stateSummary();records.push({case:'initial cold observation',before});assert(before.errors===0,'cold startup has no runtime errors');assert(before.flags.offlineBusy,'cold8h uses cooperative batches');
 assert(before.kills===before.primaryKills,'working progress detached at cold-start yield');
 await click('enemy-stage');
 assert(await evaluate('window.__lumenfallQaBridge.save()===false'),'save cannot consume incomplete cold window');
 await until('!window.__lumenfallQaBridge.getFlags().offlineBusy','cold8h catch-up');
 const cold=await stateSummary();assert(!cold.flags.offlinePending&&!cold.flags.resumeFlowBusy,'cold flags cleared');
 assert(cold.kills-before.kills===302400&&cold.ascends-before.ascends===14400,'cold full8h rewards');
 assert(cold.primaryKills===cold.kills&&cold.recoveryMatches,'cold canonical primary/recovery');
 assert(cold.heartbeat.frames>5,'animation/event loop progresses during long catch-up');
 assert(cold.errors===0,'cold no runtime errors');
 assert(await evaluate('document.getElementById("welcome-text").textContent.includes("14400 times")'),'normal return message shown');
 await click('welcome-claim');assert(await evaluate('document.getElementById("welcome-overlay").style.display==="none"'),'real click completes return flow');
 records.push({case:'cold8h',before,cold});
 // Actual production visibility handler, with controlled visibility and clock.
 await evaluate('(()=>{const b=window.__lumenfallQaBridge;b.dispatchVisibility(true);b.advanceTime(28800000);b.dispatchVisibility(false);})()');
 assert((await stateSummary()).flags.offlineBusy,'resume8h yields');
 await evaluate('window.__lumenfallQaBridge.dispatchVisibility(false)');
 await until('!window.__lumenfallQaBridge.getFlags().offlineBusy','resume8h');
 const resumed=await stateSummary();assert(resumed.kills-cold.kills===302400&&resumed.ascends-cold.ascends===14400,'resume full8h exactly once');
 await evaluate('window.__lumenfallQaBridge.dispatchVisibility(false)');const repeated=await stateSummary();assert(repeated.kills===resumed.kills&&repeated.lastSeen===resumed.lastSeen,'repeated visible notification has no additional award');
 records.push({case:'resume/repeated',resumed});
 // Abort between batches by backgrounding. Disk/runtime retain prior endpoint.
 await evaluate('(()=>{const b=window.__lumenfallQaBridge;b.dispatchVisibility(true);b.advanceTime(28800000);b.dispatchVisibility(false);})()');
 assert((await stateSummary()).flags.offlineBusy,'cancellation begins real catch-up');
 await evaluate('window.__lumenfallQaBridge.dispatchVisibility(true)');
 const interrupted=await stateSummary();assert(!interrupted.flags.offlineBusy&&!interrupted.flags.resumeFlowBusy&&interrupted.flags.offlinePending,'cancel clears busy flags but retains unpaid time');
 assert(interrupted.kills===resumed.kills&&interrupted.primaryLastSeen===resumed.lastSeen,'interruption preserves whole authoritative endpoint');
 // Real page reload after interruption, no unload write may erase the debt.
 await evaluate('localStorage.setItem(window.__lumenfallQaContext.phaseKey,"1")');
 await send('Page.reload');await until('!!window.__lumenfallQaBridge && window.__lumenfallQaBridge.getFlags().offlineBusy','restart catch-up starts');await until('!window.__lumenfallQaBridge.getFlags().offlineBusy','restart catch-up');
 const restarted=await stateSummary();assert(restarted.kills-resumed.kills===302400&&restarted.primaryKills===restarted.kills,'restart awards interrupted window once');
 records.push({case:'interruption/restart',interrupted,restarted});
 // Runtime failure clears all busy flags; the next real return retries fully.
 await evaluate('(()=>{const b=window.__lumenfallQaBridge;b.dispatchVisibility(true);b.advanceTime(28800000);b.offlineTest.failNext();b.dispatchVisibility(false);})()');
 const failed=await stateSummary();assert(!failed.flags.offlineBusy&&!failed.flags.resumeFlowBusy&&failed.flags.offlinePending,'failed resume clears busy flags');assert(failed.kills===restarted.kills&&failed.primaryLastSeen===restarted.lastSeen,'failed resume preserves endpoint');
 await evaluate('(()=>{const b=window.__lumenfallQaBridge;b.dispatchVisibility(true);b.dispatchVisibility(false);})()');
 await until('!window.__lumenfallQaBridge.getFlags().offlineBusy','failure retry');const recovered=await stateSummary();assert(recovered.kills-restarted.kills===302400&&!recovered.flags.offlinePending,'failure retry finishes entire window once');assert(recovered.errors===0,'failure handled without uncaught errors');
 records.push({case:'failure/retry',failed,recovered});
 // A cancelled/failed first return must still present its daily-rollover reward
 // after retry, even though ensureDaily has already updated the in-memory day.
 if(await evaluate('document.getElementById("daily-overlay").style.display!=="none"'))await click('daily-claim');
 await evaluate('(()=>{const b=window.__lumenfallQaBridge,d=new Date(b.clockNow());b.dispatchVisibility(true);b.setLocalClock(d.getFullYear(),d.getMonth(),d.getDate()+1,12,0,0);b.offlineTest.failNext();b.dispatchVisibility(false);})()');
 assert((await stateSummary()).flags.offlinePending,'daily rollover failure retains window');
 const rolledComets=await evaluate('window.__lumenfallQaBridge.getState().comets');
 await evaluate('(()=>{const b=window.__lumenfallQaBridge;b.dispatchVisibility(true);b.dispatchVisibility(false);})()');
 await until('!window.__lumenfallQaBridge.getFlags().offlineBusy','daily rollover retry');
 await until('document.getElementById("startup-intro").style.display==="none"','daily retry intro finishes');
 await until('document.getElementById("welcome-overlay").style.display!=="none"','daily retry return panel');
 await click('welcome-claim');
 assert(await evaluate('document.getElementById("daily-overlay").style.display!=="none"'),'daily reward presented after failure retry');
 assert(await evaluate('window.__lumenfallQaBridge.getState().comets')===rolledComets,'daily reward not awarded twice');
 await click('daily-claim');
 await evaluate('(()=>{const b=window.__lumenfallQaBridge;b.dispatchVisibility(true);b.advanceTime(1000);b.dispatchVisibility(false);})()');
 assert(await evaluate('document.getElementById("daily-overlay").style.display==="none"'),'daily presentation consumed once');
 records.push({case:'daily rollover/failure/retry',comets:rolledComets});
 await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 return {status:'pass',scenario,records};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
try{result.teardown=await teardown();}catch(error){result.status='fail';result.teardown={message:error.message};}
console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
