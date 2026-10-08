/* LAB_UI_001 presentation checks against real rendering and handlers. */
window.checkLabSpeedDisclosure = function(b,assert,id){
  var q=function(selector){return document.querySelector(selector);};
  var opener=q('[data-study-details="'+id+'"]'),panel=q('[data-study-inspection="'+id+'"]');
  assert(panel.hidden&&opener.getAttribute('aria-expanded')==='false','speed panel starts collapsed');
  var before=JSON.stringify(b.getState()),save=b.rawSave(),recovery=b.rawRecovery();
  opener.focus();opener.click();b.renderLayout();
  panel=q('[data-study-inspection="'+id+'"]');
  assert(!panel.hidden&&q('[data-study-details="'+id+'"]').getAttribute('aria-expanded')==='true','disclosure remains open across rendering');
  assert(document.activeElement.dataset.studyDetails===id,'opening keeps disclosure focus and rendering preserves it');
  assert(panel.querySelectorAll('[data-speed-study]').length===8,'all paid tiers reachable');
  assert(panel.closest('.study-card').textContent.includes('On completion:'),'effect remains on the card');
  q('[data-study-speed-close="'+id+'"]').click();
  assert(q('[data-study-inspection="'+id+'"]').hidden&&document.activeElement.dataset.studyDetails===id,'close hides panel and returns focus');
  assert(JSON.stringify(b.getState())===before&&b.rawSave()===save&&b.rawRecovery()===recovery,'open/close/render do not pay, advance, or save');
};

