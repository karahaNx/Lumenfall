/* Standalone JavaScript F21 runner. CDP lifecycle follows the repository's
 * native-input drivers; production has no QA bridge. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {spawn,execFileSync}=require('node:child_process'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const sourcePath=path.resolve(option('--source',path.join(root,'index.html'))),output=path.resolve(option('--output',path.join(os.tmpdir(),'cheaper-recruitment-results.json')));
let source=fs.readFileSync(sourcePath,'utf8');
const mutation=option('--mutation','none');
if(mutation==='handler')source=source.replace('if(!node || nodeAtCap(node)) return;','if(!node) return;');
if(mutation==='ui')source=source.replace('var maxed = nodeAtCap(node);','var maxed = false;');
if(mutation==='raw')source=source.replace('out.nodes[node.id] = nonNegativeInt(nodes[node.id],fresh.nodes[node.id]);','out.nodes[node.id] = Math.min(20,nonNegativeInt(nodes[node.id],fresh.nodes[node.id]));');
if(mutation==='refund')source=source.replace('if(hasReceipt || raw<=20) return;','if(raw<=20) return;');
if(mutation==='credit')source=source.replace('var sum=exactPrismArithmetic(out.prisms,amount);','var sum=out.prisms+amount;');
if(mutation==='free-credit')source=source.replace('left=exactPrismArithmetic(entry.amount,-take)','left=entry.amount-take');
if(!['none','handler','ui','raw','refund','credit','free-credit'].includes(mutation))throw Error('unknown mutation');
const bridge=`
window.__cheaperRecruitment={
 fresh:function(){return freshState();},today:todayStr,
 get:function(){return JSON.parse(JSON.stringify(state));},
 set:function(s){state=acceptPersistedState(JSON.parse(JSON.stringify(s)),'f21-qa');restoreEnemyOrSpawn();},
 canonical:function(s){return acceptPersistedState(s,'f21-qa');},
 render:renderAll,buy:buyNode,save:saveState,discount:costReduction,
 spirits:function(){return SPIRITS.map(function(s){return {id:s.id,baseCost:s.baseCost};});},
 recruitCost:function(id){return spiritCost(SPIRITS.find(function(s){return s.id===id;}));},
 disk:function(){return {primary:localStorage.getItem(SAVE_KEY),recovery:localStorage.getItem(RECOVERY_SAVE_KEY)};},
 backup:currentSaveBackup,decode:decodeSaveBackup,
 encode:encodeSaveBackup,payment:prismPurchasePlan,
 flags:function(){return {reload:reloadInProgress,offlinePending:offlinePending,offlineBusy:!!offlineCatchup,persistence:persistenceStatus()};},
 allowSave:function(){reloadInProgress=false;},
 legacyDisk:function(s){reloadInProgress=true;localStorage.setItem(SAVE_KEY,JSON.stringify(s));localStorage.setItem(RECOVERY_SAVE_KEY,JSON.stringify(s));},
 fault:function(key){window.__f21FailKey=key;if(!window.__f21OriginalSet){window.__f21OriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===window.__f21FailKey)throw Error('F21 injected storage failure');return window.__f21OriginalSet.call(this,k,v);};}},
 simulate:function(sec,kind,clock){return advanceAuthoritativeTime(sec,{kind:kind,visual:false,clockStartMs:clock,offlineWindowStartMs:2000000000000});},
 ascend:function(){doAscend(false);},
 corruptPrimary:function(){reloadInProgress=true;localStorage.setItem(SAVE_KEY,'broken');},
 restore:function(code){document.getElementById('save-backup-code').value=code;restoreSaveBackup();}
};
if(!localStorage.getItem(SAVE_KEY)){var qaSeed=freshState();qaSeed.questDay=todayStr();localStorage.setItem(SAVE_KEY,JSON.stringify(qaSeed));}
localStorage.setItem(STARTUP_INTRO_KEY,String(Date.now()));
`;
const marker="if(document.readyState==='loading'){";
if(source.split(marker).length!==2)throw Error('unique production bootstrap marker required');
const prelude=`<script>window.__f21Errors=[];window.addEventListener('error',function(e){__f21Errors.push(e.message);});window.addEventListener('unhandledrejection',function(e){__f21Errors.push(String(e.reason));});var qaSetInterval=window.setInterval;window.setInterval=function(fn,ms){return qaSetInterval(function(){if(window.__f21RunIntervals)fn();},ms);};</script>`;
source=source.replace('<head>','<head>'+prelude).replace(marker,bridge+'\n'+marker).replace('</body>','<script>'+fs.readFileSync(path.join(__dirname,'cheaper-recruitment.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'cheaper-refund.js'),'utf8')+'</script></body>');
const sourceSha256=createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex'),records=[];
const server=http.createServer((req,res)=>{
 if(req.url==='/index.html'){res.setHeader('Content-Type','text/html');res.end(source);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end();return;}
 const types={'.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
let browser,profile,session,seq=0,buffer='',stderr='',closed=false;
const pending=new Map();let completion;
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},15000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(v,m){if(!v)throw Error(m);}
async function key(key){await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key,code:key,...(key==='Enter'?{text:'\r'}:{}),windowsVirtualKeyCode:key==='Enter'?13:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:key==='Enter'?13:9});}
async function ready(){for(let i=0;i<200;i++){if(await evaluate('!!window.__cheaperRecruitment && !!window.cheaperRecruitmentSeed && !!document.querySelector("[data-node=bonds]")'))return;await new Promise(r=>setTimeout(r,20));}throw Error('page readiness timeout');}
async function navigate(url){await send('Page.navigate',{url});await ready();await evaluate('document.fonts.ready.then(()=>true)');}
async function run(){
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const url='http://127.0.0.1:'+server.address().port+'/index.html';
 const chrome=option('--chrome',['chromium','google-chrome','google-chrome-stable'].find(c=>{try{execFileSync('which',[c]);return true;}catch{return false;}}));assert(chrome,'Chromium required');
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f21-'));
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 completion=new Promise(resolve=>{browser.once('error',error=>resolve({error:error.message}));browser.once('close',(code,signal)=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();resolve({code,signal});});});
 browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 for(const pipe of [browser.stdio[3],browser.stdio[4]])pipe.on('error',e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();});
 const tab=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await navigate(url);
 records.push({kind:'refund-contracts',result:await evaluate('runCheaperRefundContracts()')});
 records.push({kind:'contracts',result:await evaluate('runCheaperRecruitmentContracts()')});
 for(const width of [320,390,430])for(const fontPercent of [100,200])for(const motion of ['no-preference','reduce']){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
  await evaluate(`(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(19));b.render();document.documentElement.style.fontSize='${fontPercent}%';document.querySelector('[data-tab="ascend"]').click();document.querySelector('[data-node="bonds"]').scrollIntoView({block:'center'});})()`);
  await new Promise(r=>setTimeout(r,280));
  let before=await evaluate('cheaperRecruitmentObservation()');
  assert(before.fit&&before.rect.width>=44&&before.rect.height>=44,'mobile fit/44px '+width+'/'+fontPercent+'/'+motion+' '+JSON.stringify({fit:before.fit,rect:before.rect}));
  assert(Math.min(...before.contrasts)>=4.5,'text contrast '+JSON.stringify(before.contrasts));
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:before.rect.x+before.rect.width/2,y:before.rect.y+before.rect.height/2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  let after=await evaluate('cheaperRecruitmentObservation()');assert(after.state.nodes.bonds===20&&after.state.prisms===997671,'real touch final purchase');
  assert(after.disabled&&after.kind==='maxed'&&after.fit,'maxed state fit after native purchase');
  assert(after.focused&&after.focused!=='bonds','focus moves to available Tree control after final purchase');
  if(motion==='reduce')assert(after.reduced&&parseFloat(after.animation)<=.001,'reduced motion');
  await evaluate(`(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(19));b.render();document.querySelector('[data-node="steady"]').focus();})()`);
  await key('Tab');let focused=await evaluate('cheaperRecruitmentObservation()');assert(focused.focused==='echo','native Tab to Echo');await key('Tab');focused=await evaluate('cheaperRecruitmentObservation()');
  assert(focused.focused==='bonds'&&focused.focusStyle.style==='solid'&&parseFloat(focused.focusStyle.width)>=2,'visible keyboard focus on Recruitment');
  await key('Enter');after=await evaluate('cheaperRecruitmentObservation()');assert(after.state.nodes.bonds===20&&after.focused==='swift','native Enter cap and next focus '+JSON.stringify({level:after.state.nodes.bonds,focused:after.focused,prisms:after.state.prisms}));
  await evaluate(`(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(40));b.render();})()`);let legacy=await evaluate('cheaperRecruitmentObservation()');assert(legacy.fit&&legacy.text.includes('40 purchased levels preserved'),'legacy larger text fits');
  records.push({kind:'mobile',width,fontPercent,motion,contrastMinimum:Math.min(...before.contrasts),target:[before.rect.width,before.rect.height],nativeTouch:true,nativeKeyboard:true,focusAfterCap:after.focused,legacyFit:legacy.fit});
 }
 if(args.includes('--screenshot')){
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate(`(()=>{document.documentElement.style.fontSize='100%';var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(20));b.render();document.querySelector('[data-node="bonds"]').scrollIntoView({block:'center'});})()`);
  await new Promise(r=>setTimeout(r,280));const screenshot=await send('Page.captureScreenshot',{format:'png'});
  const file=path.join(path.dirname(output),'mobile-cap-390.png');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(screenshot.data,'base64'));
  records.push({kind:'screenshot',file});
 }
 // Exercise real disk reload, corrupt-primary recovery and confirmed backup restore.
 for(const level of [21,40,2000]){
  await evaluate(`(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(${level}));b.save();})()`);
  await navigate(url);let s=await evaluate('__cheaperRecruitment.get()');assert(s.nodes.bonds===level&&s.prisms===1000000,'reload legacy '+level);
  await evaluate('__cheaperRecruitment.corruptPrimary()');await navigate(url);s=await evaluate('__cheaperRecruitment.get()');assert(s.nodes.bonds===level&&s.prisms===1000000,'actual recovery '+level);
  const backup=await evaluate('__cheaperRecruitment.backup()');
  for(let i=0;i<2;i++){
   await evaluate(`(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(0));b.save();b.restore(${JSON.stringify(backup)});})()`);
   await new Promise(r=>setTimeout(r,250));await ready();s=await evaluate('__cheaperRecruitment.get()');assert(s.nodes.bonds===level&&s.prisms===1000000,'actual repeated backup restore '+level+'/'+i);
  }
  await evaluate(`(()=>{var b=__cheaperRecruitment,s=b.get();s.depth=s.enemyDepth=16;b.set(s);b.ascend();})()`);s=await evaluate('__cheaperRecruitment.get()');assert(s.nodes.bonds===level,'Ascend keeps raw permanent levels');
  records.push({kind:'persistence',level,reload:true,corruptPrimaryRecovery:true,repeatedRestore:2,ascend:true});
 }
 // First launch of an actual old disk save; repeat reload/recovery/old restore
 // replace complete compensated snapshots, never adding a refund to live money.
 for(const level of [21,40,2000]){
  const old=await evaluate(`cheaperLegacySeed(${level},1000000)`),expected=await evaluate(`__cheaperRecruitment.canonical(${JSON.stringify(old)})`);
  const sameRefund=s=>JSON.stringify(s.feedbackMigration)===JSON.stringify(expected.feedbackMigration)&&JSON.stringify(s.refundCredits)===JSON.stringify(expected.refundCredits)&&s.prisms===expected.prisms&&s.nodes.bonds===level;
  await evaluate(`__cheaperRecruitment.legacyDisk(${JSON.stringify(old)})`);await navigate(url);
  let s=await evaluate('__cheaperRecruitment.get()');assert(sameRefund(s),'old first-launch wallet and receipt '+level);
  await navigate(url);s=await evaluate('__cheaperRecruitment.get()');assert(sameRefund(s),'migration reload once '+level);
  await evaluate('__cheaperRecruitment.corruptPrimary()');await navigate(url);s=await evaluate('__cheaperRecruitment.get()');assert(sameRefund(s),'migration recovery once '+level);
  const oldBackup=await evaluate(`__cheaperRecruitment.encode(${JSON.stringify(old)})`);
  for(let n=0;n<2;n++){
   await evaluate(`(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(0));b.save();b.restore(${JSON.stringify(oldBackup)});})()`);
   await new Promise(r=>setTimeout(r,250));await ready();s=await evaluate('__cheaperRecruitment.get()');assert(sameRefund(s),'old restore replaces complete refunded snapshot '+level+'/'+n);
  }
  await evaluate(`(()=>{var b=__cheaperRecruitment,s=b.get();s.depth=s.enemyDepth=16;b.set(s);b.ascend();})()`);s=await evaluate('__cheaperRecruitment.get()');assert(sameRefund({...s,prisms:expected.prisms}),'Ascend preserves refund receipt/credits '+level);
  records.push({kind:'migration-persistence',level,oldFirstLaunch:true,reload:true,recovery:true,oldRestoreRepetitions:2,ascend:true});
 }
 const oldBackup=await evaluate('__cheaperRecruitment.encode(cheaperLegacySeed(21,0))');
 await evaluate('(()=>{var b=__cheaperRecruitment;b.set(cheaperRecruitmentSeed(0));b.save();})()');
 const beforeRollback=await evaluate('__cheaperRecruitment.disk()');
 await evaluate(`(()=>{var b=__cheaperRecruitment;b.fault('lumenfall_save_v2');b.restore(${JSON.stringify(oldBackup)});b.fault('');})()`);
 assert(JSON.stringify(await evaluate('__cheaperRecruitment.disk()'))===JSON.stringify(beforeRollback),'restore primary failure rolls back wallet and receipt together');
 await navigate(url);let rolledBack=await evaluate('__cheaperRecruitment.get()');assert(rolledBack.nodes.bonds===0&&rolledBack.prisms===1000000,'failed restore never credits live wallet');
 await evaluate(`(()=>{var b=__cheaperRecruitment,old=cheaperLegacySeed(21,0);b.legacyDisk(old);b.allowSave();b.set(old);b.fault('lumenfall_save_recovery_v1');b.save();b.fault('');})()`);
 let partial=await evaluate('__cheaperRecruitment.disk()');assert(JSON.parse(partial.primary).prisms===3376&&!!JSON.parse(partial.primary).feedbackMigration.receipts['node.bonds'],'successful primary owns complete compensation '+JSON.stringify({prisms:JSON.parse(partial.primary).prisms,flags:await evaluate('__cheaperRecruitment.flags()')}));
 assert(!JSON.parse(partial.recovery).feedbackMigration,'failed recovery retains whole old snapshot');
 await evaluate('__cheaperRecruitment.corruptPrimary()');await navigate(url);rolledBack=await evaluate('__cheaperRecruitment.get()');assert(rolledBack.prisms===3376,'old recovery compensates from its own original wallet once');
 records.push({kind:'migration-write-failure',restoreRollback:true,primaryAuthoritative:true,oldRecoveryNoDuplicate:true});
 const errors=await evaluate('__f21Errors');assert(!errors.length,'no browser runtime errors '+JSON.stringify(errors));
}
(async()=>{
 let failure,teardown;
 try{await run();}catch(e){failure=e.stack;}
 if(browser){
  if(!closed)await send('Browser.close',{},null).catch(()=>{});
  let timer;const ended=await Promise.race([completion,new Promise(resolve=>{timer=setTimeout(()=>resolve(null),5000);})]);clearTimeout(timer);
  if(!ended){browser.kill('SIGKILL');await completion;failure=failure||'Browser required forced termination';}
  teardown={browser:ended,pending:pending.size};
  if(profile&&closed){await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});teardown.profileRemoved=!fs.existsSync(profile);}
  if(ended?.code!==0)failure=failure||'Browser teardown failed '+JSON.stringify(ended);
 }
 await new Promise(resolve=>server.close(resolve));
 const result={status:failure?'FAIL':'PASS',sourcePath,sourceSha256,mutation,observedAt:new Date().toISOString(),records,teardown,...(failure?{failure,stderr}:{})};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(result.status+' Cheaper Recruitment: '+records.length+' result groups; '+output);if(failure){console.error(failure);process.exitCode=1;}
})();
