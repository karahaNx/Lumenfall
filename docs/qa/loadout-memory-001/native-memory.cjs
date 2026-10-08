'use strict';
// Exact signed APK on the task-owned API27 emulator. Never edits APK assets.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const Adb=require('../rift-cast-text-001/finish/direct-adb.cjs');
const [mode,apk,index,out]=process.argv.slice(2),records=[],errors=[];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(r=>setTimeout(r,ms)),pending=new Map(),scripts=[];
let adb,server,ws,seq=0,pauseResolve;
const html=fs.readFileSync(index,'utf8'),productScript=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function send(method,params={}){return new Promise((resolve,reject)=>{
 const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},60000);
 pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));
});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label,timeout=120000){const start=Date.now();while(Date.now()-start<timeout){
 try{if(await evaluate(expression))return;}catch(e){if(!/context|undefined|null|navigated/i.test(e.message))throw e;}await delay(250);
 }throw Error(label+' timeout');}
async function disconnect(){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('native connection closed'));}pending.clear();if(ws){ws.close();ws=null;}if(server){for(const s of server.sockets)s.destroy();await new Promise(r=>server.close(r));server=null;}}
async function connect(){
 const start=Date.now();let pid,target;while(Date.now()-start<120000){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'app PID');
 server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
 while(Date.now()-start<120000){try{target=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(x=>x.type==='page');}catch{}if(target)break;await delay(500);}assert(target,'actual WebView target');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
 else if(m.method==='Debugger.paused'&&pauseResolve){const fn=pauseResolve;pauseResolve=null;fn(m.params);}
 else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);
 else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"&&!!document.querySelector("[data-mult]")','startup');
 assert.equal(await evaluate('location.href'),'https://localhost/');
 const actual=await evaluate('Array.from(document.scripts).filter(function(s){return s.textContent.indexOf("function renderResearch")!==-1;})[0].textContent');
 assert.equal(actual.trim(),productScript.trim(),'exact unmodified product script in installed APK');
}
async function dismiss(){
 for(let i=0;i<8;i++){await evaluate('(function(){["startup-skip","tut-skip","welcome-claim","daily-claim"].forEach(function(id){var el=document.getElementById(id);if(el&&el.getClientRects().length)el.click();});})()');await delay(500);}
}
async function installed(){const p=(await adb.shell('pm path com.lumenfall.app')).trim().replace(/^package:/,'');assert(p.startsWith('/data/app/'),'installed APK path');
 return {path:p,sha256:sha(await adb.exec('cat '+p))};}
async function install(){await adb.upload(apk,'/data/local/tmp/f25.apk');const r=await adb.shell('pm install -r /data/local/tmp/f25.apk');assert(/Success/.test(r),'signed package install succeeds: '+r);
 const actual=await installed();assert.equal(actual.sha256,sha(fs.readFileSync(apk)),'provided APK equals actual installed bytes');return actual;}
function fixture(legacy){const context=vm.createContext({document:{readyState:'loading',addEventListener(){}},window:{addEventListener(){}},console});
 vm.runInContext(productScript.replace("if(document.readyState==='loading'){","globalThis.fresh=freshState;\nif(document.readyState==='loading'){"),context);
 const s=JSON.parse(JSON.stringify(context.fresh()));s.questDay=new Date().toISOString().slice(0,10);s.lastSeen=Date.now();s.comets=125;s.prisms=17;s.motes=20;
 // Valid Farm Rift1 / return Rift2 prevents unrelated progression Deeds.
 // A zero return depth is normalized to Push and cannot isolate the wallet.
 s.depth=1;s.maxDepthEver=2;s.riftMode='farm';s.farmDepth=1;s.farmReturnDepth=2;s.savedLabMultiplier=25;
 if(legacy)s.owned={autoascend:true,rememberbulk:true,offline24:true,offline48:true};return s;}
