#!/usr/bin/env node
/* Local evidence adapter for Chromium 151's stalled --dump-dom invocation.
 * Unchanged run.py stages/instruments the app, executes scenarios and validates
 * raw DOM. This adapter only drives the actual browser through its CDP pipe.
 * No PASS synthesis, result rewriting, browser flag spoofing or source mutation.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');
const args=process.argv.slice(2),chrome='/usr/bin/chromium';
if(args.includes('--version')){const r=spawnSync(chrome,['--version'],{encoding:'utf8'});process.stdout.write(r.stdout);process.stderr.write(r.stderr);process.exit(r.status);}
if(!args.includes('--dump-dom')){process.stderr.write('CDP adapter only supports --version and --dump-dom\n');process.exit(2);}
const url=args.find(x=>/^https?:/.test(x));
if(!url){process.stderr.write('missing HTTP URL\n');process.exit(2);}
const existing=args.find(x=>x.startsWith('--user-data-dir=')),profile=existing?existing.split('=').slice(1).join('='):fs.mkdtempSync(path.join(os.tmpdir(),'resonate-cdp-'));
const flags=args.filter(x=>!/^https?:/.test(x)&&x!=='--dump-dom'&&!x.startsWith('--virtual-time-budget=')&&!x.startsWith('--user-data-dir='));
const browser=spawn(chrome,[...flags,'--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,session,buffer='',closed=false;const pending=new Map();
const completion=new Promise(resolve=>{browser.once('error',e=>resolve({error:e.message}));browser.once('close',(code,signal)=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});});});
browser.stderr.on('data',b=>process.stderr.write(b));
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();});
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},8000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 let status=0;
 try{
  const tab=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  const size=args.find(x=>x.startsWith('--window-size='));if(size){const [width,height]=size.split('=')[1].split(',').map(Number);await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});}
  if(args.includes('--force-prefers-reduced-motion'))await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Page.enable');await send('Page.navigate',{url});
  let complete=false;
  for(let i=0;i<500;i++){
   try{complete=await evaluate("!!document.querySelector('#qa-result[data-status=pass],#qa-result[data-status=fail]')");}
   catch(e){if(!/Inspected target navigated|Execution context was destroyed|Cannot find context/.test(e.message))throw e;}
   if(complete)break;await pause(20);
  }
  const dom=await evaluate("document.documentElement.outerHTML");
  process.stdout.write(dom);
  if(process.env.RESONATE_CDP_RAW){
   fs.mkdirSync(process.env.RESONATE_CDP_RAW,{recursive:true});
   const scenario=new URL(url).searchParams.get('qaScenario')||'unknown';
   fs.writeFileSync(path.join(process.env.RESONATE_CDP_RAW,scenario+'.html'),dom);
  }
  if(!complete){process.stderr.write('\nCDP adapter: no completed QA result in 10s\n');status=1;}
 }catch(e){process.stderr.write(e.stack+'\n');status=1;}
 if(!closed)await send('Browser.close',{},null).catch(()=>{});
 let timer;
 try{const exit=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser teardown timeout')),3000);})]);if(exit.code!==0)status=1;}catch(e){browser.kill('SIGKILL');process.stderr.write(e.message+'\n');status=1;}finally{clearTimeout(timer);}
 if(!existing&&closed)fs.rmSync(profile,{recursive:true,force:true});
 process.exitCode=status;
})();
