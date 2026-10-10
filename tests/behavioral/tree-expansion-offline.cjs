'use strict';

// Actual scheduler and actual offline transaction. No analytical replacement
// performs a kill, purchase, cast, Ascend or save in these tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {app,seed,clone,P,R,CLOCK} = require('./tree-expansion-harness.cjs');
const {reward} = require('./prism-earning-reference.cjs');
const {checks,quiet,fixture,buyRanks,PRICES,IDS,hash,frontier,dust,compareEconomy,replaceOne} = require('./tree-expansion-economy.cjs');
const {fixedState,observe} = require('./forge-expansion-calibration.cjs');

function battle(q) {
  const s=seed(q);s.depth=s.enemyDepth=20;s.enemyMaxHp=1;s.enemyHp=1;s.riftMode='push';
  s.owned.autoascend=true;s.autoAscendEnabled=true;s.autoAscendTargetDepth=21;
  IDS.forEach(id=>{s.spirits[id]=0;s.heroResource[id]=0;});
  s.spirits.ember=10;s.spirits.tide=4;s.heroResource.ember=18;s.heroResource.tide=37;
  s.activeParty=['ember'];s.nodes.lumenmemory=5;s.nodes.veteranrecruits=2;
  s.lumen=10000;s.prisms=1000;s.motes=100;
  s.achieved.autotap=true;s.achieved.labmaster=true;
  s._autoTapAccum=125;s._autoEmpowerAccum=375;
  return quiet(s);
}
function endingPassive(source,a,config={},mutation) {
  const x=app(source),q=x.q,s=battle(q),seconds=config.seconds||.25;
  const charge=config.charge===undefined?2:config.charge,phase=config.phase===undefined?1:config.phase;
  s.nodes.chargememory=charge;s.nodes.phasememory=phase;
  if(config.unsafeCount)s.ascendCount=1e30;
  if(config.equal){s._autoTapAccum=s._autoEmpowerAccum=500;s.nodes.empowerbatch=2;s.empowerQueue.ember=true;}
  if(config.readyAbility)s.heroResource.ember=100-(100/6)*seconds;
  q.set(s);a.eq(q.fill(),1,'ending witness retains original natural six-second charge cycle');
  const net=q.passive(20)-q.regen(20)*q.get().enemyMaxHp;
  a.ok(net>0,'ending witness has positive actual net passive damage');
  q.get().enemyHp=net*seconds;
  const before=clone(q.get()),events=[],endings=[];
  const uncal=q.observeCalibration(event=>{if(event.type==='cast')events.push({type:'cast',id:event.id,level:event.level,depth:q.get().depth,at:event.nowMs});});
  const unasc=q.observeAscends(event=>{events.push({type:'ascend'});endings.push(event);});
  const undo=mutation?mutation(q):()=>{};let result;
  try{result=q.advance(seconds,{kind:config.kind||'live',clockStartMs:CLOCK});}finally{undo();uncal();unasc();}
  a.eq(result.ascends,1,'ending passive interval performs exactly one actual Auto-Ascend');
  a.eq(endings.length,1,'one actual mutation observed at ending passive hit');
  const ending=endings[0],carried=charge>0||phase>0;
  const eventCharge=carried?Math.min(100,before.heroResource.ember+100/6*seconds):before.heroResource.ember;
  a.near(ending.before.heroResource.ember,eventCharge,2e-14,'ending event-time charge includes old-run final interval');
  a.eq(ending.before.heroResource.tide,37,'unpowered bench earns no new ending-interval charge');
  a.near(ending.after.heroResource.ember,eventCharge*charge/5,2e-14,'ending snapshot retains only paid event-time share');
  a.near(ending.after.heroResource.tide,37*charge/5,2e-14,'dormant retained charge waits for later recruitment');
  const tap=phase?Math.min(999.999,before._autoTapAccum+seconds*1000):0;
  const empower=phase?Math.min(999.999,before._autoEmpowerAccum+seconds*1000):0;
  a.near(ending.after._autoTapAccum,tap,1e-14,'ending event-time Auto-Tap phase retained');
  a.near(ending.after._autoEmpowerAccum,empower,1e-14,'ending event-time Auto-Empower phase retained');
  a.eq(ending.after.spirits.ember,3,'ending reset uses Veteran starting level');
  a.eq(ending.after.nodes,ending.before.nodes,'ending passive reset preserves all paid ownership');
  a.eq(ending.after.ascendCount,config.unsafeCount?1e30:before.ascendCount+1,'unsafe lifetime counter is not used as run identity');
  a.eq(events[0],{type:'ascend'},'passive death/Ascend precedes any equal-time ready cast');
  if(config.readyAbility){
    a.ok(events.some(e=>e.type==='cast'),'retained full charge executes through actual ready-action resolver');
    a.eq(events.find(e=>e.type==='cast').level,3,'equal-time cast uses the newly reset Veteran level, never old level10');
  }else{
    a.eq(events.filter(e=>e.type==='cast').length,0,'sub-full retained charge fires no early ability');
    a.eq(result.kills,1,'no old-run damage spills into next encounter');
    a.eq(result.autoTaps,0,'ending interval does not run an old tap before passive death');
    a.eq(result.empowers,0,'ending interval does not purchase in the old run');
  }
  if(config.equal){
    a.eq([ending.before._autoTapAccum,ending.before._autoEmpowerAccum],[1000,1000],'equal-time old-run phases accrue fully before snapshot');
    a.eq([ending.after._autoTapAccum,ending.after._autoEmpowerAccum],[999.999,999.999],'explicit persisted phase ceiling remains999.999ms');
    const wallet=q.get().lumen,level=q.get().spirits.ember;
    const due=q.advance(.000002,{kind:config.kind||'live',clockStartMs:CLOCK+seconds*1000});
    a.eq(due.autoTaps,1,'retained due Auto-Tap executes once immediately after the explicit phase ceiling');
    a.eq(due.empowers,3,'one retained Auto-Empower event executes the three separately paid batch actions');
    a.eq(q.get().spirits.ember,level+3,'equal-time batch buys only three real levels');
    const spent=[level,level+1,level+2].reduce((sum,k)=>sum+Math.round(10*Math.pow(1.13,k)),0);
    a.near(wallet-q.get().lumen,spent,1e-14,'equal-time batch pays the independent original three-quote ledger');
  }
  return {kind:config.kind||'live',seconds,chargeRank:charge,phaseRank:phase,unsafeCount:!!config.unsafeCount,equal:!!config.equal,
    readyAbility:!!config.readyAbility,eventCharge,retainedCharge:ending.after.heroResource.ember,
    retainedPhases:[ending.after._autoTapAccum,ending.after._autoEmpowerAccum],events,summary:{kills:result.kills,ascends:result.ascends,autoTaps:result.autoTaps,empowers:result.empowers}};
}
function ordinaryInterval(source,a) {
  const x=app(source),q=x.q,s=battle(q);s.autoAscendEnabled=false;s.enemyHp=s.enemyMaxHp=1e100;
  s.nodes.chargememory=2;s.nodes.phasememory=1;q.set(s);
  const before=clone(q.get()),result=q.advance(.25,{kind:'live',clockStartMs:CLOCK});
  a.eq(result.kills+result.ascends,0,'ordinary paid-memory witness keeps its encounter');
  a.near(q.get().heroResource.ember,before.heroResource.ember+100/6*.25,2e-14,'ordinary interval accrues charge exactly once');
  a.eq([q.get()._autoTapAccum,q.get()._autoEmpowerAccum],[375,625],'ordinary interval accrues phases exactly once');
}
function supportDeadlines(source,a) {
  const x=app(source),q=x.q,s=battle(q);s.nodes.supportmemory=1;s.nodes.chargememory=1;
  s.depth=s.enemyDepth=101;s.autoAscendEnabled=false;s.activeParty=['ember'];s.heroResource.ember=0;s.research.amplifiertrim=5;
  s.supportBuffs={version:1,sources:{tide:{mult:1.3,until:CLOCK+4000},aurora:{mult:1.5,until:CLOCK+8000}}};
  s.buffMult=1.7;s.buffUntil=CLOCK+3000;q.set(s);const before=clone(q.get());
  a.eq(before.supportBuffs,s.supportBuffs,'both independently funded valid Support snapshots survive seed normalization');
  a.eq(q.ascend(),true,'actual paid Support-memory Ascend');
  a.eq(q.get().supportBuffs,before.supportBuffs,'Support memory keeps every original source strength/deadline');
  a.eq([q.get().buffMult,q.get().buffUntil],[1.7,CLOCK+3000],'legacy Support deadline unchanged');
  a.near(q.buff(CLOCK+2999),1.8,2e-15,'preserved two-Support overlap uses original strengths');
  a.near(q.buff(CLOCK+4000),1.5,2e-15,'first original deadline expires without extension');
  a.eq(q.buff(CLOCK+8000),1,'second original deadline expires without extension');
  const stored=app(source,x.storage);a.eq(stored.q.get().supportBuffs,q.get().supportBuffs,'cold load does not refresh purchased Support memory');
  q.get().enemyHp=q.get().enemyMaxHp=1e100;
  const result=q.advance(8,{kind:'offline',clockStartMs:CLOCK});
  a.eq(result.ascends,0,'deadline-only interval has no repeated reset');
  a.eq(q.buff(CLOCK+8000),1,'actual scheduler expires the last original Support deadline');
  return {originalSources:before.supportBuffs,originalLegacy:{mult:1.7,until:CLOCK+3000},effectiveAt8000:q.buff(CLOCK+8000)};
}

