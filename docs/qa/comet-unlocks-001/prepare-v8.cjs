'use strict';
// Run this generator on Node20+, then run the generated focused check on Node8.3.
// Only harness imports/assert names and two object-spread expressions change.
// The supplied product HTML is parsed/executed without source transformations.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),out=process.argv[2];
if(!out)throw Error('Output harness path required');
let script=fs.readFileSync(root+'/tests/behavioral/comet-unlocks-core.cjs','utf8');
script=script.replace("require('node:fs')","require('fs')").replace("require('node:path')","require('path')").replace("require('node:assert/strict')","require('assert')");
script=script.replace("const root=path.resolve(__dirname,'../..');","const root="+JSON.stringify(root)+"; assert.equal=assert.strictEqual; assert.deepEqual=assert.deepStrictEqual;");
script=script.replace("fs.readFileSync(path.join(root,'index.html'),'utf8')","fs.readFileSync(process.argv[2]||path.join(root,'index.html'),'utf8')");
script=script.replace("{...options,clockStartMs:seed.lastSeen+i*15000}","Object.assign({},options,{clockStartMs:seed.lastSeen+i*15000})").replace("{...options,kind:'live'}","Object.assign({},options,{kind:'live'})");
script=script.replace("status:'pass',cases:records.length,records","status:'pass',node:process.version,v8:process.versions.v8,source:process.argv[2]||root+'/index.html',cases:records.length,records");
fs.writeFileSync(out,script);
