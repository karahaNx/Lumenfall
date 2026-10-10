#!/usr/bin/env node
'use strict';
// Package only the fresh PR105 CI evidence; never edit a repository.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const ROOT = __dirname, DEST = path.join(ROOT, '..', '..', 'durable', 'repaired-full');
const authoritativeUtc = process.env.LUMENFALL_AUDIT_UTC;
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(authoritativeUtc || ''))
  throw Error('LUMENFALL_AUDIT_UTC must be supplied from clock__curr_time as UTC ISO seconds');
const analysis = JSON.parse(fs.readFileSync(path.join(ROOT, 'full-artifact-analysis.json'), 'utf8'));
if (analysis.accepted !== true || analysis.runId !== 38047024745 ||
    analysis.sourceSha256 !== '05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac') throw Error('Unaccepted source/run');
const zipManifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifact-manifest.json'), 'utf8'));
const selected = [], excluded = [], records = [];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function add(file, relative, role, originalZipEntry) {
  if (path.isAbsolute(relative) || relative.split('/').includes('..')) throw Error('Unsafe package path');
  const raw = fs.readFileSync(file);
  if (originalZipEntry && (raw.length !== originalZipEntry.bytes || hash(raw) !== originalZipEntry.sha256))
    throw Error('Fresh bytes differ from verified ZIP entry: ' + originalZipEntry.path);
  selected.push({ file, relative, role, raw, originalZipEntry });
}
for (const item of zipManifest) {
  const parts = item.path.split('/');
  let relative = null, role = null;
  if (parts.includes('validation-evidence')) {
    relative = parts.slice(parts.indexOf('validation-evidence')).join('/');
    role = 'fresh full regression raw evidence';
  } else if (parts.includes('lumenfall-collection-price')) {
    relative = ['currency'].concat(parts.slice(parts.indexOf('lumenfall-collection-price') + 1)).join('/');
    role = 'currency normal/expected-negative acceptance';
  } else if (['lumenfall-chrome.log', 'lumenfall-http.log'].includes(parts[parts.length - 1])) {
    relative = 'smoke/' + parts[parts.length - 1];
    role = 'archived smoke browser/server log';
  }
  if (relative === null || /\.html?$/i.test(item.path)) {
    excluded.push({ originalArtifactPath: item.path, originalBytes: item.bytes, originalSha256: item.sha256,
      reason: /\.html?$/i.test(item.path) ? 'Full DOM/product HTML deliberately excluded; original ZIP provenance retained' : 'Outside requested fresh raw/currency/smoke evidence subset' });
    continue;
  }
  add(path.join(analysis.extraction, item.path), relative, role, item);
}
for (const name of [
  'monitor-identity.json', 'synthetic-merge.json', 'workflow-source-api.json',
  'final-run.json', 'final-jobs.json', 'final-artifacts.json', 'final-pr.json',
  'final-main.json', 'final-reviews.json', 'final-review-threads.json',
  'full-artifact-analysis.json', 'artifact-manifest.json',
  'targeted-case-receipts.json', 'targeted-case-audit.json', 'final-ci-acceptance.json',
  'smoke-artifact-inspection.json', 'job-log-receipt.json', 'job-log-error.json'
]) {
  const file = path.join(ROOT, name);
  if (fs.existsSync(file)) add(file, 'metadata/' + name, 'current run/API/acceptance metadata');
}
const jobLog = path.join(ROOT, 'job.log');
if (fs.existsSync(jobLog)) add(jobLog, 'logs/job.log', 'complete GitHub Actions job log');
for (const name of ['verify-artifact.cjs', 'prepare-durable.cjs', 'audit-targeted-cases.cjs'])
  add(path.join(ROOT, name), 'verification/' + name, 'Node 20+ evidence verification code');

const readme = '# PR105 repaired full pre-merge CI evidence\n\n' +
  'This directory preserves the new repaired full-CI raw evidence and current API acceptance receipts; failed run 38043830487 remains separate history. ' +
  'The ZIP remains outside this subset; its GitHub API digest and downloaded bytes were independently compared.\n\n' +
  'Every raw .log/.txt file and large text/JSON file uses deterministic lossless gzip. ' +
  'manifest.json records original and stored byte counts and SHA256. Verify the stored digest, ' +
  'decode gzip where declared, then verify the original bytes/digest. manifest.sha256 binds the manifest.\n\n' +
  'Currency folders stale-refresh, all-white and retired-card-returns contain EXPECTED failing causal controls. ' +
  'Their acceptance requires exit code 1; they are distinct from failures of the unmodified game.\n\n' +
  'The 22 mandatory harness negatives are supported by the immutable strict-loop workflow and the successful ' +
  'GitHub step. The complete Actions job log was unavailable through the connector (Transport closed); ' +
  'individual raw caught-message traces are therefore not claimed. The full behavioral log is preserved.\n\n' +
  'Full DOM/product HTML and historical artifacts are excluded. Omitted artifact entries retain their original ' +
  'paths, byte counts and hashes. CI fixtures/screenshots are synthetic; no private user save is introduced. ' +
  'Physical Android, native WebView 60, TalkBack, signed APK and release acceptance are not claimed.\n';
