from pathlib import Path
import hashlib,json
r=Path(__file__).resolve().parent;before={};after={}
bridge="""
ownQA.performanceRun=function(seconds,dps,kind,start){var original=simulationPassiveDps;simulationPassiveDps=function(){return dps;};try{var summary=advanceAuthoritativeTime(seconds,{kind:kind,visual:false,clockStartMs:start,offlineWindowStartMs:start,captureTimeline:false});return {state:JSON.parse(JSON.stringify(state)),summary:summary};}finally{simulationPassiveDps=original;}};
"""
for label in ['r1','r2','blocked','new']:
 p=r/'stages'/label/'index.html';src=p.read_text();before[label]=hashlib.sha256(p.read_bytes()).hexdigest()
 if label!='r1':
  marker='\n})();\n</script>\n<script>\nif(window.Capacitor';assert src.count(marker)==1;p.write_text(src.replace(marker,bridge+marker,1))
 after[label]=hashlib.sha256(p.read_bytes()).hexdigest()
(r/'evidence/performance-stage-hashes.json').write_text(json.dumps({'beforePerformance':before,'afterPerformance':after,'newBridgeOnlyForBenchmark':bridge,'initialFailedBenchmark':'captureTimeline:true hit existing R2 diagnostic trace guard at 3600 seconds. Preserved stderr/exit. Production benchmark uses captureTimeline:false; no product guard/cap is changed.'},indent=2))
p=r/'motor-performance.js';p.write_text(p.read_text().replace('b.run(c.seconds,c.dps,c.kind,clock)','b.performanceRun(c.seconds,c.dps,c.kind,clock)').replace('b.run includes','performanceRun includes').replace('Actual authoritative scheduler/Farm/live/offline','Actual authoritative scheduler/Farm/live/offline, captureTimeline:false'))
