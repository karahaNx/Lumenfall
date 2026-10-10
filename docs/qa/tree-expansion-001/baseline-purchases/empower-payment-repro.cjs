'use strict';
// Actual manual/automatic Empower paths relevant to new Tree purchase rewards.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(process.argv[2]||'/workspace/scratch/0848c4e4f365/Lumenfall-tree');
const source=fs.readFileSync(path.join(repo,'index.html'),'utf8');
const hp=path.join(repo,'tests/behavioral/forge-expansion-harness.cjs'),original=fs.readFileSync(hp,'utf8');
const anchor='    defs:function(){return RESEARCH;},projects:';
assert.equal(original.split(anchor).length,2);
const h=original.replace(anchor,'    empowerCost:function(){return spiritCost(SPIRITS[0]);},empowerManual:function(){return buySpirit(SPIRITS[0]);},empowerAuto:autoEmpowerTick,\n'+anchor);
const m=new Module(hp,module);m.filename=hp;m.paths=Module._nodeModulePaths(path.dirname(hp));m._compile(h,hp);const H=m.exports;
function view(s){return {lumen:s.lumen,ember:s.spirits.ember};}
const records=[];
for(const spec of [{kind:'manual',wallet:100,fault:false},{kind:'automatic',wallet:100,fault:false},{kind:'manual',wallet:1e30,fault:false},{kind:'automatic',wallet:1e30,fault:false},{kind:'manual',wallet:100,fault:true}]){
  const a=H.app(source),q=a.q,s=q.fresh();s.questDay=q.day();s.lastSeen=H.CLOCK;s.lumen=spec.wallet;s.achieved.labmaster=true;
  Object.keys(s.empowerQueue).forEach(id=>s.empowerQueue[id]=id==='ember');q.set(s);assert.equal(q.save(),true);
  const before=view(q.get()),cost=q.empowerCost();a.fail(spec.fault,false);
  const returned=spec.kind==='manual'?q.empowerManual():q.empowerAuto();const after=view(q.get());
  const primary=view(JSON.parse(a.storage.get(H.P))),recovery=view(JSON.parse(a.storage.get(H.R)));
  records.push({...spec,cost,returned:returned===undefined?'undefined':returned,before,after,representedDebit:before.lumen-after.lumen,primary,recovery});
}
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
process.stdout.write(JSON.stringify({kind:'baseline-Empower-payment-audit',commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceSha256:hash(source),harnessSha256:hash(original),reproducerSha256:hash(fs.readFileSync(__filename)),node:process.versions.node,v8:process.versions.v8,records,scope:'Actual manual and in-memory Auto-Empower handlers; automatic path correctly does not save each purchase. Synthetic states only; no browser/native claim.'},null,2)+'\n');
