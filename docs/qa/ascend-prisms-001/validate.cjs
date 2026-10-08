#!/usr/bin/env node
'use strict';
// Local equivalents of pre-merge gates, retaining complete process receipts.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const {serve}=require('../../../scripts/lib/static-server.cjs');
const {hash}=require('../../../scripts/lib/cli.cjs');
const root=path.resolve(__dirname,'../../..');
const output=path.resolve(process.argv[2]||'/tmp/lumenfall-f05-validation');
const postOnly=process.argv[3]==='--post-behavioral';
if(process.argv.length>4||process.argv[3]&&!postOnly)throw Error('Optional mode: --post-behavioral');
fs.mkdirSync(output,{recursive:true});
const receipt={startedAt:new Date().toISOString(),sourceSha256:hash(fs.readFileSync(path.join(root,'index.html'))),node:process.versions.node,scope:'local candidate; no remote CI, merge or Android/device acceptance',steps:[]};
receipt.selection=postOnly?'negative controls and smoke only; full behavioral suite recorded separately':'all local pre-merge gates';
function save(){fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');}
function runLogged(command,name,timeout){
  const stdoutFile=path.join(output,name+'-stdout.txt'),stderrFile=path.join(output,name+'-stderr.txt');
  fs.writeFileSync(stdoutFile,'');fs.writeFileSync(stderrFile,'');
  return new Promise((resolve,reject)=>{
    const child=spawn(command[0],command.slice(1),{stdio:['ignore','pipe','pipe']}),stdout=[],stderr=[];
    let timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},timeout);
    child.stdout.on('data',data=>{stdout.push(data);fs.appendFileSync(stdoutFile,data);});
    child.stderr.on('data',data=>{stderr.push(data);fs.appendFileSync(stderrFile,data);});
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('close',(code,signal)=>{clearTimeout(timer);resolve({stdout:Buffer.concat(stdout).toString(),stderr:Buffer.concat(stderr).toString(),exitcode:timedOut?null:code,timed_out:timedOut,signal});});
  });
}
async function step(name,command,timeout=60000,negative=false,marker=null){
  const start=new Date().toISOString(),r=await runLogged(command,name,timeout);
  fs.writeFileSync(path.join(output,name+'-stdout.txt'),r.stdout);
  fs.writeFileSync(path.join(output,name+'-stderr.txt'),r.stderr);
  let caught=r.stdout.includes('"qa_status": "fail"')&&r.stdout.includes('"valid": true');
  // The existing Backup driver reports native-process JSON, not DOM QA status.
  // Require its specific mutant and causal assertion; an arbitrary failure is
  // never accepted as evidence that the negative control was detected.
  const backupControls={
    'negative-save-backup-placement':['misplaced-backup','Backup is under Save immediately before separate Reset'],
    'negative-save-backup-confirmation':['early-restore','Restore request waits for confirmation']
  };
  if(backupControls[name]){
    const detail=/^  detail: (.+)$/m.exec(r.stdout);
    if(detail){const d=JSON.parse(detail[1]),[mutant,message]=backupControls[name];caught=d.status==='fail'&&d.mutant===mutant&&(d.message||'').startsWith(message);}
  }
  const passed=!r.timed_out&&(negative?r.exitcode!==0&&caught&&(!marker||r.stdout.includes(marker)):r.exitcode===0);
  receipt.steps.push({name,command,start,exitcode:r.exitcode,timedOut:r.timed_out,signal:r.signal,expected:negative?'intended QA failure':'success',passed,stdoutSha256:hash(r.stdout),stderrSha256:hash(r.stderr)});save();
  console.log((passed?'PASS ':'FAIL ')+name);
  if(!passed)throw Error(name+' failed; see retained stdout/stderr in '+output);
}
const workflow=fs.readFileSync(path.join(root,'.github/workflows/pre-merge-validation.yml'),'utf8');
const negativeLoop=/for scenario in ([^;\n]+); do/.exec(workflow);
if(!negativeLoop)throw Error('Required CI negative-control list not found');
const requiredNegatives=negativeLoop[1].trim().split(/\s+/).filter(name=>!name.startsWith('self-test-ascend-prisms-')).map(name=>name.replace(/^self-test-/,''));
(async()=>{
  const stage=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f05-validation-'));
  let server;
  try{
    fs.copyFileSync(path.join(root,'index.html'),path.join(stage,'index.html'));
    for(const name of ['fonts','branding'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
    if(!postOnly){
      await step('apk-verifier-self-test',[process.execPath,path.join(root,'scripts/verify_apk_identity.cjs'),'--self-test']);
      await step('tooling',[process.execPath,path.join(root,'tests/tooling/run.cjs')],180000);
      await step('source',[process.execPath,path.join(root,'scripts/ci/validate_source.cjs')]);
      await step('behavioral',[process.execPath,path.join(root,'tests/behavioral/run.cjs'),'--web-root',stage,'--raw-artifacts',path.join(output,'failures')],1800000);
    }
    for(const name of requiredNegatives){
      await step('negative-'+name,[process.execPath,path.join(root,'tests/behavioral/run.cjs'),'--web-root',stage,'--scenario','self-test-'+name,'--raw-artifacts',path.join(output,'negative-raw')],60000,true);
    }
    for(const name of ['tree','lab','payout','repeat','rounding']){
      await step('negative-ascend-prisms-'+name,[process.execPath,path.join(root,'tests/behavioral/run.cjs'),'--web-root',stage,'--scenario','self-test-ascend-prisms-'+name,'--raw-artifacts',path.join(output,'negative-raw')],60000,true,name==='payout'?'manual payout equals preview/oracle':'reward oracle');
    }
    await step('smoke-install',[process.execPath,path.join(root,'scripts/ci/smoke.cjs'),'--install-guard',path.join(stage,'index.html')]);
    server=await serve(stage);
    const chrome=process.env.LUMENFALL_CHROME||'google-chrome';
    const profile=path.join(stage,'chrome-profile');
    await step('smoke-browser',[chrome,'--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--user-data-dir='+profile,'--window-size=390,844','--virtual-time-budget=1800','--dump-dom','http://127.0.0.1:'+server.address().port+'/index.html']);
    await step('smoke-check',[process.execPath,path.join(root,'scripts/ci/smoke.cjs'),'--dom',path.join(output,'smoke-browser-stdout.txt'),'--chrome-log',path.join(output,'smoke-browser-stderr.txt'),'--require-guard']);
    receipt.finishedAt=new Date().toISOString();receipt.status='pass';save();
  }finally{
    if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
    fs.rmSync(stage,{recursive:true,force:true});
  }
})().catch(error=>{receipt.status='fail';receipt.error=error.stack;save();console.error(error.stack);process.exitCode=1;});
