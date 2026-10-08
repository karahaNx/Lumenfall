'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');
const copy=x=>JSON.parse(JSON.stringify(x));
// Execute the actual product closure. Only DOM presentation and the clock are
// replaced; authoritative purchases, chronology and persistence stay intact.
function app(html=source){
 let now=2000000000000,seq=0,primaryFailure=false;const queue=[],storage=new Map();
 const document={readyState:'loading',hidden:false,addEventListener(){},getElementById:()=>null};
 const window={addEventListener(){},matchMedia:()=>({matches:true})};
 const localStorage={getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k),setItem(k,v){if(primaryFailure&&k==='lumenfall_save_v2')throw Error('primary failure');storage.set(k,v);}};
 const bridge=`
 renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=function(){};
 showToast=spawnFloatNum=emitCombatVfx=function(){};
 window.qa={fresh:freshState,get:()=>state,set:s=>state=acceptPersistedState(s),normalize:acceptPersistedState,
 restore:restoreEnemyOrSpawn,spirits:SPIRITS,bondCatalog:FORMATION_BONDS,bonds:activeFormationBonds,tap:guardianTapDamageAt,regen:bossRegenRate,hp:enemyHpFor,
 passive:passiveWispDpsAt,dps:sustainedCombatDps,reward:abilityRewardPerCast,power:wispPower,cycle:abilityCycleSeconds,
 support:averageSupportBuffMult,rarityCost:rarityCost,moduleCost:moduleCost,ultimateCost:ultimateSigilCost,
 toggle:toggleActive,preset:applyFormationPreset,ascend:applyAscendMutation,
 recruit:id=>buySpirit(SPIRITS.find(s=>s.id===id)),autoEmpower:autoEmpowerTick,
 cast:(id,kind)=>simulationTriggerAbility(SPIRITS.find(s=>s.id===id),state.spirits[id],Date.now(),simulationPolicy(kind,{visual:false}),simulationSummary(0)),
 advance:(seconds,kind,start)=>advanceAuthoritativeTime(seconds,{kind:kind,visual:false,clockStartMs:start,offlineWindowStartMs:2000000000000}),
 save:saveState,load:loadState,backup:currentSaveBackup,decode:decodeSaveBackup,manual:()=>doTap({classList:{add(){},remove(){}}})};`;
 const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
 new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(window,document,localStorage,class extends Date{static now(){return now;}},fn=>{queue.push({id:++seq,fn});return seq;},id=>{const i=queue.findIndex(x=>x.id===id);if(i>=0)queue.splice(i,1);},{now:()=>0});
 const b=window.qa;b.set(b.fresh());return {b,storage,clock:t=>now=t,fail:v=>primaryFailure=v};
}
function seed(b,ids,depth=101){const s=b.fresh();s.depth=s.enemyDepth=depth;s.maxDepthEver=300;s.activeParty=ids.slice();s.formationPresets.push=ids.slice();s.enemyHp=s.enemyMaxHp=1e12;s.lastSeen=2000000000000;for(const sp of b.spirits)s.spirits[sp.id]=40;return s;}
function near(a,b,label){assert(Math.abs(a-b)<=Math.max(1e-6,Math.max(Math.abs(a),Math.abs(b))*1e-12),label+': '+a+' vs '+b);}
function parity(a,b,label='state'){if(typeof a==='number'&&typeof b==='number'){near(a,b,label);return;}if(a&&typeof a==='object'){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),label+' keys');for(const k of Object.keys(a))parity(a[k],b[k],label+'.'+k);return;}assert.equal(a,b,label);}
function checks(html=source){const a=app(html),b=a.b,records=[];function test(name,fn){fn();records.push(name);}
 test('eight named pairs, paid Field activation and no pending/Bench bonus',()=>{
  assert.equal(b.bondCatalog.length,8);assert.equal(new Set(b.bondCatalog.map(x=>x.id)).size,8);
  for(const bond of b.bondCatalog){let s=seed(b,bond.ids);b.set(s);assert(b.bonds().some(x=>x.id===bond.id));s.activeParty=[bond.ids[0]];b.set(s);assert(!b.bonds().some(x=>x.id===bond.id));s.activeParty=bond.ids.slice();s.spirits[bond.ids[1]]=0;b.set(s);assert(!b.bonds().some(x=>x.id===bond.id));}
 });
 test('Kindling shared manual/Auto-Tap exact 25%, no passive or ability increase',()=>{
  const s=seed(b,['ember','tide']);s.enemyHp=s.enemyMaxHp=1e7;s.achieved.autotap=true;b.set(s);
  const ember=b.spirits[0],raw=(5+b.power(ember,40)*.02+b.power(b.spirits[1],40)*.02);
  near(b.tap(101,1),raw*1.25,'tap');near(b.tap(101,1.5),raw*1.5*1.25,'support stacks');
  const before=b.get().enemyHp;b.manual();near(before-b.get().enemyHp,raw*1.25,'manual hit');
  b.set(s);const start=b.get().enemyHp;b.advance(1,'live',2000000000000);
  near(start-b.get().enemyHp,b.passive(101)+raw*1.25,'one-second passive plus Auto-Tap, no ability due');
 });
 test('Vanguard exact regen operand on all Boss traits, no nonboss regen',()=>{
  b.set(seed(b,['ember','stone']));near(b.regen(100),.009*.8,'balanced');near(b.regen(110),.005*.8,'armored');near(b.regen(120),.006*.8,'arcane');assert.equal(b.regen(101),0);
  const s=seed(b,['ember','stone'],100);s.enemyHp=5e5;s.enemyMaxHp=1e6;b.set(s);const passive=b.passive(100);b.advance(.1,'offline',2000000000000);near(b.get().enemyHp,5e5-passive*.1+1e6*.009*.8*.1,'chronological regen');
 });
 test('Quarry/Harvest multiply own payout only and Dawnpriest stacks before one rounding',()=>{
  const ids=['tide','stone','gale','thorn','aurora'];const s=seed(b,ids);s.spirits.gale=1;s.spirits.thorn=1;s.wispModules.gale=3;s.wispModules.thorn=2;s.heroRarity.gale=1;s.heroRarity.thorn=1;s.research.conduction=2;b.set(s);
  const gale=b.spirits.find(x=>x.id==='gale'),thorn=b.spirits.find(x=>x.id==='thorn');
  const expectedG=Math.round(130*1.5*.05*1.15*1.25*1.2*1.08),expectedT=Math.round(680*1.5*.1*1.10*1.25*1.2*1.08);
  assert.deepEqual(b.reward(gale,1),{lumen:0,shards:expectedG});assert.deepEqual(b.reward(thorn,1),{lumen:expectedT,shards:0});
  for(const kind of ['live','offline']){b.set(s);const before=copy(b.get());b.cast('gale',kind);b.cast('thorn',kind);assert.equal(b.get().shards-before.shards,expectedG*(kind==='offline'?.7:1));assert.equal(b.get().lumen-before.lumen,expectedT*(kind==='offline'?.7:1));assert.equal(b.get().motes,before.motes);assert.equal(b.get().prisms,before.prisms);assert.equal(b.get().sigils,before.sigils);}
 });
 test('integrated autosave isolates presets, preserves empty intent and protects five pending slots',()=>{
  const beforeInvalid=copy(b.get());b.toggle('unknown');b.toggle('__proto__');assert.deepEqual(b.get(),beforeInvalid);
  let s=seed(b,['ember']);s.formationPresets={push:['ember'],farm:['gale'],boss:['stone']};b.set(s);b.preset('farm');b.toggle('thorn');assert.deepEqual(b.get().formationPresets,{push:['ember'],farm:['gale','thorn'],boss:['stone']});b.toggle('gale');const last=copy(b.get());b.toggle('thorn');assert.deepEqual(b.get(),last,'last chosen member remains');
  s=seed(b,['ember']);s.formationPresets.farm=[];b.set(s);b.preset('farm');assert.deepEqual(b.get().activeParty,['ember']);assert.deepEqual(b.normalize(b.get()).formationPresets.farm,[]);assert.deepEqual(b.get().formationRebuild,{members:[],preset:'farm'});assert.deepEqual(b.bonds(),[],'empty intent grants no Bond');
  s=seed(b,['ember']);s.formationPresets.boss=['tide','stone','gale','thorn','void'];for(const id of s.formationPresets.boss)s.spirits[id]=0;b.set(s);b.preset('boss');const before=copy(b.get());b.toggle('aurora');assert.deepEqual(b.get(),before);assert.deepEqual(b.bonds(),[]);
  s=b.get();s.lumen=60;b.set(s);b.recruit('tide');assert.equal(b.get().lumen,0);assert.equal(b.get().spirits.tide,1);assert.deepEqual(b.get().activeParty,['tide']);assert.deepEqual(b.bonds(),[]);
 });
 test('legacy value preservation, idempotence, primary/recovery/backup and repeated Ascend',()=>{
  let s=seed(b,['ember','tide','stone','gale','void']);s.lumen=12345;s.shards=456;s.motes=17;s.sigils=50;s.wispModules.ember=12;s.heroRarity.ember=5;s.wispUltimate.ember=true;s.owned.comettrials=true;b.set(s);
  for(const k of ['spirits','heroRarity','wispModules','wispUltimate','lumen','shards','motes','sigils','owned','formationPresets'])assert.deepEqual(b.get()[k],s[k],k);
  const canonical=copy(b.get());assert.deepEqual(b.normalize(canonical),canonical);b.save();const backup=b.backup();assert.deepEqual(b.decode(backup),canonical);
  a.fail(true);b.toggle('void');const changed=copy(b.get());assert.deepEqual(b.decode(b.backup()),changed);a.storage.set('lumenfall_save_v2','invalid');b.load();assert.deepEqual(b.get().formationPresets,changed.formationPresets);a.fail(false);
  b.ascend();const intended=b.get().formationPresets.push.slice();assert.deepEqual(b.get().formationRebuild.members,intended);b.get().depth=101;b.ascend();assert.deepEqual(b.get().formationRebuild.members,intended);assert.deepEqual(b.get().activeParty,['ember']);assert.deepEqual(b.bonds(),[]);
 });
 test('Farm canonical clock retains whole versus one-second reference at mature power',()=>{
  const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures.json')))['parity-long-high-power'].save;
  b.set(fixture);b.restore();b.advance(60,'offline',2000000000000);const direct=copy(b.get());b.set(fixture);b.restore();
  for(let i=0;i<60;i++)b.advance(1,'offline',2000000000000+i*1000);parity(b.get(),direct,'Farm clock');
 });
 test('all overlapping choices retain live/offline and split-window chronology',()=>{
  for(const ids of [['ember','tide','stone','gale','void'],['tide','stone','gale','thorn','aurora'],['ember','stone','void','aurora','titan']])for(const depth of [101,100]){
   const s=seed(b,ids,depth);s.achieved.autotap=true;s.nodes.echo=6;s.heroResource.gale=99;s.heroResource.thorn=99;
   b.set(s);b.advance(12,'live',2000000000000);const live=copy(b.get());b.set(s);b.advance(12,'offline',2000000000000);parity(b.get(),live,'live/offline');
   b.set(s);for(let i=0;i<120;i++)b.advance(.1,'offline',2000000000000+i*100);parity(b.get(),live,'split chronology');
  }
 });return records;
}
function main(){const records=checks(),negativeControls=[];
 for(const [name,from,to] of [
  ['Kindling',"(bondActive('kindling') ? 1.25 : 1)","1"],['Vanguard',"(bondActive('vanguard') ? 0.8 : 1)","1"],
  ['Quarry',"(bondActive('quarry')?1.20:1)","1"],['Harvest',"(bondActive('harvest')?1.20:1)","1"],
  ['Autosave','commitFormationMembers(members);','state.formationRebuild = null;'],
  ['Farm clock','farmGridCrossings===gridCrossingsBefore && farmGridRemainingSec===gridRemainingBefore','elapsedWholeSec===elapsedWholeBefore && elapsedFractionSec===elapsedFractionBefore']]){
  assert(source.includes(from),name+' mutation anchor');let detected=false;try{let mutated=source.replace(from,to);if(name==='Farm clock')mutated=mutated.replace('var gridCrossingsBefore = farmGridCrossings;\n    var gridRemainingBefore = farmGridRemainingSec;', 'var elapsedWholeBefore = elapsedWholeSec;\n    var elapsedFractionBefore = elapsedFractionSec;');checks(mutated);}catch(error){detected=true;negativeControls.push({name,error:error.message});}assert(detected,name+' real mutation must fail');
 }
 console.log(JSON.stringify({status:'pass',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),records,negativeControls}));
}
module.exports={app,seed,source,copy,parity};if(require.main===module)main();
