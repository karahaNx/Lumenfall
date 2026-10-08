'use strict';
// Real product purchase, simulation and persistence entry points; only DOM/VFX
// are suppressed. Independent integer accounting uses BigInt in Node, never APK.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=process.env.SWIFT_QA_SOURCE||path.resolve(__dirname,'../../index.html');
let html=fs.readFileSync(source,'utf8');
const records=[],copy=x=>JSON.parse(JSON.stringify(x));
const mutant=process.env.SWIFT_QA_MUTANT;
if(mutant==='cap')html=html.replace("effectPerLevel:0.08, levelCap:10","effectPerLevel:0.08, levelCap:11");
if(mutant==='floor')html=html.replace('Math.max(ABILITY_MIN_CYCLE_SEC,ABILITY_BASE_CYCLE_SEC / researchFactor(\'charge\',level))','ABILITY_BASE_CYCLE_SEC / (1+0.08*(level===undefined?researchLevel(\'charge\'):level))');
if(mutant==='refund')html=html.replace('  normalizeSwiftRecoveryRefund(source,out);','');
if(mutant==='clock')html=html.replace('var gridCrossingsBefore = farmGridCrossings;','var elapsedWholeBefore = elapsedWholeSec;').replace('var gridRemainingBefore = farmGridRemainingSec;','var elapsedFractionBefore = elapsedFractionSec;').replace('farmGridCrossings===gridCrossingsBefore && farmGridRemainingSec===gridRemainingBefore','elapsedWholeSec===elapsedWholeBefore && elapsedFractionSec===elapsedFractionBefore');
function app(){
  let now=2000000000000,failPrimary=false,failRecovery=false;const storage=new Map(),writes=[];
  const document={readyState:'loading',hidden:false,addEventListener(){},getElementById:()=>null};
  const window={addEventListener(){},matchMedia:()=>({matches:true})};
  const localStorage={getItem:key=>storage.get(key)||null,removeItem:key=>storage.delete(key),setItem(key,value){
    if((failPrimary&&key==='lumenfall_save_v2')||(failRecovery&&key==='lumenfall_save_recovery_v1'))throw Error('injected storage failure');
    storage.set(key,value);writes.push(key);
  }};
  const bridge=`
    renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=renderResearch=renderLongStudies=function(){};
    showToast=spawnFloatNum=emitCombatVfx=function(){};
    window.qa={fresh:freshState,get:function(){return state;},set:function(s){state=acceptPersistedState(s);},normalize:acceptPersistedState,
      node:function(){return RESEARCH.find(function(n){return n.id==='charge';});},
      plan:function(n){return getResearchBuyPlan(this.node(),n);},preview:function(n){return researchPreview(this.node(),n);},
      buy:function(n,node){labMultiplier=n;buyResearch(node||this.node());},queue:autoLabQueueTick,
      cycle:abilityCycleSeconds,fill:fillRateMult,next:simulationNextAbilitySeconds,
      restore:restoreEnemyOrSpawn,advance:advanceAuthoritativeTime,ascend:applyAscendMutation,save:saveState,load:loadState,
      backup:currentSaveBackup,decode:decodeSaveBackup,
      spend:typeof spendShards==='function'?spendShards:null,can:typeof canSpendShards==='function'?canSpendShards:null,hex:typeof shardBudgetHex==='function'?shardBudgetHex:null,add:typeof shardHexAdd==='function'?shardHexAdd:null,subtract:typeof shardHexSubtract==='function'?shardHexSubtract:null,
      rarity:function(){buyRarity(SPIRITS[0]);},module:function(){buyModule(SPIRITS[0]);},
      rarityCost:function(){return rarityCost(SPIRITS[0],state.heroRarity.ember);},moduleCost:function(){return moduleCost(SPIRITS[0],state.wispModules.ember);},
      research:function(id,n){labMultiplier=n;buyResearch(RESEARCH.find(function(r){return r.id===id;}));},
      researchCost:function(id){return researchCostForLevels(RESEARCH.find(function(r){return r.id===id;}),state.research[id],1);},
      studyCost:function(id){return studyCost(LONG_STUDIES.find(function(r){return r.id===id;}),state.longStudyLevels[id]);},
      study:function(id){return commitStudyStart(LONG_STUDIES.find(function(n){return n.id===id;}));},
      profile:supportAbilityProfile};
  `;
  const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
  new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,localStorage,
    class extends Date{static now(){return now;}},()=>0,()=>{},{now:()=>0});
  const b=window.qa;b.set(b.fresh());
  return {b,storage,writes,clock:n=>now=n,fail:(primary,recovery)=>{failPrimary=primary;failRecovery=recovery;}};
}
function test(name,fn){fn();records.push(name);}
function seed(b,level=0){const s=b.fresh();s.research.charge=level;s.maxDepthEver=101;s.depth=41;s.enemyDepth=41;s.enemyMaxHp=1e100;s.enemyHp=1e100;s.lastSeen=2000000000000;s.questDay='2033-05-18';s.loginStreak=1;return s;}
function refund(level){let n=0n;for(let i=10;i<level;i++){const price=Math.ceil(30*Math.pow(1.55,i));if(!Number.isFinite(price))break;n+=BigInt(price);}return n;}
function balance(b){return BigInt('0x'+b.hex(b.get()));}
function close(a,b,label){assert(Math.abs(a-b)<=1e-9,label+': '+a+' vs '+b);}
if(process.env.SWIFT_QA_BASELINE){
  const a=app(),b=a.b;b.set(seed(b,1000));assert(b.cycle()<0.1);assert(b.plan(1).buyCount===0 || !b.plan(1).maxed);
  assert.equal(b.get().swiftRecoveryRefund,undefined);records.push('observed uncapped old cycle and no refund');
}else{
test('cap and effective cycle at 0..10, huge legacy levels and direct forged-node handler',()=>{
  const b=app().b;assert.equal(b.node().levelCap,10);
  for(const level of [0,1,5,9,10,11,100,1000,1e300]){b.set(seed(b,level));close(b.cycle(),6/(1+0.08*Math.min(level,10)),'cycle');close(b.fill(),1+0.08*Math.min(level,10),'motor rate');assert(b.cycle()>=10/3);assert.equal(b.get().research.charge,level);}
  const s=seed(b,10);s.shards=1e12;b.set(s);const before=copy(b.get());b.buy(100,{id:'charge',levelCap:1000,shardBase:0});assert.deepEqual(b.get(),before);
  b.buy(1,{id:'unknown'});assert.deepEqual(b.get(),before);
});
test('single/bulk/Max exact price and partial affordability at every boundary',()=>{
  const b=app().b;let cases=0;
  for(const level of [0,8,9,10,11])for(const requested of [1,5,10,25,50,100,'max',0,-1,1.5,'10'])for(const funded of [true,false]){
    const s=seed(b,level);s.shards=funded?1e12:Math.ceil(30*Math.pow(1.55,level));b.set(s);
    // Migration compensation is money already owned; test budgets independently.
    b.get().shards=s.shards;if(b.get().swiftRecoveryRefund)b.get().swiftRecoveryRefund.remainingShardsHex='0';
    const expected=(requested==='max'||Number.isInteger(requested)&&requested>0)?Math.max(0,Math.min(10-level,requested==='max'?10:requested,funded?10:1)):0;
    const before=copy(b.get()),plan=b.plan(requested);assert.equal(plan.buyCount,expected);
    const price=expected?Math.ceil(30*Math.pow(1.55,level)*(Math.pow(1.55,expected)-1)/0.55):0;
    assert.equal(plan.cost.shard,price);b.buy(requested);assert.equal(b.get().research.charge,level+expected);assert.equal(b.get().shards,before.shards-price);
    assert.equal(b.get().dailyStats.research||0,(before.dailyStats.research||0)+expected);assert.equal(b.get().enemyHp,before.enemyHp);cases++;
  }
  assert.equal(cases,110);const s=seed(b,9);s.shards=0;b.set(s);assert.equal(b.plan('max').reason,'unaffordable');
});
test('queue stops at cap and retains ON intent without spending or incrementing counters',()=>{
  const b=app().b;for(const level of [8,9,10,11,100]){const s=seed(b,level);s.shards=1e10;s.researchQueue.charge=true;b.set(s);const before=balance(b);b.queue();assert.equal(b.get().research.charge,Math.max(level,10));assert(b.get().researchQueue.charge);const after=copy(b.get());b.queue();assert.deepEqual(b.get(),after);assert(balance(b)<=before);}
});
test('raw history, Deeds, queues and paid work retained; original single-price compensation',()=>{
  const b=app().b;for(const level of [10,11,12,20,78,100,1000,1e300]){
    const s=seed(b,level);s.shards=43;s.achieved.labmaster=true;s.researchQueue.charge=true;s.activeStudies=[{id:'guardmastery',remainingSec:123,totalDurationSec:150,speedMult:2}];
    b.set(s);assert.equal(balance(b),43n+refund(level));assert.equal(b.get().research.charge,level);assert(b.get().achieved.labmaster);assert(b.get().researchQueue.charge);assert.deepEqual(b.get().activeStudies,s.activeStudies);
    const once=copy(b.get());assert.deepEqual(b.normalize(once),once);assert.equal(s.shards,43);
    if(level>2000)assert(b.get().swiftRecoveryRefund.unpricedFrom>0);
  }
});
test('refund keeps exact spendable value beside huge wallets, above Number capacity and after many purchases',()=>{
  const b=app().b;for(const wallet of [0,1e30,Number.MAX_VALUE])for(const level of [11,78,1000,1e300]){
    const s=seed(b,level);s.shards=wallet;b.set(s);let expected=BigInt(wallet)+refund(level);assert.equal(balance(b),expected);
    for(const cost of [1,30,47,1000,1e25]){if(expected>=BigInt(cost)){assert(b.spend(cost));expected-=BigInt(cost);assert.equal(balance(b),expected);b.set(copy(b.get()));assert.equal(balance(b),expected);}}
  }
  for(const [a,c] of [[1n,2n],[123456n,789n],[1n<<1023n,(1n<<1023n)-1n]]){assert.equal(BigInt('0x'+b.add(a.toString(16),c.toString(16))),a+c);assert.equal(BigInt('0x'+b.subtract((a+c).toString(16),c.toString(16))),a);}
  const s=seed(b,11);s.shards=0.5;b.set(s);assert.equal(b.get().shards%1,0.5);assert(b.spend(30));assert.equal(b.get().shards%1,0.5);
});
test('primary/recovery/backup idempotence, restoration replaces full wallet and Ascend retains permanent credit',()=>{
  const a=app(),b=a.b;const old=seed(b,100);old.shards=1e30;b.set(old);assert(b.save());const once=copy(b.get()),backup=b.backup();assert.deepEqual(b.decode(backup),once);
  b.spend(30);b.set(b.load());assert.deepEqual(b.get(),once);a.storage.set('lumenfall_save_v2','corrupt');b.set(b.load());assert.deepEqual(b.get(),once);
  for(let i=0;i<3;i++){b.set(b.normalize(old));assert.equal(balance(b),BigInt(old.shards)+refund(100));b.spend(30);assert.equal(balance(b),BigInt(old.shards)+refund(100)-30n);}
  b.set(once);b.get().depth=16;const value=balance(b),raw=b.get().research.charge,receipt=copy(b.get().swiftRecoveryRefund);b.ascend();assert.equal(balance(b),value);assert.equal(b.get().research.charge,raw);assert.deepEqual(b.get().swiftRecoveryRefund,receipt);
});
test('receipt and money remain one canonical transaction on storage failure',()=>{
  const a=app(),b=a.b;b.set(seed(b,11));assert(b.save());const primary=a.storage.get('lumenfall_save_v2'),before=copy(b.get());a.fail(true,false);assert.equal(b.save(),false);assert.equal(a.storage.get('lumenfall_save_v2'),primary);assert.deepEqual(b.get(),before);a.fail(false,true);assert.equal(b.save(),false);b.set(b.load());assert.deepEqual(b.get(),before);
});
test('precision credits pay through real Forge, queued Forge, Rarity, Module and Study handlers',()=>{
  const b=app().b;
  for(const kind of ['research','queue','rarity','module','study']){
    const s=seed(b,100);s.lumen=1e30;s.spirits.ember=40;b.set(s);
    b.get().shards=0;const credit=b.get().swiftRecoveryRefund;credit.remainingShardsHex=(1000000n).toString(16);
    let cost;
    if(kind==='research'||kind==='queue'){cost=b.researchCost('sense').shard;if(kind==='queue'){b.get().researchQueue.sense=true;credit.remainingShardsHex=BigInt(cost).toString(16);}}
    if(kind==='rarity')cost=b.rarityCost().shard;
    if(kind==='module')cost=b.moduleCost().shard;
    if(kind==='study')cost=b.studyCost('guardmastery').shard;
    const before=balance(b);
    if(kind==='research')b.research('sense',1);if(kind==='queue')b.queue();if(kind==='rarity')b.rarity();if(kind==='module')b.module();if(kind==='study')assert(b.study('guardmastery'));
    assert.equal(balance(b),before-BigInt(cost),kind+' actual debit');
    if(kind==='research'||kind==='queue')assert.equal(b.get().research.sense,1);
    if(kind==='rarity')assert.equal(b.get().heroRarity.ember,1);if(kind==='module')assert.equal(b.get().wispModules.ember,1);
  }
});
test('malformed and old save fields do not truncate raw levels; Reset defaults clear the receipt',()=>{
  const b=app().b;for(const malformed of [null,[],{version:2},{version:1,from:10,to:11,remainingShardsHex:'NaN',refundedShardsHex:'f'}]){
    const s=seed(b,11);s.swiftRecoveryRefund=malformed;b.set(s);assert.equal(balance(b),refund(11));assert.deepEqual(b.normalize(copy(b.get())),b.get());
  }
  const s=seed(b,11);delete s.schemaVersion;b.set(s);assert.equal(balance(b),refund(11));b.set(b.fresh());assert.equal(b.get().swiftRecoveryRefund,null);assert.equal(balance(b),0n);
});
test('actual casts before/exact/after floor, immediate-ready semantics, purchase preserves current percent',()=>{
  const b=app().b;for(const level of [0,9,10,100]){const s=seed(b,level);b.set(s);const cycle=b.cycle();close(b.next(),cycle,'next empty resource');
    for(const offset of [-0.0001,0,0.0001]){b.set(s);const r=b.advance(cycle+offset,{kind:'live',clockStartMs:s.lastSeen,captureTimeline:true});const casts=r.timeline.filter(e=>e.type==='ability');assert.equal(casts.length,offset<0?0:1);if(casts.length)close(casts[0].elapsedSec,cycle,'actual cast chronology');}
    b.set(s);b.get().heroResource.ember=100;assert.equal(b.next(),0);b.advance(0,{kind:'live',clockStartMs:s.lastSeen});
  }
  const s=seed(b,9);s.shards=1e10;s.heroResource.ember=75;b.set(s);b.buy(1);assert.equal(b.get().heroResource.ember,75);close(b.next(),(10/3)*0.25,'no retroactive charge');
});
test('whole/split live/offline charge and cast chronology match at legacy overlevels',()=>{
  const b=app().b;for(const level of [10,100]){const s=seed(b,level);s.spirits.tide=1;s.activeParty=['ember','tide'];s.achieved.autotap=true;b.set(s);
    const r=b.advance(20,{kind:'live',clockStartMs:s.lastSeen,captureTimeline:true}),direct=copy(b.get());b.set(s);const off=b.advance(20,{kind:'offline',clockStartMs:s.lastSeen,captureTimeline:true});assert.deepEqual(b.get().heroResource,direct.heroResource);assert.deepEqual(b.get().supportBuffs,direct.supportBuffs);assert.deepEqual(off.timeline,r.timeline);
    b.set(s);for(let i=0;i<20;i++)b.advance(1,{kind:'live',clockStartMs:s.lastSeen+i*1000});for(const id of s.activeParty)close(b.get().heroResource[id],direct.heroResource[id],'split percent');assert.deepEqual(b.get().supportBuffs,direct.supportBuffs);
  }
});
test('support implementation remains independent and approved duration/cycle contract has bounded uptime',()=>{
  const b=app().b;b.set(seed(b,10));assert.equal(b.profile({id:'tide'}).durationMs,4000);
  for(const level of [0,5,10]){close(1/b.cycle(level),(1+0.08*level)/6,'approved normal uptime');close(1.5/b.cycle(level),1.5*(1+0.08*level)/6,'approved Ultimate uptime');assert(1.5/b.cycle(level)<=0.45);}
});
test('capped Farm cadence crosses tiny clock boundaries and retains whole/split parity',()=>{
  const b=app().b,fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures.json'),'utf8'));
  function parity(a,c,key){if(typeof a==='number'){assert(Math.abs(a-c)<=Math.max(1e-6,Math.max(Math.abs(a),Math.abs(c))*1e-12),key+' '+a+' vs '+c);return;}if(a&&typeof a==='object'){assert.deepEqual(Object.keys(a),Object.keys(c),key);for(const k of Object.keys(a))parity(a[k],c[k],key+'.'+k);return;}assert.deepEqual(a,c,key);}
  for(const fixture of ['parity-medium-farm','parity-long-high-power'])for(const clock of [2000000000000,2000000000123]){
    const s=fixtures[fixture].save;b.set(copy(s));b.restore();let error=null;
    try{b.advance(60,{kind:'offline',clockStartMs:clock,offlineWindowStartMs:clock});}catch(e){error=e;}
    assert.equal(error,null,'capped Farm grid advances without discarding tiny elapsed steps');const whole=copy(b.get());b.set(copy(s));b.restore();
    for(let i=0;i<6;i++)b.advance(10,{kind:'offline',clockStartMs:clock+i*10000,offlineWindowStartMs:clock});parity(b.get(),whole,'capped whole/split '+fixture);
  }
});
}
console.log(JSON.stringify({status:'pass',source,sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),cases:records.length,records,node:process.version,v8:process.versions.v8},null,2));
