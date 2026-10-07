/* P2-07A: behavioral tests only; injected by run.cjs, never shipped. */
window.p207Seed = function(bridge,members,preset){
  var s=bridge.freshStateSnapshot();
  s.depth=101;s.maxDepthEver=101;s.enemyDepth=101;s.enemyMaxHp=bridge.enemyHpFor(101);s.enemyHp=s.enemyMaxHp;
  s.activeParty=members.slice();s.activeFormationPreset=preset||'';
  if(preset) s.formationPresets[preset]=members.slice();
  members.forEach(function(id){s.spirits[id]=10;s.heroResource[id]=75;});
  s.achieved.labmaster=true;
  return s;
};
window.runP207FormationQa = function(b,ctx,assert,parity){
  var copy=function(x){return JSON.parse(JSON.stringify(x));}, get=function(){return b.getState();}, t=b.formationTest;
  var checks=0;
  function ok(v,msg){checks++;assert(v,msg);}
  function same(a,c,msg){ok(JSON.stringify(a)===JSON.stringify(c),msg+' '+JSON.stringify(a));}
  function valid(s){ok(s.activeParty.length>0 && s.activeParty.length<=5,'one to five combat slots');ok(new Set(s.activeParty).size===s.activeParty.length,'unique active slots');s.activeParty.forEach(function(id){ok(s.spirits[id]>0,'only powered members active: '+id);});}
  function seed(ids,preset){return window.p207Seed(b,ids,preset);}
  function ascend(ids,preset){b.setState(seed(ids,preset));b.ascendManual();b.feedbackSave();return get();}
  function fund(n){var s=get();s.lumen=n;b.setState(s);}
  function buy(id){var before=get(),cost=t.cost(id);t.buy(id);var after=get();ok(before.lumen-after.lumen===cost,'exact legitimate Lumen debit '+id);ok(after.spirits[id]===before.spirits[id]+1,'one purchased level '+id);valid(after);}
  var targets=[['stone','ember','tide'],['tide','stone','gale','thorn','void'],['void','tide'],['stone','tide','gale'],['ember']];
  targets.forEach(function(ids,i){
    var preset=i===3?'':'boss',before=seed(ids,preset),presets=copy(before.formationPresets);
    b.setState(before);b.ascendManual();b.feedbackSave();var after=get();
    same(after.activeParty,['ember'],'temporary powered Ember only');
    Object.keys(after.spirits).forEach(function(id){ok(after.spirits[id]===(id==='ember'?1:0),'normal level reset '+id);ok(after.heroResource[id]===0,'resource reset '+id);});
    ok(after.lumen===0,'Lumen reset');valid(after);same(after.formationPresets,presets,'presets never overwritten');
    if(ids.length>1){same(after.formationRebuild.members,ids,'capture ordered intent before mutation');ok(after.activeFormationPreset==='','pending preset not advertised active');}
    ids.slice().reverse().forEach(function(id){if(id==='ember')return;fund(t.cost(id));buy(id);var s=get();same(s.activeParty,ids.filter(function(x){return s.spirits[x]>0;}),'progressive target order');});
    after=get();same(after.activeParty,ids,'exact final membership/order');ok(after.formationRebuild===null,'completed intent cleared');ok(after.activeFormationPreset===preset,'restore only original matching preset');
  });
  var s=ascend(['tide','stone'],'boss');
  s.lumen=1e6;b.setState(s);
  // Existing cheapest-first policy buys Ember again before level-0 Tide.
  var cost=t.cost('ember'),before=get();ok(cost<t.cost('tide'),'fixture cheaper Ember');ok(t.tick(),'purchase');
  same(get().activeParty,['ember'],'no free recruitment');ok(get().spirits.ember===2 && get().spirits.tide===0,'no level-0-first priority');ok(before.lumen-get().lumen===cost,'auto cost uses spiritCost');
  s=get();s.empowerQueue.ember=false;s.empowerQueue.tide=false;b.setState(s);before=get();cost=t.cost('stone');ok(t.tick(),'enabled missing Stone eligible');
  ok(get().spirits.stone===1 && get().spirits.tide===0 && get().spirits.ember===2,'per-Wisp OFF respected');same(get().activeParty,['stone'],'startup Ember removed once target can fight');
  Object.keys(get().spirits).filter(function(id){return !['ember','stone'].includes(id);}).forEach(function(id){ok(get().spirits[id]===0,'no unrelated purchases '+id);});
  s=ascend(['tide','stone']);fund(1e8);b.autoEmpowerAll(false);s=get();ok(!s.empowerQueue.ember && !s.empowerQueue.tide && !s.empowerQueue.stone,'All OFF includes pending');ok(!t.tick(),'All OFF no purchase');same(get().spirits,s.spirits,'All OFF exact levels');
  b.autoEmpowerAll(true);ok(get().empowerQueue.tide && get().empowerQueue.stone,'All ON includes pending');
  s=get();s.achieved.labmaster=false;b.setState(s);before=get();ok(!t.tick(),'no automation before unlock');same(get().spirits,before.spirits,'locked automation zero levels');
  s=ascend(['tide']);s.empowerQueue.ember=false;s.lumen=59;b.setState(s);before=get();ok(!t.tick(),'unaffordable purchase rejected');same(get().spirits,before.spirits,'no unaffordable level');ok(get().lumen===59,'no reservation');fund(60);buy('tide');
  // Repeated Ascension during a partial rebuild retains the original target.
  s=ascend(['void','tide','stone'],'boss');fund(60);buy('tide');s=get();s.depth=101;s.enemyDepth=101;b.setState(s);b.ascendManual();same(get().formationRebuild.members,['void','tide','stone'],'repeat preserves original intent');same(get().activeParty,['ember'],'repeat resets levels/startup');
  // Invalid player actions must not cancel; successful actions must cancel.
  ok(!b.applyFormationPreset('boss'),'unpowered preset apply fails');ok(!!get().formationRebuild,'failed apply retains intent');t.toggle('ember');ok(!!get().formationRebuild,'cannot bench last active; retain intent');
  fund(60);buy('tide');t.toggle('ember');ok(get().formationRebuild===null,'successful Field cancels intent');
  s=ascend(['void','stone'],'boss');ok(b.applyFormationPreset('push'),'explicit Ember preset succeeds');ok(get().formationRebuild===null,'preset supersedes intent');
  s=ascend(['void','stone'],'boss');ok(b.saveFormationPreset('farm'),'explicit save succeeds');ok(get().formationRebuild===null,'saving current formation accepts current membership');
  s=ascend(['tide','stone'],'boss');s.formationPresets.boss=['ember'];b.setState(s);fund(60);buy('tide');fund(360);buy('stone');ok(get().activeFormationPreset==='','edited preset association not restored');
  // No unpowered combat, ability, support or Bond contribution, even with queued resources.
  s=ascend(['tide','stone','gale','thorn','void']);s.achieved.labmaster=false;
  ['tide','stone','gale','thorn','void'].forEach(function(id){s.heroResource[id]=100;});
  b.setState(s);var formula=b.wispFormulaSnapshot('ember'),bonds=b.activeBondIds(),pendingRun=b.simulate(0.5,'live',0.5,2000000000000);
  var control=copy(s);control.formationRebuild=null;b.setState(control);
  same(b.wispFormulaSnapshot('ember'),formula,'pending no formula benefit');same(b.activeBondIds(),bonds,'pending no Bonds');
  var controlRun=b.simulate(0.5,'live',0.5,2000000000000);pendingRun.state.formationRebuild=null;
  parity(pendingRun.state,controlRun.state,'pending no damage/support/ability benefit');
  // Malformed/legacy input is bounded and can never recruit or grant resources.
  var bad=[null,[],7,'oops',{}, {members:'tide'}, {members:['unknown','__proto__',3]}, {members:['void','tide','tide','stone','gale','thorn','aurora','titan'],preset:'bad'}];
  bad.forEach(function(raw){var x=b.freshStateSnapshot();x.formationRebuild=raw;var y=b.setState(x);same(y.spirits,x.spirits,'malformed no level grants');ok(y.lumen===0,'malformed no Lumen');ok(y.formationRebuild===null,'locked/invalid IDs discarded');});
  s=b.freshStateSnapshot();s.maxDepthEver=101;s.formationRebuild={members:['void','tide','tide','stone','gale','thorn','aurora','titan'],preset:'bad',lumen:1e9,levels:100};var normalized=b.setState(s);
  same(normalized.formationRebuild,{members:['void','tide','stone','gale','thorn'],preset:''},'bounded ordered sanitized intent');same(normalized.spirits,s.spirits,'malformed extra fields cannot grant progression');
  s=b.freshStateSnapshot();delete s.formationRebuild;ok(b.setState(s).formationRebuild===null,'existing schema-v1 default');delete s.schemaVersion;ok(b.setState(s).formationRebuild===null,'legacy default');ok(b.setState(b.freshStateSnapshot()).formationRebuild===null,'fresh default');
  s=b.freshStateSnapshot();s.lumen=1e12;b.setState(s);before=get();t.buy('titan');same(get().spirits,before.spirits,'manual locked recruitment rejected');ok(get().lumen===before.lumen,'locked purchase costs nothing');
  // Real UI controls remain reachable for pending members.
  s=ascend(['tide','stone'],'boss');b.renderLayout();b.resetFeedback();document.querySelector('[data-tab="spirits"]').click();
  var card=document.querySelector('[data-wisp-card="tide"]'),button=card.querySelector('[data-empower-queue="tide"]');
  ok(card.textContent.includes('Pending') && card.textContent.includes('No power or Bonds'),'pending card explicit zero benefits');ok(button && !button.disabled,'pending Auto-Empower reachable');button.click();ok(get().empowerQueue.tide===false,'pending control turns OFF');
  ok(document.getElementById('formation-presets').textContent.includes('temporary startup support'),'temporary Ember labelled');
  ok(document.getElementById('formation-presets').textContent.includes('Auto-Empower OFF'),'pending OFF labelled');
  button=document.querySelector('[data-empower-queue="tide"]');ok(button.getAttribute('aria-pressed')==='false','pending OFF exposes semantic state');
  // Negative controls: prove the contract detects lost intent and free active slots.
  var negative=[];
  ['intent','powered'].forEach(function(kind){
    b.setState(seed(['tide','stone'],'boss'));var undo=t.mutate(kind),caught=false;
    try{b.ascendManual();var x=get();assert(x.formationRebuild && x.formationRebuild.members.join(',')==='tide,stone','negative lost intent');assert(x.activeParty.every(function(id){return x.spirits[id]>0;}),'negative unpowered slot');}catch(e){caught=true;}finally{undo();}
    ok(caught,'negative control detected '+kind);negative.push(kind);
  });
  return {checks:checks,targets:targets,negativeControls:negative,schema:1};
};
window.runP207ChronologyQa = function(b,ctx,assert,parity,summaryParity){
  var t=b.formationTest,clock=2000000000000,copy=function(x){return JSON.parse(JSON.stringify(x));};
  function compare(seed,seconds,kind,label){
    b.setState(seed);var direct=b.simulate(seconds,kind,seconds,clock);
    b.setState(seed);var reference=b.simulate(seconds,kind,0.1,clock);
    parity(direct.state,reference.state,label+' small-step');summaryParity(direct.summary,reference.summary,label+' summary');
    if(kind==='offline'){b.setState(seed);var offline=b.simulateOfflineDirect(seconds,clock);parity(offline.state,direct.state,label+' offline wrapper');summaryParity(offline.summary,direct.summary,label+' offline summary');}
    return direct;
  }
  var seed=window.p207Seed(b,['tide','stone'],'boss');b.setState(seed);b.ascendManual();
  seed=b.getState();seed.empowerQueue.ember=false;seed.lumen=1000000;seed.depth=101;seed.enemyDepth=101;seed.enemyMaxHp=b.enemyHpFor(101);seed.enemyHp=seed.enemyMaxHp;
  seed.autoAscendEnabled=false;
  b.setState(seed);var initial=b.getState();var cost=t.cost('tide');
  var before=b.simulateTimeline(0.999,'live',clock);assert(before.summary.empowers===0 && before.state.spirits.tide===0,'no purchase before existing 1-second cadence');
  var at=b.simulateTimeline(0.001,'live',clock+999);assert(at.summary.empowers===1 && at.state.spirits.tide===1,'exactly one purchase at cadence boundary');
  assert(initial.lumen-at.state.lumen===cost,'exact first purchase debit without kill income');
  var control=copy(initial);control.achieved.labmaster=false;b.setState(control);var unchanged=b.simulate(1,'live',1,clock);
  assert(at.state.enemyHp===unchanged.state.enemyHp,'rebuilt power never applied retrospectively before purchase boundary');
  b.setState(at.state);var later=b.simulate(0.5,'live',0.5,clock+1000);
  b.setState(unchanged.state);var noPurchase=b.simulate(0.5,'live',0.5,clock+1000);
  assert(later.state.enemyHp<noPurchase.state.enemyHp,'rebuilt power applies only to subsequent time');
  ['live','offline'].forEach(function(kind){var r=compare(initial,12,kind,'rebuild '+kind);assert(r.summary.empowers===12,'one purchase per second '+kind);assert(r.state.lumen>=0,'never overspend '+kind);});
  // Authoritative Auto-Ascend inside an offline window, followed by real rebuilding.
  seed=copy(ctx.fixtures['chronology-auto-ascend-mid-window'].save);
  seed.activeParty=['tide','ember','stone'];seed.spirits.tide=1;seed.spirits.stone=1;seed.maxDepthEver=101;
  seed.activeFormationPreset='boss';seed.formationPresets={push:['ember'],farm:['ember'],boss:seed.activeParty.slice()};
  seed.achieved.labmaster=true;seed.empowerQueue.ember=true;seed.empowerQueue.tide=true;seed.empowerQueue.stone=true;
  b.setState(seed);seed=b.getState();var auto=b.simulateTimeline(300,'offline',clock);
  var ascend=auto.timeline.find(function(e){return e.type==='autoAscend';});
  assert(ascend && ascend.elapsedSec>0 && ascend.elapsedSec<300,'Auto-Ascend happens mid-window');
  var purchase=auto.timeline.find(function(e){return e.type==='autoEmpower' && e.elapsedSec>ascend.elapsedSec;});
  assert(purchase,'post-Ascension legitimate intended purchase within window');
  b.setState(seed);var first=b.simulate(ascend.elapsedSec,'offline',ascend.elapsedSec,clock);
  assert(first.state.formationRebuild && first.state.formationRebuild.members.join(',')==='tide,ember,stone','authoritative Auto preserves exact original order');
  var second=b.simulate(300-ascend.elapsedSec,'offline',300-ascend.elapsedSec,clock+ascend.elapsedSec*1000);
  parity(second.state,auto.state,'split exactly at Auto-Ascend');
  compare(seed,300,'offline','mid-window Ascension');compare(seed,30,'live','live Auto-Ascend');
  // Shared economy ordering remains protected while a missing intended Wisp participates.
  var economy=copy(ctx.fixtures['chronology-simultaneous-order'].save);
  economy.formationRebuild={members:['gale','tide'],preset:''};economy.empowerQueue.tide=true;economy.studyQueue.guardmastery=true;economy.shards=10000;
  b.setState(economy);economy=b.getState();
  var competition=compare(economy,7,'offline','Research/Study/Wisp competition');
  assert(competition.summary.empowers>0 && competition.summary.researchBought>0 && competition.summary.studiesStarted>0,'exercise all three spenders '+JSON.stringify(competition.summary));
  var spent=t.spent(economy,competition.state);
  assert(Math.abs(economy.lumen+competition.summary.lumenGained-spent.lumen-competition.state.lumen)<1e-6,'exact shared Lumen ledger: no double spend');
  assert(Math.abs(economy.shards+competition.summary.shardGained-spent.shards-competition.state.shards)<1e-6,'exact shared Shard ledger: no double spend');
  assert(competition.state.lumen>=0 && competition.state.shards>=0,'shared currency cannot go negative');
  return {cadence:'one purchase per second',ascendSec:ascend.elapsedSec,firstRebuildPurchaseSec:purchase.elapsedSec,autoAscends:auto.summary.ascends,liveReference:true,offlineReference:true,split:true,spenders:competition.summary};
};
window.runP207LayoutQa = async function(b,ctx,assert){
  var p=new URLSearchParams(location.search),q=function(s){return document.querySelector(s);};
  assert(innerWidth===Number(p.get('width')) && innerHeight===Number(p.get('height')),'exact pending viewport');
  document.documentElement.style.setProperty('--safe-top',p.get('safeTop')+'px');document.documentElement.style.setProperty('--safe-bottom',p.get('safeBottom')+'px');
  var style=document.createElement('style');style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;}';document.head.appendChild(style);
  b.setState(window.p207Seed(b,['void','tide','stone','gale','thorn'],'boss'));b.ascendManual();b.resetFeedback();b.renderLayout();
  q('[data-tab="spirits"]').click();await document.fonts.ready;
  assert(document.documentElement.scrollWidth<=innerWidth,'no document horizontal overflow');
  assert(q('#formation-presets').scrollWidth<=q('#formation-presets').clientWidth+1,'intent labels fit');
  var root=q('#formation-presets');root.scrollIntoView({block:'start'});
  assert(root.textContent.includes('temporary startup support'),'startup support explained');
  ['void','tide','stone','gale','thorn'].forEach(function(id){
    var card=q('[data-wisp-card="'+id+'"]'),button=card.querySelector('[data-empower-queue]');
    assert(!card.classList.contains('active-wisp'),'pending card not shown active');
    assert(card.textContent.includes('No power or Bonds'),'pending contribution explicit');
    button.scrollIntoView({block:'center'});var r=button.getBoundingClientRect();
    assert(r.width>=44 && r.height>=44,'pending Auto-Empower touch target '+r.width+'x'+r.height+' '+card.className);
    assert(r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<q('nav.tabbar').getBoundingClientRect().top,'pending control reachable above nav');
    assert(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2).closest('[data-empower-queue]')===button,'pending control unobstructed');
    button.click();button=q('[data-empower-queue="'+id+'"]');assert(button.getAttribute('aria-pressed')==='false','pending toggle semantic OFF');
    assert(card.scrollWidth<=card.clientWidth+1,'pending Wisp fits width');
  });
  q('[data-tab="battle"]').click();
  assert(q('main').classList.contains('rift-scroll-locked') && q('main').scrollTop===0,'pending intent preserves Rift scroll lock');
  q('[data-tab="spirits"]').click();q('main').scrollTop=0;
  document.querySelectorAll('.ascend-flash').forEach(function(el){el.remove();});q('#toast').classList.remove('show');
  return {viewport:[innerWidth,innerHeight],pending:5,temporaryEmber:true,reachableToggles:5};
};

