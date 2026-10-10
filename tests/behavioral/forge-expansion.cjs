#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const {app, seed, clone, P, R, CLOCK} = require('./forge-expansion-harness.cjs');
const {reward: prismReward} = require('./prism-earning-reference.cjs');

// Approved independent contract. Never derive expected caps/prices/order from
// RESEARCH or the product's finite precomputed price ledger.
const CATALOGUE = [
  ['cauterize', 20, 10, 36000, 2500, 165],
  ['fracturekey', 30, 10, 103000, 6000, 165],
  ['guardianseal', 40, 5, 293000, 14500, 170],
  ['spillway', 60, 5, 2361000, 80500, 170],
  ['sustainedchannel', 70, 5, 6703000, 191000, 175],
  ['tapconduit', 25, 5, 61000, 4000, 165],
  ['guardiancadence', 35, 5, 174000, 9500, 170],
  ['relay', 45, 5, 493000, 22000, 170],
  ['resonantedge', 50, 5, 831000, 34000, 170],
  ['victorycharge', 55, 5, 1401000, 52500, 170],
  ['amplifiertrim', 60, 5, 2361000, 80500, 170],
  ['dualchannel', 55, 5, 1401000, 52500, 170],
  ['overflowconduit', 65, 5, 3978000, 124000, 175],
  ['resonancecells', 80, 2, 19032000, 452500, 250],
  ['resonancecascade', 90, 5, 54040000, 1071500, 180],
  ['resonancereclaim', 100, 3, 153442000, 2536500, 200]
].map(([id, unlock, cap, lumen, shard, growth]) => ({id, unlock, cap, lumen, shard, growth}));
const IDS = CATALOGUE.map(d => d.id);
const OLD_IDS = ['focus', 'sense', 'formation', 'resolve', 'charge', 'arcanecal', 'conduction', 'luminoustracking'];
const OLD = [
  ['focus', 200, 1.5, 0, 1], ['sense', 150, 1.5, 20, 1.5],
  ['formation', 0, 1, 40, 1.6], ['resolve', 150, 1.45, 0, 1],
  ['charge', 0, 1, 30, 1.55], ['arcanecal', 15000, 1.6, 120, 1.6],
  ['conduction', 90000, 1.6, 280, 1.6], ['luminoustracking', 2500000, 1.6, 1500, 1.6]
];

function exactCost(def, start, count) {
  assert(Number.isInteger(start) && start >= 0 && Number.isInteger(count) && count > 0 && start + count <= def.cap, 'valid independent price query');
  const denominator = 100n ** BigInt(start + count - 1);
  function one(base) {
    let numerator = 0n;
    for (let level = start; level < start + count; level++) {
      numerator += BigInt(base) * BigInt(def.growth) ** BigInt(level) * 100n ** BigInt(start + count - 1 - level);
    }
    return Number((numerator + denominator - 1n) / denominator);
  }
  return {lumen: one(def.lumen), shard: one(def.shard)};
}
function assertions() {
  let count = 0;
  return {
    eq(a, b, message) { count++; assert.deepEqual(a, b, message); },
    ok(value, message) { count++; assert(value, message); },
    near(a, b, message, tolerance = 2e-9) {
      count++; assert(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= Math.max(1, Math.abs(a), Math.abs(b)) * tolerance, message + ': ' + a + ' vs ' + b);
    },
    count: () => count
  };
}
function battle(q, party = ['ember'], depth = 101) {
  const s = seed(q);
  s.depth = s.enemyDepth = depth; s.enemyHp = s.enemyMaxHp = 1000000;
  s.lumen = s.shards = 100; s.activeParty = party.slice();
  Object.keys(s.spirits).forEach(id => { s.spirits[id] = party.includes(id) ? 1 : 0; s.heroResource[id] = 0; });
  return s;
}
function advance(q, seconds = 0, kind = 'live', extra = {}) {
  return q.advance(seconds, Object.assign({kind, visual: false, clockStartMs: CLOCK, offlineWindowStartMs: CLOCK}, extra));
}
function cast(q, id, kind = 'live') {
  q.get().heroResource[id] = 100;
  const damage = [], undo = q.observeCalibration(e => { if (e.type === 'damage' && e.amount > 0) damage.push(e.amount); });
  try { return {summary: advance(q, 0, kind), damage}; } finally { undo(); }
}
function prepareResonate(q, levels = {}) {
  const s = battle(q, ['ember', 'tide', 'stone']);
  Object.keys(s.wispUltimate).forEach(id => { s.wispUltimate[id] = true; s.heroRarity[id] = 5; });
  Object.assign(s.research, levels); return s;
}

function catalogueCases(html, a) {
  const x = app(html), q = x.q, defs = q.defs();
  a.eq(defs.map(d => d.id), OLD_IDS.concat(IDS), 'stable original8 followed by approved grouped16');
  a.eq(defs.filter(d => !d.retiredTo).length, 20, 'twenty active Forge choices');
  a.eq(defs.filter(d => d.retiredTo).map(d => d.id), OLD_IDS.slice(0, 4), 'retired paid identities retained');
  let priceCases = 0, purchases = 0;
  for (const d of CATALOGUE) {
    const actual = q.node(d.id);
    a.eq([actual.unlockDepth, actual.levelCap, actual.lumenBase, actual.shardBase, actual.lumenGrowth, actual.shardGrowth], [d.unlock, d.cap, d.lumen, d.shard, d.growth / 100, d.growth / 100], 'independent catalogue ' + d.id);
    a.ok(actual.name && actual.desc, 'distinct named description ' + d.id);
    for (let start = 0; start < d.cap; start++) for (let count = 1; count <= d.cap - start; count++) {
      a.eq(q.cost(d.id, start, count), exactCost(d, start, count), 'exact rational bulk ' + d.id + '/' + start + '/' + count);
      priceCases += 2;
    }
    for (const level of [0, 1, d.cap - 1, d.cap, d.cap + 1, 1000000]) {
      const s = seed(q); s.research[d.id] = level; s.researchQueue[d.id] = true; q.set(s);
      a.eq(q.level(d.id), Math.min(level, d.cap), 'bounded derived effect ' + d.id);
      a.eq(q.get().research[d.id], level, 'raw paid level is not rewritten ' + d.id);
      const before = clone(q.get()); q.plan(d.id, 'max'); q.preview(d.id, 5);
      a.eq(q.get(), before, 'plan/preview pure ' + d.id);
      if (level >= d.cap) {
        a.eq(q.plan(d.id, 1).buyCount, 0, 'maxed refuses another level ' + d.id);
        q.buy(d.id, 1); a.eq(q.get(), before, 'maxed purchase is pure ' + d.id);
      }
    }
    for (const start of [0, d.cap - 1]) for (const requested of [1, 5, 10, 25, 50, 100, 'max']) {
      const intended = Math.min(d.cap - start, requested === 'max' ? d.cap : requested);
      for (const funded of [1, intended]) {
        const s = seed(q); s.research[d.id] = start;
        const cost = exactCost(d, start, funded); s.lumen = cost.lumen; s.shards = cost.shard; q.set(s);
        const before = clone(q.get()), plan = q.plan(d.id, requested), preview = q.preview(d.id, requested);
        a.eq(plan.buyCount, funded, 'actual affordable count ' + d.id);
        a.eq(plan.cost, cost, 'actual count quoted cost ' + d.id);
        q.buy(d.id, requested); purchases++;
        a.eq(q.get().research[d.id], start + funded, 'real purchased level count ' + d.id);
        a.eq([q.get().lumen, q.get().shards], [0, 0], 'exact two-wallet debit ' + d.id);
        a.eq(q.preview(d.id, 1).current, preview.purchase, 'native preview becomes actual effect ' + d.id);
        for (const key of ['prisms', 'comets', 'motes', 'sigils', 'enemyHp', 'enemyMaxHp', 'enemyDepth', 'enemyIsLuminous', 'luminousAccum']) a.eq(q.get()[key], before[key], 'purchase preserves ' + key);
      }
    }
    for (const budget of ['lumen-short', 'shard-short', 'huge-lumen', 'huge-shards', 'huge-both']) {
      const s = seed(q), cost = exactCost(d, 0, 1); s.lumen = cost.lumen; s.shards = cost.shard;
      if (budget === 'lumen-short') s.lumen--;
      if (budget === 'shard-short') s.shards--;
      if (budget === 'huge-lumen' || budget === 'huge-both') s.lumen = 1e30;
      if (budget === 'huge-shards' || budget === 'huge-both') s.shards = 1e30;
      q.set(s); const before = clone(q.get()), disk = Array.from(x.storage);
      a.eq(q.plan(d.id, 1).buyCount, 0, 'exact eligibility refuses ' + d.id + '/' + budget);
      q.buy(d.id, 1); a.eq(q.get(), before, 'rejected purchase pure ' + budget); a.eq(Array.from(x.storage), disk, 'rejected purchase no writes');
      q.get().researchQueue[d.id] = true; const queued = clone(q.get()); q.queue(); a.eq(q.get(), queued, 'queue shares exact affordability ' + budget);
    }
    const locked = seed(q); locked.depth = locked.enemyDepth = 1; locked.enemyHp = locked.enemyMaxHp = q.enemyHp(1); locked.maxDepthEver = d.unlock - 1; q.set(locked);
    const before = clone(q.get()); a.eq(q.plan(d.id, 1).reason, 'locked', 'named unlock boundary ' + d.id); q.buy(d.id, 1); a.eq(q.get(), before, 'locked handler pure');
    q.set(seed(q));
    for (const requested of [0, -1, 1.5, NaN, Infinity, '1', 'unknown']) {
      const before=clone(q.get());a.eq(q.plan(d.id, requested).buyCount, 0, 'invalid funded unlocked bulk rejected');q.buy(d.id,requested);a.eq(q.get(),before,'invalid bulk handler cannot spend or buy');
    }
    a.eq(q.cost(d.id,0,0),{lumen:0,shard:0},'empty sum has no cost and cannot buy');
    for (const [start, count] of [[-1, 1], [0, -1], [0, 1.5], [d.cap, 1], [0, d.cap + 1]]) {
      const cost = q.cost(d.id, start, count);
      a.ok(!cost || !Number.isFinite(cost.lumen) || !Number.isFinite(cost.shard), 'invalid new price query unavailable ' + d.id);
    }
  }
  for (const [id, lumen, lg, shard, sg] of OLD) for (const level of [0, 1, 4, 9]) for (const count of [1, 2, 5]) {
    const legacy = (base, growth) => Math.ceil(base <= 0 ? 0 : growth === 1 ? base * count : base * Math.pow(growth, level) * (Math.pow(growth, count) - 1) / (growth - 1));
    a.eq(q.cost(id, level, count), {lumen: legacy(lumen, lg), shard: legacy(shard, sg)}, 'original price path unchanged ' + id);
  }
  a.eq(priceCases, 598, 'entire approved finite price domain covered');
  return {priceCases, purchases};
}

