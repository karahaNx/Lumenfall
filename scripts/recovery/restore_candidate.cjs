#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs, resolvePath, isInside, inside, hash, checkHash, json, emptyDestination, main } = require('../lib/cli.cjs');
const ROOT = resolvePath(path.join(__dirname, '../..'));
const SNAPSHOT = path.join(ROOT, 'docs/handoffs/02_08/2026-10-07');

function deliveryPayload(name) {
  const file = inside(SNAPSHOT, name);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return fs.readFileSync(file);
  const metadata = json(file + '.parts/PARTS.json');
  const data = Buffer.concat(metadata.parts.map(row => {
    const part = fs.readFileSync(inside(SNAPSHOT, row.path));
    checkHash(part, row, row.path);
    return part;
  }));
  checkHash(data, metadata, name);
  return data;
}
function verifiedSources() {
  const manifest = json(path.join(SNAPSHOT, 'SOURCE_SNAPSHOT_MANIFEST.json'));
  const seen = new Set(), tree = new Map();
  const payloads = manifest.source.map(row => {
    const parts = row.path.split('/');
    if (path.isAbsolute(row.path) || parts.includes('..') || parts.includes('')) throw Error('Unsafe snapshot path');
    if (seen.has(row.path) || !['100644', '100755'].includes(row.mode)) throw Error('Duplicate path or unsupported file mode');
    seen.add(row.path);
    const data = fs.readFileSync(inside(SNAPSHOT, row.snapshot_path));
    checkHash(data, row, row.path);
    if (hash(Buffer.concat([Buffer.from('blob ' + data.length + '\0'), data]), 'sha1') !== row.gitblob) throw Error('Source Git blob failed: ' + row.path);
    let node = tree;
    for (const part of parts.slice(0, -1)) {
      if (!node.has(part)) node.set(part, new Map());
      node = node.get(part);
      if (!(node instanceof Map)) throw Error('Conflicting tree path');
    }
    if (node.has(parts.at(-1))) throw Error('Conflicting tree entry');
    node.set(parts.at(-1), { mode: row.mode, sha: row.gitblob });
    return [row, data];
  });
  function treeHash(node) {
    const sorted = [...node].sort((a, b) => Buffer.compare(Buffer.from(a[0] + (a[1] instanceof Map ? '/' : '')), Buffer.from(b[0] + (b[1] instanceof Map ? '/' : ''))));
    const raw = Buffer.concat(sorted.map(([name, value]) => {
      const directory = value instanceof Map;
      return Buffer.concat([Buffer.from((directory ? '40000' : value.mode) + ' ' + name + '\0'), Buffer.from(directory ? treeHash(value) : value.sha, 'hex')]);
    }));
    return hash(Buffer.concat([Buffer.from('tree ' + raw.length + '\0'), raw]), 'sha1');
  }
  const actual = treeHash(tree);
  if (actual !== manifest.tree || payloads.length !== 96) throw Error('Candidate tree/file count mismatch: ' + actual);
  return { manifest, payloads };
}
function restore(argv) {
  const args = parseArgs(argv, ['--evidence']);
  if (args.positional.length !== 1) throw Error('Usage: node scripts/recovery/restore_candidate.cjs DESTINATION [--evidence DIRECTORY]');
  const destination = resolvePath(args.positional[0]);
  if (isInside(ROOT, destination)) throw Error('Use a separate directory outside the repository');
  emptyDestination(destination);
  const { manifest, payloads } = verifiedSources();
  const evidence = args.evidence ? resolvePath(args.evidence) : null;
  const originals = [];
  if (evidence) {
    if (isInside(ROOT, evidence) || isInside(destination, evidence) || isInside(evidence, destination)) throw Error('Evidence directory must be separate from source and repository');
    emptyDestination(evidence);
    for (const [name, row] of Object.entries(json(path.join(SNAPSHOT, 'MANIFEST.json')).payloads)) {
      const data = deliveryPayload(name);
      checkHash(data, row, name);
      originals.push([name, data]);
    }
  }
  fs.mkdirSync(destination, { recursive: true });
  for (const [row, data] of payloads) {
    const target = inside(destination, row.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data, { mode: parseInt(row.mode.slice(-3), 8) });
    fs.chmodSync(target, parseInt(row.mode.slice(-3), 8));
  }
  console.log(`PASS: restored ${payloads.length} files; tree ${manifest.tree} to ${destination}`);
  if (evidence) {
    fs.mkdirSync(evidence, { recursive: true });
    for (const [name, data] of originals) {
      const target = inside(evidence, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, data);
    }
    fs.copyFileSync(path.join(SNAPSHOT, 'MANIFEST.json'), path.join(evidence, 'MANIFEST.json'));
    console.log(`PASS: restored ${originals.length} original delivery payloads and manifest to ${evidence}`);
  }
}
module.exports = { deliveryPayload, verifiedSources, restore };
if (require.main === module) main(() => restore(process.argv.slice(2)));