// PERSIST-01: use historical unlocks, with no powered intended member or Ember.
window.p207Contradictory = function(b){
  var s=b.freshStateSnapshot();s.maxDepthEver=101;
  s.formationRebuild={members:['tide','stone'],preset:''};
  s.spirits.ember=0;s.spirits.gale=1;s.activeParty=['gale'];
  s.lumen=12345;s.shards=456;s.heroResource.gale=37;
  return s;
};
window.runP207PersistenceReview = function(b,ctx,assert){
  var t=b.formationTest,checks=0;
  function ok(value,label){checks++;assert(value,label);}
  function same(a,c,label){ok(JSON.stringify(a)===JSON.stringify(c),label);}
  var input=window.p207Contradictory(b),out=t.canonical(input);
  ok(out.activeParty.join(',')==='ember','PERSIST-01 unrelated Gale retained: '+JSON.stringify(out.activeParty));
  ok(out.spirits.ember===1,'canonical Ember recovery happens in first pass');
  ok(out.spirits.tide===0 && out.spirits.stone===0,'pending members receive no free levels');
  same(out.formationRebuild,input.formationRebuild,'intent retained');
  var cases=[
    {name:'unpowered Ember',levels:{},members:['tide','stone'],party:['ember']},
    {name:'powered Ember',levels:{ember:3},members:['tide','stone'],party:['ember']},
    {name:'one intended',levels:{stone:2},members:['tide','stone'],party:['stone']},
    {name:'multiple intended',levels:{tide:2,stone:3},members:['stone','tide','void'],party:['stone','tide']},
    {name:'intended Ember fallback',levels:{},members:['tide','ember','stone'],party:['ember']},
    {name:'Ember completes fallback',levels:{},members:['ember'],party:['ember'],done:true},
    {name:'completed ordered',levels:{tide:2,stone:3},members:['stone','tide'],party:['stone','tide'],done:true}
  ];
  cases.forEach(function(c){
    var s=window.p207Contradictory(b);Object.assign(s.spirits,c.levels);
    s.formationPresets.boss=c.members.slice();s.formationRebuild={members:c.members,preset:'boss'};
    var n=t.canonical(s);same(n.activeParty,c.party,c.name+' first-pass active order');
    same(n.formationRebuild,c.done?null:s.formationRebuild,c.name+' intent/completion');
    ok(n.activeFormationPreset===(c.done?'boss':''),c.name+' preset association');
    var expectedLevels=Object.assign({},s.spirits);
    if(!c.members.some(function(id){return s.spirits[id]>0;}) && !s.spirits.ember) expectedLevels.ember=1;
    same(n.spirits,expectedLevels,c.name+' only established Ember fallback grant');
    ['lumen','shards','prisms','comets','motes','sigils','heroResource','empowerQueue','research','longStudyLevels'].forEach(function(k){same(n[k],s[k],c.name+' preserves '+k);});
    for(var i=0;i<4;i++)same(t.canonical(n),n,c.name+' fixed-clock full canonical idempotence '+i);
    b.advanceTime(1000);same(t.canonical(n),n,c.name+' later-clock canonical idempotence');
  });
  [undefined,null,[],{members:['unknown']},{members:'tide'}].forEach(function(intent){
    var s=window.p207Contradictory(b);s.formationRebuild=intent;
    var n=t.canonical(s);same(n.activeParty,['gale'],'absent/malformed keeps legitimate unrelated selection');
    same(n.spirits,s.spirits,'absent/malformed does not grant Ember');ok(n.formationRebuild===null,'invalid intent discarded');same(t.canonical(n),n,'invalid intent idempotent');
  });
  b.setState(input);var s=b.getState();s.achieved.labmaster=true;s.empowerQueue.ember=false;s.empowerQueue.tide=false;s.empowerQueue.stone=false;
  b.setState(s);ok(!t.tick(),'unrelated Gale cannot be auto-purchased after canonicalization');same(b.getState().spirits,s.spirits,'reserve progression intact');
  t.toggle('gale');s=b.getState();ok(s.formationRebuild===null,'explicit powered selection cancels intent');
  same(t.canonical(s).formationRebuild,null,'cancelled intent cannot resurrect');
  var detected=false,audit=t.audit(assert,'persist');
  try{var broken=t.canonical(input);assert(broken.activeParty.join(',')==='ember','PERSIST-01 negative retained Gale');}
  catch(e){detected=e.message.indexOf('PERSIST-01 negative retained Gale')!==-1;}
  finally{audit.restore();}
  ok(detected,'negative PERSIST-01 detected by same projection contract');
  return {checks:checks,cases:cases.map(function(c){return c.name;}),fullStateIdempotence:true,fixedClock:true,negativePersist:detected,schema:out.schemaVersion};
};

