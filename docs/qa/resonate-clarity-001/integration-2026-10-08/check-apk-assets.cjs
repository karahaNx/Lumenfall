'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../../..'),apk=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]||__dirname);
const {verifyZip}=require(root+'/scripts/lib/zip.cjs'),bytes=fs.readFileSync(apk),rows=verifyZip(bytes),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function read(name){const r=rows.find(x=>x.name===name);assert(r,'APK asset '+name);const n=r.offset+30+bytes.readUInt16LE(r.offset+26)+bytes.readUInt16LE(r.offset+28),b=bytes.subarray(n,n+r.compressed);return r.method===0?b:zlib.inflateRawSync(b);}
function files(d,p){return fs.readdirSync(root+'/'+d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(d+'/'+e.name,p+'/'+e.name):[p+'/'+e.name]);}
const matched=['index.html',...files('fonts','fonts'),...files('branding','branding')].map(file=>{const actual=read('assets/public/'+file),expected=fs.readFileSync(root+'/'+file);assert(actual.equals(expected),'Exact integrated asset '+file);return {file,bytes:actual.length,sha256:hash(actual)};});
const index=read('assets/public/index.html');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/apk-index.html',index);
const result={status:'pass',apkPath:apk,apkBytes:bytes.length,apkSha256:hash(bytes),crcEntries:rows.length,matchedAssets:matched.length,files:matched};
fs.writeFileSync(out+'/apk-assets.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
