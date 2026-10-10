#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const {app, seed, clone, P, R, CLOCK} = require('./tree-expansion-harness.cjs');
const {reward: oldPrismReward} = require('./prism-earning-reference.cjs');

// Independent acceptance constants, transcribed from the approved design.
// No price, cap, unlock or expected effect is read out of the production table.
const CATALOG = [
  ['swiftcharter','Swift Charter',100,1,[200]],
  ['lumenmemory','Lumen Inheritance',15,5,[8,16,28,44,64]],
  ['veteranrecruits','Veteran Recruits',20,5,[5,10,18,30,46]],
  ['rosterrecall','Roster Recall',25,4,[15,30,55,90]],
  ['chargememory','Charge Memory',30,5,[12,22,38,60,90]],
  ['supportmemory','Lasting Blessings',60,1,[60]],
  ['phasememory','Unbroken Rhythm',40,1,[35]],
  ['riftstep','Familiar Paths',30,5,[12,24,42,68,104]],
  ['frontier','Frontier Record',50,5,[20,35,55,80,110]],
  ['stardust','Ascension Dust',60,5,[10,18,30,46,66]],
  ['gentlegrowth','Patient Growth',40,5,[12,22,38,60,90]],
  ['formationseat','Sixth Companion',75,1,[120]],
  ['benchmentor','Bench Mentorship',35,5,[10,18,30,46,66]],
  ['empowerbatch','Steady Instruction',45,4,[15,28,46,70]],
  ['wallwisdom','Wall Wisdom',50,4,[12,22,36,54]],
  ['invitations','Early Invitations',15,3,[4,9,16]],
  ['recruitreserve','Recruitment Reserve',25,5,[8,16,28,44,64]]
].map(([id,name,unlock,cap,prices]) => ({id,name,unlock,cap,prices}));
const IDS = CATALOG.map(d => d.id), OLD_IDS = ['starlight','steady','echo','bonds','swift','momentum','reserves'];
const SPIRITS = [
  ['ember',1,10],['tide',3,60],['stone',6,360],['gale',9,2100],
  ['thorn',12,12000],['void',18,70000],['aurora',24,400000],['titan',32,2200000]
].map(([id,unlock,base]) => ({id,unlock,base}));
const LEGACY = {echo:{base:2,growth:1.4,cap:6},bonds:{base:2,growth:1.45,cap:20},swift:{base:3,growth:1.5}};
const capFor = id => CATALOG.find(d => d.id === id).cap;
const ranksFor = id => [...new Set([0,1,capFor(id),capFor(id)+1])];
const effective = (id,level) => Math.min(capFor(id),level);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const sourcePath = process.argv[2] || path.join(__dirname,'../../index.html');
const source = fs.readFileSync(sourcePath,'utf8');

function counter(name) {
  let checks = 0;
  return {
    get checks() { return checks; },
    eq(actual, expected, message) { checks++; assert.deepEqual(actual, expected, name+': '+message); },
    ok(value, message) { checks++; assert(value, name+': '+message); },
    near(actual, expected, message, tolerance=1e-12) { checks++; assert(Math.abs(actual-expected)<=tolerance, name+': '+message+'; '+actual+' vs '+expected); }
  };
}
function world(q, overrides={}) {
  const s=seed(q);s.nodes.swift=10;
  return Object.assign(s,overrides);
}
function lowWorld(q,maxDepth) {
  const s=world(q);s.depth=s.enemyDepth=1;s.enemyHp=s.enemyMaxHp=100;s.maxDepthEver=maxDepth;
  return s;
}
function atCleared(q,clear=50) {
  const s=world(q);s.depth=s.enemyDepth=clear+1;s.enemyHp=s.enemyMaxHp=1e15;
  s.ascendCount=3;s.ascendRewardedDepth=25;s.lumen=12345;s.spirits.ember=30;
  return s;
}
function useMutation(q,mutate) { return mutate ? mutate(q) : () => {}; }
function oldCost(sp,level,bonds=0) { return Math.round(sp.base*Math.pow(1.13,level)*(1-Math.min(.6,.03*bonds))); }
function rationalCost(sp,level,rank,bonds=0) {
  if(!rank || level<=25) return oldCost(sp,level,bonds);
  const numerator=BigInt(sp.base)*113n**25n*BigInt(113-rank)**BigInt(level-25)*BigInt(100-Math.min(60,3*bonds));
  const denominator=100n**BigInt(level+1);
  const result=Number((2n*numerator+denominator)/(2n*denominator));
  assert(Number.isSafeInteger(result),'moderate independent rational oracle result');
  return result;
}
function frontier(clear,benchmark,rank) { return rank*Math.max(0,Math.floor(clear/25)-Math.floor(benchmark/25)); }
function dust(gain,rank) { return rank*Math.min(10,Math.floor(gain/20)); }
function oldBreakdown(clear,benchmark,swift=10,clarity=0) {
  const full=oldPrismReward(clear,0,swift,clarity);
  if(!full) return {gain:0,full:0,reserve:0,progressBonus:0,cleared:clear,benchmark};
  if(!benchmark) return {gain:full,full,reserve:0,progressBonus:full,cleared:clear,benchmark:0};
  const reserve=oldPrismReward(clear,clear,swift,clarity);
  const progressBonus=clear>benchmark ? Math.ceil(2*(clear-benchmark)/(Math.sqrt(clear)+Math.sqrt(benchmark))*(25+swift)*(20+clarity)/500) : 0;
  return {gain:oldPrismReward(clear,benchmark,swift,clarity),full,reserve,progressBonus,cleared:clear,benchmark};
}

function catalogue(t,mutate) {
  const a=app(source),q=a.q;
  t.eq(q.defs().map(d=>d.id),OLD_IDS.concat(IDS),'original seven IDs and exact appended order');
  t.eq(q.defs().filter(d=>!d.retired&&!d.retiredTo).map(d=>d.id),['echo','bonds','swift'].concat(IDS),'twenty active independent purchase types');
  t.eq(new Set(q.defs().map(d=>d.id)).size,24,'no duplicate saved ID');
  const end=useMutation(q,mutate);
  try {
    for(const d of CATALOG) {
      const row=q.node(d.id);
      t.eq([row.name,row.unlockDepth,row.levelCap],[d.name,d.unlock,d.cap],'named capped unlock '+d.id);
      t.ok(row.desc&&row.treeGroup,'visible explanation and group '+d.id);
      for(const raw of [...Array(d.cap+2).keys(),1000000]) {
        const s=world(q);s.nodes[d.id]=raw;q.set(s);
        const before=clone(q.get());
        t.eq(q.level(d.id),Math.min(raw,d.cap),'effective cap '+d.id+'/'+raw);
        t.eq(q.get().nodes[d.id],raw,'raw paid level retained '+d.id+'/'+raw);
        const plan=q.plan(d.id);
        t.eq(q.get(),before,'quote is read-only '+d.id+'/'+raw);
        if(raw>=d.cap) {
          t.eq(plan.reason,'cap','cap gate '+d.id+'/'+raw);
          t.eq(q.buy(d.id),false,'cap buy rejected '+d.id+'/'+raw);
          t.eq(q.get(),before,'cap rejection is pure '+d.id+'/'+raw);
          continue;
        }
        t.eq(q.cost(d.id),d.prices[raw],'independent price '+d.id+'/'+raw);
        t.eq(q.cost(d.id,raw),d.prices[raw],'explicit level price '+d.id+'/'+raw);
        t.eq(q.get(),before,'explicit quote restores state '+d.id+'/'+raw);
        for(const wallet of [d.prices[raw]-1,d.prices[raw],2**40,1e30]) {
          const paid=clone(s);paid.prisms=wallet;q.set(paid);const start=clone(q.get());
          const allowed=wallet>=d.prices[raw]&&wallet-(wallet-d.prices[raw])===d.prices[raw];
          t.eq(q.plan(d.id).affordable,allowed,'quoted debit eligibility '+d.id+'/'+raw+'/'+wallet);
          t.eq(q.buy(d.id),allowed,'actual exact purchase '+d.id+'/'+raw+'/'+wallet);
          if(!allowed) {t.eq(q.get(),start,'refused payment changes nothing '+d.id);continue;}
          t.eq(q.get().prisms,wallet-d.prices[raw],'exact Prism debit '+d.id+'/'+raw);
          t.eq(q.get().nodes[d.id],raw+1,'one paid level '+d.id+'/'+raw);
          for(const key of ['lumen','shards','sigils','motes','spirits','heroResource','treeTrainingProgress']) t.eq(q.get()[key],start[key],'purchase has no run-event grant '+d.id+'/'+key);
          t.eq(JSON.parse(a.storage.get(P)).nodes[d.id],raw+1,'primary commits paid level '+d.id);
          t.eq(a.storage.get(P),a.storage.get(R),'recovery matches primary '+d.id);
        }
      }
      const s=lowWorld(q,d.unlock-1);q.set(s);const before=clone(q.get());
      t.eq(q.plan(d.id).reason,'locked','one Rift below unlock '+d.id);
      t.eq(q.buy(d.id),false,'locked handler '+d.id);t.eq(q.get(),before,'locked purchase is pure '+d.id);
      const owned=lowWorld(q,1);owned.nodes[d.id]=d.cap;q.set(owned);
      t.eq(q.level(d.id),d.cap,'paid effect survives current and record depth below unlock '+d.id);
    }
    const s=world(q);s.nodes.swift=9;q.set(s);
    t.eq(q.plan('swiftcharter').reason,'locked','Charter also requires existing Swift10');
    s.nodes.swift=10;q.set(s);t.eq(q.plan('swiftcharter').affordable,true,'both Charter requirements met');
    for(const id of ['starlight','steady','momentum','reserves']) {const before=clone(q.get());t.eq(q.buy(id),false,'retired purchase refused '+id);t.eq(q.get(),before,'retired purchase no debit '+id);}
    t.eq(q.rawPlan({id:'lumenmemory'}).reason,'invalid','forged catalog object rejected');
    t.eq(q.rawBuy({id:'lumenmemory'}),false,'forged handler rejected');
  } finally {end();}
}

