/* F06: real Chromium input, Resonate eligibility and persistence.
 * node tests/behavioral/resonate-clarity.cjs [--source index.html] [--evidence DIR]
 * Test instrumentation is served in memory; product bytes are never rewritten.
 * Timers pause for deterministic fixtures; engine parity uses existing run.cjs.
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const http=require('node:http'),{spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const sourcePath=path.resolve(option('--source',path.join(root,'index.html')));
const evidence=option('--evidence',null),source=fs.readFileSync(sourcePath,'utf8');
const sourceSha256=require('node:crypto').createHash('sha256').update(source).digest('hex');
const chrome=option('--chrome',process.env.LUMENFALL_QA_CDP_CHROME||['chromium','google-chrome','google-chrome-stable','chromium-browser'].find(x=>spawnSync('which',[x]).status===0));
function assert(value,message){if(!value)throw Error(message);}
const bridge=String.raw`
window.resonateQa={
 initialized:function(){return !!els['toast'];},
 get:function(){return JSON.parse(JSON.stringify(state));},
 seed:function(){var s=freshState();s.maxDepthEver=250;s.sigils=100;
  s.activeParty=['ember','tide','stone'];
  SPIRITS.forEach(function(sp){s.spirits[sp.id]=1;s.heroRarity[sp.id]=5;s.wispUltimate[sp.id]=true;s.heroResource[sp.id]=0;});
  return s;},
 seedMaxed:function(){var s=this.seed();s.wispModules.ember=MODULE_MAX_LEVEL;return s;},
 set:function(s){state=acceptPersistedState(s,'runtime');renderAll();return this.get();},
 render:function(){renderSpirits();},
 use:function(id){return useSigilResonance(SPIRITS.find(function(sp){return sp.id===id;}));},
 save:function(){return saveState();},
 backup:function(){return currentSaveBackup();},
 restore:function(code){document.getElementById('save-backup-code').value=code;restoreSaveBackup();},
 keys:function(){return {save:SAVE_KEY,recovery:RECOVERY_SAVE_KEY};},
 ascend:function(){applyAscendMutation();renderAll();return this.get();},
 ready:function(){if(startupIntroFinish)startupIntroFinish();
  document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});
  document.querySelector('.shell').inert=false;isNewGame=false;
  clearTimeout(showToast._t);els['toast'].classList.remove('show');activateTab('spirits');},
 open:function(id){var el=document.querySelector('[data-wisp-progression="'+id+'"]');el.open=true;},
 button:function(id){return document.querySelector('[data-sigil-resonate="'+id+'"]');},
 help:function(id){return document.getElementById('sigil-resonance-help-'+id);}
};`;
const prelude=String.raw`<script>
window.__resonateErrors=[];window.__resonatePaused=true;
window.addEventListener('error',function(e){window.__resonateErrors.push(e.message);});
window.addEventListener('unhandledrejection',function(e){window.__resonateErrors.push(String(e.reason));});
var originalResonateInterval=window.setInterval;
window.setInterval=function(fn,ms){return originalResonateInterval(function(){if(!window.__resonatePaused)fn();},ms);};
localStorage.setItem('lumenfall_startup_intro_last',String(Date.now()));
</script>`;
const marker='\n})();\n</script>\n<script>\nif(window.Capacitor';
assert(source.split(marker).length===2,'one production IIFE marker');
const instrumented=source.replace('<head>','<head>'+prelude).replace(marker,'\n'+bridge+marker);
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/'||name==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(instrumented);return;}
 const file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end();return;}
 res.setHeader('Content-Type',name.endsWith('.woff2')?'font/woff2':name.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
let browser,session,buffer='',seq=0,closed=false,stderr='';const pending=new Map(),records=[];
let profile,completion;
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{
 const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);
 pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');
});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function bounded(promise,ms){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms);})]);}finally{clearTimeout(timer);}}
async function ready(){for(let i=0;i<150;i++){if(await evaluate('!!window.resonateQa && resonateQa.initialized()')){await evaluate('resonateQa.ready()');return;}await pause(20);}throw Error('page not ready');}
async function fresh(){await evaluate('resonateQa.set(resonateQa.seed());resonateQa.ready();resonateQa.open("ember")');}
async function shot(name){if(!evidence)return;const r=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,name+'.png'),Buffer.from(r.data,'base64'));}
async function key(key){const spec=key==='Space'?{key:' ',code:'Space',windowsVirtualKeyCode:32}:{key:'Enter',code:'Enter',windowsVirtualKeyCode:13};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
async function run(){
 assert(chrome,'Chromium is required');
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-resonate-'));
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 completion=new Promise(resolve=>{browser.once('error',error=>{rejectPending(error.message);resolve({error:error.message});});browser.once('close',(code,signal)=>{closed=true;rejectPending('browser closed');resolve({code,signal});});});
 browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
 for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',error=>rejectPending(error.message));
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 for(const width of [320,390,430])for(const scale of [1,2])for(const motion of ['no-preference','reduce']){
  const context=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
  await send('Page.enable');await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/index.html'});await ready();
  await evaluate('document.fonts.ready.then(()=>true)');await fresh();
  await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(16*scale+'px')};resonateQa.button('ember').scrollIntoView({block:'center'});`);
  const layout=await evaluate(`(function(){
   function ok(v,m){if(!v)throw Error(m);}
   var b=resonateQa.button('ember'),h=resonateQa.help('ember');
   ok(b&&h,'visible Resonate action and explanation');
   var r=b.getBoundingClientRect(),hr=h.getBoundingClientRect();
   ok(b.textContent.includes('Fill ability to 100')&&b.textContent.includes('25 Sigils'),'explicit refill and price');
   ok(h.textContent.includes('all Wisp Ultimates')&&h.textContent.includes('not a permanent upgrade'),'unlock and consumption explanation');
   ok(h.textContent.includes('3 of 3 uses left this run, shared across all Wisps')&&h.textContent.includes('Resets on Ascend'),'shared run limit/reset');
   ok(b.getAttribute('aria-describedby')===h.id,'accessible description');
   ok(b.getAttribute('aria-label').includes('Ember'),'Wisp-specific accessible name');
   ok(r.height>=44&&r.width>=44,'44px action');
   ok(r.left>=0&&r.right<=innerWidth&&hr.left>=0&&hr.right<=innerWidth,'copy/control fit mobile width');
   ok(b.scrollWidth<=b.clientWidth+1&&h.scrollWidth<=h.clientWidth+1,'no clipped copy');
   ok(document.documentElement.scrollWidth<=innerWidth+1,'no page horizontal overflow');
   var ids=Array.from(document.querySelectorAll('[id]')).map(function(el){return el.id;});ok(ids.length===new Set(ids).size,'unique rendered IDs');
   var font=getComputedStyle(h).fontSize;
   if(parseFloat(font)<${12*scale})throw Error('expected enlarged explanation text');
   var before=JSON.stringify(resonateQa.get()),keys=resonateQa.keys(),raw=localStorage.getItem(keys.save),recovery=localStorage.getItem(keys.recovery);
   b.focus();resonateQa.render();
   ok(document.activeElement===resonateQa.button('ember'),'focus survives ordinary render');
   ok(before===JSON.stringify(resonateQa.get())&&raw===localStorage.getItem(keys.save)&&recovery===localStorage.getItem(keys.recovery),'render does not mutate state/save');
   return {button:{width:r.width,height:r.height},font:font,help:h.textContent};
  })()`);
  // Actual native keyboard activates the production click handler once.
  await key('Space');
  const input=await evaluate(`(function(){var s=resonateQa.get();if(s.sigils!==75||s.sigilResonanceUses!==1||s.heroResource.ember!==100)throw Error('native keyboard refill/debit');
   if(!document.activeElement.isConnected||document.activeElement===document.body)throw Error('focus stranded after disabled action');
   if(!resonateQa.help('tide').textContent.includes('2 of 3 uses left'))throw Error('shared counter stale on other Wisp');
   return {sigils:s.sigils,uses:s.sigilResonanceUses,resource:s.heroResource.ember,focus:document.activeElement.getAttribute('aria-label')};})()`);
  await evaluate('window.__resonatePaused=false');await pause(350);await evaluate('window.__resonatePaused=true');
  assert(await evaluate('document.activeElement.isConnected&&document.activeElement!==document.body&&resonateQa.get().sigils===75&&resonateQa.get().sigilResonanceUses===1'),'focus/counter survive ordinary production intervals');
  await fresh();await evaluate(`resonateQa.button('ember').scrollIntoView({block:'center'});document.activeElement.blur();`);
  const target=await evaluate(`(function(){var r=resonateQa.button('ember').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[target]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert(await evaluate('resonateQa.get().sigils===75&&resonateQa.get().sigilResonanceUses===1&&resonateQa.get().heroResource.ember===100'),'native touch refills and consumes once');
  await fresh();await evaluate(`resonateQa.button('ember').scrollIntoView({block:'center'});`);
  // Get focus-visible styling through keyboard, then capture the complete refill section.
  await key('Enter');await fresh();await evaluate(`resonateQa.button('ember').focus();resonateQa.button('ember').scrollIntoView({block:'center'});`);
  const contrast=await evaluate(`(function(){
   function rgba(c){var canvas=document.createElement('canvas');canvas.width=canvas.height=1;var x=canvas.getContext('2d');x.fillStyle=c;x.fillRect(0,0,1,1);return Array.from(x.getImageData(0,0,1,1).data);}
   function bg(el){var chain=[];while(el){chain.unshift(el);el=el.parentElement;}return chain.reduce(function(out,node){var c=rgba(getComputedStyle(node).backgroundColor),a=c[3]/255;return out.map(function(v,i){return c[i]*a+v*(1-a);});},[255,255,255]);}
   function lum(c){return c.map(function(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce(function(s,v,i){return s+v*[.2126,.7152,.0722][i];},0);}
   function ratio(a,b){a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
   var b=resonateQa.button('ember'),h=resonateQa.help('ember'),bs=getComputedStyle(b),copy=ratio(rgba(getComputedStyle(h).color).slice(0,3),bg(h)),label=ratio(rgba(bs.color).slice(0,3),bg(b)),focus=ratio(rgba(bs.outlineColor).slice(0,3),bg(b.parentElement));
   if(copy<4.5||label<4.5)throw Error('text contrast below 4.5');
   if(parseFloat(bs.outlineWidth)<2||focus<3)throw Error('focus indicator');
   return {copy:copy,label:label,focus:focus,outline:bs.outlineWidth};
  })()`);
  await shot('resonate-'+width+'-text'+scale+'-'+motion);
  if(scale===2){await evaluate(`resonateQa.help('ember').scrollIntoView({block:'end'});`);await shot('resonate-'+width+'-text'+scale+'-'+motion+'-help-end');}
  records.push({width,textScale:scale,motion,layout,input,contrast,timersPausedForFixtures:true,ordinaryIntervalMs:350});
  assert((await evaluate('window.__resonateErrors')).length===0,'no browser runtime errors');
  await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
 }
 // Direct handler rejection matrix complements native inputs without changing mechanics.
 const context=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
 session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Page.enable');await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/index.html'});await ready();
 const gates=await evaluate(`(function(){
  var cases=[['missing Ultimate',function(s){s.wispUltimate.titan=false;}],['reserve',function(s){s.activeParty=['tide'];}],['unrecruited',function(s){s.spirits.ember=0;s.activeParty=['tide'];}],['full resource',function(s){s.heroResource.ember=100;}],['24 Sigils',function(s){s.sigils=24;}],['three uses',function(s){s.sigilResonanceUses=3;}]];
  return cases.map(function(c){var s=resonateQa.seed();c[1](s);resonateQa.set(s);var before=JSON.stringify(resonateQa.get());if(resonateQa.use('ember')!==false||before!==JSON.stringify(resonateQa.get()))throw Error(c[0]+' charged/changed state');
   var b=resonateQa.button('ember');if(b&&!b.disabled)throw Error(c[0]+' button enabled');
   if(c[0]==='missing Ultimate'&&(!resonateQa.help('ember')||b))throw Error('pre-unlock explanation');return c[0];});
 })()`);
 await evaluate('resonateQa.set(resonateQa.seedMaxed());resonateQa.save()');
 await send('Page.reload');await pause(200);await ready();
 const folding=await evaluate(`(function(){
  var d=document.querySelector('[data-wisp-progression="ember"]');
  if(d.tagName!=='DETAILS'||d.open)throw Error('maxed Wisp initially folded');
  resonateQa.open('ember');resonateQa.button('ember').focus();resonateQa.render();
  d=document.querySelector('[data-wisp-progression="ember"]');
  if(!d.open||document.activeElement!==resonateQa.button('ember'))throw Error('fold/open/focus preservation');
  if(!resonateQa.use('ember')||resonateQa.get().sigils!==75||resonateQa.get().heroResource.ember!==100)throw Error('Resonate in maxed Wisp');
  return {maxedInitiallyFolded:true,openFocusPreserved:true,refill:true};
 })()`);
 await fresh();
 const shared=await evaluate(`(function(){['ember','tide','stone'].forEach(function(id){if(!resonateQa.use(id))throw Error('shared use '+id);});var s=resonateQa.get();if(s.sigils!==25||s.sigilResonanceUses!==3)throw Error('three uses total');s.heroResource.ember=0;resonateQa.set(s);if(resonateQa.use('ember'))throw Error('fourth use');return resonateQa.get();})()`);
 await evaluate('resonateQa.save()');await send('Page.reload');await pause(200);await ready();
 assert(await evaluate('resonateQa.get().sigilResonanceUses===3&&resonateQa.get().sigils===25&&resonateQa.get().heroResource.tide===100'),'reload preserves consumption/resource');
 const backup=await evaluate('resonateQa.backup()');
 await fresh();await evaluate('resonateQa.save()');
 await evaluate('resonateQa.restore('+JSON.stringify(backup)+')');await pause(350);await ready();
 assert(await evaluate('resonateQa.get().sigilResonanceUses===3&&resonateQa.get().sigils===25&&resonateQa.get().wispUltimate.titan'),'actual backup restore reload preserves counter/value');
 await evaluate(`localStorage.setItem(resonateQa.keys().save,'broken JSON')`);await send('Page.reload');await pause(200);await ready();
 assert(await evaluate('resonateQa.get().sigilResonanceUses===3&&resonateQa.get().sigils===25&&resonateQa.get().heroResource.stone===100'),'recovery preserves counter/resource');
 const ascend=await evaluate(`(function(){var s=resonateQa.get();s.depth=101;s.maxDepthEver=250;resonateQa.set(s);return resonateQa.ascend();})()`);
 assert(ascend.sigilResonanceUses===0&&ascend.sigils===25&&Object.values(ascend.wispUltimate).every(Boolean),'Ascend resets allowance and preserves Sigils/Ultimates');
 const boundary=await evaluate(`(function(){var s=resonateQa.seed();s.sigils=25;s.heroResource.ember=99;s.sigilResonanceUses=2;resonateQa.set(s);if(!resonateQa.use('ember'))throw Error('last affordable use');s=resonateQa.get();if(s.sigils!==0||s.heroResource.ember!==100||s.sigilResonanceUses!==3)throw Error('25/99/2 boundary');return {sigils:s.sigils,resource:s.heroResource.ember,uses:s.sigilResonanceUses};})()`);
 records.push({gates,folding,shared:{sigils:shared.sigils,uses:shared.sigilResonanceUses},persistence:['reload','backup restore with reload','canonical corruption/recovery'],ascend:{sigils:ascend.sigils,uses:ascend.sigilResonanceUses},boundary});
 assert((await evaluate('window.__resonateErrors')).length===0,'no persistence runtime errors');
 await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
}
(async()=>{
 let result;
 const identity={source:sourcePath,sourceSha256,node:process.version,browser:chrome&&spawnSync(chrome,['--version'],{encoding:'utf8'}).stdout.trim()};
 try{await run();result={status:'pass',...identity,records};}catch(error){result={status:'fail',message:error.stack,...identity,records};}
 try{
  if(browser){assert(pending.size===0,'no pending protocol operations');if(!closed)await send('Browser.close',{},null).catch(()=>{});
   let exit;try{exit=await bounded(completion,5000);}catch(error){browser.kill('SIGKILL');exit=await bounded(completion,2000);throw error;}
   assert(closed&&exit.code===0,'graceful Chromium exit');fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});result.teardown={exit,profileRemoved:!fs.existsSync(profile)};}
 }catch(error){result.status='fail';result.teardownError=error.message;}
 await new Promise(resolve=>server.close(resolve));
 if(evidence){fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify(result,null,2)+'\n');}
 console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;
})();