// Each row is independently exercised by a real production event. Negative
// controls call these same cases with only that row's derived effect disabled.
function effectCase(id, x, a) {
  const q = x.q, d = CATALOGUE.find(d => d.id === id), cap = d.cap;
  if (id === 'cauterize') {
    for (const party of [['ember'], ['ember', 'stone']]) {
      const s = battle(q, party, 10); s.enemyHp = 500000; q.set(s); const base = q.regen(10); advance(q, 1); const control = q.get().enemyHp;
      s.research[id] = cap; q.set(s); a.near(q.regen(10), base * .8, 'Cauterize multiplies current boss regeneration'); advance(q, 1);
      a.near(control - q.get().enemyHp, s.enemyMaxHp * base * .2, 'Cauterize changes actual heal interval');
    }
  } else if (id === 'fracturekey' || id === 'guardianseal') {
    const target = id === 'fracturekey' ? 20 : 30, baseFactor = id === 'fracturekey' ? 1.75 : 3, increment = id === 'fracturekey' ? .025 * cap : .1 * cap;
    for (const depth of [10, 20, 30, 31]) {
      const s = battle(q, ['ember'], depth); q.set(s);
      const base = id === 'fracturekey' ? cast(q, 'ember').damage[0] : (() => {const hp=q.get().enemyHp;q.manualTap();return hp-q.get().enemyHp;})();
      s.research[id] = cap; q.set(s);
      const hit = id === 'fracturekey' ? cast(q, 'ember').damage[0] : (() => {const hp=q.get().enemyHp;q.manualTap();return hp-q.get().enemyHp;})();
      a.near(hit, base * (depth === target ? (baseFactor + increment) / baseFactor : 1), id + ' actual contextual hit ' + depth);
    }
  } else if (id === 'spillway') {
    for (const route of ['tap', 'ability']) {
      const s = battle(q, ['ember'], 101); s.research[id] = cap; s.enemyHp = 1; q.set(s);
      const hit = route === 'tap' ? q.tap() : q.abilityDamage('ember');
      if (route === 'tap') q.manualTap(); else cast(q, 'ember');
      a.eq(q.get().depth, 102, 'Spillway kills source once ' + route);
      a.near(q.get().enemyHp, q.enemyHp(102) - .2 * Math.min(hit - 1, hit), 'Spillway real next nonboss damage ' + route);
      const bossNext = battle(q, ['ember'], 19); bossNext.research[id] = cap; bossNext.enemyHp = 1; q.set(bossNext);
      if (route === 'tap') q.manualTap(); else cast(q, 'ember');
      a.eq(q.get().depth, 20, 'Spillway reaches next boss'); a.eq(q.get().enemyHp, q.enemyHp(20), 'Spillway discards before boss');
      const high = battle(q, ['ember'], 1); high.research[id] = cap; high.spirits.ember = 100000; high.enemyHp = 1; q.set(high);
      if (route === 'tap') q.manualTap(); else cast(q, 'ember');
      a.eq(q.get().depth, 3, 'Spillway bounded to one child kill ' + route); a.eq(q.get().enemyHp, q.enemyHp(3), 'Spillway never recurses');
    }
    const passive = battle(q, ['ember'], 1); passive.research[id] = cap; passive.enemyHp = .5; q.set(passive); q.passiveStep(1);
    a.eq(q.get().depth, 2, 'real passive source kill'); a.eq(q.get().enemyHp, q.enemyHp(2), 'passive damage never spills');
  } else if (id === 'sustainedchannel') {
    for (const [who, depth, lethal] of [['ember',20,false],['tide',20,false],['ember',21,false],['ember',20,true]]) {
      const s = battle(q, [who], depth); s.research[id] = cap; if (who === 'tide') s.research.resonantedge = 5; if (lethal) s.enemyHp = 1; q.set(s); cast(q, who);
      a.eq(q.get().heroResource[who], who !== 'tide' && depth === 20 && !lethal ? 10 : 0, 'Sustained Channel actual eligible refund ' + who + '/' + depth + '/' + lethal);
    }
  } else if (id === 'tapconduit') {
    for (const route of ['manual', 'auto']) {
      const s = battle(q, ['tide','ember']); s.research[id] = cap; s.heroResource.tide = 40; s.heroResource.ember = 17; s.spirits.void = 1; s.heroResource.void = 30;
      if (route === 'auto') s.achieved.autotap = true; q.set(s);
      if (route === 'manual') q.manualTap(); else {q.get()._autoTapAccum=1000;advance(q);}
      a.eq(q.get().heroResource.tide, 50, 'Tap Conduit first powered Active ' + route); a.eq(q.get().heroResource.ember, 17, 'Tap Conduit does not fill other Active'); a.eq(q.get().heroResource.void, 30, 'Tap Conduit excludes reserve');
    }
    const s=battle(q,['tide','ember']);s.research[id]=cap;s.heroResource.tide=95;q.set(s);q.manualTap();a.eq(q.get().heroResource.tide,100,'tap charge clips at100');
  } else if (id === 'guardiancadence') {
    for (const ordinal of [1,4,5,6,9,10]) for (const route of ['manual','auto']) {
      const s=battle(q);s.totalTaps=ordinal-1;if(route==='auto')s.achieved.autotap=true;q.set(s);const base=q.tap();
      s.research[id]=cap;q.set(s);const hp=q.get().enemyHp;
      if(route==='manual')q.manualTap();else{q.get()._autoTapAccum=1000;advance(q);}
      a.near(hp-q.get().enemyHp,base*(ordinal%5===0?1.5:1),'actual shared cadence ordinal '+ordinal+'/'+route);a.eq(q.get().totalTaps,ordinal,'one counted tap');
    }
  } else if (id === 'relay') {
    for(const party of [['tide','ember','aurora','stone'],['ember','tide','stone','aurora']]){
      const s=battle(q,party);s.research[id]=cap;party.forEach(who=>s.heroResource[who]=100);s.spirits.void=1;s.heroResource.void=7;q.set(s);
      const pass=q.abilities();a.eq(pass.count,4,'all simultaneous ready abilities fire once');a.eq(q.get().heroResource.ember,20,'post-pass two-Support relay to Ember');a.eq(q.get().heroResource.stone,20,'post-pass two-Support relay to Stone');
      a.eq(q.get().heroResource.tide,0,'Relay does not charge Support');a.eq(q.get().heroResource.aurora,0,'no Support loop');a.eq(q.get().heroResource.void,7,'Relay excludes reserve');
    }
    const s=battle(q,['ember','tide']);s.research[id]=cap;s.heroResource.ember=95;s.heroResource.tide=100;q.set(s);a.eq(q.abilities().count,1,'recipient not cast retrospectively');a.eq(q.get().heroResource.ember,100,'relay readies next pass');a.eq(q.abilities().count,1,'next real pass fires recipient');
  } else if (id === 'resonantedge') {
    for(const enhanced of [false,true])for(const who of ['tide','aurora']){
      const s=battle(q,[who]);s.research[id]=cap;s.wispModules[who]=enhanced?9:0;s.wispUltimate[who]=enhanced;s.heroRarity[who]=enhanced?5:0;s.research.arcanecal=enhanced?4:0;s.longStudyLevels.wispascend=enhanced?9:0;q.set(s);
      const expected=q.power(who)*.5*(enhanced?2:1)*(enhanced?1.12:1),out=cast(q,who);
      a.eq(out.damage.length,1,'Support now delivers a real pulse');a.near(out.damage[0],expected,'Support pulse canonical factors, no Module or passive multiplier');a.ok(q.get().supportBuffs.sources[who],'Support still applies its actual buff');
    }
  } else if (id === 'victorycharge') {
    for(const depth of [20,21]){
      const s=battle(q,['ember','tide'],depth);s.research[id]=cap;s.enemyHp=1;s.heroResource.tide=20;s.spirits.void=1;s.heroResource.void=7;q.set(s);const out=cast(q,'ember');
      a.eq(out.summary.kills,1,'Victory fixture genuinely kills');a.eq(q.get().heroResource.ember,depth===20?20:0,'boss victory grants caster charge');a.eq(q.get().heroResource.tide,depth===20?40:20,'boss victory grants powered Support');a.eq(q.get().heroResource.void,7,'victory excludes reserve');
    }
  } else if (id === 'amplifiertrim') {
    for(const ultimate of [false,true]){
      const s=battle(q,['tide']);s.research[id]=cap;s.wispUltimate.tide=ultimate;s.heroRarity.tide=ultimate?5:0;q.set(s);cast(q,'tide');
      a.eq(q.get().supportBuffs.sources.tide.mult,(ultimate?1.5:1.25)+.05,'actual stronger Support snapshot');a.eq(q.get().supportBuffs.sources.tide.until,CLOCK+(ultimate?8000:4000),'duration unchanged');
      q.save();a.eq(q.accept(q.decode(q.export())).supportBuffs,q.get().supportBuffs,'paid Support snapshot accepted by backup normalization');
    }
  } else if (id === 'dualchannel') {
    for(const who of ['gale','thorn'])for(const kind of ['live','offline']){
      const s=battle(q,[who]);s.spirits[who]=10;q.set(s);const native=q.abilityReward(who),scale=kind==='live'?1:.7;s.research[id]=cap;q.set(s);const before=clone(q.get());cast(q,who,kind);
      const extraL=who==='gale'?Math.floor(native.shards):0,extraS=who==='thorn'?Math.floor(native.lumen*.1):0;
      a.near(q.get().lumen-before.lumen,(native.lumen+extraL)*scale,'Dual Channel real Lumen cast '+who+'/'+kind);a.near(q.get().shards-before.shards,(native.shards+extraS)*scale,'Dual Channel real Shard cast '+who+'/'+kind);
    }
  } else if (id === 'overflowconduit') {
    for(const who of ['gale','thorn'])for(const lethal of [false,true]){
      const s=battle(q,[who]);s.spirits[who]=10;s.research[id]=cap;s.enemyHp=lethal?1:s.enemyHp;q.set(s);const native=q.abilityReward(who),expected=Math.floor((who==='gale'?native.shards:native.lumen)*.1),before=clone(q.get()),depth=s.depth;cast(q,who);
      const key=who==='gale'?'shards':'lumen',kill=lethal?(who==='gale'?q.shards(depth,false):q.lumen(depth,false)):0;
      a.near(q.get()[key]-before[key],native[key]+kill+(lethal?expected:0),'Overflow Conduit actual source overkill '+who+'/'+lethal);
    }
  } else if (id === 'resonancecells') {
    const s=prepareResonate(q,{resonancecells:2});s.sigilResonanceUses=3;q.set(s);
    for(const used of [4,5]){q.get().heroResource.ember=0;const sigils=q.get().sigils;q.resonate('ember');a.eq(q.get().sigilResonanceUses,used,'purchased extra actual Resonate use');a.eq(q.get().heroResource.ember,100,'extra use fills chosen Wisp');a.eq(q.get().sigils,sigils-q.resonanceCost(),'extra use has exact Sigil cost');}
    q.get().heroResource.ember=0;const before=clone(q.get());q.resonate('ember');a.eq(q.get(),before,'sixth use is rejected');
  } else if (id === 'resonancecascade') {
    const s=prepareResonate(q,{resonancecascade:5});s.heroResource.tide=40;s.heroResource.stone=95;s.spirits.void=1;s.heroResource.void=3;q.set(s);q.resonate('ember');
    a.eq([q.get().heroResource.ember,q.get().heroResource.tide,q.get().heroResource.stone,q.get().heroResource.void],[100,50,100,3],'manual Resonate cascades only to powered Active, bounded100');
  } else if (id === 'resonancereclaim') {
    for(const depth of [20,21]){
      const s=battle(q,['ember'],depth);s.research[id]=cap;s.research.resonancecells=2;s.sigilResonanceUses=4;s.enemyHp=1;q.set(s);cast(q,'ember');a.eq(q.get().sigilResonanceUses,depth===20?1:4,'actual boss restores bounded spent uses');
    }
  } else throw Error('missing effect contract ' + id);
}

