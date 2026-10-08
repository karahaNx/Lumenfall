'use strict';
// ES2017 is intentional: execute the actual product on V8 6.0 (Chrome60).
// This engine fixture does not attest native DOM, physical devices or TalkBack.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var sourcePath=process.argv[2],output=process.argv[3];
assert(sourcePath&&output,'source HTML and JSON receipt required');
var source=fs.readFileSync(sourcePath,'utf8'),clock=2000000000000;
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var scripts=[],pattern=/<script>\s*([\s\S]*?)<\/script>/g,match;
while((match=pattern.exec(source)))scripts.push(match[1]);
scripts.forEach(function(code){new Function(code);});
var bridge="window.f05={fresh:freshState,set:function(s){state=acceptPersistedState(s,'f05-legacy');restoreEnemyOrSpawn();},get:function(){return state;},breakdown:function(){return ascendPrismBreakdown(progressionDepth());},explain:prismCalculationText,mutation:applyAscendMutation,simulate:advanceAuthoritativeTime,enemy:enemyHpFor};";
var marker="if(document.readyState==='loading'){";
assert.equal(scripts[0].split(marker).length,2,'unique startup bridge marker');
var date=class extends Date {static now(){return clock;}};
new Function('window','document','localStorage','Date',scripts[0].replace(marker,bridge+marker))(
 window,document,{getItem:function(){return null;},setItem:function(){},removeItem:function(){}},date);
var b=window.f05,records=[],checks=0;
function ok(v,m){checks++;assert(v,m);}
function seed(c,benchmark,tree,lab){
 var s=b.fresh();s.depth=c+1;s.maxDepthEver=Math.max(c,benchmark,219)+1;
 s.ascendRewardedDepth=benchmark;s.nodes.swift=tree;s.longStudyLevels.prismstudy=lab;
 s.prisms=100;s.spirits.ember=1;s.activeParty=['ember'];
 Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=false;});
 s.owned.autoascend=true;s.autoAscendEnabled=false;s.autoAscendTargetDepth=c+1;
 s.enemyDepth=s.depth;s.enemyHp=s.enemyMaxHp=b.enemy(s.depth);return s;
}
function oracle(c,benchmark,tree,lab){
 var m=(1+tree*.04)*(1+lab*.05),full=c<15?0:Math.floor(2*Math.sqrt(c)*m);
 var repeat=benchmark>0&&full>0?Math.max(1,Math.floor(full*.2)):0;
 var progress=benchmark<=0?full:c>benchmark?Math.ceil((2*Math.sqrt(c)-2*Math.sqrt(benchmark))*m):0;
 return {full:full,reserve:repeat,progressBonus:progress,gain:full===0?0:benchmark<=0?full:Math.min(full,repeat+progress)};
}
[14,15,16,20,21,30,219].forEach(function(c){
 [0,15,c,219].forEach(function(benchmark){
  [[0,0],[1,0],[0,1],[1,1],[17,18],[18,20]].forEach(function(v){
   var s=seed(c,benchmark,v[0],v[1]),want=oracle(c,benchmark,v[0],v[1]);b.set(s);
   var bd=b.breakdown(),before=JSON.stringify(b.get());
   Object.keys(want).forEach(function(k){ok(bd[k]===want[k],'reward oracle '+[c,benchmark,v,k]);});
   ok(b.explain(bd).indexOf('You receive now</dt><dd>'+want.gain+' Prisms')!==-1,'exact display reward');
   ok(JSON.stringify(b.get())===before,'explanation is observer only');
   if(c>=15){ok(b.mutation()===want.gain,'actual Ascend mutation');ok(b.get().prisms===100+want.gain,'actual balance');}
   ['live','offline'].forEach(function(kind){
    s=seed(c,benchmark,v[0],v[1]);s.autoAscendEnabled=true;b.set(s);
    var r=b.simulate(.001,{kind:kind,visual:false,clockStartMs:clock,offlineWindowStartMs:clock});
    ok(r.ascends===(c>=15?1:0),'auto count '+kind);
    if(c>=15){ok(r.ascendGains[0]===want.gain,'actual auto payout '+kind);ok(b.get().prisms===100+want.gain,'auto balance '+kind);}
   });
   records.push({cleared:c,benchmark:benchmark,tree:v[0],completedLab:v[1],gain:want.gain});
  });
 });
});
[0,1].forEach(function(tree){b.set(seed(16,15,tree,0));ok(b.breakdown().gain===2,'Swift purchase retains 2-Prism reward');});
b.set(seed(Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER-2,0,0));ok(b.breakdown().progressBonus===1,'positive representable new-depth increment');
['live','offline'].forEach(function(kind){
 var s=seed(20,219,0,2);s.activeStudies=[{id:'prismstudy',remainingSec:1,totalDurationSec:2,speedMult:1}];b.set(s);
 b.simulate(.5,{kind:kind,visual:false,clockStartMs:clock});ok(b.get().longStudyLevels.prismstudy===2&&b.breakdown().gain===1,'pending Lab excluded '+kind);
 b.simulate(.5,{kind:kind,visual:false,clockStartMs:clock+500});ok(b.get().longStudyLevels.prismstudy===3&&b.breakdown().gain===2,'completed Lab included '+kind);
});
var receipt={status:'pass',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),parsedScripts:scripts.length,checks:checks,records:records,scope:'actual product reward/display/mutation/live/offline on legacy V8; synthetic states; no native DOM/device/TalkBack claim'};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');console.log('PASS legacy V8 '+receipt.v8+': '+checks+' assertions, '+records.length+' reward cases');
