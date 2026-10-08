/* F14 contracts use the real save, action and Ascend handlers in the Node QA app. */
window.formationAutosaveSeed = function(b){
  var s=b.freshStateSnapshot();
  s.maxDepthEver=s.depth=s.enemyDepth=101;s.enemyHp=s.enemyMaxHp=b.enemyHpFor(101);
  Object.keys(s.spirits).forEach(function(id){s.spirits[id]=10;});
  s.formationPresets={push:['ember','tide'],farm:['stone','gale'],boss:['void','titan']};
  s.activeParty=s.formationPresets.push.slice();s.activeFormationPreset='push';
  s.achieved.labmaster=true;s.lumen=1e12;s.shards=1234;s.motes=77;s.sigils=88;
  return s;
};
window.runFormationAutosaveQa = function(b,ctx,assert){
  var checks=0,t=b.formationTest,get=function(){return b.getState();},copy=function(x){return JSON.parse(JSON.stringify(x));};
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m+' '+JSON.stringify(a));}
  function saved(m){var s=get(),raw=JSON.parse(b.rawSave());same(raw.formationPresets,s.formationPresets,m+' immediate primary');same(raw.activeFormationPreset,s.activeFormationPreset,m+' destination');same(b.rawRecovery(),b.rawSave(),m+' recovery');}
  b.setState(window.formationAutosaveSeed(b));b.renderLayout();
  ok(!document.querySelector('[data-save-formation]'),'Save buttons removed');
  var presets=copy(get().formationPresets);
  ['push','farm','boss'].forEach(function(name,i){
    ok(b.applyFormationPreset(name),'select '+name);same(get().formationPresets,presets,'switch does not overwrite any preset');
    var removed=presets[name][1],added=['thorn','aurora','tide'][i];
    t.toggle(removed);presets[name]=[presets[name][0]];same(get().formationPresets,presets,'Bench isolates '+name);saved('Bench '+name);
    t.toggle(added);presets[name].push(added);same(get().formationPresets,presets,'Field isolates '+name);saved('Field '+name);
    ok(get().activeFormationPreset===name,'edit retains '+name);
  });
  ['push','farm','boss','push'].forEach(function(name){b.applyFormationPreset(name);same(get().activeParty,presets[name],'return exact '+name);same(get().formationPresets,presets,'three-way isolation');});
  var s=get();s.spirits.gale=0;b.setState(s);var cost=t.cost('gale'),before=get();t.buy('gale');
  presets.push.push('gale');same(get().formationPresets,presets,'new recruitment autosaves selected preset');saved('Recruit');
  ok(before.lumen-get().lumen===cost && get().spirits.gale===1,'recruit pays the existing exact cost once');
  before=get();cost=t.cost('gale');t.buy('gale');same(get().formationPresets,presets,'Empower does not change membership');saved('Empower');
  ok(before.lumen-get().lumen===cost,'Empower charges the existing exact Lumen price');
  ['void','titan'].forEach(function(id){t.toggle(id);});
  ok(get().activeParty.length===5,'five selected slots');before=get();t.toggle('aurora');same(get(),before,'sixth Field cannot mutate or save');
  before=get();t.toggle('unknown');ok(!b.applyFormationPreset('invalid'),'invalid preset fails');same(get(),before,'invalid actions retain full state');
  s=get();s.formationPresets.farm=[];b.setState(s);var other=copy(get().formationPresets);
  ok(b.applyFormationPreset('farm'),'empty preset selectable');same(get().activeParty,['ember'],'empty saved preset has temporary Ember in Field');same(get().formationPresets,other,'select does not seed empty preset');saved('Empty');
  ok(!b.activeBondIds().length && get().formationRebuild.members.length===0,'empty intent adds no Bonds or pending members');
  t.toggle('stone');same(get().formationPresets.farm,['stone'],'Field edits empty preset');saved('Empty Field');
  before=get();t.toggle('stone');same(get(),before,'last Bench rejected; retain one chosen Wisp');
  s=get();s.formationPresets.farm=[];s.depth=s.enemyDepth=101;b.setState(s);b.ascendManual();same(get().activeParty,['ember'],'Ascend retains temporary Ember for empty saved preset');same(get().formationPresets.farm,[],'Ascend does not write Ember to empty preset');saved('Empty Ascend');
  s=get();s.lumen=t.cost('stone');b.setState(s);t.buy('stone');same(get().formationPresets.farm,['stone'],'manual first recruitment edits empty intent without persisting temporary Ember');same(get().activeParty,['stone'],'first recruit replaces temporary Ember');saved('Empty Recruit');
  s=window.formationAutosaveSeed(b);s.formationPresets.boss=['void','tide','stone','gale','titan'];s.activeParty=s.formationPresets.boss.slice();s.activeFormationPreset='boss';
  b.setState(s);var desired=copy(get().formationPresets);b.ascendManual();
  same(get().formationPresets,desired,'Ascend preserves desired late-game presets');same(get().formationRebuild.members,desired.boss,'Ascend captures whole ordered intent');
  ok(get().activeFormationPreset==='boss','pending Boss remains selected');same(get().activeParty,['ember'],'existing temporary Ember projection');saved('Pending Ascend');
  var control=get();control.formationRebuild=null;control.activeFormationPreset='';var pendingRates=t.rates(),pendingBonds=b.activeBondIds();
  b.setState(control);same(t.rates(),pendingRates,'pending grants no DPS');same(b.activeBondIds(),pendingBonds,'pending grants no Bonds');
  control.formationRebuild={members:desired.boss.slice(),preset:'boss'};b.setState(control);
  before=get();t.toggle('ember');same(get(),before,'pending slots count toward five-member limit');
  t.toggle('void');desired.boss.splice(0,1);same(get().formationPresets,desired,'Bench pending removes only chosen member');saved('Pending Bench');
  t.toggle('ember');desired.boss.push('ember');same(get().formationPresets,desired,'Field retains other pending intent');saved('Pending Field');
  s=get();s.lumen=t.cost('tide');b.setState(s);before=get();t.buy('tide');
  ok(before.lumen-get().lumen===60 && get().spirits.tide===1,'existing Tide recruitment price paid');
  same(get().formationPresets,desired,'partial paid rebuild never autosaves projection');same(get().activeParty,['tide','ember'],'partial projection follows saved order');saved('Rebuild Recruit');
  s=get();s.depth=s.enemyDepth=101;b.setState(s);b.ascendManual();same(get().formationPresets,desired,'repeated Ascend retains edits');same(get().formationRebuild.members,desired.boss,'repeated Ascend retains all pending');
  s=get();s.empowerQueue.ember=false;s.lumen=1e9;b.setState(s);ok(t.tick(),'queued reconstruction purchases');same(get().formationPresets,desired,'queued purchase does not replace desired preset');
  b.applyFormationPreset('push');same(get().formationPresets,desired,'switch during rebuild isolates both presets');
  b.applyFormationPreset('boss');same(get().formationRebuild.members,desired.boss,'switch back restores pending intent');
  s=get();s.formationPresets.farm=[];var canonical=t.canonical(s);
  for(var i=0;i<4;i++)same(t.canonical(canonical),canonical,'full-state canonical idempotence '+i);
  same(canonical.formationPresets.farm,[],'unselected empty preset preserved');
  s=b.freshStateSnapshot();delete s.formationPresets;delete s.activeFormationPreset;
  var legacy=t.canonical(s);same(legacy.formationPresets,{push:['ember'],farm:['ember'],boss:['ember']},'legacy seeds missing presets from old party');
  s=window.formationAutosaveSeed(b);s.formationPresets.farm=['unknown','tide','tide',3];canonical=t.canonical(s);same(canonical.formationPresets.farm,['tide'],'malformed refs sanitized');same(canonical.spirits,s.spirits,'normalization does not recruit');
  ['lumen','shards','prisms','comets','motes','sigils','owned','nodes','research','longStudyLevels','activeStudies','heroRarity','wispModules','wispUltimate'].forEach(function(k){same(canonical[k],s[k],'preserve existing value '+k);});
  var negative=[];
  ['lost-destination','projection-save','switch-overwrite'].forEach(function(kind){
    var seed=window.formationAutosaveSeed(b);b.setState(seed);var undo=t.mutateAutosave(kind),caught=false;
    try{
      if(kind==='lost-destination'){t.toggle('tide');assert(get().activeFormationPreset==='push','negative lost destination');}
      if(kind==='projection-save'){b.ascendManual();assert(get().formationPresets.push.join(',')==='ember,tide','negative Ember overwrite');}
      if(kind==='switch-overwrite'){b.applyFormationPreset('farm');assert(get().formationPresets.push.join(',')==='ember,tide','negative switch overwrite');}
    }catch(e){caught=true;}finally{undo();}
    ok(caught,'causal mutant caught '+kind);negative.push(kind);
  });
  return {checks:checks,presets:3,immediateSave:true,empty:true,pending:true,idempotent:true,negativeControls:negative};
};
window.runFormationAutosavePersistence = function(b,ctx,assert,phase,nextPhase,backupCode,finish){
  if(phase()===0){
    var s=window.formationAutosaveSeed(b);s.formationPresets.farm=[];s.formationPresets.boss=['void','tide','stone'];s.activeParty=s.formationPresets.boss.slice();s.activeFormationPreset='boss';
    b.setState(s);b.ascendManual();s=b.getState();s.lumen=60;b.setState(s);b.formationTest.buy('tide');b.formationTest.toggle('void');
    s=b.getState();s.questDay=ctx.currentDay();s.loginStreak=1;b.setState(s);b.feedbackSave();
    var expected=b.getState();localStorage.setItem('formation-autosave-expected',JSON.stringify(expected));nextPhase(1);
    if(ctx.scenario.endsWith('backup-restore')){b.setState(b.freshStateSnapshot());b.restoreBackup(backupCode(expected));}
    else {if(ctx.scenario.endsWith('recovery'))b.formationTest.corruptPrimary();b.suppressUnloadSave();location.reload();}
    return;
  }
  var s=b.getState(),expected=JSON.parse(localStorage.getItem('formation-autosave-expected'));
  var keys=['formationPresets','activeFormationPreset','formationRebuild','activeParty','spirits','empowerQueue','lumen','shards','prisms','comets','motes','sigils','heroRarity','wispModules','wispUltimate','owned','activeStudies'];
  keys.forEach(function(k){assert(JSON.stringify(s[k])===JSON.stringify(expected[k]),ctx.scenario+' exact '+k);});
  assert(s.activeFormationPreset==='boss' && !s.formationPresets.farm.length,'pending destination and empty preset retained');
  var recovery=JSON.parse(b.rawRecovery());keys.forEach(function(k){assert(JSON.stringify(recovery[k])===JSON.stringify(s[k]),'recovery exact '+k);});
  b.applyFormationPreset('farm');b.feedbackSave();var empty=b.formationTest.canonical(JSON.parse(b.rawSave()));
  assert(empty.activeParty.join(',')==='ember' && empty.activeFormationPreset==='farm' && !empty.formationPresets.farm.length,'empty selected save keeps temporary Ember without overwriting intent');
  finish('pass',{keys:keys,empty:true,selected:'boss',pending:s.formationRebuild});
};
