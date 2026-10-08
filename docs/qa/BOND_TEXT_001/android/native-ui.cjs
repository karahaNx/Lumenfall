// Installed-APK UI and upgrade fixture. Uses global storage at DOMContentLoaded;
// Private bindings were unavailable from the tested older-WebView debugger frame.
// Test clock/interval guards and fixtures are never shipped. Isolated emulator only.
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../../..'),adb=process.env.LUMENFALL_QA_ADB,output=process.argv[2],baseline=process.argv.includes('--baseline');assert(adb&&output);
const source=fs.readFileSync(root+'/index.html','utf8'),catalog={};
vm.runInNewContext(source.slice(source.indexOf('var SPIRITS = ['),source.indexOf('var RESOURCE_COLORS =')),catalog);
const wisps=JSON.parse(JSON.stringify(catalog.SPIRITS)),bonds=JSON.parse(JSON.stringify(catalog.FORMATION_BONDS)),abilities=JSON.parse(JSON.stringify(catalog.ABILITY_DESC));
function android(...args){return cp.execFileSync(adb,['-s','emulator-5554',...args],{encoding:'utf8',timeout:120000});}
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws,seq=0,pauseResolve;const pending=new Map(),events=[],records=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label){const start=Date.now();while(Date.now()-start<180000){if(await evaluate(expression))return;await delay(150);}throw Error(label+' timeout');}
async function connect(){
 const pid=android('shell','pidof','com.lumenfall.app').trim();assert(pid);android('forward','tcp:9223','localabstract:webview_devtools_remote_'+pid);
 let target;const start=Date.now();
 while(Date.now()-start<180000&&!target){
  try{const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();target=pages.find(p=>p.type==='page'&&p.url.startsWith('https://localhost'));}catch{}
  if(!target)await delay(500);
 }
 assert(target,'native WebView ready within180s');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')events.push(m.params);else if(m.method==='Debugger.paused'&&pauseResolve){const r=pauseResolve;pauseResolve=null;r(m.params);}};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"','native initial load');
}
function fixture(ids,zero){
 const s=JSON.parse(fs.readFileSync(root+'/docs/qa/offline-autoascend-2026-10-07/device_backup.json','utf8'));
 s.depth=101;s.maxDepthEver=101;s.activeParty=ids.slice();s.owned={};s.achieved={};s.heroRarity={};s.wispModules={};s.wispUltimate={};
 s.formationPresets={push:ids.slice(),farm:ids.slice(),boss:ids.slice()};s.activeFormationPreset='';
 s.formationRebuild=zero?{members:ids.slice(),preset:'push'}:null;
 wisps.forEach(sp=>{s.spirits[sp.id]=10;s.heroRarity[sp.id]=3;s.wispModules[sp.id]=7;s.wispUltimate[sp.id]=false;});
 if(zero)s.spirits[zero]=0;delete s.enemyDepth;delete s.enemyHp;delete s.enemyMaxHp;return s;
}
async function loadFixture(ids,zero){
 const s=fixture(ids,zero),marker=String(Date.now())+'-'+ids.join('-')+'-'+zero;
 await send('Debugger.enable');await send('DOMDebugger.setEventListenerBreakpoint',{eventName:'DOMContentLoaded'});
 const paused=new Promise((r,j)=>{const t=setTimeout(()=>{pauseResolve=null;j(Error('DOMContentLoaded pause timeout'));},180000);pauseResolve=p=>{clearTimeout(t);r(p);};});
 await send('Page.reload');const p=await paused;
 const expression=`(function(){var s=${JSON.stringify(s)};s.lastSeen=Date.now();window.__nativeBondMarker=${JSON.stringify(marker)};window.__nativeBondErrors=[];window.setInterval=function(){return 0;};window.addEventListener('error',function(e){__nativeBondErrors.push(e.message);});window.addEventListener('unhandledrejection',function(e){__nativeBondErrors.push(String(e.reason));});var raw=JSON.stringify(s);localStorage.setItem('lumenfall_save_v2',raw);localStorage.setItem('lumenfall_save_recovery_v1',raw);localStorage.setItem('lumenfall_startup_intro_last',String(Date.now()));localStorage.removeItem('lumenfall_reset_pending_v1');})()`;
 const r=await send('Debugger.evaluateOnCallFrame',{callFrameId:p.callFrames[0].callFrameId,expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
 await send('DOMDebugger.removeEventListenerBreakpoint',{eventName:'DOMContentLoaded'});await send('Debugger.resume');await send('Debugger.disable');
 await until('window.__nativeBondMarker==='+JSON.stringify(marker)+'&&!!document.querySelector("[data-wisp-card=titan]")','fixture render');
 await evaluate(`document.querySelector('[data-tab=spirits]').click();document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});document.querySelectorAll('details').forEach(function(el){el.open=true;});document.querySelector('#encyclopedia-btn').click()`);
}
async function observe(){return evaluate(`({rows:Array.from(document.querySelectorAll('#bond-card .bond-row')).map(function(r){return {name:r.querySelector('.bond-name').textContent,partners:r.querySelector('.bond-req').textContent,active:r.classList.contains('active'),effect:r.querySelector('.bond-effect').textContent};}),encyclopedia:Array.from(document.querySelectorAll('#encyclopedia-content .ency-card')).filter(function(r){return !!r.querySelector('.ency-meta');}).map(function(r){return {name:r.querySelector('.ency-name').textContent,meta:r.querySelector('.ency-meta').textContent};}),abilities:Array.from(document.querySelectorAll('[data-wisp-card] .ability-desc')).map(function(r){return {id:r.closest('[data-wisp-card]').getAttribute('data-wisp-card'),text:r.textContent};}),errors:window.__nativeBondErrors})`);}
async function main(){
 assert.equal(android('shell','getprop','ro.kernel.qemu').trim(),'1');await connect();
 const identity={android:android('shell','getprop','ro.build.version.release').trim(),api:android('shell','getprop','ro.build.version.sdk').trim(),webview:android('shell','dumpsys','webviewupdate'),userAgent:await evaluate('navigator.userAgent'),package:android('shell','dumpsys','package','com.lumenfall.app').split('\n').filter(l=>/versionCode=|versionName=/.test(l)).map(l=>l.trim())};
 if(!baseline){
  const stored=await evaluate("JSON.parse(localStorage.getItem('lumenfall_save_v2'))");
  wisps.forEach(sp=>{assert.equal(stored.heroRarity[sp.id],3);assert.equal(stored.wispModules[sp.id],7);});
  records.push({case:'first launch after update preserves purchased tiers',rarity:stored.heroRarity,modules:stored.wispModules});
 }
 const selected=baseline?[bonds.find(b=>b.id==='duskguard')]:bonds;
 for(const bond of selected){
  for(const mode of baseline?['active']:['active','benched','zero']){
   await loadFixture(mode==='benched'?[bond.ids[0]]:bond.ids,mode==='zero'?bond.ids[1]:null);
   const actual=await observe(),row=actual.rows.find(r=>r.name.startsWith(bond.name));assert(row);assert.deepEqual(actual.errors,[]);
   if(baseline){assert(actual.abilities.find(a=>a.id==='stone').text.includes('Stone + Titan'));}
   else{
    const partners=bond.ids.map(id=>wisps.find(sp=>sp.id===id).name).join(' + ');
    assert.equal(row.partners,partners);assert.equal(actual.encyclopedia.find(c=>c.name===bond.name).meta,partners+' · '+bond.tag);assert.equal(row.active,mode==='active');assert.equal(row.effect,bond.effect);
    assert.equal(actual.abilities.length,8);actual.abilities.forEach(a=>assert.equal(a.text,abilities[wisps.find(sp=>sp.id===a.id).abilityType]));
   }
   records.push({bond:bond.id,mode,actual});console.log('PASS native '+bond.id+' '+mode);
  }
 }
 if(baseline){
  await evaluate("document.querySelector('[data-save-formation=push]').click()");
  const stored=await evaluate("JSON.parse(localStorage.getItem('lumenfall_save_v2'))");wisps.forEach(sp=>{assert.equal(stored.heroRarity[sp.id],3);assert.equal(stored.wispModules[sp.id],7);});
  records.push({case:'real Save Formation handler preserves legacy purchased tiers',rarity:stored.heroRarity,modules:stored.wispModules});
 }else{
  const expected=source.match(/<script>([\s\S]*?)<\/script>/)[1],actual=await evaluate("Array.from(document.scripts).find(function(s){return s.textContent.indexOf('var SPIRITS = [')!==-1;}).textContent");assert.equal(actual,expected);identity.loadedGameScriptSha256=crypto.createHash('sha256').update(actual).digest('hex');
  for(const scale of [1,2]){
   const result=await evaluate(`(function(){document.documentElement.style.fontSize='${scale*100}%';document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});var h=document.querySelector('.formation-help');h.open=true;return {scale:${scale},viewport:[innerWidth,innerHeight],controlHeight:h.querySelector('summary').getBoundingClientRect().height,rows:Array.from(document.querySelectorAll('#bond-card .bond-row')).map(function(row){row.scrollIntoView({block:'center'});var r=row.getBoundingClientRect(),p=row.querySelector('.bond-req').getBoundingClientRect();return {partner:row.querySelector('.bond-req').textContent,left:p.left,right:p.right,visible:r.top<innerHeight&&r.bottom>0};})};})()`);
   assert(result.controlHeight>=44);assert(result.rows.every(r=>r.visible&&r.left>=0&&r.right<=result.viewport[0]));records.push({case:'native text scale',result});
  }
  await evaluate('document.documentElement.style.fontSize="100%";document.querySelector("#bond-card").scrollIntoView({block:"start"})');fs.writeFileSync(path.join(path.dirname(output),'native-formation.png'),cp.execFileSync(adb,['-s','emulator-5554','exec-out','screencap','-p'],{timeout:120000}));
 }
 assert.equal(events.length,0);fs.writeFileSync(output,JSON.stringify({status:'PASS',identity,records,limitations:['isolated emulator; physical Android/WebView60/TalkBack remain separate','legacy save QA fixtures and interval guard; no native gameplay/timing claim']},null,2)+'\n');ws.close();console.log('PASS native '+(baseline?'baseline/save preparation':'F16 UI'));
}
main().catch(e=>{fs.writeFileSync(output,JSON.stringify({status:'FAIL',error:e.stack,records,events},null,2)+'\n');console.error(e.stack);if(ws)ws.close();process.exitCode=1;});
