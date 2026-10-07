const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=process.argv[2]||path.join(root,'qa/SOURCE/index.html');
const source=fs.readFileSync(file,'utf8');
const start=source.indexOf('function simulationApplyFarmPassive('),end=source.indexOf('function simulationPassiveKillSeconds(',start);
if(start<0||end<0)throw Error('Missing exact function boundaries');
const body=source.slice(start,end);
const eps=Number(source.match(/var SIM_EPS\s*=\s*([\d.eE+-]+)/)?.[1]);
if(eps!==1e-9)throw Error('Unexpected SIM_EPS');
function units(x){
  if(!Number.isFinite(x)||x<0)throw Error('Oracle requires finite nonnegative input');
  const b=new ArrayBuffer(8),v=new DataView(b);v.setFloat64(0,x,false);
  const q=v.getBigUint64(0,false),e=Number((q>>52n)&2047n);
  const m=(q&((1n<<52n)-1n))+(e?1n<<52n:0n);
  return m<<BigInt(e?e-1:0);
}
function exactKills(dps,parts,hp,maxHp){
  const damage=parts.reduce((a,s)=>a+units(dps*s),0n),initial=units(hp),full=units(maxHp);
  return {representedDamageUnits:damage.toString(),kills:Number(damage<initial?0n:1n+(damage-initial)/full)};
}
function run(dps,parts,hp){
  const state={enemyHp:hp,enemyMaxHp:11,depth:1},counts=[];
  const c={state,SIM_EPS:eps,enemyHpFor:()=>11,simulationBatchFarmKills(n){counts.push(n);state.enemyHp=11;}};
  vm.createContext(c);vm.runInContext(body,c);
  for(const s of parts)c.simulationApplyFarmPassive(s,dps,{},{});
  const actual=counts.reduce((a,b)=>a+b,0),expected=exactKills(dps,parts,hp,11).kills;
  return {dpsDecimalText:String(dps),parts,representedWholeDamageExactInteger:parts.length===1?BigInt(dps*parts[0]).toString():null,hp,expectedKills:expected,actualKills:actual,finalHp:state.enemyHp,batchCalls:counts,safe:Number.isSafeInteger(expected)&&Number.isSafeInteger(actual),match:actual===expected};
}
const output={scope:'Own Lead isolated exact function/helper execution; batch side effects stubbed. Natural DPS is the reviewed fixture value, not a rerun of its producer.',oracle:'IEEE represented per-part damage to BigInt units; partial HP then full enemies',source_sha256:crypto.createHash('sha256').update(source).digest('hex'),core:{whole:run(2**55+16,[1],11),split:run(2**55+16,[.5,.5],11)},qaReportedNaturalDps:{whole:run(40052722017724424,[.9],8.03),split:run(40052722017724424,[.01,.89],8.03)}};
for(const group of [output.core,output.qaReportedNaturalDps])for(const row of Object.values(group))if(!row.match)throw Error('Candidate does not conserve represented threshold kills');
fs.writeFileSync(path.join(__dirname,'LEAD_OWN_ARITHMETIC.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({source_sha256:output.source_sha256,core:[output.core.whole.actualKills,output.core.split.actualKills],qa:[output.qaReportedNaturalDps.whole.actualKills,output.qaReportedNaturalDps.split.actualKills],scope:output.scope}));
