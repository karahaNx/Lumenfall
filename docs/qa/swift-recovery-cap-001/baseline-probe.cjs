/* Baseline observations only. Executes selected, unchanged production functions
 * with state/UI/save stubs; this is not the complete motor or feature acceptance.
 * Run from the repository root: node docs/qa/swift-recovery-cap-001/baseline-probe.cjs
 */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const expectedHashes = [
  'f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4',
  '4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607'
];
const hash = crypto.createHash('sha256').update(source).digest('hex');
assert(expectedHashes.includes(hash), 'This probe applies only to the explicitly observed product baselines');

function productionFunction(name) {
  const start = source.indexOf('function ' + name + '(');
  assert(start >= 0, 'Missing production function: ' + name);
  const lineEnd = source.indexOf('\n', start);
  const firstLine = source.slice(start, lineEnd);
  if (firstLine.endsWith('}')) return firstLine;
  const end = source.indexOf('\n}', lineEnd);
  assert(end >= 0, 'Missing top-level function end: ' + name);
  return source.slice(start, end + 2);
}
const names = ['finiteNonNegative', 'nonNegativeInt', 'researchLevel',
  'researchEffectiveLevel', 'researchBonus', 'researchFactor', 'fillRateMult',
  'abilityCycleSeconds', 'geometricSum', 'researchCostForLevels',
  'maxAffordableLevels', 'researchEligibility', 'getResearchBuyPlan',
  'trackDaily', 'buyResearch', 'autoLabQueueTick',
  'simulationNextAbilitySeconds', 'simulationAdvanceAbilityResources'];
const catalogue = source.match(/^var RESEARCH = \[[\s\S]*?^\];/m);
const cycleConstant = source.match(/^var ABILITY_BASE_CYCLE_SEC = [^\n]+/m);
assert(catalogue && cycleConstant, 'Production catalogue and cycle constant exist');
const context = vm.createContext({});
vm.runInContext(catalogue[0] + '\n' + cycleConstant[0] + '\n' + names.map(productionFunction).join('\n') + `
var state, labMultiplier = 1;
function saveState(){}
function renderResearch(){}
function updateBattleFast(){}
function renderSideStats(){}
`, context);
const charge = context.RESEARCH.find(n => n.id === 'charge');
assert.equal(charge.levelCap, undefined, 'Observed Swift Recovery has no purchase cap');
function seed(level, shards = 1e9) {
  return {research:Object.fromEntries(context.RESEARCH.map(n => [n.id, n.id === 'charge' ? level : 0])),
    researchQueue:Object.fromEntries(context.RESEARCH.map(n => [n.id, false])),
    maxDepthEver:101, lumen:0, shards, dailyStats:{}, activeParty:['tide'],
    spirits:{tide:1}, heroResource:{tide:0}};
}
const cycles = [0, 7, 100, 1000, 1e9, Number.MAX_SAFE_INTEGER].map(level => {
  context.state = seed(level);
  const cycleSec = context.abilityCycleSeconds();
  const firstCastSec = context.simulationNextAbilitySeconds();
  assert(Math.abs(firstCastSec / cycleSec - 1) < 1e-14, 'Displayed and motor cycle agree on the baseline');
  context.simulationAdvanceAbilityResources(cycleSec / 2);
  assert(Math.abs(context.state.heroResource.tide - 50) < 1e-10, 'Half-cycle fills half the resource');
  return {rawLevel:level, cycleSec, firstCastSec,
    normalSustainedUptime:Math.min(1, 4 / cycleSec),
    ultimateSustainedUptime:Math.min(1, 8 / cycleSec)};
});
const purchases = [1, 5, 10, 25, 50, 100, 'max'].map(requested => {
  context.state = seed(11);
  context.labMultiplier = requested;
  const plan = context.getResearchBuyPlan(charge, requested);
  const before = JSON.parse(JSON.stringify(context.state));
  context.buyResearch(charge);
  assert.equal(context.state.research.charge, 11 + plan.buyCount, 'Handler executes the plan above level 10');
  assert.equal(context.state.shards, before.shards - plan.cost.shard, 'Debit matches plan');
  assert.equal(context.state.dailyStats.research || 0, plan.buyCount, 'Only paid levels increment daily research');
  return {rawBefore:11, requested, count:plan.buyCount, maxed:plan.maxed,
    cost:plan.cost, rawAfter:context.state.research.charge};
});
context.state = seed(11);
context.state.researchQueue.charge = true;
const queueBefore = context.state.shards;
context.autoLabQueueTick();
assert(context.state.research.charge > 11, 'Baseline queue can buy Swift Recovery above level 10');
const queue = {rawBefore:11, rawAfter:context.state.research.charge,
  debit:queueBefore - context.state.shards, retainedIntent:context.state.researchQueue.charge};

// Prices depend on bulk grouping; a raw level alone cannot recover historical debit.
const rounding = [];
for (let k = 0; k < 25; k++) {
  const bulk = context.researchCostForLevels(charge, k, 5).shard;
  let singles = 0;
  for (let i = k; i < k + 5; i++) singles += context.researchCostForLevels(charge, i, 1).shard;
  if (bulk !== singles) rounding.push({startLevel:k, count:5, bulkShards:bulk, singleShards:singles});
}
assert(rounding.length > 0, 'Historical grouping affects paid Shards');
let unsafeCostLevel = 0;
while (Number.isSafeInteger(context.researchCostForLevels(charge, unsafeCostLevel, 1).shard)) unsafeCostLevel++;
const output = {scope:'isolated unchanged functions; state/UI/save stubs; not feature acceptance',
  observedAt:new Date().toISOString(),
  commit:execFileSync('git', ['rev-parse', 'HEAD'], {cwd:root, encoding:'utf8'}).trim(),
  sourceSha256:hash, node:process.version, charge, cycles, purchases, queue,
  priceRoundingExamples:rounding.slice(0, 3), firstNonSafeIntegerSinglePriceLevel:unsafeCostLevel};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
