/* Read-only F18 motor diagnosis. Observer wrappers preserve all return values.
 * DOM startup is suspended; browser persistence uses the existing harness.
 * Usage: node docs/qa/support-uptime-001/probe.cjs [index.html] [output.json] [contract.json]
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const sourcePath = path.resolve(process.argv[2] || path.join(root, 'index.html'));
const outputPath = path.resolve(process.argv[3] || path.join(__dirname, 'probe-results.json'));
const contract = process.argv[4] ? JSON.parse(fs.readFileSync(process.argv[4],'utf8')) :
  {normalSec:4,ultimateSec:8,chargeCap:null,kind:'baseline'};
const html = fs.readFileSync(sourcePath, 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const marker = "if(document.readyState==='loading'){";
assert.equal(script.split(marker).length, 2, 'unique startup marker');
const bridge = `
var auditLog={casts:[],expiries:[],intervals:[]};
var auditApply=applySupportCast,auditExpire=simulationExpireBuff,auditPassive=simulationApplyPushPassive;
if(globalThis.auditObserve!==false){
applySupportCast=function(sp,now,clock){
  var result=auditApply(sp,now,clock);
  auditLog.casts.push({id:sp.id,now:now,clock:clock,record:JSON.parse(JSON.stringify(state.supportBuffs.sources[sp.id]))});
  return result;
};
simulationExpireBuff=function(now,clock){
  var before=JSON.parse(JSON.stringify(state.supportBuffs)),result=auditExpire(now,clock);
  if(result)auditLog.expiries.push({now:now,clock:clock,before:before,after:JSON.parse(JSON.stringify(state.supportBuffs))});
  return result;
};
simulationApplyPushPassive=function(dt,dps,policy,summary){
  auditLog.intervals.push({dt:dt,factor:dps/passiveWispDpsAt(state.depth),active:Object.keys(state.supportBuffs?state.supportBuffs.sources:{})});
  return auditPassive(dt,dps,policy,summary);
};
}
globalThis.audit={
  dependencyCap:n=>RESEARCH.find(node=>node.id==='charge').levelCap=n,
  fresh:()=>freshState(), set:s=>state=acceptPersistedState(s,'support-uptime-audit'), get:()=>state,
  hp:d=>enemyHpFor(d), average:()=>averageSupportBuffMult(), cycle:()=>abilityCycleSeconds(),
  simulate:(dt,kind,start)=>advanceAuthoritativeTime(dt,{kind:kind,visual:false,clockStartMs:start,offlineWindowStartMs:start,captureTimeline:true}),
  log:()=>auditLog, clear:()=>auditLog={casts:[],expiries:[],intervals:[]}
};
`;
function engine(observe=true) {
  const context = vm.createContext({auditObserve:observe,document:{readyState:'loading', addEventListener(){}}, window:{addEventListener(){}}, console});
  vm.runInContext(script.replace(marker, bridge + '\n' + marker), context, {timeout:2000});
  // Explicit model of the separately owned Swift dependency; never a hidden
  // F18 cap. It does not model overlevel refunds or a save migration.
  if(contract.chargeCap!==null)context.audit.dependencyCap(contract.chargeCap);
  return context.audit;
}
const copy = value => JSON.parse(JSON.stringify(value));
const start = 2000000000000;
function seed(a, ids, ultimates, charge, resources = {}) {
  const s = copy(a.fresh());
  // Rift 121 keeps even two Mythic supports below one enemy kill.
  // This is an isolated motor fixture, not an early/mid/late progression label.
  s.depth = s.enemyDepth = s.maxDepthEver = 121;
  s.enemyHp = s.enemyMaxHp = a.hp(121);
  Object.keys(s.spirits).forEach(id => {s.spirits[id]=0; s.heroResource[id]=0;});
  ids.forEach(id => {s.spirits[id]=1; s.heroResource[id]=resources[id] || 0;});
  ultimates.forEach(id => {s.heroRarity[id]=5; s.wispUltimate[id]=true;});
  s.activeParty = ids;
  s.research.charge = charge;
  s.lastSeen = start;
  a.set(s);
  return copy(a.get());
}
function run(a, s, kind, seconds, chunk) {
  a.set(s); a.clear();
  let offset=0, summaries=[];
  do {
    const dt=Math.min(chunk || seconds, seconds-offset);
    summaries.push(copy(a.simulate(dt, kind, start+offset*1000)));
    offset+=dt;
  } while(offset<seconds);
  const log=copy(a.log()), activeSeconds={};
  for(const interval of log.intervals) for(const id of interval.active) activeSeconds[id]=(activeSeconds[id] || 0)+interval.dt;
  return {state:copy(a.get()), log, activeSeconds, summaries};
}
let assertions=0;
function near(actual, expected, message, tolerance=1e-6) {
  assertions++;
  assert.ok(Number.isFinite(actual) && Math.abs(actual-expected)<=tolerance, message+': '+actual+' vs '+expected);
}
const rows=[];
for(const ids of [['tide'], ['aurora'], ['tide','aurora']]) {
  for(const ultimates of [[], ids, ...(ids.length===2 ? [['aurora']] : [])]) {
    for(const charge of [0,3,6,7,10,25,100]) {
      const effectiveCharge=contract.chargeCap===null?charge:Math.min(charge,contract.chargeCap);
      const a=engine(), s=seed(a,ids,ultimates,charge), cycle=6/(1+0.08*effectiveCharge);
      near(a.cycle(),cycle,'baseline cycle');
      // End after 12 complete cycles: initial empty charge is measured separately.
      const seconds=12*cycle;
      const live=run(a,s,'live',seconds), offline=run(a,s,'offline',seconds);
      near(live.state.enemyHp,offline.state.enemyHp,'live/offline constant-rate damage');
      assert.equal(live.summaries[0].kills,0,'isolated motor oracle requires zero kills'); assertions++;
      const expectedAverage=1+ids.reduce((sum,id)=>sum+(ultimates.includes(id)?0.5:0.25)*Math.min(1,(ultimates.includes(id)?contract.ultimateSec:contract.normalSec)/cycle),0);
      a.set(s); near(a.average(),expectedAverage,'independent sustained oracle');
      const row={ids,ultimates,charge,cycle,seconds,averageFactor:a.average(),sources:{},casts:live.log.casts,expiries:live.log.expiries};
      for(const id of ids) {
        const duration=ultimates.includes(id)?contract.ultimateSec:contract.normalSec;
        let oracle=0;
        // Union of same-source windows from independent scheduled casts.
        let end=0;
        for(let n=1;n<=12;n++) {
          const begin=n*cycle, nextEnd=Math.min(seconds,begin+duration);
          oracle+=Math.max(0,nextEnd-Math.max(begin,end)); end=Math.max(end,nextEnd);
        }
        near(live.activeSeconds[id] || 0,oracle,'actual source uptime '+id);
        near(offline.activeSeconds[id] || 0,oracle,'offline source uptime '+id);
        const casts=live.log.casts.filter(c=>c.id===id);
        assert.equal(casts.length,12,'12 actual automatic casts'); assertions++;
        casts.forEach((cast,i)=>{
          near((cast.now-start)/1000,(i+1)*cycle,'actual cast tick',1e-6);
          near(cast.record.until-cast.now,duration*1000,'actual deadline',0.001);
        });
        row.sources[id]={duration,sustainedUptime:Math.min(1,duration/cycle),coldStartUptime:oracle/seconds,actualActiveSeconds:live.activeSeconds[id] || 0};
      }
      if(charge===0 || charge===7) {
        const split=run(a,s,'live',seconds,0.1);
        near(split.state.enemyHp,live.state.enemyHp,'100ms live vs whole-window damage',1e-4);
        for(const id of ids) near(split.activeSeconds[id] || 0,live.activeSeconds[id] || 0,'100ms source uptime');
      }
      rows.push(row);
    }
  }
}
// Baseline normals cover all time; the approved shorter proposal has gaps.
const a=engine(), staggerSeed=seed(a,['tide','aurora'],[],0,{aurora:50});
const stagger=run(a,staggerSeed,'live',60);
const anySeconds=stagger.log.intervals.reduce((sum,r)=>sum+(r.active.length?r.dt:0),0);
near(anySeconds,contract.normalSec===4?57:19,'staggered any-support coverage after first cast at 3s');
const phaseSweep=[];
if(contract.kind==='profile-proposal') {
  for(const charge of [0,5,10,25,100]) for(let phase=0;phase<100;phase+=10) {
    const a=engine(),s=seed(a,['tide','aurora'],['tide','aurora'],charge,{tide:100,aurora:phase});
    const cycle=6/(1+.08*Math.min(charge,contract.chargeCap));
    // Skip a complete startup cycle, then integrate nine complete cycles.
    const record={charge,phase,cycle,seconds:9*cycle};
    try {
      a.simulate(cycle,'live',start);a.clear();a.simulate(9*cycle,'live',start+cycle*1000);
      const intervals=copy(a.log()).intervals;
      const unionSeconds=intervals.reduce((sum,r)=>sum+(r.active.length?r.dt:0),0);
      const totalSeconds=9*cycle;
      assert.ok(unionSeconds/totalSeconds<=2*contract.ultimateSec/cycle+1e-6,'phase sweep union maximum');
      assert.ok(unionSeconds/totalSeconds<1,'actual pause even with two Ultimates');
      Object.assign(record,{status:'pass',anyActiveSeconds:unionSeconds,pauseSeconds:totalSeconds-unionSeconds});
    } catch(error) {
      Object.assign(record,{status:'fail',error:error.message,log:copy(a.log())});
      const control=engine(false);seed(control,['tide','aurora'],['tide','aurora'],charge,{tide:100,aurora:phase});
      let controlError=null;
      try {control.simulate(cycle,'live',start);control.simulate(9*cycle,'live',start+cycle*1000);}catch(e){controlError=e.message;}
      assert.equal(controlError,error.message,'phase failure reproduced without observer wrappers');
      record.control={observerWrappers:false,error:controlError};
    }
    phaseSweep.push(record);
  }
}
const normal=rows.find(r=>r.ids.length===1 && !r.ultimates.length && r.charge===0);
const ultimate=rows.find(r=>r.ids.length===1 && r.ultimates.length && r.charge===0);
const fractionalDiagnostics=[];
for(const row of rows) for(const kind of ['live','offline']) {
  const fractional=engine(),fractionalSeed=seed(fractional,row.ids,row.ultimates,row.charge);
  fractionalSeed.lastSeen=start+0.375; fractional.set(fractionalSeed);
  const diagnostic={ids:row.ids,ultimates:row.ultimates,charge:row.charge,clockStartMs:start+0.375,seconds:row.seconds,kind};
  try {
    diagnostic.status='pass'; diagnostic.summary=copy(fractional.simulate(row.seconds,kind,start+0.375));
  } catch(error) {
    diagnostic.status='fail'; diagnostic.error=error.message; diagnostic.log=copy(fractional.log());
  }
  fractionalDiagnostics.push(diagnostic);
}
const fractionalFailures=fractionalDiagnostics.filter(r=>r.status==='fail').length;
const fractionalFailureControls=[];
for(const c of fractionalDiagnostics.filter(r=>r.status==='fail')) {
  const control=engine(false),s=seed(control,c.ids,c.ultimates,c.charge);
  s.lastSeen=c.clockStartMs;control.set(s);
  let error=null;
  try {control.simulate(c.seconds,c.kind,c.clockStartMs);} catch(e) {error=e.message;}
  assert.equal(error,c.error,'same failure with all observer wrappers disabled');
  fractionalFailureControls.push({ids:c.ids,ultimates:c.ultimates,charge:c.charge,kind:c.kind,observerWrappers:false,error});
}
const phaseFailures=phaseSweep.filter(r=>r.status==='fail').length;
const result={status:fractionalFailures||phaseFailures?contract.kind+'-has-failure':'pass',source:{sha256:crypto.createHash('sha256').update(html).digest('hex'),gitBlob:crypto.createHash('sha1').update(Buffer.from('blob '+Buffer.byteLength(html)+'\0')).update(html).digest('hex'),bytes:Buffer.byteLength(html)},contract,node:process.version,assertions,limits:'VM observer, DOM startup suspended; profile-proposal uses an explicit Swift cap catalogue stub; no Android/device or migration acceptance',phaseSweep,fractionalDiagnostics,fractionalFailureControls,rows,staggeredNormalPair:{charge:0,seconds:60,anyActiveSeconds:anySeconds,casts:stagger.log.casts,expiries:stagger.log.expiries},summary:{normalCharge0:normal.sources.tide,ultimateCharge0:ultimate.sources.tide}};
fs.writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,assertions,rows:rows.length,fractionalCases:fractionalDiagnostics.length,fractionalFailures,phaseCases:phaseSweep.length,phaseFailures,source:result.source,summary:result.summary,staggeredAnyActiveSeconds:anySeconds}));
if(fractionalFailures||phaseFailures)process.exitCode=1;
