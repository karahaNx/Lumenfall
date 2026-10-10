'use strict';

// Independent calibration of the HUD reference and conservative boss bounds.
// The fixed world uses the complete production scheduler, casts, charge grants,
// Support deadlines, and Auto-Tap. Observers call every original function with
// unchanged arguments and return its original result. No combat is substituted.
// Large finite HP prevents deaths; damage is integrated from actual applications
// instead of subtracting small hits from a wallet-sized floating-point HP value.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const {app, seed, clone, CLOCK} = require('./forge-expansion-harness.cjs');

const PARTY = ['ember', 'tide', 'aurora', 'gale', 'thorn'];
const PHASE = [17, 83, 39, 61, 5];
const CHARGE_CAPS = {
  tapconduit: 5, relay: 5, sustainedchannel: 5,
  amplifiertrim: 5, resonantedge: 5, guardiancadence: 5,
  cauterize: 10, fracturekey: 10, guardianseal: 5
};

function fixedState(q, options = {}) {
  const s = seed(q);
  s.activeParty = (options.party || PARTY).slice();
  Object.keys(s.spirits).forEach(id => {
    s.spirits[id] = s.activeParty.includes(id) ? (options.level || 50) : 0;
    s.heroResource[id] = 0;
  });
  s.activeParty.forEach((id, i) => {
    s.heroResource[id] = options.phase ? options.phase[i] || 0 : 0;
  });
  s.depth = options.depth || 120;
  s.enemyDepth = s.depth;
  s.enemyHp = s.enemyMaxHp = 1e100;
  s.enemyIsLuminous = false;
  s.riftMode = 'push'; s.farmDepth = s.farmReturnDepth = 0;
  s.achieved.autotap = options.auto !== false;
  s._autoTapAccum = options.tapPhase || 0;
  s.totalTaps = options.ordinal || 0;
  s.research.charge = options.swift || 0;
  Object.assign(s.research, options.forge === undefined ? CHARGE_CAPS : options.forge);
  for (const id of options.ultimates || []) {
    s.heroRarity[id] = 5;
    s.wispUltimate[id] = true;
  }
  if (options.savedBuffs) s.supportBuffs = clone(options.savedBuffs);
  if (options.legacyBuff) {
    s.buffMult = options.legacyBuff.mult;
    s.buffUntil = options.legacyBuff.until;
  }
  return s;
}

function observe(a, seconds, startMs, checks) {
  const q = a.q, before = clone(q.get());
  const result = {
    seconds: 0, counts: {}, taps: 0, passiveDamage: 0,
    discreteDamage: 0, supportSeconds: 0, events: 0
  };
  const undo = q.observeCalibration(event => {
    result.events++;
    if (event.type === 'cast') result.counts[event.id] = (result.counts[event.id] || 0) + 1;
    if (event.type === 'tap') result.taps += event.count;
    if (event.type === 'damage') result.discreteDamage += event.amount;
    if (event.type === 'interval') {
      result.seconds += event.seconds;
      result.passiveDamage += event.dps * event.seconds;
      result.supportSeconds += event.dps / event.baseDps * event.seconds;
      assert.equal(event.depth, before.depth, 'fixed world retains its encounter');
    }
  });
  let summary;
  try {
    a.clock(startMs);
    summary = q.advance(seconds, {kind: 'live', visual: false, clockStartMs: startMs});
  } finally { undo(); }
  const after = q.get();
  checks.eq(summary.kills, 0, 'calibration has no kills');
  checks.eq(summary.ascends, 0, 'calibration has no Ascends');
  checks.eq(summary.empowers + summary.researchBought + summary.studiesStarted, 0, 'calibration has no purchases');
  checks.eq(after.spirits, before.spirits, 'fixed Wisp levels');
  checks.eq(after.research, before.research, 'fixed Forge levels');
  checks.eq(after.activeParty, before.activeParty, 'fixed powered formation');
  checks.eq(after.depth, before.depth, 'fixed encounter depth');
  checks.near(result.seconds, seconds, 2e-10, 'all elapsed seconds observed');
  checks.eq(result.taps, summary.autoTaps, 'observed Auto-Tap count matches authoritative summary');
  result.supportMult = result.supportSeconds / seconds;
  result.totalDamage = result.passiveDamage + result.discreteDamage;
  result.dps = result.totalDamage / seconds;
  result.rates = {};
  before.activeParty.forEach(id => { result.rates[id] = (result.counts[id] || 0) / seconds; });
  result.summary = summary;
  return result;
}

