#!/usr/bin/env node
'use strict';
// Read-only baseline observation and explicitly counterfactual design arithmetic.
// The product is never written. Output contains projections, not complete saves.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.argv[2]||'/workspace/scratch/0848c4e4f365/Lumenfall-tree';
const out=process.argv[3]||__dirname;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sourceSha256=hash(source);
assert.equal(sourceSha256,'05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac');
const harnessPath=path.join(root,'tests/behavioral/forge-expansion-harness.cjs');
const oraclePath=path.join(root,'tests/behavioral/prism-earning-reference.cjs');
const {app,clone,CLOCK}=require(harnessPath),{reward}=require(oraclePath);
const marker="if(document.readyState==='loading'){";
assert.equal(source.split(marker).length,2);
// Existing full-game harness installs window.qa before this loading branch.
const hook="\nwindow.qa.treeEconomy={nodes:function(){return NODES;},spirits:function(){return SPIRITS;},price:function(id){return nodeCost(NODES.find(function(n){return n.id===id;}));},spiritPrice:function(id){return spiritCost(SPIRITS.find(function(s){return s.id===id;}));},info:function(){return {offlineRate:offlineRate(),offlineCapHours:offlineCapHours(),recruitEmpowerDiscount:costReduction(),prismMultiplier:prismMult()};}};\n";
const observedSource=source.replace(marker,marker+hook),x=app(observedSource),q=x.q,t=q.treeEconomy;
let checks=0;function eq(a,b,label){checks++;assert.deepEqual(a,b,label);}
function fresh(c=20,swift=0,clarity=0){const s=q.fresh();s.depth=c+1;s.enemyDepth=c+1;s.enemyHp=s.enemyMaxHp=1e15;s.maxDepthEver=Math.max(250,c+1);s.ascendRewardedDepth=c;s.nodes.swift=swift;s.longStudyLevels.prismstudy=clarity;s.lastSeen=CLOCK;s.questDay=q.day();s.autoAscendEnabled=false;for(const k of ['empowerQueue','researchQueue','studyQueue','studyUseMotes'])for(const id of Object.keys(s[k]))s[k][id]=false;return s;}
function actualReward(c,swift,clarity){q.set(fresh(c,swift,clarity));return q.prismPreview().gain;}
function actualPrice(id,level){const s=fresh();s.nodes[id]=level;q.set(s);return t.price(id);}
function ceilRatio(n,d){return (n+d-1n)/d;}
function roundedRatio(n,d){return (2n*n+d)/(2n*d);}
function exactGeometric(base,numer,denom,level){return Number(ceilRatio(BigInt(base)*BigInt(numer)**BigInt(level),BigInt(denom)**BigInt(level)));}
const nodeDefs=clone(t.nodes());
eq(nodeDefs.filter(n=>!n.retired&&!n.retiredTo).map(n=>n.id),['echo','bonds','swift'],'three current purchasing tracks');
const ratios={echo:[2,7,5,6],bonds:[2,29,20,20],swift:[3,3,2,80]};
const oldPrices=[];
for(const [id,[base,num,den,limit]] of Object.entries(ratios)){
 let cumulative=0;
 for(let level=0;level<=limit;level++){
  const actual=actualPrice(id,level),rational=exactGeometric(base,num,den,level);
  oldPrices.push({id,currentLevel:level,actualPrice:actual,independentRationalCeil:rational,difference:actual-rational,actualPriceIsSafeInteger:Number.isSafeInteger(actual),cumulativeActualCostBeforeLevel:cumulative,purchasable:id==='swift'||level<limit});
  if(id!=='swift'||level<=50)eq(actual,rational,'normal-range original price '+id+' '+level);
  cumulative+=actual;
 }
}
const effects=[];
for(const echo of [0,1,2,3,4,5,6,7,1000000])for(const oldLab of [0,1,7,20]){
 const s=fresh();s.nodes.echo=echo;s.longStudyLevels.riftattune=oldLab;q.set(s);
 const got=t.info();eq(got.offlineRate,Math.min(1,.7+.05*echo)+.1*oldLab,'original offline operand');eq(got.offlineCapHours,12,'fixed cap remains12 hours');
 effects.push({echoRaw:echo,oldRiftAttunement:oldLab,...got});
}
const spirits=clone(t.spirits()),wispCosts=[];
for(const bonds of [0,1,5,10,19,20,21,1000000])for(const level of [0,1,5,10,25,50,100])for(const sp of spirits){
 const s=fresh();s.nodes.bonds=bonds;s.spirits[sp.id]=level;q.set(s);
 const actual=t.spiritPrice(sp.id),keptPercent=100-Math.min(60,3*bonds);
 const exact=Number(roundedRatio(BigInt(sp.baseCost)*113n**BigInt(level)*BigInt(keptPercent),100n**BigInt(level)*100n));
 wispCosts.push({id:sp.id,unlockDepth:sp.unlockDepth,baseCost:sp.baseCost,bondsRaw:bonds,wispLevel:level,actualLumenCost:actual,independentRationalRound:exact,difference:actual-exact});
 eq(t.info().recruitEmpowerDiscount,Math.min(.6,.03*bonds),'original Bonds operand');
 if(level<=50)eq(actual,exact,'ordinary recruitment/Empower quote '+sp.id+' '+bonds+' '+level);
}
const fixturesPath=path.join(root,'tests/behavioral/fixtures.json'),fixtures=JSON.parse(fs.readFileSync(fixturesPath,'utf8'));
const snapshots=[];
for(const fixtureId of ['parity-early-simple','mid-game','mature-high-power','parity-auto-ascend']){
 const raw=clone(fixtures[fixtureId].save);q.set(raw);const s=clone(q.get()),info=t.info(),preview=q.prismPreview();
 const nextCosts=spirits.map(sp=>({id:sp.id,level:s.spirits[sp.id],nextLumenCost:t.spiritPrice(sp.id)}));
 const nodes=Object.fromEntries(['echo','bonds','swift','reserves'].map(id=>[id,s.nodes[id]]));
 snapshots.push({fixtureId,rawPrisms:raw.prisms,canonicalPrisms:s.prisms,refundDelta:s.prisms-raw.prisms,depth:s.depth,maxDepthEver:s.maxDepthEver,cleared:preview.cleared,benchmark:preview.benchmark,actualPreview:preview,prismstudy:s.longStudyLevels.prismstudy,riftattune:s.longStudyLevels.riftattune,nodes,lumen:s.lumen,shards:s.shards,info,nextCosts,scope:'existing public fixture projection after current canonical acceptance; affordability snapshot, not elapsed-time or unlock-time evidence'});
}
const offlineKillSamples=[];
for(const depth of [19,20,21])for(const echo of [0,3,6])for(const oldLab of [0,7])for(const kind of ['live','offline']){
 const s=fresh(depth-1);s.depth=s.enemyDepth=depth;s.enemyHp=s.enemyMaxHp=q.enemyHp(depth);s.enemyIsLuminous=false;s.nodes.echo=echo;s.longStudyLevels.riftattune=oldLab;s.lumen=s.shards=s.motes=s.sigils=0;q.set(s);
 const rate=kind==='offline'?t.info().offlineRate:1;
 const expectedLumen=Math.round(5*Math.pow(1.11,depth)*(depth%10===0?8:1))*rate;
 const expectedShard=Math.round(Math.pow(1.09,depth)*(depth%10===0?5:1))*rate;
 const result=q.kill(kind);
 eq(result.lumenGained,expectedLumen,'actual ordinary kill Lumen '+[depth,echo,oldLab,kind]);eq(result.shardGained,expectedShard,'actual ordinary kill Shards '+[depth,echo,oldLab,kind]);
 offlineKillSamples.push({depth,echo,oldLab,kind,rate,lumen:result.lumenGained,shards:result.shardGained,motes:result.motesGained,sigils:result.sigilsGained,kills:result.kills});
}
// All following models are recommendations only: they do not run in the app.
const models={
 legacy:{cost:level=>actualPrice('swift',level),tree:level=>level,threshold:Infinity,activationCost:0},
 doubleSwiftBonus:{cost:level=>actualPrice('swift',level),tree:level=>2*level,threshold:20,activationCost:200},
 softExponential110:{cost:level=>level<20?actualPrice('swift',level):exactGeometric(9976,11,10,level-20),tree:level=>level,threshold:20,activationCost:200},
 linearAfter20:{cost:level=>level<20?actualPrice('swift',level):60+6*(level-20),tree:level=>level,threshold:20,activationCost:200},
 linearAfter10:{cost:level=>level<10?actualPrice('swift',level):60+6*(level-10),tree:level=>level,threshold:10,activationCost:200}
};
const modelRows=[];
for(const cleared of [20,50,99,119,250,1000])for(const clarity of [0,1,10,20])for(const swift of [7,10,19,20,21,25,30,40,50,75]){
 const baseline=actualReward(cleared,swift,clarity);eq(baseline,reward(cleared,cleared,swift,clarity),'baseline reward independent exact oracle');
 for(const [modelName,m] of Object.entries(models)){
  if(modelName!=='legacy'&&swift<m.threshold)continue;
  const payout=reward(cleared,cleared,m.tree(swift),clarity),next=reward(cleared,cleared,m.tree(swift+1),clarity),price=m.cost(swift);
  let count=0,bundleCost=0,useful=payout;
  while(useful===payout&&count<100){bundleCost+=m.cost(swift+count);count++;useful=reward(cleared,cleared,m.tree(swift+count),clarity);}
  assert(useful>payout);
  modelRows.push({model:modelName,cleared,clarity,swift,payout,activationCost:m.activationCost,activationImmediatePrisms:payout-baseline,activationPaybackAscends:payout>baseline?Math.ceil(m.activationCost/(payout-baseline)):null,nextPrice:price,nextPayout:next,marginalPrisms:next-payout,affordNextFromZeroAscends:Math.ceil(price/payout),nextMarginalPaybackAscends:next>payout?Math.ceil(price/(next-payout)):null,firstUsefulLevel:swift+count,firstUsefulTotalPrice:bundleCost,firstUsefulReward:useful,usefulBundlePaybackAscends:Math.ceil(bundleCost/(useful-payout)),activationPlusUsefulBundlePayback:Math.ceil((m.activationCost+bundleCost)/(useful-baseline)),priceIsSafeInteger:Number.isSafeInteger(price)});
 }
}
// Fixed-depth reinvestment illustrations use an existing fixture's canonical
// balances/levels; no combat timing, unlock prediction or fresh campaign claim.
const reinvestment=[];
const mature=snapshots.find(s=>s.fixtureId==='mature-high-power');
for(const targetLevel of [20,21,30,40,50])for(const [modelName,m] of Object.entries(models)){
 let swift=mature.nodes.swift,wallet=mature.canonicalPrisms,ascends=0,spent=0,activation=false,purchases=0;
 const cleared=mature.cleared,clarity=mature.prismstudy;
 while(swift<targetLevel){
  if(modelName!=='legacy'&&!activation&&swift>=m.threshold){
   const gain=reward(cleared,cleared,swift,clarity);
   const n=Math.max(0,Math.ceil((m.activationCost-wallet)/gain));wallet+=n*gain;ascends+=n;wallet-=m.activationCost;spent+=m.activationCost;activation=true;
  }
  const price=activation?m.cost(swift):models.legacy.cost(swift);
  const gain=reward(cleared,cleared,activation?m.tree(swift):swift,clarity);
  const n=Math.max(0,Math.ceil((price-wallet)/gain));wallet+=n*gain;ascends+=n;wallet-=price;spent+=price;swift++;purchases++;
 }
 reinvestment.push({model:modelName,fixtureId:mature.fixtureId,cleared,clarity,startSwift:mature.nodes.swift,startPrisms:mature.canonicalPrisms,targetLevel,ascends,spent,finalWallet:wallet,activationPurchased:activation,purchases,scope:'fixed pure-repeat cleared94, immutable completed Clarity1, spend only on Swift and optional charter; no minutes/hours or time-to-unlock claim'});
}
const result={status:'pass',sourceSha256,observationSha256:hash(observedSource),harnessSha256:hash(fs.readFileSync(harnessPath)),oracleSha256:hash(fs.readFileSync(oraclePath)),fixturesSha256:hash(fs.readFileSync(fixturesPath)),node:process.version,checks,nodeDefs,oldPrices,legacyPriceRationalMismatches:oldPrices.filter(r=>r.difference),effects,wispCosts,wispRationalMismatches:wispCosts.filter(r=>r.difference),snapshots,offlineKillSamples,models:{activationCost:200,activationLevelCap:1,proposedUnlockMaxDepth:100,legacy:'All original prices/levels/bonuses unchanged when no new node is owned.',doubleSwiftBonus:'Counterfactual doubles only the Swift contribution (+4%/level becomes +8%/level); old prices stay. Requires extending exact Prism arithmetic/oracles; not preferred.',softExponential110:'Counterfactual owned price ceil(9976*(11/10)^(Swift-20)) for Swift>=20; remains exponential.',linearAfter20:'Candidate owned price60+6*(Swift-20) for Swift>=20; otherwise original.',linearAfter10:'Alternative owned price60+6*(Swift-10) for Swift>=10; otherwise original. Earlier threshold responds to actual mature fixture Swift6.',scope:'Design-only numerical models. Existing production reward oracle remains unchanged; no model is installed.'},modelRows,reinvestment};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'economy-measurements.json'),JSON.stringify(result,null,2)+'\n');
const brief={status:result.status,sourceSha256,checks,counts:{priceRows:oldPrices.length,offlineEffectRows:effects.length,wispCostRows:wispCosts.length,fixtureSnapshots:snapshots.length,actualOfflineKillSamples:offlineKillSamples.length,counterfactualRows:modelRows.length,reinvestmentRows:reinvestment.length},legacyPriceRationalMismatches:result.legacyPriceRationalMismatches,wispRationalMismatches:result.wispRationalMismatches,snapshots:snapshots.map(s=>({fixtureId:s.fixtureId,prisms:s.canonicalPrisms,depth:s.depth,swift:s.nodes.swift,clarity:s.prismstudy,payout:s.actualPreview.gain,rate:s.info.offlineRate})),examples:modelRows.filter(r=>r.cleared===20&&r.clarity===0&&[20,30,50].includes(r.swift)),reinvestment};
console.log(JSON.stringify(brief,null,2));