function manualTransactionCases(html, a) {
  for (const d of CATALOGUE) for (const failure of ['primary', 'recovery']) {
    const x = app(html), q = x.q, s = seed(q), cost = exactCost(d, 0, 1);
    s.lumen = cost.lumen; s.shards = cost.shard; q.set(s); q.save();
    const before = clone(q.get()), primary = x.storage.get(P), recovery = x.storage.get(R);
    x.fail(failure === 'primary', failure === 'recovery'); q.buy(d.id, 1);
    if (failure === 'primary') {
      a.eq(q.get(), before, 'manual primary failure rolls back whole state ' + d.id);
      a.eq(x.storage.get(P), primary, 'manual failed primary unchanged'); a.eq(x.storage.get(R), recovery, 'manual failed recovery unchanged');
      x.fail(false, false); q.buy(d.id, 1);
    }
    a.eq(q.get().research[d.id], 1, 'manual accepted purchase exactly once ' + d.id + '/' + failure);
    a.eq([q.get().lumen, q.get().shards], [0, 0], 'manual accepted exact debit');
    const accepted = clone(q.get()); a.eq(JSON.parse(x.storage.get(P)), accepted, 'committed primary owns manual endpoint');
    q.buy(d.id, 1); a.eq(q.get(), accepted, 'unfunded repeated call cannot duplicate level');
    x.fail(false, false); a.eq(app(html, x.storage).q.get(), accepted, 'cold reload retains accepted manual endpoint');
    q.save(); const restored = app(html); restored.area.value = q.export(); restored.q.restore(); restored.drain();
    a.eq(restored.reloads(), 1, 'actual backup restore schedules reload'); a.eq(app(html, restored.storage).q.get(), accepted, 'actual backup restore retains paid level');
    x.storage.set(P, 'broken'); a.eq(app(html, x.storage).q.get(), accepted, 'recovery copy preserves paid level');
  }
  // An unrepresentable smaller price must not hide a representable larger bulk.
  let representableLater = 0;
  for (const d of CATALOGUE) for (let level = 0; level < d.cap - 1; level++) for (const wallet of [2 ** 54, 2 ** 55, 1e18]) {
    const payable = c => wallet - (wallet - c.lumen) === c.lumen && wallet - (wallet - c.shard) === c.shard;
    if (payable(exactCost(d, level, 1))) continue;
    let count = 0;
    for (let n = 2; n <= d.cap - level; n++) if (payable(exactCost(d, level, n))) count = n;
    if (!count) continue;
    const x = app(html), q = x.q, s = seed(q); s.lumen = s.shards = wallet; s.research[d.id] = level; q.set(s);
    a.eq(q.plan(d.id, 'max').buyCount, count, 'later representable exact bulk remains eligible ' + d.id + '/' + level);
    const cost = exactCost(d, level, count); q.buy(d.id, 'max');
    a.eq(q.get().research[d.id], level + count, 'actual representable bulk count'); a.eq([wallet - q.get().lumen, wallet - q.get().shards], [cost.lumen, cost.shard], 'representable bulk debits quoted amounts');
    representableLater++;
  }
  a.eq(representableLater, 28, 'independent nonmonotone representability corpus');
}

