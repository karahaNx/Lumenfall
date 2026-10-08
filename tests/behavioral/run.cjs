#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { parseArgs, resolvePath, hash, json, main: cliMain } = require('../../scripts/lib/cli.cjs');
const { runProcess } = require('../../scripts/lib/process.cjs');
const { serve } = require('../../scripts/lib/static-server.cjs');
const { rawQaObservation } = require('./raw-result.cjs');
const { SCENARIOS, PREP_SCENARIOS, NEGATIVE_SCENARIOS } = require('./scenarios.json');
const ROOT = __dirname;
const LAYOUT_VIEWPORTS = [[360,800,0,0], [360,780,0,0], [390,844,0,0], [412,915,0,0], [360,640,24,24]];
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const temporary = prefix => fs.mkdtempSync(path.join(os.tmpdir(), prefix));
const reportJson = value => JSON.stringify(value, null, 1).replace(/\n\s*/g, ' ');
function findChrome() {
  for (const candidate of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    for (const directory of (process.env.PATH || '').split(path.delimiter)) {
      const file = path.join(directory, candidate);
      try { fs.accessSync(file, fs.constants.X_OK); if (fs.statSync(file).isFile()) return file; } catch {}
    }
  }
  throw Error('Behavioral QA failed: no supported Chromium browser found');
}
function loadFixtures() {
  const fixtures = json(path.join(ROOT, 'fixtures.json'));
  const seed = json(path.join(ROOT, '../../docs/qa/offline-autoascend-2026-10-07/device_backup.json'));
  seed.lastSeen = '__NOW_MINUS_8H__';
  fixtures['offline-catchup-device'] = { save: seed };
  return fixtures;
}
function instrumentHtml(source, fixtures) {
  function replaceOnce(marker, replacement, message) {
    if (source.split(marker).length !== 2) throw Error('Behavioral QA failed: ' + message);
    source = source.replace(marker, () => replacement);
  }
  const prelude = read('prelude.js').replace('__QA_FIXTURES_JSON__', () => JSON.stringify(fixtures));
  replaceOnce('<head>', '<head>\n<script id="qa-behavior-prelude">\n' + prelude + '\n</script>', 'expected exactly one <head> marker');
  const marker = '\n})();\n</script>\n<script>\nif(window.Capacitor';
  replaceOnce(marker, '\n' + read('bridge.js') + '\n' + read('wisp-upgrades-bridge.js') + marker, 'main game IIFE marker changed; test bridge could not be installed');
  const modules = ['rift-status', 'bond-text', 'layout', 'accessibility', 'accessibility-controls', 'nav-workshop', 'r3-destinations',
    'research-duration', 'upgrade-clarity', 'upgrade-identity', 'feedback', 'formation', 'formation-autosave', 'forge', 'support-stacking', 'auto-ascend-target', 'buff-timing', 'measured-inquiry', 'lab-motes', 'farm-conservation', 'farm-numerical', 'wisp-upgrades', 'ascend-prisms'];
  replaceOnce('</body>', modules.map(name => '<script>' + read(name + '.js') + '</script>').join('') +
    '<script id="qa-behavior-runner">\n' + read('runner.js') + '\n</script>\n</body>', 'expected exactly one </body> marker');
  return source;
}
async function runNativeProcess(command, scenario, timeout = 90000, options = {}) {
  const log = options.log || console.log;
  const result = await (options.execute || runProcess)(command, { timeout });
  let detail;
  try {
    detail = JSON.parse(result.stdout);
    if (!detail || typeof detail !== 'object' || Array.isArray(detail)) throw Error('driver JSON must be an object');
  } catch (error) { detail = { status: 'fail', message: 'Invalid driver JSON: ' + error.message, stdout: result.stdout }; }
  const passed = !result.timed_out && result.exitcode === 0 && detail.status === 'pass';
  log((passed ? 'PASS ' : 'FAIL ') + scenario);
  log('  process: ' + reportJson({ exitcode: result.exitcode, timed_out: result.timed_out, stderr: result.stderr }));
  log('  detail: ' + reportJson(detail));
  return passed;
}
async function nativeProcessContract(log = console.log) {
  const cases = [
    ['valid-pass', "console.log(JSON.stringify({status:'pass'}))", true, '"exitcode": 0', ''],
    ['pass-nonzero', "console.log(JSON.stringify({status:'pass'}));console.error('intentional exit 7');process.exitCode=7", false, '"exitcode": 7', 'intentional exit 7'],
    ['invalid-json', "console.log('not JSON');console.error('invalid payload evidence')", false, 'Invalid driver JSON', 'invalid payload evidence'],
    ['timeout', "console.log(JSON.stringify({status:'pass'}));console.error('pending process evidence');setInterval(()=>{},1000)", false, '"timed_out": true', 'pending process evidence']
  ];
  for (const [name, script, expected, marker, stderr] of cases) {
    const lines = [];
    const actual = await runNativeProcess([process.execPath, '-e', script], name, name === 'timeout' ? 500 : 5000, { log: line => lines.push(line) });
    const evidence = lines.join('\n');
    log(`  process control ${name} (expected ${expected}):\n    ` + evidence.replaceAll('\n', '\n    '));
    if (actual !== expected || !evidence.includes(marker) || !evidence.includes(stderr)) { log('FAIL forge-ui-process-contract: ' + name); return false; }
  }
  log('PASS forge-ui-process-contract'); return true;
}
async function browserIdentity(chrome) {
  const resolved = fs.realpathSync(chrome), identity = { selected_path: chrome, resolved_path: resolved };
  try { identity.sha256 = hash(fs.readFileSync(resolved)); } catch (error) { identity.identity_error = error.message; }
  try {
    const result = await runProcess([chrome, '--version'], { timeout: 2000 });
    if (result.timed_out) throw Error('Browser version timed out');
    Object.assign(identity, { version: result.stdout.trim().slice(0, 200), version_exitcode: result.exitcode, version_stderr: result.stderr.slice(-400) });
  } catch (error) { identity.version_error = error.message.slice(0, 400); }
  console.log('Browser identity: ' + reportJson(identity));
}
async function runScenario(chrome, baseUrl, scenario, fixture, viewport = null, options = {}) {
  const log = options.log || console.log;
  const urlFor = page => baseUrl + page + '?' + new URLSearchParams({ qaScenario: scenario, qaFixture: fixture });
  if (scenario === 'resonate-clarity') return runNativeProcess([process.execPath, path.join(ROOT, 'resonate-clarity.cjs'), '--chrome', chrome, '--source', path.join(options.sourceWebRoot || path.join(ROOT, '../..'), 'index.html')], scenario, 150000, options);
  if (scenario === 'comet-unlocks-core') return runNativeProcess([process.execPath, path.join(ROOT, 'comet-unlocks-core.cjs')], scenario, 90000, options);
  if (scenario === 'lab-motes-offline-integration') return runNativeProcess([process.execPath, path.join(ROOT, 'lab-motes-offline.cjs')], scenario, 90000, options);
  if (['save-backup-ui', 'self-test-save-backup-placement', 'self-test-save-backup-confirmation'].includes(scenario)) {
    const command = [process.execPath, path.join(ROOT, 'save-backup-ui.cjs'), '--chrome', chrome, '--quiet',
      '--web-root', options.sourceWebRoot || path.join(ROOT, '../..'),
      '--evidence', path.join(options.rawArtifactRoot || os.tmpdir(), scenario)];
    if (scenario !== 'save-backup-ui') command.push('--mutant', scenario.endsWith('placement') ? 'misplaced-backup' : 'early-restore');
    return runNativeProcess(command, scenario, 150000, options);
  }
  if (scenario === 'offline-catchup-core') return runNativeProcess([process.execPath, path.join(ROOT, 'offline-catchup.cjs')], scenario, 300000, options);
  if (scenario === 'offline-catchup-ui' || scenario === 'offline-catchup-legacy-dom') return runNativeProcess([process.execPath, path.join(ROOT, 'offline-catchup-ui.cjs'), chrome, urlFor('/index.html'), scenario], scenario, 210000, options);
  if (['formation-autosave-native','formation-autosave-reduced-motion'].includes(scenario)) return runNativeProcess([process.execPath,path.join(ROOT,'formation-autosave.cjs'),chrome,urlFor('/index.html'),scenario],scenario,120000,options);
  if (scenario === 'raw-process-contract') return require('./process_contract.cjs').runContract(runScenario, log);
  if (scenario === 'forge-ui-process-contract') return nativeProcessContract(log);
  if (scenario === 'loadout-memory-core' || scenario === 'loadout-memory-mobile') return runNativeProcess([process.execPath, path.join(ROOT, 'loadout-memory.cjs'), '--chrome', chrome, '--source', path.join(options.sourceWebRoot || path.join(ROOT, '../..'), 'index.html'), ...(scenario === 'loadout-memory-core' ? ['--vm-only'] : [])], scenario, 300000, options);
  let driver = null;
  if (['comet-unlocks-mobile', 'comet-unlocks-reduced-motion'].includes(scenario)) driver = 'comet-unlocks-ui.cjs';
  if (['rift-status-mobile', 'rift-status-reduced-motion'].includes(scenario) || scenario.startsWith('rift-status-stacking') || scenario.startsWith('self-test-rift-status-line')) driver = 'rift-status.cjs';
  if (['auto-ascend-target-mobile', 'auto-ascend-target-reduced-motion'].includes(scenario)) driver = 'auto-ascend-target.cjs';
  if (scenario.startsWith('forge-ui-') || scenario.startsWith('self-test-forge-ui-')) driver = 'forge-ui.cjs';
  if (scenario === 'lab-motes-runtime') driver = 'farm-runtime.cjs';
  if (['lab-motes-native', 'lab-motes-reduced-motion'].includes(scenario)) driver = 'lab-motes.cjs';
  if (driver) return runNativeProcess([process.execPath, path.join(ROOT, driver), chrome, urlFor('/index.html'), scenario], scenario, driver === 'rift-status.cjs' ? 120000 : 90000, options);
  if (scenario === 'offline-12h-ui') return runNativeProcess([process.execPath, path.join(ROOT, 'offline-12h-ui.cjs'), chrome], scenario, 180000, options);
  if (scenario === 'offline-12h-core') return runNativeProcess([process.execPath, path.join(ROOT, 'offline-12h.cjs')], scenario, 300000, options);
  const profile = temporary('lumenfall-qa-' + scenario + '-');
  const params = { qaScenario: scenario, qaFixture: fixture };
  if (viewport) ['width', 'height', 'safeTop', 'safeBottom'].forEach((key, i) => { params[key] = viewport[i]; });
  const url = baseUrl + (viewport ? '/layout.html' : '/index.html') + '?' + new URLSearchParams(params);
  const command = [chrome, '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--disable-background-networking', '--disable-background-timer-throttling', '--no-first-run', '--window-size=390,844',
    '--virtual-time-budget='+(['upgrade-identity-ui','upgrade-identity-reduced-motion'].includes(scenario)?5000:1500), '--user-data-dir=' + profile, '--dump-dom', url];
  if (['p1-05-reduced-motion', 'p2-06b-reduced-motion', 'research-duration-reduced-motion', 'inquiry-ui-reduced-motion', 'upgrade-identity-reduced-motion'].includes(scenario)) command.splice(-1, 0, '--force-prefers-reduced-motion');
  const started = performance.now();
  let result;
  const domCommand = !options.execute && process.env.LUMENFALL_QA_DOM_TRANSPORT === 'pipe'
    ? [process.execPath, path.join(ROOT, 'browser-dom.cjs'), chrome, url, profile, command.includes('--force-prefers-reduced-motion')?'reduce':'no-preference'] : command;
  try { result = await (options.execute || runProcess)(domCommand, { timeout: 25000 }); }
  finally { fs.rmSync(profile, { recursive: true, force: true }); }
  const dom = result.stdout || '', stderr = result.stderr || '', exitcode = result.exitcode, timedOut = result.timed_out;
  const elapsed = (performance.now() - started) / 1000;
  const { observation, payload } = rawQaObservation(dom, scenario);
  const passed = (!timedOut && exitcode === 0 && observation.valid
    && observation.qa_status === 'pass' && observation.runtime_markers.length === 0
    && observation.runtime_error_count === 0);
  if (passed) {
    log('PASS ' + scenario + (viewport ? ' ' + JSON.stringify(viewport) : ''));
    if (viewport || ['upgrade-effects-and-deeds', 'parity-long-high-power', 'parity-medium-farm'].includes(scenario) ||
        ['ascend-prisms-', 'auto-ascend-target-', 'chronology-', 'p1-05-', 'p2-07a-', 'forge-', 'buff-', 'support-', 'inquiry-', 'lab-motes-'].some(prefix => scenario.startsWith(prefix))) log('  detail: ' + reportJson(payload?.detail ?? null));
    return true;
  }
  log('FAIL ' + scenario);
  const processResult = { exitcode, timed_out: timedOut, elapsed_sec: elapsed, timeout_sec: 25 };
  log('  process: ' + reportJson(processResult));
  log('  observed QA: ' + reportJson(observation).slice(0, 2000));
  if (options.rawArtifactRoot) {
    fs.mkdirSync(options.rawArtifactRoot, { recursive: true });
    const directory = fs.mkdtempSync(path.join(options.rawArtifactRoot, scenario + '-'));
    fs.writeFileSync(path.join(directory, 'stdout.html'), dom);
    fs.writeFileSync(path.join(directory, 'stderr.log'), stderr);
    fs.writeFileSync(path.join(directory, 'process.json'), JSON.stringify({ command:domCommand, fixture, viewport, process: processResult, qa: observation }, null, 2));
    log('  raw artifacts: ' + directory);
  }
  if (stderr.trim()) { log('  Chromium stderr tail:'); log(stderr.slice(-4000)); }
  if (dom) { log('  stdout tail:'); log(dom.slice(-2000)); }
  return false;
}
function mutateSource(source, scenario) {
  const replaceOnce = (rule, replacement) => { assert.equal(source.split(rule).length, 2); source = source.replace(rule, () => replacement); };
  const prismMutations = {
    'tree': ["(1 + nodeLevel('swift')*0.04) * longStudyPrismMult()", "1 * longStudyPrismMult()"],
    'lab': ["function longStudyPrismMult(){ return 1 + longStudyLevel('prismstudy')*0.05; }", "function longStudyPrismMult(){ return 1; }"],
    'payout': ["  state.prisms += gain;", "  state.prisms += gain + 1;"],
    'repeat': ["var ASCEND_REPEAT_REWARD_RATE = 0.20;", "var ASCEND_REPEAT_REWARD_RATE = 0.25;"],
    'rounding': ["  var progressBonus = ascendProgressPrismBonusForCleared(cleared,benchmark);", "  var progressBonus = cleared>benchmark ? Math.max(0,full-ascendFullPrismGainForCleared(benchmark)) : 0;"]
  };
  if (typeof scenario === 'string' && scenario.startsWith('self-test-ascend-prisms-')) {
    const pair = prismMutations[scenario.slice('self-test-ascend-prisms-'.length)];
    if (!pair) throw Error('Unknown F05 negative control');
    replaceOnce(pair[0], pair[1]);
  }
  if (scenario === 'self-test-upgrade-identity-buy') replaceOnce("focus:'Lab: Lumen Wellspring'", "focus:''");
  if (scenario === 'self-test-upgrade-identity-value') replaceOnce("function formationMult(){ return researchFactor('formation') * longStudyFormationMult(); }", "function formationMult(){ return researchFactor('formation'); }");
  if (scenario === 'self-test-upgrade-identity-clock') {
    replaceOnce('    var gridCrossingsBefore = farmGridCrossings;\n    var gridRemainingBefore = farmGridRemainingSec;', '    var elapsedWholeBefore = elapsedWholeSec;\n    var elapsedFractionBefore = elapsedFractionSec;');
    replaceOnce('if(remaining>0 && farmGridCrossings===gridCrossingsBefore && farmGridRemainingSec===gridRemainingBefore && actions===0){', 'if(remaining>0 && elapsedWholeSec===elapsedWholeBefore && elapsedFractionSec===elapsedFractionBefore && actions===0){');
  }
  if (scenario === 'self-test-bond-text-ability') replaceOnce('Heavy ability damage. Its Module boosts the hit; its Ultimate doubles it.', 'Heavy ability damage. Stone + Titan activate the Duskguard Bond. Its Module boosts the hit; its Ultimate doubles it.');
  if (scenario === 'self-test-bond-text-partners') replaceOnce("return SPIRITS.find(function(sp){ return sp.id===id; }).name;", "return SPIRITS.find(function(sp){ return sp.id===id; }).shortName;");
  if (scenario === 'self-test-auto-ascend-target-window') replaceOnce('Math.min(200,highest-start+1)', 'Math.min(201,highest-start+1)');
  if (scenario === 'self-test-auto-ascend-target-manual') {
    const rule = 'function doAscend(auto){';
    replaceOnce(rule, rule + '\n  if(!auto && state.owned.autoascend) state.autoAscendTargetDepth=Math.max(autoAscendTarget(),clearedProgressionRift()+1);');
  }
  if (scenario === 'self-test-forge-ui-render') {
    const start = source.indexOf("  var root=els['research-list'],main=document.querySelector('main');", source.indexOf('function renderResearch(){'));
    const end = source.indexOf("  els['research-list'].querySelectorAll('[data-mult]')", start);
    assert(start >= 0 && end > start);
    source = source.slice(0, start) + `  replaceControlMarkup(els['research-list'],multHtml + html);
  RESEARCH.forEach(function(node){updateResearchCard(node,els['research-list'].querySelector('[data-forge-card="'+node.id+'"]'));});
  presentControlStates(els['research-list']);
` + source.slice(end);
  }
  if (scenario === 'self-test-forge-ui-save') {
    const start = source.indexOf('function renderResearch(){'), marker = '      state.researchQueue[id] = !state.researchQueue[id];';
    const at = source.indexOf(marker, start), save = source.indexOf('      saveState();', at);
    assert(start >= 0 && at > start && save > at);
    source = source.slice(0, save) + '      saveState();\n' + source.slice(save);
  }
  if (scenario === 'self-test-forge-ui-bulk') for (const rule of ['  #tab-forge .mult-row{gap:4px;}\n', '  #tab-forge .mult-btn{min-width:44px;min-height:44px;}\n']) replaceOnce(rule, '');
  return source;
}
async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv, ['--web-root', '--scenario', '--raw-artifacts']);
  if (args.positional.length) throw Error('Unexpected positional argument');
  const all = { ...SCENARIOS, ...PREP_SCENARIOS, ...NEGATIVE_SCENARIOS };
  if (args.scenario && !Object.hasOwn(all, args.scenario)) throw Error('Unknown scenario: ' + args.scenario);
  const webRoot = resolvePath(args['web-root'] || 'mobile/www');
  if (!fs.existsSync(path.join(webRoot, 'index.html'))) throw Error('Behavioral QA failed: ' + path.join(webRoot, 'index.html') + ' not found');
  const fixtures = loadFixtures(), chrome = findChrome();
  await browserIdentity(chrome);
  const rawArtifactRoot = args['raw-artifacts'] ? resolvePath(args['raw-artifacts']) : temporary('lumenfall-qa-raw-');
  const selected = args.scenario ? { [args.scenario]: all[args.scenario] } : SCENARIOS;
  const temporaryStage = temporary('lumenfall-behavioral-'), stage = path.join(temporaryStage, 'www');
  let server;
  const failures = [];
  try {
    fs.cpSync(webRoot, stage, { recursive: true });
    const source = mutateSource(fs.readFileSync(path.join(stage, 'index.html'), 'utf8'), args.scenario);
    const instrumented = instrumentHtml(source, fixtures);
    fs.writeFileSync(path.join(stage, 'index.html'), instrumented);
    console.log('Staged source: ' + reportJson({ source_sha256: hash(source), instrumented_sha256: hash(instrumented) }));
    fs.writeFileSync(path.join(stage, 'layout.html'), read('layout-host.html'));
    server = await serve(stage);
    const baseUrl = 'http://127.0.0.1:' + server.address().port;
    for (const [scenario, fixture] of Object.entries(selected)) {
      const viewports = ['lab-motes-ui','upgrade-identity-ui','upgrade-identity-reduced-motion'].includes(scenario) ? [[320,844,0,0],[390,844,0,0],[430,844,0,0]] : scenario.startsWith('layout-') || scenario === 'self-test-layout-collapse' ? LAYOUT_VIEWPORTS : [null];
      for (const viewport of viewports) if (!await runScenario(chrome, baseUrl, scenario, fixture, viewport, { rawArtifactRoot, sourceWebRoot:webRoot })) failures.push(scenario + ' ' + JSON.stringify(viewport));
    }
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    fs.rmSync(temporaryStage, { recursive: true, force: true });
  }
  if (failures.length) throw Error('Behavioral QA failed: ' + failures.join(', '));
  console.log(`Behavioral QA passed: ${Object.keys(selected).length} deterministic scenario(s).`);
}
module.exports = { findChrome, runScenario, runNativeProcess, nativeProcessContract, instrumentHtml, loadFixtures, mutateSource, main };
if (require.main === module) cliMain(main);