const LONG_RANKS={lumenmemory:5,veteranrecruits:5,rosterrecall:4,chargememory:3,supportmemory:1,phasememory:1,
  riftstep:5,frontier:3,stardust:3,gentlegrowth:5,formationseat:1,benchmentor:3,empowerbatch:2,wallwisdom:2,invitations:3,recruitreserve:5};
function longSeed(source,a) {
  const x=app(source),q=x.q,s=fixture(q,'parity-auto-ascend');
  s.maxDepthEver=130;s.autoAscendEnabled=false;q.set(s);
  const paid=buyRanks(q,LONG_RANKS,a);
  const initial=clone(q.get());initial.activeParty=['ember','tide','aurora','gale','thorn','stone'];initial.formationRebuild=null;
  initial.autoAscendEnabled=true;initial.autoAscendTargetDepth=130;
  initial._autoTapAccum=217.25;initial._autoEmpowerAccum=619.5;
  initial.heroResource.ember=55;initial.heroResource.tide=20;initial.heroResource.aurora=45;
  initial.nodes.swift=6;initial.lastSeen=CLOCK;
  for(const id of IDS)initial.empowerQueue[id]=initial.activeParty.includes(id);
  q.set(initial);a.eq(q.get().activeParty.length,6,'8h seed really fields all six paid Formation slots');
  a.eq(q.get().longStudyLevels.riftattune,7,'8h fixture retains all seven paid historical offline-efficiency levels');
  a.near(q.offlineRate(),1.7,2e-15,'8h actual historical offline rate1.7 remains intact');
  return {state:clone(q.get()),paid};
}
function compareState(actual,expected,a,label) {
  compareEconomy(actual,expected,a,label);
  for(const key of ['dailyStats','achieved','comets','activeStudies','sigilResonanceUses','buffUntil','buffMult','legacyCometPurchases','offline12hRefund'])
    a.eq(actual[key],expected[key],label+' retained '+key);
}
function observeTransitions(q,a) {
  const report={ascends:0,nominalPrisms:0,representedPrisms:0,motes:0,frontier:0,first:null,last:null};
  const undo=q.observeAscends(({before,after,gain})=>{
    const cleared=before.riftMode==='farm'?before.farmReturnDepth-1:before.depth-1;
    const bonus=frontier(cleared,before.ascendRewardedDepth,before.nodes.frontier),want=reward(cleared,before.ascendRewardedDepth,before.nodes.swift,before.longStudyLevels.prismstudy)+bonus;
    a.eq(gain,want,'8h actual mutation uses independent unchanged kernel plus new milestones');
    a.eq(after.prisms-before.prisms,want,'8h represented Prism credit equals quote');
    a.eq(after.motes-before.motes,dust(want,before.nodes.stardust),'8h Dust is credited once per actual Ascend');
    a.eq(after.nodes,before.nodes,'8h transition keeps the whole paid Tree ledger');
    a.eq(after.longStudyLevels,before.longStudyLevels,'8h transition keeps all old paid Lab work');
    a.eq(after.spirits.ember,6,'8h reset uses the actually purchased Veteran rank5');
    a.near(after.lumen,Math.min(before.lumen*.25,250000),2e-15,'8h carry cap applies to the actual ending wallet');
    const row={cleared,benchmark:before.ascendRewardedDepth,prisms:gain,frontier:bonus,motes:after.motes-before.motes};
    report.ascends++;report.nominalPrisms+=gain;report.representedPrisms+=after.prisms-before.prisms;report.motes+=after.motes-before.motes;report.frontier+=bonus;
    if(!report.first)report.first=row;report.last=row;
  });
  return {report,undo};
}
function runLong(source,initial,a,config) {
  const seconds=28800,x=app(source),q=x.q;q.set(initial);q.save(CLOCK);x.writes.length=0;
  const before=clone(q.get()),observer=observeTransitions(q,a);let result,callbacks=0,yields=0;
  try {
    if(config.callback){
      x.clock(CLOCK+seconds*1000);let error,called=0;
      q.offline((r,e)=>{result=r;error=e;called++;});
      a.ok(x.pending()>0,'8h actual offline transaction yields before committing '+config.id);
      a.eq(q.get(),before,'8h yielded work remains private '+config.id);
      a.eq(x.writes.length,0,'8h yielded work has no intermediate save '+config.id);
      callbacks=x.drain(1000000);a.eq(called,1,'8h offline completion callback fires once '+config.id);a.ok(!error,'8h offline transaction succeeds '+config.id+': '+error);
      a.eq(x.writes.filter(w=>w.key===P).length,1,'8h one primary transaction commit '+config.id);
      a.eq(result.effectiveSec,seconds,'8h effective interval accounted once '+config.id);
      a.eq(q.get().totalOfflineSeconds-before.totalOfflineSeconds,seconds,'8h offline-time counter exact '+config.id);
      a.eq(result.motesEarned,q.get().motes-before.motes,'8h full report uses actual earned Motes '+config.id);
      const stable=clone(q.get());a.eq(q.offline(),null,'completed8h return cannot replay '+config.id);a.eq(q.get(),stable,'repeat return retains exact accepted endpoint '+config.id);
    }else{
      const spans=config.split?[900.125,6299.875,10800,10800]:[seconds];let at=0;
      result={ascends:0,kills:0,autoTaps:0,empowers:0,motesGained:0,lumenGained:0,shardGained:0,iterations:0};
      for(const span of spans){
        const options={kind:config.kind,clockStartMs:CLOCK+at*1000,offlineWindowStartMs:CLOCK,resumable:!!config.cursor};
        let part=q.advance(span,options);
        if(config.cursor){const cursor=part;let step;do{step=cursor.next();if(!step.done)yields++;}while(!step.done);part=step.value;}
        for(const key of Object.keys(result))result[key]+=part[key];at+=span;
      }
      a.eq(at,seconds,'8h split segments cover the exact requested duration');
      a.eq(result.motesGained,q.get().motes-before.motes,'8h scheduler Mote summary matches actual represented wallet '+config.id);
      x.clock(CLOCK+seconds*1000);a.eq(q.save(CLOCK+seconds*1000),true,'8h authoritative endpoint saves '+config.id);
    }
  }finally{observer.undo();}
  const after=clone(q.get());
  a.ok(observer.report.ascends>=2,'8h purchased run must actually repeat Auto-Ascend '+config.id);
  a.eq(result.ascends,observer.report.ascends,'8h summary agrees with real mutation count '+config.id);
  a.eq(after.nodes,before.nodes,'8h preserves all paid Tree ranks '+config.id);
  a.eq(after.research,before.research,'8h preserves all old paid Forge ranks '+config.id);
  a.eq(after.longStudyLevels,before.longStudyLevels,'8h preserves all old paid Lab ranks '+config.id);
  a.eq(after.owned,before.owned,'8h preserves all permanent purchases '+config.id);
  a.eq([after.autoAscendEnabled,after.autoAscendTargetDepth],[true,130],'8h preserves exact Auto-Ascend toggle/target '+config.id);
  a.eq(x.storage.get(P),x.storage.get(R),'8h primary/recovery endpoint bytes agree '+config.id);
  compareState(app(source,x.storage).q.get(),after,a,'8h cold restart '+config.id);
  return {state:after,report:{id:config.id,kind:config.kind||'offline',seconds,sourceSha256:hash(source),callbacks,yields,
    result,transitions:observer.report,stateSha256:hash(JSON.stringify(after))}};
}
function longRuns(source,a) {
  const initial=longSeed(source,a),narrow=replaceOne(source,'var SIM_BATCH_EVENTS = 256;','var SIM_BATCH_EVENTS = 31;','authoritative batch-size control');
  const live=runLong(source,initial.state,a,{id:'live-unsplit',kind:'live'});
  const liveSplit=runLong(source,initial.state,a,{id:'live-split',kind:'live',split:true});
  compareState(liveSplit.state,live.state,a,'8h actual live/split');
  const offline=runLong(source,initial.state,a,{id:'offline-unsplit',kind:'offline'});
  const offlineSplit=runLong(source,initial.state,a,{id:'offline-split',kind:'offline',split:true,cursor:true});
  compareState(offlineSplit.state,offline.state,a,'8h actual offline/split/resumable');
  a.ok(offlineSplit.report.yields>0,'8h resumable split really crosses event-batch yields');
  const wide=runLong(source,initial.state,a,{id:'offline-transaction-256',callback:true});
  const small=runLong(narrow,initial.state,a,{id:'offline-transaction-31',callback:true});
  compareState(wide.state,offline.state,a,'8h actual synchronous/transaction endpoint');
  compareState(small.state,wide.state,a,'8h actual256/31 transaction endpoint');
  a.eq(small.state,wide.state,'8h event-batch size changes no persisted byte/number');
  a.ok(small.report.callbacks>wide.report.callbacks,'31-event cursor actually yields more often than256');
  return {publicFixture:'parity-auto-ascend',fixtureSha256:hash(fs.readFileSync(path.join(__dirname,'fixtures.json'))),paid:initial.paid,
    rules:'All existing paid levels retained;6 chosen members, actual Auto-Empower enabled only for them; Forge/Study purchase queues OFF; original target130 and historical offline rate1.7. Live and offline comparisons are separate because their paid reward policies differ.',
    runs:[live,liveSplit,offline,offlineSplit,wide,small].map(r=>r.report),initial:initial.state};
}

