'use strict';
// Real signed APK checks on the isolated API27 AOSP emulator; no APK alteration.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const Adb=require('../../rift-cast-text-001/finish/direct-adb.cjs');
const [mode,apk,index,out]=process.argv.slice(2),records=[],errors=[];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),delay=ms=>new Promise(r=>setTimeout(r,ms));
let adb,server,ws,seq=0,pausedResolve,artifactIdentity=null;const pending=new Map(),scripts=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},120000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label,ms=60000){const start=Date.now();while(Date.now()-start<ms){if(await evaluate(expression))return;await delay(200);}throw Error(label+' timed out');}
async function connect(){
 let pid,target;const start=Date.now();while(Date.now()-start<120000){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'native app PID');
 server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
 while(Date.now()-start<120000){try{target=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(x=>x.type==='page');}catch(_){}if(target)break;await delay(500);}assert(target,'native WebView page');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.paused'&&pausedResolve){const r=pausedResolve;pausedResolve=null;r(m.params);}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"&&!!document.querySelector(".rift-wisp")','native initialization',120000);
}
async function bridge(){
 await send('Debugger.enable');let product,code;
 for(const p of scripts.filter(p=>p.url==='https://localhost/')){const r=await send('Debugger.getScriptSource',{scriptId:p.scriptId});if(r.scriptSource.includes('function renderRiftParty')){product=p;code=r.scriptSource;break;}}
 assert(product,'native private product script');
 function lineFor(name){const at=code.indexOf('function '+name+'(){');assert(at>=0);return product.startLine+code.slice(0,at).split('\n').length;}
 function paused(){return new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('native breakpoint timeout')),60000);pausedResolve=p=>{clearTimeout(t);resolve(p);};});}
 const initBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('init')});const initEvent=paused();await send('Page.reload');await initEvent;
 await evaluate(`window.__supportNow=Date.now();var qaSaved=localStorage.getItem('lumenfall_save_v2');if(qaSaved){var qaNext=JSON.parse(qaSaved);qaNext.lastSeen=window.__supportNow;var qaRaw=JSON.stringify(qaNext);localStorage.setItem('lumenfall_save_v2',qaRaw);localStorage.setItem('lumenfall_save_recovery_v1',qaRaw);}Date.now=function(){return window.__supportNow;};var realInterval=window.setInterval;window.setInterval=function(fn,ms){return realInterval(function(){if(window.__supportRun)fn();},ms);};`);
 await send('Debugger.removeBreakpoint',{breakpointId:initBp.breakpointId});const renderBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('renderRiftParty')});const renderEvent=paused();await send('Debugger.resume');const p=await renderEvent;
 const properties=[];for(const sc of p.callFrames[0].scopeChain.filter(sc=>sc.type==='closure'))properties.push(...(await send('Runtime.getProperties',{objectId:sc.object.objectId,ownProperties:true})).result);
 const names=['state','freshState','acceptPersistedState','restoreEnemyOrSpawn','renderAll','renderRiftParty','emitCombatVfx','tick','saveState','SPIRITS'];const handles=names.map(name=>{const p=properties.find(p=>p.name===name);assert(p&&p.value&&p.value.objectId,'private native handle '+name);return {objectId:p.value.objectId};});
 const r=await send('Runtime.callFunctionOn',{objectId:handles[1].objectId,arguments:handles,functionDeclaration: 'function(live,fresh,accept,restore,all,render,emit,tick,save,catalog){window.__supportNative={rebind:function(next){live=next;},fresh:fresh,get:function(){return JSON.parse(JSON.stringify(live));},install:function(s){var next=accept(s,"qa-support-native");Object.keys(live).forEach(function(k){delete live[k];});Object.keys(next).forEach(function(k){live[k]=next[k];});restore();all();},level:function(id,n){live.spirits[id]=n;render();},render:render,emit:function(id){emit("ability","#abcdef",id);render();},tick:tick,save:save,catalog:function(){return catalog.map(function(sp){return {id:sp.id,name:sp.name,ability:sp.abilityName};});}};}',returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception.description);
 await send('Debugger.removeBreakpoint',{breakpointId:renderBp.breakpointId});await send('Debugger.resume');await send('Debugger.disable');await until('!!window.__supportNative&&document.readyState==="complete"','native bridge ready');await delay(1000);
 await evaluate(`(function(){var skip=document.getElementById('startup-skip');if(skip)skip.click();var tut=document.getElementById('tut-skip');if(tut)tut.click();})()`);await delay(1000);await evaluate(`(function(){var welcome=document.getElementById('welcome-claim');if(welcome&&welcome.getClientRects().length)welcome.click();for(var i=0;i<10;i++){var daily=document.getElementById('daily-claim');if(!daily||!daily.getClientRects().length)break;daily.click();}})()`);await delay(1000);
 // A successful product save proves return processing is settled; then capture its canonical state.
 await until('(function(){["startup-skip","tut-skip","welcome-claim","daily-claim"].forEach(function(id){var el=document.getElementById(id);if(el&&el.getClientRects().length)el.click();});return __supportNative.save()===true;})()','native successful save before QA fixture',120000);
 await send('Debugger.enable');const finalBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('renderRiftParty')});const finalEvent=paused(),rendering=evaluate('__supportNative.render()');const final=await finalEvent;
 const closure=final.callFrames[0].scopeChain.find(sc=>sc.type==='closure'),props=(await send('Runtime.getProperties',{objectId:closure.object.objectId,ownProperties:true})).result,state=props.find(p=>p.name==='state');assert(state&&state.value.objectId,'current native state');
 await send('Runtime.callFunctionOn',{objectId:state.value.objectId,functionDeclaration:'function(){window.__supportNative.rebind(this);}',returnByValue:true});await send('Debugger.removeBreakpoint',{breakpointId:finalBp.breakpointId});await send('Debugger.resume');await rendering;await send('Debugger.disable');
}

