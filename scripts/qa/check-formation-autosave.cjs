/* JavaScript orchestration of the repository's current Node pre-merge gates.
 * No workflow, test tolerance, APK build or remote action is changed here.
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {spawn,spawnSync}=require('node:child_process'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
const arg=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const evidence=path.resolve(arg('--evidence')||fs.mkdtempSync(path.join(os.tmpdir(),'formation-autosave-checks-')));
fs.mkdirSync(evidence,{recursive:true});
const summary={nativeBrowser:process.env.LUMENFALL_QA_CDP_CHROME||null,started:new Date().toISOString(),base:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),sourceSha256:createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex'),checks:[]};
const env={...process.env,LUMENFALL_QA_EVIDENCE_DIR:path.join(evidence,'screenshots')};
function saveSummary(){fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify(summary,null,2)+'\n');}
async function run(name,command,argv,input){
 const start=Date.now(),log=fs.openSync(path.join(evidence,name+'.log'),'w');
 const result=await new Promise(resolve=>{
  const child=spawn(command,argv,{cwd:root,env,stdio:['pipe',log,log]});let expired=false;
  const timer=setTimeout(()=>{expired=true;child.kill('SIGTERM');},name==='behavioral-suite'?1800000:600000);
  child.once('error',error=>{clearTimeout(timer);resolve({exit:null,error:error.message});});
  child.once('close',(exit,signal)=>{clearTimeout(timer);resolve({exit,signal,expired});});
  child.stdin.on('error',()=>{});child.stdin.end(input);
 });
 fs.closeSync(log);summary.checks.push({name,command,argv,...result,seconds:(Date.now()-start)/1000});saveSummary();
 console.log((result.exit===0?'PASS ':'FAIL ')+name+' exit='+result.exit);return result.exit===0;
}
async function main(){
 await run('context',process.execPath,['scripts/codex/check_context.cjs']);
 await run('tooling',process.execPath,['tests/tooling/run.cjs']);
 await run('apk-identity-self-test',process.execPath,['scripts/verify_apk_identity.cjs','--self-test']);
 await run('source',process.execPath,['scripts/ci/validate_source.cjs']);
 const stage=path.join(root,'mobile/www');fs.mkdirSync(stage,{recursive:true});
 fs.copyFileSync(path.join(root,'index.html'),path.join(stage,'index.html'));
 for(const asset of ['fonts','branding'])fs.cpSync(path.join(root,asset),path.join(stage,asset),{recursive:true});
 if(args.includes('--full'))await run('behavioral-suite',process.execPath,['tests/behavioral/run.cjs','--web-root',stage,'--raw-artifacts',path.join(evidence,'suite-raw')]);
 else for(const scenario of ['formation-autosave-contract','formation-autosave-save-reload','formation-autosave-backup-restore','formation-autosave-recovery','formation-autosave-native','formation-autosave-reduced-motion','p2-07a-formation-reconstruction','p2-07a-persistence-review','p2-07a-chronology','p2-02a-core-qol'])await run(scenario,process.execPath,['tests/behavioral/run.cjs','--web-root',stage,'--scenario',scenario,'--raw-artifacts',path.join(evidence,scenario+'-raw')]);
 if(args.includes('--full'))for(const scenario of ['self-test-bad-assertion','self-test-uncaught-error','self-test-unhandled-rejection','self-test-parity-regression','self-test-chronology-regression','self-test-wisp-formula-regression','self-test-wisp-pacing-regression','self-test-endgame-currency-regression','self-test-wisp-role-regression','self-test-p1-05-selected','self-test-p1-05-focus-return','self-test-lifecycle-duplicate']){
  await run(scenario,process.execPath,['tests/behavioral/run.cjs','--web-root',stage,'--scenario',scenario,'--raw-artifacts',path.join(evidence,'negative-raw')]);
  const result=summary.checks.at(-1);result.expectedExit=1;result.expectedFailure=result.exit===1&&!result.expired;saveSummary();
 }
 await run('runtime-guard',process.execPath,['scripts/ci/smoke.cjs','--install-guard',path.join(stage,'index.html')]);
 const server=http.createServer((req,res)=>{
  const file=path.resolve(stage,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(stage+path.sep)){res.writeHead(403);res.end();return;}
  const stream=fs.createReadStream(file);stream.on('error',()=>{res.writeHead(404);res.end();});stream.pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const chrome=['google-chrome','google-chrome-stable','chromium','chromium-browser'].find(c=>spawnSync('which',[c],{encoding:'utf8'}).status===0);if(!chrome)throw Error('Chromium unavailable');
  await run('runtime-smoke',chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--user-data-dir='+path.join(evidence,'smoke-profile'),'--window-size=390,844','--virtual-time-budget=1800','--dump-dom','http://127.0.0.1:'+server.address().port+'/index.html']);
  const dom=fs.readFileSync(path.join(evidence,'runtime-smoke.log'),'utf8'),checks={guard:dom.includes('id="ci-runtime-error-guard"'),noUncaught:!dom.includes('data-ci-runtime-error="uncaught-error"'),noRejection:!dom.includes('data-ci-runtime-error="unhandled-rejection"'),zone:dom.includes('data-zone-index="0"'),riftLock:/<main[^>]*class="[^"]*rift-scroll-locked/.test(dom),enemy:/id="enemy-name"[^>]*>\s*[^<\s][^<]*</.test(dom),hud:/id="hud-lumen"[^>]*>\s*0(?:\.0)?\s*</.test(dom)};
  summary.checks.push({name:'runtime-smoke-assertions',exit:Object.values(checks).every(Boolean)?0:1,checks});
 }finally{await new Promise(resolve=>server.close(resolve));fs.copyFileSync(path.join(root,'index.html'),path.join(stage,'index.html'));}
 summary.finished=new Date().toISOString();summary.passed=summary.checks.every(r=>r.expectedExit===1?r.expectedFailure:r.exit===0);saveSummary();console.log('Evidence: '+evidence);if(!summary.passed)process.exitCode=1;
}
main().catch(error=>{summary.error=error.stack;saveSummary();console.error(error);process.exitCode=1;});
