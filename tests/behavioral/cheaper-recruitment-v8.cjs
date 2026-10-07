/* ES2017 probe of real cap/normalization on Chrome 60's V8 generation. No DOM
 * acceptance is inferred; blocked purchases must never reach UI/save paths. */
'use strict';
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8'),writes=0;
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var bridge="window.qa={fresh:freshState,set:function(s){state=acceptPersistedState(s,'f21-v8');},get:function(){return state;},buy:buyNode,discount:costReduction,price:function(){return nodeCost(NODES.find(function(n){return n.id==='bonds';}));}};";
var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
new Function('window','document','localStorage',script)(window,document,{getItem:function(){return null;},setItem:function(){writes++;},removeItem:function(){writes++;}});
[20,21,40,2000].forEach(function(level){var s=window.qa.fresh();s.nodes.bonds=level;s.prisms=1000000;window.qa.set(s);var before=JSON.stringify(window.qa.get());for(var i=0;i<100;i++)window.qa.buy({id:'bonds',baseCost:0,growth:1});assert.equal(JSON.stringify(window.qa.get()),before);assert.equal(window.qa.discount(),.6);assert.equal(window.qa.get().nodes.bonds,level);});
assert.equal(writes,0);var s=window.qa.fresh();s.nodes.bonds=19;window.qa.set(s);assert.equal(window.qa.price(),2329);
console.log(JSON.stringify({status:'PASS',node:process.version,v8:process.versions.v8,levels:[20,21,40,2000],blockedAttempts:400,writes:writes,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),limitation:'Actual WebView60/Android DOM, lifecycle, TalkBack and storage acceptance still required'}));