function burstGuard(source, checks, mutation) {
  const a = app(source), q = a.q;
  const s = fixedState(q, {party: ['titan'], auto: false, forge: {sustainedchannel: 5}, phase: [99.999]});
  q.set(s);
  const initial = q.assessment(120), hit = q.abilityDamage('titan', 120);
  s.enemyHp = hit / 2;
  s.enemyMaxHp = 2 * initial.upperDps / q.regen(120);
  q.set(s);
  const before = q.assessment(120);
  checks.ok(before.upperDps < before.regen, 'burst witness has an impossible sustained rate');
  checks.ok(before.hp < before.burstBudget, 'burst witness current HP fits the initial burst allowance');
  checks.eq(before.verdict, 'uncertain', 'a near-ready burst preserves current Push intent');
  const undo = mutation ? q.ignoreBurstGuard() : () => {};
  let summary;
  try {
    summary = q.advance(.001, {kind: 'offline', visual: false, clockStartMs: CLOCK,
      offlineWindowStartMs: CLOCK - 300000});
  } finally { undo(); }
  checks.eq(summary.bossKills, 1, 'near-ready original cast kills the boss after the offline grace');
  checks.eq(summary.retreats, 0, 'the burst guard prevents an incorrect pre-cast retreat');
  checks.eq(q.get().riftMode, 'push', 'burst win retains Push');
  return {assessment: before, hit, charge: 99.999, elapsedSeconds: .001, summary};
}

function savedSupportBounds(source, checks) {
  const results = [];
  for (const config of [
    {name: 'saved-Tide-and-future-Aurora', saved: 'tide', future: 'aurora', oldStrength: 1.55, futureStrength: 1.30, expected: 1.85},
    {name: 'saved-Aurora-and-future-Tide', saved: 'aurora', future: 'tide', oldStrength: 1.50, futureStrength: 1.30, expected: 1.80},
    {name: 'mixed-two-ultimate-strengths', saved: 'tide', future: 'aurora', oldStrength: 1.55, futureStrength: 1.55, expected: 2.10, ultimate: true},
    {name: 'opaque-legacy-max-entitlement', saved: 'tide', future: 'aurora', oldStrength: 1.55, futureStrength: 1.30, expected: 3, legacy: 3}
  ]) {
    const a = app(source), q = a.q;
    const s = fixedState(q, {party: [config.future], auto: false, phase: [100], forge: {amplifiertrim: 5},
      ultimates: config.ultimate ? [config.future] : [],
      savedBuffs: {version: 1, sources: {[config.saved]: {until: CLOCK + 8000, mult: config.oldStrength}}},
      legacyBuff: config.legacy ? {mult: config.legacy, until: CLOCK + 8000} : null});
    q.set(s);
    checks.eq(q.get().supportBuffs.sources[config.saved].mult, config.oldStrength, config.name + ': paid snapshot retained');
    checks.eq(q.get().spirits[config.saved], 0, config.name + ': retained source is currently inactive');
    checks.near(q.supportProfile(config.future).strength, config.futureStrength, 2e-15, config.name + ': actual future cast strength');
    const bound = q.assessment(120), passive = q.passive(120);
    checks.eq(bound.burstBudget, 0, config.name + ': no damaging casts or Auto-Tap');
    const measured = observe(a, 4, CLOCK, checks);
    checks.near(measured.supportMult, config.expected, 2e-15, config.name + ': actual original simultaneous saved/future buffs');
    checks.ok(measured.dps <= bound.upperDps * (1 + 2e-15), config.name + ': original gameplay stays below the promised upper bound');
    checks.near(bound.upperDps, passive * config.expected, 2e-15, config.name + ': source-wise independent buff envelope');
    checks.near(measured.dps, bound.upperDps, 2e-15, config.name + ': the analytical maximum is physically attained');
    results.push({name: config.name, expectedSupport: config.expected, assessment: bound, actualDps: measured.dps});
  }
  return results;
}

