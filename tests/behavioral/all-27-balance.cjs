'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');const {app}=require('./all-27-core.cjs');const {b}=app();
const records=[];
function invest(sp,lumenBudget,shardBudget,sigils){
 // Independent individual-transaction Empower curve, then actual permanent
 // prices/requirements. All unused currency is recorded rather than fabricated.
 let spent=0,level=0;while(spent+Math.round(sp.baseCost*1.13**level)<=lumenBudget*.6){spent+=Math.round(sp.baseCost*1.13**level);level++;}
 let rarity=0,shards=0;const requirements=[8,18,30,45,65];
 while(rarity<5&&level>=requirements[rarity]){const c=b.rarityCost(sp,rarity);if(spent+c.lumen>lumenBudget*.9||shards+c.shard>shardBudget*.7)break;spent+=c.lumen;shards+=c.shard;rarity++;}
 let module=0;while(module<20){const c=b.moduleCost(sp,module);if(spent+c.lumen>lumenBudget||shards+c.shard>shardBudget)break;spent+=c.lumen;shards+=c.shard;module++;}
 const ultimate=rarity===5&&sigils>=b.ultimateCost(sp);return {level,rarity,module,ultimate,spentLumen:spent,spentShards:shards,spentSigils:ultimate?b.ultimateCost(sp):0,lumenBudget,shardBudget};
}
function seed(budget,party,depth){const s=b.fresh();s.maxDepthEver=300;s.depth=depth;s.activeParty=party.slice();s.formationPresets.push=party.slice();const investments={};for(const sp of b.spirits){const i=invest(sp,budget,budget*.01,200);investments[sp.id]=i;s.spirits[sp.id]=i.level;s.heroRarity[sp.id]=i.rarity;s.wispModules[sp.id]=i.module;s.wispUltimate[sp.id]=i.ultimate;}s.research.charge=5;s.nodes.echo=6;s.enemyHp=s.enemyMaxHp=b.hp(depth);s.enemyDepth=depth;b.set(s);return investments;}
for(const budget of [1e8,1e12,1e18])for(const [name,party]of Object.entries({push:['ember','tide','stone','gale','void'],farm:['tide','gale','thorn','aurora','stone'],boss:['ember','stone','void','aurora','titan'],alternateBoss:['ember','tide','stone','gale','void']})){
 const depth=budget===1e8?100:budget===1e12?180:250,investments=seed(budget,party,depth),before=b.get();const dps=b.dps(depth),rates=b.resources(),contributions=party.map(id=>({id,...b.contribution(b.spirits.find(sp=>sp.id===id),depth)}));assert.deepEqual(b.get(),before,'marginal measurement is a pure observer');
 const net=dps-b.hp(depth)*b.bossRegen(depth),ttk=net>0?b.hp(depth)/net:Infinity;
 const titan=contributions.find(v=>v.id==='titan');if(titan&&budget>=1e12)assert(titan.marginal/dps<.8,'mature Titan is below80% marginal party dependence');
 for(const v of contributions){assert(Number.isFinite(v.raw)&&v.raw>=0);assert(Number.isFinite(v.marginal));}
 records.push({budget,name,depth,investments:Object.fromEntries(party.map(id=>[id,investments[id]])),dps,netDps:net,ttkSeconds:Number.isFinite(ttk)?ttk:null,lumenPerSecond:rates.lumen+(Number.isFinite(ttk)?b.lumenReward(depth)/ttk:0),shardsPerSecond:rates.shards+(Number.isFinite(ttk)?b.shardReward(depth)/ttk:0),bonds:b.bonds().map(x=>x.id),contributions});
}
// Named Bond operands and rounded payouts: no pending/bench activation.
const s=b.fresh();s.depth=s.maxDepthEver=100;s.activeParty=['ember','stone','gale','thorn','aurora'];s.activeParty.forEach(id=>s.spirits[id]=40);b.set(s);
assert.deepEqual(b.bonds().map(x=>x.id),['pathfinder','vanguard','quarry','harvest']);assert.equal(b.bossRegen(100),.009*.8);const c=b.contribution(b.spirits.find(sp=>sp.id==='gale'),100);assert.equal(c.rewards.shards,Math.round(130*40*1.39*.05*1.2));s.spirits.stone=0;b.set(s);assert(!b.bonds().some(x=>['vanguard','quarry'].includes(x.id)),'zero-level intent cannot grant Bond');
// The same equal-budget marginal gate must reject the actual old power curve.
const html=fs.readFileSync(require('node:path').resolve(__dirname,'../../index.html'),'utf8');
const marker='* Math.pow(1.10,catchupLevels)';assert(html.includes(marker),'production catch-up mutation anchor');
const old=app(null,html.replace(marker,'* 1')).b,late=records.find(x=>x.budget===1e12&&x.name==='boss'),legacy=old.fresh();
legacy.depth=late.depth;legacy.maxDepthEver=300;legacy.activeParty=Object.keys(late.investments);legacy.research.charge=5;legacy.nodes.echo=6;
for(const [id,i]of Object.entries(late.investments)){legacy.spirits[id]=i.level;legacy.heroRarity[id]=i.rarity;legacy.wispModules[id]=i.module;legacy.wispUltimate[id]=i.ultimate;}
old.set(legacy);const oldTitanShare=old.contribution(old.spirits.find(x=>x.id==='titan'),late.depth).marginal/old.dps(late.depth);
assert(oldTitanShare>=.8,'equal-budget marginal gate detects the old dominant-Titan curve');
const output={status:'pass',contract:'same per-Wisp budgets; unused currency and permanent requirements recorded; marginal losses overlap and are not summed; fixed depths without Forge/Lab/Tree investment do not establish full pacing',negativeControl:{oldTitanMarginalShare:oldTitanShare,caught:true},records};if(process.argv.includes('--write'))fs.writeFileSync(require('node:path').resolve(__dirname,'../../docs/qa/all-27-feedback-001/balance-measurements.json'),JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output));
