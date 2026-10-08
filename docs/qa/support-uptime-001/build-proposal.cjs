/* Prepare a private profile patch; root index and Swift scope stay untouched. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-support-profile-'));
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
let candidate=source;
for(const [before,after] of [
  ['by +25% for 4s. Ultimate: +50% for 8s.','by +25% for 1s. Ultimate: +50% for 1.5s.'],
  ['durationMs:ultimate ? 8000 : 4000','durationMs:ultimate ? 1500 : 1000'],
  ["return 'Support buff becomes +50% for 8s'","return 'Support buff becomes +50% for 1.5s'"]
]) {assert.equal(candidate.split(before).length,2,'unique replacement '+before);candidate=candidate.replace(before,after);}
const output=path.join(temp,'index.html');fs.writeFileSync(output,candidate);
const diff=spawnSync('git',['diff','--no-index','--unified=1','--','index.html',output],{cwd:root,encoding:'utf8'});
assert.equal(diff.status,1,'diff contains the profile proposal');
const patch='diff --git a/index.html b/index.html\n--- a/index.html\n+++ b/index.html\n'+diff.stdout.slice(diff.stdout.indexOf('@@'));
fs.writeFileSync(path.join(__dirname,'PROFILE_ONLY.patch'),patch);
fs.writeFileSync(path.join(__dirname,'proposal-contract.json'),JSON.stringify({normalSec:1,ultimateSec:1.5,chargeCap:10,kind:'profile-proposal',approval:'User numeric contract for Lead/Swift review; private patch, no writer/integration acceptance',dependency:'Swift cap modelled only as a test catalogue stub; actual Swift implementation and legacy value policy remain separate gates'},null,2)+'\n');
console.log(output);
