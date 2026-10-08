'use strict';
// Real signed APK on an isolated AOSP emulator only. No APK asset instrumentation.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const Adb=require('../../rift-cast-text-001/finish/direct-adb.cjs');
const [mode,apk,out]=process.argv.slice(2),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),delay=ms=>new Promise(r=>setTimeout(r,ms));
let adb,server,ws,seq=0,pausedResolve,template;const pending=new Map(),scripts=[],errors=[],records=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label){const start=Date.now();while(Date.now()-start<120000){if(await evaluate(expression))return;await delay(200);}throw Error(label+' timed out');}
async function disconnect(){if(ws){ws.close();ws=null;}if(server){for(const s of server.sockets)s.destroy();await new Promise(r=>server.close(r));server=null;}}
async function connect(){
 let pid,target;const start=Date.now();while(Date.now()-start<120000){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'native app PID');
 server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
 while(Date.now()-start<120000){try{target=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(x=>x.type==='page');}catch(_){}if(target)break;await delay(500);}assert(target,'actual WebView page');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.paused'&&pausedResolve){const r=pausedResolve;pausedResolve=null;r(m.params);}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete" && !!document.getElementById("theme-list")','native initialization');
}
async function identity(expected=apk){const p=(await adb.shell('pm path com.lumenfall.app')).trim().replace(/^package:/,'');assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(p));const hash=sha(await adb.exec('cat '+p));if(expected)assert.equal(hash,sha(fs.readFileSync(expected)),'actual installed APK equals supplied signed artifact');return {apkSha256:hash,android:(await adb.shell('getprop ro.build.version.release')).trim(),api:(await adb.shell('getprop ro.build.version.sdk')).trim(),package:(await adb.shell('dumpsys package com.lumenfall.app')).split('\n').filter(x=>/versionCode=|versionName=/.test(x)).map(x=>x.trim()),ua:await evaluate('navigator.userAgent'),url:await evaluate('location.href')};}
async function screenshot(name){fs.writeFileSync(path.join(out,name+'.png'),await adb.exec('screencap -p'));}
async function dismiss(){await evaluate(`(function(){['startup-skip','tut-skip','welcome-claim','daily-claim'].forEach(function(id){var e=document.getElementById(id);if(e&&e.getClientRects().length)e.click();});})()`);await delay(700);}
async function fixtureClock(){
 const prelude='(function(){var now=Date.now(),interval=window.setInterval;Date.now=function(){return now;};window.setInterval=function(fn,ms){return interval(function(){if(window.__f24Run)fn();},ms);};})();';
 try{await send('Page.addScriptToEvaluateOnNewDocument',{source:prelude});}catch(e){if(!e.message.includes('-32601'))throw e;await send('Page.addScriptToEvaluateOnLoad',{scriptSource:prelude});}
}
async function fixturesFromCanonicalSave(){
 const current=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');
 if(['d50','asc5','mythic','d250','modulemax'].every(id=>current.achieved[id])&&current.owned.rifttrail&&current.owned.starfallcrest&&current.cometCosmetics.trail&&current.cometCosmetics.crest){template=current;await fixtureClock();return;}
 await bridge();
}
async function bridge(){
 scripts.length=0;await send('Debugger.enable');let product,code;
 for(const p of scripts.filter(p=>p.url==='https://localhost/')){const r=await send('Debugger.getScriptSource',{scriptId:p.scriptId});if(r.scriptSource.includes('function renderCosmetics')){product=p;code=r.scriptSource;break;}}assert(product,'actual private product script');
 function lineFor(name){const at=code.indexOf('function '+name+'(){');assert(at>=0);return product.startLine+code.slice(0,at).split('\n').length;}
 function paused(){return new Promise((r,j)=>{const t=setTimeout(()=>j(Error('native breakpoint timeout')),60000);pausedResolve=p=>{clearTimeout(t);r(p);};});}
 const init=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('init')}),initial=paused();await send('Page.reload');await initial;
 await evaluate(`(function(){var now=Date.now(),interval=window.setInterval;Date.now=function(){return now;};window.setInterval=function(fn,ms){return interval(function(){if(window.__f24Run)fn();},ms);};})()`);
 await send('Debugger.removeBreakpoint',{breakpointId:init.breakpointId});const bp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('renderCosmetics')}),event=paused();await send('Debugger.resume');const p=await event,properties=[];
 for(const sc of p.callFrames[0].scopeChain.filter(x=>x.type==='closure'))properties.push(...(await send('Runtime.getProperties',{objectId:sc.object.objectId,ownProperties:true})).result);
 const names=['freshState','acceptPersistedState','RIFT_THEMES'],handles=names.map(name=>{const p=properties.find(p=>p.name===name);assert(p?.value?.objectId,'native private handle '+name);return {objectId:p.value.objectId};});
 const r=await send('Runtime.callFunctionOn',{objectId:handles[0].objectId,arguments:handles,functionDeclaration:'function(fresh,accept,catalog){var s=fresh();s.maxDepthEver=501;s.owned.rifttrail=true;s.owned.starfallcrest=true;s.cometCosmetics={trail:true,crest:true};s.comets=640;s.owned.offline24=true;catalog.forEach(function(t){if(t.unlockAchievement)s.achieved[t.unlockAchievement]=true;});return accept(s,"native-qa");}',returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception.description);template=r.result.value;assert(template.achieved.d50&&template.cometCosmetics.trail);
 await send('Debugger.removeBreakpoint',{breakpointId:bp.breakpointId});await send('Debugger.resume');await send('Debugger.disable');await until('document.readyState==="complete"','native bridge complete');
 // Freeze only QA simulation intervals in subsequent real page loads.
 await fixtureClock();

}
async function fixture(kind,theme='default'){
 const state=JSON.parse(JSON.stringify(template));state.riftTheme=theme;state.depth=kind==='boss'?30:kind==='luminous'?31:1;state.enemyDepth=state.depth;state.enemyMaxHp=state.enemyHp=100;state.enemyIsLuminous=kind==='luminous';state.lastSeen=Date.now();
 // Use the game's actual backup restore and reload guard. Direct storage writes
 // are overwritten by the old WebView's visibility/unload autosave callbacks.
 const backup='LUMENFALL1:'+encodeURIComponent(JSON.stringify(state)),token=Math.random().toString();
 await evaluate('window.__fixtureToken='+JSON.stringify(token)+';document.getElementById("save-backup-code").value='+JSON.stringify(backup)+';document.getElementById("restore-save-backup").click();var confirm=document.getElementById("save-restore-confirm-btn");if(confirm&&getComputedStyle(document.getElementById("save-restore-confirm")).display!=="none")confirm.click();');
 try{await until('window.__fixtureToken!=='+JSON.stringify(token)+' && document.readyState==="complete" && document.querySelectorAll("[data-theme-select]").length===6','real canonical fixture reload');}catch(e){throw Error(e.message+' '+JSON.stringify(await evaluate('(function(){var s=JSON.parse(localStorage.getItem("lumenfall_save_v2"));return {ready:document.readyState,buttons:document.querySelectorAll("[data-theme-select]").length,depth:s.depth,maxDepth:s.maxDepthEver,achieved:s.achieved,toast:document.getElementById("toast").textContent};})()')));}
 for(let i=0;i<3;i++)await dismiss();await evaluate('document.querySelector("[data-tab=battle]").click()');await delay(500);
 const rendered=await evaluate('(function(){var g=document.getElementById("enemy-glyph");return {boss:g.classList.contains("boss"),luminous:g.classList.contains("luminous")};})()');
 assert.equal(rendered.boss,kind==='boss','actual native boss state');assert.equal(rendered.luminous,kind==='luminous','actual native Luminous state');
}
async function select(theme){await evaluate('document.querySelector("[data-theme-select='+theme+']").click()');await until('JSON.parse(localStorage.getItem("lumenfall_save_v2")).riftTheme==='+JSON.stringify(theme),'actual selection persisted');}
async function run(){
 fs.mkdirSync(out,{recursive:true});adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','isolated emulator only');
 if(mode==='prepare'){
  await adb.shell('am force-stop com.lumenfall.app');await adb.shell('am start -n com.lumenfall.app/.MainActivity');
  await connect();const id=await identity();console.log('Actual native runtime: '+id.ua);assert(id.package.some(x=>x.includes('versionName=0.1.143')));await fixturesFromCanonicalSave();console.log('Canonical template and isolated QA clock ready');await fixture('normal','ember');console.log('Canonical earned fixture loaded through native initialization');const saved=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert.equal(saved.riftTheme,'ember');assert(saved.cometCosmetics.trail&&saved.cometCosmetics.crest);await screenshot('baseline-143-selected');
  await disconnect();await adb.shell('am force-stop com.lumenfall.app');await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();const cold=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert.equal(cold.riftTheme,'ember');assert(cold.cometCosmetics.trail&&cold.cometCosmetics.crest);fs.writeFileSync(path.join(out,'baseline-native.json'),JSON.stringify({status:'prepared',identity:id,saved,cold},null,2)+'\n');console.log('PASS signed143 cosmetic fixture survives actual native cold launch');return;
 }
 assert.equal(mode,'accept');const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline-native.json')));assert.equal(baseline.status,'prepared');await connect();const installed=await identity(null);assert.equal(installed.apkSha256,baseline.identity.apkSha256,'baseline APK is installed before update');const beforeUpdate=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert.equal(beforeUpdate.riftTheme,'ember');await disconnect();await adb.shell('am force-stop com.lumenfall.app');
 await adb.upload(apk,'/data/local/tmp/rift-final.apk');const install=await adb.shell('pm install -r /data/local/tmp/rift-final.apk');assert(install.includes('Success'),'signed update succeeds without clearing data');await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();const id=await identity();await until('(function(){var e=document.querySelector("[data-theme-select=ember]");if(!e)return false;e.click();return JSON.parse(localStorage.getItem("lumenfall_save_v2")).lastSeen>'+beforeUpdate.lastSeen+';})()','updated runtime canonical save');const saved=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert.equal(saved.riftTheme,'ember');assert.deepEqual(saved.owned,beforeUpdate.owned);assert.deepEqual(saved.legacyCometPurchases,beforeUpdate.legacyCometPurchases);assert.deepEqual(saved.cometTrialMarks,beforeUpdate.cometTrialMarks);assert.deepEqual(saved.achieved,beforeUpdate.achieved);assert.deepEqual(saved.cometCosmetics,beforeUpdate.cometCosmetics);assert.equal(saved.comets,beforeUpdate.comets);records.push({case:'signed update and cold launch preserve selection, ownership, legacy purchases, Trial marks, unlocks, equipment and Comets',install,beforeUpdate,afterUpdate:saved});
 await until('document.getElementById("enemy-stage").getAttribute("data-rift-theme")==="ember"','cold launch reapplies Ember');await screenshot('native-update-ember');await fixturesFromCanonicalSave();
 for(const width of [320,390,430]){
  await disconnect();await adb.shell('wm size '+width+'x844');await delay(1000);await connect();
  for(const kind of ['normal','boss','luminous']){
   // Reload a canonical QA save through the unchanged native initialization.
   await fixture(kind);
   const geometry=await evaluate(`(function(){var out={};['enemy-stage','hp-text','enemy-name'].forEach(function(id){var r=document.getElementById(id).getBoundingClientRect();out[id]=[r.x,r.y,r.width,r.height];});return out;})()`);
   for(const theme of ['default','ember','void','aurora','solar','radiant']){
    await select(theme);const m=await evaluate(`(function(){var s=document.getElementById('enemy-stage'),a=s.querySelector('.rift-cosmetic-aura'),c=document.getElementById('rift-cosmetic-name'),r=s.getBoundingClientRect(),hp=document.getElementById('hp-text').getBoundingClientRect(),rect=c.getBoundingClientRect(),patterns=Array.from(a.querySelectorAll('.cosmetic-pattern')).filter(function(g){return getComputedStyle(g).display!=='none';}),geometry={};['enemy-stage','hp-text','enemy-name'].forEach(function(id){var x=document.getElementById(id).getBoundingClientRect();geometry[id]=[x.x,x.y,x.width,x.height];});var ar=a.getBoundingClientRect();return {auraBox:[ar.x,ar.y,ar.width,ar.height],patternWidth:patterns.length?patterns[0].getBoundingClientRect().width:0,selected:s.getAttribute('data-rift-theme'),patterns:patterns.map(function(g){return g.getAttribute('class');}),pointer:getComputedStyle(a).pointerEvents,hidden:a.getAttribute('aria-hidden'),hpClear:hp.top>=r.bottom-1&&rect.bottom<=r.bottom,tap:r.width>=44&&r.height>=44,geometry,trail:getComputedStyle(s.querySelector('.comet-trail')).display,crest:getComputedStyle(s.querySelector('.comet-crest')).display,saved:JSON.parse(localStorage.getItem('lumenfall_save_v2')).riftTheme};})()`);
    assert.equal(m.selected,theme);assert.equal(m.saved,theme);assert.equal(m.patterns.length,theme==='default'?0:1);if(theme!=='default')assert(m.patterns[0].includes('cosmetic-'+theme));assert(m.auraBox[2]>60&&m.auraBox[3]>60);if(theme!=='default')assert(m.patternWidth>60,'rendered native aura geometry');assert.equal(m.pointer,'none');assert.equal(m.hidden,'true');assert(m.hpClear&&m.tap);assert.notEqual(m.trail,'none');assert.notEqual(m.crest,'none');assert.deepEqual(m.geometry,geometry);records.push({width,kind,theme,...m});if(kind==='boss'&&theme==='radiant')await screenshot('native-'+width+'-radiant');
   }
  }
 }

 await disconnect();await adb.shell('settings put system font_scale 2');await delay(1000);await connect();await fixture('boss');await select('radiant');
 const large=await evaluate('(function(){var c=document.getElementById("rift-cosmetic-name").getBoundingClientRect(),s=document.getElementById("enemy-stage").getBoundingClientRect(),hp=document.getElementById("hp-text").getBoundingClientRect();return {rootFont:getComputedStyle(document.documentElement).fontSize,captionFont:getComputedStyle(document.getElementById("rift-cosmetic-name")).fontSize,viewport:[innerWidth,innerHeight],hpClear:hp.top>=s.bottom-1&&c.bottom<=s.bottom,tap:s.width>=44&&s.height>=44};})()');assert(large.hpClear&&large.tap);records.push({case:'real Android font_scale 2',...large});await screenshot('native-font-scale-2');
 // Physical Android input coordinates come from the actual WebView bounds.
 await fixture('normal');await select('radiant');
 const treeCommand=await adb.shell('uiautomator dump /data/local/tmp/rift-touch.xml');assert(treeCommand.includes('dumped'),'native accessibility bounds available');
 const tree=await adb.shell('cat /data/local/tmp/rift-touch.xml');fs.writeFileSync(path.join(out,'native-touch-tree.xml'),tree);
 const bounds=tree.match(/<node[^>]*class="android\.webkit\.WebView"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);assert(bounds,'native WebView bounds');
 const tap=await evaluate('(function(){var r=document.getElementById("enemy-stage").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:innerWidth,height:innerHeight,hp:Number(document.getElementById("hp-text").textContent.split("/")[0].trim())};})()');
 assert(Number.isFinite(tap.hp)&&tap.hp>0);const frame=bounds.slice(1).map(Number),x=Math.round(frame[0]+tap.x*(frame[2]-frame[0])/tap.width),y=Math.round(frame[1]+tap.y*(frame[3]-frame[1])/tap.height);
 await adb.shell('input tap '+x+' '+y);await delay(500);const afterTap=await evaluate('Number(document.getElementById("hp-text").textContent.split("/")[0].trim())');assert(afterTap<tap.hp,'actual Android tap reaches attack through Radiant aura');records.push({case:'actual Android tap through Radiant aura',frame,x,y,before:tap.hp,after:afterTap});
 await evaluate('document.querySelector("[data-tab=deeds]").click();document.querySelector("[data-theme-select=ember]").focus()');
 const focus=(await adb.shell('dumpsys window windows')).split('\n').find(x=>x.includes('mCurrentFocus='));assert(focus&&focus.includes('com.lumenfall.app'),'native app input focus');await adb.shell('input keyevent KEYCODE_ENTER');await until('JSON.parse(localStorage.getItem("lumenfall_save_v2")).riftTheme==="ember"','real Android Enter selects Ember');
 const keyboard=await evaluate('(function(){var e=document.querySelector("[data-theme-select=ember]");return {focus:document.activeElement===e,pressed:e.getAttribute("aria-pressed"),height:e.getBoundingClientRect().height,outline:getComputedStyle(e).outlineStyle};})()');assert(keyboard.focus&&keyboard.pressed==='true'&&keyboard.height>=44&&keyboard.outline!=='none');records.push({case:'actual Android Enter, retained focus and 44px control',...keyboard});await screenshot('native-large-text-deeds');
 await disconnect();await adb.shell('settings put system font_scale 1');
 assert.deepEqual(errors,[],'no native browser exceptions');fs.writeFileSync(path.join(out,'native-acceptance.json'),JSON.stringify({status:'pass',identity:id,records,limitations:['Isolated software emulator; Android/API/WebView are attested in identity, not physical Android or TalkBack.','Reduced-motion is covered by the browser matrix; these older WebViews predate the media-query support.']},null,2)+'\n');console.log('PASS signed APK native update and 54 theme/state/mobile observations');
}
run().catch(e=>{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,mode+'-failure.json'),JSON.stringify({status:'fail',error:e.stack,records,errors},null,2)+'\n');console.error(e);process.exitCode=1;}).finally(async()=>{await disconnect();for(const p of pending.values())clearTimeout(p.timer);if(adb)adb.close();});
