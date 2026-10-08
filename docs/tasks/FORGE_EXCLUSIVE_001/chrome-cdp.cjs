#!/usr/bin/env node
// Local transport adapter for Chromium 151 dump-dom timeout diagnostics.
// Uses existing harness HTML/assertions/result parser unchanged. Not a CI change.
const {spawn,spawnSync}=require('node:child_process');
const args=process.argv.slice(2),real='/usr/bin/chromium';
if(!args.includes('--dump-dom')){
  const r=spawnSync(real,args,{stdio:'inherit'});process.exit(r.status??1);
}
const url=args.find(a=>a.startsWith('http://127.0.0.1:'));
if(!url)throw Error('Adapter accepts only the existing harness loopback page');
const filtered=args.filter(a=>a!==url&&a!=='--dump-dom'&&!a.startsWith('--virtual-time-budget='));
const browser=spawn(real,[...filtered,'--remote-debugging-pipe','about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',session,closed=false;
const pending=new Map();
browser.stderr.pipe(process.stderr);
const completion=new Promise(resolve=>browser.once('close',(code,signal)=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});}));
browser.once('error',error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
for(const s of [browser.stdio[3],browser.stdio[4]])s.on('error',e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},5000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
function bounded(p,ms){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Browser close timeout')),ms);p.then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);});});}
(async()=>{
  let dom;
  try{
    const target=await send('Target.createTarget',{url:'about:blank'},null);
    session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url});
    const deadline=Date.now()+18000;
    while(Date.now()<deadline){
      try{
        const ready=await evaluate('!!document.querySelector("#qa-result[data-status=pass],#qa-result[data-status=fail]")');
        if(ready){dom=await evaluate('document.documentElement.outerHTML');break;}
      }catch(e){
        // Original persistence scenarios intentionally reload their own page.
        // Only retry the transient protocol failure caused by that navigation.
        if(!/Inspected target navigated or closed|Cannot find context|Execution context was destroyed/.test(e.message))throw e;
      }
      await new Promise(r=>setTimeout(r,25));
    }
    if(!dom)throw Error('No completed original harness QA result');
  }catch(e){process.stderr.write('CDP diagnostic adapter: '+e.stack+'\n');process.exitCode=1;}
  finally{
    if(!closed)await send('Browser.close',{},null).catch(()=>{});
    try{const r=await bounded(completion,2000);if(r.code!==0)throw Error('Browser exit '+JSON.stringify(r));}
    catch(e){browser.kill('SIGKILL');process.stderr.write(e.message+'\n');process.exitCode=1;}
  }
  if(dom&&process.exitCode!==1)process.stdout.write(dom+'\n');
})().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;browser.kill('SIGKILL');});
