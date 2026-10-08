'use strict';
// Replace only the provider in an isolated writable-system AOSP API25 test AVD.
// The signed game APK, its certificate and production assets are never modified.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib');
const Adb=require('./direct-adb.cjs');
const zip=require('../../../../../scripts/lib/zip.cjs');
const [apk,receipt]=process.argv.slice(2),delay=ms=>new Promise(r=>setTimeout(r,ms));
const bytes=fs.readFileSync(apk),sha=crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(sha,'dd0a6f2fc4ecf95f4e51dd9d66abbf4590098d95db505889cab1c37ac942913d');
assert.equal(crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),'569b28e87c8ed3c95bd94c45148026902c9196b3');
let adb;
(async()=>{
 for(let i=0;i<180;i++){
  try{adb=await new Adb().connect();if((await adb.shell('getprop sys.boot_completed')).trim()==='1')break;adb.close();adb=null;}catch(_){if(adb)adb.close();adb=null;}
  if(i%15===0)console.log('Waiting for isolated API25 boot');await delay(1000);
 }
 assert(adb,'booted emulator');assert.equal((await adb.shell('getprop ro.kernel.qemu')).trim(),'1');assert.equal((await adb.shell('getprop ro.build.version.sdk')).trim(),'25');
 const before=await adb.shell('dumpsys webviewupdate'),installed=(await adb.shell('pm path com.android.webview')).trim();
 assert.equal(installed,'package:/system/app/webview/webview.apk');assert((await adb.shell('su 0 id')).includes('uid=0'));
 console.log('Verified isolated API25; uploading pinned signed WebView60 provider');
 await adb.upload(apk,'/data/local/tmp/webview60.apk');
 // System APK installation does not extract this historical provider's JNI libs.
 const entries=zip.verifyZip(bytes),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'tree-webview60-'));
 for(const abi of ['x86','x86_64']){
  const entry=entries.find(e=>e.name==='lib/'+abi+'/libwebviewchromium.so');assert(entry);
  const start=entry.offset+30+bytes.readUInt16LE(entry.offset+26)+bytes.readUInt16LE(entry.offset+28),packed=bytes.subarray(start,start+entry.compressed),lib=entry.method===0?packed:zlib.inflateRawSync(packed),file=path.join(tmp,abi+'.so');
  fs.writeFileSync(file,lib);await adb.upload(file,'/data/local/tmp/webview60-'+abi+'.so');
 }
 fs.rmSync(tmp,{recursive:true});
 console.log(await adb.shell('su 0 stop; su 0 mount -o rw,remount /dev/block/vda /system; su 0 cp /data/local/tmp/webview60.apk /system/app/webview/webview.apk; su 0 chown 0:0 /system/app/webview/webview.apk; su 0 chmod 644 /system/app/webview/webview.apk; su 0 restorecon /system/app/webview/webview.apk; su 0 start'));
 for(const abi of ['x86','x86_64'])console.log(await adb.shell('su 0 mkdir -p /system/app/webview/lib/'+abi+'; su 0 cp /data/local/tmp/webview60-'+abi+'.so /system/app/webview/lib/'+abi+'/libwebviewchromium.so; su 0 chown 0:0 /system/app/webview/lib/'+abi+'/libwebviewchromium.so; su 0 chmod 644 /system/app/webview/lib/'+abi+'/libwebviewchromium.so; su 0 restorecon -R /system/app/webview/lib'));
 console.log(await adb.shell('su 0 stop; su 0 start'));
 // Android N has no webviewupdate dump body; verify its package + selector.
 let after='';for(let i=0;i<180;i++){after=await adb.shell('dumpsys package com.android.webview');if(after.includes('versionName=60.0.3112.78'))break;if(i%15===0)console.log('Waiting for framework to scan provider60');await delay(1000);}
 assert(after.includes('versionName=60.0.3112.78'),after);
 const selection=await adb.shell('cmd webviewupdate set-webview-implementation com.android.webview');assert(selection.includes('Success'),selection);
 fs.writeFileSync(receipt,JSON.stringify({status:'pass',source:'https://github.com/LineageOS/android_external_chromium-webview_backup-20210212/blob/e205b2a0cda073ec655281f4b7f98ea8592b4d17/prebuilt/x86_64/webview.apk',gitBlob:'569b28e87c8ed3c95bd94c45148026902c9196b3',apkSha256:sha,apkBytes:bytes.length,before,after,selection,limitation:'Historical LineageOS Chromium60 build, AOSP API25 software emulator; not a physical device or Google-branded provider.'},null,2)+'\n');
 console.log('PASS Android accepts provider60; native game test must attest its actual UA');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(adb)adb.close();});
