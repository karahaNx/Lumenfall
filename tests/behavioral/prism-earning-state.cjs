#!/usr/bin/env node
'use strict';
// Full production IIFE. Only DOM presentation is stubbed; gameplay, purchases,
// persistence, offline transactions and authoritative scheduling are real.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');
const clone=v=>JSON.parse(JSON.stringify(v)),P='lumenfall_save_v2',R='lumenfall_save_recovery_v1';
let checks=0;const records=[];
function eq(a,b,label){checks++;assert.deepEqual(a,b,label);}
function app(saved){
 let now=2000000000000,sequence=0,failPrimary=false,failRecovery=false,reloaded=0;
 const timers=[],storage=new Map(saved||[]),area={value:''};
 const localStorage={getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k),setItem(k,v){if(failPrimary&&k===P||failRecovery&&k===R)throw Error('injected write failure');storage.set(k,v);}};
 const window={addEventListener(){},matchMedia:()=>({matches:true})};
 const document={readyState:'loading',hidden:false,addEventListener(){},getElementById:id=>id==='save-backup-code'?area:null,body:{classList:{add(){}}}};
 const hooks=`
 renderAll=renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=renderResearch=renderLongStudies=showAscendFlash=function(){};
 showToast=spawnFloatNum=emitCombatVfx=function(){};
 window.qa={fresh:freshState,get:()=>state,set:s=>state=acceptPersistedState(s),load:()=>state=loadState(),accept:acceptPersistedState,
 preview:ascendPrismBreakdown,manual:()=>doAscend(false),auto:checkAutoAscend,advance:advanceAuthoritativeTime,
 save:saveState,export:currentSaveBackup,decode:decodeSaveBackup,restore:restoreSaveBackup,offline:applyOfflineProgress,
 buy:()=>buyNode(NODES.find(n=>n.id==='swift')),cost:()=>nodeCost(NODES.find(n=>n.id==='swift')),
 blocked:()=>persistenceBlocked,flags:()=>({busy:!!offlineCatchup,pending:offlinePending,reload:reloadInProgress})};
 `;
 const script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1],marker="if(document.readyState==='loading'){";
 eq(script.split(marker).length,2,'single observation hook');
 new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance','BigInt','location',script.replace(marker,hooks+marker))(
 window,document,localStorage,class extends Date{static now(){return now;}},fn=>{timers.push({id:++sequence,fn});return sequence;},id=>{const i=timers.findIndex(t=>t.id===id);if(i>=0)timers.splice(i,1);},{now:()=>0},undefined,{reload:()=>reloaded++});
 const b=window.qa;b.set(saved?b.load():b.fresh());
 return {b,storage,area,clock:v=>now=v,fail:(p,r)=>{failPrimary=p;failRecovery=r;},reloads:()=>reloaded,drain(){let n=0;while(timers.length){timers.shift().fn();assert(++n<100000,'bounded timer drain');}}};
}
const {reward:expected}=require('./prism-earning-reference.cjs');
function seed(x,c,b,t,l){let s=x.b.fresh();s.lastSeen=2000000000000;s.questDay='2033-05-18';s.loginStreak=1;s.maxDepthEver=Math.max(250,c+1,b+1);s.depth=c+1;s.ascendRewardedDepth=b;s.nodes.swift=t;s.longStudyLevels.prismstudy=l;s.prisms=1000;s.owned.autoascend=true;s.autoAscendEnabled=false;s.autoAscendTargetDepth=c+1;s.activeParty=['ember'];s.spirits.ember=1;s.enemyDepth=c+1;s.enemyHp=s.enemyMaxHp=1e20;for(const id of Object.keys(s.empowerQueue))s.empowerQueue[id]=false;return s;}
for(const c of [14,15,16,19,20,25,50,119,250])for(const benchmark of [0,15,c,500])for(const [tree,lab] of [[0,0],[1,0],[7,0],[10,10],[17,18]]){
 const want=expected(c,benchmark,tree,lab);const x=app(),s=seed(x,c,benchmark,tree,lab);x.b.set(s);
 const before=clone(x.b.get());eq(x.b.preview().gain,want,'preview oracle');eq(x.b.get(),before,'preview purity');
 x.b.manual();eq(x.b.get().prisms,1000+want,'actual manual wallet credit');eq(x.b.get().nodes.swift,tree,'paid Tree retained');eq(x.b.get().longStudyLevels.prismstudy,lab,'completed Lab retained');eq(x.b.get().ascendRewardedDepth,c<15?benchmark:Math.max(c,benchmark),'reward benchmark');
 x.b.save();eq(x.storage.get(P),x.storage.get(R),'two saved slots identical');const restart=app(x.storage);eq(restart.b.get().prisms,1000+want,'cold load preserves payout');eq(restart.b.get().nodes.swift,tree,'cold load preserves Tree');
 for(const kind of ['live','offline']){const y=app();s.autoAscendEnabled=true;y.b.set(s);const result=y.b.advance(.001,{kind,clockStartMs:2000000000000});eq(result.ascends,c>=15?1:0,kind+' real auto count');eq(y.b.get().prisms,1000+want,kind+' actual auto payout');if(c>=15)eq(result.ascendGains[0],want,kind+' summary credit');}
 records.push({c,benchmark,tree,lab,want});
}
// Real purchase, repeat cap boundaries and no accidental refund/migration.
{
 const x=app();x.b.set(seed(x,20,100,7,0));const cost=x.b.cost(),old=clone(x.b.get());x.b.buy();eq(x.b.get().nodes.swift,8,'real Swift handler purchases one');eq(x.b.get().prisms,old.prisms-cost,'exact original price debit');eq(x.b.preview().gain,expected(20,100,8,0),'new level affects canonical reward');
 const backup=x.b.export(),exported=x.b.decode(backup);eq(exported.nodes.swift,8,'backup contains paid level');
 const y=app();y.area.value=backup;y.b.restore();y.drain();eq(y.reloads(),1,'actual restore requests one reload');eq(y.storage.get(P),y.storage.get(R),'restore writes both slots');const z=app(y.storage);eq(z.b.get().prisms,old.prisms-cost,'restore preserves wallet without duplicate compensation');eq(z.b.get().nodes.swift,8,'restore preserves purchase');
 z.area.value=backup;z.b.restore();z.drain();const zz=app(z.storage);eq(zz.b.get().prisms,old.prisms-cost,'repeated original backup remains replacement, not a refund');
}
// Recovery after corruption and exact retry after a failed write.
{
 const x=app();x.b.set(seed(x,25,0,10,10));x.b.save();x.b.manual();const expectedWallet=x.b.get().prisms;
 x.storage.set(P,'broken');const recovered=app(x.storage);eq(recovered.b.get().prisms,expectedWallet,'recovery uses already-credited payout');eq(recovered.storage.get(P),recovered.storage.get(R),'primary repaired from recovery');
 const before=clone(recovered.b.get());recovered.fail(true,false);eq(recovered.b.save(),false,'failed write returns false');recovered.fail(false,false);eq(recovered.b.save(),true,'retry succeeds');eq(recovered.b.get().prisms,before.prisms,'save retry does not award again');
 recovered.fail(false,true);eq(recovered.b.save(),false,'recovery write failure reported');recovered.fail(false,false);recovered.b.save();eq(recovered.b.get().prisms,before.prisms,'recovery retry does not award again');
}
// Actual yielded offline transaction: private work, rollback, recovery failure,
// retry and repeated return. Compare the real credited Prism wallet, not previews.
for(const [c,benchmark,tree,lab] of [[20,100,7,0],[25,0,10,10],[50,20,9,5],[119,89,17,18]]){
 for(const failure of ['none','primary','recovery']){
  const x=app(),s=seed(x,c,benchmark,tree,lab);s.autoAscendEnabled=true;
  x.b.set(s);x.b.save();const before=clone(x.b.get()),want=expected(c,benchmark,tree,lab);
  x.clock(s.lastSeen+60000);x.fail(failure==='primary',failure==='recovery');
  let result,error;x.b.offline((r,e)=>{result=r;error=e;});x.drain();
  if(failure==='primary'){
   checks++;assert(error,'failed primary must report offline failure');
   eq(x.b.get(),before,'failed transaction preserves complete original state');
   x.fail(false,false);x.b.offline((r,e)=>{result=r;error=e;});x.drain();
  }
  checks++;assert.ifError(error);eq(x.b.get().prisms,1000+want,'offline commits exact payout once');
  eq(result.ascends,1,'offline transaction records actual Ascend');
  const accepted=clone(x.b.get());eq(x.b.offline(),null,'same return window is not replayed');
  eq(x.b.get(),accepted,'repeated return is a no-op');
  x.fail(false,false);x.b.save();const restarted=app(x.storage);
  eq(restarted.b.get().prisms,1000+want,'offline cold restart keeps exact payout');
 }
}
console.log(JSON.stringify({status:'pass',source_sha256:crypto.createHash('sha256').update(source).digest('hex'),checks,payoutCases:records.length,routes:['actual manual handler','live/offline authoritative auto','cold load','actual backup restore','primary corruption/recovery','failed write/retry','real Swift purchase','atomic offline failure/rollback/retry'],scope:'full game logic with DOM presentation stubbed; not browser layout or Android acceptance'}));
