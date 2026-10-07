/* JS orchestration of existing, unchanged behavioral gates. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),stage=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-support-stage-'));
const defaults=['support-stacking','buff-timing','support-save-reload','support-backup-restore','support-recovery','support-resume','support-recovery-resume','support-visibility-resume','support-reset','buff-save-reload','forge-contracts','forge-chronology','chronology-simultaneous-order','rift-status-stacking-mobile','rift-status-stacking-reduced-motion'];
const scenarios=process.argv.slice(2).length?process.argv.slice(2):defaults;
const previousPath=path.join(__dirname,'check-results.json');
const records=fs.existsSync(previousPath)?JSON.parse(fs.readFileSync(previousPath,'utf8')).records:[];
const hash=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex');
let failed=false;
try {
  fs.copyFileSync(path.join(root,'index.html'),path.join(stage,'index.html'));
  for(const dir of ['fonts','branding'])fs.cpSync(path.join(root,dir),path.join(stage,dir),{recursive:true});
  for(const scenario of scenarios) {
    const args=['tests/behavioral/run.py','--web-root',stage,'--scenario',scenario,'--raw-artifacts',path.join(__dirname,'raw-failures')];
    const before=Date.now(),r=spawnSync('python3',args,{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:32*1024*1024});
    const log=(r.stdout||'')+(r.stderr||'');
    fs.writeFileSync(path.join(__dirname,scenario+'.txt'),log);
    const record={scenario,command:['python3',...args],indexSha256:hash,exit:r.status,signal:r.signal,error:r.error?.message||null,seconds:(Date.now()-before)/1000,status:r.status===0&&!r.error?'pass':'fail',log:scenario+'.txt'};
    const old=records.findIndex(x=>x.scenario===scenario);if(old>=0)records[old]=record;else records.push(record);
    failed ||= record.status==='fail';
    fs.writeFileSync(previousPath,JSON.stringify({sourceIndexSha256:hash,records},null,2)+'\n');
    console.log(JSON.stringify(record));
  }
} finally {fs.rmSync(stage,{recursive:true,force:true});}
if(failed)process.exitCode=1;
