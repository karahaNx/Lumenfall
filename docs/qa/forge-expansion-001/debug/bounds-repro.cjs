'use strict';
// Read-only, portable reproduction of the two conservative-bound failures.
// Run from any directory: node bounds-repro.cjs [path/to/index.html].
// Both witnesses execute the complete production scheduler; the observation
// wrappers always call the original charge, cast, tap and damage functions.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../../..');
const {app, CLOCK, clone} = require(path.join(root, 'tests/behavioral/forge-expansion-harness.cjs'));
const {fixedState, observe, timerPrecisionBounds} = require(path.join(root, 'tests/behavioral/forge-expansion-calibration.cjs'));
const source = fs.readFileSync(process.argv[2] || path.join(root, 'index.html'), 'utf8');
let count = 0;
const checks = {
  eq(actual, expected, message) { count++; assert.deepEqual(actual, expected, message); },
  ok(value, message) { count++; assert.ok(value, message); },
  near(actual, expected, tolerance, message) {
    count++;
    assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * tolerance, message);
  }
};

const a = app(source), q = a.q;
const s = fixedState(q, {party: ['aurora'], auto: false, phase: [17.0001], forge: {amplifiertrim: 5}});
s.enemyMaxHp = 253299999.5; s.enemyHp = 100000000;
q.set(s);
const initial = clone(q.get()), assessment = q.assessment(120);
let firstCast;
const undo = q.observeCalibration(event => { if (event.type === 'cast' && !firstCast) firstCast = event; });
observe(a, 600, CLOCK, checks);
undo();
const hpBefore = q.get().enemyHp, actual = observe(a, 6000, CLOCK + 600000, checks), hpAfter = q.get().enemyHp;
const supportClock = {initial, assessment, firstCast, hpBefore, hpAfter, hpChange: hpAfter - hpBefore,
  actualDps: actual.dps, actualSupportMult: actual.supportMult, summary: actual.summary};

const cadenceCounters = [];
for (const ordinal of [9007199254740990, 9007199254740991, 9007199254740992, 9007199254741000]) {
  const a = app(source), q = a.q;
  q.set(fixedState(q, {party: ['ember'], level: 1, forge: {guardiancadence: 5}, ordinal}));
  const initial = clone(q.get()), assessment = q.assessment(120), estimatedDps = q.dps(120);
  const actual = observe(a, 60, CLOCK, checks);
  cadenceCounters.push({initial, assessment, estimatedDps, actualDps: actual.dps, actualDamage: actual.totalDamage,
    finalOrdinal: q.get().totalTaps, maximumDamage: assessment.upperDps * 60 + assessment.burstBudget,
    summary: actual.summary});
}
const timerPrecision = timerPrecisionBounds(source, checks);
console.log(JSON.stringify({sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  checks: count, supportClock, cadenceCounters, timerPrecision}, null, 2));
