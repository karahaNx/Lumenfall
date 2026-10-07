// Private Core instrumentation; never included in the product tree.
window.__b2Own=function(version){
  var c=window.__core,rows=[],clock=2000000000000;
  function bits(n){var v=new DataView(new ArrayBuffer(8));v.setFloat64(0,n);return v.getUint32(0).toString(16).padStart(8,'0')+v.getUint32(4).toString(16).padStart(8,'0');}
  function seed(natural,use){
    var s=c.fresh();Object.assign(s,{riftMode:'farm',depth:1,enemyDepth:1,farmDepth:1,farmReturnDepth:2,maxDepthEver:130,enemyMaxHp:11,enemyHp:natural?8.03:11,enemyIsLuminous:false,luminousAccum:.975,motes:natural?59:0,lumen:0,shards:0,totalKills:0,questDay:window.__lumenfallQaContext.currentDay()});
    s.activeStudies=[{id:'guardmastery',remainingSec:300,totalDurationSec:600,speedMult:1}];s.studyUseMotes.guardmastery=use;s.studySpeedTargets.guardmastery=3;
    if(natural){s.activeParty=['titan'];s.spirits.titan=1635;s.heroRarity.titan=5;s.heroRarity.ember=1;s.heroResource.titan=0;s.research.formation=500;s.longStudyLevels.formationstudy=500;s.longStudyLevels.wispascend=500;s.nodes.momentum=500;s.ascendCount=5;s.achieved.asc5=true;}
    return s;
  }
  function run(natural,use,kind,split){
    var s=seed(natural,use),normalized=c.set(s),seconds=natural?.9:1,dps=natural?simulationPassiveDps(clock):2**55+16;
    var original=simulationApplyFarmPassive,trace=[],summaries=[],offset=0;
    simulationApplyFarmPassive=function(dt,power,policy,summary){
      var before=c.get(),k=summary.kills,l=summary.luminousKills;
      original(dt,power,policy,summary);
      trace.push({seconds:dt,dpsBits:bits(power),damageBits:bits(dt*power),hpBits:bits(before.enemyHp),maxBits:bits(before.enemyMaxHp),before:before,after:c.get(),kills:summary.kills-k,luminous:summary.luminousKills-l});
    };
    try{(split?[split,seconds-split]:[seconds]).forEach(function(dt){summaries.push(c.run(dt,kind,clock+offset*1000,natural?undefined:dps).summary);offset+=dt;});}
    finally{simulationApplyFarmPassive=original;}
    var costs=natural?{titan:spiritCost(SPIRITS.find(x=>x.id==='titan')),formation:researchCostForLevels(RESEARCH.find(x=>x.id==='formation'),state.research.formation,1),momentum:nodeCost(NODES.find(x=>x.id==='momentum')),formationStudy:studyCost(LONG_STUDIES.find(x=>x.id==='formationstudy'),state.longStudyLevels.formationstudy),wispAscend:studyCost(LONG_STUDIES.find(x=>x.id==='wispascend'),state.longStudyLevels.wispascend)}:null;
    var result={};['kills','luminousKills','lumenGained','shardGained','motesGained','studySpeedPurchases','studyMotesSpent','studiesCompleted','ascends','empowers'].forEach(function(k){result[k]=summaries.reduce((sum,q)=>sum+(q[k]||0),0);});
    return {version,natural,use,kind,split,seconds,dps,dpsBits:bits(dps),seed:s,normalized,costs,trace,summaries,state:c.get(),result};
  }
  function matrix(label){for(var natural of [false,true])for(var use of (natural?[false,true]:[false]))for(var kind of ['live','offline'])for(var split of [0,natural?.01:.5]){var r=run(natural,use,kind,split);r.phase=label;rows.push(r);}}
  matrix('source');
  if(version==='local'){
    var saved=simulationApplyFarmPassive;
    simulationApplyFarmPassive=coreExactOldR2Farm;
    matrix('exact-old-R2');simulationApplyFarmPassive=saved;
    matrix('restored');
  }
  return rows;
};
