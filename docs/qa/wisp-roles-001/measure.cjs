'use strict';
// Local analysis only. Execute the unchanged product IIFE with DOM init held.
// No balance override, save write, network request, or product test hook.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const indexPath = process.env.WISP_INDEX || path.join(root, 'index.html');
const bytes = fs.readFileSync(indexPath);
const html = bytes.toString('utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const copy = x => JSON.parse(JSON.stringify(x));
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const near = (a, b, label) => assert(Math.abs(a-b) <= Math.max(1,Math.abs(a),Math.abs(b))*1e-10, label);
const anchor = "if(document.readyState==='loading'){";
assert.equal(script.split(anchor).length, 2, 'one startup injection anchor');
const bridge = `var measurementDeaths=[],measurementSummary=null,measurementKillCount=0;
var measurementTimelinePush=simulationTimelinePush;
simulationTimelinePush=function(summary,elapsedSec,type,detail){
  if(summary!==measurementSummary){measurementSummary=summary;measurementKillCount=0;measurementDeaths=[];}
  if(summary.kills>measurementKillCount){
    measurementDeaths.push({elapsedSec:elapsedSec,kills:summary.kills-measurementKillCount,depthAfter:state.depth,event:type});
    measurementKillCount=summary.kills;
  }
  return measurementTimelinePush.apply(this,arguments);
};
globalThis.measure = {
  fresh:()=>freshState(), set:s=>state=acceptPersistedState(s,'wisp-roles-analysis'),
  rawSet:s=>state=s, get:()=>state, spirits:()=>SPIRITS,
  deaths:()=>measurementDeaths,
  run:(seconds,kind,start,trace)=>advanceAuthoritativeTime(seconds,{kind:kind,visual:false,clockStartMs:start,offlineWindowStartMs:start,captureTimeline:!!trace}),
  costs:id=>spiritCost(SPIRITS.find(s=>s.id===id)),
  output:depth=>({
    depth:depth, cycle:abilityCycleSeconds(), buff:averageSupportBuffMult(),
    passiveGlobal:passiveGlobalPowerMult(), contextBond:formationContextDamageMult(depth),
    generalBond:formationGeneralDamageMult(), rewardBond:formationRewardMult(),
    tapFactor:tapMult()*bossTapDamageMult(depth), autoTap:!!state.achieved.autotap,
    abilityBoss:bossAbilityDamageMult(depth), total:sustainedCombatDps(depth),
    boss:isBoss(depth), hp:enemyHpFor(depth), regen:bossRegenRate(depth),
    bossEstimate:estimatedBossKillSeconds(depth), bonds:activeFormationBonds(),
    motePerLuminous:Math.max(1,Math.round(motesDropFor(depth)*(1+supportMoteBonus()))),
    moteModules:supportMoteBonus(),
    rows:SPIRITS.filter(s=>state.activeParty.indexOf(s.id)!==-1 && (state.spirits[s.id]||0)>0).map(s=>({
      id:s.id,role:s.role,level:state.spirits[s.id],power:wispPower(s,state.spirits[s.id]),
      burst:abilityRawBurst(s,state.spirits[s.id]),nextCost:spiritCost(s),
      rewards:abilityRewardPerCast(s,state.spirits[s.id]),
      rewardRaw:abilityRewardRaw(s,state.spirits[s.id]),
      support:s.abilityType==='support' ? supportAbilityProfile(s) : null,
      module:moduleLevel(s.id),rarity:state.heroRarity[s.id],ultimate:ultimateUnlocked(s.id)
    }))
  })
};`;
function engine() {
  const ctx = vm.createContext({document:{readyState:'loading',addEventListener(){}},window:{addEventListener(){}},console});
  vm.runInContext(script.replace(anchor,bridge+'\n'+anchor), ctx, {timeout:3000});
  return {api:ctx.measure, run:(seconds,kind,start,trace=false)=>{
    ctx.args={seconds,kind,start,trace};
    const result=copy(vm.runInContext('measure.run(args.seconds,args.kind,args.start,args.trace)',ctx,{timeout:30000}));
    if(trace)result.observedDeaths=copy(ctx.measure.deaths());
    return result;
  }};
}
const e = engine(), api = e.api;
const data = copy(api.spirits());
const savePath = path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json');
const original = JSON.parse(fs.readFileSync(savePath,'utf8'));
const encoded = fs.readFileSync(path.join(path.dirname(savePath),'backup_code.txt'),'utf8').trim();
assert.deepEqual(JSON.parse(decodeURIComponent(encoded.slice('LUMENFALL1:'.length))),original,'archived backup code matches decoded save');
const provenance = {
  measuredAt:new Date().toISOString(), tool:process.version, indexPath,
  indexSha256:sha256(bytes), indexGitBlob:crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex'),
  liveMain:'b2a1f440e8ad9fed34b37551e468224310d2a6f6', localCheckout:'67c3e99c24587f6c13fc65cfd27f8dcb8e289602',
  saveSha256:sha256(fs.readFileSync(savePath)),
  caveat:'Saved late-game ownership, post-Ascend run. No received powered mid/late-game snapshot. Controlled budgets are measurement inputs, not approved gameplay numbers.'
};
provenance.sourceKind=provenance.indexSha256==='f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4' ? 'verified live-main product bytes' : 'candidate or alternate bytes; inspect hash';
if(provenance.indexSha256==='7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b')provenance.candidateTree='758d9a3f5baee9fd49a5acfaa0e11d13e746b7ef';
if(provenance.indexGitBlob==='90e4678cb28fa833fdacbc01d1744d9465f6a356'){
  provenance.liveMain='0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd';
  provenance.sourceKind='verified latest live-main product bytes';
}
function evaluate(s, depth) {
  api.rawSet(copy(s));
  const before = JSON.stringify(api.get());
  const o = copy(api.output(depth));
  assert.equal(JSON.stringify(api.get()),before,'formula reads do not mutate state');
  const rows = o.rows.map(r=>({
    ...r,
    rawPassiveDps:r.power*o.passiveGlobal,
    rawAbilityDps:r.burst*o.abilityBoss/o.cycle,
    guardianFromPowerDps:o.autoTap ? r.power*o.passiveGlobal*0.02*o.tapFactor : 0,
    supportUptime:r.support ? Math.min(1,r.support.durationMs/1000/o.cycle) : 0
  }));
  rows.forEach(r=>{r.rawDamageDps=r.rawPassiveDps+r.rawAbilityDps+r.guardianFromPowerDps;});
  const passive = rows.reduce((v,r)=>v+r.rawPassiveDps,0);
  const abilities = rows.reduce((v,r)=>v+r.rawAbilityDps,0);
  const tapFromPower = rows.reduce((v,r)=>v+r.guardianFromPowerDps,0);
  const guardianBase = o.autoTap ? 5*o.tapFactor : 0;
  const raw = passive+abilities+tapFromPower+guardianBase;
  const bonds = (passive+abilities)*(o.contextBond-1)+tapFromPower*(o.generalBond-1);
  let runningContext=1,runningGeneral=1;
  const bondLedger=o.bonds.map(b=>{
    const oldContext=runningContext,oldGeneral=runningGeneral;
    if(b.id==='starcaller'){runningContext*=1.18;runningGeneral*=1.18;}
    if(b.id==='duskguard' && o.boss)runningContext*=1.35;
    if(b.id==='pathfinder' && !o.boss)runningContext*=1.20;
    return {id:b.id,partners:b.ids,damageDelta:(passive+abilities)*(runningContext-oldContext)+tapFromPower*(runningGeneral-oldGeneral),
      note:b.id==='dawnpriest' ? 'Resource effect, no damage effect.' : 'Sequential additive allocation before support; not an independent removal delta.'};
  });
  near(bondLedger.reduce((n,b)=>n+b.damageDelta,0),bonds,'individual Bonds reconcile');
  const supportBase = passive*o.contextBond+tapFromPower*o.generalBond+guardianBase;
  rows.forEach(r=>{r.supportExtraDps=r.support ? supportBase*(r.support.strength-1)*r.supportUptime : 0;});
  const support = rows.reduce((v,r)=>v+r.supportExtraDps,0);
  near(raw+bonds+support,o.total,'additive damage ledger reconciles with authoritative total');
  const abilityResources = rows.reduce((v,r)=>({lumen:v.lumen+r.rewards.lumen/o.cycle,shards:v.shards+r.rewards.shards/o.cycle}),{lumen:0,shards:0});
  const marginal = rows.map(r=>{
    const removed = copy(s); removed.activeParty=removed.activeParty.filter(id=>id!==r.id);
    api.rawSet(removed); const without=copy(api.output(depth));
    return {id:r.id,withoutDps:without.total,damageDelta:o.total-without.total,
      fraction:o.total ? (o.total-without.total)/o.total : 0,
      lostBonds:o.bonds.filter(b=>!without.bonds.some(x=>x.id===b.id)).map(b=>b.id),
      lumenPerSecDelta:abilityResources.lumen-without.rows.reduce((v,x)=>v+x.rewards.lumen/without.cycle,0),
      shardsPerSecDelta:abilityResources.shards-without.rows.reduce((v,x)=>v+x.rewards.shards/without.cycle,0),
      motesPerLuminousDelta:o.motePerLuminous-without.motePerLuminous};
  });
  api.rawSet(copy(s));
  rows.forEach(r=>{
    const upgraded=copy(s);upgraded.spirits[r.id]++;
    api.rawSet(upgraded);const next=api.output(depth);
    r.nextUpgrade={lumenCost:r.nextCost,damageDelta:next.total-o.total,dpsPerLumen:(next.total-o.total)/r.nextCost};
  });
  api.rawSet(copy(s));
  return {...o,rows,bondLedger,ledger:{rawDamageDps:raw,bondExtraDps:bonds,supportExtraDps:support,totalDps:o.total,guardianBaseDps:guardianBase},abilityResources,marginal,
    warning:'Marginal removals overlap; do not sum. Resource rates exclude kills and are not converted to DPS. Sustained output excludes startup/overkill.'};
}
function spendForLevel(s,id,target) {
  const x=copy(s); x.spirits[id]=0; api.rawSet(x);
  let spend=0;
  for(let n=0;n<target;n++){spend+=api.costs(id);api.get().spirits[id]++;}
  return spend;
}
function budgetState(profile,ids,budget, allocation='equal') {
  const s=profile==='saved-permanent' ? copy(original) : copy(api.fresh());
  s.activeParty=ids.slice(); s.maxDepthEver=220; s.formationRebuild=null;
  Object.keys(s.spirits).forEach(id=>s.spirits[id]=0);
  api.rawSet(s);
  const spentById=Object.fromEntries(ids.map(id=>[id,0]));
  // Shared spending ceiling. Exact existing rounded costs; residual stays cash.
  for(const id of ids){
    const cap=budget/ids.length;
    for(let n=0;n<10000;n++){
      const cost=api.costs(id);
      if(spentById[id]+cost>cap) break;
      spentById[id]+=cost; api.get().spirits[id]++;
    }
  }
  const result=copy(api.get());
  const spent=Object.values(spentById).reduce((a,b)=>a+b,0);
  return {state:result,budget,spent,residual:budget-spent,spentById,allocation,
    permanentPolicy:profile==='saved-permanent' ? 'Identical saved permanent collection; historic purchase ledger unknown.' : 'No Rarity, Modules, Ultimates, nodes, Forge or Lab purchases.'};
}
function combinations(xs,k){if(k===0)return [[]];return xs.flatMap((x,i)=>combinations(xs.slice(i+1),k-1).map(t=>[x,...t]));}
const equalBudget=[];
for(const profile of ['fresh-permanent','saved-permanent']){
  for(const budget of [1e8,1e10,1e12]){
    for(const mode of ['push','farm','boss']){
      const depth=mode==='boss' ? 100 : 99;
      const teams=combinations(data.map(s=>s.id),5).map(ids=>{
        const b=budgetState(profile,ids,budget);
        const output=evaluate(b.state,depth);
        return {ids,...b,state:undefined,output};
      });
      const order=teams.slice().sort((a,b)=>b.output.total-a.output.total);
      const withTitan=order.find(t=>t.ids.includes('titan'));
      const withoutTitan=order.find(t=>!t.ids.includes('titan'));
      const presets=Object.entries(original.formationPresets).map(([preset,ids])=>{
        const b=budgetState(profile,ids,budget);
        return {preset,ids,...b,state:undefined,output:evaluate(b.state,depth)};
      });
      equalBudget.push({profile,budget,mode,depth,withTitan,withoutTitan,ratio:withoutTitan.output.total/withTitan.output.total,presets,
        allTeams:teams.map(t=>({ids:t.ids,spent:t.spent,residual:t.residual,levels:Object.fromEntries(t.output.rows.map(w=>[w.id,w.level])),
          ledger:t.output.ledger,resources:t.output.abilityResources,motesPerLuminous:t.output.motePerLuminous})),
        resourceFrontier:teams.filter(t=>!teams.some(u=>u.output.total>=t.output.total && u.output.abilityResources.lumen>=t.output.abilityResources.lumen && u.output.abilityResources.shards>=t.output.abilityResources.shards && u.output.motePerLuminous>=t.output.motePerLuminous && (u.output.total>t.output.total || u.output.abilityResources.lumen>t.output.abilityResources.lumen || u.output.abilityResources.shards>t.output.abilityResources.shards || u.output.motePerLuminous>t.output.motePerLuminous))).map(t=>({ids:t.ids,dps:t.output.total,resources:t.output.abilityResources,motesPerLuminous:t.output.motePerLuminous}))});
    }
  }
}
const perWisp=[];
for(const budget of [1e8,1e10,1e12])for(const sp of data){
  const b=budgetState('fresh-permanent',[sp.id],budget);
  const o=evaluate(b.state,99);
  perWisp.push({budget,id:sp.id,level:b.state.spirits[sp.id],spent:b.spent,residual:b.residual,output:o});
}
const trajectories=[];
for(const scenario of ['saved-settings','auto-ascend-disabled']){
  for(const seconds of [60,600,3600]){
    const worker=engine(); const seed=copy(original);
    if(scenario==='auto-ascend-disabled')seed.autoAscendEnabled=false;
    worker.api.set(seed);
    const normalized=copy(worker.api.get());
    const summary=worker.run(seconds,'live',original.lastSeen);
    const s=copy(worker.api.get());
    trajectories.push({scenario,seconds,normalizationChanged:JSON.stringify(normalized)!==JSON.stringify(seed),summary,
      snapshot:{depth:s.depth,maxDepthEver:s.maxDepthEver,activeParty:s.activeParty,spirits:s.spirits,formationRebuild:s.formationRebuild,lumen:s.lumen,research:s.research},output:evaluate(s,s.depth)});
  }
}
// Finite farm runs: compare rewards, startup and whole/split live/offline.
const finite=[];
for(const ids of [original.formationPresets.push,original.formationPresets.farm,original.formationPresets.boss,['ember','void','tide','aurora','stone']]){
  const b=budgetState('saved-permanent',ids,1e10),s=b.state;
  s.depth=99;s.enemyDepth=99;s.riftMode='farm';s.farmDepth=99;s.farmReturnDepth=101;
  api.rawSet(s);s.enemyHp=s.enemyMaxHp=api.output(99).hp;s.enemyIsLuminous=false;
  s.autoAscendEnabled=false;s.researchQueue={};s.studyQueue={};s.activeStudies=[];
  s.empowerQueue=Object.fromEntries(data.map(x=>[x.id,false]));
  s.buffUntil=0;s.buffMult=1;s.supportBuffs=null;s.heroResource=Object.fromEntries(data.map(x=>[x.id,0]));
  for(const clockCase of ['saved-fractional','aligned-control']) for(const kind of ['live','offline']){
    const start=clockCase==='saved-fractional' ? original.lastSeen : 2000000000000;
    const worker=engine();worker.api.rawSet(copy(s));
    let summary=null,wholeError=null,splitError=null;
    try { summary=worker.run(60,kind,start); } catch(error) { wholeError=error.message; }
    const final=copy(worker.api.get());
    const split=engine();split.api.rawSet(copy(s));
    const chunks=[];for(let i=0;i<6;i++){
      try { chunks.push(split.run(10,kind,start+i*10000)); }
      catch(error) { splitError={chunk:i,message:error.message}; break; }
    }
    const splitFinal=copy(split.api.get());
    const comparisons={};
    for(const key of ['lumen','shards','motes','sigils','totalKills','enemyHp']){
      const delta=final[key]-splitFinal[key];
      comparisons[key]={whole:final[key],split:splitFinal[key],delta,withinTolerance:Math.abs(delta)<=Math.max(1,Math.abs(final[key]))*1e-10};
    }
    finite.push({ids,kind,clockCase,start,seconds:60,initial:evaluate(s,99),summary,chunks,comparisons,wholeError,splitError,
      parityPass:!wholeError && !splitError && Object.values(comparisons).every(x=>x.withinTolerance),endBuff:final.supportBuffs,
      note:'Offline reward scale follows the current saved rate; online/offline rewards are not assumed identical.'});
  }
}
const input=copy(original);api.set(input);const actual=evaluate(copy(api.get()),original.depth);
const bossRuns=[];
for(const depth of [160,170,180])for(const ids of [...Object.values(original.formationPresets),['ember','void','tide','aurora','stone']]){
  const b=budgetState('saved-permanent',ids,1e10),s=b.state;
  s.depth=s.enemyDepth=depth;s.riftMode='push';s.farmDepth=0;s.farmReturnDepth=0;
  api.rawSet(s);s.enemyHp=s.enemyMaxHp=api.output(depth).hp;s.enemyIsLuminous=false;
  s.autoAscendEnabled=false;s.researchQueue={};s.studyQueue={};s.activeStudies=[];
  s.empowerQueue=Object.fromEntries(data.map(x=>[x.id,false]));
  s.buffUntil=0;s.buffMult=1;s.supportBuffs=null;s.heroResource=Object.fromEntries(data.map(x=>[x.id,0]));
  const worker=engine();worker.api.rawSet(copy(s));let summary=null,error=null;
  try{summary=worker.run(60,'live',original.lastSeen,true);}catch(err){error=err.message;}
  const death=summary?.observedDeaths[0];
  bossRuns.push({depth,ids,initial:evaluate(s,depth),windowSec:60,firstKillSec:death?.elapsedSec??null,summary,error});
}
const pending=copy(original);pending.activeParty=['ember','aurora','titan'];
const pendingOutput=evaluate(pending,original.depth);
near(pendingOutput.total,actual.total,'pending unpowered members contribute no damage, support or Bonds');
const doubleCountFixture=equalBudget.find(x=>x.profile==='saved-permanent'&&x.budget===1e10&&x.mode==='push').presets.find(x=>x.preset==='farm').output;
const overlappingSum=doubleCountFixture.marginal.reduce((v,x)=>v+x.damageDelta,0);
assert(overlappingSum>doubleCountFixture.total,'negative control: summing removal deltas overcounts');
assert(doubleCountFixture.ledger.totalDps+doubleCountFixture.ledger.supportExtraDps>doubleCountFixture.total,'negative control: adding support again overcounts');
const results={provenance,actual,perWisp,equalBudget,trajectories,finite,bossRuns,
  checks:{ledgerReconciled:true,readPurity:true,backupDecodedMatch:true,pendingNoContribution:true,negativeDoubleCountCaught:true,
    overlappingRemovalRatio:overlappingSum/doubleCountFixture.total,finiteParity:finite.every(x=>x.parityPass)}};
const out=process.env.WISP_OUTPUT || path.join(__dirname,'results.json');
fs.writeFileSync(out,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({output:out,provenance,checks:results.checks,
  trajectories:trajectories.map(t=>({scenario:t.scenario,seconds:t.seconds,snapshot:t.snapshot,titanShare:t.output.rows.find(r=>r.id==='titan')?.rawDamageDps/t.output.total,ledger:t.output.ledger})),
  budgets:equalBudget.filter(x=>x.profile==='saved-permanent'&&x.mode!=='farm').map(x=>({budget:x.budget,mode:x.mode,withTitan:x.withTitan.ids,withoutTitan:x.withoutTitan.ids,ratio:x.ratio})),
  perWisp:perWisp.filter(x=>x.budget===1e10).map(x=>({id:x.id,level:x.level,spent:x.spent,dps:x.output.total})),finite:finite.map(x=>({ids:x.ids,kind:x.kind,summary:x.summary,parityPass:x.parityPass}))},null,2));
if(!results.checks.finiteParity) process.exitCode=1;
