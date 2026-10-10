#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Module=require('node:module'),cp=require('node:child_process'),assert=require('node:assert/strict');
const entry=path.resolve(process.argv[2]),source=path.resolve(process.argv[3]),out=path.resolve(process.argv[4]),verifiedAt=process.argv[5];
assert(/^2026-10-10T\d\d:\d\d:\d\dZ$/.test(verifiedAt),'trusted audit UTC required');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let receipt;
const child=new Module(entry,module);child.filename=entry;child.paths=Module._nodeModulePaths(path.dirname(entry));
child.require=function(name){if(name==='node:child_process')return {spawnSync:function(exec,args){assert.equal(exec,process.execPath);assert.equal(args[1],source);const r=cp.spawnSync(exec,['--check',args[0]],{encoding:'utf8'});receipt={status:r.status===0?'pass':'fail',verifiedAt,clockSource:'clock__curr_time UTC supplied by caller',sourceSha256:hash(fs.readFileSync(source)),testSha256:hash(fs.readFileSync(entry)),transportSha256:hash(fs.readFileSync(path.join(path.dirname(entry),'prism-acceptance.cjs'))),adaptedDriverSha256:hash(fs.readFileSync(args[0])),node:process.version,exitCode:r.status,stderr:r.stderr,scope:'Generated complete Chromium driver syntax only. No Chrome launch, page execution or browser acceptance claimed.'};return r;}};return Module.prototype.require.call(this,name);};
const original=process.argv;process.argv=[process.execPath,entry,source,path.join(path.dirname(out),'syntax-only-no-browser')];
try{child._compile(fs.readFileSync(entry,'utf8'),entry);}finally{process.argv=original;}
assert(receipt,'one adapted-driver syntax check');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
