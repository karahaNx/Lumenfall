'use strict';
// Compare actual WebView save storage across an in-place signed APK update.
// Never uninstall/clear data. Only this isolated emulator is permitted.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const adb=process.env.LUMENFALL_QA_ADB||'/workspace/.lumenfall-android/sdk/platform-tools/adb',serial='emulator-5554';
const apk=process.argv[2],output=process.argv[3];assert(apk&&output,'APK and result paths required');
function android(...args){return cp.execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout:120000});}
function snapshot(){const b=cp.execFileSync(adb,['-s',serial,'exec-out','run-as','com.lumenfall.app','tar','cf','-','app_webview/Local Storage'],{timeout:60000});assert(!b.subarray(0,100).toString().startsWith('tar:'),'storage snapshot succeeded');return b;}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(android('shell','getprop','ro.kernel.qemu').trim(),'1');
const beforeVersion=android('shell','dumpsys','package','com.lumenfall.app').split('\n').filter(l=>/versionCode=|versionName=/.test(l)).map(l=>l.trim());
android('shell','am','force-stop','com.lumenfall.app');const before=snapshot();assert(before.length>1024,'existing nonempty WebView storage');
const install=android('install','-r',apk);assert(install.includes('Success'),'in-place signed update');const after=snapshot();assert(before.equals(after),'actual save storage is byte-identical after update before first launch');
const afterVersion=android('shell','dumpsys','package','com.lumenfall.app').split('\n').filter(l=>/versionCode=|versionName=/.test(l)).map(l=>l.trim());
fs.writeFileSync(output,JSON.stringify({status:'pass',case:'signed in-place APK update preserves actual WebView save storage',beforeVersion,afterVersion,install,apkSha256:hash(fs.readFileSync(apk)),storageBytes:before.length,beforeStorageSha256:hash(before),afterStorageSha256:hash(after),note:'isolated emulator QA save; no uninstall or data reset; compared before opening updated app'},null,2)+'\n');
console.log('PASS native signed update/save persistence');
console.log(android('shell','am','start','-n','com.lumenfall.app/.MainActivity'));
