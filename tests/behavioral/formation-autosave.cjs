/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.py registers this in the default suite.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-formation-autosave-'));
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

async function key(key){const spec=key==='Space'?{key:' ',code:'Space',windowsVirtualKeyCode:32}:{key,code:key,windowsVirtualKeyCode:{ArrowDown:40,ArrowUp:38,Home:36,End:35,Tab:9,Enter:13,Escape:27}[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
async function tap(selector){
 const r=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(r.width<44||r.height<44)throw Error('touch target below 44px '+${JSON.stringify(selector)}+' '+r.width+'x'+r.height);if(!e.contains(document.elementFromPoint(x,y)))throw Error('touch target obstructed '+${JSON.stringify(selector)});return {x:x,y:y};})()`);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[r]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
async function run(){
 const motion=scenario.includes('reduced')?'reduce':'no-preference';
 const browserIdentity=await send('Browser.getVersion',{},null);
 for(const width of [320,390,430])for(const large of [false,true]){
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Page.navigate',{url});
  for(let i=0;i<250&&!await evaluate('!!window.__formationAutosaveNativeReady');i++)await new Promise(r=>setTimeout(r,20));
  assert(await evaluate('!!window.__formationAutosaveNativeReady'),'native Formation page ready');
  await evaluate('document.fonts.ready.then(()=>true)');await evaluate('window.__qaForgeStartup.promise');
  const contract=await evaluate(`(()=>{const b=window.__lumenfallQaBridge;b.uiMeasurementPause(true);b.resetFeedback();return runFormationAutosaveQa(b,window.__lumenfallQaContext,function(v,m){if(!v)throw Error(m);});})()`);
  await new Promise(resolve=>setTimeout(resolve,1750)); // Let real Ascend flashes expire.
  await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=formationAutosaveSeed(b);s.formationPresets.farm=[];b.setState(s);b.save();b.renderLayout();document.querySelector('[data-tab="spirits"]').click();if(${large}){const style=document.createElement('style');style.textContent='.formation-preset-title{font-size:1.64rem!important}.formation-preset-state{font-size:22px!important}.formation-preset-btn{font-size:24px!important}.formation-preset-btn span{font-size:20px!important}.formation-rebuild-note{font-size:1.5rem!important}.active-toggle{font-size:24px!important}.formation-member{font-size:22px!important}';document.head.appendChild(style);}window.formationObservation=function(){const b=window.__lumenfallQaBridge;return {state:b.getState(),primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace()};};})()`);
  await tap('[data-formation-preset="farm"]');
  let changed=await evaluate(`(()=>{const o=formationObservation();return {selected:o.state.activeFormationPreset,party:o.state.activeParty,saved:JSON.parse(o.primary).formationPresets.farm,recovery:o.primary===o.recovery,focus:document.activeElement.dataset.formationPreset};})()`);
  assert(changed.selected==='farm'&&changed.party.join(',')==='ember'&&!changed.saved.length&&changed.recovery&&changed.focus==='farm','native touch selects empty saved Farm with temporary Ember and preserves focus');
  await tap('[data-toggle="stone"]');
  changed=await evaluate(`(()=>{const o=formationObservation();return {party:o.state.activeParty,presets:o.state.formationPresets,saved:JSON.parse(o.primary).formationPresets,focus:document.activeElement.dataset.toggle};})()`);
  assert(changed.party.join(',')==='stone'&&changed.presets.farm.join(',')==='stone'&&JSON.stringify(changed.presets)===JSON.stringify(changed.saved)&&changed.focus==='stone','real touch Field autosaves only Farm and retains focus');
  await key('Space');
  assert(await evaluate(`(()=>{const o=formationObservation();return o.state.activeParty.join(',')==='stone'&&JSON.parse(o.primary).formationPresets.farm.join(',')==='stone'&&document.activeElement.dataset.toggle==='stone';})()`),'real keyboard last Bench retains one Wisp and focus');
  await tap('[data-formation-preset="boss"]');
  await key('Space'); // Establish keyboard modality for :focus-visible.
  const pure=await evaluate(`(()=>{const b=window.__lumenfallQaBridge,main=document.querySelector('main'),before=formationObservation(),scroll=main.scrollTop;b.renderLayout();return {same:JSON.stringify(formationObservation())===JSON.stringify(before),focus:document.activeElement.dataset.formationPreset,scroll:main.scrollTop===scroll};})()`);
  assert(pure.same&&pure.focus==='boss'&&pure.scroll,'render has no state/save effects and retains focus/scroll');
  const visual=await evaluate(`(()=>{
   const root=document.querySelector('#formation-presets'),canvas=document.createElement('canvas'),c=canvas.getContext('2d');
   function rgb(color){c.clearRect(0,0,1,1);c.fillStyle=color;c.fillRect(0,0,1,1);return Array.from(c.getImageData(0,0,1,1).data).slice(0,3);}
   function lum(color){const a=rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
   function contrast(a,b){a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
   return {width:innerWidth,rootFits:root.scrollWidth<=root.clientWidth+1,documentFits:document.documentElement.scrollWidth<=innerWidth+1,
    controls:Array.from(root.querySelectorAll('[data-formation-preset]')).map(e=>{const r=e.getBoundingClientRect(),css=getComputedStyle(e),span=getComputedStyle(e.querySelector('span'));return {preset:e.dataset.formationPreset,w:r.width,h:r.height,textContrast:contrast(css.color,css.backgroundColor),detailContrast:contrast(span.color,css.backgroundColor)};}),
    focus:{style:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth,contrast:contrast(getComputedStyle(document.activeElement).outlineColor,getComputedStyle(document.activeElement).backgroundColor)},
    noSave:!root.querySelector('[data-save-formation]'),selected:root.querySelector('[aria-pressed="true"]').dataset.formationPreset,errors:window.__lumenfallQaContext.errors};
  })()`);
  assert(visual.width===width&&visual.rootFits&&visual.documentFits,'exact mobile viewport fits Formation at '+width+' large='+large);
  assert(visual.controls.every(r=>r.w>=44&&r.h>=44&&r.textContrast>=4.5&&r.detailContrast>=4.5),'44px and text contrast at '+width+' '+JSON.stringify(visual.controls));
  assert(visual.focus.style!=='none'&&parseFloat(visual.focus.width)>=2&&visual.focus.contrast>=3&&visual.noSave&&visual.selected==='boss'&&!visual.errors.length,'visible keyboard focus, selection and no runtime errors '+JSON.stringify(visual));
  const beforeLive=await evaluate('window.__lumenfallQaBridge.getState()');await advance(350);
  const afterLive=await evaluate('window.__lumenfallQaBridge.getState()');assert(afterLive.enemyHp<beforeLive.enemyHp||afterLive.totalKills>beforeLive.totalKills,'actual unpaused production combat advances');
  assert(await evaluate('document.activeElement.dataset.formationPreset==="boss"'),'actual game ticks keep preset focus');
  await evaluate('document.querySelector("#formation-presets").scrollIntoView({block:"start"})');
  if(process.env.LUMENFALL_QA_EVIDENCE_DIR){const shot=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,'formation-'+width+'-'+motion+'-'+(large?'large':'normal')+'.png'),Buffer.from(shot.data,'base64'));}
  records.push({width,large,motion,contract,visual,touch:true,keyboard:true,renderPurity:true});await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
 return {status:'pass',scenario,browserIdentity,records};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
try{result.teardown=await teardown();}catch(error){result.status='fail';result.teardown={message:error.message,events:shutdownEvents,pending:pending.size,stderr};process.stderr.write(error.stack+'\n');}
console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;})();
