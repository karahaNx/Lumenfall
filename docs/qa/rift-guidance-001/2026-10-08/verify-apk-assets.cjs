'use strict';
// Explicit source root keeps release verification bound to its exact version.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../../..'),{verifyZip}=require(root+'/scripts/lib/zip.cjs');
const [apk,sourceRoot,output,extractedIndex]=process.argv.slice(2);
assert(apk&&sourceRoot&&output&&extractedIndex,'APK, exact source root, result and extracted index are required');
const source=path.resolve(sourceRoot),bytes=fs.readFileSync(apk),entries=verifyZip(bytes),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=['index.html',...['fonts','branding'].flatMap(dir=>fs.readdirSync(path.join(source,dir),{recursive:true}).filter(f=>fs.statSync(path.join(source,dir,f)).isFile()).map(f=>dir+'/'+f))];
const matched=files.map(file=>{
 const row=entries.find(e=>e.name==='assets/public/'+file);assert(row,'bundled product asset exists: '+file);
 const at=row.offset,start=at+30+bytes.readUInt16LE(at+26)+bytes.readUInt16LE(at+28),packed=bytes.subarray(start,start+row.compressed),data=row.method===0?packed:zlib.inflateRawSync(packed);
 assert(data.equals(fs.readFileSync(path.join(source,file))),'byte-identical source asset: '+file);
 if(file==='index.html')fs.writeFileSync(extractedIndex,data);
 return {file,bytes:data.length,sha256:sha(data)};
});
const result={status:'pass',sourceRoot:source,apkBytes:bytes.length,apkSha256:sha(bytes),crcEntries:entries.length,matchedAssets:matched.length,files:matched};
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log('PASS '+entries.length+' APK ZIP CRC entries and '+matched.length+' exact-source assets');
