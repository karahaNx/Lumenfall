'use strict';
// Installed APK UI/storage tests. Node22+ (or Node20 experimental WebSocket).
// Isolated emulator only: this replaces its test save.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=process.env.LUMENFALL_QA_REPO||'/workspace/lumenfall-legacy',adb=process.env.LUMENFALL_QA_ADB||'/workspace/.lumenfall-android/sdk/platform-tools/adb',serial='emulator-5554';
const apk=process.env.LUMENFALL_QA_APK;
const candidateUrl=process.env.LUMENFALL_QA_URL;
const smokeOnly=process.env.LUMENFALL_QA_SMOKE==='1';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const original=JSON.parse(fs.readFileSync(root+'/docs/qa/offline-autoascend-2026-10-07/device_backup.json','utf8'));
const output=process.argv[2]||'/tmp/lumenfall-native-results.json',records=[],events=[];
const copy=x=>JSON.parse(JSON.stringify(x)),delay=ms=>new Promise(r=>setTimeout(r,ms));
function android(...args){return cp.execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout:60000});}
let ws,seq=0,pending=new Map(),preludeId,pausedResolve,activePrelude;
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function connect(){let target;const start=Date.now();while(Date.now()-start<60000){const pid=android('shell','pidof','com.lumenfall.app').trim();if(pid){android('forward','tcp:9223','localabstract:webview_devtools_remote_'+pid);try{const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();target=pages.find(p=>p.type==='page');}catch(_){}if(target)break;}await delay(500);}assert(target,'native WebView target');ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=()=>reject(Error('WebSocket failed'));});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')events.push(m.params);else if(m.method==='Debugger.paused'&&pausedResolve){const resolve=pausedResolve;pausedResolve=null;resolve(m.params);}};ws.onclose=()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('WebView disconnected'));}pending.clear();};await send('Runtime.enable');await send('Page.enable');}
async function until(expression,label,timeout=2700000){const start=Date.now();let progress=start;while(Date.now()-start<timeout){const errors=await evaluate('window.__lfNativeQA ? window.__lfNativeQA.errors : []');assert.equal(errors.length,0,'runtime errors during '+label+': '+JSON.stringify(errors));assert.equal(events.length,0,'protocol runtime error during '+label);if(await evaluate(expression))return;if(Date.now()-progress>30000){console.log('WAIT '+label+' '+Math.round((Date.now()-start)/1000)+'s');progress=Date.now();}await delay(100);}throw Error(label+' timeout');}
async function summary(){return evaluate(`(()=>{var p=JSON.parse(localStorage.getItem('lumenfall_save_v2')),q=window.__lfNativeQA;return {hidden:document.hidden,kills:p.totalKills,ascends:p.ascendCount,lastSeen:p.lastSeen,offline:p.totalOfflineSeconds,recoveryMatches:localStorage.getItem('lumenfall_save_v2')===localStorage.getItem('lumenfall_save_recovery_v1'),frames:q&&q.frames,errors:q&&q.errors,primaryWrites:q&&q.writes,returnVisible:document.getElementById('welcome-overlay').style.display!=='none',message:document.getElementById('welcome-text').textContent};})()`);}