function nodeFaults(t,mutate) {
  for(const id of ['echo','bonds','swift'].concat(IDS)) for(const fault of ['primary','recovery']) {
    const a=app(source),q=a.q,s=world(q);q.set(s);t.eq(q.save(),true,'persist initial '+id);
    const before=clone(q.get()),p=a.storage.get(P),r=a.storage.get(R),cost=q.plan(id).cost;
    const end=useMutation(q,mutate);a.fail(fault==='primary',fault==='recovery');
    try {
      const returned=q.buy(id);
      if(fault==='primary') {
        t.eq(returned,false,'primary failure returned '+id);t.eq(q.get(),before,'primary rollback restores complete Tree state '+id);
        t.eq([a.storage.get(P),a.storage.get(R)],[p,r],'failed primary leaves both slots '+id);
        a.fail(false,false);t.eq(q.buy(id),true,'retry makes exactly the intended purchase '+id);
      } else {
        t.eq(returned,true,'committed primary survives recovery failure '+id);
        t.eq(a.storage.get(R),r,'failed recovery stays at earlier endpoint '+id);
      }
      t.eq(q.get().nodes[id],before.nodes[id]+1,'one level after failure/retry '+id);
      t.eq(q.get().prisms,before.prisms-cost,'one debit after failure/retry '+id);
      t.eq(app(source,a.storage).q.get(),q.get(),'cold load uses committed endpoint '+id);
    } finally {end();}
  }
}

function nodeHugeDebit(t,mutate) {
  const a=app(source),q=a.q,s=world(q);s.prisms=1e30;q.set(s);const before=clone(q.get()),end=useMutation(q,mutate);
  try {t.eq(q.buy('lumenmemory'),false,'unrepresentable Tree price refused');t.eq(q.get(),before,'huge Prism wallet gains no free ownership');} finally {end();}
}

function deferredRefund(t,mutate) {
  for(const fault of ['none','primary','recovery']) {
    const a=app(source),q=a.q,s=q.fresh();s.schemaVersion=1;delete s.offline12hRefund;
    s.nodes.reserves=2;s.nodes.bonds=8;s.prisms=2**54;s.questDay=q.day();s.lastSeen=CLOCK;q.set(s);q.save();
    const before=clone(q.get());t.eq(before.offline12hRefund.prismPrices,[6,10],'original refund price ledger');
    t.eq(before.offline12hRefund.prismsPaid,[false,false],'oversized wallet deferred historical refund');
    t.eq(q.plan('bonds').cost,40,'Bonds old exact purchase price');
    const end=useMutation(q,mutate);a.fail(fault==='primary',fault==='recovery');
    try {
      const result=q.buy('bonds');
      if(fault==='primary') {t.eq(result,false,'failed refund/debit commit');t.eq(q.get(),before,'refund ledger and paid level roll back together');a.fail(false,false);t.eq(q.buy('bonds'),true,'refund transaction retry');}
      else t.eq(result,true,'refund/debit commits');
      t.eq(q.get().prisms,before.prisms-40+16,'separate 40 debit and 16 old refund');
      t.eq(q.get().nodes.bonds,9,'one Bonds level only');t.eq(q.get().nodes.reserves,2,'raw retired purchase record kept');
      t.eq(q.get().offline12hRefund.prismsPaid,[true,true],'both old ledger bits paid once');
      const loaded=app(source,a.storage);t.eq(loaded.q.get().prisms,q.get().prisms,'reload cannot repeat refund');
      loaded.q.save();t.eq(loaded.q.get().prisms,q.get().prisms,'repeat save cannot repeat refund');
    } finally {end();}
  }
}

function legacyAndDefaults(t) {
  const a=app(source),q=a.q,s=world(q);
  IDS.forEach(id=>delete s.nodes[id]);delete s.treeTrainingProgress;
  Object.assign(s.nodes,{starlight:7,steady:9,echo:10,bonds:30,swift:31,momentum:11,reserves:0});
  s.research.charge=28;s.research.resolve=33;s.research.formation=37;s.longStudyLevels.prismstudy=6;s.longStudyLevels.riftattune=4;
  s.owned={autoascend:true,comettrials:true,rifttrail:true,starfallcrest:true};s.autoAscendEnabled=true;s.autoAscendTargetDepth=121;
  q.set(s);const before=clone(q.get());
  for(const id of IDS)t.eq(before.nodes[id],0,'old save defaults new ownership to0 '+id);
  t.eq(before.treeTrainingProgress,0,'old save defaults training counter to0');
  for(const id of OLD_IDS)t.eq(before.nodes[id],s.nodes[id],'old raw paid level retained '+id);
  t.eq(q.offlineCap(),12,'unchanged fixed12h cap');t.near(q.offlineRate(),1.4,'old overcap Echo plus paid Rift Attunement');
  t.eq(q.costReduction(),.6,'old overcap Bonds keeps original60% ceiling');
  t.eq(q.prismMult(),(1+.04*31)*(1+.05*6),'old uncapped Swift and Clarity effect');
  t.eq(q.capacity(),5,'old save has five Formation slots');
  t.eq(q.get(),q.accept(q.get()),'normalization idempotent');q.save();t.eq(app(source,a.storage).q.get(),q.get(),'old paid state survives cold load');
  for(const [id,def] of Object.entries(LEGACY)) for(const level of [0,1,5,10,20,31]) {
    const test=world(q);test.nodes[id]=level;q.set(test);
    t.eq(q.cost(id),Math.ceil(def.base*Math.pow(def.growth,level)),'literal unowned old price '+id+'/'+level);
  }
  for(const rank of [0,1,5,1000000]) for(const value of [-1,0,1,9,10,42,7.75,NaN]) {
    const test=world(q);test.nodes.benchmentor=rank;test.treeTrainingProgress=value;q.set(test);
    const expected=rank>0 ? Math.max(0,Math.min(9,Number.isFinite(value)?Math.floor(value):0)) : 0;
    t.eq(q.get().treeTrainingProgress,expected,'training operating counter canonicalization '+rank+'/'+value);
  }
}

