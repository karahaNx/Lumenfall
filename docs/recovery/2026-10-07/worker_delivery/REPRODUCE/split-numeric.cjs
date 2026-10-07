const fs=require('fs'),vm=require('vm');const src=fs.readFileSync(__dirname+'/repo/index.html','utf8'),body=src.slice(src.indexOf('function simulationApplyFarmPassive('),src.indexOf('function simulationPassiveKillSeconds('));
function units(x){let b=Buffer.alloc(8);b.writeDoubleBE(x);let v=b.readBigUInt64BE(),e=Number(v>>52n&2047n),m=(v&((1n<<52n)-1n))+(e?1n<<52n:0n);return m<<BigInt(e?e-1:0);}
const c={state:null,kills:0,SIM_EPS:1e-9,enemyHpFor:()=>c.state.enemyMaxHp,simulationBatchFarmKills:n=>{c.kills+=n;c.state.enemyHp=c.state.enemyMaxHp;}};vm.createContext(c);vm.runInContext(body,c);let rows=[],bad=[],boundary=[];
for(let H of [11,17,1e6,1e50,1e220,11.5])for(let n of [90,2**32+1,2**50+1,2**51+1,2**52-1,Number.MAX_SAFE_INTEGER-100])for(let f of [.73,.37,.03,1])for(let phase of [.03,.2,.7]){
 const D=H*(n+phase),hp=H*f,d=units(D),h=units(hp),m=units(H),expected=Number(1n+(d-h)/m);if(!Number.isSafeInteger(expected))continue;
 let rem=(d-h)%m,margin=rem<m-rem?rem:m-rem;
 if(margin<=units(Math.max(1e-9,H*1e-12))){boundary.push({H,n,f,phase});continue;}
 let outcomes=[];for(let split of [false,true]){c.state={enemyHp:hp,enemyMaxHp:H,depth:1};c.kills=0;if(split){c.simulationApplyFarmPassive(.5,D,{},{});c.simulationApplyFarmPassive(.5,D,{},{});}else c.simulationApplyFarmPassive(1,D,{},{});outcomes.push({split,kills:c.kills,hp:c.state.enemyHp});}
 let exactHpRatio=Number((m-rem)*1000000000000000n/m)/1e15;
 const record={H,n,f,phase,D,expected,exactRepresentedHalves:units(D/2)*2n===d,outcomes,exactHpRatio,pass:outcomes.every(r=>r.kills===expected&&Math.abs(r.hp/H-exactHpRatio)<=1e-12+1e-9/H)};rows.push(record);if(!record.pass)bad.push(record);
}
fs.writeFileSync(__dirname+'/evidence/split-numeric.json',JSON.stringify({cases:rows.length,boundaryExcluded:boundary.length,rows,bad,boundary}));console.log(JSON.stringify({cases:rows.length,boundaryExcluded:boundary.length,bad:bad.length,first:bad.slice(0,3)}));if(bad.length)process.exitCode=1;
