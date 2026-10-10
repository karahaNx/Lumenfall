#!/usr/bin/env node
'use strict';
// Execute complete product JS on actual Node8.3/V8 6.0. This is engine evidence,
// not Android/WebView layout. No arbitrary-precision runtime is supplied.
var fs=require('fs'),path=require('path'),assert=require('assert'),Module=require('module'),crypto=require('crypto');
assert(/^6\.0\./.test(process.versions.v8),'actual V8 6.0 required');assert.strictEqual(typeof BigInt,'undefined');
var source=fs.readFileSync(process.argv[2]||'index.html','utf8'),checks=0,apps=[],priceCases=0,purchaseCases=0,effectCases=0,faultCases=0,invalidCases=0,unsafeRunCases=0,phase='startup';
process.on('uncaughtException',function(error){var failure={status:'fail',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),node:process.version,v8:process.versions.v8,phase:phase,checks:checks,error:error.stack,actual:error.actual,expected:error.expected};if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(failure,null,2)+'\n');console.error(JSON.stringify(failure));process.exitCode=1;});
function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m);}
function ok(v,m){checks++;assert(v,m);}
function near(a,b,m){ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.max(1,Math.abs(a),Math.abs(b))*2e-9,m+': '+a+' vs '+b);}
var scripts=[],match,re=/<script>\s*([\s\S]*?)<\/script>/g;while((match=re.exec(source))){scripts.push(match[1]);new Function(match[1]);}
var file=path.join(__dirname,'forge-expansion-harness.cjs'),h=fs.readFileSync(file,'utf8');
eq(h.split("require('node:assert/strict')").length,2,'one runtime-only assertion import adaptation');h=h.replace("require('node:assert/strict')","require('assert')");
var compiled=new Module(file,module);compiled.filename=file;compiled.paths=module.paths;compiled._compile(h,file);
var H=compiled.exports,seed=H.seed,clone=H.clone,P=H.P,R=H.R,CLOCK=H.CLOCK;
function app(saved){var x=H.app(source,saved);apps.push(x);return x;}
// Independent fixed examples from exact rational geometric arithmetic. Columns:
// id, unlock, cap, first L/S, final single L/S, whole-cap bulk L/S. These do not
// read the product ledger; the modern independent oracle covers all598 entries.
var specs=[
 ['cauterize',20,10,36000,2500,3263308,226619,8228396,571417],
 ['fracturekey',30,10,103000,6000,9336686,543885,23542356,1371400],
 ['guardianseal',40,5,293000,14500,2447166,121106,5524545,273399],
 ['spillway',60,5,2361000,80500,19719309,672345,44516892,1517836],
 ['sustainedchannel',70,5,6703000,191000,62866809,1791372,137751887,3925200],
 ['tapconduit',25,5,61000,4000,452133,29649,1053875,69107],
 ['guardiancadence',35,5,174000,9500,1453266,79345,3280788,179124],
 ['relay',45,5,493000,22000,4117586,183747,9295565,414813],
 ['resonantedge',50,5,831000,34000,6940596,283972,15668589,641074],
 ['victorycharge',55,5,1401000,52500,11701293,438486,26415996,989893],
 ['amplifiertrim',60,5,2361000,80500,19719309,672345,44516892,1517836],
 ['dualchannel',55,5,1401000,52500,11701293,438486,26415996,989893],
 ['overflowconduit',65,5,3978000,124000,37309290,1162985,81751008,2548297],
 ['resonancecells',80,2,19032000,452500,47580000,1131250,66612000,1583750],
 ['resonancecascade',90,5,54040000,1071500,567290304,11248179,1208853184,23969027],
 ['resonancereclaim',100,3,153442000,2536500,613768000,10146000,1074094000,17755500]
];
var ids=specs.map(function(d){return d[0];}),old=['focus','sense','formation','resolve','charge','arcanecal','conduction','luminoustracking'];
var initial=app(),q=initial.q;
eq(q.defs().map(function(n){return n.id;}),old.concat(ids),'eight retained IDs followed by sixteen approved IDs');
eq(q.defs().filter(function(n){return !n.retiredTo;}).length,20,'twenty active Forge tracks');
var legacy=seed(q);ids.forEach(function(id){delete legacy.research[id];delete legacy.researchQueue[id];});legacy.labQueueOn=true;delete legacy.researchQueue;
q.set(legacy);ids.forEach(function(id){eq(q.get().research[id],0,'missing level zero '+id);eq(q.get().researchQueue[id],false,'missing Queue OFF '+id);});

