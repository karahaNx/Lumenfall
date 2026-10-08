'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),zlib=require('node:zlib');
const zip=require('../../../scripts/lib/zip.cjs');
const [apk,output,extracted,sourceRoot]=process.argv.slice(2);
assert(apk&&output&&extracted&&sourceRoot,'APK, receipt, extracted HTML and explicit source root required');
const source=path.resolve(sourceRoot),data=fs.readFileSync(apk),entries=zip.verifyZip(data);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(new Set(entries.map(x=>x.name)).size,entries.length,'unique APK paths');
const files=['index.html',...['fonts','branding'].flatMap(d=>fs.readdirSync(path.join(source,d),{recursive:true})
 .filter(f=>fs.statSync(path.join(source,d,f)).isFile()).map(f=>d+'/'+f))].sort();
assert.equal(files.length,15,'complete current source/font/branding set');
const rows=[];
for(const file of files){const e=entries.find(x=>x.name==='assets/public/'+file);assert(e,'bundled asset '+file);
 const at=e.offset+30+data.readUInt16LE(e.offset+26)+data.readUInt16LE(e.offset+28);
 const packed=data.subarray(at,at+e.compressed),actual=e.method===0?packed:zlib.inflateRawSync(packed);
 assert(actual.equals(fs.readFileSync(path.join(source,file))),'byte-identical integrated asset '+file);
 rows.push({file,bytes:actual.length,sha256:sha(actual)});if(file==='index.html')fs.writeFileSync(extracted,actual);
}
const receipt={status:'pass',apkSHA256:sha(data),apkBytes:data.length,crcEntries:entries.length,sourceRoot:source,matchedAssets:rows.length,files:rows};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');console.log('PASS all APK CRC entries and15 exact integrated assets');
