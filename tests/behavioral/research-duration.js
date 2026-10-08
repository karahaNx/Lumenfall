/* Research presentation contract; runs against the original app and simulator. */
window.runResearchDurationQa = function(b,ctx,assert){
  var t=b.studyPresentation, checks=0;
  function ok(value,message){checks++;assert(value,message);}
  function same(a,c,message){ok(JSON.stringify(a)===JSON.stringify(c),message);}
  b.resetFeedback();
  var seed=b.freshStateSnapshot();
  seed.maxDepthEver=101;seed.motes=1e9;
  seed.activeStudies=[{id:'guardmastery',remainingSec:729,totalDurationSec:300000,speedMult:1}];
  b.setState(seed);b.renderLayout();
  document.querySelector('[data-tab="research"]').click();
  var label=document.querySelector('[data-study-text="guardmastery"]');
  // This first assertion fails on the unchanged baseline's real rendered card.
  ok(label.textContent==='12m 09s remaining · 1x','rendered countdown retains seconds: '+label.textContent);

  var cases=[
    [0,'0s'],[0.001,'1s'],[45,'45s'],[59,'59s'],[59.01,'1m 00s'],
    [60,'1m 00s'],[60.01,'1m 01s'],[61,'1m 01s'],[729,'12m 09s'],
    [3599,'59m 59s'],[3599.01,'1h 00m 00s'],[3600,'1h 00m 00s'],
    [3600.01,'1h 00m 01s'],[3601,'1h 00m 01s'],[25929,'7h 12m 09s'],
    [86399,'23h 59m 59s'],[86399.01,'1d 00h 00m 00s'],[86400,'1d 00h 00m 00s'],
    [86400.01,'1d 00h 00m 01s'],[86401,'1d 00h 00m 01s'],[285129,'3d 07h 12m 09s'],
    [8640009,'100d 00h 00m 09s']
  ];
  cases.forEach(function(c){ok(t.format(c[0])===c[1],'ceil duration '+c[0]+' = '+c[1]);});
  [NaN,Infinity,-Infinity,-1,undefined,null,'729',{},Number.MAX_VALUE,Number.MAX_SAFE_INTEGER+1].forEach(function(v){
    ok(t.format(v)==='Time unavailable','invalid preview is neutral: '+String(v));
  });
  [1,1.5,2,3,4,5,6,7,8].forEach(function(speed){
    ok(t.remaining({remainingSec:285129*speed,speedMult:speed})==='3d 07h 12m 09s remaining · '+speed+'x','authoritative remaining / speed '+speed);
  });
  ok(t.remaining({remainingSec:0,speedMult:1})==='Finishing… · 1x','pending zero never claims completion and retains speed');
  ok(t.remaining({remainingSec:0.001,speedMult:8})==='1s remaining · 8x','positive fraction rounds up');
  ok(t.remaining({remainingSec:Number.MIN_VALUE,speedMult:8})==='1s remaining · 8x','underflow never claims zero');
  [NaN,Infinity,-Infinity,-1,undefined,null,'729',{}].forEach(function(v){
    ok(t.remaining({remainingSec:v,speedMult:1})==='Time unavailable','invalid remaining is neutral');
    ok(t.remaining({remainingSec:1,speedMult:v})==='Time unavailable','invalid speed is neutral');
  });
  ok(t.remaining({remainingSec:1,speedMult:0})==='Time unavailable','zero speed is not completion');
  ok(t.remaining({remainingSec:1,speedMult:Number.MIN_VALUE})==='Time unavailable','division overflow is neutral');
  ok(t.remaining(null)==='Time unavailable','missing active object is neutral');

  // Shared Deed, boss ETA and offline formatter keeps its established outputs.
  [[0,'1s'],[45,'45s'],[729,'12m'],[25929,'7h 12m'],[285129,'79h 12m']].forEach(function(c){
    ok(t.shared(c[0])===c[1],'shared formatting unchanged at '+c[0]);
  });
  var before=b.getState(), card=label.closest('.study-card');
  var observer=new MutationObserver(function(){});observer.observe(label,{childList:true,characterData:true,subtree:true});
  t.update();t.update();
  ok(observer.takeRecords().length===0,'unchanged text causes no DOM replacement');
  same(b.getState(),before,'presentation update leaves exact gameplay state unchanged');
  b.simulate(0.1,'live',0.1,Date.now());var committed=b.getState();t.update();
  ok(observer.takeRecords().length===0,'subsecond tick retains the same ceiling text');
  same(b.getState(),committed,'rendering does not alter committed fractional state');
  b.simulate(1,'live',1,Date.now());committed=b.getState();t.update();
  ok(label.textContent==='12m 08s remaining · 1x' && observer.takeRecords().length>0,'visible countdown changes at next displayed second');
  ok(document.querySelector('[data-study-text="guardmastery"]')===label && label.closest('.study-card')===card,'countdown does not rebuild catalogue/cards');
  same(b.getState(),committed,'countdown update is observer-only');observer.disconnect();

  // The existing paid speed action changes only its usual state; UI reads it.
  document.querySelector('[data-study-details="guardmastery"]').click();
  document.querySelector('[data-speed-study="guardmastery"][data-speed="1.5"]').click();
  var accelerated=b.getState();
  ok(accelerated.activeStudies[0].speedMult===1.5,'real speed-tier action applied');
  ok(accelerated.activeStudies[0].remainingSec===committed.activeStudies[0].remainingSec,'speed purchase does not rewrite remaining work');
  ok(document.querySelector('[data-study-text="guardmastery"]').textContent==='8m 06s remaining · 1.5x','speed change updates actual card immediately');

  // Long catalogue previews use the same duration grammar.
  var preview=b.getState();preview.activeStudies=[];preview.longStudyLevels.guardmastery=25;
  b.setState(preview);b.renderLayout();
  var meta=document.querySelector('[data-study="guardmastery"]').closest('.study-card').querySelector('.study-meta');
  ok(t.preview('guardmastery')>86400,'preview fixture spans days');
  ok(meta.textContent.startsWith('Takes '+t.format(t.preview('guardmastery'))+' ·'),'real preview uses research formatter');

  // Pending versus complete is decided by the real simulation, never UI time.
  seed.activeStudies[0].remainingSec=0;b.setState(seed);b.renderLayout();
  before=b.getState();t.update();same(b.getState(),before,'zero-pending render does not complete state');
  ok(document.querySelector('[data-study-text="guardmastery"]').textContent==='Finishing… · 1x','active zero is still pending in the rendered card');
  b.feedbackTick(true);
  ok(!b.getState().activeStudies.length && b.getState().longStudyLevels.guardmastery===1,'authoritative tick commits completion');
  ok(!document.querySelector('[data-study-text="guardmastery"]'),'committed completed study leaves running UI');

  // CI runs both targeted mutation controls as part of this default scenario.
  function longContract(){
    ok(t.format(285129)==='3d 07h 12m 09s','long duration contract: days and seconds are required');
  }
  if(ctx.scenario.startsWith('self-test-research-duration-')){
    t.mutate(ctx.scenario.endsWith('days')?'days':'seconds');longContract();
  } else ['days','seconds'].forEach(function(kind){
    var restore=t.mutate(kind),caught=false;
    try{longContract();}catch(e){caught=/long duration contract/.test(e.message);}finally{restore();}
    ok(caught,'negative control detects removed '+kind);
  });
  longContract();
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  ok(reduced===(ctx.scenario==='research-duration-reduced-motion'),'requested motion mode');
  if(reduced) ok(parseFloat(getComputedStyle(document.querySelector('.study-bar-fill') || document.querySelector('.tab-panel.active')).transitionDuration)<=0.001,'reduced-motion transition contract preserved');
  return {checks:checks,boundaries:cases.length,ceil:true,observerOnly:true,noCatalogueRebuild:true,negativeControls:2,reducedMotion:reduced};
};