function supportClockLowerBound(source, checks) {
  // A saved cast deadline is rounded at epoch precision; the scheduler retains
  // finer phase. At this legitimate partial bar every six-second cycle has a
  // slightly shortened four-second Support cast. Assuming exact uptime made
  // the old proposed lower bound exceed actual DPS by more than its slack.
  const a = app(source), q = a.q;
  const s = fixedState(q, {party: ['aurora'], auto: false, phase: [17.0001], forge: {amplifiertrim: 5}});
  s.enemyMaxHp = 253299999.5;
  s.enemyHp = 100000000;
  q.set(s);
  const assessment = q.assessment(120);
  observe(a, 600, CLOCK, checks);
  const hpBefore = q.get().enemyHp;
  const actual = observe(a, 6000, CLOCK + 600000, checks);
  const hpAfter = q.get().enemyHp;
  checks.ok(actual.dps < assessment.regen, 'epoch-rounded Support phase actually loses to regeneration');
  checks.ok(hpAfter > hpBefore + 20, 'original boss HP rises over one thousand complete cast cycles');
  checks.ok(assessment.lowerDps <= actual.dps + 1e-7, 'Support deadline quantization cannot overstate the analytical lower bound');
  checks.eq(assessment.verdict, 'uncertain', 'a losing clock phase is never certified sustained');
  return {phase: 17.0001, assessment, actualDps: actual.dps, actualSupportMult: actual.supportMult,
    hpBefore, hpAfter, hpChange: hpAfter - hpBefore, cycles: 1000, seconds: actual.seconds};
}

function cadenceCounterBounds(source, checks) {
  // Preserve the old Number lifetime counter. At/above 2^53, incrementing can
  // stagnate on either a multiple of five or a nonmultiple. Thus an average
  // one-in-five Cadence bonus is neither a universal upper nor lower bound.
  const results = [];
  for (const ordinal of [9007199254740990, 9007199254740991, 9007199254740992, 9007199254741000]) {
    const a = app(source), q = a.q;
    q.set(fixedState(q, {party: ['ember'], level: 1, forge: {guardiancadence: 5}, ordinal}));
    checks.eq(q.get().totalTaps, ordinal, 'existing lifetime tap progression is preserved');
    const bound = q.assessment(120), estimatedDps = q.dps(120);
    const actual = observe(a, 60, CLOCK, checks);
    checks.eq(actual.taps, 60, 'actual Auto-Tap still fires once per second at an unsafe lifetime count');
    checks.eq(actual.counts.ember, 10, 'complete natural cast cycles make this a phase-exact DPS witness');
    checks.ok(bound.lowerDps <= actual.dps + 1e-9, 'stalled cadence cannot overstate guaranteed lower damage');
    checks.ok(actual.totalDamage <= bound.upperDps * 60 + bound.burstBudget + 1e-7,
      'stalled cadence original gameplay stays below the promised upper bound');
    checks.near(estimatedDps, actual.dps, 2e-12, 'Cadence HUD models the actual sixty-tap counter transition');
    checks.eq(q.get().totalTaps, ordinal <= 9007199254740992 ? 9007199254740992 : ordinal,
      'the conservative bound does not rewrite inherited counter semantics');
    results.push({ordinal, finalOrdinal: q.get().totalTaps, assessment: bound, estimatedDps,
      actualDps: actual.dps, actualDamage: actual.totalDamage, seconds: 60});
  }
  return results;
}

