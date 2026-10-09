#!/usr/bin/env node
'use strict';
// Modern Node oracle only. No BigInt syntax/API ships in the Android app.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const args=process.argv.slice(2),at=args.indexOf('--source');
const sourcePath=at<0?'index.html':args[at+1];assert(sourcePath,'--source requires a path');
const source=fs.readFileSync(sourcePath,'utf8');
assert(source.includes("{name:'Ascend', meta:'Permanent progression', desc:'After clearing at least 15 Rifts, restart the run for Prisms. Repeats keep 20% of the unupgraded base plus the full earned upgrade bonus, rounded down once. Clearing beyond your best rewarded Rift adds a new-depth bonus. Permanent systems stay.'}"),'Encyclopedia Ascend summary matches the protected repeat-bonus rule');
function single(name){const m=source.match(new RegExp('function '+name+'\\([^\\n]*\\}'));assert(m,'missing production function '+name);return m[0];}
const start=source.indexOf('// PRISM_EARNING_001:'),end=source.indexOf('function ascendPrismGain(',start);
assert(start>=0 && end>start,'candidate reward functions are not installed');
const block=source.slice(start,end),helpers=['nodeLevel','longStudyLevel','longStudyPrismMult','prismMult'].map(single).join('\n');
function engine(code=block){const c={ASCEND_REPEAT_REWARD_RATE:0.20,BigInt:undefined,state:null};vm.createContext(c);vm.runInContext(helpers+'\nfunction progressionDepth(){return state.riftMode===\'farm\'?state.farmReturnDepth:state.depth;}\n'+code,c,{timeout:2000});return c;}
function sqrt(n){if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));for(;;){const y=(x+n/x)/2n;if(y>=x)return x;x=y;}}
function numerator(t,l){return (25n+BigInt(t))*(20n+BigInt(l));}
function floorCurve(c,t,l,repeat){if(c<15)return 0;let p=numerator(t,l)-(repeat?400n:0n);return Math.max(1,Number(sqrt(4n*BigInt(c)*p*p)/500n));}
function progress(c,b,t,l){if(c<=b)return 0;const p=numerator(t,l),pp=p*p,upper=4n*pp*(BigInt(c)+BigInt(b)),right=64n*pp*pp*BigInt(c)*BigInt(b);function covers(k){let r=upper-k*k*250000n;return r<=0n||r*r<=right;}let k=BigInt(Math.max(0,Math.ceil(2*(Math.sqrt(c)-Math.sqrt(b))*Number(p)/500)));while(!covers(k))k++;while(k>0n&&covers(k-1n))k--;return Number(k);}
function expected(c,b,t,l){const full=floorCurve(c,t,l,false);if(!full)return {gain:0,full:0,reserve:0,progressBonus:0};if(!b)return {gain:full,full,reserve:0,progressBonus:full};const reserve=floorCurve(c,t,l,true),delta=progress(c,b,t,l);return {gain:Math.min(full,reserve+delta),full,reserve,progressBonus:delta};}
function seed(c,b,t,l){return {depth:c+1,riftMode:'push',farmReturnDepth:0,ascendRewardedDepth:b,nodes:{swift:t},longStudyLevels:{prismstudy:l},activeStudies:[],prisms:100};}
let assertions=0,formulaCases=0;function equal(a,b,m){assertions++;assert.equal(a,b,m);}
const e=engine();
function check(c,t,l){e.state=seed(c,c,t,l);equal(e.ascendFullPrismGainForCleared(c),floorCurve(c,t,l,false),'full '+[c,t,l]);equal(e.ascendRepeatPrismGainForCleared(c),floorCurve(c,t,l,true),'repeat '+[c,t,l]);formulaCases+=2;}
for(let c=0;c<=500;c++)for(const t of [0,1,5,7,9,10,17,20,45,100])for(const l of [0,1,5,10,18,20,25,50])check(c,t,l);
for(let n=4;n<=70;n++)for(let t=0;t<=50;t++)for(let l=0;l<=25;l++)check(n*n,t,l);
let random=0x5eed;function rand(){random=(Math.imul(random,1664525)+1013904223)>>>0;return random;}
for(let i=0;i<10000;i++)check(15+rand()%100000000,rand()%1000,rand()%1000);
for(const c of [2**32-1,2**40,Number.MAX_SAFE_INTEGER-1])for(const t of [0,7,100,1000])for(const l of [0,10,1000])check(c,t,l);
let payoutCases=0;
for(const c of [14,15,16,19,20,21,25,30,49,50,100,119,250,1000,1000000])for(const b of [0,15,c-1,c,c+1,219])for(const t of [0,1,7,9,10,17,20])for(const l of [0,1,5,10,18,20]){
 e.state=seed(c,b,t,l);const before=JSON.stringify(e.state),want=expected(c,b,t,l),got=e.ascendPrismBreakdown();
 for(const k of Object.keys(want))equal(got[k],want[k],'breakdown '+[c,b,t,l,k]);
 equal(JSON.stringify(e.state),before,'preview is pure');e.state.riftMode='farm';e.state.farmReturnDepth=c+1;e.state.depth=1;equal(e.ascendPrismBreakdown().gain,want.gain,'Farm uses return progression');payoutCases++;
}
for(let i=0;i<10000;i++){let c=16+rand()%1000000,b=15+rand()%(c-14),t=rand()%100,l=rand()%100;e.state=seed(c,b,t,l);equal(e.ascendProgressPrismBonusForCleared(c,b),progress(c,b,t,l),'independent new-depth ceil');}
for(const t of [0,1,7,10,20,100])for(const l of [0,1,10,20]){let previous=-1;for(let c=15;c<=500;c++){e.state=seed(c,1000,t,l);let now=e.ascendPrismBreakdown().gain;assertions++;assert(now>=previous,'deeper repeat must not pay less');previous=now;}}
for(const c of [15,20,25,50,119,250])for(const b of [0,15,c,1000])for(const l of [0,1,10,20]){let previous=-1;for(let t=0;t<=100;t++){e.state=seed(c,b,t,l);let now=e.ascendPrismBreakdown().gain;assertions++;assert(now>=previous,'Tree levels must not reduce payout');previous=now;}}
for(const c of [15,20,25,50,119,250])for(const b of [0,15,c,1000])for(const t of [0,1,10,20]){let previous=-1;for(let l=0;l<=100;l++){e.state=seed(c,b,t,l);let now=e.ascendPrismBreakdown().gain;assertions++;assert(now>=previous,'completed Lab levels must not reduce payout');previous=now;}}
const negativeControls=[];
function caught(name,transform,c,b,t,l){const changed=transform(block);assert.notEqual(changed,block,'mutant must change code');const mutant=engine(changed);mutant.state=seed(c,b,t,l);let failed=false;try{const got=mutant.ascendPrismBreakdown(),want=expected(c,b,t,l);for(const k of Object.keys(want))assert.equal(got[k],want[k]);}catch(error){if(!(error instanceof assert.AssertionError))throw error;failed=true;}assert(failed,'causal control escaped: '+name);negativeControls.push(name);}
caught('old-repeat-penalizes-bonus',s=>s.replace('var reserve = ascendRepeatPrismGainForCleared(cleared);','var reserve = Math.max(1,Math.floor(full*ASCEND_REPEAT_REWARD_RATE));'),20,20,7,0);
caught('drop-tree',s=>s.replace("var tree = nodeLevel('swift');",'var tree = 0;'),20,0,10,0);
caught('drop-completed-lab',s=>s.replace("var lab = longStudyLevel('prismstudy');",'var lab = 0;'),25,0,0,10);
caught('floating-full-floor',s=>s.replace('var candidate=Math.floor(approximate);','var candidate=Math.floor(approximate); return candidate;'),25,0,10,10);
caught('floating-progress-ceil',s=>s.replace('var candidate=Math.ceil(approximate);','var candidate=Math.ceil(approximate); return candidate;'),49,16,35,5);
caught('displayed-vs-cleared-rift',s=>s.replace('progressionDepth() : depth)-1','progressionDepth() : depth)'),24,0,0,0);
caught('count-bonus-twice',s=>s.replace('var reserve = ascendRepeatPrismGainForCleared(cleared);','var reserve = 2*ascendRepeatPrismGainForCleared(cleared);'),20,20,7,0);
e.state=seed(20,219,0,2);const pending=e.ascendPrismBreakdown().gain;e.state.activeStudies=[{id:'prismstudy',remainingSec:1}];equal(e.ascendPrismBreakdown().gain,pending,'paid but unfinished study grants no early bonus');
// Numerical legacy fallback is intentionally not an exact-currency guarantee.
e.state=seed(Number.MAX_VALUE,Number.MAX_VALUE/4,0,0);const extreme=e.ascendPrismBreakdown();assertions++;assert(Number.isFinite(extreme.full)&&Number.isFinite(extreme.gain));
const rows=[];for(const t of [0,1,5,7,10,20]){e.state=seed(20,20,t,0);rows.push({cleared:20,swift:t,clarity:0,...e.ascendPrismBreakdown()});}
console.log(JSON.stringify({status:'pass',source_sha256:crypto.createHash('sha256').update(source).digest('hex'),node:process.version,assertions,formulaCases,payoutCases,negativeControls,rows,scope:'actual extracted production reward functions; full browser, persistence and Android are separate gates'}));
