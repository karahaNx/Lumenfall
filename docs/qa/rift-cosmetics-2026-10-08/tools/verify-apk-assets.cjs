'use strict';
// Require exact integrated source bytes; do not verify against a mutable latest tag.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),zlib=require('zlib');
const zip=require('../../../../scripts/lib/zip.cjs');
const [apk,sourceRoot,receipt,extracted]=process.argv.slice(2);assert(apk&&sourceRoot&&receipt&&extracted,'APK, source root, receipt and extracted index required');
const data=fs.readFileSync(apk),entries=zip.verifyZip(data),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),files=['index.html'];
function visit(relative){for(const entry of fs.readdirSync(path.join(sourceRoot,relative),{withFileTypes:true})){const file=relative+'/'+entry.name;if(entry.isDirectory())visit(file);else if(entry.isFile())files.push(file);}}
visit('fonts');visit('branding');const rows=[];
for(const file of files){const entry=entries.find(e=>e.name==='assets/public/'+file);assert(entry,'bundled asset '+file);const start=entry.offset+30+data.readUInt16LE(entry.offset+26)+data.readUInt16LE(entry.offset+28),packed=data.subarray(start,start+entry.compressed),actual=entry.method===0?packed:zlib.inflateRawSync(packed),expected=fs.readFileSync(path.join(sourceRoot,file));assert(actual.equals(expected),'byte-identical source asset '+file);rows.push({file,bytes:actual.length,sha256:sha(actual)});if(file==='index.html')fs.writeFileSync(extracted,actual);}
fs.writeFileSync(receipt,JSON.stringify({status:'pass',apkBytes:data.length,apkSha256:sha(data),sourceRoot:path.resolve(sourceRoot),crcEntries:entries.length,matchedAssets:rows.length,files:rows},null,2)+'\n');console.log('PASS '+entries.length+' APK CRC checks and '+rows.length+' exact source/font/branding assets');
