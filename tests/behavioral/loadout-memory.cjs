/* F25 regression contract. Node built-ins only; production HTML is never
 * written. VM checks use production canonicalization; browser checks use real
 * handlers, storage, reload and restore. Simulation intervals are paused only
 * in the throwaway browser page; chronology is checked by the existing suite.
 * node tests/behavioral/loadout-memory.cjs [--source index.html] [--vm-only]
 * [--negative old-purchase|lost-ownership|old-init-gate|no-immediate-save]
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const vm=require('node:vm'),http=require('node:http'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),crypto=require('node:crypto');
const args=process.argv.slice(2),root=path.resolve(__dirname,'../..');
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const sourcePath=path.resolve(option('--source',path.join(root,'index.html')));
const original=fs.readFileSync(sourcePath,'utf8');let html=original;
const negative=option('--negative','');
const mutations={
  'old-purchase':['  item=item && SHOP.find(function(entry){return entry.id===item.id;});',"  if(item && item.id==='rememberbulk'){state.comets-=item.cost;return;}\n  item=item && SHOP.find(function(entry){return entry.id===item.id;});"],
  'lost-ownership':['if(legacy[id]===true || owned[id]===true) out.legacyCometPurchases[id]=true;',"if(id!=='rememberbulk' && (legacy[id]===true || owned[id]===true)) out.legacyCometPurchases[id]=true;"],
  'old-init-gate':['  labMultiplier = state.savedLabMultiplier;','  if(state.owned.rememberbulk) labMultiplier = state.savedLabMultiplier;'],
  'no-immediate-save':['      state.savedLabMultiplier = labMultiplier;\n      saveState();','      state.savedLabMultiplier = labMultiplier;']
};
if(negative){assert(mutations[negative],'known negative');const [from,to]=mutations[negative];assert(html.includes(from),'mutation anchor');html=html.replace(from,to);}
const marker="if(document.readyState==='loading'){",script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const vmBridge=`globalThis.f25={fresh:freshState,canonical:acceptPersistedState,
  set:function(s){state=acceptPersistedState(s,'f25');},get:function(){return state;},
  buy:buyShopItem,complete:restStopComplete,shop:SHOP,
  encode:encodeSaveBackup,decode:decodeSaveBackup};\n`;
const ctx=vm.createContext({document:{readyState:'loading',addEventListener(){}},window:{addEventListener(){}},console});
let checks=0;const records=[];
function ok(condition,message){checks++;assert(condition,message);}
function same(actual,expected,message){checks++;assert.deepEqual(JSON.parse(JSON.stringify(actual)),JSON.parse(JSON.stringify(expected)),message);}
function contracts(){
  vm.runInContext(script.replace(marker,vmBridge+marker),ctx,{timeout:3000});
  const b=ctx.f25,fresh=b.fresh(),canonical=s=>b.canonical(s,'f25');
  same(b.shop.map(x=>x.id),['autoascend','comettrials','rifttrail','starfallcrest'],'retired item absent');
  ok(b.shop.reduce((sum,x)=>sum+x.cost,0)===450,'accepted F27 catalog prices remain');
  for(const owned of [undefined,false,true,'true',1])for(const multiplier of [1,5,10,25,50,100,'max']){
    const seed=b.fresh();seed.comets=125;seed.owned.rememberbulk=owned;seed.savedLabMultiplier=multiplier;
    for(const legacy of [false,true]){
      const input=JSON.parse(JSON.stringify(seed));if(legacy)delete input.schemaVersion;
      const inputBefore=JSON.parse(JSON.stringify(input));
      const out=canonical(input),paid=owned===true;
      ok(out.savedLabMultiplier===multiplier,'all valid choices, any ownership/schema');
      ok(out.comets===125,'removal never changes the existing wallet');
      ok(!!out.legacyCometPurchases.rememberbulk===paid,'historical ownership preserved');
      same(canonical(out),out,'canonical transition idempotent');
      same(b.decode(b.encode(out)),out,'new backup roundtrip idempotent');
      same(input,inputBefore, 'canonical input unchanged');
    }
  }
  for(const value of [undefined,null,0,2,'5','MAX',{},[],Infinity]){
    const seed=b.fresh();seed.savedLabMultiplier=value;ok(canonical(seed).savedLabMultiplier===1,'invalid choice defaults to 1x');
  }
  const raw=b.fresh();raw.owned.rememberbulk=true;raw.comets=20;raw.savedLabMultiplier='max';
  const migrated=canonical(raw);migrated.comets-=10;
  ok(canonical(migrated).comets===10,'removal never credits a spent wallet');
  const backup=b.encode(raw);same(b.decode(backup),b.decode(backup),'same old backup yields same full snapshot');
  const huge=b.fresh();huge.owned.rememberbulk=true;huge.comets=1e20;
  ok(canonical(huge).comets===huge.comets,'large wallet unchanged');
  const complete=b.fresh();complete.owned={autoascend:true,comettrials:true};b.set(complete);
  ok(b.complete(),'quest refresh no longer gated by retired purchase');
  const before=JSON.parse(JSON.stringify(b.get()));b.buy({id:'rememberbulk',cost:50});b.buy({id:'unknown',cost:0});b.buy(null);
  same(b.get(),before,'stale or unknown shop handler cannot charge');
  ok(!('retiredForgeMemoryPurchase' in canonical(fresh)),'no new compensation field');
}

const browserBridge=`window.__f25={
  get:function(){return JSON.parse(JSON.stringify(state));},mult:function(){return labMultiplier;},
  fresh:function(){var s=freshState();s.questDay=todayStr();s.lastSeen=Date.now();return s;},
  canonical:acceptPersistedState,save:saveState,render:renderAll,
  seed:function(primary,recovery){reloadInProgress=true;localStorage.clear();
    if(primary!==null)localStorage.setItem(SAVE_KEY,typeof primary==='string'?primary:JSON.stringify(primary));
    if(recovery!==null)localStorage.setItem(RECOVERY_SAVE_KEY,JSON.stringify(recovery));},
  restore:function(s){document.getElementById('save-backup-code').value=encodeSaveBackup(s);restoreSaveBackup();},
  export:currentSaveBackup,
  dismiss:function(){var pending=!!startupIntroFinish;if(pending)startupIntroFinish();
    return new Promise(function(resolve){setTimeout(function(){document.querySelectorAll('.overlay').forEach(closeOverlay);resolve();},pending?460:0);});},
  finish:function(){reloadInProgress=true;}
};\n`;
let browser,server,profile,session,seq=0,buffer='',browserClosed=false;
const pendingRequests=new Map();let browserDone;
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{
  const id=++seq,timer=setTimeout(()=>{pendingRequests.delete(id);reject(Error('CDP timeout '+method));},15000);
  pendingRequests.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');
});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function ready(){
  for(let i=0;i<250;i++){try{if(await evaluate('!!window.__f25&&!!__f25.get()')){await evaluate('document.fonts.ready.then(()=>true)');await evaluate('__f25.dismiss()');return;}}catch(e){if(!/context|undefined|state|null|navigated/i.test(e.message))throw e;}await new Promise(r=>setTimeout(r,20));}
  throw Error('production startup timeout');
}
async function newDocument(){
  for(let i=0;i<250;i++){try{if(await evaluate('!window.__f25OldDocument&&!!window.__f25&&!!__f25.get()')){await ready();return;}}catch(e){if(!/context|navigated/i.test(e.message))throw e;}await new Promise(r=>setTimeout(r,20));}throw Error('reload timeout');}
async function reload(){await evaluate('window.__f25OldDocument=true');await send('Page.reload',{ignoreCache:true});await newDocument();}
async function restore(snapshot){await evaluate(`window.__f25OldDocument=true;__f25.restore(${JSON.stringify(snapshot)})`);await newDocument();}
async function screenshot(name){
  const directory=option('--evidence-dir','');if(!directory)return;
  fs.mkdirSync(directory,{recursive:true});const shot=await send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(path.join(directory,name+'.png'),Buffer.from(shot.data,'base64'));
}
async function click(selector,keyboard=false){
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest'})`);
  const r=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}),r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})()`);
  ok(r.hit,'native control hit target '+selector);
  if(keyboard){await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});}
  else{await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  await new Promise(r=>setTimeout(r,300));
}
async function browserContracts(){
  const prelude=`<script>window.setInterval=function(){return 0;};window.__f25Errors=[];window.addEventListener('error',e=>__f25Errors.push(e.message));window.addEventListener('unhandledrejection',e=>__f25Errors.push(String(e.reason)));<\/script>`;
  const staged=html.replace('<head>','<head>'+prelude).replace(marker,browserBridge+marker);
  server=http.createServer((req,res)=>{const name=decodeURIComponent((req.url||'/').split('?')[0]);if(name==='/'||name==='/index.html'){res.setHeader('Content-Type','text/html');res.end(staged);return;}
    const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    const types={'.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  });await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f25-'));
  browser=spawn(option('--chrome','chromium'),['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
  browser.stderr.resume();browserDone=new Promise(resolve=>{browser.once('error',e=>resolve({error:e.message}));browser.once('close',(code,signal)=>{browserClosed=true;for(const p of pendingRequests.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pendingRequests.clear();resolve({code,signal});});});
  browser.stdio[4].on('data',chunk=>{buffer+=chunk;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pendingRequests.get(m.id);if(p){pendingRequests.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
  for(const [width,large,motion] of [[320,false,'no-preference'],[390,false,'no-preference'],[430,false,'no-preference'],[320,true,'reduce'],[390,true,'reduce'],[430,true,'reduce']]){
    const context=await send('Target.createBrowserContext',{},null),target=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
    session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');
    await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/index.html`});await ready();
    await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(large?'160%':'100%')}`);
    const seed=await evaluate('__f25.fresh()');seed.savedLabMultiplier=25;await evaluate(`__f25.seed(${JSON.stringify(seed)},null)`);await reload();
    ok(await evaluate('__f25.mult()===25&&!__f25.get().legacyCometPurchases.rememberbulk'),'cold start restores unowned 25x');
    await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(large?'160%':'100%')}`);
    await click('[data-tab="workshop"]');await click('[data-tab="forge"]');
    const geometry=await evaluate(`Array.from(document.querySelectorAll('[data-mult]')).map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {value:el.dataset.mult,width:r.width,height:r.height,left:r.left,right:r.right,color:s.color,background:s.backgroundColor};})`);
    for(const g of geometry)ok(g.width>=43.99&&g.height>=43.99&&g.left>=0&&g.right<=width,'bulk geometry '+width+' '+JSON.stringify(g));
    for(const [i,value] of [1,5,10,25,50,100,'max'].entries()){
      const beforeChoice=await evaluate('__f25.get()');
      await click(`[data-mult="${value}"]`,i%2===0);
      const afterChoice=await evaluate('__f25.get()');beforeChoice.savedLabMultiplier=value;beforeChoice.lastSeen=afterChoice.lastSeen;
      same(afterChoice,beforeChoice,'choice changes only preference and save timestamp');
      ok(await evaluate(`__f25.mult()===${JSON.stringify(value)}&&__f25.get().savedLabMultiplier===${JSON.stringify(value)}&&JSON.parse(localStorage.getItem('lumenfall_save_v2')).savedLabMultiplier===${JSON.stringify(value)}&&JSON.parse(localStorage.getItem('lumenfall_save_recovery_v1')).savedLabMultiplier===${JSON.stringify(value)}`),'choice immediately written to both slots');
      ok(await evaluate(`document.querySelector('[data-mult="${value}"]').getAttribute('aria-pressed')==='true'`),'selected state accessible');
      if(i%2===0)ok(await evaluate(`document.activeElement.dataset.mult===${JSON.stringify(String(value))}&&getComputedStyle(document.activeElement).outlineWidth!=='0px'`),'keyboard focus retained with outline');
      await click('[data-tab="research"]');await click('[data-tab="battle"]');await click('[data-tab="workshop"]');await click('[data-tab="forge"]');
      ok(await evaluate(`__f25.mult()===${JSON.stringify(value)}`),'choice survives screen changes');await reload();
      ok(await evaluate(`__f25.mult()===${JSON.stringify(value)}`),'choice survives actual reload');
      await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(large?'160%':'100%')}`);await click('[data-tab="workshop"]');await click('[data-tab="forge"]');
    }
    const contrast=await evaluate(`(()=>{
      const canvas=document.createElement('canvas'),c=canvas.getContext('2d');canvas.width=canvas.height=1;
      function rgba(color){c.clearRect(0,0,1,1);c.fillStyle=color;c.fillRect(0,0,1,1);return Array.from(c.getImageData(0,0,1,1).data);}
      function luminance(color){return color.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
      const root=getComputedStyle(document.documentElement),base=rgba(root.getPropertyValue('--bg-elev-2'));
      return Array.from(document.querySelectorAll('[data-mult],#research-list>.section-sub')).map(el=>{
        const s=getComputedStyle(el),fg=rgba(s.color),raw=rgba(s.backgroundColor),alpha=raw[3]/255;
        const bg=raw.map((v,i)=>i<3?v*alpha+base[i]*(1-alpha):255),a=luminance(fg),b=luminance(bg);
        return {text:el.textContent.trim(),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
      });
    })()`);
    for(const row of contrast)ok(row.ratio>=4.5,'bulk and help text contrast '+JSON.stringify(row));
    ok(await evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`)===(motion==='reduce'),'motion preference active');
    await screenshot(`${width}-${large?'large-reduced':'normal'}-forge`);
    // Legacy test-save, recovery and repeated backup restore traverse the real
    // production entry points without any compensation or new wallet credit.
    const legacy=await evaluate('__f25.fresh()');delete legacy.schemaVersion;legacy.owned.rememberbulk=true;legacy.savedLabMultiplier='max';legacy.comets=125;
    await evaluate(`__f25.seed('invalid-json',${JSON.stringify(legacy)})`);await reload();
    ok(await evaluate(`__f25.get().comets===125&&__f25.get().legacyCometPurchases.rememberbulk&&__f25.mult()==='max'`),'legacy recovery preserves wallet and ownership without a gate');
    await reload();ok(await evaluate('__f25.get().comets===125'),'recovery reload preserves wallet');
    for(let n=0;n<2;n++){await restore(legacy);ok(await evaluate('__f25.get().comets===125&&__f25.mult()===\'max\''),'restore replaces the full wallet snapshot');}
    await click('[data-tab="deeds"]');ok(await evaluate(`!document.querySelector('[data-shop="rememberbulk"]')&&!document.querySelector('#shop-list').textContent.includes('Loadout Memory')`),'retired purchase and name absent');
    const spent=await evaluate('__f25.get()');spent.comets=100;await restore(spent);
    ok(await evaluate('__f25.get().comets===100'),'restoring spent wallet never adds compensation');
    same(await evaluate('__f25Errors'),[],'no browser runtime errors');
    records.push({width,largeTextPercent:large?160:100,motion,geometry,contrast,values:7,recovery:true,backupRestores:3});
    await evaluate('__f25.finish()');await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
  }
}
async function cleanup(){
  if(browser&&!browserClosed){await send('Browser.close',{},null).catch(()=>{});let timer;try{await Promise.race([browserDone,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout')),5000);})]);}finally{clearTimeout(timer);if(!browserClosed){browser.kill('SIGKILL');await browserDone;}}}
  if(profile&&browserClosed)fs.rmSync(profile,{recursive:true,force:true});if(server)await new Promise(resolve=>server.close(resolve));
}
(async()=>{let result;try{contracts();if(!args.includes('--vm-only'))await browserContracts();result={status:'pass',checks,records};}catch(e){result={status:'fail',checks,message:e.message,records};}
  try{await cleanup();}catch(e){result.status='fail';result.cleanupError=e.message;}
  result.sourceSHA256=crypto.createHash('sha256').update(original).digest('hex');result.negative=negative||null;result.controlledSimulationIntervals=true;
  console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;
})();
