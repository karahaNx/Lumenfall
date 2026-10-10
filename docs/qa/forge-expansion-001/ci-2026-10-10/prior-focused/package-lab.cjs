#!/usr/bin/env node
'use strict';
// Deterministic scratch-only evidence packaging. Never executes game tests.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const input=path.resolve(__dirname,'../ci-lab'),output=path.resolve(__dirname,'lab');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const files=[];
function save(relative,bytes,provenance){
  const target=path.join(output,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  assert(fs.readFileSync(target).equals(bytes),'written bytes retained '+relative);
  files.push({path:relative,bytes:bytes.length,sha256:hash(bytes),...provenance});
}
function copy(relative,source){const bytes=fs.readFileSync(path.join(input,source));save(relative,bytes,{original:{path:source,bytes:bytes.length,sha256:hash(bytes)},byteIdentical:true});}
const records=['boundary-stress.json','boundary.json','commit.txt','context.txt','core.json','mobile/receipt.json','prism-state.json','source-sha256.txt','source.txt','v8.json'];
for(const name of records)copy('lab-validation/'+name,'artifact/lab-validation/'+name);
const screenshots=[];
for(const project of ['adaptivegrowth','curriculum'])for(const width of [320,390,430])for(const scale of [1,2])for(const motion of ['no-preference','reduce'])screenshots.push('lab-'+project+'-'+width+'-'+scale+'-'+motion+'.png');
assert.deepEqual(fs.readdirSync(path.join(input,'artifact/lab-validation/mobile')).filter(n=>n.endsWith('.png')).sort(),screenshots.slice().sort(),'exactly the twenty-four new screenshots');
for(const name of screenshots)copy('lab-validation/mobile/'+name,'artifact/lab-validation/mobile/'+name);
const metadata=['acceptance.json','artifact-api.json','jobs-initial.json','poll-1.json','run-initial.json','synthetic-commit.json','zip-verification.json'];
for(const name of metadata)copy('metadata/'+name,name);
const logName='job-114189237200.log',log=fs.readFileSync(path.join(input,logName)),compressed=zlib.gzipSync(log,{level:9,mtime:0});
assert.equal(compressed.readUInt32LE(4),0,'gzip timestamp is zero');
assert(zlib.gunzipSync(compressed).equals(log),'gzip restores every original log byte');
assert(zlib.gzipSync(log,{level:9,mtime:0}).equals(compressed),'repeated compression is byte-identical');
save('logs/'+logName+'.gz',compressed,{original:{path:logName,bytes:log.length,sha256:hash(log)},compression:{format:'gzip',level:9,mtime:0,lossless:true,decodedSha256:hash(zlib.gunzipSync(compressed)),reproducible:true}});
const readme=Buffer.from(`# Research Lab CI evidence — run 38043830489\n\nThis package contains the new, successful Lab CI evidence for PR #105.\n\n- PR head: 03b78ce1d13ad1a04670315bad05174c406935ab\n- CI synthetic merge: 9e99a7d6d8ac89f4f557b2144b7e8cb6f64b6ff9\n- Tree: 118b0fcd905b3234d62d391cc5b0108c250a3bc0\n- Product SHA-256: 05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac\n- Run: https://github.com/karahaNx/Lumenfall/actions/runs/38043830489\n\n## Observed results\n\n| Check | Result |\n| --- | --- |\n| Lab core | PASS, 2456 assertions, 10 causal controls caught |\n| Lab boundary | PASS, 2344 assertions, 388 cases, 5 causal controls caught |\n| Boundary stress | PASS, 2182 cases, zero unavailable predictions and zero mismatches |\n| Prism state | PASS, 3506 assertions, 180 payouts, 8 routes |\n| Lab mobile | PASS, 6420 assertions, 12 profiles, 24 screenshots, exit 0 |\n| Actual V8 | PASS, 580 assertions, Node 8.3.0 / V8 6.0.286.52 |\n\n## Contents and integrity\n\nThe raw lab-validation receipts and screenshots are copied byte for byte. The\nmetadata directory preserves acceptance, API run/job/artifact metadata, the\nverified synthetic commit and the original ZIP integrity report. The original\nartifact ZIP, historical documents, test code and private save files are not\nincluded. These mobile receipts use fresh synthetic test seeds. The six test\nfiles already exist in the published head commit, and their archived bytes were\nverified against that commit during the CI audit.\n\nThe compressed job log restores the exact UTF-8 bytes returned by the GitHub job\nlog tool. It uses deterministic gzip level 9, a zero timestamp, and no filename\nheader. manifest.json records each original file's byte count and SHA-256; the\nlog entry also records both compressed and original SHA-256 values. Compression\nwas checked for exact byte restoration and reproducibility. No game tests were\nexecuted while preparing this package.\n\nThe manifest lists every payload file, including this README. Its own bytes are\nnot self-hashed. payloadBytes excludes manifest.json; payloadFiles excludes it\nas well. A package inventory/size report accompanies the scratch packaging\nscript outside this directory.\n\nThe mobile scale-2 profiles set the CSS root font from 16px to 32px, doubling\nrem-relative text. Fixed-px text may remain unchanged. This is browser evidence,\nnot native WebView textZoom or TalkBack acceptance.\n`,'utf8');
save('README.md',readme,{generated:true});
files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
const acceptance=JSON.parse(fs.readFileSync(path.join(input,'acceptance.json')));assert.equal(acceptance.status,'pass');
const manifest={formatVersion:1,runId:38043830489,headSha:acceptance.headSha,syntheticCommit:acceptance.syntheticCommit,treeSha:acceptance.treeSha,sourceSha256:acceptance.sourceSha256,artifact:acceptance.artifact,packaging:{script:'../package-lab.cjs',scriptSha256:hash(fs.readFileSync(__filename)),node:process.version,zlib:process.versions.zlib,rawCopies:'byte-identical',log:'lossless deterministic gzip',privateSaveFilesIncluded:false,historicalDocsIncluded:false,testCodeIncluded:false,artifactZipIncluded:false},payloadFiles:files.length,payloadBytes:files.reduce((n,f)=>n+f.bytes,0),files};
const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(output,'manifest.json'),manifestBytes);
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(directory,e.name)):[path.relative(output,path.join(directory,e.name))]).sort();
assert.deepEqual(walk(output),files.map(f=>f.path).concat('manifest.json').sort(),'closed package file set');
const inventory=files.map(f=>({path:f.path,bytes:f.bytes,sha256:f.sha256})).concat({path:'manifest.json',bytes:manifestBytes.length,sha256:hash(manifestBytes)}).sort((a,b)=>a.path.localeCompare(b.path,'en'));
const report={status:'pass',destination:output,runId:38043830489,files:inventory.length,bytes:inventory.reduce((n,f)=>n+f.bytes,0),pngFiles:24,pngBytes:inventory.filter(f=>f.path.endsWith('.png')).reduce((n,f)=>n+f.bytes,0),rawReceiptFiles:records.length,apiAndAcceptanceFiles:metadata.length,log:{originalBytes:log.length,originalSha256:hash(log),gzipBytes:compressed.length,gzipSha256:hash(compressed),roundtripByteIdentical:true,reproducible:true},manifest:{bytes:manifestBytes.length,sha256:hash(manifestBytes)},inventory};
fs.writeFileSync(path.resolve(__dirname,'lab-package-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
