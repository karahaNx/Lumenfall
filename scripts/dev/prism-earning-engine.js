// PRISM_EARNING_001: exact integer threshold checks on the WebView 60 runtime.
// Base-32768 limbs keep every multiply/carry below 2^31. No runtime BigInt.
function prismIntegerWords(value){
  var words=[];
  do {words.push(value%32768);value=Math.floor(value/32768);} while(value>0);
  return words;
}
function prismMultiplyWords(a,b){
  var out=[],i,j;
  for(i=0;i<a.length+b.length;i++) out.push(0);
  for(i=0;i<a.length;i++){
    var carry=0;
    for(j=0;j<b.length;j++){
      var part=out[i+j]+a[i]*b[j]+carry;
      out[i+j]=part%32768;carry=Math.floor(part/32768);
    }
    out[i+b.length]=carry;
  }
  while(out.length>1 && out[out.length-1]===0) out.pop();
  return out;
}
function prismCompareWords(a,b){
  if(a.length!==b.length) return a.length<b.length?-1:1;
  for(var i=a.length-1;i>=0;i--) if(a[i]!==b[i]) return a[i]<b[i]?-1:1;
  return 0;
}
function prismAddWords(a,b){
  var out=[],carry=0;
  for(var i=0;i<Math.max(a.length,b.length)||carry;i++){
    var n=(a[i]||0)+(b[i]||0)+carry;out.push(n%32768);carry=Math.floor(n/32768);
  }
  return out;
}
function prismSubtractWords(a,b){
  var out=[],borrow=0;
  for(var i=0;i<a.length;i++){
    var n=a[i]-(b[i]||0)-borrow;borrow=n<0?1:0;out.push(n+borrow*32768);
  }
  while(out.length>1 && out[out.length-1]===0) out.pop();
  return out;
}
function prismDepthDifferenceCeil(cleared,benchmark,numerator,approximate){
  var candidate=Math.ceil(approximate);
  if(!Number.isSafeInteger(cleared)||!Number.isSafeInteger(benchmark)||benchmark<0||
      !Number.isSafeInteger(numerator)||numerator<0||!Number.isSafeInteger(candidate)||candidate<0) return candidate;
  var c=prismIntegerWords(cleared),b=prismIntegerWords(benchmark),p=prismIntegerWords(numerator);
  var pp=prismMultiplyWords(p,p),denominator=prismIntegerWords(250000);
  var upper=prismMultiplyWords(prismIntegerWords(4),prismMultiplyWords(pp,prismAddWords(c,b)));
  var right=prismMultiplyWords(prismIntegerWords(64),
    prismMultiplyWords(prismMultiplyWords(pp,pp),prismMultiplyWords(c,b)));
  function covers(value){
    var n=prismIntegerWords(value),square=prismMultiplyWords(prismMultiplyWords(n,n),denominator);
    if(prismCompareWords(square,upper)>=0) return true;
    var rest=prismSubtractWords(upper,square);
    return prismCompareWords(prismMultiplyWords(rest,rest),right)<=0;
  }
  // Sign-check before squaring prevents false roots in the difference test.
  if(covers(candidate) && (candidate===0 || !covers(candidate-1))) return candidate;
  if(!covers(Number.MAX_SAFE_INTEGER)) return candidate;
  var low=0,high=Number.MAX_SAFE_INTEGER;
  while(low<high){
    var middle=low+Math.floor((high-low)/2);
    if(covers(middle)) high=middle;else low=middle+1;
  }
  return low;
}
function prismBonusNumerator(){
  // +4% Tree and +5% completed Lab compose as (25+t)(20+l)/500.
  var tree = nodeLevel('swift');
  var lab = longStudyLevel('prismstudy');
  return (25+tree)*(20+lab);
}
function prismCurveFloor(cleared,numerator,approximate){
  var candidate=Math.floor(approximate);
  // Keep the legacy Number fallback outside the safe-integer contract.
  // This is not a new gameplay cap or a claim of exact oversized currencies.
  if(!Number.isSafeInteger(cleared) || cleared<0 || !Number.isSafeInteger(numerator) || numerator<0 ||
      !Number.isSafeInteger(prismBonusNumerator()) || !Number.isSafeInteger(candidate) || candidate<0) return candidate;
  var p=prismIntegerWords(numerator),denominator=prismIntegerWords(250000);
  var target=prismMultiplyWords(prismIntegerWords(4),
    prismMultiplyWords(prismIntegerWords(cleared),prismMultiplyWords(p,p)));
  function compare(value){
    var n=prismIntegerWords(value);
    return prismCompareWords(prismMultiplyWords(prismMultiplyWords(n,n),denominator),target);
  }
  // n <= 2*sqrt(c)*p/500 iff n^2*500^2 <= 4*c*p^2.
  // Exact comparisons, not an arbitrary epsilon, decide integer boundaries.
  if(compare(candidate)<=0 && compare(candidate+1)>0) return candidate;
  if(compare(Number.MAX_SAFE_INTEGER+1)<=0) return candidate;
  var low=0,high=Number.MAX_SAFE_INTEGER;
  while(low<high){
    var middle=low+Math.ceil((high-low)/2);
    if(compare(middle)<=0) low=middle;else high=middle-1;
  }
  return low;
}
function ascendFullPrismGainForCleared(cleared){
  cleared = Math.max(0,Math.floor(cleared||0));
  return cleared>=15 ? Math.max(1,prismCurveFloor(cleared,prismBonusNumerator(),2*Math.sqrt(cleared)*prismMult())) : 0;
}
function ascendRepeatPrismGainForCleared(cleared){
  cleared = Math.max(0,Math.floor(cleared||0));
  if(cleared<15) return 0;
  // Discount the unupgraded base, never the earned upgrade portion.
  // 20% of base + 100% of the combined upgrade bonus, rounded down once.
  var numerator=prismBonusNumerator()-500*(1-ASCEND_REPEAT_REWARD_RATE);
  var factor=ASCEND_REPEAT_REWARD_RATE+Math.max(0,prismMult()-1);
  return Math.max(1,prismCurveFloor(cleared,numerator,2*Math.sqrt(cleared)*factor));
}
// Approved F05 policy: round the unrounded new-depth difference up once.
// Rationalize sqrt(c)-sqrt(b) to preserve small positive depth increments.
function ascendProgressPrismBonusForCleared(cleared,benchmark){
  if(cleared<=benchmark) return 0;
  var rawDifference = 2*((cleared-benchmark)/(Math.sqrt(cleared)+Math.sqrt(benchmark)));
  return prismDepthDifferenceCeil(cleared,benchmark,prismBonusNumerator(),rawDifference*prismMult());
}
function ascendPrismBreakdown(depth){
  var cleared = Math.max(0,(depth===undefined ? progressionDepth() : depth)-1);
  var full = ascendFullPrismGainForCleared(cleared);
  var benchmark = Math.max(0,Math.floor(state.ascendRewardedDepth||0));
  if(full<=0){
    return {gain:0,full:0,reserve:0,progressBonus:0,cleared:cleared,benchmark:benchmark};
  }
  if(benchmark<=0){
    return {gain:full,full:full,reserve:0,progressBonus:full,cleared:cleared,benchmark:0};
  }
  var reserve = ascendRepeatPrismGainForCleared(cleared);
  var progressBonus = ascendProgressPrismBonusForCleared(cleared,benchmark);
  var gain = Math.max(1,Math.min(full,reserve+progressBonus));
  return {
    gain:gain,
    full:full,
    reserve:reserve,
    progressBonus:progressBonus,
    cleared:cleared,
    benchmark:benchmark
  };
}
