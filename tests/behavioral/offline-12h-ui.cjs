'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {serve}=require('../../scripts/lib/static-server.cjs'),{instrumentHtml,loadFixtures}=require('./run.cjs');
const root=path.resolve(__dirname,'../..'),stage=fs.mkdtempSync(path.join(os.tmpdir(),'offline-12h-ui-'));
const evidence=path.join(root,'docs/qa/offline-12h-001/ui');fs.mkdirSync(evidence,{recursive:true});
fs.cpSync(path.join(root,'mobile/www'),stage,{recursive:true});
const instrumented=instrumentHtml(fs.readFileSync(path.join(root,'index.html'),'utf8'),loadFixtures());
fs.writeFileSync(path.join(stage,'index.html'),instrumented.replace('window.__lumenfallQaBridge = {','window.__offline12hRenderHud=renderHud;\nwindow.__lumenfallQaBridge = {'));
let browser,server,session,seq=0,buffer='',closed=false,completion;const pending=new Map(),records=[];
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP deadline '+method));},10000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function key(key,code=key){await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key,code,windowsVirtualKeyCode:key===' '?32:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:key===' '?32:9});}
async function run(){
 server=await serve(stage);const url='http://127.0.0.1:'+server.address().port+'/index.html?qaScenario=nav-workshop-contract&qaFixture=fresh';
 browser=spawn(process.argv[2] || '/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+path.join(stage,'profile'),'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 completion=new Promise(resolve=>{browser.once('error',e=>resolve({error:e.message}));browser.once('close',(code,signal)=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});});});
 browser.stderr.on('data',()=>{});for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',()=>{});
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 for(const width of [320,390,430])for(const scale of [1,1.5,2]){
  const ctx=await send('Target.createBrowserContext',{},null),tab=await send('Target.createTarget',{url:'about:blank',browserContextId:ctx.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:scale>1?'reduce':'no-preference'}]});await send('Page.enable');await send('Page.navigate',{url});
  const deadline=Date.now()+10000;while(!await evaluate("!!document.querySelector('#qa-result[data-status]')")){assert(Date.now()<deadline,'startup deadline');await new Promise(r=>setTimeout(r,20));}
  await evaluate(`(()=>{const b=window.__lumenfallQaBridge,s=b.freshStateSnapshot();s.schemaVersion=1;delete s.offline12hRefund;s.owned={offline24:true,offline48:true};s.nodes.reserves=3;s.comets=100;s.prisms=100;s.maxDepthEver=101;s.achieved.d100=true;b.setState(s);b.upgradeClarity.render();document.documentElement.style.fontSize=${JSON.stringify(scale*100+'%')};document.querySelector('[data-tab=deeds]').focus();})()`);
  await key(' ','Space');await evaluate('document.fonts.ready');
  // The completed QA scenario pauses CSS animations as well as gameplay. Keep
  // gameplay frozen but let entrance transforms settle before target geometry.
  await evaluate("document.querySelector('#qa-result').style.display='none';document.body.classList.remove('app-paused');window.__offline12hRenderHud();document.querySelector('#toast').classList.remove('show')");
  const observation=await evaluate(`(async()=>{
   const b=window.__lumenfallQaBridge;let card=document.querySelector('[data-offline-policy]');card.scrollIntoView({block:'center'});
   const measure=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {text:e.textContent,w:r.width,h:r.height,left:r.left,right:r.right,font:s.fontSize,color:s.color,bg:s.backgroundColor};};
   const before=JSON.stringify(b.getState());document.querySelector('[data-shop=comettrials]').focus({preventScroll:true});const focused=document.activeElement;
   b.upgradeClarity.render();const focusKept=document.activeElement.isConnected&&document.activeElement.dataset.shop===focused.dataset.shop;
   await new Promise(resolve=>setTimeout(resolve,450));card=document.querySelector('[data-offline-policy]');card.scrollIntoView({block:'center'});
   return {width:innerWidth,card:measure(card),lines:Array.from(card.querySelectorAll('.name,.desc')).map(measure),overflow:card.scrollWidth-card.clientWidth,
    controls:Array.from(document.querySelectorAll('#shop-list button')).map(measure),retiredAbsent:!document.querySelector('[data-shop=offline24],[data-shop=offline48],[data-node=reserves]'),
    state:b.getState(),renderPure:before===JSON.stringify(b.getState()),focusKept,outline:getComputedStyle(document.activeElement).outlineStyle,
    backdrop:getComputedStyle(card).backgroundImage,
    retiredUnlockAbsent:!document.querySelector('#ach-list').textContent.includes('Deep Reserves'),
    reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,errors:window.__lumenfallQaContext.errors};
  })()`);
  records.push({width,scale,...observation});
  assert(observation.retiredAbsent&&observation.retiredUnlockAbsent&&observation.renderPure&&observation.focusKept);assert.notEqual(observation.outline,'none');assert.equal(observation.errors.length,0);
  assert.equal(observation.state.prisms,132);assert.equal(observation.state.comets,400);assert(observation.card.text.includes('12-hour limit'));assert(observation.card.text.includes('300 Comets and 32 Prisms'));
  assert(observation.card.w>0&&observation.card.h>0&&observation.card.left>=0&&observation.card.right<=width+1);assert(observation.overflow<=1,'notice text wraps');assert(observation.controls.every(r=>r.w>=44&&r.h>=44),'remaining shop controls meet 44px');
  function rgb(value){return value.match(/[\d.]+/g).slice(0,3).map(Number);}
  function luminance(rgb){const c=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  const opaque=(observation.backdrop.match(/rgb\([^)]*\)/g)||[]).map(rgb);assert(opaque.length>=2,'opaque card gradient is measured');
  // A channel-wise upper bound covers every gradient position, including the
  // radial accent's maximum opacity. This is stricter than testing endpoints.
  let brightest=[0,1,2].map(i=>Math.max(...opaque.map(color=>color[i])));
  for(const overlay of observation.backdrop.match(/color\(srgb[^)]*\)/g)||[]){
   const parts=overlay.match(/[\d.]+/g).map(Number),alpha=parts[3];assert(alpha>=0&&alpha<=1);
   brightest=brightest.map((channel,i)=>Math.max(channel,channel*(1-alpha)+parts[i]*255*alpha));
  }
  const bgLuminance=luminance(brightest);observation.backgroundUpperBound=brightest;
  observation.contrast=observation.lines.map(line=>{const foreground=luminance(rgb(line.color));assert(foreground>bgLuminance);return (foreground+.05)/(bgLuminance+.05);});
  assert(observation.contrast.every(v=>v>=4.5),'all new text meets contrast including the radial overlay');
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(evidence,`${width}-${scale}.png`),Buffer.from(shot.data,'base64'));
  records[records.length-1].contrast=observation.contrast;
  records[records.length-1].backgroundUpperBound=observation.backgroundUpperBound;
  await evaluate('document.querySelector("[data-tab=workshop]").focus({preventScroll:true})');await key(' ','Space');
  await evaluate('document.querySelector("[data-tab=research]").focus({preventScroll:true})');await key(' ','Space');
  await new Promise(r=>setTimeout(r,450));
  const lab=await evaluate(`(()=>{const help=document.querySelector('#study-list > .section-sub:last-child');help.scrollIntoView({block:'center'});const r=help.getBoundingClientRect();return {text:help.textContent,left:r.left,right:r.right,overflow:help.scrollWidth-help.clientWidth,visible:!!help.getClientRects().length,focused:document.activeElement.dataset.tab};})()`);
  assert(lab.visible&&lab.text.includes('12-hour offline limit with rewards and automation'));
  assert(lab.left>=0&&lab.right<=width+1&&lab.overflow<=1&&lab.focused==='research');
  records[records.length-1].lab=lab;
  const labShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(evidence,`lab-${width}-${scale}.png`),Buffer.from(labShot.data,'base64'));
  await send('Target.disposeBrowserContext',{browserContextId:ctx.browserContextId},null);
 }
}
(async()=>{let error;try{await run();}catch(e){error=e;}
 try{if(browser){assert.equal(pending.size,0);if(!closed)await send('Browser.close',{},null).catch(()=>{});let timer;const done=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser exit deadline')),5000);})]).finally(()=>clearTimeout(timer));assert.equal(done.code,0);assert(!done.error);}if(server)await new Promise(r=>server.close(r));fs.rmSync(stage,{recursive:true,force:true});}catch(e){error=error||e;browser?.kill('SIGKILL');}
 console.log(JSON.stringify({status:error?'fail':'pass',scenario:'offline-12h-ui',message:error?.message,records},null,2));if(error)process.exitCode=1;
})();
