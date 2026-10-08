'use strict';
// Native Auto-Ascend checks. Private-handle transport adapted from the preserved F13 driver; no APK alteration.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const Adb=require('../rift-cast-text-001/finish/direct-adb.cjs');
const [mode,apk,index,out,version]=process.argv.slice(2),records=[],errors=[];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),delay=ms=>new Promise(r=>setTimeout(r,ms));
let adb,server,ws,seq=0,pausedResolve,nativeReady=false,nativeRenderLine=null;const pending=new Map(),scripts=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},120000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function rawEvaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
// saveState replaces its canonical object. Refresh the actual closure's state
// handle before each observation/fixture; never trust a retained old object.
async function evaluate(expression){if(nativeReady&&expression.includes('__autoUiNative'))await refreshState();return rawEvaluate(expression);}
async function refreshState(){
 await send('Debugger.enable');const bp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:nativeRenderLine});
 const event=new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('state observation breakpoint timeout')),60000);pausedResolve=p=>{clearTimeout(t);resolve(p);};});
 const rendering=rawEvaluate('__autoUiNative.render()'),frame=await event;let state;
 for(const scope of frame.callFrames[0].scopeChain.filter(sc=>sc.type==='closure')){const props=(await send('Runtime.getProperties',{objectId:scope.object.objectId,ownProperties:true})).result;state=props.find(p=>p.name==='state');if(state)break;}
 assert(state&&state.value.objectId,'actual current canonical state');await send('Runtime.callFunctionOn',{objectId:state.value.objectId,functionDeclaration:'function(){window.__autoUiNative.rebind(this);}',returnByValue:true});
 await send('Debugger.removeBreakpoint',{breakpointId:bp.breakpointId});await send('Debugger.resume');await rendering;await send('Debugger.disable');nativeReady=true;
}
async function until(expression,label,ms=60000){const start=Date.now();while(Date.now()-start<ms){if(await evaluate(expression))return;await delay(200);}throw Error(label+' timed out');}
async function connect(){
 nativeReady=false;scripts.length=0;
 let pid,target;const start=Date.now();while(Date.now()-start<120000){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'native app PID');
 server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
 while(Date.now()-start<120000){try{target=(await(await fetch('http://127.0.0.1:9223/json/list',{signal:AbortSignal.timeout(10000)})).json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch(_){}if(target)break;await delay(500);}assert(target,'native WebView page');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.paused'&&pausedResolve){const r=pausedResolve;pausedResolve=null;r(m.params);}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"&&!!document.querySelector(".rift-wisp")','native initialization',120000);
}
async function bridge(){
 nativeReady=false;
 await send('Debugger.enable');let product,code;
 for(const p of scripts.filter(p=>p.url==='https://localhost/')){const r=await send('Debugger.getScriptSource',{scriptId:p.scriptId});if(r.scriptSource.includes('function renderRiftParty')){product=p;code=r.scriptSource;break;}}
 assert(product,'native private product script');
 function lineFor(name){const at=code.indexOf('function '+name+'(){');assert(at>=0);return product.startLine+code.slice(0,at).split('\n').length;}
 nativeRenderLine=lineFor('renderRiftParty');
 function paused(){return new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('native breakpoint timeout')),60000);pausedResolve=p=>{clearTimeout(t);resolve(p);};});}
 const initBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('init')});const initEvent=paused();await send('Page.reload');await initEvent;
 await evaluate(`window.__autoUiNow=Date.now();var qaSaved=localStorage.getItem('lumenfall_save_v2');if(qaSaved){var qaNext=JSON.parse(qaSaved);qaNext.lastSeen=window.__autoUiNow;var qaRaw=JSON.stringify(qaNext);localStorage.setItem('lumenfall_save_v2',qaRaw);localStorage.setItem('lumenfall_save_recovery_v1',qaRaw);}Date.now=function(){return window.__autoUiNow;};var realInterval=window.setInterval;window.setInterval=function(fn,ms){return realInterval(function(){if(window.__autoUiRun)fn();},ms);};`);
 await send('Debugger.removeBreakpoint',{breakpointId:initBp.breakpointId});const renderBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('renderRiftParty')});const renderEvent=paused();await send('Debugger.resume');const p=await renderEvent;
 const properties=[];for(const sc of p.callFrames[0].scopeChain.filter(sc=>sc.type==='closure'))properties.push(...(await send('Runtime.getProperties',{objectId:sc.object.objectId,ownProperties:true})).result);
 const names=['state','freshState','acceptPersistedState','restoreEnemyOrSpawn','renderAll','renderRiftParty','emitCombatVfx','tick','saveState','SPIRITS','enemyHpFor'];const handles=names.map(name=>{const p=properties.find(p=>p.name===name);assert(p&&p.value&&p.value.objectId,'private native handle '+name);return {objectId:p.value.objectId};});
 const r=await send('Runtime.callFunctionOn',{objectId:handles[1].objectId,arguments:handles,functionDeclaration: 'function(live,fresh,accept,restore,all,render,emit,tick,save,catalog,enemyHp){window.__autoUiNative={rebind:function(next){live=next;},fresh:fresh,get:function(){return JSON.parse(JSON.stringify(live));},install:function(s){var next=accept(s,"qa-auto-ascend-native");Object.keys(live).forEach(function(k){delete live[k];});Object.keys(next).forEach(function(k){live[k]=next[k];});restore();all();},level:function(id,n){live.spirits[id]=n;render();},render:render,emit:function(id){emit("ability","#abcdef",id);render();},tick:tick,save:save,enemyHp:enemyHp,catalog:function(){return catalog.map(function(sp){return {id:sp.id,name:sp.name,ability:sp.abilityName};});}};}',returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception.description);
 await send('Debugger.removeBreakpoint',{breakpointId:renderBp.breakpointId});await send('Debugger.resume');await send('Debugger.disable');await until('!!window.__autoUiNative&&document.readyState==="complete"','native bridge ready');await delay(1000);
 await evaluate(`(function(){var skip=document.getElementById('startup-skip');if(skip)skip.click();var tut=document.getElementById('tut-skip');if(tut)tut.click();})()`);await delay(1000);await evaluate(`(function(){var welcome=document.getElementById('welcome-claim');if(welcome&&welcome.getClientRects().length)welcome.click();for(var i=0;i<10;i++){var daily=document.getElementById('daily-claim');if(!daily||!daily.getClientRects().length)break;daily.click();}})()`);await delay(1000);
 // A successful product save proves return processing is settled; then capture its canonical state.
 await until('(function(){["startup-skip","tut-skip","welcome-claim","daily-claim"].forEach(function(id){var el=document.getElementById(id);if(el&&el.getClientRects().length)el.click();});return __autoUiNative.save()===true;})()','native successful save before QA fixture',120000);
 await send('Debugger.enable');const finalBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('renderRiftParty')});const finalEvent=paused(),rendering=evaluate('__autoUiNative.render()');const final=await finalEvent;
 const closure=final.callFrames[0].scopeChain.find(sc=>sc.type==='closure'),props=(await send('Runtime.getProperties',{objectId:closure.object.objectId,ownProperties:true})).result,state=props.find(p=>p.name==='state');assert(state&&state.value.objectId,'current native state');
 await send('Runtime.callFunctionOn',{objectId:state.value.objectId,functionDeclaration:'function(){window.__autoUiNative.rebind(this);}',returnByValue:true});await send('Debugger.removeBreakpoint',{breakpointId:finalBp.breakpointId});await send('Debugger.resume');await rendering;await send('Debugger.disable');nativeReady=true;
}

