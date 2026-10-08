'use strict';
// Node 8.3/V8 6.0 probe: execute unchanged product scripts and real gameplay
// handlers. Only presentation functions are stubbed; this is not Android/DOM
// or physical WebView60 acceptance. The production game targets WebView60.
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var root=path.resolve(__dirname,'../../..'),file=process.argv[2]||root+'/index.html';
var source=fs.readFileSync(file,'utf8'),storage={},now=2000000000000;
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){},querySelector:function(){return null;}};
var clock=class extends Date {static now(){return now;}};
var scripts=[],pattern=/<script>\s*([\s\S]*?)<\/script>/g,match;
while((match=pattern.exec(source)))scripts.push(match[1]);
assert(scripts.length>0,'inline product scripts present');
scripts.forEach(function(s){new Function(s);});
assert(!/data-save-formation/.test(source),'Save controls removed from actual product source');
var bridge=[
 'renderSpirits=updateBattleFast=renderAchievements=renderNodes=showToast=pulseWispCard=renderSideStats=renderAll=showAscendFlash=function(){};',
 'function qaCopy(v){return JSON.parse(JSON.stringify(v));}',
 'window.qa={freshStateSnapshot:function(){return qaCopy(freshState());},enemyHpFor:enemyHpFor,',
 'getState:function(){return qaCopy(state);},setState:function(s){state=acceptPersistedState(qaCopy(s));restoreEnemyOrSpawn();},',
 'renderLayout:function(){},applyFormationPreset:function(n){return applyFormationPreset(n);},',
 'activeBondIds:function(){return activeFormationBonds().map(function(b){return b.id;});},',
 'rawSave:function(){return localStorage.getItem(SAVE_KEY);},rawRecovery:function(){return localStorage.getItem(RECOVERY_SAVE_KEY);},',
 'ascendManual:function(){doAscend(false);},formationTest:{',
 'canonical:acceptPersistedState,rates:function(){return {fill:(100/ABILITY_BASE_CYCLE_SEC)*fillRateMult(),dps:simulationPassiveDps(2000000000000)};},',
 'toggle:toggleActive,cost:function(id){return spiritCost(SPIRITS.find(function(s){return s.id===id;}));},',
 'buy:function(id){buySpirit(SPIRITS.find(function(s){return s.id===id;}));},tick:autoEmpowerTick,',
 'mutateAutosave:function(kind){var c=commitFormationMembers,r=reconcileFormationRebuild,a=applyFormationPreset;',
 "if(kind==='lost-destination')commitFormationMembers=function(m){c(m);state.activeFormationPreset='';};",
 "if(kind==='projection-save')reconcileFormationRebuild=function(s){r(s);if(s.activeFormationPreset)s.formationPresets[s.activeFormationPreset]=s.activeParty.slice();};",
 "if(kind==='switch-overwrite')applyFormationPreset=function(n){var leaving=state.activeFormationPreset,result=a(n);if(leaving)state.formationPresets[leaving]=state.activeParty.slice();return result;};",
 'return function(){commitFormationMembers=c;reconcileFormationRebuild=r;applyFormationPreset=a;};}}};'
].join('\n');
var marker="if(document.readyState==='loading'){";
assert.equal(scripts[0].split(marker).length,2,'unique bridge insertion point');
new Function('window','document','localStorage','Date','setTimeout','clearTimeout','performance',scripts[0].replace(marker,bridge+marker))(
 window,document,{getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;},removeItem:function(k){delete storage[k];}},clock,function(){return 1;},function(){},{now:function(){return 0;}}
);
new Function('window','document',fs.readFileSync(root+'/tests/behavioral/formation-autosave.js','utf8'))(window,document);
var result=window.runFormationAutosaveQa(window.qa,{},function(v,m){assert(v,m);});
var seed=window.formationAutosaveSeed(window.qa);
seed.activeParty=['ember'];seed.formationPresets.push=['ember'];seed.owned.comettrials=true;seed.ascendCount=1;seed.cometTrial={id:'single',target:15,phase:'active',startedAscend:1};
window.qa.setState(seed);window.qa.formationTest.toggle('tide');
assert.equal(window.qa.getState().cometTrial.failed,true,'Field retains integrated Single Trial validation');
assert.equal(window.qa.getState().cometTrial.reason,'party');
assert.equal(window.qa.rawSave(),window.qa.rawRecovery(),'Trial failure immediately persists to primary/recovery');
console.log(JSON.stringify({status:'pass',scenario:'formation-autosave-v8',source:file,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),node:process.version,v8:process.versions.v8,inlineScripts:scripts.length,contract:result,cometTrialValidation:true,limitation:'JavaScript engine only; Android DOM, lifecycle, TalkBack and physical WebView60 acceptance remain separate'},null,2));
