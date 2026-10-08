#!/usr/bin/env node
'use strict';
// Prepare a separate local proposal; never writes the product index.html.
const fs=require('node:fs'),path=require('node:path');
const sourcePath=path.resolve(process.argv[2]||'index.html');
const destination=path.resolve(process.argv[3]||'/tmp/lumenfall-f05-ui');
if(destination===path.dirname(sourcePath))throw Error('Separate proposal directory required');
let s=fs.readFileSync(sourcePath,'utf8');
function replace(old,next){if(s.split(old).length!==2)throw Error('Expected one marker: '+old.slice(0,70));s=s.replace(old,next);}
replace('        <div class="lock-note" id="ascend-note"></div>',`        <div class="lock-note" id="ascend-note"></div>
        <div class="prism-calculation" id="prism-calculation" aria-label="Prism reward calculation"></div>`);
replace("  .prism-preview{font-family:'IBM Plex Mono',monospace;font-size:1.6rem;font-weight:600;color:var(--prism);}",`  .prism-preview{font-family:'IBM Plex Mono',monospace;font-size:1.6rem;font-weight:600;color:var(--prism);}
  .prism-calculation{width:100%;text-align:left;font-size:.8rem;color:var(--ink-dim);line-height:1.5;overflow-wrap:break-word;}
  .prism-calculation dl{margin:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:5px 10px;}
  .prism-calculation dt,.prism-calculation dd{margin:0;}
  .prism-calculation dd{text-align:right;color:var(--ink);}
  .prism-calculation p{margin:10px 0 0;}`);
replace("  els['ascend-btn'].setAttribute('aria-describedby','ascend-note');","  els['ascend-btn'].setAttribute('aria-describedby','ascend-note prism-calculation');");
replace("    els['ascend-note'].textContent = 'New progress: '+formatNum(breakdown.reserve)+' reserve + '+formatNum(breakdown.progressBonus)+' depth bonus. Benchmark becomes cleared Rift '+cleared+'.';", "    els['ascend-note'].textContent = 'New progress: '+formatNum(breakdown.reserve)+' repeat reward + '+formatNum(breakdown.progressBonus)+' new-depth bonus, up to '+formatNum(breakdown.full)+' Prisms. Best rewarded clear becomes Rift '+cleared+'.';");
replace("    els['ascend-note'].textContent = 'Repeat reward: 20% reserve. Push beyond cleared Rift '+breakdown.benchmark+' to add a depth bonus.';", "    els['ascend-note'].textContent = 'Repeat reward: 20% of your full reward, rounded down (at least 1 Prism). Clear beyond Rift '+breakdown.benchmark+' to add a new-depth bonus.';");
replace("function renderAscendSummary(){",`// Display approximations are marked; the canonical breakdown determines payout.
function prismCalculationText(breakdown){
  var tree=1+nodeLevel('swift')*0.04,lab=longStudyPrismMult();
  var base=2*Math.sqrt(breakdown.cleared),raw=base*prismMult();
  function approximate(value){return 'about '+value.toFixed(3);}
  var rows=[['Cleared Rift',String(breakdown.cleared)],
    ['Depth reward before bonuses',approximate(base)],
    ['Swift Ascension',nodeLevel('swift')+' levels · +'+(nodeLevel('swift')*4)+'%'],
    ['Ascendant Clarity',longStudyLevel('prismstudy')+' completed levels · +'+(longStudyLevel('prismstudy')*5)+'%'],
    ['Combined bonus',approximate(tree*lab)+'×']];
  if(breakdown.full>0){
    rows.push(['With bonuses, before rounding',approximate(raw)]);
    rows.push(['Full depth reward',String(breakdown.full)+' Prisms']);
    if(breakdown.benchmark>0){
      rows.push(['Best rewarded clear','Rift '+breakdown.benchmark]);
      rows.push(['20% repeat reward',String(breakdown.reserve)+' Prisms']);
      if(breakdown.cleared>breakdown.benchmark) rows.push(['New-depth bonus',String(breakdown.progressBonus)+' Prisms']);
    }
  }
  rows.push(['You receive now',String(breakdown.gain)+' Prisms']);
  return '<dl>'+rows.map(function(row){return '<dt>'+row[0]+'</dt><dd>'+row[1]+'</dd>';}).join('')+'</dl>'+
    '<p>Tree and completed Lab bonuses multiply together before the full reward is rounded down. Repeats round 20% of that whole reward down again. A small upgrade may keep the same whole-Prism reward. Lab work in progress adds its bonus when it finishes.</p>'+
    (breakdown.cleared>breakdown.benchmark && breakdown.benchmark>0 ? '<p>The new-depth bonus is the full reward here minus the reward at your best rewarded clear, using your current bonuses for both. Your total cannot exceed the full depth reward.</p>' : '');
}
function renderAscendSummary(){`);
replace("  var gain = eligible ? breakdown.gain : 0;\n  els['prism-preview'].textContent", "  var gain = eligible ? breakdown.gain : 0;\n  document.getElementById('prism-calculation').innerHTML = prismCalculationText(breakdown);\n  els['prism-preview'].textContent");
fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'index.html'),s);
for(const folder of ['fonts','branding'])fs.cpSync(path.join(path.dirname(sourcePath),folder),path.join(destination,folder),{recursive:true});
console.log('Prepared separate local UI proposal at '+destination+'; economy and save functions unchanged.');
