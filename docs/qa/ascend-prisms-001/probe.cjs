#!/usr/bin/env node
'use strict';
// Full unmodified game script and DOM in Chromium. Only clocks/timers, storage,
// test state installation and observation hooks are controlled by this harness.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const {spawn} = require('node:child_process');
const sourcePath = path.resolve(process.argv[2] || 'index.html');
const output = path.resolve(process.argv[3] || '/tmp/lumenfall-f05-probe');
fs.mkdirSync(output, {recursive:true});
let source = fs.readFileSync(sourcePath, 'utf8');
const negative=process.argv.find(x=>x.startsWith('--negative='))?.split('=')[1];
const designPolicy=process.argv.includes('--policy=new-depth-ceil');
const mutations={
  tree:["(1 + nodeLevel('swift')*0.04) * longStudyPrismMult()","1 * longStudyPrismMult()"],
  lab:["function longStudyPrismMult(){ return 1 + longStudyLevel('prismstudy')*0.05; }","function longStudyPrismMult(){ return 1; }"],
  payout:["  state.prisms += gain;","  state.prisms += gain + 1;"],
  repeat:["var ASCEND_REPEAT_REWARD_RATE = 0.20;","var ASCEND_REPEAT_REWARD_RATE = 0.25;"]
};
if(negative){const pair=mutations[negative];if(!pair||source.split(pair[0]).length!==2)throw Error('Invalid causal control '+negative);source=source.replace(pair[0],pair[1]);}
const marker = '\n})();\n</script>\n<script>\nif(window.Capacitor';
if (source.split(marker).length !== 2) throw Error('Game closure marker changed');
const browserProbe = function () {
  var rows=[],checks=0;
  var clock=2000000000000;
  function assert(test,msg){checks++;if(!test)throw Error(msg);}
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function seed(c,b,t,l,mode){
    var s=freshState();s.depth=c+1;s.maxDepthEver=Math.max(c,b,90)+1;
    s.ascendRewardedDepth=b;s.nodes.swift=t;s.longStudyLevels.prismstudy=l;
    s.prisms=100;s.spirits.ember=1;s.activeParty=['ember'];
    Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=false;});
    s.owned.autoascend=true;s.autoAscendTargetDepth=c+1;s.autoAscendEnabled=false;
    if(mode==='farm'){s.riftMode='farm';s.depth=19;s.farmDepth=19;s.farmReturnDepth=c+1;}
    s.enemyDepth=s.depth;s.enemyMaxHp=enemyHpFor(s.depth);s.enemyHp=s.enemyMaxHp;
    return s;
  }
  function install(s){state=acceptPersistedState(clone(s),'f05-probe');restoreEnemyOrSpawn();renderAscendSummary();}
  // Independent reference uses the documented contract, not product helpers.
  function oracle(c,b,t,l){
    var mult=(1+0.04*t)*(1+0.05*l);
    function full(d){return d<15?0:Math.max(1,Math.floor(2*Math.sqrt(d)*mult));}
    var f=full(c),r=b>0&&f>0?Math.max(1,Math.floor(f*0.2)):0;
    var p=b<=0?f:c>b?(window.__f05DesignPolicy ? Math.ceil((2*Math.sqrt(c)-2*Math.sqrt(b))*mult) : Math.max(0,f-full(b))):0;
    return {full:f,reserve:r,progressBonus:p,gain:f===0?0:b<=0?f:Math.max(1,Math.min(f,r+p))};
  }
  function preview(){return document.getElementById('prism-preview').textContent;}
  function check(c,b,t,l,mode){
    var s=seed(c,b,t,l,mode),expected=oracle(c,b,t,l);install(s);
    var before=clone(state),bd=ascendPrismBreakdown(progressionDepth()),text=preview();
    Object.keys(expected).forEach(function(k){assert(bd[k]===expected[k],JSON.stringify({c:c,b:b,t:t,l:l,k:k,actual:bd[k],expected:expected[k]}));});
    assert(text==='+'+formatNum(expected.gain)+' Prisms','DOM preview '+text);
    renderAscendSummary();assert(JSON.stringify(before)===JSON.stringify(state),'render must not mutate save');
    doAscend(false);var gain=state.prisms-before.prisms;
    assert(gain===expected.gain,'manual payout versus preview');
    assert(state.ascendRewardedDepth===(c<15?b:Math.max(c,b)),'manual benchmark');
    assert(state.nodes.swift===t&&state.longStudyLevels.prismstudy===l,'bonuses retained');
    assert(decodeSaveBackup(currentSaveBackup()).ascendRewardedDepth===state.ascendRewardedDepth,'backup benchmark');
    if(c>=15){var saved=JSON.parse(localStorage.getItem(SAVE_KEY));assert(saved.prisms===state.prisms,'saved payout');assert(saved.ascendRewardedDepth===state.ascendRewardedDepth,'saved benchmark');}
    var row={cleared:c,benchmark:b,swift:t,completedLab:l,mode:mode||'push',mult:prismMult(),preview:text,manual:gain,breakdown:bd};
    if(mode!=='farm'){
      ['live','offline'].forEach(function(kind){
        s.autoAscendEnabled=true;install(s);var balance=state.prisms;
        var summary=advanceAuthoritativeTime(0.001,{kind:kind,visual:false,clockStartMs:clock,offlineWindowStartMs:clock,captureTimeline:true});
        var want=c>=15?1:0;
        assert(summary.ascends===want,'auto count '+kind);
        if(want){assert(summary.ascendGains[0]===expected.gain,'auto payout '+kind);assert(state.prisms-balance===expected.gain,'auto balance '+kind);}
        row[kind]={ascends:summary.ascends,gains:summary.ascendGains,balanceDelta:state.prisms-balance,benchmark:state.ascendRewardedDepth};
      });
    }
    rows.push(row);
  }
  try{
    cacheEls();isNewGame=false;pendingDailyReward=null;startupIntroPlaying=false;
    document.getElementById('startup-intro').style.display='none';
    // Small first/repeat/new-depth matrix, exact threshold neighbors, reported
    // approximate bonus hypotheses, late values and safely represented depth.
    [14,15,16,19,20,21,24,25,26,30,100,219,220,1000000,Number.MAX_SAFE_INTEGER-1].forEach(function(c){
      [0,c,Math.max(15,c-5),219].forEach(function(b){
        [[0,0],[1,0],[0,1],[1,1],[17,0],[18,0],[0,18],[17,18],[18,18],[25,10],[1000,1000]].forEach(function(v){check(c,b,v[0],v[1]);});
      });
    });
    [[0,0],[1,0],[0,1],[1,1],[17,0],[0,18],[17,18],[18,18]].forEach(function(v){check(20,219,v[0],v[1],'farm');});
    // Bonus thresholds at repeat Rift20: full24 stays4; full25 becomes5;
    // full29 stays5; full30 becomes6. Observe the real gain and balance.
    [44,45,57,58,59].forEach(function(t){check(20,219,t,0);});
    // Actual boss clear, rather than an already-ready state. The DOM preview
    // before this clear describes cleared19; the award describes cleared20.
    var triggers=[];
    ['live','offline'].forEach(function(kind){
      var s=seed(19,219,17,18);s.autoAscendEnabled=true;s.autoAscendTargetDepth=21;
      s.enemyDepth=20;s.enemyHp=1;s.enemyMaxHp=enemyHpFor(20);s.spirits.ember=50;
      install(s);assert(!autoAscendReady(),'uncleared target must not ascend');
      var oldPreview=preview(),balance=state.prisms;
      var summary=advanceAuthoritativeTime(1,{kind:kind,visual:false,clockStartMs:clock,offlineWindowStartMs:clock,captureTimeline:true});
      assert(summary.ascends===1,'boss clear triggers once');
      assert(summary.ascendGains[0]===oracle(20,219,17,18).gain,'boss clear payout');
      triggers.push({kind:kind,previewBeforeClear:oldPreview,gains:summary.ascendGains,balanceDelta:state.prisms-balance,timeline:summary.timeline});
    });
    // Pending Lab work: only completed levels affect Prisms. Observe completion
    // at 1s, then compare manual payout and authoritative auto payout at collision.
    var studies=[];
    ['live','offline'].forEach(function(kind){
      var s=seed(20,219,0,2);s.activeStudies=[{id:'prismstudy',remainingSec:1,totalDurationSec:2,speedMult:1}];install(s);
      var before=ascendPrismGain();
      advanceAuthoritativeTime(0.5,{kind:kind,visual:false,clockStartMs:clock,offlineWindowStartMs:clock});
      assert(state.longStudyLevels.prismstudy===2,'pending Lab cannot earn level early');assert(ascendPrismGain()===before,'pending bonus unchanged');
      advanceAuthoritativeTime(0.5,{kind:kind,visual:false,clockStartMs:clock+500,offlineWindowStartMs:clock});
      assert(state.longStudyLevels.prismstudy===3,'completion earns level');renderAscendSummary();
      var after=ascendPrismGain(),balance=state.prisms;doAscend(false);assert(state.prisms-balance===after,'completed Lab manual payout');
      studies.push({kind:kind,pendingGain:before,completedGain:after});
      // Existing chronology: a time-zero auto Ascend resolves before due Study
      // completion. Payout therefore uses the completed level before this timestamp.
      s.autoAscendEnabled=true;s.activeStudies[0].remainingSec=0;install(s);balance=state.prisms;
      var result=advanceAuthoritativeTime(0.001,{kind:kind,visual:false,clockStartMs:clock,offlineWindowStartMs:clock,captureTimeline:true});
      assert(result.ascendGains[0]===oracle(20,219,0,2).gain,'collision old completed level');
      assert(state.longStudyLevels.prismstudy===3,'collision completion retained after Ascend');
      studies.push({kind:kind,collisionGain:result.ascendGains[0],completedAfter:state.longStudyLevels.prismstudy,timeline:result.timeline});
    });
    // Exploratory canonical-calculation scan. Separate from complete DOM/payout
    // rows above; existing decreases are findings, not feature acceptance.
    install(seed(20,219,0,0));
    var monotonic={checks:0,decreases:0,examples:[]};
    function record(previous,next,c,b,t,l,axis){
      monotonic.checks++;
      if(next<previous){monotonic.decreases++;if(monotonic.examples.length<8)monotonic.examples.push({cleared:c,benchmark:b,swift:t,lab:l,axis:axis,before:previous,after:next});}
    }
    function gain(c,b,t,l){state.ascendRewardedDepth=b;state.nodes.swift=t;state.longStudyLevels.prismstudy=l;return ascendPrismBreakdown(c+1).gain;}
    for(var c=16;c<=120;c++)for(var b=15;b<c;b++){
      [0,1,2,18].forEach(function(l){var previous=gain(c,b,0,l);for(var t=1;t<=30;t++){var next=gain(c,b,t,l);record(previous,next,c,b,t,l,'Tree');previous=next;}});
      [0,1,17,18,25].forEach(function(t){var previous=gain(c,b,t,0);for(var l=1;l<=20;l++){var next=gain(c,b,t,l);record(previous,next,c,b,t,l,'Lab');previous=next;}});
    }
    if(window.__f05DesignPolicy)assert(monotonic.decreases===0,'approved rule must not reduce rewards when buying a bonus');
    install(seed(20,219,17,18));var legacy=clone(state);delete legacy.ascendRewardedDepth;
    state=acceptPersistedState(legacy,'f05-legacy');assert(state.ascendRewardedDepth===0,'legacy absent benchmark default');
    var payload={status:'pass',checks:checks,scope:'Full browser motor; synthetic saves, not the user save or Android acceptance',rows:rows,triggers:triggers,studies:studies,monotonic:monotonic};
    var el=document.createElement('pre');el.id='f05-result';el.textContent=JSON.stringify(payload);document.body.appendChild(el);
  }catch(e){var el=document.createElement('pre');el.id='f05-result';el.textContent=JSON.stringify({status:'fail',checks:checks,error:e.stack,rows:rows});document.body.appendChild(el);}
};
const prelude='<script>window.setInterval=function(){return 0;};window.requestAnimationFrame=function(){return 0;};window.addEventListener("error",function(e){document.documentElement.setAttribute("data-f05-error",e.message);});window.addEventListener("unhandledrejection",function(e){document.documentElement.setAttribute("data-f05-error",String(e.reason));});</script>';
let instrumented=source.replace('<head>','<head>'+prelude+'<script>window.__f05DesignPolicy='+JSON.stringify(designPolicy)+';</script>').replace(marker,'\nwindow.__f05Run='+browserProbe.toString()+';\ndocument.addEventListener("DOMContentLoaded",window.__f05Run);'+marker);
const server=http.createServer((req,res)=>{
  if(req.url.split('?')[0]==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(instrumented);}
  const file=path.resolve(path.dirname(sourcePath),'.'+req.url.split('?')[0]);
  if(!file.startsWith(path.dirname(sourcePath)+path.sep)){res.statusCode=403;return res.end();}
  fs.readFile(file,(e,b)=>{if(e){res.statusCode=404;res.end();}else res.end(b);});
});
function run(cmd,args){return new Promise((resolve,reject)=>{const child=spawn(cmd,args),chunks=[],errors=[];const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Browser timeout'));},60000);child.stdout.on('data',x=>{chunks.push(x);fs.appendFileSync(path.join(output,'browser-dom.html'),x);});child.stderr.on('data',x=>{errors.push(x);fs.appendFileSync(path.join(output,'browser-stderr.txt'),x);});child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve({code,stdout:Buffer.concat(chunks).toString(),stderr:Buffer.concat(errors).toString()});});});}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f05-'));
  try{
    const result=await run(process.env.LUMENFALL_CHROME||'chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--user-data-dir='+profile,'--window-size=390,844','--virtual-time-budget=2000','--dump-dom','http://127.0.0.1:'+server.address().port+'/index.html']);
    fs.writeFileSync(path.join(output,'browser-dom.html'),result.stdout);fs.writeFileSync(path.join(output,'browser-stderr.txt'),result.stderr);
    if(result.code!==0)throw Error('Browser exit '+result.code);
    const match=result.stdout.match(/<pre id="f05-result">([\s\S]*?)<\/pre>/);
    if(!match)throw Error('Missing browser result; see raw DOM/stderr');
    const payload=JSON.parse(match[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&'));
    payload.source={path:sourcePath,bytes:Buffer.byteLength(source),sha256:crypto.createHash('sha256').update(source).digest('hex'),gitBlob:crypto.createHash('sha1').update('blob '+Buffer.byteLength(source)+'\0').update(source).digest('hex')};
    payload.recordedAt=new Date().toISOString();payload.node=process.versions.node;payload.policy=designPolicy?'user-approved new-depth-ceil (2026-10-07)':'existing accepted rounding';
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(payload,null,2)+'\n');
    console.log(JSON.stringify({status:payload.status,checks:payload.checks,rows:payload.rows?.length,error:payload.error,output:output}));
    if(payload.status!=='pass'||/data-f05-error=/.test(result.stdout))process.exitCode=1;
  }finally{server.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e.stack);process.exitCode=1;server.close();});