function charter(t,mutate) {
  for(const raw of ranksFor('swiftcharter')) for(const level of [0,9,10,11,20,30,50]) {
    const a=app(source),q=a.q,s=world(q);s.nodes.swift=level;s.nodes.swiftcharter=raw;q.set(s);const end=useMutation(q,mutate);
    try {
      const expected=raw&&level>=10?60+6*(level-10):Math.ceil(3*Math.pow(1.5,level));
      t.eq(q.cost('swift'),expected,'Charter affects only future level10+ price '+raw+'/'+level);
      q.get().prisms=expected;const mult=q.prismMult();
      t.eq(q.buy('swift'),true,'actual Charter-path Swift purchase');t.eq(q.get().prisms,0,'Charter quote fully debited');
      t.eq(q.get().nodes.swift,level+1,'same old paid Swift counter');t.near(q.prismMult(),mult+.04,'same earned4% bonus',1e-10);
    } finally {end();}
  }
}

function veteran(t,mutate) {
  for(const raw of ranksFor('veteranrecruits')) for(const id of ['tide','titan']) {
    const a=app(source),q=a.q,s=world(q);s.nodes.veteranrecruits=raw;s.nodes.benchmentor=1;q.set(s);
    const expected=1+effective('veteranrecruits',raw),cost=SPIRITS.find(sp=>sp.id===id).base;
    q.get().lumen=cost;const end=useMutation(q,mutate);
    try {
      t.eq(q.spiritPlan(id).levels,expected,'one paid recruitment grants starting levels');
      t.eq(q.buySpirit(id),true,'actual first recruitment');t.eq(q.get().spirits[id],expected,'Veteran recruit starts at promised level');
      t.eq(q.get().lumen,0,'only original recruitment price paid');t.eq(q.get().treeTrainingProgress,1,'bonus levels count as one paid action');
      q.get().lumen=1e9;t.eq(q.buySpirit(id),true,'subsequent Empower');t.eq(q.get().spirits[id],expected+1,'subsequent paid action adds just one level');
    } finally {end();}
  }
}

function gentle(t,mutate) {
  for(const raw of ranksFor('gentlegrowth')) for(const level of [0,25,26,50,100]) for(const bonds of [0,7,20]) {
    const a=app(source),q=a.q,s=world(q),sp=SPIRITS[0];s.nodes.gentlegrowth=raw;s.nodes.bonds=bonds;s.spirits.ember=level;
    if(level===0){s.spirits.tide=1;s.activeParty=['tide'];s.activeFormationPreset='';}
    q.set(s);t.eq(q.get().spirits.ember,level,'price fixture retains its requested Wisp level');
    const expected=rationalCost(sp,level,effective('gentlegrowth',raw),bonds),end=useMutation(q,mutate);
    try {
      t.eq(q.spiritCost('ember'),expected,'independent literal/rational Empower price '+raw+'/'+level+'/'+bonds);
      q.get().lumen=expected;t.eq(q.buySpirit('ember'),true,'actual Patient Growth purchase');
      t.eq(q.get().lumen,0,'exact quoted Wisp debit');t.eq(q.get().spirits.ember,level+1,'paid Wisp increment');
    } finally {end();}
  }
}

function empowerFaults(t,mutate) {
  for(const recruit of [false,true]) for(const fault of ['primary','recovery']) {
    const a=app(source),q=a.q,s=world(q);s.nodes.benchmentor=5;s.nodes.veteranrecruits=5;s.treeTrainingProgress=9;
    s.spirits.ember=recruit?0:1;s.spirits.tide=2;s.spirits.stone=2;s.activeParty=['tide'];s.activeFormationPreset='';q.set(s);q.save();
    const before=clone(q.get()),cost=q.spiritCost('ember'),p=a.storage.get(P),r=a.storage.get(R),end=useMutation(q,mutate);
    a.fail(fault==='primary',fault==='recovery');
    try {
      const result=q.buySpirit('ember');
      if(fault==='primary') {t.eq(result,false,'manual Empower primary failure reported');t.eq(q.get(),before,'manual Empower rolls back recruitment, training and Formation');t.eq([a.storage.get(P),a.storage.get(R)],[p,r],'manual failed slots intact');a.fail(false,false);t.eq(q.buySpirit('ember'),true,'one manual Empower retry');}
      else t.eq(result,true,'manual Empower primary survives recovery failure');
      t.eq(q.get().spirits.ember,before.spirits.ember+(recruit?6:1),'exact paid level endpoint after failure/retry');
      t.eq(q.get().lumen,before.lumen-cost,'one exact manual debit');
      t.eq(q.get().spirits.stone,7,'one separate Bench award after successful payment');t.eq(q.get().treeTrainingProgress,0,'one consumed training milestone');
      t.eq(app(source,a.storage).q.get(),q.get(),'cold load contains accepted paid endpoint');
    } finally {end();}
  }
}

function empowerHugeDebit(t,mutate) {
  for(const automatic of [false,true]) {
    const a=app(source),q=a.q,s=world(q);s.nodes.benchmentor=5;s.treeTrainingProgress=9;s.lumen=1e30;s.spirits.stone=2;s.activeParty=['ember'];s.achieved.labmaster=true;s.empowerQueue.ember=true;q.set(s);
    const before=clone(q.get()),end=useMutation(q,mutate);
    try {
      t.eq(automatic?q.autoEmpower():q.buySpirit('ember'),false,'unrepresentable '+(automatic?'automatic':'manual')+' Wisp price refused');
      t.eq(q.get(),before,'no free paid levels or Bench awards from huge wallet');
    } finally {end();}
  }
}

function formation(t,mutate) {
  const all=SPIRITS.map(sp=>sp.id);
  for(const raw of ranksFor('formationseat')) {
    const a=app(source),q=a.q,s=world(q);s.nodes.formationseat=raw;all.forEach(id=>s.spirits[id]=10);
    s.activeParty=all.slice(0,5);s.activeFormationPreset='push';s.formationPresets.push=all.slice(0,5);q.set(s);
    const before=clone(q.get()),end=useMutation(q,mutate),capacity=5+effective('formationseat',raw);
    try {
      t.eq(q.deed('fullparty'),true,'existing five-member Deed remains earned');
      t.eq(q.field('void'),capacity===6,'actual sixth Field button eligibility');
      t.eq(q.get().activeParty,all.slice(0,capacity),'sixth Active participates in real Formation');
      t.eq(q.get().formationPresets.push,all.slice(0,capacity),'sixth chosen member saved in preset');
      t.eq(q.field('aurora'),false,'seventh member refused');t.eq(q.get().spirits,before.spirits,'capacity neither recruits nor adds levels');
      t.eq(q.get().lumen,before.lumen,'Field has no recruitment payment');
      q.save();t.eq(app(source,a.storage).q.get().activeParty,all.slice(0,capacity),'capacity precedes save-party normalization');
      q.get().formationPresets.farm=all.slice(0,capacity).reverse();q.preset('farm');
      t.eq(q.get().activeParty,all.slice(0,capacity).reverse(),'actual saved-preset switch preserves order and capacity');
    } finally {end();}
  }
  const a=app(source),q=a.q;
  for(const owned of [0,1]) for(const globalOwned of [0,1]) {
    const global=world(q);global.nodes.formationseat=globalOwned;global.nodes.invitations=globalOwned?3:0;q.set(global);
    const other=world(q);other.nodes.formationseat=owned;other.nodes.invitations=owned?3:0;
    t.eq(q.capacity(other),5+owned,'Formation helper reads supplied snapshot');
    t.eq(q.unlock('titan',other),32-(owned?3:0),'recruitment helper reads supplied snapshot');
  }
}

