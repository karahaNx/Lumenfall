// Historical reproduction only: exact b2a1 snapshot before main's Node migration.
// Current main uses node tests/behavioral/run.cjs; this is not its active runner.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const repo=path.resolve(__dirname,'../../../..');
const scenarios=['inquiry-chronology','inquiry-save-reload','inquiry-backup-restore','inquiry-recovery','inquiry-reset','inquiry-ui','inquiry-ui-reduced-motion','active-studies-load','chronology-study-mid-window','upgrade-effects-and-deeds','forge-effects'];
const source=fs.readFileSync(path.join(repo,'index.html'));
if(require('node:crypto').createHash('sha256').update(source).digest('hex')!=='f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4')throw Error('Historical runner requires its exact b2a1 snapshot; use the current Node harness on newer main.');
fs.mkdirSync('/tmp/lumenfall-lab-exclusive-www',{recursive:true});
fs.writeFileSync('/tmp/lumenfall-lab-exclusive-www/index.html',source);
for(const folder of ['fonts','branding'])fs.cpSync(path.join(repo,folder),'/tmp/lumenfall-lab-exclusive-www/'+folder,{recursive:true});
function run(scenario){
  return new Promise((resolve,reject)=>{
    const file=path.join(__dirname,scenario+'.log'),log=fs.createWriteStream(file);
    const args=['tests/behavioral/run.py','--web-root','/tmp/lumenfall-lab-exclusive-www','--scenario',scenario,'--raw-artifacts','/tmp/lumenfall-lab-exclusive-raw'];
    const start=Date.now(),p=spawn('python3',args,{cwd:repo,stdio:['ignore','pipe','pipe']});
    p.stdout.pipe(log,{end:false});p.stderr.pipe(log,{end:false});
    p.once('error',reject);
    p.once('close',(exit,signal)=>log.end(()=>resolve({scenario,command:['python3',...args],exit,signal,durationMs:Date.now()-start,log:path.basename(file),scope:'unchanged main baseline; no exclusive Lab implementation'})));
  });
}
(async()=>{
  const results=[];
  for(const scenario of scenarios){
    const result=await run(scenario);results.push(result);
    fs.writeFileSync(path.join(__dirname,'baseline-checks.json'),JSON.stringify({baseline:'b2a1f440e8ad9fed34b37551e468224310d2a6f6',planned:scenarios,results},null,2)+'\n');
    console.log(scenario+': exit '+result.exit+' ('+result.durationMs+'ms)');
    if(result.exit!==0){console.log('Stopped after failure; inspect raw results before further scenarios.');break;}
  }
  if(results.some(r=>r.exit!==0))process.exitCode=1;
})().catch(err=>{console.error(err);process.exitCode=1;});
