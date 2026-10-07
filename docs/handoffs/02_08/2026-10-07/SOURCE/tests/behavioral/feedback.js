/* Test-only: exercise the real tick, not a second feedback implementation. */
window.runP206FeedbackQa = function(bridge,ctx,assert){
  document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});
  document.querySelector('[data-tab="battle"]').click();
  var fresh=bridge.getState();
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  assert(reduced===(ctx.scenario==='p2-06b-reduced-motion'),'requested motion preference');
  function seed(depth,mode){
    var s=JSON.parse(JSON.stringify(fresh));
    s.depth=depth;s.enemyDepth=depth;s.maxDepthEver=depth;
    s.enemyMaxHp=bridge.enemyHpFor(depth);s.enemyHp=0.0001;
    s.riftMode=mode||'push';s.farmDepth=depth;s.enemyIsLuminous=false;
    s.spirits.ember=10;s.activeParty=['ember'];
    if(mode==='farm'){s.maxDepthEver=depth+1;s.farmReturnDepth=depth+1;}
    bridge.setState(s);bridge.renderLayout();
  }
  function banner(){return document.querySelector('.rift-milestone');}
  var cases=[[10,'BOSS DEFEATED'],[25,'NEW REGION'],[2,'WISP AWAKENED'],[9,'BOSS RIFT'],[15,'ASCENSION READY']];
  cases.forEach(function(item){
    bridge.resetFeedback();seed(item[0]);
    var input=bridge.getState();
    var without=bridge.feedbackTick(false);
    bridge.setState(input);
    var withFeedback=bridge.feedbackTick(true);
    assert(JSON.stringify(withFeedback)===JSON.stringify(without),'feedback preserves exact committed state at '+item[0]);
    assert(withFeedback.depth===item[0]+1,'real live tick defeats intended enemy '+item[0]+' -> '+withFeedback.depth);
    assert(banner() && banner().textContent.includes(item[1]),'expected live feedback '+item[1]);
    assert(getComputedStyle(banner()).pointerEvents==='none','feedback cannot intercept combat input');
    if(reduced){
      assert(parseFloat(getComputedStyle(banner()).animationDuration)<=0.001,'banner respects reduced motion');
      assert(!document.querySelector('.vfx-boss-death'),'reduced motion omits boss burst');
    } else if(item[0]===10){
      assert(!!document.querySelector('.vfx-boss-death'),'committed boss defeat emits existing effect');
    }
  });
  bridge.resetFeedback();seed(2);bridge.feedbackTick(true);
  var first=banner();
  [5,9,10,25].forEach(function(depth){seed(depth);bridge.advanceTime(100);bridge.feedbackTick(true);});
  assert(banner()===first && document.querySelectorAll('.rift-milestone').length===1,'rapid ticks retain one banner without replacement spam');
  // No pending queue: after the cooldown an ordinary tick must not replay drops.
  bridge.advanceTime(2000);first.remove();seed(3);bridge.feedbackTick(true);
  assert(!banner(),'discarded milestones do not replay after cooldown');
  bridge.resetFeedback();seed(1);
  var rapid=bridge.getState();rapid.spirits.ember=1000000;bridge.setState(rapid);
  var rapidInput=bridge.getState(),rapidWithout=bridge.feedbackTick(false);
  bridge.setState(rapidInput);var rapidWith=bridge.feedbackTick(true);
  assert(JSON.stringify(rapidWithout)===JSON.stringify(rapidWith),'multi-kill tick state remains exact');
  assert(rapidWith.depth>30,'fixture crosses multiple qualifying events in one tick');
  assert(document.querySelectorAll('.rift-milestone').length===1,'multi-event tick selects one milestone');
  assert(document.querySelectorAll('.vfx-boss-death').length<2,'multi-boss tick emits at most one burst');
  bridge.resetFeedback();seed(2,'farm');
  var farmInput=bridge.getState(),farmWithout=bridge.feedbackTick(false);
  bridge.setState(farmInput);var farmWith=bridge.feedbackTick(true);
  assert(JSON.stringify(farmWithout)===JSON.stringify(farmWith),'Farm state/results unchanged');
  assert(farmWith.depth===2 && !banner(),'Farm kills do not announce Push unlocks');
  bridge.resetFeedback();seed(25);
  document.querySelector('[data-tab="spirits"]').click();bridge.feedbackTick(true);
  document.querySelector('[data-tab="battle"]').click();
  assert(!banner(),'off-tab progression has no delayed banner');
  seed(26);bridge.feedbackTick(true);assert(!banner(),'returning to Rift does not replay off-tab milestone');
  bridge.resetFeedback();seed(2);bridge.feedbackTick(true);
  ctx.setHidden(true);document.dispatchEvent(new Event('visibilitychange'));
  assert(!banner(),'hiding removes interrupted feedback');
  seed(25);var hiddenBefore=JSON.stringify(bridge.getState());bridge.feedbackTick(true);
  assert(JSON.stringify(bridge.getState())===hiddenBefore,'hidden tick remains suspended');
  var offline=bridge.simulate(1,'offline',1,Date.now());
  assert(offline.summary.kills>0 && !banner(),'offline progression commits without banners');
  ctx.setHidden(false); // Resume rendering cannot consume a nonexistent backlog.
  bridge.renderLayout();assert(!banner(),'offline history is not replayed on render');
  seed(26);bridge.feedbackTick(true);assert(!banner(),'next live tick does not replay offline milestone');
  bridge.feedbackSave();var saved=JSON.parse(bridge.rawSave());
  assert(!JSON.stringify(saved).includes('liveRiftFeedback'),'presentation cooldown is not persisted');
  bridge.setState(saved);bridge.renderLayout();assert(!banner(),'restored save does not recreate feedback');
  bridge.freeze();
  return {liveCases:cases.length,exactStateEquality:true,coalescing:true,noBacklog:true,reducedMotion:reduced};
};
