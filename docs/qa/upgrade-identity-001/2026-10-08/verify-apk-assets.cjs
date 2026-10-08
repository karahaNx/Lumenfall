'use strict';
// Bind every bundled product/font/branding asset to an explicit source root and
// the externally recorded release digest. All ZIP entries must pass CRC first.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../../..'),zip=require(root+'/scripts/lib/zip.cjs');
const [apk,sourceRoot,expectedDigest,output,extracted]=process.argv.slice(2);
assert(apk&&sourceRoot&&/^[a-f0-9]{64}$/.test(expectedDigest||'')&&output&&extracted,'APK, explicit source root, release SHA256, receipt and extracted index required');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex'),data=fs.readFileSync(apk),source=path.resolve(sourceRoot);
assert.equal(sha(data),expectedDigest,'downloaded APK equals recorded release digest');
const entries=zip.verifyZip(data),files=['index.html',...['fonts','branding'].flatMap(dir=>fs.readdirSync(path.join(source,dir),{recursive:true}).filter(f=>fs.statSync(path.join(source,dir,f)).isFile()).map(f=>dir+'/'+f))].sort(),rows=[];
assert.equal(files.length,15,'complete current product asset set');
for(const file of files){
 const entry=entries.find(e=>e.name==='assets/public/'+file);assert(entry,'APK asset exists '+file);
 const start=entry.offset+30+data.readUInt16LE(entry.offset+26)+data.readUInt16LE(entry.offset+28),packed=data.subarray(start,start+entry.compressed),actual=entry.method===0?packed:zlib.inflateRawSync(packed),expected=fs.readFileSync(path.join(source,file));
 assert(actual.equals(expected),'byte-identical product asset '+file);rows.push({file,bytes:actual.length,sha256:sha(actual)});
 const target=file==='index.html'?extracted:path.join(path.dirname(extracted),file);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,actual);
}
fs.writeFileSync(output,JSON.stringify({status:'pass',sourceRoot:source,apkSha256:sha(data),apkBytes:data.length,crcEntries:entries.length,matchedAssets:rows.length,files:rows},null,2)+'\n');
console.log('PASS APK CRC and all15 byte-identical product assets');
