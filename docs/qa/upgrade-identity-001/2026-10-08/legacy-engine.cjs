/* ES2017 engine probe for the complete supplied product, including real closed
 * purchase handlers and paid Study completion. Intentionally runs on V8 6.0.
 * No browser layout, Android lifecycle or TalkBack claim: init is not started. */
'use strict';
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var root=path.resolve(__dirname,'../../../..'),sourcePath=process.argv[2];
assert(sourcePath,'Explicit product HTML path required');
var expectedTracks=process.argv[3]===undefined?14:Number(process.argv[3]);assert(expectedTracks===13||expectedTracks===14,'Explicit historical14/current13 track contract');
var html=fs.readFileSync(sourcePath,'utf8'),fixtures=JSON.parse(fs.readFileSync(root+'/tests/behavioral/fixtures.json','utf8'));
var now=2000000000000,window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}},storage={};
var date=class extends Date {static now(){return now;}};
var bridge="window.qa={fresh:freshState,set:function(s){state=acceptPersistedState(s);restoreEnemyOrSpawn();},get:function(){return JSON.parse(JSON.stringify(state));},forge:function(id,n){labMultiplier=n;buyResearch({id:id,retiredTo:''});},forgeQueue:autoLabQueueTick,study:function(id){return startStudy({id:id,retiredTo:''});},labQueue:autoFillStudySlots,tree:function(id){buyNode({id:id,retiredTo:''});},tail:function(t){var summary=simulationSummary(t);advanceStudyOnlyTime(t,Date.now(),summary);return summary;},simulate:advanceAuthoritativeTime,backup:currentSaveBackup,decode:decodeSaveBackup,metrics:function(){return [lumenMult(),shardMult(),tapMult(),formationMult(),longStudyPowerMult(),momentumMult(),offlineRate(),prismMult(),longStudyMoteMult()];},counts:function(){return [LONG_STUDIES,RESEARCH,NODES].map(function(rows){return rows.filter(function(n){return !n.retiredTo&&!n.retired;}).length;});}};";
var scripts=[],pattern=/<script>\s*([\s\S]*?)<\/script>/g,match;
while((match=pattern.exec(html))){new Function(match[1]);scripts.push(match[1]);}
assert.equal(scripts.length,2,'complete current inline script set');
assert.equal(scripts[0].split("if(document.readyState==='loading'){").length,2,'unique bridge marker');
var script=scripts[0].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,{
 getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;},removeItem:function(k){delete storage[k];}
},date,function(){return 1;},function(){},{now:function(){return 0;}});
var b=window.qa,checks=0,forge=['focus','sense','formation','resolve'],lab=['riftattune','formationstudy','prismstudy'],tree=['starlight','steady','momentum'];
function copy(s){return JSON.parse(JSON.stringify(s));}
function equal(a,c,label){checks++;assert.deepStrictEqual(a,c,label);}
function near(a,c,label){checks++;assert(Math.abs(a-c)<=1e-12*Math.max(1,Math.abs(c)),label+' '+a+' '+c);}
function seed(){var s=b.fresh();s.maxDepthEver=101;s.lumen=s.shards=s.prisms=1e12;s.motes=1e6;forge.forEach(function(id){s.research[id]=3;s.researchQueue[id]=true;});lab.forEach(function(id){s.longStudyLevels[id]=4;s.studyQueue[id]=true;});tree.forEach(function(id){s.nodes[id]=5;});return s;}
equal(b.counts(),[6,4,expectedTracks-10],'explicit retained buying-track contract');
b.set(seed());var before=b.get();
forge.forEach(function(id){[1,5,10,25,50,100,'max'].forEach(function(n){b.forge(id,n);equal(b.get(),before,'closed/spoofed Forge '+id+' '+n);});});
equal(b.forgeQueue(),false,'old Forge ON queues inert');equal(b.get(),before,'Forge queue nonmutation');
lab.forEach(function(id){equal(b.study(id),false,'closed/spoofed Study '+id);equal(b.get(),before,'Study nonmutation '+id);});
equal(b.labQueue(),false,'old Lab ON queues inert');equal(b.get(),before,'Lab queue nonmutation');
tree.forEach(function(id){b.tree(id);equal(b.get(),before,'closed/spoofed Tree '+id);});
[0,1,6,20,31].forEach(function(k){var s=seed();['research','nodes','longStudyLevels'].forEach(function(key){Object.keys(s[key]).forEach(function(id){s[key][id]=k;});});b.set(s);
 var expected=[(1+.1*k)*(1+.08*k)*(1+.08*k),(1+.08*k)*(1+.08*k),(1+.08*k)*(1+.1*k)*(1+.2*k),(1+.05*k)*(1+.05*k),1+.15*k,1+.06*k,Math.min(1,.7+.05*k)+.1*k,(1+.04*k)*(1+.05*k),1+.1*k];
 b.metrics().forEach(function(v,i){near(v,expected[i],'old stacking '+k+' '+i);});
 var decoded=b.decode(b.backup());equal(decoded,b.get(),'whole backup canonical ownership '+k);b.set(decoded);equal(b.decode(b.backup()),decoded,'idempotent repeated backup '+k);
});
var s=seed();s.activeStudies=lab.map(function(id){return {id:id,remainingSec:1,totalDurationSec:123,speedMult:2};});b.set(s);before=b.get();
var result=b.tail(.5),after=b.get();equal(result.completedStudies.length,3,'all paid retired levels finish');equal(result.studiesStarted,0,'no restart');equal(after.activeStudies,[],'paid work closed');
lab.forEach(function(id){equal(after.longStudyLevels[id],before.longStudyLevels[id]+1,'one earned paid level '+id);});
['lumen','shards','motes'].forEach(function(key){equal(after[key],before[key],'no new spending/refund '+key);});b.tail(60);equal(b.get(),after,'no duplicate completion');
// An old ON Mote choice still buys the original selected speed for the last
// already paid level. Original tier2 price is26; a closed queue cannot rebuy it.
s=seed();s.activeStudies=lab.map(function(id){s.studyUseMotes[id]=true;s.studySpeedTargets[id]=2;return {id:id,remainingSec:1,totalDurationSec:123,speedMult:1};});b.set(s);before=b.get();
result=b.tail(.5);after=b.get();equal(result.studySpeedPurchases,3,'last paid work keeps old speed intent');equal(before.motes-after.motes,78,'three original26-Mote purchases');
lab.forEach(function(id){equal(after.longStudyLevels[id],before.longStudyLevels[id]+1,'selected speed earns one final level '+id);});b.tail(60);equal(b.get(),after,'closed queue cannot buy another speed/level');
function materialize(v){if(v==='__NOW__')return now;if(v==='__TODAY__')return '2033-05-18';if(Array.isArray(v))return v.map(materialize);if(v&&typeof v==='object'){var out={};Object.keys(v).forEach(function(k){out[k]=materialize(v[k]);});return out;}return v;}
var records=[];s=materialize(fixtures['parity-medium-farm'].save);b.set(s);s=b.get();
[2000000000000,2000000000371].forEach(function(clock){['live','offline'].forEach(function(kind){b.set(copy(s));var result=b.simulate(60,{kind:kind,clockStartMs:clock});var after=b.get();assert(result.kills>0,'Farm made progress');forge.forEach(function(id){equal(after.research[id],s.research[id],'clock retains closed Forge '+id);});records.push({clockStartMs:clock,kind:kind,kills:result.kills});});});
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,htmlSha256:crypto.createHash('sha256').update(html).digest('hex'),parsedScripts:scripts.length,checks:checks,activeTracks:expectedTracks,paidCompletions:3,farm:records,limitation:'Complete product JS with minimal storage/timer mocks; Android DOM/device/TalkBack acceptance remains required'}));
