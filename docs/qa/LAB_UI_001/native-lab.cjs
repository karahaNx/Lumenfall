'use strict';
// Actual signed APK on an isolated API27 emulator. Runtime QA handles only;
// verify the installed APK and actual script before exposing private state.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const Adb=require('../rift-cast-text-001/finish/direct-adb.cjs');
const [mode,apk,index,output]=process.argv.slice(2),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let adb,server,ws,seq=0,onPause;const requests=new Map(),scripts=[],errors=[],records=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{requests.delete(id);reject(Error('CDP timeout '+method));},60000);requests.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label){const end=Date.now()+120000;while(Date.now()<end){if(await evaluate(expression))return;await delay(250);}throw Error(label+' timeout');}
async function connect(){
 await adb.shell('am start -n com.lumenfall.app/.MainActivity');
 const end=Date.now()+120000;let target,pid;
 while(Date.now()<end){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'native PID');
 server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
 while(Date.now()<end){try{target=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(x=>x.type==='page');}catch{}if(target)break;await delay(500);}assert(target,'native WebView');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=requests.get(m.id);if(p){clearTimeout(p.timer);requests.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Debugger.paused'&&onPause){const r=onPause;onPause=null;r(m.params);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"&&!!document.querySelector(".rift-wisp")','initialized game');
}
function pause(){return new Promise((r,j)=>{const t=setTimeout(()=>j(Error('native breakpoint timeout')),60000);onPause=p=>{clearTimeout(t);r(p);};});}
async function bridge(){
 await send('Debugger.enable');let product,code;
 for(const p of scripts){if(p.url!=='https://localhost/')continue;const r=await send('Debugger.getScriptSource',{scriptId:p.scriptId});if(r.scriptSource.includes('function renderLongStudies')){product=p;code=r.scriptSource;break;}}assert(product,'actual product script');
 function line(name){const at=code.indexOf('function '+name+'(){');assert(at>=0);return product.startLine+code.slice(0,at).split('\n').length;}
 const init=await send('Debugger.setBreakpointByUrl',{url:product.url,lineNumber:line('init')}),initPause=pause();await send('Page.reload');await initPause;
 await evaluate("window.__labNow=Date.now();var raw=localStorage.getItem('lumenfall_save_v2');if(raw){var s=JSON.parse(raw);s.lastSeen=window.__labNow;raw=JSON.stringify(s);localStorage.setItem('lumenfall_save_v2',raw);localStorage.setItem('lumenfall_save_recovery_v1',raw);}Date.now=function(){return window.__labNow;};var interval=window.setInterval;window.setInterval=function(fn,ms){return interval(function(){},ms);};");
 await send('Debugger.removeBreakpoint',{breakpointId:init.breakpointId});const bp=await send('Debugger.setBreakpointByUrl',{url:product.url,lineNumber:line('renderLongStudies')}),event=pause();await send('Debugger.resume');const p=await event,props=[];
 for(const s of p.callFrames[0].scopeChain.filter(x=>x.type==='closure'))props.push(...(await send('Runtime.getProperties',{objectId:s.object.objectId,ownProperties:true})).result);
 const names=['state','freshState','acceptPersistedState','restoreEnemyOrSpawn','renderAll','renderLongStudies','saveState','updateStudyProgress'];
 const handles=names.map(n=>{const p=props.find(x=>x.name===n);assert(p?.value?.objectId,'private handle '+n);return{objectId:p.value.objectId};});
 const r=await send('Runtime.callFunctionOn',{objectId:handles[1].objectId,arguments:handles,functionDeclaration:'function(live,fresh,accept,restore,all,render,save,progress){window.__labNative={fresh:fresh,get:function(){return JSON.parse(JSON.stringify(live));},install:function(s){var next=accept(s,"qa-lab-native");Object.keys(live).forEach(function(k){delete live[k];});Object.keys(next).forEach(function(k){live[k]=next[k];});restore();all();},render:render,save:save,progress:progress};}',returnByValue:true});assert(!r.exceptionDetails,'native QA handles');
 await send('Debugger.removeBreakpoint',{breakpointId:bp.breakpointId});await send('Debugger.resume');await send('Debugger.disable');await until('!!window.__labNative&&document.readyState==="complete"','QA handles');
 await evaluate("['startup-skip','tut-skip','welcome-claim','daily-claim'].forEach(function(id){var e=document.getElementById(id);if(e&&e.getClientRects().length)e.click();});document.querySelectorAll('.overlay,#startup-intro').forEach(function(e){e.style.display='none';});");
}
async function main(){
 fs.mkdirSync(output,{recursive:true});adb=await new Adb().connect();
 assert.equal((await adb.shell('getprop sys.boot_completed')).trim(),'1');
 if(mode==='baseline'){await adb.upload(apk,'/data/local/tmp/labui.apk');assert((await adb.shell('pm install -r /data/local/tmp/labui.apk')).includes('Success'));}
 await connect();
 const installed=(await adb.shell('pm path com.lumenfall.app')).trim().replace(/^package:/,'');assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(installed));
 const installedHash=hash(await adb.exec('cat '+installed));assert.equal(installedHash,hash(fs.readFileSync(apk)),'actual installed APK identity');
 const source=fs.readFileSync(index,'utf8'),expected=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
 const actual=await evaluate('Array.prototype.filter.call(document.scripts,function(s){return s.textContent.indexOf("function renderLongStudies")!==-1;})[0].textContent');assert.equal(actual.trim(),expected.trim(),'unmodified installed product script');
 const identity={apkSha256:installedHash,sourceSha256:hash(source),api:(await adb.shell('getprop ro.build.version.sdk')).trim(),package:(await adb.shell('dumpsys package com.lumenfall.app')).split('\n').filter(x=>/versionCode=|versionName=/.test(x)),ua:await evaluate('navigator.userAgent')};
 await bridge();
 if(mode==='baseline'){
  const saved=await evaluate("(function(){var b=__labNative,s=b.fresh();s.lastSeen=Date.now();s.depth=s.maxDepthEver=120;s.lumen=10000;s.shards=10000;s.motes=100;s.longStudyLevels.guardmastery=2;s.studyQueue.guardmastery=true;s.studyUseMotes.guardmastery=false;s.studySpeedTargets.guardmastery=3;s.activeStudies=[{id:'guardmastery',remainingSec:150,totalDurationSec:150,speedMult:3}];b.install(s);if(!b.save())throw Error('native save failed');return JSON.parse(localStorage.getItem('lumenfall_save_v2'));})()");
  fs.writeFileSync(output+'/baseline.json',JSON.stringify({status:'pass',identity,saved,runtimeErrors:errors},null,2));return;
 }
 for(const width of [320,390,430])for(const scale of [1,2]){
  const dpr=await evaluate('devicePixelRatio');await adb.shell('wm size '+Math.round(width*dpr)+'x'+Math.round(844*dpr));await until('innerWidth==='+width,'native width');
  await evaluate("document.documentElement.style.fontSize='"+(16*scale)+"px'");
  const result=await evaluate("(function(){var b=__labNative,check=function(v,m){if(!v)throw Error(m);},q=function(s){return document.querySelector(s);},s=b.get();s.motes=100;s.studyUseMotes.guardmastery=false;s.activeStudies=[{id:'guardmastery',remainingSec:150,totalDurationSec:150,speedMult:1}];b.install(s);q('[data-tab=research]').click();var card=q('[data-running-study=guardmastery]'),bar=card.querySelector('[role=progressbar]'),text=card.querySelector('[data-study-text]');check(bar.contains(text)&&bar.getAttribute('aria-valuetext').indexOf('1x')!==-1,'progress time/speed ARIA');check(card.innerText.split(\"Guardian's Mastery\").length===2&&(card.innerText.match(/Lv\\./g)||[]).length===1,'one title/level');check(!card.querySelector('details'),'no repeated disclosure title');var open=q('[data-study-details=guardmastery]'),panel=q('[data-study-inspection=guardmastery]');check(panel.hidden,'default closed');open.focus();open.click();b.render();check(document.activeElement.dataset.studyDetails==='guardmastery','opener focus retained');panel=q('[data-study-inspection=guardmastery]');check(!panel.hidden&&q('[data-study-details=guardmastery]').getAttribute('aria-expanded')==='true','panel open');check(panel.querySelectorAll('[data-speed-study]').length===8,'all tier prices');var buy=q('[data-speed-study=guardmastery][data-speed=3]');buy.focus();buy.click();check(b.get().motes===40&&b.get().activeStudies[0].speedMult===3,'exact 60-Motes purchase');check(document.activeElement.dataset.studyDetails==='guardmastery','purchase focus return');var close=q('[data-study-speed-close=guardmastery]');close.click();check(q('[data-study-inspection=guardmastery]').hidden&&document.activeElement.dataset.studyDetails==='guardmastery','close focus');check(q('#study-list').scrollWidth<=q('#study-list').clientWidth+1,'no Lab overflow');var controls=Array.prototype.filter.call(q('#study-list').querySelectorAll('button,select'),function(e){return e.getClientRects().length;});controls.forEach(function(e){check(e.offsetWidth>=44&&e.offsetHeight>=44,'44px control');});return {width:innerWidth,textScale:"+scale+",time:text.textContent,controls:controls.length};})()");
  records.push(result);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(output+'/native-'+width+'-text'+scale+'.png',Buffer.from(shot.data,'base64'));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(output+'/native.json',JSON.stringify({status:'pass',identity,records,runtimeErrors:errors,limitation:'Android8.1/API27 native WebView61 software emulator and separate V8 6.0 probe; physical exact WebView60/TalkBack acceptance remains open.'},null,2));
}
main().catch(e=>{fs.mkdirSync(output,{recursive:true});fs.writeFileSync(output+'/failure.json',JSON.stringify({status:'fail',message:e.stack,records,runtimeErrors:errors},null,2));console.error(e);process.exitCode=1;}).finally(async()=>{for(const p of requests.values())clearTimeout(p.timer);if(ws)ws.close();if(server){for(const s of server.sockets)s.destroy();await new Promise(r=>server.close(r));}if(adb)adb.close();});
