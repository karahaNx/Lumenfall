'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {verifyZip}=require('../../../scripts/lib/zip.cjs');
const [apk,reference,out]=process.argv.slice(2),bytes=fs.readFileSync(apk);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const entries=verifyZip(bytes),assets=[];
function walk(dir){return fs.readdirSync(path.join(reference,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
const sourceAssets=['index.html',...walk('fonts'),...walk('branding')];
const apkAssets=entries.filter(e=>/^assets\/public\/(index\.html$|fonts\/|branding\/)/.test(e.name)&&!e.name.endsWith('/')).map(e=>e.name.slice('assets/public/'.length));
assert.equal(sourceAssets.length,15,'complete F26 integration asset set');
assert.deepEqual(apkAssets.sort(),sourceAssets.slice().sort(),'APK/source asset sets match exactly');
for(const name of sourceAssets){
  const entry=entries.find(x=>x.name==='assets/public/'+name);assert(entry,'APK asset '+name);
  const at=entry.offset+30+bytes.readUInt16LE(entry.offset+26)+bytes.readUInt16LE(entry.offset+28);
  const packed=bytes.subarray(at,at+entry.compressed),data=entry.method===0?packed:zlib.inflateRawSync(packed);
  assert.equal(sha(data),sha(fs.readFileSync(path.join(reference,name))),'exact integrated asset '+name);
  assets.push({name,bytes:data.length,sha256:sha(data)});
  if(name==='index.html')fs.writeFileSync(path.join(path.dirname(out),'apk-index.html'),data);
}
const result={status:'pass',apkSha256:sha(bytes),apkBytes:bytes.length,zipEntriesValidated:entries.length,assets};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