function queueCases(html, a) {
  const x = app(html), q = x.q, s = seed(q); IDS.forEach(id => {s.researchQueue[id] = true;}); q.set(s); q.save();
  const expected = clone(q.get());
  function referencePass() {
    for (let guard = 0; guard < 20; guard++) {
      const candidates = CATALOGUE.filter(d => expected.research[d.id] < d.cap).map(d => ({d, cost: exactCost(d, expected.research[d.id], 1)}));
      candidates.sort((a, b) => (a.cost.lumen + a.cost.shard) - (b.cost.lumen + b.cost.shard));
      const next = candidates.find(c => expected.lumen >= c.cost.lumen && expected.shards >= c.cost.shard);
      if (!next) break;
      expected.lumen -= next.cost.lumen; expected.shards -= next.cost.shard; expected.research[next.d.id]++;
    }
  }
  for (let pass = 0; pass < 5; pass++) {
    referencePass(); const writes = x.writes.length; q.queue();
    a.eq(q.get().research, expected.research, 'queue follows independent greedy20-purchase ledger');
    a.eq([q.get().lumen, q.get().shards], [expected.lumen, expected.shards], 'queue exact unit debits'); a.eq(x.writes.length, writes, 'queue never saves per purchase');
  }
  a.ok(CATALOGUE.every(d => q.get().research[d.id] === d.cap), 'all queues reach their finite cap');
  const before = clone(q.get()); q.queue(); a.eq(q.get(), before, 'maxed queue stable and intent retained');

  // A genuine utility cast funds the new queue at an interior event boundary.
  const def = CATALOGUE.find(d => d.id === 'tapconduit');
  function queueSeed(r) {
    const s = battle(r, ['thorn']); s.spirits.thorn = 10; s.heroResource.thorn = 90;
    s.enemyHp = s.enemyMaxHp = 1e12; s.lumen = def.lumen - 1; s.shards = def.shard; s.researchQueue.tapconduit = true;
    return s;
  }
  const trace = app(html); trace.q.set(queueSeed(trace.q));
  const initial = clone(trace.q.get()), full = advance(trace.q, 7, 'offline', {captureTimeline: true}), fullState = clone(trace.q.get());
  a.eq(full.researchBought,1,'authoritative simulation counts actual queued level');
  const event = full.timeline.find(e => e.type === 'research'); a.ok(event && event.elapsedSec > 0 && event.elapsedSec < 7, 'new queue genuinely buys inside simulation window');
  const split = app(html); split.q.set(initial); advance(split.q, event.elapsedSec - 1e-5, 'offline'); a.eq(split.q.get().research.tapconduit, 0, 'no purchase before earned currency event');
  split.q.set(initial); advance(split.q, event.elapsedSec, 'offline'); a.eq(split.q.get().research.tapconduit, 1, 'queue buys at authoritative currency boundary');
  advance(split.q, 7 - event.elapsedSec, 'offline', {clockStartMs: CLOCK + event.elapsedSec * 1000});
  for (const key of ['research','researchQueue','longStudyLevels','spirits','heroResource','depth','enemyDepth','lumen','shards']) {
    if(key==='heroResource'){
      a.eq(Object.keys(split.q.get()[key]),Object.keys(fullState[key]),'same split charge roster');
      Object.keys(fullState[key]).forEach(id=>a.ok(Math.abs(split.q.get()[key][id]-fullState[key][id])<=1e-12,'split charge absolute phase tolerance '+id));
    }else a.eq(split.q.get()[key], fullState[key], 'exact split queue parity ' + key);
  }
  for (const failure of ['primary', 'recovery']) {
    const y = app(html), r = y.q; r.set(queueSeed(r)); r.save(); const saved = clone(r.get());
    y.clock(CLOCK + 60000); y.fail(failure === 'primary', failure === 'recovery'); let result, error;
    r.offline((value, err) => {result = value; error = err;}); y.drain();
    if (failure === 'primary') {
      a.ok(error, 'queued offline primary fault reported'); a.eq(r.get(), saved, 'whole offline purchase endpoint rolled back');
      y.fail(false, false); r.offline((value, err) => {result = value; error = err;}); y.drain();
    }
    a.ok(!error, 'offline queue accepts success or committed-primary recovery failure');
    a.eq(r.get().research.tapconduit, 1, 'offline retry buys once');a.ok(result.effectiveSec===60 && result.earned>0,'actual offline summary owns productive currency interval');
    a.near(r.get().lumen, saved.lumen + result.earned - def.lumen, 'offline exact quoted Lumen ledger'); a.eq(r.get().shards, 0, 'offline exact quoted Shard ledger');
    const accepted = clone(r.get()); a.eq(r.offline(), null, 'accepted offline window cannot repeat'); a.eq(r.get(), accepted, 'repeat adds no money or levels');
    y.fail(false, false); a.eq(app(html, y.storage).q.get(), accepted, 'offline accepted primary survives cold reload');
  }
}

function resonanceTransactions(html, a) {
  for (const failure of ['primary','recovery']) {
    const x=app(html),q=x.q,s=prepareResonate(q,{resonancecells:2,resonancecascade:5});s.sigilResonanceUses=3;s.heroResource.tide=37;s.heroResource.stone=95;q.set(s);q.save();
    const before=clone(q.get()),cost=q.resonanceCost(),primary=x.storage.get(P),recovery=x.storage.get(R);
    x.fail(failure==='primary',failure==='recovery');q.resonate('ember');
    if(failure==='primary'){
      a.eq(q.get(),before,'failed primary Resonate rolls back Sigils, uses and all charge');a.eq([x.storage.get(P),x.storage.get(R)],[primary,recovery],'failed Resonate leaves both save slots');
      x.fail(false,false);q.resonate('ember');
    }
    a.eq(q.get().sigils,before.sigils-cost,'accepted Resonate exact Sigil debit');a.eq(q.get().sigilResonanceUses,4,'accepted fourth use recorded once');
    a.eq([q.get().heroResource.ember,q.get().heroResource.tide,q.get().heroResource.stone],[100,47,100],'accepted Cascade recipients exact');
    const accepted=clone(q.get());a.eq(JSON.parse(x.storage.get(P)),accepted,'primary owns committed Resonate');q.resonate('ember');a.eq(q.get(),accepted,'already-full repeated Resonate is pure');
    x.fail(false,false);a.eq(app(html,x.storage).q.get(),accepted,'fourth use and Cascade cold reload');q.save();x.storage.set(P,'broken');a.eq(app(html,x.storage).q.get(),accepted,'fourth use and Cascade recovery');
  }
  const x=app(html),q=x.q,s=prepareResonate(q,{resonancecells:2,resonancecascade:5});s.sigils=1e30;q.set(s);const before=clone(q.get());q.resonate('ember');a.eq(q.get(),before,'huge Sigil wallet cannot obtain a free charge refill');
  for(const level of [0,1,2,1000000]){
    const state=prepareResonate(q,{resonancecells:level});state.sigilResonanceUses=5;q.set(state);a.eq(q.get().sigilResonanceUses,3+Math.min(2,level),'spent-use normalization follows purchased capacity');
  }
}

