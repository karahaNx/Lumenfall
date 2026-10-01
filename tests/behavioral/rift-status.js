/* Presentation observers only; injected by the behavioral harness. */
window.riftStatusSeed=function(b,ctx){
  var s=b.freshStateSnapshot();s.maxDepthEver=101;s.depth=101;s.enemyDepth=101;
  s.enemyMaxHp=b.enemyHpFor(101);s.enemyHp=s.enemyMaxHp;s.questDay=ctx.currentDay();s.loginStreak=1;
  s.lumen=0;s.shards=0;return s;
};
window.riftStatusWorst=function(b,ctx){
  // Enumerate the existing legal five-member formations, rather than imposing
  // a new production Bond limit or assuming the default preset is the longest.
  var bonds=b.riftStatus.bonds(),ids=[...new Set(bonds.flatMap(x=>x.ids))],best={text:'',ids:[],bonds:[]};
  function choose(at,party){
    if(party.length===5){
      var active=bonds.filter(x=>x.ids.every(id=>party.includes(id)));
      var text='Active Bonds: '+active.map(x=>x.name.replace(' Bond','')).join(' · ');
      if(text.length>best.text.length)best={text,ids:party.slice(),bonds:active};return;
    }
    for(var i=at;i<ids.length;i++)choose(i+1,party.concat(ids[i]));
  }
  choose(0,[]);return best;
};
window.runRiftStatusQa=async function(b,ctx,assert){
  var checks=0,q=s=>document.querySelector(s),copy=s=>JSON.parse(JSON.stringify(s));
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(){return window.riftStatusSeed(b,ctx);}
  function install(s){b.setState(s);b.renderLayout();}
  function badge(){
    var free=Math.max(0,b.riftStatus.slots()-b.getState().activeStudies.length),el=q('#lab-capacity-badge');
    ok(el.hidden===(free===0)&&el.textContent===String(free),'Lab capacity badge matches committed free slots');
    ok(q('[data-tab="research"]').getAttribute('aria-label')==='Lab — '+free+' Study slot'+(free===1?'':'s')+' available','Lab capacity has an accessible count');
    ok(el.tabIndex<0 && el.getAttribute('aria-hidden')==='true','badge adds no control/tabstop');return free;
  }
  b.resetFeedback();await window.__qaForgeStartup.promise;install(seed());
  var negative=ctx.scenario.startsWith('self-test-rift-status-')?ctx.scenario.split('-').pop():'';
  var undo=negative&&negative!=='buff'?b.riftStatus.mutate(negative):null;
  try{
    ok(!q('#rift-study-status,.rift-study-btn'),'Rift Study DOM/control removed entirely');
    [1,15,40,60,90].forEach(depth=>{
      var s=seed();s.maxDepthEver=depth;s.depth=depth;s.enemyDepth=depth;s.enemyMaxHp=b.enemyHpFor(depth);s.enemyHp=s.enemyMaxHp;install(s);
      var slots=b.riftStatus.slots(),projects=b.riftStatus.projects().filter(x=>x.unlock<=depth);
      ok(slots<=projects.length,'only unlocked capacity counts');
      for(var n=0;n<=slots;n++){
        s.activeStudies=projects.slice(0,n).map(x=>({id:x.id,totalDurationSec:200,remainingSec:100,speedMult:1}));install(s);
        ok(badge()===slots-n,'empty/one/multiple/full capacity');
        var before=b.getState();q('[data-tab="research"]').focus();q('[data-tab="research"]').click();badge();
        ok(q('#tab-research').classList.contains('active'),'badge/button opens Lab directly');same(b.getState(),before,'Lab opening cannot dismiss capacity or mutate state');
        ok(!!q('[data-study-choose]')===(n<slots),'Choose Study follows same slot state');
        q('[data-tab="battle"]').click();badge();
      }
    });
    var s=seed();s.maxDepthEver=1;s.depth=1;s.enemyDepth=1;s.enemyMaxHp=b.enemyHpFor(1);s.enemyHp=s.enemyMaxHp;s.lumen=1e8;s.shards=1e8;install(s);
    q('[data-tab="research"]').click();var free=badge();q('[data-study="guardmastery"]').click();ok(badge()===free-1,'real start consumes capacity');
    s=b.getState();s.activeStudies[0].remainingSec=.05;install(s);b.feedbackTick(false);ok(badge()===free,'authoritative completion frees slot');
    s=seed();s.maxDepthEver=1;s.depth=1;s.enemyDepth=1;s.enemyMaxHp=b.enemyHpFor(1);s.enemyHp=s.enemyMaxHp;s.lumen=1e9;s.shards=1e9;
    install(s);var capacity=b.riftStatus.slots();s.activeStudies=b.riftStatus.projects().filter(x=>x.unlock<=1).slice(0,capacity).map(x=>({id:x.id,totalDurationSec:200,remainingSec:100,speedMult:1}));s.activeStudies[0].remainingSec=.05;s.studyQueue.wispascend=true;install(s);b.feedbackTick(false);
    ok(badge()===0&&b.getState().activeStudies.some(x=>x.id==='wispascend'),'queue autostart refills before badge render');
    s=seed();s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:.05,speedMult:1}];install(s);b.feedbackSave();b.dispatchVisibility(true);b.advanceTime(5000);b.dispatchVisibility(false);
    ok(b.getState().longStudyLevels.guardmastery===1,'resume commits actual Study completion');badge();
    s=seed();s.buffUntil=b.clockNow()+1500;s.buffMult=1.5;install(s);
    ok(!q('#rift-details') && !q('#rift-details-btn') && q('#tab-battle #buff-indicator'),'boost is directly on Rift');
    ok(q('#buff-indicator').textContent.includes('passive Wisps + Tap')&&q('#buff-indicator').textContent.includes('+50%'),'boost scope and multiplier');
    b.advanceTime(500);b.riftStatus.update();ok(q('#buff-indicator').textContent.includes('1s'),'direct Rift countdown updates');
    if(negative==='buff')undo=b.riftStatus.mutate('buff');
    b.advanceTime(1000);b.riftStatus.update();ok(q('#buff-indicator').textContent.includes('Inactive')&&!q('#buff-indicator').textContent.includes('+50%'),'direct Rift buff expiry is neutral');
    s=seed();install(s);ok(q('#bond-summary').textContent==='No Formation Bond active.','neutral Bonds');
    var worst=window.riftStatusWorst(b,ctx);s.activeParty=worst.ids;s.activeParty.forEach(id=>s.spirits[id]=1);install(s);
    var active=b.riftStatus.active();ok(active.length===worst.bonds.length&&q('#bond-summary').textContent===worst.text,'every actual powered Bond name visible');
    active.forEach(x=>{var row=[...document.querySelectorAll('#bond-card .bond-row')].find(row=>row.querySelector('.bond-name').textContent.includes(x.name));ok(row && row.classList.contains('active') && row.querySelector('.bond-req').textContent===x.req && row.querySelector('.bond-effect').textContent===x.effect,'existing Formation retains active Bond requirements and full effects');});
    s.spirits[worst.bonds[0].ids[0]]=0;install(s);
    ok(!b.riftStatus.active().some(x=>x.id===worst.bonds[0].id)&&!q('#bond-summary').textContent.includes(worst.bonds[0].name.replace(' Bond','')),'unpowered members cannot show an active Bond');
    var remaining=b.riftStatus.active();
    ok(remaining.length===1 && q('#bond-summary').textContent==='Active Bonds: '+remaining[0].name.replace(' Bond',''),'one remaining powered Bond stays visible');
    s=seed();s.activeParty=worst.ids;s.activeParty.forEach(id=>s.spirits[id]=2);install(s);b.ascendManual();b.renderLayout();
    ok(!!b.getState().formationRebuild && !b.riftStatus.active().length,'pending intent is not active Bonds');
    ok(q('#bond-summary').textContent==='No Formation Bond active.','Ascension neutral actual Formation');
    var rebuilt=b.getState();rebuilt.lumen=1e20;b.setState(rebuilt);
    worst.ids.forEach(id=>{if(!b.getState().spirits[id])b.formationTest.buy(id);});b.renderLayout();
    ok(!b.getState().formationRebuild&&q('#bond-summary').textContent===worst.text,'legitimate reconstruction restores actual Bonds');
    // Formation observers use committed levels/resources and the actual charge upgrade.
    s=seed();s.activeParty=worst.ids;s.activeParty.forEach((id,i)=>{s.spirits[id]=2;s.heroResource[id]=i*20;});install(s);
    function partyCheck(){
      var state=b.getState(),cards=[...document.querySelectorAll('[data-rift-wisp]')];
      same(cards.map(x=>x.dataset.riftWisp).sort(),state.activeParty.slice().sort(),'portraits show exactly the active formation members');
      cards.forEach(card=>{
        var id=card.dataset.riftWisp,powered=state.spirits[id]>0,value=powered?state.heroResource[id]:0,bar=card.querySelector('[role="progressbar"]');
        ok(Number(bar.getAttribute('aria-valuenow'))===Math.round(value),'bar reads real ability resource');
        ok(parseFloat(bar.firstElementChild.style.width)===value,'visible bar matches accessible charge');
        ok(card.querySelector('.rift-wisp-time').textContent===(powered?Math.ceil((1-value/100)*b.riftStatus.visualMetrics().cycle)+'s':'Lv 0'),'countdown uses actual charge speed and powered status');
      });
      var active=b.riftStatus.active();same([...document.querySelectorAll('[data-bond-effect]')].map(x=>x.querySelector('.rift-bond-copy').textContent),active.map(x=>x.effect),'Rift shows exact complete active Bond effects');
      ok(q('#rift-bond-effects').hidden===!active.length,'no stale effects when no Bond is active');
    }
    // Deliberately interleave both pairs with the fifth Wisp in the middle.
    s.activeParty=['ember','tide','stone','void','aurora'];install(s);partyCheck();
    var savedParty=b.getState().activeParty.slice();
    function installBond(){b.setState(s);savedParty=b.getState().activeParty.slice();b.renderLayout();}
    var seenVisuals={};
    function bondPresentation(){
      var cards=[...document.querySelectorAll('[data-rift-wisp]')],active=b.riftStatus.active(),colors=[],marks=[];
      active.forEach(bond=>{
        var pair=cards.filter(x=>bond.ids.includes(x.dataset.riftWisp)),effect=q('[data-bond-effect="'+bond.id+'"]');
        ok(pair.length===2&&Math.abs(cards.indexOf(pair[0])-cards.indexOf(pair[1]))===1,'Bond partners are adjacent even when save order is interleaved');
        var color=effect.style.getPropertyValue('--bond-color'),mark=effect.querySelector('.rift-bond-mark').textContent;
        pair.forEach(card=>ok(card.dataset.bond===bond.id&&card.style.getPropertyValue('--bond-color')===color&&card.querySelector('.rift-bond-mark').textContent===mark&&card.getAttribute('aria-label').includes(bond.name),'paired Wisps match bonus color, shape and accessible Bond name'));
        colors.push(color);marks.push(mark);seenVisuals[bond.id]={color,mark};
      });
      ok(new Set(colors).size===active.length&&new Set(marks).size===active.length,'simultaneous Bonds have distinct colors and shapes');
      cards.filter(x=>!active.some(bond=>bond.ids.includes(x.dataset.riftWisp))).forEach(card=>ok(!card.dataset.bond&&!card.querySelector('.rift-bond-mark'),'unpaired and unpowered Wisps have no stale Bond marking'));
      same(b.getState().activeParty,savedParty,'visual grouping never changes stored formation order');
    }
    bondPresentation();s.spirits.void=0;installBond();bondPresentation();s.spirits.void=2;installBond();bondPresentation();
    s.activeParty=['stone','gale','ember','titan','thorn'];s.activeParty.forEach(id=>s.spirits[id]=1);installBond();partyCheck();bondPresentation();
    ok(Object.keys(seenVisuals).length===4&&new Set(Object.values(seenVisuals).map(x=>x.color)).size===4&&new Set(Object.values(seenVisuals).map(x=>x.mark)).size===4,'all four Bonds keep their own unique color and shape');
    s.activeParty=worst.ids;s.activeParty.forEach(id=>s.spirits[id]=2);install(s);
    partyCheck();s.research.charge=10;install(s);partyCheck();
    s.spirits[s.activeParty[0]]=0;install(s);partyCheck();
    s.activeParty=s.activeParty.slice(1).reverse();install(s);partyCheck();
    s=seed();install(s);partyCheck();ok(q('#boss-combat').hidden,'regen hidden for ordinary enemies');
    s.depth=110;s.enemyDepth=110;s.enemyMaxHp=b.enemyHpFor(110);s.enemyHp=s.enemyMaxHp;install(s);
    var metrics=b.riftStatus.visualMetrics(),boss=q('#boss-combat');
    ok(!boss.hidden&&Number(boss.dataset.regen)===metrics.regen&&Number(boss.dataset.dps)===metrics.dps&&Number(boss.dataset.net)===metrics.dps-metrics.regen,'boss display uses authoritative regen and sustained DPS');
    ok(boss.getAttribute('aria-label').includes('excluding manual taps'),'DPS estimate distinguishes manual taps');
    ok(q('.guardian-label').textContent==='Tap enemy to attack'&&q('#stat-tap').previousElementSibling.textContent==='Tap damage'&&q('#stat-idle').previousElementSibling.textContent==='Wisp damage/sec','Rift explains manual taps and Wisp damage per second');
    var motion=matchMedia('(prefers-reduced-motion: reduce)').matches,styles=[];
    ['ember','tide','stone','gale','thorn','void','aurora','titan'].forEach(id=>{
      s=seed();s.activeParty=[id];s.spirits[id]=1;s.heroResource[id]=99.9;install(s);q('[data-tab="battle"]').click();b.resetFeedback();
      b.advanceTime(400);b.feedbackTick(false);b.riftStatus.update();
      var fx=q('.cast-'+id);ok(motion?!fx:!!fx,'actual '+id+' ability uses its own effect, suppressed in reduced motion');
      if(fx)styles.push(fx.className);
      ok(q('[data-rift-wisp="'+id+'"] .rift-wisp-time').textContent==='CAST','cast marker follows real '+id+' ability');
    });
    if(!motion)ok(new Set(styles).size===8,'eight distinct Wisp cast identities');
    s=seed();s.activeParty=['ember'];s.spirits.ember=1;s.heroResource.ember=0;install(s);q('[data-tab="battle"]').click();b.resetFeedback();
    var hp=b.getState().enemyHp;b.advanceTime(400);b.feedbackTick(false);b.riftStatus.update();
    ok(b.getState().enemyHp<hp,'passive projectile accompanies authoritative continuous damage');
    ok(motion?!q('.vfx-shot'):!!q('.vfx-shot.shot-ember'),'passive projectile uses its contributing Wisp identity');
    ok(!q('.rift-wisp.is-casting'),'passive attack does not invent an ability cast');
    b.resetFeedback();q('[data-tab="spirits"]').click();b.advanceTime(400);b.feedbackTick(false);ok(!q('.combat-vfx'),'no passive effects accumulate off Rift');
    s=seed();s.activeParty=['ember'];s.spirits.ember=1;s.heroResource.ember=99.9;install(s);q('[data-tab="battle"]').click();
    b.advanceTime(100);b.feedbackTick(false);b.riftStatus.update();
    ok(b.getState().heroResource.ember<5&&q('[data-rift-wisp="ember"] .rift-wisp-time').textContent==='CAST','production simulation cast resets charge and lights the casting Wisp');
    b.advanceTime(700);b.riftStatus.update();
    q('[data-tab="battle"]').click();b.resetFeedback();
    var castId=b.getState().activeParty[0];for(var n=0;n<20;n++)b.riftStatus.emit(castId);b.riftStatus.update();
    ok(q('[data-rift-wisp="'+castId+'"] .rift-wisp-time').textContent==='CAST','actual cast event marks the correct Wisp');
    ok(document.querySelectorAll('.combat-vfx').length===(matchMedia('(prefers-reduced-motion: reduce)').matches?0:8),'effects are bounded and absent in reduced motion');
    b.advanceTime(700);b.riftStatus.update();ok(!q('.rift-wisp.is-casting'),'cast marker expires');
    b.resetFeedback();q('[data-tab="spirits"]').click();b.riftStatus.emit(castId);ok(!q('.combat-vfx'),'no effects accumulate off Rift');q('[data-tab="battle"]').click();
    s=seed();s.buffUntil=b.clockNow()+2000;s.buffMult=1.25;install(s);
    var before=b.getState();for(var i=0;i<6;i++){b.renderLayout();document.querySelectorAll('nav.tabbar button').forEach(x=>x.click());}same(b.getState(),before,'status rendering/navigation observer-only');
    function ticks(render){install(s);for(var i=0;i<8;i++){b.advanceTime(100);b.feedbackTick(false);if(render){b.renderLayout();document.querySelectorAll('nav.tabbar button').forEach(x=>x.click());}}return b.getState();}
    var now=b.clockNow();var a=ticks(false);ctx.setClock(now);var c=ticks(true);same(a,c,'same controlled production ticks give exact state/economy equality');
    return {checks,worstNames:worst.text,worstMembers:worst.ids,observerOnly:true,queue:true,resume:true};
  }finally{if(undo)undo();}
};
window.riftStatusMobile=(()=>{
 var b=window.__lumenfallQaBridge,ctx=window.__lumenfallQaContext,q=s=>document.querySelector(s),kind;
 function ok(v,m){if(!v)throw Error(m);}
 function setup(inset,stateKind){
  kind=stateKind;var s=window.riftStatusSeed(b,ctx);
  if(kind==='fresh'){s.depth=1;s.maxDepthEver=1;s.enemyDepth=1;s.enemyMaxHp=b.enemyHpFor(1);s.enemyHp=s.enemyMaxHp;}
  else {var worst=window.riftStatusWorst(b,ctx);s.activeParty=worst.ids;s.activeParty.forEach(id=>s.spirits[id]=1);s.buffUntil=b.clockNow()+60000;s.buffMult=1.5;s.lumen=1e12;s.shards=1e12;s.motes=1e9;if(kind.startsWith('boss')){s.depth=110;s.enemyDepth=110;s.enemyMaxHp=b.enemyHpFor(110);s.enemyHp=s.enemyMaxHp;}}
  if(kind==='boss-conditional'){s.activeParty=['stone','titan','gale','thorn','ember'];s.activeParty.forEach(id=>s.spirits[id]=1);}
  if(kind==='dense'||kind==='boss')s.activeParty=['ember','tide','stone','void','aurora'];
  s.activeParty.forEach((id,i)=>s.heroResource[id]=20+i*15);
  b.setState(s);b.renderLayout();q('[data-tab="battle"]').click();
  document.documentElement.style.setProperty('--safe-top',inset+'px');document.documentElement.style.setProperty('--safe-bottom',inset+'px');
 }
 function rect(el){return el.getBoundingClientRect();}
 // Restore only PR #34's third-column boost presentation. Keep the same
 // status node/markup, production state, handlers and absence of Details.
 function mutateBoostLine(){
  var buff=q('#buff-indicator'),parent=buff.parentNode,next=buff.nextSibling;
  var style=document.createElement('style');
  style.textContent='.stage .stat-row{grid-template-columns:1fr 1fr 1.4fr;height:48px;min-height:48px;}' +
   '.stage .buff-indicator{font-size:11px;line-height:14px;margin:0;padding:1px 2px;border-radius:10px;text-align:center;}' +
   '.stage .buff-indicator strong{display:block;font-size:12px;line-height:16px;}';
  document.head.appendChild(style);q('.stat-row').appendChild(buff);
  return function(){parent.insertBefore(buff,next);style.remove();};
 }
 function measure(){
  var m=q('main'),mr=rect(m),nav=rect(q('nav.tabbar')),enemy=rect(q('#enemy-stage'));
  ok(m.scrollTop===0&&m.scrollHeight<=m.clientHeight+1&&scrollY===0,'Rift remains scroll-free without clipped content');
  ok(enemy.height>=120,'Guardian Tap >=120');
  var boxes={};
  ['#enemy-stage','#hp-text','#buff-indicator','#bond-summary','#rift-push-btn','#rift-farm-btn'].forEach(s=>{
   var el=q(s),r=rect(el);ok(r.top>=mr.top&&r.bottom<=nav.top&&r.left>=mr.left&&r.right<=mr.right,s+' fully visible');ok(el.scrollWidth<=el.clientWidth&&el.scrollHeight<=el.clientHeight+1,s+' text/content unclipped');
   if(el.tagName==='BUTTON'){ok(r.width>=44&&r.height>=44,s+' touch minimum');ok(el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),s+' hit-test');}
   boxes[s]={x:r.x,y:r.y,width:r.width,height:r.height};
  });
  var stats=rect(q('.stat-row')),buff=rect(q('#buff-indicator')),bonds=rect(q('#bond-summary')),hp=rect(q('.hp-wrap'));
  ok(!q('#rift-details') && !q('#rift-details-btn'),'obsolete Details absent');
  ok(q('.stat-row').children.length===2 && !q('.stat-row').contains(q('#buff-indicator')),'numbers row contains only Guardian Tap and Wisp DPS');
  ok(Math.abs(buff.left-bonds.left)<1 && buff.height<=16 && bonds.height<=16,'boost and Bonds each occupy one independent line');
  ['#rift-push-btn','#rift-farm-btn'].forEach(s=>ok(rect(q(s)).bottom<=rect(q('#rift-objective')).top,'mode control clear of objective'));
  ok(hp.bottom<=stats.top&&stats.bottom<=buff.top&&buff.bottom<=bonds.top&&bonds.bottom<=nav.top,'HP, status and nav do not overlap');
  var tabs=[...document.querySelectorAll('nav.tabbar button')];ok(tabs.length===6,'six main tabs');tabs.forEach((el,i)=>{var r=rect(el);ok(r.width>=44&&r.height>=44,'tab touch minimum');ok(el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),'tab hit-test');if(i)ok(rect(tabs[i-1]).right<=r.left,'one non-overlapping nav row');});
  var active=b.riftStatus.active();ok(active.every(x=>q('#bond-summary').textContent.includes(x.name.replace(' Bond',''))),'all powered Bond names directly visible');
  if(kind!=='fresh')ok(active.length===window.riftStatusWorst(b,ctx).bonds.length&&q('#buff-indicator').textContent.includes('+50%'),'worst current Bonds and buff fixture survives live ticks');
  ['#rift-party','#rift-bond-effects','#boss-combat'].forEach(selector=>{
   var el=q(selector);if(el.hidden)return;var r=rect(el);ok(r.top>=mr.top&&r.bottom<=nav.top&&r.width>0,selector+' visible above navigation');
   [el,...el.querySelectorAll('.rift-wisp-name,.rift-wisp-time,.rift-bond-effect,strong,.boss-net')].forEach(x=>ok(x.scrollWidth<=x.clientWidth+1&&x.scrollHeight<=x.clientHeight+1,selector+' full contents fit'));
   boxes[selector]={x:r.x,y:r.y,width:r.width,height:r.height};
  });
  var cards=[...document.querySelectorAll('[data-rift-wisp]')];
  active.forEach(bond=>{var pair=cards.filter(x=>x.dataset.bond===bond.id);ok(pair.length===2&&Math.abs(cards.indexOf(pair[0])-cards.indexOf(pair[1]))===1,'mobile Bond partners adjacent');ok(rect(pair[1]).left-rect(pair[0]).right>=0&&rect(pair[1]).left-rect(pair[0]).right<=2.1,'Bond pair is close and does not overlap');});
  var arena=rect(q('.battle-row')),landscape=rect(q('.rift-landscape'));
  ok(getComputedStyle(q('.battle-row')).overflowY==='hidden'&&landscape.bottom<=arena.bottom+.1&&landscape.top>=arena.top-.1,'combat background paint is clipped inside the arena');
  ok(arena.bottom<=stats.top&&getComputedStyle(q('.stat-row')).position==='relative','stat box top borders paint above the combat layer');
  ok(rect(q('#rift-party')).bottom<=hp.top,'formation clear of HP');
  ok(q('#boss-combat').hidden||hp.bottom<=rect(q('#boss-combat')).top&&rect(q('#boss-combat')).bottom<=stats.top,'boss figures clear of HP and numeric row');
  ok(q('#rift-bond-effects').hidden||bonds.bottom<=rect(q('#rift-bond-effects')).top,'full Bond effects separate from names');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ok(!q('.combat-vfx')&&getComputedStyle(q('#enemy-stage'),'::after').animationName==='none','reduced motion has no combat effects or rotating aura');}
  ok(!document.documentElement.hasAttribute('data-qa-runtime-error'),'no runtime errors');
  return {kind,viewport:[innerWidth,innerHeight],fonts:document.fonts.size,boxes,bondText:q('#bond-summary').textContent,buff:q('#buff-indicator').textContent,enemyHeight:enemy.height,main:[m.clientHeight,m.scrollHeight]};
 }
 function last(view){
  var all=[...document.querySelectorAll('#tab-'+view+' button:not(:disabled),#tab-'+view+' summary')],el=all[all.length-1],r=rect(el),mr=rect(q('main'));
  ok(el&&r.top>=mr.top&&r.bottom<=mr.bottom,'native touch scroll reaches last '+view+' control '+JSON.stringify({top:r.top,bottom:r.bottom,area:[mr.top,mr.bottom],scroll:q('main').scrollTop,text:el.textContent}));var x=r.x+r.width/2,y=r.y+r.height/2;ok(el.contains(document.elementFromPoint(x,y)),'last '+view+' control hittable');
  return {view,text:el.textContent,x,y,scroll:q('main').scrollTop};
 }
 function locate(view){var all=[...document.querySelectorAll('#tab-'+view+' button:not(:disabled),#tab-'+view+' summary')],el=all[all.length-1],r=rect(el),m=rect(q('main'));return {visible:r.top>=m.top&&r.bottom<=m.bottom,area:{top:m.top,bottom:m.bottom},delta:r.top<m.top?m.top-r.top+12:-(r.bottom-m.bottom+12)};}
 function control(selector){var el=q(selector),r=rect(el),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,visible:r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight,hit:el.contains(document.elementFromPoint(x,y))};}
 return {setup,measure,last,control,locate,mutateBoostLine};
})();
