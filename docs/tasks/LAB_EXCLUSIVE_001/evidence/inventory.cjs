// Read-only inventory of exact baseline functions, not gameplay acceptance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../../../..'),source=fs.readFileSync(path.join(repo,'index.html'),'utf8');
const sha256=crypto.createHash('sha256').update(source).digest('hex');
assert.equal(sha256,'f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4','requires the observed baseline, never silently rebase');
function extract(name){
  const start=source.indexOf('function '+name+'('),body=source.indexOf('{',start);
  assert(start>=0,'function '+name);
  let depth=0,quote='',comment='';
  for(let i=body;i<source.length;i++){
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
  throw Error('Unclosed '+name);
}
const ctx=vm.createContext({state:{nodes:{},research:{},longStudyLevels:{},studyQueue:{},activeStudies:[],maxDepthEver:150,lumen:1e15,shards:1e15}});
vm.runInContext(source.slice(source.indexOf('var RESEARCH = ['),source.indexOf('var ACHIEVEMENTS = [')),ctx);
const names=['nonNegativeInt','nodeLevel','researchLevel','researchEffectiveLevel','researchBonus','researchFactor','longStudyLevel','longStudyPowerMult','longStudyTapMult','longStudyOfflineBonus','longStudyShardMult','longStudyLumenMult','longStudyFormationMult','longStudyMoteMult','longStudyPrismMult','lumenMult','shardMult','tapMult','formationMult','momentumMult','offlineRate','prismMult','studyEffectiveLevel','measuredInquiryReduction','studyDuration','studyCost','unlockedLongStudies','studySlotCount','findActiveStudy','getStudyStartPlan','speedTierCost'];
vm.runInContext(extract('finiteNonNegative'),ctx);
names.forEach(n=>vm.runInContext(extract(n),ctx));
assert.equal(ctx.LONG_STUDIES.length,9);assert.equal(ctx.RESEARCH.length,8);assert.equal(ctx.NODES.length,7);
const families={wispascend:'passive damage',guardmastery:'tap damage',riftattune:'offline rate',shardstudy:'Shards per kill',lumenstudy:'Lumen per kill',formationstudy:'passive damage',motestudy:'Motes per Luminous kill',prismstudy:'Prisms per Ascend',measuredinquiry:'future paid study work'};
const labs=ctx.LONG_STUDIES.map(n=>({
  ...n,family:families[n.id],sourceLine:source.slice(0,source.indexOf("{id:'"+n.id+"'")).split('\n').length,
  checkpoints:[0,1,5,10].map(k=>{
    ctx.state.longStudyLevels.measuredinquiry=0;
    const nominal=ctx.studyDuration(n,k),cost=ctx.studyCost(n,k);
    ctx.state.longStudyLevels.measuredinquiry=10;
    return {completedLevel:k,startNextLevel:k+1,cost,nominalWorkSeconds:nominal,workWithCompletedInquiry10:ctx.studyDuration(n,k),purchaseAllowedAtThisLevel:n.levelCap===undefined||k<n.levelCap};
  })
}));
const slots=[1,14,15,24,25,39,40,59,60,89,90].map(depth=>{
  ctx.state.maxDepthEver=depth;return {maxDepthEver:depth,slots:ctx.studySlotCount()};
});
const mixed={
  nodes:{starlight:2,steady:3,echo:6,swift:4,momentum:5},
  research:{focus:4,sense:5,formation:6,resolve:2},
  longStudyLevels:{wispascend:3,guardmastery:4,riftattune:2,shardstudy:6,lumenstudy:5,formationstudy:7,motestudy:2,prismstudy:3,measuredinquiry:10}
};
Object.assign(ctx.state,mixed);
const stacking={lumen:ctx.lumenMult(),shards:ctx.shardMult(),tapSpecific:ctx.tapMult(),passivePermanentBeforeRaritySynergy:ctx.formationMult()*ctx.momentumMult()*ctx.longStudyPowerMult(),offlineRate:ctx.offlineRate(),prisms:ctx.prismMult(),motesLabFactor:ctx.longStudyMoteMult()};
const expected={lumen:1.2*1.32*1.4,shards:1.4*1.48,tapSpecific:1.24*1.2*1.8,passivePermanentBeforeRaritySynergy:1.3*1.35*1.3*1.45,offlineRate:1.2,prisms:1.16*1.15,motesLabFactor:1.2};
for(const key of Object.keys(expected))assert(Math.abs(stacking[key]-expected[key])<1e-12,key);
const result={scope:'Observed isolated baseline formula/catalogue inventory; no full engine, migration, balance, Android or candidate acceptance.',baseline:{commit:'b2a1f440e8ad9fed34b37551e468224310d2a6f6',tree:'60bb2fce00d0c230a4dd3fd9b61fd7992fb94d60',indexSha256:sha256},counts:{lab:labs.length,forge:ctx.RESEARCH.length,tree:ctx.NODES.length},labs,forge:ctx.RESEARCH,tree:ctx.NODES,slots,speedTiers:ctx.LAB_SPEED_TIERS.map(tier=>({tier,motes:ctx.speedTierCost(tier)})),mixedStacking:{state:mixed,actual:stacking,independentExpected:expected},historicalSpend:'Unknown. Current nominal prices are not purchase receipts.'};
fs.writeFileSync(path.join(__dirname,'inventory.json'),JSON.stringify(result,null,2)+'\n');
const rows=['id,name,completed_level,next_level,lumen,shards,nominal_work_seconds,work_with_inquiry_10,purchase_allowed'];
for(const lab of labs)for(const c of lab.checkpoints)rows.push([lab.id,JSON.stringify(lab.name),c.completedLevel,c.startNextLevel,c.cost.lumen,c.cost.shard,c.nominalWorkSeconds,c.workWithCompletedInquiry10,c.purchaseAllowedAtThisLevel].join(','));
fs.writeFileSync(path.join(__dirname,'prices-and-work.csv'),rows.join('\n')+'\n');
console.log('PASS exact baseline inventory: 9 Lab / 8 Forge / 7 Tree; 36 nominal price/work rows; independent mixed stacking; historical spend unknown.');
