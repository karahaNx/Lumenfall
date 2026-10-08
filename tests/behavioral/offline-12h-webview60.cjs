'use strict';
// Run with Node 8.3.0 (V8 6.0), in addition to the modern behavioral suite.
// This checks the product runtime without BigInt. It is not a device test.
var fs = require('fs'), path = require('path'), assert = require('assert');
var root = path.resolve(__dirname, '../..');
var html = fs.readFileSync(process.argv[2] || path.join(root, 'index.html'), 'utf8');
var script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
var marker = "if(document.readyState==='loading'){";
assert.strictEqual(script.split(marker).length, 2);
var window = {addEventListener:function(){}}, document = {readyState:'loading',addEventListener:function(){}};
var storage = {}, tasks = [], now = 1800000000000 + 86400000;
var localStorage = {getItem:function(key){return storage[key] || null;},
  setItem:function(key,value){storage[key]=value;},removeItem:function(key){delete storage[key];}};
var bridge = "els['toast']={textContent:'',classList:{add:function(){},remove:function(){}}};" +
  'window.qa={fresh:freshState,accept:acceptPersistedState,set:function(s){state=acceptPersistedState(s);},' +
  'get:function(){return state;},apply:applyOfflineProgress,cap:offlineCapHours,' +
  'backup:encodeSaveBackup,decode:decodeSaveBackup};';
var MockDate = class extends Date { static now(){return now;} };
new Function('window','document','localStorage','Date','setTimeout','clearTimeout','BigInt','btoa','atob','performance',
  script.replace(marker,bridge+marker))(window,document,localStorage,MockDate,
  function(fn){tasks.push(fn);return tasks.length;},function(){},undefined,
  function(s){return Buffer.from(s,'binary').toString('base64');},
  function(s){return Buffer.from(s,'base64').toString('binary');},{now:function(){return 0;}});
var qa=window.qa, seed=qa.fresh();
seed.schemaVersion=1;delete seed.offline12hRefund;
seed.lastSeen=1800000000000;seed.comets=100;seed.prisms=100;
seed.owned.offline24=true;seed.owned.offline48=true;seed.nodes.reserves=3;
seed.activeParty=[];
seed.activeStudies=[{id:'guardmastery',remainingSec:46800,totalDurationSec:46800,speedMult:1}];
qa.set(seed);
assert.strictEqual(qa.get().comets,400);assert.strictEqual(qa.get().prisms,132);
assert.strictEqual(qa.get().nodes.reserves,3);assert.strictEqual(qa.cap(),12);
assert.deepStrictEqual(qa.accept(qa.get()),qa.get());
assert.deepStrictEqual(qa.decode(qa.backup(qa.get())),qa.get());
var result, error, callbacks=0;
qa.apply(function(r,e){result=r;error=e;callbacks++;});
while(tasks.length) tasks.shift()();
assert.ifError(error);assert.strictEqual(callbacks,1);assert.strictEqual(result.effectiveSec,43200);
assert.strictEqual(qa.get().activeStudies[0].remainingSec,3600);
assert.strictEqual(qa.get().lastSeen,now);
assert.deepStrictEqual(JSON.parse(storage.lumenfall_save_v2),qa.get());
assert.deepStrictEqual(JSON.parse(storage.lumenfall_save_recovery_v1),qa.get());
assert.strictEqual(qa.apply(),null);
var interop=[];
[80,200,1000].forEach(function(level){
  var old=qa.fresh();old.schemaVersion=1;delete old.offline12hRefund;old.nodes.reserves=level;old.prisms=1e300;old.legacyCometPurchases={offline24:true,offline48:true};
  interop.push(qa.accept(old));
});
if(process.argv[3]) fs.writeFileSync(process.argv[3],JSON.stringify(interop,null,2));
console.log(JSON.stringify({status:'pass',scenario:'offline-12h-runtime',node:process.version,
  v8:process.versions.v8,BigIntAvailable:false,cap:12,comets:400,prisms:132,
  studyRemaining:3600,deviceVerified:false},null,2));
