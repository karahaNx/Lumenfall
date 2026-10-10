'use strict';

// Node-only independent arithmetic. The shared bridge executes the complete
// game with BigInt absent; none of these oracle calculations ship to WebView.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {app, seed, clone, P, R, CLOCK} = require('./tree-expansion-harness.cjs');
const {reward} = require('./prism-earning-reference.cjs');

const FIXTURE_PATH = path.join(__dirname, 'fixtures.json');
const FIXTURE_SHA = 'ab43604db1b5bce8b9990506f989676dfb0009cdcf2e514a8ccee9da166c8753';
const PRICES = {
  swiftcharter: [200], lumenmemory: [8,16,28,44,64],
  veteranrecruits: [5,10,18,30,46], rosterrecall: [15,30,55,90],
  chargememory: [12,22,38,60,90], supportmemory: [60], phasememory: [35],
  riftstep: [12,24,42,68,104], frontier: [20,35,55,80,110],
  stardust: [10,18,30,46,66], gentlegrowth: [12,22,38,60,90],
  formationseat: [120], benchmentor: [10,18,30,46,66],
  empowerbatch: [15,28,46,70], wallwisdom: [12,22,36,54],
  invitations: [4,9,16], recruitreserve: [8,16,28,44,64]
};
const BASE_COST = {ember:10,tide:60,stone:360,gale:2100,thorn:12000,void:70000,aurora:400000,titan:2200000};
const IDS = Object.keys(BASE_COST);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function checks() {
  return {
    count: 0,
    ok(value, label) { this.count++; assert(value, label); },
    eq(actual, expected, label) { this.count++; assert.deepEqual(actual, expected, label); },
    near(actual, expected, tolerance, label) {
      this.count++;
      assert(Number.isFinite(actual) && Number.isFinite(expected) &&
        Math.abs(actual-expected) <= tolerance * Math.max(1,Math.abs(expected)),
      label + ': actual=' + actual + ' expected=' + expected);
    }
  };
}
function quiet(s) {
  for (const key of ['empowerQueue','researchQueue','studyQueue','studyUseMotes']) {
    Object.keys(s[key] || {}).forEach(id => { s[key][id] = false; });
  }
  s.activeStudies = [];
  return s;
}
function fixture(q, id) {
  const bytes = fs.readFileSync(FIXTURE_PATH);
  assert.equal(hash(bytes), FIXTURE_SHA, 'historical public fixture bytes remain frozen');
  const raw = clone(JSON.parse(bytes)[id].save);
  raw.lastSeen = CLOCK; raw.questDay = q.day();
  q.set(raw);
  const s = clone(q.get());
  for (const id of Object.keys(PRICES)) assert.equal(s.nodes[id], 0, 'old fixture new ownership starts at zero: '+id);
  return quiet(s);
}
function buyRanks(q, wanted, a) {
  const total = Object.entries(wanted).reduce((sum,[id,rank]) => sum+PRICES[id].slice(0,rank).reduce((x,y)=>x+y,0),0);
  const s = clone(q.get()); s.prisms = total; q.set(s);
  const receipts = [];
  for (const [id,rank] of Object.entries(wanted)) {
    for (let level=0;level<rank;level++) {
      const before = q.get().prisms, price = PRICES[id][level];
      a.eq(q.cost(id),price,'independent paid profile quote '+id+'/'+level);
      a.eq(q.buy(id),true,'actual paid profile purchase '+id+'/'+level);
      a.eq(before-q.get().prisms,price,'exact profile debit '+id+'/'+level);
      a.eq(q.get().nodes[id],level+1,'one profile rank '+id+'/'+level);
      receipts.push({id,level:level+1,price});
    }
  }
  a.eq(q.get().prisms,0,'profile funding equals the complete independent price ledger');
  return {funding:total,purchases:receipts};
}
function legacySwift(level) {
  const denominator = 2n ** BigInt(level), numerator = 3n * 3n ** BigInt(level);
  return Number((numerator+denominator-1n)/denominator);
}
function charterSwift(level, owned) { return owned && level>=10 ? 6*level : legacySwift(level); }
function frontier(cleared, benchmark, rank) {
  if (!Number.isSafeInteger(cleared) || !Number.isSafeInteger(benchmark) || cleared<15) return 0;
  return Math.max(0,Math.floor(cleared/25)-Math.floor(benchmark/25))*Math.min(5,rank);
}
function dust(gain, rank) { return Math.min(10,Math.floor(Math.max(0,gain)/20))*Math.min(5,rank); }
function gentleExact(base, level, rank, bonds) {
  assert(Number.isSafeInteger(level) && level>25 && rank>0);
  rank = Math.min(5,rank);
  const numerator = BigInt(base)*113n**25n * BigInt(113-rank)**BigInt(level-25) * BigInt(100-Math.min(60,3*bonds));
  const denominator = 100n ** BigInt(level+1);
  return (2n*numerator+denominator)/(2n*denominator);
}
function gentleExpected(base, level, rank, bonds) {
  if (!rank || level<=25) return Math.round(base*Math.pow(1.13,level)*(1-Math.min(.6,.03*bonds)));
  const exact = gentleExact(base,level,rank,bonds);
  return exact<=BigInt(Number.MAX_SAFE_INTEGER) ? Number(exact) : null;
}
function stableEconomy(s) {
  const result = {};
  for (const key of ['prisms','motes','sigils','depth','enemyDepth','maxDepthEver','ascendCount','ascendRewardedDepth',
    'totalKills','totalBossKills','totalLuminousKills','totalTaps','nodes','research','researchQueue','longStudyLevels',
    'spirits','activeParty','formationRebuild','formationPresets','owned','autoAscendEnabled','autoAscendTargetDepth',
    'treeTrainingProgress','empowerQueue','studyQueue','studyUseMotes','cometTrial']) result[key]=clone(s[key]===undefined?null:s[key]);
  return result;
}
function compareEconomy(actual, expected, a, label) {
  a.eq(stableEconomy(actual),stableEconomy(expected),label+' discrete economy/progression');
  for (const key of ['lumen','shards','enemyHp','enemyMaxHp','luminousAccum','_autoTapAccum','_autoEmpowerAccum']) {
    a.near(actual[key]||0,expected[key]||0,2e-9,label+' represented '+key);
  }
  for (const id of IDS) a.near(actual.heroResource[id],expected.heroResource[id],2e-9,label+' charge '+id);
  a.eq(actual.supportBuffs,expected.supportBuffs,label+' exact Support deadlines');
}
function payoutSeed(q, cleared, benchmark, swift, clarity, recordRank, dustRank) {
  const s = seed(q); s.maxDepthEver=Math.max(250,cleared+1,benchmark+1);
  s.depth=s.enemyDepth=cleared+1; s.enemyHp=s.enemyMaxHp=1e100;
  s.ascendRewardedDepth=benchmark; s.nodes.swift=swift; s.nodes.frontier=recordRank;
  s.nodes.stardust=dustRank; s.longStudyLevels.prismstudy=clarity;
  s.prisms=1000; s.motes=100; return s;
}