function mentor(t,mutate) {
  for(const raw of ranksFor('benchmentor')) {
    const a=app(source),q=a.q,s=world(q);s.nodes.benchmentor=raw;s.nodes.veteranrecruits=5;
    s.spirits.ember=10;s.spirits.tide=2;s.spirits.stone=2;s.spirits.gale=1;s.activeParty=['ember','gale'];s.activeFormationPreset='';q.set(s);
    const end=useMutation(q,mutate),rank=effective('benchmentor',raw);
    try {
      for(let i=0;i<9;i++)t.eq(q.buySpirit('ember'),true,'successful paid action before tenth');
      t.eq(q.get().spirits.tide,2,'no early Bench award');t.eq(q.get().treeTrainingProgress,rank?9:0,'paid action count independent of levels');
      q.save();const restored=app(source,a.storage);t.eq(restored.q.get().treeTrainingProgress,rank?9:0,'training progress saved and reloaded');
      t.eq(q.buySpirit('ember'),true,'tenth actual paid action');
      t.eq(q.get().spirits.tide,2+rank,'lowest Bench and catalog-order tie receive rank levels');
      t.eq(q.get().spirits.stone,2,'tie does not train two Wisps');t.eq(q.get().spirits.gale,1,'lowest Active is ineligible');
      t.eq(q.get().treeTrainingProgress,0,'bonus levels do not recurse');
      for(let i=0;i<10;i++)q.buySpirit('ember');
      t.eq(q.get().spirits.stone,2+rank,'next milestone reevaluates lowest current Bench');
    } finally {end();}
  }
  const a=app(source),q=a.q,s=world(q);s.nodes.benchmentor=5;s.treeTrainingProgress=9;s.activeParty=['ember'];q.set(s);
  t.eq(q.buySpirit('ember'),true,'tenth action with no eligible Bench');t.eq(q.get().treeTrainingProgress,0,'unusable milestone is consumed');
  q.get().lumen=60;t.eq(q.buySpirit('tide'),true,'later actual recruitment');t.eq(q.get().spirits.tide,1,'missed milestone is never deferred');
  t.eq(q.get().treeTrainingProgress,1,'recruitment starts next ten-action cycle');
  const before=clone(q.get());q.get().lumen=0;const noFunds=clone(q.get());t.eq(q.buySpirit('ember'),false,'failed paid action');t.eq(q.get(),noFunds,'failed action cannot train');
  t.eq(before.spirits.tide,1,'no hidden free recruitment levels');
}

function batch(t,mutate) {
  for(const raw of ranksFor('empowerbatch')) for(const enabled of [false,true]) {
    const a=app(source),q=a.q,s=world(q);s.nodes.empowerbatch=raw;s.achieved.labmaster=enabled;
    s.nodes.bonds=0;s.nodes.swift=0;s.spirits.ember=1;s.activeParty=['ember'];s.empowerQueue.ember=true;s._autoEmpowerAccum=1000;q.set(s);
    // Persisted phases cap below one second; this is the actual live event boundary.
    q.get()._autoEmpowerAccum=1000;const before=clone(q.get()),end=useMutation(q,mutate),count=enabled?1+effective('empowerbatch',raw):0;
    try {
      const result=q.processAutoEmpower();
      t.eq(result.summary.empowers,count,'up to purchased throughput in one real timer event');
      t.eq(q.get().spirits.ember,1+count,'one separately paid level per action');
      const spent=Array.from({length:count},(_,i)=>oldCost(SPIRITS[0],1+i)).reduce((sum,v)=>sum+v,0);
      t.eq(q.get().lumen,before.lumen-spent,'batch requotes after every level');
      t.eq(q.get().achieved.labmaster,before.achieved.labmaster,'batch does not unlock automation');
      if(enabled)t.eq(q.get()._autoEmpowerAccum,0,'one second consumed once');
    } finally {end();}
  }
  const a=app(source),q=a.q,s=world(q);s.nodes.empowerbatch=4;s.achieved.labmaster=true;s.nodes.bonds=0;s.empowerQueue.ember=true;s.lumen=oldCost(SPIRITS[0],1)+oldCost(SPIRITS[0],2);q.set(s);q.get()._autoEmpowerAccum=1000;
  t.eq(q.processAutoEmpower().summary.empowers,2,'partial batch stops at exact remaining budget');t.eq(q.get().lumen,0,'partial batch spends no unpaid remainder');
  q.get().lumen=1000;q.get().empowerQueue.ember=false;q.get()._autoEmpowerAccum=1000;
  t.eq(q.processAutoEmpower().summary.empowers,0,'batch respects explicit OFF toggle');
}

function reserve(t,mutate) {
  for(const raw of ranksFor('recruitreserve')) for(const wallet of [59,60,100]) {
    const a=app(source),q=a.q,s=world(q);s.nodes.recruitreserve=raw;s.nodes.bonds=0;s.spirits.ember=1;s.spirits.tide=0;s.achieved.labmaster=true;
    s.activeParty=['ember'];s.activeFormationPreset='push';s.formationPresets.push=['ember','tide'];s.formationRebuild={members:['ember','tide'],preset:'push'};
    s.empowerQueue.ember=s.empowerQueue.tide=true;s.lumen=wallet;q.set(s);const end=useMutation(q,mutate),rank=effective('recruitreserve',raw);
    try {
      const priority=rank>0&&wallet>=60,canEmpower=wallet-11>=Math.ceil(60*rank/5);
      t.eq(q.autoEmpower(),priority||canEmpower,'actual reserved automatic affordability');
      t.eq(q.get().spirits.tide,priority?1:0,'affordable next remembered recruit has priority');
      t.eq(q.get().spirits.ember,1+(!priority&&canEmpower?1:0),'reserved budget protects existing-member spending');
      t.eq(q.get().lumen,wallet-(priority?60:canEmpower?11:0),'chosen automatic quote exactly paid');
    } finally {end();}
  }
  const a=app(source),q=a.q,s=world(q);s.nodes.recruitreserve=5;s.achieved.labmaster=true;s.lumen=59;
  s.formationPresets.push=['ember','tide'];s.formationRebuild={members:['ember','tide'],preset:'push'};s.empowerQueue.ember=true;s.empowerQueue.tide=false;q.set(s);
  t.eq(q.autoEmpower(),true,'disabled remembered recruit reserves nothing');t.eq(q.get().spirits.ember,2,'enabled existing Wisp still buys');
  q.get().empowerQueue.tide=true;q.get().lumen=oldCost(SPIRITS[0],2);t.eq(q.buySpirit('ember'),true,'manual Empower ignores recruitment reserve');t.eq(q.get().lumen,0,'manual exact payment remains available');
}

function invitations(t,mutate) {
  for(const raw of ranksFor('invitations')) for(const sp of SPIRITS) {
    const a=app(source),q=a.q,s=lowWorld(q,Math.max(1,sp.unlock-effective('invitations',raw)));s.nodes.invitations=raw;s.spirits[sp.id]=0;q.set(s);
    const immutable=[q.sp(sp.id).unlockDepth,q.rarityCost(sp.id,0),q.moduleCost(sp.id,0),q.ultimateCost(sp.id)],end=useMutation(q,mutate);
    try {
      const depth=Math.max(1,sp.unlock-effective('invitations',raw));
      t.eq(q.unlock(sp.id),depth,'earlier future recruitment depth '+sp.id+'/'+raw);
      if(sp.id!=='ember') {t.eq(q.buySpirit(sp.id),true,'actual recruitment at earlier gate '+sp.id);t.eq(q.get().spirits[sp.id],1,'one normal paid recruit level');}
      t.eq([q.sp(sp.id).unlockDepth,q.rarityCost(sp.id,0),q.moduleCost(sp.id,0),q.ultimateCost(sp.id)],immutable,'raw permanent-price anchor unchanged '+sp.id);
      if(depth>1) {const locked=lowWorld(q,depth-1);locked.nodes.invitations=raw;q.set(locked);const before=clone(q.get());t.eq(q.buySpirit(sp.id),false,'one Rift below reduced gate is locked');t.eq(q.get(),before,'reduced-gate rejection is pure');}
    } finally {end();}
  }
}