specs.forEach(function(d){
 var id=d[0],unlock=d[1],cap=d[2],x=app(),q=x.q;
 phase='catalogue/purchase/faults '+id;
 eq([q.node(id).unlockDepth,q.node(id).levelCap],[unlock,cap],'independent unlock/cap '+id);
 [[0,1,d[3],d[4]],[cap-1,1,d[5],d[6]],[0,cap,d[7],d[8]]].forEach(function(c){
  var expected={lumen:c[2],shard:c[3]};eq(q.cost(id,c[0],c[1]),expected,'exact rational example '+id+'/'+c[0]+'/'+c[1]);priceCases+=2;
  var s=seed(q);s.research[id]=c[0];s.lumen=c[2];s.shards=c[3];q.set(s);
  var before=clone(q.get()),preview=q.preview(id,c[1]);eq(preview.plan.cost,expected,'quoted exact price');eq(q.get(),before,'preview pure');
  eq(q.buy(id,c[1]),true,'actual paid purchase '+id);purchaseCases++;
  eq(q.get().research[id],c[0]+c[1],'actual level count');eq([q.get().lumen,q.get().shards],[0,0],'exact two-wallet debit');
  eq(q.preview(id,1).current,preview.purchase,'preview becomes real effect');eq(q.get().dailyStats.research,(before.dailyStats.research||0)+c[1],'daily count once');
  eq(x.storage.get(P),x.storage.get(R),'both committed slots match');eq(app(x.storage).q.get().research[id],c[0]+c[1],'cold purchase retained');
  eq(q.accept(q.decode(q.export())),q.get(),'actual backup codec roundtrip');
 });
 [0,1,cap,cap+3,1000000].forEach(function(level){var s=seed(q);s.research[id]=level;q.set(s);eq(q.level(id),Math.min(level,cap),'effective cap '+id);eq(q.get().research[id],level,'raw ownership retained '+id);if(level>=cap){var before=clone(q.get());eq(q.buy(id,1),false,'capped buy refused');eq(q.get(),before,'cap refuses payment');}});
 ['lumen-short','shard-short','huge-lumen','huge-shards'].forEach(function(kind){
  var s=seed(q);s.lumen=d[3];s.shards=d[4];if(kind==='lumen-short')s.lumen--;if(kind==='shard-short')s.shards--;if(kind==='huge-lumen')s.lumen=1e30;if(kind==='huge-shards')s.shards=1e30;q.set(s);
  var before=clone(q.get()),writes=x.writes.length;eq(q.plan(id,1).buyCount,0,'unpayable quote '+kind+' '+id);eq(q.buy(id,1),false,'unpayable buy refused');eq(q.get(),before,'rejection preserves all fields');eq(x.writes.length,writes,'rejection has no writes');
 });
 var locked=seed(q);locked.maxDepthEver=unlock-1;locked.depth=locked.enemyDepth=1;locked.enemyHp=locked.enemyMaxHp=q.enemyHp(1);q.set(locked);var before=clone(q.get());eq(q.plan(id,1).reason,'locked','unlock-1 locked');eq(q.buy(id,1),false,'locked handler');eq(q.get(),before,'locked no mutation');
 // A funded, unlocked state ensures malformed counts cannot pass by being
 // rejected for an unrelated lock or shortage before validation executes.
 q.set(seed(q));
 [0,-1,1.5,NaN,Infinity,'1','unknown'].forEach(function(requested){var before=clone(q.get()),writes=x.writes.length;eq(q.plan(id,requested).reason,'unavailable','invalid funded unlocked request '+id);eq(q.buy(id,requested),false,'invalid request handler refuses');eq(q.get(),before,'invalid request preserves all fields');eq(x.writes.length,writes,'invalid request performs no writes');invalidCases++;});
 var one=seed(q);one.lumen=d[3];one.shards=d[4];q.set(one);eq(q.plan(id,5).buyCount,1,'partial bulk buys only affordable level');q.buy(id,5);eq(q.get().research[id],1,'partial count one');eq([q.get().lumen,q.get().shards],[0,0],'partial quote exact debit');
 var queued=seed(q);queued.lumen=d[3];queued.shards=d[4];queued.researchQueue[id]=true;q.set(queued);q.save();var stored=x.storage.get(P),writeCount=x.writes.length;
 eq(q.queue(),true,'real queue purchases '+id);eq(q.get().research[id],1,'queue grants one');eq([q.get().lumen,q.get().shards],[0,0],'queue debit exact');eq(x.writes.length,writeCount,'queue performs no nested save');eq(x.storage.get(P),stored,'queue leaves owning transaction in charge of persistence');q.save();eq(app(x.storage).q.get().research[id],1,'owner commits queued level');
 ['primary','recovery'].forEach(function(failure){
  var y=app(),r=y.q,s=seed(r);s.lumen=d[3];s.shards=d[4];r.set(s);r.save();var before=clone(r.get()),primary=y.storage.get(P),recovery=y.storage.get(R);
  y.fail(failure==='primary',failure==='recovery');eq(r.buy(id,1),failure==='recovery','manual transaction result '+failure+' '+id);faultCases++;
  if(failure==='primary'){eq(r.get(),before,'primary failure full runtime rollback');eq(y.storage.get(P),primary,'old primary intact');eq(y.storage.get(R),recovery,'old recovery intact');eq(app(y.storage).q.get().research[id],0,'cold failed purchase absent');}
  else {eq(r.get().research[id],1,'recovery failure retains committed purchase');eq(r.get().lumen,0,'committed debit retained');eq(JSON.parse(y.storage.get(P)).research[id],1,'primary owns new level');eq(y.storage.get(R),recovery,'failed recovery still old');eq(r.save(),false,'global saveState retains failure return on recovery fault');eq(app(y.storage).q.get().research[id],1,'cold primary remains authoritative');}
  y.fail(false,false);if(failure==='primary')eq(r.buy(id,1),true,'retry buys once');else eq(r.save(),true,'retry repairs recovery');eq(r.get().research[id],1,'one final purchased level');eq(r.get().dailyStats.research,1,'no duplicate daily counter');eq(y.storage.get(P),y.storage.get(R),'retry leaves matching slots');
 });
 // Actual offline owner: a queued payment may not escape a failed endpoint.
 var off=app(),r=off.q,s=seed(r);s.lumen=d[3];s.shards=d[4];s.researchQueue[id]=true;r.set(s);r.save();var before=clone(r.get());off.clock(CLOCK+60000);off.fail(true,false);
 var error=null,result=null;r.offline(function(v,e){result=v;error=e;});off.drain();ok(error,'offline primary failure surfaced '+id);eq(r.get(),before,'offline queued purchase rolls back '+id);eq(JSON.parse(off.storage.get(P)),before,'offline failure preserves primary endpoint');
 off.fail(false,false);error=null;r.offline(function(v,e){result=v;error=e;});off.drain();ok(!error,'offline retry succeeds '+id);eq(r.get().research[id],1,'queued payment consumed once on retry');eq(result.effectiveSec,60,'actual offline interval consumed');eq(r.get().dailyStats.research,1,'offline retry counter once');eq(r.offline(),null,'same elapsed window cannot replay');faultCases++;
});

