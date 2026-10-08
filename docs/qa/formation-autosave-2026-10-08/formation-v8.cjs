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
var recovered=window.qa.freshStateSnapshot();recovered.formationPresets.boss=['void','titan'];recovered.activeFormationPreset='boss';recovered.formationRebuild={members:['void','titan'],preset:'boss'};
var canonical=window.qa.formationTest.canonical(recovered);assert.deepStrictEqual(canonical.formationPresets.boss,['void','titan'],'known saved late-game members retained even below their unlock depth');assert.deepStrictEqual(canonical.formationRebuild,{members:['void','titan'],preset:'boss'});assert.deepStrictEqual(canonical.activeParty,['ember']);assert.deepStrictEqual(window.qa.formationTest.canonical(canonical),canonical,'recovered late intent is idempotent');
var oldSchemaFormation=null;
if(window.qa.freshStateSnapshot().schemaVersion===2){
 var old=window.qa.freshStateSnapshot();old.schemaVersion=1;delete old.offline12hRefund;
 old.formationPresets={push:['ember'],farm:[],boss:['void','titan']};old.activeFormationPreset='boss';old.formationRebuild={members:['void','titan'],preset:'boss'};
 old.wispModules.titan=4;old.heroRarity.void=5;old.wispUltimate.void=true;old.owned.autoascend=true;
 // Arbitrary QA currency sentinels, not gameplay prices or rewards.
 var paid={lumen:17,shards:23,comets:31,motes:37,sigils:41};Object.keys(paid).forEach(function(k){old[k]=paid[k];});
 var migrated=window.qa.formationTest.canonical(old);assert.equal(migrated.schemaVersion,2);assert.deepStrictEqual(migrated.formationPresets,old.formationPresets);assert.deepStrictEqual(migrated.formationRebuild,old.formationRebuild);assert.equal(migrated.activeFormationPreset,'boss');assert.deepStrictEqual(migrated.activeParty,['ember']);
 assert.equal(migrated.wispModules.titan,4);assert.equal(migrated.heroRarity.void,5);assert.equal(migrated.wispUltimate.void,true);assert.equal(migrated.owned.autoascend,true);Object.keys(paid).forEach(function(k){assert.equal(migrated[k],paid[k]);});assert.deepStrictEqual(window.qa.formationTest.canonical(migrated),migrated);
 oldSchemaFormation={from:1,to:2,intentAndEmpty:true,paidWispValueAndCurrencies:true,idempotent:true};
}
console.log(JSON.stringify({status:'pass',scenario:'formation-autosave-v8',source:file,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),node:process.version,v8:process.versions.v8,inlineScripts:scripts.length,contract:result,cometTrialValidation:true,recoveredLateIntent:true,oldSchemaFormation:oldSchemaFormation,limitation:'JavaScript engine only; Android DOM, lifecycle, TalkBack and physical WebView60 acceptance remain separate'},null,2));