function offlineFaults(source,initial,a) {
  function attempt(failure) {
    const x=app(source),q=x.q;q.set(initial);q.save(CLOCK);const before=clone(q.get()),stored=x.storage.get(P);
    x.clock(CLOCK+60000);x.fail(failure==='primary',failure==='recovery');let result,error;
    q.offline((r,e)=>{result=r;error=e;});x.drain();
    if(failure==='primary'){
      a.ok(error,'new Tree offline primary failure reports failed commit');
      a.eq(q.get(),before,'new Tree offline primary failure restores entire original state');
      a.eq(x.storage.get(P),stored,'new Tree primary failure leaves saved original bytes');
      x.fail(false,false);q.offline((r,e)=>{result=r;error=e;});x.drain();
    }
    a.ok(!error,'new Tree offline transaction/retry succeeds '+failure);
    a.eq(q.get().lastSeen,CLOCK+60000,'new Tree offline accepted window updates lastSeen exactly once '+failure);
    const after=clone(q.get());a.eq(q.offline(),null,'new Tree fault/retry window never replays '+failure);
    a.eq(app(source,x.storage).q.get(),after,'new Tree fault/retry reload uses actual committed primary '+failure);
    return {state:after,result,failure};
  }
  const clean=attempt('none'),primary=attempt('primary'),recovery=attempt('recovery');
  a.eq(primary.state,clean.state,'Tree primary retry reaches the exact clean endpoint');
  a.eq(recovery.state,clean.state,'Tree recovery-only failure retains the committed primary endpoint');
  return [clean,primary,recovery].map(x=>({failure:x.failure,ascends:x.result.ascends,kills:x.result.kills,stateSha256:hash(JSON.stringify(x.state))}));
}
function wallCase(source,a,rank,mutation) {
  const x=app(source),q=x.q,s=seed(q);s.nodes.wallwisdom=rank;
  s.depth=s.enemyDepth=120;s.enemyHp=s.enemyMaxHp=1e100;s.activeParty=['ember'];s.spirits.ember=1;
  s.autoAscendEnabled=false;s.achieved.autotap=false;s.achieved.labmaster=false;s.owned.offline48=true;q.set(s);
  const undo=mutation?mutation(q):()=>{},grace=300-60*rank;
  try{
    a.eq(q.offlineCap(),12,'Wall Wisdom never extends the fixed12h offline cap');
    a.eq(q.policy('offline',{clockStartMs:CLOCK}).bossRetreatNotBeforeMs,CLOCK+grace*1000,'independent paid offline wall grace');
    const before=q.advance(grace-.001,{kind:'offline',clockStartMs:CLOCK,offlineWindowStartMs:CLOCK});
    a.eq(before.retreats,0,'Wall Wisdom preserves selected boss throughout paid grace');
    a.eq(q.get().riftMode,'push','Wall Wisdom does not retreat one millisecond early');
    const at=q.advance(.001,{kind:'offline',clockStartMs:CLOCK+(grace-.001)*1000,offlineWindowStartMs:CLOCK});
    a.eq(at.retreats,1,'genuine unwinnable boss retreats exactly at paid grace');
    a.eq(q.get().riftMode,'farm','actual paid wall action enters Farm');
    return {rank,graceSeconds:grace,retreats:at.retreats,farmDepth:q.get().farmDepth};
  }finally{undo();}
}
function sixPartyBounds(source,a) {
  const rows=[];
  for(const [id,party,auto,ordinal] of [
    ['supports-first',['tide','aurora','ember','stone','gale','thorn'],true,0],
    ['supports-last',['ember','stone','gale','thorn','tide','aurora'],true,4],
    ['no-auto',['tide','ember','aurora','void','stone','thorn'],false,0],
    ['large-ordinal',['aurora','tide','titan','void','ember','gale'],true,1e30]
  ]){
    const x=app(source),q=x.q,s=fixedState(q,{party,auto,ordinal,swift:30,phase:[17,83,39,61,5,47]});
    s.nodes.formationseat=1;s.nodes.chargememory=5;s.nodes.phasememory=1;
    s.supportBuffs={version:1,sources:{tide:{mult:1.55,until:CLOCK+2711},aurora:{mult:1.5,until:CLOCK+5917}}};
    q.set(s);a.eq(q.get().activeParty,party,'six-party bound fixture retains all six powered members '+id);
    a.eq(q.get().supportBuffs,s.supportBuffs,'six-party bound keeps both valid paid source snapshots '+id);
    const snapshot=clone(q.get()),bound=q.assessment(120),profile=q.profile(120);
    a.ok(profile && profile.eventCount>0 && profile.eventCount<=12000,'bounded actual six-party charge profile '+id);
    a.eq(Object.keys(profile.rates),party,'six-party profile includes both Support sources and all four others '+id);
    a.eq(q.get(),snapshot,'six-party boss assessment/profile are read-only '+id);
    const actual=observe(x,600,CLOCK,a),maximum=bound.upperDps*600+bound.burstBudget;
    a.ok(actual.totalDamage<=maximum*(1+2e-10),'six-party actual damage respects conservative upper bound '+id+': '+actual.totalDamage+' <= '+maximum);
    a.ok(actual.totalDamage+bound.lowerDps*q.cycle()+bound.burstBudget>=bound.lowerDps*600*(1-2e-10),'six-party actual damage respects conservative lower bound with one-cycle startup '+id);
    a.ok(actual.counts.tide>0 && actual.counts.aurora>0,'both real Support actors cast during bound measurement '+id);
    rows.push({id,party,seconds:600,ordinal,lowerDps:bound.lowerDps,upperDps:bound.upperDps,burstBudget:bound.burstBudget,
      profileEvents:profile.eventCount,actualDps:actual.dps,actualDamage:actual.totalDamage,maximum,casts:actual.counts,autoTaps:actual.taps});
  }
  return rows;
}
function negatives(source) {
  const rows=[];
  function rejects(name,run,pattern){let error;try{run();}catch(e){error=e;}
    assert(error instanceof assert.AssertionError,name+' must fail a gameplay assertion, not a runtime/harness error');
    assert.match(error.message,pattern,name+' must catch its intended chronology fault');
    rows.push({name,caught:true,errorName:error.name,message:error.message.split('\n')[0]});
  }
  const lost=replaceOne(source,"var carryBeforePassive=treeLevel('chargememory')>0 || treeLevel('phasememory')>0;",'var carryBeforePassive=false;','paid ending interval');
  rejects('discard-final-old-run-charge',()=>endingPassive(lost,checks()),/ending event-time charge/);
  const twice=replaceOne(source,'if(!carryBeforePassive){','if(true){','single resource accrual');
  rejects('double-accrue-paid-memory-interval',()=>ordinaryInterval(twice,checks()),/ordinary interval accrues charge exactly once/);
  rejects('discard-paid-event-phase',()=>endingPassive(source,checks(),{},q=>q.disable('phasememory')),/event-time Auto-Tap phase retained/);
  rejects('ignore-paid-wall-grace',()=>wallCase(source,checks(),4,q=>q.disable('wallwisdom')),/independent paid offline wall grace/);
  return rows;
}
function verify(source,negative=false) {
  const a=checks(),boundaries=[];
  ordinaryInterval(source,a);
  for(const kind of ['live','offline'])for(const config of [
    {charge:0,phase:0},{charge:2,phase:0},{charge:0,phase:1},{charge:2,phase:1},
    {charge:2,phase:1,unsafeCount:true},{charge:2,phase:1,seconds:.5,equal:true},
    {charge:5,phase:1,seconds:.25,readyAbility:true}
  ])boundaries.push(endingPassive(source,a,{kind,...config}));
  const deadlines=supportDeadlines(source,a),walls=[0,1,4].map(rank=>wallCase(source,a,rank));
  const bounds=sixPartyBounds(source,a),long=longRuns(source,a),faults=offlineFaults(source,long.initial,a);
  delete long.initial;
  return {status:'pass',sourceSha256:hash(source),testSha256:hash(fs.readFileSync(__filename)),fixtureSha256:hash(fs.readFileSync(path.join(__dirname,'fixtures.json'))),
    checks:a.count,boundaries,supportDeadlines:deadlines,wallGrace:walls,sixPartyBounds:bounds,longRuns:long,offlineFaults:faults,
    negativeControls:negative?negatives(source):[],
    scope:'Actual full-IIFE live/offline/split/resumable engine and primary/recovery transaction. Public synthetic fixtures only; no browser/native device or private-save acceptance.200% UI is covered separately.'};
}
module.exports={verify,endingPassive,ordinaryInterval,wallCase,sixPartyBounds,longSeed,runLong};
if(require.main===module){const source=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');console.log(JSON.stringify(verify(source,process.argv.includes('--negative'))));}