function battle(q,party,depth){
 var s=seed(q);party=party||['ember'];depth=depth||101;s.depth=s.enemyDepth=depth;s.enemyHp=s.enemyMaxHp=1000000;s.lumen=s.shards=100;
 s.activeParty=party.slice();Object.keys(s.spirits).forEach(function(id){s.spirits[id]=party.indexOf(id)!==-1?1:0;s.heroResource[id]=0;});return s;
}
function run(q,seconds,kind){return q.advance(seconds||0,{kind:kind||'live',clockStartMs:CLOCK,offlineWindowStartMs:CLOCK});}
function cast(q,id,kind){q.get().heroResource[id]=100;return q.abilities(kind||'live',CLOCK);}
function readyResonate(q,levelMap){var s=battle(q,['ember','tide','stone']);s.sigils=1000;Object.keys(s.wispUltimate).forEach(function(id){s.wispUltimate[id]=true;s.heroRarity[id]=5;});Object.keys(levelMap).forEach(function(id){s.research[id]=levelMap[id];});return s;}
function effect(id,raw,cap){
 var x=app(),q=x.q,s,l=Math.min(raw,cap),before,base,after;
 phase='effect '+id+' raw level '+raw;
 if(id==='cauterize'){
  s=battle(q,['ember'],10);s.enemyHp=500000;q.set(s);base=q.regen(10);run(q,1);var control=q.get().enemyHp;s.research[id]=raw;q.set(s);near(q.regen(10),base*(1-.02*l),'Cauterize factor');run(q,1);near(control-q.get().enemyHp,s.enemyMaxHp*base*.02*l,'actual reduced boss healing');
 }else if(id==='fracturekey'||id==='guardianseal'){
  var depth=id==='fracturekey'?20:30;s=battle(q,['ember'],depth);q.set(s);base=id==='fracturekey'?q.abilityDamage('ember',depth):q.tap();s.research[id]=raw;q.set(s);before=q.get().enemyHp;if(id==='fracturekey')cast(q,'ember');else q.manualTap();near(before-q.get().enemyHp,base*(id==='fracturekey'?(1.75+.025*l)/1.75:(3+.1*l)/3),'actual contextual boss hit '+id);
 }else if(id==='spillway'){
  s=battle(q);s.research[id]=raw;s.enemyHp=1;q.set(s);var hit=q.tap();q.manualTap();eq(q.get().depth,102,'actual Spillway source kill');near(q.get().enemyHp,q.enemyHp(102)-.04*l*Math.min(hit-1,hit),'one following nonboss receives spill');
  s.depth=s.enemyDepth=19;q.set(s);q.manualTap();eq(q.get().depth,20,'next target is boss');eq(q.get().enemyHp,q.enemyHp(20),'spill cannot cross into boss');
 }else if(id==='sustainedchannel'){
  s=battle(q,['ember'],20);s.research[id]=raw;q.set(s);eq(cast(q,'ember').count,1,'one nonlethal boss cast');eq(q.get().heroResource.ember,2*l,'nonlethal boss charge refund');
 }else if(id==='tapconduit'){
  s=battle(q,['tide','ember']);s.research[id]=raw;s.heroResource.tide=95;s.heroResource.ember=17;s.spirits.void=1;s.heroResource.void=3;q.set(s);q.manualTap();eq([q.get().heroResource.tide,q.get().heroResource.ember,q.get().heroResource.void],[Math.min(100,95+2*l),17,3],'tap fills only first powered Active, bounded100');
 }else if(id==='guardiancadence'){
  s=battle(q);s.totalTaps=4;q.set(s);base=q.tap();s.research[id]=raw;q.set(s);before=q.get().enemyHp;q.manualTap();near(before-q.get().enemyHp,base*(1+.1*l),'actual fifth lifetime tap');eq(q.get().totalTaps,5,'one lifetime tap recorded');
  s.totalTaps=5;q.set(s);before=q.get().enemyHp;q.manualTap();near(before-q.get().enemyHp,base,'sixth tap has no cadence bonus');
 }else if(id==='relay'){
  s=battle(q,['tide','ember','aurora','stone']);s.research[id]=raw;s.activeParty.forEach(function(who){s.heroResource[who]=100;});s.spirits.void=1;s.heroResource.void=7;q.set(s);eq(q.abilities().count,4,'ordered pass fires four ready Wisps');eq([q.get().heroResource.tide,q.get().heroResource.ember,q.get().heroResource.aurora,q.get().heroResource.stone,q.get().heroResource.void],[0,4*l,0,4*l,7],'two Support grants after pass; no Support/reserve loop');
 }else if(id==='resonantedge'){
  s=battle(q,['tide']);s.research[id]=raw;q.set(s);before=q.get().enemyHp;base=q.power('tide');cast(q,'tide');near(before-q.get().enemyHp,base*.1*l,'actual Support pulse uses own power');ok(!!q.get().supportBuffs.sources.tide,'pulse retains Support buff');
 }else if(id==='victorycharge'){
  s=battle(q,['ember','tide'],20);s.research[id]=raw;s.enemyHp=1;s.heroResource.tide=20;q.set(s);var out=cast(q,'ember');eq(out.summary.bossKills,1,'actual boss death');eq([q.get().heroResource.ember,q.get().heroResource.tide],[4*l,20+4*l],'victory fills all powered Active');
 }else if(id==='amplifiertrim'){
  s=battle(q,['tide']);s.research[id]=raw;q.set(s);cast(q,'tide');eq(q.get().supportBuffs.sources.tide.mult,1.25+.01*l,'new paid Support strength');eq(q.get().supportBuffs.sources.tide.until,CLOCK+4000,'unchanged Support duration');q.save();eq(app(x.storage).q.get().supportBuffs,q.get().supportBuffs,'expanded Support snapshot survives actual load');
 }else if(id==='dualchannel'){
  ['gale','thorn'].forEach(function(who){['live','offline'].forEach(function(kind){s=battle(q,[who]);s.spirits[who]=10;q.set(s);var native=q.abilityReward(who),scale=kind==='offline'?.7:1;s.research[id]=raw;q.set(s);before=clone(q.get());cast(q,who,kind);near(q.get().lumen-before.lumen,(native.lumen+(who==='gale'?Math.floor(native.shards*.20*l):0))*scale,'actual converted Lumen '+who+'/'+kind);near(q.get().shards-before.shards,(native.shards+(who==='thorn'?Math.floor(native.lumen*.02*l):0))*scale,'actual converted Shards '+who+'/'+kind);});});
 }else if(id==='overflowconduit'){
  ['gale','thorn'].forEach(function(who){s=battle(q,[who]);s.spirits[who]=10;s.research[id]=raw;s.enemyHp=1;q.set(s);var native=q.abilityReward(who),hit=q.abilityDamage(who),key=who==='gale'?'shards':'lumen',extra=Math.floor(native[key]*Math.min(.02*l,(hit-1)/hit)),kill=who==='gale'?q.shards(101,false):q.lumen(101,false);before=clone(q.get());cast(q,who);near(q.get()[key]-before[key],native[key]+extra+kill,'source overkill adds only native resource '+who);});
 }else if(id==='resonancecells'){
  s=readyResonate(q,{resonancecells:raw});s.sigilResonanceUses=2;q.set(s);
  for(var uses=3;uses<=3+l;uses++){q.get().heroResource.ember=0;before=q.get().sigils;eq(q.resonate('ember'),true,'actual additional Resonate use');eq(q.get().sigilResonanceUses,uses,'expanded use counter');eq(q.get().sigils,before-q.resonanceCost(),'extra use paid exactly');q.save();eq(app(x.storage).q.get().sigilResonanceUses,uses,'fourth/fifth use survives load');}
  q.get().heroResource.ember=0;before=clone(q.get());eq(q.resonate('ember'),false,'next use beyond effective cap rejected');eq(q.get(),before,'capacity refusal pure');
 }else if(id==='resonancecascade'){
  s=readyResonate(q,{resonancecascade:raw});s.heroResource.tide=40;s.heroResource.stone=95;s.spirits.void=1;s.heroResource.void=3;q.set(s);eq(q.resonate('ember'),true,'actual manual Resonate');eq([q.get().heroResource.ember,q.get().heroResource.tide,q.get().heroResource.stone,q.get().heroResource.void],[100,40+2*l,Math.min(100,95+2*l),3],'cascade only other powered Active, bounded100');
 }else if(id==='resonancereclaim'){
  s=battle(q,['ember'],20);s.research[id]=raw;s.research.resonancecells=2;s.sigilResonanceUses=4;s.enemyHp=1;q.set(s);eq(cast(q,'ember').summary.bossKills,1,'actual reclaim boss kill');eq(q.get().sigilResonanceUses,Math.max(0,4-l),'reclaim removes only spent uses');
 }else throw Error('missing V8 effect '+id);
 effectCases++;
}
specs.forEach(function(d){[0,1,d[2],d[2]+3].forEach(function(level){effect(d[0],level,d[2]);});});

