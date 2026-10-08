'use strict';
// Real, unmodified signed APKs on a disposable API27 emulator only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const Adb=require('../rift-cast-text-001/finish/direct-adb.cjs');
const zip=require('../../../scripts/lib/zip.cjs');
const [baselineApk,targetApk,out,baselineSha,targetSha,mode]=process.argv.slice(2);
assert(!mode||['prepare','accept-prepared'].includes(mode),'optional mode: prepare or accept-prepared (requires a bound baseline receipt)');
assert(baselineApk&&targetApk&&out&&baselineSha&&targetSha,'baseline APK, target APK, output and both expected APK SHA256 digests required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),delay=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync(out,{recursive:true});
function artifact(file,expected){
 const bytes=fs.readFileSync(file);assert.equal(sha(bytes),expected,'provided APK matches expected published digest');
 const e=zip.verifyZip(bytes).find(e=>e.name==='assets/public/index.html');assert(e,'APK contains product');
 const at=e.offset+30+bytes.readUInt16LE(e.offset+26)+bytes.readUInt16LE(e.offset+28),compressed=bytes.subarray(at,at+e.compressed);
 const html=(e.method===0?compressed:zlib.inflateRawSync(compressed)).toString('utf8');
 return {file,apkSha256:expected,sourceSha256:sha(Buffer.from(html)),script:html.match(/<script>\s*([\s\S]*?)<\/script>/)[1]};
}
const baseline=artifact(baselineApk,baselineSha),target=artifact(targetApk,targetSha),records=[],runtimeErrors=[];
let adb,server,ws,seq=0,pauseResolve,scripts=[],liveBinding;const pending=new Map();
function send(method,params={}){assert(ws?.readyState===WebSocket.OPEN,'native CDP connection open: '+method);return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label,ms=120000){const start=Date.now();while(Date.now()-start<ms){if(await evaluate(expression))return;await delay(200);}throw Error(label+' timed out');}
async function disconnect(){if(ws){ws.close();ws=null;}if(server){for(const s of server.sockets)s.destroy();await new Promise(r=>server.close(r));server=null;}}
async function installed(expected){
 const p=(await adb.shell('pm path com.lumenfall.app')).trim().split('\n');assert.equal(p.length,1,'single installed APK');
 const file=p[0].replace(/^package:/,'');assert(/^\/data\/app\/[A-Za-z0-9_.=\/-]+\/base\.apk$/.test(file));
 const actual=sha(await adb.exec('cat '+file));assert.equal(actual,expected.apkSha256,'actual installed APK matches expected artifact');
 return {path:file,apkSha256:actual,sourceSha256:expected.sourceSha256};
}
async function connect(expected){
 console.log('native connect '+expected.apkSha256);
 await disconnect();scripts=[];let pid,page;const start=Date.now();
 while(Date.now()-start<120000){pid=(await adb.shell('pidof com.lumenfall.app')).trim();if(pid)break;await delay(500);}assert(pid,'native app PID');
 server=await adb.forward(9223,'localabstract:webview_devtools_remote_'+pid);
 while(Date.now()-start<120000){try{page=(await(await fetch('http://127.0.0.1:9223/json/list')).json()).find(x=>x.type==='page');}catch(_){}if(page)break;await delay(500);}assert(page,'native WebView page');
 ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onclose=()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('native CDP connection closed'));}pending.clear();};
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Debugger.paused'&&pauseResolve){const r=pauseResolve;pauseResolve=null;r(m.params);}else if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(m.params);};
 await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"&&!!document.querySelector(".rift-wisp")','native initialization');
 await installed(expected);
 const actual=await evaluate('Array.from(document.scripts).filter(function(s){return s.textContent.indexOf("function renderAscendSummary")!==-1;})[0].textContent');
 assert.equal(actual.trim(),expected.script.trim(),'unmodified native product script equals installed APK');
 await send('Debugger.enable');let product;
 for(const p of scripts.filter(p=>p.url==='https://localhost/')){const code=(await send('Debugger.getScriptSource',{scriptId:p.scriptId})).scriptSource;if(code.includes('function renderAscendSummary')){assert.equal(code.trim(),expected.script.trim());product={...p,code};break;}}
 assert(product,'private product script');
 function lineFor(name){const at=product.code.indexOf('function '+name+'(){');assert(at>=0);return product.startLine+product.code.slice(0,at).split('\n').length;}
 function paused(){return new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('native breakpoint timeout')),60000);pauseResolve=p=>{clearTimeout(t);resolve(p);};});}
 console.log('native source identity verified; capture actual closure');
 const initBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('init')}),initEvent=paused();await send('Page.reload');await initEvent;
 await evaluate("window.__f05Now=Date.now();Date.now=function(){return window.__f05Now;};var interval=window.setInterval;window.setInterval=function(fn,ms){return interval(function(){if(window.__f05Run)fn();},ms);};");
 await send('Debugger.removeBreakpoint',{breakpointId:initBp.breakpointId});
 const renderBp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:lineFor('renderRiftParty')}),renderEvent=paused();await send('Debugger.resume');const event=await renderEvent;
 const properties=[];for(const scope of event.callFrames[0].scopeChain.filter(sc=>sc.type==='closure'))properties.push(...(await send('Runtime.getProperties',{objectId:scope.object.objectId,ownProperties:true})).result);
 const names=['state','freshState','acceptPersistedState','restoreEnemyOrSpawn','renderAll','saveState','advanceAuthoritativeTime','enemyHpFor'];
 const handles=names.map(name=>{const p=properties.find(p=>p.name===name);assert(p?.value?.objectId,'actual private native handle '+name);return {objectId:p.value.objectId};});
 const injected=await send('Runtime.callFunctionOn',{objectId:handles[1].objectId,arguments:handles,functionDeclaration:"function(live,fresh,accept,restore,render,save,advance,enemy){window.__f05Native={rebind:function(next){live=next;},fresh:fresh,get:function(){return JSON.parse(JSON.stringify(live));},install:function(s){var next=accept(s,'f05-native');Object.keys(live).forEach(function(k){delete live[k];});Object.keys(next).forEach(function(k){live[k]=next[k];});restore();render();},render:render,save:save,advance:advance,enemy:enemy};}",returnByValue:true});
 if(injected.exceptionDetails)throw Error('native bridge: '+(injected.exceptionDetails.exception?.description||injected.exceptionDetails.text));
 await send('Debugger.removeBreakpoint',{breakpointId:renderBp.breakpointId});await send('Debugger.resume');
 await until('(function(){["startup-skip","tut-skip","welcome-claim","daily-claim"].forEach(function(id){var e=document.getElementById(id);if(e&&e.getClientRects().length)e.click();});return !!window.__f05Native&&__f05Native.save()===true;})()','native return flows settled');
 // Ascend/return may replace the canonical state object. Read it again through
 // the real closure before installing any subsequent synthetic QA fixture.
 console.log('native return flows settled');
 liveBinding={line:lineFor('renderRiftParty'),paused};await rebind();

}
async function rebind(){
 const bp=await send('Debugger.setBreakpointByUrl',{url:'https://localhost/',lineNumber:liveBinding.line}),waiting=liveBinding.paused(),rendering=evaluate('__f05Native.render()'),event=await waiting;
 const properties=[];for(const scope of event.callFrames[0].scopeChain.filter(sc=>sc.type==='closure'))properties.push(...(await send('Runtime.getProperties',{objectId:scope.object.objectId,ownProperties:true})).result);
 const state=properties.find(p=>p.name==='state');assert(state?.value?.objectId,'current native state handle');
 await send('Runtime.callFunctionOn',{objectId:state.value.objectId,functionDeclaration:'function(){window.__f05Native.rebind(this);}',returnByValue:true});
 await send('Debugger.removeBreakpoint',{breakpointId:bp.breakpointId});await send('Debugger.resume');await rendering;
}
async function fixture(c,b,t,l){await rebind();return evaluate(seed(c,b,t,l));}
function seed(c,b,t,l){return `(function(){var q=__f05Native,s=q.fresh();s.depth=${c+1};s.maxDepthEver=220;s.ascendRewardedDepth=${b};s.nodes.swift=${t};s.longStudyLevels.prismstudy=${l};s.prisms=100;s.owned.autoascend=true;s.autoAscendEnabled=false;s.autoAscendTargetDepth=${c+1};s.spirits.ember=1;s.activeParty=['ember'];Object.keys(s.empowerQueue).forEach(function(k){s.empowerQueue[k]=false;});s.enemyDepth=s.depth;s.enemyHp=s.enemyMaxHp=q.enemy(s.depth);s.questDay=new Date(Date.now()).toISOString().slice(0,10);q.install(s);return q.get();})()`;}
async function snapshot(){return adb.exec("run-as com.lumenfall.app tar -cf - app_webview");}
async function install(file){console.log('native signed install '+path.basename(file));await adb.upload(file,'/data/local/tmp/Lumenfall-f05.apk');const result=await adb.shell('pm install -r /data/local/tmp/Lumenfall-f05.apk');assert(result.includes('Success'),'signed in-place installation');return result;}
async function launch(){await adb.shell('am start -n com.lumenfall.app/.MainActivity');}
async function screenshot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));}
async function check(c,b,t,l){
 const full=Math.floor(2*Math.sqrt(c)*(1+t*.04)*(1+l*.05)),repeat=b>0?Math.max(1,Math.floor(full*.2)):0,progress=b<=0?full:c>b?Math.ceil((2*Math.sqrt(c)-2*Math.sqrt(b))*(1+t*.04)*(1+l*.05)):0,want=b<=0?full:Math.min(full,repeat+progress);
 await fixture(c,b,t,l);await evaluate('document.querySelector(".tab-btn[data-tab=ascend]").click()');
 const before=await evaluate('__f05Native.get()'),preview=await evaluate('document.getElementById("prism-preview").textContent');assert.equal(preview,'+'+want+' Prisms');
 assert((await evaluate('document.getElementById("prism-calculation").textContent')).includes('You receive now'+want+' Prisms'));
 await evaluate('__f05Native.render()');assert.deepEqual(await evaluate('__f05Native.get()'),before,'render is observer only');
 await evaluate('document.getElementById("ascend-btn").click()');await rebind();const after=await evaluate('__f05Native.get()');assert.equal(after.prisms-before.prisms,want,'real native manual click equals preview');
 const saved=await evaluate('JSON.parse(localStorage.getItem("lumenfall_save_v2"))');assert.equal(saved.prisms,after.prisms,'real manual payout saved');assert.equal(saved.ascendRewardedDepth,Math.max(c,b));
 const auto={};for(const kind of ['live','offline']){await fixture(c,b,t,l);const r=await evaluate(`(function(){__f05Native.get();var s=__f05Native.get();s.autoAscendEnabled=true;__f05Native.install(s);return __f05Native.advance(.001,{kind:'${kind}',visual:false,clockStartMs:Date.now()});})()`);assert.equal(r.ascends,1);assert.equal(r.ascendGains[0],want,'real native auto equals preview '+kind);auto[kind]=r.ascendGains[0];}
 return {cleared:c,benchmark:b,tree:t,completedLab:l,preview,manual:want,auto};
}
(async()=>{adb=await new Adb().connect();assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1','disposable emulator only');
 try{
  let cold,pre,before;
  if(mode==='accept-prepared'){
   const prepared=JSON.parse(fs.readFileSync(path.join(out,'baseline-receipt.json')));
   assert.equal(prepared.status,'prepared');assert.equal(prepared.baseline.apkSha256,baseline.apkSha256);assert.equal(prepared.baseline.sourceSha256,baseline.sourceSha256);
   assert.deepEqual(prepared.runtimeErrors,[]);pre=await installed(baseline);before=await snapshot();
   assert.equal(sha(before),prepared.storageSha256,'actual stopped baseline storage equals prepared cold-save receipt');assert.equal(before.length,prepared.storageBytes);
   cold={nodes:{swift:prepared.cold.tree},longStudyLevels:{prismstudy:prepared.cold.completedLab},ascendRewardedDepth:prepared.cold.benchmark,prisms:prepared.cold.prisms};
   console.log('PASS actual prepared baseline APK/storage identity before signed update');
  }else{
  await install(baseline.file);await launch();await connect(baseline);await fixture(20,219,17,18);assert(await evaluate('__f05Native.save()'));
  await adb.shell('am force-stop com.lumenfall.app');await launch();await connect(baseline);console.log('native baseline cold launch');cold=await evaluate('__f05Native.get()');assert.equal(cold.nodes.swift,17);assert.equal(cold.longStudyLevels.prismstudy,18);assert.equal(cold.ascendRewardedDepth,219);assert.equal(cold.prisms,100);
  await adb.shell('am force-stop com.lumenfall.app');await disconnect();pre=await installed(baseline);before=await snapshot();
  if(mode==='prepare'){fs.writeFileSync(path.join(out,'baseline-receipt.json'),JSON.stringify({status:'prepared',scope:'actual signed baseline cold save and transport calibration only; not F05 acceptance',baseline:{apkSha256:baseline.apkSha256,sourceSha256:baseline.sourceSha256},installed:pre,cold:{prisms:cold.prisms,benchmark:cold.ascendRewardedDepth,tree:cold.nodes.swift,completedLab:cold.longStudyLevels.prismstudy},storageBytes:before.length,storageSha256:sha(before),runtimeErrors},null,2)+'\n');console.log('PASS native baseline cold Prism save and transport; F05 acceptance pending');return;}
  }
  await install(target.file);const after=await snapshot();assert(before.equals(after),'actual private WebView storage byte-identical across signed update');records.push({case:'cold baseline and signed update preserve Prism save',cold:{prisms:cold.prisms,benchmark:cold.ascendRewardedDepth,tree:cold.nodes.swift,completedLab:cold.longStudyLevels.prismstudy},preUpdateIdentity:pre,storageBytes:before.length,beforeSha256:sha(before),afterSha256:sha(after)});
  await launch();await connect(target);const restored=await evaluate('__f05Native.get()');assert.equal(restored.nodes.swift,cold.nodes.swift,'first target launch preserves Swift');assert.equal(restored.longStudyLevels.prismstudy,cold.longStudyLevels.prismstudy,'first target launch preserves completed Clarity');for(const k of ['ascendRewardedDepth','prisms'])assert.equal(restored[k],cold[k],'first target launch preserves '+k);
  const identity={android:(await adb.shell('getprop ro.build.version.release')).trim(),api:(await adb.shell('getprop ro.build.version.sdk')).trim(),ua:await evaluate('navigator.userAgent'),installed:await installed(target),package:(await adb.shell('dumpsys package com.lumenfall.app')).split('\n').filter(x=>/versionCode=|versionName=/.test(x)).map(x=>x.trim())};
  for(const width of [320,390,430]){await adb.shell('wm density 160');await adb.shell('wm size '+width+'x844');await until('innerWidth==='+width,'native viewport '+width);const rows=[];for(const b of [0,19,219])for(const v of [[0,0],[1,0],[0,1],[17,18]])rows.push(await check(20,b,v[0],v[1]));rows.push(await check(16,15,0,0),await check(16,15,1,0));await fixture(20,219,17,18);await evaluate('document.querySelector(".tab-btn[data-tab=ascend]").click()');const layout=await evaluate('(function(){var d=document.getElementById("prism-calculation"),b=document.getElementById("ascend-btn"),r=b.getBoundingClientRect();return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,calculationWidth:d.scrollWidth,calculationClient:d.clientWidth,button:{width:r.width,height:r.height},description:b.getAttribute("aria-describedby")};})()');assert(layout.documentWidth<=width+1&&layout.calculationWidth<=layout.calculationClient+1,'native Prism layout has no horizontal overflow');assert(layout.button.height>=44&&layout.button.width>=44);assert(layout.description.includes('prism-calculation'));records.push({case:'native '+width+'px',rows,layout});await screenshot('native-'+width);console.log('PASS native '+width+'px, '+rows.length+' reward states');}
  await send('DOM.enable');const dom=await send('DOM.getDocument'),node=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'#ascend-btn'}),ax=await send('Accessibility.getPartialAXTree',{nodeId:node.nodeId});const button=ax.nodes.find(n=>n.role?.value==='button');assert(button&&button.name.value==='Ascend');assert(button.description?.value.includes('Tree and completed Lab bonuses'));records.push({case:'native accessible Ascend explanation',node:button});
  assert.deepEqual(runtimeErrors,[]);fs.writeFileSync(path.join(out,'native-receipt.json'),JSON.stringify({status:'pass',identity,baseline:{apkSha256:baseline.apkSha256,sourceSha256:baseline.sourceSha256},target:{apkSha256:target.apkSha256,sourceSha256:target.sourceSha256},records,runtimeErrors,limits:['Isolated API27 emulator; not physical device or TalkBack.','Engine generation/phone font profiles are separate receipts.','Synthetic states are not the user save or the historical +50 case.']},null,2)+'\n');console.log('PASS signed APK native Prism/update acceptance');
 }finally{await disconnect();adb.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'native-failure.json'),JSON.stringify({status:'fail',error:e.stack,baseline:{apkSha256:baseline.apkSha256,sourceSha256:baseline.sourceSha256},target:{apkSha256:target.apkSha256,sourceSha256:target.sourceSha256},records,runtimeErrors},null,2)+'\n');console.error(e.stack);process.exitCode=1;});
