'use strict';
// The oracle executes real Farm batches and real queue starts. It deliberately
// does not repeat the predictor's deficit or reward-sum expression.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const {app, seed, clone} = require('./lab-expansion-harness.cjs');
const source = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');

function verify(html) {
  const {q} = app(html);
  let checks = 0, cases = 0;
  const eq = (actual, expected, label) => {checks++; assert.deepEqual(actual, expected, label);};
  const ok = (value, label) => {checks++; assert.ok(value, label);};
  function farm(depth, echo, attunement, luminous, first, accum) {
    const s = seed(q);
    s.depth = s.enemyDepth = s.farmDepth = depth;
    s.riftMode = 'farm'; s.farmReturnDepth = depth + 2;
    s.nodes.echo = echo; s.longStudyLevels.riftattune = attunement;
    s.longStudyLevels.luminousdistill = luminous;
    s.enemyIsLuminous = first; s.luminousAccum = accum;
    s.studyQueue.bossledger = true;
    return s;
  }
  function check(initial, rate, label, maxKills, replay, kind, project) {
    function prepare() {q.set(initial); if(replay) replay(q);}
    prepare();
    project = project || 'bossledger';
    const cost = q.cost(project, q.get().longStudyLevels[project]);
    const predicted = q.boundary(cost, rate);
    let firstAffordable = null, stateAtPurchase;
    for (let count = 0; count <= maxKills; count++) {
      prepare();
      q.batch(count, kind || 'offline');
      const actual = q.get();
      if (actual.lumen >= cost.lumen && actual.shards >= cost.shard) {
        firstAffordable = count; stateAtPurchase = clone(actual); break;
      }
    }
    ok(firstAffordable !== null, label + ': bounded real-batch oracle finds a purchase');
    eq(predicted, firstAffordable, label + ': predicted boundary equals first actually affordable Farm batch');
    q.set(stateAtPurchase);
    const transaction = q.queue();
    eq(transaction.studiesStarted, 1, label + ': real queue starts at boundary');
    eq(q.get().lumen, stateAtPurchase.lumen - cost.lumen, label + ': exact Lumen debit');
    eq(q.get().shards, stateAtPurchase.shards - cost.shard, label + ': exact Shard debit');
    eq(q.get().activeStudies.map(a => a.id), [project], label + ': one paid Study');
    cases++;
    return firstAffordable;
  }

  const original = farm(9, 2, 0, 1, false, .3);
  original.lumen = 13676.8; original.shards = 450.4;
  eq(check(original, .70 + 2 * .05, 'original fractional-wallet reproduction', 33), 31,
    '31 kills pay 14000 Lumen / 500 Shards; the old predictor incorrectly returned 32');

  // Exercise the authoritative clock as well as the predictor. High but valid
  // Wisp power reaches this purchase before the first ability/timer boundary.
  const running = clone(original);
  running.spirits.ember = 1000; running.activeParty = ['ember'];
  running.enemyHp = running.enemyMaxHp = Math.round(10 * Math.pow(1.145, 9));
  q.set(running);
  const purchaseAt = 31 * running.enemyMaxHp / q.power();
  const simulated = q.advance(purchaseAt + 1e-6, {kind:'offline', clockStartMs:running.lastSeen, captureTimeline:true});
  eq(simulated.kills, 31, 'authoritative timeline ends after exactly 31 kills');
  eq(simulated.studiesStarted, 1, 'authoritative offline queue starts without waiting for kill 32');
  eq(q.get().lumen, 0, 'authoritative exact Lumen payment');
  eq(q.get().shards, 0, 'authoritative exact Shard payment');
  const started = simulated.timeline.find(event => event.type === 'studyStart');
  ok(started && Math.abs(started.elapsedSec - purchaseAt) < 1e-12, 'paid Study starts at the 31st kill timestamp');
  eq(q.get().activeStudies[0].id, 'bossledger', 'timeline retains its newly paid Study');

  const tinyDeficit = clone(original);
  tinyDeficit.lumen = 13989.599999999999; tinyDeficit.shards = 500;
  eq(check(tinyDeficit, .70 + 2 * .05, 'one-kill estimate still short by a representable fraction', 3), 2,
    'the epsilon-based upper estimate must be verified against actual wallet credit');

  const shortUpper = farm(1, 3, 0, 10, false, .01);
  shortUpper.lumen=19061.899999999998; shortUpper.shards=1201;
  shortUpper.longStudyLevels.rarityappraisal=2;
  shortUpper.studyQueue.bossledger=false; shortUpper.studyQueue.rarityappraisal=true;
  eq(check(shortUpper, .70 + 3 * .05, '31-kill estimate still below the real whole-currency price', 33,
    null, 'offline', 'rarityappraisal'), 32, 'upper bounds greater than one also require a real batch check');

  // Reach the near-wrap phase using eleven genuine single-kill transitions.
  // Re-loading a serialized intermediate state would normalize that phase and
  // hide this live-runtime regression, so every oracle attempt replays the kills.
  const nearWrap = farm(39, 6, 0, 1, false, .01);
  nearWrap.lumen = 10469.35; nearWrap.shards = 500;
  function replayEleven(r) {for(let n=0;n<11;n++) r.kill('live');}
  eq(check(nearWrap, 1, 'ordinary first enemy at a real near-wrap Luminous phase', 3, replayEleven, 'live'), 2,
    'a single-kill batch rewards the current enemy before any future spawn');

  // A large old paid level can make the ordinary-kill estimate unsafe while
  // Luminous rewards still allow a safe integer boundary. Use an independent
  // BigInt search over actual batches; BigInt is test-only, never game code.
  const large = farm(1, 6, 0, 10, false, .3);
  large.longStudyLevels.guardmastery=60;
  large.studyQueue.bossledger=false;large.studyQueue.guardmastery=true;
  large.lumen=1188487091262810400;large.shards=82872472750854020;
  q.set(large);const largeCost=q.cost('guardmastery',60);
  const largePrediction=q.boundary(largeCost,1);
  function batchCanPay(count){q.set(large);q.batch(Number(count),'offline');return q.get().lumen>=largeCost.lumen&&q.get().shards>=largeCost.shard;}
  let low=1n,high=BigInt(Number.MAX_SAFE_INTEGER);
  ok(batchCanPay(high),'large paid level has an actually affordable safe batch');
  while(low<high){const mid=low+(high-low)/2n;if(batchCanPay(mid))high=mid;else low=mid+1n;}
  eq(Number(low),8834951456310660,'independent real-batch large-value reproduction');
  eq(largePrediction,Number(low),'unsafe ordinary estimate must not hide the earlier safe boundary');
  eq(batchCanPay(low-1n),false,'one less large-count kill cannot buy');
  eq(batchCanPay(low),true,'exact large-count boundary can buy');
  eq(q.queue().studiesStarted,1,'large old paid level still permits a real exact-debit transaction');

  // Real whole-currency Lab prices; vary which wallet is limiting, fractional
  // offline rates, existing Luminous phase and the first enemy's identity.
  for (const depth of [1, 9, 19, 39]) for (const echo of [0, 2, 5, 6])
    for (const first of [false, true]) for (const target of [1, 2, 7, 31])
      for (const binding of ['lumen', 'shards', 'both']) {
        const initial = farm(depth, echo, echo === 5 ? 1 : 0, target === 7 ? 10 : 1, first, .3);
        const rate = Math.min(1, .70 + echo * .05) + initial.longStudyLevels.riftattune * .10;
        initial.lumen = initial.shards = 0; q.set(initial);
        const cost = q.cost('bossledger', 0), reward = q.batch(target, 'offline');
        initial.lumen = binding === 'shards' ? cost.lumen : Math.max(0, cost.lumen - reward.lumenGained);
        initial.shards = binding === 'lumen' ? cost.shard : Math.max(0, cost.shard - reward.shardGained);
        check(initial, rate, [depth, echo, first, target, binding].join('/'), target + 2);
      }
  return {checks, cases};
}

