/* Integration regression: paid Lab speed inside the resumable offline transaction. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');
const copy=x=>JSON.parse(JSON.stringify(x)),start=2000000000000;
const records=[];
function engine(seed,seconds=0){
  let now=start+seconds*1000,monotonic=0,primaryFailure=false,recoveryFailure=false;
  const queue=[],storage=new Map(),writes=[];
  if(seed)for(const key of ['lumenfall_save_v2','lumenfall_save_recovery_v1'])storage.set(key,JSON.stringify(seed));
  const window={addEventListener(){}},document={readyState:'loading',addEventListener(){}};
  const localStorage={getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k),setItem(k,v){
    if((primaryFailure&&k==='lumenfall_save_v2')||(recoveryFailure&&k==='lumenfall_save_recovery_v1'))throw Error('injected storage failure');
    storage.set(k,v);writes.push(k);
  }};
  // Fixed damage and zero ability charge isolate the reward/payment timeline.
  const bridge=`window.qa={fresh:freshState,set:s=>state=acceptPersistedState(s),get:()=>state,apply:applyOfflineProgress,save:saveState,load:loadState,batch:n=>SIM_BATCH_EVENTS=n,clock:offlineProcessingClock,flags:()=>({busy:!!offlineCatchup,pending:offlinePending}),fault:()=>{var original=simulationResolveTimestamp;simulationResolveTimestamp=function(){simulationResolveTimestamp=original;throw Error('injected simulation failure');};}};simulationPassiveDps=function(){return 1100;};fillRateMult=function(){return 0;};`;
  const script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
  const Clock=class extends Date{static now(){return now;}};
  new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,localStorage,Clock,fn=>{queue.push(fn);return queue.length;},()=>{},{now:()=>monotonic});
  const b=window.qa;if(seed)b.set(copy(seed));
  return {b,storage,writes,primary:v=>primaryFailure=v,recovery:v=>recoveryFailure=v,processing:v=>monotonic=v,
    drain(){let batches=0;while(queue.length){queue.shift()();assert(++batches<10000,'bounded offline transaction');}return batches;}};
}
function fixture(motes=59){
  const s=engine(null).b.fresh();
  Object.assign(s,{lastSeen:start,riftMode:'farm',depth:1,enemyDepth:1,farmDepth:1,farmReturnDepth:2,maxDepthEver:130,enemyMaxHp:11,enemyHp:8.03,enemyIsLuminous:false,luminousAccum:.975,motes,lumen:0,shards:0});
  s.activeStudies=[{id:'guardmastery',remainingSec:300,totalDurationSec:600,speedMult:1}];
  s.studyUseMotes.guardmastery=true;s.studySpeedTargets.guardmastery=3;
  return s;
}
function complete(x){let result,error,calls=0;x.b.apply((r,e)=>{result=r;error=e;calls++;});const batches=x.drain();assert.equal(calls,1,'one completion callback');return {result,error,batches};}
function near(a,b,label){assert(Math.abs(a-b)<1e-7,label+': '+a+' vs '+b);}
const seed=fixture(),reference=engine(seed,30),sync=reference.b.apply();
assert.equal(sync.kills,3000,'independent damage/HP kill ledger');
assert.equal(sync.studySpeedPurchases,1);assert.equal(sync.studyMotesSpent,60);
near(reference.b.get().activeStudies[0].remainingSec,300-.0173-(30-.0173)*3,'payment follows the first enabling reward');
for(const budget of [1,2,31,256]){
  const x=engine(seed,30),before=copy(x.b.get());x.b.batch(budget);
  let result,error;x.b.apply((r,e)=>{result=r;error=e;});
  if(x.b.flags().busy){assert.deepEqual(x.b.get(),before,'yield keeps paid speed and Motes private');assert.equal(x.b.save(),false,'no partial save');assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_v2')),seed);}
  const batches=x.drain();assert.ifError(error);assert.deepEqual(result,sync,'batch budget changes no result');assert.deepEqual(x.b.get(),reference.b.get(),'batch budget changes no state');
  for(const key of ['lumenfall_save_v2','lumenfall_save_recovery_v1'])assert.deepEqual(JSON.parse(x.storage.get(key)),x.b.get(),'complete saved transaction');
  let repeated;x.b.apply(r=>repeated=r);assert.equal(repeated,null,'repeated return buys and earns nothing');
  records.push({case:'yielding',budget,batches,purchases:result.studySpeedPurchases,spent:result.studyMotesSpent});
}
for(const failure of ['primary','simulation']){
  const x=engine(seed,30),before=copy(x.b.get());x.b.batch(1);
  if(failure==='primary')x.primary(true);else x.b.fault();
  const failed=complete(x);assert(failed.error);assert.equal(failed.result,null);assert.deepEqual(x.b.get(),before,'failed transaction rolls back all speed payment');assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_v2')),seed);
  x.primary(false);const retried=complete(x);assert.ifError(retried.error);assert.deepEqual(retried.result,sync,'retry pays once');assert.deepEqual(x.b.get(),reference.b.get());
  records.push({case:failure+'-failure-and-retry',purchases:retried.result.studySpeedPurchases,spent:retried.result.studyMotesSpent});
}
const recovery=engine(seed,30);recovery.recovery(true);const committed=complete(recovery);assert.ifError(committed.error);assert.deepEqual(committed.result,sync);assert.deepEqual(recovery.b.get(),reference.b.get(),'recovery failure does not refund a committed primary payment');
const old=copy(seed);delete old.studyUseMotes;delete old.studySpeedTargets;const legacy=engine(old,30),legacyResult=legacy.b.apply();assert.equal(legacyResult.studySpeedPurchases,0);assert.equal(legacyResult.studyMotesSpent,0);assert.equal(legacy.b.get().studyUseMotes.guardmastery,false);near(legacy.b.get().activeStudies[0].remainingSec,270,'old-save intent defaults OFF');
const processing=engine(fixture(60),30);processing.b.batch(1);processing.processing(1000);let processingResult,processingError;processing.b.apply((r,e)=>{processingResult=r;processingError=e;});processing.processing(2000);processing.drain();assert.ifError(processingError);assert.equal(processingResult.studySpeedPurchases,1);assert.equal(processingResult.studyMotesSpent,60);near(processing.b.get().activeStudies[0].remainingSec,207,'foreground processing time uses paid speed');
const tailSeed=fixture(60);tailSeed.activeStudies[0].remainingSec=129615;tailSeed.activeStudies[0].totalDurationSec=129615;
const tail=engine(tailSeed,43210),tailResult=tail.b.apply();assert.equal(tailResult.effectiveSec,43200,'existing combat cap');assert.equal(tailResult.studySpeedPurchases,1);assert.equal(tailResult.studyMotesSpent,60);assert.equal(tail.b.get().longStudyLevels.guardmastery,0,'paid Study cannot complete beyond the shared cap');assert.equal(tail.b.get().activeStudies[0].remainingSec,15);
console.log(JSON.stringify({status:'pass',scenario:'lab-motes-offline-integration',records,recoveryFailure:'committed primary retained',legacy:'OFF',processing:'paid speed retained',tail:'shared 12h cap preserves paid work'}));
