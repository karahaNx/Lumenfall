'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=process.argv[2],out=process.argv[3];
fs.mkdirSync(out,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const cases=[
 ['lab-core',['tests/behavioral/lab-expansion.cjs','index.html','--negative']],
 ['lab-boundary',['tests/behavioral/lab-expansion-boundary.cjs','index.html','--negative']],
 ['lab-stress',['tests/behavioral/lab-expansion-stress.cjs','index.html']],
 ['prism-state',['tests/behavioral/prism-earning-state.cjs','index.html']],
 ['forge-core',['tests/behavioral/forge-expansion.cjs','index.html','--negative']],
 ['forge-calibration',['tests/behavioral/forge-expansion-calibration.cjs','index.html','--negative']],
 ['tooling',['tests/tooling/run.cjs']],
 ['identity-selftest',['scripts/verify_apk_identity.cjs','--self-test']]
];
const report={sourceSha256:sha(path.join(root,'index.html')),fixtureSha256:sha(path.join(root,'tests/behavioral/fixtures.json')),runtime:process.version,v8:process.versions.v8,runs:[]};
let next=0;
async function worker(){while(next<cases.length){
 const [id,args]=cases[next++],start=performance.now();
 const stdout=fs.openSync(path.join(out,id+'.stdout'),'w'),stderr=fs.openSync(path.join(out,id+'.stderr'),'w');
 const child=cp.spawn(process.execPath,args,{cwd:root,stdio:['ignore',stdout,stderr]});
 const outcome=await new Promise(resolve=>{child.on('error',e=>resolve({error:e.message}));child.on('exit',(exit,signal)=>resolve({exit,signal}));});
 fs.closeSync(stdout);fs.closeSync(stderr);
 const row={id,command:[process.execPath,...args],scriptSha256:sha(path.join(root,args[0])),...outcome,durationMs:Math.round(performance.now()-start)};
 report.runs.push(row);fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(row));
}}
Promise.all([worker(),worker(),worker()]).then(()=>{console.log(JSON.stringify({finished:report.runs.length,failed:report.runs.filter(x=>x.exit!==0).length,sourceUnchanged:report.sourceSha256===sha(path.join(root,'index.html'))}));process.exitCode=report.runs.some(x=>x.exit!==0)?1:0;});
