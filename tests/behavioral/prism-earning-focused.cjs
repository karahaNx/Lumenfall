#!/usr/bin/env node
'use strict';
// Exercise the existing browser driver unchanged, and reject transport failures
// masquerading as successful negative controls. Full default CI stays separate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const webRoot=path.resolve(process.argv[2]||'mobile/www');
const output=path.resolve(process.argv[3]||'prism-feature-validation/browser');
fs.mkdirSync(output,{recursive:true});
const {rawQaObservation}=require('./raw-result.cjs');
function causal(record){return !!record&&record.process?.exitcode===0&&record.process.timed_out===false&&record.qa?.valid===true&&record.qa.qa_status==='fail'&&record.qa.runtime_error_count===0&&Array.isArray(record.qa.runtime_markers)&&record.qa.runtime_markers.length===0;}
const valid={process:{exitcode:0,timed_out:false},qa:{valid:true,qa_status:'fail',runtime_error_count:0,runtime_markers:[]}};
assert(causal(valid));
for(const patch of [{process:{exitcode:1,timed_out:false}},{process:{exitcode:0,timed_out:true}},{qa:{...valid.qa,valid:false}},{qa:{...valid.qa,qa_status:'pass'}},{qa:{...valid.qa,runtime_error_count:1}},{qa:{...valid.qa,runtime_markers:['crash']}}])assert(!causal({...valid,...patch}),'invalid negative evidence must reject');
const positives=['ascend-prisms-contract','ascend-prisms-save-reload','ascend-prisms-backup-restore','ascend-prisms-recovery'];
const negatives=['tree','lab','payout','repeat','rounding'].map(x=>'self-test-ascend-prisms-'+x);
const rows=[];
for(const scenario of positives.concat(negatives)){
 const folder=fs.mkdtempSync(path.join(output,scenario+'-')),raw=path.join(folder,'raw');
 const result=cp.spawnSync(process.execPath,[path.join(__dirname,'run.cjs'),'--web-root',webRoot,'--scenario',scenario,'--raw-artifacts',raw],{encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});
 fs.writeFileSync(path.join(folder,'stdout.txt'),result.stdout||'');fs.writeFileSync(path.join(folder,'stderr.txt'),result.stderr||'');
 const negative=negatives.includes(scenario);let accepted=false,reason='';
 if(result.error||result.signal)reason='driver did not complete normally';
 else if(!negative)accepted=result.status===0&&(result.stdout||'').includes('PASS '+scenario)&&(result.stdout||'').includes('Behavioral QA passed: 1 deterministic scenario(s).');
 else if(result.status!==0&&fs.existsSync(raw)){
  const paths=fs.readdirSync(raw).map(name=>path.join(raw,name)).filter(p=>fs.existsSync(path.join(p,'process.json')));
  if(paths.length===1){
   const record=JSON.parse(fs.readFileSync(path.join(paths[0],'process.json'),'utf8'));
   const {observation,payload}=rawQaObservation(fs.readFileSync(path.join(paths[0],'stdout.html'),'utf8'),scenario);
   accepted=causal(record)&&observation.valid&&observation.qa_status==='fail'&&payload.runtimeErrors.length===0;
   reason=accepted?'completed in-page assertion caught defect':'invalid or runtime-failed negative evidence';
  }else reason='no unique raw completed result';
 }
 const row={scenario,negative,accepted,exitcode:result.status,reason};rows.push(row);console.log(JSON.stringify(row));
}
const receipt={status:rows.every(r=>r.accepted)?'pass':'fail',source_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(webRoot,'index.html'))).digest('hex'),transport:'unchanged default browser driver',rows};
fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2));
assert.equal(receipt.status,'pass','focused browser assertions or causal controls failed; inspect raw evidence');
