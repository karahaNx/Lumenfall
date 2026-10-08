/* Released APK JS engine acceptance on V8 6.0, without native DOM claims.
 * Node8-compatible assertions; pass an extracted APK HTML and repository root. */
'use strict';
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var sourcePath=process.argv[2],root=process.argv[3]||path.resolve(__dirname,'../../../..');assert(sourcePath,'extracted APK HTML required');
var source=fs.readFileSync(sourcePath,'utf8'),original=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
var records=[];
function run(seed,seconds,kills,ascends,study){
 var now=seed.lastSeen+seconds*1000,timers=[],storage={},writes=[],batches=0,result,error;
 var date=class extends Date {static now(){return now;}};
 var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
 var bridge="window.qa={set:function(s){state=acceptPersistedState(s);},get:function(){return state;},apply:applyOfflineProgress,flags:function(){return {busy:!!offlineCatchup,pending:offlinePending,resume:resumeFlowBusy};}};";
 var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
 var started=process.hrtime();
 new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,{
  getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;writes.push(k);},removeItem:function(k){delete storage[k];}
 },date,function(fn){timers.push(fn);return timers.length;},function(){},{now:function(){return 0;}});
 window.qa.set(seed);var before=JSON.stringify(window.qa.get());window.qa.apply(function(r,e){result=r;error=e;});
 assert(window.qa.flags().busy);assert.equal(JSON.stringify(window.qa.get()),before);assert.equal(writes.length,0);
 while(timers.length){timers.shift()();batches++;assert(batches<100000);}
 assert.ifError(error);assert.equal(result.kills,kills);assert.equal(result.ascends,ascends);assert.equal(result.effectiveSec,Math.min(seconds,72*3600));
 assert(!window.qa.flags().busy&&!window.qa.flags().pending&&!window.qa.flags().resume);
 assert.deepEqual(writes,['lumenfall_save_v2','lumenfall_save_recovery_v1']);assert.equal(storage.lumenfall_save_v2,storage.lumenfall_save_recovery_v1);
 assert.equal(window.qa.get().lastSeen,now);assert.equal(window.qa.get().totalOfflineSeconds,seed.totalOfflineSeconds+Math.min(seconds,72*3600));
 if(study)assert(result.completedStudies.indexOf("Guardian's Mastery")!==-1,'existing Study completes after combat cap');
 var elapsed=process.hrtime(started);records.push({case:study?'96h Study beyond cap':seed.autoAscendEnabled?'ON Clear'+(seed.autoAscendTargetDepth-1):'OFF',seconds,batches,kills:result.kills,ascends:result.ascends,effectiveSec:result.effectiveSec,completedStudies:result.completedStudies,wallMs:elapsed[0]*1000+elapsed[1]/1e6});
 console.error('PASS V8 6.0 '+records[records.length-1].case+' '+seconds+'s');
}
function copy(){return JSON.parse(JSON.stringify(original));}
run(copy(),28800,302400,14400);
var c20=copy();c20.autoAscendTargetDepth=21;run(c20,28800,291959,14597);
var off=copy();off.autoAscendEnabled=false;run(off,28800,773,0);
run(copy(),72*3600,2721600,129600);
var tail=copy();tail.activeStudies=[{id:'guardmastery',remainingSec:80*3600,totalDurationSec:80*3600,speedMult:1}];tail.studyQueue={};run(tail,96*3600,2721600,129600,true);
console.log(JSON.stringify({status:'pass',scope:'actual extracted APK product on V8 6.0 engine; native DOM/lifecycle/physical acceptance separate',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),records},null,2));
