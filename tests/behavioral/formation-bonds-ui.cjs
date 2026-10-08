/* F15 native browser input and overlapping Bonds, registered in required CI. */
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
 const version=await send('Browser.getVersion',{},null);
 for(const width of [320,390,430])for(const textScale of [1,2])for(const motion of ['no-preference','reduce']){
  const context=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
  session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:width===320?640:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Page.navigate',{url});
  for(let i=0;i<300&&!await evaluate('!!window.__bondsNativeReady&&!!document.querySelector("#bond-card .bond-row")');i++)await new Promise(r=>setTimeout(r,20));
  await evaluate('window.__qaForgeStartup.promise');
  await evaluate(`(()=>{const b=__lumenfallQaBridge,s=b.freshStateSnapshot();s.depth=s.maxDepthEver=101;s.enemyDepth=101;s.enemyHp=s.enemyMaxHp=1e12;s.activeParty=['ember','tide','stone','gale','aurora'];s.formationPresets={push:s.activeParty.slice(),farm:['gale','thorn'],boss:['ember','stone','titan']};Object.keys(s.spirits).forEach(id=>s.spirits[id]=40);s.activeFormationPreset='push';b.setState(s);b.renderLayout();b.resetFeedback();document.querySelectorAll('.overlay').forEach(e=>e.style.display='none');document.getElementById('startup-intro').style.display='none';document.querySelector('[data-tab="spirits"]').click();document.querySelector('.formation-help').open=true;})()`);
  await evaluate('document.fonts.ready.then(()=>true)');
  if(textScale===2)await evaluate(`(()=>{const style=document.createElement('style');style.textContent=['.formation-preset-btn','.formation-preset-btn span','.formation-preset-state','.bond-name','.bond-req','.bond-effect'].map(k=>{const e=document.querySelector(k);return k+'{font-size:'+(parseFloat(getComputedStyle(e).fontSize)*2)+'px!important;}';}).join('');document.head.appendChild(style);})()`);
  const rows=await evaluate(`Array.from(document.querySelectorAll('#bond-card .bond-row')).map(e=>({name:e.querySelector('.bond-name').textContent,partners:e.querySelector('.bond-req').textContent,effect:e.querySelector('.bond-effect').textContent,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,scroll:e.scrollWidth,client:e.clientWidth}))`);
  assert(rows.length===8&&rows.every(r=>r.partners.includes(' + ')&&r.right<=width+.5&&r.scroll<=r.client+1),'all eight full partner rows fit '+JSON.stringify(rows));
  const controls=await evaluate(`Array.from(document.querySelectorAll('[data-formation-preset]')).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {w:r.width,h:r.height,right:r.right,color:s.color,background:s.backgroundColor};})`);
  assert(controls.length===3&&controls.every(c=>c.w>=44&&c.h>=44&&c.right<=width+.5),'named preset controls fit and >=44px');assert(controls.every(c=>contrast(c.color,c.background)>=4.5),'preset text contrast');
  await evaluate('document.querySelector("[data-formation-preset=farm]").focus()');const focus=await evaluate(`(()=>{const s=getComputedStyle(document.activeElement);return {width:parseFloat(s.outlineWidth),color:s.outlineColor,bg:s.backgroundColor};})()`);assert(focus.width>=2&&contrast(focus.color,focus.bg)>=3,'visible keyboard focus');
  await key('Enter');await new Promise(r=>setTimeout(r,50));assert(await evaluate('__lumenfallQaBridge.getState().activeFormationPreset==="farm"'),'native Enter selects Farm '+JSON.stringify(await evaluate('({preset:__lumenfallQaBridge.getState().activeFormationPreset,active:document.activeElement.outerHTML})')));
  await touch('[data-toggle="gale"]');assert(await evaluate('__lumenfallQaBridge.getState().formationPresets.farm.join(",")==="thorn"'),'native Bench autosaves Farm');assert(await evaluate('document.activeElement===document.querySelector("[data-toggle=gale]")'),'focus restored after Bench render');
  await touch('[data-formation-preset=push]');assert(await evaluate('__lumenfallQaBridge.getState().activeParty.join(",")==="ember,tide,stone,gale,aurora"'),'Farm edits preserve Push');
  await evaluate('document.querySelector("[data-tab=battle]").click()');
  const overlap=await evaluate(`(()=>{const b=__lumenfallQaBridge,before=JSON.stringify(b.getState());b.renderLayout();const cards=Array.from(document.querySelectorAll('[data-rift-wisp]'));return {ids:cards.map(c=>c.dataset.riftWisp),bonds:b.activeBondIds(),marks:cards.map(c=>({id:c.dataset.riftWisp,marks:Array.from(c.querySelectorAll('[data-wisp-bond]')).map(x=>x.dataset.wispBond),label:c.getAttribute('aria-label')})),effects:Array.from(document.querySelectorAll('[data-bond-effect]')).map(e=>({id:e.dataset.bondEffect,label:e.getAttribute('aria-label'),right:e.getBoundingClientRect().right})),unchanged:before===JSON.stringify(b.getState()),charge:cards.map(c=>({text:c.querySelector('[role=progressbar]').getAttribute('aria-valuetext'),transition:getComputedStyle(c.querySelector('.rift-charge>span')).transitionDuration})),errors:window.__lumenfallQaContext.errors};})()`);
  assert(overlap.ids.length===5&&new Set(overlap.ids).size===5&&overlap.unchanged,'overlap renders every Wisp once, preserves state');assert(overlap.bonds.length===4&&overlap.effects.length===4,'all overlapping effects displayed');
  for(const item of overlap.marks){const catalog=await evaluate('__lumenfallQaBridge.riftStatus.bonds()');const memberships=catalog.filter(x=>overlap.bonds.includes(x.id)&&x.ids.includes(item.id));assert(JSON.stringify(item.marks)===JSON.stringify(memberships.map(x=>x.id))&&memberships.every(x=>item.label.includes(x.name)),'all marks and accessible Bond names '+item.id);}
  assert(overlap.effects.every(e=>e.label&&e.right<=width+.5),'effects have full accessible text and fit');assert(overlap.charge.every(c=>c.text.includes('charged')&&(motion!=='reduce'||c.transition.split(',').every(v=>parseFloat(v)<=.001))),'F13 charge state and reduced motion retained '+JSON.stringify(overlap.charge));assert(!overlap.errors.length,'no browser runtime errors');
  await screenshot(`bonds-${width}-${textScale}-${motion}`);records.push({width,textScale,motion,rows,controls,focus,overlap});await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
 }
 return {status:'pass',scenario,version,records};
}
(async()=>{let result;try{result=await run();}catch(e){result={status:'fail',scenario,message:e.message,records};}
 try{assert(pending.size===0,'CDP settled');if(!closed)await send('Browser.close',{},null).catch(()=>{});let timer;const done=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout')),5000);})]).finally(()=>clearTimeout(timer));assert(closed&&done.code===0&&!done.error,'graceful browser termination');await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});result.teardown={browser:done,pending:pending.size,profileRemoved:!fs.existsSync(profile)};}catch(e){browser.kill('SIGKILL');result.status='fail';result.teardown={message:e.message,stderr};}
 console.log(JSON.stringify(result));process.exitCode=result.status==='pass'?0:1;
})();
