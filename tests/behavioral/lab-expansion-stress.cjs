'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'../..');
const {app, seed} = require(path.join(root, 'tests/behavioral/lab-expansion-harness.cjs'));
const source = fs.readFileSync(process.argv[2] || path.join(root, 'index.html'), 'utf8');
const {q} = app(source);
let rng = 104;
function rand(n) {rng = (Math.imul(rng,1664525) + 1013904223) >>> 0; return rng % n;}
const buf = new ArrayBuffer(8), float = new Float64Array(buf), bits = new BigUint64Array(buf);
function neighbor(x, dir) {
  if (x === 0) return dir < 0 ? -Number.MIN_VALUE : Number.MIN_VALUE;
  float[0] = x; bits[0] += BigInt(dir * (x > 0 ? 1 : -1)); return float[0];
}
const projects = q.projects().filter(x => !x.retiredTo && x.id !== 'luminousdistill');
let cases = 0, mismatchCount = 0, unavailable = 0;
const mismatches = [];
for (let z = 0; z < 3200; z++) {
  const initial = seed(q);
  const depth = [1,9,19,39,79,149][rand(6)];
  const echo = [0,1,2,3,5,6][rand(6)];
  const at = rand(4), lum = [1,5,10][rand(3)], first = !!rand(2);
  const accum = [0,.01,.3,.69,.999998][rand(5)];
  const target = [1,2,3,7,31,100,1000][rand(7)];
  const project = projects[rand(projects.length)];
  const level = project.levelCap ? rand(project.levelCap) : [0,5,20,50,80][rand(5)];
  const binding = ['lumen','shards','both'][rand(3)], ulp = rand(3)-1;
  initial.depth = initial.enemyDepth = initial.farmDepth = depth;
  initial.riftMode = 'farm'; initial.farmReturnDepth = depth+2;
  initial.longStudyLevels.luminousdistill = lum;
  initial.nodes.echo = echo; initial.longStudyLevels.riftattune = at;
  initial.enemyIsLuminous = first; initial.luminousAccum = accum;
  initial.studyQueue[project.id] = true;
  initial.longStudyLevels[project.id] = level;
  initial.lumen = initial.shards = 0;
  q.set(initial);
  const rate = Math.min(1,.7+echo*.05)+at*.1;
  const cost = q.cost(project.id,level), reward = q.batch(target,'offline');
  if (!Number.isFinite(cost.lumen) || !Number.isFinite(cost.shard) ||
      cost.lumen < reward.lumenGained || cost.shard < reward.shardGained) continue;
  initial.lumen = binding === 'shards' ? cost.lumen : cost.lumen-reward.lumenGained;
  initial.shards = binding === 'lumen' ? cost.shard : cost.shard-reward.shardGained;
  if (ulp) {
    if (binding !== 'shards') initial.lumen = neighbor(initial.lumen,ulp);
    if (binding !== 'lumen') initial.shards = neighbor(initial.shards,ulp);
  }
  q.set(initial);
  const predicted = q.boundary(cost,rate);
  if (!Number.isSafeInteger(predicted) || predicted > 10002) continue;
  function observe(n) {
    q.set(initial);
    const summary = q.batch(n,'offline'), state = q.get(), plan = q.plan(project.id);
    const enough = state.lumen >= cost.lumen && state.shards >= cost.shard;
    const wallet = {L:state.lumen,S:state.shards};
    const started = q.queue().studiesStarted;
    return {n,enough,started,reason:plan.reason,wallet,
      reward:{L:summary.lumenGained,S:summary.shardGained}};
  }
  const atPrediction = observe(predicted), previous = predicted>0 ? observe(predicted-1) : null;
  cases++;
  if (atPrediction.enough && atPrediction.started === 0) unavailable++;
  if (!atPrediction.enough || previous?.enough) {
    mismatchCount++;
    if (mismatches.length < 50) mismatches.push({
      profile:{depth,echo,at,lum,first,acc:accum,target,project:project.id,level,binding,ulp},
      wallet:{L:initial.lumen,S:initial.shards},cost,predicted,atPrediction,previous,
      next:observe(predicted+1)});
  }
}
const output = {sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),
  cases,unavailableAtPrediction:unavailable,mismatchCount,mismatches};
assert(cases >= 2000, 'deterministic corpus must exercise at least 2000 valid price/wallet profiles');
assert.equal(mismatchCount,0,'first actual affordable batch must match predicted boundary: '+JSON.stringify(mismatches.slice(0,4)));
assert.equal(unavailable,0,'each sufficient wallet in this corpus must successfully buy its real project');
console.log(JSON.stringify({status:'pass',seed:104,...output,scope:'real Farm batches and queue transactions; synthetic +/-1 ULP wallet corpus'}));
