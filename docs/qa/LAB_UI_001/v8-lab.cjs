'use strict';
// Execute actual product JavaScript on Chrome60's V8 generation; no DOM/device claim.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2]||'index.html','utf8');
var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
var marker="if(document.readyState==='loading'){";
assert.equal(script.split(marker).length,2);
script=script.replace(marker,"window.lab={fresh:freshState,set:function(s){state=s;},node:function(id){return LONG_STUDIES.find(function(n){return n.id===id;});},effect:projectEarnedEffect,remaining:studyRemainingText,panel:studySpeedMarkup,open:function(id){openStudySpeedId=id;}};"+marker);
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
new Function('window','document','localStorage',script)(window,document,{getItem:function(){return null;},setItem:function(){},removeItem:function(){}});
var q=window.lab,s=q.fresh(),node=q.node('guardmastery');s.motes=1000;q.set(s);
assert.equal(q.effect('guardmastery',1),'+20% tap damage');
assert(q.effect('measuredinquiry',13).indexOf('20% less work')===0);
var observations=[];
[1,1.5,2,3,4,5,6,7,8].forEach(function(speed){
 var active={id:node.id,remainingSec:150,totalDurationSec:150,speedMult:speed};
 assert(q.remaining(active).indexOf(speed+'x')!==-1);
 assert(q.remaining({remainingSec:0,speedMult:speed})==='Finishing… · '+speed+'x');
 q.open(null);var closed=q.panel(node,active,false);assert(closed.indexOf('aria-expanded="false"')!==-1&&closed.indexOf(' hidden>')!==-1);
 q.open(node.id);var open=q.panel(node,active,false);assert(open.indexOf('aria-expanded="true"')!==-1&&open.indexOf(' hidden>')===-1);
 assert.equal((open.match(/data-speed-study=/g)||[]).length,8);assert(open.indexOf('Queue speed up OFF')!==-1&&open.indexOf('Queued speed')!==-1);
 observations.push({speed:speed,time:q.remaining(active),tiers:8});
});
assert(q.panel(node,null,false).indexOf('data-speed-study=')===-1);
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),observations:observations,limitation:'Actual product JS parsing and presentation functions; not native DOM, CSS, physical Android or TalkBack acceptance.'}));
