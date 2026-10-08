'use strict';
// Observe a complete native hardware swipe on the existing task QA fixture.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Adb=require('./native-adb.cjs'),Console=require('./native-console.cjs');
const out=path.resolve(process.argv[2]||path.join(__dirname,'native61/hardware-swipe-diagnostic.json'));
(async()=>{
 const a=await new Adb().connect();assert.equal((await a.shell('getprop ro.kernel.qemu.avd_name')).trim(),'RiftGuidance');
 const pid=(await a.shell('pidof com.lumenfall.app')).trim(),server=await a.forward(9226,'localabstract:webview_devtools_remote_'+pid),target=(await(await fetch('http://127.0.0.1:9226/json/list')).json()).find(t=>t.type==='page'),ws=new WebSocket(target.webSocketDebuggerUrl),pending=new Map();let id=0;
 ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject,timer:setTimeout(()=>reject(Error('diagnostic CDP timeout')),90000)});ws.send(JSON.stringify({id:n,method,params}));});
 const ev=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true});assert(!result.exceptionDetails);return result.result.value;};
 const windows=await a.shell('dumpsys window'),stable=windows.match(/mStable=\((\d+),(\d+)\)-/);assert(stable&&/mCurrentFocus=.*com.lumenfall.app\/com.lumenfall.app.MainActivity/.test(windows));
 const input=await a.shell('dumpsys input'),match=input.match(/Viewport: displayId=0, orientation=0, logicalFrame=\[0, 0, (\d+), (\d+)\], physicalFrame=\[(\d+), (\d+), (\d+), (\d+)\], deviceSize=\[(\d+), (\d+)\]/);assert(match);const viewport=match.slice(1).map(Number);
 await ev('getSelection().removeAllRanges();window.__f07TouchEvents=[];["touchstart","touchmove","touchend"].forEach(function(name){document.addEventListener(name,function(e){var t=e.touches[0];window.__f07TouchEvents.push({type:name,target:e.target.id,x:t?t.clientX:null,y:t?t.clientY:null,time:e.timeStamp});},{passive:true});});');
 const before=await ev('(function(){var e=document.getElementById("rift-objective-row"),r=e.getBoundingClientRect();return {top:e.scrollTop,overflow:e.scrollHeight-e.clientHeight,hidden:e.hidden,x:r.left+r.width/2,y1:r.bottom-4,y2:r.top+4,dpr:devicePixelRatio};})()');assert(!before.hidden&&before.overflow>0);assert.equal(before.dpr,1);
 const points=[];for(let i=0;i<=6;i++){const x=before.x+Number(stable[1]),y=before.y1+(before.y2-before.y1)*i/6+Number(stable[2]);points.push([Math.round(viewport[2]+x*(viewport[4]-viewport[2])/viewport[0]),Math.round(viewport[3]+y*(viewport[5]-viewport[3])/viewport[1])]);}
 const hardware=await new Console().connect();await hardware.gesture(points);hardware.close();await new Promise(r=>setTimeout(r,2000));
 const after=await ev('({top:document.getElementById("rift-objective-row").scrollTop,selected:getSelection().toString(),tab:document.querySelector(".tab-panel.active").id,events:window.__f07TouchEvents})'),result={before,viewport,points,after};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 ws.close();for(const socket of server.sockets)socket.destroy();await new Promise(r=>server.close(r));a.close();assert(after.events.some(e=>e.type==='touchmove'),'actual Android hardware touch move');assert(after.top>before.top,'actual native hint scrolled');assert.equal(after.tab,'tab-battle');
})().catch(error=>{console.error(error.stack);process.exit(1);});
