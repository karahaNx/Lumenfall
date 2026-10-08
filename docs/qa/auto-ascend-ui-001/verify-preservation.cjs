'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const [baseline,out]=process.argv.slice(2);assert(baseline&&out,'Usage: node verify-preservation.cjs baseline-commit output.json');
const names=JSON.parse(fs.readFileSync(__dirname+'/protected-functions.json')).rows.map(r=>r.name);
const source=fs.readFileSync('index.html','utf8'),base=execFileSync('git',['show',baseline+':index.html'],{encoding:'utf8'});
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function capture(html){const window={addEventListener(){}},document={readyState:'loading',addEventListener(){}};const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",'window.qa={'+names.join(',')+"};if(document.readyState==='loading'){");new Function('window','document','localStorage','setTimeout','clearTimeout',script)(window,document,{},()=>{},()=>{});return window.qa;}
const before=capture(base),after=capture(source),rows=names.map(name=>{assert.equal(after[name].toString(),before[name].toString(),name+' must match integrated baseline');return {name,sha256:sha(after[name].toString())};});
fs.writeFileSync(out,JSON.stringify({status:'pass',baseline,candidateSourceSha256:sha(source),rows},null,2)+'\n');console.log('PASS '+rows.length+' protected gameplay/save functions unchanged from '+baseline);
