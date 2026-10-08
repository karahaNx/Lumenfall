'use strict';
// Node8/V8 6.0 verifies the Chrome60 engine generation, not native WebView DOM.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2],'utf8'),scripts=source.match(/<script>\s*[\s\S]*?<\/script>/g),records=[];
scripts.forEach(function(s){new Function(s.replace(/^<script>\s*/, '').replace(/<\/script>$/, ''));});
var attrs={},classes={},light={},caption={textContent:''},stage={setAttribute:function(k,v){attrs[k]=v;},classList:{toggle:function(k,v){classes[k]=v;}},style:{setProperty:function(){},removeProperty:function(){}}};
var document={readyState:'loading',hidden:false,addEventListener:function(){},getElementById:function(id){return id==='enemy-stage'?stage:id==='rift-cosmetic-name'?caption:null;},querySelector:function(){return {setAttribute:function(k,v){light[k]=v;}};}};
var window={addEventListener:function(){},matchMedia:function(){return {matches:true};}},storage={};
var localStorage={getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;},removeItem:function(k){delete storage[k];}};
var bridge=`renderCosmetics=function(){};window.qa={fresh:freshState,set:function(s){state=acceptPersistedState(s,'runtime');},get:function(){return state;},catalog:RIFT_THEMES,select:selectRiftTheme,active:activeRiftTheme,apply:applyRiftTheme};`;
var script=scripts[0].replace(/^<script>\s*/, '').replace(/<\/script>$/, '').replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
new Function('window','document','localStorage','setTimeout','clearTimeout','performance',script)(window,document,localStorage,function(){return 1;},function(){},{now:function(){return 0;}});
var q=window.qa,s=q.fresh();s.owned.rifttrail=true;s.owned.starfallcrest=true;s.cometCosmetics={trail:true,crest:true};q.set(s);
var before=JSON.stringify(q.get());q.select('ember');q.select('unknown');assert.equal(JSON.stringify(q.get()),before);
s=q.get();s.riftTheme='radiant';q.apply();assert.equal(q.active().id,'default');assert.equal(s.riftTheme,'radiant');
q.catalog.forEach(function(t){if(t.unlockAchievement)s.achieved[t.unlockAchievement]=true;});q.set(s);
q.catalog.forEach(function(t){q.select(t.id);assert.equal(q.active().id,t.id);assert.equal(attrs['data-rift-theme'],t.id);assert.equal(light['data-rift-theme'],t.id);assert.equal(caption.textContent,t.name);assert(classes['comet-trail-equipped']&&classes['comet-crest-equipped']);assert(q.get().owned.rifttrail&&q.get().owned.starfallcrest);['lumenfall_save_v2','lumenfall_save_recovery_v1'].forEach(function(k){var saved=JSON.parse(storage[k]);assert.equal(saved.riftTheme,t.id);assert(saved.cometCosmetics.trail&&saved.cometCosmetics.crest);});records.push(t.id);});
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),scriptsParsed:scripts.length,themes:records,limitation:'Engine fixture; not native WebView60, physical Android or TalkBack acceptance.'},null,2));