async function disconnect(){
 nativeReady=false;
 if(ws){ws.close();ws=null;}if(server){for(const socket of server.sockets)socket.destroy();await new Promise(r=>server.close(r));server=null;}
}
async function identity(){
 const pkg=(await adb.shell('dumpsys package com.lumenfall.app')).split('\n').filter(x=>/versionCode=|versionName=/.test(x)).map(x=>x.trim());
 assert(pkg.some(x=>x.includes('versionName=0.1.'+version)),'expected native APK version');
 const installed=(await adb.shell('pm path com.lumenfall.app')).trim().replace(/^package:/,'');
 assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(installed),'safe actual installed APK path');
 const actual=sha(await adb.exec('cat '+installed));assert.equal(actual,sha(fs.readFileSync(apk)),'actual installed artifact equals provided APK');
 return {package:pkg,installedApkSha256:actual,sourceSha256:sha(fs.readFileSync(index)),android:(await adb.shell('getprop ro.build.version.release')).trim(),api:(await adb.shell('getprop ro.build.version.sdk')).trim()};
}
async function bindSource(){
 await connect();const actual=await evaluate('Array.from(document.scripts).filter(function(s){return s.textContent.indexOf("function renderRiftParty")!==-1;})[0].textContent');
 assert.equal(actual.trim(),fs.readFileSync(index,'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1].trim(),'unmodified APK product script matches extracted source');
}
async function storage(){const b=await adb.exec('run-as com.lumenfall.app tar cf - "app_webview/Local Storage"');assert(b.length>1024&&!b.subarray(0,80).toString().includes('tar:'),'actual nonempty WebView save storage');return b;}
async function screenshot(name){fs.writeFileSync(path.join(out,name+'.png'),await adb.exec('screencap -p'));}
async function inputFocus(){const current=(await adb.shell('dumpsys window windows')).split('\n').find(x=>x.includes('mCurrentFocus='));assert(current&&current.includes('com.lumenfall.app/com.lumenfall.app.MainActivity'),'actual native game owns Android input focus: '+current);return current;}
async function tapControl(){
 const window=(await adb.shell('dumpsys window windows')).split(/Window #\d+ /).find(x=>x.startsWith('Window{')&&x.includes('com.lumenfall.app/com.lumenfall.app.MainActivity'));
 assert(window,'observed game window');const bounds=/content=\[(\d+),(\d+)\]\[(\d+),(\d+)\]/.exec(window);assert(bounds,'observed Android content bounds');
 const box=await evaluate('(function(){var e=document.querySelector("[data-autoascend-target]"),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:innerWidth};})()');
 const scale=(Number(bounds[3])-Number(bounds[1]))/box.width,x=Math.round(Number(bounds[1])+box.x*scale),y=Math.round(Number(bounds[2])+box.y*scale);const beforeFocus=await inputFocus();await adb.shell('input tap '+x+' '+y);return {box,bounds:bounds.slice(1).map(Number),x,y,beforeFocus};
}
async function nativeSelect(value){
 const before=await evaluate('__autoUiNative.get()');await evaluate('document.querySelector("[data-autoascend-target]").scrollIntoView({block:"center"});');const tap=await tapControl();let windows,popupFocus;const start=Date.now();
 while(Date.now()-start<20000){windows=await adb.shell('dumpsys window windows');popupFocus=windows.split('\n').find(x=>x.includes('mCurrentFocus='));if(popupFocus&&popupFocus!==tap.beforeFocus&&popupFocus.includes('com.lumenfall.app'))break;await delay(500);}
 assert(popupFocus&&popupFocus!==tap.beforeFocus&&popupFocus.includes('com.lumenfall.app'),'actual native popup owns input focus');fs.writeFileSync(path.join(out,'native-select-'+value+'-window.txt'),windows);await screenshot('native-select-'+value);
 // Visual acceptance uses actual Android touch. Coordinate input is bound to
 // this exact screenshot/value; no DOM event/handler substitutes for the tap.
 const shot=path.join(out,'native-select-'+value+'.png'),screenshotSha256=sha(fs.readFileSync(shot)),coordinates=path.join(out,'native-select-'+value+'-touch.json');
 fs.writeFileSync(path.join(out,'native-select-pending.json'),JSON.stringify({value,screenshot:shot,screenshotSha256,coordinates},null,2)+'\n');console.log('READY actual native picker '+value+'; screenshot-bound touch coordinates required');
 let touch;const wait=Date.now();while(Date.now()-wait<120000){if(fs.existsSync(coordinates)){const next=JSON.parse(fs.readFileSync(coordinates));if(next.value===value&&next.screenshotSha256===screenshotSha256){touch=next;break;}}await delay(500);}
 assert(touch&&Number.isInteger(touch.x)&&Number.isInteger(touch.y)&&touch.x>0&&touch.x<390&&touch.y>24&&touch.y<796,'valid observed native touch coordinates');await adb.shell('input tap '+touch.x+' '+touch.y);
 await until('__autoUiNative.get().autoAscendTargetDepth==='+String(Number(value)+1),'actual native picker selection '+value,15000);const after=await evaluate('__autoUiNative.get()');assert.deepEqual(after,{...before,autoAscendTargetDepth:Number(value)+1,lastSeen:after.lastSeen},'native dropdown selection preserves all other gameplay values');assert.equal(await evaluate('document.querySelector("[data-autoascend-target]").value'),value,'native selected value is visible');records.push({case:'actual Android picker chooses '+value,tap,popupFocus,touch});fs.unlinkSync(path.join(out,'native-select-pending.json'));
}

async function launch(){await adb.shell('am start -n com.lumenfall.app/.MainActivity');await bindSource();}
async function install(){await adb.upload(apk,'/data/local/tmp/auto-ascend.apk');const result=await adb.shell('pm install -r /data/local/tmp/auto-ascend.apk');assert(result.includes('Success'),'native in-place install');return result;}
async function seed(high,enabled){return evaluate(`(function(){var b=__autoUiNative,s=b.fresh();s.owned.autoascend=true;s.autoAscendEnabled=${!!enabled};s.autoAscendTargetDepth=220;s.maxDepthEver=${high};s.comets=500;s.depth=s.enemyDepth=1;s.lastSeen=Date.now();b.install(s);if(b.save()!==true)throw Error('native fixture save');document.querySelector('[data-tab=ascend]').click();return b.get();})()`);}
async function prepare(){
 assert.equal(version,'143','known signed baseline143');assert.equal(sha(fs.readFileSync(apk)),'45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7','immutable signed143 bytes');
 await install();await identity();await launch();await bridge();const saved=await seed(10001,false);await disconnect();await adb.shell('am force-stop com.lumenfall.app');await launch();
 const cold=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert(cold.owned.autoascend&&!cold.autoAscendEnabled&&cold.autoAscendTargetDepth===220,'baseline cold launch retains ownership/OFF/219');
 const id=await identity();await screenshot('baseline143');fs.writeFileSync(path.join(out,'baseline-native.json'),JSON.stringify({status:'prepared',identity:id,saved,coldLaunch:{owned:cold.owned.autoascend,enabled:cold.autoAscendEnabled,target:cold.autoAscendTargetDepth}},null,2)+'\n');console.log('PASS prepared signed143 native preferences and cold launch');
}
async function accept(){
 const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline-native.json')));assert.equal(baseline.status,'prepared');await adb.shell('am force-stop com.lumenfall.app');
 if(mode==='resume'||mode==='finish'){
  const receipt=JSON.parse(fs.readFileSync(path.join(out,'native-update.json')));assert.equal(receipt.status,'pass');assert.equal(receipt.identity.installedApkSha256,sha(fs.readFileSync(apk)),'resume same feature APK');assert.equal(receipt.identity.sourceSha256,sha(fs.readFileSync(index)),'resume same exact source');assert.equal(receipt.baselineSha256,baseline.identity.installedApkSha256,'same prepared baseline');await identity();records.push(...receipt.records);await launch();
 }else{
 const beforePath=(await adb.shell('pm path com.lumenfall.app')).trim().replace(/^package:/,'');assert.equal(sha(await adb.exec('cat '+beforePath)),baseline.identity.installedApkSha256,'pre-update installed artifact equals prepared143');
 const before=await storage();const update=await install(),after=await storage();assert(before.equals(after),'signed update retains byte-identical actual save storage before first launch');records.push({case:'143 to feature APK in-place storage preservation',install:update,beforeSha256:sha(before),afterSha256:sha(after),bytes:before.length});
 await identity();await launch();const first=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert(first.owned.autoascend&&!first.autoAscendEnabled&&first.autoAscendTargetDepth===220,'first feature launch retains ownership/OFF/219');
 fs.writeFileSync(path.join(out,'native-update.json'),JSON.stringify({status:'pass',identity:await identity(),baselineSha256:baseline.identity.installedApkSha256,records:records.slice(),firstLaunch:{owned:first.owned.autoascend,enabled:first.autoAscendEnabled,target:first.autoAscendTargetDepth}},null,2)+'\n');console.log('PASS bound signed143 update/storage and first-launch preferences');
 }
 const id={...await identity(),ua:await evaluate('navigator.userAgent'),page:await evaluate('location.href')};assert(id.ua.includes('Chrome/61.0.3163.98'),'observed legacy WebView61');
 if(mode==='finish'){const core=JSON.parse(fs.readFileSync(path.join(out,'native-controls.json')));assert.equal(core.status,'pass');assert.equal(core.identity.installedApkSha256,id.installedApkSha256);assert.equal(core.identity.sourceSha256,id.sourceSha256);assert.deepEqual(core.runtimeErrors,[]);for(const name of ['actual native select/toggle 320','actual native select/toggle 390','actual native select/toggle 430','actual Android picker chooses 218','actual Android picker chooses 219','native accessible target label','native cold target persistence'])assert(core.records.some(r=>r.case===name),'completed exact-artifact core check '+name);for(const enabled of [true,false])assert(core.records.some(r=>r.case==='actual Android input commits9999 without toggling'&&r.enabled===enabled),'completed core typed target '+enabled);records.push(...core.records.filter(r=>!r.case.includes('in-place storage')));const cold=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert(cold.owned.autoascend&&!cold.autoAscendEnabled&&cold.autoAscendTargetDepth===10000,'continued native cold target/OFF retained');records.push({case:'continued native core receipt',driverSha256:core.driverSha256});}
 else{
 await bridge();
 for(const width of [320,390,430]){
  const result=await adb.shell('wm size '+width+'x844');assert(!/Error:/i.test(result));await until('innerWidth==='+width,'native width '+width,30000);await seed(220,false);
  const metrics=await evaluate(`(function(){var target=document.querySelector('[data-autoascend-target]');target.scrollIntoView({block:'center'});function check(v,m){if(!v)throw Error(m);}check(target.tagName==='SELECT'&&target.value==='219','single native Rift219 select');check(document.querySelectorAll('[data-autoascend-target]').length===1,'one target');check(!document.querySelector('[data-autoascend-find],[data-autoascend-earlier],[data-autoascend-later]'),'removed navigation');check(!document.querySelector('#shop-list [data-autoascend-toggle]'),'no Deeds toggle');var controls=Array.from(document.querySelectorAll('[data-autoascend-target],[data-autoascend-toggle]')).map(function(e){var r=e.getBoundingClientRect();check(r.width>=44&&r.height>=44,'44px native control');check(r.left>=0&&r.right<=innerWidth,'native control fits');return {width:r.width,height:r.height,text:e.value||e.textContent};});return {width:innerWidth,controls:controls};})()`);
  await inputFocus();await evaluate('document.querySelector("[data-autoascend-target]").focus()');await adb.shell('input keyevent KEYCODE_TAB');await until('document.activeElement.matches("[data-autoascend-toggle]")','Android Tab to toggle',10000);
  const focused=await evaluate('getComputedStyle(document.activeElement).outlineStyle');assert.notEqual(focused,'none');await adb.shell('input keyevent KEYCODE_SPACE');await until('__autoUiNative.get().autoAscendEnabled','Android keyboard ON',10000);await adb.shell('input keyevent KEYCODE_SPACE');await until('!__autoUiNative.get().autoAscendEnabled','Android keyboard OFF',10000);
  records.push({case:'actual native select/toggle '+width,metrics,outline:focused});await screenshot('native-'+width);
  if(width===390){await nativeSelect('218');await nativeSelect('219');}
 }
 for(const enabled of [true,false]){
 await evaluate('document.activeElement.blur()');await seed(10001,enabled);await evaluate('__autoUiNative.render();document.querySelector("[data-autoascend-target]").scrollIntoView({block:"center"});');
 assert.equal(await evaluate('document.querySelector("[data-autoascend-target]").tagName'),'INPUT','native high-history input');
 const tap=await tapControl();await until('document.activeElement.matches("[data-autoascend-target]")','actual Android input focuses target',10000);await evaluate('document.querySelector("[data-autoascend-target]").select()');const beforeInput=await evaluate('__autoUiNative.get()');await adb.shell('input text 9999');await adb.shell('input keyevent KEYCODE_ENTER');await until('__autoUiNative.get().autoAscendTargetDepth===10000','native high target input',10000);
 const afterInput=await evaluate('__autoUiNative.get()'),expectedInput={...beforeInput,autoAscendTargetDepth:10000,lastSeen:afterInput.lastSeen};assert.deepEqual(afterInput,expectedInput,'native target change preserves all other gameplay values');assert(await evaluate('localStorage.getItem("lumenfall_save_v2")===localStorage.getItem("lumenfall_save_recovery_v1")'),'native save and recovery identical');
 assert.equal(await evaluate('__autoUiNative.get().autoAscendEnabled'),enabled,'native typed target preserves ON/OFF');records.push({case:'actual Android input commits9999 without toggling',enabled,tap,value:await evaluate('document.querySelector("[data-autoascend-target]").value')});await adb.shell('input keyevent KEYCODE_BACK');
 }
 await send('DOM.enable');const dom=await send('DOM.getDocument'),node=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'[data-autoascend-target]'}),ax=await send('Accessibility.getPartialAXTree',{nodeId:node.nodeId});assert(ax.nodes.some(n=>n.name&&n.name.value.includes('Auto-Ascend after clearing')),'native accessible target label');records.push({case:'native accessible target label',nodes:ax.nodes});
 await evaluate('__autoUiNative.save()');await disconnect();await adb.shell('am force-stop com.lumenfall.app');await launch();const cold=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert(cold.owned.autoascend&&!cold.autoAscendEnabled&&cold.autoAscendTargetDepth===10000,'native target/OFF survives cold launch');records.push({case:'native cold target persistence',target:cold.autoAscendTargetDepth,enabled:cold.autoAscendEnabled});
 fs.writeFileSync(path.join(out,'native-controls.json'),JSON.stringify({status:'pass',phase:'completed update/controls/accessible label/cold persistence; native font/guards pending',driverSha256:sha(fs.readFileSync(__filename)),identity:id,records:records.slice(),runtimeErrors:errors},null,2)+'\n');
 }
 await disconnect();await adb.shell('settings put system font_scale 2.0');await adb.shell('am force-stop com.lumenfall.app');await launch();await bridge();await seed(220,false);
 for(const fixture of [{name:'OFF Push clear',enabled:false,mode:'push',kill:true,ascends:0},{name:'ON unbeaten Push',enabled:true,mode:'push',kill:false,ascends:0},{name:'ON Farm clear',enabled:true,mode:'farm',kill:true,ascends:0},{name:'ON Push clear',enabled:true,mode:'push',kill:true,ascends:1}]){
  await evaluate(`(function(){var b=__autoUiNative,s=b.fresh();s.owned.autoascend=true;s.autoAscendEnabled=${fixture.enabled};s.autoAscendTargetDepth=220;s.maxDepthEver=220;s.depth=s.enemyDepth=219;s.enemyMaxHp=b.enemyHp(219);s.enemyHp=${fixture.kill}?.001:s.enemyMaxHp;s.riftMode='${fixture.mode}';if(s.riftMode==='farm'){s.farmDepth=219;s.farmReturnDepth=220;}s.lastSeen=Date.now();b.install(s);window.__autoUiNow+=1000;b.tick();return true;})()`);
  const observed=await evaluate('__autoUiNative.get()');
  assert.equal(observed.ascendCount,fixture.ascends,fixture.name+' trigger');assert.equal(observed.autoAscendTargetDepth,220,'native trigger preserves target');assert.equal(observed.autoAscendEnabled,fixture.enabled,'native trigger preserves ON/OFF');if(fixture.kill)assert(observed.totalKills>0,'genuine native defeat');if(fixture.ascends)assert.equal(observed.depth,1,'native auto Ascend restarts Rift');records.push({case:'native cleared-Rift guard '+fixture.name,ascends:observed.ascendCount,kills:observed.totalKills,depth:observed.depth,target:observed.autoAscendTargetDepth});
 }
 await seed(220,false);
 const font=await evaluate('(function(){var controls=Array.from(document.querySelectorAll("[data-autoascend-target],[data-autoascend-toggle]")).map(function(e){var r=e.getBoundingClientRect();if(r.width<44||r.height<44||r.left<0||r.right>innerWidth)throw Error("native large-font control geometry");return {width:r.width,height:r.height,font:getComputedStyle(e).fontSize};});return {viewport:innerWidth,controls:controls};})()');records.push({case:'Android system font scale2',setting:(await adb.shell('settings get system font_scale')).trim(),...font});await screenshot('native-system-font2');await adb.shell('settings put system font_scale 1.0');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'native-acceptance.json'),JSON.stringify({status:'pass',driverSha256:sha(fs.readFileSync(__filename)),identity:id,records,runtimeErrors:errors,limitations:['Isolated API27 software emulator; actual WebView61, not physical or exact60.','Native accessibility tree is not TalkBack.','Actual Android system font setting is distinct from browser200% root text.','WebView61 lacks prefers-reduced-motion; modern reduced-motion coverage and physical/device checklist remain separate.']},null,2)+'\n');console.log('PASS native signed-APK Auto-Ascend controls/update/input/save acceptance');
}
(async()=>{try{assert(['prepare','accept','resume','finish'].includes(mode)&&apk&&index&&out&&/^\d+$/.test(version));fs.mkdirSync(out,{recursive:true});adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','isolated emulator only');await adb.shell('wm density 160');if(mode==='prepare')await prepare();else await accept();}catch(e){fs.writeFileSync(path.join(out,'native-'+mode+'-failure.json'),JSON.stringify({status:'fail',message:e.message,records,runtimeErrors:errors},null,2)+'\n');console.error(e.stack);process.exitCode=1;}finally{await disconnect();if(adb)adb.close();}})();

