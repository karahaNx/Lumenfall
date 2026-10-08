/* Rift Forge v1: real production entry points, controlled state/time; never shipped. */
window.forgeSeed = function(b,ctx){
  var s=b.freshStateSnapshot();s.maxDepthEver=101;s.questDay=ctx.currentDay();s.loginStreak=1;
  s.depth=101;s.enemyDepth=101;s.enemyMaxHp=b.enemyHpFor(101);s.enemyHp=s.enemyMaxHp;
  return s;
};
window.runForgeQa = function(b,ctx,assert,parity,summaryParity,near){
  var f=b.forge,copy=function(s){return JSON.parse(JSON.stringify(s));},checks=0;
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(){return window.forgeSeed(b,ctx);}
  function saved(raw){var s=Object.assign(seed(),raw);if(raw.schemaVersion===undefined)delete s.schemaVersion;if(raw.researchQueue===undefined)delete s.researchQueue;return s;}
  var ids=['arcanecal','conduction','luminoustracking'],legacy=['focus','sense','formation','resolve','charge'];
  var nodes=f.nodes(),clock=2000000000000;
  function node(id){return nodes.find(function(n){return n.id===id;});}
  function ledger(id,k,n){var r=node(id),l=0,h=0;for(var i=k;i<k+n;i++){l+=r.lumenBase*Math.pow(r.lumenGrowth,i);h+=r.shardBase*Math.pow(r.shardGrowth,i);}return {lumen:Math.ceil(l),shard:Math.ceil(h)};}
  function noEnemyChange(a,c,label){['enemyDepth','enemyHp','enemyMaxHp','enemyIsLuminous','luminousAccum'].forEach(function(k){same(a[k],c[k],label+' '+k);});}
  if(ctx.scenario==='forge-contracts'){
    same(nodes.map(function(n){return n.id;}),legacy.concat(ids),'exact approved catalogue');
    [b.freshStateSnapshot(),{schemaVersion:1,research:{focus:123},researchQueue:{focus:true,charge:false}},{labQueueOn:true,research:{sense:42}}].forEach(function(raw,i){
      var s=f.canonical(saved(raw));ids.forEach(function(id){ok(s.research[id]===0 && s.researchQueue[id]===false,'missing IDs 0/OFF '+i+' '+id);});
      if(i===1)ok(s.research.focus===123 && s.researchQueue.focus && !s.researchQueue.charge,'v1 legacy values retained');
      if(i===2)legacy.forEach(function(id){ok(s.researchQueue[id]===true,'legacy global ON original '+id);});
    });
    var explicit={labQueueOn:true,research:{arcanecal:13,focus:999},researchQueue:{arcanecal:true,focus:false,conduction:false}};
    var out=f.canonical(saved(explicit));ok(out.research.arcanecal===13 && out.research.focus===999,'stored levels never truncated');
    ok(out.researchQueue.arcanecal && !out.researchQueue.focus && !out.researchQueue.conduction,'explicit individual legacy choices retained');
    b.setState(out);near(f.preview('arcanecal').current.factor,1.3,'over-cap effect limited');ok(!f.plan('arcanecal',1).affordable,'over-cap buy blocked');
    var purchases=0;
    ids.forEach(function(id){var r=node(id);
      [r.unlockDepth-1,r.unlockDepth,r.unlockDepth+1].forEach(function(depth){var s=seed();s.maxDepthEver=depth;s.depth=1;s.enemyDepth=1;s.enemyMaxHp=b.enemyHpFor(1);s.enemyHp=s.enemyMaxHp;s.lumen=1e10;s.shards=1e8;b.setState(s);var before=b.getState();f.buy(id,1);ok(b.getState().research[id]===(depth>=r.unlockDepth?1:0),'historical unlock '+id+' '+depth);if(depth<r.unlockDepth)same(b.getState(),before,'locked authoritative no mutation');});
      [0,8,9,10].forEach(function(k){[1,5,10,25,50,100,'max'].forEach(function(n){['funded','one','no-lumen','no-shards'].forEach(function(budget){
        var s=seed();s.research[id]=k;var first=f.cost(id,k,1);s.lumen=budget==='funded'?1e14:budget==='no-lumen'?first.lumen-1:first.lumen;s.shards=budget==='funded'?1e14:budget==='no-shards'?first.shard-1:first.shard;
        b.setState(s);var before=b.getState(),plan=f.plan(id,n),expect=budget==='funded'?Math.min(n==='max'?10:n,10-k):budget==='one'?Math.min(1,10-k):0;
        ok(plan.buyCount===expect,'actual count '+id+' '+k+' '+n+' '+budget);
        var cost=expect?f.cost(id,k,expect):{lumen:0,shard:0};same(plan.cost,cost,'cost for actual count only');
        f.buy(id,n);var after=b.getState();ok(after.research[id]===k+expect,'actual purchased delta');ok(after.lumen===before.lumen-cost.lumen && after.shards===before.shards-cost.shard,'exact two-currency ledger');
        ok((after.dailyStats.research||0)===(before.dailyStats.research||0)+expect,'actual level daily counter');noEnemyChange(after,before,'buy cannot reroll');purchases++;
      });});});
      var s=seed();s.lumen=1e12;s.shards=1e12;s.research[id]=8;b.setState(s);var bulk=f.cost(id,8,2),manual=ledger(id,8,2);same(bulk,manual,'ceil of geometric total');
      var distinguishes=false;for(var k=0;k<9;k++){var two=f.cost(id,k,2),a=f.cost(id,k,1),c=f.cost(id,k+1,1);if(two.shard!==a.shard+c.shard || two.lumen!==a.lumen+c.lumen) distinguishes=true;}ok(distinguishes,'rounding fixtures distinguish per-level sum '+id);
    });
    legacy.filter(function(id){return id!=='charge';}).forEach(function(id){var s=seed();var one=f.cost(id,0,1);s.lumen=one.lumen;s.shards=one.shard;b.setState(s);var before=b.getState();f.buy(id,5);same(b.getState(),before,'legacy fixed bulk all-or-nothing '+id);
      s.lumen=1e30;s.shards=1e30;s.research[id]=11;b.setState(s);ok(!f.plan(id,1).maxed,'old uncapped');f.buy(id,1);ok(b.getState().research[id]===(id==='charge'?12:11),'uncapped charge still grows; closed raw ownership stays11');if(id!=='charge')ok(f.plan(id,1).reason==='retired','closed purchase is distinct from an effect cap');});
    [19,20,59,60].forEach(function(n){var s=seed();s.research.focus=n;ids.forEach(function(id){s.research[id]=100;});b.setState(s);b.upgradeClarity.render();var d=f.deeds();ok(d.total===683,'one-time Comet pool');['labmaster','labqueue'].forEach(function(id){var item=d.items.find(function(a){return a.id===id;}),target=id==='labmaster'?20:60;ok(item.eligible===(n>=target) && item.progress.current===n,'legacy-only threshold '+n+' '+id);var progress=document.querySelector('[data-deed-progress="'+id+'"]'),scope=progress.closest('.ach-card').querySelector('.deed-scope');ok(scope.textContent==='Counts Battle Focus, Shard Sense, Formation Training, Guardian’s Resolve and Swift Recovery only. Other Forge upgrades do not count.','Deed explains all five legacy upgrades separately');ok(item.text.endsWith('original Forge levels')&&!item.text.includes('Swift Recovery'),'Deed progress stays short with explicit legacy unit');});});
    var s=seed();s.achieved.labmaster=true;s.achieved.labqueue=true;s.research.focus=0;b.setState(s);var before=b.getState();f.achievements();var once=b.getState();f.achievements();ok(b.getState().comets===once.comets,'no double rewards');ok(once.achieved.labmaster && once.achieved.labqueue,'earned Deeds not revoked');
    // Pure previews and real UI purchase: displayed plan equals the actual debit.
    ids.concat(['charge']).forEach(function(id){var s=seed();s.lumen=1e10;s.shards=1e10;s.research[id]=ids.includes(id)?9:4;b.setState(s);b.renderLayout();b.resetFeedback();document.querySelector('[data-tab="forge"]').click();document.querySelector('[data-mult="5"]').click();
      var before=b.getState(),m=f.preview(id,5),card=document.querySelector('[data-forge-card="'+id+'"]');
      ok(card.textContent.includes('Current:') && card.textContent.includes('Next:') && card.textContent.includes('Purchase impact:'),'all four active previews; closed purchases covered by upgrade-identity-contracts');
      b.renderLayout();same(b.getState(),before,'render pure');same(f.preview(id,5),m,'stable preview');same(b.getState(),before,'preview pure');
      document.querySelector('[data-research="'+id+'"]').click();var after=b.getState();ok(after.research[id]===before.research[id]+m.plan.buyCount && after.lumen===before.lumen-m.plan.cost.lumen && after.shards===before.shards-m.plan.cost.shard,'UI buys exact preview');same(f.preview(id,5).current,m.purchase,'post-buy Current equals preview impact');
    });
    var s=seed();s.research.arcanecal=4;s.lumen=1e9;s.shards=1e9;b.setState(s);near(f.preview('arcanecal',1).current.factor,1.12,'Arcane current4');near(f.preview('arcanecal',1).next.factor,1.15,'Arcane next5');
    b.renderLayout();document.querySelector('[data-tab="forge"]').click();document.querySelector('[data-mult="1"]').click();
    ok(document.querySelector('[data-forge-card="arcanecal"]').textContent.includes('+2.68% relative source improvement'),'Arcane source factor versus relative gain');
    ['arcanecal','conduction','luminoustracking'].forEach(function(id){
      var s=seed();s.research[id]=8;var cost=f.cost(id,8,1);s.lumen=cost.lumen;s.shards=cost.shard;b.setState(s);b.renderLayout();document.querySelector('[data-mult="5"]').click();
      ok(document.querySelector('[data-research="'+id+'"]').textContent.includes('Upgrade ×1'),'partial affordability button actual count');
      ok(document.querySelector('[data-forge-card="'+id+'"]').textContent.includes('Purchase impact: 1 level(s)'),'partial affordability impact actual count');
      s.lumen=0;s.shards=0;b.setState(s);b.renderLayout();ok(document.querySelector('[data-research="'+id+'"]').disabled && f.preview(id,5).plan.buyCount===0,'unaffordable UI no promise');
      s.research[id]=10;s.researchQueue[id]=true;b.setState(s);b.renderLayout();ok(document.querySelector('[data-forge-card="'+id+'"]').textContent.includes('Next: Maxed') && f.preview(id,5).plan.buyCount===0 && b.getState().researchQueue[id],'Maxed preview retains queue');
    });
    var s=seed();s.spirits.gale=1;s.lumen=1e8;s.shards=1e6;b.setState(s);b.renderLayout();document.querySelector('[data-mult="1"]').click();
    ok(document.querySelector('[data-forge-card="conduction"]').textContent.includes('actual extra per cast: Gale +0 Shards'),'rounded preview does not promise fractional resource');
    var charge=f.preview('charge',1);near(charge.current.cycle,b.simulationDiagnosticsFor(b.getState()).abilityCycleSec,'Swift Current authoritative cycle');f.buy('charge',1);near(charge.next.cycle,b.simulationDiagnosticsFor(b.getState()).abilityCycleSec,'Swift Next becomes actual cycle');
    var negative=[];
    ['cap','migration','deed','effect'].forEach(function(kind){var s=seed();s.lumen=1e9;s.shards=1e9;s.research.arcanecal=10;b.setState(s);var before=b.getState(),passive=b.wispFormulaSnapshot('ember').passiveDps,undo=f.mutate(kind),caught='';
      try{
        if(kind==='cap'){f.buy('arcanecal',1);assert(b.getState().lumen===before.lumen && b.getState().research.arcanecal===10,'negative cap payment');}
        if(kind==='migration')assert(f.canonical(saved({labQueueOn:true})).researchQueue.arcanecal===false,'negative legacy queue');
        if(kind==='deed'){s.research.focus=19;b.setState(s);assert(!f.deeds().items.find(function(a){return a.id==='labmaster';}).eligible,'negative new levels in Deed');}
        if(kind==='effect')assert(b.wispFormulaSnapshot('ember').passiveDps===passive,'negative ability factor leaks into passive');
      }catch(e){caught=e.message;}finally{undo();}
      ok(caught.indexOf('negative ')===0,'causal mutation detected '+kind+' '+caught);negative.push(kind);
    });
    return {checks:checks,purchaseCases:purchases,negativeControls:negative};
  }
  return window.runForgeExtended(b,ctx,assert,parity,summaryParity,near);
};

