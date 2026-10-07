/* Standalone JS browser gate. Production bytes are instrumented in memory only.
 * node tests/behavioral/wisp-upgrades.cjs [--source FILE] [--evidence DIR]
 * --existing comma-separated-scenarios runs the existing embedded JS assertions
 * over CDP when this browser's dump-dom process cannot complete.
 * Existing engine/lifecycle assertions come from the active Node.js harness.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),http=require('node:http');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const source=path.resolve(option('--source',path.join(root,'index.html'))),evidence=option('--evidence',null);
const code=fs.readFileSync(source,'utf8'),marker='\n})();\n</script>\n<script>\nif(window.Capacitor';
function assert(v,m){if(!v)throw Error(m);}
assert(code.split(marker).length===2,'one game closure for test bridge');
const bridge=`
window.__wispQa={
 ids:SPIRITS.map(function(s){return s.id;}),
 fresh:function(){return freshState();},get:function(){return JSON.parse(JSON.stringify(state));},
 set:function(s){state=acceptPersistedState(JSON.parse(JSON.stringify(s)),'qa-wisp');restoreEnemyOrSpawn();},
 render:function(){renderSpirits();},cap:function(n){MODULE_MAX_LEVEL=n;},
 present:function(){renderHud();document.activeElement.blur();document.querySelector('[data-wisp-card="ember"]').scrollIntoView({block:'start',behavior:'instant'});document.getElementById('toast').classList.remove('show');},
 spirit:function(id){return SPIRITS.find(function(sp){return sp.id===id;});},
 moduleCost:function(id,n){return moduleCost(this.spirit(id),n);},ultimateCost:function(id){return ultimateSigilCost(this.spirit(id));},
 slots:function(){return [localStorage.getItem(SAVE_KEY),localStorage.getItem(RECOVERY_SAVE_KEY)];},
 save:function(){return saveState();},
 roundTrip:function(route){if(route==='backup'){state=decodeSaveBackup(currentSaveBackup());}else{if(route==='recovery')localStorage.setItem(SAVE_KEY,'{bad');state=loadState();}},
 prepare:function(){if(startupIntroFinish)startupIntroFinish();document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});setOverlayInert(null);overlayFocus=null;isNewGame=false;activateTab('spirits');}
};`;
const prelude='<script>window.setInterval=function(){return 0;};window.__wispErrors=[];window.addEventListener("error",function(e){window.__wispErrors.push(e.message);});window.addEventListener("unhandledrejection",function(e){window.__wispErrors.push(String(e.reason));});</script>';
let page=code.replace('<head>','<head>'+prelude).replace(marker,'\n'+bridge+marker).replace('</body>','<script>'+fs.readFileSync(path.join(__dirname,'wisp-upgrades.js'),'utf8')+'</script></body>');
const existing=option('--existing',null),fixtures={};
if(existing){
  const harness=require('./run.cjs'),scenarios=require('./scenarios.json');
  page=harness.instrumentHtml(code,harness.loadFixtures());
  Object.assign(fixtures,scenarios.SCENARIOS,scenarios.PREP_SCENARIOS,scenarios.NEGATIVE_SCENARIOS);
}
let browser,server,profile,session,sequence=0,buffer='',stderr='',closed=false;
const pending=new Map(),records=[];
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message));}pending.clear();}
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},15000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function key(key){const keys={Enter:13,Tab:9};await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:keys[key],...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:keys[key]});}
async function run(){
  const chrome=option('--chrome',process.env.LUMENFALL_QA_CDP_CHROME||'/usr/bin/chromium');
  profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-wisp-'));
  server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/'||pathname==='/index.html'){res.setHeader('Content-Type','text/html');res.end(page);return;}
    const file=path.resolve(root,'.'+decodeURIComponent(pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.woff2')?'font/woff2':'application/octet-stream'});res.end(error?'missing':data);});
  });await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
  browser.on('error',error=>rejectPending(error.message));browser.on('close',()=>{closed=true;rejectPending('browser closed');});browser.stderr.on('data',data=>{stderr=(stderr+data).slice(-3000);});
  browser.stdio[4].on('data',data=>{buffer+=data;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
  const target=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
  await send('Page.enable');
  if(existing){
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    const origin='http://127.0.0.1:'+server.address().port;
    for(const scenario of existing.split(',')){
      assert(fixtures[scenario],'known existing scenario '+scenario);
      await send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
      const params=new URLSearchParams({qaScenario:scenario,qaFixture:fixtures[scenario],width:'390',height:'844',safeTop:'0',safeBottom:'0'});
      await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:scenario.includes('reduced-motion')?'reduce':'no-preference'}]});
      await send('Page.navigate',{url:origin+'/index.html?'+params});
      let result;for(let i=0;i<300;i++){result=await evaluate(`(()=>{const el=document.querySelector('#qa-result');if(!el||el.dataset.scenario!==${JSON.stringify(scenario)}||!['pass','fail'].includes(el.dataset.status))return null;const p=JSON.parse(el.textContent);return {tag:el.dataset.status,payload:p};})()`);if(result)break;await new Promise(r=>setTimeout(r,20));}
      assert(result,'completed existing QA result '+scenario);assert(result.payload.scenario===scenario && result.payload.status===result.tag,'QA tag/JSON agree '+scenario);
      const record={scenario,status:result.payload.status,detail:result.payload.detail,runtimeErrors:result.payload.runtimeErrors};records.push(record);
      if(evidence){fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,scenario+'.json'),JSON.stringify(result,null,2)+'\n');}
      console.log(JSON.stringify({scenario,status:record.status,detail:record.status==='fail'?record.detail:undefined}));
    }
    return {status:records.every(r=>r.status==='pass'&&r.runtimeErrors.length===0)?'pass':'fail',source,existingAssertions:true,records};
  }
  for(const width of [320,390,430])for(const large of [false,true])for(const motion of ['no-preference','reduce']){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
    await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/index.html'});
    let ready=false;for(let i=0;i<100;i++){ready=await evaluate('!!window.__wispQa && !!document.querySelector("[data-wisp-progression]")');if(ready)break;await new Promise(r=>setTimeout(r,20));}assert(ready,'game initialized');
    await evaluate('document.fonts.ready');
    await evaluate('window.__wispQa.prepare();new Promise(resolve=>setTimeout(resolve,500))');
    const result=await evaluate('window.runWispUpgradeQa()');
    if(large)await evaluate('document.documentElement.style.fontSize="32px"');
    const geometry=await evaluate(`(()=>{const p=document.querySelector('[data-wisp-progression="ember"]'),r=p.getBoundingClientRect();return {width:innerWidth,fit:document.documentElement.scrollWidth<=innerWidth&&p.scrollWidth<=p.clientWidth+1,controls:Array.from(p.querySelectorAll('button')).map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,disabled:e.disabled};}),title:getComputedStyle(p.querySelector('[data-wisp-details]')).color,motion:matchMedia('(prefers-reduced-motion:reduce)').matches,errors:window.__wispErrors};})()`);
    assert(geometry.fit,'progression fits '+width+' large='+large);assert(geometry.controls.every(r=>r.w>=44&&r.h>=44),'all upgrade controls >=44px: '+JSON.stringify(geometry));assert(!geometry.errors.length,'no browser runtime errors');
    if(evidence && !large && motion==='no-preference'){await evaluate('window.__wispQa.present()');fs.mkdirSync(evidence,{recursive:true});const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(evidence,'wisp-'+width+'.png'),Buffer.from(shot.data,'base64'));}
    // Real keyboard activation of the completed disclosure and native focus.
    await evaluate(`(()=>{const b=window.__wispQa,s=b.fresh();s.maxDepthEver=101;s.spirits.ember=1;s.heroRarity.ember=5;s.wispModules.ember=20;s.wispUltimate.ember=true;b.set(s);b.render();const p=document.querySelector('[data-wisp-progression="ember"]');p.open=true;p.querySelector('summary').scrollIntoView({block:'center'});p.querySelector('summary').focus();})()`);
    await key('Enter');assert(await evaluate('!document.querySelector("[data-wisp-progression=ember]").open'),'native Enter folds');
    await evaluate('window.__wispQa.render()');assert(await evaluate('document.activeElement.matches("summary[data-wisp-details=ember]")'),'summary focus survives refresh');
    await key('Enter');assert(await evaluate('document.querySelector("[data-wisp-progression=ember]").open'),'native Enter opens');
    const summary=await evaluate(`(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),c=getComputedStyle(e);return {w:r.width,h:r.height,outline:c.outlineStyle,color:c.color};})()`);assert(summary.w>=44&&summary.h>=44&&summary.outline!=='none','summary touch size and keyboard focus');
    records.push({width,large,motion,result,geometry,summary});
  }
  return {status:'pass',source,records};
}
(async()=>{
  let result;try{result=await run();}catch(error){result={status:'fail',source,message:error.stack,records};}
  try{
    if(browser&&!closed){await send('Browser.close',{},null).catch(()=>{});for(let i=0;i<100&&!closed;i++)await new Promise(r=>setTimeout(r,50));if(!closed){browser.kill('SIGKILL');throw Error('browser did not close gracefully');}}
    if(server)await new Promise(resolve=>server.close(resolve));if(profile)await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }catch(error){result.status='fail';result.teardown=error.message;}
  if(evidence){fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'wisp-upgrades-result.json'),JSON.stringify(result,null,2)+'\n');}
  console.log(JSON.stringify({status:result.status,profiles:records.length,checks:records.reduce((n,r)=>n+(r.result?.checks||0),0),message:result.message,teardown:result.teardown}));if(result.status!=='pass')process.exitCode=1;
})();