function timerPrecisionBounds(source, checks) {
  // Charge and Auto-Tap use the precise scheduler phase, unlike persisted
  // Support deadlines. Target the same fine initial fraction that exposed the
  // Support bug, and count complete cycles through the original engine.
  const results = [];
  for (const swift of [0, 1, 6, 60]) for (const refund of [0, 5]) {
    const a = app(source), q = a.q;
    q.set(fixedState(q, {party: ['ember'], level: 1, auto: false, phase: [17.0001], swift,
      forge: {amplifiertrim: 1, sustainedchannel: refund}}));
    const bound = q.assessment(120);
    const cycle = 6 / (1 + .08 * swift) * (1 - 2 * refund / 100);
    const actual = observe(a, 1024 * cycle, CLOCK, checks);
    checks.eq(actual.counts.ember, 1024, 'fine-phase natural/refunded casts complete exactly 1024 cycles');
    checks.ok(bound.lowerDps <= actual.dps + 1e-9, 'charge timer precision preserves the guaranteed natural/refund lower rate');
    results.push({swift, refund, cycles: actual.counts.ember, seconds: actual.seconds,
      lowerDps: bound.lowerDps, actualDps: actual.dps});
  }
  for (const tapPhase of [0, 999.1234567]) {
    const a = app(source), q = a.q;
    q.set(fixedState(q, {party: ['ember'], level: 1, tapPhase, phase: [17.0001],
      forge: {amplifiertrim: 1}}));
    const bound = q.assessment(120), actual = observe(a, 6000, CLOCK, checks);
    checks.eq(actual.taps, 6000, 'fine-phase Auto-Tap is exactly one Hz across complete seconds');
    checks.eq(actual.counts.ember, 1000, 'complete independent natural cycles during the Auto-Tap precision witness');
    checks.ok(bound.lowerDps <= actual.dps + 1e-9, 'Auto-Tap timer precision preserves the guaranteed one-Hz lower rate');
    results.push({tapPhase, seconds: actual.seconds, taps: actual.taps,
      lowerDps: bound.lowerDps, actualDps: actual.dps});
  }
  return results;
}

function stressBounds(source, checks) {
  // Deterministic, independent fixture construction. Each horizon starts with
  // arbitrary full/partial bars, tap phase, saved buffs, and party order. The
  // finite-window inequality includes the initial-cast/tap burst term: a sample
  // mean by itself is not a valid test of a steady-state upper rate.
  let randomState = 0x61b094ac;
  const pick = n => {
    randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5;
    return (randomState >>> 0) % n;
  };
  const all = ['ember', 'tide', 'stone', 'gale', 'thorn', 'void', 'aurora', 'titan'];
  const phases = [0, .1, 17, 50, 99.999, 99.99999999, 100];
  const horizons = [.000001, .03125, .333333333, 1, 3.1415926535, 6, 23.75, 90];
  const cases = [];
  for (let i = 0; i < 128; i++) {
    const order = all.slice();
    for (let j = order.length - 1; j > 0; j--) { const k = pick(j + 1); [order[j], order[k]] = [order[k], order[j]]; }
    const party = order.slice(0, 1 + pick(5));
    const forge = {};
    Object.keys(CHARGE_CAPS).forEach(id => { forge[id] = [0, 1, CHARGE_CAPS[id]][pick(3)]; });
    const config = {party, forge, depth: [110, 120, 130][pick(3)], level: [1, 7, 50, 500][pick(4)],
      auto: pick(4) !== 0, swift: [0, 1, 10, 30, 60, 250][pick(6)],
      phase: party.map(() => phases[pick(phases.length)]), tapPhase: [0, 377, 999.999][pick(3)], ordinal: pick(5)};
    const a = app(source), q = a.q, s = fixedState(q, config);
    s.research.arcanecal = [0, 1, 5, 20][pick(4)];
    if (i % 3 === 0) s.supportBuffs = {version: 1, sources: {
      tide: {mult: 1.5, until: CLOCK + [1, 499, 4000, 8000][pick(4)]},
      aurora: {mult: 1.25, until: CLOCK + [1, 499, 4000, 8000][pick(4)]}
    }};
    if (i % 5 === 0) { s.buffMult = [1.1, 2, 5][pick(3)]; s.buffUntil = CLOCK + 8000; }
    q.set(s);
    const before = clone(q.get()), bound = q.assessment(s.depth);
    checks.eq(q.get(), before, 'analytical assessment is state-pure ' + i);
    checks.ok([bound.lowerDps, bound.upperDps, bound.burstBudget, bound.regen].every(Number.isFinite), 'finite ordinary bounds ' + i);
    checks.ok(bound.lowerDps <= bound.upperDps, 'lower bound does not exceed upper bound ' + i);
    checks.eq(bound.maxHp, before.enemyMaxHp, 'current boss uses the actual persisted maximum HP ' + i);
    checks.eq(bound.hp, before.enemyHp, 'current boss uses the actual remaining HP ' + i);
    const seconds = horizons[pick(horizons.length)], measured = observe(a, seconds, CLOCK, checks);
    const maximum = bound.upperDps * seconds + bound.burstBudget;
    checks.ok(measured.totalDamage <= maximum + Math.max(1, maximum) * 2e-10,
      `authoritative damage respects finite-window upper bound ${i}: ${measured.totalDamage} > ${maximum}`);
    const startupAllowance = bound.lowerDps * q.cycle() + bound.burstBudget;
    checks.ok(measured.totalDamage + startupAllowance >= bound.lowerDps * seconds * (1 - 2e-10),
      'authoritative damage respects conservative lower bound with one-cycle startup allowance ' + i);
    cases.push({id: i, seconds, party, depth: s.depth, lowerDps: bound.lowerDps, upperDps: bound.upperDps,
      burstBudget: bound.burstBudget, actualDamage: measured.totalDamage, maximum, verdict: bound.verdict});
  }
  return cases;
}

