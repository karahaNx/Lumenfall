#!/usr/bin/env node
'use strict';

// Read-only baseline inventory for TREE_EXCLUSIVE_001; no proposed gameplay runs here.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const sourcePath = path.resolve(process.argv[2] || 'index.html');
const source = fs.readFileSync(sourcePath, 'utf8');
const sha256 = crypto.createHash('sha256').update(source).digest('hex');
const verifiedSources = new Set([
  'f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4',
  // 0bcce84 main: relevant declarations/operands compared byte-for-byte to the first baseline.
  '4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607'
]);
if (!verifiedSources.has(sha256)) throw new Error('Source differs from the inventoried product baselines; review mappings before reuse.');

function declaration(name) {
  const start = source.indexOf('var ' + name + ' = [');
  const end = source.indexOf('\n];', start);
  if (start < 0 || end < 0) throw new Error('Missing array ' + name);
  const context = vm.createContext({});
  vm.runInContext(source.slice(start, end + 3), context, {timeout: 1000});
  return context[name];
}

const families = {
  tree: declaration('NODES'),
  forge: declaration('RESEARCH'),
  lab: declaration('LONG_STUDIES')
};
const effects = {
  tree: {
    starlight: 'kill-lumen', steady: 'tap-damage', echo: 'offline-rate',
    bonds: 'wisp-recruit-and-empower-price', swift: 'ascend-prisms',
    momentum: 'passive-and-tap-base', reserves: 'offline-hours'
  },
  forge: {
    focus: 'kill-lumen', sense: 'kill-shards', formation: 'passive-and-tap-base',
    resolve: 'tap-damage', charge: 'ability-cycle', arcanecal: 'ability-damage-factor',
    conduction: 'ability-resource-factor', luminoustracking: 'luminous-encounter-chance'
  },
  lab: {
    wispascend: 'passive-and-tap-base', guardmastery: 'tap-damage',
    riftattune: 'offline-rate', shardstudy: 'kill-shards', lumenstudy: 'kill-lumen',
    formationstudy: 'passive-and-tap-base', motestudy: 'luminous-motes-per-kill',
    prismstudy: 'ascend-prisms', measuredinquiry: 'future-study-work'
  }
};
const effectiveCaps = {echo: 6, bonds: 20};
const rows = Object.entries(families).flatMap(([family, nodes]) => nodes.map(node => {
  const effect = effects[family][node.id];
  if (!effect) throw new Error('Unmapped node: ' + family + '/' + node.id);
  const row = {
    family, id: node.id, name: node.name, effect, description: node.desc,
    sourceLine: source.slice(0, source.indexOf("{id:'" + node.id + "'")).split('\n').length,
    unlock: node.requiresAchievement || (node.unlockDepth ? 'maxDepthEver >= ' + node.unlockDepth : 'baseline'),
    configuredLevelCap: node.levelCap === undefined ? null : node.levelCap,
    effectCapFromProductionOperand: family === 'tree' ? effectiveCaps[node.id] || null : node.levelCap || null
  };
  if (family === 'tree') {
    row.currency = ['Prisms'];
    row.price = {rounding: 'ceil per single purchase', base: node.baseCost, growth: node.growth};
    row.firstThreeSinglePrices = [0, 1, 2].map(level => Math.ceil(node.baseCost * Math.pow(node.growth, level)));
  } else {
    row.currency = [node.lumenBase ? 'Lumen' : null, node.shardBase ? 'Shards' : null].filter(Boolean);
    row.price = {
      rounding: family === 'forge' ? 'ceil of geometric sum per bulk transaction' : 'round per study start',
      lumenBase: node.lumenBase, lumenGrowth: node.lumenGrowth,
      shardBase: node.shardBase, shardGrowth: node.shardGrowth
    };
    if (family === 'lab') row.work = {
      baseDurationSec: node.baseDurationSec, growth: node.durationGrowth,
      measuredInquiryApplies: node.id !== 'measuredinquiry',
      note: 'Stored paid active snapshots stay authoritative; Motes speed-up is separate.'
    };
  }
  return row;
}));
for (const row of rows) row.sameOperand = rows.filter(other => other !== row && other.effect === row.effect).map(other => other.family + '/' + other.id);

const inventory = {
  feature: 'TREE_EXCLUSIVE_001', scope: 'Observed read-only baseline; not design acceptance or migration implementation.',
  productSha256: sha256,
  counts: {tree: families.tree.length, forge: families.forge.length, lab: families.lab.length},
  treeOverlapIds: rows.filter(row => row.family === 'tree' && row.sameOperand.length).map(row => row.id),
  caveat: 'Equal operands can have distinct caps/rounding; this groups effects, not equal final outputs.',
  rows
};
process.stdout.write(JSON.stringify(inventory, null, 2) + '\n');
