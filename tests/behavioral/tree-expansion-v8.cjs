#!/usr/bin/env node
'use strict';
// Standalone ES2017 test: actual Node 8.3 / V8 6.0 executes the complete game
// IIFE without BigInt. Only presentation, clocks and storage are adapted.
// Prices below are fixed DESIGN oracles; no modern harness is imported.
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var file=path.resolve(process.argv[2]||'index.html'),source=fs.readFileSync(file,'utf8');
var hash=function(value){return crypto.createHash('sha256').update(value).digest('hex');};
var checks=0,phase='runtime',effects=[],priceCases=0,faultCases=0,instances=0;
var P='lumenfall_save_v2',R='lumenfall_save_recovery_v1',CLOCK=2000000000000;
var clone=function(value){return JSON.parse(JSON.stringify(value));};
var identity={sourceSha256:hash(source),testSha256:hash(fs.readFileSync(__filename)),node:process.version,v8:process.versions.v8};
function eq(actual,expected,label){checks++;assert.deepStrictEqual(actual,expected,phase+': '+label);}
function ok(value,label){checks++;assert(value,phase+': '+label);}
function near(actual,expected,label){checks++;assert(Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),phase+': '+label+' ('+actual+' versus '+expected+')');}
process.on('uncaughtException',function(error){
  console.log(JSON.stringify(Object.assign({status:'fail',phase:phase,checks:checks,priceCases:priceCases,faultCases:faultCases,effects:effects,error:String(error.stack||error),actual:error.actual,expected:error.expected},identity),null,2));
  process.exit(1);
});
ok(/^v8\.3\./.test(process.version),'actual Node 8.3 runtime required');
ok(/^6\.0\./.test(process.versions.v8),'actual V8 6.0 required');
eq(typeof BigInt,'undefined','engine has no native BigInt');
var scripts=[],pattern=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g,match;
while((match=pattern.exec(source))){if(match[1].trim()){new Function(match[1]);scripts.push(match[1]);}}
ok(scripts.length>=1,'all nonempty inline scripts parse on V8 6.0');
var game=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
var marker="if(document.readyState==='loading'){";
eq(game.split(marker).length,2,'one complete-IIFE observation anchor');
var hooks=`
  renderAll=renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=renderResearch=renderLongStudies=showAscendFlash=function(){};
  showToast=spawnFloatNum=emitCombatVfx=flashBattleStage=pulseWispCard=renderDynamic=function(){};
  function qaNode(id){return NODES.find(function(n){return n.id===id;});}
  function qaSpirit(id){return SPIRITS.find(function(s){return s.id===id;});}
  window.qa={
    fresh:freshState,get:function(){return state;},set:function(s){state=acceptPersistedState(s);},accept:acceptPersistedState,load:function(){state=loadState();},day:todayStr,
    defs:function(){return NODES;},node:qaNode,level:treeLevel,cost:function(id){return nodeCost(qaNode(id));},plan:function(id){return getNodeBuyPlan(qaNode(id));},buy:function(id){return buyNode(qaNode(id));},rawBuy:buyNode,rawPlan:getNodeBuyPlan,
    spirits:function(){return SPIRITS;},sp:qaSpirit,spiritCost:function(id){return spiritCost(qaSpirit(id));},spiritPlan:function(id){return getSpiritBuyPlan(qaSpirit(id));},buySpirit:function(id){return buySpirit(qaSpirit(id));},
    autoEmpower:autoEmpowerTick,processEmpower:function(){var s=simulationSummary(0);var count=simulationProcessAutoEmpower(s);return {count:count,summary:s};},
    capacity:treeFormationCapacity,unlock:function(id,s){return treeWispUnlockDepth(qaSpirit(id),s);},toggle:toggleActive,preset:applyFormationPreset,
    offlineRate:offlineRate,offlineCap:offlineCapHours,policy:simulationPolicy,advance:advanceAuthoritativeTime,
    frontier:treeFrontierBonus,dust:treeAscendMotes,dustForWallet:treeAscendMotesForWallet,prism:ascendPrismBreakdown,prismMult:prismMult,
    ascend:function(){return doAscend(false);},buff:simulationBuffMult,runToken:function(){return ascendRunToken;},queueTrial:queueCometTrial,
    rarityCost:function(id,tier){return rarityCost(qaSpirit(id),tier);},moduleCost:function(id,l){return moduleCost(qaSpirit(id),l);},
    save:saveState,encode:encodeSaveBackup,decode:decodeSaveBackup,export:currentSaveBackup,
    observeSpawns:function(observer){var old=spawnEnemy;spawnEnemy=function(){var result=old.apply(this,arguments);observer({depth:state.depth,enemyDepth:state.enemyDepth});return result;};return function(){spawnEnemy=old;};}
  };
`;
var execute=new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance','BigInt','location','navigator',game.replace(marker,hooks+marker));
function app(saved){
  instances++;
  var now=CLOCK,failPrimary=false,failRecovery=false,timers=[],writes=[],storage=new Map(saved||[]);
  var window={addEventListener:function(){},matchMedia:function(){return {matches:true};}};
  var area={value:''},document={readyState:'loading',hidden:false,addEventListener:function(){},querySelector:function(){return null;},querySelectorAll:function(){return [];},getElementById:function(id){return id==='save-backup-code'?area:null;},body:{classList:{add:function(){},remove:function(){}}}};
  var local={getItem:function(k){return storage.get(k)||null;},removeItem:function(k){storage.delete(k);},setItem:function(k,v){if((failPrimary&&k===P)||(failRecovery&&k===R))throw Error('injected storage failure');writes.push(k);storage.set(k,String(v));}};
  class ClockDate extends Date {static now(){return now;}}
  execute(window,document,local,ClockDate,function(fn){timers.push(fn);return timers.length;},function(){},{now:function(){return 0;}},undefined,{reload:function(){}},{});
  var q=window.qa;
  if(saved)q.load();else q.set(q.fresh());
  return {q:q,storage:storage,writes:writes,fail:function(primary,recovery){failPrimary=primary;failRecovery=recovery;},clock:function(value){now=value;},drain:function(){var n=0;while(timers.length){if(n++>10000)throw Error('bounded callback drain');timers.shift()();}}};
}
function seed(q){
  var s=q.fresh();s.maxDepthEver=250;s.depth=s.enemyDepth=101;s.enemyHp=s.enemyMaxHp=1e15;s.questDay=q.day();s.lastSeen=CLOCK;
  s.lumen=1000000000;s.shards=1000000000;s.prisms=10000;s.motes=10000;s.sigils=1000;s.comets=115;s.nodes.swift=10;
  s.autoAscendEnabled=false;
  ['empowerQueue','researchQueue','studyQueue','studyUseMotes'].forEach(function(k){Object.keys(s[k]).forEach(function(id){s[k][id]=false;});});
  return s;
}
function freshWorld(){var a=app();a.q.set(seed(a.q));return a;}
function cleared(q,clear){var s=seed(q);s.depth=s.enemyDepth=clear+1;s.nodes.swift=0;s.ascendRewardedDepth=0;s.ascendCount=3;s.spirits.ember=30;return s;}
function scenario(id,fn){phase='effect '+id;var a=freshWorld();fn(a,a.q);effects.push(id);}
var rows=[
  ['echo',1,6,[2,3,4,6,8,11]],['bonds',1,20,null],['swift',1,null,null],
  ['swiftcharter',100,1,[200]],['lumenmemory',15,5,[8,16,28,44,64]],['veteranrecruits',20,5,[5,10,18,30,46]],
  ['rosterrecall',25,4,[15,30,55,90]],['chargememory',30,5,[12,22,38,60,90]],['supportmemory',60,1,[60]],['phasememory',40,1,[35]],
  ['riftstep',30,5,[12,24,42,68,104]],['frontier',50,5,[20,35,55,80,110]],['stardust',60,5,[10,18,30,46,66]],
  ['gentlegrowth',40,5,[12,22,38,60,90]],['formationseat',75,1,[120]],['benchmentor',35,5,[10,18,30,46,66]],
  ['empowerbatch',45,4,[15,28,46,70]],['wallwisdom',50,4,[12,22,36,54]],['invitations',15,3,[4,9,16]],['recruitreserve',25,5,[8,16,28,44,64]]
];
function price(row,level){if(row[0]==='bonds')return Math.ceil(2*Math.pow(1.45,level));if(row[0]==='swift')return Math.ceil(3*Math.pow(1.5,level));return row[3][level];}
phase='all twenty catalogs and paid endpoints';
var catalog=freshWorld().q.defs();
eq(catalog.filter(function(n){return !n.retired&&!n.retiredTo;}).map(function(n){return n.id;}).sort(),rows.map(function(r){return r[0];}).sort(),'exact active twenty IDs');
eq(catalog.length,24,'all four retired IDs retained as records');
rows.forEach(function(row){
  var id=row[0],levels=row[2]===null?[0,10,30,50]:Array.from({length:row[2]},function(_,i){return i;});
  levels.forEach(function(level){
    phase='paid '+id+'/'+level;
    var a=freshWorld(),q=a.q,s=seed(q),cost=price(row,level);s.nodes[id]=level;s.prisms=cost-1;q.set(s);
    var before=clone(q.get());eq(q.cost(id),cost,'independent exact price');eq(q.plan(id).reason,'unaffordable','one Prism short');eq(q.buy(id),false,'short purchase refused');eq(q.get(),before,'refusal is pure');
    q.get().prisms=cost;before=clone(q.get());eq(q.buy(id),true,'real exact purchase');eq(q.get().nodes[id],level+1,'one paid level');eq(q.get().prisms,0,'exact debit');
    ['research','longStudyLevels','spirits','owned','activeParty','formationPresets','heroRarity','wispModules','wispUltimate','autoAscendEnabled','autoAscendTargetDepth'].forEach(function(key){eq(q.get()[key],before[key],'preserve '+key);});
    eq(a.writes.filter(function(k){return k===P||k===R;}),[P,R],'one primary/recovery pair');
    [P,R].forEach(function(key){var saved=JSON.parse(a.storage.get(key));eq([saved.nodes[id],saved.prisms],[level+1,0],'stored paid endpoint '+key);});
    var cold=app(a.storage).q;eq([cold.get().nodes[id],cold.get().prisms],[level+1,0],'actual cold-load paid endpoint');
    eq(q.decode(q.encode(q.get())),q.get(),'actual backup codec roundtrip');priceCases++;
  });
  if(row[2]!==null){[row[2],row[2]+1,1000000].forEach(function(raw){
    phase='cap '+id+'/'+raw;var a=freshWorld(),q=a.q,s=seed(q);s.nodes[id]=raw;q.set(s);var before=clone(q.get());
    eq(q.get().nodes[id],raw,'raw paid overcap record');if(rows.indexOf(row)>=3)eq(q.level(id),row[2],'effective new cap');
    eq(q.plan(id).reason,'cap','exact cap gate');eq(q.buy(id),false,'cap handler refusal');eq(q.get(),before,'no cap mutation');
  });}
  if(rows.indexOf(row)>=3){
    phase='unlock and faults '+id;var a=freshWorld(),q=a.q,s=seed(q);s.depth=s.enemyDepth=1;s.maxDepthEver=row[1]-1;q.set(s);var before=clone(q.get());
    eq(q.plan(id).reason,'locked','one Rift below requirement');eq(q.buy(id),false,'locked handler refusal');eq(q.get(),before,'locked refusal pure');
    s=seed(q);s.prisms=1e30;q.set(s);before=clone(q.get());eq(q.plan(id).reason,'unavailable','unrepresented debit blocked');eq(q.buy(id),false,'no free high-wallet level');eq(q.get(),before,'huge-wallet refusal pure');
    [true,false].forEach(function(primary){var b=freshWorld(),z=b.q,t=seed(z);t.prisms=row[3][0];z.set(t);z.save();var start=clone(z.get()),oldP=b.storage.get(P),oldR=b.storage.get(R);b.fail(primary,!primary);
      eq(z.buy(id),!primary,'primary failure or committed recovery failure result');
      if(primary){eq(z.get(),start,'whole paid endpoint rolled back');eq([b.storage.get(P),b.storage.get(R)],[oldP,oldR],'both old slots intact');}
      else{eq([z.get().nodes[id],z.get().prisms],[1,0],'primary committed once');eq(JSON.parse(b.storage.get(P)).nodes[id],1,'primary paid record');eq(b.storage.get(R),oldR,'failed recovery retains preceding snapshot');b.fail(false,false);eq(app(b.storage).q.get().nodes[id],1,'cold load keeps primary ownership');}
      faultCases++;
    });
  }
});
phase='legacy migration and every paid subsystem';
var legacyApp=freshWorld(),lq=legacyApp.q,old=seed(lq);old.schemaVersion=1;delete old.offline12hRefund;delete old.treeTrainingProgress;
rows.slice(3).forEach(function(r){delete old.nodes[r[0]];});Object.assign(old.nodes,{starlight:12,steady:9,momentum:7,echo:9,bonds:25,swift:12,reserves:3});
old.prisms=100;old.comets=7;old.owned.offline24=true;old.owned.offline48=true;old.owned.autoascend=true;old.autoAscendEnabled=true;old.autoAscendTargetDepth=250;
old.research.charge=28;old.research.formation=5;old.research.relay=2;old.longStudyLevels.labcapacity=1;old.longStudyLevels.prismstudy=3;
old.activeStudies=[{id:'wispascend',remainingSec:90,totalDurationSec:180,speedMult:1.5},{id:'shardstudy',remainingSec:100,totalDurationSec:200,speedMult:2}];
old.heroRarity.ember=5;old.wispModules.ember=20;old.wispUltimate.ember=true;
var migratedApp=app([[P,JSON.stringify(old)],[R,JSON.stringify(old)]]),mq=migratedApp.q,migrated=clone(mq.get());
eq(migrated.schemaVersion,2,'actual schema1 cold-load migration');eq([migrated.prisms,migrated.comets],[132,307],'original6+10+16 Prism and300 Comet refund');
Object.keys(old.nodes).forEach(function(id){eq(migrated.nodes[id],old.nodes[id],'old raw purchase retained '+id);});
rows.slice(3).forEach(function(r){eq(migrated.nodes[r[0]],0,'new level defaults zero '+r[0]);});eq(migrated.treeTrainingProgress,0,'new operating counter defaults zero');
['research','longStudyLevels','activeStudies','heroRarity','wispModules','wispUltimate','autoAscendEnabled','autoAscendTargetDepth'].forEach(function(k){eq(migrated[k],old[k],'paid migration preserves '+k);});
eq(mq.decode(mq.encode(migrated)),migrated,'backup never replays refund');mq.save();eq(app(migratedApp.storage).q.get(),mq.get(),'second cold load never replays refund');
eq(mq.capacity(),5,'old save remains five slots');eq(mq.offlineCap(),12,'old paid hours preserve fixed12h policy');
phase='forged and retired buys';
var invalid=freshWorld().q;['starlight','steady','momentum','reserves'].forEach(function(id){var before=clone(invalid.get());eq(invalid.buy(id),false,'retired buy '+id);eq(invalid.get(),before,'retired no mutation '+id);});
eq(invalid.rawPlan({id:'lumenmemory'}).reason,'invalid','catalog-object identity required');eq(invalid.rawBuy({id:'lumenmemory'}),false,'forged buy refused');