function savedValues(html, a) {
  const x=app(html),q=x.q,s=seed(q);IDS.forEach(id=>{delete s.research[id];delete s.researchQueue[id];});
  s.labQueueOn=true;s.research.focus=31;s.research.sense=7;s.research.formation=9;s.research.resolve=11;s.research.charge=28;
  s.nodes.swift=7;s.nodes.echo=10;s.longStudyLevels.prismstudy=6;s.longStudyLevels.labcapacity=2;
  q.set(s);IDS.forEach(id=>{a.eq(q.get().research[id],0,'missing Forge ownership remains zero');a.eq(q.get().researchQueue[id],false,'old global queue does not opt into new spending');});
  for(const key of ['research','nodes','longStudyLevels'])for(const id of Object.keys(s[key]))a.eq(q.get()[key][id],s[key][id],'historical raw paid value preserved '+key+'/'+id);
  a.eq(q.profile(20),null,'zero new charge ownership preserves old estimate path');a.eq(q.policyActive(),false,'zero new combat ownership preserves original controller');
  for(const total of [19,20,59,60]){
    const state=seed(q);state.research.focus=total;IDS.forEach(id=>state.research[id]=100);q.set(state);
    a.eq(q.deed('labmaster'),total>=20,'new Forge levels excluded from original20 Deed');a.eq(q.deed('labqueue'),total>=60,'new Forge levels excluded from original60 Deed');
  }
  for(const owned of [0,1,5,1000000])for(const base of [1.25,1.5])for(const k of [0,1,5,6]){
    const state=battle(q,['tide']);state.research.amplifiertrim=owned;state.supportBuffs={version:1,sources:{tide:{mult:base+.01*k,until:CLOCK+1234}}};q.set(state);
    const accepted=k===0||k<=Math.min(5,owned),record=q.get().supportBuffs.sources.tide;
    a.eq(!!record,accepted,'paid Support strength lattice ownership '+owned+'/'+base+'/'+k);if(accepted)a.eq(record,state.supportBuffs.sources.tide,'paid cast snapshot byte values retained');
  }
  for(const mult of [1.251,1.49999999,1.56,5,Infinity]){
    const state=battle(q,['tide']);state.research.amplifiertrim=5;state.supportBuffs={version:1,sources:{tide:{mult,until:CLOCK+1234}}};q.set(state);a.ok(!q.get().supportBuffs.sources.tide,'malformed strength never rounded onto paid lattice');
  }
  const state=battle(q,['tide']);state.lumen=state.shards=1e9;q.set(state);cast(q,'tide');const old=clone(q.get().supportBuffs);q.buy('amplifiertrim',1);a.eq(q.get().supportBuffs,old,'purchase does not reinterpret an existing cast');
  q.get().heroResource.tide=100;cast(q,'tide');a.eq(q.get().supportBuffs.sources.tide.mult,1.26,'next actual cast gains purchased strength');q.save();a.eq(app(html,x.storage).q.get().supportBuffs,q.get().supportBuffs,'new paid strength cold reload');
}

function paidAscendSeed(q, automatic, depth = 21) {
  const s=battle(q,['tide','aurora','ember','gale','thorn'],depth);
  s.ascendCount=2;s.ascendRewardedDepth=40;s.autoAscendEnabled=automatic;s.autoAscendTargetDepth=depth%10===0?depth+1:depth;
  s.owned={autoascend:true,comettrials:true,rifttrail:true,starfallcrest:true};
  q.achievementDefs().forEach(d=>{s.achieved[d.id]=true;});
  s.nodes.echo=10;s.nodes.swift=7;s.research.focus=31;s.research.sense=7;s.research.formation=9;s.research.resolve=11;s.research.charge=28;
  CATALOGUE.forEach(d=>{s.research[d.id]=d.cap;s.researchQueue[d.id]=true;});
  q.projects().forEach(d=>{s.longStudyLevels[d.id]=d.id==='labcapacity'?2:1;});
  s.longStudyLevels.wispascend=3;s.longStudyLevels.riftattune=4;s.longStudyLevels.formationstudy=5;s.longStudyLevels.prismstudy=6;
  s.activeStudies=['wispascend','prismstudy','procurement','catalysis','fieldnotes','focusprotocol','bossledger'].map((id,i)=>{
    const speed=[1.5,2,3,4,5,6,8][i];s.studyQueue[id]=true;s.studyUseMotes[id]=true;s.studySpeedTargets[id]=speed;
    return {id,remainingSec:1800+i*60,totalDurationSec:2700+i*60,speedMult:speed};
  });
  Object.keys(s.wispUltimate).forEach(id=>{s.wispUltimate[id]=true;s.heroRarity[id]=5;s.wispModules[id]=3;});
  s.sigilResonanceUses=5;s.lumen=0;s.shards=100;s.totalTaps=34;return s;
}
const PAID_FIELDS=['research','researchQueue','nodes','longStudyLevels','owned','heroRarity','wispModules','wispUltimate','studyQueue','studyUseMotes','studySpeedTargets','formationPresets'];
function assertAscend(q,before,a,label,elapsed=0) {
  const after=q.get();a.eq(after.ascendCount,before.ascendCount+1,label+' actual Ascend count');
  if(elapsed===0){a.eq(after.depth,1,label+' actual depth reset');a.eq(after.enemyDepth,1,label+' enemy reset');a.eq([after.enemyHp,after.enemyMaxHp],[q.enemyHp(1),q.enemyHp(1)],label+' no old-run Spillway damage');a.eq(after.lumen,0,label+' run Lumen reset');Object.keys(after.heroResource).forEach(id=>a.eq(after.heroResource[id],0,label+' no old-run charge gift '+id));a.eq(after.supportBuffs,null,label+' no old-run Support buff');}
  a.eq(after.sigilResonanceUses,0,label+' run uses reset');
  const cleared=before.depth%10===0?before.depth:before.depth-1;
  a.eq(after.prisms,before.prisms+prismReward(cleared,before.ascendRewardedDepth,before.nodes.swift,before.longStudyLevels.prismstudy),label+' independent completed-only Prism payout');
  for(const key of PAID_FIELDS)a.eq(after[key],before[key],label+' retains '+key);
  a.eq(after.autoAscendEnabled,before.autoAscendEnabled,label+' keeps enabled intent');a.eq(after.autoAscendTargetDepth,before.autoAscendTargetDepth,label+' keeps target');a.eq(q.slots(),7,label+' keeps purchased seventh slot');
  a.eq(after.activeStudies.length,7,label+' keeps all seven paid records');after.activeStudies.forEach((record,i)=>{
    const old=before.activeStudies[i];a.eq([record.id,record.totalDurationSec,record.speedMult],[old.id,old.totalDurationSec,old.speedMult],label+' paid work and speed unchanged');a.near(record.remainingSec,old.remainingSec-elapsed*old.speedMult,label+' only elapsed work advanced');
  });
}
function ascendCases(html,a,mutant=false) {
  for(const route of ['manual','live','offline','manual-tap','auto-tap']){
    const x=app(html),q=x.q,s=paidAscendSeed(q,route!=='manual',route==='manual'?21:20);q.set(s);
    if(mutant)q.losePaidAscend();
    if(route==='manual-tap' || route==='auto-tap'){q.get().enemyHp=q.tap()/2;if(route==='auto-tap')q.get()._autoTapAccum=1000;}
    else if(route!=='manual'){q.get().enemyHp=q.abilityDamage('tide',20)/2;q.get().heroResource.tide=100;}
    const before=clone(q.get());
    if(route==='manual')q.ascend();else if(route==='manual-tap'){q.manualTap();a.eq(q.get().totalTaps,before.totalTaps+1,'actual manual tap triggers Auto-Ascend');}
    else{const result=advance(q,0,route==='auto-tap'?'live':route);a.eq(result.bossKills,1,route+' actual boss kill');a.eq(result.ascends,1,route+' actual kill triggers Auto-Ascend');if(route==='auto-tap')a.eq(result.autoTaps,1,'actual Auto-Tap event triggers Ascend');}
    assertAscend(q,before,a,route);q.save();const accepted=clone(q.get());a.eq(app(html,x.storage).q.get(),accepted,route+' post-Ascend cold reload');
    const restored=app(html);restored.area.value=q.export();restored.q.restore();restored.drain();a.eq(app(html,restored.storage).q.get(),accepted,route+' actual backup restore retains all investments');
    x.storage.set(P,'broken');a.eq(app(html,x.storage).q.get(),accepted,route+' recovery preserves paid records without another payout');
  }
  if(mutant)return;
  for(const failure of ['primary','recovery']){
    const x=app(html),q=x.q,s=paidAscendSeed(q,true,120);q.set(s);q.get().enemyHp=q.abilityDamage('tide',120)/2;q.get().heroResource.tide=100;q.save();const before=clone(q.get());
    x.clock(CLOCK+60000);x.fail(failure==='primary',failure==='recovery');let result,error;q.offline((v,e)=>{result=v;error=e;});x.drain();
    if(failure==='primary'){a.ok(error,'offline Ascend primary failure reported');a.eq(q.get(),before,'offline Ascend failure restores old boss and every investment');x.fail(false,false);q.offline((v,e)=>{result=v;error=e;});x.drain();}
    a.ok(!error,'offline Ascend transaction accepted');a.eq(result.ascends,1,'yielded offline actually Ascends once');assertAscend(q,before,a,'yielded '+failure,60);
    const accepted=clone(q.get());a.eq(q.offline(),null,'offline Ascend window consumed');a.eq(q.get(),accepted,'offline Ascend repeat adds no payout');x.fail(false,false);a.eq(app(html,x.storage).q.get(),accepted,'accepted offline Ascend cold reload');
  }
}

