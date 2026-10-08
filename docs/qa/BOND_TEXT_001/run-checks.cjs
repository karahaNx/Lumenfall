// Runs existing, unchanged regression contracts and retains each process result.
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=process.argv[2],out=process.argv[3];
const scenarios=['wisp-formula-contract','rift-status-contract','p2-03a-wisp-role-integrity','p2-07a-formation-reconstruction','p2-07a-chronology','p2-07a-save-reload','p2-07a-backup-restore','p2-07a-recovery','p2-wisp-progression-pacing','parity-short','parity-medium-farm','support-stacking','self-test-wisp-formula-regression'];
const results=[];
for(const scenario of scenarios){
 const negative=scenario.startsWith('self-test-');
 const args=['tests/behavioral/run.py','--web-root','/tmp/bond-text-001-web','--scenario',scenario,'--raw-artifacts',out+'/raw-regressions'];
 const r=spawnSync('python3',args,{cwd:root,encoding:'utf8',timeout:60000,env:{...process.env,PATH:'/tmp/bond-check-tools:'+process.env.PATH}});
 fs.writeFileSync(out+'/'+scenario+'-cdp.log',r.stdout+r.stderr+(r.error?'\n'+r.error.stack:''));
 const passed=negative?r.status!==0&&r.stdout.includes('FAIL '+scenario):r.status===0&&r.stdout.includes('PASS '+scenario);
 results.push({scenario,negative,exit:r.status,signal:r.signal,passed,error:r.error?.message||null});
 fs.writeFileSync(out+'/regressions.json',JSON.stringify(results,null,2)+'\n');
 console.log((passed?'PASS ':'FAIL ')+scenario+' (exit '+r.status+')');
}
if(results.some(x=>!x.passed))process.exitCode=1;
