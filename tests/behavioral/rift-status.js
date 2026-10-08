/* Presentation observers only; injected by the behavioral harness. */
window.riftStatusSeed=function(b,ctx){
  var s=b.freshStateSnapshot();s.maxDepthEver=101;s.depth=101;s.enemyDepth=101;
  s.enemyMaxHp=b.enemyHpFor(101);s.enemyHp=s.enemyMaxHp;s.questDay=ctx.currentDay();s.loginStreak=1;
  s.lumen=0;s.shards=0;return s;
};
window.riftGuidanceLineCheck=function(assert,phase){
  var el=document.querySelector('#rift-objective'),style=getComputedStyle(el,'::after');
  var diagnostic={phase,kind:el.querySelector('.objective-kind').textContent,
    hidden:document.querySelector('#rift-objective-row').hidden,content:style.content,
    width:style.width,height:style.height,background:style.backgroundImage,
    shadow:style.boxShadow,progress:el.style.getPropertyValue('--objective-progress')};
  // A generated pseudo-element must be absent even while its row is hidden;
  // zero progress or clipping must not mask a line that returns on rerender.
  assert(style.content==='none','Rift guidance has no drawn objective progress line: '+JSON.stringify(diagnostic));
  return diagnostic;
};
window.riftGuidanceFixtures=function(b,ctx){
  return [['Recruit-ready','WISP READY',3],['Upcoming unlock','WISP',1],['Boss','BOSS',10],['Farm','FARM',9]].map(function(f){
    var s=window.riftStatusSeed(b,ctx),depth=f[2];
    s.maxDepthEver=f[1]==='FARM'?10:depth;s.depth=depth;s.enemyDepth=depth;
    s.enemyMaxHp=b.enemyHpFor(depth);s.enemyHp=s.enemyMaxHp;
    Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=false;});
    if(f[1]==='WISP READY')s.lumen=100;
    if(f[1]==='FARM'){s.riftMode='farm';s.farmDepth=9;s.farmReturnDepth=10;}
    return {name:f[0],kind:f[1],state:s};
  });
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
  function powerText(id,state){
    // Independent share of the existing effective-party formula, including
    // the active support buff, is the original chip's passive contribution.
    var m=b.wispFormulaSnapshot(id),value=m.totalActivePartyPower>0?m.wispPower/m.totalActivePartyPower*m.effectivePartyPower:0;
    var now=b.clockNow(),known=1,sources=state.supportBuffs&&state.supportBuffs.version===1?state.supportBuffs.sources:null;
    ['tide','aurora'].forEach(sourceId=>{var source=sources&&sources[sourceId];if(source&&now<source.until)known+=source.mult-1;});
    var legacy=state.buffUntil&&now<state.buffUntil?state.buffMult:1;
    value*=Math.max(legacy,known);
    if(value<1000)return String(Math.round(value*10)/10);
    var units=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc'],tier=Math.min(Math.floor(Math.log10(value)/3),units.length-1);
    return (value/Math.pow(10,tier*3)).toFixed(2)+units[tier];
  }
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
    var guidance=q('#rift-objective-row'),dismiss=q('#rift-objective-dismiss'),guidanceToggle=q('#rift-guidance-toggle'),guidanceKey='lumenfall_rift_guidance_hidden_v1';
    ok(guidance&&guidance.contains(q('#rift-objective'))&&guidance.contains(dismiss),'guidance and its separate dismiss control share the objective row');
    ok(!guidance.hidden&&guidanceToggle.getAttribute('aria-pressed')==='true','Rift guidance is shown by default and Settings reports shown');
    ok(dismiss.tagName==='BUTTON'&&!!dismiss.getAttribute('aria-label'),'guidance dismiss is a named native button');
    var guidanceState=b.getState(),guidanceSave=b.rawSave();
    dismiss.focus({preventScroll:true});dismiss.click();
    ok(guidance.hidden&&guidanceToggle.getAttribute('aria-pressed')==='false'&&localStorage.getItem(guidanceKey)==='1','dismiss hides guidance and stores only the device preference');
    ok(document.activeElement===q('#enemy-stage'),'dismissing focused guidance returns focus to the enemy');
    dismiss.focus();q('#rift-objective').focus();
    ok(document.activeElement===q('#enemy-stage')&&!dismiss.getClientRects().length&&!q('#rift-objective').getClientRects().length,'hidden guidance cannot receive focus or expose controls');
    q('#settings-btn').click();guidanceToggle.focus();guidanceToggle.click();
    ok(!guidance.hidden&&guidanceToggle.getAttribute('aria-pressed')==='true'&&localStorage.getItem(guidanceKey)===null,'Settings restores guidance and clears the hidden preference');
    ok(document.activeElement===guidanceToggle,'restoring guidance leaves focus on the Settings toggle');
    q('#settings-close').click();
    var priorFocus=document.activeElement;dismiss.click();
    ok(document.activeElement===priorFocus,'programmatic dismissal outside guidance does not steal focus');
    q('#settings-btn').click();guidanceToggle.click();q('#settings-close').click();
    same(b.getState(),guidanceState,'guidance hide and restore never alter game state');
    ok(b.rawSave()===guidanceSave,'guidance preference never rewrites the canonical game save');
    var guidanceLines=[];
    window.riftGuidanceFixtures(b,ctx).forEach(function(fixture){
      install(fixture.state);
      ok(q('#rift-objective .objective-kind').textContent===fixture.kind,'guidance fixture renders '+fixture.name);
      function check(phase){guidanceLines.push(window.riftGuidanceLineCheck(ok,fixture.name+' / '+phase));}
      check('render');b.riftStatus.update();check('fast rerender');
      dismiss.click();check('hidden');b.renderLayout();check('hidden rerender');
      q('#settings-btn').click();guidanceToggle.click();q('#settings-close').click();
      ok(!guidance.hidden,'Settings restores '+fixture.name+' guidance');
      check('restored');b.riftStatus.update();check('restored rerender');
    });
    install(guidanceState);
    [1,15,40,60,90].forEach(depth=>{
      var s=seed();s.maxDepthEver=depth;s.depth=depth;s.enemyDepth=depth;s.enemyMaxHp=b.enemyHpFor(depth);s.enemyHp=s.enemyMaxHp;install(s);
      var slots=b.riftStatus.slots(),projects=b.riftStatus.projects().filter(x=>x.unlock<=depth);
      ok(slots<=projects.length,'only unlocked capacity counts');
      for(var n=0;n<=slots;n++){
        s.activeStudies=projects.slice(0,n).map(x=>({id:x.id,totalDurationSec:200,remainingSec:100,speedMult:1}));install(s);
        ok(badge()===slots-n,'empty/one/multiple/full capacity');
        var before=b.getState();q('[data-tab="workshop"]').click();q('[data-tab="research"]').focus();q('[data-tab="research"]').click();badge();
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
    s=seed();s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:.05,speedMult:1}];install(s);b.feedbackSave();b.autoTarget.visibility(true);b.advanceTime(5000);await b.autoTarget.visibility(false);
    ok(b.getState().longStudyLevels.guardmastery===1,'resume commits actual Study completion');badge();
    s=seed();s.buffUntil=b.clockNow()+1500;s.buffMult=1.5;install(s);
    ok(!q('#rift-details') && !q('#rift-details-btn') && q('#tab-battle #buff-indicator'),'boost is directly on Rift');
    ok(q('#buff-indicator').textContent.includes('passive Wisps + Tap')&&q('#buff-indicator').textContent.includes('+50%'),'boost scope and multiplier');
    b.advanceTime(500);b.riftStatus.update();ok(q('#buff-indicator').textContent.includes('1s'),'direct Rift countdown updates');
    if(negative==='buff')undo=b.riftStatus.mutate('buff');
    b.advanceTime(1000);b.riftStatus.update();ok(q('#buff-indicator').textContent.includes('Inactive')&&!q('#buff-indicator').textContent.includes('+50%'),'direct Rift buff expiry is neutral');
    s=seed();var boostNow=b.clockNow();s.supportBuffs={version:1,sources:{tide:{mult:1.25,until:boostNow+1000},aurora:{mult:1.5,until:boostNow+3000}}};install(s);
    ok(q('#buff-indicator').textContent.includes('+75%')&&q('#buff-indicator').textContent.includes('next expiry 1s'),'identified boosts add and show earliest expiry');
    b.advanceTime(1000);b.riftStatus.update();ok(q('#buff-indicator').textContent.includes('+50%')&&q('#buff-indicator').textContent.includes('2s'),'each source loses only its own bonus');
    b.advanceTime(2000);b.riftStatus.update();ok(q('#buff-indicator').textContent.includes('Inactive'),'all identified sources expired');
    s=seed();install(s);ok(q('#bond-summary').textContent==='No Formation Bond active.','neutral Bonds');
    var worst=window.riftStatusWorst(b,ctx);s.activeParty=worst.ids;s.activeParty.forEach(id=>s.spirits[id]=1);install(s);
    var active=b.riftStatus.active();ok(active.length===worst.bonds.length&&q('#bond-summary').textContent===worst.text,'every actual powered Bond name visible');
    active.forEach(x=>{var row=[...document.querySelectorAll('#bond-card .bond-row')].find(row=>row.querySelector('.bond-name').textContent.includes(x.name));var partners=x.ids.map(id=>b.wispRoleContract().find(sp=>sp.id===id).name).join(' + ');ok(row && row.classList.contains('active') && row.querySelector('.bond-req').textContent===partners && row.querySelector('.bond-effect').textContent===x.effect,'existing Formation retains active Bond requirements and full effects');});
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
        var id=card.dataset.riftWisp,powered=state.spirits[id]>0,value=powered?state.heroResource[id]:0,bar=card.querySelector('[role="progressbar"]'),power=card.querySelector('.rift-wisp-power'),status=card.querySelector('.rift-wisp-state');
        ok(Number(bar.getAttribute('aria-valuenow'))===Math.round(value),'bar reads real ability resource');
        ok(parseFloat(bar.firstElementChild.style.width)===value,'visible bar matches accessible charge');
        ok(bar.getAttribute('aria-valuemin')==='0'&&bar.getAttribute('aria-valuemax')==='100','ability charge retains its accessible percentage range');
        ok(bar.getAttribute('aria-valuetext')===(powered?Math.round(value)+'% charged; '+Math.ceil((1-value/100)*b.riftStatus.visualMetrics().cycle)+' seconds to next ability':'Unpowered — Empower this Wisp'),'ability timing remains accessible and uses actual charge speed');
        var expectedPower=powerText(id,state);
        ok(power&&power.textContent===expectedPower&&power.title==='Passive Wisp power'&&power.getAttribute('aria-label')==='Passive Wisp power: '+expectedPower,'Rift card displays its authoritative passive Wisp power');
        ok(status&&status.textContent===(!powered?'Lv 0':card.classList.contains('is-casting')?'CAST':value>=100?'Ready':''),'card state is only unpowered, casting, ready or empty');
        ok(!card.querySelector('.rift-wisp-time')&&!/\b\d+(?:\.\d+)?\s*(?:s|sec|seconds)\b/i.test(card.textContent),'Rift card has no visible ability countdown');
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
    var powerId=s.activeParty[0],beforePower=q('[data-rift-wisp="'+powerId+'"] .rift-wisp-power').textContent;
    s.spirits[powerId]+=3;install(s);partyCheck();
    ok(q('[data-rift-wisp="'+powerId+'"] .rift-wisp-power').textContent!==beforePower,'displayed passive power responds to committed Wisp levels');
    beforePower=q('[data-rift-wisp="'+powerId+'"] .rift-wisp-power').textContent;
    s.buffUntil=b.clockNow()+2000;s.buffMult=1.5;install(s);partyCheck();
    ok(q('[data-rift-wisp="'+powerId+'"] .rift-wisp-power').textContent!==beforePower,'displayed passive power includes the active support buff');
    b.advanceTime(2000);b.riftStatus.update();partyCheck();
    ok(q('[data-rift-wisp="'+powerId+'"] .rift-wisp-power').textContent===beforePower,'displayed passive power drops the expired support buff');
    s.heroResource[powerId]=100;install(s);partyCheck();
    ok(q('[data-rift-wisp="'+powerId+'"] .rift-wisp-state').textContent==='Ready','full real charge displays Ready without seconds');
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
      ok(q('[data-rift-wisp="'+id+'"] .rift-wisp-state').textContent==='CAST','cast marker follows real '+id+' ability');
    });
    if(!motion)ok(new Set(styles).size===8,'eight distinct Wisp cast identities');
    s=seed();s.activeParty=['ember'];s.spirits.ember=1;s.heroResource.ember=0;install(s);q('[data-tab="battle"]').click();b.resetFeedback();
    var hp=b.getState().enemyHp;b.advanceTime(400);b.feedbackTick(false);b.riftStatus.update();
    ok(b.getState().enemyHp<hp,'passive projectile accompanies authoritative continuous damage');
    ok(motion?!q('.vfx-shot'):!!q('.vfx-shot.shot-ember'),'passive projectile uses its contributing Wisp identity');
    var shot=q('.vfx-shot');if(shot)ok(parseFloat(shot.style.getPropertyValue('--from-y'))>=24&&parseFloat(shot.style.getPropertyValue('--from-y'))<=q('#enemy-stage').clientHeight-12,'passive shot origin stays inside the arena with standalone cards');
    ok(!q('.rift-wisp.is-casting'),'passive attack does not invent an ability cast');
    b.resetFeedback();q('[data-tab="spirits"]').click();b.advanceTime(400);b.feedbackTick(false);ok(!q('.combat-vfx'),'no passive effects accumulate off Rift');
    s=seed();s.activeParty=['ember'];s.spirits.ember=1;s.heroResource.ember=99.9;install(s);q('[data-tab="battle"]').click();
    b.advanceTime(100);b.feedbackTick(false);b.riftStatus.update();
    ok(b.getState().heroResource.ember<5&&q('[data-rift-wisp="ember"] .rift-wisp-state').textContent==='CAST','production simulation cast resets charge and lights the casting Wisp');
    b.advanceTime(700);b.riftStatus.update();
    q('[data-tab="battle"]').click();b.resetFeedback();
    var castId=b.getState().activeParty[0];for(var n=0;n<20;n++)b.riftStatus.emit(castId);b.riftStatus.update();
    ok(q('[data-rift-wisp="'+castId+'"] .rift-wisp-state').textContent==='CAST','actual cast event marks the correct Wisp');
    ok(document.querySelectorAll('.combat-vfx').length===(matchMedia('(prefers-reduced-motion: reduce)').matches?0:8),'effects are bounded and absent in reduced motion');
    b.advanceTime(700);b.riftStatus.update();ok(!q('.rift-wisp.is-casting'),'cast marker expires');
    b.resetFeedback();q('[data-tab="spirits"]').click();b.riftStatus.emit(castId);ok(!q('.combat-vfx'),'no effects accumulate off Rift');q('[data-tab="battle"]').click();
    s=seed();s.buffUntil=b.clockNow()+2000;s.buffMult=1.25;install(s);
    var before=b.getState();for(var i=0;i<6;i++){b.renderLayout();document.querySelectorAll('nav.tabbar button').forEach(x=>x.click());}same(b.getState(),before,'status rendering/navigation observer-only');
    function ticks(render){install(s);for(var i=0;i<8;i++){b.advanceTime(100);b.feedbackTick(false);if(render){b.renderLayout();document.querySelectorAll('nav.tabbar button').forEach(x=>x.click());}}return b.getState();}
    var now=b.clockNow();var a=ticks(false);ctx.setClock(now);var c=ticks(true);same(a,c,'same controlled production ticks give exact state/economy equality');
    // Exercise the production selector: catalog art must be reachable in both
    // ordinary encounters and Bosses, with matching names and no state writes.
    var catalog=[...document.querySelectorAll('symbol[id^="creature-"]')].map(x=>x.id.slice(9));
    ok(catalog.length===23&&new Set(catalog).size===23,'23 unique enemy species are authored');
    // The stylized artwork is self-contained vector geometry in the original canvases.
    // Inspect every portrait, including species not selected by this encounter.
    var enemyArtIds=['wisp','serpent','stalker','husk','warden','shade','leech','prowler','effigy','wraith','arachnid','scorpion','mantis','wyvern','gargoyle','behemoth','revenant','hydra','watcher','carapace','basilisk','crawler','harrier'];
    var wispArtIds=['ember','tide','stone','gale','thorn','void','aurora','titan'];
    var vectorSpecs=enemyArtIds.map(id=>({id:'creature-'+id,canvas:160})).concat(wispArtIds.map(id=>({id:'wisp-'+id,canvas:64})));
    var vectorSymbols=[...document.querySelectorAll('symbol[id^="creature-"],symbol[id^="wisp-"]')],vectorArt=[];
    ok(vectorSymbols.length===31&&vectorSpecs.every(spec=>vectorSymbols.some(symbol=>symbol.id===spec.id)),'exact 23 enemy and eight Wisp vector identities');
    var probe=document.createElementNS('http://www.w3.org/2000/svg','svg');
    probe.setAttribute('aria-hidden','true');probe.setAttribute('focusable','false');
    probe.style.cssText='position:fixed;left:0;top:0;opacity:0;pointer-events:none;--creature-color:#504c80;--creature-rim:#b4a5dc;--creature-eye:#d5edff';
    document.body.appendChild(probe);
    try{vectorSpecs.forEach(spec=>{
      var symbol=document.getElementById(spec.id);
      ok(symbol.getAttribute('viewBox')==='0 0 '+spec.canvas+' '+spec.canvas,spec.id+' retains its bounded portrait canvas');
      ok(!symbol.querySelector('image,foreignObject,script'),spec.id+' uses self-contained vector artwork');
      var primitives=symbol.querySelectorAll('path,polygon,polyline,circle,ellipse,rect,line');
      ok(primitives.length>0,spec.id+' contains authored vector geometry');
      [symbol,...symbol.querySelectorAll('*')].forEach(el=>{
        [...el.attributes].forEach(attr=>{
          if(attr.localName==='href')ok(attr.value.startsWith('#')&&!!document.getElementById(attr.value.slice(1)),spec.id+' has a resolved local SVG reference');
          [...attr.value.matchAll(/url\(["']?(#[^"')]+)["']?\)/g)].forEach(match=>ok(!!document.getElementById(match[1].slice(1)),spec.id+' has a resolved paint server: '+match[1]));
        });
      });
      probe.setAttribute('viewBox','0 0 '+spec.canvas+' '+spec.canvas);
      probe.setAttribute('width',String(spec.canvas));probe.setAttribute('height',String(spec.canvas));
      probe.innerHTML=symbol.innerHTML;
      var bounds=probe.getBBox();
      ok(bounds.width>spec.canvas/4&&bounds.height>spec.canvas/4&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=spec.canvas&&bounds.y+bounds.height<=spec.canvas,spec.id+' vector geometry stays inside its canvas');
      var shapes=[...probe.querySelectorAll('path,polygon,polyline,circle,ellipse,rect,line')];
      function hasPaint(value){
        if(value==='none'||value==='rgba(0, 0, 0, 0)')return false;
        if(value.startsWith('url(')){
          var match=value.match(/#([^"')]+)/),server=match&&document.getElementById(match[1]);
          return !!server&&[...server.querySelectorAll('stop')].some(stop=>Number(getComputedStyle(stop).stopOpacity)>0&&getComputedStyle(stop).stopColor!=='rgba(0, 0, 0, 0)');
        }
        return true;
      }
      var painted=shapes.filter(el=>{
        var style=getComputedStyle(el),box=el.getBBox(),alpha=1;
        for(var parent=el;parent&&parent!==probe;parent=parent.parentElement){var css=getComputedStyle(parent);if(css.display==='none'||css.visibility!=='visible')return false;alpha*=Number(css.opacity);}
        var fill=hasPaint(style.fill)&&Number(style.fillOpacity)>0;
        var stroke=hasPaint(style.stroke)&&Number(style.strokeOpacity)>0&&parseFloat(style.strokeWidth)>0;
        return alpha>0&&(box.width>0||box.height>0)&&(fill||stroke);
      });
      ok(painted.length>0,spec.id+' has visible vector paint');
      if(spec.id.startsWith('creature-')){
        var colors=shapes.map(el=>getComputedStyle(el).fill);
        probe.style.setProperty('--creature-color','#123456');
        ok(shapes.some((el,i)=>getComputedStyle(el).fill!==colors[i]),spec.id+' primary material consumes its species/Boss color');
        probe.style.setProperty('--creature-color','#504c80');
      }
      vectorArt.push({id:spec.id,canvas:spec.canvas,painted:painted.length,bounds:{x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height}});
    });}finally{probe.remove();}
    q('[data-tab="battle"]').click();b.resetFeedback();
    var artCoverage={normal:[],boss:[]},speciesColors=new Set(),traitRims=new Set();
    ['normal','boss'].forEach(mode=>{
      var seen=new Set();
      for(var n=1;n<=46;n++){
        var depth=mode==='boss'?n*10:n;
        if(mode==='normal'&&depth%10===0)continue;
        var sample=seed();sample.depth=depth;sample.enemyDepth=depth;
        sample.enemyMaxHp=b.enemyHpFor(depth);sample.enemyHp=sample.enemyMaxHp;
        b.setState(sample);var prior=b.getState();b.riftStatus.update();
        var glyph=q('#enemy-glyph'),kind=glyph.dataset.creature,ref=q('.creature-art use').getAttribute('href');
        ok(ref==='#creature-'+kind&&!!document.getElementById(ref.slice(1)),'encounter references existing matching creature art');
        var bounds=q('.creature-art use').getBBox();
        ok(bounds.width>40&&bounds.height>40&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=160&&bounds.y+bounds.height<=160,'creature silhouette stays inside its 160px canvas: '+kind);
        ok(q('#enemy-name').textContent.toLowerCase().endsWith(' '+kind),'encounter name agrees with creature identity');
        ok(glyph.classList.contains('boss')===(mode==='boss'),'art selection preserves Boss presentation');
        same(b.getState(),prior,'species rendering is observer-only');seen.add(kind);
        if(mode==='normal')speciesColors.add(getComputedStyle(glyph).getPropertyValue('--creature-color').trim());
        else{
          var rim=getComputedStyle(glyph).getPropertyValue('--creature-rim').trim();
          if(!traitRims.has(rim)){
            var painted=q('.creature-art'),filter=getComputedStyle(painted).filter;
            var priorRim=glyph.style.getPropertyValue('--creature-rim'),priorPriority=glyph.style.getPropertyPriority('--creature-rim'),probe;
            try{
              glyph.style.setProperty('--creature-rim','#123456');
              probe=getComputedStyle(painted).filter;
              ok(filter!=='none'&&probe!=='none'&&probe!==filter,'Boss outline visibly consumes its --creature-rim trait accent');
            }finally{
              if(priorRim)glyph.style.setProperty('--creature-rim',priorRim,priorPriority);else glyph.style.removeProperty('--creature-rim');
            }
            ok(getComputedStyle(painted).filter===filter,'restoring the trait accent restores the artwork outline');
            traitRims.add(rim);
          }
        }
      }
      ok(seen.size===23&&catalog.every(id=>seen.has(id)),mode+' encounters reach all 23 authored enemy species');
      artCoverage[mode]=[...seen];
    });
    ok(speciesColors.size===23,'ordinary species retain distinct material palettes');
    ok(traitRims.size===3,'all three Boss traits visibly color the artwork silhouette rim');
    var portraits=[...document.querySelectorAll('symbol[id^="wisp-"]')];
    ok(portraits.length===8&&portraits.every(x=>document.querySelectorAll('[id="'+x.id+'"]').length===1),'all eight Wisp portraits have unique production symbols');
    return {checks,guidanceLines,worstNames:worst.text,worstMembers:worst.ids,observerOnly:true,queue:true,resume:true,artCoverage,vectorArt,traitRims:[...traitRims]};
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
  if(kind!=='fresh' && ctx.scenario.startsWith('rift-status-stacking'))s.supportBuffs={version:1,sources:{tide:{mult:1.5,until:b.clockNow()+30000},aurora:{mult:1.5,until:b.clockNow()+60000}}};
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
  var guidanceLine=window.riftGuidanceLineCheck(ok,'mobile / '+kind);
  var m=q('main'),mr=rect(m),nav=rect(q('nav.tabbar')),enemy=rect(q('#enemy-stage'));
  ok(m.scrollTop===0&&m.scrollHeight<=m.clientHeight+1&&scrollY===0,'Rift remains scroll-free without clipped content');
  ok(enemy.height>=120,'Guardian Tap >=120');
  var boxes={},guidance=q('#rift-objective-row'),visibleSelectors=['#enemy-stage','#hp-text','#buff-indicator','#bond-summary','#rift-push-btn','#rift-farm-btn'];
  if(!guidance.hidden)visibleSelectors.push('#rift-objective-row','#rift-objective-dismiss');
  visibleSelectors.forEach(s=>{
   var el=q(s),r=rect(el);ok(r.top>=mr.top&&r.bottom<=nav.top&&r.left>=mr.left&&r.right<=mr.right,s+' fully visible');ok(el.scrollWidth<=el.clientWidth&&el.scrollHeight<=el.clientHeight+1,s+' text/content unclipped');
   if(el.tagName==='BUTTON'){ok(r.width>=44&&r.height>=44,s+' touch minimum');ok(el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),s+' hit-test');}
   boxes[s]={x:r.x,y:r.y,width:r.width,height:r.height};
  });
  var stats=rect(q('.stat-row')),buff=rect(q('#buff-indicator')),bonds=rect(q('#bond-summary')),hp=rect(q('.hp-wrap'));
  ok(!q('#rift-details') && !q('#rift-details-btn'),'obsolete Details absent');
  ok(q('.stat-row').children.length===2 && !q('.stat-row').contains(q('#buff-indicator')),'numbers row contains only Guardian Tap and Wisp DPS');
  ['#buff-indicator','#bond-summary'].forEach(selector=>{
   var el=q(selector),range=document.createRange();range.selectNodeContents(el);
   var text=range.getBoundingClientRect(),lineHeight=parseFloat(getComputedStyle(el).lineHeight);
   ok(Number.isFinite(lineHeight)&&text.width>0&&text.height>0&&text.height<=lineHeight+1,selector+' text occupies one independent line');
  });
  [q('.stat-row'),...q('.stat-row').querySelectorAll('.stat-box,.k,.v')].forEach(el=>{
   ok(el.scrollHeight<=el.clientHeight+1,'numeric row and stat boxes fit their full vertical content: '+el.className+' scroll='+el.scrollHeight+' client='+el.clientHeight+' text='+el.textContent);
   if(el.classList.contains('stat-box')){
    var box=rect(el),label=rect(el.querySelector('.k')),value=rect(el.querySelector('.v'));
    ok(box.top>=stats.top&&box.bottom<=stats.bottom&&label.top>=box.top&&label.bottom<=value.top&&value.bottom<=box.bottom,'stat label and value remain inside their numeric surface without overlap');
    var surface=getComputedStyle(el);ok(surface.backgroundImage!=='none'||surface.backgroundColor!=='rgba(0, 0, 0, 0)','stat boxes retain painted surfaces over the scenic background');
   }
  });
  if(!guidance.hidden){
   ['#rift-push-btn','#rift-farm-btn'].forEach(s=>ok(rect(q(s)).bottom<=rect(guidance).top,'mode control clear of objective'));
   ok(rect(q('#rift-objective')).right<=rect(q('#rift-objective-dismiss')).left,'guidance dismiss is separate from the objective action');
  }else ok(!q('#rift-objective-dismiss').getClientRects().length&&!q('#rift-objective').getClientRects().length,'hidden guidance exposes no rendered controls');
  ok(hp.bottom<=buff.top&&buff.bottom<=bonds.top&&bonds.bottom<=stats.top&&stats.bottom<=nav.top,'HP, status, bottom numeric row and nav do not overlap');
  var tabs=[...document.querySelectorAll('nav.tabbar button')];ok(tabs.length===5,'five main tabs');tabs.forEach((el,i)=>{var r=rect(el);ok(r.width>=44&&r.height>=44,'tab touch minimum');ok(el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),'tab hit-test');if(i)ok(rect(tabs[i-1]).right<=r.left,'one non-overlapping nav row');});
  var active=b.riftStatus.active();ok(active.every(x=>q('#bond-summary').textContent.includes(x.name.replace(' Bond',''))),'all powered Bond names directly visible');
  if(kind!=='fresh' && !ctx.scenario.startsWith('rift-status-stacking'))ok(active.length===window.riftStatusWorst(b,ctx).bonds.length&&q('#buff-indicator').textContent.includes('+50%'),'worst current Bonds and buff fixture survives live ticks');
  if(kind!=='fresh' && ctx.scenario.startsWith('rift-status-stacking'))ok(active.length===window.riftStatusWorst(b,ctx).bonds.length && q('#buff-indicator').textContent.includes('+100%') && q('#buff-indicator').textContent.includes('next expiry'),'additive worst boost survives live ticks');
  ['#rift-party','#rift-bond-effects','#boss-combat'].forEach(selector=>{
   var el=q(selector);if(el.hidden)return;var r=rect(el);ok(r.top>=mr.top&&r.bottom<=nav.top&&r.width>0,selector+' visible above navigation');
   [el,...el.querySelectorAll('.rift-wisp-name,.rift-wisp-power,.rift-wisp-state,.rift-bond-effect,strong,.boss-net')].forEach(x=>ok(x.scrollWidth<=x.clientWidth+1&&x.scrollHeight<=x.clientHeight+1,selector+' full contents fit: '+x.className+' scroll='+x.scrollWidth+'x'+x.scrollHeight+' client='+x.clientWidth+'x'+x.clientHeight+' text='+x.textContent));
   boxes[selector]={x:r.x,y:r.y,width:r.width,height:r.height};
  });
  var cards=[...document.querySelectorAll('[data-rift-wisp]')];
  active.forEach(bond=>{var pair=cards.filter(x=>x.dataset.bond===bond.id);ok(pair.length===2&&Math.abs(cards.indexOf(pair[0])-cards.indexOf(pair[1]))===1,'mobile Bond partners adjacent');ok(rect(pair[1]).left-rect(pair[0]).right>=0&&rect(pair[1]).left-rect(pair[0]).right<=2.1,'Bond pair is close and does not overlap');});
  var arena=rect(q('.battle-row')),landscapeEl=q('.rift-landscape'),landscape=rect(landscapeEl),stageEl=q('#tab-battle .stage'),stage=rect(stageEl);
  ok(stageEl.contains(landscapeEl)&&landscape.left>=stage.left-.1&&landscape.right<=stage.right+.1&&landscape.top>=stage.top-.1&&landscape.bottom<=stage.bottom+.1,'shared scenic background stays inside the outer Rift stage');
  ok(landscapeEl.getAttribute('aria-hidden')==='true'&&getComputedStyle(landscapeEl).pointerEvents==='none','shared scenic background stays decorative and cannot intercept input');
  ok(arena.top>=(guidance.hidden?rect(q('.rift-heading')).bottom:rect(guidance).bottom)&&arena.bottom<=buff.top,'integrated combat region stays below guidance and above boost');
  ok(arena.bottom<=stats.top&&getComputedStyle(q('.stat-row')).position==='relative','stat box top borders paint above the combat layer');
  var party=rect(q('#rift-party'));
  ok(!q('#enemy-stage').contains(q('#rift-party'))&&enemy.bottom<=hp.top&&hp.bottom<=party.top&&party.bottom<=buff.top,'formation follows the attack surface and HP, before boost');
  ok(q('.battle-row').contains(q('#enemy-stage'))&&q('.battle-row').contains(q('.hp-wrap'))&&q('.battle-row').contains(q('#boss-combat'))&&q('.battle-row').contains(q('#rift-party')),'attack surface, HP, Boss regen and formation share the integrated scenic region');
  ok(q('#boss-combat').hidden||hp.bottom<=rect(q('#boss-combat')).top&&rect(q('#boss-combat')).bottom<=party.top,'boss regen sits between HP and the standalone formation');
  ok(q('#rift-bond-effects').hidden||bonds.bottom<=rect(q('#rift-bond-effects')).top&&rect(q('#rift-bond-effects')).bottom<=stats.top,'full Bond effects separate from names and precede the numeric row');
  cards.forEach(card=>ok(!!card.querySelector('.rift-wisp-power')&&!!card.querySelector('.rift-wisp-state')&&!card.querySelector('.rift-wisp-time')&&!/\b\d+(?:\.\d+)?\s*(?:s|sec|seconds)\b/i.test(card.textContent),'mobile cards show power and state without an ability countdown'));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ok(!q('.combat-vfx')&&getComputedStyle(q('#enemy-stage'),'::after').animationName==='none','reduced motion has no combat effects or rotating aura');}
  ok(!document.documentElement.hasAttribute('data-qa-runtime-error'),'no runtime errors');
  return {kind,guidanceLine,viewport:[innerWidth,innerHeight],fonts:document.fonts.size,boxes,bondText:q('#bond-summary').textContent,buff:q('#buff-indicator').textContent,enemyHeight:enemy.height,main:[m.clientHeight,m.scrollHeight]};
 }
 function entry(){
  var panel=q('#tab-battle'),animations=document.getAnimations().filter(a=>a.effect&&a.effect.target===panel),saved=animations.map(a=>({animation:a,time:a.currentTime,state:a.playState}));
  animations.forEach(a=>{a.pause();a.currentTime=0;});
  try{
   var m=q('main');ok(m.scrollTop===0&&m.scrollHeight<=m.clientHeight+1&&scrollY===0,'Rift entry animation remains scroll-free at its first frame');
   return {height:m.clientHeight,content:m.scrollHeight,animations:animations.map(a=>a.animationName)};
  }finally{saved.forEach(x=>{x.animation.currentTime=x.time;if(x.state==='running')x.animation.play();});}
 }
 function last(view){
  var all=[...document.querySelectorAll('#tab-'+view+' button:not(:disabled),#tab-'+view+' summary')],el=all[all.length-1],r=rect(el),mr=rect(q('main'));
  ok(el&&r.top>=mr.top&&r.bottom<=mr.bottom,'native touch scroll reaches last '+view+' control '+JSON.stringify({top:r.top,bottom:r.bottom,area:[mr.top,mr.bottom],scroll:q('main').scrollTop,text:el.textContent}));var x=r.x+r.width/2,y=r.y+r.height/2;ok(el.contains(document.elementFromPoint(x,y)),'last '+view+' control hittable');
  return {view,text:el.textContent,x,y,scroll:q('main').scrollTop};
 }
 function locate(view){var all=[...document.querySelectorAll('#tab-'+view+' button:not(:disabled),#tab-'+view+' summary')],el=all[all.length-1],r=rect(el),m=rect(q('main'));return {visible:r.top>=m.top&&r.bottom<=m.bottom,area:{top:m.top,bottom:m.bottom},delta:r.top<m.top?m.top-r.top+12:-(r.bottom-m.bottom+12)};}
 function control(selector){var el=q(selector),r=rect(el),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,visible:r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight,hit:el.contains(document.elementFromPoint(x,y))};}
 return {setup,measure,entry,last,control,locate,mutateBoostLine};
})();
