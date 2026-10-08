'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../../../..'),out=__dirname;
const run=args=>spawnSync(args[0],args.slice(1),{cwd:root,encoding:'utf8',timeout:360000,maxBuffer:64*1024*1024});
const git=args=>{const r=run(['git',...args]);assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
const candidate='11cb7363bc304b31821e2b46b39a43cc7684be99',integration=git(['rev-parse','HEAD']);
git(['diff','--quiet',candidate,integration,'--','index.html','tests/behavioral','scripts','.github','mobile','fonts','branding','AGENTS.md','PROJECT_BOOTSTRAP.txt','docs/project/FEATURE_WORKFLOW.md']);
for(const name of ['index.html','fonts','branding'])fs.cpSync(path.join(root,name),path.join(root,'mobile/www',name),{recursive:true});
const results=[],commands=[
 ['source',['node','scripts/ci/validate_source.cjs']],
 ['tooling',['node','tests/tooling/run.cjs']],
 ['apk-identity-self-test',['node','scripts/verify_apk_identity.cjs','--self-test']],
 ['context',['node','scripts/codex/check_context.cjs','--task','docs/tasks/TREE_EXCLUSIVE_001.md']],
 ...['tree-purchase-contract','tree-purchase-ui','tree-purchase-ui-reduced-motion','upgrade-identity-contracts','upgrade-identity-chronology','upgrade-identity-save-reload','upgrade-identity-recovery','upgrade-identity-backup-restore','offline-12h-core'].map(name=>[name,['node','tests/behavioral/run.cjs','--web-root','mobile/www','--scenario',name]])
];
for(const [name,args]of commands){const r=run(args),raw=r.stdout+r.stderr;fs.writeFileSync(path.join(out,name+'.txt'),raw);const pass=r.status===0&&!r.error;results.push({name,args,status:r.status,error:r.error?String(r.error):null,pass,logSha256:crypto.createHash('sha256').update(raw).digest('hex')});console.log((pass?'PASS ':'FAIL ')+name);if(!pass)console.error(raw.slice(-2000));}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({integration,candidate,unchangedProductTestsAndGates:true,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex'),node:process.version,results},null,2)+'\n');
assert(results.every(r=>r.pass),'All integrated checks must pass');