window.runP207FarmReview = function(b,ctx,assert,parity,summaryParity,isolated){
  var seed=b.getState(),clock=2000000000000,t=b.formationTest;
  // A non-Boss Push return has no automatic Boss retry path, regardless of
  // power growth. Keep automation/Auto-Ascend enabled and the medium economy.
  if(isolated){seed.farmReturnDepth=91;seed.maxDepthEver=Math.max(seed.maxDepthEver,91);b.setState(seed);seed=b.getState();}
  var audit=t.audit(assert),direct,counts;
  try{direct=b.simulateOfflineDirect(3600,clock);counts=JSON.parse(JSON.stringify(audit.counts));}
  finally{audit.restore();}
  if(isolated){
    assert(direct.state.riftMode==='farm','isolated Farm must remain Farm');
    assert(direct.state.depth===seed.farmDepth && direct.state.farmDepth===seed.farmDepth,'isolated Farm preserves correct depth');
    assert(direct.state.farmReturnDepth===seed.farmReturnDepth,'isolated Farm preserves Push return');
    assert(direct.summary.retries===0 && direct.summary.ascends===0 && direct.state.ascendCount===seed.ascendCount,'isolated Farm no exit or Ascension');
  }else{
    assert(seed.riftMode==='farm','integrated begins in Farm');
    assert(counts.retries>0 && counts.ascends>0 && counts.rebuildPurchases>0,'integrated exercises eligible retry, Ascension and paid reconstruction');
    assert(counts.retries===direct.summary.retries && counts.ascends===direct.summary.ascends && counts.purchases===direct.summary.empowers,'integrated summary accounts for every audited mutation');
  }
  b.setState(seed);var reference=b.simulate(3600,'offline',1,clock);
  parity(direct.state,reference.state,'Farm review strict offline reference');summaryParity(direct.summary,reference.summary,'Farm review reference summary');
  var splitAt=isolated?1234:1234.5;
  b.setState(seed);b.simulate(splitAt,'offline',splitAt,clock);
  var split=b.simulate(3600-splitAt,'offline',3600-splitAt,clock+splitAt*1000);
  parity(split.state,direct.state,'Farm review split window');
  b.setState(seed);var live=b.simulate(60,'live',60,clock);
  b.setState(seed);var liveRef=b.simulate(60,'live',1,clock);
  parity(live.state,liveRef.state,'Farm review live reference');summaryParity(live.summary,liveRef.summary,'Farm review live summary');
  assert(direct.summary.luminousKills>0 && direct.summary.motesGained>0,'medium economy exercises Luminous/Motes');
  assert(direct.summary.autoTaps>0 && direct.summary.empowers>0,'medium economy exercises both automations');
  assert(direct.summary.researchBought>0 && direct.summary.completedStudies.length>0,'medium economy exercises Research/Study');
  var negatives=[];
  (isolated?['farm-exit']:['premature','duplicate','free']).forEach(function(kind){
    b.setState(seed);var broken=t.audit(assert,kind),message='';
    try{b.simulateOfflineDirect(kind==='farm-exit'||kind==='premature'?1:3600,clock);}
    catch(e){message=e.message;}finally{broken.restore();}
    var expected={'farm-exit':'audit unauthorized Farm exit',premature:'audit premature Ascension',duplicate:'audit duplicate Ascension',free:'audit paid exactly once'}[kind];
    assert(message.indexOf(expected)!==-1,'targeted negative '+kind+' must fail its causal assertion: '+message);negatives.push(kind);
  });
  return {isolated:isolated,durationSec:3600,finalMode:direct.state.riftMode,farmDepth:direct.state.farmDepth,pushReturn:direct.state.farmReturnDepth,audited:counts,strictReference:true,split:true,negatives:negatives};
};

