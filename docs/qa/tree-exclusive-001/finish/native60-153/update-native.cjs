'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),Adb=require('./direct-adb.cjs');
const apk=process.argv[2],version=process.argv[3],root=process.argv[4]||__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert(apk&&version,'target APK and exact version required');
(async()=>{const a=await new Adb().connect();try{
 assert.equal((await a.shell('getprop ro.kernel.qemu')).trim(),'1');await a.shell('am force-stop com.lumenfall.app');await a.upload(apk,'/data/local/tmp/tree-target.apk');
 const installed=await a.shell('pm install -r /data/local/tmp/tree-target.apk');assert(installed.includes('Success'),installed);
 const before=fs.readFileSync(path.join(root,'storage-before-update.tar')),after=await a.exec('run-as com.lumenfall.app tar cf - "app_webview/Local Storage"');assert(after.equals(before),'signed update preserves exact native save storage before launch');
 const pkg=(await a.shell('dumpsys package com.lumenfall.app | grep version')).trim();assert(pkg.includes('versionName='+version),pkg);
 fs.writeFileSync(path.join(root,'native-update.json'),JSON.stringify({status:'pass',prior:'0.1.148',updated:version,apkSha256:sha(fs.readFileSync(apk)),storageBytes:after.length,storageSha256:sha(after),installer:installed.trim(),package:pkg},null,2)+'\n');
 console.log('PASS: signed148 to'+version+' storage preserved byte-for-byte');await a.shell('input keyevent 224; wm dismiss-keyguard; am start -n com.lumenfall.app/.MainActivity');
}finally{a.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
