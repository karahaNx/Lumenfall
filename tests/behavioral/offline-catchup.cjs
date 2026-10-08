/* Long-offline regression and independent baseline comparisons. Built-ins only.
 * Run: node tests/behavioral/offline-catchup.cjs [--source path/to/index.html]
 * Timers are queued deterministically; real browser responsiveness is separately
 * covered by offline-catchup-ui.cjs, not inferred from this runner.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..');
const sourceArg=process.argv.indexOf('--source');
const source=fs.readFileSync(sourceArg<0?path.join(root,'index.html'):process.argv[sourceArg+1],'utf8');
const baseline=fs.readFileSync(path.join(root,'docs/recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/main-index.html'),'utf8');
assert.equal(require('node:crypto').createHash('sha1').update('blob '+Buffer.byteLength(baseline)+'\0'+baseline).digest('hex'),'ea44431c163569548973d9e489f75345749a07ee','original product oracle blob');
// PR70's independently prepared clock correction is a necessary dependency:
// closing old queues exposes a canonical-grid stall. Keep the immutable old
// engine as the reference, applying ONLY its two clock corrections. The complete
// state and summary comparisons below remain exact, including economy/ownership.
function clockReference(original){
 const replacements=[
  ['  var targetGridPositionSec = startPhaseSec+elapsedSec;\n  var targetFarmGridCrossings = Math.floor(targetGridPositionSec);\n  var targetGridPhaseSec = targetGridPositionSec-targetFarmGridCrossings;',
   '  var targetGridPhaseSec = startPhaseSec+targetFractionSec;\n  var targetGridCarry = Math.floor(targetGridPhaseSec);\n  var targetFarmGridCrossings = targetWholeSec+targetGridCarry;\n  targetGridPhaseSec -= targetGridCarry;'],
  ['    var elapsedWholeBefore = elapsedWholeSec;\n    var elapsedFractionBefore = elapsedFractionSec;',
   '    var gridCrossingsBefore = farmGridCrossings;\n    var gridRemainingBefore = farmGridRemainingSec;'],
  ['if(elapsedWholeSec===elapsedWholeBefore && elapsedFractionSec===elapsedFractionBefore && actions===0){',
   'if(farmGridCrossings===gridCrossingsBefore && farmGridRemainingSec===gridRemainingBefore && actions===0){']
 ];
 for(const [before,after] of replacements){assert.equal(original.split(before).length,2,'unique frozen clock marker');original=original.replace(before,after);}
 return original;
}
const correctedClockBaseline=clockReference(baseline);
const original=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
const copy=x=>JSON.parse(JSON.stringify(x)),records=[];
function app(seed,html=source,seconds=0){
 let now=seed.lastSeen+seconds*1000,monotonic=0,seq=0,fault=null,primaryFail=false,recoveryFail=false;
 const queue=[],writes=[],storage=new Map([['lumenfall_save_v2',JSON.stringify(seed)],['lumenfall_save_recovery_v1',JSON.stringify(seed)]]);
 const date=class extends Date {static now(){return now;}};
 const document={readyState:'loading',addEventListener(){}};
 const window={addEventListener(){}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem(k,v){
  if((primaryFail&&k==='lumenfall_save_v2')||(recoveryFail&&k==='lumenfall_save_recovery_v1'))throw Error('injected storage failure');
  storage.set(k,v);writes.push({key:k,state:JSON.parse(v)});
 },removeItem:k=>storage.delete(k)};
 const bridge=`window.qa={set:s=>state=acceptPersistedState(s),get:()=>state,apply:applyOfflineProgress,advance:advanceAuthoritativeTime,study:advanceStudyOnlyTime,summary:simulationSummary,load:loadState,backup:currentSaveBackup,decode:decodeSaveBackup,save:saveState,cancel:typeof cancelOfflineCatchup==='function'?cancelOfflineCatchup:()=>{},flags:()=>({busy:typeof offlineCatchup!=='undefined'&&!!offlineCatchup,pending:typeof offlinePending!=='undefined'&&offlinePending,resume:typeof resumeFlowBusy!=='undefined'&&resumeFlowBusy}),batch:n=>{if(typeof SIM_BATCH_EVENTS!=='undefined')SIM_BATCH_EVENTS=n;},fault:()=>{simulationResolveTimestamp=function(){throw Error('injected simulation failure');};}};`;
 const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
 new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,localStorage,date,(fn)=>{queue.push({id:++seq,fn});return seq;},id=>{const i=queue.findIndex(x=>x.id===id);if(i>=0)queue.splice(i,1);},{now:()=>monotonic});
 const b=window.qa;b.set(copy(seed));
 return {b,storage,writes,queue,clock:v=>now=v,monotonic:v=>monotonic=v,failPrimary:v=>primaryFail=v,failRecovery:v=>recoveryFail=v,
  drain(){let batches=0;while(queue.length){queue.shift().fn();batches++;assert(batches<100000,'bounded number of work batches');}return batches;}};
}
function approx(a,b,label){const tolerance=Math.max(1e-6,Math.max(Math.abs(a),Math.abs(b))*1e-12);assert(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance,`${label}: ${a} vs ${b}, tolerance ${tolerance}`);}
function compare(a,b,label='state'){
 if(typeof a==='number'&&typeof b==='number'){approx(a,b,label);return;}
 if(Array.isArray(a)||a&&typeof a==='object'){
  assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),label+' keys');
  Object.keys(a).forEach(k=>compare(a[k],b[k],label+'.'+k));return;
 }
 assert.equal(a,b,label);
}
// The frozen product has no repeat-speed fields. Assert their exact legacy OFF
// defaults separately, then retain the complete original state/summary oracle.
function baselineSummary(actual,expected,label){
 assert.equal(actual.studySpeedPurchases,0,label+' no legacy repeat purchases');
 assert.equal(actual.studyMotesSpent,0,label+' no legacy repeat spending');
 const {studySpeedPurchases,studyMotesSpent,...existing}=actual;
 assert.deepEqual(existing,expected,label);
}
function baselineState(actual,expected,seed,label){
 const ids=Object.keys(expected.longStudyLevels);
 assert.deepEqual(actual.studyUseMotes,Object.fromEntries(ids.map(id=>[id,false])),label+' legacy OFF intent');
 assert.deepEqual(actual.studySpeedTargets,Object.fromEntries(ids.map(id=>{
  const paid=(seed.activeStudies||[]).find(study=>study.id===id);
  return [id,paid&&paid.speedMult>1?paid.speedMult:1.5];
 })),label+' remembered legacy paid tier');
 assert.equal(actual.cometTrial,null,label+' no unsolicited Trial');
 assert.equal(actual.cometTrialResult,null,label+' no unsolicited result');
 assert.deepEqual(actual.cometTrialMarks,{},label+' no unsolicited marks');
 assert.deepEqual(actual.cometCosmetics,{trail:false,crest:false},label+' new cosmetics default OFF');
 const oldOwnership={...expected.owned},legacy={};
 for(const id of ['rememberbulk','offline24','offline48']){if(oldOwnership[id]===true)legacy[id]=true;delete oldOwnership[id];}
 assert.deepEqual(actual.legacyCometPurchases,legacy,label+' full legacy ownership archived');
 // This frozen player's Bonds level is below the new purchase cap. Assert the
 // exact additive F21 defaults before comparing every original gameplay field.
 assert.equal(seed.nodes.bonds,19,label+' immutable below-cap refund fixture');
 assert.deepEqual(actual.feedbackMigration,{version:1,applied:true,bondsCreditAuditVersion:1,receipts:{},history:{bonds:{levels:19}}},label+' below-cap migration has no refund');
 assert.deepEqual(actual.refundCredits,{prisms:[]},label+' no unsolicited Prism credits');
 const {studyUseMotes,studySpeedTargets,cometTrial,cometTrialResult,cometTrialMarks,cometCosmetics,legacyCometPurchases,offline12hRefund,feedbackMigration,refundCredits,...existing}=actual;
 // F14 changes only the selected destination during a matching partial rebuild.
 const intent=expected.formationRebuild;
 const selected=intent&&intent.preset&&expected.formationPresets[intent.preset]&&
   expected.formationPresets[intent.preset].join(',')===intent.members.join(',')
   ? intent.preset : expected.activeFormationPreset;
 let refund=0;for(let i=0;i<(seed.nodes?.reserves||0);i++)refund+=Math.ceil(6*Math.pow(1.6,i));
 assert.equal(actual.schemaVersion,2,label+' migrated schema');
 assert.deepEqual(existing,{...expected,schemaVersion:2,owned:oldOwnership,activeFormationPreset:selected,
  prisms:expected.prisms+refund,comets:expected.comets+(legacy.offline24?140:0)+(legacy.offline48?160:0)},label);
}
function runAsync(seed,seconds,batch=256){
 const x=app(seed,source,seconds),before=copy(x.b.get());x.b.batch(batch);
 let result=null,error=null,callbacks=0;
 x.b.apply((r,e)=>{result=r;error=e;callbacks++;});
 assert(x.b.flags().busy,'long catch-up must yield before returning');
 assert.deepEqual(x.b.get(),before,'yield leaves authoritative runtime unchanged');
 assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_v2')),seed,'no partial primary save');
 assert.equal(x.b.save(),false,'autosave blocked while busy');
 assert.equal(x.b.apply(()=>{throw Error('duplicate return callback');}),null,'duplicate return cannot start another job');
 const batches=x.drain();assert.ifError(error);assert.equal(callbacks,1,'complete once');
 assert(!x.b.flags().busy&&!x.b.flags().pending&&!x.b.flags().resume,'flags clear after completion');
 assert.equal(x.b.get().lastSeen,seed.lastSeen+seconds*1000,'consumed endpoint');
 assert.equal(x.b.get().totalOfflineSeconds,seed.totalOfflineSeconds+Math.min(seconds,12*3600),'combat accounting/cap');
 const committed=copy(x.b.get());let duplicate;
 x.b.apply(r=>duplicate=r);assert.equal(duplicate,null,'repeated return awards nothing');
 assert.deepEqual(x.b.get(),committed,'repeated return preserves state');
 assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_v2')),committed,'primary completed save');
 assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_recovery_v1')),committed,'recovery completed save');
 records.push({case:seed.autoAscendEnabled?'ON Clear'+(seed.autoAscendTargetDepth-1):'OFF',seconds,batch,batches,kills:result.kills,ascends:result.ascends,iterations:result.iterations,earned:result.earned});
 return {x,result,committed};
}
const start=performance.now();
// Fails on the unchanged product through the reported production entry.
const on=runAsync(original,28800);
assert.equal(on.result.kills,302400);assert.equal(on.result.ascends,14400);
assert.equal(on.committed.prisms-original.prisms,86400+2810);
assert.equal(on.committed.lumen,0,'Ascension reset preserves earned vs balance distinction');
assert.deepEqual(on.committed.formationRebuild,original.formationRebuild,'unaffordable Boss reconstruction intent persists');
assert.deepEqual(on.committed.empowerQueue,original.empowerQueue,'purchase intent preserved');
assert.deepEqual(on.committed.activeParty,['ember']);
const sync=app(original,source,28800);const syncResult=sync.b.apply();
assert.deepEqual(syncResult,on.result,'same full summary across yielding/synchronous facade');
assert.deepEqual(sync.b.get(),on.committed,'exact scheduler state across yielding/synchronous facade');
const narrow=runAsync(original,28800,31);
assert.deepEqual(narrow.committed,on.committed,'changing work budget changes no state');
assert.deepEqual(narrow.result,on.result,'changing work budget changes no rewards/accounting');
const clear20=copy(original);clear20.autoAscendTargetDepth=21;
const c20=runAsync(clear20,28800);
const off=copy(original);off.autoAscendEnabled=false;
const disabled=runAsync(off,28800);assert.equal(disabled.result.kills,773);assert.equal(disabled.result.ascends,0);
assert.equal(disabled.committed.spirits.titan,144);
const cap=runAsync(original,72*3600);assert.equal(cap.result.kills,453600);assert.equal(cap.result.ascends,21600);
const beyond=copy(original);beyond.activeStudies=[{id:'guardmastery',remainingSec:80*3600,totalDurationSec:80*3600,speedMult:1}];beyond.studyQueue={};
const long=runAsync(beyond,96*3600);assert.equal(long.result.effectiveSec,12*3600);
assert(!long.result.completedStudies.includes("Guardian's Mastery"),'Study cannot complete beyond the common cap');assert(Math.abs(long.committed.activeStudies[0].remainingSec-68*3600)<1e-5,'12h paid work within existing scheduler epsilon');
assert.equal(long.result.kills,cap.result.kills,'beyond-cap time earns no extra combat');
// Preserve old numerical policy against the unchanged scheduler for short windows
// and chronological research/Motes/automation boundaries.
// Compare unchanged chronology with closed purchase intent disabled on both
// sides. UPGRADE_IDENTITY tests separately exercise old ON intent and paid work.
// New F15 operands are intentional. Preserve the upstream exact legacy oracle
// as a four-Bond counterfactual; actual eight-Bond long/split checks stay intact.
const legacyBondSource=source.replace('function bondActive(bondId){',
 "function bondActive(bondId){\n  if(['kindling','vanguard','quarry','harvest'].indexOf(bondId)!==-1) return false;");
assert.notEqual(legacyBondSource,source,'legacy Bond control anchor');
for(const rawSeed of [original,clear20,off]){
 const seed=copy(rawSeed);
 for(const id of ['focus','sense','formation','resolve'])seed.researchQueue[id]=false;
 for(const id of ['riftattune','formationstudy','prismstudy'])seed.studyQueue[id]=false;
 for(const seconds of [60,300,3600]){
  const old=app(seed,correctedClockBaseline,seconds),next=app(seed,legacyBondSource,seconds);
  const a=old.b.advance(seconds,{kind:'offline',visual:false,clockStartMs:seed.lastSeen});
  const b=next.b.advance(seconds,{kind:'offline',visual:false,clockStartMs:seed.lastSeen});
  baselineSummary(b,a,'unchanged baseline summary '+seconds);baselineState(next.b.get(),old.b.get(),seed,'unchanged baseline state '+seconds);
 }
}
const all=copy(original);all.research.charge=0;
for(const id of ['focus','sense','formation','resolve'])all.researchQueue[id]=false;
for(const id of ['riftattune','formationstudy','prismstudy'])all.studyQueue[id]=false;Object.keys(all.empowerQueue).forEach(k=>all.empowerQueue[k]=true);
all.researchQueue.charge=true;all.studyQueue.guardmastery=true;
for(const kind of ['live','offline']){
 const whole=app(all),split=app(all),old=app(all,correctedClockBaseline),legacy=app(all,legacyBondSource),options={kind,visual:false,clockStartMs:all.lastSeen};
 const sum=whole.b.advance(3600,options),legacySum=legacy.b.advance(3600,options),oldSum=old.b.advance(3600,options);
 baselineSummary(legacySum,oldSum,'economy/order baseline '+kind);baselineState(legacy.b.get(),old.b.get(),all,'baseline chronology '+kind);
 for(let i=0;i<4;i++)split.b.advance(900,{...options,clockStartMs:all.lastSeen+i*900000,offlineWindowStartMs:all.lastSeen});
 compare(split.b.get(),whole.b.get(),'whole/split '+kind);
 assert(sum.motesGained>0&&sum.empowers>0&&sum.researchBought>0,'Motes, Research and Empower chronology exercised');
 records.push({case:'boundaries '+kind,kills:sum.kills,motes:sum.motesGained,empowers:sum.empowers,research:sum.researchBought,studies:sum.completedStudies});
}
// Cancellation, restart and primary/recovery failures never partially consume.
for(const failure of ['cancel','simulation','primary','recovery']){
 const x=app(original,source,28800),before=copy(x.b.get());let result,error,callbacks=0;
 if(failure==='primary')x.failPrimary(true);if(failure==='recovery')x.failRecovery(true);
 x.b.apply((r,e)=>{result=r;error=e;callbacks++;});
 if(failure==='cancel')x.b.cancel();if(failure==='simulation')x.b.fault();x.drain();
 assert.equal(callbacks,1,failure+' callback exactly once');assert(!x.b.flags().busy&&!x.b.flags().resume,failure+' busy flags clear');
 if(failure==='recovery'){
  assert.ifError(error);assert.deepEqual(x.b.get(),on.committed,'primary success remains authoritative after recovery failure');
  x.failRecovery(false);x.b.set(x.b.load());assert.equal(x.b.apply(),null,'reload from primary cannot duplicate');
 }else{
  assert(error,failure+' reports error');assert.deepEqual(x.b.get(),before,failure+' rollback runtime');
  assert.deepEqual(JSON.parse(x.storage.get('lumenfall_save_v2')),original,failure+' preserves primary');
  assert.equal(x.b.save(),false,failure+' failed endpoint cannot be consumed by autosave');
  const restart=app(x.b.load(),source,28800);let retryError,retry;restart.b.apply((r,e)=>{retry=r;retryError=e;});restart.drain();assert.ifError(retryError);assert.deepEqual(restart.b.get(),on.committed,failure+' restart replays entire window once');
 }
 records.push({case:failure,callbacks,error:error&&error.message,pending:x.b.flags().pending});
}
// Completed primary corruption recovers the completed endpoint, not the old window.
const recovery=app(on.committed,source,0);recovery.storage.set('lumenfall_save_v2','broken');
recovery.b.set(recovery.b.load());assert.equal(recovery.b.apply(),null);assert.deepEqual(recovery.b.get(),on.committed);
const backup=on.x.b.backup();assert.deepEqual(on.x.b.decode(backup),on.committed,'backup/reload compatible schema');
// Real cooperative work can outlast the captured return clock. It must not
// disappear when the next autosave records the current time, even after the cap.
for(const seconds of [28800,72*3600]){
 const slow=app(original,source,seconds);let error,result;
 slow.b.apply((r,e)=>{result=r;error=e;});
 slow.clock(original.lastSeen+(seconds+60)*1000);slow.monotonic(60000);slow.drain();assert.ifError(error);
 assert.equal(slow.b.get().lastSeen,original.lastSeen+(seconds+60)*1000,'processing time reaches completed save endpoint');
 const reference=app(original,source,seconds);reference.b.apply();
 reference.b.advance(60,{kind:'live',visual:false,clockStartMs:original.lastSeen+seconds*1000});
 reference.b.get().lastSeen=original.lastSeen+(seconds+60)*1000;
 compare(slow.b.get(),reference.b.get(),'processing time live parity '+seconds);
 approx(slow.b.get().totalOfflineSeconds-original.totalOfflineSeconds,Math.min(seconds,43200),'processing time does not expand offline cap/accounting');
 records.push({case:'processing time '+seconds,kills:result.kills,lastSeen:slow.b.get().lastSeen});
}
for(const jump of [-7*86400000,7*86400000]){
 const shifted=app(original,source,28800);let error;shifted.b.apply((r,e)=>{error=e;});
 shifted.clock(original.lastSeen+28800000+60000+jump);shifted.monotonic(60000);shifted.drain();assert.ifError(error);
 const reference=app(original,source,28800);reference.b.apply();reference.b.advance(60,{kind:'live',visual:false,clockStartMs:original.lastSeen+28800000});
 reference.b.get().lastSeen=original.lastSeen+28800000+60000+jump;
 compare(shifted.b.get(),reference.b.get(),'monotonic processing with wall-clock jump '+jump);
 records.push({case:'wall-clock jump '+jump,kills:shifted.b.get().totalKills-original.totalKills,lastSeen:shifted.b.get().lastSeen});
}
console.log(JSON.stringify({status:'pass',scenario:'offline-catchup-core',wallMs:performance.now()-start,records},null,2));
