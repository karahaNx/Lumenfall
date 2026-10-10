'use strict';
// Run the immutable pre-Tree game, never the evolving working index.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(process.argv[2]||'/workspace/scratch/0848c4e4f365/Lumenfall-tree');
const commit='2d01049393e3bb45a90d80e07af52ae0484b0ec5';
const source=cp.execFileSync('git',['show',commit+':index.html'],{cwd:repo,encoding:'utf8',maxBuffer:4*1024*1024});
const H=require(path.join(repo,'tests/behavioral/forge-expansion-harness.cjs'));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
assert.equal(sha(source),'05742431ab6bffefce09d0bebefa754190ed836cc51f4aeeb81e8a9d769419ac');
const view=s=>({prisms:s.prisms,lumen:s.lumen,ascendCount:s.ascendCount,ascendRewardedDepth:s.ascendRewardedDepth,depth:s.depth,ember:s.spirits.ember,motes:s.motes});
const records=[];
for(const fault of ['none','primary','recovery']){
 const a=H.app(source),q=a.q,s=H.seed(q);s.depth=s.enemyDepth=51;s.enemyHp=s.enemyMaxHp=1e12;s.ascendCount=3;s.ascendRewardedDepth=25;s.spirits.ember=20;s.lumen=1000;
 q.set(s);assert.equal(q.save(),true);const before=view(q.get()),quote=q.prismPreview();a.fail(fault==='primary',fault==='recovery');const returned=q.ascend();
 const after=view(q.get()),primary=view(JSON.parse(a.storage.get(H.P))),recovery=view(JSON.parse(a.storage.get(H.R)));
 records.push({fault,before,quote,returned:returned===undefined?'undefined':returned,after,primary,recovery,primaryFailureRolledBack:fault!=='primary'||JSON.stringify(after)===JSON.stringify(before)});
}
process.stdout.write(JSON.stringify({kind:'baseline-manual-Ascend-primary-write-failure',commit,sourceSha256:sha(source),harnessSha256:sha(fs.readFileSync(path.join(repo,'tests/behavioral/forge-expansion-harness.cjs'))),reproducerSha256:sha(fs.readFileSync(__filename)),node:process.versions.node,v8:process.versions.v8,clock:H.CLOCK,sourceSelection:'git show '+commit+':index.html',records,scope:'Actual unchanged manual Ascend, primary/recovery storage, and complete game IIFE; synthetic fixture and storage fault only.'},null,2)+'\n');
