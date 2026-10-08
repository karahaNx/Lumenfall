#!/usr/bin/env node
/* Supplemental transport for this local baseline analysis. run.py and every
 * scenario/assertion remain unchanged. Original CLI timeouts are retained.
 * Select via a temporary PATH symlink named google-chrome, only for dump-dom.
 * This is not a production browser or a replacement CI gate.
 */
'use strict';
const {spawn, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const chrome = '/usr/bin/chromium';
const args = process.argv.slice(2);
if (args.includes('--version')) {
  const r = spawnSync(chrome, args, {stdio:'inherit'});
  process.exit(r.error ? 1 : r.status === null ? 1 : r.status);
}
if (!args.includes('--dump-dom')) {
  process.stderr.write('Supplemental CDP adapter only supports --version and --dump-dom\n');
  process.exit(2);
}
const url = args.find(a => /^https?:\/\//.test(a));
if (!url || !/^http:\/\/127\.0\.0\.1:\d+\//.test(url)) {
  process.stderr.write('Expected the local behavioral harness URL\n');
  process.exit(2);
}
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'swift-baseline-cdp-'));
const browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu',
  '--disable-dev-shm-usage', '--remote-debugging-pipe', '--user-data-dir=' + profile, 'about:blank'],
  {stdio:['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});
let seq = 0, buffer = '', session, stderr = '', closed = false;
const pending = new Map();
const completion = new Promise(resolve => browser.once('close', (code, signal) => {
  closed = true;
  for (const p of pending.values()) {clearTimeout(p.timer); p.reject(Error('Browser closed: ' + p.method));}
  pending.clear();
  resolve({code, signal});
}));
browser.stderr.on('data', data => {stderr += data.toString();});
browser.on('error', error => {
  for (const p of pending.values()) {clearTimeout(p.timer); p.reject(error);}
  pending.clear();
});
browser.stdio[4].on('data', data => {
  buffer += data.toString();
  let at;
  while ((at = buffer.indexOf('\0')) >= 0) {
    const raw = buffer.slice(0, at); buffer = buffer.slice(at + 1);
    if (!raw) continue;
    const value = JSON.parse(raw), p = pending.get(value.id);
    if (!p) continue;
    pending.delete(value.id); clearTimeout(p.timer);
    if (value.error) p.reject(Error(JSON.stringify(value.error))); else p.resolve(value.result);
  }
});
for (const pipe of [browser.stdio[3], browser.stdio[4]]) pipe.on('error', error => {
  for (const p of pending.values()) {clearTimeout(p.timer); p.reject(error);}
  pending.clear();
});
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const timer = setTimeout(() => {pending.delete(id); reject(Error('CDP timeout: ' + method));}, 4000);
    pending.set(id, {resolve, reject, timer, method});
    browser.stdio[3].write(JSON.stringify({id, method, params, ...(target ? {sessionId:target} : {})}) + '\0');
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function teardown() {
  if (!closed) {
    try {await send('Browser.close', {}, null);} catch (error) {if (!closed) throw error;}
  }
  let timer;
  const result = await Promise.race([completion, new Promise((_, reject) => {
    timer = setTimeout(() => {browser.kill('SIGKILL'); reject(Error('Browser teardown timeout'));}, 3000);
  })]).finally(() => clearTimeout(timer));
  if (result.code !== 0 || result.signal) throw Error('Unexpected browser completion ' + JSON.stringify(result));
  fs.rmSync(profile, {recursive:true, force:true});
}
(async () => {
  let failed = false;
  try {
    const tab = await send('Target.createTarget', {url:'about:blank'}, null);
    session = (await send('Target.attachToTarget', {targetId:tab.targetId, flatten:true}, null)).sessionId;
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {width:390, height:844, deviceScaleFactor:1, mobile:true});
    if (args.includes('--force-prefers-reduced-motion')) {
      await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'reduce'}]});
    }
    await send('Page.navigate', {url});
    const deadline = Date.now() + 18000;
    let status;
    do {
      try {
        status = await evaluate('document.querySelector("#qa-result")?.getAttribute("data-status")');
      } catch (error) {
        // Persist/restore scenarios intentionally reload. Retry only these CDP
        // navigation errors; scenario exceptions and runtime markers still fail.
        if (!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context with specified id/.test(error.message)) throw error;
        status = undefined;
      }
      if (status === 'pass' || status === 'fail') break;
      await delay(40);
    } while (Date.now() < deadline);
    const dom = await evaluate('document.documentElement.outerHTML');
    process.stdout.write(dom + '\n');
    if (status !== 'pass' && status !== 'fail') throw Error('No completed QA result within CDP deadline');
    // run.py, unchanged, verifies JSON completeness, scenario and runtime errors.
    process.stderr.write('Supplemental transport: Chromium CDP; unchanged assertions; no virtual-time CLI\n');
  } catch (error) {
    failed = true; process.stderr.write(error.stack + '\n');
  }
  try {await teardown();} catch (error) {failed = true; process.stderr.write(error.stack + '\n');}
  if (failed) {process.stderr.write(stderr); process.exitCode = 1;}
})().catch(error => {browser.kill('SIGKILL'); process.stderr.write(error.stack + '\n'); process.exitCode = 1;});
