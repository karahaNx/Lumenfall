'use strict';
// Generate a Node8/V8 6.0 harness; never transform the supplied product source.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),out=process.argv[2];
if(!out)throw Error('Output harness path required');
let script=fs.readFileSync(root+'/tests/behavioral/formation-bonds.cjs','utf8')
 .replaceAll("require('node:","require('")
 .replace("require('assert/strict')","require('assert')");
script=script.replace("const source=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');",
 "assert.equal=assert.strictEqual;assert.deepEqual=assert.deepStrictEqual;const source=fs.readFileSync(process.argv[2]||"+JSON.stringify(root+'/index.html')+",'utf8');");
script=script.replace("path.join(__dirname,'fixtures.json')",JSON.stringify(root+'/tests/behavioral/fixtures.json'));
script=script.replace("status:'pass',sourceSha256:",
 "status:'pass',node:process.version,v8:process.versions.v8,limitation:'JS engine probe only; native WebView60/device acceptance remains required',sourceSha256:");
fs.writeFileSync(out,script);
