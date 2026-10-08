'use strict';
// Production handlers in a deterministic DOM-free environment. No duplicated
// game implementation: independent arithmetic below supplies refund/cap oracles.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');const arg=process.argv.indexOf('--source');
const html=fs.readFileSync(arg<0?path.join(root,'index.html'):process.argv[arg+1],'utf8');
function app(seed,gameHtml=html){
 let now=1700000000000,seq=0;const timers=new Map(),storage=new Map();
 const document={readyState:'loading',addEventListener(){}};
 const window={addEventListener(){}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const bridge=`window.qa={fresh:freshState,set:s=>{state=acceptPersistedState(s);restoreEnemyOrSpawn();},get:()=>clonePersistedValue(state),accept:acceptPersistedState,backup:currentSaveBackup,decode:decodeSaveBackup,save:saveState,load:loadState,available:currencyAvailable,spend:spendCurrency,nodes:NODES,research:RESEARCH,buyNode:buyNode,buyResearch:buyResearch,plan:getResearchBuyPlan,queue:autoLabQueueTick,shop:SHOP,buyShop:buyShopItem,cycle:abilityCycleSeconds,support:supportAbilityProfile,offline:applyOfflineProgress,advance:advanceAuthoritativeTime,ascend:applyAscendMutation,breakdown:ascendPrismBreakdown,rate:offlineRate,costReduction:costReduction,mult:prismMult,spirits:SPIRITS,studies:LONG_STUDIES,power:wispPower,rarityCost:rarityCost,moduleCost:moduleCost,ultimateCost:ultimateSigilCost,studyCost:studyCost,studyDuration:studyDuration,nodeCost:nodeCost,researchCost:researchCostForLevels,dps:sustainedCombatDps,passive:passiveWispDpsAt,ability:averageAbilityDps,resources:abilityResourceRates,bossRegen:bossRegenRate,hp:enemyHpFor,lumenReward:enemyRewardFor,shardReward:shardRewardFor,bonds:activeFormationBonds,contribution:wispContribution,resonate:useSigilResonance,ultimateOwned:allUltimatesOwned,profile:supportAbilityProfile};renderNodes=renderAscendSummary=updateBattleFast=renderResearch=renderSideStats=renderShop=function(){};`;
 const script=gameHtml.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
 new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,localStorage,class extends Date{static now(){return now;}},fn=>{timers.set(++seq,fn);return seq;},id=>timers.delete(id),{now:()=>0});
 const b=window.qa;b.set(seed||b.fresh());
 return {b,storage,clock:v=>now=v,drain(){let n=0;while(timers.size){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();assert(++n<100000,'bounded scheduler');}}};
}
module.exports={app};
if(require.main===module){
const records=[];function check(name,fn){fn();records.push(name);}
check('caps reject direct/bulk/Max/automation with raw history preserved',()=>{
 const {b}=app(),s=b.fresh();s.nodes.echo=8;s.nodes.bonds=22;s.research.charge=12;s.prisms=1000;s.shards=10000;s.maxDepthEver=300;b.set(s);
 const before=b.get();for(const id of ['echo','bonds']){b.buyNode(b.nodes.find(n=>n.id===id));assert.deepEqual(b.get(),before,id+' rejects no-effect purchase');}
 const charge=b.research.find(n=>n.id==='charge');for(const count of [1,5,100,'max'])assert.equal(b.plan(charge,count).buyCount,0);
 b.buyResearch(charge);assert.deepEqual(b.get(),before);s.researchQueue.charge=true;b.set(s);const q=b.get();b.queue();assert.deepEqual(b.get(),q,'queue respects cap');
 assert.equal(b.cycle(),6/1.8);assert.equal(b.rate(),1);assert.equal(b.costReduction(),.6);
 const edge=b.fresh();edge.shards=1e6;edge.research.charge=9;b.set(edge);assert.equal(b.plan(charge,'max').buyCount,1);
 b.buyResearch(charge);assert.equal(b.get().research.charge,10);
});
check('original currencies refunded once through primary/recovery/backup',()=>{
 const {b,storage}=app(),s=b.fresh();s.prisms=17;s.shards=23;s.comets=29;s.nodes.echo=8;s.nodes.bonds=22;s.nodes.reserves=3;s.research.charge=12;s.owned.offline24=s.owned.offline48=s.owned.rememberbulk=true;
 b.set(s);const migrated=b.get();const prismRefund=[6,7].reduce((v,l)=>v+Math.ceil(2*1.4**l),0)+[20,21].reduce((v,l)=>v+Math.ceil(2*1.45**l),0)+[0,1,2].reduce((v,l)=>v+Math.ceil(6*1.6**l),0);
 assert.equal(migrated.prisms,17+prismRefund);assert.equal(migrated.shards,23+Math.ceil(30*1.55**10)+Math.ceil(30*1.55**11));assert.equal(migrated.comets,379);
 assert.equal(migrated.nodes.echo,8);assert(migrated.owned.offline24);assert(migrated.feedbackMigration.receipts['node.reserves']);
 b.set(migrated);assert.deepEqual(b.get(),migrated,'canonical reload idempotent');assert(b.save());
 for(const key of ['lumenfall_save_v2','lumenfall_save_recovery_v1'])assert.deepEqual(b.accept(JSON.parse(storage.get(key))),b.get());
 assert.deepEqual(b.decode(b.backup()),b.get(),'backup does not refund twice');
});
check('small refunds beside huge wallets remain spendable exact credits',()=>{
 const {b}=app(),s=b.fresh();s.prisms=s.comets=s.shards=1e250;s.nodes.echo=7;s.owned.rememberbulk=true;s.research.charge=11;b.set(s);
 assert.equal(b.get().comets,1e250);assert.equal(b.get().refundCredits.comets[0].amount,50);assert(b.spend('comets',30));assert.equal(b.get().refundCredits.comets[0].amount,20);assert(b.spend('comets',20));assert.equal(b.get().refundCredits.comets.length,0);
 const once=b.get();b.set(once);assert.deepEqual(b.get(),once);assert(b.get().refundCredits.shards.length>0);
});
check('support durations and bounded downtime at Swift 0/5/10/legacy',()=>{
 const {b}=app();for(const level of [0,5,10,40]){const s=b.fresh();s.spirits.tide=10;s.heroRarity.tide=5;s.research.charge=level;b.set(s);assert.equal(b.support({id:'tide'}).durationMs,1000);assert(b.cycle()>1);s.wispUltimate.tide=true;b.set(s);assert.equal(b.support({id:'tide'}).durationMs,1500);assert(b.cycle()>1.5);assert(b.cycle()>=6/1.8);}
});
check('all offline production including paid Studies shares 12 hours',()=>{
 const {b,clock}=app(),s=b.fresh();s.lastSeen=1700000000000;s.activeParty=[];s.formationPresets.push=[];s.owned.offline24=s.owned.offline48=true;s.nodes.reserves=10;s.activeStudies=[{id:'guardmastery',remainingSec:100000,totalDurationSec:100000,speedMult:1}];b.set(s);clock(s.lastSeen+96*3600000);
 const result=b.offline();assert.equal(result.effectiveSec,43200);assert.equal(b.get().activeStudies[0].remainingSec,56800);assert.equal(b.get().longStudyLevels.guardmastery,0);assert.equal(b.get().totalOfflineSeconds,43200);assert.equal(b.offline(),null,'consumed tail cannot replay');
});
check('Prism preview and payout agree for first/repeat/progress and factors',()=>{
 const {b}=app();for(const depth of [16,21,100,220])for(const benchmark of [0,depth-1,15]){const s=b.fresh();s.depth=depth;s.maxDepthEver=depth;s.ascendRewardedDepth=benchmark;s.nodes.swift=3;s.longStudyLevels.prismstudy=2;b.set(s);const preview=b.breakdown();const full=Math.floor(2*Math.sqrt(depth-1)*(1+3*.04)*(1+2*.05));assert.equal(preview.full,full);const balance=b.get().prisms;const paid=b.ascend();assert.equal(paid,preview.gain);assert.equal(b.get().prisms-balance,preview.gain);}
});
console.log(JSON.stringify({status:'pass',records},null,2));
}
