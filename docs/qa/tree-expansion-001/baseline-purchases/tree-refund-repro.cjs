'use strict';
// Tree purchase plus existing F26 deferred-refund settlement. Synthetic state.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(process.argv[2]||'/workspace/scratch/0848c4e4f365/Lumenfall-tree');
const source=fs.readFileSync(path.join(repo,'index.html'),'utf8');
const hp=path.join(repo,'tests/behavioral/forge-expansion-harness.cjs'),original=fs.readFileSync(hp,'utf8');
const anchor='    defs:function(){return RESEARCH;},projects:';
assert.equal(original.split(anchor).length,2);
const h=original.replace(anchor,'    treePlan:function(){return getNodeBuyPlan(NODES.find(function(n){return n.id===\'bonds\';}));},treeBuy:function(){return buyNode(NODES.find(function(n){return n.id===\'bonds\';}));},\n'+anchor);
const m=new Module(hp,module);m.filename=hp;m.paths=Module._nodeModulePaths(path.dirname(hp));m._compile(h,hp);const H=m.exports;
const clone=x=>JSON.parse(JSON.stringify(x));
function view(s){return {prisms:s.prisms,bonds:s.nodes.bonds,reserves:s.nodes.reserves,refund:clone(s.offline12hRefund)};}
const records=[];
for(const fault of ['none','primary','recovery']){
  const a=H.app(source),q=a.q,s=q.fresh();
  s.schemaVersion=1;delete s.offline12hRefund;s.nodes.reserves=2;s.nodes.bonds=8;s.prisms=Math.pow(2,54);s.questDay=q.day();s.lastSeen=H.CLOCK;
  q.set(s);assert.equal(q.save(),true);
  const before=view(q.get()),plan=clone(q.treePlan());
  assert.deepEqual(before.refund.prismPrices,[6,10]);assert.deepEqual(before.refund.prismsPaid,[false,false]);assert.equal(plan.cost,40);assert.equal(plan.affordable,true);
  a.fail(fault==='primary',fault==='recovery');const returned=q.treeBuy();
  const after=view(q.get()),primary=view(JSON.parse(a.storage.get(H.P))),recovery=view(JSON.parse(a.storage.get(H.R)));
  a.fail(false,false);const loaded=H.app(source,Array.from(a.storage.entries()));
  records.push({fault,before,plan,returned,after,primary,recovery,reload:view(loaded.q.get()),netWalletChange:after.prisms-before.prisms});
}
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
process.stdout.write(JSON.stringify({kind:'baseline-tree-delayed-F26-refund-interaction',commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceSha256:hash(source),harnessSha256:hash(original),reproducerSha256:hash(fs.readFileSync(__filename)),node:process.versions.node,v8:process.versions.v8,records,scope:'Actual unchanged Tree/save/F26 code, controlled synthetic storage faults. Successful 40-Prism debit unlocks two old refunds totaling16; expected net wallet change is -24.'},null,2)+'\n');
