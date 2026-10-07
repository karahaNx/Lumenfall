#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { parseArgs, main } = require('../lib/cli.cjs');
const marker = `<script id="ci-runtime-error-guard">
(function(){
  function mark(kind){ document.documentElement.setAttribute('data-ci-runtime-error', kind); }
  window.addEventListener('error', function(){ mark('uncaught-error'); });
  window.addEventListener('unhandledrejection', function(){ mark('unhandled-rejection'); });
})();
</script>`;
function installGuard(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('<head>')) throw Error('CI runtime guard failed: <head> not found');
  fs.writeFileSync(file, src.replace('<head>', () => '<head>\n' + marker));
  console.log('Installed CI-only runtime error guard in staged HTML.');
}
function checkSmoke(domFile, chromeFile, requireGuard) {
  const dom = fs.readFileSync(domFile, 'utf8'), chromeLog = chromeFile ? fs.readFileSync(chromeFile, 'utf8') : '';
  const checks = {
    ...(requireGuard ? { 'CI runtime guard installed': dom.includes('id="ci-runtime-error-guard"'),
      'No uncaught JavaScript error': !dom.includes('data-ci-runtime-error="uncaught-error"'),
      'No unhandled promise rejection': !dom.includes('data-ci-runtime-error="unhandled-rejection"') } : {}),
    'Rift zone runtime render': dom.includes('data-zone-index="0"'),
    'Rift scroll lock': /<main[^>]*class="[^"]*rift-scroll-locked/.test(dom),
    'Enemy runtime render': /id="enemy-name"[^>]*>\s*[^<\s][^<]*</.test(dom),
    'HUD runtime render': /id="hud-lumen"[^>]*>\s*0(?:\.0)?\s*</.test(dom)
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  if (failed.length) {
    console.log(dom.slice(0, 12000));
    if (chromeLog.trim()) { console.log('\nChromium stderr:'); console.log(chromeLog.slice(-8000)); }
    throw Error('Browser smoke test failed: ' + failed.join(', '));
  }
  console.log('Browser smoke test passed: game initialized' + (requireGuard ? ' without uncaught runtime errors' : ' and rendered') + ' at a 390x844 mobile viewport.');
}
module.exports = { installGuard, checkSmoke };
if (require.main === module) main(() => {
  const args = parseArgs(process.argv.slice(2), ['--install-guard', '--dom', '--chrome-log'], ['--require-guard']);
  if (args.positional.length) throw Error('Unexpected positional argument');
  if (args['install-guard']) {
    if (args.dom || args['chrome-log'] || args['require-guard']) throw Error('Install and check are separate commands');
    installGuard(args['install-guard']);
  } else {
    if (!args.dom) throw Error('--dom is required');
    checkSmoke(args.dom, args['chrome-log'], args['require-guard']);
  }
});
