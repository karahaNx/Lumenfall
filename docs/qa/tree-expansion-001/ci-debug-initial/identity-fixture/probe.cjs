'use strict';
// Reproduce the original catalogue assertion with the full production IIFE.
// Compile the generated browser scripts; do not execute or claim browser QA.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../../../..'),head='0c539c528d3b950a786d0ea377fcfc59499f1a3a';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(path.join(root,p)),git=p=>cp.execFileSync('git',['show',head+':'+p],{cwd:root,maxBuffer:16*1024*1024});
const source=read('index.html'),originalTest=git('tests/behavioral/upgrade-identity.js'),currentTest=read('tests/behavioral/upgrade-identity.js');
assert.equal(sha(source),'4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef');assert(source.equals(git('index.html')));
assert(read('tests/behavioral/fixtures.json').equals(git('tests/behavioral/fixtures.json')));
const H=require(path.join(root,'tests/behavioral/tree-expansion-harness.cjs')),R=require(path.join(root,'tests/behavioral/run.cjs')),x=H.app(source.toString('utf8'));
const oldExpression='u.nodes().filter(function(n){return !n.retiredTo&&!n.retired;}).map(function(n){return [n.id,n.baseCost,n.growth];})';
const retainedExpression="u.nodes().filter(function(n){return !n.retiredTo&&!n.retired&&['echo','bonds','swift'].indexOf(n.id)!==-1;}).map(function(n){return [n.id,n.baseCost,n.growth];})";
assert(originalTest.toString().includes(oldExpression));assert(currentTest.toString().includes(retainedExpression));
const expected=[['echo',2,1.4],['bonds',2,1.45],['swift',3,1.5]],actual=vm.runInNewContext(oldExpression,{u:{nodes:()=>x.q.defs()}});
let error;try{assert.equal(JSON.stringify(actual),JSON.stringify(expected),'retained Prism prices after F26 hours retirement');}catch(e){error=e;}
assert(error,'original catalogue comparison must reproduce its real mismatch');assert.equal(actual.length,20);
const retained=vm.runInNewContext(retainedExpression,{u:{nodes:()=>x.q.defs()}});assert.equal(JSON.stringify(retained),JSON.stringify(expected));
const oldIds=['starlight','steady','echo','bonds','swift','momentum','reserves'],addedIds=['swiftcharter','lumenmemory','veteranrecruits','rosterrecall','chargememory','supportmemory','phasememory','riftstep','frontier','stardust','gentlegrowth','formationseat','benchmentor','empowerbatch','wallwisdom','invitations','recruitreserve'];
const fresh=x.q.get(),matrix=[];
for(const level of [0,1,6,20,31]){const s=JSON.parse(JSON.stringify(fresh));for(const id of oldIds)s.nodes[id]=level;for(const id of addedIds)assert.equal(s.nodes[id],0,id+' remains unpurchased');matrix.push({oldLevel:level,assignedOldIds:oldIds,newIdsRequiredZero:addedIds.length});}
const fixtures=R.loadFixtures(),syntax=[];
for(const variant of ['unchanged','self-test-upgrade-identity-buy','self-test-upgrade-identity-value','self-test-upgrade-identity-clock']){
 const candidate=variant==='unchanged'?source.toString():R.mutateSource(source.toString(),variant);
 if(variant!=='unchanged')assert.notEqual(candidate,source.toString(),variant+' causal source anchor retained');
 const generated=R.instrumentHtml(candidate,fixtures),scripts=Array.from(generated.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g));assert(scripts.length>2);
 for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i][1],{filename:variant+'-'+i+'.js'});
 syntax.push({variant,scriptsParsed:scripts.length,generatedBytes:Buffer.byteLength(generated),generatedSha256:sha(generated),generatedHtmlStored:false});
}
assert(read('tests/behavioral/run.cjs').equals(git('tests/behavioral/run.cjs')),'all existing negative mutation hooks unchanged');
console.log(JSON.stringify({status:'diagnosed-and-syntax-checked',headSha:head,sourceSha256:sha(source),sourceBytes:source.length,originalTest:{bytes:originalTest.length,sha256:sha(originalTest)},repairedTest:{bytes:currentTest.length,sha256:sha(currentTest)},harnessSha256:sha(read('tests/behavioral/tree-expansion-harness.cjs')),generatorSha256:sha(read('tests/behavioral/run.cjs')),fixtureSha256:sha(read('tests/behavioral/fixtures.json')),node:{version:process.version,v8:process.versions.v8,path:process.execPath},originalFailure:{label:'retained Prism prices after F26 hours retirement',expected,actual,expectedRows:3,actualRows:20,message:error.message},retainedSubset:{expected,actual:retained,exact:true},activeTreeTracks:actual.length,historicalMatrixFixture:matrix,syntax,scope:'Full production IIFE catalogue and fresh defaults; generated base/three identity-mutant scripts compile only. No browser invocation, historical multiplier execution or22-negative PASS claim. Required full browser regression and all mandatory negatives remain pending.'},null,2));
