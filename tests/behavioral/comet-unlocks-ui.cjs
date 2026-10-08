/* Native mobile input, text scaling, focus, cosmetic geometry/reduced motion.
 * Built-in CDP transport follows the existing Lab/Forge native drivers. */
'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-comet-ui-'));
const browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',stderr='',session,closed=false;const pending=new Map(),records=[];
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
const completion=new Promise(resolve=>{browser.once('error',e=>{rejectPending(e.message);resolve({error:e.message});});browser.once('close',(code,signal)=>{closed=true;rejectPending('browser closed');resolve({code,signal});});});
browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',e=>rejectPending(e.message));
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(value,message){if(!value)throw Error(message);}
function contrast(a,b){
  function luminance(color){const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{value/=255;return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
  const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
async function screenshot(name){
  if(!process.env.LUMENFALL_QA_EVIDENCE_DIR)return;
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.LUMENFALL_QA_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.LUMENFALL_QA_EVIDENCE_DIR,name+'.png'),Buffer.from(shot.data,'base64'));
}
async function key(key){const code=key==='Space'?' ':key;await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key:code,code:key,windowsVirtualKeyCode:key==='Space'?32:13,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key:code,code:key,windowsVirtualKeyCode:key==='Space'?32:13});}
async function touch(selector){
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
  await new Promise(resolve=>setTimeout(resolve,200));
  const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:e.contains(document.elementFromPoint(x,y))};})()`);
  assert(point.hit,'native touch target visible '+selector+' '+JSON.stringify(point));
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
async function run(){
  const motion=scenario==='comet-unlocks-reduced-motion'?'reduce':'no-preference';
  for(const width of [320,390,430])for(const textScale of [1,2]){
    const context=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
    session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Page.navigate',{url});
    for(let i=0;i<300&&!await evaluate('!!window.__cometNativeReady');i++)await new Promise(resolve=>setTimeout(resolve,20));
    assert(await evaluate('!!window.__cometNativeReady'),'native Comet dispatcher ready');await evaluate('window.__qaForgeStartup.promise');await evaluate('document.fonts.ready.then(()=>true)');
    assert(await evaluate('!document.querySelector("#qa-result[data-status=fail]")'),'no generic harness failure');
    await evaluate(`(()=>{const b=window.__lumenfallQaBridge;b.uiMeasurementPause(true);b.resetFeedback();const s=b.getState();s.maxDepthEver=101;s.depth=16;s.comets=1000;s.autoAscendEnabled=false;s.owned={autoascend:true,comettrials:true,rifttrail:true,starfallcrest:true};s.cometTrial=null;s.cometTrialMarks={};s.cometCosmetics={trail:false,crest:false};b.setState(s);b.comet.render();b.comet.tab('deeds');})()`);
    await new Promise(resolve=>setTimeout(resolve,550));
    if(textScale===2)await evaluate(`(()=>{const selectors=['#shop-list','#theme-list','#shop-list .name','#shop-list .desc','#shop-list .comet-trial-status','#shop-list label','#shop-list button','#shop-list select','#shop-list input','#theme-list .name','#theme-list .desc','#theme-list button'];const rules=selectors.map(selector=>{const el=document.querySelector(selector);return el?selector+'{font-size:'+(parseFloat(getComputedStyle(el).fontSize)*2)+'px!important;}':'';});const style=document.createElement('style');style.textContent=rules.join('');document.head.appendChild(style);})()`);
    await evaluate('document.querySelector("[data-trial-target]").focus()');await send('Input.insertText',{text:'20'});
    // Native insert into selected number input; rerenders must retain its node,
    // focus and draft even while other Deeds change.
    await evaluate('window.__cometTargetNode=document.querySelector("[data-trial-target]");window.__cometTargetNode.value="20";window.__cometTargetNode.dispatchEvent(new Event("input",{bubbles:true}));window.__lumenfallQaBridge.comet.shop()');
    assert(await evaluate('document.activeElement===window.__cometTargetNode&&document.querySelector("[data-trial-target]")===window.__cometTargetNode&&window.__cometTargetNode.value==="20"'),'draft input retained across rendering');
    const controls=await evaluate(`Array.from(document.querySelectorAll('[data-trial-choice],[data-trial-target],[data-trial-queue]')).map(e=>{const r=e.getBoundingClientRect(),style=getComputedStyle(e);return {w:r.width,h:r.height,named:!!(e.labels&&e.labels.length)||!!e.textContent.trim(),fits:r.x>=0&&r.right<=innerWidth,color:style.color,background:style.backgroundColor};})`);
    assert(controls.every(control=>control.w>=44&&control.h>=44&&control.named&&control.fits),'Trial controls named, fit and >=44px '+JSON.stringify(controls));
    assert(controls.every(control=>contrast(control.color,control.background)>=4.5),'Trial control text contrast >=4.5');
    const focus=await evaluate(`(()=>{const style=getComputedStyle(document.activeElement);return {ring:style.outlineColor,width:parseFloat(style.outlineWidth),background:style.backgroundColor};})()`);
    assert(focus.width>=2&&contrast(focus.ring,focus.background)>=3,'visible keyboard focus');
    await screenshot(`comet-deeds-${width}-${textScale}-${motion}`);
    await touch('[data-trial-queue]');let pendingTrial=await evaluate('window.__lumenfallQaBridge.getState().cometTrial');
    assert(pendingTrial.phase==='pending'&&pendingTrial.target===20,'real touch queues one Trial');
    await evaluate('document.querySelector("[data-trial-cancel]").focus()');await key('Space');assert(await evaluate('window.__lumenfallQaBridge.getState().cometTrial===null'),'native Space cancels');
    const visible=await evaluate('document.querySelector("#theme-list").closest(".tab-panel").id');
    await touch('[data-comet-cosmetic="trail"]');await evaluate('document.querySelector("[data-comet-cosmetic=crest]").focus()');await key('Enter');
    const cosmetic=await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.getState(),trail=document.querySelector('.comet-trail'),style=getComputedStyle(trail);return {selected:s.cometCosmetics,aura:s.riftTheme,animation:style.animationName,controls:Array.from(document.querySelectorAll('[data-comet-cosmetic]')).map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,pressed:e.getAttribute('aria-pressed')})),errors:window.__lumenfallQaContext.errors};})()`);
    assert(cosmetic.selected.trail&&cosmetic.selected.crest&&cosmetic.aura==='default','independent cosmetic slots equipped by native input '+JSON.stringify(cosmetic));
    assert(cosmetic.controls.every(control=>control.w>=44&&control.h>=44&&control.pressed==='true'),'cosmetic controls >=44px and pressed');
    assert(motion!=='reduce'||cosmetic.animation==='none','reduced-motion trail static');assert(!cosmetic.errors.length,'no runtime errors');
    await evaluate('window.__lumenfallQaBridge.comet.tab("battle")');
    await new Promise(resolve=>setTimeout(resolve,550));
    const geometry=await evaluate(`(()=>{const hp=document.querySelector('.hp-wrap').getBoundingClientRect(),trail=document.querySelector('.comet-trail').getBoundingClientRect(),crest=document.querySelector('.comet-crest'),r=crest.getBoundingClientRect(),stage=document.querySelector('#enemy-stage');return {hpClear:trail.bottom<=hp.top&&r.bottom<=hp.top,trailPointer:getComputedStyle(document.querySelector('.comet-trail')).pointerEvents,crest:crest.textContent,crestVisible:r.width===32&&r.height===32&&getComputedStyle(crest).display==='block',tapHit:stage.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),button:stage.tagName};})()`);
    assert(geometry.hpClear&&geometry.trailPointer==='none'&&geometry.crest.includes('✦')&&geometry.crestVisible&&geometry.tapHit&&geometry.button==='BUTTON','cosmetics visible and preserve HP/tap geometry '+JSON.stringify(geometry));
    await screenshot(`comet-rift-${width}-${textScale}-${motion}`);
    records.push({width,textScale,motion,controls,focus,pendingTrial,cosmetic,geometry,visible});await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
  }
  return {status:'pass',scenario,records};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,message:error.message,records};}
  try{assert(pending.size===0,'all CDP operations settled');if(!closed)await send('Browser.close',{},null).catch(()=>{});let timer;const done=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout')),5000);})]).finally(()=>clearTimeout(timer));assert(closed&&done.code===0&&!done.error,'graceful browser termination');await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});result.teardown={browser:done,pending:pending.size,profileRemoved:!fs.existsSync(profile)};}catch(error){browser.kill('SIGKILL');result.status='fail';result.teardown={message:error.message,stderr};}
  process.stdout.write(JSON.stringify(result)+'\n');process.exitCode=result.status==='pass'?0:1;
})();
