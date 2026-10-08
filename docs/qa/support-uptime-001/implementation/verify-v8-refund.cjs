'use strict';
// Build independent exact-price fixtures on Node20+, then execute the unchanged
// product's migration/spending on the explicit legacy Node8 / V8 6.0 runtime.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const [runtime,index,output]=process.argv.slice(2);assert(runtime&&index&&output);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'support-v8-refund-'));
const fixtures=[1e18,1e30,1e100].flatMap(price=>[3.5,5000].map(wallet=>({price,wallet,needed:(BigInt(price)-BigInt(Math.floor(wallet))).toString(),short:(BigInt(price)-BigInt(Math.floor(wallet))-1n).toString()})));
let refund=0n;for(let k=10;k<25;k++)refund+=BigInt(Math.ceil(30*1.55**k));
fs.writeFileSync(path.join(dir,'fixtures.json'),JSON.stringify({fixtures,refund:refund.toString()}));
const driver=`'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const html=fs.readFileSync(process.argv[2],'utf8'),fixtures=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const script=html.match(/<script>\\s*([\\s\\S]*?)<\\/script>/)[1],marker="if(document.readyState==='loading'){";
const context=vm.createContext({window:{addEventListener:function(){}},document:{readyState:'loading',addEventListener:function(){}},console:console});
const bridge="window.legacyRefund={fresh:freshState,set:function(s){state=acceptPersistedState(s);},get:function(){return state;},can:canSpendShards,spend:spendShards,shortfall:shardShortfall};";
vm.runInContext(script.replace(marker,bridge+marker),context);const a=context.window.legacyRefund;let checks=0;
function eq(x,y,m){checks++;assert.strictEqual(x,y,m);}
fixtures.fixtures.forEach(function(f){var s=a.fresh();s.shards=f.wallet;s.exactRefundCredits.shards=f.short;a.set(s);eq(a.can(f.price),false,'short');eq(a.shortfall(f.price),1-f.wallet%1,'exact deficit');eq(a.spend(f.price),false,'reject');s.exactRefundCredits.shards=f.needed;a.set(s);eq(a.can(f.price),true,'affordable');eq(a.spend(f.price),true,'spend');eq(a.get().shards,f.wallet%1,'fraction');eq(a.get().exactRefundCredits.shards,'0','exact consumed');});
var s=a.fresh();s.shards=1e300;s.research.charge=25;a.set(s);eq(a.get().exactRefundCredits.shards,fixtures.refund,'original curve');eq(a.get().research.charge,25,'history');var canonical=JSON.parse(JSON.stringify(a.get()));a.set(canonical);eq(a.get().exactRefundCredits.shards,fixtures.refund,'idempotent');eq(a.get().shards,1e300,'large wallet');
console.log(JSON.stringify({status:'pass',checks:checks,sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),node:process.version,v8:process.versions.v8,fixtures:fixtures.fixtures.length}));`;
fs.writeFileSync(path.join(dir,'driver.cjs'),driver);
// Node8 cannot classify Node24's socket-backed spawn pipes. Regular output files
// retain real legacy execution and diagnostics without altering product code.
const stdoutFile=path.join(dir,'stdout'),stderrFile=path.join(dir,'stderr'),stdoutFd=fs.openSync(stdoutFile,'w'),stderrFd=fs.openSync(stderrFile,'w');
try{const r=spawnSync(runtime,[path.join(dir,'driver.cjs'),path.resolve(index),path.join(dir,'fixtures.json')],{stdio:['ignore',stdoutFd,stderrFd],timeout:30000});const stdout=fs.readFileSync(stdoutFile,'utf8'),stderr=fs.readFileSync(stderrFile,'utf8');if(r.status!==0)throw Error(stderr||stdout||String(r.error));const result=JSON.parse(stdout);assert.equal(result.status,'pass');assert(result.v8.startsWith('6.0.'));fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(stdout.trim());}finally{fs.closeSync(stdoutFd);fs.closeSync(stderrFd);fs.rmSync(dir,{recursive:true,force:true});}
