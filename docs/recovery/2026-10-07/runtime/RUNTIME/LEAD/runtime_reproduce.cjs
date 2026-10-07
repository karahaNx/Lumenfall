'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const packet=path.resolve(__dirname,'..');
const qa=path.join(packet,'QA_04_05');
const acorn=require(path.join(qa,'REPRODUCE/acorn-8.15.0.js'));
const rows=[];
for(const [label,relative] of [['remote_R2','REFERENCE/R2_index.html'],['blocked_local','SOURCE/index.html']]){
  const bytes=fs.readFileSync(path.join(qa,relative));
  const html=bytes.toString('utf8');
  const scripts=Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),m=>m[1]);
  const grammar=[2017,2018,2019,2020].map(ecmaVersion=>{
    const failures=[];
    scripts.forEach((source,i)=>{try{acorn.parse(source,{ecmaVersion});}catch(e){failures.push({script:i+1,message:e.message,offset:e.pos,near:source.slice(Math.max(0,e.pos-35),e.pos+45)});}});
    return {ecmaVersion,pass:failures.length===0,failures};
  });
  const start=html.indexOf('function simulationApplyFarmPassive(');
  const end=html.indexOf('function simulationPassiveKillSeconds(',start);
  if(start<0||end<=start)throw Error('Exact farm/helper slice not located');
  const sandbox={BigInt:undefined,SIM_EPS:1e-9,state:{depth:1,enemyHp:8.03,enemyMaxHp:11},enemyHpFor:()=>11};
  sandbox.simulationBatchFarmKills=n=>{sandbox.kills=n;sandbox.state.enemyHp=11;};
  vm.createContext(sandbox);
  let absence;
  try{
    vm.runInContext(html.slice(start,end),sandbox,{timeout:1000});
    sandbox.simulationApplyFarmPassive(.9,1100,{},{});
    absence={pass:true,kills:sandbox.kills,hp:sandbox.state.enemyHp};
  }catch(e){absence={pass:false,error:String(e)};}
  rows.push({label,file:'QA_04_05/'+relative,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),inlineScripts:scripts.length,grammar,BigIntAbsent:absence});
}
const expected=rows[0].grammar.every(x=>x.pass)&&rows[0].BigIntAbsent.pass&&rows[0].BigIntAbsent.kills===90&&rows[1].grammar.slice(0,3).every(x=>!x.pass)&&rows[1].grammar[3].pass&&!rows[1].BigIntAbsent.pass&&/BigInt/.test(rows[1].BigIntAbsent.error);
const output={created:new Date().toISOString(),role:'00_15 Lead / Architecture',node:process.version,parser:acorn.version,scope:'Independent bounded grammar and exact farm/helper availability controls. Batch side effects are stubbed. Modern Node VM; not execution on Chrome60, Android, the whole motor or natural product DPS.',expectedBlockerConfirmed:expected,rows};
fs.writeFileSync(path.join(__dirname,'runtime_reproduce.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output));
if(!expected)process.exitCode=1;
