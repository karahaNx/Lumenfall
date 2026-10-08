/* ES2017-only probe intentionally runs on Node8.3/V8 6.0, the Chrome60
 * engine generation. DOM/storage are explicit minimal mocks; this is not
 * native Android, layout, clipboard permission or TalkBack acceptance. */
'use strict';
var fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
var root=path.resolve(__dirname,'../../../..');
var html=fs.readFileSync(process.argv[2]||path.join(root,'index.html'),'utf8');
var fixtures=JSON.parse(fs.readFileSync(path.join(root,'tests/behavioral/fixtures.json'),'utf8'));
var clock=2052475200000,storage={},timers=[],focused=null,nodes={};
function materialize(v){
  if(v==='__NOW__')return clock;if(v==='__TODAY__')return '2035-01-15';
  if(Array.isArray(v))return v.map(materialize);
  if(v&&typeof v==='object'){var out={};Object.keys(v).forEach(function(k){out[k]=materialize(v[k]);});return out;}
  return v;
}
function node(id){return nodes[id]||(nodes[id]={value:'',disabled:false,style:{},textContent:'',focus:function(){focused=id;},classList:{add:function(){},remove:function(){}}});}
var window={addEventListener:function(){}},document={readyState:'loading',addEventListener:function(){},getElementById:node,body:node('body')};
var localStorage={getItem:function(k){return Object.prototype.hasOwnProperty.call(storage,k)?storage[k]:null;},setItem:function(k,v){storage[k]=v;},removeItem:function(k){delete storage[k];}};
var date=class extends Date {static now(){return clock;}};
var bridge="els['toast']=document.getElementById('toast');window.qa={set:function(s){state=acceptPersistedState(s);},get:function(){return state;},export:currentSaveBackup,decode:decodeSaveBackup,request:requestSaveRestore,cancel:cancelSaveRestore,confirm:confirmSaveRestore,pending:function(){return pendingSaveRestoreCode;},reloading:function(){return reloadInProgress;}};";
var script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
assert(script.indexOf("if(document.readyState==='loading'){")>=0);
script=script.replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){");
new Function('window','document','localStorage','Date','setTimeout','clearTimeout','navigator','performance',script)(window,document,localStorage,date,function(fn){timers.push(fn);return timers.length;},function(){},{},{now:function(){return 0;}});
var qa=window.qa;qa.set(materialize(fixtures['mid-game'].save));
var exported=qa.export();assert.deepEqual(qa.decode(exported),qa.get());
var before=JSON.stringify(storage);
node('save-backup-code').value='LUMENFALL1:%broken';qa.request();
assert.equal(qa.pending(),null);assert.equal(JSON.stringify(storage),before);
var target=materialize(fixtures['restore-target'].save);target.lastSeen=clock-8*3600000;target.totalOfflineSeconds=1234;
var valid='LUMENFALL1:'+encodeURIComponent(JSON.stringify(target));node('save-backup-code').value=valid;qa.request();
assert.equal(JSON.stringify(storage),before);assert.equal(qa.pending(),valid);
assert.equal(node('save-backup-code').disabled,true);assert.equal(focused,'save-restore-cancel');
qa.cancel();assert.equal(qa.pending(),null);assert.equal(node('save-backup-code').disabled,false);
qa.confirm();assert.equal(JSON.stringify(storage),before);assert.equal(qa.reloading(),false);
node('save-backup-code').value=valid;qa.request();
node('save-backup-code').value=exported;qa.confirm();
var restored=JSON.parse(storage.lumenfall_save_v2);
assert.equal(restored.lumen,777777);assert.equal(restored.prisms,31);assert.deepEqual(restored.activeParty,['ember','void']);
assert.equal(restored.lastSeen,clock);assert.equal(restored.totalOfflineSeconds,1234);
assert.equal(storage.lumenfall_save_v2,storage.lumenfall_save_recovery_v1);assert.equal(qa.reloading(),true);assert.equal(qa.pending(),null);
console.log(JSON.stringify({status:'pass',node:process.version,v8:process.versions.v8,html_sha256:crypto.createHash('sha256').update(html).digest('hex'),checks:['complete export','invalid code nonmutation','valid request nonmutation','safe focus/input locking','cancel and stale confirmation nonmutation','captured code controls replacement','primary/recovery equality','old backup starts from now'],limitation:'minimal mocked DOM/storage engine probe; physical WebView60 and TalkBack remain required'}));