selected.push({ file: null, relative: 'README.md', role: 'evidence package scope and verification instructions', raw: Buffer.from(readme) });
if (new Set(selected.map(x => x.relative)).size !== selected.length) throw Error('Duplicate package destination');

// Refuse unexpected complete product source embedded in a non-HTML output.
// Preserve raw results losslessly; never silently redact an embedded source dump.
function containsProductSource(text) {
  function inspect(value) {
    let decoded = value;
    // Handle nested JSON strings and escaped markup even inside a mixed log.
    for (let pass = 0; pass < 3; pass++) {
      if (/function\s+triggerAbility\s*\(/.test(decoded) &&
          /var\s+FORGE_EXPANSION\s*=\s*\[/.test(decoded) &&
          /function\s+applyAscendMutation\s*\(/.test(decoded)) return true;
      decoded = decoded.replace(/\\\\/g, '\\')
        .replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
        .replace(/\\\//g, '/').replace(/\\"/g, '"');
    }
    return false;
  }
  if (inspect(text)) return true;
  try {
    const pending = [JSON.parse(text)];
    while (pending.length) {
      const value = pending.pop();
      if (typeof value === 'string') { if (inspect(value)) return true; }
      else if (value && typeof value === 'object') pending.push(...Object.values(value));
    }
  } catch (_) { /* Non-JSON log; its raw escaped text was checked above. */ }
  return false;
}
const suspicious = selected.filter(x => {
  if (!/\.(json|log|txt)$/i.test(x.relative) || x.raw.length < 100000) return false;
  return containsProductSource(x.raw.toString('utf8'));
});
if (suspicious.length) throw Error('Review embedded product-source candidates before packaging: ' + suspicious.map(x => x.relative).join(', '));
fs.mkdirSync(DEST, { recursive: true });
for (const item of selected) {
  const text = /\.(json|log|txt|csv|cjs|js|yml|yaml|md)$/i.test(item.relative);
  const compressed = text && (item.raw.length >= 16384 || /\.(?:log|txt)$/i.test(item.relative));
  const data = compressed ? zlib.gzipSync(item.raw, { level: 9 }) : item.raw;
  if (compressed && (!zlib.gunzipSync(data).equals(item.raw) || data.readUInt32LE(4) !== 0)) throw Error('Nonlossless/nondeterministic gzip');
  const relative = item.relative + (compressed ? '.gz' : '');
  const file = path.join(DEST, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  if (!fs.readFileSync(file).equals(data)) throw Error('Stored bytes differ');
  records.push({ path: relative, originalPath: item.relative, role: item.role,
    encoding: compressed ? 'gzip' : 'identity', originalBytes: item.raw.length,
    originalSha256: hash(item.raw), storedBytes: data.length, storedSha256: hash(data),
    ...(item.originalZipEntry ? { artifactEntry: item.originalZipEntry } : {}) });
}
const manifest = {
  createdAt: authoritativeUtc, clockSource: 'clock__curr_time UTC supplied to the packager', runId: analysis.runId, jobId: analysis.jobId,
  artifactId: analysis.artifactId, artifactZipSha256: analysis.artifactZipSha256,
  syntheticMerge: analysis.syntheticMerge, sourceSha256: analysis.sourceSha256,
  fileCount: records.length, originalBytes: records.reduce((n, x) => n + x.originalBytes, 0),
  storedBytes: records.reduce((n, x) => n + x.storedBytes, 0),
  completeJobLogPreserved: fs.existsSync(jobLog),
  compression: 'gzip level 9; mtime zero; every compressed file decompressed and byte-compared',
  selection: 'Only the new PR105 raw validation, currency acceptance, smoke logs, current metadata and Node verifiers',
  excludedArtifactEntries: excluded, files: records
};
const encoded = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(DEST, 'manifest.json'), encoded);
fs.writeFileSync(path.join(DEST, 'manifest.sha256'), hash(encoded) + '  manifest.json\n');
console.log(JSON.stringify({ path: DEST, manifestSha256: hash(encoded), runId: manifest.runId, jobId: manifest.jobId,
  artifactId: manifest.artifactId, fileCount: manifest.fileCount, originalBytes: manifest.originalBytes,
  storedBytes: manifest.storedBytes, completeJobLogPreserved: manifest.completeJobLogPreserved,
  excludedArtifactEntries: excluded.length }, null, 2));