const result = verify(source), negatives = [];
if (process.argv.includes('--negative')) {
  const exact = 'state.lumen+(lumenPerKill*count+extraLumen*luminous)>=cost.lumen &&\n      state.shards+(shardPerKill*count+extraShard*luminous)>=cost.shard;';
  const old = 'state.lumen+lumenPerKill*count+extraLumen*luminous>=cost.lumen &&\n      state.shards+shardPerKill*count+extraShard*luminous>=cost.shard;';
  assert.equal(source.split(exact).length, 2, 'one production wallet/batch boundary anchor');
  let caught;
  try {verify(source.replace(exact, old));} catch (error) {
    if (!(error instanceof assert.AssertionError)) throw error;
    caught = error.message;
  }
  assert.ok(caught, 'original floating-point grouping must fail the real-batch oracle');
  negatives.push({name:'wallet-before-luminous-bonus', caught});
  const variants = [
    ['unverified-one-kill-estimate', "if(!labExpansionLevel('luminousdistill') || upper<=0 || !Number.isFinite(upper)) return upper;", "if(!labExpansionLevel('luminousdistill') || upper<=1 || !Number.isFinite(upper)) return upper;"],
    ['imaginary-first-luminous-kill', 'if(count>1) luminous+=Math.floor(accum+(count-1)*chance+1e-12);', 'luminous+=Math.floor(accum+(count-1)*chance+1e-12);'],
    ['unverified-upper-bound', 'while(!enough(high)){', 'while(false){'],
    ['unsafe-normal-estimate-skips-safe-buy', "if(!labExpansionLevel('luminousdistill') || upper<=0 || !Number.isFinite(upper)) return upper;", "if(!labExpansionLevel('luminousdistill') || upper<=0 || !Number.isSafeInteger(upper)) return upper;"]
  ];
  for(const [name, before, after] of variants){
    assert.equal(source.split(before).length,2,'one causal boundary anchor '+name);
    let rejected;
    try {verify(source.replace(before,after));} catch(error){if(!(error instanceof assert.AssertionError)) throw error; rejected=error.message;}
    assert.ok(rejected,'boundary mutation must fail: '+name);negatives.push({name,caught:rejected});
  }
}
console.log(JSON.stringify({status:'pass', sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),
  ...result, negativeControls:negatives, scope:'complete production IIFE, actual Farm reward/queue transactions; DOM presentation stubbed'}));
