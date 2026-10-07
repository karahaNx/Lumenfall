#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs, resolvePath, inside, hash, checkHash, json, main } = require('../lib/cli.cjs');
const { verifyZip } = require('../lib/zip.cjs');
const { deliveryPayload, verifiedSources } = require('../recovery/restore_candidate.cjs');
const { readPayload } = require('../recovery/restore_package.cjs');
const ROOT = resolvePath(path.join(__dirname, '../..'));
const RECOVERY = path.join(ROOT, 'docs/recovery/2026-10-07');
const CORE = path.join(ROOT, 'docs/handoffs/01_06/2026-10-07');
const GAMEPLAY = path.join(ROOT, 'docs/handoffs/02_08/2026-10-07');
const ARCHIVE = path.join(ROOT, 'archive/02_08-b2-runtime-2026-10-07');
const STARTUP = ['AGENTS.md', 'PROJECT_BOOTSTRAP.txt', 'docs/CHAT_OWNERSHIP.md', 'docs/agents/00_LEAD.md', 'docs/PROJECT_STATE.md'];
const REQUIRED = [...STARTUP, 'PROJECT_INSTRUCTIONS.txt', 'docs/CONTEXT_INDEX.md', 'docs/project/CODEX_START.md',
  'docs/project/KNOWN_ISSUES.md', 'docs/decisions/2026-10-07-codex-project-ready.md',
  'docs/project/SAVE_OFFLINE_AUTOASCEND_DIAGNOSE_2026-10-07.txt', 'scripts/codex/setup.sh', 'scripts/recovery/restore_candidate.cjs',
  'docs/recovery/2026-10-07/SOURCE_INDEX.txt', 'docs/handoffs/01_06/2026-10-07/SOURCE_INDEX.md',
  'docs/handoffs/02_08/2026-10-07/START_HER.txt', 'docs/handoffs/02_08/2026-10-07/Source_Index.txt',
  'docs/handoffs/02_08/2026-10-07/SUMMARY/identity.json', 'docs/handoffs/02_08/2026-10-07/SOURCE_SNAPSHOT_MANIFEST.json',
  'docs/qa/offline-autoascend-2026-10-07/Source_Index.txt', 'docs/qa/offline-autoascend-2026-10-07/reproduce.cjs'];
function checkStartup() {
  for (const name of REQUIRED) if (!fs.existsSync(path.join(ROOT, name)) || !fs.statSync(path.join(ROOT, name)).isFile()) throw Error('Missing entrypoint: ' + name);
  let links = 0;
  for (const name of [...STARTUP, 'README.md', 'docs/CONTEXT_INDEX.md', 'docs/project/CODEX_START.md', 'docs/project/KNOWN_ISSUES.md']) {
    const file = path.join(ROOT, name), text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|mailto:|#)/.test(match[1])) continue;
      const target = match[1].split('#')[0];
      if (!fs.existsSync(inside(path.dirname(file), target, ROOT))) throw Error(`Missing link in ${name}: ${target}`);
      links++;
    }
  }
  const size = STARTUP.reduce((sum, name) => sum + fs.statSync(path.join(ROOT, name)).size, 0);
  if (size > 32768) throw Error('Mandatory startup exceeds 32 KiB');
  console.log(`PASS: ${REQUIRED.length} entrypoints, ${links} local Markdown links, Lead startup ${size} bytes`);
}
function checkArchives() {
  let count = 0;
  for (const [name, row] of Object.entries(json(path.join(RECOVERY, 'MANIFEST.json')).payloads)) {
    const file = ['PROJECT_BOOTSTRAP.txt', 'PROJECT_INSTRUCTIONS.txt', 'scripts/recovery/restore_package.py'].includes(name)
      ? path.join(RECOVERY, 'publication_originals', name) : inside(ROOT, name);
    checkHash(fs.readFileSync(file), row, name); count++;
  }
  for (const root of [CORE, GAMEPLAY]) {
    const manifest = json(path.join(root, 'MANIFEST.json'));
    for (const [name, row] of Object.entries(root === GAMEPLAY ? manifest.payloads : manifest)) {
      checkHash(root === GAMEPLAY ? deliveryPayload(name) : fs.readFileSync(inside(root, name, ROOT)), row, name); count++;
    }
  }
  const manifest = json(path.join(ARCHIVE, 'archive-manifest.json'));
  const raw = Buffer.concat(manifest.parts.map(row => {
    const data = fs.readFileSync(inside(ROOT, row.path)); checkHash(data, row, row.path); count++; return data;
  }));
  checkHash(raw, { bytes: manifest.archive_bytes, sha256: manifest.archive_sha256 }, 'Gameplay original ZIP');
  const cache = new Map();
  for (const archive of json(path.join(RECOVERY, 'ARCHIVE_COVERAGE.json'))) {
    for (const row of archive.payloads) {
      if (!cache.has(row.repository_path)) {
        const data = readPayload(row.repository_path);
        cache.set(row.repository_path, { bytes: data.length, sha256: hash(data) });
      }
      const actual = cache.get(row.repository_path);
      if (actual.bytes !== row.bytes || actual.sha256 !== row.sha256) throw Error('Logical original mismatch: ' + row.repository_path);
      count++;
    }
  }
  const sources = verifiedSources(), qa = path.join(ROOT, 'docs/qa/offline-autoascend-2026-10-07');
  for (const [name, expected] of Object.entries(json(path.join(qa, 'SHA256.json')))) {
    if (hash(fs.readFileSync(inside(qa, name, ROOT))) !== expected) throw Error('Offline QA integrity mismatch: ' + name);
    count++;
  }
  verifyZip(fs.readFileSync(path.join(qa, 'Lumenfall_Save_Offline_AutoAscend_Evidens_2026-10-07.zip')));
  console.log(`PASS: ${count} archive/coverage checks; ${sources.payloads.length} sources, tree ${sources.manifest.tree}`);
}
module.exports = { checkStartup, checkArchives };
if (require.main === module) main(() => {
  const args = parseArgs(process.argv.slice(2), [], ['--archives']);
  if (args.positional.length) throw Error('Unexpected positional argument');
  checkStartup(); if (args.archives) checkArchives();
});
