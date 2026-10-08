/* Native CDP touch/keyboard at mobile widths; production page remains unmodified. */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-lab-ui-regression-'));
const browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',stderr='',session,closed=false;const pending=new Map(),records=[];
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
const completion=new Promise(resolve=>{browser.once('error',e=>{rejectPending(e.message);resolve({error:e.message});});browser.once('close',(code,signal)=>{closed=true;rejectPending('browser closed');resolve({code,signal});});});
browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',e=>rejectPending(e.message));
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(v,m){if(!v)throw Error(m);}
async function key(key){const spec=key==='Space'?{key:' ',code:'Space',windowsVirtualKeyCode:32}:{key,code:key,windowsVirtualKeyCode:{ArrowDown:40,ArrowUp:38,Tab:9,Enter:13,Escape:27}[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
// Runs existing browser assertions through CDP when dump-dom/virtual-time hangs.
// The production source, fixtures and existing assertions are unchanged by this driver.
async function run(){
 const scenarios=['lab-motes-contracts','lab-motes-chronology','lab-motes-conservation','lab-motes-save-reload','lab-motes-backup-restore','lab-motes-recovery','lab-motes-reset','inquiry-contracts','inquiry-chronology','inquiry-ui','inquiry-ui-reduced-motion','inquiry-save-reload','inquiry-backup-restore','inquiry-recovery','research-duration','research-duration-reduced-motion','upgrade-effects-and-deeds','p2-02b-lab-hierarchy','nav-workshop-contract'];
 for(const name of scenarios){
  const context=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  if(name.includes('reduced-motion'))await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const target=new URL(url);target.searchParams.set('qaScenario',name);target.searchParams.set('qaFixture',name==='p2-02b-lab-hierarchy'?'accessibility-mixed-states':'fresh');
  await send('Page.navigate',{url:target.href});
  let result=null;const deadline=Date.now()+20000;
  while(Date.now()<deadline){
   try{result=await evaluate('(()=>{var el=document.getElementById("qa-result");return el&&el.dataset.status?{status:el.dataset.status,payload:JSON.parse(el.textContent),resultCount:document.querySelectorAll("#qa-result").length,contextErrors:window.__lumenfallQaContext.errors}:null;})()');}catch(error){if(!/context|Cannot find|navigat/i.test(error.message))throw error;}
   if(result)break;await new Promise(r=>setTimeout(r,40));
  }
  const valid=result&&result.resultCount===1&&result.status==='pass'&&result.payload.status==='pass'&&result.payload.scenario===name&&Array.isArray(result.payload.runtimeErrors)&&result.payload.runtimeErrors.length===0&&Array.isArray(result.contextErrors)&&result.contextErrors.length===0;
  records.push({scenario:name,...result,status:valid?'pass':'fail'});
  await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
 }
 return {status:records.every(r=>r.status==='pass')?'pass':'fail',scenario,records};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
 try{assert(pending.size===0,'all CDP operations settled');if(!closed)await send('Browser.close',{},null).catch(()=>{});let timer;const done=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout')),5000);})]).finally(()=>clearTimeout(timer));assert(closed&&done.code===0&&!done.error,'graceful browser termination');await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});result.teardown={browser:done,pending:pending.size,profileRemoved:!fs.existsSync(profile)};}catch(error){browser.kill('SIGKILL');result.status='fail';result.teardown={message:error.message,stderr};}
 process.stdout.write(JSON.stringify(result)+'\n');process.exitCode=result.status==='pass'?0:1;
})();
