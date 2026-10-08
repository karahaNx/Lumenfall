#!/usr/bin/env node
// Chromium 151 dump-dom fallback for existing run.py. The QA page and assertions
// remain unchanged. Collects the real DOM over CDP after a completed QA result.
const {spawn,spawnSync}=require('node:child_process'),fs=require('node:fs');
const args=process.argv.slice(2),chrome='/usr/bin/chromium';
if(!args.includes('--dump-dom')){const r=spawnSync(chrome,args,{stdio:'inherit'});process.exit(r.status??1);}
const url=args.findLast(x=>/^https?:|^file:/.test(x)),profile=args.find(x=>x.startsWith('--user-data-dir='));
const forwarded=args.filter(x=>!x.startsWith('--virtual-time-budget=')&&!x.startsWith('--timeout=')&&x!=='--dump-dom'&&x!==url);
const browser=spawn(chrome,[...forwarded,'--remote-debugging-pipe','about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let buffer='',session,seq=0,stderr='';const pending=new Map();
browser.stderr.on('data',b=>{stderr+=b;});
browser.stdio[4].on('data',b=>{buffer+=b;let i;while((i=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,i);buffer=buffer.slice(i+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},9000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function main(){
 const target=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
 const size=(args.find(x=>x.startsWith('--window-size='))||'--window-size=390,844').slice(14).split(',').map(Number);
 await send('Emulation.setDeviceMetricsOverride',{width:size[0],height:size[1],deviceScaleFactor:1,mobile:false});
 if(args.includes('--force-prefers-reduced-motion'))await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.enable');await send('Page.navigate',{url});
 let completed=false;
 for(let i=0;i<180;i++){
  try{completed=await evaluate('!!document.querySelector("#qa-result[data-status=pass],#qa-result[data-status=fail]")');}catch{}
  if(completed)break;
  await new Promise(r=>setTimeout(r,35));
 }
 // Incomplete pages are returned as-is. run.py must reject missing QA results.
 process.stdout.write(await evaluate('document.documentElement.outerHTML'));
 if(!completed)process.stderr.write('CDP fallback: page has no completed QA result\n');
}
main().catch(e=>{process.stderr.write(e.stack+'\n'+stderr);process.exitCode=1;}).finally(async()=>{try{await send('Browser.close',{},null);}catch{}browser.kill();for(const p of pending.values())clearTimeout(p.timer);});
