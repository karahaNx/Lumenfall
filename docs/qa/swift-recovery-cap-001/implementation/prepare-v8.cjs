'use strict';
// Generate an ES2017 harness. Product JavaScript is executed unchanged in V8 6.0.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..'),out=process.argv[2];
if(!out)throw Error('Output path required');
const core=fs.readFileSync(root+'/tests/behavioral/swift-recovery-core.cjs','utf8');
const app=core.slice(core.indexOf('function app(){'),core.indexOf('function test('));
const script=`'use strict';
const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const source=process.argv[2]||${JSON.stringify(root+'/index.html')},html=fs.readFileSync(source,'utf8');
const copy=x=>JSON.parse(JSON.stringify(x));
${app}
const b=app().b,records=[];
function seed(level,wallet){const s=b.fresh();s.research.charge=level;s.shards=wallet;s.depth=41;s.maxDepthEver=101;s.enemyDepth=41;s.enemyHp=1e100;s.enemyMaxHp=1e100;s.lastSeen=2000000000000;return s;}
for(const level of [0,9,10,11,78,1000,1e300]){
 const s=seed(level,level>10?1e30:43);b.set(s);assert.strictEqual(b.get().research.charge,level);assert(b.cycle()>=10/3);
 const canonical=copy(b.get());assert.deepStrictEqual(b.normalize(canonical),canonical);assert(b.save());assert.deepStrictEqual(b.decode(b.backup()),canonical);
 const before=b.hex(b.get());assert(b.spend(30));const after=b.hex(b.get());b.set(copy(b.get()));assert.strictEqual(b.hex(b.get()),after);
 const prices=[];for(let i=10;i<level;i++){const p=Math.ceil(30*Math.pow(1.55,i));if(!Number.isFinite(p))break;prices.push(p);}
 records.push({level,wallet:s.shards,prices,beforeHex:before,afterHex:after,cycle:b.cycle()});
 if(level>=10){const before=copy(b.get());b.buy('max');b.queue();assert.deepStrictEqual(b.get(),before);}
}
const s=seed(10,0);b.set(s);const cycle=b.cycle();const r=b.advance(cycle,{kind:'live',clockStartMs:s.lastSeen,captureTimeline:true});assert.strictEqual(r.timeline.filter(e=>e.type==='ability').length,1);
console.log(JSON.stringify({status:'pass',source,sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),node:process.version,v8:process.versions.v8,records}));
`;
fs.writeFileSync(out,script);
