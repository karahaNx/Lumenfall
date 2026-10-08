/* ES2017 probe on V8 6.0: actual product script and target handler.
 * Storage is counted here; real browser/save/recovery is covered by the suite.
 * No Android DOM, datalist or TalkBack acceptance is inferred.
 */
'use strict';
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2],'utf8'),writes=0;
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){}};
var bridge="window.qa={fresh:freshState,input:setAutoAscendClearedTarget,get:function(){return state;},set:function(s){state=s;}};saveState=function(){countWrite();};";
var script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
new Function('window','document','localStorage','setTimeout','clearTimeout','countWrite',script)(window,document,{},function(){},function(){},function(){writes++;});
var b=window.qa,checks=0;
[false,true].forEach(function(enabled){
 var s=b.fresh();s.owned.autoascend=true;s.autoAscendEnabled=enabled;s.autoAscendTargetDepth=44;s.maxDepthEver=10001;b.set(s);
 assert(b.input('219'));assert.equal(s.autoAscendTargetDepth,220);assert.equal(s.autoAscendEnabled,enabled);checks+=3;
 var before=JSON.stringify(s),count=writes;
 ['219','219.5','14','10001','NaN','0219'].forEach(function(value){assert(!b.input(value));assert.equal(JSON.stringify(s),before);assert.equal(writes,count);checks+=3;});
 s.maxDepthEver=1e30;assert(b.input('9007199254740991'));assert.equal(s.autoAscendTargetDepth,9007199254740992);assert.equal(s.autoAscendEnabled,enabled);checks+=3;
 s.owned.autoascend=false;before=JSON.stringify(s);count=writes;assert(!b.input('219'));assert.equal(JSON.stringify(s),before);assert.equal(writes,count);checks+=3;
});
console.log(JSON.stringify({status:'pass',scenario:'auto-ascend-target-v8',node:process.version,v8:process.versions.v8,checks:checks,writes:writes,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),limitation:'JS parsing/handler probe; not native WebView60/device acceptance'}));
