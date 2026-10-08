'use strict';
// Actual signed APK on this task's isolated unauthenticated API27 emulator.
// CDP observes private game functions; no APK/source alteration is performed.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const Adb=require('../rift-cast-text-001/finish/direct-adb.cjs');
const [mode,apk,index,out]=process.argv.slice(2),records=[],errors=[];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),delay=ms=>new Promise(r=>setTimeout(r,ms));
let adb,server,ws,seq=0,pauseResolve;const pending=new Map(),scripts=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP deadline '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label,budget=120000){const start=Date.now();while(Date.now()-start<budget){if(await evaluate(expression))return;await delay(250);}throw Error('Native deadline '+label);}
async function connect(){
  let pid,target;for(let i=0;i<240;i++){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'native app PID');
  server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
  for(let i=0;i<240;i++){try{target=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(x=>x.type==='page');}catch{}if(target)break;await delay(500);}assert(target,'native WebView target');
  ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.paused'&&pauseResolve){const r=pauseResolve;pauseResolve=null;r(m.params);}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
  await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"','page initialized');
}
async function bridge(){
  await send('Debugger.enable');let product,code;
  for(const p of scripts){if(!p.url.includes('localhost'))continue;const r=await send('Debugger.getScriptSource',{scriptId:p.scriptId});if(r.scriptSource.includes('function offlineCapHours')){product=p;code=r.scriptSource;break;}}
  assert(product,'actual product script');const expected=fs.readFileSync(index,'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1];assert.equal(code.trim(),expected.trim(),'installed WebView executes exact extracted APK source');
  const line=product.startLine+code.slice(0,code.indexOf('function init(){')).split('\n').length;
  const bp=await send('Debugger.setBreakpointByUrl',{url:product.url,lineNumber:line});
  const paused=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('init pause deadline')),120000);pauseResolve=p=>{clearTimeout(timer);resolve(p);};});
  await send('Page.reload');const p=await paused;
  const expression="window.__offlineNow=Date.now();Date.now=function(){return window.__offlineNow;};Object.defineProperty(performance,'now',{value:function(){return 0;}});var realInterval=window.setInterval;window.setInterval=function(fn,ms){return realInterval(function(){if(window.__offlineTick)fn();},ms);};";
  await send('Debugger.evaluateOnCallFrame',{callFrameId:p.callFrames[0].callFrameId,expression,returnByValue:true});
  await send('Debugger.removeBreakpoint',{breakpointId:bp.breakpointId});
  const renderLine=product.startLine+code.slice(0,code.indexOf('function renderRiftParty(){')).split('\n').length;
  const renderBp=await send('Debugger.setBreakpointByUrl',{url:product.url,lineNumber:renderLine});
  const rendering=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('render pause deadline')),120000);pauseResolve=p=>{clearTimeout(timer);resolve(p);};});
  await send('Debugger.resume');const frame=(await rendering).callFrames[0];
  const properties=[];for(const sc of frame.scopeChain.filter(sc=>sc.type==='closure'))properties.push(...(await send('Runtime.getProperties',{objectId:sc.object.objectId,ownProperties:true})).result);
  const names=['freshState','acceptPersistedState','restoreEnemyOrSpawn','renderAll','saveState','applyOfflineProgress','currentSaveBackup','decodeSaveBackup','offlineCapHours'];
  const handles=names.map(name=>{const p=properties.find(p=>p.name===name);assert(p&&p.value.objectId,'private native handle '+name);return {objectId:p.value.objectId};});
  const access=await send('Debugger.evaluateOnCallFrame',{callFrameId:frame.callFrameId,expression:'window.__offlineGet=function(){return state;};window.__offlineSet=function(s){state=s;};',returnByValue:true});if(access.exceptionDetails)throw Error(access.exceptionDetails.text);
  const r=await send('Runtime.callFunctionOn',{objectId:handles[0].objectId,arguments:handles,functionDeclaration:'function(fresh,accept,restore,render,save,apply,backup,decode,cap){window.__offlineNative={fresh:fresh,get:function(){return JSON.parse(JSON.stringify(__offlineGet()));},set:function(s){__offlineSet(accept(s));restore();render();},save:save,apply:apply,backup:backup,decode:decode,cap:cap,render:render};}',returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);
  await send('Debugger.removeBreakpoint',{breakpointId:renderBp.breakpointId});await send('Debugger.resume');await send('Debugger.disable');
  await until('!!window.__offlineNative&&document.readyState==="complete"','observation bridge');
  await until(`(function(){['startup-skip','tut-skip','welcome-claim','daily-claim','offline-close'].forEach(function(id){var e=document.getElementById(id);if(e&&e.getClientRects().length)e.click();});return __offlineNative.save()===true;})()`,'settled native save');
}
async function attest(){
  const paths=(await adb.shell('pm path com.lumenfall.app')).trim().split('\n');assert.equal(paths.length,1);const installed=paths[0].replace(/^package:/,'');assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(installed));const actual=sha(await adb.exec('cat '+installed));assert.equal(actual,sha(fs.readFileSync(apk)),'actual installed APK bytes');return {installedApkSha256:actual,sourceSha256:sha(fs.readFileSync(index))};
}
async function run(){
  fs.mkdirSync(out,{recursive:true});adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','isolated emulator only');
  if(mode==='accept'){
    const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json')));
    const file=(await adb.shell('pm path com.lumenfall.app')).trim().replace(/^package:/,'');
    assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(file));
    assert.equal(sha(await adb.exec('cat '+file)),baseline.identity.installedApkSha256,'actual prepared baseline installed before target update');
  }
  console.error('native: installing APK');
  await adb.upload(apk,'/data/local/tmp/offline12h.apk');assert((await adb.shell('pm install -r '+(mode==='prepare'?'-d ':'')+'/data/local/tmp/offline12h.apk')).includes('Success'),'signed app install/update');
  await adb.shell('input keyevent KEYCODE_WAKEUP');await adb.shell('wm dismiss-keyguard');
  await adb.shell('wm size 390x844');await adb.shell('wm density 160');await adb.shell('am force-stop com.lumenfall.app');await adb.shell('am start -n com.lumenfall.app/.MainActivity');
  console.error('native: connect WebView');await connect();console.error('native: bind game');await bridge();console.error('native: attest installed bytes');const identity=await attest();identity.ua=await evaluate('navigator.userAgent');identity.android=(await adb.shell('getprop ro.build.version.release')).trim();
  if(mode==='prepare'){
    console.error('native: prepare baseline save');
    const seed=await evaluate(`(function(){var b=__offlineNative,s=b.fresh();s.schemaVersion=1;s.questDay=b.get().questDay;s.loginStreak=1;s.legacyCometPurchases={offline24:true,offline48:true,rememberbulk:true};s.nodes.reserves=3;s.comets=100;s.prisms=100;s.maxDepthEver=101;Array.from(document.querySelectorAll('[data-deed-requirement]')).forEach(function(e){s.achieved[e.dataset.deedRequirement]=true;});s.activeStudies=[{id:'guardmastery',remainingSec:46800,totalDurationSec:46800,speedMult:1}];s.lastSeen=Date.now();b.set(s);if(b.save()!==true)throw Error('native baseline save failed');if(localStorage.getItem('lumenfall_save_v2')!==localStorage.getItem('lumenfall_save_recovery_v1'))throw Error('native baseline slots differ');var stored=JSON.parse(localStorage.getItem('lumenfall_save_v2'));if(JSON.stringify(stored)!==JSON.stringify(b.get()))throw Error('native observation must equal actual committed save');return stored;})()`);
    assert.equal(seed.schemaVersion,1,'baseline save');assert.equal(seed.prisms,100);assert.equal(seed.comets,100);fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify({identity,seed},null,2));return;
  }
  const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json'))),first=await evaluate('__offlineNative.get()');
  assert.equal(first.schemaVersion,2);assert.equal(first.prisms,132);assert.equal(first.comets,400);assert.equal(first.nodes.reserves,3);assert.deepEqual(first.legacyCometPurchases,baseline.seed.legacyCometPurchases);assert.equal(first.activeStudies[0].id,baseline.seed.activeStudies[0].id);assert.equal(first.activeStudies[0].totalDurationSec,46800);assert.equal(first.activeStudies[0].speedMult,1);assert(first.activeStudies[0].remainingSec<=46800&&first.activeStudies[0].remainingSec>=3600,'paid snapshot retains only legitimately elapsed work');
  assert.deepEqual(first.offline12hRefund.cometsPaid,[true,true]);assert.deepEqual(first.offline12hRefund.prismsPaid,[true,true,true]);
  const firstStored=await evaluate("({primary:JSON.parse(localStorage.getItem('lumenfall_save_v2')),recovery:JSON.parse(localStorage.getItem('lumenfall_save_recovery_v1'))})");
  assert.deepEqual(firstStored.primary,first);assert.deepEqual(firstStored.recovery,first);
  records.push({case:'signed 144 to F26 update preserves paid work and refunds exactly once',identity,baselineIdentity:baseline.identity,before:baseline.seed,after:first});
  const original=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../offline-autoascend-2026-10-07/device_backup.json')));
  for(const on of [false,true])for(const seconds of [43200,86400]){
    const seed={...original,autoAscendEnabled:on,lastSeen:1800000000000};
    const started=Date.now();
    await evaluate(`(function(){var b=__offlineNative;window.__offlineNow=${seed.lastSeen+seconds*1000};b.set(${JSON.stringify(seed)});window.__offlineJob=null;b.apply(function(r,e){window.__offlineJob={error:e?e.message:null,result:r,state:b.get(),primary:JSON.parse(localStorage.getItem('lumenfall_save_v2')),recovery:JSON.parse(localStorage.getItem('lumenfall_save_recovery_v1'))};});return true;})()`);
    // Observe cooperative batches without keeping an old-CDP awaitPromise open.
    await until('!!window.__offlineJob','cap simulation '+on+' '+seconds,1200000);
    const result=await evaluate('window.__offlineJob');assert.equal(result.error,null);assert.deepEqual(result.recovery,result.state);
    console.error('native: cap completed '+JSON.stringify({on,seconds,elapsedMs:Date.now()-started}));
    assert.equal(result.result.effectiveSec,43200);assert.equal(result.state.lastSeen,seed.lastSeen+seconds*1000);assert.deepEqual(result.primary,result.state);
    if(seconds===43200)records.push({case:'12h',on,...result});else{const before=records.find(x=>x.case==='12h'&&x.on===on);const a={...before.state},b={...result.state};delete a.lastSeen;delete b.lastSeen;assert.deepEqual(b,a,'native 24h shares exact 12h production');records.push({case:'24h capped',on,...result});}
    assert.equal(await evaluate(`(function(){var r='unset';__offlineNative.apply(function(v){r=v;});return r;})()`),null,'native duplicate return');
  }
  for(const width of [320,390,430]){
    await adb.shell('wm size '+width+'x844');await delay(1000);
    const ui=await evaluate(`(function(){var b=__offlineNative,s=b.fresh();s.schemaVersion=1;s.legacyCometPurchases={offline24:true,offline48:true};s.nodes.reserves=3;s.maxDepthEver=101;s.achieved.d100=true;b.set(s);document.documentElement.style.fontSize='200%';document.querySelector('[data-tab=deeds]').click();var card=document.querySelector('[data-offline-policy]');card.scrollIntoView();return {width:innerWidth,cap:b.cap(),text:card.textContent,overflow:card.scrollWidth-card.clientWidth,retiredAbsent:!document.querySelector('[data-node=reserves],[data-shop=offline24],[data-shop=offline48]'),controls:Array.from(document.querySelectorAll('#shop-list button')).map(function(e){var r=e.getBoundingClientRect();return {w:r.width,h:r.height};})};})()`);
    assert.equal(ui.cap,12);assert(ui.retiredAbsent);assert(ui.overflow<=1);assert(ui.controls.every(x=>x.w>=44&&x.h>=44));assert(ui.text.includes('Refund credited once.'));records.push({case:'native 200% text',...ui});
    await adb.exec('screencap -p').then(b=>fs.writeFileSync(path.join(out,'native-'+width+'.png'),b));
  }
  const nativeWindow=(await adb.shell('dumpsys window windows')).split('\n').filter(x=>/mCurrentFocus|mFocusedApp/.test(x));
  assert(nativeWindow.some(x=>x.includes('com.lumenfall.app')),'native app owns the foreground window');
  await evaluate("document.querySelector('[data-shop=comettrials]').focus()");await adb.shell('input keyevent KEYCODE_TAB');await delay(500);
  const focus=await evaluate("({id:document.activeElement.dataset.shop,outline:getComputedStyle(document.activeElement).outlineStyle})");
  assert(focus.id&&focus.id!=='comettrials');assert.notEqual(focus.outline,'none');records.push({case:'actual Android Tab focus',nativeWindow,focus});
  assert.equal(errors.length,0,'native runtime errors');fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify({status:'pass',identity,records,errors,physicalDevice:false,exactWebView60:false},null,2));
}
(async()=>{let error;try{await run();}catch(e){error=e;}try{if(ws)ws.close();if(server){for(const s of server.sockets)s.destroy();await new Promise(r=>server.close(r));}if(adb)adb.close();}catch(e){error=error||e;}
if(error&&out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'failed-attempt-'+Date.now()+'.json'),JSON.stringify({status:'fail',mode,message:error.stack,records,errors},null,2));}
console.log(JSON.stringify({status:error?'fail':'pass',mode,message:error?.stack,records:records.length}));if(error)process.exitCode=1;})();
