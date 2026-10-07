// Replay existing assertions through the documented local CDP transport.
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const cwd=path.resolve(process.argv[2]||process.cwd()),out=path.resolve(process.argv[3]||__dirname);
const adapter=path.join(__dirname,'cdp-browser');fs.mkdirSync(out,{recursive:true});
const scenarios=['rift-status-contract','rift-status-mobile','rift-status-reduced-motion','support-stacking','support-save-reload','support-backup-restore','support-recovery','support-visibility-resume','p1-05-accessibility-baseline','p1-05-reduced-motion','parity-short','chronology-study-mid-window'];
const results=[];
async function run(scenario){return new Promise(resolve=>{
 const log=fs.openSync(path.join(out,scenario+'.log'),'w');
 const p=spawn(process.execPath,['tests/behavioral/run.cjs','--web-root','mobile/www','--scenario',scenario,'--raw-artifacts',path.join(out,'failed-processes')],{cwd,env:{...process.env,PATH:adapter+':'+process.env.PATH,LUMENFALL_QA_CDP_CHROME:'/usr/bin/chromium'},stdio:['ignore',log,log]});
 p.once('error',e=>{fs.closeSync(log);resolve({scenario,error:e.message,exitCode:null});});
 p.once('exit',code=>{fs.closeSync(log);const result={scenario,exitCode:code,transport:'CDP adapter; unchanged existing harness/assertions'};results.push(result);console.log(JSON.stringify(result));resolve(result);});
});}
(async()=>{for(let i=0;i<scenarios.length;i+=2)await Promise.all(scenarios.slice(i,i+2).map(run));fs.writeFileSync(path.join(out,'existing-checks.json'),JSON.stringify(results,null,2)+'\n');if(results.some(r=>r.exitCode!==0))process.exitCode=1;})();
