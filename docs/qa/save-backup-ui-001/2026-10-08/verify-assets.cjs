'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../../..');
const {verifyZip}=require(path.join(root,'scripts/lib/zip.cjs'));
const [apk,output,sourceCommit]=process.argv.slice(2);
assert(apk&&output&&sourceCommit,'Usage: node verify-assets.cjs APK output-directory integrated-commit');
const data=fs.readFileSync(apk),rows=verifyZip(data);
function payload(row){const at=row.offset+30+data.readUInt16LE(row.offset+26)+data.readUInt16LE(row.offset+28);const packed=data.subarray(at,at+row.compressed);return row.method===0?packed:zlib.inflateRawSync(packed);}
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const assets=['index.html',...walk('fonts'),...walk('branding')].sort().map(file=>{
  const entry=rows.find(r=>r.name==='assets/public/'+file);assert(entry,'APK entry missing: '+file);
  const bytes=payload(entry),source=fs.readFileSync(path.join(root,file));assert(bytes.equals(source),'packaged asset differs: '+file);
  const extracted=path.join(output,file);fs.mkdirSync(path.dirname(extracted),{recursive:true});fs.writeFileSync(extracted,bytes);
  return {file,bytes:bytes.length,sha256:sha(bytes),matches_source:true};
});
const result={status:'pass',source_commit:sourceCommit,apk_sha256:sha(data),apk_bytes:data.length,zip_crc_verified_entries:rows.length,matched_source_assets:assets.length,assets};
fs.writeFileSync(path.join(output,'assets.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,source_commit:sourceCommit,apk_sha256:result.apk_sha256,zip_crc_verified_entries:rows.length,matched_source_assets:assets.length}));
