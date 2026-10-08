'use strict';
// Targeted product renderer execution on V8 6.0, the Chrome60 engine generation.
// This small DOM fixture is not Android/WebView/TalkBack acceptance.
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2]||path.resolve(__dirname,'../../../..','index.html'),'utf8');
var root,clock=1000,window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
script=script.replace("if(document.readyState==='loading'){","window.f13={fresh:freshState,set:function(s,r){state=s;els['rift-party']=r;},render:renderRiftParty,catalog:SPIRITS};if(document.readyState==='loading'){");
var date=class extends Date {static now(){return clock;}};
new Function('window','document','localStorage','Date',script)(window,document,{getItem:function(){return null;},setItem:function(){},removeItem:function(){}},date);
var observations=[];
window.f13.catalog.forEach(function(sp){
 var attributes={},bar={attributes:{'aria-label':sp.name+' — '+sp.abilityName},setAttribute:function(k,v){this.attributes[k]=v;},querySelector:function(){return {style:{}};}},status={textContent:''},power={textContent:'',setAttribute:function(){}};
 var card={attributes:attributes,getAttribute:function(k){return attributes[k];},querySelector:function(sel){return sel==='.rift-charge'?bar:sel==='.rift-wisp-state'?status:power;},classList:{toggle:function(){}}};
 root={getAttribute:function(){return sp.id+'|';},querySelector:function(){return card;}};
 var s=window.f13.fresh();s.activeParty=[sp.id];
 [['unpowered',0,0,false],['charging',1,50,false],['ready',1,100,false],['casting',1,0,true]].forEach(function(v){
  s.spirits[sp.id]=v[1];s.heroResource[sp.id]=v[2];attributes['data-cast-until']=v[3]?clock+650:0;
  window.f13.set(s,root);window.f13.render();assert.equal(status.textContent,v[1]?'':'Lv 0');assert.equal(bar.attributes['aria-valuenow'],String(v[2]));
  if(v[0]==='ready')assert(bar.attributes['aria-valuetext'].indexOf('Ready; 100%')===0);
  if(v[0]==='casting'){assert(bar.attributes['aria-valuetext'].indexOf('Casting; 0%')===0);clock+=700;window.f13.render();assert(bar.attributes['aria-valuetext'].indexOf('Casting')===-1);}
  observations.push({id:sp.id,kind:v[0],visible:status.textContent,status:bar.attributes['aria-valuetext']});
 });
});
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),observations:observations,limitation:'Product JS engine/renderer fixture; not native WebView DOM, physical device or TalkBack.'}));
