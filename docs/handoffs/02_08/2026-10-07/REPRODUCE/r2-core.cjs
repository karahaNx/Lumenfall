/* Native CDP touch/keyboard at mobile widths; production page remains unmodified. */
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const [chrome,url,scenario]=process.argv.slice(2),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-farm-runtime-'));
const browser=spawn(process.env.LUMENFALL_QA_CDP_CHROME||chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',stderr='',session,closed=false;const pending=new Map(),records=[];
function rejectPending(message){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message+' '+p.method));}pending.clear();}
const completion=new Promise(resolve=>{browser.once('error',e=>{rejectPending(e.message);resolve({error:e.message});});browser.once('close',(code,signal)=>{closed=true;rejectPending('browser closed');resolve({code,signal});});});
browser.stderr.on('data',b=>{stderr=(stderr+b).slice(-4000);});
for(const stream of [browser.stdio[3],browser.stdio[4]])stream.on('error',e=>rejectPending(e.message));
browser.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))!==-1){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}});
function send(method,params={},sid=session){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method+' '+stderr));},15000);pending.set(id,{resolve,reject,timer,method});browser.stdio[3].write(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})})+'\0');});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
function assert(v,m){if(!v)throw Error(m);}
// Oracle runs in this Node process. No BigInt API is exposed to the app.
let checks=0;
function ok(value,message){checks++;assert(value,message);}
function near(a,b,message){ok(Math.abs(a-b)<1e-7,message+' '+a+' vs '+b);}
function units(x){const v=new DataView(new ArrayBuffer(8));v.setFloat64(0,x);const n=v.getBigUint64(0),e=Number(n>>52n&2047n);return ((n&((1n<<52n)-1n))+(e?1n<<52n:0n))<<BigInt(e?e-1:0);}
function represented(u){const shift=Math.max(0,u.toString(2).length-53);return Number(u>>BigInt(shift))*2**(shift-1074);}
function audit(r,strictMinimum=true){
 const {type,use,kind,H,input,dps,seconds,parts,trace}=r;
 let kills=0,luminous=0,lumen=0,shards=0,motes=0,payment=null,elapsed=0,damage=0n;
 for(const row of trace){
  const before=row.before,after=row.after,D=units(row.damage),h=units(before.enemyHp),max=units(before.enemyMaxHp);
  const expected=D<h?0:Number(1n+(D-h)/max),deficit=h+BigInt(expected)*max-D;
  const promotion=row.kills===expected+1&&deficit>0n&&(deficit<=units(1e-9)||deficit<=units(before.enemyMaxHp*1e-12));
  ok(row.kills===expected||promotion,'represented threshold count '+type);
  const remaining=expected===0?h-D:max-(D-h)%max;
  near(after.enemyHp,promotion?H:represented(remaining),'partial HP carry');
  const k=row.kills,acc=before.luminousAccum,chance=.03;
  const lk=k?(before.enemyIsLuminous?1:0)+(k>1?Math.floor(acc+(k-1)*chance+1e-12):0):0;
  ok(row.luminous===lk,'actual spawn count');
  if(k){const sum=acc+k*chance;near(after.luminousAccum,Math.max(0,Math.min(.999999999999,sum-Math.floor(sum+1e-12))),'spawn accumulator');ok(after.enemyIsLuminous===(Math.floor(sum+1e-12)>Math.floor(acc+Math.max(0,k-1)*chance+1e-12)),'next luminous flag');}
  const scale=kind==='offline'?.7:1;
  ok(after.lumen===before.lumen+6*scale*k,'represented Lumen policy');
  ok(after.shards===before.shards+scale*k,'represented Shards policy');
  kills+=k;luminous+=lk;lumen+=6*scale*k;shards+=scale*k;motes+=lk;damage+=D;elapsed+=row.seconds;
 }
 const state=parts.at(-1).state,summary={};
 for(const key of ['kills','luminousKills','lumenGained','shardGained','motesGained','studyMotesSpent','studySpeedPurchases'])summary[key]=parts.reduce((sum,p)=>sum+p.summary[key],0);
 const buys=use?1:0;
 ok(summary.kills===kills&&state.totalKills===kills,'aggregate exact kills');
 ok(summary.luminousKills===luminous&&summary.motesGained===motes,'aggregate spawn and Motes');
 const scale=kind==='offline'?.7:1;
 const groupedLumen=r.groups.map(g=>g.reduce((sum,row)=>sum+6*scale*row.kills,0)).reduce((a,b)=>a+b,0);
 const groupedShards=r.groups.map(g=>g.reduce((sum,row)=>sum+scale*row.kills,0)).reduce((a,b)=>a+b,0);
 ok(summary.lumenGained===groupedLumen&&summary.shardGained===groupedShards,'aggregate represented rewards in actual part order');
 ok(summary.studySpeedPurchases===buys&&summary.studyMotesSpent===60*buys,'one full price payment');
 ok(state.motes===input.motes+motes-60*buys,'Motes ledger');
 if(use){let t=0;for(let i=0;i<parts.length;i++){const event=parts[i].summary.timeline.find(e=>e.type==='studySpeed');if(event)payment=t+event.elapsedSec;t+=i===0&&r.split?r.split:seconds;}
  ok(payment!==null,'payment at an authoritative boundary');
  const boundary=(input.enemyHp+H)/dps;
  let time=0,count=0,enabler=null;
  for(const row of trace){time+=row.seconds;count+=row.kills;if(row.before.motes<60&&row.after.motes>=60){enabler={time,count,row};break;}}
  ok(payment>0&&enabler&&Math.abs(enabler.time-boundary)<=boundary*1e-12,'positive enabling reward boundary');
  ok(enabler.count===2&&enabler.row.luminous===1&&enabler.row.after.motes===60,'actual reward enables purchase');
  near(payment,boundary,'recorded payment time');
 }
 near(state.activeStudies[0].remainingSec,300-seconds-(use?(seconds-payment)*2:0),'only post-payment work');
 ok(parts.every(p=>!p.summary.abilityCasts&&!p.summary.ascends&&!p.summary.completedStudies.length),'no other economy event');
 if(type==='natural'){ok(dps===40052722017724424,'actual product natural DPS');ok(r.normalized.spirits.titan===1635&&r.normalized.research.formation===500,'finite normalization preserves investments');ok(Object.values(r.costs).flatMap(v=>typeof v==='object'?Object.values(v):[v]).every(Number.isFinite),'finite next prices');}
 const minimum=type==='core'?3275345183542180:type==='natural'?3277040892359271:type==='b1'?90:null;
 if(strictMinimum&&minimum!==null)ok(kills===minimum,'documented '+type+' minimum');
 if(type==='b1'){ok(luminous===3&&state.motes===(use?2:62),'B1 Motes and luminous');near(state.activeStudies[0].remainingSec,use?297.3346:299.1,'B1 work');if(use)near(payment,.0173,'B1 .0173 payment');}
 return {summary,damageUnits:String(damage),payment,unchangedBoundaryPromotions:trace.filter(row=>{const D=units(row.damage),h=units(row.before.enemyHp),max=units(row.before.enemyMaxHp);return row.kills!==(D<h?0:Number(1n+(D-h)/max));}).length};
}
async function execute(type,use,kind,split,mutant=false){
 return evaluate(`(function(){
  var b=window.__lumenfallQaBridge,t=b.labMotes,type=${JSON.stringify(type)},use=${use},kind=${JSON.stringify(kind)},split=${split},H=type==='fractional'?11.5:type==='fractional-high'?4*Math.PI:11;
  return t.withHp(H,function(){
   var s=b.freshStateSnapshot(),natural=type==='natural';
   Object.assign(s,{riftMode:'farm',depth:1,enemyDepth:1,farmDepth:1,farmReturnDepth:2,maxDepthEver:130,enemyMaxHp:H,enemyHp:type==='core'?H:8.03,enemyIsLuminous:false,luminousAccum:.975,motes:type==='core'&&!use?0:59,lumen:0,shards:0,questDay:window.__lumenfallQaContext.currentDay()});
   s.activeStudies=[{id:'guardmastery',remainingSec:300,totalDurationSec:600,speedMult:1}];s.studyUseMotes.guardmastery=use;s.studySpeedTargets.guardmastery=3;
   if(natural){s.activeParty=['titan'];s.spirits.titan=1635;s.heroRarity.titan=5;s.heroRarity.ember=1;s.heroResource.titan=0;s.research.formation=500;s.longStudyLevels.formationstudy=500;s.longStudyLevels.wispascend=500;s.nodes.momentum=500;s.ascendCount=5;s.achieved.asc5=true;}
   var normalized=b.setState(s),dps=natural?t.naturalDps():type==='core'||type==='fractional-high'?Math.pow(2,55)+16:1100,seconds=type==='core'?1:.9,costs=natural?t.numericCosts():null,undo=${mutant}?t.mutate('rounded-quotient'):function(){};
   try{var groups=[];function call(dt,start){var traced=t.traceFarm(function(){return t.direct(dt,kind,start);});groups.push(traced.rows);return traced.result;}function go(){var a=call(split||seconds,2000000000000);return split?[a,call(seconds-split,2000000000000+split*1000)]:[a];}var parts=natural?go():t.withDps(dps,go);return {type:type,use:use,kind:kind,split:split,H:H,input:s,normalized:normalized,dps:dps,seconds:seconds,costs:costs,parts:parts,groups:groups,trace:[].concat.apply([],groups)};}finally{undo();}
  });
 })()`);
}
async function run(){
 const tab=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:tab.targetId,flatten:true},null)).sessionId;
 await send('Page.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.BigInt=undefined;DataView.prototype.getBigInt64=undefined;DataView.prototype.getBigUint64=undefined;'});await send('Page.navigate',{url});
 for(let i=0;i<150&&!await evaluate('!!window.__farmRuntimeReady');i++)await new Promise(r=>setTimeout(r,20));
 ok(await evaluate('!!window.__farmRuntimeReady'),'startup without BigInt');
 await evaluate('window.__qaForgeStartup.promise');
 const availability=await evaluate('({BigInt:typeof BigInt,getBigUint64:typeof DataView.prototype.getBigUint64,errors:window.__lumenfallQaContext.errors})');
 ok(availability.BigInt==='undefined'&&availability.getBigUint64==='undefined'&&!availability.errors.length,'app BigInt APIs unavailable and startup clean');
 const push=await evaluate('(function(){var b=window.__lumenfallQaBridge;b.setState(b.freshStateSnapshot());return b.labMotes.withDps(1100,function(){return b.labMotes.direct(.9,"live",2000000000000);});})()');
 ok(push.state.riftMode==='push'&&push.summary.kills>0&&Number.isFinite(push.state.enemyHp),'ordinary Push motor without BigInt');
 for(const type of ['core'])for(const use of [false,true])for(const kind of ['live','offline'])for(const split of [0,type==='core'?.5:.01]){const r=await execute(type,use,kind,split);records.push(r);r.oracle=audit(r);}
 const controls=[];
 for(const type of ['core','natural']){const r=await execute(type,false,'live',0,true);let rejected=false;try{audit(r);}catch(e){rejected=/threshold count|minimum/.test(e.message);}ok(rejected,'exact old R2 fails '+type);const restored=await execute(type,false,'live',0);restored.oracle=audit(restored);controls.push({type,mutant:r,oracleRejected:rejected,restored});}
 const errors=await evaluate('window.__lumenfallQaContext.errors');ok(!errors.length,'no app runtime errors');
 return {status:'pass',scenario,checks,availability,push,records,controls,limits:'Chrome with BigInt APIs removed; external Node BigInt oracle; not a physical WebView 60 test'};
}
(async()=>{let result;try{result=await run();}catch(error){result={status:'fail',scenario,checks,message:error.message,records};}
 try{assert(pending.size===0,'all CDP operations settled');if(!closed)await send('Browser.close',{},null).catch(()=>{});let timer;const done=await Promise.race([completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('browser close timeout')),5000);})]).finally(()=>clearTimeout(timer));assert(closed&&done.code===0&&!done.error,'graceful browser termination');await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});result.teardown={browser:done,pending:pending.size,profileRemoved:!fs.existsSync(profile)};}catch(error){browser.kill('SIGKILL');result.status='fail';result.teardown={message:error.message,stderr};}
 process.stdout.write(JSON.stringify(result)+'\n');process.exitCode=result.status==='pass'?0:1;
})();
