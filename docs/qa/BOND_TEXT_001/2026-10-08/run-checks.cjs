// Fresh checks for the current Node harness. Historical 7 October evidence is unchanged.
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(process.argv[2]||process.cwd()),out=path.resolve(process.argv[3]||__dirname);
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'bond-current-checks-'));
const positives=['bond-text-contract','wisp-formula-contract','rift-status-contract','rift-status-mobile','p2-03a-wisp-role-integrity','p2-07a-formation-reconstruction','p2-07a-chronology','p2-07a-save-reload','p2-07a-backup-restore','p2-07a-recovery','p2-wisp-progression-pacing','parity-short','parity-medium-farm','support-stacking'];
const negatives={
  'self-test-bond-text-ability':'ability does not repeat Bond partnerships',
  'self-test-bond-text-partners':'Formation row identifies full partner names',
  'self-test-wisp-formula-regression':'FAIL self-test-wisp-formula-regression'
};
const records=[];
fs.mkdirSync(out,{recursive:true});
try{
  fs.copyFileSync(path.join(root,'index.html'),path.join(stage,'index.html'));
  for(const name of ['fonts','branding'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
  for(const scenario of positives.concat(Object.keys(negatives))){
    // Native pipe drivers need the real browser's inherited CDP file descriptors.
    const env=scenario==='rift-status-mobile'?{...process.env,PATH:'/usr/bin:/bin:'+process.env.PATH}:process.env;
    const r=spawnSync(process.execPath,[path.join(root,'tests/behavioral/run.cjs'),'--web-root',stage,'--scenario',scenario],{cwd:root,env,encoding:'utf8',timeout:150000,maxBuffer:8*1024*1024});
    const log=(r.stdout||'')+(r.stderr||'');
    fs.writeFileSync(path.join(out,scenario+'.txt'),log);
    const expectedFailure=Object.hasOwn(negatives,scenario);
    const passed=!r.error&&r.status===(expectedFailure?1:0)&&log.includes(expectedFailure?negatives[scenario]:'PASS '+scenario);
    records.push({scenario,expectedFailure,exitCode:r.status,passed,error:r.error?.message});
    console.log((passed?'PASS ':'FAIL ')+scenario+(expectedFailure?' (caught regression)':''));
  }
}finally{fs.rmSync(stage,{recursive:true,force:true});}
const result={status:records.every(x=>x.passed)?'PASS':'FAIL',node:process.version,sourceSha256:createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex'),records};
fs.writeFileSync(path.join(out,'regressions.json'),JSON.stringify(result,null,2)+'\n');
if(result.status!=='PASS')process.exitCode=1;
