/* Validates this local proposal's documents, script syntax and scoped files.
 * Gameplay baseline evidence is separately indexed in README.md.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
function run(command, args) {
  const result = spawnSync(command, args, {cwd:root, encoding:'utf8'});
  assert(!result.error && result.status === 0, command + ' ' + args.join(' ') + ': ' + (result.stderr || result.error || 'failed'));
  return result.stdout;
}
const documents = ['docs/tasks/SWIFT_RECOVERY_CAP_001.md',
  'docs/qa/swift-recovery-cap-001/README.md', 'docs/qa/swift-recovery-cap-001/DESIGN.md'];
let links = 0;
for (const relative of documents) {
  const file = path.join(root, relative);
  const text = new TextDecoder('utf-8', {fatal:true}).decode(fs.readFileSync(file));
  assert.equal((text.match(/^```/gm) || []).length % 2, 0, 'Unclosed code fence: ' + relative);
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (/^[a-z]+:\/\//i.test(target) || !target) continue;
    assert(fs.existsSync(path.resolve(path.dirname(file), target)), 'Missing link: ' + relative + ' -> ' + target);
    links++;
  }
}
const scripts = fs.readdirSync(__dirname).filter(file => file.endsWith('.cjs'));
for (const file of scripts) run(process.execPath, ['--check', path.join(__dirname, file)]);
const tracked = run('git', ['diff', '--name-only', '0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd']).trim().split('\n');
const staged = run('git', ['diff', '--cached', '--name-only', '0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd']).trim().split('\n');
const untracked = run('git', ['ls-files', '--others', '--exclude-standard']).trim().split('\n');
const scoped = p => p === 'docs/tasks/SWIFT_RECOVERY_CAP_001.md' ||
  p === 'docs/tasks/SWIFT_RECOVERY_CAP_001_REQUEST.txt' || p.startsWith('docs/qa/swift-recovery-cap-001/');
for (const p of [...tracked, ...staged, ...untracked].filter(Boolean)) assert(scoped(p), 'Unexpected changed file: ' + p);
run('git', ['diff', '--check']);
run('git', ['diff', '--cached', '--check']);
const current = JSON.parse(fs.readFileSync(path.join(__dirname, 'current-cdp/results.json')));
assert.equal(current.commit, '0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd');
assert(current.sourceUnchanged && current.harnessUnchanged, 'Current source/harness changed during checks');
assert(current.results.length === 14 && current.results.every(r => r.passed), 'Incomplete current CDP baseline evidence');
const standard = JSON.parse(fs.readFileSync(path.join(__dirname, 'current-standard/results.json')));
assert(standard.results.filter(r => r.name.startsWith('forge-ui-')).length === 2);
assert(standard.results.filter(r => r.name.startsWith('forge-ui-')).every(r => r.passed));
assert(standard.results.some(r => r.name === 'forge-contracts' && !r.passed), 'Retain standard timeout limitation');
const result = {scope:'local proposal only; not implementation acceptance', checkedAt:new Date().toISOString(),
  documents:documents.length, relativeLinks:links, scripts: scripts.length,
  changedFiles:[...new Set([...tracked, ...staged, ...untracked].filter(Boolean))].length,
  productAndExistingToolsUnchanged:true, currentCdpChecks:current.results.length,
  standardNativeUiPass:2, standardDomTimeoutRetained:true, status:'pass'};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
