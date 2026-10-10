#!/usr/bin/env node
'use strict';
// Read-only validation of the source-bound PR105 full CI evidence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT = __dirname;
const authoritativeUtc = process.env.LUMENFALL_AUDIT_UTC;
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(authoritativeUtc || ''))
  throw Error('LUMENFALL_AUDIT_UTC must be supplied from clock__curr_time as UTC ISO seconds');
const E = {
  run: 38047024745, job: 114198498968,
  head: '979ed4a3cb1e106456f86efacc114c89e825a88b',
  base: '5bcd1c861af51511ca3d5c4a07d9d61e72fdff03',
  merge: '8e0e4911e6821242369e8a1877a40068bab23a10',
  tree: 'dd9e503000291554af6e93c294d99d475a09612f',
  source: '05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac'
};
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const hash = (data, algorithm = 'sha256') => crypto.createHash(algorithm).update(data).digest('hex');
const requireEvidence = (ok, message) => { if (!ok) throw Error(message); };
const save = (name, value) => fs.writeFileSync(path.join(ROOT, name), JSON.stringify(value, null, 2) + '\n');
const multiset = values => JSON.stringify(Object.entries(values.reduce((a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {})).sort());
const identity = read('synthetic-merge.json');
requireEvidence(identity.sha === E.merge && identity.tree.sha === E.tree, 'Wrong synthetic merge/tree');
requireEvidence(JSON.stringify(identity.parents.map(p => p.sha)) === JSON.stringify([E.base, E.head]), 'Wrong combined parents');
const run = read('final-run.json'), jobs = read('final-jobs.json');
requireEvidence(run.id === E.run && run.head_sha === E.head, 'Wrong run/head');
requireEvidence(run.status === 'completed' && run.conclusion === 'success', 'Run has not succeeded');
requireEvidence(jobs.jobs.length === 1, 'Unexpected job topology');
const job = jobs.jobs[0];
requireEvidence(job.id === E.job && job.head_sha === E.head, 'Wrong job/head');
requireEvidence(job.status === 'completed' && job.conclusion === 'success', 'Job has not succeeded');
requireEvidence(job.steps.every(s => s.status === 'completed' && s.conclusion === 'success'), 'Incomplete, failed or skipped job step');
const steps = Object.fromEntries(job.steps.map(s => [s.name, s]));
for (const name of [
  'APK identity verifier self-test', 'Node tooling regression checks', 'Validate game source',
  'Rift cosmetics selection, persistence and mobile acceptance',
  'Exact Prism earning numerical and causal regression',
  'Development currency UI and retained-value acceptance',
  'Stateful behavioral regression suite', 'Behavioral harness negative self-test',
  'Install runtime error guard in staged copy', 'Browser runtime smoke test',
  'Preserve full regression evidence'
]) requireEvidence(steps[name], 'Missing required gate: ' + name);
const matching = read('final-artifacts.json').artifacts.filter(a => a.name === 'pre-merge-evidence-' + E.run);
requireEvidence(matching.length === 1, 'Missing/ambiguous full artifact');
const artifact = matching[0];
requireEvidence(!artifact.expired && artifact.workflow_run.id === E.run && artifact.workflow_run.head_sha === E.head, 'Wrong/expired artifact');
const zipPath = path.join(ROOT, artifact.name + '.zip');
const bytes = fs.readFileSync(zipPath), zipDigest = hash(bytes);
requireEvidence(bytes.length === artifact.size_in_bytes, 'ZIP/API size differs');
requireEvidence('sha256:' + zipDigest === artifact.digest, 'ZIP/API digest differs');
// Inspect the central directory before extraction, including symlink/traversal guards.
let eocd = -1;
for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); --i) {
  if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) { eocd = i; break; }
}
requireEvidence(eocd >= 0, 'Missing ZIP end record');
const count = bytes.readUInt16LE(eocd + 10);
let offset = bytes.readUInt32LE(eocd + 16);
requireEvidence(count !== 65535 && offset !== 0xffffffff, 'Unexpected ZIP64 archive');
requireEvidence(bytes.readUInt16LE(eocd + 4) === 0 && bytes.readUInt16LE(eocd + 6) === 0, 'Multi-disk archive');
const entries = [];
for (let i = 0; i < count; i++) {
  requireEvidence(bytes.readUInt32LE(offset) === 0x02014b50, 'Invalid ZIP central entry');
  const length = bytes.readUInt16LE(offset + 28), extra = bytes.readUInt16LE(offset + 30), comment = bytes.readUInt16LE(offset + 32);
  const name = bytes.subarray(offset + 46, offset + 46 + length).toString('utf8');
  const attributes = bytes.readUInt32LE(offset + 38);
  requireEvidence(!path.posix.isAbsolute(name) && !name.split('/').includes('..') && !name.includes('\\') && !name.includes('\0'), 'Unsafe archive path');
  requireEvidence(((attributes >>> 16) & 0xf000) !== 0xa000, 'Archive symlink');
  entries.push({ name, size: bytes.readUInt32LE(offset + 24) });
  offset += 46 + length + extra + comment;
}
requireEvidence(new Set(entries.map(e => e.name)).size === entries.length, 'Duplicate archive path');
const extracted = path.join(ROOT, artifact.name);
execFileSync('unzip', ['-qq', '-o', zipPath, '-d', extracted], { maxBuffer: 2 * 1024 * 1024 });
const manifest = entries.filter(e => !e.name.endsWith('/')).map(e => {
  const file = path.join(extracted, ...e.name.split('/'));
  requireEvidence(fs.lstatSync(file).isFile(), 'Non-file extracted entry');
  const data = fs.readFileSync(file);
  requireEvidence(data.length === e.size, 'Extracted size differs');
  return { path: e.name, bytes: data.length, sha256: hash(data) };
});
function one(suffix) {
  const found = manifest.filter(e => e.path.endsWith(suffix));
  requireEvidence(found.length === 1, 'Missing/ambiguous evidence: ' + suffix);
  return path.join(extracted, found[0].path);
}
const commitPath = one('validation-evidence/commit.txt');
const sourcePath = one('validation-evidence/source-sha256.txt');
const logPath = one('validation-evidence/behavioral.log');
requireEvidence(fs.readFileSync(commitPath, 'utf8').trim() === E.merge, 'Artifact ran a different commit');
requireEvidence(JSON.stringify(fs.readFileSync(sourcePath, 'utf8').trim().split(/\s+/)) === JSON.stringify([E.source, 'index.html']), 'Artifact source differs');
const logBytes = fs.readFileSync(logPath), log = logBytes.toString('utf8');
const passRows = log.match(/^PASS .+$/gm) || [], failRows = log.match(/^FAIL(?:\s.*)?$/gm) || [];
const summaries = Array.from(log.matchAll(/^Behavioral QA passed: (\d+) deterministic scenario\(s\)\.$/gm), m => m[1]);
requireEvidence(JSON.stringify(summaries) === '["182"]', 'Unexpected scenario summary');
requireEvidence(passRows.length === 212 && failRows.length === 0, 'Unexpected PASS/FAIL count');
let baselineMatch = null;
const baseline = '/workspace/scratch/0848c4e4f365/lab-ci-audit/repair-bda35664/full-artifact-analysis.json';
if (fs.existsSync(baseline)) {
  baselineMatch = multiset(JSON.parse(fs.readFileSync(baseline, 'utf8')).allPassRows) === multiset(passRows);
  requireEvidence(baselineMatch, 'Regression inventory differs from accepted Lab run');
}
const currency = JSON.parse(fs.readFileSync(one('lumenfall-collection-price/summary.json'), 'utf8'));
requireEvidence(currency.sourceSha256 === E.source, 'Currency source differs');
requireEvidence(JSON.stringify(currency.results.map(x => x.name)) === '["normal","stale-refresh","all-white","retired-card-returns"]', 'Currency controls differ');
requireEvidence(currency.results.every(x => x.accepted), 'Currency acceptance failed');
requireEvidence(currency.results[0].sourceSha256 === E.source && currency.results[0].exitcode === 0 && currency.results[0].profiles === 12, 'Currency normal result differs');
requireEvidence(currency.results.slice(1).every(x => x.exitcode === 1), 'Currency causal negative passed');
// Observe the completed CI DOM artifact only; do not launch or execute the game.
const smokeDomPath = one('/lumenfall-dom.html');
const smokeBytes = fs.readFileSync(smokeDomPath), smokeDom = smokeBytes.toString('utf8');
const smokeChecks = {
  runtimeGuardInstalled: smokeDom.includes('id="ci-runtime-error-guard"'),
  noUncaughtRuntimeError: !smokeDom.includes('data-ci-runtime-error="uncaught-error"'),
  noUnhandledRejection: !smokeDom.includes('data-ci-runtime-error="unhandled-rejection"'),
  riftZoneRendered: smokeDom.includes('data-zone-index="0"'),
  riftScrollLocked: /<main[^>]*class="[^"]*rift-scroll-locked/.test(smokeDom),
  enemyRendered: /id="enemy-name"[^>]*>\s*[^<\s][^<]*</.test(smokeDom),
  initialLumenHudRendered: /id="hud-lumen"[^>]*>\s*0(?:\.0)?\s*</.test(smokeDom)
};
requireEvidence(Object.values(smokeChecks).every(Boolean), 'Archived smoke DOM does not satisfy the runtime smoke observations');
const smoke = {
  verifiedAt: authoritativeUtc,
  method: 'Read-only observation of the archived completed CI DOM; no new game/browser execution',
  artifactId: artifact.id, domArtifactPath: manifest.find(x => path.join(extracted, x.path) === smokeDomPath).path,
  originalBytes: smokeBytes.length, originalSha256: hash(smokeBytes), checks: smokeChecks,
  fullDomIncludedInDurablePackage: false
};
save('smoke-artifact-inspection.json', smoke);
const workflowData = read('workflow-source-api.json'), workflow = workflowData.content;
requireEvidence(workflowData.sha === '5cddd8599a23ba2fb823b75f471df3e16e721e86',
  'Workflow differs from independently reviewed blob at head 979ed4a3');
