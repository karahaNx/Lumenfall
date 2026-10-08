// Read-only catalogue evidence for FORGE_EXCLUSIVE_001; no game modifications.
// Node tooling only. Consumer families are reviewed annotations, not inferred effects.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const sourcePath = process.argv[2] || 'index.html';
const source = fs.readFileSync(sourcePath, 'utf8');
const sha256 = crypto.createHash('sha256').update(source).digest('hex');
const baselines = {
  f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4:'ea44431c163569548973d9e489f75345749a07ee',
  '4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607':'90e4678cb28fa833fdacbc01d1744d9465f6a356',
  '6572650f2ab7523ec02bc09bdd999029316bf6104bfbbff8482d3fca60d4c1ca':'b0bff3729e1fd0047c13d3e3acb74212722a6824'
};
if (!baselines[sha256]) throw Error('Different product bytes: re-review annotations before using this inventory');
const families = {
  focus:'kill-lumen',sense:'kill-shards',formation:'passive-party',resolve:'guardian-tap',charge:'ability-cycle',
  arcanecal:'damaging-ability-factor',conduction:'ability-resource-factor',luminoustracking:'luminous-encounter-frequency',
  starlight:'kill-lumen',steady:'guardian-tap',echo:'offline-rate',bonds:'recruit-discount',swift:'ascend-prisms',momentum:'passive-party',reserves:'offline-hours',
  wispascend:'passive-party',guardmastery:'guardian-tap',riftattune:'offline-rate',shardstudy:'kill-shards',lumenstudy:'kill-lumen',formationstudy:'passive-party',motestudy:'motes-per-luminous-kill',prismstudy:'ascend-prisms',measuredinquiry:'future-study-work'
};
const context = vm.createContext({});
const rows = [];
for (const [catalogue, system] of [['RESEARCH','Forge'],['NODES','Tree'],['LONG_STUDIES','Lab']]) {
  const marker = 'var ' + catalogue + ' = [';
  const start = source.indexOf(marker);
  const end = source.indexOf('\n];', start);
  if (start < 0 || end < 0) throw Error('Missing catalogue ' + catalogue);
  vm.runInContext(source.slice(start,end+3),context,{timeout:1000});
  for (const node of context[catalogue]) {
    const currencies = system === 'Tree' ? ['Prisms'] : [node.lumenBase>0?'Lumen':null,node.shardBase>0?'Shards':null].filter(Boolean);
    const price = system === 'Tree' ? {prisms:{base:node.baseCost,growth:node.growth,rounding:'ceil'}} : {
      lumen:{base:node.lumenBase,growth:node.lumenGrowth},shards:{base:node.shardBase,growth:node.shardGrowth},
      rounding:system==='Forge'?'ceil of geometric sum for actual bought levels':'Math.round per paid start'
    };
    rows.push({system,id:node.id,name:node.name,description:node.desc,effectFamily:families[node.id],currencies,
      unlock:node.requiresAchievement?{achievement:node.requiresAchievement}:{maxDepthEver:node.unlockDepth||1},
      purchaseLevelCap:node.levelCap===undefined?null:node.levelCap,effectPerLevel:node.effectPerLevel??null,price,
      work:system==='Lab'?{baseSeconds:node.baseDurationSec,growth:node.durationGrowth}:null,
      source:{path:'index.html',line:source.slice(0,start).split('\n').length+1+context[catalogue].findIndex(n=>n.id===node.id)}});
  }
}
// Isolated execution of actual pricing/effect functions. Not simulation acceptance.
function extract(name) {
  const start = source.indexOf('function '+name+'(');
  if(start<0) throw Error('Missing function '+name);
  const body = source.indexOf('{',start);
  let depth=0,quote='',comment='';
  for(let i=body;i<source.length;i++) {
    const c=source[i],n=source[i+1];
    if(comment==='line'){if(c==='\n')comment='';continue;}
    if(comment==='block'){if(c==='*'&&n==='/'){comment='';i++;}continue;}
    if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
    if(c==='/'&&n==='/'){comment='line';i++;continue;}
    if(c==='/'&&n==='*'){comment='block';i++;continue;}
    if(c==='"'||c==="'"){quote=c;continue;}
    if(c==='{')depth++;
    if(c==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('Missing function end '+name);
}
context.state={research:{},nodes:{},longStudyLevels:{}};
context.nonNegativeInt=(v,d)=>Number.isFinite(v)&&v>=0?Math.floor(v):d;
for(const name of ['nodeLevel','researchLevel','researchEffectiveLevel','researchBonus','researchFactor',
  'longStudyLevel','longStudyLumenMult','longStudyShardMult','longStudyTapMult','longStudyFormationMult',
  'lumenMult','shardMult','tapMult','formationMult','geometricSum','researchCostForLevels']) vm.runInContext(extract(name),context);
const sourcePriceExamples = context.RESEARCH.map(node=>({id:node.id,
  firstLevel:context.researchCostForLevels(node,0,1),
  levelsZeroThroughNine:context.researchCostForLevels(node,0,10),
  nextAtStoredLevelNine:context.researchCostForLevels(node,9,1),
  separateFirstTwo:context.researchCostForLevels(node,0,1).shard+context.researchCostForLevels(node,1,1).shard,
  bulkFirstTwo:context.researchCostForLevels(node,0,2).shard}));
context.state.nodes={starlight:1,steady:1};
context.state.research={focus:1,sense:1,resolve:1,formation:1};
context.state.longStudyLevels={lumenstudy:1,shardstudy:1,guardmastery:1,formationstudy:1};
const stackingProbe={scope:'Actual unchanged functions with isolated state; not full-motor acceptance',
  lumen:context.lumenMult(),shards:context.shardMult(),tap:context.tapMult(),formation:context.formationMult()};
const consumerNames=['researchEligibility','getResearchBuyPlan','researchCostForLevels','buyResearch','autoLabQueueTick',
  'researchEffectiveLevel','researchBonus','researchFactor','lumenMult','shardMult','tapMult','passiveGlobalPowerMult',
  'abilityRawBurst','abilityRewardRaw','abilityRewardPerCast','eliteChance','motesDropFor','researchEffectPreview',
  'normalizeCurrentSave','migrateSaveV0ToV1','legacyResearchLevels'];
const consumerHashes=Object.fromEntries(consumerNames.map(name=>[name,crypto.createHash('sha256').update(extract(name)).digest('hex')]));
const groups={};
for(const row of rows)(groups[row.effectFamily]??=[]).push(row.system+':'+row.id);
console.log(JSON.stringify({scope:'Observed baseline catalogue and isolated prices/effects; proposals and migration are not implemented',
  sourcePath,sha256,gitBlob:baselines[sha256],
  counts:{Forge:context.RESEARCH.length,Tree:context.NODES.length,Lab:context.LONG_STUDIES.length},rows,
  overlaps:Object.fromEntries(Object.entries(groups).filter(([,items])=>items.length>1)),sourcePriceExamples,stackingProbe,consumerHashes},null,2));
