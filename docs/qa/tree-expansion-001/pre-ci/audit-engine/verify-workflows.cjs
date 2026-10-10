#!/usr/bin/env node
'use strict';
// Read/structure checks plus an isolated shell-contract probe. No game test runs.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3]);
const verifiedAt = process.argv[4];
assert(/^2026-10-10T\d\d:\d\d:\d\dZ$/.test(verifiedAt), 'explicit trusted UTC timestamp');
const baseline = '2d01049393e3bb45a90d80e07af52ae0484b0ec5';
const fullPath = '.github/workflows/pre-merge-validation.yml';
const treePath = '.github/workflows/tree-focused-qa.yml';
const git = args => cp.execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const fullBefore = git(['show', baseline + ':' + fullPath]);
const fullAfter = fs.readFileSync(path.join(repo, fullPath), 'utf8');
const tree = fs.readFileSync(path.join(repo, treePath), 'utf8');
// No Node YAML package is installed. Use the existing safe YAML parser only;
// every validation and all orchestration remain JavaScript, with no new dependency.
const parse = cp.spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON || 'python3', ['-c',
  'import json,sys,yaml; print(json.dumps({"parser":"PyYAML "+yaml.__version__,"documents":[yaml.load(s,Loader=yaml.BaseLoader) for s in json.load(sys.stdin)]}))'],
  { input: JSON.stringify([fullBefore, fullAfter, tree]), encoding: 'utf8' });