function charterCase(source, a, mutation) {
  const x=app(source),q=x.q,s=seed(q);s.nodes.swift=10;s.prisms=200;q.set(s);
  a.eq(q.cost('swift'),173,'unowned Swift10 keeps original173P');
  const before=clone(q.get()),preview=clone(q.prismPreview());
  const undo=mutation ? mutation(q) : ()=>{};
  try {
    a.eq(q.buy('swiftcharter'),true,'actual200P Charter purchase');
    a.eq(q.get().prisms,0,'Charter exact200P debit');
    a.eq(q.get().nodes.swift,10,'Charter grants no Swift level');
    a.eq(q.cost('swift'),60,'owned Charter changes only future Swift10 quote to60P');
    a.eq(q.prismPreview(),preview,'Charter keeps complete original Prism kernel/breakdown');
    a.eq(q.get().research,before.research,'Charter preserves existing Forge');
    a.eq(q.get().longStudyLevels,before.longStudyLevels,'Charter preserves existing Lab');
    a.eq(x.storage.get(P),x.storage.get(R),'Charter primary/recovery endpoint');
    const cold=app(source,x.storage);a.eq(cold.q.cost('swift'),60,'cold load keeps paid Charter price');
    const backup=q.export(),restored=app(source);restored.area.value=backup;
    restored.q.restore();restored.drain();
    a.eq(restored.reloads(),1,'real Charter backup restore requests reload');
    a.eq(app(source,restored.storage).q.get().nodes,q.get().nodes,'backup retains old and new paid Tree ownership');
  } finally {undo();}
  return {legacyNext:173,charterFee:200,ownedNext:60,swiftBefore:10,swiftAfter:q.get().nodes.swift};
}
function charterPrices(source,a) {
  const x=app(source),q=x.q;let rows=0;
  for(const owned of [0,1,2])for(let level=0;level<=80;level++) {
    const s=seed(q);s.nodes.swift=level;s.nodes.swiftcharter=owned;q.set(s);
    const old=legacySwift(level);
    a.eq(old,Math.ceil(3*Math.pow(1.5,level)),'frozen legacy Swift Number path equals rational oracle '+level);
    a.eq(q.cost('swift'),charterSwift(level,owned>0),'independent future Swift quote '+owned+'/'+level);
    a.eq(q.get().nodes.swiftcharter,owned,'raw Charter overcap remains stored');
    rows++;
  }
  for(const [depth,swift,want] of [[99,10,false],[100,9,false],[100,10,true],[250,50,true]]) {
    const s=seed(q);s.maxDepthEver=depth;s.depth=s.enemyDepth=1;s.nodes.swift=swift;s.prisms=200;q.set(s);
    a.eq(q.plan('swiftcharter').affordable,want,'two-part Charter gate '+depth+'/'+swift);
    const before=clone(q.get());a.eq(q.buy('swiftcharter'),want,'actual gated Charter handler '+depth+'/'+swift);
    if(!want)a.eq(q.get(),before,'locked Charter is complete no-op');
  }
  for(const level of [9,10,11,20,30,50,75]) {
    const s=seed(q);s.nodes.swift=level;s.nodes.swiftcharter=1;s.prisms=charterSwift(level,true);q.set(s);
    a.eq(q.buy('swift'),true,'actual exactly funded Swift '+level);
    a.eq(q.get().prisms,0,'actual Swift consumes independent full quote '+level);
    a.eq(q.get().nodes.swift,level+1,'actual Swift retains every earlier paid level '+level);
    a.eq(app(source,x.storage).q.get().nodes.swift,level+1,'actual Swift endpoint reload '+level);
  }
  return {rows,purchase:charterCase(source,a)};
}

