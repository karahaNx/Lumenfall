#!/usr/bin/env node
/* Local environment adapter for the unchanged behavioral harness. Chromium 151
 * hangs in --dump-dom here, including on a data: diagnostic. Use the repository's
 * pipe protocol, await the same completed qa-result, and emit the real DOM.
 * No assertions, fixture code, result parser or failure tolerances are replaced.
 * Ordinary native-driver and --version calls pass through to actual Chromium. */
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2),chrome=process.env.LUMENFALL_F21_BROWSER||'/usr/bin/chromium';
if(!args.includes('--dump-dom')){
 const child=spawn(chrome,args,{stdio:args.includes('--remote-debugging-pipe')?['inherit','inherit','inherit',3,4]:'inherit'});
 child.on('error',e=>{console.error(e.message);process.exitCode=1;});
 child.on('close',(code,signal)=>{process.exitCode=code??1;});
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
}else{
 const url=args.at(-1),flags=args.slice(0,-1).filter(a=>a!=='--dump-dom'&&!a.startsWith('--virtual-time-budget='));
 const browser=spawn(chrome,[...flags,'--remote-debugging-pipe','about:blank'],{stdio:['ignore','ignore','inherit','pipe','pipe']});
 let id=0,buffer='',session,closed=false;const pending=new Map();
 const completion=new Promise(resolve=>{browser.once('error',e=>resolve({error:e.message}));browser.once('close',(code,signal)=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});});});
 for(const pipe of [browser.stdio[3],browser.stdio[4]])pipe.on('error',e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();});
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const seq=++id,timer=setTimeout(()=>{pending.delete(seq);reject(Error('CDP timeout '+method));},5000);pending.set(seq,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id:seq,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
 async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>browser.kill(signal));
 (async()=>{
  let failure,dom;
  try{
   const tab=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
   await send('Page.enable');const size=args.find(a=>a.startsWith('--window-size='))?.split('=')[1].split(',').map(Number)||[390,844];
   await send('Emulation.setDeviceMetricsOverride',{width:size[0],height:size[1],deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url});
   const isQa=new URL(url).searchParams.has('qaScenario'),deadline=Date.now()+18000;let ready=!isQa;
   if(!isQa)await new Promise(r=>setTimeout(r,Number(args.find(a=>a.startsWith('--virtual-time-budget='))?.split('=')[1])||1800));
   while(isQa&&Date.now()<deadline){
    try{ready=await evaluate('!!document.querySelector("pre#qa-result[data-status]")');}catch(e){if(!/context|navigat/i.test(e.message))throw e;}
    if(ready)break;await new Promise(r=>setTimeout(r,20));
   }
   if(!ready)throw Error('same QA result did not complete within bounded driver time');
   dom=await evaluate('document.documentElement.outerHTML');
   if(isQa&&process.env.LUMENFALL_F21_LEGACY_RAW){
    const raw=await evaluate('(()=>{var q=document.querySelector("#qa-result");return {tag:q.tagName,attributes:Array.from(q.attributes).map(a=>[a.name,a.value]),text:q.textContent,viewport:[innerWidth,innerHeight]};})()');
    const dir=process.env.LUMENFALL_F21_LEGACY_RAW;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'result-'+process.pid+'.json'),JSON.stringify({url,raw},null,2)+'\n');
   }
  }catch(e){failure=e.stack;}
  if(!closed)await send('Browser.close',{},null).catch(()=>{});
  let timer;const result=await Promise.race([completion,new Promise(resolve=>{timer=setTimeout(()=>resolve(null),2000);})]);clearTimeout(timer);
  if(!result){browser.kill('SIGKILL');await completion;failure=failure||'browser termination timeout';}
  if(result?.code!==0)failure=failure||'browser failed '+JSON.stringify(result);
  if(failure){console.error(failure);process.exitCode=1;}else process.stdout.write(dom+'\n');
 })();
}
