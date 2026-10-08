// Compare exact relevant source ranges; does not accept the changed offline engine.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../../../..'),old=fs.readFileSync(path.join(repo,'index.html'),'utf8');
const input=process.argv[2];assert(input,'Pass the reconstructed latest main index.html');
const current=fs.readFileSync(input,'utf8');
const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(sha256(old),'f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4');
assert.equal(sha256(current),'4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607');
const ranges=[
  ['Lab/Forge/Tree catalogue, fixed original IDs, speed tiers','var RESEARCH = [','var ACHIEVEMENTS = ['],
  ['Actual multiplier/rounding formulas','function nodeLevel(','function moduleLevel('],
  ['Study price/work/start/speed/completion/queue','function studyEffectiveLevel(','function buyShopItem('],
  ['Canonical Lab ownership and paid snapshots','  var studyLevels =','  var achieved ='],
  ['Study event progress/completion/start scheduling','function simulationNextStudySeconds(','function simulationResearchLevelTotal(']
];
function section(src,start,end){const a=src.indexOf(start),b=src.indexOf(end,a);assert(a>=0&&b>a,start);return src.slice(a,b);}
const results=ranges.map(([label,start,end])=>{
  const a=section(old,start,end),b=section(current,start,end);
  assert.equal(a,b,label);return {label,unchanged:true,bytes:Buffer.byteLength(a),sha256:sha256(a)};
});
const result={oldCommit:'b2a1f440e8ad9fed34b37551e468224310d2a6f6',latestMain:'0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd',latestIndexBlob:'90e4678cb28fa833fdacbc01d1744d9465f6a356',latestIndexSha256:sha256(current),results,changed:'Offline scheduler resumability, save/restore transaction and return lifecycle; active tooling moved to Node.js. No full-engine acceptance claimed.'};
fs.writeFileSync(path.join(__dirname,'main-drift-analysis.json'),JSON.stringify(result,null,2)+'\n');
console.log('PASS five exact Lab catalogue/formula/snapshot source ranges unchanged on latest main; changed offline transaction still requires later integration checks.');
