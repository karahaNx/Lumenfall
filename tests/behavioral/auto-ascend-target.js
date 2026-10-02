/* Fixed clear-Rift target: real controls/handlers and independent boundary oracles. */
window.autoTargetSeed=function(b,clear,enabled){
  var s=b.freshStateSnapshot();s.owned.autoascend=true;s.autoAscendEnabled=!!enabled;
  s.autoAscendTargetDepth=clear+1;s.maxDepthEver=101;s.depth=1;s.enemyDepth=1;
  s.enemyHp=s.enemyMaxHp=b.enemyHpFor(1);s.questDay=b.currentDay();s.loginStreak=1;
  return s;
};
window.autoTargetObservation=function(b){
  return {state:b.getState(),primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace(),persistence:b.persistenceStatus(),flags:b.autoTarget.flags()};
};
window.runAutoTargetWindows=function(b,assert){
  var checks=0,records=[],copy=x=>JSON.parse(JSON.stringify(x));
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function el(){return document.querySelector('[data-autoascend-target]');}
  function windowInfo(){var s=el();return {start:Number(s.dataset.windowStart),end:Number(s.dataset.windowEnd),values:Array.from(s.options).map(o=>o.value),value:s.value,key:s.dataset.optionsKey};}
  function budget(){
    var w=windowInfo(),target=b.getState().autoAscendTargetDepth-1;
    var pinned=target<w.start||target>w.end,count=w.end-w.start+1;
    ok(count>=1&&count<=200&&w.values.length===count+(pinned?1:0),'window budget <=200 consecutive options plus at most one saved target');
    for(var i=0;i<count;i++)ok(w.values[i]===String(w.start+i),'window integer continuity '+i);
    ok(w.value===String(target),'window preserves precise current target');
    if(pinned)ok(w.values.at(-1)===String(target)&&el().options[el().options.length-1].textContent.endsWith('(saved target)'),'pinned current/saved target exact');
    return w;
  }
  [214,215,216,10001,Math.pow(2,53),1e30,Number.MAX_VALUE].forEach(function(history){
    var s=autoTargetSeed(b,43,false);s.maxDepthEver=history;b.setState(s);b.feedbackSave();
    var before=autoTargetObservation(b);b.autoTarget.render();same(autoTargetObservation(b),before,'high-history render whole observer '+history);
    var highest=Math.min(Number.MAX_SAFE_INTEGER,Math.max(15,history-1));
    ok(b.getState().maxDepthEver===history,'canonical high history unchanged');
    ok(document.querySelector('[data-autoascend-nav]').hidden===(highest<=214),'small history has no navigation');
    ok(b.autoTarget.find('15'),'Find minimum');var first=budget();ok(first.start===15&&first.end===Math.min(214,highest),'exact first window endpoints');
    if(highest>214){
      ok(!b.autoTarget.shift(-1),'Earlier cannot pass global minimum');
      ok(b.autoTarget.shift(1),'Later advances');var second=budget();ok(second.start===first.end+1,'adjacent windows have no gap');
      ok(b.autoTarget.shift(-1),'Earlier returns');same(windowInfo(),first,'Earlier restores first window and selected target');
    }
    [43,55,10000,highest].filter(x=>x<=highest).forEach(function(clear){
      ok(b.autoTarget.find(String(clear)),'Find exact historical target '+clear);
      var w=budget();ok(w.start<=clear&&w.end>=clear&&w.values.includes(String(clear)),'Find makes requested target available');
      same(autoTargetObservation(b),before,'navigation is whole state/save/recovery/events/flags observer');
    });
    ok(!b.autoTarget.shift(1),'Later cannot pass last historical endpoint');
    var last=budget();ok(last.end===highest,'highest safe historical endpoint included');
    ['', 'NaN','Infinity','43.5','14',' 43','43.0','9007199254740992',null,43].forEach(function(value){
      var prior=windowInfo();ok(!b.autoTarget.find(value),'invalid Find rejected '+String(value));same(windowInfo(),prior,'invalid Find leaves window');same(autoTargetObservation(b),before,'invalid Find whole observer');
    });
    if(highest<Number.MAX_SAFE_INTEGER){ok(!b.autoTarget.find(String(highest+1)),'Find rejects unearned endpoint');same(autoTargetObservation(b),before,'outside history Find observer');}
    b.autoTarget.render();b.refreshAffordability();same(autoTargetObservation(b),before,'repeated high render/affordability whole observer');
    records.push({history,highest,first,last});
  });
  // Non-safe existing legacy values stay exact; safe new choices remain possible.
  [Math.pow(2,53),Math.pow(2,53)+2,1e30,Number.MAX_VALUE].forEach(function(internal){
    var s=autoTargetSeed(b,43,false);s.maxDepthEver=Math.pow(2,53);s.autoAscendTargetDepth=internal;b.setState(s);b.feedbackSave();
    var before=autoTargetObservation(b);b.autoTarget.render();budget();
    ok(b.getState().autoAscendTargetDepth===internal,'non-safe legacy internal preserved');
    ok(b.autoTarget.find('55'),'Find55 with huge saved target');budget();same(autoTargetObservation(b),before,'huge saved target navigation pure');
    b.autoTarget.change('55');var after=autoTargetObservation(b),expected=copy(before.state);expected.autoAscendTargetDepth=56;expected.lastSeen=b.clockNow();
    same(after.state,expected,'safe native selection replaces legacy only by explicit choice');
    ok(after.events.length===before.events.length+1,'explicit legacy replacement saves once');
  });
  // Every safe input at the arithmetic endpoint remains selectable; N=X+1 is exact.
  var s=autoTargetSeed(b,43,false);s.maxDepthEver=1e30;b.setState(s);b.feedbackSave();b.autoTarget.render();
  var before=autoTargetObservation(b);b.autoTarget.find(String(Number.MAX_SAFE_INTEGER));same(autoTargetObservation(b),before,'global safe maximum Find is pure');
  b.autoTarget.change(String(Number.MAX_SAFE_INTEGER));ok(b.getState().autoAscendTargetDepth===Math.pow(2,53),'highest safe clear stores exact N=clear+1');budget();
  b.autoTarget.find('15');before=autoTargetObservation(b);ok(!b.autoTarget.input('215'),'unoffered valid integer is rejected');same(autoTargetObservation(b),before,'unoffered selection whole observer');
  // Native navigation handlers remain single after repeated renders.
  b.autoTarget.find('15');for(var n=0;n<10;n++)b.autoTarget.render();before=autoTargetObservation(b);
  document.querySelector('[data-autoascend-later]').click();ok(windowInfo().start===215,'one Later click advances exactly one window');same(autoTargetObservation(b),before,'real Later click does not save');
  var find=document.querySelector('[data-autoascend-find]');find.value='55';document.querySelector('[data-autoascend-find-go]').click();ok(windowInfo().values.includes('55'),'real Find handler navigates');same(autoTargetObservation(b),before,'real Find handler whole observer');
  return {checks,records};
};
window.runAutoTargetContract=function(b,ctx,assert,parity){
  var checks=0,records=[],copy=x=>JSON.parse(JSON.stringify(x));
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function seed(clear,enabled){var s=window.autoTargetSeed(b,clear,enabled);b.setState(s);b.feedbackSave();b.autoTarget.render();return b.getState();}
  function select(){return document.querySelector('[data-autoascend-target]');}
  [43,55].forEach(function(clear){
    var s=seed(clear,true);ok(select().value===String(clear),'UI is clear Rift '+clear);
    // Before defeat: current encounter still has HP. Historical high is no proof.
    s.depth=clear;s.enemyDepth=clear;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(clear);s.spirits.ember=100;
    b.setState(s);var before=window.autoTargetObservation(b);
    ok(!b.ascendEligibility().autoReady,'unbeaten target is not eligible '+clear);
    ok(!b.autoTarget.check(),'manual check before defeat cannot reset '+clear);
    same(window.autoTargetObservation(b),before,'pre-defeat check is pure '+clear);
    b.setState(s);var zero=b.simulateTimeline(0,'live',b.clockNow());
    ok(zero.summary.ascends===0&&zero.state.prisms===s.prisms,'zero-time unbeaten target awards nothing '+clear);
    s.enemyHp=1;s.heroResource.ember=100;b.setState(s);
    var reward=b.ascendBreakdown(clear+1).gain;
    var defeated=b.simulateTimeline(0,'live',b.clockNow());
    ok(defeated.summary.kills===1&&defeated.summary.ascends===1,'one defeat -> one Ascend '+clear);
    ok(defeated.state.depth===1&&defeated.state.autoAscendTargetDepth===clear+1,'reset preserves internal '+(clear+1));
    ok(defeated.state.prisms===s.prisms+reward&&defeated.summary.ascendGains[0]===reward,'exact existing reward '+clear);
    ok(!b.autoTarget.check(),'post-reset no double reward '+clear);
    var cycle=copy(defeated.state);
    for(var n=0;n<3;n++){
      cycle.depth=clear+1;cycle.enemyDepth=clear+1;cycle.enemyHp=cycle.enemyMaxHp=b.enemyHpFor(clear+1);
      b.setState(cycle);var gain=b.ascendBreakdown(clear+1).gain,prisms=cycle.prisms,count=cycle.ascendCount;
      ok(b.autoTarget.check(),'next legitimate cycle qualifies '+clear);
      cycle=b.getState();ok(cycle.autoAscendTargetDepth===clear+1&&cycle.autoAscendEnabled,'cycle target/ON fixed');
      ok(cycle.prisms===prisms+gain&&cycle.ascendCount===count+1,'cycle reserve reward exactly once');
      ok(!b.autoTarget.check(),'cycle check cannot double reward');
    }
    records.push({clear,internal:clear+1,defeat:defeated,cycles:cycle});
  });
  [false,true].forEach(function(enabled){
    var s=seed(43,enabled);s.depth=101;s.enemyDepth=101;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(101);b.setState(s);
    b.autoTarget.manual();var after=b.getState();
    ok(after.autoAscendTargetDepth===44,'manual keeps target 43 at higher clear Rift 100');
    ok(after.autoAscendEnabled===enabled,'manual preserves ON/OFF');
    ok(JSON.parse(b.rawSave()).autoAscendTargetDepth===44&&JSON.parse(b.rawRecovery()).autoAscendTargetDepth===44,'actual manual save keeps chosen target');
    b.autoTarget.render();same(select().value,'43','manual UI still shows 43');
  });
  var s=seed(43,false);s.depth=56;s.enemyDepth=56;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(56);b.setState(s);
  ok(!b.autoTarget.check(),'OFF never auto-resets');
  s.autoAscendEnabled=true;s.owned.autoascend=false;b.setState(s);
  ok(!b.autoTarget.check(),'unowned gate');b.autoTarget.render();ok(!select(),'unowned has no selector');
  var unownedBefore=window.autoTargetObservation(b);ok(!b.autoTarget.input('43'),'unowned input rejected');same(window.autoTargetObservation(b),unownedBefore,'unowned input pure');
  s.owned.autoascend=true;s.riftMode='farm';s.farmDepth=42;s.farmReturnDepth=56;s.depth=42;s.enemyDepth=42;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(42);b.setState(s);
  ok(!b.autoTarget.check(),'Farm never Ascends');b.enterPush();ok(b.ascendEligibility().autoReady,'return to Push uses legitimate cleared progression');
  ok(b.autoTarget.check(),'Push qualifying check Ascends once');
  // A lower target with ON must wait for an ordinary gameplay check.
  [false,true].forEach(function(enabled){
    s=seed(55,enabled);s.depth=50;s.enemyDepth=50;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(50);b.setState(s);b.feedbackSave();b.autoTarget.render();
    var before=window.autoTargetObservation(b);b.autoTarget.change('43');var after=window.autoTargetObservation(b);
    var expected=copy(before.state);expected.autoAscendTargetDepth=44;expected.lastSeen=b.clockNow();
    same(after.state,expected,'change modifies target and normal save metadata only');
    ok(after.events.length===before.events.length+1&&after.events[after.events.length-1].type==='save','change one save only');
    ok(after.state.depth===50&&after.state.ascendCount===before.state.ascendCount&&after.state.prisms===before.state.prisms,'change never directly Ascends');
    same(JSON.parse(after.primary),expected,'primary exact target change');same(after.primary,after.recovery,'recovery refreshed by normal save');
    ok(b.autoTarget.check()===enabled,'next normal check honors ON/OFF');
  });
  seed(43,false);
  ['', 'NaN','Infinity','43.5','14','101','130','-1',' 43','43.0','0x2b',null,undefined,43].forEach(function(value){
    var before=window.autoTargetObservation(b);ok(!b.autoTarget.input(value),'reject malformed/outside input '+String(value));same(window.autoTargetObservation(b),before,'rejected input has no state/save/event mutation');
  });
  // Current options, not a guessed history-based fallback.
  var el=select(),before=window.autoTargetObservation(b);el.value='101';el.dispatchEvent(new Event('change',{bubbles:true}));same(window.autoTargetObservation(b),before,'invalid native change pure');b.autoTarget.render();
  s=seed(129,false);s.maxDepthEver=21;b.setState(s);b.autoTarget.render();
  el=select();ok(el.options.length===7&&el.value==='129','legacy above-history target visibly selected');
  ok(el.options[el.options.length-1].textContent==='Clear Rift 129 (saved target)','legacy option explicitly labeled');
  before=window.autoTargetObservation(b);b.autoTarget.render();b.refreshAffordability();same(window.autoTargetObservation(b),before,'all render/affordability observers pure');
  s.maxDepthEver=151;b.setState(s);before=window.autoTargetObservation(b);b.autoTarget.render();
  ok(select().options.length===136&&select().value==='129','history expands every integer without changing target');same(window.autoTargetObservation(b),before,'history option rebuild pure');
  // Existing purchase cost/initial target/ON behavior retained.
  s=b.freshStateSnapshot();s.maxDepthEver=56;s.depth=43;s.enemyDepth=43;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(43);s.comets=10000;b.setState(s);b.autoTarget.render();
  var item=b.autoTarget.shopItem(),funds=s.comets;document.querySelector('[data-shop="autoascend"]').click();
  var bought=b.getState();ok(bought.comets===funds-item.cost&&bought.owned.autoascend&&bought.autoAscendEnabled&&bought.autoAscendTargetDepth===56,'purchase gates/cost/default unchanged');
  var windows=runAutoTargetWindows(b,assert);checks+=windows.checks;
  // Exact live/offline/direct/split state parity at the target and Study boundary.
  s=window.autoTargetSeed(b,55,true);s.depth=55;s.enemyDepth=55;s.enemyHp=1;s.enemyMaxHp=b.enemyHpFor(55);s.spirits.ember=100;s.heroResource.ember=100;
  s.nodes.echo=6;s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:.5,speedMult:2}];b.setState(s);s=b.getState();
  var results={};['live','offline','online-reference'].forEach(function(kind){b.setState(s);results[kind]=b.simulate(2,kind==='online-reference'?'live':kind,kind==='online-reference'?1:2,b.clockNow());});
  parity(results.live.state,results.offline.state,'new target live/offline');parity(results.live.state,results['online-reference'].state,'new target online reference');
  b.setState(s);b.simulate(.25,'offline',.25,b.clockNow());var split=b.simulate(1.75,'offline',1.75,b.clockNow()+250,b.clockNow());parity(split.state,results.offline.state,'new target split boundary');
  ok(results.offline.summary.ascends===1&&results.offline.state.autoAscendTargetDepth===56,'one boundary Ascend fixed target');
  ok(results.offline.state.longStudyLevels.guardmastery===1,'Study completion/reward survives Ascend');
  return {checks,records,windows,parity:results,existingAssertionsChanged:[]};
};