function verify(source) {
  let count = 0;
  const checks = {
    eq(actual, expected, message) { count++; assert.deepEqual(actual, expected, message); },
    ok(value, message) { count++; assert.ok(value, message); },
    near(actual, expected, relative, message) {
      count++;
      assert.ok(Number.isFinite(actual) && Number.isFinite(expected) &&
        Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * relative,
      `${message}: actual ${actual}, expected ${expected}, tolerance ${relative}`);
    }
  };
  const measurements = [];
  const cases = [];
  for (const swift of [0, 10, 30, 60]) {
    for (const depth of [101, 120]) {
      cases.push({name: `canonical-${depth}-swift${swift}`, swift, depth, tolerance: depth === 120 ? .001 : .003});
      // Current bars intentionally do not key the HUD cache. Their phase can
      // change clipped first-Wisp grants indefinitely: measure/report this
      // separately from canonical reference quantization and from safe bounds.
      cases.push({name: `phase-${depth}-swift${swift}`, swift, depth, phase: PHASE, tapPhase: 377, tolerance: depth === 120 ? .02 : .05});
    }
  }
  cases.push(
    {name: 'support-first', party: ['tide', 'aurora', 'ember', 'gale', 'thorn'], swift: 0, tolerance: .003},
    {name: 'support-last', party: ['ember', 'gale', 'thorn', 'tide', 'aurora'], swift: 10, tolerance: .003},
    {name: 'one-support', party: ['titan', 'tide', 'stone', 'void', 'thorn'], swift: 30, tolerance: .003},
    {name: 'two-support-ultimate', ultimates: ['tide', 'aurora'], swift: 60, tolerance: .003},
    {name: 'no-support', party: ['ember', 'stone', 'void', 'gale', 'thorn'], swift: 10, tolerance: .003},
    {name: 'no-auto-tap', auto: false, swift: 0, tolerance: .003},
    {name: 'relay-only', forge: {relay: 5}, swift: 0, tolerance: .003},
    {name: 'tap-only', forge: {tapconduit: 5}, swift: 10, tolerance: .003},
    {name: 'refund-only', forge: {sustainedchannel: 5}, swift: 30, tolerance: .003},
    {name: 'new-zero', forge: {}, swift: 0, tolerance: .003}
  );
  for (const config of cases) {
    const a = app(source), q = a.q;
    q.set(fixedState(q, config));
    const initial = clone(q.get()), profile = q.profile(config.depth || 120);
    for (const id of config.ultimates || []) checks.eq(initial.wispUltimate[id], true, 'calibration Ultimate survives real normalization: ' + id);
    checks.eq(q.get(), initial, config.name + ': HUD profile is pure');
    if (config.name === 'new-zero') {
      checks.eq(profile, null, 'zero new charge effects retain the legacy estimate path');
    } else {
      checks.eq(profile.warmCycles, 64, config.name + ': documented burn-in');
      checks.eq(profile.measuredCycles, 256, config.name + ': documented measured cycles');
      checks.near(profile.cycleSeconds, 6 / (1 + .08 * (config.swift || 0)), 2e-15, config.name + ': independent natural cycle');
      checks.ok(Number.isSafeInteger(profile.eventCount) && profile.eventCount >= 0 && profile.eventCount <= 12000,
        config.name + ': bounded reference event count');
    }
    const cycle = 6 / (1 + .08 * (config.swift || 0));
    const warmSeconds = cycle * 1024;
    observe(a, warmSeconds, CLOCK, checks);
    const estimatedDps = q.dps(config.depth || 120), bound = q.assessment(config.depth || 120);
    const measured = observe(a, cycle * 4096, CLOCK + warmSeconds * 1000, checks);
    let worstRateError = 0;
    for (const id of initial.activeParty) {
      const rate = profile ? profile.rates[id] : 1 / cycle;
      const error = Math.abs(rate - measured.rates[id]) / measured.rates[id];
      worstRateError = Math.max(worstRateError, error);
      checks.ok(Number.isFinite(error) && error <= config.tolerance,
        `${config.name}: HUD cast rate ${id} error ${error} exceeds ${config.tolerance}; profile=${rate}, actual=${measured.rates[id]}`);
    }
    if (profile) checks.near(profile.supportMult, measured.supportMult, config.tolerance,
      config.name + ': HUD Support time average matches actual cast/deadline integration');
    checks.near(estimatedDps, measured.dps, .01, config.name + ': aggregate HUD damage is within one percent of this measured fixed world');
    if (initial.depth % 10 === 0) {
      const maximum = bound.upperDps * measured.seconds + bound.burstBudget;
      checks.ok(measured.totalDamage <= maximum + maximum * 2e-10, config.name + ': actual long-run damage is below upper-rate plus initial-burst allowance');
      checks.ok(measured.totalDamage + bound.lowerDps * cycle + bound.burstBudget >= bound.lowerDps * measured.seconds * (1 - 2e-10),
        config.name + ': actual long-run damage is above lower-rate minus one-cycle startup allowance');
    }
    measurements.push({
      name: config.name, depth: initial.depth, swift: config.swift || 0,
      party: initial.activeParty, profile, actualRates: measured.rates,
      actualSupportMult: measured.supportMult, actualDps: measured.dps,
      estimatedDps, worstRateError, rateTolerance: config.tolerance, seconds: measured.seconds,
      casts: measured.counts, autoTaps: measured.taps, events: measured.events
    });
  }
  const savedSupport = savedSupportBounds(source, checks);
  const boundCases = stressBounds(source, checks);
  const burst = burstGuard(source, checks);
  const supportClock = supportClockLowerBound(source, checks);
  const cadenceCounter = cadenceCounterBounds(source, checks);
  const timerPrecision = timerPrecisionBounds(source, checks);
  return {checks: count, calibrationCases: measurements.length, measurements,
    savedSupport, boundCases, burstGuard: burst, supportClockLowerBound: supportClock,
    cadenceCounterBounds: cadenceCounter, timerPrecisionBounds: timerPrecision};
}

