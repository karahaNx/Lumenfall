/* Independent old-value oracles and real current purchase/persistence paths. */
window.upgradeIdentitySeed=function(b,ctx){
  var s=window.forgeSeed(b,ctx);s.lumen=1e12;s.shards=1e12;s.prisms=1e12;s.motes=1e6;
  ['focus','sense','formation','resolve'].forEach(function(id,i){s.research[id]=i+3;s.researchQueue[id]=true;});
  ['riftattune','formationstudy','prismstudy'].forEach(function(id,i){s.longStudyLevels[id]=i+4;s.studyQueue[id]=true;});
  ['starlight','steady','momentum'].forEach(function(id,i){s.nodes[id]=i+5;});
  s.activeStudies=[{id:'prismstudy',remainingSec:12,totalDurationSec:450,speedMult:2}];
  return s;
};
window.runUpgradeIdentityQa=async function(b,ctx,assert,parity,summaryParity){
  var checks=0,f=b.forge,t=b.inquiry,u=b.upgradeIdentity;
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function near(a,c,m){ok(Math.abs(a-c)<=1e-12*Math.max(1,Math.abs(c)),m);}
  function seed(){return window.upgradeIdentitySeed(b,ctx);}
  function install(s){b.setState(s);b.renderLayout();return b.getState();}
  b.resetFeedback();
  var closedForge=['focus','sense','formation','resolve'],closedLab=['riftattune','formationstudy','prismstudy'],closedTree=['starlight','steady','momentum'];
  var originalForge=['focus','sense','formation','resolve','charge','arcanecal','conduction','luminoustracking'];
  var addedForge=['cauterize','fracturekey','guardianseal','spillway','sustainedchannel','tapconduit','guardiancadence','relay','resonantedge','victorycharge','amplifiertrim','dualchannel','overflowconduit','resonancecells','resonancecascade','resonancereclaim'];
  if(ctx.scenario==='upgrade-identity-contracts'){
    var s=seed();s.activeStudies=[];install(s);
    closedForge.forEach(function(id){
      [1,5,10,25,50,100,'max'].forEach(function(n){
        var before=b.getState(),plan=f.plan(id,n);ok(plan.reason==='retired'&&!plan.affordable&&!plan.buyCount,'closed bulk '+id+' '+n);
        f.buy(id,n);same(b.getState(),before,'closed bulk spends nothing '+id+' '+n);
      });
      var before=b.getState();u.spoofForge(id);same(b.getState(),before,'caller cannot bypass retirement metadata '+id);
      ok(!document.querySelector('[data-research="'+id+'"]')&&!document.querySelector('[data-queue="'+id+'"]'),'closed Forge has no buy/queue controls '+id);
    });
    var before=b.getState();ok(!f.queue(),'all closed Forge queues inert');same(b.getState(),before,'closed queue spends nothing');
    closedLab.forEach(function(id){var before=b.getState();ok(t.plan(id).reason==='retired'&&!t.start(id),'closed Study start '+id);same(b.getState(),before,'closed Study spends nothing '+id);ok(!document.querySelector('[data-study="'+id+'"]'),'closed Study has no start '+id);});
    before=b.getState();ok(!t.autoFill()&&t.queued().studiesStarted===0,'both closed Study queue entrypoints inert');same(b.getState(),before,'closed queued Studies spend nothing');
    closedTree.forEach(function(id){var before=b.getState();u.buyNode(id);same(b.getState(),before,'closed Tree cannot spend '+id);ok(!document.querySelector('[data-node="'+id+'"]'),'closed Tree has no purchase '+id);});
    [0,1,6,20,31].forEach(function(k){
      var s=seed();originalForge.forEach(function(id){s.research[id]=k;});addedForge.forEach(function(id){ok(s.research[id]===0&&s.researchQueue[id]===false,'new Forge defaults do not contaminate historical factor oracle '+id);});Object.keys(s.longStudyLevels).forEach(function(id){s.longStudyLevels[id]=k;});Object.keys(s.nodes).forEach(function(id){s.nodes[id]=k;});
      install(s);var m=u.metrics();
      near(m.lumen,(1+k*.1)*(1+k*.08)*(1+k*.08),'exact old Lumen stacking '+k);
      near(m.shards,(1+k*.08)*(1+k*.08),'exact old Shard stacking '+k);
      near(m.tap,(1+k*.08)*(1+k*.1)*(1+k*.2),'exact old tap stacking '+k);
      near(m.formation,(1+k*.05)*(1+k*.05),'exact old Formation factors '+k);
      near(m.power,1+k*.15,'exact old Wisp factor '+k);near(m.momentum,1+k*.06,'exact old Momentum '+k);
      near(m.offline,Math.min(1,.7+k*.05)+k*.1,'old offline bonus remains additive and can exceed100% '+k);
      near(m.prisms,(1+k*.04)*(1+k*.05),'old Prism factors multiply '+k);near(m.motes,1+k*.1,'old deterministic Mote yield '+k);
      var canonical=f.canonical(b.getState());same(f.canonical(canonical),canonical,'idempotent canonicalization '+k);
      ['research','longStudyLevels','nodes'].forEach(function(key){same(canonical[key],b.getState()[key],'no clamping/conversion '+key+' '+k);});
    });
    install(seed());
    same(f.nodes().filter(function(n){return ['charge','arcanecal','conduction','luminoustracking'].indexOf(n.id)!==-1;}).map(function(n){return [n.id,n.lumenBase,n.shardBase,n.lumenGrowth,n.shardGrowth];}),
      [['charge',0,30,1,1.55],['arcanecal',15000,120,1.6,1.6],['conduction',90000,280,1.6,1.6],['luminoustracking',2500000,1500,1.6,1.6]],'retained Forge recipes/prices');
    same(t.nodes().filter(function(n){return !n.retiredTo&&!n.labGroup;}).map(function(n){return [n.id,n.lumenBase,n.shardBase,n.baseDurationSec];}),
      [['wispascend',800,80,180],['guardmastery',600,40,150],['shardstudy',400,150,200],['lumenstudy',1400,120,260],['motestudy',3200,320,380],['measuredinquiry',30000,1200,600]],'retained Lab prices/work');
    same(u.nodes().filter(function(n){return !n.retiredTo&&!n.retired;}).map(function(n){return [n.id,n.baseCost,n.growth];}),[['echo',2,1.4],['bonds',2,1.45],['swift',3,1.5]],'retained Prism prices after F26 hours retirement');
    [0,5,10,13].forEach(function(level){var s=seed();s.activeStudies=[];s.longStudyLevels.measuredinquiry=level;install(s);
      t.nodes().filter(function(n){return !n.retiredTo&&!n.labGroup&&n.id!=='measuredinquiry';}).forEach(function(n){near(t.duration(n.id,5),Math.round(Math.round(n.baseDurationSec*Math.pow(1.6,5))*(1-.02*Math.min(10,level))),'bought Inquiry discount preserved '+n.id+' '+level);});
    });
    [1,39,40,59,60,89,90].forEach(function(depth){var s=seed();s.maxDepthEver=depth;s.depth=1;s.enemyDepth=1;s.enemyMaxHp=b.enemyHpFor(1);s.enemyHp=s.enemyMaxHp;install(s);ok(b.riftStatus.slots()===(depth<40?2:depth<60?3:depth<90?4:5),'historical slot milestones '+depth);});
    var fresh=b.freshStateSnapshot();fresh.maxDepthEver=101;['wispascend','guardmastery','shardstudy','lumenstudy','motestudy'].forEach(function(id){fresh.longStudyLevels[id]=1;});install(fresh);
    var deed=f.deeds().items.find(function(d){return d.id==='allstudies';});ok(deed.eligible&&deed.progress.current===5&&deed.progress.target===5,'fresh Every Path reachable without closed Studies/Inquiry');
    f.achievements();var earned=b.getState();f.achievements();same(b.getState(),earned,'Deed reward only once');
    fresh=b.freshStateSnapshot();fresh.research.charge=60;install(fresh);['labmaster','labqueue'].forEach(function(id){ok(f.deeds().items.find(function(d){return d.id===id;}).eligible,'fresh original Forge threshold reachable '+id);});
    ok(f.deeds().total===683,'one-time Comet reward pool unchanged');
    ok(t.nodes().filter(function(n){return !n.retiredTo;}).length===20,'twenty independently purchasable Lab tracks');
    ok(f.nodes().filter(function(n){return !n.retiredTo;}).length===20,'twenty independently purchasable Forge tracks');
    return {checks:checks,closedTracks:10,activeTracks:43,exactOldFactors:true,currenciesUnchanged:true,idempotent:true,freshDeeds:true};
  }
  if(ctx.scenario==='upgrade-identity-farm-clock'){
    var s=JSON.parse(JSON.stringify(ctx.fixtures['parity-medium-farm'].save)),clocks=[2000000000000,2000000000371];
    // Keep the saved old ON queues: stopping duplicate purchases exposes the
    // real sub-nanosecond grid crossing, without changing purchased factors.
    install(s);s=b.getState();var records=[];
    // This old save earns more than100% offline. Preserve that policy and
    // compare each mode to its own split reference, rather than changing it.
    for(var clock of clocks)for(var kind of ['live','offline']){
      install(s);var whole=b.simulate(60,kind,60,clock);
      install(s);for(var i=0;i<6;i++)var split=b.simulate(10,kind,10,clock+i*10000);parity(whole.state,split.state,'Farm endpoint whole/split '+kind+' '+clock);
      closedForge.forEach(function(id){ok(whole.state.research[id]===s.research[id],'clock cannot invent retired ownership '+id);});
      records.push({kind:kind,clockStartMs:clock,kills:whole.summary.kills});
    }
    return {checks:checks,savedCharge:s.research.charge,clockStartsMs:clocks,wholeSplit:true,records:records};
  }
  if(ctx.scenario==='upgrade-identity-chronology'){
    var s=seed();s.activeStudies=closedLab.map(function(id){return {id:id,remainingSec:1,totalDurationSec:123,speedMult:2};});install(s);var before=b.getState();
    var paid=t.tail(.5);closedLab.forEach(function(id){ok(paid.state.longStudyLevels[id]===before.longStudyLevels[id]+1,'paid closed level earned once '+id);});
    ok(paid.summary.completedStudies.length===3&&!paid.state.activeStudies.length&&!paid.summary.studiesStarted,'all paid old work completes, no replacement starts');
    ['lumen','shards','motes'].forEach(function(key){ok(paid.state[key]===before[key],'no extra payment or refund '+key);});
    same(t.tail(10).state,paid.state,'no repeat completion/level minting');
    var clock=2000000000000;install(s);var live=b.simulate(10,'live',10,clock);install(s);var offline=b.simulate(10,'offline',10,clock);install(s);var split=b.simulate(10,'live',.1,clock);
    parity(live.state,offline.state,'legacy paid work live/offline');summaryParity(live.summary,offline.summary,'legacy paid summaries');parity(live.state,split.state,'legacy paid work whole/split');summaryParity(live.summary,split.summary,'legacy split summaries');
    closedForge.forEach(function(id){ok(live.state.research[id]===s.research[id],'old queue cannot increase closed Forge '+id);});
    closedLab.forEach(function(id){ok(live.state.longStudyLevels[id]===s.longStudyLevels[id]+1,'full simulator closes paid work once '+id);});
    install(s);b.ascendManual();var ascended=b.getState();['nodes','research','longStudyLevels','activeStudies','studyQueue','researchQueue'].forEach(function(key){same(ascended[key],before[key],'Ascend retains legacy ownership/paid snapshots '+key);});
    return {checks:checks,paidCompletions:3,liveOffline:true,split:true,ascend:true};
  }
  // Actual rendered pages at 320/390/430px, normal and doubled root text.
  var records=[],minContrast=Infinity;
  function rgb(value){return value.match(/[\d.]+/g).slice(0,3).map(Number);}
  function luminance(c){var v=c.map(function(n){n/=255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
  for(var text of [1,2]){
    document.documentElement.style.fontSize=(16*text)+'px';
    for(var tab of ['forge','research','ascend']){
      var s=seed();install(s);document.querySelector('[data-tab="'+tab+'"]').click();
      await new Promise(function(resolve){setTimeout(resolve,300);});
      var root=document.querySelector('#tab-'+tab),main=document.querySelector('main');
      ok(root.scrollWidth<=root.clientWidth,'no horizontal overflow '+tab+' '+text+' '+JSON.stringify(Array.from(root.querySelectorAll('*')).filter(function(el){return el.getBoundingClientRect().right>root.getBoundingClientRect().right+1;}).slice(0,8).map(function(el){return {tag:el.tagName,cls:el.className,width:el.getBoundingClientRect().width,text:el.textContent.slice(0,30)};})));
      var legacy=root.querySelectorAll('[data-legacy-upgrade]');ok(legacy.length===0,'retired read-only shop entries removed '+tab);
      ['focus','sense','formation','resolve'].forEach(function(id){ok(!root.querySelector('[data-research="'+id+'"],[data-queue="'+id+'"]'),'retired Forge controls remain absent '+id);});
      root.querySelectorAll('.node-card,.study-card').forEach(function(card){
        // Current card gradient is at most8% chapter color over #1b2740.
        // Test the bright endpoint rather than assuming a transparent background.
        var probe=document.createElement('span');probe.style.color='var(--chapter)';card.appendChild(probe);var chapter=rgb(getComputedStyle(probe).color);probe.remove();
        var bg=chapter.map(function(n,i){return .08*n+.92*[27,39,64][i];}),background=luminance(bg);
        card.querySelectorAll('.name,.desc,.effect-note,.earned-effect').forEach(function(el){var foreground=luminance(rgb(getComputedStyle(el).color)),ratio=(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);minContrast=Math.min(minContrast,ratio);ok(ratio>=4.5,'retained upgrade text contrast '+tab+' '+el.className+' '+ratio);});
      });
      var controls=Array.from(root.querySelectorAll('button')).filter(function(el){return el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';});
      controls.forEach(function(el){var r=el.getBoundingClientRect();ok(r.width>=44&&r.height>=44,'44px '+tab+' '+el.outerHTML.slice(0,120)+' '+r.width+'x'+r.height);});
      var control=controls.find(function(el){return !el.disabled;});control.focus();ok(document.activeElement===control,'keyboard focus '+tab+' '+text);
      ok(getComputedStyle(control).outlineStyle!=='none'||getComputedStyle(control).boxShadow!=='none','visible focus indicator '+tab);
      records.push({tab:tab,textScale:text,controls:controls.length,legacy:legacy.length,width:innerWidth,overflow:root.scrollWidth-root.clientWidth});
      main.scrollTop=0;
    }
  }
  ok(matchMedia('(prefers-reduced-motion: reduce)').matches===(ctx.scenario==='upgrade-identity-reduced-motion'),'requested reduced-motion');
  return {checks:checks,records:records,minRetainedTextContrast:minContrast};
};
window.runUpgradeIdentityPersistence=function(b,ctx,assert,phase,nextPhase,backupCode,finish){
  if(phase()===0){
    b.setState(window.upgradeIdentitySeed(b,ctx));b.feedbackSave();var expected=b.getState();localStorage.setItem('identity-expected',JSON.stringify(expected));nextPhase(1);
    if(ctx.scenario==='upgrade-identity-backup-restore'){b.setState(b.freshStateSnapshot());b.restoreBackup(backupCode(expected));}
    else {if(ctx.scenario==='upgrade-identity-recovery')b.formationTest.corruptPrimary();b.suppressUnloadSave();location.reload();}
    return;
  }
  var expected=JSON.parse(localStorage.getItem('identity-expected')),s=b.getState();
  var keys=['schemaVersion','nodes','research','researchQueue','longStudyLevels','studyQueue','activeStudies','studyUseMotes','studySpeedTargets','lumen','shards','prisms','motes','comets','sigils'];
  keys.forEach(function(key){assert(JSON.stringify(s[key])===JSON.stringify(expected[key]),'actual persistence retains '+key);});
  assert(JSON.stringify(b.forge.canonical(s))===JSON.stringify(b.forge.canonical(b.forge.canonical(s))),'restored ownership idempotent');
  finish('pass',{keys:keys,exactLegacyOwnership:true,paidSnapshot:true,idempotent:true});
};
