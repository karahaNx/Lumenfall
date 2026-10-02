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
  q('[data-tab="forge"]').click();
  press('[data-queue="focus"]',function(){return !!bridge.getState().researchQueue.focus;});
  q('[data-tab="research"]').click();
  var study=q('[data-study-queue]'), studyId=study.getAttribute('data-study-queue');
  press('[data-study-queue="'+studyId+'"]',function(){return !!bridge.getState().studyQueue[studyId];});
  q('[data-tab="forge"]').click();
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

  // Empower/Recruit keep the shortage in their accessible name, with a
  // single content line and the native disabled purchase gate intact.
  q('[data-tab="spirits"]').click();
  [1,95].forEach(function(level){
    ['ember','tide'].forEach(function(id){
      var compact=bridge.freshStateSnapshot();compact.maxDepthEver=101;
      compact.spirits[id]=id==='ember'?level:0;
      compact.nodes.bonds=id==='tide'&&level===95?20:0;
      bridge.setState(compact);var cost=bridge.formationTest.cost(id);
      compact.lumen=cost-1;bridge.setState(compact);bridge.renderLayout();
      var selector='[data-empower="'+id+'"]',button=q(selector);
      var snapshot=JSON.stringify(bridge.getState()),save=bridge.rawSave(),events=JSON.stringify(bridge.lifecycleTrace());
      button.click();
      assert(JSON.stringify(bridge.getState())===snapshot&&bridge.rawSave()===save&&JSON.stringify(bridge.lifecycleTrace())===events,'disabled Empower/Recruit cannot change state/save/events');
      bridge.renderLayout();bridge.refreshAffordability();
      assert(JSON.stringify(bridge.getState())===snapshot&&bridge.rawSave()===save&&JSON.stringify(bridge.lifecycleTrace())===events,'Empower presentation remains observer-only');
      [false,true].forEach(function(affordable){
        var next=bridge.getState();next.lumen=cost-(affordable?0:1);bridge.setState(next);bridge.refreshAffordability();button=q(selector);
        var label=button.querySelector('strong'),price=button.querySelector('.mono');
        var r=button.getBoundingClientRect(),a=label.getBoundingClientRect(),p=price.getBoundingClientRect(),style=getComputedStyle(button);
        assert(button.disabled===!affordable&&button.dataset.state===(affordable?'available':'unaffordable'),'Empower native affordability state');
        assert(!button.querySelector('.control-state')&&!/Need Lumen/.test(button.textContent),'no visible Empower shortage/status line');
        assert(label.textContent===(id==='ember'?'Empower':'Recruit'),'Empower/Recruit wording retained');
        var name=button.getAttribute('aria-label');
        assert(name.includes(label.textContent)&&name.includes(price.textContent.trim())&&name.includes(id==='ember'?'Ember Wisp':'Tide Sprite')&&name.includes('Lumen'),'Empower accessible identity/action/price/unit');
        assert(/Need Lumen/.test(name)===!affordable,'Empower accessible reason follows live affordability');
        // This synchronous runner freezes panelIn at scale(.995). Layout CSS
        // dimensions stay exact; the native mobile driver measures settled rects.
        assert(r.width>0&&r.height>0&&button.offsetWidth>=44&&button.offsetHeight>=44&&style.flexDirection==='row'&&style.flexWrap==='nowrap','Empower touch target and horizontal layout');
        assert(Math.min(a.bottom,p.bottom)>Math.max(a.top,p.top)&&a.right<=p.left,'Empower label and price share one line without overlap');
        assert(button.scrollWidth<=button.clientWidth,'Empower contents do not overflow');
      });
      var before=bridge.getState();button=q(selector);button.click();
      var bought=bridge.getState();
      assert(bought.spirits[id]===before.spirits[id]+1&&bought.lumen===0,'exact-price Empower/Recruit buys once and debits exact Lumen');
      button=q(selector);assert(button.disabled,'next Empower unaffordable after exact-price purchase');button.click();
      assert(JSON.stringify(bridge.getState())===JSON.stringify(bought),'disabled repeat cannot double purchase');
    });
  });
  bridge.setState(ctx.fixtures['accessibility-mixed-states'].save);bridge.renderLayout();

  // Selected controls need real contrast, not merely passing shell token contrast.
  function rgb(css){var c=document.createElement('canvas').getContext('2d');c.fillStyle=css;c.fillRect(0,0,1,1);return Array.from(c.getImageData(0,0,1,1).data).slice(0,3);}
  function luminance(rgb){var c=rgb.map(function(n){n/=255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  q('[data-tab="research"]').click();
  var contrastResults={};
  [['forge','.mult-btn.active'],['research','.speed-btn.active']].forEach(function(entry){
    q('[data-tab="'+entry[0]+'"]').click();
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
