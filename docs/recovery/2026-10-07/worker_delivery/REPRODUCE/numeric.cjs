const fs=require('fs'),vm=require('vm'),path=require('path');
const root=__dirname,[,,label]=process.argv;
const source=label==='local'?fs.readFileSync(path.join(root,'repo/index.html'),'utf8'):require('child_process').execFileSync('git',['show',(label==='r1'?'d1e988816ed10b8f851521938a117a4d84d29e1b':'3cdebc236e9ee5081a4bca4e323b11f43aa0d46d')+':index.html'],{cwd:path.join(root,'repo'),encoding:'utf8'});
const body=source.slice(source.indexOf('function simulationApplyFarmPassive('),source.indexOf('function simulationPassiveKillSeconds('));
function units(x){let v=Buffer.alloc(8);v.writeDoubleBE(x);let bits=v.readBigUInt64BE(),e=Number((bits>>52n)&2047n),m=(bits&((1n<<52n)-1n))+(e?1n<<52n:0n);return m<<BigInt(e?e-1:0);}
function neighbor(x,dir){let v=Buffer.alloc(8);v.writeDoubleBE(x);v.writeBigUInt64BE(v.readBigUInt64BE()+BigInt(dir));return v.readDoubleBE();}
const c={state:null,kills:0,SIM_EPS:1e-9,enemyHpFor:()=>c.state.enemyMaxHp,simulationBatchFarmKills:n=>{c.kills=n;c.state.enemyHp=c.state.enemyMaxHp;}};vm.createContext(c);vm.runInContext(body,c);
let rows=[],bad=[],tolerated=[],quotientFailures=[],checkedQuotients=0;
const counts=[0,1,3,90,1025,2**32+1,...[50,51,52].flatMap(p=>[-2,-1,0,1,2,17].map(d=>2**p+d)),Number.MAX_SAFE_INTEGER-100,Number.MAX_SAFE_INTEGER-2,Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER];
for(let H of [11,13,17,31,997,123456789,1e16,1e50,1e150,1e250,11.5,4*Math.PI])for(let count of counts){
 let pivot=H*count;if(!Number.isFinite(pivot)||pivot<=0)continue;
 for(let D of [neighbor(pivot,-1),pivot,neighbor(pivot,1),H*(count+.125),H*(count+.7)])for(let hp of [H,H*.73,H*.01,.33,1]){
  if(hp>H||!Number.isFinite(D))continue;
  let d=units(D),h=units(hp),m=units(H),expected=d<h?0:Number(1n+(d-h)/m);if(!Number.isSafeInteger(expected))continue;
  c.state={enemyHp:hp,enemyMaxHp:H,depth:1};c.kills=0;c.simulationApplyFarmPassive(1,D,{},{});
  let q=typeof c.simulationWholeHpUnits==='function'?c.simulationWholeHpUnits(D,H):null;
  if(q!==null){checkedQuotients++;if(!Number.isSafeInteger(q)||BigInt(q)*m>d||(BigInt(q)+1n)*m<=d)quotientFailures.push({H,D,q});}
  // Classify the original absolute/relative boundary tolerance separately.
  // Never call a rounding error away from a true threshold a tolerance PASS.
  let threshold=h+BigInt(expected)*m,deficit=threshold-d;
  let promoted=c.kills===expected+1&&deficit>0n&&(deficit<=units(1e-9)||deficit<=units(H*1e-12));
  let rec={H,count,DExact:D.toFixed(0),damage:D,hp,expected,kills:c.kills,hpAfter:c.state.enemyHp,quotient:q,status:c.kills===expected?'exact':promoted?'existing-boundary-tolerance':'FAIL'};
  if(promoted)tolerated.push(rec);else if(c.kills!==expected)bad.push(rec);
  rows.push(rec);
 }
}
// An explicit low-damage positive-deficit path must not manufacture a kill.
for(let H of [11,123456789,1e50])for(let f of [.1,.73,1]){let hp=H*f,D=hp-Math.max(1e-7,H*1e-10);c.state={enemyHp:hp,enemyMaxHp:H,depth:1};c.kills=0;c.simulationApplyFarmPassive(1,D,{},{});if(c.kills!==0)bad.push({kind:'positive-deficit',H,hp,D,kills:c.kills});}
const result={source:label,cases:rows.length,checkedQuotients,quotientFailures,bad,tolerated,rows};
fs.writeFileSync(path.join(root,'evidence',label+'-numeric.json'),JSON.stringify(result));console.log(JSON.stringify({source:label,cases:rows.length,checkedQuotients,quotientFailures:quotientFailures.length,bad:bad.length,toleranceRows:tolerated.length,first:bad.slice(0,8)}));if(bad.length||quotientFailures.length)process.exitCode=1;