function gentleCase(source,a,mutation) {
  const x=app(source),q=x.q,s=seed(q);s.spirits.ember=50;s.nodes.gentlegrowth=5;s.nodes.bonds=20;s.lumen=582;q.set(s);
  const undo=mutation ? mutation(q) : ()=>{};
  try {
    a.eq(q.spiritCost('ember'),582,'Patient Growth independent quote Ember50/G5/B20=582');
    a.eq(q.buySpirit('ember'),true,'actual exactly funded Patient Growth Empower');
    a.eq([q.get().lumen,q.get().spirits.ember],[0,51],'actual Patient Growth quote equals represented debit');
    a.eq(app(source,x.storage).q.get().spirits.ember,51,'Patient Growth paid level survives cold load');
  } finally {undo();}
}
function gentlePrices(source,a) {
  const x=app(source),q=x.q;let exactRows=0,legacyRows=0,fallbackRows=0;
  const records=[],levels=[0,1,24,25,26,27,30,50,75,100,125,150,175,200];
  for(const id of IDS)for(const rank of [0,1,2,3,4,5,6])for(const bonds of [0,1,5,19,20,21]) {
    const s=seed(q);s.nodes.gentlegrowth=rank;s.nodes.bonds=bonds;
    // Ember0 alone is an invalid empty-roster seed and would normalize to1.
    s.spirits.tide=1;s.activeParty=['tide'];q.set(s);
    a.eq(q.sp(id).baseCost,BASE_COST[id],'historical Wisp base cost '+id);
    for(const level of levels) {
      const actual=q.spiritCost(id,level),expected=gentleExpected(BASE_COST[id],level,rank,bonds);
      const label=id+'/'+level+'/G'+rank+'/B'+bonds;
      if(expected===null) {
        fallbackRows++;a.ok(Number.isFinite(actual) && actual>Number.MAX_SAFE_INTEGER,'explicit oversized Number branch '+label);
      } else {
        a.eq(actual,expected,'independent Empower quote '+label);
        if(rank && level>25)exactRows++;else legacyRows++;
      }
    }
  }
  // Find each new curve's safe-integer edge independently, then check both
  // sides. This catches decimal-limb carry/rounding defects near2^53.
  for(const id of IDS)for(const rank of [1,2,3,4,5])for(const bonds of [0,5,20]) {
    let level=26;
    while(gentleExact(BASE_COST[id],level,rank,bonds)<=BigInt(Number.MAX_SAFE_INTEGER))level++;
    const s=seed(q);s.nodes.gentlegrowth=rank;s.nodes.bonds=bonds;q.set(s);
    for(let at=level-2;at<=level+2;at++) {
      const expected=gentleExpected(BASE_COST[id],at,rank,bonds),actual=q.spiritCost(id,at);
      if(expected!==null){a.eq(actual,expected,'exact safe-integer edge '+id+'/'+at+'/'+rank+'/'+bonds);exactRows++;}
      else {a.ok(actual>Number.MAX_SAFE_INTEGER,'oversized edge remains explicitly outside exact quote claim');fallbackRows++;}
    }
    if(id==='titan' && bonds===0)records.push({id,rank,bonds,firstOversizedLevel:level,lastSafeQuote:gentleExpected(BASE_COST[id],level-1,rank,bonds)});
  }
  const old=seed(q);old.spirits.titan=100;old.nodes.gentlegrowth=0;q.set(old);
  a.eq(q.spiritCost('titan'),446958323302,'preserve witnessed original Titan100 Number price, including historical one-unit rounding');
  const paid=clone(q.get());paid.nodes.gentlegrowth=5;q.set(paid);
  a.eq(q.spiritCost('titan'),15002561973,'new Titan100/G5 exact rational price');
  gentleCase(source,a);
  return {exactRows,legacyRows,fallbackRows,edgeRecords:records,
    historicalTitan100:446958323302,newTitan100Rank5:15002561973};
}

