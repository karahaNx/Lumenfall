// Actual installed APK WebView check. Test bridge is injected through a debugger
// pause at init, never written into the APK. Only isolated emulator-5554 is used.
'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..'),adb=process.env.LUMENFALL_QA_ADB;
const output=process.argv[2],baseline=process.argv.includes('--baseline');
assert(adb&&output,'LUMENFALL_QA_ADB and result path required');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function android(...args){return cp.execFileSync(adb,['-s','emulator-5554',...args],{encoding:'utf8',timeout:120000});}
let ws,seq=0,pausedResolve;const pending=new Map(),events=[],records=[],scripts=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label,timeout=180000){const start=Date.now();let last=start;while(Date.now()-start<timeout){if(await evaluate(expression))return;if(Date.now()-last>30000){console.log('WAIT '+label);last=Date.now();}await delay(200);}throw Error(label+' timeout');}
async function connect(){
  const start=Date.now();let target;
  while(Date.now()-start<180000){
    let pid;try{pid=android('shell','pidof','com.lumenfall.app').trim();}catch{}
    if(pid){android('forward','tcp:9223','localabstract:webview_devtools_remote_'+pid);try{const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();target=pages.find(p=>p.type==='page');}catch{}if(target)break;}
    await delay(500);
  }
  assert(target,'native WebView debugging target');ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=()=>reject(Error('WebSocket connection failed'));});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Debugger.scriptParsed')scripts.push(m.params);else if(m.method==='Runtime.exceptionThrown')events.push(m.params);else if(m.method==='Debugger.paused'&&pausedResolve){const r=pausedResolve;pausedResolve=null;r(m.params);}};
  await send('Runtime.enable');await send('Page.enable');await until('document.readyState==="complete"','first native load');
}
const bridge=`
window.__bondNativeErrors=[];window.addEventListener('error',function(e){__bondNativeErrors.push(e.message);});window.addEventListener('unhandledrejection',function(e){__bondNativeErrors.push(String(e.reason));});
window.setInterval=function(){return 0;};
window.__bondNative={
 freshStateSnapshot:function(){return JSON.parse(JSON.stringify(freshState()));},
 enemyHpFor:enemyHpFor,
 setState:function(s){state=acceptPersistedState(JSON.parse(JSON.stringify(s)),'native-f16');restoreEnemyOrSpawn();},
 getState:function(){return JSON.parse(JSON.stringify(state));},
 wispRoleContract:function(){return SPIRITS.map(function(sp){return {id:sp.id,name:sp.name,abilityType:sp.abilityType,description:ABILITY_DESC[sp.abilityType]};});},
 riftStatus:{bonds:function(){return FORMATION_BONDS;}},
 activeBondIds:function(){return activeFormationBonds().map(function(b){return b.id;});},
 renderLayout:function(){renderAll();},
 renderGameplayLanguage:function(){renderSpirits();renderEncyclopedia();},
 finish:function(){if(startupIntroFinish)startupIntroFinish();document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});setOverlayInert(null);overlayFocus=null;activateTab('spirits');},
 save:saveState
};`;
async function expose(){
  await send('Debugger.enable');await delay(300);
  let game;
  for(const parsed of scripts){
    if(!parsed.url.startsWith('https://localhost'))continue;
    const r=await send('Debugger.getScriptSource',{scriptId:parsed.scriptId});
    if(r.scriptSource.includes('var SPIRITS = [')&&r.scriptSource.includes('function init(){')){game={parsed,source:r.scriptSource};break;}
  }
  assert(game,'loaded native product script');
  const localLine=game.source.slice(0,game.source.indexOf('function init(){')).split('\n').length;
  const binding=await send('Debugger.setBreakpointByUrl',{url:game.parsed.url,lineNumber:game.parsed.startLine+localLine});
  assert(binding.locations.length,'product init breakpoint bound');
  records.push({case:'native product script/init debugger binding',scriptId:game.parsed.scriptId,startLine:game.parsed.startLine,binding});
  console.log('PASS product init breakpoint bound');
  const paused=new Promise((resolve,reject)=>{const t=setTimeout(()=>{pausedResolve=null;reject(Error('product init breakpoint timeout'));},180000);pausedResolve=p=>{clearTimeout(t);resolve(p);};});
  await send('Page.reload');const p=await paused;const frame=p.callFrames[0];
  const r=await send('Debugger.evaluateOnCallFrame',{callFrameId:frame.callFrameId,expression:bridge,returnByValue:true});
  if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
  await send('Debugger.removeBreakpoint',{breakpointId:binding.breakpointId});await send('Debugger.resume');await send('Debugger.disable');
  await until('!!window.__bondNative && !!document.querySelector("#spirit-list .hero-card")','native test bridge');
  await evaluate('__bondNative.finish()');
}
async function main(){
  assert.equal(android('shell','getprop','ro.kernel.qemu').trim(),'1','isolated emulator only');
  const identity={android:android('shell','getprop','ro.build.version.release').trim(),api:android('shell','getprop','ro.build.version.sdk').trim(),webview:android('shell','dumpsys','webviewupdate'),package:android('shell','dumpsys','package','com.lumenfall.app').split('\n').filter(l=>/versionCode=|versionName=/.test(l)).map(l=>l.trim())};
  await connect();identity.userAgent=await evaluate('navigator.userAgent');await expose();
  if(baseline){
    await evaluate(`(function(){var b=__bondNative,s=b.freshStateSnapshot();s.maxDepthEver=101;s.depth=s.enemyDepth=101;s.enemyMaxHp=b.enemyHpFor(101);s.enemyHp=s.enemyMaxHp;s.activeParty=['stone','titan'];b.wispRoleContract().forEach(function(sp){s.spirits[sp.id]=10;s.heroRarity[sp.id]=3;s.wispModules[sp.id]=7;});b.setState(s);b.renderLayout();b.renderGameplayLanguage();b.save();})()`);
    const before=await evaluate(`({partnerRows:Array.from(document.querySelectorAll('#bond-card .bond-req')).map(function(el){return el.textContent;}),breaker:document.querySelector('[data-wisp-card="stone"] .ability-desc').textContent,saveMatchesRecovery:localStorage.getItem('lumenfall_save_v2')===localStorage.getItem('lumenfall_save_recovery_v1')})`);
    assert(before.breaker.includes('Stone + Titan'));assert(before.saveMatchesRecovery);records.push({case:'baseline signed138 partnership leak and abbreviated Bond labels',before});
  }else{
    const module=fs.readFileSync(root+'/tests/behavioral/bond-text.js','utf8');await evaluate(module);
    const detail=await evaluate("runBondTextQa(__bondNative,function(v,m){if(!v)throw Error(m);})");records.push({case:'installed APK complete F16 contract',detail});
    const expected=fs.readFileSync(root+'/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
    const actual=await evaluate("Array.from(document.scripts).find(function(s){return s.textContent.indexOf('var SPIRITS = [')!==-1;}).textContent");assert.equal(actual,expected,'actual loaded APK game JavaScript matches integrated source');
    identity.loadedGameScriptSha256=crypto.createHash('sha256').update(actual).digest('hex');
    for(const scale of [1,2]){
      const result=await evaluate(`(function(){var b=__bondNative;document.documentElement.style.fontSize='${scale*100}%';b.renderLayout();b.renderGameplayLanguage();b.finish();var h=document.querySelector('.formation-help');h.open=true;return {viewport:[innerWidth,innerHeight],scale:${scale},rows:Array.from(document.querySelectorAll('#bond-card .bond-row')).map(function(row){row.scrollIntoView({block:'center'});var r=row.getBoundingClientRect(),p=row.querySelector('.bond-req').getBoundingClientRect();return {partner:row.querySelector('.bond-req').textContent,width:r.width,left:p.left,right:p.right,visible:r.top<innerHeight&&r.bottom>0};}),controlHeight:h.querySelector('summary').getBoundingClientRect().height};})()`);
      assert(result.controlHeight>=44);assert(result.rows.every(r=>r.visible&&r.left>=0&&r.right<=result.viewport[0]));records.push({case:'native Bond rows text'+scale,result});
    }
    await evaluate('document.documentElement.style.fontSize="100%";__bondNative.renderLayout();__bondNative.finish();document.querySelector(".formation-help").open=true;document.querySelector("#bond-card").scrollIntoView({block:"start"})');
    const png=cp.execFileSync(adb,['-s','emulator-5554','exec-out','screencap','-p'],{timeout:120000});fs.writeFileSync(path.join(path.dirname(output),'native-formation.png'),png);
  }
  assert.deepEqual(await evaluate('__bondNativeErrors'),[]);assert.equal(events.length,0,'native protocol runtime errors');
  fs.writeFileSync(output,JSON.stringify({status:'PASS',identity,records,limitations:['isolated Android emulator, not physical phone','Installed WebView version is recorded in identity; exact WebView60 is separate','TalkBack acceptance remains unperformed','QA fixture/interval pause and debugger bridge are not shipped']},null,2)+'\n');
  ws.close();console.log('PASS signed native '+(baseline?'baseline preparation':'F16 contract and text profiles'));
}
main().catch(e=>{fs.writeFileSync(output,JSON.stringify({status:'FAIL',error:e.stack,records,events},null,2)+'\n');console.error(e.stack);if(ws)ws.close();process.exitCode=1;});
