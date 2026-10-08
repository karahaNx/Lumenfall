#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs, resolvePath, inside, checkHash, json, emptyDestination, main } = require('../lib/cli.cjs');
const ROOT = resolvePath(path.join(__dirname, '../..'));
function readPayload(repositoryPath) {
  // This frozen coverage map points to the former active helper. Its original
  // bytes now live with publication originals; the manifest itself stays intact.
  if (repositoryPath === 'scripts/recovery/restore_package.py') {
    return fs.readFileSync(path.join(ROOT, 'docs/recovery/2026-10-07/publication_originals', repositoryPath));
  }
  const file = inside(ROOT, repositoryPath);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return fs.readFileSync(file);
  const metadata = json(file + '.parts/PARTS.json');
  const data = Buffer.concat(metadata.parts.map(row => {
    const part = fs.readFileSync(inside(ROOT, row.path));
    checkHash(part, row, row.path);
    return part;
  }));
  checkHash(data, metadata, repositoryPath);
  return data;
}
function restore(argv) {
  const args = parseArgs(argv);
  if (args.positional.length !== 2) throw Error('Usage: node scripts/recovery/restore_package.cjs ARCHIVE DESTINATION');
  const coverage = json(path.join(ROOT, 'docs/recovery/2026-10-07/ARCHIVE_COVERAGE.json'));
  const matches = coverage.filter(row => row.archive === args.positional[0]);
  if (matches.length !== 1) throw Error('Expected one archive match');
  const destination = resolvePath(args.positional[1]);
  emptyDestination(destination);
  const payloads = matches[0].payloads.map(row => {
    const target = inside(destination, row.original_path), data = readPayload(row.repository_path);
    checkHash(data, row, row.original_path);
    return [target, data];
  });
  fs.mkdirSync(destination, { recursive: true });
  for (const [target, data] of payloads) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
  console.log(`Restored ${payloads.length} verified payloads to ${destination}`);
}
module.exports = { readPayload, restore };
if (require.main === module) main(() => restore(process.argv.slice(2)));
