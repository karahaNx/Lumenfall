window.__coreChecks=function(){
 const c=window.__core,records=[];let checks=0;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const ok=(v,msg)=>{checks++;if(!v)throw Error(msg);};
 const eq=(a,b,msg)=>ok(JSON.stringify(a)===JSON.stringify(b),msg);
 const near=(a,b,msg)=>ok(Number.isFinite(a)&&Math.abs(a-b)<1e-7,msg+' ('+a+' != '+b+')');
 const paid=(s,id,work=1000,speed=1)=>{s.activeStudies.push({id,remainingSec:work,totalDurationSec:Math.max(work,1000),speedMult:speed});s.studyUseMotes[id]=true;s.studySpeedTargets[id]=3;return s;};
 const active=(r,id)=>r.state.activeStudies.find(x=>x.id===id);
 const group=(name,fn)=>{const start=checks;try{records.push({name,status:'PASS',checks:0,detail:fn()});records.at(-1).checks=checks-start;}catch(e){records.push({name,status:'FAIL',checks:checks-start,error:e.message,stack:e.stack});}};
 group('normalization-shapes-strict-types-purity-and-idempotence',()=>{
  let s=paid(c.seed(),'guardmastery',217,8);s.motes=1500;
  const before=c.raw(),runtime=c.get();let combinations=0;
  const flags=[true,false,'true','false',1,0,null,undefined];
  const targets=[1.5,2,3,4,5,6,7,8,'3',0,1,9,NaN,Infinity,-Infinity,null,{},[]];
  for(const flag of flags)for(const target of targets){
   const x=clone(s);x.studyUseMotes={guardmastery:flag};x.studySpeedTargets={guardmastery:target};
   const original=structuredClone(x),n=c.normalize(x);
   ok(Object.is(x.studySpeedTargets.guardmastery,original.studySpeedTargets.guardmastery)||JSON.stringify(x.studySpeedTargets)===JSON.stringify(original.studySpeedTargets),'input not mutated');
   const valid=typeof target==='number'&&[1.5,2,3,4,5,6,7,8].includes(target);
   ok(n.studyUseMotes.guardmastery===(flag===true&&valid),'strict boolean/target conjunction');
   ok(n.studySpeedTargets.guardmastery===(valid?target:8),'invalid target defaults to paid snapshot');
   eq(n.activeStudies,s.activeStudies,'paid work snapshots retained');
   ok(n.motes===1500,'normalizer never spends');eq(c.normalize(n),n,'normalizer idempotent');combinations++;
  }
  for(const map of [null,[],true,false,13,'true',undefined]){
   const x=clone(s);x.studyUseMotes=map;x.studySpeedTargets=map;
   const n=c.accept(x,'core-old-malformed');ok(Object.values(n.studyUseMotes).every(v=>v===false),'malformed map OFF');
   ok(n.studySpeedTargets.guardmastery===8&&n.motes===1500,'malformed map retains paid default without debit');
  }
  const old=clone(s);delete old.studyUseMotes;delete old.studySpeedTargets;delete old.schemaVersion;
  const legacy=c.accept(old,'core-schema0');ok(legacy.schemaVersion===1&&legacy.studySpeedTargets.guardmastery===8&&!legacy.studyUseMotes.guardmastery,'real v0 migration is OFF');
  const stringWork=clone(s);stringWork.activeStudies=[{id:'guardmastery',remainingSec:'210.5',totalDurationSec:'300.75',speedMult:'4'}];
  const originalStringWork=clone(stringWork);Object.freeze(stringWork.activeStudies[0]);Object.freeze(stringWork.activeStudies);Object.freeze(stringWork);
  const numeric=c.normalize(stringWork);eq(stringWork,originalStringWork,'frozen input and string paid snapshot are not mutated');
  eq(numeric.activeStudies,[{id:'guardmastery',remainingSec:210.5,totalDurationSec:300.75,speedMult:4}],'numeric paid work normalization writes a new record');
  ok(numeric.motes===1500,'string paid snapshot normalization never spends');
  eq(c.normalize(numeric),numeric,'numeric normalized paid snapshot idempotent');
  const malicious=clone(s);malicious.studyUseMotes=JSON.parse('{"__proto__":{"polluted":true},"constructor":true,"unknown":true}');malicious.studySpeedTargets=JSON.parse('{"__proto__":{"polluted":8},"constructor":8,"unknown":8}');
  const clean=c.accept(malicious,'core-prototype-ids');eq(Object.keys(clean.studyUseMotes),c.ids(),'only known intent IDs');eq(Object.keys(clean.studySpeedTargets),c.ids(),'only known target IDs');ok(!({}).polluted&&Object.values(clean.studyUseMotes).every(v=>v===false),'prototype IDs cannot activate/pollute');
  malicious.studyUseMotes=Object.create({guardmastery:true});malicious.studySpeedTargets=Object.create({guardmastery:3});
  ok(!c.accept(malicious,'core-inherited').studyUseMotes.guardmastery,'canonical cloning strips inherited intent');
  eq(c.get(),runtime,'normalizer keeps current runtime');eq(c.raw(),before,'normalizer keeps both saves');
  return {combinations,oldSchema:0,paidSnapshot:s.activeStudies[0],motes:1500};
 });
 group('all-tier-exact-and-under-prices-independent-numeric-work',()=>{
  const tiers=[1.5,2,3,4,5,6,7,8],prices=[14,26,60,110,176,258,357,473],samples=[];
  for(let i=0;i<tiers.length;i++)for(const extra of [-1,0]){
   const s=paid(c.seed(),'riftattune',991);s.studySpeedTargets.riftattune=tiers[i];s.motes=prices[i]+extra;c.set(s);
   const r=c.run(2.25,'live',undefined,0),a=active(r,'riftattune'),bought=extra===0;
   ok(r.summary.studySpeedPurchases===(bought?1:0),'one full-tier purchase or wait');ok(r.summary.studyMotesSpent===(bought?prices[i]:0),'full constant oracle price');
   ok(r.state.motes===(bought?0:prices[i]-1),'exact balance');ok(a.speedMult===(bought?tiers[i]:1),'no cheaper fallback');
   near(a.remainingSec,991-2.25*(bought?tiers[i]:1),'actual earned work');
   samples.push({tier:tiers[i],startMotes:s.motes,endMotes:r.state.motes,work:a.remainingSec});
  }
  return samples;
 });
 group('independent-toggle-product-manual-target-changes-repeat-and-off',()=>{
  const matrix=[];
  for(const queue of [false,true])for(const on of [false,true]){
   let s=c.seed();s.studyQueue.riftattune=queue;s.studyUseMotes.riftattune=on;s.studySpeedTargets.riftattune=3;s.motes=120;c.set(s);
   let r=c.run(0,'live',undefined,0);ok(!!active(r,'riftattune')===queue,'only Study Queue starts');ok(r.summary.studySpeedPurchases===(queue&&on?1:0),'ON/OFF x Queue');
   if(!queue){ok(c.start('riftattune'),'manual start works');r=c.run(0,'live',undefined,0);ok(active(r,'riftattune').speedMult===(on?3:1),'Motes independently covers manual start');}
   matrix.push({queue,on,active:active(r,'riftattune'),motes:r.state.motes});
  }
  let s=paid(c.seed(),'riftattune',900,4);s.motes=357;s.studyUseMotes.riftattune=false;c.set(s);
  ok(!c.manual('riftattune',3),'lower manual target never downgrades');ok(c.manual('riftattune',7),'manual higher speed pays');let r={state:c.get()};ok(r.state.motes===0&&r.state.studySpeedTargets.riftattune===7&&!r.state.studyUseMotes.riftattune,'manual remembers without enabling');
  s=r.state;s.studyUseMotes.riftattune=true;s.studySpeedTargets.riftattune=2;s.motes=473;c.set(s);r=c.run(1,'live',undefined,0);ok(active(r,'riftattune').speedMult===7&&r.state.motes===473,'lower saved target no downgrade/debit');
  s=paid(c.seed(),'riftattune',3,3);s.studyQueue.riftattune=true;s.motes=60;c.set(s);r=c.tail(2);
  ok(r.summary.studySpeedPurchases===1&&r.summary.studyMotesSpent===60&&r.state.longStudyLevels.riftattune===1,'repeat pays60 on new level');near(active(r,'riftattune').remainingSec,384-3,'new level only post-completion work');
  s=r.state;s.studyUseMotes.riftattune=false;s.studyQueue.riftattune=true;s.motes=60;c.set(s);r=c.tail(128);
  ok(r.summary.studySpeedPurchases===0&&r.state.motes===60&&active(r,'riftattune').speedMult===1,'OFF preserves paid work until next level then1x');
  return {matrix,repeatSnapshot:r.state.activeStudies};
 });
 group('shared-budget-mixed-prices-and-reversed-active-ui-order',()=>{
  const details=[];
  for(const reverse of [false,true]){
   let s=paid(paid(paid(c.seed(),'riftattune',3),'guardmastery',70),'wispascend',999);
   s.studySpeedTargets.wispascend=4;s.studySpeedTargets.guardmastery=3;s.studySpeedTargets.riftattune=2;s.motes=136;
   if(reverse)s.activeStudies.reverse();c.set(s);const r=c.run(0,'live',undefined,0);
   eq(r.summary.timeline.filter(e=>e.type==='studySpeed').map(e=>[e.detail.id,e.detail.cost]),[['wispascend',110],['riftattune',26]],'catalogue order skips unaffordable target, never cheaper fallback');
   ok(active(r,'guardmastery').speedMult===1&&r.state.motes===0,'budget respects prices despite soonest completion');details.push(r);
  }
  return details;
 });
 const farm=(options={})=>{
  const s=paid(c.seed(),'riftattune',3000);s.depth=s.enemyDepth=s.farmDepth=23;s.farmReturnDepth=24;s.riftMode='farm';s.enemyMaxHp=c.hp(23);s.enemyHp=s.enemyMaxHp*.27;s.enemyIsLuminous=false;s.luminousAccum=.413;s.motes=166;s.studySpeedTargets.riftattune=5;
  return Object.assign(s,options);
 };
 // Discrete spawn-by-spawn oracle: no production boundary helper/closed formula.
 const oracle=(s,targetPrice,chance,reward)=>{
  let balance=s.motes,accum=s.luminousAccum,flag=s.enemyIsLuminous,kills=0;
  while(balance<targetPrice&&kills<2000){kills++;if(flag)balance+=reward;accum+=chance;flag=accum>=1;if(flag)accum-=1;}
  return {kills,balance,time:(.27+kills-1)/13};
 };
 group('actual-reward-boundaries-rounded-bonuses-partial-enemy-and-small-deficit',()=>{
  const records=[];
  for(const first of [false,true])for(const accum of [.073,.413,.881])for(const deficit of [1,10,23]){
   const s=farm({enemyIsLuminous:first,luminousAccum:accum,motes:176-deficit});
   // depth23 base reward round(3.875)=4; chance .07; reward is actual, not average.
   const o=oracle(s,176,.07,4);c.set(s);const r=c.run(o.time+.013,'offline',undefined,s.enemyMaxHp*13);
   const e=r.summary.timeline.find(e=>e.type==='studySpeed');ok(!!e,'pending target funded');near(e.elapsedSec,o.time,'actual nth reward boundary');near(active(r,'riftattune').remainingSec,3000-o.time-.013*5,'post-payment work only');
   ok(r.state.motes===o.balance-176&&r.summary.studySpeedPurchases===1,'rounded rewards and one full debit');records.push({first,accum,deficit,oracle:o,purchase:e,work:active(r,'riftattune').remainingSec});
  }
  const s=farm();s.longStudyLevels.motestudy=7;s.spirits.tide=1;s.activeParty=['tide'];s.wispModules.tide=3;s.research.luminoustracking=5;s.motes=162;
  // First rounding: round(3.875*1.7)=7; support module bonus .15 => round(7*1.15)=8. Tracking adds .025 => chance .095.
  const o=oracle(s,176,.095,8);c.set(s);let r=c.run(o.time+.003,'offline',undefined,s.enemyMaxHp*13),e=r.summary.timeline.find(x=>x.type==='studySpeed');near(e.elapsedSec,o.time,'two-stage actual rounding and changed chance');ok(r.summary.motesGained===16&&r.state.motes===2,'actual8+8 reward and176 debit');records.push({case:'rounded-study-support-tracking',oracle:o,purchase:e,reward:16});
  const tiny=farm({motes:176-1e-11,enemyIsLuminous:true});c.set(tiny);r=c.run(.27/13,'live',undefined,tiny.enemyMaxHp*13);
  ok(r.summary.studySpeedPurchases===1&&r.summary.kills===1&&r.summary.iterations<10,'tiny positive deficit waits a real kill without loop');near(r.summary.timeline.find(x=>x.type==='studySpeed').elapsedSec,.27/13,'tiny deficit is not timezero');
  return records;
 });
 group('before-exact-after-and-live-offline-split-numeric-oracles',()=>{
  const s=farm(),o=oracle(s,176,.07,4),details=[];
  for(const offset of [-.00001,0,.00001]){c.set(s);const r=c.run(o.time+offset,'live',undefined,s.enemyMaxHp*13);ok(r.summary.studySpeedPurchases===(offset<0?0:1),'before/exact/after purchase');near(active(r,'riftattune').remainingSec,3000-Math.min(o.time+offset,o.time)-Math.max(0,offset)*5,'before/exact/after work');details.push({offset,summary:r.summary,active:r.state.activeStudies});}
  const total=o.time+.431;
  const run=(kind,split)=>{c.set(s);let t=0,purchases=0,spent=0;while(t<total-1e-10){const dt=split?Math.min(.037,total-t):total;const r=c.run(dt,kind,Date.now()+t*1000,s.enemyMaxHp*13);t+=dt;purchases+=r.summary.studySpeedPurchases;spent+=r.summary.studyMotesSpent;}return {state:c.get(),purchases,spent};};
  const a=run('live',false),b=run('live',true),d=run('offline',false),e=run('offline',true);
  for(const r of [a,b,d,e]){near(r.state.activeStudies[0].remainingSec,3000-o.time-.431*5,'whole/split actual work');ok(r.purchases===1&&r.spent===176,'whole/split full one debit');near(r.state.motes,a.state.motes,'unscaled Motes economy');}
  return {oracle:o,total,details,results:[a,b,d,e]};
 });
 group('completion-start-reward-buff-expiry-cap-and-ascend-collisions',()=>{
  const s=farm({motes:172,enemyIsLuminous:true}),at=.04;
  s.activeStudies[0].remainingSec=at;s.studyQueue.riftattune=true;s.longStudyLevels.measuredinquiry=9;paid(s,'measuredinquiry',at);s.studySpeedTargets.measuredinquiry=8;s.buffUntil=Date.now()+at*1000;s.buffMult=2;
  c.set(s);let r=c.run(at+.01,'live',undefined,s.enemyMaxHp*6.75);
  ok(r.state.longStudyLevels.measuredinquiry===10&&!active(r,'measuredinquiry'),'Inquiry completion reaches cap before speed decision');ok(r.summary.studyMotesSpent===176&&r.summary.studySpeedPurchases===1,'only next legacy Study buys');
  near(active(r,'riftattune').totalDurationSec,307,'Inquiry10 discounts new legacy8 start with existing rounding');near(active(r,'riftattune').remainingSec,307-.01*5,'no work before new payment');
  const types=r.summary.timeline.filter(x=>Math.abs(x.elapsedSec-at)<1e-7).map(x=>x.type);
  for(const [a,b] of [['enemyDeath','buffExpire'],['buffExpire','studyComplete'],['studyComplete','studyStart'],['studyStart','studySpeed']])ok(types.indexOf(a)>=0&&types.indexOf(a)<types.indexOf(b),'order '+a+' -> '+b);
  const first=r;
  const asc=paid(c.seed(),'guardmastery',at);paid(asc,'measuredinquiry',at);asc.longStudyLevels.measuredinquiry=9;asc.depth=asc.enemyDepth=16;asc.enemyMaxHp=c.hp(16);asc.enemyHp=asc.enemyMaxHp*.27;asc.enemyIsLuminous=true;asc.motes=57;asc.owned.autoascend=true;asc.autoAscendEnabled=true;asc.autoAscendTargetDepth=17;asc.studyQueue.guardmastery=true;asc.buffUntil=Date.now()+at*1000;asc.buffMult=2;
  c.set(asc);r=c.run(at,'live',undefined,asc.enemyMaxHp*6.75);
  ok(r.summary.ascends===1&&r.summary.completedStudies.length===2&&r.summary.studySpeedPurchases===0,'kill/Ascend then due completion leaves no closed record purchase');ok(r.state.motes===60&&r.state.lumen===0&&!r.state.activeStudies.length,'actual3 reward preserved; reset start budget cannot pay');ok(r.state.longStudyLevels.measuredinquiry===10&&r.state.studyUseMotes.guardmastery&&r.state.buffUntil===0,'intent/cap preserved; Ascend clears expiring buff');
  return {rewardExpiryStartCollision:first,ascendCollision:r};
 });
 group('actual-offline-cap-then-study-only-tail-new-paid-repeat',()=>{
  const s=paid(c.seed(),'guardmastery',4*(43200+7),4);s.studyQueue.guardmastery=true;s.studySpeedTargets.guardmastery=3;s.motes=60;s.lastSeen=Date.now()-43213*1000;c.set(s);
  const report=c.offline(0),r={state:c.get()};
  ok(report.effectiveSec===43200&&report.elapsedSec===43213,'actual12h combat cap plus13sec tail');ok(report.studySpeedPurchases===1&&report.studyMotesSpent===60&&r.state.motes===0,'tail new level pays once at actual completion');ok(r.state.longStudyLevels.guardmastery===1,'earned old paid level');near(active(r,'guardmastery').totalDurationSec,240,'new level base work');near(active(r,'guardmastery').remainingSec,222,'tail completion at7 then6sec of3x');ok(report.kills===0&&r.state.totalOfflineSeconds===43200,'tail no combat rewards');
  const only=paid(c.seed(),'guardmastery',28,4);only.studyQueue.guardmastery=true;only.studySpeedTargets.guardmastery=3;only.motes=60;c.set(only);const tail=c.tail(13);near(active(tail,'guardmastery').remainingSec,222,'direct tail same actual work');ok(tail.summary.studyMotesSpent===60&&tail.state.motes===0,'direct tail same budget');
  return {report,active:r.state.activeStudies,motes:r.state.motes,direct:tail};
 });
 group('no-purchase-for-locked-closed-unknown-maxed-and-raw-overcap',()=>{
  const details=[];
  for(const raw of [10,17]){const s=paid(c.seed(),'measuredinquiry',2);s.longStudyLevels.measuredinquiry=raw;s.motes=473;s.studySpeedTargets.measuredinquiry=8;s.studyQueue.measuredinquiry=true;c.set(s);const r=c.tail(3);ok(r.state.longStudyLevels.measuredinquiry===raw&&r.state.motes===473&&r.summary.studySpeedPurchases===0&&!r.state.activeStudies.length,'capped/overcap closure no spend/extraearned');details.push(r);}
  const closed=paid(c.seed(),'guardmastery',0);closed.motes=473;c.set(closed);let r=c.run(0,'live',undefined,0);ok(r.summary.studySpeedPurchases===0&&r.state.motes===473,'already due record no spending');
  const locked=paid(c.seed(),'motestudy',101);locked.maxDepthEver=59;locked.motes=473;c.set(locked);r=c.run(1,'live',undefined,0);ok(r.summary.studySpeedPurchases===0&&r.state.motes===473,'locked active cannot buy');
  ok(!c.manual('__proto__',8)&&!c.manual('constructor',8)&&!c.manual('unknown',8),'unknown manual IDs rejected');
  return details;
 });
 group('actual-ui-setters-and-render-have-no-hidden-spending',()=>{
  const s=paid(c.seed(),'guardmastery',827);s.motes=473;s.studyUseMotes.guardmastery=false;c.set(s);c.guard(false);c.render();document.querySelector('[data-tab="research"]').click();
  const select=document.querySelector('[data-study-speed-target="guardmastery"]');select.value='8';select.dispatchEvent(new Event('change',{bubbles:true}));
  document.querySelector('[data-study-use-motes="guardmastery"]').click();let a=c.get();ok(a.motes===473&&a.activeStudies[0].speedMult===1,'real setters only save intent');ok(a.studyUseMotes.guardmastery&&a.studySpeedTargets.guardmastery===8,'real setters save chosen8x');
  const before=c.raw(),snapshot=c.get(),events=c.events();c.render();eq(c.raw(),before,'render does not persist');eq(c.get(),snapshot,'render does not mutate state');eq(c.events(),events,'render emits no new save');
  const r=c.run(0,'live',undefined,0);ok(r.summary.studyMotesSpent===473&&r.state.motes===0&&active(r,'guardmastery').speedMult===8,'authoritative engine owns repeat payment');c.save();const disk=JSON.parse(c.raw().primary);ok(disk.motes===0&&disk.activeStudies[0].speedMult===8,'paid snapshot and debit really persisted');
  return {before,snapshot,after:r,primary:disk};
 });
 return {localTree:'4c07cd5d66cb5928eb99623ff86efaa81e268829',records,checks,passed:records.filter(x=>x.status==='PASS').length,total:records.length};
};
