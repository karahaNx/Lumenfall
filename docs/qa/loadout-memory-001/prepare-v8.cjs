// Run on Node20+; generated VM contract runs on Node8.3/V8 6.0.
// Only the harness imports/assert/global object are adapted. Product bytes stay exact.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),out=process.argv[2];if(!out)throw Error('Output harness path required');
let s=fs.readFileSync(path.join(root,'tests/behavioral/loadout-memory.cjs'),'utf8').split('const browserBridge=')[0];
s=s.replaceAll("require('node:","require('").replace("require('assert/strict')","require('assert')").replace('globalThis.f25','global.f25');
s=s.replace("const args=process.argv.slice(2),root=path.resolve(__dirname,'../..');","const args=process.argv.slice(2),root="+JSON.stringify(root)+"; assert.deepEqual=assert.deepStrictEqual;");
s=s.replace('let checks=0;const records=[];','ctx.global=ctx;\nlet checks=0;const records=[];');
s+="\ncontracts();console.log(JSON.stringify({status:'pass',checks:checks,node:process.version,v8:process.versions.v8,sourceSHA256:crypto.createHash('sha256').update(original).digest('hex')}));\n";
fs.writeFileSync(out,s);