function rewardCase(source,a,mutation) {
  const x=app(source),q=x.q;q.set(payoutSeed(q,100,0,0,0,5,5));
  const undo=mutation ? mutation(q) : ()=>{};
  try {
    a.eq(q.prismPreview().gain,40,'Frontier adds20 to original20P, before Dust');
    a.eq(q.ascend(),true,'actual Frontier/Dust Ascend');
    a.eq([q.get().prisms,q.get().motes],[1040,110],'Dust uses final40P exactly once');
    const repeat=clone(q.get());repeat.depth=repeat.enemyDepth=101;repeat.enemyHp=repeat.enemyMaxHp=1e100;q.set(repeat);
    a.eq(q.prismPreview().gain,4,'rewarded Frontier benchmark prevents repeat milestone credit');
    q.ascend();a.eq([q.get().prisms,q.get().motes],[1044,110],'repeat4P grants no new Dust');
    a.eq(app(source,x.storage).q.get().motes,110,'saved Dust is neither lost nor replayed');
  } finally {undo();}
}
function rewards(source,a) {
  const x=app(source),q=x.q;let previews=0,purchases=0;const records=[];
  for(const cleared of [14,15,24,25,26,49,50,51,74,75,99,100,119,250,1000])
    for(const benchmark of [0,Math.max(0,cleared-1),cleared,cleared+25])
      for(const [swift,clarity] of [[0,0],[10,10],[50,20]])for(const rank of [0,1,5,6]) {
        const s=payoutSeed(q,cleared,benchmark,swift,clarity,rank,rank);q.set(s);
        const base=reward(cleared,benchmark,swift,clarity),extra=frontier(cleared,benchmark,rank),want=base+extra;
        const preview=clone(q.prismPreview());
        a.eq(preview.gain,want,'independent Prism/Frontier '+[cleared,benchmark,swift,clarity,rank]);
        a.eq(preview.frontier||0,extra,'separate canonical Frontier amount');
        a.eq(q.dust(want),dust(want,rank),'independent nominal Dust cap/floor');
        if(!extra)a.ok(!Object.hasOwn(preview,'frontier'),'zero new bonus preserves original breakdown shape');
        const noFrontier=clone(q.get());noFrontier.nodes.frontier=0;q.set(noFrontier);
        const old=clone(q.prismPreview());
        a.eq(old.gain,base,'unchanged original Prism oracle');
        if(!extra)a.eq(preview,old,'complete old breakdown retained when no new milestone');
        q.set(s);previews++;
        if(previews%29===0 || (cleared===100 && benchmark===0 && swift===0 && rank===5)) {
          a.eq(q.ascend(),cleared>=15,'actual sampled eligibility');
          a.eq(q.get().prisms,1000+want,'actual sampled Prism wallet');
          a.eq(q.get().motes,100+dust(want,rank),'actual sampled Mote wallet');
          a.eq(q.get().ascendRewardedDepth,cleared>=15?Math.max(cleared,benchmark):benchmark,'advance benchmark once');
          a.eq(q.get().nodes.swift,swift,'sample preserves paid original Swift');
          a.eq(q.get().longStudyLevels.prismstudy,clarity,'sample preserves paid original Clarity');
          q.save();a.eq(app(source,x.storage).q.get().prisms,1000+want,'actual sampled payout reload');
          purchases++;
        }
        if(cleared===100 && benchmark===0 && swift===0)records.push({cleared,benchmark,swift,clarity,rank,base,frontier:extra,total:want,motes:dust(want,rank)});
      }
  for(const gain of [0,1,19,20,21,39,40,199,200,201,1000])for(const rank of [0,1,3,5,6]) {
    const s=seed(q);s.nodes.stardust=rank;q.set(s);a.eq(q.dust(gain),dust(gain,rank),'Dust independent20P boundary '+gain+'/'+rank);
  }
  for(const wallet of [1000,1e30])for(const moteWallet of [100,1e30])for(const route of ['manual','live','offline']) {
    const s=payoutSeed(q,100,0,0,0,5,5);s.prisms=wallet;s.motes=moteWallet;
    s.owned.autoascend=true;s.autoAscendEnabled=route!=='manual';s.autoAscendTargetDepth=101;q.set(s);
    const credit=Math.min(40,(wallet+40)-wallet),motes=dust(credit,5);
    const result=route==='manual'?q.ascend():q.advance(0,{kind:route,clockStartMs:CLOCK});
    a.eq(q.get().prisms,wallet+40,'preserve accepted original Number Prism wallet '+route);
    a.eq(q.get().motes,moteWallet+motes,'Dust follows actual represented Prism credit '+route);
    if(route!=='manual')a.eq(result.motesGained,(moteWallet+motes)-moteWallet,'simulation reports represented Mote difference '+route);
    if(wallet===1e30)a.eq(motes,0,'zero represented Prism credit grants no new currency');
  }
  rewardCase(source,a);
  return {previews,actualPayouts:purchases+16,records};
}