window.runAutoTargetPersistence=function(b,ctx,assert,phase,nextPhase,finish){
  var key='auto-target-persistence-'+ctx.scenario,copy=x=>JSON.parse(JSON.stringify(x));
  if(phase()===0){
    var match=ctx.scenario.match(/legacy(\d+)$/),internal=match?Number(match[1]):44;
    var s=window.autoTargetSeed(b,internal-1,true);s.maxDepthEver=21;
    s.research.arcanecal=4;s.comets=37;s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:123,speedMult:2}];
    if(ctx.scenario.endsWith('manual-reload')){s.depth=101;s.maxDepthEver=101;s.enemyDepth=101;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(101);}
    if(ctx.scenario==='auto-ascend-target-cold-resume'){
      s.depth=43;s.enemyDepth=43;s.enemyHp=1;s.enemyMaxHp=b.enemyHpFor(43);s.spirits.ember=100;s.heroResource.ember=100;s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:.5,speedMult:2}];
    }
    b.setState(s);if(ctx.scenario.endsWith('manual-reload'))b.autoTarget.manual();b.feedbackSave();var saved=b.getState();
    if(ctx.scenario==='auto-ascend-target-cold-resume'){
      var oracle=b.previewOffline(saved,6,b.clockNow());oracle.state.lastSeen=b.clockNow()+6000;oracle.state.totalOfflineSeconds=saved.totalOfflineSeconds+6;
      localStorage.setItem(key,JSON.stringify(oracle.state));b.advanceTime(6000);
    } else localStorage.setItem(key,JSON.stringify(saved));
    nextPhase(1);
    if(ctx.scenario.endsWith('reset')){b.reset();return;}
    if(ctx.scenario.endsWith('recovery'))b.formationTest.corruptPrimary();
    b.suppressUnloadSave();location.reload();return;
  }
  var expected=JSON.parse(localStorage.getItem(key)),actual=b.getState();
  if(ctx.scenario.endsWith('reset')){assert(actual.autoAscendTargetDepth===16&&!actual.owned.autoascend&&!actual.autoAscendEnabled,'full Reset fresh target/ownership/OFF');finish('pass',{state:actual});return;}
  assert(JSON.stringify(actual)===JSON.stringify(expected),'actual zero-time loader keeps entire state/legacy target');
  b.autoTarget.render();var el=document.querySelector('[data-autoascend-target]');
  assert(el.value===String(expected.autoAscendTargetDepth-1),'legacy N displays clear N-1');
  assert(JSON.parse(b.rawSave()).autoAscendTargetDepth===expected.autoAscendTargetDepth&&JSON.parse(b.rawRecovery()).autoAscendTargetDepth===expected.autoAscendTargetDepth,'primary/recovery exact legacy target');
  if(ctx.scenario==='auto-ascend-target-cold-resume'){
    assert(actual.autoAscendTargetDepth===44&&actual.ascendCount===1&&actual.longStudyLevels.guardmastery===1,'actual cold offline load consumes target and Study once');
    assert(b.lifecycleTrace().filter(e=>e.type==='offline'&&e.detail.result).length===1,'cold offline applied once');
    return finish('pass',{state:actual,primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace()});
  }
  if(ctx.scenario.endsWith('resume')){
    var s=window.autoTargetSeed(b,43,true);s.depth=43;s.enemyDepth=43;s.enemyHp=1;s.enemyMaxHp=b.enemyHpFor(43);s.spirits.ember=100;s.heroResource.ember=100;s.activeStudies=[{id:'guardmastery',totalDurationSec:150,remainingSec:.5,speedMult:2}];
    b.setState(s);b.feedbackSave();s=b.getState();var now=b.clockNow(),oracle=b.previewOffline(s,6,now);
    oracle.state.lastSeen=now+6000;oracle.state.totalOfflineSeconds=s.totalOfflineSeconds+6;
    b.clearLifecycleTrace();b.autoTarget.visibility(true);b.advanceTime(6000);b.autoTarget.visibility(false);
    actual=b.getState();assert(JSON.stringify(actual)===JSON.stringify(oracle.state),'whole-state visibility resume matches authoritative offline window and explicit lifecycle metadata');
    assert(actual.autoAscendTargetDepth===44&&actual.ascendCount===s.ascendCount+1,'resume crosses one target without changing preference');
    var before=window.autoTargetObservation(b);b.autoTarget.visibility(false);assert(JSON.stringify(b.getState())===JSON.stringify(before.state),'duplicate visibility no extra reward/reset');
    assert(b.lifecycleTrace().filter(e=>e.type==='offline'&&e.detail.result).length===1,'offline exactly once');
    return finish('pass',{state:actual,oracle,primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace()});
  }
  finish('pass',{state:actual,primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace()});
};
