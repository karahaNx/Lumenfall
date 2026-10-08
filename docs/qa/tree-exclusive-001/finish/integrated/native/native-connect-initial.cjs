'use strict';
const Adb=require('./direct-adb.cjs'),assert=require('node:assert/strict');
async function connect(){
 const adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','own isolated emulator');
 const pid=(await adb.shell('pidof com.lumenfall.app')).trim().split(' ')[0];assert(pid,'app running');
 const server=await adb.forward(19231,'localabstract:webview_devtools_remote_'+pid);
 const targets=await(await fetch('http://127.0.0.1:19231/json/list')).json(),target=targets.find(x=>x.type==='page');assert(target,'actual app WebView page');
 const u=new URL(target.webSocketDebuggerUrl);u.hostname='127.0.0.1';u.port='19231';const ws=new WebSocket(u.toString()),pending=new Map();let seq=0;
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const r=JSON.parse(e.data),p=pending.get(r.id);if(p){pending.delete(r.id);clearTimeout(p.timer);r.error?p.reject(Error(JSON.stringify(r.error))):p.resolve(r.result);}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 return {adb,send,evaluate,target,close(){ws.close();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('closed'));}server.sockets.forEach(x=>x.destroy());server.close();adb.close();}};
}
module.exports={connect};
if(require.main===module)(async()=>{const c=await connect();try{console.log(await c.evaluate('({ua:navigator.userAgent,url:location.href,ready:document.readyState,primary:!!localStorage.getItem("lumenfall_save_v2"),width:innerWidth,height:innerHeight,overlays:Array.from(document.querySelectorAll(".overlay")).filter(function(x){return getComputedStyle(x).display!=="none";}).map(function(x){return x.id;})})'));}finally{c.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
