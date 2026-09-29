/* P1-04 only. Injected by the existing behavioral harness, never shipped. */
window.runRiftLayoutQa = async function(bridge, ctx, assert){
  var q = function(s){ return document.querySelector(s); };
  var rect = function(s){ return q(s).getBoundingClientRect(); };
  var params = new URLSearchParams(location.search);
  assert(innerWidth===Number(params.get('width')) && innerHeight===Number(params.get('height')), 'exact CSS viewport');
  document.documentElement.style.setProperty('--safe-top',params.get('safeTop')+'px');
  document.documentElement.style.setProperty('--safe-bottom',params.get('safeBottom')+'px');
  // Isolate the settled Rift, not startup/tutorial presentation or cosmetic motion.
  document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){ el.style.display='none'; });
  var style=document.createElement('style');
  style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;}';
  document.head.appendChild(style);
  bridge.renderLayout();
  await document.fonts.ready;
  var initial = bridge.getState(), hudHeight = rect('.hud').height;
  var visible = function(selector){
    var r=rect(selector), el=q(selector);
    assert(r.width>0 && r.height>0 && r.top>=0 && r.bottom<=innerHeight+1 && r.left>=0 && r.right<=innerWidth+1, selector+' within viewport');
    assert(getComputedStyle(el).visibility!=='hidden' && getComputedStyle(el).display!=='none',selector+' visible');
    return r;
  };
  var minimum=Infinity;
  function check(mode){
    assert(q('main').classList.contains('rift-scroll-locked'),'Rift scroll lock class');
    assert(getComputedStyle(q('main')).overflowY==='hidden','Rift overflow locked');
    assert(getComputedStyle(q('#tab-battle')).touchAction==='pan-x','Rift touch pan remains locked');
    assert(document.documentElement.scrollHeight<=innerHeight+1 && document.body.scrollHeight<=innerHeight+1,'no document vertical overflow');
    assert(q('main').scrollHeight<=q('main').clientHeight+1,'no clipped/overflowing Rift content');
    assert(Math.abs(rect('.hud').height-hudHeight)<1,'stable HUD height');
    var chips=Array.from(document.querySelectorAll('.hud .chip'));
    assert(new Set(chips.map(function(el){return Math.round(el.getBoundingClientRect().top);})).size===2,'exactly two currency rows');
    assert(q('#hp-text').scrollWidth<=q('#hp-text').clientWidth,'HP text fits without clipping');
    var enemy=visible('#enemy-stage');
    assert(document.elementFromPoint(enemy.x+enemy.width/2,enemy.y+enemy.height/2).closest('#enemy-stage'),'Guardian Tap is not covered');
    minimum=Math.min(minimum,enemy.height);
    assert(enemy.height>=120,'Guardian Tap region at least 120px; got '+enemy.height);
    ['#hp-text','#enemy-name','#depth-label','#rift-objective','.objective-copy strong','.objective-copy small'].forEach(function(s){
      visible(s);assert(parseFloat(getComputedStyle(q(s)).fontSize)>=10,s+' legible size');
    });
    ['#rift-push-btn','#rift-farm-btn','#rift-study-status','#rift-details-btn','#settings-btn'].forEach(function(s){
      var r=visible(s);assert(r.height>=44 && r.width>=44,s+' 44px touch target');
    });
    var studyStatus=rect('#rift-study-status'),details=rect('#rift-details-btn'),depth=rect('#depth-label');
    assert(depth.right<=studyStatus.left+1 && studyStatus.right<=details.left+1,'Rift heading controls do not overlap');
    assert(/Studies \d+\/\d+/.test(q('#rift-study-status').textContent),'Rift Study occupancy remains visible');
    var tabs=Array.from(document.querySelectorAll('nav.tabbar button'));
    assert(tabs.length===6,'six visible main destinations');
    tabs.forEach(function(el,index){
      var r=visible('[data-tab="'+el.dataset.tab+'"]');
      assert(r.height>=44 && r.width>=44,'navigation 44px touch target');
      if(index) assert(tabs[index-1].getBoundingClientRect().right<=r.left+1,'navigation does not overlap');
      assert(el.querySelector('.lb').scrollWidth<=el.clientWidth,'navigation text is not clipped');
    });
    var nav=visible('nav.tabbar');
    assert(rect('.stage').bottom<=nav.top+1,'stage clear of navigation');
    q('main').scrollTop=100;window.scrollTo(0,100);
    assert(q('main').scrollTop===0 && scrollY===0,'programmatic vertical drift blocked');
    bridge.toast('First notification');bridge.toast('Save data needs recovery — Reset or restore a valid backup before progress can be saved.');
    var toast=visible('#toast');
    assert(toast.bottom<=nav.top-4,'toast clear of navigation and safe area');
    assert(toast.top>=rect('.hp-wrap').bottom,'toast clear of HP and Guardian Tap');
    assert(document.querySelectorAll('.toast.show').length===1,'notifications coalesce into one toast');
    assert(q('#rift-'+mode+'-btn').classList.contains('active'),mode+' selected');
  }
  if(ctx.scenario==='self-test-layout-collapse') q('#enemy-stage').style.cssText='min-height:0!important;flex:0!important;height:0!important;';
  check('push');
  // Large raw/localized display text must not add HUD rows, even beyond normal formatNum output.
  document.querySelectorAll('.hud .val').forEach(function(el){el.textContent='123.456.789.012.345.678,90';});
  check('push');
  bridge.renderLayout();
  if(ctx.scenario!=='layout-fresh'){
    assert(initial.activeParty.length===5,'full Active party fixture');
    assert(initial.buffUntil>Date.now(),'active buff fixture');
    assert(q('#bond-summary').textContent.indexOf('Active Bonds:')===0,'active Formation Bonds');
    if(ctx.scenario==='layout-boss') assert(q('#enemy-glyph').classList.contains('boss'),'boss fixture');
    q('#rift-farm-btn').click();check('farm');
    q('#rift-push-btn').click();check('push');
    assert(bridge.getState().depth===initial.depth,'Push depth restored after Farm');
  } else assert(q('#rift-farm-btn').disabled,'fresh Farm remains unavailable');
  q('#rift-details-btn').focus();q('#rift-details-btn').click();
  assert(q('#rift-details').open,'details opens');
  visible('#rift-details-close');
  assert(q('#rift-hp-detail').textContent.indexOf('HP: ')===0,'exact HP remains inspectable');
  assert(q('#rift-mode-note').textContent.length>0 && q('#rift-objective-detail').textContent.length>0,'mode/objective detail retained');
  assert(document.querySelectorAll('#rift-resources dd').length===6,'all exact resource amounts inspectable');
  assert(document.querySelectorAll('#party-col .hero-chip').length===initial.activeParty.length,'full party inspectable');
  assert(parseFloat(getComputedStyle(q('#rift-details .chip-label')).fontSize)>=10,'party label readable');
  var scroller=q('.rift-details-scroll');scroller.scrollTop=10000;
  assert(scroller.scrollHeight<=scroller.clientHeight || scroller.scrollTop>0,'secondary details scroll independently');
  assert(scrollY===0 && q('main').scrollTop===0,'details cannot scroll Rift');
  q('#rift-details-close').click();assert(!q('#rift-details').open,'details closes');
  assert(document.activeElement===q('#rift-details-btn'),'details returns focus');
  // Actual generated purchase markup: shared inline icons stay proportional in both Lab and Ascend.
  ['spirits','ascend'].forEach(function(tab){
    q('[data-tab="'+tab+'"]').click();
    // Inspect disclosed progression before measuring its actual purchase icons.
    document.querySelectorAll('#tab-'+tab+' .wisp-progression').forEach(function(el){el.open=true;});
    var icons=Array.from(document.querySelectorAll('#tab-'+tab+' .cost-icon'));
    assert(icons.length>0,tab+' cost icons exist');
    icons.forEach(function(el){var r=el.getBoundingClientRect();assert(r.width>0 && r.width<=16 && r.height<=16,tab+' nested icon sizing');});
  });
  ['forge','research'].forEach(function(view){
    q('[data-tab="'+view+'"]').click();
    if(view==='research'){
      var slots=visible('.study-slot-summary');
      assert(slots.top>=0 && slots.bottom<rect('nav.tabbar').top,'Study slot status is visible on Lab arrival');
      var choose=q('[data-study-choose]');
      if(choose) assert(choose.getBoundingClientRect().height>=44,'Study choice shortcut has a practical target');
      assert(q('#study-list').scrollWidth<=q('#study-list').clientWidth+1,'Lab Study content does not overflow horizontally');
      document.querySelectorAll('.study-inspection>summary').forEach(function(el){assert(el.getBoundingClientRect().height>=44,'Study inspection has a practical target');});
    }
    document.querySelectorAll('#tab-'+view+' .study-inspection').forEach(function(el){el.open=true;});
    var icons=Array.from(document.querySelectorAll('#tab-'+view+' .cost-icon'));
    assert(icons.length>0,'research '+view+' cost icons exist');
    icons.forEach(function(el){var r=el.getBoundingClientRect();assert(r.width>0 && r.width<=16 && r.height<=16,'research '+view+' nested icon sizing');});
    assert(!q('main').classList.contains('rift-scroll-locked') && getComputedStyle(q('main')).overflowY==='auto',view+' main scroll enabled');
    var last=Array.from(document.querySelectorAll('#tab-'+view+' button:not(:disabled),#tab-'+view+' summary')).pop();
    assert(last,view+' final usable control exists');
    last.scrollIntoView({block:'center',behavior:'instant'});
    var end=last.getBoundingClientRect(),main=rect('main');
    assert(end.top>=main.top && end.bottom<=main.bottom,view+' final control scrolls into main viewport');
    assert(last.contains(document.elementFromPoint(end.left+end.width/2,end.top+end.height/2)),view+' final control hit test');
  });
  q('[data-tab="battle"]').click();check('push');
  // P2-06A: exercise real render paths for all regions, three boss traits and
  // deeper echoes at each supported viewport, including fresh and dense saves.
  var landmarks=['verge','canopy','glass','observatory','basilica','crown'];
  var regionBackgrounds=new Set(), bossColors=new Set();
  var presentationDepths=[1,26,51,76,101,126,151,326,1229,10,20,30,60,80,110,130];
  presentationDepths.forEach(function(depth){
    var sample=JSON.parse(JSON.stringify(initial));
    sample.depth=depth;sample.enemyDepth=depth;
    sample.enemyMaxHp=bridge.enemyHpFor(depth);sample.enemyHp=sample.enemyMaxHp;
    sample.enemyIsLuminous=false;sample.riftMode='push';
    bridge.setState(sample);
    var before=JSON.stringify(bridge.getState());
    bridge.renderLayout();
    assert(JSON.stringify(bridge.getState())===before,'presentation render must not mutate gameplay at Rift '+depth);
    check('push');
    var theme=Math.floor((depth-1)/25)%6;
    var shown=Array.from(document.querySelectorAll('.region-landmark')).filter(function(el){return getComputedStyle(el).display!=='none';});
    assert(shown.length===1 && shown[0].classList.contains('region-'+landmarks[theme]),'exactly the current region landmark is displayed');
    assert(q('.rift-landscape').getAttribute('aria-hidden')==='true' && getComputedStyle(q('.rift-landscape')).pointerEvents==='none','scenery stays decorative and cannot intercept input');
    if(depth<=126 && depth%10!==0) regionBackgrounds.add(getComputedStyle(q('#tab-battle .stage')).backgroundImage);
    var boss=depth%10===0;
    assert((getComputedStyle(q('.boss-regalia')).display!=='none')===boss,'boss regalia appears only during a boss encounter');
    if(boss){
      var trait=['regrowth','fractured','guardian'][(depth/10-1)%3];
      var crests=Array.from(document.querySelectorAll('.boss-crest')).filter(function(el){return getComputedStyle(el).display!=='none';});
      assert(crests.length===1 && crests[0].classList.contains('boss-crest-'+trait),'boss silhouette matches its authoritative trait');
      bossColors.add(getComputedStyle(q('#enemy-glyph')).getPropertyValue('--creature-color').trim());
      assert(q('.boss-regalia').getAttribute('aria-hidden')==='true','boss artwork remains decorative');
    }
  });
  assert(regionBackgrounds.size===6,'six region backgrounds must remain visually distinct');
  assert(bossColors.size===3,'boss traits retain distinct palettes');
  bridge.setState(initial);bridge.renderLayout();
  return {viewport:[innerWidth,innerHeight],safeInsets:[params.get('safeTop'),params.get('safeBottom')],minimumEnemyHeight:minimum,hudHeight:hudHeight,party:initial.activeParty.length,presentationStates:presentationDepths.length};
};
