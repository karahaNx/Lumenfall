/* Focused SUPPORT_UPTIME_001 browser check. Product targets WebView 60.
 * Usage: node tests/behavioral/support-uptime-ui.cjs [web-root] [evidence-dir] [chrome]
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
const evidence = path.resolve(process.argv[3] || '/tmp/lumenfall-support-uptime');
const baselineObservation = process.argv.includes('--observe-baseline');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1]);
const marker = '\n})();\n</script>';
assert.equal(source.split(marker).length, 2, 'one production IIFE marker');
const bridge = `window.__supportUptimeQa={fresh:freshState,get:function(){return JSON.parse(JSON.stringify(state));},install:function(s){state=acceptPersistedState(s,'qa-support-ui');restoreEnemyOrSpawn();renderAll();},render:renderAll};`;
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
function contrast(a,b){
  function luminance(color){
    const rgb=color.startsWith('#')?[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)):color.match(/[\d.]+/g).slice(0,3).map(Number);
    const channels=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});
    return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
  }
  const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
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
  browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||process.argv[4]||'chromium',[
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
    for(let i=0;i<100&&!await evaluate('!!window.__supportUptimeQa&&!!document.querySelector("[data-rift-wisp]")');i++)await new Promise(resolve=>setTimeout(resolve,25));
    await evaluate(`(async function(){
      await document.fonts.ready;
      document.querySelectorAll('.overlay').forEach(function(el){el.style.display='none';});
      document.getElementById('startup-intro').style.display='none';
      var skip=document.getElementById('tut-skip');if(skip&&skip.getClientRects().length)skip.click();
    })()`);
    const samples=await evaluate(`(function(){
      var b=__supportUptimeQa,checks=0;
      function check(value,message){checks++;if(!value)throw Error(message);}
      var s=b.fresh();s.activeParty=['tide','aurora'];s.maxDepthEver=s.depth=121;s.shards=1e8;
      ['tide','aurora'].forEach(function(id){s.spirits[id]=1;s.heroRarity[id]=5;s.wispUltimate[id]=true;});s.research.charge=9;b.install(s);
      document.querySelector('[data-tab="spirits"]').click();
      if(${largeText}){var style=document.createElement('style');style.textContent='.hero-ability .ability-desc,.ultimate-badge,.forge-description,[data-forge-preview]{font-size:24px!important;line-height:1.5!important;}';document.head.appendChild(style);}
      var descriptions=[];['tide','aurora'].forEach(function(id){
        var card=document.querySelector('[data-wisp-card="'+id+'"]'),desc=card.querySelector('.ability-desc'),ult=card.querySelector('.ultimate-badge');
        check(desc.textContent.includes('+25% for 1s')&&desc.textContent.includes('+50% for 1.5s'),'actual ability duration');
        check(ult.textContent.includes('+50% for 1.5s'),'actual Ultimate duration');
        [desc,ult].forEach(function(el){check(el.scrollWidth<=el.clientWidth+1,'support description fits');});
        descriptions.push(desc.textContent);
      });
      document.querySelector('[data-tab="workshop"]').click();document.querySelector('[data-tab="forge"]').click();
      var card=document.querySelector('[data-forge-card="charge"]'),buy=card.querySelector('[data-research]'),queue=card.querySelector('[data-queue]');
      check(card.textContent.includes('up to level 10')&&card.textContent.includes('Minimum ability cycle: 3.33s'),'Swift visible minimum');
      check(document.documentElement.scrollWidth<=innerWidth+1&&card.scrollWidth<=card.clientWidth+1,'Swift mobile width');
      var controls=[buy,queue].map(function(el){var r=el.getBoundingClientRect();check(r.width>=44&&r.height>=44,'Swift44px controls');return {w:r.width,h:r.height,text:el.textContent};});
      var before=JSON.stringify(b.get());b.render();check(JSON.stringify(b.get())===before,'render pure');
      buy=document.querySelector('[data-research="charge"]');buy.scrollIntoView({block:'center'});buy.focus();
      var styles=getComputedStyle(document.querySelector('[data-forge-card="charge"] .desc'));
      return {checks:checks,descriptions:descriptions,controls:controls,color:styles.color,background:getComputedStyle(document.documentElement).getPropertyValue('--bg-elev').trim()};
    })()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    assert.equal(await evaluate('__supportUptimeQa.get().research.charge'),10,'native Enter purchases last Swift level');
    assert.equal(await evaluate('document.activeElement.getAttribute("data-queue")'),'charge','completed purchase focus fallback');
    assert.equal(await evaluate('document.querySelector("[data-research=charge]").disabled'),true,'cap disabled');
    assert.equal(await evaluate('window.__f13Errors.length'),0,'no runtime errors');
    samples.textContrast=contrast(samples.color,samples.background);assert(samples.textContrast>=4.5,'changed description contrast');
    const focus=await evaluate('(function(){var s=getComputedStyle(document.activeElement);return {style:s.outlineStyle,width:parseFloat(s.outlineWidth),color:s.outlineColor,background:s.backgroundColor};})()');
    assert.notEqual(focus.style,'none','keyboard focus visible');assert(focus.width>=2,'focus ring width');
    focus.contrast=contrast(focus.color,samples.background);assert(focus.contrast>=3,'focus ring contrast');
    const point=await evaluate('(function(){var e=document.activeElement,r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
    await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(await evaluate('__supportUptimeQa.get().researchQueue.charge'),true,'native touch retains cap queue intent');
    const screenshot=await send('Page.captureScreenshot',{format:'png'});
    const name=width+'-'+(reduced?'reduced':'motion')+'-'+(largeText?'text200':'text100');
    fs.writeFileSync(path.join(evidence,name+'.png'),Buffer.from(screenshot.data,'base64'));
    records.push({profile:name,samples,focus});
    await send('Target.disposeBrowserContext',{browserContextId:context.browserContextId},null);
  }
  return {status:baselineObservation?'observation':'pass',largeText:'pass',sourceSha256:createHash('sha256').update(source).digest('hex'),browser:version,records,
    limits:['Large text doubles changed ability/Ultimate/Forge descriptions; it is not Android system font scaling.','Modern Chromium is not WebView60 or physical Android/TalkBack acceptance.']};
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
