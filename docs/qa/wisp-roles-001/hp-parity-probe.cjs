'use strict';
// Diagnostic: preserve the stricter HP counterexample on precise source bytes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),source=fs.readFileSync(process.argv[2]||path.join(root,'index.html'),'utf8');
const original=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/offline-autoascend-2026-10-07/device_backup.json'),'utf8'));
const copy=x=>JSON.parse(JSON.stringify(x));
const ctx=vm.createContext({document:{readyState:'loading',addEventListener(){}},window:{addEventListener(){}},console});
const bridge=`globalThis.probe={set:s=>state=acceptPersistedState(s),get:()=>state,ids:()=>SPIRITS.map(s=>s.id),run:(seconds,kind,start)=>advanceAuthoritativeTime(seconds,{kind:kind,visual:false,clockStartMs:start,offlineWindowStartMs:start})};`;
vm.runInContext(source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace("if(document.readyState==='loading'){",bridge+"if(document.readyState==='loading'){"),ctx);
const b=ctx.probe,ids=copy(b.ids()),results=[];
for(const party of Object.values(original.formationPresets))for(const start of [original.lastSeen,2000000000000])for(const kind of ['live','offline']){
 const s=copy(original);s.activeParty=party;s.formationRebuild=null;s.autoAscendEnabled=false;s.activeStudies=[];s.studyQueue={};s.researchQueue={};
 s.empowerQueue=Object.fromEntries(ids.map(id=>[id,false]));
 ids.forEach((id,i)=>{s.spirits[id]=party.includes(id)?100:170-i*17;s.heroResource[id]=0;});
 s.depth=s.enemyDepth=s.farmDepth=99;s.enemyMaxHp=s.enemyHp=Math.round(10*Math.pow(1.145,99));s.enemyIsLuminous=false;
 s.riftMode='farm';s.farmReturnDepth=101;s.buffUntil=0;s.buffMult=1;s.supportBuffs=null;b.set(s);
 const canonical=copy(b.get());let wholeError=null,splitError=null;
 try{b.run(60,kind,start);}catch(e){wholeError=e.message;}const whole=copy(b.get());
 b.set(canonical);try{for(let i=0;i<6;i++)b.run(10,kind,start+i*10000);}catch(e){splitError=e.message;}const split=copy(b.get());
 const deltas=Object.fromEntries(['lumen','shards','motes','sigils','totalKills','enemyHp'].map(key=>[key,{whole:whole[key],split:split[key],delta:whole[key]-split[key],tolerance:Math.max(1e-6,Math.abs(whole[key])*1e-12,Math.abs(split[key])*1e-12)}]));
 const pass=!wholeError&&!splitError&&Object.values(deltas).every(x=>Math.abs(x.delta)<=x.tolerance);
 results.push({party,start,kind,wholeError,splitError,deltas,pass});
}
console.log(JSON.stringify({sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),status:results.every(x=>x.pass)?'pass':'fail',results},null,2));
process.exitCode=results.every(x=>x.pass)?0:1;