function combinedCases(html,a) {
  // Cross-currency rewards use the original rounded native cast, even when
  // the same hit earns Overflow and one Spillway child kill.
  for(const who of ['gale','thorn'])for(const kind of ['live','offline']){
    const x=app(html),q=x.q,party=who==='gale'?['gale','stone','tide','aurora']:['thorn','aurora','tide','gale'];
    const s=battle(q,party,1);s.spirits[who]=100;s.wispModules[who]=3;s.wispUltimate[who]=true;s.heroRarity[who]=5;
    s.research.dualchannel=5;s.research.overflowconduit=5;s.research.spillway=5;s.enemyHp=1;s.luminousAccum=0;q.set(s);
    const native=Math.round(q.power(who)*(who==='gale'?.05:.10)*1.15*2*1.25*1.20),extraNative=Math.floor(native*.10),cross=Math.floor(native*(who==='gale'?1:.10));
    const lumenCasts=who==='gale'?cross:native+extraNative,shardCasts=who==='gale'?native+extraNative:cross;
    const expectedL=lumenCasts+q.lumen(1,false)+q.lumen(2,false),expectedS=shardCasts+q.shards(1,false)+q.shards(2,false),before=clone(q.get()),scale=kind==='offline'?.7:1;
    const out=cast(q,who,kind);a.eq(out.summary.kills,2,'utility cast kills source plus one Spillway child '+who+'/'+kind);a.eq(q.get().depth,3,'combined utility spill is bounded to one child');
    const compare=kind==='live'?a.eq:a.near;
    compare(q.get().lumen-before.lumen,expectedL*scale,'original native Lumen ledger with Dual/Overflow/Spillway '+who+'/'+kind);compare(q.get().shards-before.shards,expectedS*scale,'original native Shard ledger with Dual/Overflow/Spillway '+who+'/'+kind);
    a.eq(q.get().enemyHp,q.enemyHp(3),'combined utility never recursively spills');
  }
  for(const who of ['gale','thorn']){
    const x=app(html),q=x.q,s=battle(q,[who]);s.spirits[who]=100;s.research.overflowconduit=5;q.set(s);
    const native=Math.round(q.power(who)*(who==='gale'?.05:.10)),hit=q.abilityDamage(who),hp=hit*31/32;q.get().enemyHp=hp;
    const expectedExtra=Math.floor(native/32),before=clone(q.get()),key=who==='gale'?'shards':'lumen',kill=who==='gale'?q.shards(s.depth,false):q.lumen(s.depth,false);cast(q,who);
    a.ok(expectedExtra>0,'partial overkill fixture has nonzero grant');a.near(q.get()[key]-before[key],native+expectedExtra+kill,'Overflow uses actual fraction below purchased cap '+who);
  }
  for(const route of ['tap','resonate']){
    const x=app(html),q=x.q,s=prepareResonate(q,{tapconduit:5,resonancecascade:5});s.spirits.ember=0;s.heroResource.ember=0;s.heroResource.tide=30;s.heroResource.stone=40;q.set(s);
    if(route==='tap')q.manualTap();else q.resonate('stone');
    a.eq(q.get().heroResource.ember,0,'charge gifts never power an unpowered Active '+route);a.eq(q.get().heroResource.tide,40,'charge recipient is actually powered '+route);
  }
  const x=app(html),q=x.q,s=seed(q),price=exactCost(CATALOGUE.find(d=>d.id==='relay'),0,1);s.lumen=price.lumen;s.shards=price.shard;s.researchQueue.relay=true;q.set(s);q.save();
  const saved=x.storage.get(P);q.queue();q.manualTap();const live=clone(q.get());a.eq(live.research.relay,1,'live queue actually buys before autosave fault');x.fail(true,false);a.eq(q.save(),false,'ordinary primary autosave failure reported');a.eq(q.get(),live,'ordinary failed autosave retains already-earned live state');a.eq(x.storage.get(P),saved,'failed ordinary autosave leaves durable endpoint unchanged');
}

function unsafeCounterCases(html,a,mutant=false) {
  const fixtures=[
    {raw:9007199254740991,after:9007199254740992,bonus:1},
    {raw:9007199254740992,after:9007199254740992,bonus:1},
    {raw:9007199254740994,after:9007199254740996,bonus:1},
    {raw:9007199254741000,after:9007199254741000,bonus:1.5},
    {raw:1e30,after:1e30,bonus:1}
  ];
  for(const fixture of fixtures)for(const route of ['manual','auto']){
    const x=app(html),q=x.q,s=battle(q);s.totalTaps=fixture.raw;s.research.guardiancadence=5;s.achieved.autotap=true;q.set(s);
    if(mutant)q.oldCadenceAverage();
    a.eq(q.get().totalTaps,fixture.raw,'unsafe raw lifetime taps are not rewritten');
    const base=q.tapAt(101,1,0),before=clone(q.get());
    a.near(q.autoDps(101),base*fixture.bonus,'HUD recognizes stagnant cadence ordinal');a.eq(q.get(),before,'unsafe-counter HUD observation remains pure');
    for(let i=0;i<3;i++){
      const hp=q.get().enemyHp;
      if(route==='manual')q.manualTap();else{q.get()._autoTapAccum=1000;const out=advance(q);a.eq(out.autoTaps,1,'one actual Auto-Tap despite stagnant counter');}
      a.eq(q.get().totalTaps,fixture.after,'actual historical Number increment semantics '+route);a.near(hp-q.get().enemyHp,base*fixture.bonus,'actual sticky cadence hit '+route);
    }
    q.save();a.eq(app(html,x.storage).q.get().totalTaps,fixture.after,'unsafe lifetime counter cold reload retained');
    q.get().depth=q.get().enemyDepth=21;const ascends=q.get().ascendCount;q.ascend();a.eq(q.get().ascendCount,ascends+1,'unsafe counter fixture really Ascends');a.eq(q.get().totalTaps,fixture.after,'Ascend preserves raw lifetime counter');
    a.eq(q.get().research.guardiancadence,5,'Ascend preserves paid cadence');
  }
  // A stagnant non-fifth counter produces no Cadence hits. The lower bound
  // must remain valid for it; the upper bound allows every tap to be a fifth.
  const x=app(html),q=x.q,s=battle(q,['tide'],30);s.totalTaps=9007199254740992;s.research.guardiancadence=5;s.achieved.autotap=true;q.set(s);
  const bounds=q.assessment(30),base=q.tapAt(30,1,0),passive=q.passive(30);
  a.near(bounds.lowerDps,passive+base,'global lower bound does not assume representable cadence frequency');
  a.ok(bounds.upperDps>=passive*1.25+base*1.25*1.5,'global upper bound allows every tap to receive cadence');

  // BigInt gives the exact represented integer; convert its exact +1 back
  // to Number independently of the product's ++ loop. Then compare both the
  // one-minute HUD reference and sixty actual authoritative Auto-Tap events.
  for(const raw of [0,4,Number.MAX_SAFE_INTEGER-60,Number.MAX_SAFE_INTEGER-2,Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER,9007199254740992,9007199254740994,9007199254741000,1e30]){
    let ordinal=BigInt(raw),boosted=0;const expectedHits=[];
    for(let i=0;i<60;i++){
      ordinal=BigInt(Number(ordinal+1n));const boost=ordinal>0n && ordinal%5n===0n;
      if(boost)boosted++;expectedHits.push(5.02*(boost?1.5:1));
    }
    const y=app(html),r=y.q,s=battle(r);s.totalTaps=raw;s.research.guardiancadence=5;s.achieved.autotap=true;r.set(s);
    a.eq(r.passive(101),1,'independent cadence window retains fixed level1 Ember power');
    a.near(r.autoDps(101),5.02*(1+.5*boosted/60),'independent60tap HUD mean '+raw);
    const hits=[],undo=r.observeCalibration(e=>{if(e.type==='damage' && e.source==='autoTap' && e.amount>0)hits.push(e.amount);});let out;
    try{out=advance(r,60);}finally{undo();}
    a.eq(out.autoTaps,60,'sixty actual counted Auto-Tap events '+raw);a.eq(hits,expectedHits,'independent integer oracle matches every actual cadence hit '+raw);a.eq(r.get().totalTaps,Number(ordinal),'sixty-tap counter retains exact historical Number endpoint');
  }
}