// Seed only the isolated save while the native page is paused, then force-stop
// before old gameplay can overwrite it. The next real cold launch executes exact
// native init/normalization with no product bridge or clock edit.
async function seed(s){
 s.questDay=await evaluate('(function(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");})()');s.lastSeen=await evaluate('Date.now()');s.loginStreak=1;
 scripts.length=0;await send('Debugger.enable');let product;
 for(const p of scripts.filter(p=>p.url==='https://localhost/')){const r=await send('Debugger.getScriptSource',{scriptId:p.scriptId});if(r.scriptSource.includes('function renderResearch(){')){product={...p,code:r.scriptSource};break;}}
 assert(product,'private product script');const at=product.code.indexOf('function renderResearch(){');
 const bp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:product.startLine+product.code.slice(0,at).split('\n').length});
 let timer;const paused=new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('seeding breakpoint timeout')),60000);pauseResolve=resolve;});
 const reload=send('Page.reload').catch(()=>{});const p=await paused;clearTimeout(timer);console.log('Paused old page before fixture replacement');
 await evaluate('localStorage.setItem("lumenfall_save_v2",JSON.stringify('+JSON.stringify(s)+'));localStorage.setItem("lumenfall_save_recovery_v1",JSON.stringify('+JSON.stringify(s)+'));');
 console.log('Raw native test fixture written');await delay(1000);await adb.shell('am force-stop com.lumenfall.app');await disconnect();await reload;
 await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();await dismiss();
}
async function touch(selector){await evaluate('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"nearest"})');await delay(250);
 const r=await evaluate('(function(){var e=document.querySelector('+JSON.stringify(selector)+'),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,dpr:devicePixelRatio,top:screen.height-innerHeight,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})()');assert(r.hit,'native touch target '+selector);
 const windows=await adb.shell('dumpsys window windows'),frame=/Window #\d+ Window\{[^}]*StatusBar\}:[\s\S]*?mFrame=\[\d+,\d+\]\[\d+,(\d+)\]/.exec(windows);assert(frame,'native status-bar inset measured');
 await adb.shell('input tap '+Math.round(r.x*r.dpr)+' '+Math.round(r.y*r.dpr+Number(frame[1])));await delay(700);}
async function forge(){await touch('[data-tab="workshop"]');await touch('[data-tab="forge"]');}
async function slots(){return evaluate('({primary:JSON.parse(localStorage.getItem("lumenfall_save_v2")),recovery:JSON.parse(localStorage.getItem("lumenfall_save_recovery_v1"))})');}
async function checkChoice(value){const s=await slots();assert.equal(s.primary.savedLabMultiplier,value,'native primary choice');assert.equal(s.recovery.savedLabMultiplier,value,'native recovery choice');
 assert.equal(await evaluate('document.querySelector("[data-mult].active").dataset.mult'),String(value),'native selected choice');return s;}
