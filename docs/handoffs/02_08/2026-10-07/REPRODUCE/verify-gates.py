from pathlib import Path
import importlib.util,sys,json,re,hashlib
from urllib.parse import urlparse,parse_qs
r=Path(__file__).resolve().parent;repo=r/'repo';g=r/'gates';sys.path.insert(0,str(repo/'tests/behavioral'))
sp=importlib.util.spec_from_file_location('h',repo/'tests/behavioral/run.py');h=importlib.util.module_from_spec(sp);sp.loader.exec_module(h)
execution=json.load(open(g/'execution.json'));assert len(execution)==7 and all(x['exitcode']==0 and x['frozenUnchanged'] for x in execution)
log=(g/'gate-04/stdout.log').read_text();positive=[s.split()[1].rstrip(':') for s in log.splitlines() if s.startswith('PASS ')];assert len(h.SCENARIOS)==142;assert set(h.SCENARIOS).issubset(positive);assert not any(s.startswith('FAIL ') for s in log.splitlines());assert 'Behavioral QA passed: 142 deterministic scenario(s).' in log
rows=[];meta=[]
for f in sorted((g/'gate-04/processes').glob('*/process.json')):
 p=json.load(open(f));cmd=p['command'];urls=[x for x in cmd if isinstance(x,str) and x.startswith('http')];params=parse_qs(urlparse(urls[-1]).query) if urls else {};scenario=params.get('qaScenario',[None])[0];out=(f.parent/'stdout.txt').read_text()
 if scenario in h.SCENARIOS:
  if '--dump-dom' in cmd:
   obs,payload=h.raw_qa_observation(out,scenario);assert obs['valid'] and obs['qa_status']=='pass' and not obs['runtime_markers'] and obs['runtime_error_count']==0
   row={'scenario':scenario,'mode':'DOM','observation':obs,'payload':payload,'process':p,'raw':str(f.relative_to(r))}
  else:
   payload=json.loads(out);assert payload['status']=='pass';teardown=payload.get('teardown');assert teardown and teardown.get('profileRemoved') and teardown.get('pendingAfterClose',teardown.get('pending',-1))==0
   row={'scenario':scenario,'mode':'native','payload':payload,'process':p,'raw':str(f.relative_to(r))}
  assert p['exitcode']==0 and not p['timed_out'];rows.append(row)
 else:meta.append({'process':p,'raw':str(f.relative_to(r))})
assert len(rows)==162 and len(set(x['scenario'] for x in rows))==140
negative=[]
for f in sorted((g/'gate-05/processes').glob('*/process.json')):
 p=json.load(open(f));cmd=p['command'];urls=[x for x in cmd if isinstance(x,str) and x.startswith('http')];params=parse_qs(urlparse(urls[-1]).query) if urls else {};s=params.get('qaScenario',[None])[0]
 if s:
  obs,payload=h.raw_qa_observation((f.parent/'stdout.txt').read_text(),s);assert p['exitcode']==0 and not p['timed_out'] and obs['qa_status']=='fail';negative.append({'scenario':s,'process':p,'observation':obs,'payload':payload,'raw':str(f.relative_to(r))})
assert len(negative)==12
negativeLog=(g/'gate-05/stdout.log').read_text();assert negativeLog.count('Behavioral harness correctly caught expected failure:')==12
frozen=json.load(open(r/'evidence/frozen.json'));assert all(hashlib.sha256((repo/f).read_bytes()).hexdigest()==v for f,v in frozen.items())
result={'gates':execution,'frozenFiles':len(frozen),'sourceUnchanged':True,'selectedScenarios':len(h.SCENARIOS),'loggedPositiveInvocations':len(positive),'realBrowserNativeInvocations':len(rows),'distinctRealScenarios':140,'processContractScenarios':2,'nonBrowserMetaProcesses':meta,'requiredNegativeControls':12,'positive':rows,'negative':negative}
(g/'verified-raw-results.json').write_text(json.dumps(result));print(json.dumps({k:v for k,v in result.items() if k not in ['positive','negative','nonBrowserMetaProcesses','gates']}))
