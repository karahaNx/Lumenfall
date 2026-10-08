#!/usr/bin/env node
'use strict';
// Run the integrated product's existing process-aware Lab drivers unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const candidate=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||'');
const {instrumentHtml,loadFixtures,runScenario}=require(path.join(candidate,'tests/behavioral/run.cjs'));
const {serve}=require(path.join(candidate,'scripts/lib/static-server.cjs'));
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const stage=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-f12-drivers-'));
 let server;const records=[];
 try{
  fs.writeFileSync(path.join(stage,'index.html'),instrumentHtml(fs.readFileSync(path.join(candidate,'index.html'),'utf8'),loadFixtures()));
  for(const name of ['fonts','branding'])fs.cpSync(path.join(candidate,name),path.join(stage,name),{recursive:true});
  server=await serve(stage);
  for(const scenario of ['lab-motes-offline-integration','lab-motes-runtime','lab-motes-native','lab-motes-reduced-motion']){
   const lines=[];
   process.env.LUMENFALL_QA_EVIDENCE_DIR=path.join(out,scenario);
   const passed=await runScenario('/usr/bin/chromium','http://127.0.0.1:'+server.address().port,scenario,'fresh',null,{log:line=>{lines.push(line);console.log(line);}});
   fs.writeFileSync(path.join(out,scenario+'.log'),lines.join('\n')+'\n');
   records.push({scenario,passed});assert(passed,scenario);
  }
 }finally{
  if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  fs.rmSync(stage,{recursive:true,force:true});
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({node:process.version,browser:'Chromium 151; modern browser only',records},null,2)+'\n');
 }
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
