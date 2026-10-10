#!/usr/bin/env node
'use strict';
// Independent old-engine cases and actual purchase ROI, not elapsed-time claims.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const sourcePath=process.argv[2]||'index.html',out=process.argv[3]||'prism-closeout-data';fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(sourcePath,'utf8'),single=n=>{const m=html.match(new RegExp('function '+n+'\\([^\\n]*\\}'));assert(m,n);return m[0];};
const {reward}=require('./prism-earning-reference.cjs');
const start=html.indexOf('// PRISM_EARNING_001:'),end=html.indexOf('function ascendPrismGain(',start);assert(start>=0&&end>start);
const cost=html.match(/function nodeCost\(node\)\{[\s\S]*?\n\}/)[0];
const nodes=html.slice(html.indexOf('var NODES = ['),html.indexOf('\n];',html.indexOf('var NODES = ['))+3);
const ctx={state:null,ASCEND_REPEAT_REWARD_RATE:0.20};vm.createContext(ctx);
vm.runInContext(['nodeLevel','longStudyLevel','longStudyPrismMult','prismMult'].map(single).join('\n')+'\n'+nodes+'\n'+cost+'\n'+html.slice(start,end),ctx);
function set(c,b,t,l){ctx.state={depth:c+1,nodes:{swift:t},longStudyLevels:{prismstudy:l},ascendRewardedDepth:b};}
function actual(c,b,t,l){set(c,b,t,l);return ctx.ascendPrismBreakdown(c+1).gain;}
function price(t){set(20,20,t,0);return ctx.nodeCost(ctx.NODES.find(n=>n.id==='swift'));}
const rows=[];let checks=0;const eq=(a,b,m)=>{checks++;assert.equal(a,b,m);};
for(const c of [20,50,119,250,1000])for(const l of [0,10,20])for(const t of [0,1,5,7,8,9,10,15,20,30,40,50]){
 const gain=actual(c,c,t,l),next=actual(c,c,t+1,l),want=reward(c,c,t,l),cost=price(t);eq(gain,want,'actual reward equals independent oracle');
 let total=0,step=0,improved=gain;while(improved===gain&&step<100){total+=price(t+step);step++;improved=actual(c,c,t+step,l);}
 assert(improved>gain,'useful upgrade found');checks++;const old=Math.max(1,Math.floor(Math.floor(2*Math.sqrt(c)*(1+t*.04)*(1+l*.05))*.2));assert(gain>=old);checks++;
 rows.push({cleared:c,clarity:l,swift:t,legacyRepeat:old,newRepeat:gain,nextPrice:cost,nextGain:next,marginalPrisms:next-gain,
  earnsNextPriceInAscends:Math.ceil(cost/gain),nextPurchasePaybackAscends:next>gain?Math.ceil(cost/(next-gain)):null,
  firstUsefulLevel:t+step,firstUsefulTotalPrice:total,firstUsefulReward:improved,usefulBundlePaybackAscends:Math.ceil(total/(improved-gain))});
}
const cases=[];for(const c of [14,15,16,19,20,21,25,49,50,119,250,1000,1000000])for(const b of [0,15,c,1000001])for(const t of [0,1,7,10,20,100])for(const l of [0,1,10,20])cases.push({c,b,t,l,want:reward(c,b,t,l)});
const result={status:'pass',sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),checks,rows,
 scope:'actual purchase prices and canonical repeat gains; no price changes; payback assumes fixed cleared Rift and completed Lab levels; no minutes/hours or campaign-balance claim'};
fs.writeFileSync(path.join(out,'roi.json'),JSON.stringify(result,null,2)+'\n');fs.writeFileSync(path.join(out,'legacy-cases.json'),JSON.stringify({sourceSha256:result.sourceSha256,cases})+'\n');console.log(JSON.stringify({status:'pass',checks,legacyCases:cases.length,sourceSha256:result.sourceSha256,examples:rows.filter(r=>r.cleared===20&&r.clarity===0&&[7,10,20,30].includes(r.swift)),scope:result.scope}));
