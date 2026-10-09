#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {app,seed,clone,P,R}=require('./lab-expansion-harness.cjs');
const sourcePath=process.argv[2]||path.join(__dirname,'../../index.html'),source=fs.readFileSync(sourcePath,'utf8');
function verify(html){
 let checks=0;const eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);},ok=(v,m)=>{checks++;assert(v,m);};
 const near=(a,b,m)=>ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-11,m+': '+a+' vs '+b);
 const x=app(html),q=x.q,defs=q.expansion(),ids=defs.map(d=>d.id);
 eq(ids.length,14,'fourteen added tracks');eq(new Set(ids).size,14,'unique stable IDs');eq(q.projects().filter(n=>!n.retiredTo).length,20,'twenty purchasable Lab tracks');
 eq(q.projects().filter(n=>n.retiredTo).map(n=>n.id),['riftattune','formationstudy','prismstudy'],'old paid identities stay retired, not erased');
 const record=[];
 const discount=(v,p)=>Number((BigInt(v)*BigInt(100-p)+99n)/100n);
 const work=(d,l)=>Math.round(d.baseDurationSec*Math.pow(d.durationGrowth,l));
 const costs=(d,l)=>({lumen:Math.round(d.lumenBase*Math.pow(d.lumenGrowth,l)),shard:Math.round(d.shardBase*Math.pow(d.shardGrowth,l))});
 // Every project: named unlock, independent base curve, pure rejection, delayed
 // actual completion, exact price, cap, future queue intent and two-slot storage.
 for(const d of defs){
  ok(d.name&&d.desc&&d.labGroup,'defined UI identity '+d.id);ok(d.levelCap>0&&Number.isSafeInteger(d.levelCap),'finite positive cap');
  for(const l of [0,1,d.levelCap-1,d.levelCap,d.levelCap+1,1000000]){
   const s=seed(q);s.longStudyLevels[d.id]=l;q.set(s);const before=clone(q.get());
   eq(q.level(d.id),Math.min(l,d.levelCap),'new effect cap '+d.id);eq(q.get().longStudyLevels[d.id],l,'raw paid level retained '+d.id);q.plan(d.id);eq(q.get(),before,'plan purity');
   if(l>=d.levelCap){eq(q.plan(d.id).reason,'maxed','cap gate '+d.id);eq(q.start(d.id),false,'cap refuses payment');eq(q.get(),before,'cap is pure');continue;}
   const c=costs(d,l);eq(q.cost(d.id,l),c,'independent unmodified base price '+d.id);eq(q.duration(d.id,l),work(d,l),'independent nominal work '+d.id);
   for(const kind of ['lumen','shards']){
    const low=clone(s);low.lumen=c.lumen;low.shards=c.shard;low[kind]-=1;q.set(low);const rejected=clone(q.get());
    eq(q.start(d.id),false,'one currency short '+d.id+' '+kind);eq(q.get(),rejected,'short purchase pure '+kind);
   }
   const paid=clone(s);paid.lumen=c.lumen;paid.shards=c.shard;q.set(paid);eq(q.start(d.id),true,'exact-budget purchase '+d.id);
   eq(q.get().lumen,0,'exact Lumen debit');eq(q.get().shards,0,'exact Shard debit');eq(q.get().prisms,23,'no Prism charge');eq(q.get().comets,115,'no Comet charge');
   eq(q.get().longStudyLevels[d.id],l,'no early bonus');eq(q.get().activeStudies[0].totalDurationSec,work(d,l),'fixed paid work');eq(q.get().activeStudies[0].speedMult,1,'new level starts at1x');
   const duplicate=clone(q.get());eq(q.start(d.id),false,'no duplicate active record');eq(q.get(),duplicate,'duplicate start pure');
   q.finish(work(d,l)-.5);eq(q.get().longStudyLevels[d.id],l,'still pending');q.finish(.5);eq(q.get().longStudyLevels[d.id],l+1,'one earned level');
   q.finish(1e6);eq(q.get().longStudyLevels[d.id],l+1,'no duplicate completion');q.save();eq(x.storage.get(P),x.storage.get(R),'matching storage slots');
   const cold=app(html,x.storage);eq(cold.q.get().longStudyLevels[d.id],l+1,'cold restart retains new level');eq(cold.q.accept(cold.q.decode(cold.q.export())),cold.q.get(),'actual backup roundtrip');
  }
  const locked=seed(q);locked.maxDepthEver=d.unlockDepth-1;q.set(locked);const before=clone(q.get());eq(q.plan(d.id).reason,'locked','just below unlock '+d.id);eq(q.start(d.id),false,'locked handler');eq(q.get(),before,'locked no debit');
  const cap=seed(q);cap.longStudyLevels[d.id]=d.levelCap;cap.studyQueue[d.id]=true;cap.activeStudies=[{id:d.id,remainingSec:0,totalDurationSec:100,speedMult:2}];cap.longStudyLevels.fieldnotes=10;q.set(cap);
  const m=q.get().motes;q.finish(0);eq(q.get().longStudyLevels[d.id],d.id==='fieldnotes'?10:d.levelCap,'over-cap work grants no level');eq(q.get().motes,m,'over-cap work grants no Notes reward');q.queue();ok(!q.get().activeStudies.some(a=>a.id===d.id),'maxed queue never starts');ok(q.get().studyQueue[d.id],'maxed queue intent retained');
  record.push({id:d.id,cap:d.levelCap,unlock:d.unlockDepth,base:costs(d,0),work:work(d,0)});
 }
 // Defaults never start new spending or erase historically paid state.
 {
  const s=seed(q);ids.forEach(id=>{delete s.longStudyLevels[id];delete s.studyQueue[id];delete s.studyUseMotes[id];delete s.studySpeedTargets[id];});
  s.nodes.echo=10;s.nodes.swift=7;s.research.charge=28;s.longStudyLevels.riftattune=4;s.longStudyLevels.formationstudy=5;s.longStudyLevels.prismstudy=6;
  s.owned={autoascend:true,comettrials:true,rifttrail:true,starfallcrest:true};s.activeStudies=[{id:'riftattune',remainingSec:13.25,totalDurationSec:200,speedMult:3}];q.set(s);
  ids.forEach(id=>{eq(q.get().longStudyLevels[id],0,'missing earned level starts at0');eq(q.get().studyQueue[id],false,'no inferred queue');eq(q.get().studyUseMotes[id],false,'no inferred Mote spend');});
  for(const k of ['lumen','shards','motes','prisms','sigils','comets','nodes','research','owned','activeStudies'])eq(q.get()[k],s[k],'old value preserved '+k);
  const stable=clone(q.get());q.set(stable);eq(q.get(),stable,'idempotent canonicalization');q.save();eq(app(html,x.storage).q.get(),stable,'old saved state retained with defaults');
  q.ascend();for(const k of ['nodes','research','longStudyLevels','owned','activeStudies'])eq(q.get()[k],stable[k],'Ascend retains paid '+k);
 }
 // Extra slots are explicitly purchased, never an accident of catalog length.
 for(const depth of [1,14,15,25,39,40,59,60,89,90,250])for(const levels of [0,1,2,1000000]){
  const s=seed(q);s.maxDepthEver=depth;s.longStudyLevels.labcapacity=levels;q.set(s);eq(q.slots(),(depth<40?2:depth<60?3:depth<90?4:5)+Math.min(2,levels),'capacity curve');
 }
 {
  const s=seed(q);s.longStudyLevels.labcapacity=2;q.set(s);
  const seven=['wispascend','guardmastery','shardstudy','lumenstudy','motestudy','procurement','catalysis'];seven.forEach(id=>eq(q.start(id),true,'fills earned seventh slot'));
  eq(q.start('bossledger'),false,'eighth slot rejected');const active=clone(q.get().activeStudies);q.save();eq(app(html,x.storage).q.get().activeStudies,active,'all seven paid records survive cold load');eq(q.accept(q.decode(q.export())).activeStudies,active,'all seven survive import');
 }
 // Discounts are exact for whole prices, including safe-integer boundaries.
 for(const v of [1,14,26,99,100,101,473,1200,8999,100000000001,Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER])for(let p=0;p<=20;p+=2)eq(q.discount(v,p),Math.max(1,discount(v,p)),'independent integer discount '+v+'/'+p);
 {
  const s=seed(q);q.set(s);q.start('guardmastery');const running=clone(q.get().activeStudies);
  q.get().longStudyLevels.procurement=10;q.get().longStudyLevels.focusprotocol=5;q.get().longStudyLevels.curriculum=3;q.get().longStudyLevels.labcapacity=2;
  eq(q.get().activeStudies,running,'new research never rewrites purchased work');
  eq(q.cost('guardmastery',0),{lumen:480,shard:32},'future prices reduced20%');eq(q.cost('procurement',1),costs(defs.find(n=>n.id==='procurement'),1),'procurement cannot discount itself');
  const raw=seed(q);raw.longStudyLevels.procurement=10;raw.lumen=Number.MAX_VALUE;q.set(raw);const before=clone(q.get());eq(q.start('bossledger'),false,'unrepresentable price refused');eq(q.get(),before,'unsafe payment pure');
  raw.lumen=1e9;raw.shards=Number.MAX_VALUE;q.set(raw);eq(q.start('bossledger'),false,'unrepresentable Shard price refused');
 }
 // Focus/breadth discounts snapshot at each actual start; active work is immutable.
 {
  const s=seed(q);s.longStudyLevels.labcapacity=2;s.longStudyLevels.focusprotocol=5;q.set(s);
  eq(q.duration('bossledger',0),504,'six empty slots save30% work');eq(q.duration('focusprotocol',0),1200,'focus excludes itself');
  q.start('bossledger');eq(q.get().activeStudies[0].totalDurationSec,504,'frozen first start');eq(q.duration('luminousdistill',0),720,'one occupied slot reduces saving to25%');
  q.start('luminousdistill');eq(q.get().activeStudies[0].totalDurationSec,504,'second start cannot stretch earlier work');
  const breadth=seed(q);ids.forEach(id=>breadth.longStudyLevels[id]=id==='curriculum'?3:1);breadth.longStudyLevels.focusprotocol=0;q.set(breadth);eq(q.curriculum(),10,'breadth capped at ten subjects');eq(q.duration('bossledger',0),504,'breadth30% work reduction');eq(q.duration('curriculum',0),1500,'breadth excludes itself');
 }
 // One Notes reward per genuine completion, not per load, render or close.
 {
  const s=seed(q);s.longStudyLevels.fieldnotes=3;s.activeStudies=[{id:'bossledger',remainingSec:.5,totalDurationSec:20,speedMult:1}];q.set(s);const before=q.get().motes;
  q.finish(.25);eq(q.get().motes,before,'pending work no reward');q.finish(.25);eq(q.get().motes,before+6,'earned completion Motes');q.finish(100);eq(q.get().motes,before+6,'repeat finish no reward');q.save();eq(app(html,x.storage).q.get().motes,before+6,'restart no reward');
  const a=seed(q);a.longStudyLevels.fieldnotes=3;a.activeStudies=[{id:'bossledger',remainingSec:.5,totalDurationSec:20,speedMult:1}];q.set(a);const sum=q.advance(1,{kind:'live',clockStartMs:a.lastSeen});eq(sum.motesGained,6,'authoritative summary accounts for Notes Motes');eq(q.get().motes,a.motes+6,'authoritative wallet agrees');
  a.activeStudies=[{id:'fieldnotes',remainingSec:0,totalDurationSec:20,speedMult:1}];q.set(a);q.finish(0);eq(q.get().motes,a.motes,'no self-completion Notes reward');
 }
 // Manual/queued speed pays its full discounted tier each active level.
 {
  const s=seed(q);s.longStudyLevels.catalysis=10;q.set(s);q.start('bossledger');const cost=discount(26,20);eq(q.speedCost(2),cost,'Mote price20% lower');q.get().motes=cost-1;const before=clone(q.get());eq(q.speed('bossledger',2),false,'one Mote short');eq(q.get(),before,'speed rejection pure');q.get().motes=cost;eq(q.speed('bossledger',2),true,'exact discounted speed purchase');eq(q.get().motes,0,'full tier debited');eq(q.get().activeStudies[0].speedMult,2,'paid speed saved');eq(q.speed('bossledger',1.5),false,'no downgrade');
  q.get().motes=100;q.get().studyUseMotes.bossledger=true;q.get().studySpeedTargets.bossledger=3;const scheduled=q.speeds();eq(scheduled.studyMotesSpent,discount(60,20),'auto uses same discount');eq(q.get().activeStudies[0].speedMult,3,'auto speed credited');
 }
 // All material upgrades touch only their specific costs/requirements, not power.
 {
  const s=seed(q);s.spirits.ember=50;s.heroRarity.ember=2;s.activeParty=['ember'];q.set(s);const sp=q.sp('ember'),before={module:q.moduleCost(sp,5),rarity:q.rarityCost(sp,2),ultimate:q.ultimateCost(sp),req:q.rarityReq(2),res:q.resonanceCost(),burst:q.burst(sp,50),power:q.power(),tap:q.tap(),prism:q.preview(21).gain};
  for(const id of ['rarityappraisal','modulefabrication','ultimateanalysis','resonantefficiency','adaptivegrowth'])q.get().longStudyLevels[id]=1000000;
  eq(q.moduleCost(sp,5),{lumen:discount(before.module.lumen,20),shard:discount(before.module.shard,20)},'Module materials only');eq(q.rarityCost(sp,2),{lumen:before.rarity.lumen,shard:discount(before.rarity.shard,20)},'Rarity Shards only');eq(q.ultimateCost(sp),discount(before.ultimate,20),'Ultimate Sigils only');eq(q.rarityReq(2),Math.max(1,before.req-5),'Rarity level requirement');eq(q.resonanceCost(),15,'Resonate25 to15');
  eq([q.burst(sp,50),q.power(),q.tap(),q.preview(21).gain],[before.burst,before.power,before.tap,before.prism],'material research cannot add combat or Prism multipliers');
  q.get().wispModules.ember=0;const c=q.moduleCost(sp,0);q.get().lumen=c.lumen;q.get().shards=c.shard;q.module(sp);eq(q.get().wispModules.ember,1,'actual discounted Module purchase');eq([q.get().lumen,q.get().shards],[0,0],'actual Module debit');
  q.get().heroRarity.ember=0;q.get().spirits.ember=q.rarityReq(0);const rc=q.rarityCost(sp,0);q.get().lumen=rc.lumen;q.get().shards=rc.shard;q.rarity(sp);eq(q.get().heroRarity.ember,1,'actual discounted Rarity at lower gate');eq([q.get().lumen,q.get().shards],[0,0],'actual Rarity debit');
  q.get().heroRarity.ember=5;q.get().sigils=q.ultimateCost(sp);q.ultimate(sp);eq(q.get().wispUltimate.ember,true,'actual Ultimate unlock');eq(q.get().sigils,0,'actual Ultimate debit');
  Object.keys(q.get().wispUltimate).forEach(id=>q.get().wispUltimate[id]=true);q.get().sigils=15;q.get().heroResource.ember=0;eq(q.resonate(sp),true,'actual cheaper Resonate');eq(q.get().sigils,0,'actual Resonate debit');eq(q.get().heroResource.ember,100,'refill amount unchanged');
 }
 // Encounter-specific effects and exact actual kill payouts.
 for(const depth of [10,19,20,39,60,119,120])for(const luminous of [false,true])for(const level of [0,1,5,10,1000000]){
  const s=seed(q);s.depth=depth;s.enemyDepth=depth;s.enemyIsLuminous=luminous;s.longStudyLevels.bossledger=level;s.longStudyLevels.luminousdistill=level;s.longStudyLevels.sigilcartography=level;q.set(s);
  const baseL=Math.round(5*Math.pow(1.11,depth)*(depth%10===0?8:1)),baseS=Math.round(Math.pow(1.09,depth)*(depth%10===0?5:1)),p=depth%10===0?Math.min(10,level)*5:luminous?Math.min(10,level)*10:0;
  const bonus=v=>Number((BigInt(v)*BigInt(p)+50n)/100n);const L=baseL+bonus(baseL),S=baseS+bonus(baseS);
  eq(q.lumen(depth,luminous),L,'conditional Lumen oracle');eq(q.shards(depth,luminous),S,'conditional Shard oracle');
  const sum=q.kill();eq(sum.lumenGained,L,'authoritative kill Lumen');eq(sum.shardGained,S,'authoritative kill Shards');eq(sum.sigilsGained,depth%10===0?Math.floor(depth/10)+Math.min(5,level):0,'boss-only Sigils');
 }
 // Luminous batching and earliest-affordable economy boundaries use one policy.
 for(const count of [1,2,5,10,31,100,1000])for(const first of [false,true])for(const rate of [1,.7]){
  const s=seed(q);s.depth=19;s.enemyDepth=19;s.riftMode='farm';s.farmDepth=19;s.farmReturnDepth=20;s.nodes.echo=rate===1?6:0;s.luminousAccum=.37;s.enemyIsLuminous=first;s.longStudyLevels.luminousdistill=3;s.lumen=0;s.shards=0;q.set(s);
  const chance=q.chance(19),luminous=(first?1:0)+Math.floor(.37+(count-1)*chance+1e-12);
  const L=q.lumen(19)*rate*count+(q.lumen(19,true)-q.lumen(19))*rate*luminous;
  const S=q.shards(19)*rate*count+(q.shards(19,true)-q.shards(19))*rate*luminous;
  const cost={lumen:L,shard:S};let earliest=1;
  while(earliest<count){const n=(first?1:0)+Math.floor(.37+(earliest-1)*chance+1e-12);if(q.lumen(19)*rate*earliest+(q.lumen(19,true)-q.lumen(19))*rate*n>=L&&q.shards(19)*rate*earliest+(q.shards(19,true)-q.shards(19))*rate*n>=S)break;earliest++;}
  eq(q.boundary(cost,rate),earliest,'first affordable kill counts Luminous material rewards');
  const sum=q.batch(count,rate===1?'live':'offline');near(sum.lumenGained,L,'Farm total Lumen');near(sum.shardGained,S,'Farm total Shards');eq(sum.luminousKills,luminous,'actual Luminous count');
 }
 // Identical chronology for live/offline at 100% offline rate, with every new
 // research acquired, simultaneous completions, queues and paid Mote speeds.
 for(const kind of ['push','farm']){
  const s=seed(q);s.longStudyLevels.labcapacity=2;ids.filter(id=>id!=='labcapacity').forEach(id=>s.longStudyLevels[id]=1);s.nodes.echo=6;
  s.depth=19;s.enemyDepth=19;s.enemyHp=s.enemyMaxHp=100;s.spirits.ember=20;s.activeParty=['ember'];s.luminousAccum=.9;s.enemyIsLuminous=true;
  // Return21 is not a retryable boss; preserve the existing offline retry policy.
  if(kind==='farm'){s.riftMode='farm';s.farmDepth=19;s.farmReturnDepth=21;}
  s.activeStudies=[{id:'procurement',remainingSec:2,totalDurationSec:20,speedMult:2},{id:'bossledger',remainingSec:1,totalDurationSec:10,speedMult:1}];s.studyQueue.procurement=true;s.studyQueue.bossledger=true;s.studyUseMotes.bossledger=true;s.studySpeedTargets.bossledger=2;
  q.set(s);const live=q.advance(60,{kind:'live',clockStartMs:s.lastSeen});const actual=clone(q.get());
  q.set(s);const offline=q.advance(60,{kind:'offline',clockStartMs:s.lastSeen});eq(q.get(),actual,'exact live/offline state '+kind);
  for(const key of ['lumenGained','shardGained','motesGained','sigilsGained','studiesStarted','completedStudies','studyMotesSpent'])eq(offline[key],live[key],'same chronology summary '+kind+' '+key);
 }
 // Actual yielded offline transaction must preserve paid research on failure.
 for(const failure of ['none','primary','recovery']){
  const y=app(html),r=y.q,s=seed(r);s.activeStudies=[{id:'bossledger',remainingSec:.5,totalDurationSec:20,speedMult:1}];s.longStudyLevels.fieldnotes=3;s.enemyHp=s.enemyMaxHp=1e30;r.set(s);r.save();const before=clone(r.get());y.clock(s.lastSeen+60000);y.fail(failure==='primary',failure==='recovery');let error,result;r.offline((v,e)=>{result=v;error=e;});y.drain();
  if(failure==='primary'){ok(error,'failed write reports rollback');eq(r.get(),before,'failed transaction preserves complete state');y.fail(false,false);r.offline((v,e)=>{result=v;error=e;});y.drain();}
  checks++;assert.ifError(error);eq(r.get().longStudyLevels.bossledger,1,'offline completion once');eq(r.get().motes,s.motes+6,'offline Notes reward once');eq(result.motesEarned,6,'offline summary Notes reward');const accepted=clone(r.get());eq(r.offline(),null,'return window consumed');eq(r.get(),accepted,'no repeated completion or Notes reward');
 }
 return {checks,projects:record.length,projectCases:record,scope:'complete production logic; presentation stubbed, browser and native Android are separate'};
}
const result=verify(source),negatives=[];
if(process.argv.includes('--negative')){
 const pairs=[
  ['lost-capacity',"return base+labExpansionLevel('labcapacity');",'return base;'],
  ['free-start','state.lumen-=plan.cost.lumen;','state.lumen-=0;'],
  ['early-level','state.activeStudies.push({id:plan.node.id,','state.longStudyLevels[plan.node.id]++;state.activeStudies.push({id:plan.node.id,'],
  ['lost-seventh-paid-record','}).slice(0,5+Math.min(2,out.longStudyLevels.labcapacity||0)).map(function(active){','}).slice(0,5).map(function(active){'],
  ['double-notes','if(moteBonus) state.motes+=moteBonus;','if(moteBonus) state.motes+=2*moteBonus;'],
  ['no-procurement',"var discount=node.id==='procurement'?0:2*labExpansionLevel('procurement');",'var discount=0;'],
  ['missed-luminous-purchase',"if(!labExpansionLevel('luminousdistill') || upper<=1 || !Number.isSafeInteger(upper)) return upper;",'return upper;'],
  ['erased-old-value','out.research[node.id] = nonNegativeInt(research[node.id],fresh.research[node.id]);',"out.research[node.id] = node.id==='charge'?0:nonNegativeInt(research[node.id],fresh.research[node.id]);"]
 ];
 for(const [name,a,b] of pairs){assert.equal(source.split(a).length,2,'causal anchor '+name);let caught;try{verify(source.replace(a,b));}catch(e){if(e instanceof assert.AssertionError)caught=e.message;else throw e;}assert(caught,'mutation must fail an assertion: '+name);negatives.push({name,caught});}
}
console.log(JSON.stringify({status:'pass',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),...result,negativeControls:negatives}));
