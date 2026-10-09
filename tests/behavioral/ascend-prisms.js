// Independent modern-browser QA oracle; not part of the production APK.
function prismEarningOracle(c,benchmark,tree,lab){
  function root(n){if(n<2n)return n;var x=1n<<BigInt(Math.ceil(n.toString(2).length/2));for(;;){var y=(x+n/x)/2n;if(y>=x)return x;x=y;}}
  var p=(25n+BigInt(tree))*(20n+BigInt(lab));
  function curve(q){return c<15?0:Math.max(1,Number(root(4n*BigInt(c)*q*q)/500n));}
  var full=curve(p),reserve=benchmark>0&&full>0?curve(p-400n):0,progress=0;
  if(benchmark<=0)progress=full;
  else if(c>benchmark){
    var pp=p*p,upper=4n*pp*(BigInt(c)+BigInt(benchmark)),right=64n*pp*pp*BigInt(c)*BigInt(benchmark);
    function covers(k){var remainder=upper-k*k*250000n;return remainder<=0n||remainder*remainder<=right;}
    var k=BigInt(Math.max(0,Math.ceil(2*(Math.sqrt(c)-Math.sqrt(benchmark))*Number(p)/500)));
    while(!covers(k))k++;while(k>0n&&covers(k-1n))k--;progress=Number(k);
  }
  return {full:full,reserve:reserve,progressBonus:progress,gain:full===0?0:benchmark<=0?full:Math.min(full,reserve+progress)};
}
/* F05: independent reward oracle, actual DOM/payouts and persistence routes. */
window.ascendPrismsSeed=function(b,c,benchmark,tree,lab){
  var s=b.freshStateSnapshot();
  s.depth=c+1;s.maxDepthEver=Math.max(c,benchmark,219)+1;
  s.ascendRewardedDepth=benchmark;s.nodes.swift=tree;s.longStudyLevels.prismstudy=lab;
  s.prisms=100;s.spirits.ember=1;s.activeParty=['ember'];
  Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=false;});
  s.owned.autoascend=true;s.autoAscendEnabled=false;s.autoAscendTargetDepth=c+1;
  s.enemyDepth=s.depth;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(s.depth);
  s.questDay=b.currentDay();s.loginStreak=1;
  return s;
};
window.runAscendPrismsContract=function(b,ctx,assert){
  var checks=0,records=[],clock=b.clockNow();
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function expected(c,benchmark,tree,lab){return prismEarningOracle(c,benchmark,tree,lab);}
  function check(c,benchmark,tree,lab,farm){
    var s=window.ascendPrismsSeed(b,c,benchmark,tree,lab),want=expected(c,benchmark,tree,lab);
    if(farm){s.riftMode='farm';s.depth=19;s.farmDepth=19;s.farmReturnDepth=c+1;s.enemyDepth=19;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(19);}
    b.setState(s);b.renderLayout();
    var before=b.getState(),bd=b.ascendBreakdown();
    Object.keys(want).forEach(function(k){ok(bd[k]===want[k],'reward oracle '+[c,benchmark,tree,lab,k]+' expected '+want[k]+' got '+bd[k]);});
    ok(document.getElementById('prism-preview').textContent==='+'+want.gain+' Prisms','actual DOM preview equals oracle');
    var text=document.getElementById('prism-calculation').textContent;
    ok(text.includes('You receive now'+want.gain+' Prisms'),'exact current reward explanation');
    ok(text.includes(tree+' levels · +'+tree*4+'%')&&text.includes(lab+' completed levels · +'+lab*5+'%'),'actual Tree/completed Lab levels explained');
    ok(text.includes('Best rewarded clearRift '+benchmark)||benchmark===0||c<15,'reward benchmark explained');
    if(c>benchmark&&benchmark>0)ok(text.includes('rounded up once'),'approved new-depth rounding explained');
    b.renderLayout();same(b.getState(),before,'render has no state/economy effects');
    var manual=b.ascendManual();ok(manual.gain===want.gain,'manual payout equals preview/oracle');
    var after=b.getState();
    ok(after.ascendRewardedDepth===(c<15?benchmark:Math.max(c,benchmark)),'manual reward benchmark');
    ok(after.nodes.swift===tree&&after.longStudyLevels.prismstudy===lab,'Ascend retains both earned bonuses');
    if(c>=15){
      b.feedbackSave();same(b.rawSave(),b.rawRecovery(),'primary and recovery agree after payout');
      var saved=JSON.parse(b.rawSave());ok(saved.prisms===100+want.gain,'payout saved exactly');
      ok(saved.ascendRewardedDepth===after.ascendRewardedDepth,'benchmark saved exactly');
    }
    var row={cleared:c,benchmark:benchmark,tree:tree,lab:lab,farm:!!farm,reward:want.gain};
    if(!farm)['live','offline'].forEach(function(kind){
      s.autoAscendEnabled=true;b.setState(s);
      var result=b.simulateTimeline(0.001,kind,clock),count=c>=15?1:0;
      ok(result.summary.ascends===count,'authoritative '+kind+' auto count');
      if(count){
        ok(result.summary.ascendGains[0]===want.gain,'authoritative '+kind+' equals preview/manual');
        ok(result.state.prisms===100+want.gain,'authoritative '+kind+' balance');
        ok(result.state.ascendRewardedDepth===Math.max(c,benchmark),'authoritative '+kind+' benchmark');
      }
      row[kind]=result.summary.ascendGains;
    });
    records.push(row);
  }
  b.uiMeasurementPause(true);
  // The regression: buying Swift level 1 at cleared16/benchmark15 used to pay 2 -> 1.
  check(16,15,0,0);check(16,15,1,0);check(16,15,0,1);
  ok(records[0].reward===2&&records[1].reward===2&&records[2].reward===2,'bonus purchases retain the 2-Prism new-depth reward');
  [14,15,20,21,25,30,100].forEach(function(c){
    [0,c,15,219].forEach(function(benchmark){
      [[0,0],[1,0],[0,1],[1,1],[9,5],[10,10],[17,18],[18,18]].forEach(function(v){check(c,benchmark,v[0],v[1]);});
    });
  });
  [[0,0],[1,0],[0,1],[1,1],[17,18]].forEach(function(v){check(20,219,v[0],v[1],true);});
  // Explicit thresholds cover the new protected-bonus repeat contract.
  [[17,18,21],[18,18,22],[18,19,22],[18,20,23],[44,0,17],[45,0,17],[58,0,22],[59,0,22],[0,0,1],[1,0,2],[4,0,3],[7,0,4],[9,0,5],[12,0,6]].forEach(function(v){
    check(20,219,v[0],v[1]);ok(records[records.length-1].reward===v[2],'independent whole-Prism repeat threshold');
  });
  // No reward decrease through a bounded range of actual canonical calculations.
  [16,20,30,100].forEach(function(c){
    [15,c-1].forEach(function(benchmark){
      [0,1,18].forEach(function(lab){
        var previous=-1;
        for(var tree=0;tree<=30;tree++){
          b.setState(window.ascendPrismsSeed(b,c,benchmark,tree,lab));
          var gain=b.ascendBreakdown().gain;ok(gain>=previous,'Tree purchase cannot reduce reward');previous=gain;
        }
      });
      [0,1,17].forEach(function(tree){
        var previous=-1;
        for(var lab=0;lab<=20;lab++){
          b.setState(window.ascendPrismsSeed(b,c,benchmark,tree,lab));
          var gain=b.ascendBreakdown().gain;ok(gain>=previous,'completed Lab purchase cannot reduce reward');previous=gain;
        }
      });
    });
  });
  var high=Number.MAX_SAFE_INTEGER-1;
  b.setState(window.ascendPrismsSeed(b,high,high-1,0,0));
  ok(b.ascendBreakdown().progressBonus===1,'one safely represented new Rift retains its positive bonus at high depth');
  // Existing legacy saves allow finite depths above the safe integer boundary.
  // Scale after division so an intermediate 2*(c-b) does not overflow.
  b.setState(window.ascendPrismsSeed(b,Number.MAX_VALUE,Number.MAX_VALUE/4,0,0));
  var extreme=b.ascendBreakdown(),continuous=2*Math.sqrt(Number.MAX_VALUE)-2*Math.sqrt(Number.MAX_VALUE/4);
  ok(Number.isFinite(extreme.progressBonus)&&Number.isFinite(extreme.gain),'finite legacy high-depth calculation');
  ok(Math.abs(extreme.progressBonus-continuous)<=continuous*1e-12,'legacy large-depth bonus matches the unrounded curve difference');
  ok(extreme.gain<extreme.full,'legacy large-depth bonus does not spuriously hit the full cap through overflow');
  ['live','offline'].forEach(function(kind){
    // Encounter20 is not yet a cleared20 target; the real kill earns the reward.
    var s=window.ascendPrismsSeed(b,19,219,17,18);
    s.autoAscendEnabled=true;s.autoAscendTargetDepth=21;s.enemyHp=1;s.spirits.ember=50;
    b.setState(s);ok(!b.ascendEligibility().autoReady,'uncleared target does not auto Ascend');
    var kill=b.simulateTimeline(1,kind,clock);
    ok(kill.summary.ascends===1&&kill.summary.ascendGains[0]===21,'actual boss clear pays 21 once '+kind);
    // Completion contributes only at the actual completion boundary.
    s=window.ascendPrismsSeed(b,20,219,0,2);
    s.activeStudies=[{id:'prismstudy',remainingSec:1,totalDurationSec:2,speedMult:1}];b.setState(s);
    b.simulateTimeline(0.5,kind,clock);ok(b.getState().longStudyLevels.prismstudy===2&&b.ascendBreakdown().gain===2,'pending Lab bonus excluded '+kind);
    b.simulateTimeline(0.5,kind,clock+500);ok(b.getState().longStudyLevels.prismstudy===3&&b.ascendBreakdown().gain===3,'completed Lab bonus included '+kind);
    s.activeStudies[0].remainingSec=0;s.autoAscendEnabled=true;b.setState(s);
    var simultaneous=b.simulateTimeline(0.001,kind,clock);
    ok(simultaneous.summary.ascendGains[0]===2&&simultaneous.state.longStudyLevels.prismstudy===3,'existing auto-before-due-completion order '+kind);
  });
  var legacy=window.ascendPrismsSeed(b,20,0,17,18);delete legacy.ascendRewardedDepth;
  b.setState(legacy);ok(b.getState().ascendRewardedDepth===0&&b.ascendBreakdown().gain===28,'missing legacy benchmark retains first full reward');
  return {checks:checks,records:records,policy:'protected repeat bonus; exact integer boundaries; first/minimum/full cap retained',scope:'synthetic browser states; not the user save or Android acceptance'};
};
window.runAscendPrismsPersistence=function(b,ctx,assert,phase,nextPhase,backupCode,finish){
  var key='ascend-prisms-persist-'+ctx.scenario;
  if(phase()===0){
    b.setState(window.ascendPrismsSeed(b,20,219,17,18));b.feedbackSave();
    localStorage.setItem(key,JSON.stringify(b.getState()));nextPhase(1);
    if(ctx.scenario==='ascend-prisms-backup-restore'){b.setState(b.freshStateSnapshot());b.restoreBackup(backupCode(JSON.parse(localStorage.getItem(key))));return;}
    if(ctx.scenario==='ascend-prisms-recovery')b.formationTest.corruptPrimary();
    b.suppressUnloadSave();location.reload();return;
  }
  var saved=JSON.parse(localStorage.getItem(key)),s=b.getState();
  ['prisms','nodes','longStudyLevels','ascendRewardedDepth','ascendCount','depth','autoAscendTargetDepth'].forEach(function(k){
    assert(JSON.stringify(s[k])===JSON.stringify(saved[k]),'F05 actual persistence route retains '+k);
  });
  assert(b.rawSave()===b.rawRecovery(),'restored primary/recovery agree');
  b.uiMeasurementPause(true);b.renderLayout();
  assert(document.getElementById('prism-preview').textContent==='+21 Prisms','restored preview uses saved completed bonuses and benchmark');
  var payout=b.ascendManual();assert(payout.gain===21,'restored actual payout equals preview');
  assert(payout.after.benchmark===219,'shallower repeat preserves best rewarded clear');
  finish('pass',{route:ctx.scenario,reward:payout.gain,benchmark:payout.after.benchmark,tree:s.nodes.swift,completedLab:s.longStudyLevels.prismstudy,schema:s.schemaVersion});
};
