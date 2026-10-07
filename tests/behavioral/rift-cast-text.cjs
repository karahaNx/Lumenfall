/* Focused F13 browser check. Node 20+ tooling; product still targets WebView 60.
 * Usage: node tests/behavioral/rift-cast-text.cjs [web-root] [evidence-dir]
 * Only the served copy receives a state bridge and a paused interval clock.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const vm = require('node:vm');
const {spawn} = require('node:child_process');
const {createHash} = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2] || 'mobile/www');
const evidence = path.resolve(process.argv[3] || '/tmp/lumenfall-rift-cast-text');
const baselineObservation = process.argv.includes('--observe-baseline');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1]);
const marker = '\n})();\n</script>';
assert.equal(source.split(marker).length, 2, 'one production IIFE marker');
const bridge = `
window.__riftCastTextQa={
 fresh:function(){return freshState();},
 get:function(){return JSON.parse(JSON.stringify(state));},
 install:function(next){state=acceptPersistedState(next,'qa-f13');restoreEnemyOrSpawn();renderAll();},
 level:function(id,value){state.spirits[id]=value;renderRiftParty();},
 render:function(){renderRiftParty();},
 cast:function(id){emitCombatVfx('ability','#abcdef',id);renderRiftParty();},
 catalog:function(){return SPIRITS.map(function(sp){return {id:sp.id,name:sp.name,ability:sp.abilityName};});}
};`;
const prelude = `<script>
window.__f13Errors=[];
addEventListener('error',function(e){__f13Errors.push(e.message);});
addEventListener('unhandledrejection',function(e){__f13Errors.push(String(e.reason));});
var f13Clock=Date.now();Date.now=function(){return f13Clock;};
var f13Interval=window.setInterval.bind(window);
window.setInterval=function(){return f13Interval(function(){},100000);};
</script>`;
const page = source.replace('<head>', '<head>'+prelude).replace(marker, bridge+marker);
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/') { res.setHeader('Content-Type','text/html'); res.end(page); return; }
  const file = path.resolve(root, '.'+decodeURIComponent(pathname));
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end();return;}
  res.setHeader('Content-Type',file.endsWith('.woff2')?'font/woff2':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const records=[];
let browser, profile, session, seq=0, buffer='', stderr='', closed=false;
const pending=new Map();
function send(method, params={}, sid=session) {
  return new Promise((resolve,reject)=>{
    const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},15000);
    pending.set(id,{resolve,reject,timer});
    browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');
  });
}
async function evaluate(expression) {
  const reply=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(reply.exceptionDetails)throw Error(reply.exceptionDetails.exception?.description||reply.exceptionDetails.text);
  return reply.result.value;
}
async function run() {
  fs.mkdirSync(evidence,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f13-'));
  browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||'chromium',[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'
  ],{stdio:['ignore','ignore','pipe','pipe','pipe']});
  browser.on('error',error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();});
  browser.on('close',()=>{closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('browser closed'));}pending.clear();});
  browser.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-3000);});
  browser.stdio[4].on('data',chunk=>{
    buffer+=chunk;let end;
    while((end=buffer.indexOf('\0'))!==-1){
      const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;
      const reply=JSON.parse(raw),p=pending.get(reply.id);if(!p)continue;
      pending.delete(reply.id);clearTimeout(p.timer);
      reply.error?p.reject(Error(JSON.stringify(reply.error))):p.resolve(reply.result);
    }
  });
  const version=await send('Browser.getVersion',{},null);
  for(const width of [320,390,430])for(const reduced of [false,true])for(const largeText of [false,true]){
    const context=await send('Target.createBrowserContext',{},null);
    const target=await send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId},null);
    session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
    await send('Page.enable');
    await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/'});
    for(let i=0;i<100&&!await evaluate('!!window.__riftCastTextQa&&!!document.querySelector("[data-rift-wisp]")');i++)await new Promise(resolve=>setTimeout(resolve,25));
    await evaluate(`(async function(){
      await document.fonts.ready;
      document.querySelectorAll('.overlay').forEach(function(el){el.style.display='none';});
      document.getElementById('startup-intro').style.display='none';
      var skip=document.getElementById('tut-skip');if(skip&&skip.getClientRects().length)skip.click();
      if(${largeText})document.querySelectorAll('#rift-party *').forEach(function(el){
        var style=getComputedStyle(el);if(el.childNodes.length&&Array.from(el.childNodes).some(function(n){return n.nodeType===3&&n.textContent.trim();}))el.style.fontSize=(parseFloat(style.fontSize)*2)+'px';
      });
    })()`);
    const samples=await evaluate(`(function(){
      var b=__riftCastTextQa,catalog=b.catalog(),result=[];
      function check(value,message){if(!value)throw Error(message);}
      function install(ids){var s=b.fresh();s.activeParty=ids;s.maxDepthEver=101;s.depth=101;
        ids.forEach(function(id){s.spirits[id]=1;});b.install(s);return s;}
      function inspect(id,kind){
        var card=document.querySelector('[data-rift-wisp="'+id+'"]'),bar=card.querySelector('[role="progressbar"]');
        if(${largeText})card.querySelectorAll('.rift-wisp-name,.rift-wisp-power').forEach(function(el){el.style.fontSize='20px';});
        if(!${baselineObservation})check(!/\\b(?:CAST|Ready|Casting)\\b/i.test(card.innerText),'no repeated visible ability status');
        check(bar.getAttribute('aria-label')===catalog.find(function(sp){return sp.id===id;}).name+' — '+catalog.find(function(sp){return sp.id===id;}).ability,'ability name preserved');
        check(!card.querySelector('[aria-live]'),'no repeated live-region announcement');
        var r=card.getBoundingClientRect();check(r.left>=0&&r.right<=innerWidth,'card fits mobile width');
        return {id:id,kind:kind,text:card.innerText,value:bar.getAttribute('aria-valuenow'),status:bar.getAttribute('aria-valuetext')};
      }
      catalog.forEach(function(sp){
        var s=install([sp.id]);b.level(sp.id,0);
        check(document.querySelector('.rift-wisp-state').innerText==='Lv 0','unpowered state stays visible');result.push(inspect(sp.id,'unpowered'));
        s.spirits[sp.id]=1;s.heroResource[sp.id]=50;b.install(s);
        check(document.querySelector('.rift-charge').getAttribute('aria-valuenow')==='50','real charge value');result.push(inspect(sp.id,'charging'));
        s.heroResource[sp.id]=100;b.install(s);
        if(!${baselineObservation})check(document.querySelector('.rift-charge').getAttribute('aria-valuetext').indexOf('Ready; 100%')===0,'ready state accessible');result.push(inspect(sp.id,'ready'));
        s.heroResource[sp.id]=0;b.install(s);var before=JSON.stringify(b.get());b.cast(sp.id);
        if(!${baselineObservation})check(document.querySelector('.rift-charge').getAttribute('aria-valuetext').indexOf('Casting; 0%')===0,'cast state accessible');
        check(document.querySelector('.rift-wisp').classList.contains('is-casting'),'cosmetic cast class retained');
        if(${reduced})check(!document.querySelector('.combat-vfx'),'reduced motion suppresses cast effects');
        result.push(inspect(sp.id,'casting'));for(var n=0;n<5;n++)b.render();
        check(JSON.stringify(b.get())===before,'render and cosmetic event leave state unchanged');
        f13Clock+=700;b.render();check(!document.querySelector('.rift-wisp.is-casting'),'cast expires');
        check(document.querySelector('.rift-charge').getAttribute('aria-valuetext').indexOf('Casting')===-1,'accessible cast status expires');
      });
      install(['ember','tide','stone','void','aurora']);
      if(${largeText})document.querySelectorAll('.rift-wisp-name,.rift-wisp-power').forEach(function(el){el.style.fontSize='20px';});
      document.querySelectorAll('.rift-wisp').forEach(function(card){check(card.getBoundingClientRect().right<=innerWidth,'five member party fits');});
      ['#settings-btn','#rift-push-btn','#rift-farm-btn','#enemy-stage'].forEach(function(selector){var el=document.querySelector(selector),r=el.getBoundingClientRect();check(r.width>=44&&r.height>=44,'44px control: '+selector);});
      check(__f13Errors.length===0,'no runtime errors: '+__f13Errors.join(';'));
      var textIssues=[];
      document.querySelectorAll('.rift-wisp-name,.rift-wisp-power').forEach(function(el){
        var range=document.createRange();range.selectNodeContents(el);
        var text=range.getBoundingClientRect(),card=el.closest('.rift-wisp').getBoundingClientRect();
        if(text.left<card.left-.5||text.right>card.right+.5)textIssues.push({text:el.textContent,selector:el.className,overflowLeft:Math.max(0,card.left-text.left),overflowRight:Math.max(0,text.right-card.right)});
      });
      return {states:result,textIssues:textIssues};
    })()`);
    await send('Runtime.evaluate',{expression:'document.querySelector("#rift-push-btn").focus()'});
    await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.equal(await evaluate('document.activeElement.id'),'rift-farm-btn','native keyboard focus unchanged');
    const focus=await evaluate('getComputedStyle(document.activeElement).outlineStyle');
    assert.notEqual(focus,'none','keyboard focus visible');
    const screenshot=await send('Page.captureScreenshot',{format:'png'});
    const name=width+'-'+(reduced?'reduced':'motion')+'-'+(largeText?'text200':'text100');
    fs.writeFileSync(path.join(evidence,name+'.png'),Buffer.from(screenshot.data,'base64'));
    records.push({profile:name,samples,focus});
    await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
  }
  return {status:baselineObservation?'observation':'pass',largeText:records.some(r=>r.samples.textIssues.length)?'overflow-observed':'pass',sourceSha256:createHash('sha256').update(source).digest('hex'),browser:version,records,
    limits:['Large text doubles Wisp name/power text; it is not Android system font scaling.','Modern Chromium is not WebView60 or physical Android/TalkBack acceptance.']};
}
(async()=>{
  let result;
  try{result=await run();}catch(error){process.exitCode=1;result={status:'fail',message:error.stack,records,stderr};}
  finally{
    if(browser&&!closed){await send('Browser.close',{},null).catch(()=>{});for(let n=0;n<100&&!closed;n++)await new Promise(resolve=>setTimeout(resolve,20));if(!closed)browser.kill('SIGKILL');}
    await new Promise(resolve=>server.close(resolve));
    if(profile&&closed)fs.rmSync(profile,{recursive:true,force:true});
  }
  fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({status:result.status,profiles:records.length,evidence,message:result.message}));
})();
