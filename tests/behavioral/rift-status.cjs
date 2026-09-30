/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.py registers this in the default suite.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-forge-ui-'));
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
// Pause only simulation during the immediate before/input/after measurement.
// CSS/frames keep running. Then allow ordinary production intervals, measure
// again without any intervening focus/scroll correction, and pause for capture.
async function advance(ms=350){await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(false)');await new Promise(r=>setTimeout(r,ms));await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(true)');}

async function key(key){const spec=key==='Space'?{key:' ',code:'Space',windowsVirtualKeyCode:32}:key==='Enter'?{key:'Enter',code:'Enter',windowsVirtualKeyCode:13}:key==='Escape'?{key:'Escape',code:'Escape',windowsVirtualKeyCode:27}:{key,code:key,windowsVirtualKeyCode:{ArrowRight:39,ArrowLeft:37,Home:36,End:35,Tab:9}[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
async function touch(selector){const r=await evaluate(`riftStatusMobile.control(${JSON.stringify(selector)})`);assert(r.visible&&r.hit,'touch target visible before action');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
async function shot(name){if(!process.env.LUMENFALL_QA_EVIDENCE_DIR)return;const r=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,name+'.png'),Buffer.from(r.data,'base64'));}
async function swipe(delta,width,height){
 const x=width/2,y=delta<0?height*.72:height*.35,dy=Math.sign(delta)*Math.min(240,Math.max(48,Math.abs(delta)));
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=6;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/6}]});await new Promise(r=>setTimeout(r,16));}
 await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,70));
}
async function run(){
 for(const [width,height,inset] of [[360,640,0],[360,640,24],[390,844,24]]){
  const motion=scenario.includes('reduced')?'reduce':'no-preference',name=`${width}x${height}-safe${inset}-${motion}`;
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Page.navigate',{url});
  for(let i=0;i<150&&!await evaluate('!!window.__forgeUiReady');i++)await new Promise(r=>setTimeout(r,20));
  await evaluate('document.fonts.ready');await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(true);window.__lumenfallQaBridge.resetFeedback()');await evaluate('window.__qaForgeStartup.promise');
  const samples=[];
  for(const kind of ['fresh','dense','boss']){
   await evaluate(`riftStatusMobile.setup(${inset},${JSON.stringify(kind)})`);await advance();
   samples.push(await evaluate('riftStatusMobile.measure()'));await shot(name+'-'+kind);
   await evaluate('document.querySelector("[data-tab=research]").focus({preventScroll:true})');await key('Space');assert(await evaluate('document.querySelector("#tab-research").classList.contains("active")'),'native Lab button opens Lab');
   const scroll=[];
   for(const view of ['spirits','forge','research']){
    await touch(`[data-tab="${view}"]`);
    // Real touch scroll: no scrollIntoView/focus assistance to reach last control.
    for(let i=0;i<35;i++){const loc=await evaluate(`riftStatusMobile.locate(${JSON.stringify(view)})`);if(loc.visible)break;await swipe(loc.delta,width,height);}
    scroll.push(await evaluate(`riftStatusMobile.last(${JSON.stringify(view)})`));
    const target=scroll[scroll.length-1];await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:target.x,y:target.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await advance();
    for(let i=0;i<35;i++){const loc=await evaluate(`riftStatusMobile.locate(${JSON.stringify(view)})`);if(loc.visible)break;await swipe(loc.delta,width,height);}
    await evaluate(`riftStatusMobile.last(${JSON.stringify(view)})`);
   }
   await touch('[data-tab="battle"]');await advance();await evaluate('riftStatusMobile.measure()');
   await evaluate('document.querySelector("[data-tab=forge]").focus({preventScroll:true})');await key('ArrowRight');assert(await evaluate('document.activeElement.dataset.tab')==='research','native keyboard focuses Lab');await key('Home');assert(await evaluate('document.activeElement.dataset.tab')==='battle','native Home returns Rift');
   await evaluate('document.querySelector("#rift-details-btn").focus({preventScroll:true})');await key('Space');assert(await evaluate('document.querySelector("#rift-details").open'),'Details opens');await key('Escape');assert(await evaluate('!document.querySelector("#rift-details").open&&document.activeElement.id==="rift-details-btn"'),'Details focus return');
   samples[samples.length-1].scroll=scroll;
  }
  records.push({profile:name,samples});await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
 return {status:'pass',scenario,records};
}

(async()=>{
 let result;
 try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
 try{result.teardown=await teardown();}catch(error){result.status='fail';result.teardown={message:error.message,events:shutdownEvents,pending:pending.size,stderr};process.stderr.write('Forge UI teardown failed: '+error.stack+'\n');}
 console.log(JSON.stringify(result));
 if(result.status!=='pass')process.exitCode=1;

})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
