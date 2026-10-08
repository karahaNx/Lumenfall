/* Conditional design arithmetic, not an implemented/accepted game profile. */
const fs=require('node:fs'),path=require('node:path');
const levels=[0,5,10],policies=[
  {id:'A',normal:2,ultimate:3,status:'excluded-by-user-required-pause-with-both'},
  {id:'B',normal:1,ultimate:1.5,status:'user-numeric-contract-for-lead-swift-review'}
];
const rows=policies.flatMap(p=>levels.map((level,i)=>{
  const cycle=6/(1+.08*level),normal=Math.min(1,p.normal/cycle),ultimate=Math.min(1,p.ultimate/cycle);
  return {proposal:p.id,illustrativeStage:['early','mid','late'][i],charge:level,cycle,normal,ultimate,
    normalAnyMaximum:Math.min(1,2*normal),ultimateAnyMaximum:Math.min(1,2*ultimate),
    ultimateBothMinimum:Math.max(0,2*ultimate-1),ultimateBothMaximum:ultimate};
}));
const result={status:'USER_NUMERIC_CONTRACT_FOR_LEAD_SWIFT_REVIEW',chargeCap:10,minCycle:6/1.8,
  stageWarning:'charge anchors 0/5/10 approved for numerical targets; full progression fixtures still require coordination',policies,rows};
fs.writeFileSync(path.join(__dirname,'design-options.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,rows:rows.length}));
