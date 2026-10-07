#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { main } = require('../lib/cli.cjs');
const { runProcess } = require('../lib/process.cjs');
const { required_ids: requiredIds, forbidden, required_features: requiredFeatures } = require('./source-contract.json');
async function validate(file = 'index.html') {
  const src = fs.readFileSync(file, 'utf8');
  const allIds = [...src.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const idSet = new Set(allIds), duplicates = [...idSet].filter(id => allIds.filter(value => value === id).length > 1).sort();
  if (duplicates.length) throw Error('QA failed: duplicate HTML ids: ' + JSON.stringify(duplicates));
  for (const id of requiredIds) {
    const count = allIds.filter(value => value === id).length;
    if (count !== 1) throw Error(`QA failed: id=${JSON.stringify(id)} occurs ${count} times`);
  }
  const missingRefs = [...new Set([...src.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(match => match[1]))].filter(id => !idSet.has(id)).sort();
  if (missingRefs.length) throw Error('QA failed: getElementById references missing from HTML: ' + JSON.stringify(missingRefs));
  const cache = /function cacheEls\(\)\{(.*?)\n\}/s.exec(src);
  if (!cache) throw Error('QA failed: cacheEls() not found');
  const stale = [...new Set([...cache[1].matchAll(/'([^']+)'/g)].map(match => match[1]))].filter(id => !idSet.has(id)).sort();
  if (stale.length) throw Error('QA failed: cacheEls references missing from HTML: ' + JSON.stringify(stale));
  for (const token of forbidden) if (src.includes(token)) throw Error('QA failed: forbidden legacy token remains: ' + token);
  const scripts = [...src.matchAll(/<script(?:\s[^>]*)?>(.*?)<\/script>/gs)].map(match => match[1]);
  if (!scripts.length) throw Error('QA failed: no inline JavaScript found');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lumenfall-source-'));
  try {
    for (const [i, code] of scripts.entries()) {
      const file = path.join(directory, 'script-' + (i + 1) + '.js'); fs.writeFileSync(file, code);
      const result = await runProcess([process.execPath, '--check', file]);
      if (result.timed_out || result.exitcode !== 0) {
        console.log(result.stdout); console.error(result.stderr); throw Error('QA failed: inline script ' + (i + 1) + ' has a syntax error');
      }
    }
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
  for (const token of requiredFeatures) if (!src.includes(token)) throw Error('QA failed: required feature missing: ' + token);
  const restore = /function restoreSaveBackup\(\)\{(.*?)\n\}/s.exec(src);
  if (!restore || !restore[1].includes('reloadInProgress = true;')) throw Error('QA failed: save restore is not protected from reload/autosave overwrite');
  if (!src.includes('function tick(){\n  if(document.hidden || resetInProgress || reloadInProgress) return;')) throw Error('QA failed: game loop is not suspended during reset/restore reload');
  if (!src.includes('renderRiftMode();\n  renderRiftObjective();')) throw Error('QA failed: expected Rift fast-render path changed');
  const riftMode = /function renderRiftMode\(\)\{(.*?)\n\}/s.exec(src);
  if (riftMode && riftMode[1].includes('syncMainScrollMode')) throw Error('QA failed: scroll sync regressed into the 100ms Rift render loop');
  console.log(`QA passed: ${scripts.length} scripts syntax-checked, ${requiredIds.length} unique IDs verified, cache/state lifecycle guards present.`);
}
module.exports = { validate };
if (require.main === module) main(() => {
  if (process.argv.length > 3) throw Error('Usage: node scripts/ci/validate_source.cjs [HTML]');
  return validate(process.argv[2]);
});
