'use strict';

// Read-only catalogue/formula evidence. Executes data declarations and selected
// unchanged pure functions in a VM; does not start the game or migrate a save.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const path = require('node:path');
const filename = path.resolve(process.argv[2] || 'index.html');
const bytes = fs.readFileSync(filename);
const source = bytes.toString('utf8');
const line = offset => source.slice(0, offset).split('\n').length;

function catalogue(name) {
  const pattern = new RegExp('var ' + name + ' = \\[([\\s\\S]*?)\\n\\];');
  const match = pattern.exec(source);
  if (!match) throw new Error('Missing catalogue: ' + name);
  const rows = vm.runInNewContext('[' + match[1] + ']', Object.create(null), {timeout: 1000});
  if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Duplicate IDs: ' + name);
  return rows.map(row => ({...row, sourceLine: line(source.indexOf("{id:'" + row.id + "'", match.index))}));
}

function extract(name) {
  const start = source.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Missing function: ' + name);
  const body = source.indexOf('{', start);
  let depth = 0, quote = '', comment = '';
  for (let i = body; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = ''; continue; }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unclosed function: ' + name);
}

const lab = catalogue('LONG_STUDIES'), forge = catalogue('RESEARCH'), tree = catalogue('NODES');
const shop = catalogue('SHOP');
const state = {nodes: {}, research: {}, longStudyLevels: {}, owned: {}, legacyCometPurchases: {}};
const context = {state, RESEARCH: forge, Math};
vm.createContext(context);
const functions = [
  'finiteNonNegative', 'nonNegativeInt', 'nodeLevel', 'researchLevel',
  'researchEffectiveLevel', 'researchBonus', 'researchFactor', 'longStudyLevel',
  'longStudyPowerMult', 'longStudyTapMult', 'longStudyOfflineBonus',
  'longStudyShardMult', 'longStudyLumenMult', 'longStudyFormationMult',
  'longStudyPrismMult', 'longStudyMoteMult', 'lumenMult', 'shardMult',
  'tapMult', 'formationMult', 'momentumMult', 'offlineRate', 'prismMult',
  'costReduction', 'offlineCapHours', 'speedTierCost', 'eliteChance'
];
for (const name of functions) vm.runInContext(extract(name), context, {timeout: 1000});
const duplicateGroups = [
  {effect: 'kill_lumen', owner: 'Lab/lumenstudy', sources: ['Tree/starlight', 'Forge/focus', 'Lab/lumenstudy']},
  {effect: 'kill_shards', owner: 'Lab/shardstudy', sources: ['Forge/sense', 'Lab/shardstudy']},
  {effect: 'passive_power', owner: 'Lab/wispascend', sources: ['Forge/formation', 'Lab/formationstudy', 'Tree/momentum', 'Lab/wispascend']},
  {effect: 'tap_damage', owner: 'Lab/guardmastery', sources: ['Tree/steady', 'Forge/resolve', 'Lab/guardmastery']},
  {effect: 'offline_rate', owner: 'Tree/echo', sources: ['Tree/echo', 'Lab/riftattune']},
  {effect: 'ascend_prisms', owner: 'Tree/swift', sources: ['Tree/swift', 'Lab/prismstudy']}
];
const profiles = [
  {name: 'fresh', n: 0, f: 0, l: 0},
  {name: 'owned-small', n: 2, f: 3, l: 4},
  {name: 'owned-high', n: 25, f: 100, l: 15},
  {name: 'raw-overlevels', n: 1000, f: 1000, l: 1000}
];
const observations = profiles.map(p => {
  tree.forEach(row => { state.nodes[row.id] = p.n; });
  forge.forEach(row => { state.research[row.id] = p.f; });
  lab.forEach(row => { state.longStudyLevels[row.id] = p.l; });
  return {profile: p, lumenFactor: context.lumenMult(), shardFactor: context.shardMult(),
    tapFactor: context.tapMult(), passiveFactorsInProductionOrder: [context.formationMult(), 'synergyMult (outside this probe)', context.momentumMult(), context.longStudyPowerMult()],
    offlineRate: context.offlineRate(), prismFactor: context.prismMult(),
    moteYieldFactor: context.longStudyMoteMult(), recruitDiscount: context.costReduction(),
    capHours: context.offlineCapHours(), futureLuminousChanceAtRift60: context.eliteChance(60)};
});
const result = {scope: 'Read-only data and isolated unchanged formulas; no full-engine, migration, balance, UI or Android acceptance.',
  source: {sha256: crypto.createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length},
  counts: {lab: lab.length, forge: forge.length, tree: tree.length, total: lab.length + forge.length + tree.length},
  lab, forge, tree, boundaryShop: shop, duplicateGroups, observations,
  speedTiers: [1.5, 2, 3, 4, 5, 6, 7, 8].map(tier => ({tier, motes: context.speedTierCost(tier)})),
  functionLines: Object.fromEntries(functions.map(name => [name, line(source.indexOf('function ' + name + '('))]))};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
