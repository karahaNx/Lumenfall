'use strict';
// Optional CDP pipe transport for the same completed QA DOM assertions. Chrome
// --dump-dom stalls in this executor; this does not change assertion bodies.
const {spawn}=require('node:child_process'), fs=require('node:fs'), assert=require('node:assert/strict');
const [chrome,url,profile,motion,mode]=process.argv.slice(2);
const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',session,closed=false,stderr='';const pending=new Map();
const completion=new Promise(resolve=>{browser.once('error',e=>resolve({error:e.message}));browser.once('close',(code,signal)=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});});});
browser.stderr.on('data',b=>stderr=(stderr+b).slice(-2000));
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',()=>{});
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP deadline '+method));},8000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
async function run(){
 const tab=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion==='reduce'?'reduce':'no-preference'}]});
 await send('Page.enable');await send('Page.navigate',{url});
 const deadline=Date.now()+20000;
 while(Date.now()<deadline){
  try{
   const ready=mode==='smoke'
    ? "!!document.querySelector('#ci-runtime-error-guard')&&!!document.querySelector('[data-zone-index=\"0\"]')&&!!document.querySelector('#enemy-name').textContent.trim()"
    : "!!document.querySelector('#qa-result[data-status]')";
   if(await evaluate(ready)){
    if(mode==='smoke')await new Promise(r=>setTimeout(r,1800));
    process.stdout.write(await evaluate('document.documentElement.outerHTML'));return;
   }
  }
  catch(e){if(!/Execution context was destroyed|Cannot find context|Inspected target navigated/.test(e.message))throw e;}
  await new Promise(r=>setTimeout(r,20));
 }
 throw Error('No completed '+(mode==='smoke'?'smoke':'QA')+' DOM within 20 seconds');
}
(async()=>{let failure;try{await run();}catch(e){failure=e;}
 try{assert.equal(pending.size,0);if(!closed)await send('Browser.close',{},null).catch(()=>{});let timer;const done=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close deadline')),3000);})]).finally(()=>clearTimeout(timer));assert.equal(done.code,0);assert(!done.error);}catch(e){failure=failure||e;browser.kill('SIGKILL');}
 if(failure){process.stderr.write(failure.stack+'\n'+stderr);process.exitCode=1;}
})();
