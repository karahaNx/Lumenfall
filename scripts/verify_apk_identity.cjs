#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseArgs, main } = require('./lib/cli.cjs');
const { runProcess } = require('./lib/process.cjs');
const { entries } = require('./lib/zip.cjs');
class VerificationError extends Error {}
function normalizeSha256(value) {
  const normalized = (value || '').replace(/[^0-9a-f]/gi, '').toUpperCase();
  if (normalized.length !== 64) throw new VerificationError('certificate SHA-256 fingerprint is malformed');
  return normalized;
}
function formatSha256(value) { return normalizeSha256(value).match(/../g).join(':'); }
function validateApkFile(file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new VerificationError('APK is missing: ' + file);
  if (!fs.statSync(file).size) throw new VerificationError('APK is empty: ' + file);
  try { entries(fs.readFileSync(file)); } catch { throw new VerificationError('APK is not a readable ZIP/APK container: ' + file); }
}
function parseBadging(output) {
  const line = output.split(/\r?\n/).find(line => line.startsWith('package:'));
  if (!line) throw new VerificationError('aapt output did not contain a package line');
  const field = name => {
    const match = new RegExp("\\b" + name + "='([^']*)'").exec(line);
    if (!match) throw new VerificationError('aapt package line did not contain ' + name);
    return match[1];
  };
  return { package_id: field('name'), version_code: field('versionCode'), version_name: field('versionName') };
}
function parseCertificates(output) {
  const matches = [...output.matchAll(/certificate SHA-256 digest:\s*([0-9a-f:]+)/gi)];
  if (!matches.length) throw new VerificationError('apksigner output did not contain a certificate SHA-256 digest');
  const certificates = [...new Set(matches.map(match => normalizeSha256(match[1])))].sort();
  if (certificates.length !== 1) throw new VerificationError('APK contains multiple distinct signing certificate identities');
  return certificates;
}
function assertIdentity(metadata, certificates, expectedPackage, expectedCode, expectedName, expectedFingerprint) {
  const expected = normalizeSha256(expectedFingerprint);
  for (const [key, label, wanted] of [['package_id', 'package ID', expectedPackage], ['version_code', 'versionCode', String(expectedCode)], ['version_name', 'versionName', expectedName]]) {
    if (String(metadata[key]) !== wanted) throw new VerificationError(`${label} mismatch: expected ${wanted}, got ${metadata[key]}`);
  }
  if (certificates.length !== 1 || certificates[0] !== expected) throw new VerificationError('signing certificate mismatch: expected ' + formatSha256(expected) + ', got ' + certificates.map(formatSha256).join(', '));
}
async function runTool(command, label) {
  let result;
  try { result = await runProcess(command, { timeout: 120000 }); }
  catch (error) { throw new VerificationError(`${label} tool is unavailable: ${command[0]} (${error.code || error.message})`); }
  if (result.timed_out || result.exitcode !== 0) {
    const detail = (result.stderr || result.stdout || '').trim().slice(-1200);
    throw new VerificationError(`${label} failed with ${result.timed_out ? 'timeout' : 'exit code ' + result.exitcode}` + (detail ? ': ' + detail : ''));
  }
  return result.stdout + (result.stderr ? '\n' + result.stderr : '');
}
async function verifyApk(args) {
  validateApkFile(args.apk);
  const metadata = parseBadging(await runTool([args.aapt, 'dump', 'badging', args.apk], 'aapt'));
  const certificates = parseCertificates(await runTool([args.apksigner, 'verify', '--verbose', '--print-certs', args.apk], 'apksigner'));
  assertIdentity(metadata, certificates, args['expected-package'], args['expected-version-code'], args['expected-version-name'], args['expected-cert-sha256']);
  return { ...metadata, certificate_sha256: formatSha256(certificates[0]) };
}
function selfTest() {
  const cert = 'A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21';
  const metadata = parseBadging("package: name='com.lumenfall.app' versionCode='123' versionName='0.1.123' compileSdkVersion='35'\n");
  const certificates = parseCertificates('Signer #1 certificate SHA-256 digest: a91cbf3427d2ceb1cdbe07e5225f17d471b1829e52f7ab66497e754975ad3e21\n');
  assertIdentity(metadata, certificates, 'com.lumenfall.app', '123', '0.1.123', cert);
  const fail = fn => assert.throws(fn, VerificationError);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumenfall-apk-verify-selftest-'));
  try {
    fail(() => validateApkFile(path.join(root, 'missing.apk')));
    fs.writeFileSync(path.join(root, 'empty.apk'), ''); fail(() => validateApkFile(path.join(root, 'empty.apk')));
    fs.writeFileSync(path.join(root, 'invalid.apk'), 'not an apk'); fail(() => validateApkFile(path.join(root, 'invalid.apk')));
    // Empty but valid ZIP checks the positive container path without Android tools.
    fs.writeFileSync(path.join(root, 'container.apk'), Buffer.from('504b0506000000000000000000000000000000000000', 'hex'));
    validateApkFile(path.join(root, 'container.apk'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
  for (const [field, value] of [['package_id', 'com.example.wrong'], ['version_code', '124'], ['version_name', '9.9.9']]) fail(() => assertIdentity({ ...metadata, [field]: value }, certificates, 'com.lumenfall.app', '123', '0.1.123', cert));
  fail(() => assertIdentity(metadata, ['00'.repeat(32)], 'com.lumenfall.app', '123', '0.1.123', cert));
  fail(() => parseBadging('no package here')); fail(() => parseCertificates('Verified'));
  fail(() => parseCertificates('certificate SHA-256 digest: ' + '00'.repeat(32) + '\ncertificate SHA-256 digest: ' + '11'.repeat(32)));
  fail(() => normalizeSha256('bad'));
  console.log('APK identity verifier self-test passed: missing/invalid APK and all identity mismatch cases were rejected.');
}
module.exports = { verifyApk, selfTest, validateApkFile, assertIdentity, parseBadging, parseCertificates };
if (require.main === module) main(async () => {
  const values = ['--apk', '--aapt', '--apksigner', '--expected-package', '--expected-version-code', '--expected-version-name', '--expected-cert-sha256'];
  const args = parseArgs(process.argv.slice(2), values, ['--self-test']);
  if (args.positional.length) throw Error('Unexpected positional argument');
  if (args['self-test']) return selfTest();
  const missing = values.filter(name => !args[name.slice(2)]);
  if (missing.length) throw Error('missing required arguments: ' + missing.join(', '));
  const result = await verifyApk(args);
  console.log('Verified final APK identity:');
  console.log('  packageId: ' + result.package_id);
  console.log(`  versionCode: ${result.version_code} (expected ${args['expected-version-code']})`);
  console.log(`  versionName: ${result.version_name} (expected ${args['expected-version-name']})`);
  console.log('  certificate SHA-256: ' + result.certificate_sha256);
});
