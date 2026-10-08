// Node20+ generator; product JavaScript remains byte-identical.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..'),target=process.argv[2];if(!target)throw Error('output path required');
let s=fs.readFileSync(root+'/tests/behavioral/support-uptime.cjs','utf8');
s=s.replaceAll("require('node:","require('").replace("require('assert/strict')","require('assert')");
s=s.replace("const root = path.resolve(__dirname, '../..');","const root = "+JSON.stringify(root)+"; assert.equal=assert.strictEqual;");
s=s.replace("  vm.runInContext(sourceScript","  context.globalThis=context;\n  vm.runInContext(sourceScript");
s=s.replace("assert.match(caught,/production (Ultimate duration|Swift minimum cycle)/,'causal timing control');","assert.ok(/production (Ultimate duration|Swift minimum cycle)/.test(caught),'causal timing control');");
s=s.replace('node:process.version,assertions','node:process.version,v8:process.versions.v8,assertions');fs.writeFileSync(target,s);
