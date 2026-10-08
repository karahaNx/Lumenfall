#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {spawn}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(process.argv[2]||'/tmp/lumenfall-f05-ui-current'),output=path.resolve(process.argv[3]||'/tmp/lumenfall-f05-layout');
fs.mkdirSync(output,{recursive:true});
function assertions(){
  var checks=0,rows=[];
  function ok(x,message){checks++;if(!x)throw Error(message);}
  try{
    cacheEls();var params=new URLSearchParams(location.search),width=Number(params.get('width'));
    document.documentElement.style.fontSize=params.get('large')==='1'?'130%':'100%';
    document.getElementById('startup-intro').style.display='none';isNewGame=false;pendingDailyReward=null;
    [[14,0,0,0],[20,0,17,18],[20,219,17,18],[30,20,17,18],[1000000,219,1000,1000]].forEach(function(v){
      var s=freshState();s.depth=v[0]+1;s.maxDepthEver=Math.max(220,s.depth);s.ascendRewardedDepth=v[1];s.nodes.swift=v[2];s.longStudyLevels.prismstudy=v[3];
      state=acceptPersistedState(s,'f05-layout');restoreEnemyOrSpawn();activateTab('ascend');
      var before=JSON.stringify(state);renderAscendSummary();ok(JSON.stringify(state)===before,'render must not mutate');
      var calc=document.getElementById('prism-calculation'),rect=calc.getBoundingClientRect(),text=calc.textContent;
      ok(innerWidth===width,'exact viewport');ok(rect.width>0&&rect.left>=0&&rect.right<=width+1,'calculation contained');
      ok(calc.scrollWidth<=calc.clientWidth+1,'no calculation overflow');
      calc.querySelectorAll('dt,dd,p').forEach(function(el){var r=el.getBoundingClientRect();ok(r.left>=rect.left-1&&r.right<=rect.right+1,'cell contained');});
      ok(document.documentElement.scrollWidth<=width+1,'no page overflow');
      ok(text.includes('Swift Ascension')&&text.includes('completed levels')&&text.includes('rounded down')&&text.includes('You receive now'),'explanation complete');
      ok(document.getElementById('ascend-btn').getAttribute('aria-describedby').split(' ').includes('prism-calculation'),'button explanation reference');
      var button=document.getElementById('ascend-btn').getBoundingClientRect();ok(button.height>=44&&button.width>=44,'Ascend touch target');
      rows.push({cleared:v[0],benchmark:v[1],swift:v[2],lab:v[3],preview:document.getElementById('prism-preview').textContent,rect:{x:rect.x,width:rect.width,height:rect.height},text:text});
    });
    state=freshState();state.depth=21;state.maxDepthEver=220;state.ascendRewardedDepth=219;state.nodes.swift=17;state.longStudyLevels.prismstudy=18;restoreEnemyOrSpawn();activateTab('ascend');
    var payload={status:'pass',checks:checks,width:width,large:params.get('large')==='1',reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,rows:rows};
    parent.postMessage({f05Result:payload},location.origin);
  }catch(e){parent.postMessage({f05Result:{status:'fail',checks:checks,error:e.stack,rows:rows}},location.origin);}
}
const marker='\n})();\n</script>\n<script>\nif(window.Capacitor';
let source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sourceSha256=createHash('sha256').update(source).digest('hex');
if(source.split(marker).length!==2)throw Error('Closure marker changed');
source=source.replace('<head>','<head><script>window.setInterval=function(){return 0;};window.requestAnimationFrame=function(){return 0;};</script>').replace(marker,'\ndocument.addEventListener("DOMContentLoaded",'+assertions.toString()+');'+marker);
const host=`<!doctype html><html><body style="margin:0;background:#0d0f1f"><script>var p=new URLSearchParams(location.search),f=document.createElement('iframe');f.style.cssText='border:0;width:'+p.get('width')+'px;height:844px';f.src='/index.html?'+p.toString();document.body.appendChild(f);addEventListener('message',function(e){if(e.origin!==location.origin||e.source!==f.contentWindow||!e.data.f05Result)return;var pre=document.createElement('pre');pre.id='f05-result';pre.style.display='none';pre.textContent=JSON.stringify(e.data.f05Result);document.body.appendChild(pre);});</script></body></html>`;
const server=http.createServer((req,res)=>{const uri=req.url.split('?')[0];if(uri==='/host.html'||uri==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(uri==='/host.html'?host:source);}const file=path.resolve(root,'.'+uri);if(!file.startsWith(root+path.sep)){res.statusCode=403;return res.end();}const ext=path.extname(file);res.setHeader('Content-Type',ext==='.css'?'text/css':ext==='.svg'?'image/svg+xml':'application/octet-stream');fs.readFile(file,(e,data)=>{res.statusCode=e?404:200;res.end(e?'':data);});});
function browser(args){return new Promise((resolve,reject)=>{const child=spawn(process.env.LUMENFALL_CHROME||'chromium',args),out=[],err=[];const timeout=setTimeout(()=>{child.kill('SIGKILL');reject(Error('layout timeout'));},30000);child.stdout.on('data',x=>out.push(x));child.stderr.on('data',x=>err.push(x));child.on('error',reject);child.on('close',code=>{clearTimeout(timeout);resolve({code,stdout:Buffer.concat(out).toString(),stderr:Buffer.concat(err).toString()});});});}
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const results=[];try{for(const [width,large,reduced]of [[320,false,false],[390,false,false],[430,false,false],[320,true,false],[390,true,true]]){const label=width+'-'+(large?'large':'normal')+'-'+(reduced?'reduced':'motion'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'f05-layout-'));try{const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--user-data-dir='+profile,'--window-size=500,900','--virtual-time-budget=2500','--dump-dom'];if(reduced)args.push('--force-prefers-reduced-motion');if(width===390&&!large)args.push('--screenshot='+path.join(output,'proposal-390.png'));args.push('http://127.0.0.1:'+server.address().port+'/host.html?width='+width+'&large='+(large?'1':'0'));const r=await browser(args);fs.writeFileSync(path.join(output,label+'-dom.html'),r.stdout);fs.writeFileSync(path.join(output,label+'-stderr.txt'),r.stderr);if(r.code!==0)throw Error('browser exit '+r.code);const m=r.stdout.match(/<pre id="f05-result"[^>]*>([\s\S]*?)<\/pre>/);if(!m)throw Error('No layout result');const p=JSON.parse(m[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));results.push({...p,label});console.log(JSON.stringify({label,status:p.status,checks:p.checks,error:p.error}));if(p.status!=='pass')process.exitCode=1;}finally{fs.rmSync(profile,{recursive:true,force:true});}}fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({recordedAt:new Date().toISOString(),sourceSha256,results},null,2)+'\n');}finally{server.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;server.close();});
