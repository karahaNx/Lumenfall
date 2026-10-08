'use strict';
// Compare both exact sources using the same explicit extraction boundaries.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [baselineFile,laterFile,main,out]=process.argv.slice(2);
assert(baselineFile&&laterFile&&main&&out,'baseline later main output arguments required');
const baseline=fs.readFileSync(baselineFile,'utf8'),later=fs.readFileSync(laterFile,'utf8');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function regions(source){
 const result={};
 for(const name of ['nextRiftObjective','syncMainScrollMode','renderRiftGuidancePreference','setRiftGuidanceHidden','renderRiftObjective']){
  const matches=[...source.matchAll(new RegExp('^function '+name+'\\([^]*?^}','gm'))];
  assert.equal(matches.length,1,'one exact declaration: '+name);
  result[name]={text:matches[0][0],start:matches[0].index};
 }
 for(const [name,startMarker,endMarker] of [
  ['styles','  /* F07:','  .stage .objective-kind'],
  ['markup','    <div id="rift-guidance-slot">','    <nav class="tabbar"']
 ]){
  const start=source.indexOf(startMarker),end=source.indexOf(endMarker,start);
  assert(start>=0&&end>start,'bounded '+name);
  result[name]={text:source.slice(start,end),start};
 }
 return result;
}
const old=regions(baseline),current=regions(later);
const sections=Object.keys(current).map(name=>{
 assert.equal(old[name].text,current[name].text,'byte-identical region: '+name);
 return {name,baselineSha256:hash(old[name].text),laterSha256:hash(current[name].text),bytes:Buffer.byteLength(current[name].text),baselineStart:old[name].start,laterStart:current[name].start,unchanged:true};
});
fs.writeFileSync(out,JSON.stringify({status:'pass',main,apkSourceSha256:hash(baseline),laterSourceSha256:hash(later),extraction:'Functions: declaration through its column-zero closing brace, excluding trailing whitespace/next declarations. Styles: F07 comment up to stage objective-kind rule. Markup: guidance div up to navigation tag. Identical boundaries applied to both sources; older receipts used different boundaries, so their region hashes are not comparable.',sections,scope:'F07 regions only; whole-APK native acceptance remains bound to151. Later full-source acceptance is separate.'},null,2)+'\n');
console.log('PASS: seven exact F07 regions match accepted APK source');