function transition(t,id,mutate) {
  for(const raw of ranksFor(id)) {
    const a=app(source),q=a.q,s=atCleared(q);s.nodes[id]=raw;s.activeFormationPreset='';
    s.spirits.tide=20;s.spirits.stone=30;s.spirits.gale=40;s.spirits.thorn=50;s.spirits.void=60;
    s.activeParty=['ember','tide','stone','gale','thorn'];
    SPIRITS.forEach((sp,i)=>s.heroResource[sp.id]=7.25+i*11);
    s.achieved.autotap=s.achieved.labmaster=true;s._autoTapAccum=375.125;s._autoEmpowerAccum=847.5;
    s.buffUntil=CLOCK+3000;s.buffMult=1.7;s.supportBuffs={version:1,sources:{tide:{until:CLOCK+4000,mult:1.25},aurora:{until:CLOCK+2500,mult:1.5}}};
    q.set(s);const before=clone(q.get()),countBefore=before.ascendCount,spawns=[],stop=q.observeSpawns(v=>spawns.push(v)),end=useMutation(q,mutate),rank=effective(id,raw);
    try {
      t.eq(q.ascend(),true,'actual manual transition executes');t.eq(q.get().ascendCount,countBefore+1,'real Ascend counter increments before benefit assertions');
      t.eq(q.get().prisms,before.prisms+oldPrismReward(50,25,before.nodes.swift,0),'base Prism payout accompanies transition');
      t.eq(q.get().nodes[id],raw,'paid raw node level remains after reset');
      if(id==='lumenmemory')t.eq(q.get().lumen,Math.min(before.lumen*(rank/20),50000*rank),'exact owned Lumen carry');
      if(id==='veteranrecruits')t.eq(q.get().spirits.ember,1+rank,'reset Ember uses paid starting level');
      if(id==='rosterrecall') {
        const recalled=['tide','stone','gale','thorn'].slice(0,rank);
        t.eq(SPIRITS.filter(sp=>sp.id!=='ember'&&q.get().spirits[sp.id]>0).map(sp=>sp.id),recalled,'first paid additional remembered members recalled');
        recalled.forEach(key=>t.eq(q.get().spirits[key],1,'Recall recruits without buying an Empower'));
        t.eq(q.get().spirits.void,0,'recruited but unremembered Bench is not recalled');
      }
      if(id==='chargememory') {
        for(const sp of SPIRITS)t.near(q.get().heroResource[sp.id],before.heroResource[sp.id]*rank/5,'each actual charge retained '+sp.id);
        t.eq(q.get().spirits.titan,0,'dormant charge does not recruit its Wisp');
        q.get().lumen=2200000;const charge=q.get().heroResource.titan;t.eq(q.buySpirit('titan'),true,'later dormant Wisp recruited');t.eq(q.get().heroResource.titan,charge,'recruitment does not erase stored charge');
      }
      if(id==='supportmemory') {
        t.eq(q.get().supportBuffs,rank?before.supportBuffs:null,'Support source snapshots retained exactly');
        t.eq([q.get().buffUntil,q.get().buffMult],rank?[before.buffUntil,before.buffMult]:[0,1],'opaque legacy blessing retained without refresh');
        t.eq(q.buff(CLOCK+5000),1,'original deadlines still expire after reset');
      }
      if(id==='phasememory')t.eq([q.get()._autoTapAccum,q.get()._autoEmpowerAccum],rank?[375.125,847.5]:[0,0],'only existing unlocked timer phase carried');
      if(id==='riftstep') {
        t.eq([q.get().depth,q.get().enemyDepth],[1+rank,1+rank],'new run enemy starts at purchased Rift');
        t.eq(spawns,[{depth:1+rank,enemyDepth:1+rank}],'one actual reset spawn only');
        t.eq([q.get().totalKills,q.get().shards,q.get().sigils,q.get().motes,q.get().maxDepthEver],[before.totalKills,before.shards,before.sigils,before.motes,before.maxDepthEver],'skipped Rifts grant no kills/resources/new record');
      }
    } finally {end();stop();}
  }
}

function carryEdges(t) {
  for(const lumen of [0,10,1000000000]) {
    const a=app(source),q=a.q,s=atCleared(q);s.nodes.lumenmemory=5;s.lumen=lumen;q.set(s);q.ascend();
    t.eq(q.get().lumen,Math.min(lumen/4,250000),'carry cannot create an empty wallet or exceed rank cap');
  }
  for(const unlocked of [false,true]) {
    const a=app(source),q=a.q,s=atCleared(q);s.nodes.phasememory=1;s.achieved.autotap=s.achieved.labmaster=unlocked;
    s._autoTapAccum=s._autoEmpowerAccum=999.999;q.set(s);q.ascend();
    t.eq([q.get()._autoTapAccum,q.get()._autoEmpowerAccum],unlocked?[999.999,999.999]:[0,0],'phase memory cannot create locked automation');
  }
  const a=app(source),q=a.q,s=atCleared(q);s.nodes.rosterrecall=4;s.nodes.veteranrecruits=3;
  s.spirits.tide=10;s.spirits.stone=0;s.spirits.gale=20;s.activeFormationPreset='push';
  s.formationPresets.push=['ember','stone','gale','tide'];s.formationRebuild={members:['ember','stone','gale','tide'],preset:'push'};s.activeParty=['ember','gale','tide'];q.set(s);q.ascend();
  t.eq(q.get().spirits.stone,0,'pending unowned remembered Wisp receives no free Recall');
  t.eq([q.get().spirits.ember,q.get().spirits.gale,q.get().spirits.tide],[4,4,4],'Recall and Veteran compose at starting levels');
  t.eq(q.chosen(),['ember','stone','gale','tide'],'full ordered rebuild intent survives skipped unowned member');
}

function frontierCases(t,mutate) {
  for(const raw of ranksFor('frontier')) for(const clear of [14,15,24,25,49,50,75,100]) for(const benchmark of [0,24,25,50]) {
    const a=app(source),q=a.q,s=atCleared(q,clear);s.nodes.frontier=raw;s.ascendRewardedDepth=benchmark;q.set(s);const end=useMutation(q,mutate);
    try {
      const expected=oldBreakdown(clear,benchmark),bonus=clear<15?0:frontier(clear,benchmark,effective('frontier',raw));
      if(bonus>0){expected.frontier=bonus;expected.gain+=bonus;}
      t.eq(q.prismPreview(),expected,'canonical independent base plus new Frontier term '+raw+'/'+clear+'/'+benchmark);
      if(clear>=15) {
        const before=clone(q.get());t.eq(q.ascend(),true,'Frontier actual Ascend');
        t.eq(q.get().prisms,before.prisms+expected.gain,'Frontier paid once to Prism wallet');
        t.eq(q.get().ascendRewardedDepth,Math.max(clear,benchmark),'existing benchmark advances once');
      }
    } finally {end();}
  }
}

function frontierRepeat(t,mutate) {
  const a=app(source),q=a.q,s=atCleared(q,75);s.nodes.frontier=5;s.ascendRewardedDepth=0;q.set(s);const end=useMutation(q,mutate);
  try {
    const initial=q.get().prisms;t.eq(q.ascend(),true,'first record Ascend');
    const first=oldPrismReward(75,0,10,0)+15;t.eq(q.get().prisms,initial+first,'first three milestone blocks earned');
    q.save();const loaded=app(source,a.storage);t.eq(loaded.q.get().prisms,initial+first,'load does not repeat milestone award');
    q.get().depth=q.get().enemyDepth=76;q.get().enemyHp=q.get().enemyMaxHp=1e15;
    const before=q.get().prisms;t.eq(q.ascend(),true,'repeat run actually Ascends');
    t.eq(q.get().prisms,before+oldPrismReward(75,75,10,0),'repeated record has no Frontier award');
  } finally {end();}
}

