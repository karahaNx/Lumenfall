#!/usr/bin/env node
'use strict';
// Actual Chromium layout/input. Freeze timers, not purchase/payout functions.
// Browser evidence is not Android/WebView/TalkBack acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {spawn,spawnSync}=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),sourcePath=path.resolve(process.argv[2]||path.join(root,'index.html'));
const evidence=path.resolve(process.argv[3]||'prism-acceptance-evidence'),source=fs.readFileSync(sourcePath,'utf8');
const chrome=process.env.LUMENFALL_QA_CDP_CHROME||['google-chrome','google-chrome-stable','chromium','chromium-browser'].find(x=>spawnSync('which',[x]).status===0);
const {reward}=require('./prism-earning-reference.cjs');
const bridge=String.raw`
window.prismQa={
 initialized:function(){return !!els['toast'];},get:function(){return JSON.parse(JSON.stringify(state));},
 seed:function(c,b,t,l){var s=freshState();s.depth=c+1;s.maxDepthEver=Math.max(250,c+1,b+1);s.ascendRewardedDepth=b;
 s.nodes.swift=t;s.longStudyLevels.prismstudy=l;s.prisms=1000;s.owned.autoascend=true;s.autoAscendEnabled=false;
 s.autoAscendTargetDepth=200;s.questDay=todayStr();s.lastSeen=Date.now();s.spirits.ember=1;s.activeParty=['ember'];
 SPIRITS.forEach(function(sp){s.empowerQueue[sp.id]=false;});return s;},
 set:function(s){state=acceptPersistedState(s);renderAll();},refresh:renderAscendSummary,tab:activateTab,
 ready:function(){if(startupIntroFinish)startupIntroFinish();document.querySelectorAll('.overlay,#startup-intro').forEach(function(e){e.style.display='none';});
 document.querySelector('.shell').inert=false;isNewGame=false;els['toast'].classList.remove('show');activateTab('ascend');},
 breakdown:ascendPrismBreakdown,keys:function(){return [SAVE_KEY,RECOVERY_SAVE_KEY];}
};`;
const prelude=`<script>window.__prismErrors=[];window.__prismInput=[];['keydown','keyup','click'].forEach(function(type){document.addEventListener(type,function(e){__prismInput.push({type:type,key:e.key,target:e.target.outerHTML&&e.target.outerHTML.slice(0,200),trusted:e.isTrusted});},true);});window.addEventListener('error',function(e){__prismErrors.push(e.message);});window.addEventListener('unhandledrejection',function(e){__prismErrors.push(String(e.reason));});window.setInterval=function(){return 0;};window.requestAnimationFrame=function(){return 0;};localStorage.setItem('lumenfall_startup_intro_last',String(Date.now()));</script>`;
const marker='\n})();\n</script>\n<script>\nif(window.Capacitor';assert.equal(source.split(marker).length,2);
const html=source.replace('<head>','<head>'+prelude).replace(marker,'\n'+bridge+marker);
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/'||name==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
 const f=path.resolve(path.dirname(sourcePath),'.'+name);if(!f.startsWith(path.dirname(sourcePath)+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.statusCode=404;res.end();return;}
 res.setHeader('Content-Type',f.endsWith('.css')?'text/css':f.endsWith('.woff2')?'font/woff2':f.endsWith('.svg')?'image/svg+xml':'application/octet-stream');fs.createReadStream(f).pipe(res);
});
let browser,session,buffer='',seq=0,closed=false,stderr='',profile,completion;const pending=new Map(),records=[];let checks=0;
function ok(v,m){checks++;assert(v,m);}
function rejectAll(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP deadline '+method));},30000);pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){const deadline=Date.now()+10000;while(Date.now()<deadline){if(await ev('!!window.prismQa&&prismQa.initialized()')){await ev('prismQa.ready()');return;}await pause(30);}throw Error('Game initialization deadline');}
async function point(selector){return ev(`(function(){var e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');e.scrollIntoView({block:'center'});var r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);if(!h||!(h===e||e.contains(h)))throw Error('input obscured: '+e.outerHTML);if(r.width<44||r.height<44)throw Error('input below44px');return {x:x,y:y};})()`);}
async function tap(selector){const p=await point(selector);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(50);}
async function key(key,code,n){
 // Enter must include its text/keypress event; rawKeyDown is for non-text keys.
 await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:n,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n});
}
async function shot(name){const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(evidence,name+'.png'),Buffer.from(s.data,'base64'));}
async function run(){
 assert(chrome,'supported Chromium required');fs.mkdirSync(evidence,{recursive:true});
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'prism-acceptance-'));
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 completion=new Promise(r=>{browser.once('error',e=>{rejectAll(e.message);r({error:e.message});});browser.once('close',(code,signal)=>{closed=true;rejectAll('browser closed');r({code,signal});});});
 browser.stderr.on('data',b=>stderr=(stderr+b).slice(-8000));for(const s of [browser.stdio[3],browser.stdio[4]])s.on('error',e=>rejectAll(e.message));
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 for(const width of [320,390,430])for(const scale of [1,2])for(const motion of ['no-preference','reduce']){
  const context=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/index.html'});await ready();
  // Wait for the real 430ms intro completion before replacing the test fixture.
  await pause(500);await ready();await ev('document.fonts.ready.then(()=>true)');
  await ev(`document.documentElement.style.fontSize=${JSON.stringify(16*scale+'px')}`);
  const samples=[];
  for(const [c,b,t,l] of [[14,0,0,0],[20,0,7,0],[20,89,7,0],[119,89,7,0],[25,0,10,10],[1000000,1000000,100,100]]){
   await ev(`prismQa.set(prismQa.seed(${c},${b},${t},${l}));prismQa.ready()`);const before=await ev('JSON.stringify(prismQa.get())');
   const measured=await ev(`(function(){var scope=document.getElementById('tab-ascend'),nodes=scope.querySelectorAll('#prism-preview,#prism-calculation,#prism-calculation dt,#prism-calculation dd,#ascend-note,#ascend-btn,[data-autoascend-target],[data-autoascend-toggle]');var failures=[];nodes.forEach(function(e){var r=e.getBoundingClientRect();if(r.width<=0||r.height<=0||r.left<-.5||r.right>innerWidth+.5||e.scrollWidth>e.clientWidth+1)failures.push({tag:e.tagName,id:e.id,text:e.textContent.slice(0,70),left:r.left,right:r.right,width:r.width,scroll:e.scrollWidth,client:e.clientWidth});});return {failures:failures,preview:document.getElementById('prism-preview').textContent,detail:document.getElementById('prism-calculation').textContent,disabled:document.getElementById('ascend-btn').disabled,bodyWidth:document.body.scrollWidth,inner:innerWidth};})()`);
   ok(measured.failures.length===0,'clipping '+JSON.stringify({width,scale,motion,c,failures:measured.failures}));ok(measured.bodyWidth<=measured.inner+1,'no horizontal overflow');
   ok(measured.disabled===(c<15),'correct eligibility');ok(measured.detail.includes('You receive now'+reward(c,b,t,l)+' Prisms'),'exact oracle in visible explanation');
   await ev('prismQa.refresh()');ok(await ev('JSON.stringify(prismQa.get())')===before,'render never changes save');samples.push({c,b,t,l,reward:reward(c,b,t,l)});
  }
  await ev('prismQa.set(prismQa.seed(20,89,7,0));prismQa.ready()');await shot('prism-'+width+'-'+scale+'-'+motion);
  const picker='[data-autoascend-target]';await point(picker);await ev(`document.querySelector('${picker}').focus();window.__prismPicker=document.activeElement;window.__prismScroll=document.querySelector('main').scrollTop;prismQa.refresh()`);
  ok(await ev("document.activeElement===window.__prismPicker&&Math.abs(document.querySelector('main').scrollTop-window.__prismScroll)<=1"),'refresh retains picker and scroll');
  const previous=await ev('prismQa.get().autoAscendTargetDepth');await key('ArrowDown','ArrowDown',40);await key('Tab','Tab',9);
  ok(await ev('prismQa.get().autoAscendTargetDepth')===previous+1,'real keyboard changes saved Rift target');
  await tap('[data-autoascend-toggle]');ok(await ev('prismQa.get().autoAscendEnabled')===true,'real touch toggles ON');
  await ev("document.querySelector('[data-autoascend-toggle]').focus()");await key('Enter','Enter',13);ok(await ev('prismQa.get().autoAscendEnabled')===false,'keyboard toggles OFF');
  await tap('#ascend-btn');ok(await ev('prismQa.get().prisms')===1004,'real touch awards four Prisms once');ok(await ev('prismQa.get().ascendCount')===1,'one Ascend');
  ok(await ev("prismQa.keys().map(function(k){return JSON.parse(localStorage.getItem(k)).prisms;}).every(function(v){return v===1004;})"),'actual input persists both wallets');
  const ax=await send('Accessibility.getFullAXTree');ok(ax.nodes.some(n=>!n.ignored&&n.name&&/Auto-Ascend/.test(n.name.value)),'Auto-Ascend exposed to accessibility tree');
  ok((await ev('window.__prismErrors')).length===0,'no runtime errors');records.push({width,scale,motion,samples,input:await ev('window.__prismInput')});
  await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
 }
}
(async()=>{const result={status:'fail',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),node:process.version,browser:chrome,profiles:records};
 try{await run();result.status='pass';}catch(e){result.error=e.stack;try{if(session){await shot('failure');result.input=await ev('window.__prismInput');}}catch(_){} }
 try{if(browser){if(!closed)await send('Browser.close',{},null);let timer;const exit=await Promise.race([completion,new Promise((_,j)=>{timer=setTimeout(()=>{browser.kill('SIGKILL');j(Error('browser teardown deadline'));},5000);})]).finally(()=>clearTimeout(timer));assert.equal(exit.code,0);result.exit=exit;fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});}}catch(e){result.status='fail';result.teardown=e.message;}
 server.closeAllConnections();await new Promise(r=>server.close(r));result.checks=checks;result.stderr=stderr;fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'receipt.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;
})();
