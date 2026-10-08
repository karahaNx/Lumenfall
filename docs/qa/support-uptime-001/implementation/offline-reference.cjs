/* Long-offline regression and independent baseline comparisons. Built-ins only.
 * Run: node tests/behavioral/offline-catchup.cjs [--source path/to/index.html]
 * Timers are queued deterministically; real browser responsiveness is separately
 * covered by offline-catchup-ui.cjs, not inferred from this runner.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../../../..');
const sourceArg=process.argv.indexOf('--source');
const source=fs.readFileSync(sourceArg<0?path.join(root,'index.html'):process.argv[sourceArg+1],'utf8');
const baseline=fs.readFileSync(path.join(root,'docs/recovery/2026-10-07/lead_context/FEEDBACK/EVIDENCE/main-index.html'),'utf8');
assert.equal(require('node:crypto').createHash('sha1').update('blob '+Buffer.byteLength(baseline)+'\0'+baseline).digest('hex'),'ea44431c163569548973d9e489f75345749a07ee','original product oracle blob');
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
const {clockReference}=require('../../../../tests/behavioral/support-clock-reference.cjs');

const contract=clockReference(baseline.replace("{id:'charge', effectPerLevel:0.08,", "{id:'charge', effectPerLevel:0.08, levelCap:10,").replace('durationMs:ultimate ? 8000 : 4000','durationMs:ultimate ? 1500 : 1000'));
for(const enabled of [true,false])for(const seconds of enabled?[28800,43200]:[28800]){const seed=copy(original);for(const id of ['focus','sense','formation','resolve'])seed.researchQueue[id]=false;for(const id of ['riftattune','formationstudy','prismstudy'])seed.studyQueue[id]=false;for(let k=10;k<seed.research.charge;k++)seed.shards+=Math.ceil(30*1.55**k);seed.autoAscendEnabled=enabled;const next=app(seed,contract);const total={kills:0,ascends:0};for(let elapsed=0;elapsed<seconds;elapsed+=900){const r=next.b.advance(Math.min(900,seconds-elapsed),{kind:'offline',visual:false,clockStartMs:seed.lastSeen+elapsed*1000,offlineWindowStartMs:seed.lastSeen});total.kills+=r.kills;total.ascends+=r.ascends;}console.log(JSON.stringify({enabled,seconds,result:total,prisms:next.b.get().prisms-seed.prisms,titan:next.b.get().spirits.titan,lumen:next.b.get().lumen}));}

const seed=copy(original);for(const id of ['focus','sense','formation','resolve'])seed.researchQueue[id]=false;for(const id of ['riftattune','formationstudy','prismstudy'])seed.studyQueue[id]=false;for(let k=10;k<seed.research.charge;k++)seed.shards+=Math.ceil(30*1.55**k);const next=app(seed,contract);for(let window=0;window<4;window++){let total={kills:0,ascends:0};for(let elapsed=0;elapsed<28800;elapsed+=900){const r=next.b.advance(900,{kind:'offline',visual:false,clockStartMs:seed.lastSeen+(window*28800+elapsed)*1000,offlineWindowStartMs:seed.lastSeen+window*28800000});total.kills+=r.kills;total.ascends+=r.ascends;}console.log(JSON.stringify({window,...total}));}
