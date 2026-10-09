'use strict';
// One-shot preparation of a pinned, isolated candidate. Never touches main/releases.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
function once(s,from,to){assert.equal(s.split(from).length,2,'patch marker must occur once: '+from.slice(0,90));return s.replace(from,()=>to);}
function write(p,s){fs.writeFileSync(p+'.prism-tmp',s);fs.renameSync(p+'.prism-tmp',p);}
let game=read('index.html');const bytes=Buffer.from(game);
assert.equal(crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),'5dc741580e0dd238f38b02e01bb853ed2cf0b52d','pinned main source changed; reconcile explicitly');
const begin=game.indexOf('function ascendFullPrismGainForCleared('),end=game.indexOf('function ascendPrismGain(',begin);
assert(begin>=0&&end>begin);game=game.slice(0,begin)+read('scripts/dev/prism-earning-engine.js')+game.slice(end);
game=once(game,"['20% repeat reward',String(breakdown.reserve)+' Prisms']","['Repeat reward (base + earned bonus)',String(breakdown.reserve)+' Prisms']");
game=once(game,'Tree and completed Lab bonuses multiply together before the full reward is rounded down. Repeats round 20% of that whole reward down again. A small upgrade may keep the same whole-Prism reward. Lab work in progress adds its bonus when it finishes.','Tree and completed Lab bonuses multiply together. Repeats keep 20% of the unupgraded base plus the full earned upgrade bonus, rounded down once. Exact integer comparisons prevent floating-point errors at whole-Prism boundaries. Small upgrades can still share a whole-Prism value. Paid Lab work adds its bonus only when completed.');
game=once(game,'Repeat reward: 20% of your full reward, rounded down (at least 1 Prism). Clear beyond Rift ','Repeat reward: 20% of base plus the full earned upgrade bonus, rounded down once (at least 1 Prism). Clear beyond Rift ');
write('index.html',game);
const oracle=`// Independent modern-browser QA oracle; not part of the production APK.
function prismEarningOracle(c,benchmark,tree,lab){
  function root(n){if(n<2n)return n;var x=1n<<BigInt(Math.ceil(n.toString(2).length/2));for(;;){var y=(x+n/x)/2n;if(y>=x)return x;x=y;}}
  var p=(25n+BigInt(tree))*(20n+BigInt(lab));
  function curve(q){return c<15?0:Math.max(1,Number(root(4n*BigInt(c)*q*q)/500n));}
  var full=curve(p),reserve=benchmark>0&&full>0?curve(p-400n):0,progress=0;
  if(benchmark<=0)progress=full;
  else if(c>benchmark){
    var pp=p*p,upper=4n*pp*(BigInt(c)+BigInt(benchmark)),right=64n*pp*pp*BigInt(c)*BigInt(benchmark);
    function covers(k){var remainder=upper-k*k*250000n;return remainder<=0n||remainder*remainder<=right;}
    var k=BigInt(Math.max(0,Math.ceil(2*(Math.sqrt(c)-Math.sqrt(benchmark))*Number(p)/500)));
    while(!covers(k))k++;while(k>0n&&covers(k-1n))k--;progress=Number(k);
  }
  return {full:full,reserve:reserve,progressBonus:progress,gain:full===0?0:benchmark<=0?full:Math.min(full,reserve+progress)};
}
`;
let test=read('tests/behavioral/ascend-prisms.js');
const a=test.indexOf('  function expected(c,benchmark,tree,lab){'),z=test.indexOf('  function check(',a);assert(a>=0&&z>a);
test=oracle+test.slice(0,a)+'  function expected(c,benchmark,tree,lab){return prismEarningOracle(c,benchmark,tree,lab);}\n'+test.slice(z);
test=once(test,'[14,15,20,21,30,100]','[14,15,20,21,25,30,100]');
test=once(test,'[[0,0],[1,0],[0,1],[1,1],[17,18],[18,18]]','[[0,0],[1,0],[0,1],[1,1],[9,5],[10,10],[17,18],[18,18]]');
test=once(test,'// Explicit thresholds keep the original first/repeat contract, including 5 -> 6.','// Explicit thresholds cover the new protected-bonus repeat contract.');
test=once(test,'[[17,18,5],[18,18,5],[18,19,5],[18,20,6],[44,0,4],[45,0,5],[58,0,5],[59,0,6]]','[[17,18,21],[18,18,22],[18,19,22],[18,20,23],[44,0,17],[45,0,17],[58,0,22],[59,0,22],[0,0,1],[1,0,2],[4,0,3],[7,0,4],[9,0,5],[12,0,6]]');
test=once(test,"kill.summary.ascendGains[0]===5,'actual boss clear pays 5 once '","kill.summary.ascendGains[0]===21,'actual boss clear pays 21 once '");
test=once(test,"b.ascendBreakdown().gain===1,'pending Lab bonus excluded '","b.ascendBreakdown().gain===2,'pending Lab bonus excluded '");
test=once(test,"b.ascendBreakdown().gain===2,'completed Lab bonus included '","b.ascendBreakdown().gain===3,'completed Lab bonus included '");
test=once(test,"simultaneous.summary.ascendGains[0]===1&&", "simultaneous.summary.ascendGains[0]===2&&");
test=once(test,"textContent==='+5 Prisms'","textContent==='+21 Prisms'");
test=once(test,"assert(payout.gain===5,","assert(payout.gain===21,");
test=once(test,"policy:'approved new-depth-ceil; original first/repeat/minimum/full cap'","policy:'protected repeat bonus; exact integer boundaries; first/minimum/full cap retained'");
write('tests/behavioral/ascend-prisms.js',test);
let runner=read('tests/behavioral/run.cjs');
runner=once(runner,`'tree': ["(1 + nodeLevel('swift')*0.04) * longStudyPrismMult()", "1 * longStudyPrismMult()"]`,`'tree': ["var tree = nodeLevel('swift');", "var tree = 0;"]`);
runner=once(runner,`'lab': ["function longStudyPrismMult(){ return 1 + longStudyLevel('prismstudy')*0.05; }", "function longStudyPrismMult(){ return 1; }"]`,`'lab': ["var lab = longStudyLevel('prismstudy');", "var lab = 0;"]`);
write('tests/behavioral/run.cjs',runner);
let workflow=read('.github/workflows/pre-merge-validation.yml');workflow=once(workflow,'      - name: Stateful behavioral regression suite\n','      - name: Exact Prism earning numerical and causal regression\n        run: node tests/behavioral/prism-earning.cjs --source mobile/www/index.html\n\n      - name: Stateful behavioral regression suite\n');write('.github/workflows/pre-merge-validation.yml',workflow);
let agents=read('AGENTS.md');agents=once(agents,'## Language and new rules','PRISM_EARNING_001 is the separate, unreleased task-01 candidate for the user\'s\n9 October sequential-improvement mandate. Its protected-bonus repeat rule\nsupersedes the historical 20%-of-full rule only on that development candidate.\nNo main integration or APK publication is authorized before the combined release.\nSee [task and evidence](docs/tasks/PRISM_EARNING_001.md).\n\n## Language and new rules');write('AGENTS.md',agents);
console.log(JSON.stringify({status:'prepared',source_sha256:crypto.createHash('sha256').update(game).digest('hex'),scope:'Prism functions, explanations, existing test policy expectations, added tests; save schema/purchases/Android unchanged'}));