function dustCases(t,mutate) {
  for(const raw of ranksFor('stardust')) for(const clear of [20,100,1000]) {
    const a=app(source),q=a.q,s=atCleared(q,clear);s.maxDepthEver=clear+1;s.ascendRewardedDepth=0;s.nodes.swift=100;s.nodes.stardust=raw;
    q.set(s);const before=clone(q.get()),gain=oldPrismReward(clear,0,100,0),end=useMutation(q,mutate),rank=effective('stardust',raw);
    try {
      t.eq(q.ascend(),true,'actual Dust Ascend');t.eq(q.get().prisms,before.prisms+gain,'Dust never spends Prisms');
      t.eq(q.get().motes,before.motes+dust(gain,rank),'Dust from final actually credited Prism gain, with per-run cap');
      const stable=clone(q.get());q.save();t.eq(app(source,a.storage).q.get().motes,stable.motes,'Dust never repeats on save/load');
    } finally {end();}
  }
  const a=app(source),q=a.q,s=atCleared(q,1000);s.maxDepthEver=1001;s.nodes.stardust=5;s.nodes.swift=100;s.prisms=1e30;q.set(s);
  const before=q.get().motes;t.eq(q.ascend(),true,'legacy huge-Prism Ascend remains available');t.eq(q.get().motes,before,'uncredited nominal Prisms cannot create Dust');
}

function wall(t,mutate) {
  for(const raw of ranksFor('wallwisdom')) {
    const a=app(source),q=a.q,s=world(q);s.nodes.wallwisdom=raw;s.nodes.swift=0;s.depth=s.enemyDepth=100;s.enemyHp=s.enemyMaxHp=1e50;s.spirits.ember=1;q.set(s);
    t.eq(q.estimatedBoss(100),Infinity,'fixture is a real sustained-DPS boss wall');
    const end=useMutation(q,mutate),grace=300-60*effective('wallwisdom',raw);
    try {
      q.advance(grace-.001,{kind:'offline',clockStartMs:CLOCK});t.eq(q.get().riftMode,'push','offline grace does not retreat early');
      const result=q.advance(.001,{kind:'offline',clockStartMs:CLOCK+(grace-.001)*1000,offlineWindowStartMs:CLOCK});
      t.eq(result.retreats,1,'genuine wall retreats at purchased grace');t.eq(q.get().riftMode,'farm','actual offline mode transition');
      t.eq(q.get().farmReturnDepth,100,'original Push target retained');t.eq(q.offlineCap(),12,'wall grace never changes offline time cap');
    } finally {end();}
  }
  const a=app(source),q=a.q,s=world(q);s.nodes.wallwisdom=4;s.depth=s.enemyDepth=100;s.enemyHp=s.enemyMaxHp=1e50;q.set(s);
  q.advance(61,{kind:'live',clockStartMs:CLOCK});t.eq(q.get().riftMode,'push','Tree wall grace never retreats live play');
}

function paidState(q,automatic=false,clear=50) {
  const s=atCleared(q,clear);CATALOG.forEach(d=>s.nodes[d.id]=d.cap);
  s.nodes.echo=10;s.nodes.bonds=28;s.nodes.swift=31;s.nodes.starlight=7;s.nodes.steady=9;s.nodes.momentum=11;
  q.forgeDefs().forEach(d=>s.research[d.id]=d.levelCap||7);
  s.longStudyLevels.labcapacity=2;
  q.projects().forEach(d=>s.longStudyLevels[d.id]=d.levelCap?Math.min(d.levelCap,2):3);
  s.longStudyLevels.prismstudy=6;s.longStudyLevels.riftattune=4;s.longStudyLevels.formationstudy=5;
  s.activeStudies=['wispascend','prismstudy','procurement','catalysis','fieldnotes','focusprotocol','bossledger'].map((id,i)=>{
    const speed=[1.5,2,3,4,5,6,8][i];s.studyQueue[id]=true;s.studyUseMotes[id]=true;s.studySpeedTargets[id]=speed;
    return {id,remainingSec:1800+i*60,totalDurationSec:2700+i*60,speedMult:speed};
  });
  SPIRITS.forEach((sp,i)=>{s.spirits[sp.id]=20+i;s.heroResource[sp.id]=5+8*i;s.heroRarity[sp.id]=5;s.wispModules[sp.id]=20;s.wispUltimate[sp.id]=true;});
  s.activeParty=SPIRITS.slice(0,6).map(sp=>sp.id);s.activeFormationPreset='push';s.formationPresets.push=s.activeParty.slice();
  s.formationPresets.farm=s.activeParty.slice().reverse();s.formationPresets.boss=['titan','aurora','tide','stone','ember','void'];
  s.owned={autoascend:true,comettrials:true,rifttrail:true,starfallcrest:true};s.cometCosmetics={trail:true,crest:true};
  s.autoAscendEnabled=automatic;s.autoAscendTargetDepth=clear+1;
  s.achieved.autotap=true;s.achieved.labmaster=true;s._autoTapAccum=375.125;s._autoEmpowerAccum=847.5;
  s.buffUntil=CLOCK+3000;s.buffMult=1.7;s.supportBuffs={version:1,sources:{tide:{until:CLOCK+4000,mult:1.55},aurora:{until:CLOCK+2500,mult:1.3}}};
  s.treeTrainingProgress=7;s.sigilResonanceUses=3;
  return s;
}
const PAID_FIELDS=['nodes','research','longStudyLevels','owned','heroRarity','wispModules','wispUltimate','studyQueue','studyUseMotes','studySpeedTargets','empowerQueue','researchQueue','formationPresets','cometCosmetics'];
function assertPaidReset(t,before,after,clear,label) {
  const gain=oldPrismReward(clear,before.ascendRewardedDepth,before.nodes.swift,before.longStudyLevels.prismstudy)+frontier(clear,before.ascendRewardedDepth,5);
  t.eq(after.ascendCount,before.ascendCount+1,label+' actual counter before preservation');
  t.eq([after.depth,after.enemyDepth],[6,6],label+' actual reset at paid starting Rift');
  t.eq(after.prisms,before.prisms+gain,label+' independently computed complete Prism payout');
  t.eq(after.ascendRewardedDepth,Math.max(clear,before.ascendRewardedDepth),label+' rewarded benchmark updated once');
  t.eq(after.lumen,Math.min(before.lumen/4,250000),label+' exact event-time Lumen carry');
  t.eq(after.motes,before.motes+dust(gain,5),label+' actual Ascend Dust');
  t.eq(after.spirits.ember,6,label+' Veteran reset Ember');
  for(const id of ['tide','stone','gale','thorn'])t.eq(after.spirits[id],6,label+' first four additional recalls '+id);
  for(const id of ['void','aurora','titan'])t.eq(after.spirits[id],0,label+' other run levels reset '+id);
  t.eq(after.treeTrainingProgress,0,label+' run training counter resets');t.eq(after.sigilResonanceUses,0,label+' original Resonate use counter resets');
  for(const sp of SPIRITS)t.near(after.heroResource[sp.id],before.heroResource[sp.id],label+' paid charge retention '+sp.id);
  t.eq(after.supportBuffs,before.supportBuffs,label+' unchanged paid Support snapshots');t.eq([after.buffUntil,after.buffMult],[before.buffUntil,before.buffMult],label+' opaque blessing retained');
  t.eq([after._autoTapAccum,after._autoEmpowerAccum],[before._autoTapAccum,before._autoEmpowerAccum],label+' event-time automation phases');
  for(const field of PAID_FIELDS)t.eq(after[field],before[field],label+' all paid data and intent survive '+field);
  t.eq(after.activeStudies,before.activeStudies,label+' all seven already-paid Study snapshots survive');
  t.eq([after.autoAscendEnabled,after.autoAscendTargetDepth],[before.autoAscendEnabled,before.autoAscendTargetDepth],label+' Auto-Ascend intent remains unchanged');
  return gain;
}

