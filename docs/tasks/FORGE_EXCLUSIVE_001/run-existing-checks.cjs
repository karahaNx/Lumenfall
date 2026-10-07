const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const repo=process.argv[2] || '/workspace/Lumenfall-FORGE_EXCLUSIVE_001';
const out=path.join(__dirname,'EVIDENCE');
const cdp=process.argv.includes('--cdp');
const uiOnly=process.argv.includes('--ui-only');
const prefix=uiOnly?'current-ui-':'current-';
const scenarios=uiOnly?['forge-ui-mobile','forge-ui-reduced-motion']:['forge-contracts','forge-effects','forge-chronology','forge-baseline','forge-save-reload','forge-backup-restore','forge-recovery','forge-ui-mobile','forge-ui-reduced-motion','self-test-bad-assertion'];
const results=[];
for(const scenario of scenarios){
  const args=['tests/behavioral/run.cjs','--web-root',process.env.FORGE_EXCLUSIVE_WEB_ROOT||'/workspace/forge-exclusive-001-web','--scenario',scenario,'--raw-artifacts',path.join(out,prefix+'raw',scenario)];
  const start=new Date().toISOString();
  const env={...process.env,...(cdp?{PATH:path.join(__dirname,'cdp-bin')+path.delimiter+process.env.PATH,LUMENFALL_QA_CDP_CHROME:'/usr/bin/chromium'}:{})};
  const run=spawnSync('node',args,{cwd:repo,env,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});
  fs.writeFileSync(path.join(out,prefix+scenario+'.stdout.txt'),run.stdout||'');
  fs.writeFileSync(path.join(out,prefix+scenario+'.stderr.txt'),run.stderr||'');
  const expectedExit=scenario.startsWith('self-test-')?1:0;
  const result={scenario,start,end:new Date().toISOString(),transport:cdp?'local CDP adapter for dump-dom; native UI uses original driver':'original Chromium CLI',command:['node',...args],exit:run.status,expectedExit,signal:run.signal,error:run.error?.message||null};
  results.push(result);
  fs.writeFileSync(path.join(out,prefix+'checks.json'),JSON.stringify({scope:'Unchanged product baseline; no new Forge feature acceptance',results},null,2)+'\n');
  console.log(JSON.stringify(result));
}
if(results.some(r=>r.exit!==r.expectedExit))process.exitCode=1;
