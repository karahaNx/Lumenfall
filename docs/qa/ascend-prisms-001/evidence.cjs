#!/usr/bin/env node
'use strict';
// Collect/verify raw receipts without altering their decompressed original bytes.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {hash,inside}=require('../../../scripts/lib/cli.cjs');
function files(root){
  return fs.readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(row=>{
    if(row.isSymbolicLink())throw Error('Evidence symlink is not allowed');
    const full=path.join(root,row.name);
    return row.isDirectory()?files(full):row.isFile()?[full]:[];
  });
}
function verify(root){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  for(const row of manifest.files){
    const stored=fs.readFileSync(inside(root,row.path));
    if(stored.length!==row.storedBytes||hash(stored)!==row.storedSha256)throw Error('Stored evidence mismatch '+row.path);
    const raw=row.gzip?zlib.gunzipSync(stored):stored;
    if(raw.length!==row.rawBytes||hash(raw)!==row.rawSha256)throw Error('Raw evidence mismatch '+row.path);
  }
  const recorded=new Set(manifest.files.map(row=>row.path));
  for(const file of files(root)){
    const relative=path.relative(root,file).split(path.sep).join('/');
    if(relative!=='manifest.json'&&!recorded.has(relative))throw Error('Unrecorded evidence '+relative);
  }
  console.log('PASS '+manifest.files.length+' evidence files; stored and uncompressed hashes verified');
  return manifest;
}
function collect(root,sources){
  if(fs.existsSync(root))throw Error('Use a new output directory; existing receipts are not overwritten');
  const manifest={recordedAt:new Date().toISOString(),scope:'F05 local candidate, synthetic browser states; not Android or remote acceptance',sources:[],files:[]};
  for(const source of sources){
    const separator=source.indexOf('='),label=source.slice(0,separator),input=path.resolve(source.slice(separator+1));
    if(separator<1||!/^[A-Za-z0-9_-]+$/.test(label))throw Error('Expected LABEL=DIRECTORY');
    if(root===input||root.startsWith(input+path.sep)||input.startsWith(root+path.sep))throw Error('Evidence input/output must be separate');
    manifest.sources.push({label,input});
    for(const file of files(input)){
      const raw=fs.readFileSync(file),relative=path.relative(input,file).split(path.sep).join('/');
      const gzip=path.basename(file)!=='receipt.json'&&/\.(html|txt|log|json)$/.test(file)&&raw.length>4096;
      const stored=gzip?zlib.gzipSync(raw,{level:9}):raw;
      const destination=label+'/'+relative+(gzip?'.gz':'');
      const output=inside(root,destination);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,stored);
      manifest.files.push({path:destination,gzip,rawBytes:raw.length,rawSha256:hash(raw),storedBytes:stored.length,storedSha256:hash(stored)});
    }
  }
  fs.mkdirSync(root,{recursive:true});fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  return verify(root);
}
module.exports={collect,verify};
if(require.main===module){
  try{
    const [mode,target,...sources]=process.argv.slice(2);
    if(!target||!['collect','verify'].includes(mode)||(mode==='verify'&&sources.length))throw Error('Usage: evidence.cjs collect OUTPUT LABEL=DIRECTORY ... | verify DIRECTORY');
    if(mode==='collect'&&!sources.length)throw Error('Evidence sources required');
    if(mode==='verify')verify(path.resolve(target));else collect(path.resolve(target),sources);
  }catch(error){console.error(error.stack);process.exitCode=1;}
}
