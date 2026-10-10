'use strict';
// Bounded state-only reproduction. The complete game IIFE and the original
// browser bridge's setState/Ascend/buy functions execute. DOM rendering is not
// evaluated here; the mandatory Full browser gate owns that acceptance.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(process.argv[2] || path.join(__dirname, '../../../../..'));
const testPath = path.resolve(process.argv[3] || path.join(repo, 'tests/behavioral/rift-status.js'));
const auditedAt = process.argv[4];
assert(auditedAt && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(auditedAt), 'supply trusted UTC audit time');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const read = name => fs.readFileSync(path.join(repo, name), 'utf8');
const source = read('index.html');
const bridge = read('tests/behavioral/bridge.js');
const test = fs.readFileSync(testPath, 'utf8');
const harness = read('tests/behavioral/tree-expansion-harness.cjs');
const {app, clone} = require(path.join(repo, 'tests/behavioral/tree-expansion-harness.cjs'));
assert.equal(sha(source), '4e4707afca6672ea46aad03ebd05cd7341ad61d7316a9636fed6172dbfed96ef');
function between(text, start, end) {
  assert.equal(text.split(start).length, 2, 'one start marker: ' + start);
  const begin = text.indexOf(start) + start.length, finish = text.indexOf(end, begin);
  assert(finish > begin, 'ordered end marker: ' + end);
  return text.slice(begin, finish);
}
const bridgeBuy = between(bridge, '    buy: function(id){ buySpirit(', '\n').trim();
const actualBuy = 'function(id){ buySpirit(' + bridgeBuy.replace(/,$/, '');
const actualSet = between(bridge, '  setState: ', '\n  applyFormationPreset:').trim().replace(/,$/, '');
const actualAscend = between(bridge, '  ascendManual: ', '\n  bossRetreatGraceSec:').trim().replace(/,$/, '');
const marker = "if(document.readyState==='loading'){";
assert.equal(source.split(marker).length, 2);
const observation = `\nwindow.qa.riftAudit={
  set:${actualSet},buy:${actualBuy},ascend:${actualAscend},
  bonds:function(){return JSON.parse(JSON.stringify(FORMATION_BONDS));},
  active:function(){return JSON.parse(JSON.stringify(activeFormationBonds()));}
};\n`;
const instrumented = source.replace(marker, marker + observation);
const fixturePrefix = test.slice(0, test.indexOf('window.runRiftStatusQa='));
assert(fixturePrefix.includes('window.riftStatusWorst='));
const fixtureWindow = {};
vm.runInNewContext(fixturePrefix, {window: fixtureWindow});
const start = '    var rebuilt=b.getState();';
assert.equal(test.split(start).length, 2);
const finish = "    ok(!b.getState().formationRebuild&&q('#bond-summary').textContent===worst.text,'legitimate reconstruction restores actual Bonds');";
const fixtureBlock = start + between(test, start, finish);
// Independent, unchanged level-zero prices. A zero-new, Bonds-0 seed pays one
// price per missing member; all eight prices sum to 2,684,530, below 3,000,000.
const prices = {ember:10,tide:60,stone:360,gale:2100,thorn:12000,void:70000,aurora:400000,titan:2200000};
assert.equal(Object.values(prices).reduce((a, b) => a + b, 0), 2684530);
let checks = 0;
function ok(value, message) { checks++; assert(value, message); }
function same(a, b, message) { checks++; assert.equal(JSON.stringify(a), JSON.stringify(b), message); }
function snapshot(state) {
  return {lumen:state.lumen,spirits:clone(state.spirits),activeParty:clone(state.activeParty),formationRebuild:clone(state.formationRebuild)};
}
const runtime = app(instrumented), q = runtime.q, audit = q.riftAudit;
const b = {
  freshStateSnapshot:() => clone(q.fresh()), enemyHpFor:q.enemyHp,
  setState:audit.set, getState:() => clone(q.get()), ascendManual:audit.ascend,
  formationTest:{buy:audit.buy}, riftStatus:{bonds:audit.bonds,active:audit.active},
  renderLayout() {}
};
const ctx = {currentDay:q.day};
const worst = clone(fixtureWindow.riftStatusWorst(b, ctx));
const seed = fixtureWindow.riftStatusSeed(b, ctx);
seed.activeParty = worst.ids;
seed.activeParty.forEach(id => { seed.spirits[id] = 2; });
b.setState(seed);
same(Object.values(q.get().nodes), Object.values(q.fresh().nodes), 'fixture keeps every Tree track at its original zero level');
const initial = snapshot(q.get());
const ascend = b.ascendManual();
ok(ascend.after.ascendCount === ascend.before.ascendCount + 1, 'actual manual Ascend committed once');
ok(q.get().formationRebuild && audit.active().length === 0, 'actual Ascend leaves pending intent and no powered Bonds');
const pending = snapshot(q.get()), purchases = [];
const originalBuy = b.formationTest.buy;
b.formationTest.buy = id => {
  const before = clone(q.get()), beforeWrites = runtime.writes.length;
  const storageBefore = JSON.stringify([...runtime.storage]);
  const plan = clone(q.spiritPlan(id));
  same(plan.cost, prices[id], 'actual missing-member quote agrees with independent level-zero price: ' + id);
  const result = originalBuy(id);
  const after = clone(q.get());
  purchases.push({id,quote:prices[id],plan,before:snapshot(before),after:snapshot(after),
    representedDebit:before.lumen - after.lumen,returnedUndefined:result === undefined,
    stateUnchanged:JSON.stringify(before) === JSON.stringify(after),
    storageUnchanged:storageBefore === JSON.stringify([...runtime.storage]),
    storageWrites:runtime.writes.length - beforeWrites});
};
new Function('b','worst','ok','same',fixtureBlock)(b,worst,ok,same);
const final = snapshot(q.get());
const actualBonds = audit.active();
const restored = !final.formationRebuild && actualBonds.map(x => x.name.replace(' Bond','')).join(' · ') === worst.text;
const originalExtremeWallet = /rebuilt\.lumen=1e20/.test(fixtureBlock);
if (originalExtremeWallet) {
  ok(!restored, 'original fixture fails its reconstruction predicate');
  ok(purchases.length > 0 && purchases.every(p => p.plan.reason === 'unavailable'), 'every attempted extreme-wallet recruit is unavailable');
  ok(purchases.every(p => p.stateUnchanged && p.storageUnchanged && p.storageWrites === 0), 'extreme-wallet rejection changes neither state nor saves');
} else {
  ok(restored, 'corrected fixture restores all actual Bonds');
  same(final.activeParty, worst.ids, 'actual reconstructed party preserves intended ordering');
  ok(purchases.every(p => p.after.spirits[p.id] === 1 && p.representedDebit === p.quote), 'each corrected recruit buys exactly one level and pays the independent exact price');
  ok(purchases.every(p => p.storageWrites > 0), 'actual paid recruit commits persistence');
}
console.log(JSON.stringify({
  status:'pass',auditedAt,scope:'State-only complete-IIFE reproduction; actual browser UI assertions remain mandatory and unexecuted locally.',
  sourceSha256:sha(source),testSha256:sha(test),bridgeSha256:sha(bridge),harnessSha256:sha(harness),
  scriptSha256:sha(fs.readFileSync(__filename)),fixturePrefixSha256:sha(fixturePrefix),fixtureBlockSha256:sha(fixtureBlock),
  node:process.version,v8:process.versions.v8,checks,mode:originalExtremeWallet?'original-extreme-wallet':'corrected-representable-wallet',
  independentPrices:prices,allEightPriceSum:2684530,originalUiAssertionPreserved:test.includes(finish),
  worst,initial,ascend,pending,purchases,final,actualBonds,reconstructionPredicate:restored
},null,2));