async function reconnectAfterFont(scale){
 if(ws){ws.close();ws=null;}if(server){for(const socket of server.sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));server=null;}
 await adb.shell('settings put system font_scale '+scale);await delay(1000);await connect();
 await evaluate(`(function(){var skip=document.getElementById('startup-skip');if(skip&&skip.getClientRects().length)skip.click();var tut=document.getElementById('tut-skip');if(tut&&tut.getClientRects().length)tut.click();var claim=document.getElementById('welcome-claim');if(claim&&claim.getClientRects().length)claim.click();for(var i=0;i<10;i++){var daily=document.getElementById('daily-claim');if(!daily||!daily.getClientRects().length)break;daily.click();}})()`);
 await delay(500);
}
async function identity(){return {android:(await adb.shell('getprop ro.build.version.release')).trim(),api:(await adb.shell('getprop ro.build.version.sdk')).trim(),package:(await adb.shell('dumpsys package com.lumenfall.app')).split('\n').filter(x=>/versionCode=|versionName=/.test(x)).map(x=>x.trim()),ua:await evaluate('navigator.userAgent'),page:await evaluate('location.href'),viewport:await evaluate('({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})')};}
async function installedIdentity(){
 const paths=(await adb.shell('pm path com.lumenfall.app')).trim().split('\n');assert.equal(paths.length,1,'single installed APK');const file=paths[0].replace(/^package:/,'');assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(file),'safe actual installed APK path');return {installedApkPath:file,installedApkSha256:sha(await adb.exec('cat '+file))};
}
async function attestInstalledArtifact(){
 const installed=await installedIdentity(),providedSha256=sha(fs.readFileSync(apk));assert.equal(installed.installedApkSha256,providedSha256,'actual installed APK bytes match provided artifact');
 artifactIdentity={...installed,providedApkSha256:providedSha256,sourceSha256:sha(fs.readFileSync(index))};return artifactIdentity;
}

async function screenshot(name){fs.writeFileSync(path.join(out,name+'.png'),await adb.exec('screencap -p'));}
async function prepare(){
 await attestInstalledArtifact();await connect();
 const expected=fs.readFileSync(index,'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1];
 const actual=await evaluate('Array.from(document.scripts).filter(function(s){return s.textContent.indexOf("function renderRiftParty")!==-1;})[0].textContent');assert.equal(actual.trim(),expected.trim(),'unmodified signed baseline product script');
 await bridge();const id=await identity();assert(id.package.some(x=>x.includes('versionName=0.1.143')),'baseline143');
 const saved=await evaluate('(function(){var b=__supportNative,s=b.fresh();s.maxDepthEver=101;s.depth=101;s.activeParty=["tide","aurora"];s.activeParty.forEach(function(id){s.spirits[id]=1;s.heroRarity[id]=5;s.wispUltimate[id]=true;});s.research.charge=25;Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=false;});s.sigils=1000;s.shards=5000;b.install(s);if(b.save()!==true)throw Error("save must succeed");return JSON.parse(localStorage.getItem("lumenfall_save_v2"));})()');
 await screenshot('baseline-143-supports');
 if(ws){ws.close();ws=null;}if(server){for(const socket of server.sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));server=null;}
 await adb.shell('am force-stop com.lumenfall.app');await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();
 const cold=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');
 for(const name of ['charge'])assert.equal(cold.research[name],saved.research[name],'cold historical Swift ownership');
 for(const name of ['tide','aurora']){assert.equal(cold.spirits[name],saved.spirits[name]);assert.equal(cold.wispUltimate[name],true,'cold Ultimate ownership');}
 await attestInstalledArtifact();assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'baseline-native.json'),JSON.stringify({status:'prepared',coldLaunchVerified:true,identity:id,artifactIdentity,saved,coldOwnership:{research:cold.research,spirits:cold.spirits,wispUltimate:cold.wispUltimate},runtimeErrors:errors},null,2)+'\n');
 console.log('PASS signed143 baseline: native cold launch preserves Swift25 and both Ultimates');
}
(async()=>{assert.equal(mode,'prepare','candidate acceptance follows the approved save transition');fs.mkdirSync(out,{recursive:true});adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','isolated emulator only');try{await prepare();}finally{if(ws)ws.close();if(server){for(const socket of server.sockets)socket.destroy();server.close();}adb.close();}})().catch(e=>{console.error(e.stack);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,mode+'-failure.json'),JSON.stringify({status:'fail',artifactIdentity,error:e.stack,records,runtimeErrors:errors},null,2)+'\n');process.exitCode=1;});
