/* JavaScript orchestration of unchanged existing checks. Current main uses
 * Node.js; the historical b2a1f440 baseline still has the old Python harness.
 */
'use strict';
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const root = path.resolve(__dirname, '../../..');
const cdp = process.argv.includes('--cdp');
const outputIndex = process.argv.indexOf('--output');
const output = outputIndex < 0 ? (cdp ? 'cdp-baseline' : 'baseline') : process.argv[outputIndex + 1];
if (!/^[a-z0-9-]+$/.test(output)) throw Error('Expected a simple local evidence directory name');
const evidence = path.join(__dirname, output);
if (fs.existsSync(evidence) && fs.readdirSync(evidence).length) throw Error('Recorded evidence exists; choose a new --output directory');
fs.mkdirSync(evidence, {recursive:true});
const environment = {...process.env};
let adapterBin;
if (cdp) {
  adapterBin = fs.mkdtempSync(path.join(os.tmpdir(), 'swift-cdp-bin-'));
  fs.symlinkSync(path.join(__dirname, 'cdp-dump-dom.cjs'), path.join(adapterBin, 'google-chrome'));
  environment.PATH = adapterBin + path.delimiter + process.env.PATH;
}
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const nodeHarness = fs.existsSync(path.join(root, 'tests/behavioral/run.cjs'));
const harness = nodeHarness ? 'tests/behavioral/run.cjs' : 'tests/behavioral/run.py';
const executable = nodeHarness ? process.execPath : 'python3';
const scenarioIndex = process.argv.indexOf('--scenarios');
const selected = scenarioIndex < 0 ? null : process.argv[scenarioIndex + 1].split(',');
const identity = {
  commit:spawnSync('git', ['rev-parse', 'HEAD'], {cwd:root, encoding:'utf8'}).stdout.trim(),
  tree:spawnSync('git', ['rev-parse', 'HEAD^{tree}'], {cwd:root, encoding:'utf8'}).stdout.trim(),
  sourceSha256:digest('index.html'), harness, harnessSha256:digest(harness),
  transport:cdp ? 'supplemental Chromium CDP adapter; CLI timeout evidence retained separately' : 'standard harness Chromium CLI/native drivers',
  adapterSha256:cdp ? digest('docs/qa/swift-recovery-cap-001/cdp-dump-dom.cjs') : null,
  scope:'baseline only; no product candidate, migration or Android acceptance',
  startedAt:new Date().toISOString(), results:[]
};
const scenarios = ['forge-contracts', 'forge-effects', 'forge-chronology',
  'forge-save-reload', 'forge-backup-restore', 'forge-recovery',
  'support-stacking', 'buff-timing', 'buff-save-reload',
  ...(cdp ? [] : ['forge-ui-mobile', 'forge-ui-reduced-motion'])];
const commands = [
  ['context', executable, [nodeHarness ? 'scripts/codex/check_context.cjs' : 'scripts/codex/check_context.py']],
  ['formula-probe', process.execPath, ['docs/qa/swift-recovery-cap-001/baseline-probe.cjs']],
  ...scenarios.map(s => [s, executable, [harness, '--web-root', '.', '--scenario', s,
    '--raw-artifacts', path.join(evidence, 'failed-processes')]]),
  ...(cdp ? ['self-test-bad-assertion', 'self-test-chronology-regression', 'self-test-parity-regression']
    .map(s => [s, executable, [harness, '--web-root', '.', '--scenario', s,
      '--raw-artifacts', path.join(evidence, 'negative-processes')]]) : [])
].filter(([name]) => !selected || selected.includes(name));
if (selected && commands.length !== selected.length) throw Error('Unknown or duplicate selected check');
for (const [name, command, args] of commands) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {cwd:root, env:environment, encoding:'utf8', timeout:120000, maxBuffer:16 * 1024 * 1024});
  fs.writeFileSync(path.join(evidence, name + '.stdout.txt'), result.stdout || '');
  fs.writeFileSync(path.join(evidence, name + '.stderr.txt'), result.stderr || '');
  const expectedFailure = name.startsWith('self-test-');
  const completedNegative = expectedFailure && result.status === 1 && !result.error &&
    result.stdout.includes('"qa_status": "fail"') && result.stdout.includes('"timed_out": false');
  const receipt = {name, command, args, startedAt, finishedAt:new Date().toISOString(), expectedFailure,
    exitCode:result.status, signal:result.signal, error:result.error ? result.error.message : null,
    passed:expectedFailure ? completedNegative : result.status === 0 && !result.error};
  identity.results.push(receipt);
  fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(identity, null, 2) + '\n');
  process.stdout.write((receipt.passed ? 'PASS ' : 'FAIL ') + name + '\n');
}
identity.finishedAt = new Date().toISOString();
identity.sourceUnchanged = digest('index.html') === identity.sourceSha256;
identity.harnessUnchanged = digest(harness) === identity.harnessSha256;
fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(identity, null, 2) + '\n');
if (adapterBin) fs.rmSync(adapterBin, {recursive:true, force:true});
if (!identity.sourceUnchanged || !identity.harnessUnchanged || identity.results.some(r => !r.passed)) process.exitCode = 1;