function paidAscends(t,mutate) {
  for(const route of ['manual','live','offline']) {
    const a=app(source),q=a.q,s=paidState(q,route!=='manual');
    if(route!=='manual')s.depth=s.enemyDepth=50;
    q.set(s);const end=useMutation(q,mutate),ascends=[],stop=q.observeAscends(v=>ascends.push(v));
    try {
      t.eq(q.get().activeStudies.length,7,'fixture really contains seven paid studies');t.eq(q.get().activeParty.length,6,'fixture really contains six Active members');
      if(route==='manual')t.eq(q.ascend(),true,'actual manual paid Ascend');
      else {
        t.eq(q.advance(0,{kind:route,clockStartMs:CLOCK}).ascends,0,'target boss must actually be cleared');
        q.get().enemyHp=0;const summary=q.advance(0,{kind:route,clockStartMs:CLOCK});
        t.eq([summary.kills,summary.bossKills,summary.ascends],[1,1,1],'one actual boss kill and Auto-Ascend '+route);
        t.eq(summary.ascendGains,[ascends[0].gain],'simulation reports actual payout once');
      }
      t.eq(ascends.length,1,'one real mutation observed '+route);
      const event=ascends[0];assertPaidReset(t,event.before,event.after,50,route);
      // Canonicalization immediately following automatic mutation must preserve
      // the same paid endpoint, rather than just a transient observer snapshot.
      for(const field of PAID_FIELDS)t.eq(q.get()[field],event.after[field],route+' canonical endpoint retains '+field);
      t.eq(q.slots(),7,'paid Lab capacity survives Tree Ascend');t.eq(q.capacity(),6,'paid Tree capacity survives Ascend');
      q.save();const accepted=clone(q.get());t.eq(app(source,a.storage).q.get(),accepted,route+' actual cold load');
      const restore=app(source);restore.area.value=q.export();restore.q.restore();restore.drain();t.eq(restore.reloads(),1,route+' actual backup restore requests reload');
      t.eq(app(source,restore.storage).q.get(),accepted,route+' actual backup import retains all value');
      a.storage.set(P,'broken');const recovered=app(source,a.storage);t.eq(recovered.q.get(),accepted,route+' recovery restores committed Tree/Forge/Lab values');
      t.eq(recovered.storage.get(P),recovered.storage.get(R),route+' recovery repairs primary once');
    } finally {end();stop();}
  }
}

function manualAscendFault(t,mutate) {
  for(const fault of ['primary','recovery']) {
    const a=app(source),q=a.q;q.set(paidState(q));q.save();const before=clone(q.get()),oldRun=q.runToken(),p=a.storage.get(P),r=a.storage.get(R),end=useMutation(q,mutate);
    a.fail(fault==='primary',fault==='recovery');
    try {
      const result=q.ascend();
      if(fault==='primary') {
        t.eq(result,false,'manual Ascend reports failed primary');t.eq(q.get(),before,'manual Ascend rolls back complete reset and awards');
        t.ok(q.runToken()===oldRun,'manual Ascend restores original transient run identity');t.eq([a.storage.get(P),a.storage.get(R)],[p,r],'manual failed reset leaves both slots intact');
        a.fail(false,false);t.eq(q.ascend(),true,'retry actually executes one manual Ascend');
      } else {t.eq(result,true,'manual Ascend primary commit survives recovery fault');t.eq(a.storage.get(R),r,'recovery remains earlier until repaired');}
      t.ok(q.runToken()!==oldRun,'accepted Ascend changes transient run identity');
      assertPaidReset(t,before,q.get(),50,'manual '+fault+' retry');
      t.eq(app(source,a.storage).q.get(),q.get(),'manual accepted reset reloads without duplicate awards');
    } finally {end();}
  }
}

function manualKillAutoFailure(t,mutate) {
  const a=app(source),q=a.q,s=atCleared(q,48);
  s.maxDepthEver=49;s.depth=s.enemyDepth=49;s.enemyHp=1;s.enemyMaxHp=100;
  s.nodes.lumenmemory=1;s.nodes.veteranrecruits=1;s.nodes.riftstep=1;
  s.owned.autoascend=true;s.autoAscendEnabled=true;s.autoAscendTargetDepth=50;
  s.achieved={};q.achievementDefs().forEach(deed=>{if(deed.id!=='d50')s.achieved[deed.id]=true;});
  s.comets=200;s.lumen=1000;s.prisms=100;s.spirits.ember=10;s.totalKills=7;s.totalTaps=3;
  q.set(s);q.save();const before=clone(q.get()),run=q.runToken(),p=a.storage.get(P),r=a.storage.get(R),observed=[];
  t.eq(q.get().achieved.d50,undefined,'Rift50 Deed is genuinely pending before the kill');
  t.eq(q.autoReady(),false,'target Rift49 has not yet been cleared');
  const end=useMutation(q,mutate),stop=q.observeAutoChecks(event=>observed.push(event));
  try {
    a.fail(true,false);q.manualTap();
    // This gameplay assertion also kills the ignored-return mutant: the normal
    // post-kill tail must still award the newly reached Deed after reset rollback.
    t.eq(q.get().achieved.d50,true,'failed Auto-Ascend must execute the normal post-kill achievement tail');
    t.eq(q.get().comets,before.comets+20,'one real Rift50 Deed award after the failed reset');
    t.eq(observed,[{result:false,beforeDepth:50,afterDepth:50,beforeCount:3,afterCount:3,sameRun:true}],'actual manual-kill Auto-Ascend returns false after full rollback');
    t.eq([q.get().depth,q.get().enemyDepth,q.get().ascendCount],[50,50,3],'failed reset retains the completed kill and its next enemy');
    t.ok(q.runToken()===run,'failed manual-kill Auto-Ascend keeps the same run object');
    t.eq(q.get().prisms,before.prisms,'failed reset credits no Prisms');
    t.eq(q.get().lumen,before.lumen+Math.round(5*Math.pow(1.11,49)),'earned kill Lumen remains live without applying carry');
    t.eq(q.get().spirits.ember,10,'failed reset does not replace paid run levels');
    t.eq([q.get().totalKills,q.get().totalTaps],[8,4],'only one actual tap and enemy kill');
    t.eq([a.storage.get(P),a.storage.get(R)],[p,r],'failed primary leaves the earlier persisted endpoint intact');
    const earned=clone(q.get());a.fail(false,false);t.eq(q.checkAuto(),true,'actual retry returns committed Ascend success');
    t.eq(q.get().ascendCount,4,'retry performs exactly one accepted reset');t.eq([q.get().depth,q.get().enemyDepth],[2,2],'retry reaches the purchased next-run Rift');
    t.ok(q.runToken()!==run,'successful retry advances run identity');
    t.eq(q.get().prisms,earned.prisms+oldPrismReward(49,25,10,0),'retry credits independent Prism reward exactly once');
    t.eq(q.get().lumen,earned.lumen*.05,'retry carries only its actual event-time wallet');t.eq(q.get().spirits.ember,2,'retry applies Veteran start once');
    t.eq(q.get().comets,before.comets+20,'retry does not duplicate the earned Deed');
    t.eq([q.get().totalKills,q.get().totalTaps],[8,4],'retry neither replays the tap nor adds a kill');
    const accepted=clone(q.get());t.eq(q.checkAuto(),false,'completed retry is no longer eligible');t.eq(q.get(),accepted,'repeat check has no replay');
    t.eq(app(source,a.storage).q.get(),accepted,'committed retry and the post-kill Deed survive reload');
  } finally {stop();end();}
}

function noReplay(t) {
  const a=app(source),q=a.q,s=paidState(q);q.set(s);const before=clone(q.get());
  IDS.forEach(id=>q.effect(id));t.eq(q.get(),before,'all native effect previews are pure');
  for(let i=0;i<3;i++){q.set(q.get());q.save();q.load();t.eq(q.get(),before,'save/load never replays a transition '+i);}
  t.eq(q.buy('swift'),true,'ordinary permanent purchase on paid transition state');
  for(const field of ['lumen','motes','depth','spirits','heroResource','supportBuffs','treeTrainingProgress'])t.eq(q.get()[field],before[field],'Tree purchase does not execute Ascend benefit '+field);
  const expected=clone(q.get()),restore=app(source);restore.area.value=q.export();restore.q.restore();restore.drain();
  const cold=app(source,restore.storage);t.eq(cold.q.get(),expected,'backup import does not replay carry, recall or Dust');
  cold.q.save();t.eq(cold.q.get(),expected,'repeat imported save remains stable');
}

