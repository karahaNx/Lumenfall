'use strict';
// Read-only product audit. Execute the complete production game IIFE through
// the existing controlled Forge harness, adding observation/Tree entrypoints.
// No production function is replaced and no repository file is written.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(process.argv[2] || '/workspace/scratch/0848c4e4f365/Lumenfall-tree');
const source = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const harnessPath = path.join(repo, 'tests/behavioral/forge-expansion-harness.cjs');
const originalHarness = fs.readFileSync(harnessPath, 'utf8');
const anchor = '    defs:function(){return RESEARCH;},projects:';
assert.equal(originalHarness.split(anchor).length, 2, 'unique facade insertion');
const harness = originalHarness.replace(anchor, `
    treeDefs:function(){return NODES;},
    treePlan:function(id){return getNodeBuyPlan(NODES.find(function(node){return node.id===id;}));},
    treeBuy:function(id){return buyNode(NODES.find(function(node){return node.id===id;}));},
    treeEffect:nodeEarnedEffect,
    treeFactors:function(){return {offline:offlineRate(),costReduction:costReduction(),prism:prismMult()};},
` + anchor);
const compiled = new Module(harnessPath, module);
compiled.filename = harnessPath;
compiled.paths = Module._nodeModulePaths(path.dirname(harnessPath));
compiled._compile(harness, harnessPath);
const H = compiled.exports;
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const clone = x => JSON.parse(JSON.stringify(x));
function stateView(s) { return {prisms:s.prisms, nodes:clone(s.nodes)}; }
function slotView(app, key) {
  const raw = app.storage.get(key);
  return raw ? {sha256:hash(raw),...stateView(JSON.parse(raw))} : null;
}
function setup(wallet) {
  const app = H.app(source);
  const s = app.q.fresh();
  s.questDay = app.q.day(); s.lastSeen = H.CLOCK; s.prisms = wallet;
  app.q.set(s);
  assert.equal(app.q.save(), true, 'initial primary and recovery established');
  return app;
}
const records = [];
for (const id of ['echo','bonds','swift']) {
  for (const fault of ['none','primary','recovery']) {
    const app = setup(20), q = app.q;
    const before = stateView(q.get()), plan = clone(q.treePlan(id));
    const primaryBefore = slotView(app,H.P), recoveryBefore = slotView(app,H.R);
    assert.equal(plan.affordable,true,'a genuine funded purchase');
    app.fail(fault==='primary',fault==='recovery');
    const returned = q.treeBuy(id);
    const after = stateView(q.get()), factors = clone(q.treeFactors());
    const primaryAfter = slotView(app,H.P), recoveryAfter = slotView(app,H.R);
    app.fail(false,false);
    const reloaded = H.app(source,Array.from(app.storage.entries()));
    const record = {id,fault,before,plan,returned,after,factors,primaryBefore,primaryAfter,recoveryBefore,recoveryAfter,reloaded:stateView(reloaded.q.get()),primaryFailureRolledBack:fault!=='primary'||JSON.stringify(after)===JSON.stringify(before)};
    if (fault==='primary') {
      record.retryPlan = clone(q.treePlan(id));
      record.retryReturned = q.treeBuy(id);
      record.retryState = stateView(q.get());
      record.retryPersisted = slotView(app,H.P);
    }
    records.push(record);
  }
}
const hugeWallet = [];
for (const [id,wallet] of [['swift',1e16],['swift',1e30],['echo',1e16]]) {
  const app=setup(wallet),q=app.q,before=stateView(q.get()),plan=clone(q.treePlan(id));
  const returned=q.treeBuy(id),after=stateView(q.get());
  hugeWallet.push({id,wallet,plan,returned,before,after,debit:before.prisms-after.prisms});
}
const result = {
  kind:'baseline-read-only-tree-purchase-audit',
  commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
  sourceSha256:hash(source),harnessSha256:hash(originalHarness),reproducerSha256:hash(fs.readFileSync(__filename)),
  node:process.versions.node,v8:process.versions.v8,clockMode:'fixed synthetic epoch',clock:H.CLOCK,
  primaryFailureLeaks:records.filter(x=>x.fault==='primary'&&!x.primaryFailureRolledBack).map(x=>x.id),
  records,hugeWallet,
  scope:'Actual Tree handlers and save/recovery/reload; controlled presentation/storage faults. No browser/native claim; all seeds synthetic.'
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
