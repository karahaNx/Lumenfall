/* Real production starts, completions, time engine, DOM and persistence.
 * Price/work expectations and the original eight are independent oracles. */
window.inquiryOriginals=['wispascend','guardmastery','riftattune','shardstudy','lumenstudy','formationstudy','motestudy','prismstudy'];
window.inquirySeed=function(b,ctx){
  var s=b.freshStateSnapshot();s.depth=129;s.maxDepthEver=130;s.enemyDepth=129;
  s.enemyMaxHp=b.enemyHpFor(129);s.enemyHp=s.enemyMaxHp;
  s.lumen=1e9;s.shards=1e9;s.motes=1e6;s.questDay=ctx.currentDay();s.loginStreak=1;
  b.forge.deeds().items.forEach(function(d){s.achieved[d.id]=true;});
  Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=false;});
  return s;
};
window.runInquiryQa=function(b,ctx,assert,assertProtectedParity,assertSummaryParity){
  var checks=0,t=b.inquiry,q=function(s){return document.querySelector(s);};
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(){return window.inquirySeed(b,ctx);}
  function install(s){
    if(s.maxDepthEver<s.depth){s.depth=s.maxDepthEver;s.enemyDepth=s.depth;s.enemyMaxHp=b.enemyHpFor(s.depth);s.enemyHp=s.enemyMaxHp;}
    b.setState(s);b.renderLayout();
  }
  function active(id){return b.getState().activeStudies.find(function(a){return a.id===id;});}
  function mutationCaught(kind,contract){
    var undo=t.mutate(kind),caught=false;
    try{contract();}catch(e){caught=/Inquiry oracle/.test(e.message);}finally{undo();}
    ok(caught,'causal negative control catches '+kind);contract();
  }
  b.resetFeedback();
  if(ctx.scenario==='inquiry-contracts'){
    var nodes=t.nodes(),ids=nodes.map(function(n){return n.id;});
    same(ids,window.inquiryOriginals.concat('measuredinquiry'),'exact nine-study catalogue');
    same(t.originals(),window.inquiryOriginals,'frozen original target IDs');
    var fresh=b.freshStateSnapshot();ok(fresh.longStudyLevels.measuredinquiry===0&&!fresh.studyQueue.measuredinquiry,'fresh0/OFF');
    var current=seed();delete current.longStudyLevels.measuredinquiry;delete current.studyQueue.measuredinquiry;
    var normalized=b.forge.canonical(current);ok(normalized.longStudyLevels.measuredinquiry===0&&!normalized.studyQueue.measuredinquiry,'schema1 additive0/OFF');
    var legacy=seed();delete legacy.schemaVersion;delete legacy.studyQueue;legacy.owned.autostudy=true;
    var migrated=b.forge.canonical(legacy);
    window.inquiryOriginals.forEach(function(id){ok(migrated.studyQueue[id],'v0 original auto-study '+id);});
    ok(!migrated.studyQueue.measuredinquiry && migrated.schemaVersion===1,'v0 InquiryOFF, schema unchanged');
    [[0,30000,1200,600],[5,566870,22675,6291],[9,5950779,238031,41232],[10,10711402,428456,65971]].forEach(function(v){
      install(seed());same(t.cost('measuredinquiry',v[0]),{lumen:v[1],shard:v[2]},'precise raw price '+v[0]);
      ok(t.duration('measuredinquiry',v[0])===v[3],'precise own duration '+v[0]);
    });
    var paid={lumen:0,shard:0},work=0;
    for(var k=0;k<10;k++){var price=t.cost('measuredinquiry',k);paid.lumen+=price.lumen;paid.shard+=price.shard;work+=t.duration('measuredinquiry',k);}
    same(paid,{lumen:13351752,shard:534070},'exact cap commitment');ok(work===108951,'exact cap work commitment');
    [0,5,10,13].forEach(function(inquiry){
      var s=seed();s.longStudyLevels.measuredinquiry=inquiry;install(s);
      nodes.filter(function(n){return n.id!=='measuredinquiry';}).forEach(function(n){
        [0,5,10].forEach(function(k){
          var nominal=Math.round(n.baseDurationSec*Math.pow(1.6,k));
          ok(t.duration(n.id,k)===Math.round(nominal*(1-.02*Math.min(inquiry,10))),'nested rounding '+n.id+' '+k+'/'+inquiry);
        });
      });
      ok(t.duration('measuredinquiry',5)===6291,'Inquiry never self-discounts '+inquiry);
    });
    [0,5,10].forEach(function(inquiry){
      window.inquiryOriginals.forEach(function(id){
        var s=seed();s.longStudyLevels.measuredinquiry=inquiry;s.longStudyLevels[id]=5;install(s);
        var n=nodes.find(function(n){return n.id===id;}),D=Math.round(Math.round(n.baseDurationSec*Math.pow(1.6,5))*(1-.02*inquiry));
        if(n.retiredTo){var before=b.getState();ok(t.start(id)===false&&t.plan(id).reason==='retired','closed start '+id);same(b.getState(),before,'closed Study has no debit '+id);return;}
        ok(t.start(id)===true,'real start allowed '+id);var a=active(id);
        same(a,{id:id,remainingSec:D,totalDurationSec:D,speedMult:1},'actual discounted snapshot '+id);
        var now=b.getState();ok(now.lumen===s.lumen-Math.round(n.lumenBase*Math.pow(1.8,5)) && now.shards===s.shards-Math.round(n.shardBase*Math.pow(1.8,5)),'actual debit '+id);
      });
    });
    function blocked(change,id,label){var s=seed();change(s);install(s);var before=b.getState();ok(t.start(id)===false,'blocked '+label);same(b.getState(),before,'no blocked mutation '+label);}
    blocked(function(s){s.maxDepthEver=59;},'measuredinquiry','depth59');
    blocked(function(s){s.lumen=29999;},'measuredinquiry','missing Lumen');
    blocked(function(s){s.shards=1199;},'measuredinquiry','missing Shards');
    blocked(function(s){s.activeStudies=[{id:'measuredinquiry',remainingSec:10,totalDurationSec:600,speedMult:1}];},'measuredinquiry','duplicate');
    blocked(function(s){s.activeStudies=window.inquiryOriginals.slice(0,5).map(function(id){return {id:id,remainingSec:100,totalDurationSec:200,speedMult:1};});},'measuredinquiry','full slots');
    blocked(function(){},'missing-study','unknown ID');blocked(function(){},null,'null ID');
    [10,13].forEach(function(k){blocked(function(s){s.longStudyLevels.measuredinquiry=k;},'measuredinquiry','cap raw'+k);});
    blocked(function(s){s.longStudyLevels.guardmastery=2000;},'guardmastery','nonfinite legacy start');
    ok(b.getState().longStudyLevels.guardmastery===2000,'finite guard is not ownership clamp');
    var unlocked=seed();unlocked.maxDepthEver=60;install(unlocked);ok(t.start('measuredinquiry'),'depth60 start');
    [1,39,40,59,60,89,90].forEach(function(depth){var s=seed();s.maxDepthEver=depth;install(s);ok(b.riftStatus.slots()===(depth<40?2:depth<60?3:depth<90?4:5),'unchanged slot matrix '+depth);});
    var deeds=seed();Object.keys(deeds.achieved).forEach(function(id){deeds.achieved[id]=false;});deeds.longStudyLevels.measuredinquiry=13;install(deeds);
    ['study1','study25','allstudies'].forEach(function(id){var d=b.forge.deeds().items.find(function(x){return x.id===id;});ok(!d.eligible && d.progress.current===0,'Inquiry excluded from '+id);ok(q('[data-deed-requirement="'+id+'"]').closest('.ach-card').querySelector('.deed-scope').textContent.includes('Measured Inquiry does not count.'),'visible Deed exception '+id);});
    deeds.longStudyLevels.guardmastery=24;install(deeds);ok(!b.forge.deeds().items.find(function(d){return d.id==='study25';}).eligible,'Inquiry13 cannot supply level25');
    deeds.longStudyLevels.guardmastery=25;install(deeds);ok(b.forge.deeds().items.find(function(d){return d.id==='study25';}).eligible,'original level25 still earns');
    deeds.longStudyLevels.guardmastery=0;window.inquiryOriginals.forEach(function(id){deeds.longStudyLevels[id]=1;});install(deeds);
    var every=b.forge.deeds().items.find(function(d){return d.id==='allstudies';});ok(every.eligible&&every.progress.target===5&&every.progress.current===5,'five retained targets require no Inquiry; old total credit retained');
    b.forge.achievements();var once=b.getState();b.forge.achievements();same(b.getState(),once,'sticky one-time grants');ok(b.forge.deeds().total===683,'unchanged683 pool');
    function ownDuration(){var s=seed();s.longStudyLevels.measuredinquiry=5;install(s);ok(t.duration('measuredinquiry',5)===6291,'Inquiry oracle: self-discount forbidden');}
    ownDuration();mutationCaught('self',ownDuration);
    return {checks:checks,catalogue:9,originals:8,cap:10,finiteGuards:true,negativeControls:1};
  }
  if(ctx.scenario==='inquiry-chronology'){
    var capped=seed();capped.longStudyLevels.measuredinquiry=9;capped.studyQueue.measuredinquiry=true;
    capped.activeStudies=[{id:'measuredinquiry',remainingSec:1,totalDurationSec:41232,speedMult:1}];install(capped);
    var result=t.tail(100);ok(result.state.longStudyLevels.measuredinquiry===10&&!result.state.activeStudies.length,'9 to10 once, queue cap skips');
    same(result.summary.completedStudies,['Measured Inquiry'],'only one earned completion');ok(result.summary.studiesStarted===0,'cap queue no currency spend');
    ok(t.boundary()===Infinity,'cap queue not zero economy boundary');
    var snapshot=result.state;result=t.tail(100);same(result.state,snapshot,'cap idle no new mutation');
    function disposalCount(){var s=seed();s.longStudyLevels.measuredinquiry=13;s.activeStudies=[{id:'measuredinquiry',remainingSec:0,totalDurationSec:600,speedMult:8}];install(s);var d=t.due();ok(d.handled===1,'Inquiry oracle: due disposal counts scheduler progress');ok(!d.summary.completedStudies.length&&d.summary.closedStudies.length===1,'no false completion');}
    disposalCount();mutationCaught('handled',disposalCount);
    var over=seed();over.longStudyLevels.measuredinquiry=13;over.studyQueue.measuredinquiry=true;
    over.activeStudies=[{id:'measuredinquiry',remainingSec:0,totalDurationSec:600,speedMult:8},{id:'guardmastery',remainingSec:7,totalDurationSec:150,speedMult:1}];install(over);
    var before=b.getState();result=t.tail(10);
    ok(result.state.longStudyLevels.measuredinquiry===13&&result.state.longStudyLevels.guardmastery===1&&!result.state.activeStudies.length,'overcap closes then later legacy completes in SAME tail');
    same(result.summary.completedStudies,["Guardian's Mastery"],'no fake earned name');same(result.summary.closedStudies,['Measured Inquiry'],'neutral closing tracked');
    ok(result.state.lumen===before.lumen&&result.state.shards===before.shards&&result.state.comets===before.comets,'no refund or Deed-credit for disposal');
    over.activeStudies=over.activeStudies.slice(0,1);install(over);same(t.oldComplete(0),[],'alternate helper no earned overcap');ok(b.getState().longStudyLevels.measuredinquiry===13&&!b.getState().activeStudies.length,'alternate helper preserves raw and closes');
    function dueEntry(){var s=seed();s.activeStudies=[{id:'measuredinquiry',remainingSec:0,totalDurationSec:600,speedMult:1}];s.studyQueue.guardmastery=true;install(s);var r=t.tail(1);ok(r.state.longStudyLevels.measuredinquiry===1 && active('guardmastery').totalDurationSec===147,'Inquiry oracle: completion BEFORE entry queue start');ok(active('guardmastery').remainingSec===146,'entry tail work not lost');}
    dueEntry();mutationCaught('entry',dueEntry);
    var due=seed();due.activeStudies=[{id:'measuredinquiry',remainingSec:0,totalDurationSec:600,speedMult:1}];due.studyQueue.guardmastery=true;install(due);ok(t.autoFill(),'alternate auto-fill starts after completion');ok(active('guardmastery').totalDurationSec===147,'auto-fill uses committed Inquiry1');
    var autos=seed();autos.longStudyLevels.measuredinquiry=5;autos.studyQueue.guardmastery=true;install(autos);ok(t.queued().studiesStarted===1&&active('guardmastery').totalDurationSec===135,'simulation queued start same discount');
    var simultaneous=seed();simultaneous.longStudyLevels.measuredinquiry=4;
    simultaneous.activeStudies=[{id:'measuredinquiry',remainingSec:1,totalDurationSec:3932,speedMult:1},{id:'guardmastery',remainingSec:1,totalDurationSec:150,speedMult:1},{id:'wispascend',remainingSec:50,totalDurationSec:180,speedMult:2}];
    simultaneous.studyQueue.guardmastery=true;
    function simultaneousRun(reverse){var s=JSON.parse(JSON.stringify(simultaneous));if(reverse)s.activeStudies.reverse();install(s);return t.tail(1);}
    var forward=simultaneousRun(false),reversed=simultaneousRun(true);
    same(forward.state.longStudyLevels,reversed.state.longStudyLevels,'simultaneous levels independent of array order');
    var sort=function(a){return a.slice().sort(function(a,c){return a.id.localeCompare(c.id);});};same(sort(forward.state.activeStudies),sort(reversed.state.activeStudies),'simultaneous start snapshots independent of array order');
    same([forward.state.lumen,forward.state.shards],[reversed.state.lumen,reversed.state.shards],'simultaneous spend order independent');
    ok(active('guardmastery').totalDurationSec===216,'new start uses completed Inquiry5 and target level1');
    same(active('wispascend'),{id:'wispascend',remainingSec:48,totalDurationSec:180,speedMult:2},'existing work snapshot untouched except elapsed progress');
    function chronology(kind,chunk){install(simultaneous);return b.simulate(10,kind,chunk,2000000000000);}
    var live=chronology('live',10),offline=chronology('offline',10),split=chronology('live',.1);
    assertProtectedParity(live.state,offline.state,'Inquiry live/offline');assertSummaryParity(live.summary,offline.summary,'Inquiry live/offline');
    assertProtectedParity(live.state,split.state,'Inquiry chunk/resume');assertSummaryParity(live.summary,split.summary,'Inquiry chunk/resume');
    install(simultaneous);var tail=t.tail(10);same(tail.state.longStudyLevels,live.state.longStudyLevels,'study-only earned parity');same(sort(tail.state.activeStudies),sort(live.state.activeStudies),'study-only snapshots/work parity');same([tail.state.lumen,tail.state.shards],[live.state.lumen,live.state.shards],'study-only spend parity');
    var events=offline.timeline||offline.summary.timeline||[];
    var full=seed();full.longStudyLevels.measuredinquiry=13;
    full.activeStudies=[{id:'measuredinquiry',remainingSec:43201,totalDurationSec:43201,speedMult:1},{id:'guardmastery',remainingSec:43202,totalDurationSec:43202,speedMult:1}];install(full);b.setLastSeen(b.clockNow()-43203*1000);
    var actual=b.applyOfflineNow();ok(actual.effectiveSec===43200 && b.getState().longStudyLevels.guardmastery===1&&b.getState().longStudyLevels.measuredinquiry===13,'actual applyOfflineProgress continues studies past12h cap');
    same(actual.completedStudies,["Guardian's Mastery"],'actual offline report earned only');same(actual.closedStudies,['Measured Inquiry'],'actual offline neutral disposal');
    return {checks:checks,negativeControls:2,capCompletion:true,overcapTail:true,dueEntry:true,arrayOrder:true,liveOfflineChunkParity:true,actual12hTail:true,timelineEvents:events.length};
  }
  // Actual current Lab controls and observer purity, including small viewports.
  [0,5,10,13].forEach(function(k){
    var s=seed();s.longStudyLevels.measuredinquiry=k;s.studyQueue.measuredinquiry=k>=10;install(s);
    q('[data-tab="research"]').click();var card=q('[data-study-card="measuredinquiry"]'),button=q('[data-study="measuredinquiry"]'),earned=q('[data-project-effect="measuredinquiry"]');
    ok(earned.textContent.includes((Math.min(k,10)*2)+'% less work'),'earned work percentage '+k);
    ok(!card.textContent.includes('20% faster')&&!card.textContent.includes('80x'),'accurate throughput wording');
    ok(button.disabled===(k>=10)&&button.getAttribute('aria-label').includes('Measured Inquiry'),'actual native disabled and accessible label '+k);
    if(k>=10)ok(button.dataset.state==='maxed'&&!button.getAttribute('aria-label').includes('Need'),'cap accessible state has no affordability claim');
    if(k>=10){ok(!card.querySelector('.study-meta')&&!/Next: level (11|14)/.test(card.textContent),'no cap next price or fake nextlevel');ok(card.textContent.includes('Queue ON retained; no new starts.'),'cap retained queue status');}
    else ok(card.textContent.includes('Next: level '+(k+1))&&card.textContent.includes((k*2+2)+'% less work'),'pending next distinct from earned');
    if(k===13)ok(earned.textContent.includes('Preserved; effect capped at level 10'),'overcap ownership explained');
    var before=b.getState(),raw=b.rawSave();b.renderLayout();b.refreshAffordability();same(b.getState(),before,'render/affordability pure');ok(b.rawSave()===raw,'render cannot save/complete');
    ok(q('#tab-research').scrollWidth<=q('#tab-research').clientWidth,'Lab no horizontal overflow '+k);
  });
  var locked=seed();locked.maxDepthEver=59;install(locked);q('[data-tab="research"]').click();ok(!q('[data-study="measuredinquiry"]')&&q('#study-list').textContent.includes('Unlocks at Rift 60'),'locked60 visible without purchase');
  var running=seed();running.longStudyLevels.measuredinquiry=5;running.activeStudies=[{id:'measuredinquiry',remainingSec:0,totalDurationSec:6291,speedMult:1}];install(running);
  var before=b.getState();ok(q('[data-study-text="measuredinquiry"]').textContent==='Finishing…','due UI remains pending');b.renderLayout();same(b.getState(),before,'Finishing render cannot earn');
  ok(q('[data-running-study="measuredinquiry"]').textContent.includes('10% less work')&&q('[data-running-study="measuredinquiry"]').textContent.includes('Next: 12% less work'),'earned/pending distinction');
  running.longStudyLevels.measuredinquiry=13;running.activeStudies[0].remainingSec=50;install(running);var over=q('[data-running-study="measuredinquiry"]');
  ok(!over.textContent.includes('level 14')&&!over.textContent.includes('Lv.14')&&over.textContent.includes('without another level or bonus'),'neutral overcap paid-record presentation');
  ok(Array.from(over.querySelectorAll('[data-speed-study]')).every(function(el){return el.disabled;}),'no new paid acceleration for maxed record');
  var speed=seed();speed.longStudyLevels.measuredinquiry=10;install(speed);ok(t.start('guardmastery'),'real legacy start at Inquiry cap');q('[data-study-details="guardmastery"]').click();
  var prior=b.getState();q('[data-speed-study="guardmastery"][data-speed="8"]').click();var accelerated=b.getState();
  ok(t.speedCost(8)===473&&accelerated.motes===prior.motes-473&&active('guardmastery').speedMult===8,'8x unchanged473 actual debit');
  ok(active('guardmastery').remainingSec===120&&active('guardmastery').totalDurationSec===120,'speed preserves discounted snapshot');
  ok(q('[data-study-text="guardmastery"]').textContent==='15s remaining · 8x','capdiscount plus8x actual countdown');
  q('[data-study-details="guardmastery"]').focus();q('[data-study-queue="guardmastery"]').click();ok(document.activeElement.dataset.studyDetails==='guardmastery','Details focus preserved on rerender');
  t.tail(15);ok(active('guardmastery').speedMult===1&&active('guardmastery').totalDurationSec===192,'next queued start resets speed1');
  var saved=active('guardmastery');var changed=b.getState();changed.longStudyLevels.measuredinquiry=13;install(changed);same(active('guardmastery'),saved,'render/overcap cannot retroactively change paid work');
  b.feedbackSave();var persisted=JSON.parse(b.rawSave());ok(persisted.studyQueue.guardmastery,'real queue choice persists');
  q('[data-tab="battle"]').click();var main=q('main');ok(main.classList.contains('rift-scroll-locked')&&main.scrollTop===0&&main.scrollHeight<=main.clientHeight+1,'Rift remains scroll-free');
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;ok(reduced===(ctx.scenario==='inquiry-ui-reduced-motion'),'requested motion mode');
  return {checks:checks,viewport:[innerWidth,innerHeight],nativeStates:true,observerPurity:true,speed8:473,capQueue:true,reducedMotion:reduced};
};

