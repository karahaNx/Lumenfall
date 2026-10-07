#!/usr/bin/env node
'use strict';
// Local F12 evidence only. Executes the frozen candidate's existing assertions.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {spawn,spawnSync}=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const candidate=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||'');
assert(fs.existsSync(path.join(candidate,'tests/behavioral/run.py')),'Supply restored frozen B2 candidate, then evidence directory');
fs.mkdirSync(out,{recursive:true});
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f12-stage-'));
// The hash-preserved B2 delivery predates Node tooling. Reuse its original
// staging helper; no Python source or frozen candidate bytes are changed.
const staging=spawnSync('python3',['-c',"import sys; from pathlib import Path; sys.path.insert(0,sys.argv[1]+'/tests/behavioral'); import run; Path(sys.argv[2]+'/index.html').write_text(run.instrument_html(Path(sys.argv[1]+'/index.html').read_text(),run.load_fixtures()))",candidate,stage],{stdio:'inherit',timeout:15000});
assert.equal(staging.status,0,'original B2 instrumentation');
for(const name of ['fonts','branding'])fs.cpSync(path.join(candidate,name),path.join(stage,name),{recursive:true});
const source=fs.readFileSync(path.join(candidate,'index.html'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(source),'7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b','exact frozen B2 source');
const server=http.createServer((req,res)=>{
 const file=path.resolve(stage,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(stage+path.sep)){res.writeHead(403);res.end();return;}
 const type={'.html':'text/html','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
 fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':type});res.end(error?'missing':data);});
});
let browser,closed=false,session,seq=0,buffer='',stderr='',completion;
const pending=new Map(),records=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function rejectAll(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message));}pending.clear();}
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{
 const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},15000);
 pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');
});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression){const deadline=Date.now()+60000;while(Date.now()<deadline){
 try{const v=await evaluate(expression);if(v)return v;}catch(error){
  // Persistence assertions deliberately reload. Only retry context loss;
  // their final completed result and runtime-error list remain mandatory.
  if(!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context/.test(error.message))throw error;
 }
 await delay(20);
}throw Error('No completed result: '+expression);}
async function page(scenario,width=390,motion='no-preference'){
 const context=await send('Target.createBrowserContext',{},null);
 const tab=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
 session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
 await send('Page.enable');
 await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/index.html?'+new URLSearchParams({qaScenario:scenario,qaFixture:'fresh'})});
 return context.browserContextId;
}
async function existing(scenario,width=390){
 const context=await page(scenario,width);
 const result=JSON.parse(await until('document.querySelector("#qa-result[data-status]")?.textContent'));
 records.push({kind:'unchanged-existing-assertions',width,result});
 fs.writeFileSync(path.join(out,scenario+'-'+width+'.json'),JSON.stringify(result,null,2)+'\n');
 assert.equal(result.scenario,scenario);assert.equal(result.status,'pass',JSON.stringify(result.detail));assert.deepEqual(result.runtimeErrors,[]);
 console.log('PASS '+scenario+' '+width+'px');
 await send('Target.disposeBrowserContext',{browserContextId:context},null);
}
async function largeText(width){
 const context=await page('lab-motes-native',width,'reduce');
 await until('!!window.__labMotesNativeReady');await evaluate('window.__qaForgeStartup.promise');await evaluate('document.fonts.ready.then(()=>true)');
 const result=await evaluate(`(()=>{
  const b=window.__lumenfallQaBridge;b.uiMeasurementPause(true);
  const s=labMotesSeed(b,window.__lumenfallQaContext);s.motes=0;s.studyUseMotes.guardmastery=true;s.studySpeedTargets.guardmastery=3;s.activeStudies=[{id:'guardmastery',remainingSec:150,totalDurationSec:150,speedMult:1}];b.setState(s);b.renderLayout();document.querySelector('[data-tab="research"]').click();
  const root=document.querySelector('#study-list');
  const sizes=Array.from(root.querySelectorAll('*')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);
  sizes.forEach(([e,size])=>e.style.fontSize=(size*2)+'px');
  const controls=Array.from(root.querySelectorAll('[data-study-use-motes],[data-study-speed-target]')).map(e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return {width:r.width,height:r.height,label:e.getAttribute('aria-label'),color:c.color,background:c.backgroundColor,font:c.fontSize};});
  const focused=document.querySelector('[data-study-use-motes="guardmastery"]');focused.focus();
  return {viewport:innerWidth,textScale:2,motion:matchMedia('(prefers-reduced-motion:reduce)').matches,controls,fit:document.documentElement.scrollWidth<=innerWidth+1&&root.scrollWidth<=root.clientWidth+1,focus:document.activeElement===focused,outline:{style:getComputedStyle(focused).outlineStyle,width:getComputedStyle(focused).outlineWidth,color:getComputedStyle(focused).outlineColor},state:b.getState(),errors:window.__lumenfallQaContext.errors};
 })()`);
 const rgb=s=>{
  const values=s.match(/[\d.]+/g)?.map(Number);
  assert(values&&values.length>=3,'supported computed color '+s);
  assert(values.length===3||values[3]===1,'opaque control color '+s);
  const channels=s.startsWith('color(srgb ')?values.slice(0,3):/^rgba?\(/.test(s)?values.slice(0,3).map(v=>v/255):null;
  assert(channels&&channels.every(v=>v>=0&&v<=1),'sRGB control color '+s);
  return channels.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 };
 const luminance=s=>{const c=rgb(s);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 result.controls.forEach(c=>{const a=luminance(c.color),b=luminance(c.background);c.contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);});
 records.push({kind:'additional-large-text',width,result});fs.writeFileSync(path.join(out,'large-text-'+width+'.json'),JSON.stringify(result,null,2)+'\n');
 const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'large-text-'+width+'.png'),Buffer.from(shot.data,'base64'));
 assert(result.fit,'200% text horizontal overflow');assert(result.focus&&result.outline.style!=='none'&&parseFloat(result.outline.width)>=1,'visible focus');assert(result.motion,'reduced motion');assert.deepEqual(result.errors,[]);
 result.controls.forEach(c=>{assert(c.width>=44&&c.height>=44,'44px control');assert(c.label,'named control');assert(c.contrast>=4.5,'control text contrast');});
 assert.equal(result.state.motes,0);assert.equal(result.state.activeStudies[0].speedMult,1);assert.equal(result.state.studySpeedTargets.guardmastery,3);
 console.log('PASS 200% text/focus/contrast/reduced-motion '+width+'px');
 await send('Target.disposeBrowserContext',{browserContextId:context},null);
}
async function main(){
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f12-cdp-'));
 browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 completion=new Promise(resolve=>{browser.once('error',e=>{rejectAll(e.message);resolve({error:e.message});});browser.once('close',(code,signal)=>{closed=true;rejectAll('browser closed');resolve({code,signal});});});
 browser.stderr.on('data',b=>stderr=(stderr+b).slice(-8000));
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 let failure,teardown;
 try{
  for(const scenario of ['lab-motes-contracts','lab-motes-chronology','lab-motes-save-reload','lab-motes-backup-restore','lab-motes-recovery','lab-motes-reset'])await existing(scenario);
  for(const width of [320,390,430])await existing('lab-motes-ui',width);
  for(const width of [320,390,430])await largeText(width);
 }catch(e){failure={message:e.message,stack:e.stack};}
 finally{
  if(!closed)await send('Browser.close',{},null).catch(()=>{});
  let timer;teardown=await Promise.race([completion,new Promise(resolve=>timer=setTimeout(()=>resolve({timeout:true}),5000))]);clearTimeout(timer);
  if(!closed){browser.kill('SIGKILL');await completion;failure||={message:'browser teardown timeout'};}
  await new Promise(resolve=>server.close(resolve));fs.rmSync(stage,{recursive:true,force:true});fs.rmSync(profile,{recursive:true,force:true});
 }
 const report={status:failure?'fail':'pass',sourceSHA256:sha(source),candidateTree:'758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef',node:process.version,browser:'Chromium 151; modern browser only',records,failure,teardown};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n');assert.equal(sha(fs.readFileSync(path.join(candidate,'index.html'))),sha(source),'source untouched');
 if(failure||teardown.code!==0)throw Error(failure?.message||'browser exited abnormally');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
