/* Production gameplay/save regression. DOM rendering is covered separately by
 * comet-unlocks-ui; no gameplay formulas or state machine are mocked here. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const copy=value=>JSON.parse(JSON.stringify(value)),records=[];
function app(seed){
  let now=2000000000000,sequence=0,failPrimary=false;
  const queue=[],storage=new Map(),writes=[];
  const document={readyState:'loading',hidden:false,addEventListener(){},getElementById:()=>null};
  const window={addEventListener(){},matchMedia:()=>({matches:true})};
  const localStorage={getItem:key=>storage.get(key)||null,removeItem:key=>storage.delete(key),setItem(key,value){
    if(failPrimary&&key==='lumenfall_save_v2') throw Error('injected primary failure');
    storage.set(key,value);writes.push(key);
  }};
  const bridge=`
    renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=function(){};
    showToast=spawnFloatNum=emitCombatVfx=function(){};
    window.qa={fresh:freshState,get:()=>state,set:s=>state=acceptPersistedState(s),normalize:acceptPersistedState,
      buy:id=>buyShopItem({id:id,cost:0}),queue:queueCometTrial,cancel:cancelCometTrial,
      ascend:applyAscendMutation,tap:()=>doTap({classList:{add(){},remove(){}}}),
      toggle:toggleActive,preset:applyFormationPreset,rebuild:()=>reconcileFormationRebuild(state),
      autoEmpower:autoEmpowerTick,
      recruit:id=>buySpirit(SPIRITS.find(s=>s.id===id)),equip:selectCometCosmetic,
      advance:advanceAuthoritativeTime,offline:applyOfflineProgress,save:saveState,load:loadState,
      backup:currentSaveBackup,decode:decodeSaveBackup,refresh:refreshDailyQuest,gate:restStopComplete,
      cap:offlineCapHours,catalog:()=>SHOP,summary:simulationSummary};
  `;
  const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
  new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',script)(
    window,document,localStorage,class extends Date{static now(){return now;}},
    fn=>{queue.push({id:++sequence,fn});return sequence;},id=>{const i=queue.findIndex(item=>item.id===id);if(i>=0)queue.splice(i,1);},{now:()=>0});
  const b=window.qa;b.set(seed||b.fresh());
  return {b,storage,writes,clock:value=>now=value,fail:value=>failPrimary=value,
    drain(){let batches=0;while(queue.length){queue.shift().fn();assert(++batches<100000,'bounded work');}}};
}
function test(name,fn){fn();records.push(name);}
function parity(actual,expected,label='state'){
  if(typeof actual==='number' && typeof expected==='number'){
    assert(Math.abs(actual-expected)<=Math.max(1e-6,Math.max(Math.abs(actual),Math.abs(expected))*1e-12),label);return;
  }
  if(actual && typeof actual==='object'){
    assert.deepEqual(Object.keys(actual).sort(),Object.keys(expected).sort(),label+' keys');
    for(const key of Object.keys(actual))parity(actual[key],expected[key],label+'.'+key);return;
  }
  assert.equal(actual,expected,label);
}
function ready(){const a=app(),s=a.b.get();s.comets=1000;s.depth=16;s.maxDepthEver=101;s.enemyHp=1e100;s.enemyMaxHp=1e100;s.lastSeen=2000000000000;return a;}
function trial(id){const a=ready();assert(a.b.buy('comettrials'));assert(a.b.queue(id,15));a.b.ascend();assert.equal(a.b.get().cometTrial.phase,'active');return a;}
function clear(a,target=15){a.b.get().depth=target+1;a.b.ascend();}
test('authoritative catalog price, duplicate and unknown purchase rejection',()=>{
  const a=ready();assert.deepEqual(a.b.catalog().map(item=>[item.id,item.cost]),[['autoascend',100],['comettrials',140],['rifttrail',50],['starfallcrest',160]]);
  for(const [id,cost] of [['comettrials',140],['rifttrail',50],['starfallcrest',160]]){
    const before=a.b.get().comets;assert(a.b.buy(id));assert.equal(a.b.get().comets,before-cost);assert.equal(a.b.buy(id),false);assert.equal(a.b.get().comets,before-cost);
  }
  assert.equal(a.b.buy('offline24'),false);assert.equal(a.b.buy('unknown'),false);
  const poor=app();assert.equal(poor.b.buy('comettrials'),false);assert.equal(poor.b.get().comets,0);
});
test('ownership, bounded target, one pending trial and free cancellation',()=>{
  const a=ready();assert.equal(a.b.queue('quiet',15),false);a.b.buy('comettrials');
  for(const target of [14,101,15.5,NaN,Infinity]) assert.equal(a.b.queue('quiet',target),false);
  assert.equal(a.b.queue('unknown',15),false);const balance=a.b.get().comets;
  assert(a.b.queue('quiet',100));assert.equal(a.b.queue('single',15),false);
  a.b.tap();assert.equal(a.b.get().cometTrial.phase,'pending');
  assert(a.b.cancel());assert.equal(a.b.cancel(),false);assert.equal(a.b.get().comets,balance);
});
test('full run evaluation, repeated completion and no power/currency bonuses',()=>{
  const a=trial('quiet'),control=app(copy(a.b.get()));control.b.get().cometTrial=null;
  for(let i=0;i<2;i++){
    a.b.get().depth=16;control.b.get().depth=16;
    assert.equal(a.b.ascend(),control.b.ascend());
    assert.equal(a.b.get().prisms,control.b.get().prisms);assert.equal(a.b.get().comets,control.b.get().comets);
    assert.equal(a.b.get().cometTrial,null);assert.deepEqual(a.b.get().cometTrialMarks,{quiet:true});
    if(i===0){assert(a.b.queue('quiet',15));a.b.ascend();control.b.ascend();}
  }
});
test('early Ascend fails, manual attacks fail permanently for the run',()=>{
  const early=trial('quiet');early.b.ascend();assert.equal(early.b.get().cometTrialResult.outcome,'failed');
  const a=trial('quiet');a.b.get().enemyHp=1e100;a.b.get().enemyMaxHp=1e100;
  a.b.tap();assert.equal(a.b.get().cometTrial.reason,'manual');clear(a);
  assert.deepEqual(a.b.get().cometTrialMarks,{});assert.equal(a.b.get().cometTrialResult.outcome,'failed');
});
test('Single Star sees recruit, toggle, preset and reconstruction without changing them',()=>{
  for(const action of ['recruit','toggle','preset','rebuild']){
    const a=trial('single'),s=a.b.get();s.spirits.void=1;s.lumen=1e20;
    if(action==='recruit'){s.spirits.void=0;a.b.recruit('void');}
    if(action==='toggle')a.b.toggle('void');
    if(action==='preset'){s.formationPresets.boss=['ember','void'];assert(a.b.preset('boss'));}
    if(action==='rebuild'){s.formationRebuild={members:['ember','void'],preset:''};a.b.rebuild();}
    assert.equal(s.activeParty.length,2,action+' party intent remains');assert.equal(s.cometTrial.reason,'party',action);
    a.b.toggle('void');clear(a);assert.equal(a.b.get().cometTrialResult.outcome,'failed',action+' latch persists');
  }
  const a=trial('single');clear(a);assert.deepEqual(a.b.get().cometTrialMarks,{single:true});
});
test('Auto-Empower reconstruction latches Single Star failure at the purchase boundary',()=>{
  const a=trial('single'),s=a.b.get();s.achieved.labmaster=true;s.lumen=1e20;
  Object.keys(s.empowerQueue).forEach(id=>s.empowerQueue[id]=false);s.empowerQueue.void=true;
  s.spirits.void=0;s.formationRebuild={members:['ember','void'],preset:''};
  assert(a.b.autoEmpower());assert.deepEqual(s.activeParty,['ember','void']);
  assert.equal(s.cometTrial.reason,'party');assert.equal(s.spirits.void,1);
  clear(a);assert.equal(a.b.get().cometTrialResult.outcome,'failed');
});
test('legacy ownership archive, normalized saves and full-snapshot backup restore',()=>{
  const a=ready(),old=copy(a.b.get());old.owned={autoascend:true,rememberbulk:true,offline24:true,offline48:true};old.nodes.reserves=6;old.comets=789;
  const once=a.b.normalize(old),twice=a.b.normalize(copy(once));assert.deepEqual(twice,once);
  assert.deepEqual(once.legacyCometPurchases,{rememberbulk:true,offline24:true,offline48:true});assert.equal(once.nodes.reserves,6);assert.equal(once.comets,789);
  a.b.set(once);assert(a.b.gate());assert.equal(a.b.cap(),60);
  assert(a.b.save());const backup=a.b.backup();assert.deepEqual(a.b.decode(backup),once);
  a.b.get().comets+=999;a.b.set(a.b.decode(backup));assert.equal(a.b.get().comets,789);
  a.storage.set('lumenfall_save_v2','broken');a.b.set(a.b.load());assert.deepEqual(a.b.get(),once);
});
test('active Trial and equipment survive normalization, backup and recovery',()=>{
  const a=trial('quiet');a.b.buy('rifttrail');a.b.buy('starfallcrest');assert(a.b.equip('trail',true));assert(a.b.equip('crest',true));
  const s=copy(a.b.get());a.b.set(s);assert.deepEqual(a.b.get(),s);assert(a.b.save());assert.deepEqual(a.b.decode(a.b.backup()),s);
  a.storage.set('lumenfall_save_v2','broken');a.b.set(a.b.load());assert.deepEqual(a.b.get(),s);
  const malformed=copy(s);malformed.cometTrial.startedAscend++;assert.equal(a.b.normalize(malformed).cometTrial,null);
  malformed.owned={};assert.deepEqual(a.b.normalize(malformed).cometCosmetics,{trail:false,crest:false});
  assert.equal(app().b.equip('trail',true),false);
});
test('Quest Refresh functional gate and old complete ownership are preserved',()=>{
  const a=ready();a.b.buy('autoascend');assert.equal(a.b.gate(),false);a.b.buy('comettrials');assert(a.b.gate());
  const s=a.b.get();s.questDay='2026-10-08';s.questIds=['q_tap_small','q_kill_small','q_empower'];s.questClaimed={};
  const snapshot=copy(s);assert(a.b.refresh('q_tap_small'));assert.equal(a.b.get().comets,snapshot.comets-25);
  const replacement=a.b.get().questIds[0];a.b.set(snapshot);assert(a.b.refresh('q_tap_small'));assert.equal(a.b.get().questIds[0],replacement);
});
test('Auto-Tap/live/offline and whole/split preserve Trial chronology',()=>{
  const seed=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
  seed.owned.comettrials=true;seed.cometTrial={id:'quiet',target:15,phase:'pending'};
  const whole=app(seed),split=app(seed),live=app(seed),plain=app(seed);plain.b.get().cometTrial=null;
  const options={kind:'offline',visual:false,clockStartMs:seed.lastSeen,offlineWindowStartMs:seed.lastSeen};
  const summary=whole.b.advance(60,options);plain.b.advance(60,options);
  for(let i=0;i<4;i++)split.b.advance(15,{...options,clockStartMs:seed.lastSeen+i*15000});
  parity(split.b.get(),whole.b.get());live.b.advance(60,{...options,kind:'live'});
  assert.deepEqual(live.b.get().cometTrialMarks,whole.b.get().cometTrialMarks);assert.deepEqual(whole.b.get().cometTrialMarks,{quiet:true});
  for(const key of ['lumen','shards','prisms','motes','comets','sigils','ascendCount','totalKills'])assert.equal(whole.b.get()[key],plain.b.get()[key],key+' unchanged');
  assert(summary.autoTaps>0&&summary.ascends>1,'real automation exercised');
});
test('offline atomic failure/retry cannot award partial completion marks',()=>{
  const seed=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
  seed.lastSeen=2000000000000;seed.owned.comettrials=true;seed.cometTrial={id:'quiet',target:15,phase:'pending'};
  const a=app(seed);a.b.save();const before=copy(a.b.get());a.clock(seed.lastSeen+60000);a.fail(true);let error;
  a.b.offline((result,e)=>error=e);a.drain();assert(error);assert.deepEqual(a.b.get(),before);
  a.fail(false);a.b.offline((result,e)=>error=e);a.drain();assert.ifError(error);assert.deepEqual(a.b.get().cometTrialMarks,{quiet:true});
  const after=copy(a.b.get());assert.equal(a.b.offline(),null);assert.deepEqual(a.b.get(),after);
});
console.log(JSON.stringify({status:'pass',cases:records.length,records},null,2));