// Manual and both engine policies must actually Ascend before retention checks.
['manual','live','offline'].forEach(function(route){
 phase='actual Ascend '+route;
 var x=app(),q=x.q,s=seed(q);s.depth=s.enemyDepth=21;s.enemyHp=s.enemyMaxHp=100;s.prisms=23;s.ascendRewardedDepth=0;
 s.research.focus=7;s.nodes.echo=3;s.nodes.bonds=2;s.longStudyLevels.guardmastery=4;s.owned.autoascend=true;s.autoAscendEnabled=true;s.autoAscendTargetDepth=21;
 specs.forEach(function(d,i){s.research[d[0]]=d[2]+3;s.researchQueue[d[0]]=i%2===0;});s.sigilResonanceUses=5;
 s.activeStudies=[{id:'guardmastery',remainingSec:120,totalDurationSec:240,speedMult:2}];q.set(s);var before=clone(q.get());
 if(route==='manual')q.ascend();else{q.get().depth=q.get().enemyDepth=20;q.get().enemyHp=0;var sum=run(q,0,route);eq(sum.kills,1,'actual target boss killed '+route);eq(sum.ascends,1,'actual automatic Ascend '+route);}
 eq(q.get().ascendCount,before.ascendCount+1,'actual Ascend count '+route);eq(q.get().depth,1,'actual run resets '+route);eq(q.get().lumen,0,'Lumen resets '+route);eq(q.get().sigilResonanceUses,0,'run Resonate counter resets');
 eq(q.get().prisms,31,'independent first Clear20 reward floor(2*sqrt(20))=8');
 ['research','researchQueue','nodes','longStudyLevels','activeStudies','owned','autoAscendEnabled','autoAscendTargetDepth'].forEach(function(field){eq(q.get()[field],before[field],'Ascend preserves '+field+' '+route);});
 q.save();eq(app(x.storage).q.get().research,q.get().research,'all raw overcaps cold-save after Ascend');
});
// An accepted historical counter can be too large for ++ to change its Number.
// A real new run must still discard old-run Support Relay and Spillway grants.
['live','offline'].forEach(function(route){
 phase='stagnant Ascend counter '+route;
 var x=app(),q=x.q,s=battle(q,['tide','ember'],20);s.ascendCount=1e30;s.owned.autoascend=true;s.autoAscendEnabled=true;s.autoAscendTargetDepth=21;
 s.research.relay=5;s.research.spillway=5;s.research.resonantedge=5;q.set(s);q.get().heroResource.tide=100;q.get().enemyHp=q.abilityDamage('tide',20)/2;
 eq(q.get().ascendCount+1,q.get().ascendCount,'accepted raw counter really has a stagnant increment');
 var before=clone(q.get()),summary=run(q,0,route);eq(summary.bossKills,1,'actual Support pulse kills target boss');eq(summary.ascends,1,'actual Auto-Ascend occurs despite stagnant counter');
 eq(q.get().ascendCount,1e30,'raw historical counter preserved');eq(q.get().depth,1,'new run starts at Rift1');eq([q.get().enemyHp,q.get().enemyMaxHp],[11,11],'old overkill cannot cross into new Rift1');
 eq(Object.keys(q.get().heroResource).map(function(id){return q.get().heroResource[id];}),Object.keys(q.get().heroResource).map(function(){return 0;}),'old Support relay cannot charge new-run Wisps');
 eq(q.get().supportBuffs,null,'old Support buff cleared by real reset');eq(q.get().research,before.research,'paid effects remain owned through reset');eq(q.get().autoAscendEnabled,true,'Auto-Ascend remains enabled');
 q.save();eq(app(x.storage).q.get().ascendCount,1e30,'cold save retains raw counter');unsafeRunCases++;
});
// New Sigil spending has the same primary-commit transaction boundary.
['primary','recovery','huge-wallet'].forEach(function(failure){
 phase='Resonate '+failure;
 var x=app(),q=x.q,s=readyResonate(q,{resonancecells:2,resonancecascade:5});s.sigilResonanceUses=3;if(failure==='huge-wallet')s.sigils=1e30;q.set(s);q.save();var before=clone(q.get());x.fail(failure==='primary',failure==='recovery');
 eq(q.resonate('ember'),failure==='recovery','Resonate fault/guard result '+failure);if(failure!=='recovery')eq(q.get(),before,'failed Resonate preserves currency/charge/uses');else{eq(q.get().sigilResonanceUses,4,'committed fourth use retained');eq(app(x.storage).q.get().sigilResonanceUses,4,'cold primary owns fourth use');}
 x.fail(false,false);q.save();eq(q.get().sigilResonanceUses,failure==='recovery'?4:3,'repair never duplicates use');faultCases++;
});
var estimation=app(),e=estimation.q,s=battle(e,['tide','ember'],20);s.research.relay=5;s.research.tapconduit=5;s.research.sustainedchannel=5;s.achieved.autotap=true;e.set(s);var before=clone(e.get()),profile=e.profile(20);ok(profile&&profile.eventCount>0&&profile.eventCount<=12000,'bounded charge estimate executes on actual V8');eq(e.get(),before,'charge estimate preserves whole state');eq(e.profile(20),profile,'cached estimate same value');
var receipt={status:'pass',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),harnessSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),node:process.version,v8:process.versions.v8,scriptsParsed:scripts.length,checks:checks,priceCurrencyExamples:priceCases,purchases:purchaseCases,effectCases:effectCases,storageFaultCases:faultCases,invalidRequestCases:invalidCases,unsafeAscendRunCases:unsafeRunCases,storageWrites:apps.reduce(function(n,x){return n+x.writes.length;},0),ids:ids,scope:'actual V8 6.0 complete-source sixteen mechanics at0/1/cap/overcap; exact purchases, queued offline rollback, primary/recovery/backup, actual Ascend including stagnant historical counters, and pure estimates; not native WebView/browser layout'};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
