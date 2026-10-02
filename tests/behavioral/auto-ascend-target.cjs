/* Native input regression driver using Chrome's pipe protocol and Node built-ins.
 * No browser library/test dependency; run.py registers this in the default suite.
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

async function key(key){const spec={key,code:key,windowsVirtualKeyCode:{ArrowDown:40,ArrowUp:38,Home:36,End:35,Tab:9,Enter:13,Escape:27}[key]};await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec});}
async function snapshot(){return evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=document.querySelector('[data-autoascend-target]'),r=s.getBoundingClientRect();return {observation:autoTargetObservation(b),value:s.value,count:s.options.length,identity:s===window.nativeTargetSelect,focused:document.activeElement===s,scroll:document.querySelector('main').scrollTop,rect:{x:r.x,y:r.y,width:r.width,height:r.height},fit:s.scrollWidth<=s.clientWidth&&document.documentElement.scrollWidth<=innerWidth,runtimeErrors:window.__lumenfallQaContext.errors};})()`);}
async function run(){
 const motion=scenario.includes('reduced')?'reduce':'no-preference';
 const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Emulation.setDeviceMetricsOverride',{width:360,height:640,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Page.navigate',{url});
 for(let i=0;i<150&&!await evaluate('!!window.__autoAscendTargetReady');i++)await new Promise(r=>setTimeout(r,20));
 assert(await evaluate('!!window.__autoAscendTargetReady'),'native target page ready');await evaluate('document.fonts.ready.then(()=>true)');await evaluate('window.__qaForgeStartup.promise');
 await evaluate(`(()=>{const b=window.__lumenfallQaBridge;b.uiMeasurementPause(true);b.resetFeedback();const s=autoTargetSeed(b,43,false);s.maxDepthEver=101;s.enemyHp=s.enemyMaxHp=1000000000;s.totalTaps=9999;b.setState(s);b.save();b.renderLayout();document.querySelector('[data-tab="deeds"]').click();document.querySelector('[data-autoascend-target]').scrollIntoView({block:'center'});window.nativeTargetSelect=document.querySelector('[data-autoascend-target]');})()`);
 await advance(350);let before=await snapshot();assert(before.fit&&before.rect.height>=44&&before.rect.width>=44,'360x640 select fits and has >=44px touch target');
 // Native touch opens the real select; Escape closes its picker without a synthetic change.
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:before.rect.x+before.rect.width/2,y:before.rect.y+before.rect.height/2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await key('Escape');
 let touched=await snapshot();assert(touched.focused&&touched.identity&&touched.value==='43','real touch focuses native select without resetting target');
 await key('ArrowDown');let changed=await snapshot();assert(changed.value==='44'&&changed.observation.state.autoAscendTargetDepth===45,'real ArrowDown changes clear 43 -> 44/internal45');
 assert(changed.focused&&changed.identity&&changed.scroll===touched.scroll,'change preserves select node/focus/scroll');
 const expected=JSON.parse(JSON.stringify(touched.observation.state));expected.autoAscendTargetDepth=45;expected.lastSeen=changed.observation.state.lastSeen;
 assert(JSON.stringify(changed.observation.state)===JSON.stringify(expected),'native change only target/normal lastSeen metadata');assert(changed.observation.primary===changed.observation.recovery,'native normal save keeps recovery identical');
 assert(changed.observation.events.length===touched.observation.events.length+1&&changed.observation.events.at(-1).type==='save','native change one save');
 await key('ArrowUp');let back=await snapshot();assert(back.value==='43'&&back.observation.state.autoAscendTargetDepth===44,'real ArrowUp restores43/internal44');
 // Observers are measured immediately with intervals paused, then genuine ticks resume.
 before=await snapshot();await evaluate('window.__lumenfallQaBridge.autoTarget.render();window.__lumenfallQaBridge.refreshAffordability();window.__lumenfallQaBridge.renderLayout()');let rendered=await snapshot();assert(JSON.stringify(rendered.observation)===JSON.stringify(before.observation),'full state/save/recovery/events/persistence render purity');assert(rendered.focused&&rendered.identity&&rendered.scroll===before.scroll,'explicit refresh retains native focus and scroll');
 await advance(450);let live=await snapshot();assert(live.observation.state.enemyHp<rendered.observation.state.enemyHp,'genuine unpaused production ticks observed');assert(live.focused&&live.identity&&live.value==='43'&&live.scroll===rendered.scroll,'live ticks preserve choice/focus/scroll');
 // Force a real achievement-triggered shop render through the next normal tick.
 await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.totalTaps=10000;b.setState(s);window.nativeTargetSelect=document.querySelector('[data-autoascend-target]');})()`);before=await snapshot();await advance(350);const achievement=await snapshot();assert(achievement.observation.state.achieved.fingerblaze===true||Object.values(achievement.observation.state.achieved).filter(Boolean).length>Object.values(before.observation.state.achieved).filter(Boolean).length,'actual tick awards newly eligible Deed');assert(achievement.focused&&achievement.identity&&achievement.scroll===before.scroll,'Deed-driven shop replacement keeps real select attached');
 // Ordinary kill/affordability refresh expands a historical frontier in place.
 await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.maxDepthEver=44;s.depth=44;s.enemyDepth=44;s.enemyMaxHp=b.enemyHpFor(44);s.enemyHp=.001;b.setState(s);b.autoTarget.render();b.save();b.advanceTime(600);})()`);before=await snapshot();assert(before.count===29&&before.value==='43','encounter44 is not yet cleared');await advance(350);const frontier=await snapshot();assert(frontier.observation.state.maxDepthEver===45&&frontier.count===30&&frontier.value==='43','actual defeat44 expands options to clear44 without changing target');assert(frontier.identity&&frontier.focused&&frontier.scroll===before.scroll,'frontier update keeps focus/scroll/native node');
 // A high legitimate history has every option, with no fixed array cap.
 await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.getState();s.maxDepthEver=10001;b.setState(s);b.save();})()`);before=await snapshot();await evaluate('window.__lumenfallQaBridge.autoTarget.render()');const high=await snapshot();assert(high.count===9986&&high.value==='43'&&high.fit,'clear15..10000 all offered and selected target retained');assert(JSON.stringify(high.observation)===JSON.stringify(before.observation),'high-history option rebuild is pure');assert(high.identity&&high.focused&&high.scroll===before.scroll,'high-history rebuild retains native node/focus/scroll');
 await key('End');const end=await snapshot();assert(end.value==='10000'&&end.observation.state.autoAscendTargetDepth===10001,'native End can select highest reached Rift');await key('Home');const home=await snapshot();assert(home.value==='15'&&home.observation.state.autoAscendTargetDepth===16,'native Home selects minimum');
 await key('Tab');assert(await evaluate('document.activeElement.matches("[data-autoascend-toggle]")'),'Tab reaches existing ON/OFF control');await evaluate('document.querySelector("[data-autoascend-target]").focus({preventScroll:true})');await key('ArrowDown');const final=await snapshot();assert(final.focused&&final.identity&&final.observation.state.autoAscendEnabled===false,'keyboard editing does not switch ON');assert(final.runtimeErrors.length===0,'no runtime errors');
 if(process.env.LUMENFALL_QA_EVIDENCE_DIR){const shot=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,'auto-target-360x640-'+motion+'.png'),Buffer.from(shot.data,'base64'));}
 records.push({profile:'360x640-'+motion,touched,changed,back,rendered,live,achievement,frontier,high,end,home,final});await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 return {status:'pass',scenario,records};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
try{result.teardown=await teardown();}catch(error){result.status='fail';result.teardown={message:error.message,events:shutdownEvents,pending:pending.size,stderr};process.stderr.write(error.stack+'\n');}
console.log(JSON.stringify(result));if(result.status!=='pass')process.exitCode=1;
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