function singleTrial(t) {
  for(const route of ['manual','live','offline']) {
    const a=app(source),q=a.q,s=paidState(q,route!=='manual');s.cometTrial={id:'single',target:50,phase:'pending'};
    if(route!=='manual')s.depth=s.enemyDepth=50;q.set(s);
    const intent=q.chosen();if(route==='manual')q.ascend();else{q.get().enemyHp=0;q.advance(0,{kind:route,clockStartMs:CLOCK});}
    t.eq(q.get().cometTrial.phase,'active','pending Single Star begins after actual '+route+' Ascend');
    t.eq(q.get().cometTrial.failed,false,'Recall cannot fail a newly started single-Wisp trial');
    t.eq(q.get().activeParty,['ember'],'pending Single Star pauses automatic additional Recall');
    t.eq(q.get().spirits.tide,0,'trial pause does not grant hidden free recruit');t.eq(q.chosen(),intent,'trial pause retains complete chosen Formation intent');
    q.save();t.eq(app(source,a.storage).q.get().cometTrial,q.get().cometTrial,'single trial state remains valid after reload');
  }
}

function offlinePaidTransaction(t) {
  for(const fault of ['none','primary','recovery']) {
    const a=app(source),q=a.q,s=atCleared(q,50);s.nodes.empowerbatch=4;s.nodes.benchmentor=5;s.achieved.labmaster=true;
    s.activeParty=['ember'];s.activeFormationPreset='';s.spirits.ember=1;s.spirits.tide=2;s.empowerQueue.ember=true;s.treeTrainingProgress=9;
    s.nodes.swift=0;s.lumen=10000;s.enemyHp=s.enemyMaxHp=1e50;q.set(s);q.save();const before=clone(q.get()),p=a.storage.get(P),r=a.storage.get(R);
    a.clock(CLOCK+5000);a.fail(fault==='primary',fault==='recovery');let result,error;
    q.offline((value,err)=>{result=value;error=err;});a.drain();
    if(fault==='primary') {
      t.ok(error,'offline primary failure reported');t.eq(q.get(),before,'offline transaction rolls back all queued paid and Bench levels');
      t.eq([a.storage.get(P),a.storage.get(R)],[p,r],'offline failure leaves original saved endpoint');
      a.fail(false,false);q.offline((value,err)=>{result=value;error=err;});a.drain();
    }
    t.ok(!error,'offline paid transaction commits after retry');t.eq(result.effectiveSec,5,'actual five-second offline window');
    t.eq(q.get().dailyStats.empowers-(before.dailyStats.empowers||0),25,'five paid actions in each of five actual seconds');
    t.eq(q.get().spirits.ember,26,'25 paid automatic increments');t.eq(q.get().spirits.tide,17,'three separately counted Bench awards');
    t.eq(q.get().treeTrainingProgress,4,'paid training remainder survives transaction');
    const spent=Array.from({length:25},(_,i)=>oldCost(SPIRITS[0],i+1)).reduce((sum,cost)=>sum+cost,0);
    t.eq(q.get().lumen,before.lumen-spent,'offline exact sum of sequential actual quotes');
    const accepted=clone(q.get());t.eq(q.offline(),null,'same offline window cannot replay');t.eq(q.get(),accepted,'repeat offline call preserves committed endpoint');
    a.fail(false,false);q.save();t.eq(app(source,a.storage).q.get(),q.get(),'offline purchases and Bench progress survive cold restart');
  }
}

const CASES=[
  ['catalogue',catalogue],['node-storage-faults',nodeFaults],['node-huge-debit',nodeHugeDebit],['delayed-F26-refund',deferredRefund],['legacy-and-defaults',legacyAndDefaults],
  ['swiftcharter',charter],['veteranrecruits',veteran],['gentlegrowth',gentle],['empower-storage-faults',empowerFaults],['empower-huge-debit',empowerHugeDebit],
  ['formationseat',formation],['benchmentor',mentor],['empowerbatch',batch],['recruitreserve',reserve],['invitations',invitations],
  ...['lumenmemory','veteranrecruits','rosterrecall','chargememory','supportmemory','phasememory','riftstep'].map(id=>['transition-'+id,(t,m)=>transition(t,id,m)]),
  ['carry-edges',carryEdges],['frontier',frontierCases],['frontier-repeat',frontierRepeat],['stardust',dustCases],['wallwisdom',wall],
  ['all-paid-actual-Ascends',paidAscends],['manual-Ascend-storage-fault',manualAscendFault],['manual-kill-Auto-Ascend-failure',manualKillAutoFailure],['no-transition-replay',noReplay],['single-trial',singleTrial],['offline-paid-transaction',offlinePaidTransaction]
];
function run() {
  const records=[];let checks=0;
  for(const [name,fn] of CASES) {const t=counter(name);fn(t);checks+=t.checks;records.push({name,checks:t.checks});}
  const negatives=[];
  if(process.argv.includes('--negative')) {
    const effectCases={swiftcharter:charter,veteranrecruits:veteran,gentlegrowth:gentle,formationseat:formation,benchmentor:mentor,empowerbatch:batch,recruitreserve:reserve,invitations:invitations,frontier:frontierCases,stardust:dustCases,wallwisdom:wall};
    for(const id of ['lumenmemory','rosterrecall','chargememory','supportmemory','phasememory','riftstep'])effectCases[id]=(t,m)=>transition(t,id,m);
    const specs=Object.entries(effectCases).map(([id,fn])=>['drop-'+id,fn,q=>q.disable(id)]).concat([
      ['wrong-price',catalogue,q=>q.corruptPrice()],['ignore-unlock',catalogue,q=>q.ignoreUnlock()],
      ['free-Tree-huge-wallet',nodeHugeDebit,q=>q.bypassNodeExactDebit()],['free-Wisp-huge-wallet',empowerHugeDebit,q=>q.bypassSpiritExactDebit()],
      ['Tree-primary-leak',nodeFaults,q=>q.leakPrimaryMutation()],['Wisp-primary-leak',empowerFaults,q=>q.leakPrimaryMutation()],
      ['Ascend-primary-leak',manualAscendFault,q=>q.leakPrimaryMutation()],['Ascend-rollback-token',manualAscendFault,q=>q.loseRollbackToken()],['ignored-Auto-Ascend-result',manualKillAutoFailure,q=>q.ignoreAutoAscendResult()],['lost-paid-Ascend',paidAscends,q=>q.losePaidAscend()],
      ['double-Frontier',frontierRepeat,q=>q.doubleFrontier()]
    ]);
    for(const [name,fn,mutate] of specs) {
      const t=counter('negative '+name);let error;
      try {fn(t,mutate);}catch(err){error=err;}
      assert(error,'negative mutant survived: '+name);
      assert.equal(error.code,'ERR_ASSERTION','negative must fail a real assertion, not harness/runtime: '+name+' '+error.stack);
      negatives.push({name,status:'killed',checksBeforeFailure:t.checks,assertion:error.message});
    }
  }
  return {status:'PASS',checks,cases:records,negativeCount:negatives.length,negative:negatives,activePurchaseTypes:20,newPurchaseTypes:17,priceOracle:'independent fixed integer Prism ladders; independent BigInt rational moderate Empower cases',scope:'Complete production game IIFE, original purchases/save/backup and manual/live/offline mutation paths. Tree supports single purchases only; no Tree bulk or queue acceptance. Long offline/numerical/mobile/actual V8 run in separate suites. Native Android integration untested.'};
}
try {
  const result=run();process.stdout.write(JSON.stringify({...result,sourceSha256:hash(source),harnessSha256:hash(fs.readFileSync(path.join(__dirname,'tree-expansion-harness.cjs'))),testSha256:hash(fs.readFileSync(__filename)),node:process.versions.node,v8:process.versions.v8},null,2)+'\n');
} catch(error) {
  process.stdout.write(JSON.stringify({status:'FAIL',sourceSha256:hash(source),error:{name:error.name,code:error.code,message:error.message,stack:error.stack}},null,2)+'\n');process.exitCode=1;
}
