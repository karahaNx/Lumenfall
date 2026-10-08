'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const sourceArg=process.argv.indexOf('--source');
const source=fs.readFileSync(sourceArg>=0 ? process.argv[sourceArg+1] : process.env.WISP_INDEX||path.join(root,'index.html'),'utf8');
const original=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
const copy=x=>JSON.parse(JSON.stringify(x)),clock=2000000000000;
const ctx=vm.createContext({document:{readyState:'loading',addEventListener(){}},window:{addEventListener(){}},console});
const script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const bridge=`globalThis.roles={set:s=>state=acceptPersistedState(s),get:()=>state,fresh:freshState,
 compare:wispRoleComparison,snapshot:wispRoleSnapshot,spirits:()=>SPIRITS,
 dps:sustainedCombatDps,passive:passiveWispDpsAt,buff:simulationBuffMult,
 tap:guardianTapDamageAt,ability:averageAbilityDps,
 simulate:(sec,kind,start)=>advanceAuthoritativeTime(sec,{kind:kind,visual:false,clockStartMs:start,offlineWindowStartMs:start}),
 power:(id,level)=>wispPower(SPIRITS.find(sp=>sp.id===id),level)};`;
vm.runInContext(script.replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){"),ctx);
const b=ctx.roles,spirits=copy(b.spirits()),ids=spirits.map(sp=>sp.id);
let checks=0;
function near(a,c,label){checks++;assert(Number.isFinite(a)&&Number.isFinite(c)&&Math.abs(a-c)<=Math.max(1e-6,Math.abs(a)*1e-12,Math.abs(c)*1e-12),label+': '+a+' / '+c);}
function ok(value,label){checks++;assert(value,label);}
function combos(xs,k){return k===0?[[]]:xs.flatMap((id,i)=>combos(xs.slice(i+1),k-1).map(t=>[id,...t]));}
function seed(party){
 const s=copy(original);s.activeParty=party;s.formationRebuild=null;s.autoAscendEnabled=false;
 s.activeStudies=[];s.studyQueue={};s.researchQueue={};s.empowerQueue=Object.fromEntries(ids.map(id=>[id,false]));
 ids.forEach((id,i)=>{s.spirits[id]=170-i*17;s.heroResource[id]=0;});
 s.buffUntil=0;s.buffMult=1;s.supportBuffs=null;return s;
}
for(const party of combos(ids,5)) for(const depth of [99,160,170,180]){
 const s=seed(party);s.depth=depth;b.set(s);const before=JSON.stringify(b.get());
 const r=copy(b.compare(depth,clock)),v=r.steady;
 near(v.totalDps,b.dps(depth),'authoritative sustained total');
 near(v.rawDps+v.bondDps+v.supportDps+v.legacyDps,v.totalDps,'non-overlapping ledger');
 near(v.rows.reduce((sum,row)=>sum+row.rawDps,0)+v.guardianBaseDps,v.rawDps,'Wisp plus fixed Guardian base');
 near(v.bonds.reduce((sum,bond)=>sum+bond.damageDps,0),v.bondDps,'sequential Bond ledger');
 near(v.rows.reduce((sum,row)=>sum+row.supportDps,0),v.supportDps,'source support ledger');
 ok(JSON.stringify(b.get())===before,'readout cannot mutate purchases, queues or saves');
 for(const row of v.rows){
  const without=copy(s);without.activeParty=party.filter(id=>id!==row.id);b.set(without);
  // Check at the authoritative total's scale, avoiding loss-of-significance
  // when subtracting two much larger totals to display a small marginal.
  if(row.active) near(row.removalDps+b.dps(depth),v.totalDps,'removal reconstructs actual total');
  else ok(row.removalDps===0,'inactive removal is exactly zero');
  b.set(s);
 }
}
let s=seed(['ember','tide','aurora','void','titan']);s.depth=99;
s.supportBuffs={version:1,sources:{tide:{mult:1.25,until:clock+4000},aurora:{mult:1.5,until:clock+8000}}};
for(const legacy of [1,1.3,1.8,3]) for(const offset of [0,4000,8000]){
 s.buffUntil=clock+6000;s.buffMult=legacy;b.set(s);const now=clock+offset,v=copy(b.snapshot(99,now));
 near(v.totalDps,b.passive(99)*b.buff(now)+b.ability(99)+b.tap(99,b.buff(now)),'current source/legacy scope');
 near(v.passiveDps,b.passive(99)*b.buff(now),'current passive rate');
}
// Earned source entitlement survives benching, while sustained preview does not.
s.activeParty=['ember'];b.set(s);let r=copy(b.compare(99,clock));
ok(r.current.rows.find(x=>x.id==='tide').supportDps>0,'earned benched buff remains visible');
ok(r.steady.rows.find(x=>x.id==='tide').supportDps===0,'bench creates no future support');
s=seed(['tide','aurora']);s.spirits.tide=s.spirits.aurora=0;s.formationRebuild={members:['tide','aurora'],preset:'farm'};b.set(s);
r=copy(b.compare(99,clock));ok(r.steady.bonds.length===0,'pending formation cannot enable Bonds');
ok(r.steady.rows.filter(x=>x.id==='tide'||x.id==='aurora').every(x=>x.rawDps===0&&x.supportDps===0&&x.lumenPerCast===0&&x.shardsPerCast===0),'pending contribution is zero');
// Fixed-clock normalization adds no feature state or repeat bonus; ownership retained.
s=seed(ids.slice(0,5));b.set(s);const canonical=copy(b.get());b.set(canonical);
assert.deepEqual(copy(b.get()),canonical,'save canonicalization is idempotent');
for(const key of ['spirits','heroRarity','wispModules','wispUltimate','owned']) assert.deepEqual(canonical[key],s[key],key+' retained');
// Independent counterfactual warning: these valid removal deltas overlap.
s=seed(original.formationPresets.farm);b.set(s);r=copy(b.compare(99,clock));
ok(r.steady.rows.reduce((sum,row)=>sum+row.removalDps,0)>r.steady.totalDps,'summing removals would double-count shared value');
// Regression: the old stall guard misses a real 1.1e-16 grid crossing at 6s.
const simulations=[];
for(const party of Object.values(original.formationPresets)) for(const start of [clock,original.lastSeen]) for(const kind of ['live','offline']){
 s=seed(party);s.spirits={...original.spirits};party.forEach(id=>s.spirits[id]=100);
 s.depth=s.enemyDepth=s.farmDepth=99;s.enemyMaxHp=s.enemyHp=Math.round(10*Math.pow(1.145,99));s.enemyIsLuminous=false;
 s.riftMode='farm';s.farmReturnDepth=101;b.set(s);
 const canonical=copy(b.get());const whole=b.simulate(60,kind,start),wholeState=copy(b.get());
 b.set(canonical);let kills=0;for(let i=0;i<6;i++)kills+=b.simulate(10,kind,start+i*10000).kills;
 const split=copy(b.get());near(whole.kills,kills,'aligned/fractional Farm kills');
 for(const key of ['lumen','shards','motes','sigils','totalKills','enemyHp'])near(wholeState[key],split[key],'whole/split '+key);
 simulations.push({party,start,kind,kills:whole.kills});
}
console.log(JSON.stringify({status:'pass',scenario:'wisp-roles-core',checks,teams:56,contexts:4,simulations,sourceSha256:require('node:crypto').createHash('sha256').update(source).digest('hex')}));