function usefulBundle(cleared,swift,clarity,owned) {
  const old=reward(cleared,cleared,swift,clarity);let to=swift,price=0;
  do{price+=charterSwift(to,owned);to++;assert(to<=swift+100,'bounded useful Swift bundle');}while(reward(cleared,cleared,to,clarity)<=old);
  const gain=reward(cleared,cleared,to,clarity)-old;
  return {from:swift,to,price,gain,paybackRepeats:Math.ceil(price/gain)};
}
function reinvestOracle(target,charter) {
  let wallet=452,swift=6,ascends=0,spent=0,owned=false;
  while(swift<target) {
    if(charter && swift>=10 && !owned) {
      const gain=reward(94,94,swift,1),wait=Math.max(0,Math.ceil((200-wallet)/gain));
      wallet+=wait*gain;ascends+=wait;wallet-=200;spent+=200;owned=true;
    }
    const quote=charterSwift(swift,owned),gain=reward(94,94,swift,1);
    const wait=Math.max(0,Math.ceil((quote-wallet)/gain));
    wallet+=wait*gain;ascends+=wait;wallet-=quote;spent+=quote;swift++;
  }
  return {target,charter,ascends,spent,remainingPrisms:wallet};
}
function actualReinvest(source,a,target,charter) {
  const x=app(source),q=x.q;q.set(fixture(q,'mature-high-power'));
  const original=clone(q.get());a.eq([original.prisms,original.nodes.swift,original.longStudyLevels.prismstudy],[452,6,1],'immutable mature seed includes pre-existing32P Reserves refund exactly once');
  let ascends=0,spent=0;
  function earnUntil(quote) {
    while(q.get().prisms<quote) {
      a.ok(ascends<2000,'actual fixed-depth reinvestment bounded below2000 Ascends');
      const s=clone(q.get());s.depth=s.enemyDepth=95;s.riftMode='push';s.farmDepth=s.farmReturnDepth=0;
      s.enemyHp=s.enemyMaxHp=1e100;s.ascendRewardedDepth=94;q.set(s);
      const before=q.get().prisms,want=reward(94,94,q.get().nodes.swift,1);
      a.eq(q.ascend(),true,'actual fixed-depth repeat handler');
      a.eq(q.get().prisms-before,want,'actual mature repeat equals independent Prism kernel');
      ascends++;x.writes.length=0;
    }
  }
  while(q.get().nodes.swift<target) {
    if(charter && q.get().nodes.swift>=10 && !q.get().nodes.swiftcharter) {
      earnUntil(200);a.eq(q.buy('swiftcharter'),true,'mature loop pays actual200P activation');spent+=200;
    }
    const quote=charterSwift(q.get().nodes.swift,!!q.get().nodes.swiftcharter);earnUntil(quote);
    a.eq(q.cost('swift'),quote,'mature future quote oracle');a.eq(q.buy('swift'),true,'mature loop actual Swift purchase');spent+=quote;
  }
  const result={target,charter,ascends,spent,remainingPrisms:q.get().prisms};
  a.eq(result,reinvestOracle(target,charter),'actual mature reinvestment equals independent integer-step model');
  a.eq(q.get().research,original.research,'mature pacing preserves every paid Forge level');
  a.eq(q.get().longStudyLevels,original.longStudyLevels,'mature pacing preserves every paid Lab level');
  a.eq(q.get().owned,original.owned,'mature pacing preserves permanent purchases');
  return result;
}
function roi(source,a) {
  const rows=[];
  for(const cleared of [20,50,119,250,1000])for(const swift of [0,6,10,20,30,50])for(const clarity of [0,1,10]) {
    const old=usefulBundle(cleared,swift,clarity,false),owned=usefulBundle(cleared,swift,clarity,true);
    rows.push({cleared,swift,clarity,old,ownedCharter:owned,charterActivation:swift>=10?200:null,
      firstUsefulPaybackWithActivation:swift>=10?Math.ceil((owned.price+200)/owned.gain):null});
  }
  a.eq(usefulBundle(20,30,0,false).price,1438134,'frozen pre-Tree useful Swift30 bundle at Rift20');
  a.eq(usefulBundle(20,30,0,true).price,366,'Charter30→32 useful bundle is180+186P');
  a.eq(usefulBundle(20,50,0,true).price,300,'late Swift50 meaningful future price');
  const actual=[actualReinvest(source,a,21,false),actualReinvest(source,a,21,true),actualReinvest(source,a,50,true)];
  a.eq(actual.map(r=>r.ascends),[1541,62,247],'frozen mature independent baseline/selected counts');
  return {rows,actualReinvestment:actual,counterfactualLegacy50:reinvestOracle(50,false),
    assumptions:'Public mature fixture,452P/Swift6/Clarity1; synthetic repeated cleared94/benchmark94, fixed gain per current level, all purchase queues disabled; counts are Ascends, never elapsed time or time to unlock. Charter fee200P is actually paid. No combat playtest is implied.'};
}

