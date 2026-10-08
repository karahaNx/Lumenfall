'use strict';
// Full product IIFE with DOM startup withheld. Only private observation hooks,
// a deterministic clock/storage and cooperative timer queue are installed.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(process.argv[2] || path.join(root, 'index.html'), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const original = JSON.parse(fs.readFileSync(path.join(root, 'docs/qa/offline-autoascend-2026-10-07/device_backup.json'), 'utf8'));
const records = [];
function app(seed = null, seconds = 0, html = source) {
  let now = (seed ? seed.lastSeen : 1800000000000) + seconds * 1000, seq = 0;
  let failPrimary = false, failRecovery = false;
  const queue = [], storage = new Map();
  if (seed) for (const key of ['lumenfall_save_v2', 'lumenfall_save_recovery_v1']) storage.set(key, JSON.stringify(seed));
  const localStorage = { getItem:key => storage.get(key) || null, removeItem:key => storage.delete(key), setItem(key, value) {
    if (failPrimary && key === 'lumenfall_save_v2' || failRecovery && key === 'lumenfall_save_recovery_v1') throw Error('injected storage failure');
    storage.set(key, value);
  }};
  const window = { addEventListener() {} }, document = { readyState:'loading', addEventListener() {} };
  const bridge = `els['toast']={textContent:'',classList:{add:function(){},remove:function(){}}};
    window.qa={fresh:freshState,set:s=>state=acceptPersistedState(s),get:()=>state,accept:acceptPersistedState,
    apply:applyOfflineProgress,advance:advanceAuthoritativeTime,save:saveState,load:loadState,
    backup:encodeSaveBackup,decode:decodeSaveBackup,cancel:cancelOfflineCatchup,
    restore:restoreSaveBackup,policy:()=>({cap:offlineCapHours(),rate:offlineRate()}),
    buyNode:buyNode,buyShop:buyShopItem,complete:restStopComplete,
    flags:()=>({busy:!!offlineCatchup,pending:offlinePending,blocked:persistenceBlocked}),
    fault:()=>{simulationResolveTimestamp=function(){throw Error('injected simulation failure');};},
    batch:n=>SIM_BATCH_EVENTS=n,quiet:()=>{state.activeParty=[];},
    tailFault:()=>{advanceStudyOnlyTime=function(){throw Error('forbidden Study tail');};}};`;
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  assert.equal(script.split("if(document.readyState==='loading'){").length, 2, 'exact observation marker');
  new Function('window', 'document', 'localStorage', 'Date', 'setTimeout', 'clearTimeout', 'BigInt', 'performance',
    script.replace("if(document.readyState==='loading'){", bridge + "if(document.readyState==='loading'){"))(
    window, document, localStorage, class extends Date { static now() { return now; } },
    fn => { queue.push({id:++seq, fn}); return seq; }, id => { const i=queue.findIndex(x=>x.id===id); if(i>=0) queue.splice(i,1); }, undefined, {now:()=>0});
  const b = window.qa;
  b.set(seed || b.fresh());
  return { b, storage, queue, document, clock:value=>now=value,
    failPrimary:value=>failPrimary=value, failRecovery:value=>failRecovery=value,
    drain() { let batches=0; while(queue.length) { queue.shift().fn(); assert(++batches<100000, 'bounded batches'); } return batches; }};
}
function legacy(level=3, offline24=true, offline48=true) {
  const s=app().b.fresh(); s.schemaVersion=1; delete s.offline12hRefund;
  s.lastSeen=1800000000000; s.nodes.reserves=level; s.owned.offline24=offline24; s.owned.offline48=offline48;
  s.prisms=100; s.comets=100; return s;
}
function consume(seed, seconds, batch=256, quiet=false) {
  const x=app(seed, seconds), before=clone(x.b.get()); x.b.batch(batch); x.b.tailFault(); if(quiet) x.b.quiet();
  let result, error, callbacks=0;
  x.b.apply((r,e)=>{result=r;error=e;callbacks++;});
  if(x.b.flags().busy) {
    assert.deepEqual(x.b.get(), quiet ? {...before, activeParty:[]} : before, 'no partial authoritative state');
    assert.equal(x.b.save(),false,'autosave held during replay');
  }
  const batches=x.drain(); assert.ifError(error); assert.equal(callbacks,1);
  assert.equal(result && result.effectiveSec,seconds<5?null:Math.min(seconds,43200));
  if(result) {
    assert.equal(x.b.get().lastSeen,seed.lastSeen+seconds*1000,'consume whole absence endpoint');
    assert.equal(x.b.get().totalOfflineSeconds,before.totalOfflineSeconds+Math.min(seconds,43200));
    const committed=clone(x.b.get());
    assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_v2')),committed);
    assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_recovery_v1')),committed);
    let duplicate; x.b.apply(r=>duplicate=r); x.drain(); assert.equal(duplicate,null);
    assert.deepEqual(x.b.get(),committed,'duplicate return pays nothing');
  }
  records.push({seconds,batch,batches,quiet,kills:result?.kills,ascends:result?.ascends,studyMotesSpent:result?.studyMotesSpent});
  return {x,result,state:clone(x.b.get())};
}
function withoutEndpoint(s) { const value=clone(s); delete value.lastSeen; return value; }
// Independent fixed purchase totals; every original single-price ceil matters.
for(const [level,prisms] of [[0,0],[1,6],[2,16],[3,32],[4,57],[5,97],[8,423],[12,2810]]) {
  for(const a of [false,true]) for(const b of [false,true]) {
    const seed=legacy(level,a,b), x=app(seed), m=clone(x.b.get());
    assert.equal(m.prisms,100+prisms); assert.equal(m.comets,100+(a?140:0)+(b?160:0));
    assert.equal(m.nodes.reserves,level); assert.equal(m.legacyCometPurchases.offline24, a?true:undefined); assert.equal(m.legacyCometPurchases.offline48,b?true:undefined);
    assert.equal(m.schemaVersion,2); assert.equal(m.lastSeen,seed.lastSeen);
    assert.deepEqual(x.b.accept(m),m,'normalization idempotent');
    assert.deepEqual(x.b.decode(x.b.backup(m)),m,'new backup does not refund again');
    assert.deepEqual(x.b.decode(x.b.backup(seed)),m,'old backup deterministic replacement');
    assert.equal(x.b.policy().cap,12);
    x.b.save(); x.b.set(x.b.load()); assert.equal(x.b.get().prisms,m.prisms); assert.equal(x.b.get().comets,m.comets);
    x.storage.set('lumenfall_save_v2','invalid'); x.b.set(x.b.load());
    assert.equal(x.b.get().prisms,m.prisms,'recovery cannot duplicate refund');
  }
}
records.push({migrationCases:32,originalPriceTotals:true,canonicalRecoveryBackup:true});
const hist=app(legacy()).b.get();
for(const id of ['offline24','offline48']) { const x=app(hist), before=clone(x.b.get()); x.b.buyShop({id,cost:0,retired:false}); assert.deepEqual(x.b.get(),before); }
for(const count of [1,5,10,100,'max']) { const x=app(hist), before=clone(x.b.get()); x.b.buyNode({id:'reserves',baseCost:0,growth:1,retired:false},count); assert.deepEqual(x.b.get(),before); }
const complete=app(); complete.b.get().owned={autoascend:true,comettrials:true}; assert(complete.b.complete(),'retired items cannot remain a completion gate');
// Actual restore path replaces primary/recovery and suppresses pre-restore saves.
const restore=app(legacy()), code=restore.b.backup(legacy());
restore.document.getElementById=id=>id==='save-backup-code'?{value:code}:null;
restore.document.body={classList:{add(){}}};
for(let i=0;i<3;i++) {
  const x=app(legacy()); x.document.getElementById=restore.document.getElementById; x.document.body=restore.document.body;
  const restoredAt=1800000000000+(i+1)*86400000;x.clock(restoredAt);
  // Verify the authoritative write, reload guard and replacement balance.
  x.b.restore(); const saved=JSON.parse(x.storage.get('lumenfall_save_v2'));
  assert.equal(saved.comets,400); assert.equal(saved.prisms,132); assert.equal(saved.lastSeen,restoredAt);
  assert.equal(app(saved).b.apply(),null,'restoring an old backup manufactures no offline period');
  assert.equal(x.b.save(),undefined,'reload guard holds old in-memory data');
}
// Purchased/pending work remains the exact paid snapshot through migration.
const study=legacy(); study.activeStudies=[{id:'guardmastery',remainingSec:46800,totalDurationSec:46800,speedMult:1}];
study.studyQueue.guardmastery=true; study.studyUseMotes.guardmastery=true; study.studySpeedTargets.guardmastery=3;
study.motes=0; study.lumen=1e9; study.shards=1e9;
assert.deepEqual(app(study).b.get().activeStudies,study.activeStudies);
const lab12=consume(study,43200,256,true),lab24=consume(study,86400,31,true);
assert.deepEqual(withoutEndpoint(lab24.state),withoutEndpoint(lab12.state),'24h has exactly 12h Lab/queue/economy');
assert.equal(lab24.state.activeStudies[0].remainingSec,3600); assert.equal(lab24.state.longStudyLevels.guardmastery,0);
assert.equal(lab24.state.studySpeedTargets.guardmastery,3); assert.equal(lab24.state.studyUseMotes.guardmastery,true);
assert.equal(lab24.result.studyMotesSpent,0,'no tail speed debit');
for(const remaining of [43199.999,43200,43200.001]) {
  const s=clone(study); s.studyQueue.guardmastery=false; s.activeStudies[0].remainingSec=remaining;
  const r=consume(s,86400,256,true); assert.equal(r.state.longStudyLevels.guardmastery,remaining<=43200?1:0,'exact cap completion boundary');
}
const queueStudy=clone(study); queueStudy.activeStudies[0].remainingSec=3600;
queueStudy.activeStudies[0].speedMult=3; queueStudy.motes=600;
const q12=consume(queueStudy,43200,256,true),q24=consume(queueStudy,86400,31,true);
assert.deepEqual(withoutEndpoint(q24.state),withoutEndpoint(q12.state),'queue and exact paid repeats share cap');
assert(q24.result.studySpeedPurchases>0 && q24.result.studyMotesSpent>0,'real B2 repeat speed purchases exercised');
// Reported production device save, live combat/rewards, Auto-Ascend ON/OFF.
for(const on of [false,true]) {
  const seed=clone(original); seed.autoAscendEnabled=on;
  for(const seconds of [0,1,3600,21600]) consume(seed,seconds);
  const a=consume(seed,43200),b=consume(seed,86400,31),c=consume(seed,259200);
  assert.deepEqual(withoutEndpoint(b.state),withoutEndpoint(a.state),'cap state includes all reward and automation fields');
  assert.deepEqual(withoutEndpoint(c.state),withoutEndpoint(a.state),'72h cannot extend production');
  assert.deepEqual(b.result.completedStudies,a.result.completedStudies);
  assert.equal(b.result.kills,a.result.kills); assert.equal(b.result.ascends,a.result.ascends);
}
for(const failure of ['cancel','simulation','primary','recovery']) {
  const x=app(original,86400),before=clone(x.b.get()); x.b.batch(16);
  if(failure==='simulation') x.b.fault();
  if(failure==='primary') x.failPrimary(true);
  if(failure==='recovery') x.failRecovery(true);
  let result,error,calls=0; x.b.apply((r,e)=>{result=r;error=e;calls++;});
  if(failure==='cancel') x.b.cancel(); x.drain(); assert.equal(calls,1); assert(!x.b.flags().busy);
  if(failure==='recovery') {
    assert.ifError(error); assert(result); const saved=JSON.parse(x.storage.get('lumenfall_save_v2'));
    const restart=app(saved); assert.equal(restart.b.apply(),null,'primary committed endpoint cannot replay');
  } else {
    assert(error); assert.deepEqual(x.b.get(),before,'rollback includes refund/history/chronology');
    assert.equal(x.storage.get('lumenfall_save_v2'),JSON.stringify(original));
    assert.equal(x.b.save(),false,'failed/cancelled endpoint cannot be consumed');
    const retry=consume(original,86400); assert(retry.result);
  }
  records.push({failure,calls,error:error?.message});
}
const huge=legacy(10000); const x=app();
assert.throws(()=>x.b.accept(huge),/non-finite original price/);
x.storage.set('lumenfall_save_v2',JSON.stringify(huge)); x.b.load();
assert(x.b.flags().blocked); assert.equal(x.storage.get('lumenfall_save_v2'),JSON.stringify(huge));
for(const balance of [1e30,1e40,1e300]) {
  const seed={...legacy(),prisms:balance,comets:balance},a=app(seed);
  assert.equal(a.b.get().prisms,balance);assert.equal(a.b.get().comets,balance);
  assert.deepEqual(a.b.get().offline12hRefund.prismsPaid,[false,false,false]);
  assert.equal(a.b.get().offline12hRefund.prismsExact,'32');
  a.b.save();a.b.set(a.b.load());assert.equal(a.b.get().prisms,balance);
  const backup=a.b.decode(a.b.backup(a.b.get()));assert.equal(backup.prisms,balance);
  a.b.get().prisms=0;a.b.get().comets=0;a.b.save();
  assert.equal(a.b.get().prisms,32);assert.equal(a.b.get().comets,300);
  a.b.save();a.b.set(a.b.load());assert.equal(a.b.get().prisms,32);assert.equal(a.b.get().comets,300);
}
// Independent BigInt test oracle is confined to the modern test driver.
// The full game executes with BigInt absent, including large original prices.
for(const level of [80,200,1000]) {
  const seed=legacy(level);seed.prisms=1e300;const a=app(seed);
  let exact=0n;for(let i=0;i<level;i++)exact+=BigInt(Math.ceil(6*Math.pow(1.6,i)));
  assert.equal(a.b.get().offline12hRefund.prismsExact,String(exact));
  assert.equal(a.b.get().nodes.reserves,level);assert.deepEqual(a.b.accept(a.b.get()),a.b.get());
}
// Frozen receipts produced by the full game on Node8.3/V8 6.0 with BigInt absent.
// Preserve recorded original prices instead of re-evaluating newer Math.pow.
for(const seed of JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-offline-refund-interop.json'),'utf8'))) {
  const a=app(seed);assert.deepEqual(a.b.get().offline12hRefund,seed.offline12hRefund);
  assert.equal(a.b.get().prisms,seed.prisms);a.b.save();a.b.set(a.b.load());
  assert.deepEqual(a.b.get().offline12hRefund,seed.offline12hRefund);
  assert.deepEqual(a.b.decode(a.b.backup(a.b.get())),a.b.get());
}
// A dominating refund must not erase a small existing balance by subtraction rounding.
const dominant=app({...legacy(200),prisms:1e300}).b.get();
dominant.offline12hRefund.prismsPaid.fill(true);dominant.offline12hRefund.prismsPaid[199]=false;dominant.prisms=6;
const deposit=app(dominant);assert.equal(deposit.b.get().prisms,6);assert.equal(deposit.b.get().offline12hRefund.prismsPaid[199],false);
deposit.b.get().prisms=0;deposit.b.save();assert.equal(deposit.b.get().prisms,dominant.offline12hRefund.prismPrices[199]);
deposit.b.save();assert.equal(deposit.b.get().prisms,dominant.offline12hRefund.prismPrices[199],'dominant refund paid once');
// Partial credit retains each unpaid original price rather than rounding a sum.
const partial=app({...legacy(),prisms:2**53});
assert.deepEqual(partial.b.get().offline12hRefund.prismsPaid,[true,true,true]);
assert.equal(partial.b.get().prisms-2**53,32);
const carry=app({...legacy(),prisms:2**55});
assert.deepEqual(carry.b.get().offline12hRefund.prismsPaid,[false,false,true]);
carry.b.get().prisms=0;carry.b.save();assert.equal(carry.b.get().prisms,16);
carry.b.save();assert.equal(carry.b.get().prisms,16,'paid original price does not repay');
// F27 already archived both entitlements; it must receive the same migration.
const archived=legacy();archived.legacyCometPurchases={offline24:true,offline48:true};archived.owned={};
assert.equal(app(archived).b.get().comets,400);
const bad=clone(hist); bad.offline12hRefund.prismsExact='33'; assert.throws(()=>app().b.accept(bad),/history is invalid/);
// Negative controls against complete entry, migration and restored production.
for(const [name,oldText,newText] of [
  ['cap','return PRODUCTIVE_OFFLINE_CAP_SEC / 3600;','return 24;'],
  ['tail','  state.totalOfflineSeconds += effectiveSec;','  yield* advanceStudyOnlyTime(elapsedSec-effectiveSec,lastSeen+effectiveSec*1000,sim,true);\n  state.totalOfflineSeconds += effectiveSec;',null],
  ['refund','out[currency]=result;paid[index]=true;','paid[index]=true;',null]
]) {
  assert(source.includes(oldText),name+' mutation marker'); const mutant=source.replace(oldText,newText);
  if(name==='cap') {const m=app(study,86400,mutant);m.b.quiet();assert.notEqual(m.b.apply().effectiveSec,43200,'the mutant actually replays too much time');}
  if(name==='tail') { const m=app(study,86400,mutant); m.b.tailFault(); assert.throws(()=>m.b.apply(),/forbidden Study tail/); }
  if(name==='refund') assert.notEqual(app(legacy(),0,mutant).b.get().prisms,132);
  assert.equal(app(legacy()).b.get().prisms,132,'restored source passes');
  records.push({negative:name,caught:true});
}
console.log(JSON.stringify({status:'pass',scenario:'offline-12h',records},null,2));