function prepareUnsafeRun(q,route) {
  const passive=route.indexOf('passive')===0,s=battle(q,passive?['ember']:['tide','ember'],route==='manual'?21:20);
  s.ascendCount=1e30;s.owned.autoascend=true;s.autoAscendEnabled=route!=='manual';s.autoAscendTargetDepth=21;
  for(const id of ['relay','spillway','resonantedge','tapconduit','victorycharge','guardiancadence','sustainedchannel'])s.research[id]=5;
  s.research.resonancecells=2;s.research.resonancereclaim=3;s.sigilResonanceUses=4;
  if(passive)s.spirits.ember=1000;
  if(route.indexOf('tap-auto')===0)s.achieved.autotap=true;
  q.set(s);
  if(route.indexOf('support')===0){q.get().heroResource.tide=100;q.get().enemyHp=q.abilityDamage('tide',20)/2;}
  if(route.indexOf('tap')===0){q.get().enemyHp=q.tap()/2;if(route.indexOf('tap-auto')===0)q.get()._autoTapAccum=1000;}
  if(passive){const net=q.passive(20)-q.get().enemyMaxHp*q.regen(20);assert(net>0,'passive endpoint really kills');q.get().enemyHp=net/8;}
  return clone(q.get());
}
function unsafeRunCase(html,a,route) {
  const x=app(html),q=x.q,before=prepareUnsafeRun(q,route);let summary;
  if(route==='manual')q.ascend();
  else if(route==='support-manual')q.manualCast('tide');
  else if(route==='tap-manual')q.manualTap();
  else summary=advance(q,route.indexOf('passive')===0?.125:0,route.endsWith('offline')?'offline':'live');
  const after=q.get();
  if(summary){a.eq(summary.ascends,1,'unsafe counter still performs actual authoritative Ascend');a.eq(summary.bossKills,1,'unsafe run fixture actually kills its source boss');}
  a.eq(after.depth,1,'unsafe run really resets depth '+route);a.eq(after.totalKills,before.totalKills+(route==='manual'?0:1),'unsafe run has only the intended source kill');
  a.eq(after.prisms,before.prisms+prismReward(20,before.ascendRewardedDepth,before.nodes.swift,before.longStudyLevels.prismstudy),'unsafe run actual independent Prism payout');
  a.eq(after.ascendCount,1e30,'unsafe raw Ascend counter retained');a.eq([after.enemyHp,after.enemyMaxHp],[11,11],'unsafe run blocks old Spillway damage '+route);
  Object.keys(after.heroResource).forEach(id=>a.eq(after.heroResource[id],0,'unsafe run blocks old charge/time credit '+route+'/'+id));
  a.eq(after.supportBuffs,null,'unsafe run clears old Support cast');a.eq(after.sigilResonanceUses,0,'unsafe run resets shared uses');a.eq(after.research,before.research,'unsafe run preserves all paid Forge levels');
  a.eq(Object.keys(q.accept(after)).sort(),Object.keys(q.accept(before)).sort(),'runtime run identity adds no persisted field');
  q.save();a.eq(app(html,x.storage).q.get(),q.get(),'unsafe run accepted cold reload');
}
function unsafeRunCases(html,a) {
  for(const route of ['manual','support-manual','support-live','support-offline','tap-manual','tap-auto-live','tap-auto-offline','passive-live','passive-offline'])unsafeRunCase(html,a,route);
  const healthy=app(html);prepareUnsafeRun(healthy.q,'support-live');healthy.q.save();healthy.clock(CLOCK+60000);let reference;
  healthy.q.offline((result,error)=>{assert.ifError(error);reference=result;});healthy.drain();const expected=clone(healthy.q.get());a.eq(reference.ascends,1,'healthy unsafe-counter offline window really Ascends');
  for(const failure of ['primary','recovery']){
    const x=app(html),q=x.q;prepareUnsafeRun(q,'support-live');q.save();const before=clone(q.get());x.clock(CLOCK+60000);x.fail(failure==='primary',failure==='recovery');let summary,error;
    q.offline((v,e)=>{summary=v;error=e;});x.drain();
    if(failure==='primary'){a.ok(error,'unsafe offline primary failure reported');a.eq(q.get(),before,'failed unsafe offline Ascend rolls back whole endpoint');x.fail(false,false);q.offline((v,e)=>{summary=v;error=e;});x.drain();}
    a.ok(!error,'unsafe offline retry or committed primary accepted');a.eq(summary.ascends,1,'unsafe offline retry counts one real Ascend');a.eq(q.get(),expected,'runtime token from a failed attempt cannot leak into retry');
    x.fail(false,false);a.eq(app(html,x.storage).q.get(),expected,'unsafe offline accepted endpoint reloads once');a.eq(q.offline(),null,'unsafe offline accepted interval cannot repeat');
  }
}
function oldRunGuards(source,passiveOnly) {
  const changes=passiveOnly?[
    ['var runBeforePassive = ascendRunToken;','var runBeforePassive = state.ascendCount;'],
    ['if(ascendRunToken===runBeforePassive){','if(state.ascendCount===runBeforePassive){']
  ]:[
    ['run=ascendRunToken','run=state.ascendCount'],
    ['ascendRunToken===run &&','state.ascendCount===run &&'],
    ['ascendRunToken===run)','state.ascendCount===run)'],
    ['grant.run===ascendRunToken','grant.run===state.ascendCount']
  ];
  for(const [from,to] of changes){assert(source.includes(from),'negative targets observed run guard '+from);source=source.split(from).join(to);}
  return source;
}

function controllerCases(html,a,mutant=false) {
  const x=app(html),q=x.q;
  const combat=['cauterize','fracturekey','guardianseal','sustainedchannel','tapconduit','guardiancadence','relay','resonantedge','victorycharge','amplifiertrim','resonancecascade'];
  for(const id of IDS){const s=battle(q,['ember','tide'],20);s.research[id]=1;q.set(s);a.eq(q.policyActive(),combat.includes(id),'only owned relevant combat effects change automatic boss policy '+id);}
  for(const id of ['guardiancadence','resonantedge']){const s=battle(q,['ember','tide'],20);s.research[id]=5;q.set(s);a.eq(q.profile(20),null,'noncharge combat effect keeps original cycle formula '+id);a.eq(q.policyActive(),true,'noncharge burst still requires conservative policy');}

  const wall=battle(q,['ember'],20);wall.research.sustainedchannel=5;wall.enemyHp=wall.enemyMaxHp=1e15;q.set(wall);
  const assessment=q.assessment(20);a.eq(assessment.regen,wall.enemyMaxHp*q.regen(20),'current Push uses actual saved maximum HP');a.eq(assessment.verdict,'wall','strict upper-rate wall');
  let result=advance(q,0,'offline');a.eq(q.get().riftMode,'push','wall retains Push during existing grace');a.eq(result.retreats,0,'grace prevents early retreat');
  q.set(wall);result=advance(q,0,'offline',{offlineWindowStartMs:CLOCK-301000});a.eq(q.get().riftMode,'farm','guaranteed wall retreats after grace');a.eq(result.retreats,1,'actual analytical retreat recorded');a.eq(q.get().farmReturnDepth,20,'retreat preserves target boss');

  const finiteBurst=clone(wall);finiteBurst.enemyHp=assessment.burstBudget/2;q.set(finiteBurst);
  if(mutant)q.ignoreBurstGuard();
  result=advance(q,0,'offline',{offlineWindowStartMs:CLOCK-301000});
  a.eq(q.get().riftMode,'push','finite remaining burst prevents automatic wall retreat');a.eq(result.retreats,0,'uncertain finite burst preserves current intent');a.eq(q.assessment(20).verdict,'uncertain','HP below bounded burst is uncertain');
  if(mutant)return;

  const ambiguous=battle(q,['ember','tide'],20);ambiguous.research.tapconduit=5;ambiguous.research.relay=5;ambiguous.research.sustainedchannel=5;ambiguous.achieved.autotap=true;q.set(ambiguous);
  const bounds=q.assessment(20),rate=q.regen(20);a.ok(bounds.upperDps>bounds.lowerDps,'independent pulse envelope has a genuine uncertain interval');
  for(const target of [(bounds.lowerDps+bounds.upperDps)/2,bounds.lowerDps,bounds.upperDps]){
    const s=clone(ambiguous);s.enemyHp=s.enemyMaxHp=target/rate;q.set(s);
    a.eq(q.assessment(20).verdict,'uncertain','overlap and near-equality do not invent a win/wall');advance(q,0,'offline',{offlineWindowStartMs:CLOCK-301000});a.eq(q.get().riftMode,'push','uncertain Push remains selected');
  }
  const farm=battle(q,['ember'],19);farm.riftMode='farm';farm.farmDepth=19;farm.farmReturnDepth=20;farm.research.sustainedchannel=5;farm.enemyMaxHp=1e15;farm.enemyHp=1e15;q.set(farm);
  a.eq(q.assessment(20).regen,q.enemyHp(20)*q.regen(20),'future Farm retry uses canonical target maximum');
  advance(q,0,'offline');a.eq(q.get().riftMode,'farm','unsupported retry leaves Farm intent');
  farm.spirits.ember=1000;q.set(farm);a.eq(q.assessment(20).verdict,'sustained','guaranteed lower damage proves retry');result=advance(q,0,'offline');a.eq(q.get().riftMode,'push','actual safe retry enters Push');a.eq(q.get().depth,20,'actual retry targets saved boss');a.eq(result.retries,1,'actual safe retry recorded');

  const profile=battle(q,['tide','ember','stone'],20);profile.research.tapconduit=5;profile.research.relay=5;profile.research.sustainedchannel=5;profile.achieved.autotap=true;q.set(profile);
  const before=clone(q.get()),reference=q.profile(20);a.ok(reference && reference.eventCount>0 && reference.eventCount<=12000,'bounded actual charge profile');a.eq(Object.keys(reference.rates),profile.activeParty,'one cast rate per powered Active');a.ok(reference.supportMult>=1 && reference.supportMult<=1.25,'reference Support time average bounded by actual strength');a.eq(q.get(),before,'HUD profile has no game-state side effects');
  const powerChanged=clone(profile);powerChanged.spirits.ember=100;powerChanged.heroResource.ember=88;powerChanged.lumen=1e8;powerChanged.shards=1e8;q.set(powerChanged);a.eq(q.profile(20),reference,'sustained reference excludes mutable charge, wallets and power');
  const swift=clone(profile);swift.research.charge=30;q.set(swift);const faster=q.profile(20);a.ok(faster.cycleSeconds<reference.cycleSeconds,'natural fill invalidates cached profile');a.ok(faster.rates.ember>reference.rates.ember,'faster natural fill has faster measured casts');
  const ultimate=clone(profile);ultimate.wispUltimate.tide=true;ultimate.heroRarity.tide=5;q.set(ultimate);a.ok(q.profile(20).supportMult>reference.supportMult,'Support Ultimate invalidates duration/strength profile');
  const party=clone(profile);party.activeParty=['ember','tide','stone'];q.set(party);a.eq(Object.keys(q.profile(20).rates),party.activeParty,'party order invalidates first-recipient profile');
}

