#!/usr/bin/env node
// Diagnostic adapter for Chromium 151 dump-dom timeouts. Existing run.py and
// its assertions are unchanged; wait for their actual completion over CDP.
const {spawn,spawnSync}=require('node:child_process');
const args=process.argv.slice(2),chrome='/usr/bin/chromium';
if(args.includes('--version')){const p=spawnSync(chrome,args,{encoding:'utf8'});process.stdout.write(p.stdout);process.stderr.write(p.stderr);process.exit(p.status||0);}
if(!args.includes('--dump-dom'))throw Error('adapter only supports dump-dom');
const url=args.at(-1), flags=args.slice(0,-1).filter(x=>x!=='--dump-dom'&&!x.startsWith('--virtual-time-budget='));
const b=spawn(chrome,[...flags,'--remote-debugging-pipe','about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buf='',sid,dom,failure;const pending=new Map();
const done=new Promise(resolve=>{b.once('error',e=>{failure=e.message;resolve({error:e.message});});b.once('close',(code,signal)=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});});});
b.stderr.on('data',x=>process.stderr.write(x));
b.stdio[4].on('data',x=>{buf+=x;let n;while((n=buf.indexOf('\0'))>=0){const raw=buf.slice(0,n);buf=buf.slice(n+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sessionId=sid){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},7000);pending.set(id,{resolve,reject,timer});b.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
(async()=>{
 try{
  const target=await send('Target.createTarget',{url:'about:blank'},null);sid=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
  await send('Page.enable');if(flags.includes('--force-prefers-reduced-motion'))await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url});
  let complete=false;
  for(let i=0;i<200;i++){if(await evaluate('!!document.querySelector("#qa-result[data-status]")')){complete=true;break;}await new Promise(r=>setTimeout(r,50));}
  if(!complete)throw Error('QA result did not complete');dom=await evaluate('document.documentElement.outerHTML');
 }catch(e){failure=e.stack;}
 finally{await send('Browser.close',{},null).catch(()=>{});const info=await done;if(info.code!==0)failure||='browser exit '+JSON.stringify(info);}
 if(failure){process.stderr.write(failure+'\n');process.exitCode=1;}else process.stdout.write(dom);
})().catch(e=>{process.stderr.write(e.stack+'\n');b.kill();process.exitCode=1;});
