/* Scoped runner. Existing Node.js assertions/harness remain authoritative.
 * node tests/behavioral/run-auto-ascend-ui.cjs --evidence-dir /absolute/directory
 * Optional local transport adapter: --pipe-browser-dir /absolute/directory
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
function arg(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const evidence=path.resolve(arg('--evidence-dir',path.join(root,'auto-ascend-evidence')));
const webRoot=path.resolve(arg('--web-root',path.join(root,'mobile/www'))),adapter=arg('--pipe-browser-dir',null);
fs.mkdirSync(evidence,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const hash=crypto.createHash('sha256').update(source).digest('hex');
const inline=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
inline.forEach((m,i)=>new vm.Script(m[1],{filename:'inline-'+i+'.js'}));
const ids=[...source.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('Duplicate HTML/markup IDs');
for(const id of [...source.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]))if(!ids.includes(id))throw Error('Missing ID '+id);
const scenarios=[
 'auto-ascend-target-contract','auto-ascend-target-legacy16','auto-ascend-target-legacy44',
 'auto-ascend-target-legacy56','auto-ascend-target-legacy130','auto-ascend-target-recovery',
 'auto-ascend-target-backup-restore','auto-ascend-target-resume','auto-ascend-target-reset',
 'auto-ascend-target-manual-reload','auto-ascend-target-cold-resume','auto-ascend-load',
 'p2-03b-auto-ascend-integrity','parity-auto-ascend','chronology-auto-ascend-mid-window',
 'lifecycle-auto-ascend','restore-roundtrip','malformed-backup-rejection',
 'legacy-backup-restore','future-backup-rejection','p1-05-accessibility-contract',
 'p1-05-control-regressions','nav-workshop-contract',
 'self-test-auto-ascend-target-manual','self-test-auto-ascend-target-window',
 'self-test-bad-assertion','self-test-uncaught-error','self-test-unhandled-rejection'
];
const env={...process.env,...(adapter?{PATH:adapter+path.delimiter+process.env.PATH}:{})};
const results=[];
async function run(scenario){
 const start=Date.now(),command=['tests/behavioral/run.cjs','--web-root',webRoot,'--scenario',scenario,'--raw-artifacts',path.join(evidence,scenario)];
 const out=fs.createWriteStream(path.join(evidence,scenario+'.log'));
 const child=spawn(process.execPath,command,{cwd:root,env,stdio:['ignore','pipe','pipe']});let captured='';
 child.stdout.on('data',b=>{out.write(b);captured+=b;});child.stderr.on('data',b=>{out.write(b);captured+=b;});
 const outcome=await new Promise(resolve=>{child.once('error',e=>resolve({code:null,error:e.message}));child.once('close',(code,signal)=>resolve({code,signal}));});
 await new Promise(resolve=>out.end(resolve));
 const negative=scenario.startsWith('self-test-'),qa=/(?:^|\n)(PASS|FAIL) /.exec(captured)?.[1];
 const passed=negative ? outcome.code!==0&&qa==='FAIL'&&captured.includes('"valid": true')&&captured.includes('"json_status": "fail"') : outcome.code===0&&qa==='PASS';
 const result={scenario,expected:negative?'assertion failure':'pass',...outcome,passed,elapsedMs:Date.now()-start,log:scenario+'.log'};
 results.push(result);fs.writeFileSync(path.join(evidence,'summary.json'),JSON.stringify({sourceSha256:hash,transport:adapter?'local CDP adapter; not default dump-dom/virtual-time CI':'repository default',inlineScripts:inline.length,results},null,2));
 process.stdout.write((passed?'PASS ':'FAIL ')+scenario+' exit='+outcome.code+'\n');
}
(async()=>{for(let i=0;i<scenarios.length;i+=3)await Promise.all(scenarios.slice(i,i+3).map(run));if(results.some(r=>!r.passed))process.exitCode=1;})().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
