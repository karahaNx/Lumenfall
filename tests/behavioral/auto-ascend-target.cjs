/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.cjs registers this in the default suite.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-auto-target-'));
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
async function snapshot(){return evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=document.querySelector('[data-autoascend-target]'),r=s.getBoundingClientRect();return {observation:autoTargetObservation(b),value:s.value,count:(s.options||s.parentNode.querySelector('datalist').options).length,identity:s===window.nativeTargetSelect,focused:document.activeElement===s,scroll:document.querySelector('main').scrollTop,rect:{x:r.x,y:r.y,width:r.width,height:r.height},fit:(s.tagName==='INPUT'||s.scrollWidth<=s.clientWidth)&&r.left>=0&&r.right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth,textScroll:s.scrollLeft,runtimeErrors:window.__lumenfallQaContext.errors};})()`);}
async function run(){
 const motion=scenario.includes('reduced')?'reduce':'no-preference';
 for(const [width,textScale] of [[320,1],[360,1],[390,1],[430,1],[320,1.6],[390,1.6],[430,1.6],[320,2],[390,2],[430,2]]){
  const ctx=await send('Target.createBrowserContext',{},null),target=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:width===360?640:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
  await send('Page.enable');await send('Page.navigate',{url});
  for(let i=0;i<150&&!await evaluate('!!window.__autoAscendTargetReady');i++)await new Promise(r=>setTimeout(r,20));
  assert(await evaluate('!!window.__autoAscendTargetReady'),'target page ready');await evaluate('document.fonts.ready.then(()=>true)');await evaluate('window.__qaForgeStartup.promise');
  await evaluate(`(()=>{const b=window.__lumenfallQaBridge;b.uiMeasurementPause(true);b.resetFeedback();const s=autoTargetSeed(b,43,false);s.maxDepthEver=220;s.enemyHp=s.enemyMaxHp=1e9;b.setState(s);b.save();b.renderLayout();document.documentElement.style.fontSize='${16*textScale}px';document.querySelector('[data-tab="ascend"]').click();document.querySelector('[data-autoascend-target]').scrollIntoView({block:'center'});window.nativeTargetSelect=document.querySelector('[data-autoascend-target]');})()`);
  let before=await snapshot();assert(before.fit&&before.rect.width>=44&&before.rect.height>=44,'dropdown fits and meets 44px at '+width+' scale '+textScale);
  assert(await evaluate('document.querySelector("[data-autoascend-target]").closest("#tab-ascend")!==null&&document.querySelectorAll("[data-autoascend-target]").length===1'),'one dropdown on Ascend');
  assert(await evaluate('!document.querySelector("[data-autoascend-earlier],[data-autoascend-later],[data-autoascend-find]")'),'old navigation absent');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:before.rect.x+before.rect.width/2,y:before.rect.y+before.rect.height/2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await key('Escape');
  const touched=await snapshot();assert(touched.focused&&touched.identity&&touched.value==='43','touch opens native picker without changing target');
  await key('ArrowDown');const changed=await snapshot();assert(changed.value==='44'&&changed.observation.state.autoAscendTargetDepth===45,'real keyboard changes target');
  const expected=JSON.parse(JSON.stringify(touched.observation.state));expected.autoAscendTargetDepth=45;expected.lastSeen=changed.observation.state.lastSeen;
  assert(JSON.stringify(changed.observation.state)===JSON.stringify(expected),'only target/normal save metadata change');
  assert(changed.observation.events.length===touched.observation.events.length+1,'one normal save per change');assert(changed.observation.primary===changed.observation.recovery,'recovery matches primary');
  assert(changed.identity&&changed.focused&&changed.scroll===touched.scroll,'native node/focus/scroll preserved');
  await key('End');const highNative=await snapshot();assert(highNative.value==='219'&&highNative.observation.state.autoAscendTargetDepth===220,'Rift 219 reachable in single dropdown');
  before=await snapshot();await evaluate('for(let i=0;i<10;i++){window.__lumenfallQaBridge.autoTarget.render();window.__lumenfallQaBridge.refreshAffordability();window.__lumenfallQaBridge.renderLayout();}');
  const rendered=await snapshot();assert(JSON.stringify(rendered.observation)===JSON.stringify(before.observation),'all renders are observers');assert(rendered.identity&&rendered.focused&&rendered.scroll===before.scroll,'renders retain focus and scroll');
  await advance(350);const live=await snapshot();assert(live.focused&&live.identity&&live.value==='219'&&!live.observation.state.autoAscendEnabled,'production ticks retain focus/target/OFF');
  assert(live.observation.state.enemyHp<rendered.observation.state.enemyHp,'genuine unpaused production ticks observed');
  // A real Deed and frontier expansion refresh the controls while focused.
  await evaluate('(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.totalTaps=10000;b.setState(s);})()');before=await snapshot();await advance(350);const achievement=await snapshot();
  assert(Object.values(achievement.observation.state.achieved).filter(Boolean).length>Object.values(before.observation.state.achieved).filter(Boolean).length,'actual tick awards newly eligible Deed');
  assert(achievement.focused&&achievement.identity&&achievement.scroll===before.scroll,'Deed-driven render retains picker focus and scroll');
  await evaluate('(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.maxDepthEver=221;s.depth=s.enemyDepth=221;s.enemyMaxHp=b.enemyHpFor(221);s.enemyHp=.001;b.setState(s);b.autoTarget.render();b.save();b.advanceTime(600);})()');before=await snapshot();await advance(350);const frontier=await snapshot();
  assert(before.count===206&&frontier.observation.state.maxDepthEver===222&&frontier.count===207&&frontier.value==='219','actual defeat expands every native target without changing preference: '+JSON.stringify({max:frontier.observation.state.maxDepthEver,count:frontier.count,value:frontier.value,beforeMax:before.observation.state.maxDepthEver,depth:frontier.observation.state.depth}));
  assert(frontier.identity&&frontier.focused&&frontier.scroll===before.scroll,'frontier expansion retains picker focus and scroll: '+JSON.stringify({width,textScale,identity:frontier.identity,focused:frontier.focused,before:before.rect,after:frontier.rect,scrollBefore:before.scroll,scrollAfter:frontier.scroll}));
  await evaluate('(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.depth=s.enemyDepth=43;s.enemyHp=s.enemyMaxHp=1e9;b.setState(s);b.save();})()');
  await key('Tab');assert(await evaluate('document.activeElement.matches("[data-autoascend-toggle]")'),'Tab reaches separate ON/OFF');
  before=await snapshot();await key('Space');const on=await snapshot();assert(on.observation.state.autoAscendEnabled&&on.observation.events.length===before.observation.events.length+1,'ON action saves once');
  assert(await evaluate('document.activeElement.matches("[data-autoascend-toggle]")&&document.activeElement.getAttribute("aria-pressed")==="true"&&document.activeElement.textContent==="ON"'),'ON has text and pressed semantics');
  await key('Space');const off=await snapshot();assert(!off.observation.state.autoAscendEnabled&&off.observation.events.length===on.observation.events.length+1,'OFF action saves once');
  const metrics=await evaluate(`(()=>{
    function luminance(color){const values=color.match(/[0-9.]+/g).slice(0,3).map(Number).map(c=>c/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
    return Array.from(document.querySelectorAll('[data-autoascend-target],[data-autoascend-toggle]')).map(e=>{const r=e.getBoundingClientRect(),style=getComputedStyle(e),fg=luminance(style.color),bg=luminance(style.backgroundColor);return {w:r.width,h:r.height,contrast:(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05),font:style.fontSize,outline:style.outlineStyle,animation:style.animationName};});
  })()`);
  assert(metrics.every(m=>m.w>=44&&m.h>=44&&m.contrast>=4.5),'controls meet size and contrast');
  assert(metrics[1].outline==='solid','focused toggle visible outline');if(motion==='reduce')assert(metrics.every(m=>m.animation==='none'),'controls do not animate in reduced motion');
  if(process.env.LUMENFALL_QA_EVIDENCE_DIR){const shot=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,'auto-ascend-'+width+'-'+textScale+'-'+motion+'.png'),Buffer.from(shot.data,'base64'));}
  // The large-history dropdown accepts every valid value, without a second Find control.
  await evaluate('document.activeElement.blur();(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.maxDepthEver=1e30;b.setState(s);b.save();b.autoTarget.render();document.querySelector("[data-autoascend-target]").focus({preventScroll:true});window.nativeTargetSelect=document.querySelector("[data-autoascend-target]");})()');
  async function typeTarget(value){await evaluate('document.querySelector("[data-autoascend-target]").select()');const prior=await snapshot();await send('Input.insertText',{text:value});const draft=await snapshot();assert(JSON.stringify(draft.observation)===JSON.stringify(prior.observation),'typing does not commit target or ON/OFF');await key('Enter');return snapshot();}
  const endpoint=await typeTarget('9007199254740991');assert(endpoint.value==='9007199254740991'&&endpoint.observation.state.autoAscendTargetDepth===9007199254740992,'safe endpoint reachable through same dropdown');assert(endpoint.count<=201&&endpoint.identity&&endpoint.focused&&endpoint.fit,'large dropdown bounded and fits');
  const chosen=await typeTarget('219');assert(chosen.observation.state.autoAscendTargetDepth===220&&!chosen.observation.state.autoAscendEnabled,'large-history choice preserves OFF');
  before=await snapshot();const invalid=await typeTarget('219.5');assert(JSON.stringify(invalid.observation)===JSON.stringify(before.observation),'invalid input cannot mutate saves');assert(await evaluate('document.querySelector("[data-autoascend-target]").getAttribute("aria-invalid")==="true"'),'invalid input announced');
  await typeTarget('219');before=await snapshot();await key('Tab');const blurred=await snapshot();assert(JSON.stringify(blurred.observation)===JSON.stringify(before.observation),'Enter then blur no duplicate save');
  // Deeds shortcut navigates to this same control and does not change any preference.
  await evaluate('document.querySelector("[data-tab=deeds]").click()');before=await snapshot();await evaluate('document.querySelector("[data-autoascend-open]").click()');const shortcut=await snapshot();assert(shortcut.focused&&JSON.stringify(shortcut.observation)===JSON.stringify(before.observation),'Deeds shortcut only navigates and focuses');
  // Unlock keeps the existing deterministic cost/default and has one handler.
  await evaluate('(()=>{const b=window.__lumenfallQaBridge,s=b.freshStateSnapshot();s.comets=500;s.maxDepthEver=56;b.setState(s);b.renderLayout();document.querySelector("[data-autoascend-unlock]").click();})()');
  const locked=await evaluate('autoTargetObservation(window.__lumenfallQaBridge)');await evaluate('document.querySelector("[data-shop=autoascend]").click()');
  const bought=await snapshot();assert(bought.observation.state.comets===locked.state.comets-100&&bought.observation.state.owned.autoascend&&bought.observation.state.autoAscendEnabled&&bought.observation.state.autoAscendTargetDepth===56,'unlock price/ownership/default retained');
  assert(bought.observation.events.length===locked.events.length+1,'purchase saves once');assert(!await evaluate('document.querySelector("#shop-list [data-autoascend-toggle],#shop-list [data-autoascend-target]")!==null'),'Deeds purchase leaves no duplicate operating controls');
  await evaluate('document.querySelector("[data-shop=comettrials]").scrollIntoView({block:"center"});document.querySelector("[data-shop=comettrials]").focus({preventScroll:true})');before=await snapshot();await key('Space');const purchased=await snapshot();
  assert(purchased.observation.state.owned.comettrials&&purchased.observation.state.comets===before.observation.state.comets-140,'existing Comet Trials purchase retains exact price and ownership');
  assert(purchased.observation.events.length===before.observation.events.length+1,'other Deeds purchase saves once');assert(await evaluate('document.activeElement.matches("[data-trial-choice]")'),'shop focus moves to newly unlocked Trial control');
  assert(purchased.runtimeErrors.length===0,'no browser runtime errors');records.push({width,textScale,motion,touched,changed,highNative,rendered,live,achievement,frontier,on,off,metrics,endpoint,chosen,invalid,shortcut,bought,purchased});
  await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
 return {status:'pass',scenario,records};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
try{result.teardown=await teardown();}catch(error){result.status='fail';result.teardown={message:error.message,events:shutdownEvents,pending:pending.size,stderr};process.stderr.write(error.stack+'\n');}
console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
