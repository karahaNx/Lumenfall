/* Isolated F24 browser checks. Node built-ins only; no product test hooks.
 * node tests/behavioral/rift-cosmetics.cjs --out /tmp/rift-cosmetics-evidence
 * --source /path/to/baseline/index.html --baseline captures the same fixtures.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {spawn, spawnSync} = require('node:child_process');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
function option(name, fallback) { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; }
const root = path.resolve(__dirname, '../..');
const source = path.resolve(option('--source', path.join(root, 'index.html')));
const out = path.resolve(option('--out', '/tmp/lumenfall-rift-cosmetics'));
const baseline = args.includes('--baseline');
const negative = args.includes('--negative');
const chrome = option('--chrome', ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].find(name => spawnSync('which', [name]).status === 0));
if (!chrome) throw Error('Chromium is required');
fs.mkdirSync(out, {recursive: true});
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lumenfall-cosmetics-'));
const sourceBytes = fs.readFileSync(source);
const records = [], runtimeErrors = [], pending = new Map();
let browser, session, seq = 0, buffer = '', stderr = '', exitInfo, failure;
function assert(ok, message) { if (!ok) throw Error(message); }
const server = http.createServer((req, res) => {
  const file = req.url.split('?')[0] === '/index.html' ? source : path.resolve(path.dirname(source), '.' + req.url.split('?')[0]);
  if (file !== source && !file.startsWith(path.dirname(source) + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream');
    if(file===source){
      const marker='\n})();\n</script>\n<script>\nif(window.Capacitor';
      const html=data.toString('utf8');
      if(html.split(marker).length!==2){res.writeHead(500);res.end('Test bridge marker missing');return;}
      res.end(html.replace(marker,'\n'+setup+'\nwindow.cosmeticQa.evaluate=function(code){return eval(code);};'+marker));
    } else res.end(data);
  });
});
function send(method, params = {}, sid = session) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 10000);
    pending.set(id, {resolve, reject, timer});
    browser.stdio[3].write(JSON.stringify({id, method, params, ...(sid ? {sessionId: sid} : {})}) + '\0');
  });
}
async function evaluate(expression) {
  const wrapped='window.cosmeticQa && cosmeticQa.evaluate ? cosmeticQa.evaluate('+JSON.stringify(expression)+') : eval('+JSON.stringify(expression)+')';
  const result = await send('Runtime.evaluate', {expression:wrapped, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function screenshot(name) {
  const shot = await send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(shot.data, 'base64'));
}
async function key(key) {
  await send('Input.dispatchKeyEvent', {type: 'keyDown', key, code: key, text: key === 'Enter' ? '\r' : '', windowsVirtualKeyCode: key === 'Enter' ? 13 : 9});
  await send('Input.dispatchKeyEvent', {type: 'keyUp', key, code: key, windowsVirtualKeyCode: key === 'Enter' ? 13 : 9});
}
async function pauseForUi(){
  await evaluate(`document.fonts.ready.then(function(){
    if(startupIntroFinish) startupIntroFinish();
    return new Promise(function(resolve){setTimeout(resolve,500);});
  }).then(function(){
    qaIntervals.forEach(clearInterval);if(overlayFocus) closeOverlay(overlayFocus.el);
    document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});
    document.querySelectorAll('.rift-milestone').forEach(function(el){el.remove();});
    document.getElementById('toast').classList.remove('show');
    document.querySelector('#tab-battle .stage').classList.remove('impact-victory','impact-milestone','impact-boss');
    document.querySelector('.shell').inert=false;
  })`);
}
async function waitForReload(previous){
  for(let i=0;i<100;i++){
    try{
      if(await evaluate('window.qaLoadToken!=='+JSON.stringify(previous)+' && typeof state!=="undefined" && !!state && !!els["theme-list"]')){await pauseForUi();return;}
    }catch(error){if(!/context|Cannot find|state is not defined/.test(error.message))throw error;}
    await new Promise(resolve=>setTimeout(resolve,30));
  }
  throw Error('actual page reload did not complete');
}
const setup = `window.cosmeticQa = {
  assert: function(ok, message){ if(!ok) throw Error(message); },
  fixture: function(kind, unlocked){
    state=freshState();
    // Preserve the integrated F27 purchases and show both independent layers.
    state.owned.rifttrail=true;state.owned.starfallcrest=true;
    state.cometCosmetics={trail:true,crest:true};
    if(unlocked) RIFT_THEMES.forEach(function(t){if(t.unlockAchievement) state.achieved[t.unlockAchievement]=true;});
    state.depth=kind==='boss'?30:kind==='luminous'?31:1;
    state.maxDepthEver=state.depth;spawnEnemy(false);
    if(kind==='luminous') state.enemyIsLuminous=true;
    renderAll();document.querySelector('[data-tab="battle"]').click();
  },
  geometry: function(){
    var result={};['enemy-stage','hp-text','enemy-name'].forEach(function(id){
      var r=document.getElementById(id).getBoundingClientRect();result[id]=[r.x,r.y,r.width,r.height];
    });var track=document.querySelector('.hp-bar-track').getBoundingClientRect();result['hp-track']=[track.x,track.y,track.width,track.height];return result;
  },
  measure: function(id, reduced){
    var a=this.assert, stage=document.getElementById('enemy-stage'), halo=stage.querySelector('.rift-cosmetic-aura'), caption=document.getElementById('rift-cosmetic-name');
    a(stage.dataset.riftTheme===id,'selected effect applied to tap area');
    a(document.querySelector('#tab-battle .stage').dataset.riftTheme===id,'selected effect applied to landscape');
    a(caption.textContent===RIFT_THEMES.find(function(t){return t.id===id;}).name,'visible theme name');
    a(getComputedStyle(caption).color==='rgb(241, 237, 255)' && getComputedStyle(caption).backgroundColor==='rgb(16, 24, 43)','opaque readable caption');
    a(halo.getAttribute('aria-hidden')==='true' && getComputedStyle(halo).pointerEvents==='none','decorations cannot capture taps or screen reader focus');
    ['trail','crest'].forEach(function(slot){
      var decoration=stage.querySelector('.comet-'+slot),style=getComputedStyle(decoration);
      a(state.cometCosmetics[slot] && style.display!=='none','Comet '+slot+' remains equipped and visible with '+id);
      a(style.pointerEvents==='none','Comet '+slot+' remains pointer inert');
      if(reduced) a(style.animationName==='none','Comet '+slot+' reduced motion remains static');
    });
    var visible=Array.from(halo.querySelectorAll('.cosmetic-pattern')).filter(function(g){return getComputedStyle(g).display!=='none';});
    a(visible.length===(id==='default'?0:1),'one visible pattern for selected theme');
    if(visible.length){
      a(visible[0].classList.contains('cosmetic-'+id),'correct pattern');
      a(visible[0].getBoundingClientRect().width>60,'aura has rendered geometry');
      if(reduced) a(getComputedStyle(visible[0]).animationName==='none','static reduced-motion alternative');
    }
    var r=stage.getBoundingClientRect(), hp=document.getElementById('hp-text').getBoundingClientRect(), c=caption.getBoundingClientRect();
    a(r.width>=44 && r.height>=44,'tap target at least 44px');
    a(c.bottom<=r.bottom && hp.top>=r.bottom-1,'cosmetic does not cover HP');
    a(c.right<=r.right && c.top>=r.top,'caption stays within tap area');
    a(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2).closest('#enemy-stage')===stage,'center remains tappable');
    return {id,geometry:this.geometry(),visiblePatterns:visible.map(function(g){return g.getAttribute('class');}),animation:visible.map(function(g){return getComputedStyle(g).animationName;}),landLight:getComputedStyle(document.querySelector('#tab-battle .stage')).getPropertyValue('--land-light')};
  }
};`;
async function run() {
  await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0, '127.0.0.1', resolve);});
  const url = 'http://127.0.0.1:' + server.address().port + '/index.html';
  browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-pipe', '--user-data-dir=' + profile, 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});
  const completion = new Promise(resolve => {
    browser.once('error', error => { exitInfo = {error: error.message}; resolve(); });
    browser.once('close', (code, signal) => {
      exitInfo = {code, signal};
      for (const p of pending.values()) { clearTimeout(p.timer); p.reject(Error('browser closed')); }
      pending.clear(); resolve();
    });
  });
  browser.stderr.on('data', data => { stderr = (stderr + data).slice(-4000); });
  browser.stdio[4].on('data', data => {
    buffer += data; let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const raw = buffer.slice(0, end); buffer = buffer.slice(end + 1); if (!raw) continue;
      const message = JSON.parse(raw), p = pending.get(message.id);
      if (p) { clearTimeout(p.timer); pending.delete(message.id); message.error ? p.reject(Error(JSON.stringify(message.error))) : p.resolve(message.result); }
      if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
    }
  });
  try {
    const target = await send('Target.createTarget', {url: 'about:blank'}, null);
    session = (await send('Target.attachToTarget', {targetId: target.targetId, flatten: true}, null)).sessionId;
    await send('Page.bringToFront');
    await send('Page.enable'); await send('Runtime.enable');
    // Preserve production startup, then pause its intervals solely for UI measurements.
    await send('Page.addScriptToEvaluateOnNewDocument', {source: `window.qaLoadToken=Math.random().toString();window.qaIntervals=[];var qaSetInterval=window.setInterval;window.setInterval=function(){var id=qaSetInterval.apply(window,arguments);qaIntervals.push(id);return id;};`});
    await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
    await send('Page.navigate', {url});
    let ready = false;
    for (let i = 0; i < 100; i++) { if (await evaluate('typeof state!=="undefined" && !!state && !!els["theme-list"]')) { ready = true; break; } await new Promise(r => setTimeout(r, 30)); }
    assert(ready, 'production startup ready');
    await pauseForUi();
    if (!baseline) {
      records.push(await evaluate(`(function(){
        var q=cosmeticQa,a=q.assert;q.fixture('normal',false);
        var original=JSON.stringify(state);selectRiftTheme('ember');selectRiftTheme('unknown');
        a(JSON.stringify(state)===original,'locked and unknown selection have no effect');
        a(document.querySelectorAll('.theme-card[data-state="locked"]').length===5,'five locked themes');
        state.maxDepthEver=50;checkAchievements();renderCosmetics();
        a(themeUnlocked(RIFT_THEMES.find(function(t){return t.id==='ember';})) && state.riftTheme==='default' && activeRiftTheme().id==='default','earning a Deed unlocks without selecting its cosmetic');
        state.riftTheme='radiant';renderCosmetics();a(state.riftTheme==='radiant' && activeRiftTheme().id==='default','stale locked preference preserved but not granted');
        a(document.querySelectorAll('[data-theme-select][aria-pressed="true"]').length===1,'exactly one effective selection');
        q.fixture('normal',true);state=acceptPersistedState(state,'runtime');
        var before=JSON.stringify(state);renderCosmetics();a(JSON.stringify(state)===before,'render has no save mutation');
        var results=[];
        RIFT_THEMES.forEach(function(t){
          var economic=JSON.parse(JSON.stringify(state));delete economic.riftTheme;delete economic.lastSeen;
          selectRiftTheme(t.id);
          var after=JSON.parse(JSON.stringify(state));delete after.riftTheme;delete after.lastSeen;
          a(JSON.stringify(after)===JSON.stringify(economic),'selection preserves gameplay and ownership: '+t.id);
          var primary=JSON.parse(localStorage.getItem(SAVE_KEY)),recovery=JSON.parse(localStorage.getItem(RECOVERY_SAVE_KEY));
          a(primary.riftTheme===t.id && recovery.riftTheme===t.id,'immediate primary and recovery persistence: '+t.id);
          var backup=decodeSaveBackup(encodeSaveBackup(state));
          a(backup.riftTheme===t.id,'backup roundtrip selection: '+t.id);
          a(acceptPersistedState(backup,'backup').riftTheme===t.id,'canonical restored selection: '+t.id);
          var saved=JSON.stringify(state);state=loadState();renderAll();
          a(state.riftTheme===t.id && activeRiftTheme().id===t.id,'load re-applies selected theme: '+t.id);
          a(JSON.stringify(acceptPersistedState(JSON.parse(saved),'runtime'))===JSON.stringify(state),'load retains canonical data: '+t.id);
          results.push(t.id);
        });
        var old=freshState();delete old.riftTheme;a(acceptPersistedState(old,'backup').riftTheme==='default','old save uses default without currency migration');
        return {contract:'unlock-selection-persistence',themes:results};
      })()`));
      records.push(await evaluate(`(function(){
        var q=cosmeticQa,a=q.assert;q.fixture('normal',true);
        var themes=[];RIFT_THEMES.forEach(function(t){
          selectRiftTheme(t.id);var backgrounds=[];
          [1,26,51,76,101,126].forEach(function(depth){state.depth=depth;spawnEnemy(false);renderAll();backgrounds.push(getComputedStyle(document.querySelector('#tab-battle .stage')).backgroundImage);});
          a(new Set(backgrounds).size===6,'all six region palettes remain distinct with '+t.id);themes.push(t.id);
        });return {contract:'region-palettes-preserved',themes:themes};
      })()`));
    }
    for (const [width, height, scale, motion] of [[320,640,1,'no-preference'], [390,844,1,'no-preference'], [430,915,1,'no-preference'], [320,640,1.3,'reduce'], [390,844,1.3,'reduce'], [430,915,1,'reduce'], [320,640,2,'reduce'], [390,844,2,'reduce'], [430,915,2,'reduce']]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: true});
      await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: motion}]});
      await evaluate(`document.documentElement.style.fontSize=${JSON.stringify(16 * scale + 'px')}`);
      for (const kind of ['normal','boss','luminous']) {
        await evaluate(`cosmeticQa.fixture(${JSON.stringify(kind)},true)`);
        const before = await evaluate('cosmeticQa.geometry()');
        for (const id of ['default','ember','void','aurora','solar','radiant']) {
          await evaluate(`selectRiftTheme(${JSON.stringify(id)})`);
          const measurement = baseline ? {id, geometry: await evaluate('cosmeticQa.geometry()')} : await evaluate(`cosmeticQa.measure(${JSON.stringify(id)},${motion === 'reduce'})`);
          assert(JSON.stringify(before) === JSON.stringify(measurement.geometry), 'HP/tap geometry unchanged by ' + id);
          records.push({width, height, scale, motion, kind, ...measurement});
          if ((width === 390 && scale === 1 && kind === 'normal') || (width === 320 && scale > 1 && kind === 'boss' && ['aurora','radiant'].includes(id))) await screenshot(`${width}-${motion}-${kind}-${id}`);
        }
      }
    }
    if (!baseline) {
      await send('Emulation.setDeviceMetricsOverride', {width:320,height:640,deviceScaleFactor:1,mobile:true});
      await evaluate(`cosmeticQa.fixture('normal',true);document.querySelector('[data-tab="deeds"]').click();document.querySelector('[data-theme-select="ember"]').focus();`);
      await key('Enter');
      records.push(await evaluate(`(function(){var a=cosmeticQa.assert,button=document.querySelector('[data-theme-select="ember"]');
        a(state.riftTheme==='ember' && button.getAttribute('aria-pressed')==='true','native Enter selects theme: '+JSON.stringify({theme:state.riftTheme,active:document.activeElement.outerHTML.slice(0,200),inert:document.querySelector('.shell').inert,focus:document.hasFocus()}));
        a(document.activeElement===button,'focus retained after selection rerender');renderAll();
        a(document.activeElement===document.querySelector('[data-theme-select="ember"]'),'focus retained after live render');
        document.querySelectorAll('[data-theme-select]').forEach(function(b){a(b.getBoundingClientRect().height>=44,'theme control 44px');a(b.scrollWidth<=b.clientWidth+1,'theme text fits at large font: '+JSON.stringify({theme:b.getAttribute('data-theme-select'),scroll:b.scrollWidth,client:b.clientWidth,nameFont:getComputedStyle(b.querySelector('.name')).fontSize,tagFont:getComputedStyle(b.querySelector('.theme-active-tag')).fontSize}));});
        a(button.textContent.indexOf('Selected')>=0 && document.querySelector('[data-theme-select="void"]').textContent.indexOf('Unlocked')>=0,'unlocked and selected use different words');
        return {contract:'keyboard-focus-controls'};
      })()`));
      await screenshot('320-large-text-deeds');
      // Native touch reaches the existing Guardian Tap handler through the decoration.
      await evaluate(`document.querySelector('[data-tab="battle"]').click();state.enemyHp=state.enemyMaxHp=1000000;updateBattleFast();`);
      const tap = await evaluate(`(function(){var r=document.getElementById('enemy-stage').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hp:state.enemyHp};})()`);
      await send('Emulation.setTouchEmulationEnabled',{enabled:true});
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tap.x,y:tap.y}]});
      await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert(await evaluate('state.enemyHp') < tap.hp, 'native tap damages enemy through aura');
      records.push({contract:'native-tap',before:tap.hp,after:await evaluate('state.enemyHp')});
      // Exercise actual init/recovery/restore paths, not just serialization helpers.
      await evaluate('saveState()');
      let token=await evaluate('window.qaLoadToken');
      await send('Page.reload');await waitForReload(token);
      assert(await evaluate('state.riftTheme==="ember" && activeRiftTheme().id==="ember"'),'actual reload retains selected aura');
      token=await evaluate('window.qaLoadToken');
      await evaluate(`reloadInProgress=true;localStorage.setItem(SAVE_KEY,'broken JSON');`);
      await send('Page.reload');await waitForReload(token);
      assert(await evaluate('recoveredFromRecovery && state.riftTheme==="ember" && activeRiftTheme().id==="ember"'),'actual corrupt-primary recovery retains selected aura');
      token=await evaluate('window.qaLoadToken');
      await evaluate(`var qaBackup=encodeSaveBackup(state);selectRiftTheme('solar');document.getElementById('save-backup-code').value=qaBackup;restoreSaveBackup();`);
      await waitForReload(token);
      assert(await evaluate('state.riftTheme==="ember" && activeRiftTheme().id==="ember"'),'actual backup restore and reload retains selected aura');
      records.push({contract:'actual-reload-recovery-backup',selected:'ember'});
      if (negative) {
        const reason = await evaluate(`(function(){cosmeticQa.fixture('normal',true);selectRiftTheme('radiant');document.querySelector('.cosmetic-radiant').style.display='none';try{cosmeticQa.measure('radiant',true);return null;}catch(error){return error.message;}})()`);
        assert(reason === 'one visible pattern for selected theme','negative catches missing visible aura');
        records.push({contract:'negative-hidden-aura',caught:reason});
      }
    }
    assert(runtimeErrors.length === 0, 'no browser runtime errors');
  } catch (error) { failure = error.stack; }
  finally {
    if (!exitInfo) await send('Browser.close', {}, null).catch(() => {});
    let timer;
    await Promise.race([completion,new Promise(resolve=>{timer=setTimeout(()=>{browser.kill('SIGKILL');resolve();},5000);})]);clearTimeout(timer);
    if (!exitInfo || exitInfo.code !== 0) failure ||= 'browser did not exit cleanly';
    await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
    await new Promise(resolve=>server.close(resolve));
  }
}
run().catch(error=>{failure=error.stack;}).finally(()=>{
  const result={status:failure?'fail':'pass',baseline,negative,source,sourceSHA256:crypto.createHash('sha256').update(sourceBytes).digest('hex'),browser:spawnSync(chrome,['--version'],{encoding:'utf8'}).stdout.trim(),chromeExecutable:chrome,node:process.version,records,runtimeErrors,exitInfo,failure,stderr};
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({status:result.status,samples:records.length,out,failure}));
  if(failure)process.exitCode=1;
});
