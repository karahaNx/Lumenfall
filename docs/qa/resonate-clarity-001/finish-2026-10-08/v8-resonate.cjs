'use strict';
// Execute the unchanged product script in the Chrome60 engine generation.
// DOM side effects are stubbed; real handler, normalization and save logic run.
// This does not establish Android/WebView DOM, lifecycle or TalkBack acceptance.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2],'utf8'),storage={},window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var bridge="renderSpirits=function(){};renderHud=function(){};showToast=function(){};window.qa={fresh:freshState,catalog:SPIRITS,set:function(s){state=acceptPersistedState(s,'runtime');},get:function(){return state;},use:function(id){return useSigilResonance(SPIRITS.find(function(s){return s.id===id;}));},normalize:acceptPersistedState,ascend:applyAscendMutation};";
var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1],marker="if(document.readyState==='loading'){";
assert.equal(script.split(marker).length,2);script=script.replace(marker,bridge+marker);
new Function('window','document','localStorage',script)(window,document,{getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;},removeItem:function(k){delete storage[k];}});
function seed(){var s=window.qa.fresh();s.maxDepthEver=250;s.depth=101;s.sigils=100;s.activeParty=['ember','tide','stone'];window.qa.catalog.forEach(function(sp){s.spirits[sp.id]=1;s.heroRarity[sp.id]=5;s.wispUltimate[sp.id]=true;s.heroResource[sp.id]=0;});return s;}
var rejections=[['missing Ultimate',function(s){s.wispUltimate.titan=false;}],['reserve',function(s){s.activeParty=['tide'];}],['unrecruited',function(s){s.spirits.ember=0;s.activeParty=['tide'];}],['full',function(s){s.heroResource.ember=100;}],['poor',function(s){s.sigils=24;}],['exhausted',function(s){s.sigilResonanceUses=3;}]];
rejections.forEach(function(c){var s=seed();c[1](s);window.qa.set(s);var before=JSON.stringify(window.qa.get());assert.equal(window.qa.use('ember'),false);assert.equal(JSON.stringify(window.qa.get()),before);});
window.qa.set(seed());['ember','tide','stone'].forEach(function(id){assert.equal(window.qa.use(id),true);});assert.equal(window.qa.get().sigils,25);assert.equal(window.qa.get().sigilResonanceUses,3);assert.equal(window.qa.get().heroResource.stone,100);assert.equal(storage.lumenfall_save_v2,storage.lumenfall_save_recovery_v1);
var s=window.qa.get();s.heroResource.ember=0;window.qa.set(s);assert.equal(window.qa.use('ember'),false);
window.qa.set(window.qa.normalize(JSON.parse(storage.lumenfall_save_v2),'runtime'));assert.equal(window.qa.get().sigilResonanceUses,3);window.qa.ascend();assert.equal(window.qa.get().sigilResonanceUses,0);assert.equal(window.qa.get().sigils,25);assert.equal(window.qa.get().wispUltimate.titan,true);
s=seed();s.sigils=25;s.heroResource.ember=99;s.sigilResonanceUses=2;window.qa.set(s);assert.equal(window.qa.use('ember'),true);assert.equal(window.qa.get().sigils,0);assert.equal(window.qa.get().heroResource.ember,100);assert.equal(window.qa.get().sigilResonanceUses,3);
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),rejections:rejections.map(function(c){return c[0];}),sharedLimit:true,persistence:true,ascend:true,boundary:true,limitation:'JS engine probe with DOM side-effect stubs, not native WebView/physical/TalkBack.'}));
