/* F07 browser acceptance. Reuse run.cjs's existing instrumentation/fixtures;
 * this JavaScript driver owns HTTP, CDP and every assertion.
 * node tests/behavioral/rift-guidance.cjs chromium webRoot evidenceDir
 * --baseline-probe records the original hide-induced geometry shift.
 * --existing-contract runs the existing Rift contract with the CDP driver.
 */
'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const [chrome,webRoot,evidenceDir,...flags]=process.argv.slice(2);
if(!chrome||!webRoot||!evidenceDir)throw Error('Expected chrome, instrumented webRoot, evidenceDir');
const sourceRoot=path.resolve(webRoot),root=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-guidance-www-')),out=path.resolve(evidenceDir),baseline=flags.includes('--baseline-probe'),contract=flags.includes('--existing-contract');
const {instrumentHtml,loadFixtures}=require('./run.cjs'),source=fs.readFileSync(path.join(sourceRoot,'index.html'),'utf8');
fs.cpSync(sourceRoot,root,{recursive:true});fs.writeFileSync(path.join(root,'index.html'),instrumentHtml(source,loadFixtures()));
fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-rift-guidance-'));
const server=http.createServer((request,response)=>{
 const name=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.readFile(file,(error,bytes)=>{if(error){response.writeHead(404).end();return;}
  const types={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
  response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});response.end(bytes);
 });
});
let browser,session,seq=0,buffer='',stderr='',browserExit,closed=false;
const pending=new Map(),records=[],runtimeErrors=[];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function assert(value,message){if(!value)throw Error(message);}
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{
 const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},20000);
 pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');
});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function key(name,shift=false){const specs={Space:{key:' ',code:'Space',windowsVirtualKeyCode:32},Tab:{key:'Tab',code:'Tab',windowsVirtualKeyCode:9},Enter:{key:'Enter',code:'Enter',windowsVirtualKeyCode:13},Escape:{key:'Escape',code:'Escape',windowsVirtualKeyCode:27},End:{key:'End',code:'End',windowsVirtualKeyCode:35}};const spec=specs[name];await send('Input.dispatchKeyEvent',{type:'rawKeyDown',...spec,modifiers:shift?8:0});await send('Input.dispatchKeyEvent',{type:'keyUp',...spec,modifiers:shift?8:0});}
async function touch(selector){const box=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})()`);assert(box.hit,'native touch reaches '+selector);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
async function ready(){let loaded=false;for(let i=0;i<200&&!loaded;i++){try{loaded=await evaluate('!window.__riftGuidanceReloadToken&&!!window.__forgeUiReady');}catch(error){if(!/context|navigat/i.test(error.message))throw error;}if(!loaded)await pause(20);}assert(loaded,'production document reaches existing bridge');await evaluate('document.fonts.ready');await evaluate('__lumenfallQaBridge.uiMeasurementPause(true)');await evaluate('__qaForgeStartup.promise');await evaluate('__lumenfallQaBridge.resetFeedback()');}
async function reload(){await evaluate('window.__riftGuidanceReloadToken=true');await send('Page.reload',{ignoreCache:true});await ready();}
async function waitForHintScroll(){for(let i=0;i<50;i++){if(await evaluate('document.querySelector("#rift-objective-row").scrollTop>0'))return;await pause(20);}const diagnostic=await evaluate('({focus:document.activeElement.id,inert:document.querySelector(".shell").inert,scroll:document.querySelector("#rift-objective-row").scrollTop,hidden:document.querySelector("#rift-objective-row").hidden})');throw Error('long hint scroll did not move: '+JSON.stringify(diagnostic));}
async function snapshot(){return evaluate(`(()=>{
 const selectors=['.hud',...['lumen','shard','mote','prism','comet','sigil'].map(x=>'#hud-'+x),'.battle-row','#enemy-stage','.hp-wrap','#hp-text','#boss-combat','#rift-party','#rift-bond-effects','#rift-guidance-slot','#rift-hints-toggle'];
 const boxes={};selectors.forEach(selector=>{const e=document.querySelector(selector);if(!e||!e.getClientRects().length){boxes[selector]=null;return;}const r=e.getBoundingClientRect();boxes[selector]={x:r.x,y:r.y,width:r.width,height:r.height};});
 const saves={};Object.keys(localStorage).sort().filter(k=>k!=='lumenfall_rift_guidance_hidden_v1').forEach(k=>saves[k]=localStorage.getItem(k));
 return {boxes,state:JSON.stringify(__lumenfallQaBridge.getState()),saves};
})()`);}
function sameGeometry(a,b,label){for(const selector of Object.keys(a.boxes)){const before=a.boxes[selector],after=b.boxes[selector];assert(!!before===!!after,label+' presence '+selector);if(before)for(const axis of ['x','y','width','height'])assert(Math.abs(before[axis]-after[axis])<=0.1,label+' '+selector+' '+axis+': '+before[axis]+' -> '+after[axis]);}}
function sameData(a,b,label){assert(a.state===b.state,label+' preserves full game state');assert(JSON.stringify(a.saves)===JSON.stringify(b.saves),label+' preserves all other localStorage bytes');}
async function screenshot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));}
async function hiddenAccessibility(){const {root:dom}=await send('DOM.getDocument');for(const selector of ['#rift-objective-row','#rift-objective']){const {nodeId}=await send('DOM.querySelector',{nodeId:dom.nodeId,selector});const tree=await send('Accessibility.getPartialAXTree',{nodeId,fetchRelatives:false});assert(tree.nodes.every(node=>node.ignored),'hidden hint is absent from accessibility tree: '+selector);}const tree=await send('Accessibility.getFullAXTree');assert(!tree.nodes.some(node=>!node.ignored&&/Guidance stress sentinel/.test(node.name?.value||'')),'hidden long hint is absent from full accessibility tree');}
async function toggleWithInput(useTouch=false){await evaluate('document.querySelector("#rift-hints-toggle").focus({preventScroll:true})');if(useTouch)await touch('#rift-hints-toggle');else await key('Space');}
async function scrollHintsWithTouch(){const r=await evaluate('(()=>{const r=document.querySelector("#rift-objective-row").getBoundingClientRect();return {x:r.x+r.width/2,top:r.top+4,bottom:r.bottom-4};})()');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.bottom}]});for(let i=1;i<=4;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x,y:r.bottom+(r.top-r.bottom)*i/4}]});await pause(16);}await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(100);}
async function inspectContent(){return evaluate(`(()=>{
 const row=document.querySelector('#rift-objective-row'),objective=document.querySelector('#rift-objective'),toggle=document.querySelector('#rift-hints-toggle'),slot=document.querySelector('#rift-guidance-slot'),hud=document.querySelector('.hud'),main=document.querySelector('main');
 const sr=slot.getBoundingClientRect(),rr=row.getBoundingClientRect(),tr=toggle.getBoundingClientRect(),hr=hud.getBoundingClientRect(),mr=main.getBoundingClientRect();
 if(sr.top<hr.bottom||sr.bottom>mr.top)throw Error('guidance must be directly below currencies and clear of combat');
 if(tr.width<44||tr.height<44)throw Error('hints control must be at least 44px');
 if(toggle.scrollWidth>toggle.clientWidth||toggle.scrollHeight>toggle.clientHeight)throw Error('Show hints/Hide hints text must fit at enlarged text size');
 if(row.scrollWidth>row.clientWidth+1)throw Error('hint text must wrap without horizontal clipping');
 const actionable=objective.getAttribute('role')==='button',or=objective.getBoundingClientRect();
 if(actionable&&(or.width<44||or.height<44))throw Error('hint navigation must be at least 44px');
 const style=getComputedStyle(toggle),ink=style.color,bg=style.backgroundColor;
 const rgb=color=>color.match(/[\\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);});
 const lum=c=>{const a=rgb(c);return a[0]*.2126+a[1]*.7152+a[2]*.0722;},ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05),contrast=ratio(ink,bg),hintBackground=getComputedStyle(slot).backgroundColor,hintContrasts=[objective.querySelector('strong'),objective.querySelector('small')].map(e=>ratio(getComputedStyle(e).color,hintBackground));
 if(contrast<4.5)throw Error('hints text contrast <4.5');
 if(hintContrasts.some(value=>value<4.5))throw Error('hint title/detail contrast <4.5');
 if(getComputedStyle(slot).animationName!=='none'||getComputedStyle(row).animationName!=='none')throw Error('guidance must not animate geometry');
 return {slotHeight:sr.height,rowHeight:rr.height,contentHeight:row.scrollHeight,contrast,hintContrasts,fontSize:style.fontSize,actionable};
})()`);}
async function run(url){
 for(const [width,height,inset] of (baseline||contract?[[390,844,24]]:[[320,640,0],[360,640,24],[390,844,24],[430,932,24]]))for(const scale of (baseline||contract?[1]:[1,2]))for(const motion of (baseline||contract?['no-preference']:['no-preference','reduce'])){
  const name=`${width}x${height}-safe${inset}-text${scale}-${motion}`,record={profile:name,samples:[]};records.push(record);
  const context=await send('Target.createBrowserContext',{},null),target=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});await send('Page.enable');await send('Runtime.enable');await send('Page.navigate',{url});await ready();
  await evaluate(`document.documentElement.style.fontSize=(parseFloat(getComputedStyle(document.documentElement).fontSize)*${scale})+'px'`);
  if(contract){record.existingContract=await evaluate('(()=>{const b=__lumenfallQaBridge;b.freeze();return runRiftStatusQa(b,__lumenfallQaContext,(value,message)=>{if(!value)throw Error(message);});})()');await reload();record.navContract=await evaluate('(()=>{__lumenfallQaBridge.freeze();return runNavWorkshopQa(__lumenfallQaBridge,__lumenfallQaContext,(value,message)=>{if(!value)throw Error(message);});})()');await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);continue;}
  if(baseline){await evaluate(`riftStatusMobile.setup(${inset},'boss')`);const shown=await snapshot();await touch('#rift-objective-dismiss');const hidden=await snapshot();record.shown=shown.boxes;record.hidden=hidden.boxes;record.tapDelta={y:hidden.boxes['#enemy-stage'].y-shown.boxes['#enemy-stage'].y,height:hidden.boxes['#enemy-stage'].height-shown.boxes['#enemy-stage'].height};assert(Math.abs(record.tapDelta.y)>1||Math.abs(record.tapDelta.height)>1,'original baseline exposes the reported layout shift');await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);continue;}
  for(const kind of ['fresh','dense','boss','boss-conditional','farm'])for(const longHint of [false,true]){
   await evaluate(`riftStatusMobile.setup(${inset},${JSON.stringify(kind)});(()=>{const b=__lumenfallQaBridge,s=b.getState();if(${JSON.stringify(kind)}==='farm'){s.riftMode='farm';s.farmDepth=9;s.farmReturnDepth=10;s.depth=9;s.enemyDepth=9;s.enemyMaxHp=b.enemyHpFor(9);s.enemyHp=s.enemyMaxHp;}b.setState(s);b.renderLayout();})()`);
   await evaluate('__lumenfallQaBridge.uiMeasurementPause(false)');await pause(120);await evaluate('__lumenfallQaBridge.uiMeasurementPause(true)');
   if(longHint)await evaluate(`(()=>{const el=document.querySelector('#rift-objective'),title='Guidance stress sentinel — '+('Long Rift hint with all its words readable. ').repeat(12)+'Unbroken'+('W').repeat(100),detail=('Additional guidance detail with a clear next step. ').repeat(8);el.querySelector('strong').textContent=title;el.querySelector('small').textContent=detail;if(el.getAttribute('role')==='button')el.setAttribute('aria-label',title+' — '+detail);})()`);
   await evaluate('document.querySelector("#rift-objective-row").scrollTop=0');
   const content=await inspectContent(),shown=await snapshot(),riftMeasure=await evaluate('riftStatusMobile.measure()');
   const sample={kind,longHint,content,shown:shown.boxes,riftMeasure};record.samples.push(sample);
   if(longHint){assert(content.contentHeight>content.rowHeight,'long text creates a bounded scroll area');await evaluate('document.querySelector("#rift-objective-row").focus({preventScroll:true})');assert(await evaluate('document.activeElement.id')==='rift-objective-row','hint scroll area receives keyboard focus');await key('End');await waitForHintScroll();sameGeometry(shown,await snapshot(),'long hint scrolling');await evaluate('document.querySelector("#rift-objective-row").scrollTop=0');await scrollHintsWithTouch();await waitForHintScroll();assert(await evaluate('document.querySelector("#tab-battle").classList.contains("active")'),'native touch scroll does not activate the hint destination');sameGeometry(shown,await snapshot(),'touch hint scrolling');sample.nativeTouchScrolled=true;}
   await toggleWithInput(longHint);const hidden=await snapshot();sameGeometry(shown,hidden,'hide '+name+'/'+kind);sameData(shown,hidden,'hide hints');sample.hidden=hidden.boxes;
   assert(await evaluate('document.querySelector("#rift-objective-row").hidden&&document.querySelector("#rift-hints-toggle").textContent==="Show hints"&&document.querySelector("#rift-hints-toggle").getAttribute("aria-expanded")==="false"'),'hidden hints control state');
   await evaluate('document.querySelector("#rift-objective-row").focus();document.querySelector("#rift-objective").focus()');assert(await evaluate('document.activeElement.id')==='rift-hints-toggle','hidden hints cannot take programmatic focus');await hiddenAccessibility();
   const tabStops=[];
   for(let i=0;i<12;i++){await key('Tab');const stop=await evaluate('(()=>{const a=document.activeElement;return {id:a.id,tab:a.dataset.tab,hiddenHint:document.querySelector("#rift-objective-row").contains(a)};})()');tabStops.push(stop);assert(!stop.hiddenHint,'native Tab skips hidden hints');if(stop.id==='enemy-stage')break;}
   assert(tabStops.at(-1).id==='enemy-stage','native Tab reaches Guardian Tap');sample.hiddenTabStops=tabStops;
   for(let i=0;i<12&&await evaluate('document.activeElement.id!=="rift-hints-toggle"');i++){await key('Tab',true);assert(await evaluate('!document.querySelector("#rift-objective-row").contains(document.activeElement)'),'reverse Tab skips hidden hints');}
   assert(await evaluate('document.activeElement.id')==='rift-hints-toggle','reverse Tab reaches the visible hints control');
   await toggleWithInput();sameGeometry(shown,await snapshot(),'show hints');sameData(shown,await snapshot(),'show hints');assert(await evaluate('document.querySelector("#rift-hints-toggle").textContent==="Hide hints"&&document.querySelector("#rift-hints-toggle").getAttribute("aria-expanded")==="true"'),'restored hints control state');
   if(width===390&&motion==='reduce'&&kind==='boss'){await screenshot(name+'-'+(longHint?'long':'normal'));if(longHint){await toggleWithInput();await screenshot(name+'-hidden');await toggleWithInput();}}
  }
  // Content changes and text enlargement leave every protected box in place.
  for(const sample of record.samples.filter(sample=>sample.longHint)){const normal=record.samples.find(other=>other.kind===sample.kind&&!other.longHint);sameGeometry({boxes:normal.shown},{boxes:sample.shown},'long versus normal hint');}
  if(scale===2){const normalProfile=records.find(other=>other.profile===name.replace('text2','text1'));for(const sample of record.samples){const normal=normalProfile.samples.find(other=>other.kind===sample.kind&&other.longHint===sample.longHint);const boxes={...normal.shown},enlarged={...sample.shown};delete boxes['#rift-hints-toggle'];delete enlarged['#rift-hints-toggle'];sameGeometry({boxes},{boxes:enlarged},'200% versus normal text');}record.enlargedTextStable=true;}
  // Exercise hiding from inside the body through the existing Settings handler.
  await evaluate('document.querySelector("#rift-objective-row").focus({preventScroll:true});document.querySelector("#rift-guidance-toggle").click()');assert(await evaluate('document.activeElement.id==="rift-hints-toggle"&&document.querySelector("#rift-objective-row").hidden'),'hiding focused hints returns focus to the visible toggle');await toggleWithInput();
  // Every existing unlocked cosmetic uses the same unchanged combat contract.
  record.cosmetics=[];
  for(const theme of ['default','ember','void','aurora','solar','radiant']){await evaluate(`riftStatusMobile.setup(${inset},'boss');(()=>{const b=__lumenfallQaBridge,s=b.getState();s.riftTheme=${JSON.stringify(theme)};['d50','asc5','mythic','d250','modulemax'].forEach(id=>s.achieved[id]=true);b.setState(s);b.renderLayout();})()`);const shown=await snapshot();await toggleWithInput(true);const hidden=await snapshot();sameGeometry(shown,hidden,'cosmetic '+theme);sameData(shown,hidden,'cosmetic hide');await toggleWithInput();record.cosmetics.push({theme,boxes:shown.boxes});}
  // Collapse the reserved space in a throwaway DOM to prove the geometry oracle.
  if(records.length===1){await evaluate('document.querySelector("#rift-guidance-slot").style.height="90px"');const shown=await snapshot();await toggleWithInput();await evaluate('document.querySelector("#rift-guidance-slot").style.height="46px"');const hidden=await snapshot();let rejection;try{sameGeometry(shown,hidden,'collapsed reservation negative');}catch(error){rejection=error.message;}assert(rejection,'geometry oracle must reject collapsed reserved space');record.negativeControl=rejection;await evaluate('document.querySelector("#rift-guidance-slot").style.height=""');await toggleWithInput();}
  // Keyboard activation of the actual hint destination and tab return.
  await evaluate(`riftStatusMobile.setup(${inset},'dense');document.querySelector('#rift-objective').focus({preventScroll:true})`);await key('Enter');assert(await evaluate('document.querySelector("#tab-spirits").classList.contains("active")&&document.querySelector("#rift-guidance-slot").hidden'),'actual hint opens Wisps and removes the whole slot on another tab');await touch('[data-tab="battle"]');
  await toggleWithInput();await reload();assert(await evaluate('document.querySelector("#rift-objective-row").hidden&&localStorage.getItem("lumenfall_rift_guidance_hidden_v1")==="1"'),'real reload preserves hidden device preference');
  await evaluate(`riftStatusMobile.setup(${inset},'fresh')`);await touch('#settings-btn');const settingsBefore=await snapshot();await evaluate('document.querySelector("#rift-guidance-toggle").focus({preventScroll:true})');await touch('#rift-guidance-toggle');sameData(settingsBefore,await snapshot(),'Settings restore');assert(await evaluate('!document.querySelector("#rift-objective-row").hidden&&document.querySelector("#rift-hints-toggle").textContent==="Hide hints"&&localStorage.getItem("lumenfall_rift_guidance_hidden_v1")===null'),'Settings restores the same preference');assert(await evaluate('document.activeElement.id')==='rift-guidance-toggle','Settings restore keeps modal focus');await key('Escape');assert(await evaluate('document.activeElement.id')==='settings-btn','Settings closes with correct focus return');
  const errors=await evaluate('__lumenfallQaContext.errors');assert(!errors.length,'no production runtime errors');record.reloadPersisted=true;record.settingsSynchronized=true;
  await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
 }
 assert(!runtimeErrors.length,'no CDP runtime exceptions');
}
(async()=>{
 const result={status:'fail',scope:'RIFT_GUIDANCE_001',baselineProbe:baseline,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),instrumentedSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex'),records};
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
  browserExit=new Promise(resolve=>{browser.once('error',error=>resolve({error:error.message}));browser.once('close',(code,signal)=>{closed=true;resolve({code,signal});for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();});});
  browser.stderr.on('data',data=>stderr=(stderr+data).slice(-2000));
  browser.stdio[4].on('data',data=>{buffer+=data;let at;while((at=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,at);buffer=buffer.slice(at+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(m.params);}});
  await run(`http://127.0.0.1:${server.address().port}/index.html?qaScenario=rift-status-mobile&qaFixture=fresh`);result.status='pass';
 }catch(error){result.message=error.stack;}
 finally{
  if(browser){await send('Browser.close',{},null).catch(()=>{});let timer;const exit=await Promise.race([browserExit,new Promise(resolve=>timer=setTimeout(()=>resolve({timeout:true}),5000))]);clearTimeout(timer);if(exit.timeout){browser.kill('SIGKILL');await browserExit;result.status='fail';}result.teardown=exit;assert(closed,'browser closed before removing profile');}
  await new Promise(resolve=>server.close(resolve));fs.rmSync(profile,{recursive:true,force:true});fs.rmSync(root,{recursive:true,force:true});
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,profiles:records.length,samples:records.reduce((n,r)=>n+r.samples.length,0),message:result.message,result:path.join(out,'results.json')}));if(result.status!=='pass')process.exitCode=1;
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