window.runInquiryPersistence=function(b,ctx,assert,phase,nextPhase,backupCode,finish){
  var keys=['schemaVersion','longStudyLevels','studyQueue','activeStudies','lumen','shards','motes','comets'];
  if(phase()===0){
    var s=window.inquirySeed(b,ctx);s.longStudyLevels.measuredinquiry=13;s.studyQueue.measuredinquiry=true;
    s.activeStudies=[{id:'measuredinquiry',remainingSec:531,totalDurationSec:600,speedMult:8},{id:'guardmastery',remainingSec:77,totalDurationSec:120,speedMult:2}];
    b.setState(s);b.feedbackSave();var expected=b.getState();
    localStorage.setItem('inquiry-expected',JSON.stringify(expected));nextPhase(1);
    if(ctx.scenario==='inquiry-reset'){b.reset();return;}
    if(ctx.scenario==='inquiry-backup-restore'){b.setState(b.freshStateSnapshot());b.restoreBackup(backupCode(expected));return;}
    if(ctx.scenario==='inquiry-recovery')b.formationTest.corruptPrimary();
    b.suppressUnloadSave();location.reload();return;
  }
  var state=b.getState(),expected=JSON.parse(localStorage.getItem('inquiry-expected'));
  if(ctx.scenario==='inquiry-reset'){
    assert(state.schemaVersion===1&&state.longStudyLevels.measuredinquiry===0&&!state.studyQueue.measuredinquiry&&!state.activeStudies.length,'Reset new fields0/OFF and no paid work');
    finish('pass',{reset:true});return;
  }
  keys.forEach(function(key){assert(JSON.stringify(state[key])===JSON.stringify(expected[key]),'actual '+ctx.scenario+' preserves '+key);});
  assert(state.longStudyLevels.measuredinquiry===13,'raw13 retained after real persistence');
  assert(JSON.stringify(JSON.parse(b.rawRecovery()).activeStudies)===JSON.stringify(expected.activeStudies),'recovery paid snapshots retained');
  state.depth=16;state.enemyDepth=16;state.enemyMaxHp=b.enemyHpFor(16);state.enemyHp=state.enemyMaxHp;b.setState(state);
  b.ascendManual();var ascended=b.getState();
  ['longStudyLevels','studyQueue','activeStudies'].forEach(function(key){assert(JSON.stringify(ascended[key])===JSON.stringify(expected[key]),'actual Ascension preserves '+key);});
  assert(ascended.lumen===0&&ascended.shards===expected.shards,'existing Ascension currency reset unchanged');
  finish('pass',{keys:keys,raw:13,schema:1,snapshots:true,ascension:true,restore:ctx.scenario==='inquiry-backup-restore',recovery:ctx.scenario==='inquiry-recovery'});
};
