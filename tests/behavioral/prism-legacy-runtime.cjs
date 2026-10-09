#!/usr/bin/env node
'use strict';
// Pinned Node8.3.0 / V8 6.0, not native Android/WebView/DOM/TalkBack.
// No post-ES2017 syntax; expected values come from the modern independent oracle.
var fs=require('fs'),assert=require('assert'),crypto=require('crypto');
var source=fs.readFileSync(process.argv[2]||'index.html','utf8'),data=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
assert(/^6\.0\./.test(process.versions.v8),'must actually run V8 6.0');assert.strictEqual(typeof BigInt,'undefined');
var hash=crypto.createHash('sha256').update(source).digest('hex');assert.strictEqual(hash,data.sourceSha256);
var storage={},writes=0,checks=0;
function eq(a,b,label){checks++;assert.deepStrictEqual(a,b,label);}
var window={addEventListener:function(){},matchMedia:function(){return {matches:true};}};
var document={readyState:'loading',hidden:false,addEventListener:function(){},getElementById:function(){return null;},body:{classList:{add:function(){}}}};
var localStorage={getItem:function(k){return storage[k]||null;},setItem:function(k,v){storage[k]=v;writes++;},removeItem:function(k){delete storage[k];}};
var hooks='renderAll=renderHud=renderAchievements=renderShop=renderSpirits=renderSideStats=renderDaily=updateBattleFast=renderCosmetics=renderNodes=renderAscendSummary=renderResearch=renderLongStudies=showAscendFlash=showToast=spawnFloatNum=emitCombatVfx=function(){};'+
 'window.qa={fresh:freshState,set:function(s){state=acceptPersistedState(s);},get:function(){return state;},preview:ascendPrismBreakdown,manual:function(){doAscend(false);},save:saveState,accept:acceptPersistedState,encode:encodeSaveBackup,decode:decodeSaveBackup,day:currentDay};';
var scripts=[],match,re=/<script>\s*([\s\S]*?)<\/script>/g;while((match=re.exec(source))){scripts.push(match[1]);new Function(match[1]);}
var marker="if(document.readyState==='loading'){";eq(scripts[0].split(marker).length,2,'hook exactly once');
new Function('window','document','localStorage','setTimeout','clearTimeout','performance',scripts[0].replace(marker,hooks+marker))(window,document,localStorage,function(){return 0;},function(){},{now:function(){return 0;}});
var q=window.qa;
data.cases.forEach(function(row,i){var s=q.fresh();s.depth=row.c+1;s.maxDepthEver=Math.max(250,row.c+1,row.b+1);s.ascendRewardedDepth=row.b;
 s.nodes.swift=row.t;s.longStudyLevels.prismstudy=row.l;s.prisms=1000;s.questDay=q.day();s.lastSeen=Date.now();
 q.set(s);var before=JSON.stringify(q.get());eq(q.preview(row.c+1).gain,row.want,'independent exact reward '+i);eq(JSON.stringify(q.get()),before,'preview purity');
 if(i%8===0){q.manual();eq(q.get().prisms,1000+row.want,'real manual payout');eq(q.get().nodes.swift,row.t,'Tree retained');eq(q.get().longStudyLevels.prismstudy,row.l,'Lab retained');q.save();eq(storage.lumenfall_save_v2,storage.lumenfall_save_recovery_v1,'two-slot equality');eq(q.accept(q.decode(q.encode(q.get()))),q.get(),'backup and accept roundtrip');}
});
console.log(JSON.stringify({status:'pass',sourceSha256:hash,node:process.version,v8:process.versions.v8,scriptsParsed:scripts.length,cases:data.cases.length,checks:checks,writes:writes,BigIntAvailable:false,scope:'complete product JavaScript parsing and reward/save execution on V8 6.0; native WebView and device acceptance remain separate'}));
