const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(__dirname+'/repo/index.html','utf8');const body=src.slice(src.indexOf('function simulationApplyFarmPassive('),src.indexOf('function simulationPassiveKillSeconds('));
function rat(x){const a=new DataView(new ArrayBuffer(8));a.setFloat64(0,x);const b=a.getBigUint64(0),e=Number((b>>52n)&2047n),m=(b&((1n<<52n)-1n))+(e?1n<<52n:0n),p=(e||1)-1023-52;return p>=0?{n:m<<BigInt(p),d:1n}:{n:m,d:1n<<BigInt(-p)};}
function oracle(D,h,H){const a=rat(D),b=rat(h),c=rat(H);const n=a.n*b.d-b.n*a.d,den=a.d*b.d; if(n<0n)return 0;return 1+Number(n*c.d/(den*c.n));}
const ctx={SIM_EPS:1e-9,state:null,enemyHpFor:()=>ctx.state.enemyMaxHp,simulationBatchFarmKills:n=>{ctx.kills=n;ctx.state.enemyHp=ctx.state.enemyMaxHp}};vm.createContext(ctx);vm.runInContext(body,ctx);
let rows=[],bad=[];for(const H of [11,13,29,31,Math.PI,1e3,1e12,1e50,1e150,1e250])for(const count of [90,2**40,2**48,2**50,2**51,2**52,2**52+17,Number.MAX_SAFE_INTEGER-100])for(const f of [.03,.13,.29,.37,.61,.73,.89,.975])for(const phase of [.03,.2,.45,.7,.95]){
 const D=H*(count+phase),hp=H*f; if(!Number.isFinite(D))continue;ctx.kills=0;ctx.state={enemyHp:hp,enemyMaxHp:H,depth:1};ctx.simulationApplyFarmPassive(1,D,{},{});const expected=oracle(D,hp,H),r={H,count,phase,f,D,hp,actual:ctx.kills,expected,remainingHp:ctx.state.enemyHp};rows.push(r);if(ctx.kills!==expected)bad.push(r);
}
fs.writeFileSync(__dirname+'/evidence/arithmetic_probe.json',JSON.stringify({rows,bad},null,2));console.log(JSON.stringify({total:rows.length,bad:bad.length,first:bad.slice(0,8)}));
