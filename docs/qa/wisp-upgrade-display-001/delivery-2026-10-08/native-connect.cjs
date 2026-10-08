'use strict';
const {DirectAdb}=require('./direct-adb.cjs');const assert=require('node:assert/strict');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(){
 const adb=await new DirectAdb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).toString().trim(),'1','isolated emulator only');
 let pid;for(let i=0;i<40;i++){pid=(await adb.shell('pidof com.lumenfall.app')).toString().trim();if(pid)break;await wait(500);}assert(pid,'native app PID');
 const proxy=await adb.proxy('localabstract:webview_devtools_remote_'+pid.split(' ')[0],9231);
 let target;for(let i=0;i<120;i++){try{const r=await fetch('http://127.0.0.1:9231/json');const list=await r.json();target=list.find(x=>x.url==='https://localhost/');if(target)break;}catch{}await wait(500);}assert(target,'bundled WebView target');
 const ws=new WebSocket(target.webSocketDebuggerUrl.replace(/localhost:\d+/,'127.0.0.1:9231')),pending=new Map();let seq=0,pausedResolve;const scripts=[];
 await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Debugger.scriptParsed'){scripts.push(m.params);}else if(m.method==='Debugger.paused'&&pausedResolve){pausedResolve(m.params);pausedResolve=null;}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 await send('Page.enable');
 return {adb,send,evaluate,close(){ws.close();proxy.close();adb.close();}};
}
module.exports={connect};
if(require.main===module)(async()=>{const c=await connect();console.log(await c.evaluate('({ua:navigator.userAgent,url:location.href,ready:document.readyState,width:innerWidth,height:innerHeight})'));c.close();})().catch(e=>{console.error(e.stack);process.exitCode=1;});
