#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const zlib = require('node:zlib');
const { main, inside, checkHash, hash } = require('../../scripts/lib/cli.cjs');
const { crc32, verifyZip } = require('../../scripts/lib/zip.cjs');
const { serve } = require('../../scripts/lib/static-server.cjs');
const { restore: restoreCandidate, verifiedSources } = require('../../scripts/recovery/restore_candidate.cjs');
const { restore: restorePackage } = require('../../scripts/recovery/restore_package.cjs');
const { verifyApk } = require('../../scripts/verify_apk_identity.cjs');
const { setVersion } = require('../../scripts/ci/set_android_version.cjs');
const { validate } = require('../../scripts/ci/validate_source.cjs');
const { installGuard, checkSmoke } = require('../../scripts/ci/smoke.cjs');
const ROOT = path.resolve(__dirname, '../..');
function zipPayload(payload, compressed) {
  const packed = compressed ? zlib.deflateRawSync(payload) : payload, name = Buffer.from('fixture');
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(compressed ? 8 : 0, 8);
  local.writeUInt32LE(crc32(payload), 14); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(payload.length, 22); local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50); central.writeUInt16LE(compressed ? 8 : 0, 10);
  central.writeUInt32LE(crc32(payload), 16); central.writeUInt32LE(packed.length, 20); central.writeUInt32LE(payload.length, 24); central.writeUInt16LE(name.length, 28);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12); end.writeUInt32LE(local.length + name.length + packed.length, 16);
  return Buffer.concat([local, name, packed, central, name, end]);
}
async function run() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lumenfall-node-tools-'));
  let server;
  try {
    const safe = path.join(temporary, 'safe'); fs.mkdirSync(safe);
    assert.throws(() => inside(safe, '../escape'), /Unsafe path/);
    fs.symlinkSync(os.tmpdir(), path.join(safe, 'link'));
    assert.throws(() => inside(safe, 'link/new/file'), /Unsafe path/);
    assert.throws(() => checkHash(Buffer.from('changed'), { bytes: 7, sha256: hash('original') }, 'control'), /Integrity mismatch/);
    for (const compressed of [false, true]) {
      const zip = zipPayload(Buffer.from('original payload'), compressed);
      assert.equal(verifyZip(zip).length, 1);
      const corrupt = Buffer.from(zip); corrupt[14] ^= 1; // Directory CRC controls acceptance, not an untrusted local CRC.
      const central = corrupt.indexOf(Buffer.from('504b0102', 'hex')); corrupt[central + 16] ^= 1;
      assert.throws(() => verifyZip(corrupt), /ZIP CRC\/size failed/);
      assert.throws(() => verifyZip(zip.subarray(0, -1)), /Missing ZIP directory/);
    }
    console.log('PASS archive integrity: stored/deflated ZIP CRC, truncation, hash and symlink escape controls');
    const destination = path.join(temporary, 'candidate');
    restoreCandidate([destination]);
    const { manifest, payloads } = verifiedSources();
    for (const [row, data] of payloads) {
      const target = path.join(destination, row.path);
      assert(fs.readFileSync(target).equals(data), 'Restored source bytes differ');
      assert.equal(fs.statSync(target).mode & 0o777, parseInt(row.mode.slice(-3), 8));
    }
    assert.throws(() => restoreCandidate([destination]), /new or empty/);
    assert.throws(() => restoreCandidate([path.join(ROOT, 'forbidden-restore')]), /outside the repository/);
    assert.throws(() => restoreCandidate([path.join(temporary, 'new'), '--evidence', path.join(temporary, 'new/evidence')]), /must be separate/);
    console.log('PASS candidate recovery: 96 exact files/modes, tree ' + manifest.tree + ', overwrite and overlap rejection');
    const coverage = require('../../docs/recovery/2026-10-07/ARCHIVE_COVERAGE.json');
    const archive = coverage.find(row => row.payloads.length === 66), packageDestination = path.join(temporary, 'package');
    restorePackage([archive.archive, packageDestination]);
    for (const row of archive.payloads) checkHash(fs.readFileSync(path.join(packageDestination, row.original_path)), row, row.original_path);
    assert.throws(() => restorePackage([archive.archive, packageDestination]), /new or empty/);
    console.log('PASS package recovery: ' + archive.payloads.length + ' byte-identical logical payloads');
    const apk = path.join(temporary, 'test.apk'); fs.writeFileSync(apk, zipPayload(Buffer.from('fixture'), true));
    const aapt = path.join(temporary, 'aapt'), signer = path.join(temporary, 'apksigner');
    const cert = 'A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21';
    function tool(file, args, stdout) {
      fs.writeFileSync(file, '#!/usr/bin/env node\n' + `require('node:assert/strict').deepEqual(process.argv.slice(2),${JSON.stringify(args)});console.log(${JSON.stringify(stdout)});\n`, { mode: 0o755 });
    }
    tool(aapt, ['dump', 'badging', apk], "package: name='com.lumenfall.app' versionCode='123' versionName='0.1.123'");
    tool(signer, ['verify', '--verbose', '--print-certs', apk], 'Signer #1 certificate SHA-256 digest: ' + cert);
    const args = { apk, aapt, apksigner: signer, 'expected-package': 'com.lumenfall.app', 'expected-version-code': '123', 'expected-version-name': '0.1.123', 'expected-cert-sha256': cert };
    assert.equal((await verifyApk(args)).certificate_sha256, cert);
    await assert.rejects(verifyApk({ ...args, 'expected-cert-sha256': '00'.repeat(32) }), /signing certificate mismatch/);
    fs.writeFileSync(signer, '#!/usr/bin/env node\nprocess.exit(7);\n', { mode: 0o755 });
    await assert.rejects(verifyApk(args), /apksigner failed with exit code 7/);
    console.log('PASS APK identity: real subprocess arguments, complete identity, wrong signer and tool failure rejection');
    const gradle = path.join(temporary, 'build.gradle');
    fs.writeFileSync(gradle, 'versionCode 1\nversionName "1.0"\n'); setVersion(gradle, '134');
    assert.equal(fs.readFileSync(gradle, 'utf8'), 'versionCode 134\nversionName "0.1.134"\n');
    for (const invalid of [undefined, 'NaN', '1.5', '-1', '0', '2100000001']) assert.throws(() => setVersion(gradle, invalid), /Invalid BUILD_NUMBER/);
    console.log('PASS Android version support: expected fields and invalid build-number rejection');
    const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), mutated = path.join(temporary, 'source.html');
    for (const change of [source.replace('id="settings-btn"', 'id="missing-settings-btn"'), source.replace('<head>', '<head><i id="settings-btn"></i>'), source.replace('<head>', '<head><script>var = broken;</script>')]) {
      fs.writeFileSync(mutated, change); await assert.rejects(validate(mutated), /QA failed/);
    }
    const dom = path.join(temporary, 'dom.html');
    const good = '<script id="ci-runtime-error-guard"></script><main class="rift-scroll-locked" data-zone-index="0"></main><div id="enemy-name">Enemy</div><div id="hud-lumen">0</div>';
    fs.writeFileSync(dom, good); checkSmoke(dom, null, true);
    for (const marker of ['uncaught-error', 'unhandled-rejection']) {
      fs.writeFileSync(dom, '<html data-ci-runtime-error="' + marker + '">' + good + '</html>');
      assert.throws(() => checkSmoke(dom, null, true), /Browser smoke test failed/);
    }
    fs.writeFileSync(mutated, source); installGuard(mutated);
    assert(fs.readFileSync(mutated, 'utf8').includes('id="ci-runtime-error-guard"'));
    console.log('PASS source/smoke gates: missing/duplicate IDs, syntax failure and runtime error rejection');
    fs.writeFileSync(path.join(safe, 'index.html'), 'served');
    server = await serve(safe);
    const base = 'http://127.0.0.1:' + server.address().port;
    assert.equal(await (await fetch(base + '/index.html')).text(), 'served');
    assert.equal((await fetch(base + '/link/escape')).status, 404);
    assert.equal((await fetch(base + '/%2e%2e%2fescape')).status, 404);
    console.log('PASS local server: real requests and traversal/symlink rejection');
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  console.log('Node tooling checks passed.');
}
if (require.main === module) main(run);