module.exports = {fixedState, observe, savedSupportBounds, supportClockLowerBound, cadenceCounterBounds, timerPrecisionBounds, stressBounds, burstGuard, verify};
if (require.main === module) {
  const source = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
  const started = Date.now();
  const result = verify(source);
  const negativeControls = [];
  if (process.argv.includes('--negative')) {
    const checks = {
      eq: assert.deepEqual, ok: assert.ok,
      near(actual, expected, relative, message) {
        assert.ok(Number.isFinite(actual) && Number.isFinite(expected) &&
          Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * relative, message);
      }
    };
    function rejects(name, run, expectedMessage) {
      let caught = '';
      try { run(); } catch (error) {
        if (!(error instanceof assert.AssertionError)) throw error;
        caught = error.message;
      }
      assert.ok(caught.includes(expectedMessage), name + ': mutation must fail the intended gameplay assertion; ' + caught);
      negativeControls.push({name, caught});
    }
    function replaceOne(text, anchor, replacement, label) {
      assert.equal(text.split(anchor).length, 2, 'one ' + label + ' mutation anchor');
      return text.replace(anchor, replacement);
    }
    rejects('ignore-initial-burst-budget', () => burstGuard(source, checks, true),
      'near-ready original cast kills the boss');
    const savedAnchor = 'upperSources[id]=Math.max(1,saved[id].mult)';
    assert.equal(source.split(savedAnchor).length, 2, 'one saved-source upper bound anchor');
    rejects('omit-paid-saved-support-source', () => savedSupportBounds(source.replace(savedAnchor, 'upperSources[id]=1'), checks),
      'original gameplay stays below the promised upper bound');
    const refundAnchor = 'if(m.support){until[i]=u+m.duration;pending+=relay;} else charge[i]=refund;';
    assert.equal(source.split(refundAnchor).length, 2, 'one nonlethal refund reference anchor');
    rejects('omit-nonlethal-refund-from-hud-reference', () => verify(source.replace(refundAnchor,
      'if(m.support){until[i]=u+m.duration;pending+=relay;} else charge[i]=0;')),
      'HUD cast rate');
    let exactUptime = replaceOne(source, 'supportRate=0,upperSources=', 'supportRate=0,lowerBuff=1,upperSources=', 'Support lower accumulator');
    exactUptime = replaceOne(exactUptime, 'supportA+=m.a;supportRate+=m.upper;\n      var profile=supportAbilityProfile(sp);',
      'supportA+=m.a;supportRate+=m.upper;\n      var profile=supportAbilityProfile(sp);\n      lowerBuff+=(profile.strength-1)*Math.min(1,profile.durationMs/1000*f/100);', 'exact Support uptime');
    exactUptime = replaceOne(exactUptime, 'var passive=passiveWispDpsAt(depth),lower=passive,upper=',
      'var passive=passiveWispDpsAt(depth),lower=passive*lowerBuff,upper=', 'buffed guaranteed passive');
    rejects('assume-exact-support-deadline-uptime', () => supportClockLowerBound(exactUptime, checks),
      'Support deadline quantization cannot overstate the analytical lower bound');
    const lowerCadence = replaceOne(source, 'lower+=base;', 'lower+=base*(1+cadence/5);', 'average Cadence lower bound');
    rejects('assume-every-fifth-cadence-in-lower-bound', () => cadenceCounterBounds(lowerCadence, checks),
      'stalled cadence cannot overstate guaranteed lower damage');
    const upperCadence = replaceOne(source, 'upper+=base*upperBuff*(1+cadence)*tapRate;',
      'upper+=base*upperBuff*(1+cadence/5)*tapRate;', 'average Cadence upper bound');
    rejects('assume-every-fifth-cadence-in-upper-bound', () => cadenceCounterBounds(upperCadence, checks),
      'stalled cadence original gameplay stays below the promised upper bound');
    const naiveHud = replaceOne(source, 'if(!Number.isSafeInteger(state.totalTaps+60)){',
      'if(false){', 'unsafe counter HUD reference');
    rejects('ignore-unsafe-counter-transition-in-hud', () => cadenceCounterBounds(naiveHud, checks),
      'Cadence HUD models the actual sixty-tap counter transition');
  }
  console.log(JSON.stringify({status: 'pass', sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
    ...result, negativeControls, elapsedMs: Date.now() - started,
    scope: 'complete production IIFE; original authoritative charge, cast, Support-time and damage observations'}));
}
