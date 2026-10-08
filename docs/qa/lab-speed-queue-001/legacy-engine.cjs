#!/usr/bin/env node
'use strict';
// Modern orchestration, actual V8 6.0 execution. Retain all offline assertions;
// adapt Node builtin import names, equivalent strict-assert aliases and the
// input source path for Node 8. Product bytes and test assertions are unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const [engine,apkSource,output]=process.argv.slice(2);
assert(engine&&apkSource&&output,'Node 8.3 engine, extracted APK HTML, output directory required');
const root=path.resolve(__dirname,'../../..');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f12-v8-'));
 async function execute(args,name){
  // Node 8 cannot classify Node 24's socket-based stdout pipe in this host.
  // Regular files preserve full output without changing assertions or engine.
  const stdout=path.join(temp,name+'.out'),stderr=path.join(temp,name+'.err');
  const fds=[fs.openSync(stdout,'w'),fs.openSync(stderr,'w')];
  let child;
  try{
   const result=await new Promise((resolve,reject)=>{
    child=spawn(engine,args,{stdio:['ignore',...fds]});
    const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Legacy engine timeout'));},90000);
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('close',(code,signal)=>{clearTimeout(timer);resolve({code,signal});});
   });
   assert.equal(result.code,0,fs.readFileSync(stderr,'utf8'));
   return {stdout:fs.readFileSync(stdout,'utf8'),stderr:fs.readFileSync(stderr,'utf8')};
  }finally{fds.forEach(fd=>fs.closeSync(fd));}
 }
 const original=fs.readFileSync(path.join(root,'tests/behavioral/lab-motes-offline.cjs'),'utf8');
 let adapted=original.replaceAll("require('node:","require('");
 adapted=adapted.replace("require('assert/strict')","(function(){var a=require('assert');a.equal=a.strictEqual;a.deepEqual=a.deepStrictEqual;return a;})()");
 const marker="path.join(__dirname,'../../index.html')";
 assert.equal(adapted.split(marker).length,2);
 adapted=adapted.replace(marker,()=>JSON.stringify(path.resolve(apkSource)));
 try{
  const identity=JSON.parse((await execute(['-p','JSON.stringify({node:process.version,v8:process.versions.v8})'],'identity')).stdout);
  assert.equal(identity.node,'v8.3.0');assert.equal(identity.v8,'6.0.286.52');
  const script=path.join(temp,'offline.cjs');fs.writeFileSync(script,adapted);
  const result=await execute([script],'offline');
  const report=JSON.parse(result.stdout);assert.equal(report.status,'pass');
  fs.writeFileSync(path.join(output,'integrated-apk-v8-lab.json'),JSON.stringify({status:'pass',...identity,sourceSha256:sha(fs.readFileSync(apkSource)),originalDriverSha256:sha(original),adaptedDriverSha256:sha(adapted),adaptation:'Builtin import names, equal/deepEqual aliases to strictEqual/deepStrictEqual and input path only; all existing assertions retained',limitation:'Actual legacy JS engine; no native DOM/lifecycle/TalkBack acceptance',report,stderr:result.stderr},null,2)+'\n');
  console.log('PASS integrated Lab offline/payment/retry on actual V8 '+identity.v8);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
