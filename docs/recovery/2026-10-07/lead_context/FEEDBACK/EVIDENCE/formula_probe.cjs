const fs = require('fs');
const vm = require('vm');
const sourcePath = process.argv[2];
const source = fs.readFileSync(sourcePath,'utf8');
function extract(name) {
  const start = source.indexOf('function '+name+'(');
  if(start < 0) throw new Error('Missing function '+name);
  const body = source.indexOf('{', start);
  let depth=0, quote='', comment='';
  for(let i=body;i<source.length;i++) {
    const c=source[i], n=source[i+1];
    if(comment==='line'){if(c==='\n')comment='';continue;}
    if(comment==='block'){if(c==='*'&&n==='/'){comment='';i++;}continue;}
    if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
    if(c==='/'&&n==='/'){comment='line';i++;continue;}
    if(c==='/'&&n==='*'){comment='block';i++;continue;}
    if(c==='"'||c==="'"){quote=c;continue;}
    if(c==='{')depth++;
    if(c==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error('Missing close '+name);
}
const state={nodes:{echo:6,bonds:20,swift:0},research:{charge:0},longStudyLevels:{},prisms:1000000,ascendRewardedDepth:20};
const ctx={state,Math,nonNegativeInt:(v,d)=>Number.isFinite(v)&&v>=0?Math.floor(v):d,
RESEARCH:[{id:'charge',effectPerLevel:0.08}],ABILITY_BASE_CYCLE_SEC:6,ASCEND_REPEAT_REWARD_RATE:0.2,
saveState(){},renderNodes(){},renderAscendSummary(){},updateBattleFast(){}};
vm.createContext(ctx);
const names=['nodeLevel','researchLevel','researchEffectiveLevel','researchBonus','researchFactor','longStudyLevel','longStudyOfflineBonus','longStudyPrismMult','offlineRate','prismMult','costReduction','fillRateMult','abilityCycleSeconds','ascendFullPrismGainForCleared','ascendPrismBreakdown','nodeCost','buyNode','supportAbilityProfile'];
for(const n of names) vm.runInContext(extract(n),ctx);
const results={scope:'Isolated execution of unchanged main functions; not full game, mobile or save-migration acceptance.'};
const echoBefore={level:state.nodes.echo,rate:ctx.offlineRate(),prisms:state.prisms};
ctx.buyNode({id:'echo',baseCost:2,growth:1.4});
results.echo={before:echoBefore,after:{level:state.nodes.echo,rate:ctx.offlineRate(),prisms:state.prisms}};
const bondBefore={level:state.nodes.bonds,discount:ctx.costReduction(),prisms:state.prisms};
ctx.buyNode({id:'bonds',baseCost:2,growth:1.45});
results.cheaper_bonds={before:bondBefore,after:{level:state.nodes.bonds,discount:ctx.costReduction(),prisms:state.prisms}};
results.prisms=[];
for(const swift of [0,1,5,10,25]) for(const lab of [0,1,5,10]) {
  state.nodes.swift=swift;
  state.longStudyLevels.prismstudy=lab;
  for(const repeat of [false,true]){
    state.ascendRewardedDepth=repeat?20:0;
    results.prisms.push({cleared:20,swift,lab,repeat,mult:ctx.prismMult(),...ctx.ascendPrismBreakdown(21)});
  }
}
results.charge=[0,7,100,1000].map(level=>({level,cycleSeconds:ctx.abilityCycleSeconds(level),normalUptime:Math.min(1,4/ctx.abilityCycleSeconds(level)),ultimateUptime:Math.min(1,8/ctx.abilityCycleSeconds(level))}));
results.titan_equal_level_power_ratio=88000/1;
console.log(JSON.stringify(results,null,2));
