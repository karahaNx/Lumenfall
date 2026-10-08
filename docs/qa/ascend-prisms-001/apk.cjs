'use strict';
// Bind a published APK to its declared digest, signing identity and exact source.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const {verifyZip}=require('../../../scripts/lib/zip.cjs');
const {verifyApk}=require('../../../scripts/verify_apk_identity.cjs');
const [apk,sourceRoot,out,expectedSha,versionCode,tools]=process.argv.slice(2);
assert(apk&&sourceRoot&&out&&/^[a-f0-9]{64}$/.test(expectedSha||'')&&/^\d+$/.test(versionCode||'')&&tools,'APK, source root, output, published SHA256, version code and build-tools directory required');
const source=path.resolve(sourceRoot),bytes=fs.readFileSync(apk),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(bytes),expectedSha,'APK equals published release digest');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const identity=await verifyApk({apk,aapt:path.join(tools,'aapt'),apksigner:path.join(tools,'apksigner'),'expected-package':'com.lumenfall.app','expected-version-code':versionCode,'expected-version-name':'0.1.'+versionCode,'expected-cert-sha256':'A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21'});
 const entries=verifyZip(bytes),names=['index.html'];
 for(const d of ['fonts','branding'])for(const f of fs.readdirSync(path.join(source,d),{recursive:true}))if(fs.statSync(path.join(source,d,f)).isFile())names.push(d+'/'+f.split(path.sep).join('/'));
 assert.equal(names.length,15,'complete established game/font/branding asset set');
 const files=[];
 for(const name of names){
  const matches=entries.filter(e=>e.name==='assets/public/'+name);assert.equal(matches.length,1,'unique APK asset '+name);const e=matches[0];assert([0,8].includes(e.method));
  const at=e.offset+30+bytes.readUInt16LE(e.offset+26)+bytes.readUInt16LE(e.offset+28),compressed=bytes.subarray(at,at+e.compressed),actual=e.method===0?compressed:zlib.inflateRawSync(compressed),expected=fs.readFileSync(path.join(source,name));
  assert(actual.equals(expected),'released asset byte-identical to integrated source '+name);files.push({file:name,bytes:actual.length,sha256:sha(actual)});
  if(name==='index.html')fs.writeFileSync(path.join(out,'released-index.html'),actual);
 }
 const receipt={status:'pass',recordedAt:new Date().toISOString(),identity,apkSha256:expectedSha,apkBytes:bytes.length,crcEntries:entries.length,sourceRoot:source,matchedAssets:files.length,files,scope:'actual package/version/certificate, published digest, every ZIP CRC and complete exact source assets; runtime/native acceptance separate'};
 fs.writeFileSync(path.join(out,'apk-receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log('PASS published signed APK'+versionCode+': identity, CRCs and all '+files.length+' assets');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
