// Local F16 acceptance probe. Uses production rendering and simulation helpers;
// injected QA bridge and interval pause are never shipped in index.html.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawn,execFileSync}=require('node:child_process');
const root=process.argv[2],out=process.argv[3];
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const baseline=process.argv.includes('--baseline');
const hash=require('node:crypto').createHash('sha256').update(source).digest('hex');
const marker='\n})();\n</script>\n<script>\nif(window.Capacitor';
if(source.split(marker).length!==2)throw Error('Production IIFE marker changed');
const bridge=`
window.__bondProbe={
 definitions:function(){return {wisps:SPIRITS,bonds:FORMATION_BONDS,abilities:ABILITY_DESC};},
 seed:function(ids,zero){
  var s=freshState();s.maxDepthEver=101;s.depth=101;s.enemyDepth=101;
  s.enemyMaxHp=enemyHpFor(101);s.enemyHp=s.enemyMaxHp;s.activeParty=ids.slice();
  SPIRITS.forEach(function(sp){s.spirits[sp.id]=10;});
  if(zero)s.spirits[zero]=0;
  state=acceptPersistedState(s,'f16-qa');restoreEnemyOrSpawn();
  renderAll();renderEncyclopedia();
  return {active:activeFormationBonds().map(function(b){return b.id;}),
   nonBoss:formationContextDamageMult(101),boss:formationContextDamageMult(110),
   reward:formationRewardMult(),average:averageAbilityDps(101)};
 },
 renderStable:function(){var before=JSON.stringify(state);renderFormationBonds();renderSpirits();renderEncyclopedia();return before===JSON.stringify(state);},
 finishStartup:function(){if(startupIntroFinish)startupIntroFinish();document.querySelectorAll('.overlay').forEach(function(x){x.style.display='none';});}
};`;
const prelude=`<script>window.__bondErrors=[];window.addEventListener('error',function(e){__bondErrors.push(e.message);});window.addEventListener('unhandledrejection',function(e){__bondErrors.push(String(e.reason));});window.__bondPause=true;var __bondInterval=setInterval;setInterval=function(fn,ms){return __bondInterval(function(){if(!__bondPause)fn();},ms);};</script>`;
const html=source.replace('<head>','<head>'+prelude).replace(marker,'\n'+bridge+marker);
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/index.html'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(404).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.woff2')?'font/woff2':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
const profile=fs.mkdtempSync('/tmp/bond-text-probe-'),pending=new Map();
let browser,session,seq=0,buffer='',stderr='',records=[],mechanics=[];
function assert(v,m){if(!v)throw Error(m);}
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},12000);pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function key(key){await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:13});}
async function main(){
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
 browser.stderr.on('data',b=>{stderr+=b;});
 browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw),p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
 browser.on('error',e=>{for(const p of pending.values())p.reject(e);});
 const target=await send('Target.createTarget',{url:'about:blank'},null);
 session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
 await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/index.html'});
 for(let i=0;i<100;i++){if(await evaluate('!!window.__bondProbe && !!document.querySelector("#spirit-list .hero-card")'))break;await new Promise(r=>setTimeout(r,30));}
 await evaluate('document.fonts.ready');await evaluate('__bondProbe.finishStartup();document.querySelector("[data-tab=spirits]").click()');
 await new Promise(r=>setTimeout(r,2600)); // Allow the real welcome toast to expire.
 const definitions=await evaluate('__bondProbe.definitions()');
 for(const bond of definitions.bonds){
  const names=bond.ids.map(id=>definitions.wisps.find(sp=>sp.id===id).name).join(' + ');
  for(const kind of ['active','benched','pending']){
   const ids=kind==='benched'?[bond.ids[0]]:bond.ids;
   const result=await evaluate('__bondProbe.seed('+JSON.stringify(ids)+','+JSON.stringify(kind==='pending'?bond.ids[1]:null)+')');
   assert(result.active.includes(bond.id)===(kind==='active'),'powered activation '+bond.id+' '+kind);
   assert(await evaluate('__bondProbe.renderStable()'),'render must preserve state');
   const actual=await evaluate(`(()=>{const row=[...document.querySelectorAll('#bond-card .bond-row')].find(x=>x.querySelector('.bond-name').textContent.includes(${JSON.stringify(bond.name)}));return {partners:row.querySelector('.bond-req').textContent,effect:row.querySelector('.bond-effect').textContent,active:row.classList.contains('active')};})()`);
   assert(actual.effect===bond.effect&&actual.active===(kind==='active'),'effect/activation UI '+bond.id+' '+kind);
   if(!baseline){assert(actual.partners===names,'authoritative partner names '+bond.id);assert(await evaluate(`(()=>{const row=[...document.querySelectorAll('#encyclopedia-content .ency-card')].find(x=>x.querySelector('.ency-name')?.textContent===${JSON.stringify(bond.name)});return row.querySelector('.ency-meta').textContent.startsWith(${JSON.stringify(names+' · ')});})()`),'Encyclopedia Bond partners '+bond.id);}
   mechanics.push({bond:bond.id,kind,...result});
  }
 }
 await evaluate('__bondProbe.seed(["stone","titan"],null);document.querySelector("[data-tab=spirits]").click();document.querySelector(".formation-help").open=true;document.querySelectorAll(".wisp-progression").forEach(x=>x.open=true)');
 const ability=await evaluate(`({wisps:[...document.querySelectorAll('.ability-desc')].map(x=>x.textContent),encyclopedia:[...document.querySelectorAll('[data-ency-wisp] .ency-desc')].map(x=>x.textContent)})`);
 if(!baseline){for(const text of [...ability.wisps,...ability.encyclopedia])assert(!/Stone \+ Titan|Bond|together activate/.test(text),'partner leakage in ability');assert(ability.wisps.filter(x=>x==='Heavy ability damage. Its Module boosts the hit; its Ultimate doubles it.').length===2,'Breaker own effect preserved');}
 await evaluate(`window.__bondBaseFont=[...document.querySelectorAll('.ability-desc,.ency-desc')].map(el=>({el,size:parseFloat(getComputedStyle(el).fontSize)}));`);
 for(const width of [320,390,430])for(const textScale of [1,2])for(const motion of ['no-preference','reduce']){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
  await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(textScale*100+'%')};document.querySelector('main').scrollTop=0;document.querySelector('.formation-help').open=false;document.querySelector('.formation-help > summary').focus();`);
  await evaluate(`__bondBaseFont.forEach(x=>x.el.style.fontSize=(x.size*${textScale})+'px')`);
  await key('Enter');
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const measure=await evaluate(`(()=>{
   const q=s=>document.querySelector(s),summary=q('.formation-help > summary'),rect=summary.getBoundingClientRect(),style=getComputedStyle(summary);
   const rows=[...document.querySelectorAll('#bond-card .bond-row')].map(row=>{const partner=row.querySelector('.bond-req'),effect=row.querySelector('.bond-effect'),p=partner.getBoundingClientRect(),e=effect.getBoundingClientRect();return {partner:partner.textContent,partnerFits:partner.scrollWidth<=partner.clientWidth+1,rowFits:row.scrollWidth<=row.clientWidth+1,notOverlapping:p.right<=e.left+1,color:getComputedStyle(partner).color,background:getComputedStyle(row).backgroundColor};});
   const abilities=[...document.querySelectorAll('.hero-ability')].map(el=>({fits:el.scrollWidth<=el.clientWidth+1,heightFits:el.scrollHeight<=el.clientHeight+1}));
   return {open:q('.formation-help').open,focused:document.activeElement===summary,height:rect.height,outline:style.outlineStyle,outlineWidth:style.outlineWidth,rows,abilities,cardFits:q('#bond-card').scrollWidth<=q('#bond-card').clientWidth+1,errors:__bondErrors.slice()};
  })()`);
  records.push({width,textScale,motion,...measure});
  assert(measure.open&&measure.focused&&measure.height>=44,'native disclosure focus and 44px at '+width);
  assert(measure.outline!=='none'&&parseFloat(measure.outlineWidth)>0,'keyboard focus visible');
  assert(measure.cardFits&&measure.rows.every(x=>x.partnerFits&&x.rowFits&&x.notOverlapping),'full names fit at '+width+' scale '+textScale);
  assert(measure.errors.length===0,'no runtime errors');
  assert(measure.abilities.every(x=>x.fits&&x.heightFits),'ability explanations wrap completely at '+width+' scale '+textScale);
  for(let index=0;index<definitions.bonds.length;index++){
   const reachable=await evaluate(`(()=>{const row=document.querySelectorAll('#bond-card .bond-row')[${index}];row.scrollIntoView({block:'center',behavior:'instant'});const r=row.getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect();return r.height>0&&r.top>=m.top&&r.bottom<=m.bottom;})()`);
   assert(reachable,'each complete Bond row is reachable at '+width+' scale '+textScale);
  }
  if(!baseline&&width===390&&motion==='no-preference')for(const [name,selector] of [['top','#bond-card'],['bottom','#bond-card .bond-row:last-child']]){await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'formation-390-text'+textScale+'-'+name+'.png'),Buffer.from(shot.data,'base64'));}
 }
 return {status:'PASS',sourceSha256:hash,baseline,definitions,ability,mechanics,profiles:records,browser:execFileSync('/usr/bin/chromium',['--version'],{encoding:'utf8'}).trim()};
}
main().then(result=>{fs.writeFileSync(path.join(out,'probe-result.json'),JSON.stringify(result,null,2)+'\n');console.log('PASS: 12 Bond states and 12 UI profiles, native disclosure, ability text, render purity.');}).catch(error=>{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'probe-result.json'),JSON.stringify({status:'FAIL',sourceSha256:hash,error:error.stack,mechanics,profiles:records},null,2)+'\n');console.error(error.stack);process.exitCode=1;}).finally(async()=>{fs.writeFileSync(path.join(out,'browser.stderr'),stderr);if(browser){try{await send('Browser.close',{},null);}catch{}browser.kill();}server.close();for(const p of pending.values())clearTimeout(p.timer);fs.rmSync(profile,{recursive:true,force:true});});