window.runLabUiQa = function(b,ctx,assert){
  var checks=0,records=[],q=function(selector){return document.querySelector(selector);};
  function ok(value,message){checks++;assert(value,'LAB_UI_001: '+message);}
  function close(){var button=document.querySelector('.study-speed-panel:not([hidden]) [data-study-speed-close]');if(button)button.click();}
  function seed(){var s=window.labMotesSeed(b,ctx);s.motes=1000;s.studyUseMotes.guardmastery=false;s.activeStudies=[{id:'guardmastery',remainingSec:150,totalDurationSec:150,speedMult:1}];return s;}
  function install(s){b.setState(s);b.renderLayout();q('[data-tab="research"]').click();}
  function fit(){
    ok(document.documentElement.scrollWidth<=innerWidth+1&&q('#study-list').scrollWidth<=q('#study-list').clientWidth+1,'no horizontal overflow');
    Array.from(q('#study-list').querySelectorAll('button,select')).filter(function(el){return el.getClientRects().length;}).forEach(function(el){
      ok(el.offsetWidth>=44&&el.offsetHeight>=44,'controls have 44px layout targets: '+el.outerHTML.slice(0,180));
    });
  }
  function luminance(css){return css.match(/[\d.]+/g).slice(0,3).map(function(v){v=Number(v)/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce(function(sum,v,i){return sum+v*[.2126,.7152,.0722][i];},0);}
  close();install(seed());
  var card=q('[data-running-study="guardmastery"]');
  ok(card.innerText.split("Guardian's Mastery").length===2,'one visible title');
  ok((card.innerText.match(/Lv\./g)||[]).length===1&&!/Completed level|In progress: level|Details/.test(card.innerText),'one current level and no repeated status');
  ok(card.innerText.includes('Earned: +0%')&&card.innerText.includes('On completion: +20% tap damage'),'earned and completion effects distinct');
  ok(!card.querySelector('details')&&card.querySelectorAll('[data-study-details]').length===1,'one Speed up button without fold title');
  ok(!q('.study-speed-panel:not([hidden])'),'tier panels hidden initially');
  Array.from(document.querySelectorAll('.study-speed-panel button,.study-speed-panel select')).forEach(function(el){ok(!el.getClientRects().length,'hidden panel controls not rendered/focusable');});
  window.checkLabSpeedDisclosure(b,ok,'guardmastery');

  [0,50,99.999,100].forEach(function(percent){
    var s=seed();s.activeStudies[0].remainingSec=150*(1-percent/100);s.activeStudies[0].speedMult=8;install(s);
    var bar=q('[data-running-study="guardmastery"] [role="progressbar"]'),text=q('[data-study-text="guardmastery"]');
    ok(bar&&bar.contains(text),'time and speed are inside progressbar');
    ok(bar.getAttribute('aria-valuemin')==='0'&&bar.getAttribute('aria-valuemax')==='100'&&Number(bar.getAttribute('aria-valuenow'))===Math.round(percent),'progress ARIA range/value');
    ok(bar.getAttribute('aria-label').includes("Guardian's Mastery")&&bar.getAttribute('aria-valuetext').includes(text.textContent)&&text.textContent.includes('8x'),'named progress with time and speed');
    var tr=text.getBoundingClientRect(),br=bar.getBoundingClientRect(),style=getComputedStyle(text);
    ok(tr.left>=br.left&&tr.right<=br.right&&tr.top>=br.top&&tr.bottom<=br.bottom,'progress text fits its bar');
    var contrast=(Math.max(luminance(style.color),luminance(style.backgroundColor))+.05)/(Math.min(luminance(style.color),luminance(style.backgroundColor))+.05);
    ok(contrast>=4.5&&style.backgroundColor!=='rgba(0, 0, 0, 0)','opaque text background maintains contrast independent of fill');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)ok(getComputedStyle(q('[data-study-bar="guardmastery"]')).transitionDuration==='0s','reduced motion removes progress transition');
    var before=JSON.stringify(b.getState()),save=b.rawSave();b.studyPresentation.update();
    ok(before===JSON.stringify(b.getState())&&save===b.rawSave(),'progress never completes work or writes save');
    fit();records.push({percent:percent,contrast:contrast,text:text.textContent});
  });
  var long=seed();long.activeStudies[0].remainingSec=8640009;long.activeStudies[0].totalDurationSec=9000000;install(long);fit();
  ok(q('[data-study-text="guardmastery"]').textContent.includes('100d'),'long duration remains readable');

  install(seed());q('[data-study-details="guardmastery"]').click();
  var select=q('[data-study-speed-target="guardmastery"]');select.value='3';select.dispatchEvent(new Event('change',{bubbles:true}));
  var saved=b.getState();ok(saved.studySpeedTargets.guardmastery===3&&saved.motes===1000&&saved.activeStudies[0].speedMult===1,'selection alone never buys');
  var buy=q('[data-speed-study="guardmastery"][data-speed="3"]');buy.focus();b.renderLayout();
  ok(document.activeElement.dataset.speed==='3'&&document.activeElement.dataset.speedStudy==='guardmastery','unrelated rendering preserves an available purchase focus');
  q('[data-speed-study="guardmastery"][data-speed="3"]').click();
  var paid=b.getState();ok(paid.motes===940&&paid.activeStudies[0].speedMult===3,'real button charges exactly 60 Motes');
  ok(document.activeElement.dataset.studyDetails==='guardmastery','purchase returns usable focus to same Study opener');
  ok(!q('[data-study-inspection="guardmastery"]').hidden&&q('[data-speed-study="guardmastery"][data-speed="3"]').getAttribute('aria-pressed')==='true','panel remains open and marks current speed');
  q('[data-study-speed-close="guardmastery"]').focus();q('[data-study-speed-close="guardmastery"]').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok(document.activeElement.dataset.studyDetails==='guardmastery'&&q('[data-study-inspection="guardmastery"]').hidden,'Escape from panel returns focus');

  q('[data-study-details="guardmastery"]').click();
  q('[data-study-details="wispascend"]').click();
  ok(q('[data-study-inspection="guardmastery"]').hidden&&!q('[data-study-inspection="wispascend"]').hidden,'one open panel across active and idle cards');
  ok(!q('[data-study-inspection="wispascend"] [data-speed-study]'),'idle panel cannot purchase a nonexistent level');
  close();
  var finish=seed();finish.activeStudies[0].remainingSec=.1;install(finish);q('[data-study-details="guardmastery"]').click();
  q('[data-speed-study="guardmastery"][data-speed="2"]').focus();b.inquiry.tail(.1);b.renderLayout();
  ok(!b.getState().activeStudies.length&&document.activeElement.dataset.studyDetails==='guardmastery','completion leaves focus on the same Study opener');
  ok(!q('[data-study-inspection="guardmastery"] [data-speed-study]'),'completed record cannot be bought again');
  close();install(seed());fit();
  return {checks:checks,progress:records};
};