function exactPaymentCase(x,a) {
  const q=x.q,d=CATALOGUE.find(d=>d.id==='relay'),s=seed(q),cost=exactCost(d,0,1);
  s.lumen=cost.lumen;s.shards=cost.shard;q.set(s);q.buy(d.id,1);
  a.eq(q.get().research.relay,1,'exact approved price must buy the real Relay level');a.eq([q.get().lumen,q.get().shards],[0,0],'exact Relay quoted debit');
}
function hugePaymentCase(x,a) {
  const q=x.q,s=seed(q);s.lumen=s.shards=1e30;q.set(s);const before=clone(q.get());q.buy('relay',1);a.eq(q.get(),before,'huge wallet refuses actual free Forge purchase');
}
function primaryPaymentCase(x,a,resonate=false) {
  const q=x.q,s=resonate?prepareResonate(q,{resonancecascade:5}):seed(q);q.set(s);q.save();const before=clone(q.get());x.fail(true,false);
  if(resonate)q.resonate('ember');else q.buy('relay',1);
  a.eq(q.get(),before,resonate?'primary failure prevents leaked Resonate mutation':'primary failure prevents leaked Forge mutation');
}
function negativeCases(html) {
  const killed=[];
  function reject(name,run,expected){
    let error;try{run();}catch(err){error=err;}
    assert(error instanceof assert.AssertionError,'negative '+name+' must fail a behavioural assertion, not syntax/init/runtime');
    if(expected)assert(error.message.includes(expected),'negative '+name+' failed an unrelated assertion: '+error.message);
    killed.push({name,assertion:error.message.split('\n')[0]});
  }
  const expected={cauterize:'Cauterize multiplies',fracturekey:'fracturekey actual contextual hit 20',guardianseal:'guardianseal actual contextual hit 30',spillway:'Spillway real next nonboss',sustainedchannel:'Sustained Channel actual eligible refund',tapconduit:'Tap Conduit first powered Active',guardiancadence:'actual shared cadence ordinal 5',relay:'post-pass two-Support relay',resonantedge:'Support now delivers a real pulse',victorycharge:'boss victory grants caster charge',amplifiertrim:'actual stronger Support snapshot',dualchannel:'Dual Channel real Lumen cast gale',overflowconduit:'Overflow Conduit actual source overkill gale/true',resonancecells:'purchased extra actual Resonate use',resonancecascade:'manual Resonate cascades',resonancereclaim:'actual boss restores bounded spent uses'};
  for(const id of IDS)reject('disabled-effect-'+id,()=>{const x=app(html);x.q.disable(id);effectCase(id,x,assertions());},expected[id]);
  reject('one-unit-price-drift',()=>{const x=app(html);x.q.corruptPrice();exactPaymentCase(x,assertions());},'exact approved price must buy');
  reject('inexact-wallet-free-purchase',()=>{const x=app(html);x.q.bypassExactDebit();hugePaymentCase(x,assertions());},'huge wallet refuses');
  for(const resonate of [false,true])reject('primary-mutation-leak-'+(resonate?'resonate':'forge'),()=>{const x=app(html);x.q.leakPrimaryMutation();primaryPaymentCase(x,assertions(),resonate);},'primary failure prevents leaked');
  reject('paid-relay-lost-on-real-ascend',()=>ascendCases(html,assertions(),true),'manual retains research');
  reject('finite-burst-false-wall',()=>controllerCases(html,assertions(),true),'finite remaining burst prevents automatic wall retreat');
  reject('unsafe-counter-normal-cadence-average',()=>unsafeCounterCases(html,assertions(),true),'HUD recognizes stagnant cadence ordinal');
  reject('unsafe-count-as-forge-run-identity',()=>unsafeRunCase(oldRunGuards(html,false),assertions(),'support-live'),'unsafe run blocks old Spillway damage');
  reject('unsafe-count-as-passive-run-identity',()=>unsafeRunCase(oldRunGuards(html,true),assertions(),'passive-live'),'unsafe run blocks old charge/time credit');
  return killed;
}

function verify(html,options={}) {
  const a=assertions(),sections={},counts={};
  const all={
    catalogue:()=>Object.assign(counts,catalogueCases(html,a)),
    effects:()=>IDS.forEach(id=>effectCase(id,app(html),a)),
    manual:()=>manualTransactionCases(html,a),
    queue:()=>queueCases(html,a),
    resonance:()=>resonanceTransactions(html,a),
    saves:()=>savedValues(html,a),
    ascend:()=>ascendCases(html,a),
    combined:()=>combinedCases(html,a),
    unsafeCounters:()=>unsafeCounterCases(html,a),
    unsafeRuns:()=>unsafeRunCases(html,a),
    controller:()=>controllerCases(html,a),
    controls:()=>{exactPaymentCase(app(html),a);hugePaymentCase(app(html),a);primaryPaymentCase(app(html),a);primaryPaymentCase(app(html),a,true);}
  };
  for(const name of Object.keys(all)){
    if(options.only && name!==options.only)continue;
    const before=a.count();try{all[name]();}catch(error){error.message='['+name+'] '+error.message;throw error;}sections[name]=a.count()-before;
  }
  if(options.only)assert(Object.hasOwn(all,options.only),'known focused section');
  const negative=options.negative?negativeCases(html):[];
  return {ok:true,scope:options.only?'focused:'+options.only:'full',sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),assertions:a.count(),sections,...counts,negativeControls:negative.length,negative};
}
if(require.main===module){
  const args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--'))||path.resolve(__dirname,'../../index.html'),onlyArg=args.find(a=>a.startsWith('--only='));
  const result=verify(fs.readFileSync(file,'utf8'),{only:onlyArg&&onlyArg.slice(7),negative:args.includes('--negative')});
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports = {CATALOGUE, IDS, exactCost, battle, advance, cast, prepareResonate, verify};