async function armBeforeInit(){await send('Debugger.enable');await send('DOMDebugger.setEventListenerBreakpoint',{eventName:'DOMContentLoaded'});return {event:new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pausedResolve=null;reject(Error('DOMContentLoaded breakpoint timeout'));},60000);pausedResolve=p=>{clearTimeout(timer);resolve(p);};})};}
async function injectAtInit(paused,source){const p=await paused.event;const r=await send('Debugger.evaluateOnCallFrame',{callFrameId:p.callFrames[0].callFrameId,expression:source,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);await send('DOMDebugger.removeEventListenerBreakpoint',{eventName:'DOMContentLoaded'});await send('Debugger.resume');await send('Debugger.disable');}
async function reloadBeforeInit(source){const paused=await armBeforeInit();await send('Page.reload');await injectAtInit(paused,source);}
async function seedLoad(seed,seconds,label){
 // Seed before the product DOMContentLoaded listener, not at an ambiguous load stage.
 const now=await evaluate('window.__lfNativeQA&&window.__lfNativeQA.realDateNow ? window.__lfNativeQA.realDateNow() : Date.now()');seed=copy(seed);seed.lastSeen=now-seconds*1000;const marker=Date.now()+'-'+label;
 const source=`(function(){var now=${now},seed=${JSON.stringify(seed)};window.__lfNativeQA={marker:${JSON.stringify(marker)},now:now,pause:true,frames:0,errors:[],writes:[],runClock:false,runMonotonic:false};window.__lfNativeQA.realDateNow=Date.now.bind(Date);var realPerformanceNow=performance.now.bind(performance),monoStart=realPerformanceNow();Object.defineProperty(performance,"now",{configurable:true,value:function(){return window.__lfNativeQA.runMonotonic ? realPerformanceNow()-monoStart : 0;}});Date.now=function(){return window.__lfNativeQA.now+(window.__lfNativeQA.runClock ? realPerformanceNow()-monoStart : 0);};var realInterval=window.setInterval;window.setInterval=function(fn,ms){return realInterval(function(){if(!window.__lfNativeQA.pause)fn();},ms);};function beat(){window.__lfNativeQA.frames++;requestAnimationFrame(beat);}requestAnimationFrame(beat);window.addEventListener('error',function(e){window.__lfNativeQA.errors.push(e.message);});window.addEventListener('unhandledrejection',function(e){window.__lfNativeQA.errors.push(String(e.reason));});if(localStorage.getItem('__lfNativeSeedMarker')!==${JSON.stringify(marker)}){var raw=JSON.stringify(seed);localStorage.setItem('lumenfall_save_v2',raw);localStorage.setItem('lumenfall_save_recovery_v1',raw);localStorage.setItem('lumenfall_startup_intro_last',String(now));localStorage.removeItem('lumenfall_reset_pending_v1');localStorage.setItem('__lfNativeSeedMarker',${JSON.stringify(marker)});}var setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){setItem.call(this,k,v);if(k==='lumenfall_save_v2'){var p=JSON.parse(v);window.__lfNativeQA.writes.push({kills:p.totalKills,ascends:p.ascendCount,lastSeen:p.lastSeen});}};})();`;
 activePrelude=source;await reloadBeforeInit(source);
 await until('!!window.__lfNativeQA&&window.__lfNativeQA.marker==='+JSON.stringify(marker),'native seed initialization',30000);
 const before=await summary();assert.equal(before.lastSeen,seed.lastSeen,'partial catch-up leaves primary endpoint untouched');assert.equal(before.kills,seed.totalKills,'partial catch-up leaves primary rewards untouched');assert.equal(before.primaryWrites.length,0,'no partial primary save');console.log('START '+label+' with unconsumed native save');return {seed,before,start:Date.now(),now};
}
async function complete(info,label,kills,ascends){
 await until('window.__lfNativeQA.writes.some(function(p){return p.lastSeen===window.__lfNativeQA.now;})',label);
 await until('document.getElementById("welcome-overlay").style.display!=="none"',label+' return panel',30000);
 const after=await summary();assert.equal(after.kills-info.before.kills,kills,label+' full kills');assert.equal(after.ascends-info.before.ascends,ascends,label+' full ascends');assert.equal(after.lastSeen,info.now,'one captured endpoint');assert(after.recoveryMatches,'canonical primary/recovery match');assert(after.frames>5,'native frames progress during catch-up');assert.deepEqual(after.errors,[]);assert.equal(after.primaryWrites.length,1,'one completed primary write');records.push({case:label,seconds:(after.lastSeen-info.seed.lastSeen)/1000,before:info.before,after,wallMs:Date.now()-info.start});console.log('PASS '+label+' '+records.at(-1).wallMs+'ms');return after;
}
async function click(id){const r=await evaluate(`(()=>{var e=document.getElementById(${JSON.stringify(id)});e.scrollIntoView({block:'center'});var r=e.getBoundingClientRect();return {x:(r.x+r.width/2)*devicePixelRatio,y:(r.y+r.height/2+24)*devicePixelRatio};})()`);android('shell','input','tap',String(Math.round(r.x)),String(Math.round(r.y)));}
async function main(){
 assert.equal(android('shell','getprop','ro.kernel.qemu').trim(),'1','test-save replacement allowed only on emulator');await connect();
 await send('Debugger.enable');await send('Debugger.resume').catch(()=>{});await send('Debugger.disable');
 if(candidateUrl){
  assert(apk,'candidate mode needs its hosting APK');
  // The native shell expects Capacitor on each page. Use its exact bundled
  // runtime for the temporary HTTP candidate, not a mock of lifecycle events.
  const zip=require(root+'/scripts/lib/zip.cjs'),data=fs.readFileSync(apk),entry=zip.entries(data).find(e=>e.name==='assets/native-bridge.js');
  assert(entry,'hosting APK native bridge');const start=entry.offset+30+data.readUInt16LE(entry.offset+26)+data.readUInt16LE(entry.offset+28),packed=data.subarray(start,start+entry.compressed);
  const bridge=entry.method===0?packed:require('node:zlib').inflateRawSync(packed);assert.equal(zip.crc32(bridge),entry.crc);
  await send('Page.addScriptToEvaluateOnLoad',{scriptSource:bridge.toString('utf8')});events.length=0;
  await send('Page.navigate',{url:candidateUrl});await until('location.href==='+JSON.stringify(candidateUrl)+'&&document.readyState==="complete"','candidate WebView page',60000);
 }
 const nativeSource=await evaluate('Array.from(document.scripts).filter(function(s){return s.textContent.indexOf("function applyOfflineProgress")!==-1;})[0].textContent');
 const productSource=fs.readFileSync(root+'/index.html','utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1];assert(nativeSource.trim()===productSource.trim(),'executed native product matches released source');
 assert(apk,'LUMENFALL_QA_APK must identify the installed signed APK');
 const identity={display:android('shell','wm','size').trim(),density:android('shell','wm','density').trim(),viewport:await evaluate('({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})'),mode:candidateUrl?'candidate served into installed WebView; not bundled-release acceptance':'released signed APK',page:await evaluate('location.href'),android:android('shell','getprop','ro.build.version.release').trim(),api:android('shell','getprop','ro.build.version.sdk').trim(),ua:await evaluate('navigator.userAgent'),package:android('shell','dumpsys','package','com.lumenfall.app').split('\n').filter(l=>l.includes('versionCode=')||l.includes('versionName=')).map(s=>s.trim()),sourceSha256:sha(root+'/index.html'),apkSha256:sha(apk)};console.log(JSON.stringify({identity}));
 const first=await seedLoad(original,28800,'cold-clear21');await complete(first,'native cold Clear21 8h',302400,14400);
 fs.writeFileSync('/tmp/lumenfall-native-cold-return.png',cp.execFileSync(adb,['-s',serial,'exec-out','screencap','-p']));
 await click('welcome-claim');await until('document.getElementById("welcome-overlay").style.display==="none"','native Claim tap',30000);
 const stable=await summary();android('shell','input','keyevent','KEYCODE_HOME');await until('document.hidden','native background',30000);android('shell','am','start','-n','com.lumenfall.app/.MainActivity');await until('!document.hidden','native resume',30000);assert.equal((await summary()).kills,stable.kills,'repeated return has no duplicate rewards');
 await evaluate('window.__lfNativeQA.pause=false');await until('JSON.parse(localStorage.getItem("lumenfall_save_v2")).totalKills>'+stable.kills,'live play after Claim',30000);await evaluate('window.__lfNativeQA.pause=true');records.push({case:'native Claim/repeated return/live play',after:await summary()});console.log('PASS native Claim/repeated return/live play');
 if(smokeOnly){assert.equal(events.length,0);fs.writeFileSync(output,JSON.stringify({status:'pass',scope:'native smoke only',identity,records,protocolRuntimeErrors:events,limitations:['candidate source served in installed WebView; final bundled APK/native full suite and physical WebView60/TalkBack acceptance remain pending']},null,2)+'\n');console.log('PASS native smoke '+output);ws.close();return;}
 const c20=copy(original);c20.autoAscendTargetDepth=21;await complete(await seedLoad(c20,28800,'clear20'),'native Clear20 8h',291959,14597);
 const off=copy(original);off.autoAscendEnabled=false;await complete(await seedLoad(off,28800,'off'),'native OFF 8h',773,0);
 await complete(await seedLoad(original,72*3600,'cap'),'native 72h cap',2721600,129600);
 const beyond=copy(original);beyond.activeStudies=[{id:'guardmastery',remainingSec:80*3600,totalDurationSec:80*3600,speedMult:1}];beyond.studyQueue={};const tail=await complete(await seedLoad(beyond,96*3600,'study-tail'),'native 96h Study beyond cap',2721600,129600);assert(tail.message.includes('Guardian'),'Study completion beyond cap');
 const interrupted=await seedLoad(original,28800,'background-interrupt');android('shell','input','keyevent','KEYCODE_HOME');await until('document.hidden','background DURING catch-up',30000);const paused=await summary();assert.equal(paused.lastSeen,interrupted.seed.lastSeen);assert.equal(paused.kills,interrupted.before.kills);assert.equal(paused.primaryWrites.length,0);android('shell','am','start','-n','com.lumenfall.app/.MainActivity');await complete(interrupted,'native background interruption/retry 8h',302400,14400);
 await click('welcome-claim');
 if(await evaluate('document.getElementById("daily-overlay").style.display!=="none"'))await click('daily-claim');
 const canonical=await evaluate('localStorage.getItem("lumenfall_save_v2")');
 await evaluate('localStorage.setItem("lumenfall_save_v2","corrupt primary QA control")');await reloadBeforeInit(activePrelude);
 await until('(()=>{try{return JSON.parse(localStorage.getItem("lumenfall_save_v2")).totalKills>0;}catch(e){return false;}})()','native recovery repair',30000);
 assert.equal(await evaluate('localStorage.getItem("lumenfall_save_v2")'),canonical,'native load repairs corrupt primary from canonical recovery');
 assert((await summary()).recoveryMatches);records.push({case:'native corrupt-primary recovery',canonicalSha256:crypto.createHash('sha256').update(canonical).digest('hex')});console.log('PASS native recovery');
 await until('document.getElementById("startup-intro").style.display==="none"','backup intro finishes',30000);
 if(await evaluate('document.getElementById("welcome-overlay").style.display!=="none"'))await click('welcome-claim');
 if(await evaluate('document.getElementById("daily-overlay").style.display!=="none"'))await click('daily-claim');
 await click('settings-btn');await until('document.getElementById("settings-overlay").style.display!=="none"','native Settings input',30000);
 await click('save-backup-btn');await until('document.getElementById("save-backup-code").value.length>100','native backup UI',30000);
 const backup=await evaluate('document.getElementById("save-backup-code").value');const restorePause=await armBeforeInit();await click('restore-save-backup');await injectAtInit(restorePause,activePrelude);
 await until('document.getElementById("settings-overlay").style.display==="none"','native restore reload',30000);
 assert.equal(await evaluate('localStorage.getItem("lumenfall_save_v2")'),canonical,'native backup restore preserves canonical save and endpoint');records.push({case:'native UI backup/restore',backupSha256:crypto.createHash('sha256').update(backup).digest('hex')});console.log('PASS native backup/restore');
 // Also exercise naturally advancing processing clocks, without deterministic
 // clock freezing, and then a real Android process restart with the same save.
 const realInfo=await seedLoad(original,600,'real-processing');
 await evaluate('window.__lfNativeQA.runClock=true;window.__lfNativeQA.runMonotonic=true');
 await until('window.__lfNativeQA.writes.length===1','native real processing commit',120000);
 const realAfter=await summary(),processingSec=(realAfter.lastSeen-realInfo.now)/1000;
 assert(processingSec>=0);assert(Math.abs(realAfter.kills-realInfo.seed.totalKills-6300-processingSec*10.5)<=22,'native processing time gives bounded live kills');
 assert(Math.abs(realAfter.ascends-realInfo.seed.ascendCount-300-processingSec/2)<=1,'native processing time gives bounded live ascends');
 assert(Math.abs(realAfter.offline-realInfo.seed.totalOfflineSeconds-600)<1e-6,'processing time does not expand offline accounting');assert(realAfter.recoveryMatches);assert.deepEqual(realAfter.errors,[]);
 records.push({case:'native real processing clocks',processingSec,before:realInfo.before,after:realAfter});console.log('PASS native real processing clocks');
 await evaluate('window.__lfNativeQA.now=Date.now();window.__lfNativeQA.runClock=false');
 if(!candidateUrl){ws.close();android('shell','am','force-stop','com.lumenfall.app');android('shell','am','start','-n','com.lumenfall.app/.MainActivity');await connect();
 await until('document.getElementById("enemy-name").textContent.length>0','native force-stop restart renders',60000);await delay(6500);
 const restarted=await summary();assert(restarted.kills>=realAfter.kills&&restarted.kills-realAfter.kills<1000,'restart preserves save without duplicating the 600s window');assert(restarted.recoveryMatches);records.push({case:'native force-stop/restart',before:realAfter,after:restarted});console.log('PASS native force-stop/restart');
 }
 const result={status:'pass',identity,qaControls:'DevTools original-save derivatives; Date/monotonic clocks and interval pause for exact parity cases, naturally advancing clocks in additional processing case; error/heartbeat/write observation; product source unchanged; native ADB input/background/resume',limitations:['Android8.1/WebView61 emulator is not physical WebView60/TalkBack acceptance','cross-version upgrade recorded separately',...(candidateUrl?['candidate served over HTTP into installed WebView; corrected bundled APK and force-stop acceptance pending']:[])],records,protocolRuntimeErrors:events};assert.equal(events.length,0);fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log('PASS native suite '+output);ws.close();
}
main().catch(e=>{fs.writeFileSync(output,JSON.stringify({status:'fail',error:e.stack,records,protocolRuntimeErrors:events},null,2)+'\n');console.error(e.stack);if(ws)ws.close();process.exitCode=1;});
