#!/usr/bin/env node
'use strict';
// Approved 7 October 2026 F05 rule. Prepare a separate local candidate.
const fs=require('node:fs'),path=require('node:path');
const ui=path.resolve(process.argv[2]||'/tmp/lumenfall-f05-ui-current');
const destination=path.resolve(process.argv[3]||'/tmp/lumenfall-f05-reward-proposal');
if(ui===destination)throw Error('Separate design variant required');
let source=fs.readFileSync(path.join(ui,'index.html'),'utf8');
function replace(old,next){if(source.split(old).length!==2)throw Error('Expected one design marker '+old.slice(0,60));source=source.replace(old,next);}
replace('function ascendPrismBreakdown(depth){',`// Approved F05 policy: round the unrounded new-depth difference up once.
// Rationalize sqrt(c)-sqrt(b) to preserve small positive depth increments.
function ascendProgressPrismBonusForCleared(cleared,benchmark){
  if(cleared<=benchmark) return 0;
  var rawDifference = 2*((cleared-benchmark)/(Math.sqrt(cleared)+Math.sqrt(benchmark)));
  return Math.ceil(rawDifference*prismMult());
}
function ascendPrismBreakdown(depth){`);
replace('  var benchmarkFull = ascendFullPrismGainForCleared(benchmark);\n  var progressBonus = cleared>benchmark ? Math.max(0,full-benchmarkFull) : 0;',
'  var progressBonus = ascendProgressPrismBonusForCleared(cleared,benchmark);');
replace('The new-depth bonus is the full reward here minus the reward at your best rewarded clear, using your current bonuses for both. Your total cannot exceed the full depth reward.',
'The new-depth bonus uses the difference between the depth curves before rounding, with your current Tree and Lab bonuses. That difference is rounded up once; the total cannot exceed the full depth reward.');
fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'index.html'),source);
for(const folder of ['fonts','branding'])fs.cpSync(path.join(ui,folder),path.join(destination,folder),{recursive:true});
console.log('Prepared approved new-depth rounding candidate at '+destination+'. First/repeat rules and save schema unchanged.');