window.runForgePersistence = function(b,ctx,assert,phase,nextPhase,backupCode,finish){
  if(phase()===0){
    var s=window.forgeSeed(b,ctx);s.research.arcanecal=13;s.research.conduction=4;s.research.luminoustracking=2;
    s.research.focus=31;s.researchQueue.arcanecal=true;s.researchQueue.conduction=false;s.researchQueue.luminoustracking=true;
    s.formationRebuild={members:['tide','stone'],preset:''};s.activeStudies=[{id:'guardmastery',remainingSec:123,totalDurationSec:150,speedMult:2}];
    s.studyQueue.guardmastery=true;s.longStudyLevels.guardmastery=2;s.lumen=37;s.shards=42;
    s.enemyIsLuminous=true;s.enemyHp=s.enemyMaxHp/2;
    b.setState(s);b.feedbackSave();var expected=b.getState();localStorage.setItem('forge-expected',JSON.stringify(expected));nextPhase(1);
    if(ctx.scenario==='forge-backup-restore'){b.setState(b.freshStateSnapshot());b.restoreBackup(backupCode(expected));}
    else {if(ctx.scenario==='forge-recovery')b.formationTest.corruptPrimary();b.suppressUnloadSave();location.reload();}
    return;
  }
  var expected=JSON.parse(localStorage.getItem('forge-expected')),s=b.getState();
  ['schemaVersion','research','researchQueue','studyQueue','activeStudies','longStudyLevels','formationRebuild','activeParty','spirits','lumen','shards','enemyIsLuminous','luminousAccum'].forEach(function(k){assert(JSON.stringify(s[k])===JSON.stringify(expected[k]),'Forge persistence exact '+k);});
  assert(s.research.arcanecal===13,'over-cap save level retained');
  assert(s.enemyHp===expected.enemyHp,'load does not reroll existing enemy');
  finish('pass',{storedOverCap:13,explicitQueues:s.researchQueue,activeStudy:s.activeStudies[0],formation:s.formationRebuild,enemyRetained:true});
};
window.runForgeExtended = function(b,ctx,assert,parity,summaryParity,near){
  var f=b.forge,copy=function(x){return JSON.parse(JSON.stringify(x));},ids=['arcanecal','conduction','luminoustracking'],clock=2000000000000,checks=0;
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(){return window.forgeSeed(b,ctx);}
  function allOff(s){Object.keys(s.researchQueue).forEach(function(id){s.researchQueue[id]=false;});return s;}
  if(ctx.scenario==='forge-effects'){
    [false,true].forEach(function(enhanced){[101,100].forEach(function(depth){
      var s=seed();s.depth=depth;s.enemyDepth=depth;s.enemyMaxHp=b.enemyHpFor(depth);s.enemyHp=s.enemyMaxHp;
      s.activeParty=['ember','stone','gale','thorn','void'];
      Object.keys(s.spirits).forEach(function(id){s.spirits[id]=1;s.heroRarity[id]=enhanced?5:0;s.wispModules[id]=enhanced?3:0;s.wispUltimate[id]=enhanced;});
      b.setState(s);s=b.getState();var snapshots={},raw={},rewards=f.rewards(depth);
      Object.keys(s.spirits).forEach(function(id){snapshots[id]=b.wispFormulaSnapshot(id,depth);raw[id]=f.rawResource(id);});
      [1,10,15].forEach(function(level){
        var arc=copy(s);arc.research.arcanecal=level;b.setState(arc);
        Object.keys(s.spirits).forEach(function(id){var a=b.wispFormulaSnapshot(id,depth),base=snapshots[id];near(a.abilityDamage,base.abilityDamage*(1+0.03*Math.min(level,10)),'ability factor once '+id);['wispPower','passiveDps','guardianTap','abilityReward','supportProfile','moteReward'].forEach(function(k){same(a[k],base[k],'Arcane excludes '+k+' '+id);});});
        same(f.rewards(depth),rewards,'Arcane no kill reward leakage');
        var con=copy(s);con.research.conduction=level;b.setState(con);
        Object.keys(s.spirits).forEach(function(id){var a=b.wispFormulaSnapshot(id,depth),base=snapshots[id],m=1+0.04*Math.min(level,10);
          same(a.abilityDamage,base.abilityDamage,'Conduction excludes damage');['lumen','shards'].forEach(function(k){near(f.rawResource(id)[k],raw[id][k]*m,'raw factor before rounding');ok(a.abilityReward[k]===Math.round(raw[id][k]*m),'actual rounded cast '+id+' '+k);});
          if(id==='gale'||id==='thorn'){b.setState(con);var cast=b.triggerAbilityFor(id,'live',clock),key=id==='gale'?'shards':'lumen';ok(cast.summary.kills===0,'cast fixture isolates ability from kill rewards');ok(cast.after[key]-cast.before[key]===Math.round(raw[id][key]*m),'real simulation cast grants rounded resource');}
        });
        same(f.rewards(depth),rewards,'Conduction no kill reward leakage');
      });
    });});
    [0,1,10,15].forEach(function(level){[1,9,10,31,32,100,140,149,200].forEach(function(depth){var s=seed();s.research.luminoustracking=level;s.depth=depth;s.enemyDepth=depth;s.enemyMaxHp=b.enemyHpFor(depth);s.enemyHp=s.enemyMaxHp;b.setState(s);
      var chance=Math.min(.35,Math.min(.30,.03+Math.floor(depth/10)*.02)+.005*Math.min(level,10));near(f.chance(depth),chance,'exact depth-based chance');
      [-1e-8,1e-8].forEach(function(offset){s.luminousAccum=1-chance+offset;b.setState(s);var next=f.spawn();ok(next.enemyIsLuminous===(depth%10!==0 && offset>0),'controlled accumulator boundary '+depth+' '+level);});
    });});
    var s=seed();s.lumen=1e10;s.shards=1e10;s.enemyIsLuminous=true;s.luminousAccum=.7;b.setState(s);var old=b.getState();f.buy('luminoustracking',5);var bought=b.getState();['enemyIsLuminous','enemyHp','enemyDepth','luminousAccum'].forEach(function(k){same(bought[k],old[k],'chance purchase no reroll');});b.feedbackSave();same(b.getState().enemyIsLuminous,true,'save retains Luminous');
    ids.forEach(function(id){s.research[id]=3;s.researchQueue[id]=true;});b.setState(s);var before=b.getState();b.ascendManual();var after=b.getState();same(after.research,before.research,'permanent levels survive Ascension');same(after.researchQueue,before.researchQueue,'queues survive Ascension');
    // A larger nominal factor can yield zero extra rounded resources.
    var small=seed();small.spirits.gale=1;b.setState(small);var p=f.preview('conduction',1);ok(p.next.casts.gale.shards===p.current.casts.gale.shards,'rounding masks nominal first bonus');
    return {checks:checks,formulaContracts:true,realCastChecks:true,controlledLuminousBoundaries:72,permanentAscension:true};
  }
  if(ctx.scenario==='forge-chronology'){
    var s=seed();s.lumen=1e9;s.shards=1e9;b.setState(s);ok(!f.queue(),'default OFF performs no buy');
    s.maxDepthEver=11;s.depth=1;s.enemyDepth=1;s.enemyMaxHp=b.enemyHpFor(1);s.enemyHp=s.enemyMaxHp;ids.forEach(function(id){s.researchQueue[id]=true;});s.researchQueue.charge=true;b.setState(s);f.queue();ok(b.getState().research.charge>0 && ids.every(function(id){return b.getState().research[id]===0;}),'locked ON does not block eligible old queue');
    s=seed();s.lumen=1e10;s.shards=1e10;ids.forEach(function(id){s.research[id]=10;s.researchQueue[id]=true;});s.researchQueue.charge=true;b.setState(s);f.queue();ok(b.getState().research.charge>0 && ids.every(function(id){return b.getState().research[id]===10 && b.getState().researchQueue[id];}),'maxed ON skips purchases without rewriting choice');
    s=seed();s.lumen=1e8;s.shards=1e7;ids.forEach(function(id){s.researchQueue[id]=true;});b.setState(s);var before=b.getState();f.queue();var after=b.getState(),spent=b.formationTest.spent(before,after);ok(before.lumen-after.lumen===spent.lumen && before.shards-after.shards===spent.shards,'multi-queue exact one-level debit ledger');ok(ids.reduce(function(n,id){return n+after.research[id];},0)===20,'existing twenty-purchase call guard retained');
    // A funded real manual purchase at t=0.5; no effect before its timestamp.
    ['live','offline'].forEach(function(kind){
      var s=seed();s.spirits.gale=1;s.activeParty=['gale'];s.heroResource.gale=0;s.lumen=1e6;s.shards=10000;b.setState(s);
      var initial=b.getState(),pre=b.simulate(.5,kind,.5,clock),preState=copy(pre.state);f.buy('arcanecal',1);var purchased=b.getState();ok(purchased.enemyHp===preState.enemyHp,'manual buy no retrospective damage');
      b.setState(initial);var controlPre=b.simulate(.5,kind,.1,clock);parity(preState,controlPre.state,'time before manual purchase');
      b.setState(purchased);var direct=b.simulate(7,kind,7,clock+500);b.setState(purchased);var ref=b.simulate(7,kind,.1,clock+500);parity(direct.state,ref.state,'paid ability effect reference '+kind);summaryParity(direct.summary,ref.summary,'paid ability summary '+kind);
    });
    // An existing ability resource event funds a queue in the middle of time.
    s=seed();s.spirits.thorn=10;s.activeParty=['thorn'];s.heroResource.thorn=90;s.lumen=14999;s.shards=120;s.researchQueue.arcanecal=true;
    b.setState(s);s=b.getState();var run=b.simulateTimeline(3,'offline',clock),event=run.timeline.find(function(e){return e.type==='research';});
    ok(event && event.elapsedSec>0 && event.elapsedSec<3,'queue purchase is genuinely mid-window');
    b.setState(s);var beforeEvent=b.simulate(event.elapsedSec-1e-4,'offline',event.elapsedSec-1e-4,clock);ok(beforeEvent.state.research.arcanecal===0,'no early queue purchase');
    b.setState(s);var at=b.simulate(event.elapsedSec,'offline',event.elapsedSec,clock);ok(at.state.research.arcanecal===1,'purchase at authoritative resource boundary');
    var cost=f.cost('arcanecal',0,1);near(at.state.lumen,s.lumen+at.summary.lumenGained-cost.lumen,'queue Lumen exact ledger');near(at.state.shards,s.shards+at.summary.shardGained-cost.shard,'queue Shard exact ledger');
    var disabled=copy(s);disabled.researchQueue.arcanecal=false;b.setState(disabled);var control=b.simulate(event.elapsedSec,'offline',event.elapsedSec,clock);near(at.state.enemyHp,control.state.enemyHp,'queue new damage cannot affect prior cast');
    b.setState(s);var ref=b.simulate(3,'offline',.1,clock);parity(run.state,ref.state,'mid-window queue reference');summaryParity(run.summary,ref.summary,'mid-window queue summary');
    b.setState(s);b.simulate(event.elapsedSec,'offline',event.elapsedSec,clock);var tail=b.simulate(3-event.elapsedSec,'offline',3-event.elapsedSec,clock+event.elapsedSec*1000);parity(tail.state,run.state,'queue split at purchase');
    // Preserve simultaneous Auto-Empower -> Forge -> Study ordering and contention.
    var mixed=copy(ctx.fixtures['chronology-simultaneous-order'].save);mixed.maxDepthEver=101;mixed.formationRebuild={members:['gale','tide'],preset:''};mixed.empowerQueue.tide=true;mixed.researchQueue.arcanecal=true;mixed.researchQueue.conduction=true;mixed.studyQueue.guardmastery=true;mixed.lumen=2e6;mixed.shards=100000;
    b.setState(mixed);mixed=b.getState();var combo=b.simulate(7,'offline',7,clock),ledger=b.formationTest.spent(mixed,combo.state);
    ok(combo.summary.empowers>0 && combo.summary.researchBought>0 && combo.summary.studiesStarted>0,'all concurrent spenders run without pause');ok(combo.state.research.arcanecal>0 && combo.state.research.conduction>0,'explicit new queues actually purchase during reconstruction');
    near(mixed.lumen+combo.summary.lumenGained-ledger.lumen,combo.state.lumen,'mixed Lumen ledger');near(mixed.shards+combo.summary.shardGained-ledger.shards,combo.state.shards,'mixed Shard ledger');
    b.setState(mixed);var ref=b.simulate(7,'offline',.1,clock);parity(combo.state,ref.state,'mixed chronology reference');summaryParity(combo.summary,ref.summary,'mixed chronology summary');
    ok(combo.state.spirits.tide>0 && combo.state.activeParty.every(function(id){return combo.state.spirits[id]>0;}),'paid powered-only reconstruction continues');
    return {checks:checks,midWindowPurchaseSec:event.elapsedSec,mixed:{research:combo.state.research,summary:combo.summary,spent:ledger}};
  }
  if(ctx.scenario==='forge-baseline'){
    var records=[];
    ['parity-early-simple','mid-game','mature-high-power'].forEach(function(name){['live','offline'].forEach(function(kind){
      b.setState(copy(ctx.fixtures[name].save));var start=b.getState();var run=b.simulate(60,kind,1,clock);
      ids.forEach(function(id){delete run.state.research[id];delete run.state.researchQueue[id];});
      records.push({fixture:name,kind:kind,seconds:60,state:run.state,summary:run.summary});
    });});
    return {records:records};
  }
  if(ctx.scenario==='forge-balance'){
    var records=[];
    ['mid-game','mature-high-power'].forEach(function(name){['manual','queue'].forEach(function(mode){['live','offline'].forEach(function(kind){
      var s=copy(ctx.fixtures[name].save);b.setState(s);s=allOff(b.getState());b.setState(s);
      var start=b.getState();
      if(mode==='queue'){var q=b.getState();ids.forEach(function(id){q.researchQueue[id]=true;});b.setState(q);}
      function execute(chunk){
        var costs={lumen:0,shards:0},buys={},first=null;
        if(mode==='manual'){
          first=b.simulate(60,kind,chunk,clock);
          ids.forEach(function(id){var plan=f.plan(id,1),before=b.getState();buys[id]=plan.buyCount;costs.lumen+=plan.cost.lumen;costs.shards+=plan.cost.shard;f.buy(id,1);
            ok(b.getState().lumen===before.lumen-plan.cost.lumen && b.getState().shards===before.shards-plan.cost.shard,'manual exact ledger at 60s');});
        }
        var result=b.simulate(first?540:600,kind,chunk,clock+(first?60000:0),clock);
        if(first)Object.keys(first.summary).forEach(function(k){
          if(['endDepth','pushDepth','clockEndMs'].includes(k))return;
          if(k==='achievements')result.summary[k]=Array.from(new Set(first.summary[k].concat(result.summary[k])));
          else if(Array.isArray(first.summary[k]))result.summary[k]=first.summary[k].concat(result.summary[k]);
          else if(typeof first.summary[k]==='boolean')result.summary[k]=first.summary[k]||result.summary[k];
          else result.summary[k]+=first.summary[k];
        });
        result.manualCosts=costs;result.manualBuys=buys;return result;
      }
      var runStart=b.getState(),audit=b.formationTest.audit(assert),economy=f.auditEconomy(assert),run;
      try{run=execute(600);}finally{economy.restore();audit.restore();}
      b.setState(runStart);var ref=execute(1);parity(run.state,ref.state,'balance reference '+name+' '+mode+' '+kind);summaryParity(run.summary,ref.summary,'balance summary');
      var spent=economy.ledger,manualCosts=run.manualCosts,manualBuys=run.manualBuys;
      near(runStart.lumen+run.summary.lumenGained-spent.lumen-spent.resetLumen-manualCosts.lumen,run.state.lumen,'balance Lumen including reset ledger');near(runStart.shards+run.summary.shardGained-spent.shards-manualCosts.shards,run.state.shards,'balance Shard ledger');
      ok(spent.researchLevels===run.summary.researchBought,'actual paid queue levels match summary');
      if(mode==='manual')ok(manualBuys.arcanecal>0,'real mid/mature manual purchase with earned resources');
      records.push({fixture:name,mode:mode,kind:kind,seconds:600,manualPurchaseSec:mode==='manual'?60:null,start:{depth:start.depth,lumen:start.lumen,shards:start.shards},manualBuys:manualBuys,manualCosts:manualCosts,research:run.state.research,spent:spent,kills:run.summary.kills,depth:run.state.depth,motes:run.summary.motesGained,remaining:{lumen:run.state.lumen,shards:run.state.shards},formation:run.state.formationRebuild,active:run.state.activeParty,causalAudit:audit.counts});
    });});});
    return {checks:checks,records:records,realPaidSimulation:true};
  }
  throw new Error('unknown Forge scenario');
};
