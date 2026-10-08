/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.cjs registers this in the default suite.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-forge-ui-'));
const browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',stderr='',session,records=[];const pending=new Map(),listeners=[],shutdownEvents=[];
let browserClosed=false;
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
const browserCompletion=new Promise(resolve=>{
 browser.once('error',error=>{rejectPending(error.message);resolve({error:error.message});});
 browser.once('close',(code,signal)=>{browserClosed=true;shutdownEvents.push({event:'browser-close',code,signal,pending:pending.size});rejectPending('browser closed');resolve({code,signal});});
});
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',error=>rejectPending('CDP pipe '+error.message));
async function boundedCompletion(ms){let timer;try{return await Promise.race([browserCompletion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout '+ms+'ms')),ms);})]);}finally{clearTimeout(timer);}}
async function teardown(){
 const diagnostic={pendingBeforeClose:pending.size,events:shutdownEvents};
 assert(pending.size===0,'all prior protocol requests settled before browser close');
 // Browser.close may close the pipe before replying; the process close event is
 // authoritative. Await it before deleting a profile Chrome may still write.
 if(!browserClosed){await send('Browser.close',{},null).catch(error=>{diagnostic.closeRequest=error.message;});}
 try{diagnostic.browser=await boundedCompletion(5000);}catch(error){
  diagnostic.forced=error.message;browser.kill('SIGTERM');
  try{diagnostic.browser=await boundedCompletion(2000);}catch(_){browser.kill('SIGKILL');diagnostic.browser=await boundedCompletion(2000);}
 }
 diagnostic.pendingAfterClose=pending.size;
 assert(browserClosed,'browser exited before profile removal');
 await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
 diagnostic.profileRemoved=!fs.existsSync(profile);shutdownEvents.push({event:'profile-removed',browserClosed});
 assert(!diagnostic.forced&&!diagnostic.browser.error&&diagnostic.browser.code===0,'graceful browser termination: '+JSON.stringify(diagnostic));
 return diagnostic;
}
browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else listeners.slice().forEach(f=>f(m));}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(v,m){if(!v)throw Error(m);}
// Pause only simulation during the immediate before/input/after measurement.
// CSS/frames keep running. Then allow ordinary production intervals, measure
// again without any intervening focus/scroll correction, and pause for capture.
async function advance(ms=350){await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(false)');await new Promise(r=>setTimeout(r,ms));await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(true)');}

async function key(key){const spec=key==='Space'?{key:' ',code:'Space',windowsVirtualKeyCode:32}:key==='Enter'?{key:'Enter',code:'Enter',windowsVirtualKeyCode:13}:key==='Escape'?{key:'Escape',code:'Escape',windowsVirtualKeyCode:27}:{key,code:key,windowsVirtualKeyCode:{ArrowRight:39,ArrowLeft:37,Home:36,End:35,Tab:9}[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
async function touch(selector){const r=await evaluate(`forgeUi.measure(${JSON.stringify(selector)})`);assert(r.visible&&r.hit,'touch target visible before action');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
async function shot(name){if(!process.env.LUMENFALL_QA_EVIDENCE_DIR)return;const r=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,name+'.png'),Buffer.from(r.data,'base64'));}
async function run(){
 if(scenario.startsWith('swift-recovery-'))return runSwift();
 for(const [width,height,inset] of [[360,640,0],[360,640,24],[390,844,24]]){
  const motion=scenario.includes('reduced')?'reduce':'no-preference',name=`${width}x${height}-safe${inset}-${motion}`;
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');
  await send('Page.navigate',{url});
  for(let i=0;i<150&&!await evaluate('!!window.__forgeUiReady');i++)await new Promise(r=>setTimeout(r,20));
  assert(await evaluate('!!window.__forgeUiReady'),'native UI test page ready');
  await evaluate('document.fonts.ready.then(()=>true)');
  await evaluate('window.__lumenfallQaBridge.uiMeasurementPause(true);window.__lumenfallQaBridge.resetFeedback()');
  const startup=await evaluate('window.__qaForgeStartup.promise');
  assert(startup.callbacks===1,'one observed startup completion callback');
  await evaluate(fs.readFileSync(path.join(__dirname,'forge-ui.js'),'utf8'));
  await evaluate(`forgeUi.setup(${inset})`);await advance();
  const bulk=await evaluate('forgeUi.checkBulk()');await shot(name+'-bulk');
  const selector='[data-queue="luminoustracking"]';await evaluate(`forgeUi.prepare(${JSON.stringify(selector)},true)`);
  const before=await evaluate(`forgeUi.measure(${JSON.stringify(selector)})`),start=await evaluate('forgeUi.state()');await shot(name+'-queue-before');
  const toggles=[];
  for(let i=0;i<6;i++){
   const actionBefore=await evaluate('forgeUi.actionBefore()');if(i===0)await new Promise(r=>setTimeout(r,100));await key('Space');const action=await evaluate(`forgeUi.checkAction(${JSON.stringify(actionBefore)})`);const immediate=await evaluate(`forgeUi.checkQueue(${JSON.stringify(before)},${JSON.stringify(start)},${i%2===0},true)`);
   await advance();const after=await evaluate(`forgeUi.checkQueue(${JSON.stringify(before)},${JSON.stringify(start)},${i%2===0},true)`);toggles.push({action,immediate,after});
   if(i===0)await shot(name+'-queue-after');
  }
  // Touch without forcing focus. Never scroll/refocus between action and check.
  await evaluate('document.activeElement.blur()');
  const touchBefore=await evaluate(`forgeUi.measure(${JSON.stringify(selector)})`);
  for(let i=0;i<2;i++){const actionBefore=await evaluate('forgeUi.actionBefore()');await touch(selector);const action=await evaluate(`forgeUi.checkAction(${JSON.stringify(actionBefore)})`);const immediate=await evaluate(`forgeUi.checkQueue(${JSON.stringify(touchBefore)},${JSON.stringify(start)},${i===0},false)`);await advance();const after=await evaluate(`forgeUi.checkQueue(${JSON.stringify(touchBefore)},${JSON.stringify(start)},${i===0},false)`);toggles.push({touch:true,action,immediate,after});}
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
  // Native navigation across remaining Rift controls; no shared focus-helper modification.
  await evaluate('forgeUi.prepare(\'[data-tab="forge"]\',true)');await key('ArrowRight');assert(await evaluate('document.activeElement.dataset.tab')==='research','Forge -> Lab keyboard focus');
  assert(await evaluate('document.querySelector("#tab-research").classList.contains("active")'),'Lab active');
  await key('Home');assert(await evaluate('document.activeElement.dataset.tab')==='forge','Workshop Home returns Forge');await evaluate('document.querySelector("[data-tab=workshop]").focus({preventScroll:true})');await key('ArrowRight');assert(await evaluate('document.activeElement.dataset.tab')==='battle','main ArrowRight returns to Rift');
  assert(await evaluate('!document.querySelector("#rift-details-btn") && !document.querySelector("#rift-details")'),'obsolete Details absent');
  await evaluate('document.querySelector("#rift-push-btn").focus({preventScroll:true})');await key('Enter');assert(await evaluate('document.activeElement.id')==='rift-push-btn','native Push retains focus');
  const navigation=await evaluate('forgeUi.checkRift()');
  records.push({profile:name,startup,bulk,before,toggles,tickEvidence,purchases,bulkStates,affordability,navigation});
  await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
 return {status:'pass',scenario,records};
}
function contrast(a,b){
 function luminance(color){const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4);});return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];}
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
async function runSwift(){
 const motion=scenario.includes('reduced')?'reduce':'no-preference';
 for(const width of [320,390,430])for(const textScale of [1,2]){
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Page.navigate',{url});
  for(let i=0;i<150&&!await evaluate('!!window.__forgeUiReady');i++)await new Promise(r=>setTimeout(r,20));
  assert(await evaluate('!!window.__forgeUiReady'),'Swift UI page ready');await evaluate('window.__qaForgeStartup.promise');await evaluate('document.fonts.ready.then(()=>true)');
  await evaluate(`(()=>{const b=window.__lumenfallQaBridge;b.uiMeasurementPause(true);const s=b.freshStateSnapshot();s.research.charge=9;s.maxDepthEver=101;s.shards=1e12;s.lumen=1e12;s.questDay=b.currentDay();s.loginStreak=1;b.setState(s);b.renderLayout();document.querySelector('[data-tab="forge"]').click();})()`);
  await evaluate(fs.readFileSync(path.join(__dirname,'forge-ui.js'),'utf8'));
  await evaluate(`forgeUi.prepare('[data-mult="5"]',true)`);await key('Space');
  if(textScale===2)await evaluate(`(()=>{const rules=[];for(const e of document.querySelectorAll('#tab-forge *')){const c=getComputedStyle(e);if(Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())){const selector=e.matches('[data-mult]')?'[data-mult="'+e.dataset.mult+'"]':e.matches('[data-research]')?'[data-research="'+e.dataset.research+'"]':e.matches('[data-queue]')?'[data-queue="'+e.dataset.queue+'"]':'.'+Array.from(e.classList).join('.');if(selector!=='.')rules.push('#tab-forge '+selector+'{font-size:'+parseFloat(c.fontSize)*2+'px!important;line-height:1.2!important;}');}}const style=document.createElement('style');style.textContent=rules.join('');document.head.appendChild(style);})()`);
  const before=await evaluate(`(()=>{const b=window.__lumenfallQaBridge,card=document.querySelector('[data-forge-card="charge"]');return {state:b.getState(),preview:b.forge.preview('charge',5),text:card.textContent};})()`);
  assert(before.preview.plan.buyCount===1&&before.text.includes('Purchase impact: 1 level(s)'),'cap-limited UI preview');
  await evaluate(`forgeUi.prepare('[data-queue="charge"]',true)`);await key('Tab');await new Promise(r=>setTimeout(r,350));
  const geometry=await evaluate(`(()=>{const card=document.querySelector('[data-forge-card="charge"]');return {overflow:card.scrollWidth>card.clientWidth,controls:Array.from(card.querySelectorAll('button')).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {width:r.width,height:r.height,color:s.color,background:s.backgroundColor,gradient:s.backgroundImage,outline:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),outlineColor:s.outlineColor,text:e.textContent};}),bulk:Array.from(document.querySelectorAll('#tab-forge [data-mult]')).map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};})};})()`);
  assert(!geometry.overflow,'Swift card fits '+width+' text '+textScale);
  assert(geometry.controls.concat(geometry.bulk).every(c=>c.width>=44&&c.height>=44),'44px controls '+JSON.stringify(geometry));
  const buy=geometry.controls[1];assert(buy.outline!=='none'&&buy.outlineWidth>=2,'visible keyboard focus '+JSON.stringify(geometry));
  const backgrounds=(buy.gradient.match(/(?:rgba?\([^)]*\)|color\(srgb [^)]*\))/g)||[buy.background]).map(bg=>bg.startsWith('color(srgb')?'rgb('+bg.match(/[\d.]+/g).slice(0,3).map(v=>Number(v)*255).join(',')+')':bg);
  assert(backgrounds.every(bg=>contrast(buy.color,bg)>=4.5),'buy text contrast');assert(backgrounds.every(bg=>contrast(buy.outlineColor,bg)>=3),'focus contrast');assert(contrast(geometry.controls[0].color,geometry.controls[0].background)>=4.5,'Queue text contrast');
  await key('Space');
  const after=await evaluate(`(()=>{const b=window.__lumenfallQaBridge;return {state:b.getState(),text:document.querySelector('[data-forge-card="charge"]').textContent,disabled:document.querySelector('[data-research="charge"]').disabled,focus:document.activeElement.dataset.queue};})()`);
  assert(after.state.research.charge===10&&after.state.shards===before.state.shards-before.preview.plan.cost.shard,'native keyboard buys exactly preview');
  assert(after.disabled&&after.text.includes('Next: Maxed')&&after.focus==='charge','cap and same-card focus fallback');
  await key('Space');const queued=await evaluate('window.__lumenfallQaBridge.getState()');assert(queued.researchQueue.charge&&queued.shards===after.state.shards,'cap Queue intent without spend');
  await evaluate('document.activeElement.blur()');await touch('[data-queue="charge"]');const touched=await evaluate('window.__lumenfallQaBridge.getState()');assert(!touched.researchQueue.charge&&touched.shards===queued.shards,'native touch Queue');
  const legacy=await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.research.charge=100;b.setState(s);b.renderLayout();const card=document.querySelector('[data-forge-card="charge"]'),before=JSON.stringify(b.getState());b.forge.buy('charge','max');b.forge.queue();return {text:card.textContent,disabled:card.querySelector('[data-research]').disabled,pure:JSON.stringify(b.getState())===before,overflow:card.scrollWidth>card.clientWidth,transition:getComputedStyle(document.querySelector('.rift-charge>span')).transitionDuration};})()`);
  assert(legacy.text.includes('Level 10 / 10 (100 historical)')&&legacy.text.includes('refunded in Shards')&&legacy.disabled&&legacy.pure&&!legacy.overflow,'legacy effective cap/history/refund UI');
  if(motion==='reduce')assert(parseFloat(legacy.transition)<=0.000001,'reduced-motion charge bar '+legacy.transition);
  await shot('swift-'+width+'-text'+textScale+'-'+motion);records.push({width,textScale,motion,geometry,purchase:{count:1,cost:before.preview.plan.cost.shard},legacy});await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
 return {status:'pass',scenario,records};
}
(async()=>{
 let result;
 try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
 try{result.teardown=await teardown();}catch(error){result.status='fail';result.teardown={message:error.message,events:shutdownEvents,pending:pending.size,stderr};process.stderr.write('Forge UI teardown failed: '+error.stack+'\n');}
 console.log(JSON.stringify(result));
 if(result.status!=='pass')process.exitCode=1;
 if(scenario==='self-test-forge-ui-exit'&&result.status==='pass'){process.stderr.write('intentional JSON PASS with exit 7\n');process.exitCode=7;}
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
