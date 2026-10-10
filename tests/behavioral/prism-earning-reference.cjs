'use strict';
// Independent Node-only policy oracle. BigInt never ships with the game.
const assert=require('node:assert/strict');
function root(n){
  if(n<2n)return n;
  let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));
  for(;;){const next=(x+n/x)/2n;if(next>=x)return x;x=next;}
}
function reward(clear,benchmark,tree,lab){
  for(const value of [clear,benchmark,tree,lab])assert(Number.isSafeInteger(value)&&value>=0,'oracle requires nonnegative safe integers');
  if(clear<15)return 0;
  const p=(25n+BigInt(tree))*(20n+BigInt(lab));
  const curve=q=>{const value=Number(root(4n*BigInt(clear)*q*q)/500n);assert(Number.isSafeInteger(value),'oracle result must be exactly representable');return Math.max(1,value);};
  const full=curve(p);if(!benchmark)return full;
  let progress=0;
  if(clear>benchmark){
    const pp=p*p,upper=4n*pp*(BigInt(clear)+BigInt(benchmark)),right=64n*pp*pp*BigInt(clear)*BigInt(benchmark);
    // Independent integer search, not the production floating estimate/limbs.
    let low=0n,high=BigInt(full)+1n;
    while(low<high){const mid=(low+high)/2n,rest=upper-mid*mid*250000n;if(rest<=0n||rest*rest<=right)high=mid;else low=mid+1n;}
    progress=Number(low);
  }
  return Math.min(full,curve(p-400n)+progress);
}
function legacyPolicy(current,frozen){
  // A counterfactual for unchanged scheduler/economy comparisons only.
  // The caller verifies the immutable historical source hash. Never use this
  // instrumented source as acceptance of the actual new Prism policy.
  function range(s){
    const first='function ascendFullPrismGainForCleared(',last='function ascendPrismGain(';
    assert.equal(s.split(first).length,2);assert.equal(s.split(last).length,2);
    const begin=s.indexOf(first),end=s.indexOf(last,begin);assert(end>begin);return [begin,end];
  }
  const [a,z]=range(current),[b,y]=range(frozen);
  return current.slice(0,a)+frozen.slice(b,y)+current.slice(z);
}
module.exports={reward,legacyPolicy};
