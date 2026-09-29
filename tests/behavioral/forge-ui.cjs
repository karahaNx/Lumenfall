/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.py registers this in the default suite.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-forge-ui-'));
const browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',stderr='',session,records=[];const pending=new Map(),listeners=[];
browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else listeners.slice().forEach(f=>f(m));}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(v,m){if(!v)throw Error(m);}
// Pause only simulation during the immediate before/input/after measurement.
// CSS/frames keep running. Then allow ordinary production intervals, measure
// again without any intervening focus/scroll correction, and pause for capture.
async function advance(ms=350){await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(false)');await new Promise(r=>setTimeout(r,ms));await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(true)');}

async function key(key){const spec=key==='Space'?{key:' ',code:'Space',windowsVirtualKeyCode:32}:key==='Enter'?{key:'Enter',code:'Enter',windowsVirtualKeyCode:13}:key==='Escape'?{key:'Escape',code:'Escape',windowsVirtualKeyCode:27}:{key,code:key,windowsVirtualKeyCode:{ArrowRight:39,ArrowLeft:37,Home:36,End:35,Tab:9}[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
async function touch(selector){const r=await evaluate(`forgeUi.measure(${JSON.stringify(selector)})`);assert(r.visible&&r.hit,'touch target visible before action');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
async function shot(name){if(!process.env.LUMENFALL_QA_EVIDENCE_DIR)return;const r=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,name+'.png'),Buffer.from(r.data,'base64'));}
(async()=>{
 for(const [width,height,inset] of [[360,640,0],[360,640,24],[390,844,24]]){
  const motion=scenario.includes('reduced')?'reduce':'no-preference',name=`${width}x${height}-safe${inset}-${motion}`;
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');
  await send('Page.navigate',{url});
  for(let i=0;i<150&&!await evaluate('!!window.__forgeUiReady');i++)await new Promise(r=>setTimeout(r,20));
  assert(await evaluate('!!window.__forgeUiReady'),'native UI test page ready');
  await evaluate('document.fonts.ready.then(()=>true)');await new Promise(r=>setTimeout(r,500));
  await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(true)');
  await evaluate(fs.readFileSync(path.join(__dirname,'forge-ui.js'),'utf8'));
  await evaluate(`forgeUi.setup(${inset})`);await advance();
  const bulk=await evaluate('forgeUi.checkBulk()');await shot(name+'-bulk');
  const selector='[data-queue="luminoustracking"]';await evaluate(`forgeUi.prepare(${JSON.stringify(selector)},true)`);
  const before=await evaluate(`forgeUi.measure(${JSON.stringify(selector)})`),start=await evaluate('forgeUi.state()');await shot(name+'-queue-before');
  const toggles=[];
  for(let i=0;i<6;i++){
   const actionBefore=await evaluate('forgeUi.actionBefore()');await key('Space');await evaluate(`forgeUi.checkAction(${JSON.stringify(actionBefore)})`);const immediate=await evaluate(`forgeUi.checkQueue(${JSON.stringify(before)},${JSON.stringify(start)},${i%2===0},true)`);
   await advance();const after=await evaluate(`forgeUi.checkQueue(${JSON.stringify(before)},${JSON.stringify(start)},${i%2===0},true)`);toggles.push({immediate,after});
   if(i===0)await shot(name+'-queue-after');
  }
  // Touch without forcing focus. Never scroll/refocus between action and check.
  await evaluate('document.activeElement.blur()');
  const touchBefore=await evaluate(`forgeUi.measure(${JSON.stringify(selector)})`);
  for(let i=0;i<2;i++){const actionBefore=await evaluate('forgeUi.actionBefore()');await touch(selector);await evaluate(`forgeUi.checkAction(${JSON.stringify(actionBefore)})`);const immediate=await evaluate(`forgeUi.checkQueue(${JSON.stringify(touchBefore)},${JSON.stringify(start)},${i===0},false)`);await advance();const after=await evaluate(`forgeUi.checkQueue(${JSON.stringify(touchBefore)},${JSON.stringify(start)},${i===0},false)`);toggles.push({touch:true,immediate,after});}
  const tickEvidence=await evaluate('forgeUi.checkTicks()');
  const purchases=[];
  for(const level of [8,9]){
   await evaluate(`forgeUi.preparePurchase(${level})`);await advance();const before=await evaluate('forgeUi.purchaseBefore()');await shot(name+'-purchase-'+level+'-before');await key('Space');
   const immediate=await evaluate(`forgeUi.checkPurchase(${JSON.stringify(before)})`);await advance();const after=await evaluate(`forgeUi.checkPurchase(${JSON.stringify(before)})`);await shot(name+'-purchase-'+level+'-after');purchases.push({before,immediate,after});
  }
  // Each bulk value uses a real input, with selected-state and preview checks.
  const bulkStates=[];
  for(const value of ['1','5','10','25','50','100','max']){const s='[data-mult="'+value+'"]';await evaluate(`forgeUi.prepare(${JSON.stringify(s)},true)`);await key('Space');await advance();bulkStates.push(await evaluate(`forgeUi.checkBulkChoice(${JSON.stringify(value)})`));}
  await evaluate(`forgeUi.prepare('[data-mult="5"]',false);document.activeElement.blur()`);await touch('[data-mult="5"]');await advance();assert(await evaluate(`document.querySelector('[data-mult="5"]').getAttribute("aria-pressed")`)==="true","native touch bulk choice");
  await evaluate('forgeUi.affordability()');await advance();const affordability=await evaluate('forgeUi.checkAffordability()');
  // Native navigation and Details; no shared focus-helper modification.
  await evaluate('forgeUi.prepare(\'[data-tab="forge"]\',true)');await key('ArrowRight');assert(await evaluate('document.activeElement.dataset.tab')==='research','Forge -> Lab keyboard focus');
  assert(await evaluate('document.querySelector("#tab-research").classList.contains("active")'),'Lab active');
  await key('Home');assert(await evaluate('document.activeElement.dataset.tab')==='battle','Home returns to Rift');
  await evaluate('forgeUi.prepare("#rift-details-btn",true)');await key('Space');assert(await evaluate('document.querySelector("#rift-details").open'),'native Details opens');await key('Escape');assert(await evaluate('!document.querySelector("#rift-details").open && document.activeElement.id==="rift-details-btn"'),'Details closes and restores focus');
  const navigation=await evaluate('forgeUi.checkRift()');
  records.push({profile:name,bulk,before,toggles,tickEvidence,purchases,bulkStates,affordability,navigation});
  await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
 console.log(JSON.stringify({status:'pass',scenario,records}));
})().catch(e=>{console.log(JSON.stringify({status:'fail',scenario,message:e.message,records}));process.exitCode=1;}).finally(()=>{browser.kill();for(const p of pending.values())clearTimeout(p.timer);fs.rmSync(profile,{recursive:true,force:true});});
