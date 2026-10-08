'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=function launch(chrome){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-all27-cdp-'));
 const child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 let id=0,buffer='',stderr='',session,closed=false;const pending=new Map();
 function reject(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
 const completion=new Promise(resolve=>{child.once('error',e=>{reject(e.message);resolve({error:e.message});});child.once('close',(code,signal)=>{closed=true;reject('browser closed');resolve({code,signal});});});
 child.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
 for(const stream of [child.stdio[3],child.stdio[4]])stream.on('error',e=>reject(e.message));
 child.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(n,{resolve,reject,timer,method});child.stdio[3].write(JSON.stringify({id:n,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
 async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
 async function context(width,height,motion='reduce'){
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');return ctx.browserContextId;
 }
 async function key(key){const codes={Enter:13,Escape:27,ArrowDown:40,ArrowUp:38,Home:36,End:35,Tab:9,Space:32};const spec={key:key==='Space'?' ':key,code:key,windowsVirtualKeyCode:codes[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
 async function touch(selector){const r=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})()`);assert(r.hit,'touch target hit');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 async function close(){
  let timer;try{assert.equal(pending.size,0);if(!closed)await send('Browser.close',{},null).catch(()=>{});const done=await Promise.race([completion,new Promise((_,rej)=>{timer=setTimeout(()=>rej(Error('browser close timeout')),5000);})]);assert(closed&&done.code===0&&!done.error,'graceful browser termination');await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});return {browser:done,pending:pending.size,profileRemoved:!fs.existsSync(profile)};}catch(e){child.kill('SIGKILL');throw e;}finally{clearTimeout(timer);}
 }
 return {send,evaluate,context,key,touch,close};
};
