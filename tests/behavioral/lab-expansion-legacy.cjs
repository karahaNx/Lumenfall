#!/usr/bin/env node
'use strict';
// Execute complete product JS on actual Node8.3/V8 6.0. Not native WebView.
var fs=require('fs'),path=require('path'),assert=require('assert'),Module=require('module'),crypto=require('crypto');
assert(/^6\.0\./.test(process.versions.v8),'actual V8 6.0 required');assert.strictEqual(typeof BigInt,'undefined');
var source=fs.readFileSync(process.argv[2]||'index.html','utf8'),checks=0,writes=0;
function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m);}
var scripts=[],match,re=/<script>\s*([\s\S]*?)<\/script>/g;while((match=re.exec(source))){scripts.push(match[1]);new Function(match[1]);}
var file=path.join(__dirname,'lab-expansion-harness.cjs'),h=fs.readFileSync(file,'utf8').replace("require('node:assert/strict')","require('assert')");
var m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(h,file);
var app=m.exports.app,seed=m.exports.seed,clone=m.exports.clone,x=app(source),q=x.q,defs=q.expansion();
eq(defs.length,14,'fourteen projects');eq(q.projects().filter(function(n){return !n.retiredTo;}).length,20,'twenty active projects');
defs.forEach(function(d){
 [0,1,d.levelCap-1].forEach(function(l){var s=seed(q);s.longStudyLevels[d.id]=l;q.set(s);var p=q.plan(d.id),L=Math.round(d.lumenBase*Math.pow(d.lumenGrowth,l)),S=Math.round(d.shardBase*Math.pow(d.shardGrowth,l)),D=Math.round(d.baseDurationSec*Math.pow(d.durationGrowth,l));
 eq(p.cost,{lumen:L,shard:S},'price '+d.id+'/'+l);eq(p.duration,D,'work '+d.id+'/'+l);eq(q.start(d.id),true,'start');eq(q.get().longStudyLevels[d.id],l,'no early effect');eq(q.get().lumen,s.lumen-L,'debit');eq(q.get().shards,s.shards-S,'Shard debit');q.finish(D);eq(q.get().longStudyLevels[d.id],l+1,'earned once');q.finish(D);eq(q.get().longStudyLevels[d.id],l+1,'no repeat');q.save();writes+=2;eq(app(source,x.storage).q.get().longStudyLevels[d.id],l+1,'cold save');eq(q.accept(q.decode(q.export())),q.get(),'backup roundtrip');});
 var s=seed(q);s.longStudyLevels[d.id]=d.levelCap+10;q.set(s);eq(q.level(d.id),d.levelCap,'effective cap');eq(q.start(d.id),false,'cap no debit');eq(q.get().longStudyLevels[d.id],d.levelCap+10,'raw paid level retained');
});
var s=seed(q);s.longStudyLevels.labcapacity=2;q.set(s);['wispascend','guardmastery','shardstudy','lumenstudy','motestudy','bossledger','catalysis'].forEach(function(id){eq(q.start(id),true,'seven slots');});q.save();eq(app(source,x.storage).q.get().activeStudies,q.get().activeStudies,'seven paid records survive');
[14,26,60,110,176,258,357,473].forEach(function(v){[0,2,10,20].forEach(function(p){eq(q.discount(v,p),Math.ceil(v*(100-p)/100),'whole rounded Mote price');});});
s=seed(q);s.longStudyLevels.procurement=10;s.longStudyLevels.catalysis=10;s.longStudyLevels.focusprotocol=5;s.longStudyLevels.labcapacity=2;q.set(s);eq(q.cost('guardmastery',0),{lumen:480,shard:32},'future Lab discount');eq(q.speedCost(2),21,'Mote discount');eq(q.duration('bossledger',0),504,'focused work');
s=seed(q);s.longStudyLevels.fieldnotes=3;s.activeStudies=[{id:'bossledger',remainingSec:1,totalDurationSec:1,speedMult:1}];q.set(s);q.finish(1);eq(q.get().motes,s.motes+6,'completion Motes');q.finish(1);eq(q.get().motes,s.motes+6,'no double Motes');
[10,19,20,39,119].forEach(function(d){[0,1,5,10].forEach(function(l){var s=seed(q);s.longStudyLevels.bossledger=l;s.longStudyLevels.luminousdistill=l;s.longStudyLevels.sigilcartography=l;q.set(s);[false,true].forEach(function(glow){var base=Math.round(5*Math.pow(1.11,d)*(d%10===0?8:1)),p=d%10===0?l*5:glow?l*10:0;eq(q.lumen(d,glow),base+Math.round(base*p/100),'distinct kill rewards');});eq(q.sigils(d),Math.max(1,Math.floor(d/10))+Math.min(5,l),'Sigil helper');});});
// Fractional offline wallets must hit the same purchase boundary as real Farm.
s=seed(q);s.depth=s.enemyDepth=s.farmDepth=9;s.riftMode='farm';s.farmReturnDepth=11;s.nodes.echo=2;s.longStudyLevels.luminousdistill=1;s.enemyIsLuminous=false;s.luminousAccum=.3;s.lumen=13676.8;s.shards=450.4;s.studyQueue.bossledger=true;q.set(s);
eq(q.boundary({lumen:14000,shard:500},.70+2*.05),31,'actual V8 fractional-wallet boundary');
q.batch(30,'offline');eq(q.queue().studiesStarted,0,'30 kills cannot buy early');
q.set(s);q.batch(31,'offline');eq(q.get().lumen,14000,'31 kills exact Lumen');eq(q.get().shards,500,'31 kills exact Shards');eq(q.queue().studiesStarted,1,'31 kills start paid work');eq(q.get().lumen,0,'exact V8 Lumen debit');eq(q.get().shards,0,'exact V8 Shard debit');
s.lumen=13989.599999999999;s.shards=500;q.set(s);eq(q.boundary({lumen:14000,shard:500},.70+2*.05),2,'tiny deficit verifies actual upper bound');q.batch(1,'offline');eq(q.queue().studiesStarted,0,'one kill cannot spend a tiny missing fraction');
s.depth=s.enemyDepth=s.farmDepth=39;s.farmReturnDepth=41;s.nodes.echo=6;s.luminousAccum=.01;s.lumen=10469.35;q.set(s);for(var k=0;k<11;k++)q.kill('live');eq(q.boundary({lumen:14000,shard:500},1),2,'real near-wrap phase preserves current enemy identity');q.batch(1,'live');eq(q.queue().studiesStarted,0,'future Luminous spawn cannot pay for an ordinary first kill');
console.log(JSON.stringify({status:'pass',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),node:process.version,v8:process.versions.v8,checks:checks,scriptsParsed:scripts.length,writes:writes,scope:'actual V8 6.0 complete-source purchase/completion/storage logic; not Android/browser layout'}));