const TRANSITION_PROFILES = [
  {id:'early-carry',fixture:'parity-early-simple',record:50,cleared:20,seconds:60,
    ranks:{lumenmemory:1,veteranrecruits:1,rosterrecall:1,chargememory:1,phasememory:1,riftstep:1}},
  {id:'mid-rebuild',fixture:'mid-game',record:75,cleared:50,seconds:120,
    ranks:{lumenmemory:3,veteranrecruits:2,rosterrecall:2,chargememory:3,phasememory:1,riftstep:2,frontier:2,stardust:2,invitations:2}},
  {id:'mature-memory',fixture:'mature-high-power',record:120,cleared:119,seconds:300,
    ranks:{lumenmemory:5,veteranrecruits:5,rosterrecall:4,chargememory:5,supportmemory:1,phasememory:1,riftstep:5,frontier:5,stardust:5,formationseat:1}}
];
function transitionProfile(source,a,config,mutation) {
  const x=app(source),q=x.q,initial=fixture(q,config.fixture);
  initial.maxDepthEver=config.record;initial.autoAscendEnabled=false;q.set(initial);
  const paid=buyRanks(q,config.ranks,a);
  const s=clone(q.get());s.depth=s.enemyDepth=config.cleared+1;s.enemyHp=s.enemyMaxHp=1e100;
  s.ascendRewardedDepth=0;s.riftMode='push';s.farmDepth=s.farmReturnDepth=0;
  s._autoTapAccum=217.25;s._autoEmpowerAccum=619.5;s.achieved.autotap=true;s.achieved.labmaster=true;
  if(config.ranks.supportmemory){s.supportBuffs={version:1,sources:{tide:{mult:1.25,until:CLOCK+2317},aurora:{mult:1.5,until:CLOCK+4199}}};s.buffMult=1.6;s.buffUntil=CLOCK+1199;}
  q.set(s);const before=clone(q.get()),spawns=[];const unspawn=q.observeSpawns(event=>spawns.push(event));
  const undo=mutation ? mutation(q) : ()=>{};
  try{a.eq(q.ascend(),true,'combined actual paid transition '+config.id);}finally{undo();unspawn();}
  const after=clone(q.get()),r=config.ranks;
  a.eq(after.lumen,Math.min(before.lumen*(r.lumenmemory/20),50000*r.lumenmemory),'combined paid Lumen carry '+config.id);
  const recalled=(before.formationRebuild?before.formationRebuild.members:before.activeParty).filter(id=>id!=='ember' && before.spirits[id]>0).slice(0,r.rosterrecall);
  for(const id of IDS) {
    a.eq(after.spirits[id],id==='ember'||recalled.includes(id)?1+r.veteranrecruits:0,'combined remembered recruited status '+config.id+'/'+id);
    a.near(after.heroResource[id],Math.min(100,before.heroResource[id]*r.chargememory/5),1e-14,'combined dormant charge '+config.id+'/'+id);
  }
  a.eq([after._autoTapAccum,after._autoEmpowerAccum],[217.25,619.5],'combined retains original subsecond phases '+config.id);
  a.eq(after.nodes,before.nodes,'combined transition retains all purchased ranks '+config.id);
  a.eq(after.research,before.research,'combined transition retains Forge '+config.id);
  a.eq(after.longStudyLevels,before.longStudyLevels,'combined transition retains Lab '+config.id);
  a.eq(spawns,[{depth:1+r.riftstep,enemyDepth:1+r.riftstep}],'single next-run spawn at paid Rift '+config.id);
  a.eq(after.totalKills,before.totalKills,'skipped start Rifts grant no kills '+config.id);
  if(r.supportmemory){a.eq(after.supportBuffs,before.supportBuffs,'combined exact Support source deadlines');a.eq([after.buffMult,after.buffUntil],[before.buffMult,before.buffUntil],'combined exact legacy Support deadline');}
  const expectedGain=reward(config.cleared,0,before.nodes.swift,before.longStudyLevels.prismstudy)+frontier(config.cleared,0,r.frontier||0);
  a.eq(after.prisms-before.prisms,expectedGain,'combined independent Prism credit '+config.id);
  a.eq(after.motes-before.motes,dust(expectedGain,r.stardust||0),'combined independent actual Dust '+config.id);
  const restarted=app(source,x.storage);a.eq(restarted.q.get().nodes,after.nodes,'combined cold load retains all investment '+config.id);
  const left=app(source),right=app(source);left.q.set(after);right.q.set(after);
  const result=left.q.advance(config.seconds,{kind:'live',clockStartMs:CLOCK});
  const first=13.125;right.q.advance(first,{kind:'live',clockStartMs:CLOCK});right.q.advance(config.seconds-first,{kind:'live',clockStartMs:CLOCK+first*1000});
  compareEconomy(left.q.get(),right.q.get(),a,'combined bounded live/split '+config.id);
  a.eq(result.empowers+result.researchBought+result.studiesStarted,0,'combined snapshot has no unrequested queued spending');
  return {id:config.id,publicFixture:config.fixture,syntheticPriorRecord:config.record,cleared:config.cleared,paid,
    afterAscend:{depth:after.depth,lumen:after.lumen,prisms:after.prisms,motes:after.motes,spirits:after.spirits,charge:after.heroResource},
    boundedSeconds:config.seconds,actual:{kills:result.kills,ascends:result.ascends,endDepth:left.q.get().depth,lumen:left.q.get().lumen,shards:left.q.get().shards},
    scope:'Paid synthetic combinations layered on frozen public fixtures; purchase funding and prior unlock record are explicit, not organic pacing claims.'};
}
function replaceOne(source, before, after, label) {
  assert.equal(source.split(before).length,2,'one '+label+' mutation anchor');return source.replace(before,after);
}
function negatives(source) {
  const records=[];
  function rejects(name,run,pattern) {
    let caught;try{run();}catch(error){caught=error;}
    assert(caught instanceof assert.AssertionError,name+' must trip a gameplay assertion, not a harness/runtime error');
    assert.match(caught.message,pattern,name+' fails the intended independent oracle');
    records.push({name,caught:true,errorName:caught.name,message:caught.message.split('\n')[0]});
  }
  rejects('missing-paid-charter',()=>charterCase(source,checks(),q=>q.disable('swiftcharter')),/future Swift10 quote/);
  rejects('missing-patient-growth',()=>gentleCase(source,checks(),q=>q.disable('gentlegrowth')),/Ember50\/G5\/B20=582/);
  rejects('double-frontier-credit',()=>rewardCase(source,checks(),q=>q.doubleFrontier()),/benchmark prevents repeat/);
  rejects('dust-uses-old-kernel-only',()=>rewardCase(replaceOne(source,'var dust=treeAscendMotesForWallet(gain,state.prisms);',
    'var dust=treeAscendMotesForWallet(gain-treeFrontierBonus(cleared,state.ascendRewardedDepth||0),state.prisms);','Dust final gain'),checks()),/Dust uses final40P/);
  rejects('missing-combined-carry-effect',()=>transitionProfile(source,checks(),TRANSITION_PROFILES[0],q=>q.disable('lumenmemory')),/combined paid Lumen carry/);
  rejects('lost-combined-paid-ownership',()=>transitionProfile(source,checks(),TRANSITION_PROFILES[0],q=>q.losePaidAscend()),/combined transition retains all purchased ranks/);
  return records;
}
function verify(source,negative=false) {
  const a=checks(),result={charter:charterPrices(source,a),gentle:gentlePrices(source,a),rewards:rewards(source,a),roi:roi(source,a),
    combinedProfiles:TRANSITION_PROFILES.map(config=>transitionProfile(source,a,config))};
  return {status:'pass',sourceSha256:hash(source),fixtureSha256:hash(fs.readFileSync(FIXTURE_PATH)),testSha256:hash(fs.readFileSync(__filename)),
    checks:a.count,...result,negativeControls:negative?negatives(source):[],
    scope:'Complete production IIFE and actual purchase/Ascend/save/restore handlers; independent Node BigInt prices and unchanged historical Prism reference; no browser, Android, private save or elapsed-unlock claim.'};
}
module.exports={checks,quiet,fixture,buyRanks,PRICES,BASE_COST,IDS,CLOCK,hash,frontier,dust,gentleExact,gentleExpected,
  compareEconomy,stableEconomy,payoutSeed,replaceOne,verify};
if(require.main===module){const source=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');console.log(JSON.stringify(verify(source,process.argv.includes('--negative'))));}
