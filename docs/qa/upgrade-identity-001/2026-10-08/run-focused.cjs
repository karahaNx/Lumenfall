'use strict';
// Re-run relevant existing scenarios against an explicitly staged integrated
// source or the actual extracted APK. Two isolated runner processes at a time.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../../..'),{runProcess}=require(root+'/scripts/lib/process.cjs');
const [webRoot,outputRoot]=process.argv.slice(2);assert(webRoot&&outputRoot,'Explicit web-root and evidence directory required');
const source=path.resolve(webRoot),out=path.resolve(outputRoot),hash=()=>crypto.createHash('sha256').update(fs.readFileSync(source+'/index.html')).digest('hex');
fs.mkdirSync(out,{recursive:true});
const sourceSha256=hash(),scenarios=['upgrade-identity-contracts','upgrade-identity-chronology','upgrade-identity-farm-clock','upgrade-identity-save-reload','upgrade-identity-backup-restore','upgrade-identity-recovery','upgrade-identity-ui','upgrade-identity-reduced-motion','forge-contracts','forge-chronology','inquiry-contracts','inquiry-chronology','chronology-research-mid-window','formation-autosave-contract','formation-autosave-save-reload','formation-autosave-backup-restore','formation-autosave-recovery','save-backup-ui','p2-07a-formation-reconstruction'],records=[];
async function run(scenario){
 const command=[process.execPath,root+'/tests/behavioral/run.cjs','--web-root',source,'--scenario',scenario,'--raw-artifacts',out+'/raw'];
 const result=await runProcess(command,{timeout:240000,cwd:root}),text=result.stdout+'\n'+result.stderr;
 fs.writeFileSync(out+'/'+scenario+'.txt.gz',zlib.gzipSync(text));
 const passed=result.exitcode===0&&!result.timed_out&&/^Behavioral QA passed: 1 deterministic scenario\(s\)\.$/m.test(result.stdout);
 records.push({scenario,passed,exitcode:result.exitcode,timedOut:result.timed_out,successfulRuns:(result.stdout.match(/^PASS /gm)||[]).length,command});console.log((passed?'PASS ':'FAIL ')+scenario);
}
(async()=>{
 for(let i=0;i<scenarios.length;i+=2)await Promise.all(scenarios.slice(i,i+2).map(run));
 assert.equal(hash(),sourceSha256,'source unchanged during acceptance');records.sort((a,b)=>scenarios.indexOf(a.scenario)-scenarios.indexOf(b.scenario));
 const receipt={sourceSha256,status:records.every(r=>r.passed)?'pass':'fail',scenarios:records.length,successfulRuns:records.reduce((n,r)=>n+r.successfulRuns,0),records};fs.writeFileSync(out+'/results.json',JSON.stringify(receipt,null,2)+'\n');
 if(receipt.status!=='pass')process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
