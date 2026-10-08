'use strict';
// Verify the delivered APK against the exact integrated source and web assets.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),zlib=require('node:zlib'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../../..');
const [apk,version,buildTools,out]=process.argv.slice(2);
assert(apk&&/^\d+$/.test(version)&&buildTools&&out,'APK version build-tools output required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(apk),rows=require(root+'/scripts/lib/zip.cjs').verifyZip(bytes);
function payload(row){const at=row.offset+30+bytes.readUInt16LE(row.offset+26)+bytes.readUInt16LE(row.offset+28),packed=bytes.subarray(at,at+row.compressed);return row.method===8?zlib.inflateRawSync(packed):packed;}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const assets=['index.html',...files(root+'/fonts'),...files(root+'/branding')].map(p=>path.isAbsolute(p)?path.relative(root,p):p).sort();
const records=assets.map(file=>{const entry=rows.find(r=>r.name==='assets/public/'+file);assert(entry,'APK asset '+file);const actual=payload(entry),expected=fs.readFileSync(root+'/'+file);assert(actual.equals(expected),'exact integrated asset '+file);return {file,bytes:actual.length,sha256:sha(actual)};});
const identity=cp.execFileSync(process.execPath,[root+'/scripts/verify_apk_identity.cjs','--apk',apk,'--aapt',buildTools+'/aapt','--apksigner',buildTools+'/apksigner','--expected-package','com.lumenfall.app','--expected-version-code',version,'--expected-version-name','0.1.'+version,'--expected-cert-sha256','A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21'],{encoding:'utf8'});
const head=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/apk-identity.stdout.txt',identity);
fs.writeFileSync(out+'/apk-assets.json',JSON.stringify({status:'pass',integratedCommit:head,apkSha256:sha(bytes),version:'0.1.'+version,zipEntries:rows.length,assets:records},null,2)+'\n');
console.log(identity.trim());console.log('PASS all '+rows.length+' ZIP CRCs and '+records.length+' exact integrated web assets');
