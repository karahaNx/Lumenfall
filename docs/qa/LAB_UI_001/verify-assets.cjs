'use strict';
// Bind all staged product assets to a specific source checkout and APK bytes.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {verifyZip}=require('../../../scripts/lib/zip.cjs');
const [apk,sourceRoot,output,extractedIndex]=process.argv.slice(2);
assert(apk&&sourceRoot&&output&&extractedIndex,'APK, source root, receipt and extracted index required');
const root=path.resolve(sourceRoot),bytes=fs.readFileSync(apk),rows=verifyZip(bytes),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=['index.html'];
function walk(relative){for(const entry of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){const name=relative+'/'+entry.name;assert(!entry.isSymbolicLink(),'no source symlinks');if(entry.isDirectory())walk(name);else if(entry.isFile())files.push(name);}}
walk('fonts');walk('branding');
const assets=rows.filter(row=>/^assets\/public\/(?:index\.html$|fonts\/|branding\/)/.test(row.name));
assert.deepEqual(assets.map(row=>row.name.slice('assets/public/'.length)).sort(),files.slice().sort(),'exact complete staged source asset set');
const records=files.sort().map(file=>{const row=assets.find(row=>row.name==='assets/public/'+file),at=row.offset+30+bytes.readUInt16LE(row.offset+26)+bytes.readUInt16LE(row.offset+28),packed=bytes.subarray(at,at+row.compressed),actual=row.method===8?zlib.inflateRawSync(packed):packed,expected=fs.readFileSync(path.join(root,file));assert(actual.equals(expected),'APK/source bytes '+file);if(file==='index.html')fs.writeFileSync(extractedIndex,actual);return {path:file,bytes:actual.length,sha256:hash(actual)};});
fs.writeFileSync(output,JSON.stringify({status:'pass',apkSha256:hash(bytes),apkBytes:bytes.length,sourceRoot:root,assets:records,zipEntries:rows.length},null,2)+'\n');
console.log('PASS complete APK assets, ZIP CRCs and exact source bytes: '+records.length+' files');
