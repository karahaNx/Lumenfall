'use strict';
// Verify the actual release APK container and every staged game asset.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../../..'),zip=require(root+'/scripts/lib/zip.cjs');
const [apk,output,extracted,sourceRoot]=process.argv.slice(2);assert(apk&&output&&extracted&&sourceRoot,'APK, JSON receipt, extracted index and explicit source root paths required');const source=path.resolve(sourceRoot);
const data=fs.readFileSync(apk),entries=zip.verifyZip(data),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),rows=[];
function payload(entry){const at=entry.offset+30+data.readUInt16LE(entry.offset+26)+data.readUInt16LE(entry.offset+28),b=data.subarray(at,at+entry.compressed);return entry.method===0?b:zlib.inflateRawSync(b);}
const files=['index.html',...['fonts','branding'].flatMap(d=>fs.readdirSync(source+'/'+d,{recursive:true}).filter(f=>fs.statSync(source+'/'+d+'/'+f).isFile()).map(f=>d+'/'+f))];
for(const file of files){const entry=entries.find(e=>e.name==='assets/public/'+file);assert(entry,'APK asset exists: '+file);const actual=payload(entry),expected=fs.readFileSync(source+'/'+file);assert(actual.equals(expected),'byte-identical released asset: '+file);rows.push({file,bytes:actual.length,sha256:sha(actual)});if(file==='index.html')fs.writeFileSync(extracted,actual);}
fs.writeFileSync(output,JSON.stringify({status:'pass',sourceRoot:source,apkBytes:data.length,apkSha256:sha(data),crcEntries:entries.length,matchedAssets:rows.length,files:rows},null,2)+'\n');console.log('PASS APK CRC and all '+rows.length+' byte-identical product/font/branding assets');