async function storage(){return adb.exec('sh -c \'cd /data/data/com.lumenfall.app/app_webview/Default; tar -cf - "Local Storage"\'');}
async function coldStart(){await disconnect();await adb.shell('am force-stop com.lumenfall.app');await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();await dismiss();await forge();}
async function screenshot(name){const png=await adb.exec('screencap -p');assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','actual Android PNG');fs.writeFileSync(path.join(out,name+'.png'),png);}
async function main(){
 assert(['prepare','accept'].includes(mode));fs.mkdirSync(out,{recursive:true});adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','isolated emulator only');
 if(mode==='prepare'){
  let artifact;try{const found=await installed();if(found.sha256===sha(fs.readFileSync(apk)))artifact=found;}catch{}if(!artifact)artifact=await install();console.log('Verified actual signed baseline APK installed');await adb.shell('am force-stop com.lumenfall.app');await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();await dismiss();console.log('Baseline source/startup verified');await seed(fixture(true));console.log('Legacy fixture seeded');await forge();const s=await checkChoice(25);fs.writeFileSync(path.join(out,'seed-observation.json'),JSON.stringify(s,null,2));
  assert(s.primary.legacyCometPurchases.rememberbulk,'old entitlement archived');assert.equal(s.primary.comets,125);await coldStart();const cold=await checkChoice(25);assert(cold.primary.legacyCometPurchases.rememberbulk,'old ownership on real cold launch');
  await screenshot('baseline-143-forge');await disconnect();await adb.shell('am force-stop com.lumenfall.app');const raw=await storage();fs.writeFileSync(path.join(out,'baseline-storage.tar'),raw);
  fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify({status:'pass',artifact,sourceSHA256:sha(Buffer.from(html)),coldLaunchVerified:true,slots:cold,storageSHA256:sha(raw)},null,2));console.log('PASS signed143 baseline, legacy value and real cold restart');return;
 }
 const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json')));assert(baseline.coldLaunchVerified);assert.equal(baseline.artifact.sha256,'45d1032ae6e77362d3540db740c6cfbdc4d275f2e3f6b98f4cecb1229e3205e7','known signed143 baseline');assert.equal(baseline.sourceSHA256,'5c4b3dacfed70a25c4aed45496e84af7ae8efe310eed43ec002988e854d7091c','known143 source');assert.equal((await installed()).sha256,baseline.artifact.sha256,'actual installed baseline before update');
 const before=await storage();assert.equal(sha(before),baseline.storageSHA256,'attested baseline storage before update');const artifact=await install();assert.equal(sha(await storage()),sha(before),'native update preserves actual save database bytes');
 await adb.shell('am start -n com.lumenfall.app/.MainActivity');await connect();await dismiss();await forge();const legacy=await checkChoice(25);assert(legacy.primary.legacyCometPurchases.rememberbulk,'updated legacy entitlement');
 // Separate accepted F26 policy: old offline24/48 purchases refund140/160.
 // This fixture owns both, no Deep Reserves; F25 adds no memory refund.
 const expectedComets=baseline.slots.primary.comets+140+160;
 assert.equal(legacy.primary.offline12hRefund.comets,300,'documented F26 credit only');assert.equal(legacy.primary.comets,expectedComets);assert.equal(legacy.primary.prisms,17);
 // Real offline/live farming earns documented fixed Luminous Motes. Exact
 // pre-gameplay wallet preservation is covered by the pure production VM;
 // native database bytes must match before launch, then value cannot be lost.
 assert(legacy.primary.motes>=baseline.slots.primary.motes,'existing Motes preserved with real offline rewards');
 await coldStart();const repeated=await checkChoice(25);assert.equal(repeated.primary.comets,expectedComets,'F26 credit remains idempotent on native restart');
 records.push({case:'signed143 update preserves database/legacy ownership/wallet/preference; separate F26 credit once',baseline:baseline.artifact,artifact,cometsBefore:baseline.slots.primary.comets,cometsAfter:legacy.primary.comets,separateF26Credit:300,motesBefore:baseline.slots.primary.motes,motesAfter:legacy.primary.motes});
 await seed(fixture(false));await forge();let unowned=await checkChoice(25);assert(!unowned.primary.legacyCometPurchases.rememberbulk,'unowned native cold preference');
 for(const value of [1,5,10,25,50,100,'max']){await touch('[data-mult="'+value+'"]');await checkChoice(value);records.push({case:'native immediate primary/recovery choice',value});}
 await touch('[data-tab="research"]');await touch('[data-tab="battle"]');await forge();await checkChoice('max');await coldStart();await checkChoice('max');records.push({case:'screen switching and actual force-stop/restart preserve unowned Max'});
 for(const width of [320,390,430]){
  assert(!/Error/i.test(await adb.shell('wm size '+width+'x844')),'resize succeeds');await until('innerWidth==='+width,'native viewport',30000);await forge();
  const sizes=await evaluate('Array.from(document.querySelectorAll("[data-mult]")).map(function(e){var r=e.getBoundingClientRect();return {value:e.dataset.mult,width:r.width,height:r.height,left:r.left,right:r.right};})');
  for(const r of sizes)assert(r.width>=44&&r.height>=44&&r.left>=0&&r.right<=width,'44px fitted controls');records.push({case:'native geometry',width,sizes});await screenshot('native-'+width);
 }
 await evaluate('document.querySelector('+JSON.stringify('[data-mult="25"]')+').focus()');await adb.shell('input keyevent 62');await delay(500);await checkChoice(25);assert.notEqual(await evaluate('getComputedStyle(document.activeElement).outlineWidth'),'0px','visible native keyboard focus');records.push({case:'actual Android keyboard Space selects25x with focus'});
 await send('DOM.enable');const dom=await send('DOM.getDocument'),node=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'[data-mult="25"]'});const ax=await send('Accessibility.getPartialAXTree',{nodeId:node.nodeId});
 assert(ax.nodes.some(n=>n.role?.value==='button'&&n.name?.value.includes('25')),'native accessible button name');records.push({case:'native AX button name',nodes:ax.nodes});
 await touch('[data-tab="deeds"]');assert(await evaluate('!document.querySelector("[data-shop=rememberbulk]")&&!document.getElementById("shop-list").textContent.includes("Loadout Memory")'),'retired name and purchase absent');
 const identity=await evaluate('({ua:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio}})');identity.android=(await adb.shell('getprop ro.build.version.release')).trim();identity.api=(await adb.shell('getprop ro.build.version.sdk')).trim();
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'native.json'),JSON.stringify({status:'pass',artifact,baseline:baseline.artifact,sourceSHA256:sha(Buffer.from(html)),identity,records,runtimeErrors:errors,limitations:['Task-owned software emulator; no physical/TalkBack acceptance.','Actual WebView version is recorded; V8 6.0 and modern reduced-motion/text fixtures are separate checks.']},null,2));console.log('PASS exact signed APK native memory/update/handlers/restart/accessibility');
}
(async()=>{try{await main();}finally{await disconnect();if(adb)adb.close();}})().catch(e=>{console.error(e.stack);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,mode+'-failure.json'),JSON.stringify({status:'fail',error:e.stack,records,runtimeErrors:errors},null,2));process.exitCode=1;});