assert.equal(parse.status, 0, parse.stderr);
const parsed = JSON.parse(parse.stdout);
const [before, after, proposed] = parsed.documents;
let checks = 0;
function eq(a, b, m) { checks++; assert.deepEqual(a, b, m); }
function ok(a, m) { checks++; assert(a, m); }
const negativeName = 'Behavioral harness negative self-test';
const oldStep = before.jobs.validation.steps.find(s => s.name === negativeName);
const newStep = after.jobs.validation.steps.find(s => s.name === negativeName);
ok(oldStep && newStep, 'one existing negative step');
const names = code => code.match(/for scenario in ([^;]+); do/)[1].trim().split(/\s+/);
const negatives = names(oldStep.run);
eq(names(newStep.run), negatives, 'all original negative names in exact order');
eq(negatives.length, 22, '22 negative controls');
eq(new Set(negatives).size, 22, 'all negative names unique');
const adjusted = JSON.parse(JSON.stringify(after));
adjusted.jobs.validation.steps.find(s => s.name === negativeName).run = oldStep.run;
eq(adjusted, before, 'no other pre-merge workflow contract changed');
ok(newStep.run.startsWith('set -euo pipefail\n'), 'strict failure flags retained');
ok(newStep.run.includes('exit 1\n'), 'unexpected success remains fatal');
ok(newStep.run.includes('--raw-artifacts validation-evidence/negative-raw'), 'negative raw process records retained');
ok(newStep.run.endsWith('} 2>&1 | tee validation-evidence/negative-self-tests.log\n'), 'all negative stdout/stderr retained');
const caught = 'Behavioral harness correctly caught expected failure: ';
ok(newStep.run.includes(caught), 'original caught message retained');
eq(Object.keys(proposed.on), ['pull_request'], 'no push or dispatch trigger');
eq(proposed.on.pull_request.branches, ['main', 'feature/progression-expansion-2026-10-09'], 'target base branches');
eq(Object.keys(proposed.on.pull_request), ['branches'], 'no path filtering');
eq(proposed.permissions, { contents: 'read' }, 'read-only Actions token');
eq(Object.keys(proposed.jobs), ['tree'], 'one dedicated Tree job');
eq(proposed.jobs.tree.if, undefined, 'Tree runs regardless of source branch name');
eq(proposed.jobs.tree['timeout-minutes'], '35', 'bounded Tree job');
eq(proposed.concurrency['cancel-in-progress'], 'true', 'superseded candidates cancelled');
ok(proposed.concurrency.group.includes('github.event.pull_request.number'), 'concurrency isolated per PR');
const steps = proposed.jobs.tree.steps;
eq(steps[0], { uses: 'actions/checkout@v4' }, 'default synthetic-merge checkout retained');
eq(steps[1].with['node-version'], '20', 'Node 20 CI runtime');
const upcoming = ['tree-expansion-core.cjs', 'tree-expansion-offline.cjs', 'tree-expansion-economy.cjs', 'tree-expansion-mobile.cjs', 'tree-expansion-v8.cjs'];
for (const file of upcoming) {
  eq(steps.filter(s => s.run && s.run.includes('tests/behavioral/' + file + ' index.html')).length, 1, 'one mandatory invocation ' + file);
}
for (const file of ['tree-expansion-core.cjs','tree-expansion-offline.cjs','tree-expansion-economy.cjs']) {
  ok(steps.some(s => s.run && s.run.includes('tests/behavioral/' + file + ' index.html --negative')), 'causal controls are mandatory ' + file);
}
for (const file of ['prism-earning-state.cjs', 'prism-closeout-data.cjs', 'prism-earning-focused.cjs', 'prism-acceptance.cjs', 'prism-legacy-runtime.cjs']) {
  eq(steps.filter(s => s.run && s.run.includes('tests/behavioral/' + file + ' ')).length, 1, 'skipped Prism workflow coverage carried ' + file);
}
for (const step of steps) {
  eq(step['continue-on-error'], undefined, 'no failure masking: ' + (step.name || step.uses));
  if (!step.run) continue;
  ok(step.run.startsWith('set -euo pipefail\n'), 'strict shell: ' + step.name);
  const syntax = cp.spawnSync('bash', ['-n'], { input: step.run, encoding: 'utf8' });
  eq(syntax.status, 0, 'bash syntax: ' + step.name + ' ' + syntax.stderr);
}
const runtime = steps.find(s => /actual V8 6\.0/.test(s.name || ''));
ok(runtime.run.includes("grep ' node-v8.3.0-linux-x64.tar.xz$' SHASUMS256.txt | sha256sum -c -"), 'runtime archive verified before extraction');
ok(runtime.run.includes('/tmp/tree-node8/node-v8.3.0-linux-x64/bin/node tests/behavioral/tree-expansion-v8.cjs'), 'actual old runtime executes Tree');
ok(runtime.run.includes('/tmp/tree-node8/node-v8.3.0-linux-x64/bin/node tests/behavioral/prism-legacy-runtime.cjs'), 'same old runtime executes Prism');
const upload = steps.find(s => s.uses === 'actions/upload-artifact@v4');
eq(upload.if, 'always()', 'evidence retained on failure');
eq(upload.with['if-no-files-found'], 'error', 'missing evidence cannot silently succeed');
ok(upload.with.path.split('\n').includes('tree-validation/'), 'all raw Tree receipts included');
ok(!upload.with.path.split('\n').includes('index.html'), 'no full product source copied into focused evidence');
const negativeSyntax = cp.spawnSync('bash', ['-n'], { input: newStep.run, encoding: 'utf8' });
eq(negativeSyntax.status, 0, 'negative loop shell syntax');
fs.mkdirSync(out, { recursive: true });
const mockRoot = fs.mkdtempSync(path.join(out, 'negative-shell-contract-'));
const bin = path.join(mockRoot, 'bin');
fs.mkdirSync(bin);
const fakeNode = path.join(bin, 'node');
fs.writeFileSync(fakeNode, '#!' + process.execPath + '\n' +
  "const fs=require('node:fs'),path=require('node:path');\n" +
  "const args=process.argv.slice(2),name=args[args.indexOf('--scenario')+1],raw=args[args.indexOf('--raw-artifacts')+1];\n" +
  "if(raw){fs.mkdirSync(raw,{recursive:true});fs.writeFileSync(path.join(raw,name+'.json'),JSON.stringify({mock:true,name}));}\n" +
  "process.stdout.write('MOCK stdout '+name+'\\n');process.stderr.write('MOCK stderr '+name+'\\n');process.exit(name===process.env.TREE_AUDIT_UNEXPECTED_SUCCESS?0:1);\n",
  { mode: 0o755 });