const wfBytes = Buffer.from(workflow);
requireEvidence(hash(Buffer.concat([Buffer.from('blob ' + wfBytes.length + '\0'), wfBytes]), 'sha1') === workflowData.sha, 'Workflow blob differs');
const negativeNames = workflow.match(/for scenario in (.*?); do/)[1].split(/\s+/);
requireEvidence(negativeNames.length === 22 && new Set(negativeNames).size === 22, 'Wrong negative inventory');
requireEvidence(workflow.includes('if node tests/behavioral/run.cjs --web-root mobile/www --scenario "$scenario"; then') &&
  workflow.includes('unexpectedly passed.') && workflow.includes('exit 1') && workflow.includes('set -euo pipefail'), 'Weak negative loop');
let caught = null;
const jobLog = path.join(ROOT, 'job.log');
if (fs.existsSync(jobLog)) {
  const content = fs.readFileSync(jobLog, 'utf8');
  caught = Array.from(content.matchAll(/Behavioral harness correctly caught expected failure: (self-test-[a-z0-9-]+)\s*$/gm), m => m[1]);
  requireEvidence(multiset(caught) === multiset(negativeNames), 'Job log misses/duplicates negative caught messages');
}
const receipt = {
  verifiedAt: authoritativeUtc, clockSource: 'clock__curr_time UTC supplied to the verifier', accepted: true,
  runId: run.id, jobId: job.id, runAttempt: run.run_attempt,
  artifactId: artifact.id, artifactName: artifact.name,
  artifactZipSha256: zipDigest, artifactApiDigest: artifact.digest,
  artifactBytes: bytes.length, artifactFileCount: manifest.length,
  head: E.head, base: E.base, syntheticMerge: E.merge, tree: E.tree, sourceSha256: E.source,
  commitEvidence: commitPath, sourceEvidence: sourcePath, rawBehavioralLog: logPath,
  rawBehavioralLogSha256: hash(logBytes), rawBehavioralLogBytes: logBytes.length,
  scenarios: 182, passRows: passRows.length, failRows,
  samePassInventoryAsAcceptedLab: baselineMatch, allPassRows: passRows,
  negativeSelfTests: {
    count: negativeNames.length, names: negativeNames, workflowBlob: workflowData.sha,
    step: steps['Behavioral harness negative self-test'],
    perScenarioRawLogsAvailable: caught !== null, observedCaughtMessages: caught,
    evidence: caught !== null ? 'All 22 raw caught messages plus successful strict loop.' :
      'Exact reviewed strict 22-negative loop plus GitHub completed/success step; per-negative traces absent from artifact.'
  },
  currency, smoke, requiredJobSteps: job.steps, extraction: extracted,
  limitations: caught !== null ? [] : ['Per-negative job log unavailable; exact workflow strict-loop execution verified through successful GitHub step.']
};
save('artifact-manifest.json', manifest);
save('full-artifact-analysis.json', receipt);
console.log(JSON.stringify(Object.fromEntries([
  'accepted', 'runId', 'jobId', 'artifactId', 'artifactZipSha256', 'artifactBytes', 'artifactFileCount',
  'syntheticMerge', 'tree', 'sourceSha256', 'scenarios', 'passRows', 'failRows',
  'samePassInventoryAsAcceptedLab', 'rawBehavioralLogSha256', 'extraction', 'limitations'
].map(k => [k, receipt[k]])), null, 2));
