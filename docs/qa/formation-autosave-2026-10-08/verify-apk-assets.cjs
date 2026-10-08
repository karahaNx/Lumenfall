'use strict';
// Check every ZIP CRC and compare the full shipped product asset set with an
// explicit integrated source checkout. No historical hard-coded asset hashes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../..'),zip=require(root+'/scripts/lib/zip.cjs');
const [apk,output,extracted,sourceRoot]=process.argv.slice(2);
assert(apk&&output&&extracted&&sourceRoot,'APK, receipt, extracted HTML and integrated source root required');
const source=path.resolve(sourceRoot),data=fs.readFileSync(apk),entries=zip.verifyZip(data),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function walk(dir,prefix){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),prefix+'/'+e.name):[prefix+'/'+e.name]);}
const files=['index.html',...walk(source+'/fonts','fonts'),...walk(source+'/branding','branding')].sort(),rows=[];
for(const file of files){
 const entry=entries.find(e=>e.name==='assets/public/'+file);assert(entry,'APK asset present: '+file);
 const at=entry.offset+30+data.readUInt16LE(entry.offset+26)+data.readUInt16LE(entry.offset+28),packed=data.subarray(at,at+entry.compressed);
 const actual=entry.method===0?packed:zlib.inflateRawSync(packed),expected=fs.readFileSync(source+'/'+file);
 assert(actual.equals(expected),'APK asset equals integrated source bytes: '+file);
 rows.push({file,bytes:actual.length,sha256:sha(actual)});if(file==='index.html')fs.writeFileSync(extracted,actual);
}
fs.writeFileSync(output,JSON.stringify({status:'pass',sourceRoot:source,apkBytes:data.length,apkSha256:sha(data),crcEntries:entries.length,matchedAssets:rows.length,files:rows},null,2)+'\n');
console.log('PASS APK CRC and all '+rows.length+' byte-identical product/font/branding assets');
