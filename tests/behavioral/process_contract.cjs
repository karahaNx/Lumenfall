#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { runProcess } = require('../../scripts/lib/process.cjs');
const { main } = require('../../scripts/lib/cli.cjs');
function qaDom(body, status = 'pass', scenario = 'support-stacking', marker = '', tagScenario = true) {
  body ??= JSON.stringify({ scenario, status, detail: {}, runtimeErrors: [] });
  return '<html' + marker + '><body><pre id="qa-result" data-status="' + status + '"' +
    (tagScenario ? ' data-scenario="' + scenario + '"' : '') + '>' + body + '</pre></body></html>';
}
function completion(stdout, exitcode = 0) { return { stdout, stderr: 'controlled stderr', exitcode, timed_out: false }; }
function timeout(stdout = '', stderr = '') { return { stdout, stderr, exitcode: null, timed_out: true }; }
async function exercise(gate, outcome, rawArtifactRoot) {
  const lines = [], calls = [];
  const actual = await gate('/controlled-browser', 'http://127.0.0.1:1', 'support-stacking', 'fresh', null, {
    rawArtifactRoot, log: line => lines.push(line),
    execute: async (command, options) => {
      calls.push(command);
      assert.equal(JSON.stringify(options), '{"timeout":25000}', 'raw process deadline/options changed');
      assert(command.includes('--virtual-time-budget=1500') && command.includes('--dump-dom'), 'raw browser flags changed');
      return typeof outcome === 'function' ? outcome(command, options) : outcome;
    }
  });
  assert.equal(calls.length, 1, 'raw gate must invoke exactly one browser process');
  return { actual, report: lines.join('\n') };
}
function mutatedGate(before, after) {
  const file = path.join(__dirname, 'run.cjs'), source = fs.readFileSync(file, 'utf8');
  assert.equal(source.split(before).length, 2, 'mutation must target the actual gate');
  const mod = { exports: {} };
  vm.runInNewContext(source.replace(before, after), { module: mod, exports: mod.exports, require: createRequire(file),
    __dirname, process, console, URLSearchParams, Buffer }, { filename: 'causal-gate-mutation.cjs' });
  return mod.exports.runScenario;
}
async function runContract(gate, log = console.log) {
  const good = qaDom();
  const cases = [
    ['valid', completion(good), true],
    ['valid-layout-host-tag', completion(qaDom(undefined, 'pass', 'support-stacking', '', false)), true],
    ['detail-is-unconstrained', completion(qaDom(JSON.stringify({ scenario: 'support-stacking', status: 'pass', runtimeErrors: [] }))), true],
    ['timeout-before-qa', timeout('before QA', 'startup blocked'), false, '"timed_out": true'],
    ['timeout-partial-pass-bytes', timeout(Buffer.from(good).toString(), 'pending process'), false, '"timed_out": true'],
    ['timeout-partial-pass-str', timeout(good, 'pending process'), false, '"timed_out": true'],
    ['timeout-none', timeout(), false, '"timed_out": true'],
    ['nonzero-pass', completion(good, 7), false, '"exitcode": 7'],
    ['qa-fail-exit-zero', completion(qaDom(undefined, 'fail')), false, '"qa_status": "fail"'],
    ['runtime-marker', completion(qaDom(undefined, 'pass', 'support-stacking', ' data-qa-runtime-error="uncaught-error"')), false, 'uncaught-error'],
    ['empty-runtime-marker', completion(qaDom(undefined, 'pass', 'support-stacking', ' data-qa-runtime-error=""')), false],
    ['runtime-errors', completion(qaDom(JSON.stringify({ scenario: 'support-stacking', status: 'pass', runtimeErrors: [{ kind: 'error' }] }))), false, '"runtime_error_count": 1'],
    ['missing-pre', completion('<div id="qa-result" data-status="pass"></div>'), false, 'completed pre'],
    ['missing-json', completion(qaDom('')), false, 'json_error'],
    ['invalid-json', completion(qaDom('not-json')), false, 'json_error'],
    ['truncated-json', completion(qaDom('{"scenario":')), false, 'json_error'],
    ['unclosed-result', completion(good.replace('</pre>', '')), false, 'completed pre'],
    ['duplicate-result', completion(good + good), false, 'exactly one'],
    ['nonobject-json', completion(qaDom('[]')), false, 'must be an object'],
    ['missing-runtime-errors', completion(qaDom('{"scenario":"support-stacking","status":"pass"}')), false, 'must be an array'],
    ['invalid-runtime-errors', completion(qaDom('{"scenario":"support-stacking","status":"pass","runtimeErrors":null}')), false, 'must be an array'],
    ['json-scenario-mismatch', completion(qaDom('{"scenario":"other","status":"pass","runtimeErrors":[]}')), false, 'scenario does not match'],
    ['tag-scenario-mismatch', completion(good.replace('data-scenario="support-stacking"', 'data-scenario="other"')), false, 'tag scenario does not match'],
    ['status-mismatch', completion(qaDom('{"scenario":"support-stacking","status":"fail","runtimeErrors":[]}')), false, 'status does not match'],
    ['invalid-status', completion(qaDom('{"scenario":"support-stacking","status":null,"runtimeErrors":[]}')), false, 'status does not match'],
    ['non-json-constant', completion(qaDom('{"scenario":"support-stacking","status":"pass","runtimeErrors":[],"detail":NaN}')), false, 'json_error'],
    ['missing-tag', completion('not HTML'), false, 'exactly one'],
    ['script-fake-result', completion('<script>const fake=' + JSON.stringify(good) + ';</script>' + good), true],
    ['comment-fake-result', completion('<!--' + good + '-->' + good), true],
    ['quoted-attribute-angle', completion(good.replace('<pre ', '<pre title="one > zero" ')), true],
    ['encoded-json-text', completion(qaDom(JSON.stringify({ scenario: 'support-stacking', status: 'pass', runtimeErrors: [], detail: '<&>' }).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'))), true]
  ];
  try {
    for (const [name, outcome, expected, marker] of cases) {
      const { actual, report } = await exercise(gate, outcome);
      assert.equal(actual, expected, name + ': incorrect gate outcome');
      assert(report.startsWith((expected ? 'PASS ' : 'FAIL ') + 'support-stacking'), name + ': incorrect report');
      if (marker) assert(report.includes(marker), name + ': missing diagnostic ' + marker);
      if (name === 'timeout-before-qa') assert(report.includes('before QA') && report.includes('startup blocked'), 'partial logs must survive');
      log('  raw gate control ' + name + ': expected ' + (expected ? 'PASS' : 'FAIL'));
    }
    const child = await exercise(gate, () => runProcess([process.execPath, '-e',
      'console.log(' + JSON.stringify(good) + ");console.error('bounded child pending');setInterval(()=>{},1000)"], { timeout: 250 }));
    assert.equal(child.actual, false);
    assert(child.report.includes('"timed_out": true') && child.report.includes('"qa_status": "pass"') && child.report.includes('bounded child pending'));
    log('  raw gate control real-bounded-partial-pass: expected FAIL (0.25s child budget; gate requests 25s)');
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'raw-contract-artifacts-'));
    try {
      const longStderr = 'raw-only-prefix:' + 'x'.repeat(10000);
      const { actual, report } = await exercise(gate, timeout(good, longStderr), root);
      const artifacts = fs.readdirSync(root);
      assert.equal(actual, false); assert.equal(artifacts.length, 1);
      const directory = path.join(root, artifacts[0]);
      assert.equal(fs.readFileSync(path.join(directory, 'stdout.html'), 'utf8'), good);
      assert.equal(fs.readFileSync(path.join(directory, 'stderr.log'), 'utf8'), longStderr);
      assert(!report.includes('raw-only-prefix:') && report.length < 8500, 'diagnostics must be bounded');
      assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'process.json'), 'utf8')).process.timed_out, true);
      log('  raw gate control complete-artifacts/bounded-log: expected FAIL');
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
    const predicate = `const passed = (!timedOut && exitcode === 0 && observation.valid
    && observation.qa_status === 'pass' && observation.runtime_markers.length === 0
    && observation.runtime_error_count === 0);`;
    const broken = mutatedGate(predicate, "const passed = exitcode === 0 && observation.qa_status === 'pass' && observation.runtime_markers.length === 0;");
    assert.equal((await exercise(broken, completion(qaDom('not-json')))).actual, true, 'restored false accept must be causally detected');
    assert.equal((await exercise(gate, completion(qaDom('not-json')))).actual, false);
    log('  causal negative false-accept: restored invalid-JSON acceptance detected; undo rejects it');
    const missingDeadline = mutatedGate(predicate, predicate.replace('!timedOut && exitcode === 0', '(timedOut || exitcode === 0)'));
    assert.equal((await exercise(missingDeadline, timeout(good))).actual, true, 'ignored deadline must be causally detected');
    assert.equal((await exercise(gate, timeout(good))).actual, false);
    log('  causal negative ignored-timeout: restored partial-PASS acceptance detected; undo rejects it');
  } catch (error) { log('FAIL raw-process-contract: ' + error.message); return false; }
  log('PASS raw-process-contract: 31 result controls, real timeout, artifact bounds, two causal negatives/undo');
  return true;
}
module.exports = { runContract };
if (require.main === module) main(async () => { if (!await runContract(require('./run.cjs').runScenario)) process.exitCode = 1; });
