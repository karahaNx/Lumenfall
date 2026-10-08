'use strict';
// Actual product handlers/save codec on V8 6.0; UI callbacks only are stubbed.
// This engine probe is not Android DOM/device acceptance.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2],'utf8'),checks=0,writes=0,storage={};
function ok(v,m){checks++;assert(v,m);}
function same(a,b,m){ok(JSON.stringify(a)===JSON.stringify(b),m);}
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var scripts=source.match(/<script>\s*([\s\S]*?)<\/script>/g);scripts.forEach(function(s){new Function(s.replace(/^<script>|<\/script>$/g,''));});
var script=scripts[0].replace(/^<script>|<\/script>$/g,'');
var marker="if(document.readyState==='loading'){";ok(script.split(marker).length===2,'exact entrypoint');
script=script.replace(marker,"renderNodes=function(){};renderAscendSummary=function(){};updateBattleFast=function(){};window.tree={fresh:freshState,set:function(s){state=acceptPersistedState(s);},get:function(){return state;},canonical:acceptPersistedState,buy:buyNode,plan:getNodeBuyPlan,nodes:NODES,backup:function(s){return acceptPersistedState(decodeSaveBackup(encodeSaveBackup(s)));},metrics:function(){return {lumen:lumenMult(),tap:tapMult(),momentum:momentumMult(),offline:offlineRate(),discount:costReduction(),prisms:prismMult()};}};"+marker);
new Function('window','document','localStorage',script)(window,document,{getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;writes++;},removeItem:function(k){delete storage[k];}});
var t=window.tree;function node(id){return t.nodes.find(function(n){return n.id===id;});}
function seed(id,level,prisms){var s=t.fresh();s.nodes[id]=level;s.prisms=prisms;t.set(s);return t.get();}
function reject(n,m){var before=JSON.stringify(t.get()),count=writes;ok(t.buy(n)===false,m);ok(JSON.stringify(t.get())===before&&writes===count,m+' no state or save write');}
[['echo',5,6,11],['bonds',19,20,2329]].forEach(function(r){var n=node(r[0]);seed(r[0],r[1],r[3]-1);reject(n,'one Prism short');seed(r[0],r[1],r[3]);ok(t.buy(n),'exact budget');ok(t.get().nodes[r[0]]===r[2]&&t.get().prisms===0,'last effective level');same(JSON.parse(storage.lumenfall_save_v2).nodes,t.get().nodes,'primary actual save');same(storage.lumenfall_save_v2,storage.lumenfall_save_recovery_v1,'recovery matches');reject(n,'effective cap');});
['starlight','steady','momentum'].forEach(function(id){[0,7,1000000].forEach(function(k){seed(id,k,1000);ok(t.plan(node(id)).reason==='retired','retired plan');reject(node(id),'retired buy');same(t.canonical(t.get()).nodes,t.get().nodes,'raw levels retained');same(t.backup(t.get()),t.get(),'complete backup');same(t.canonical(t.canonical(t.get())),t.get(),'idempotence');});});
[undefined,null,{id:'unknown'},{id:'swift',baseCost:0,growth:1}].forEach(function(n){reject(n,'invalid/forged');});
seed('reserves',0,100);reject(node('reserves'),'locked Deed');
seed('swift',1000000,100);reject(node('swift'),'nonfinite price');seed('swift',0,Number.MAX_VALUE);reject(node('swift'),'unrepresentable debit');seed('swift',0,1e16);reject(node('swift'),'partial rounded debit');seed('echo',0,1e16);ok(t.buy(node('echo')),'exact large debit allowed');ok(t.get().prisms===1e16-2,'exact two-Prism debit');
[0,1,6,20,31].forEach(function(k){var s=t.fresh();['starlight','steady','momentum','echo','bonds','swift'].forEach(function(id){s.nodes[id]=k;});s.research.focus=k;s.research.resolve=k;s.longStudyLevels.lumenstudy=k;s.longStudyLevels.guardmastery=k;s.longStudyLevels.riftattune=k;s.longStudyLevels.prismstudy=k;t.set(s);var m=t.metrics();same(m.lumen,(1+k*.1)*(1+k*.08)*(1+k*.08),'original Lumen operands');same(m.tap,(1+k*.08)*(1+k*.1)*(1+k*.2),'original tap operands');ok(Math.abs(m.momentum-(1+k*.06))<1e-12,'original Momentum');same(m.offline,Math.min(1,.7+k*.05)+k*.1,'original paid offline');same(m.prisms,(1+k*.04)*(1+k*.05),'original Prism operands');same(m.discount,Math.min(.6,.03*k),'existing discount floor');});
console.log(JSON.stringify({status:'pass',checks:checks,node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),limitation:'Actual JS handlers/save codec; UI callbacks stubbed; native Android/physical/WebView60/TalkBack remain separate.'},null,2));
