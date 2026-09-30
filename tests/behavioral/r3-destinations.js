/* R3: actual production navigation, controls, tick and persistence. */
window.seedR3 = function(b,ctx){
  var s=b.freshStateSnapshot();
  s.maxDepthEver=101;s.lumen=1e9;s.shards=1e9;s.motes=1e6;
  s.questDay=ctx.currentDay();s.loginStreak=1;
  return s;
};
window.runR3DestinationsQa = function(b,ctx,assert){
  b.resetFeedback();
  var q=function(s){return document.querySelector(s);},checks=0;
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function go(name){q('[data-tab="'+name+'"]').click();}
  var catalogue=b.r3.catalogues(),seed=window.seedR3(b,ctx);
  b.setState(seed);b.renderLayout();
  same(catalogue.upgrades,['focus','sense','formation','resolve','charge','arcanecal','conduction','luminoustracking'],'five original direct upgrades followed by three Forge v1 additions');
  ok(catalogue.projects.length===8,'eight original timed projects');
  var nav=Array.from(document.querySelectorAll('nav.tabbar .tab-btn'));
  same(nav.map(function(n){return n.dataset.tab;}),['battle','spirits','forge','research','ascend','deeds'],'six ordered main destinations');
  ok(!q('[data-lab-view],.lab-tabs,[id^="lab-panel-"]'),'obsolete subnavigation removed entirely');
  ok(q('#research-list').closest('.tab-panel').id==='tab-forge','direct upgrades belong only to Forge');
  ok(q('#study-list').closest('.tab-panel').id==='tab-research','projects belong only to Lab');
  ok(document.querySelectorAll('#research-list').length===1 && document.querySelectorAll('#study-list').length===1,'unique live containers');
  ok(q('#tab-forge h2').textContent==='Rift Forge' && q('#tab-research h2').textContent==='Research Lab','destination titles');
  ok(q('#tab-research').textContent.includes('Research Projects'),'visible content designation');
  ok(q('#node-list').closest('.tab-panel').id==='tab-ascend','Ascension Tree remains under Ascend');
  nav.forEach(function(btn){
    btn.focus();btn.click();
    var panel=q('#'+btn.getAttribute('aria-controls'));
    ok(panel.classList.contains('active') && panel.getAttribute('aria-labelledby')===btn.id,'navigation aria relation '+btn.dataset.tab);
    ok(document.activeElement===btn && btn.getAttribute('aria-current')==='page','selected destination retains focus');
    ok(document.querySelectorAll('nav.tabbar [aria-current="page"]').length===1,'one selected destination');
  });
  go('forge');var forge=q('[data-tab="forge"]');forge.focus();
  forge.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  ok(document.activeElement===q('[data-tab="research"]') && q('#tab-research').classList.contains('active'),'keyboard moves Forge to Lab');
  document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));
  ok(document.activeElement===nav[0] && q('#tab-battle').classList.contains('active'),'Home opens Rift');
  document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));
  ok(document.activeElement===nav[5] && q('#tab-deeds').classList.contains('active'),'End opens Deeds');
  function shortcut(){
    go('battle');q('[data-tab="research"]').focus();q('[data-tab="research"]').click();
    ok(q('#tab-research').classList.contains('active') && !q('#tab-forge').classList.contains('active'),'R3 Lab navigation must open Lab, never Forge');
    ok(document.activeElement===q('[data-tab="research"]'),'Lab button focuses Lab navigation');
    ok(!!q('[data-study-choose]'),'free slots retain Choose Study access');
  }
  shortcut();
  var before=b.getState();
  [1,2,3].forEach(function(){nav.forEach(function(btn){btn.click();});});
  same(b.getState(),before,'navigation alone leaves exact gameplay state unchanged');
  // Compare equal real-tick sequences, with and without interleaved navigation.
  function ticks(navigate){
    b.setState(before);b.renderLayout();
    for(var i=0;i<20;i++){if(navigate) go(i%2?'forge':'research');b.feedbackTick(false);}
    return b.getState();
  }
  same(ticks(true),ticks(false),'navigation leaves exact state unchanged over equal live ticks');
  b.setState(seed);b.renderLayout();go('forge');
  catalogue.upgrades.forEach(function(id){ok(!b.getState().researchQueue[id],'upgrade Queue defaults OFF '+id);});
  catalogue.projects.forEach(function(id){ok(!b.getState().studyQueue[id],'project Queue defaults OFF '+id);});
  // Every existing bulk option keeps its authoritative plan and cost.
  ['1','5','10','25','50','100','max'].forEach(function(mult){
    b.setState(seed);b.renderLayout();go('forge');
    q('[data-mult="'+mult+'"]').click();
    ok(q('[data-mult="'+mult+'"]').getAttribute('aria-pressed')==='true','bulk selected '+mult);
    var plan=b.r3.plan('focus'),prior=b.getState();q('[data-research="focus"]').click();var after=b.getState();
    ok(after.research.focus===prior.research.focus+plan.buyCount,'exact bulk levels '+mult);
    if(plan.affordable){
      ok(after.lumen===prior.lumen-plan.cost.lumen && after.shards===prior.shards-plan.cost.shard,'exact bulk debit '+mult);
    } else {
      ok(q('[data-research="focus"]').disabled,'unaffordable bulk stays disabled '+mult);
      same(after,prior,'unaffordable bulk cannot change state '+mult);
    }
    same(after.activeStudies,prior.activeStudies,'direct upgrade never creates timed project');
  });
  ['50','100'].forEach(function(mult){
    var funded=JSON.parse(JSON.stringify(seed));funded.lumen=1e24;
    b.setState(funded);b.renderLayout();go('forge');q('[data-mult="'+mult+'"]').click();
    var plan=b.r3.plan('focus'),prior=b.getState();
    ok(plan.affordable && plan.buyCount===Number(mult),'funded large bulk available '+mult);
    q('[data-research="focus"]').click();var after=b.getState();
    ok(after.research.focus===prior.research.focus+Number(mult) && after.lumen===prior.lumen-plan.cost.lumen,'funded large bulk exact purchase '+mult);
  });
  b.setState(seed);b.renderLayout();go('forge');
  catalogue.upgrades.forEach(function(id){
    q('[data-queue="'+id+'"]').click();ok(b.getState().researchQueue[id]===true,'individual Forge queue ON');
    q('[data-queue="'+id+'"]').click();ok(b.getState().researchQueue[id]===false,'individual Forge queue OFF');
  });
  go('research');
  catalogue.projects.forEach(function(id){
    q('[data-study-queue="'+id+'"]').click();ok(b.getState().studyQueue[id]===true,'individual Lab queue ON');
    q('[data-study-queue="'+id+'"]').click();ok(b.getState().studyQueue[id]===false,'individual Lab queue OFF');
  });
  var project=b.r3.project('guardmastery'),prior=b.getState();q('[data-study="guardmastery"]').click();var active=b.getState();
  ok(active.lumen===prior.lumen-project.cost.lumen && active.shards===prior.shards-project.cost.shard,'project uses exact original start price');
  ok(active.activeStudies[0].remainingSec===project.duration,'project uses original duration');
  same(active.research,prior.research,'project start never buys Forge levels');
  q('[data-study-details="guardmastery"]').click();q('[data-speed-study="guardmastery"][data-speed="2"]').click();
  go('forge');go('research');
  ok(q('[data-study-text="guardmastery"]').textContent==='1m 15s remaining · 2x','speed and countdown survive destination changes');
  b.feedbackTick(false);go('forge');go('research');
  ok(b.getState().activeStudies[0].remainingSec<150,'live tick still progresses active project');
  if(ctx.scenario==='self-test-r3-shortcut'){b.r3.wrongShortcut();shortcut();}
  else {
    var restore=b.r3.wrongShortcut(),caught=false;
    try{shortcut();}catch(e){caught=/R3 Lab navigation must open Lab/.test(e.message);}finally{restore();}
    ok(caught,'causal negative control catches wrong Lab destination');shortcut();
  }
  return {checks:checks,mainDestinations:6,bulkOptions:7,exactState:true,liveTickEquality:true,negativeControl:true};
};
window.prepareR3Reload = function(b,ctx,assert){
  var s=window.seedR3(b,ctx);s.owned.rememberbulk=true;
  b.setState(s);b.renderLayout();
  document.querySelector('[data-tab="forge"]').click();document.querySelector('[data-mult="5"]').click();
  document.querySelector('[data-research="focus"]').click();
  document.querySelector('[data-tab="research"]').click();document.querySelector('[data-study="guardmastery"]').click();
  document.querySelector('[data-study-details="guardmastery"]').click();document.querySelector('[data-speed-study="guardmastery"][data-speed="2"]').click();
  b.feedbackTick(false);
  assert(b.getState().activeStudies[0].speedMult===2,'paid speed before real reload');
};
window.checkR3Reload = function(b,ctx,assert,expected){
  var s=b.getState();
  ['research','researchQueue','studyQueue','activeStudies','longStudyLevels','savedLabMultiplier','lumen','shards','motes','activeParty','formationRebuild','schemaVersion'].forEach(function(key){
    assert(JSON.stringify(s[key])===JSON.stringify(expected[key]),'real reload preserves '+key);
  });
  document.querySelector('[data-tab="forge"]').click();
  assert(document.querySelector('[data-mult="5"]').getAttribute('aria-pressed')==='true','remembered bulk restores in Forge');
  document.querySelector('[data-tab="research"]').click();
  var badge=document.querySelector('#lab-capacity-badge'),free=b.riftStatus.slots()-s.activeStudies.length;
  assert(badge.hidden===(free===0)&&badge.textContent===String(free),'capacity badge restores from actual loaded Study state');
  assert(document.querySelector('[data-study-text="guardmastery"]').textContent==='1m 15s remaining · 2x','active project countdown after reload');
  var count=0;
  while(b.getState().activeStudies.length && count++<750)b.feedbackTick(false);
  assert(!b.getState().activeStudies.length && b.getState().longStudyLevels.guardmastery===1,'original live tick authoritatively completes once');
  assert(!document.querySelector('[data-study-text="guardmastery"]'),'completed card removed');
  document.querySelector('[data-tab="forge"]').click();document.querySelector('[data-tab="research"]').click();
  assert(b.getState().longStudyLevels.guardmastery===1 && !b.getState().activeStudies.length,'navigation cannot duplicate completion');
  return {reload:true,originalSaveIds:true,speed:2,completion:1,liveTicks:count};
};
