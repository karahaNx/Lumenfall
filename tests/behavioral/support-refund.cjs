/* Independent BigInt oracle for the WebView60-compatible production migration. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),file=process.argv[2]||path.join(root,'index.html'),html=fs.readFileSync(file,'utf8'),script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const storage=new Map(),document={readyState:'loading',addEventListener(){}},window={addEventListener(){}};
const bridge=`renderResearch=renderSideStats=updateBattleFast=renderSpirits=renderLongStudies=function(){};
window.refundQa={fresh:freshState,set:function(s){state=acceptPersistedState(s);},get:function(){return state;},normalize:acceptPersistedState,save:saveState,load:loadState,backup:currentSaveBackup,decode:decodeSaveBackup,spend:spendShards,can:canSpendShards,shortfall:shardShortfall,cycle:abilityCycleSeconds,plan:function(id,n){return getResearchBuyPlan(RESEARCH.find(function(x){return x.id===id;}),n);},buy:function(id,n){labMultiplier=n;buyResearch(RESEARCH.find(function(x){return x.id===id;}));},queue:autoLabQueueTick,simulate:advanceAuthoritativeTime,ascend:applyAscendMutation};`;
const context=vm.createContext({window,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},console,Date:class extends Date {static now(){return 2000000000000;}},setTimeout(){},clearTimeout(){}});
vm.runInContext(script.replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){"),context);
const a=window.refundQa,copy=x=>JSON.parse(JSON.stringify(x));let checks=0;const records=[];
function eq(x,y,m){checks++;assert.deepEqual(x,y,m);}
function value(s){return BigInt(Math.floor(s.shards))+BigInt(s.exactRefundCredits.shards);}
function refund(level){let total=0n,prices=[],unpricedFrom=0;for(let k=10;k<level;k++){const price=Math.ceil(30*1.55**k);if(!Number.isFinite(price)){unpricedFrom=k+1;break;}total+=BigInt(price);prices.push(price);}return {total,prices,unpricedFrom};}
for(const level of [0,9,10,11,25,60,100,1700,Number.MAX_SAFE_INTEGER])for(const wallet of [0,5000,3.5,1e300]){
 const s=copy(a.fresh());s.research.charge=level;s.shards=wallet;s.sigils=1000;s.maxDepthEver=101;s.heroRarity.tide=s.heroRarity.aurora=5;s.wispUltimate.tide=s.wispUltimate.aurora=true;s.buffUntil=2000000008000;s.buffMult=1.5;s.supportBuffs={version:1,sources:{tide:{until:2000000008000,mult:1.5}}};
 a.set(s);const out=copy(a.get()),oracle=refund(level);
 eq(value(out)-BigInt(Math.floor(wallet)),oracle.total,'exact original-curve value '+level+'/'+wallet);
 eq(out.shards%1,wallet%1,'fractional wallet preserved');eq(out.research.charge,level,'raw purchase history');eq(a.cycle(),6/(1+.08*Math.min(10,level)),'capped effect');
 eq(out.wispUltimate,s.wispUltimate,'paid Ultimates stay owned');eq(out.sigils,1000,'no resell/refund still-owned Ultimate');eq(out.supportBuffs,s.supportBuffs,'earned deadline retained');eq(out.buffUntil,s.buffUntil,'opaque deadline retained');
 if(level>10){const receipt=out.feedbackMigration.receipts['forge.charge'];eq(copy(receipt.amounts.shards),oracle.prices,'individual prices');eq(receipt.unpricedFrom,oracle.unpricedFrom,'finite purchase boundary');}
 for(let i=0;i<3;i++){a.set(copy(a.get()));eq(copy(a.get()),out,'repeated normalize no re-credit');}
 eq(a.save(),true,'primary+recovery canonical save');const saved=copy(a.get());eq(JSON.parse(storage.get('lumenfall_save_recovery_v1')),saved,'same receipt and credits in recovery');
 a.set(a.decode(a.backup()));eq(value(a.get()),value(out),'canonical backup no duplicate credit');
 storage.set('lumenfall_save_v2','invalid');eq(copy(a.load()),saved,'recovery keeps exact value');
 // A complete older backup replaces state; it cannot add to current balances.
 a.set(a.decode('LUMENFALL1:'+encodeURIComponent(JSON.stringify(s))));eq(value(a.get()),value(out),'old backup replaces snapshot, one refund');
 records.push({level,wallet,refund:oracle.total.toString(),exactCredit:out.exactRefundCredits.shards,unpricedFrom:oracle.unpricedFrom});
}
// Tiny retained refund beside huge wallet is actually consumed by real purchases.
let s=copy(a.fresh());s.research.charge=11;s.shards=1e300;s.maxDepthEver=101;s.lumen=1e12;a.set(s);
let before=copy(a.get()),p=a.plan('arcanecal',1);eq(p.affordable,true,'refund-funded handler available');a.buy('arcanecal',1);let after=copy(a.get());eq(after.research.arcanecal,1,'production handler');eq(BigInt(before.exactRefundCredits.shards)-BigInt(after.exactRefundCredits.shards),BigInt(p.cost.shard),'exact credit spent beside huge wallet');eq(after.shards,1e300,'large wallet preserved');
// Huge exact credit can pay a small price without subtraction rounding to zero.
s=copy(a.fresh());s.research.charge=1700;s.shards=0;s.maxDepthEver=101;s.lumen=1e300;a.set(s);before=copy(a.get());eq(a.spend(7),true,'huge refund spendable');eq(value(a.get()),value(before)-7n,'huge credit exact small debit');
// Wallet/credit combination preserves fractional earned Shards and rejects overspend.
s=copy(a.fresh());s.shards=3.5;s.exactRefundCredits.shards='7';a.set(s);eq(a.can(10),true,'combined whole Shards');eq(a.spend(10),true,'combined debit');eq(a.get().shards,.5,'fractional earned value');eq(a.get().exactRefundCredits.shards,'0','credit debit');before=copy(a.get());eq(a.spend(1),false,'cannot overspend');eq(copy(a.get()),before,'rejection pure');
for(const bad of [null,-1,'-10','Infinity','9'.repeat(313),{}]){s=copy(a.fresh());s.exactRefundCredits.shards=bad;a.set(s);eq(a.get().exactRefundCredits.shards,'0','malformed credit');}
// Real queue/live/offline transitions consume migrated value identically.
s=copy(a.fresh());s.research.charge=25;s.researchQueue.arcanecal=true;s.maxDepthEver=101;s.depth=121;s.lumen=1e9;s.enemyDepth=121;s.enemyHp=s.enemyMaxHp=1e300;s.lastSeen=2000000000000;Object.keys(s.empowerQueue).forEach(k=>s.empowerQueue[k]=false);
a.set(s);const startValue=value(a.get());a.queue();after=copy(a.get());eq(after.research.arcanecal>0,true,'refund funds queued upgrade');eq(value(after)<startValue,true,'queue actually paid');
a.set(s);a.simulate(1,{kind:'live',visual:false,clockStartMs:s.lastSeen});const live=copy(a.get());a.set(s);a.simulate(1,{kind:'offline',visual:false,clockStartMs:s.lastSeen});eq(copy(a.get()),live,'migration/automation live-offline');
// A rounded display total cannot create a zero-time economy boundary.
s=copy(a.fresh());s.exactRefundCredits.shards='999999999999999999';a.set(s);eq(a.can(1e18),false,'exact affordability below rounded total');eq(a.shortfall(1e18),1,'one real Shard reward still required');eq(a.shortfall(Infinity),Infinity,'unrepresentable prices remain unavailable');
// Shared namespace prevents a second refund when the coordinated bundle lands.
s=copy(a.fresh());s.research.charge=25;s.feedbackMigration.receipts['forge.charge']={from:10,to:25,unpricedFrom:0,amounts:{shards:refund(25).prices}};a.set(s);eq(value(a.get()),0n,'existing shared receipt not re-awarded');
const result={status:'pass',checks,cases:records.length,sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),records};if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,checks,cases:records.length,sourceSha256:result.sourceSha256}));