window.runP207TimerReview = function(b,ctx,assert,parity,summaryParity,near){
  var clock=2000000000000,t=b.formationTest,boundary=0.25,epsilon=0.0001,results=[];
  var seed=window.p207Seed(b,['tide','ember','stone'],'boss');
  seed.depth=15;seed.enemyDepth=15;seed.enemyMaxHp=b.enemyHpFor(15);seed.enemyHp=seed.enemyMaxHp;
  seed.activeParty.forEach(function(id){seed.spirits[id]=1;});
  seed.owned.autoascend=true;seed.autoAscendEnabled=true;seed.autoAscendTargetDepth=16;
  seed.achieved.autotap=true;seed.achieved.labmaster=true;seed._autoTapAccum=200;seed._autoEmpowerAccum=300;
  Object.keys(seed.heroResource).forEach(function(id){seed.heroResource[id]=17;seed.empowerQueue[id]=false;});
  seed.activeStudies=[{id:'wispascend',remainingSec:10,totalDurationSec:10,speedMult:1.5}];
  b.setState(seed);seed=b.getState();var beforeRate=t.rates().fill;
  seed.enemyHp=t.rates().dps*boundary;
  assert(seed.enemyHp>0 && seed.enemyHp<seed.enemyMaxHp,'boundary fixture passive kill precedes other events');
  function run(seconds,kind,chunk){b.setState(seed);return b.simulate(seconds,kind,chunk||seconds,clock);}
  function checkAt(r,label){
    assert(r.summary.ascends===1 && r.state.ascendCount===seed.ascendCount+1,label+' exactly one boundary Ascension');
    Object.keys(r.state.heroResource).forEach(function(id){near(r.state.heroResource[id],0,label+' reset ability '+id);});
    near(r.state._autoTapAccum,0,label+' reset Auto-Tap');near(r.state._autoEmpowerAccum,0,label+' reset Auto-Empower');
  }
  ['live','offline'].forEach(function(kind){
    var before=run(boundary-epsilon,kind);
    assert(before.summary.ascends===0,'immediately before no Ascension '+kind);
    seed.activeParty.forEach(function(id){near(before.state.heroResource[id],17+beforeRate*(boundary-epsilon),'normal pre-boundary resource '+id);});
    near(before.state._autoTapAccum,200+(boundary-epsilon)*1000,'normal pre-boundary tap');
    near(before.state._autoEmpowerAccum,300+(boundary-epsilon)*1000,'normal pre-boundary empower');
    var at=run(boundary,kind);checkAt(at,kind);
    b.setState(at.state);var afterRate=t.rates().fill;
    var after=run(boundary+epsilon,kind);
    assert(after.summary.ascends===1,'immediately after no duplicate Ascension');
    after.state.activeParty.forEach(function(id){near(after.state.heroResource[id],afterRate*epsilon,'post-boundary resource '+id);});
    near(after.state._autoTapAccum,epsilon*1000,'post-boundary tap');near(after.state._autoEmpowerAccum,epsilon*1000,'post-boundary empower');
    [before,at,after].forEach(function(r,i){var sec=[boundary-epsilon,boundary,boundary+epsilon][i];near(r.state.activeStudies[0].remainingSec,10-sec*1.5,'Study continuous across boundary');});
    var reference=run(boundary+epsilon,kind,0.01);parity(after.state,reference.state,'timer strict reference '+kind);summaryParity(after.summary,reference.summary,'timer summary '+kind);
    [boundary-epsilon,boundary,boundary+epsilon/2].forEach(function(split){
      run(split,kind);var end=b.simulate(boundary+epsilon-split,kind,boundary+epsilon-split,clock+split*1000);
      parity(end.state,after.state,'timer split '+kind+' '+split);
    });
    // Non-Ascension control retains the ordinary elapsed-time accrual.
    var normal=JSON.parse(JSON.stringify(seed));normal.autoAscendEnabled=false;b.setState(normal);
    var n=b.simulate(boundary+epsilon,kind,boundary+epsilon,clock);
    near(n.state._autoTapAccum,200+(boundary+epsilon)*1000,'non-Ascension tap');near(n.state._autoEmpowerAccum,300+(boundary+epsilon)*1000,'non-Ascension empower');
    normal.activeParty.forEach(function(id){near(n.state.heroResource[id],17+beforeRate*(boundary+epsilon),'non-Ascension ability '+id);});
    results.push({kind:kind,before:true,exact:true,after:true,splits:3,study:true,normal:true});
  });
  var broken=t.audit(assert,'timer'),message='';
  try{checkAt(run(boundary,'offline'),'negative old accrual');}catch(e){message=e.message;}finally{broken.restore();}
  assert(message.indexOf('negative old accrual reset ability')!==-1,'old erroneous accrual must fail reset resource assertion: '+message);
  return {boundarySec:boundary,offsetSec:epsilon,results:results,negativeOldAccrual:true};
};
