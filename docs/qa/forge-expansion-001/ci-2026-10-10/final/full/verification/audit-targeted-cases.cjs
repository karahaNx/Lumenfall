#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = __dirname;
const utc = process.env.LUMENFALL_AUDIT_UTC;
assert.match(utc || '', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
const read = n => JSON.parse(fs.readFileSync(path.join(ROOT, n), 'utf8'));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const a = read('full-artifact-analysis.json');
assert.equal(a.accepted, true);
assert.equal(a.runId, 38047024745);
assert.equal(a.head, '979ed4a3cb1e106456f86efacc114c89e825a88b');
const raw = fs.readFileSync(a.rawBehavioralLog), text = raw.toString('utf8');
assert.equal(raw.length, a.rawBehavioralLogBytes);
assert.equal(hash(raw), a.rawBehavioralLogSha256);
const names = ['p1-05-control-regressions','p2-07a-timer-boundary',
  'rift-status-stacking-mobile','rift-status-stacking-reduced-motion','rift-status-reduced-motion'];
const cases = names.map(name => {
  const marker = 'PASS ' + name + '\n', start = text.indexOf(marker);
  assert.ok(start >= 0, 'Missing PASS ' + name);
  assert.equal(text.indexOf(marker, start + 1), -1, 'Duplicate PASS ' + name);
  const tail = text.slice(start), next = tail.slice(1).search(/^(?:PASS|FAIL) /m);
  const section = next < 0 ? tail : tail.slice(0, next + 1);
  const bytes = Buffer.from(section), byteOffset = Buffer.byteLength(text.slice(0, start));
  assert.ok(raw.subarray(byteOffset, byteOffset + bytes.length).equals(bytes), 'Raw section provenance differs');
  const detailLine = section.match(/^  detail: (.*)$/m), processLine = section.match(/^  process: (.*)$/m);
  assert.ok(detailLine, 'Missing detail ' + name);
  return { name, status: 'PASS', process: processLine ? JSON.parse(processLine[1]) : null,
    detail: JSON.parse(detailLine[1]), provenance: { byteOffset, byteLength: bytes.length, sha256: hash(bytes) } };
});
const control = cases[0].detail, timer = cases[1].detail;
assert.deepEqual(control.affordabilityFunding, {
  multiplier: '5', price: { lumen: 0, shard: 481114 }, wallet: { lumen: 0, shards: 481114 }
});
for (const k of ['liveStates','focus','untrustedTapGuard']) assert.equal(control[k], true, k);
for (const k of ['.mult-btn.active','.speed-btn.active']) assert.ok(control.selectedContrast[k] >= 3, k);
assert.equal(timer.boundarySec, 0.25); assert.equal(timer.offsetSec, 0.0001);
assert.equal(timer.negativeOldAccrual, true);
assert.deepEqual(timer.results.map(r => r.kind), ['live','offline']);
for (const row of timer.results) {
  for (const k of ['before','exact','after','study','normal']) assert.equal(row[k], true, row.kind + ' ' + k);
  assert.equal(row.splits, 3);
}
for (const row of cases.slice(2)) {
  assert.deepEqual(row.process, { exitcode: 0, timed_out: false, stderr: '' });
  assert.equal(row.detail.status, 'pass');
  assert.equal(row.detail.scenario, row.name);
  assert.equal(row.detail.records.length, 3);
}
const common = { verifiedAt: utc, clockSource: 'clock__curr_time UTC supplied to audit',
  method: 'Read-only parsing/assertion of archived CI observations; no game/browser execution',
  runId: a.runId, artifactId: a.artifactId, head: a.head, syntheticMerge: a.syntheticMerge, sourceSha256: a.sourceSha256,
  behavioralLog: { bytes: raw.length, sha256: hash(raw) } };
fs.writeFileSync(path.join(ROOT, 'targeted-case-receipts.json'), JSON.stringify({ ...common, cases }, null, 2) + '\n');
const summary = { ...common, accepted: true, caseCount: cases.length,
  cases: cases.map(c => ({ name: c.name, status: c.status, process: c.process,
    ...(c.name === names[0] || c.name === names[1] ? { observations: c.detail } : {
      profiles: c.detail.records.map(r => r.profile), teardown: c.detail.teardown }),
    provenance: c.provenance })),
  limitations: ['Successful legacy DOM scenarios retain PASS/detail observations in behavioral.log, not separate stdout DOM/process files.'] };
fs.writeFileSync(path.join(ROOT, 'targeted-case-audit.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
