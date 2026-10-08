'use strict';
// Node20+ orchestration; legacy child harness/product execute on supplied V8 6.0.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../../..'),{runProcess}=require(root+'/scripts/lib/process.cjs');
const [runtime,sourcePath,outPath,expectedTracks]=process.argv.slice(2);assert(runtime&&sourcePath&&outPath,'Legacy runtime, actual HTML and evidence directory required');
const source=path.resolve(sourcePath),out=path.resolve(outPath),hash=crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');fs.mkdirSync(out,{recursive:true});
let offline=fs.readFileSync(root+'/tests/behavioral/offline-catchup-v8.cjs','utf8');
const before="var root=path.resolve(__dirname,'../..'),source=fs.readFileSync(path.join(root,'index.html'),'utf8');";
assert.equal(offline.split(before).length,2,'unique existing harness root marker');
offline=offline.replace(before,'var root='+JSON.stringify(root)+",source=fs.readFileSync(process.argv[2],'utf8');");
offline=offline.replace("status:'pass',scenario:'offline-catchup-v8'","status:'pass',htmlSha256:require('crypto').createHash('sha256').update(source).digest('hex'),scenario:'offline-catchup-v8'");
const generated=out+'/offline-catchup-v8.cjs';fs.writeFileSync(generated,offline);
async function run(name,harness){
 const command=[runtime,harness,source];if(name==='upgrade-identity-v8'&&expectedTracks!==undefined)command.push(expectedTracks);const result=await runProcess(command,{timeout:90000});
 fs.writeFileSync(out+'/'+name+'.txt',result.stdout+(result.stderr?'\n'+result.stderr:''));assert.equal(result.exitcode,0,name);assert(!result.timed_out,name+' no timeout');
 const data=JSON.parse(result.stdout);assert.equal(data.status,'pass',name);assert(data.v8.startsWith('6.0.'),'required legacy engine');assert.equal(data.htmlSha256,hash,'actual source binding '+name);
 fs.writeFileSync(out+'/'+name+'.json',JSON.stringify({command,...data},null,2)+'\n');console.log('PASS '+name+' '+data.v8);return {name,command,result:data};
}
(async()=>{const records=await Promise.all([run('upgrade-identity-v8',__dirname+'/legacy-engine.cjs'),run('offline-entry-v8',generated)]);fs.writeFileSync(out+'/results.json',JSON.stringify({status:'pass',sourceSha256:hash,records},null,2)+'\n');})().catch(error=>{console.error(error);process.exitCode=1;});
