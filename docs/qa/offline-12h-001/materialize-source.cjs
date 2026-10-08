'use strict';
// Recreate the exact historical asset inputs without checking out over live work.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const [commit,destination]=process.argv.slice(2),root=path.resolve(__dirname,'../../..');
assert(/^[0-9a-f]{40}$/.test(commit),'explicit integration commit required');
const out=path.resolve(destination);assert(out!==root&&!out.startsWith(root+path.sep),'source destination must be outside the repository');
assert(!fs.existsSync(out)||fs.readdirSync(out).length===0,'source destination must be new or empty');
const names=execFileSync('git',['ls-tree','-r','--name-only',commit,'--','index.html','fonts','branding'],{cwd:root,encoding:'utf8'}).trim().split('\n');
assert.equal(names.length,15,'complete F26 historical asset set');
for(const name of names){
  assert(/^(index\.html|(?:fonts|branding)\/[A-Za-z0-9_.\/-]+)$/.test(name)&&!name.split('/').includes('..'),'safe historical asset path');
  const file=path.join(out,name);fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,execFileSync('git',['show',commit+':'+name],{cwd:root,maxBuffer:8*1024*1024}));
}
console.log(JSON.stringify({status:'pass',commit,assets:names,destination:out}));
