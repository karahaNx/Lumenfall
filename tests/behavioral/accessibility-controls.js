/* P1-05 implementation regressions, supplementary to 04's unchanged strict contract. */
window.runP105ControlQa = function(bridge,ctx,assert){
  var q=function(s){return document.querySelector(s);};
  var original=bridge.getState();
  document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});
  bridge.setState(ctx.fixtures['accessibility-mixed-states'].save);bridge.renderLayout();
  function press(selector,expected){
    var el=q(selector);el.focus();el.click();
    assert(q(selector).getAttribute('aria-pressed')===String(expected()),selector+' actual state matches aria-pressed');
    assert(document.activeElement===q(selector),selector+' retains focus through render');
    bridge.renderLayout();
    assert(document.activeElement===q(selector),selector+' retains focus through live refresh');
  }
  q('[data-tab="spirits"]').click();
  press('[data-empower-queue="ember"]',function(){return bridge.getState().empowerQueue.ember!==false;});
  q('[data-tab="research"]').click();
  press('[data-queue="focus"]',function(){return !!bridge.getState().researchQueue.focus;});
  bridge.setLabView('studies',false);
  var study=q('[data-study-queue]'), studyId=study.getAttribute('data-study-queue');
  press('[data-study-queue="'+studyId+'"]',function(){return !!bridge.getState().studyQueue[studyId];});
  bridge.setLabView('permanent',false);
  press('[data-mult="5"]',function(){return true;});
  q('[data-tab="deeds"]').click();
  press('[data-autoascend-toggle]',function(){return !!bridge.getState().autoAscendEnabled;});

  var poor=bridge.getState();poor.lumen=0;poor.shards=0;bridge.setState(poor);bridge.renderLayout();
  var purchase=q('[data-research="focus"]');
  assert(purchase.disabled && purchase.dataset.state==='unaffordable' && /Need/.test(purchase.textContent),'visible resource shortage');
  var rich=bridge.getState();rich.lumen=1e100;rich.shards=1e100;bridge.setState(rich);bridge.refreshAffordability();
  assert(!purchase.disabled && purchase.dataset.state==='available' && !/Need/.test(purchase.textContent),'live affordability clears stale reason');
  bridge.setState(poor);bridge.refreshAffordability();
  assert(purchase.disabled && purchase.dataset.state==='unaffordable','live affordability restores shortage state');

  // Selected controls need real contrast, not merely passing shell token contrast.
  function rgb(css){var c=document.createElement('canvas').getContext('2d');c.fillStyle=css;c.fillRect(0,0,1,1);return Array.from(c.getImageData(0,0,1,1).data).slice(0,3);}
  function luminance(rgb){var c=rgb.map(function(n){n/=255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  q('[data-tab="research"]').click();
  var contrastResults={};
  [['permanent','.mult-btn.active'],['studies','.speed-btn.active']].forEach(function(entry){
    bridge.setLabView(entry[0],false);
    var selector=entry[1];
    var el=q(selector);assert(el,selector+' fixture exists');var style=getComputedStyle(el);
    var a=luminance(rgb(style.color)),b=luminance(rgb(style.backgroundColor));
    var ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);contrastResults[selector]=ratio;
    assert(ratio>=4.5,selector+' selected text contrast at least 4.5:1');
  });
  document.querySelectorAll('[data-speed-study]').forEach(function(el){
    var active=bridge.getState().activeStudies.find(function(s){return s.id===el.dataset.speedStudy;});
    assert(el.getAttribute('aria-pressed')===String(Number(el.dataset.speed)===active.speedMult),'only current speed selected');
    if(Number(el.dataset.speed)<=active.speedMult) assert(el.disabled,'acquired speed cannot be bought again');
  });

  var completed=bridge.getState();completed.activeStudies=[];bridge.setState(completed);bridge.refreshAffordability();
  document.querySelectorAll('[data-speed-study]').forEach(function(el){assert(el.disabled && el.dataset.state==='completed','completed Study cannot leave stale speed controls actionable');});
  bridge.renderLayout();

  q('#settings-btn').focus();q('#settings-btn').click();
  var close=q('#settings-close'), reset=q('#reset-btn');
  close.focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true}));
  assert(document.activeElement===reset,'reverse Tab wraps inside Settings');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));
  assert(document.activeElement===close,'forward Tab wraps inside Settings');
  q('#save-backup-btn').click();assert(document.activeElement===q('#settings-back'),'subview focuses Back');
  q('#settings-back').click();q('#howtoplay-btn').click();
  assert(q('#tutorial-overlay').contains(document.activeElement),'tutorial receives focus');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert(q('#tutorial-overlay').style.display==='none' && document.activeElement===q('#settings-btn'),'tutorial Escape returns to opener');
  assert(!q('.shell').inert,'closing modal releases background');

  q('[data-tab="battle"]').click();
  var taps=bridge.getState().totalTaps;q('#enemy-stage').click();
  q('#enemy-stage').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
  assert(bridge.getState().totalTaps===taps,'untrusted Guardian events cannot deal damage');
  bridge.setState(original);bridge.renderLayout();
  return {selectedContrast:contrastResults,liveStates:true,focus:true,untrustedTapGuard:true};
};
