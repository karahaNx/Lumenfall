/* Standalone F22 check: Node built-ins, real Chromium touch/keyboard input.
 * Run: node tests/behavioral/save-backup-ui.cjs --evidence <directory>
 * Optional causal controls: --mutant misplaced-backup | early-restore.
 * Intervals and the clock are controlled only in the test browser; application
 * handlers, validation, persistence, reload and CSS are the production bytes.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const http = require('node:http'), {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const repositoryRoot = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
function option(name, fallback) {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
}
const root = path.resolve(option('--web-root', repositoryRoot));
const quiet = args.includes('--quiet');
const evidence = path.resolve(option('--evidence', path.join(os.tmpdir(), 'lumenfall-save-ui-evidence')));
const mutant = option('--mutant', null);
const chrome = option('--chrome', process.env.LUMENFALL_QA_CDP_CHROME || 'chromium');
let source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (mutant === 'early-restore') {
  const marker = "addEventListener('click', requestSaveRestore)";
  assert(source.includes(marker), 'confirmation handler mutation anchor');
  source = source.replace(marker, "addEventListener('click', restoreSaveBackup)");
} else if (mutant === 'misplaced-backup') {
  const match = source.match(/        <button type="button" class="settings-row" id="save-backup-btn">[\s\S]*?<\/button>\n/);
  assert(match, 'backup placement mutation anchor');
  source = source.replace(match[0], '').replace('        <div class="settings-menu">', '        <div class="settings-menu">\n' + match[0]);
} else if (mutant !== null) throw Error('Unknown mutant: ' + mutant);
fs.mkdirSync(evidence, {recursive: true});
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures.json'), 'utf8'));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lumenfall-save-ui-'));
const records = [];
let browser, browserClosed = false, browserCompletion, server, session;
let sequence = 0, buffer = '', stderr = '';
const pending = new Map();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, sid = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 10000);
    pending.set(id, {resolve, reject, timer});
    browser.stdio[3].write(JSON.stringify({id, method, params, ...(sid ? {sessionId: sid} : {})}) + '\0');
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await evaluate(expression).catch(() => false)) return;
    await delay(25);
  }
  throw Error('Condition timeout: ' + expression);
}
async function key(name, modifiers = 0) {
  const code = {Tab: 9, Enter: 13, Escape: 27, Space: 32}[name];
  const spec = {key: name === 'Space' ? ' ' : name, code: name, windowsVirtualKeyCode: code, modifiers};
  await send('Input.dispatchKeyEvent', {type: name==='Enter' ? 'keyDown' : 'rawKeyDown', ...spec, ...(name==='Enter' ? {text:'\r'} : {})});
  await send('Input.dispatchKeyEvent', {type: 'keyUp', ...spec});
}
async function tap(id) {
  const r = await evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};})()`);
  assert(r.w >= 44 && r.h >= 44, id + ': minimum 44px touch target');
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: r.x, y: r.y}]});
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}
async function focus(id) {
  await evaluate(`document.getElementById(${JSON.stringify(id)}).focus()`);
}
async function paste(text) {
  await evaluate("document.getElementById('save-backup-code').value='';document.getElementById('save-backup-code').focus()");
  await send('Input.insertText', {text});
}
async function snapshot() {
  return evaluate(`(()=>{const code=document.getElementById('save-backup-code');return {
    primary:localStorage.getItem('lumenfall_save_v2'),recovery:localStorage.getItem('lumenfall_save_recovery_v1'),
    reset:localStorage.getItem('lumenfall_reset_pending_v1'),focus:document.activeElement.id,
    confirmation:getComputedStyle(document.getElementById('save-restore-confirm')).display!=='none',
    resetConfirmation:getComputedStyle(document.getElementById('reset-confirm-row')).display!=='none',
    code:code.value,disabled:code.disabled,selection:[code.selectionStart,code.selectionEnd],errors:window.__saveUiTest.errors
  };})()`);
}
function unchanged(before, after, message) {
  assert.equal(after.primary, before.primary, message + ': primary');
  assert.equal(after.recovery, before.recovery, message + ': recovery');
  assert.equal(after.reset, null, message + ': no reset marker');
}
function luminance(rgb) {
  return rgb.map(v => {v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;})
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
}
function ratio(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
async function layout(ids) {
  const rows = await evaluate(`(${function(ids) {
    return ids.map(id => {
      const el = document.getElementById(id), css = getComputedStyle(el), r = el.getBoundingClientRect();
      return {id, width: r.width, height: r.height, fits: el.scrollWidth <= el.clientWidth + 1,
        inside: r.left >= 0 && r.right <= innerWidth + 1, color: css.color,
        background: css.backgroundColor, outline: css.outlineColor, outlineWidth: css.outlineWidth};
    });
  }})( ${JSON.stringify(ids)} )`);
  for (const row of rows) {
    assert(row.width >= 44 && row.height >= 44, row.id + ': 44px');
    assert(row.fits && row.inside, row.id + ': no clipped label or horizontal overflow');
  }
  return rows;
}
async function screenshot(name) {
  const shot = await send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(evidence, name + '.png'), Buffer.from(shot.data, 'base64'));
}
function startupScript() {
  return `(${function(fixtures) {
    const realDate = Date, clock = new realDate(2035, 0, 15, 12).getTime();
    window.__saveUiTest = {errors: [], clock, paused: true};
    class TestDate extends realDate {
      constructor(...args) { super(...(args.length ? args : [window.__saveUiTest.clock])); }
      static now() { return window.__saveUiTest.clock; }
    }
    window.Date = TestDate;
    const realInterval = window.setInterval;
    window.setInterval = (fn, ms, ...rest) => realInterval(() => {
      if (!window.__saveUiTest.paused) {window.__saveUiTest.clock += ms; fn(...rest);}
    }, ms);
    window.addEventListener('error', e => window.__saveUiTest.errors.push(e.message));
    window.addEventListener('unhandledrejection', e => window.__saveUiTest.errors.push(String(e.reason)));
    function materialize(value) {
      if (value === '__NOW__') return clock;
      if (value === '__TODAY__') return '2035-01-15';
      if (Array.isArray(value)) return value.map(materialize);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, materialize(v)]));
      return value;
    }
    window.__saveUiTest.fixtures = materialize(fixtures);
    if (!localStorage.getItem('save_ui_seeded')) {
      localStorage.setItem('lumenfall_save_v2', JSON.stringify(window.__saveUiTest.fixtures['mid-game'].save));
      localStorage.setItem('lumenfall_startup_intro_last', String(clock));
      localStorage.setItem('save_ui_seeded', '1');
    }
  }})( ${JSON.stringify(fixtures)} );`;
}
async function runProfile(base, width, height, scale, motion) {
  const context = await send('Target.createBrowserContext', {}, null);
  const target = await send('Target.createTarget', {url: 'about:blank', browserContextId: context.browserContextId}, null);
  session = (await send('Target.attachToTarget', {targetId: target.targetId, flatten: true}, null)).sessionId;
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: true});
  await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: motion}]});
  await send('Page.addScriptToEvaluateOnNewDocument', {source: startupScript()});
  await send('Page.navigate', {url: base + '/index.html'});
  await until("document.querySelector('[data-zone-index]') && document.getElementById('settings-btn') && getComputedStyle(document.getElementById('startup-intro')).display==='none'");
  if (await evaluate("document.getElementById('daily-overlay').style.display!=='none'")) await tap('daily-claim');
  await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(scale * 16 + 'px')}`);
  await tap('settings-btn');
  const name = width + 'x' + height + '-' + scale + 'x-' + motion;
  const placement = await evaluate(`(()=>{const b=document.getElementById('save-backup-btn'),sections=Array.from(document.querySelectorAll('#settings-home .settings-section-title'));return {
    outsideTopMenu:!b.closest('.settings-menu'),inSave:sections.find(e=>e.textContent==='Save').nextElementSibling===b,
    nextIsReset:b.nextElementSibling.id==='reset-row'};})()`);
  assert(placement.outsideTopMenu && placement.inSave && placement.nextIsReset, 'Backup is under Save immediately before separate Reset');
  await focus('save-backup-btn');
  await key('Tab');
  assert.equal((await snapshot()).focus, 'reset-btn', 'keyboard order: Backup then Reset');
  const home = await layout(['save-backup-btn', 'reset-btn', 'settings-close']);
  if (width === 320) {await focus('save-backup-btn'); await screenshot(name + '-save');}
  const before = await snapshot();
  await tap('save-backup-btn');
  const opened = await snapshot();
  unchanged(before, opened, 'opening Backup preserves save');
  assert(!opened.resetConfirmation && !opened.confirmation, 'opening Backup opens neither destructive confirmation');
  assert.deepEqual(JSON.parse(decodeURIComponent(opened.code.slice('LUMENFALL1:'.length))), JSON.parse(opened.primary), 'export contains the complete current canonical save');
  const backup = await layout(['copy-save-backup', 'restore-save-backup', 'settings-back', 'settings-close']);
  // Exercise success and WebView60 fallback paths without relying on host clipboard permissions.
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:code=>{window.__saveUiTest.copied=code;return Promise.resolve();}}})");
  await tap('copy-save-backup');
  assert.equal(await evaluate('window.__saveUiTest.copied'), (await snapshot()).code, 'clipboard success receives full export');
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});document.execCommand=()=>false");
  await tap('copy-save-backup');
  const selected = await snapshot();
  assert.deepEqual(selected.selection, [0, selected.code.length], 'clipboard unavailable: whole code selected for manual copy');
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('denied'))}})");
  await tap('copy-save-backup');
  assert.deepEqual((await snapshot()).selection, [0, selected.code.length], 'clipboard rejection: whole code remains copyable');
  const valid = await evaluate("'LUMENFALL1:'+encodeURIComponent(JSON.stringify({...window.__saveUiTest.fixtures['restore-target'].save,lastSeen:Date.now()-8*3600000,totalOfflineSeconds:1234}))");
  const future = await evaluate("'LUMENFALL1:'+encodeURIComponent(JSON.stringify(window.__saveUiTest.fixtures['future-schema'].save))");
  for (const code of ['bad-prefix', 'LUMENFALL1:%broken', 'LUMENFALL1:%7B%22depth%22%3A5%7D', future]) {
    const current = await snapshot();
    await paste(code); await tap('restore-save-backup');
    const rejected = await snapshot();
    unchanged(current, rejected, 'invalid/unsupported code rejected');
    assert(!rejected.confirmation && !rejected.disabled, 'rejected code remains editable with no restore confirmation');
  }
  await paste(valid);
  const original = await snapshot();
  await focus('restore-save-backup'); await key('Enter');
  const requested = await snapshot();
  unchanged(original, requested, 'Restore request waits for confirmation');
  assert(requested.confirmation && requested.disabled && requested.focus === 'save-restore-cancel', 'valid Restore focuses safe Cancel and locks validated input: ' + JSON.stringify({confirmation:requested.confirmation,disabled:requested.disabled,focus:requested.focus,codeLength:requested.code.length,errors:requested.errors}));
  const confirm = await layout(['save-restore-cancel', 'save-restore-confirm-btn']);
  await key('Tab');
  assert.equal((await snapshot()).focus, 'save-restore-confirm-btn', 'confirmation keyboard order');
  assert(await evaluate("getComputedStyle(document.activeElement).outlineStyle!=='none'"), 'keyboard focus remains visible');
  await key('Tab');
  assert.equal((await snapshot()).focus, 'settings-back', 'focus stays in settings dialog');
  if (width === 320) {await focus('save-restore-cancel'); await screenshot(name + '-confirm');}
  await tap('save-restore-cancel');
  const cancelled = await snapshot();
  unchanged(original, cancelled, 'Cancel Restore');
  assert(!cancelled.confirmation && !cancelled.disabled && cancelled.focus === 'restore-save-backup', 'Cancel returns focus and editable code');
  await tap('restore-save-backup'); await tap('settings-back');
  assert.equal((await snapshot()).focus, 'save-backup-btn', 'Back returns focus to Backup in Save');
  unchanged(original, await snapshot(), 'Back cancels pending Restore');
  await tap('save-backup-btn');
  assert(!(await snapshot()).confirmation, 'reopening has no stale pending Restore');
  await paste(valid); await tap('restore-save-backup'); await key('Escape');
  assert.equal((await snapshot()).focus, 'settings-btn', 'Escape closes settings and restores opener focus');
  unchanged(original, await snapshot(), 'Escape cancels pending Restore');
  await tap('settings-btn'); await tap('save-backup-btn');
  await paste(valid); await tap('restore-save-backup'); await tap('settings-close');
  unchanged(original, await snapshot(), 'Close cancels pending Restore');
  assert.equal((await snapshot()).focus, 'settings-btn', 'Close restores opener focus');
  await tap('settings-btn'); await tap('reset-btn');
  const resetPrompt = await snapshot();
  unchanged(original, resetPrompt, 'Reset request waits for its own confirmation');
  assert(resetPrompt.resetConfirmation && !resetPrompt.confirmation, 'Reset and Restore have separate prompts');
  await tap('reset-cancel-btn');
  unchanged(original, await snapshot(), 'Cancel Reset preserves save');
  await tap('save-backup-btn'); await paste(valid); await tap('restore-save-backup');
  // Storage failure must also leave the previous primary/recovery retryable.
  await evaluate("window.__saveUiTest.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='lumenfall_save_v2')throw Error('test write failure');return window.__saveUiTest.originalSetItem.call(this,k,v)}");
  await tap('save-restore-confirm-btn');
  unchanged(original, await snapshot(), 'failed primary write rolls recovery back');
  await evaluate('Storage.prototype.setItem=window.__saveUiTest.originalSetItem');
  await tap('restore-save-backup');
  const confirmedAt = await evaluate('Date.now()');
  await focus('save-restore-confirm-btn'); await key('Space');
  await until("document.getElementById('settings-overlay').style.display==='none' && JSON.parse(localStorage.getItem('lumenfall_save_v2')).depth===33 && !document.body.classList.contains('app-paused')");
  const restored = await snapshot(), state = JSON.parse(restored.primary);
  assert.equal(state.lumen, 777777, 'confirmed replacement survives reload');
  assert.equal(state.prisms, 31, 'restore currency preserved');
  assert.deepEqual(state.activeParty, ['ember', 'void'], 'restore party preserved');
  assert.equal(state.totalOfflineSeconds, 1234, 'old backup does not grant another eight offline hours');
  assert.equal(state.lastSeen, confirmedAt, 'restore starts at confirmation time');
  assert.equal(restored.primary, restored.recovery, 'restored primary/recovery agree');
  assert.deepEqual(restored.errors, [], 'no uncaught errors/rejections');
  // Full Reset still requires its own explicit action after Restore.
  await tap('settings-btn'); await tap('reset-btn'); await tap('reset-confirm-btn');
  await until("localStorage.getItem('lumenfall_reset_pending_v1')===null && JSON.parse(localStorage.getItem('lumenfall_save_v2')||'null')?.depth===1");
  const reset = JSON.parse((await snapshot()).primary);
  assert.equal(reset.lumen, 0, 'confirmed Reset clears currency');
  assert.equal(reset.prisms, 0, 'confirmed Reset clears Prisms');
  // Known backgrounds: flat action panel and brighter endpoints of existing gradients.
  const styles = await evaluate(`(()=>{const css=s=>getComputedStyle(document.querySelector(s));return {
    rowBackground:css('#save-backup-btn').backgroundImage,
    title:css('#save-backup-btn .settings-row-title').color,sub:css('#save-backup-btn .settings-row-sub').color,
    copy:css('#copy-save-backup').color,restore:css('#save-restore-confirm-btn').color,
    actionBackground:css('#copy-save-backup').backgroundColor,note:css('#save-restore-warning').color
  };})()`);
  const rgb = color => color.match(/[\d.]+/g).slice(0,3).map(Number);
  // Assert the gradient assumption, then use measured text/action colors.
  assert(styles.rowBackground.includes('rgb(37, 50, 75)') && styles.rowBackground.includes('rgb(23, 34, 56)'), 'known row gradient endpoints');
  const contrast = [ratio(rgb(styles.title), [37, 50, 75]), ratio(rgb(styles.sub), [37, 50, 75]),
    ratio(rgb(styles.copy), rgb(styles.actionBackground)), ratio(rgb(styles.restore), rgb(styles.actionBackground)),
    ratio(rgb(styles.note), [43, 45, 70])];
  assert(contrast.every(value => value >= 4.5), 'save/restore text contrast >=4.5:1');
  records.push({name, placement, home, backup, confirm, contrast, restored: {depth: state.depth, lumen: state.lumen, totalOfflineSeconds: state.totalOfflineSeconds}, reset: {depth: reset.depth, lumen: reset.lumen}});
  if (!quiet) console.log('PASS ' + name);
  await send('Target.disposeBrowserContext', {browserContextId: context.browserContextId}, null);
  session = undefined;
}
async function teardown() {
  if (browser && !browserClosed) {
    await send('Browser.close', {}, null).catch(() => {});
    await Promise.race([browserCompletion, delay(5000)]);
    if (!browserClosed) {browser.kill('SIGKILL'); await browserCompletion; throw Error('Browser required forced termination');}
  }
  if (server) await new Promise(resolve => server.close(resolve));
  fs.rmSync(profile, {recursive: true, force: true, maxRetries: 3, retryDelay: 100});
}
(async () => {
  let result;
  try {
    server = http.createServer((req, res) => {
      const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!file.startsWith(root + path.sep)) {res.writeHead(403); res.end(); return;}
      try {
        const data = file === path.join(root, 'index.html') ? source : fs.readFileSync(file);
        res.setHeader('Content-Type', {'.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream');
        res.end(data);
      } catch (_) {res.writeHead(404); res.end();}
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-pipe', '--user-data-dir=' + profile, 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});
    browserCompletion = new Promise((resolve, reject) => {
      browser.once('error', reject);
      browser.once('close', (code, signal) => {
        browserClosed = true;
        for (const request of pending.values()) {clearTimeout(request.timer); request.reject(Error('Browser closed'));}
        pending.clear(); resolve({code, signal});
      });
    });
    browser.stderr.on('data', data => {stderr = (stderr + data).slice(-4000);});
    browser.stdio[4].on('data', data => {
      buffer += data;
      let at;
      while ((at = buffer.indexOf('\0')) >= 0) {
        const raw = buffer.slice(0, at); buffer = buffer.slice(at + 1);
        if (!raw) continue;
        const message = JSON.parse(raw), request = pending.get(message.id);
        if (!request) continue;
        pending.delete(message.id); clearTimeout(request.timer);
        if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
      }
    });
    const version = await send('Browser.getVersion', {}, null);
    const base = 'http://127.0.0.1:' + server.address().port;
    for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) {
      for (const scale of [1, 2]) for (const motion of ['no-preference', 'reduce']) await runProfile(base, width, height, scale, motion);
    }
    result = {status: 'pass', mutant, version, records};
  } catch (error) {
    result = {status: 'fail', mutant, message: error.message, stack: error.stack, stderr, records};
    process.exitCode = 1;
  }
  try {await teardown();} catch (error) {result.status = 'fail'; result.teardown = error.message; process.exitCode = 1;}
  fs.writeFileSync(path.join(evidence, 'ui-result.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({status: result.status, profiles: records.length, mutant, message: result.message}));
})();