scenario('echo',function(a,q){q.get().nodes.echo=0;near(q.offlineRate(),.7,'original earning rate');q.get().nodes.echo=6;near(q.offlineRate(),1,'six actual paid ranks reach100%');q.get().longStudyLevels.riftattune=4;near(q.offlineRate(),1.4,'completed Lab stays additive');eq(q.offlineCap(),12,'hours unchanged');});
scenario('bonds',function(a,q){var s=seed(q);s.spirits.tide=0;s.nodes.bonds=20;s.lumen=24;q.set(s);eq(q.spiritCost('tide'),24,'original40% price floor');eq(q.buySpirit('tide'),true,'real reduced recruitment');eq([q.get().lumen,q.get().spirits.tide],[0,1],'one paid recruit');});
scenario('swift',function(a,q){var s=cleared(q,20);s.ascendRewardedDepth=20;s.prisms=100;q.set(s);eq(q.prism(21).gain,1,'original minimum repeat');q.get().nodes.swift=1;eq(q.prism(21).gain,2,'protected paid4% bonus');eq(q.ascend(),true,'real Ascend');eq(q.get().prisms,102,'actual changed repeat credit');});
scenario('swiftcharter',function(a,q){var s=seed(q);s.prisms=200;q.set(s);eq(q.cost('swift'),173,'unowned Swift10 original quote');var mult=q.prismMult();eq(q.buy('swiftcharter'),true,'buy Charter200');eq(q.prismMult(),mult,'paid Swift multiplier unchanged');eq(q.cost('swift'),60,'future rank10 price60');q.get().prisms=60;eq(q.buy('swift'),true,'actual future Swift purchase');eq([q.get().nodes.swift,q.get().prisms],[11,0],'no converted or free Swift levels');[30,50].forEach(function(k){q.get().nodes.swift=k;eq(q.cost('swift'),k*6,'owned high-rank price '+k);});});
scenario('lumenmemory',function(a,q){[[1,1234,61.7],[5,1000000000,250000],[5,0,0]].forEach(function(c){var s=cleared(q,50);s.nodes.lumenmemory=c[0];s.lumen=c[1];q.set(s);eq(q.ascend(),true,'real reset');eq(q.get().lumen,c[2],'event-time fraction/cap/empty');});});
scenario('veteranrecruits',function(a,q){var s=seed(q);s.nodes.veteranrecruits=3;s.spirits.tide=0;s.lumen=60;q.set(s);eq(q.spiritPlan('tide').levels,4,'one quote includes three bonus levels');eq(q.buySpirit('tide'),true,'actual paid first recruitment');eq([q.get().spirits.tide,q.get().lumen],[4,0],'one price funds four initial levels');eq(q.ascend(),true,'reset');eq([q.get().spirits.ember,q.get().spirits.tide],[4,0],'reset Ember boosted and no implicit Recall');});
scenario('rosterrecall',function(a,q){var s=cleared(q,50);s.nodes.rosterrecall=2;s.nodes.veteranrecruits=2;s.spirits.ember=5;s.spirits.tide=6;s.spirits.stone=7;s.spirits.gale=0;s.activeParty=['ember','tide','stone'];s.formationRebuild={members:['ember','tide','stone','gale'],preset:'push'};s.activeFormationPreset='push';s.formationPresets.push=s.formationRebuild.members.slice();q.set(s);eq(q.ascend(),true,'real Recall reset');eq([q.get().spirits.ember,q.get().spirits.tide,q.get().spirits.stone,q.get().spirits.gale],[3,3,3,0],'Ember excluded from two additional recalled paid members');eq(q.get().activeParty,['ember','tide','stone'],'pending unowned member has no power');});
scenario('chargememory',function(a,q){var s=cleared(q,50);s.nodes.chargememory=3;s.heroResource.ember=37.5;s.heroResource.tide=82.5;s.heroResource.void=13.75;s.spirits.void=0;q.set(s);eq(q.ascend(),true,'actual reset');eq([q.get().heroResource.ember,q.get().heroResource.tide,q.get().heroResource.void],[22.5,49.5,8.25],'60% of each ending charge');eq(q.get().spirits.void,0,'dormant saved charge grants no recruitment');});
scenario('supportmemory',function(a,q){var s=cleared(q,50);s.nodes.supportmemory=1;s.buffUntil=CLOCK+3000;s.buffMult=1.25;s.supportBuffs={version:1,sources:{tide:{until:CLOCK+4000,mult:1.25},aurora:{until:CLOCK+8000,mult:1.5}}};q.set(s);var before=clone(q.get()),buff=q.buff(CLOCK);eq(q.ascend(),true,'actual reset');eq([q.get().buffUntil,q.get().buffMult,q.get().supportBuffs],[before.buffUntil,before.buffMult,before.supportBuffs],'saved strength and original deadlines exact');eq(q.buff(CLOCK),buff,'same aggregate effect immediately');eq(q.buff(CLOCK+8000),1,'expired support never renewed');});
scenario('phasememory',function(a,q){[true,false].forEach(function(unlocked){var s=cleared(q,50);s.nodes.phasememory=1;s.achieved.autotap=s.achieved.labmaster=unlocked;s._autoTapAccum=123.25;s._autoEmpowerAccum=987.5;q.set(s);eq(q.ascend(),true,'actual phase reset');eq([q.get()._autoTapAccum,q.get()._autoEmpowerAccum],unlocked?[123.25,987.5]:[0,0],'only previously unlocked timer phases survive');});});
scenario('riftstep',function(a,q){var s=cleared(q,50);s.nodes.riftstep=3;q.set(s);var before=clone(q.get()),spawns=[],undo=q.observeSpawns(function(v){spawns.push(v);});eq(q.ascend(),true,'actual shifted start');undo();eq([q.get().depth,q.get().enemyDepth],[4,4],'one correct new Rift');eq(spawns,[{depth:4,enemyDepth:4}],'exactly one spawn');eq([q.get().totalKills,q.get().maxDepthEver],[before.totalKills,before.maxDepthEver],'skipped enemies give no kills or new record');});
scenario('frontier',function(a,q){var s=cleared(q,50);s.ascendRewardedDepth=24;s.nodes.swift=10;s.longStudyLevels.prismstudy=10;s.nodes.frontier=3;s.prisms=100;q.set(s);eq(q.prism(51).gain,34,'old28 plus independent6 Frontier');eq(q.frontier(50,24),6,'two newly crossed25 boundaries');eq(q.ascend(),true,'actual first credit');eq([q.get().prisms,q.get().ascendRewardedDepth],[134,50],'new benchmark credited once');q.get().depth=q.get().enemyDepth=51;eq(q.frontier(50,50),0,'repeat Frontier0');eq(q.prism(51).gain,18,'unchanged protected repeat kernel');eq(q.ascend(),true,'actual repeat');eq(q.get().prisms,152,'second payout never replays frontier');});
scenario('stardust',function(a,q){q.get().nodes.stardust=3;eq(q.dust(47),6,'47 credits two20 bundles');eq(q.dust(200),30,'ten-bundle cap');[0,1e30].forEach(function(wallet){var s=cleared(q,100);s.nodes.stardust=3;s.prisms=wallet;s.motes=100;q.set(s);eq(q.prism(101).gain,20,'fixed first reward20');eq(q.ascend(),true,'actual Dust transition');eq(q.get().motes,wallet===0?103:100,'Dust follows actually represented Prism credit');});});
scenario('gentlegrowth',function(a,q){[['ember',25,5,0,212],['ember',26,1,0,238],['ember',26,5,0,229],['ember',50,5,0,1454],['ember',50,5,20,582],['titan',100,5,0,15002561973]].forEach(function(c){var s=seed(q);s.spirits[c[0]]=c[1];s.nodes.gentlegrowth=c[2];s.nodes.bonds=c[3];s.lumen=c[4];q.set(s);eq(q.spiritCost(c[0]),c[4],'fixed rational result '+c.join('/'));eq(q.buySpirit(c[0]),true,'real exact paid Empower');eq([q.get().spirits[c[0]],q.get().lumen],[c[1]+1,0],'one exact level/debit');});});
scenario('formationseat',function(a,q){var s=seed(q),five=['ember','tide','stone','gale','thorn'];s.nodes.formationseat=1;q.spirits().forEach(function(sp){s.spirits[sp.id]=10;});s.activeParty=five.slice();s.activeFormationPreset='push';s.formationPresets.push=five.slice();s.formationPresets.farm=five.slice();q.set(s);eq(q.capacity(),6,'six paid chosen slots');eq(q.toggle('aurora'),true,'actual Field handler commits sixth member');eq(q.get().activeParty,five.concat('aurora'),'actual sixth field');var six=q.get().activeParty.slice();q.toggle('void');eq(q.get().activeParty,six,'seventh refused');eq(q.preset('farm'),true,'switch actual five-member preset');eq(q.get().activeParty,five,'five retained');eq(q.preset('push'),true,'switch actual saved six-member preset');eq(q.get().activeParty,six,'six restored');q.save();eq(app(a.storage).q.get().activeParty,six,'owned capacity precedes cold-load party normalization');var zero=clone(q.get());zero.nodes.formationseat=0;eq(q.capacity(zero),5,'snapshot capacity independent of current ownership');eq(q.accept(zero).activeParty,five,'zero-new migration clips five');});
scenario('benchmentor',function(a,q){var s=seed(q);s.nodes.benchmentor=3;s.treeTrainingProgress=9;s.spirits.ember=10;s.spirits.tide=s.spirits.stone=4;s.activeParty=['ember'];s.lumen=Math.round(10*Math.pow(1.13,10));q.set(s);q.save();var before=clone(q.get());a.fail(true,false);eq(q.buySpirit('ember'),false,'failed primary refuses combined paid/bonus mutation');eq(q.get(),before,'whole Mentor endpoint rollback');a.fail(false,false);eq(q.buySpirit('ember'),true,'real tenth paid action');eq([q.get().spirits.ember,q.get().spirits.tide,q.get().spirits.stone,q.get().treeTrainingProgress],[11,7,4,0],'catalog tie awards one other Bench and resets counter');eq(q.get().lumen,0,'bonus never charges recursively');});
scenario('empowerbatch',function(a,q){var s=seed(q);s.nodes.empowerbatch=4;s.achieved.labmaster=true;s.spirits.ember=1;s.activeParty=['ember'];s.empowerQueue.ember=true;s.lumen=1000;q.set(s);q.get()._autoEmpowerAccum=1000;var result=q.processEmpower();eq([result.count,result.summary.empowers],[1,5],'one actual timer event performs five individual buys');eq([q.get().spirits.ember,q.get().lumen],[6,928],'five evolving quotes11+13+14+16+18');eq(q.get()._autoEmpowerAccum,0,'one timer consumed exactly once');});
scenario('wallwisdom',function(a,q){[0,4].forEach(function(rank){var s=seed(q);s.nodes.wallwisdom=rank;s.nodes.swift=0;s.depth=s.enemyDepth=100;s.enemyHp=s.enemyMaxHp=1e50;s.spirits.ember=1;q.set(s);var grace=300-60*rank;eq(q.policy('offline',{clockStartMs:CLOCK}).bossRetreatNotBeforeMs,CLOCK+grace*1000,'independent grace deadline');q.advance(grace-.001,{kind:'offline',clockStartMs:CLOCK});eq(q.get().riftMode,'push','no early retreat');var end=q.advance(.001,{kind:'offline',clockStartMs:CLOCK+(grace-.001)*1000,offlineWindowStartMs:CLOCK});eq(end.retreats,1,'actual wall retreats precisely at grace');eq([q.get().riftMode,q.get().farmReturnDepth],['farm',100],'original Push destination retained');eq(q.offlineCap(),12,'cap unchanged');});});
scenario('invitations',function(a,q){var s=seed(q);s.nodes.invitations=3;s.depth=s.enemyDepth=s.maxDepthEver=1;s.spirits.tide=0;s.lumen=60;q.set(s);var rarity=clone(q.rarityCost('tide',2)),module=clone(q.moduleCost('tide',3));eq(q.sp('tide').unlockDepth,3,'raw permanent-price anchor remains3');eq(q.unlock('tide'),1,'new recruit gate floor1');eq(q.buySpirit('tide'),true,'actual early paid recruitment');eq([q.get().spirits.tide,q.get().lumen],[1,0],'one original priced recruit');q.get().nodes.invitations=0;eq([q.rarityCost('tide',2),q.moduleCost('tide',3)],[rarity,module],'permanent upgrade economics untouched');});
scenario('recruitreserve',function(a,q){[[5,60,0,1,1],[5,59,59,1,0],[1,22,22,1,0],[1,23,12,2,0]].forEach(function(c){var s=seed(q);s.nodes.recruitreserve=c[0];s.achieved.labmaster=true;s.spirits.ember=1;s.spirits.tide=0;s.activeParty=['ember'];s.activeFormationPreset='push';s.formationPresets.push=['ember','tide'];s.formationRebuild={members:['ember','tide'],preset:'push'};s.empowerQueue.ember=s.empowerQueue.tide=true;s.lumen=c[1];q.set(s);eq(q.autoEmpower(),c[1]===60||c[1]===23,'automatic reserved affordability');eq([q.get().lumen,q.get().spirits.ember,q.get().spirits.tide],c.slice(2),'priority or protected exact budget');});q.get().lumen=13;eq(q.buySpirit('ember'),true,'manual Empower is unrestricted by reserved automatic budget');eq(q.get().lumen,0,'manual exact current quote');});
phase='completion';
eq(effects.slice().sort(),rows.map(function(r){return r[0];}).sort(),'all twenty real effect paths executed');
console.log(JSON.stringify(Object.assign({status:'pass',checks:checks,inlineScriptsParsed:scripts.length,completeIifeInstances:instances,priceCases:priceCases,faultCases:faultCases,effects:effects,bigIntAvailable:false,scope:'Actual V8 6.0 complete-IIFE engine, purchases, migration and persistence; browser layout/native Android are separate gates.'},identity),null,2));