const mocks = [];
for (const mode of ['all-expected-failures', 'unexpected-success', 'evidence-sink-failure']) {
  const cwd = path.join(mockRoot, mode);
  fs.mkdirSync(cwd);
  if (mode === 'evidence-sink-failure') fs.mkdirSync(path.join(cwd, 'validation-evidence/negative-self-tests.log'), { recursive: true });
  const r = cp.spawnSync('bash', ['-c', newStep.run], { cwd, encoding: 'utf8', timeout: 15000,
    env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH,
      TREE_AUDIT_UNEXPECTED_SUCCESS: mode === 'unexpected-success' ? negatives[10] : '' } });
  eq(r.signal, null, 'shell contract completed normally: ' + mode);
  const logPath = path.join(cwd, 'validation-evidence/negative-self-tests.log');
  const log = fs.statSync(logPath).isFile() ? fs.readFileSync(logPath, 'utf8') : '';
  const caughtNames = Array.from(log.matchAll(/^Behavioral harness correctly caught expected failure: (.+)$/gm), m => m[1]);
  if (mode === 'all-expected-failures') {
    eq(r.status, 0, 'all expected failures produce successful control step');
    eq(caughtNames, negatives, 'all 22 caught messages captured');
    eq((log.match(/^MOCK stderr /gm) || []).length, 22, 'all stderr captured');
    eq(fs.readdirSync(path.join(cwd, 'validation-evidence/negative-raw')).length, 22, 'raw directories retained');
  } else if (mode === 'unexpected-success') {
    ok(r.status !== 0, 'unexpected pass survives pipeline as a failing step');
    eq(caughtNames, negatives.slice(0, 10), 'loop stops at first unexpected pass');
    ok(log.includes("negative scenario '" + negatives[10] + "' unexpectedly passed."), 'cause captured in evidence');
  } else {
    ok(r.status !== 0, 'tee/evidence sink failure remains fatal');
  }
  const row = { mode, mockOnly: true, exitcode: r.status, signal: r.signal, caught: caughtNames.length,
    stdoutSha256: hash(r.stdout || ''), stderrSha256: hash(r.stderr || '') };
  fs.writeFileSync(path.join(cwd, 'process.json'), JSON.stringify(row, null, 2) + '\n');
  fs.writeFileSync(path.join(cwd, 'stdout.log'), r.stdout || '');
  fs.writeFileSync(path.join(cwd, 'stderr.log'), r.stderr || '');
  mocks.push(row);
}
const diffCheck = cp.spawnSync('git', ['diff', '--check', '--', fullPath, treePath], { cwd: repo, encoding: 'utf8' });
eq(diffCheck.status, 0, 'diff check: ' + diffCheck.stdout + diffCheck.stderr);
const result = { verifiedAt, clockSource: 'clock__curr_time UTC supplied by caller', status: 'pass', checks,
  node: process.version, yamlParser: parsed.parser, yamlMode: 'BaseLoader preserves the GitHub on key; structural assertions compare scalar strings',
  scope: 'YAML parse, structural assertions, bash syntax and isolated mock negative-step contract only. No gameplay/browser/CI run.',
  baseline, files: [fullPath, treePath].map(p => ({ path: p, sha256: hash(fs.readFileSync(path.join(repo, p))),
    gitBlob: git(['hash-object', p]).trim() })), negativeNames: negatives, mocks,
  treeEntryPoints: upcoming.map(f => ({ path: 'tests/behavioral/' + f, exists: fs.existsSync(path.join(repo, 'tests/behavioral', f)) })) };
fs.writeFileSync(path.join(out, 'workflow-verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
