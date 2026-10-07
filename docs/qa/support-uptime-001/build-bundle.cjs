/* Phone-ready local checkpoint, with hashes and native ZIP CRC verification. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),destination=path.resolve(process.argv[2]||'/workspace/artifacts/SUPPORT_UPTIME_001');
fs.mkdirSync(destination,{recursive:true});
const bundle=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-support-bundle-'));
function git(...args){const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
fs.writeFileSync(path.join(bundle,'LOCAL_CHECKPOINT.json'),JSON.stringify({head:git('rev-parse','HEAD'),tree:git('rev-parse','HEAD^{tree}'),branch:git('branch','--show-current'),trackedWork:git('status','--porcelain'),remoteWrite:false,note:'Private checkout only; coordinated GitHub checkpoint still required'},null,2)+'\n');
function copy(from,to){fs.mkdirSync(path.dirname(path.join(bundle,to)),{recursive:true});fs.copyFileSync(path.join(root,from),path.join(bundle,to));}
copy('docs/tasks/SUPPORT_UPTIME_001.md','TASK/SUPPORT_UPTIME_001.md');
fs.cpSync(__dirname,path.join(bundle,'EVIDENCE'),{recursive:true});
copy('docs/qa/support-uptime-001/START_HER.txt','START_HER.txt');
copy('index.html','SOURCE/main-index.html');
copy('docs/handoffs/02_08/2026-10-07/SOURCE/index.html','SOURCE/b2-index.html');
copy('docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt','ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt');
copy('docs/recovery/2026-10-07/lead_context/FEEDBACK/TASK_FEEDBACK_REVISION_001.txt','REFERENCES/TASK_FEEDBACK_REVISION_001.txt');
copy('docs/recovery/2026-10-07/lead_context/DECISIONS/FEEDBACK_REGISTERED_001.txt','REFERENCES/FEEDBACK_REGISTERED_001.txt');
for(const file of ['AGENTS.md','PROJECT_BOOTSTRAP.txt','docs/PROJECT_STATE.md','docs/agents/02_GAMEPLAY.md','docs/project/FEATURE_WORKFLOW.md'])copy(file,'RULES/'+path.basename(file));
const payloads=[];
function walk(dir,relative=''){for(const name of fs.readdirSync(dir).sort()){const file=path.join(dir,name),rel=path.posix.join(relative,name);if(fs.statSync(file).isDirectory())walk(file,rel);else{const bytes=fs.readFileSync(file);payloads.push({path:rel,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}
walk(bundle);
const original=fs.readFileSync(path.join(root,'docs/recovery/2026-10-07/lead_context/FEEDBACK/ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt'));
assert.ok(original.equals(fs.readFileSync(path.join(bundle,'ORIGINAL/USER_REQUIREMENTS_2026-10-07.txt'))),'original bytes unchanged');
fs.writeFileSync(path.join(bundle,'MANIFEST.json'),JSON.stringify({baseline:'b2a1f440e8ad9fed34b37551e468224310d2a6f6',status:'local-profile-proposal-incomplete',payloads},null,2)+'\n');
const zipPath=path.join(destination,'SUPPORT_UPTIME_001.zip');
if(fs.existsSync(zipPath))fs.unlinkSync(zipPath);
let r=spawnSync('zip',['-q','-r',zipPath,'.'],{cwd:bundle,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
r=spawnSync('unzip',['-t',zipPath],{encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);
const verify=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-support-bundle-verify-'));
r=spawnSync('unzip',['-q',zipPath,'-d',verify],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
for(const item of payloads){const bytes=fs.readFileSync(path.join(verify,item.path));assert.equal(bytes.length,item.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);}
fs.copyFileSync(path.join(bundle,'START_HER.txt'),path.join(destination,'SUPPORT_UPTIME_001.txt'));
fs.copyFileSync(path.join(bundle,'TASK/SUPPORT_UPTIME_001.md'),path.join(destination,'SUPPORT_UPTIME_001.md'));
const receipt={files:payloads.length+1,zipBytes:fs.statSync(zipPath).size,zipSha256:crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex'),crc:'pass',manifestHashes:'pass',originalBytes:'pass'};
fs.writeFileSync(path.join(destination,'BUNDLE_RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n');
fs.rmSync(bundle,{recursive:true,force:true});fs.rmSync(verify,{recursive:true,force:true});
console.log(JSON.stringify(receipt));
