#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { main } = require('../lib/cli.cjs');
function setVersion(file, buildNumber) {
  const versionCode = Number(buildNumber), versionName = '0.1.' + versionCode;
  if (!/^\d+$/.test(buildNumber || '') || !Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 2100000000) throw Error('Invalid BUILD_NUMBER for Android versionCode');
  const text = fs.readFileSync(file, 'utf8'), oldCode = 'versionCode 1', oldName = 'versionName "1.0"';
  if (!text.includes(oldCode) || !text.includes(oldName)) throw Error('Could not find Capacitor default Android version fields');
  fs.writeFileSync(file, text.replace(oldCode, 'versionCode ' + versionCode).replace(oldName, 'versionName "' + versionName + '"'));
  console.log(`Android versionCode=${versionCode}, versionName=${versionName}`);
}
module.exports = { setVersion };
if (require.main === module) main(() => {
  if (process.argv.length > 3) throw Error('Usage: node scripts/ci/set_android_version.cjs [BUILD_GRADLE]');
  setVersion(process.argv[2] || 'mobile/android/app/build.gradle', process.env.BUILD_NUMBER);
});
