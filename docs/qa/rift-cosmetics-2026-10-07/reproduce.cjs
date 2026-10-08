#!/usr/bin/env node
// Reproduce selected existing checks with the saved diagnostic CDP adapter.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rift-cosmetics-reproduce-'));
const stage=path.join(tmp,'www'),bin=path.join(tmp,'bin');fs.mkdirSync(stage);fs.mkdirSync(bin);
fs.copyFileSync(path.join(root,'index.html'),path.join(stage,'index.html'));
for(const name of ['fonts','branding'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
fs.symlinkSync(path.join(__dirname,'tools/chromium-cdp.cjs'),path.join(bin,'google-chrome'));
const env={...process.env,PATH:bin+path.delimiter+process.env.PATH,LUMENFALL_QA_CDP_CHROME:'/usr/bin/chromium'};
function run(args,expectedFailure=false){
  const result=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024});
  process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
  const log=args.includes('--scenario')?args[args.indexOf('--scenario')+1]:path.basename(args[0]);
  fs.writeFileSync(path.join(tmp,log+'.log'),(result.stdout||'')+(result.stderr||''));
  if(result.error||result.signal||result.status===null)throw result.error||Error('process did not complete: '+log);
  if(expectedFailure){if(result.status===0||!result.stdout.includes('FAIL self-test-p1-05-selected'))throw Error('negative did not fail at selected-state check');}
  else if(result.status!==0)throw Error('check failed: '+log);
}
try{
  run(['scripts/codex/check_context.cjs']);run(['scripts/ci/validate_source.cjs']);run(['scripts/verify_apk_identity.cjs','--self-test']);
  for(const scenario of ['upgrade-effects-and-deeds','p1-05-control-regressions','p1-05-reduced-motion','rift-status-contract','rift-status-mobile','restore-roundtrip','recovery-from-corrupt-primary','parity-short','chronology-simultaneous-order']){
    run(['tests/behavioral/run.cjs','--web-root',stage,'--scenario',scenario,'--raw-artifacts',path.join(tmp,'raw')]);
  }
  run(['tests/behavioral/run.cjs','--web-root',stage,'--scenario','self-test-p1-05-selected','--raw-artifacts',path.join(tmp,'raw')],true);
  console.log('PASS selected existing checks; complete outputs: '+tmp);
}catch(error){console.error(error.stack);console.error('Retained outputs: '+tmp);process.exitCode=1;}
