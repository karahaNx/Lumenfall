/* Compatibility probe for the product script on V8 6.0 (Chrome 60's engine
 * generation). This checks JS parsing/execution only, not WebView/Android DOM,
 * lifecycle or native storage. No test runner syntax newer than ES2017. */
'use strict';
var fs=require('fs'),path=require('path'),assert=require('assert');
var root=path.resolve(__dirname,'../..'),source=fs.readFileSync(path.join(root,'index.html'),'utf8');
var seed=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
var now=seed.lastSeen+28800000,timers=[],storage={},writes=0,batches=0,result,error;
var date=class extends Date {static now(){return now;}};
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var bridge="window.qa={set:function(s){state=acceptPersistedState(s);},get:function(){return state;},apply:applyOfflineProgress,flags:function(){return {busy:!!offlineCatchup,pending:offlinePending,resume:resumeFlowBusy};}};";
var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
var started=process.hrtime();
new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,{
 getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;writes++;},removeItem:function(k){delete storage[k];}
},date,function(fn){timers.push(fn);return timers.length;},function(){},{now:function(){return 0;}});
window.qa.set(seed);var before=JSON.stringify(window.qa.get());
window.qa.apply(function(r,e){result=r;error=e;});
assert(window.qa.flags().busy);assert.equal(JSON.stringify(window.qa.get()),before);assert.equal(writes,0);
while(timers.length){timers.shift()();batches++;assert(batches<100000);}
assert.ifError(error);assert.equal(result.kills,302400);assert.equal(result.ascends,14400);assert.equal(result.effectiveSec,28800);
assert(!window.qa.flags().busy&&!window.qa.flags().pending&&!window.qa.flags().resume);
assert.equal(storage.lumenfall_save_v2,storage.lumenfall_save_recovery_v1);
assert.equal(window.qa.get().lastSeen,now);
var elapsed=process.hrtime(started);
console.log(JSON.stringify({status:'pass',scenario:'offline-catchup-v8',node:process.version,v8:process.versions.v8,batches:batches,kills:result.kills,ascends:result.ascends,wallMs:elapsed[0]*1000+elapsed[1]/1e6,limitation:'JS engine probe; actual Android WebView60/device acceptance remains required'}));
