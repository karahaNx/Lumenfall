'use strict';
// Execute the exact product functions on the Chrome60-generation JS engine.
// DOM fixtures below do not establish native layout or TalkBack acceptance.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto'),checks=0;
function equal(a,b,message){checks++;assert.strictEqual(a,b,message);}
var source=fs.readFileSync(process.argv[2]||'index.html','utf8'),scripts=[],match;
var pattern=/<script\b[^>]*>([\s\S]*?)<\/script>/gi;
while((match=pattern.exec(source))){new Function(match[1]);scripts.push(match[1]);}
equal(scripts.length,2,'both exact inline product scripts parse');
var window={addEventListener:function(){}},nodes={},child={},focus=[],storage={canonical:'unchanged-old-save'},writeError=false;
function node(id){return {id:id,hidden:false,textContent:'',attributes:{},setAttribute:function(k,v){this.attributes[k]=v;},focus:function(options){document.activeElement=this;focus.push({id:id,options:options});},contains:function(el){return el===child;},querySelector:function(){return nodes.value;},classList:{contains:function(){return false;},toggle:function(){}}};}
['rift-objective-row','rift-hints-toggle','rift-guidance-toggle','rift-guidance-slot','tab-battle','value','main'].forEach(function(id){nodes[id]=node(id);});
var document={readyState:'loading',addEventListener:function(){},activeElement:child,getElementById:function(id){return nodes[id];},querySelector:function(){return nodes.main;}};
var localStorage={getItem:function(k){return storage[k]||null;},setItem:function(k,v){if(writeError)throw Error('quota');storage[k]=v;},removeItem:function(k){if(writeError)throw Error('quota');delete storage[k];}};
var script=scripts[0],marker="if(document.readyState==='loading'){";
equal(script.split(marker).length,2,'exact startup exposure marker');
script=script.replace(marker,"window.f07={fresh:freshState,install:function(s){state=s;},get:function(){return state;},render:renderRiftGuidancePreference,set:setRiftGuidanceHidden,sync:syncMainScrollMode};"+marker);
new Function('window','document','localStorage',script)(window,document,localStorage);
window.f07.install(window.f07.fresh());var before=JSON.stringify(window.f07.get());
window.f07.render();equal(nodes['rift-hints-toggle'].textContent,'Hide hints');equal(nodes['rift-hints-toggle'].attributes['aria-expanded'],'true');
window.f07.set(true);equal(nodes['rift-objective-row'].hidden,true);equal(nodes['rift-hints-toggle'].textContent,'Show hints');equal(nodes['rift-hints-toggle'].attributes['aria-expanded'],'false');equal(nodes['rift-guidance-toggle'].attributes['aria-pressed'],'false');equal(nodes.value.textContent,'Hidden');equal(storage.lumenfall_rift_guidance_hidden_v1,'1');equal(document.activeElement,nodes['rift-hints-toggle']);
window.f07.set(false);equal(nodes['rift-objective-row'].hidden,false);equal(nodes['rift-hints-toggle'].textContent,'Hide hints');equal(nodes['rift-guidance-toggle'].attributes['aria-pressed'],'true');equal(nodes.value.textContent,'Shown');equal(storage.lumenfall_rift_guidance_hidden_v1,undefined);
writeError=true;document.activeElement=child;window.f07.set(true);equal(nodes['rift-objective-row'].hidden,true);equal(document.activeElement,nodes['rift-hints-toggle']);window.f07.set(false);equal(nodes['rift-objective-row'].hidden,false);
window.f07.sync('spirits');equal(nodes['rift-guidance-slot'].hidden,true);window.f07.sync('battle');equal(nodes['rift-guidance-slot'].hidden,false);
equal(storage.canonical,'unchanged-old-save');equal(JSON.stringify(window.f07.get()),before,'complete gameplay state unchanged');
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),parsedScripts:scripts.length,checks:checks,focus:focus,limitation:'Exact product JS functions on a DOM fixture; no native layout, physical Android or TalkBack claim.'}));
