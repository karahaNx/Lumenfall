#!/usr/bin/env node
'use strict';

// Verify the immutable evidence inventory without running any game tests.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');

const root = __dirname;
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'inventory.json'), 'utf8'));
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const names = new Set();
let storedBytes = 0;
let decodedFiles = 0;

for (const entry of inventory.files) {
  assert.equal(typeof entry.path, 'string', 'inventory path');
  assert(!path.isAbsolute(entry.path), 'relative inventory path');
  assert(!entry.path.split(/[\\/]/).includes('..'), 'path remains in evidence directory');
  assert(!names.has(entry.path), 'unique inventory path: ' + entry.path);
  names.add(entry.path);
  if (entry.path.endsWith('.gz')) {
    assert.equal(entry.compression, 'gzip', 'gzip original-byte metadata required: ' + entry.path);
  }
  const bytes = fs.readFileSync(path.join(root, entry.path));
  assert.equal(bytes.length, entry.bytes, 'stored length: ' + entry.path);
  assert.equal(sha256(bytes), entry.sha256, 'stored SHA-256: ' + entry.path);
  storedBytes += bytes.length;
  if (entry.compression === 'gzip') {
    const decoded = zlib.gunzipSync(bytes);
    assert.equal(decoded.length, entry.originalBytes, 'original length: ' + entry.path);
    assert.equal(sha256(decoded), entry.originalSha256, 'original SHA-256: ' + entry.path);
    decodedFiles++;
  }
}

function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), 'no unrecorded symlink');
    return entry.isDirectory() ? walk(absolute) : [path.relative(root, absolute).split(path.sep).join('/')];
  });
}

assert.deepEqual(walk(root).filter(name => name !== 'inventory.json').sort(), [...names].sort(), 'complete evidence file set');
assert.equal(inventory.fileCount, names.size, 'inventory file count');
assert.equal(inventory.storedBytes, storedBytes, 'inventory byte total');
console.log(JSON.stringify({
  status: 'pass',
  scope: 'Evidence integrity only; this does not rerun or replace CI acceptance.',
  files: names.size,
  storedBytes,
  gzipFilesWithVerifiedOriginalBytes: decodedFiles,
  productSha256: inventory.productSha256,
  acceptedHead: inventory.acceptedHead,
  integratedCommit: inventory.integratedCommit
}, null, 2));
