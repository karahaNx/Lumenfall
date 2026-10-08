/* Rendered earned-effect and Deed contract. Assertions use independent numeric
 * oracles plus real production eligibility/completion/reward operations. */
window.runUpgradeClarityQa=function(b,ctx,assert){
  var checks=0,q=function(s){return document.querySelector(s);};
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(){var s=b.freshStateSnapshot();s.maxDepthEver=101;s.achieved.asc5=true;s.achieved.d100=true;return s;}
  function pureRender(s){
    b.setState(s);var before=b.getState(),raw=b.rawSave(),trace=b.lifecycleTrace();
    b.upgradeClarity.render();
    same(b.getState(),before,'exact state unchanged by clarity rendering');
    ok(b.rawSave()===raw,'canonical save unchanged by clarity rendering');
    same(b.lifecycleTrace(),trace,'no save or lifecycle event from clarity rendering');
  }
  b.resetFeedback();
  [0,1,5,6,7,19,20,21,40].forEach(function(l){
    var s=seed();Object.keys(s.nodes).forEach(function(id){s.nodes[id]=l;});
    // Other systems must not leak into the stated node contribution.
    s.research.focus=3;s.research.resolve=4;s.longStudyLevels.lumenstudy=2;
    s.longStudyLevels.guardmastery=3;s.longStudyLevels.riftattune=4;s.longStudyLevels.prismstudy=2;
    s.owned.offline24=true;s.owned.offline48=true;pureRender(s);
    var expected={starlight:'+'+(l*10)+'% Lumen',steady:'+'+(l*8)+'% tap',swift:'+'+(l*4)+'% Prisms',momentum:'+'+(l*6)+'% passive',reserves:'+'+(l*2)+' hours',echo:'+'+Math.min(30,l*5)+' percentage points',bonds:Math.min(60,l*3)+'% Wisp recruiting discount'};
    Object.keys(expected).forEach(function(id){var el=q('[data-node-effect="'+id+'"]');if(l===0&&['starlight','steady','momentum'].includes(id)){ok(!el,'unowned retired node hidden '+id);return;}ok(el.textContent.includes(expected[id]),id+' earned/capped effect at level '+l);});
    var metrics=b.upgradeClarity.metrics();
    ok(Math.abs(metrics.offline-(Math.min(1,.7+l*.05)+.4))<1e-12,'offline production oracle');
    ok(metrics.costReduction===Math.min(.6,l*.03),'cost production floor oracle');
    ok(metrics.offlineCap===48+l*2,'reserves excludes shop cap');
    ok(Math.abs(metrics.lumen-(1+l*.1)*1.24*1.16)<1e-10,'Lumen contribution differs from multiplicative combined factor');
    ok(q('[data-node-effect="echo"]').textContent.includes('node cap reached')===(l>=6),'node offline cap indication');
    ok(q('[data-node-effect="bonds"]').textContent.includes('cost floor reached')===(l>=20),'node recruiting floor indication');
  });
  var projectRates={wispascend:15,guardmastery:20,riftattune:10,shardstudy:8,lumenstudy:8,formationstudy:5,motestudy:10,prismstudy:5};
  [0,1,3,8].forEach(function(l){
    var s=seed();Object.keys(projectRates).forEach(function(id){s.longStudyLevels[id]=l;});
    // Active next level is not an earned level, even at zero remaining work.
    s.activeStudies=[{id:'guardmastery',remainingSec:0,totalDurationSec:150,speedMult:1}];pureRender(s);
    Object.keys(projectRates).forEach(function(id){
      if(l===0&&['riftattune','formationstudy','prismstudy'].includes(id)){ok(!q('[data-project-effect="'+id+'"]'),'unowned retired Study hidden '+id);return;}
      var text=q('[data-project-effect="'+id+'"]').textContent;
      ok(text.includes('Completed level '+l),'completed level on '+id);
      ok(text.includes('+'+(l*projectRates[id])+(id==='riftattune'?' percentage points':'%')),'actual earned '+id+' rate at '+l);
      ok(text.includes('No earned bonus')===(l===0),'zero completion is no earned bonus '+id);
    });
    ok(q('[data-running-study="guardmastery"]').textContent.includes('In progress: level '+(l+1)),'pending preview labelled');
    ok(q('[data-study-text="guardmastery"]').textContent==='Finishing…','zero pending does not complete');
  });
  var locked=b.freshStateSnapshot();pureRender(locked);
  ok(!q('[data-project-effect="prismstudy"]'),'locked Projects reveal no earned effect');
  ok(!q('[data-node-effect="momentum"]'),'locked node remains locked');

  // Each threshold is compared to its unchanged production check. Re-rendering
  // must neither grant nor revoke rewards/earned status at these boundaries.
  var setters={
    d10:['maxDepthEver',10],d25:['maxDepthEver',25],d50:['maxDepthEver',50],d100:['maxDepthEver',100],d250:['maxDepthEver',250],
    tap100:['totalTaps',100],tap1000:['totalTaps',1000],tap10000:['totalTaps',10000],
    asc1:['ascendCount',1],asc5:['ascendCount',5],asc10:['ascendCount',10],autotap:['ascendCount',12],idle8:['totalOfflineSeconds',28800]
  };
  var ids=b.forge.deeds().items.map(function(a){return a.id;});
  ids.forEach(function(id){
    [false,true].forEach(function(at){
      var s=b.freshStateSnapshot(),value;
      if(setters[id]){var c=setters[id];s[c[0]]=c[1]-(at?0:1);}
      else if(id==='labmaster'||id==='labqueue'){s.research.focus=(id==='labmaster'?20:60)-(at?0:1);s.research.arcanecal=10;s.research.conduction=10;s.research.luminoustracking=10;}
      else if(id==='modulemax'){s.wispModules.ember=at?20:19;s.wispModules.tide=1;}
      else if(id==='study1'||id==='study25')s.longStudyLevels.guardmastery=(id==='study1'?1:25)-(at?0:1);
      else if(id==='fullparty'){s.maxDepthEver=101;s.activeParty=Object.keys(s.spirits).slice(0,at?5:4);s.activeParty.forEach(function(k){s.spirits[k]=1;});}
      else if(id==='all')Object.keys(s.spirits).forEach(function(k,i,arr){s.spirits[k]=at||i<arr.length-1?1:0;});
      else if(id==='mythic')s.heroRarity.ember=at?5:4;
      else if(id==='allstudies')['wispascend','guardmastery','shardstudy','lumenstudy','motestudy'].forEach(function(k,i,arr){s.longStudyLevels[k]=at||i<arr.length-1?1:0;});
      else if(id==='firstultimate'){s.heroRarity.ember=5;s.wispUltimate.ember=at;}
      pureRender(s);var item=b.forge.deeds().items.find(function(a){return a.id===id;});
      ok(item.eligible===at,id+' unchanged eligibility before/at threshold');
      var p=q('[data-deed-progress="'+id+'"]');
      ok(p.dataset.current===String(Math.min(item.progress.current,item.progress.target)),id+' authoritative current');
      ok(p.dataset.target===String(item.progress.target),id+' authoritative target');
      ok(q('[data-deed-requirement="'+id+'"]').textContent.length>0,id+' concrete requirement');
      ok(p.textContent.includes('/')&&/[a-z]/i.test(p.textContent),id+' progress has unit');
      if(id==='idle8') ok(p.textContent===(at?'8':'7.99')+' / 8 offline hours','offline hours never round up to unearned target');
      else {
        var visible=p.textContent.split(' / ');
        var exact=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');};
        ok(visible[0]===exact(Math.min(item.progress.current,item.progress.target)),id+' visible current is exact before/at threshold');
        ok(visible[1].startsWith(exact(item.progress.target)+' '),id+' visible target is exact and retains unit');
        if(!at) ok(visible[0]!==exact(item.progress.target),id+' visible progress cannot imply unearned target');
      }
      ok(!b.getState().achieved[id],'eligible rendering does not award '+id);
      if(at){
        b.forge.achievements();var earned=b.getState();ok(earned.achieved[id],id+' unchanged grant operation');
        b.forge.achievements();same(b.getState(),earned,id+' one-time rewards remain idempotent');
        var reset=b.freshStateSnapshot();reset.achieved=earned.achieved;reset.comets=earned.comets;pureRender(reset);
        ok(q('[data-deed-progress="'+id+'"]').dataset.current===String(item.progress.target),id+' earned progress persists after run reset');
      }
    });
  });
  pureRender(seed());
  ok(q('[data-deed-progress="autotap"]').textContent==='0 / 12 Ascensions','Vigil exact progress/units');
  ok(q('[data-deed-requirement="autotap"]').textContent==='Ascend 12 times.','Vigil concrete requirement');
  ok(q('[data-deed-progress="autotap"]').closest('.ach-card').querySelector('.ach-unlock').textContent.includes('Auto-Tap'),'Vigil unlock separate');
  ['labmaster','labqueue'].forEach(function(id){var card=q('[data-deed-progress="'+id+'"]').closest('.ach-card');ok(!q('[data-deed-progress="'+id+'"]').textContent.includes('Battle Focus'),'legacy names outside progress');ok(card.querySelector('.deed-scope').textContent.includes('Other Forge upgrades do not count'),'original five scope explicit');});
  ok(q('[data-deed-requirement="modulemax"]').textContent==='Raise one Wisp Module to level 20.','Module one-Wisp requirement');
  ok(b.forge.deeds().total===683,'reward catalogue unchanged');
  return {checks:checks,nodeLevels:9,projectLevels:4,deeds:ids.length,exactObserverPurity:true};
};
