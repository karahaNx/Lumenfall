from pathlib import Path
import tarfile,hashlib,json,sys,importlib.util,urllib.parse,re
r=Path(__file__).resolve().parent;sys.path.insert(0,str(r/'head/tests/behavioral'));spec=importlib.util.spec_from_file_location('candidate_harness',r/'head/tests/behavioral/run.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)

t=tarfile.open(r.parent/'input/RAW_CURRENT.tar.xz','r:xz');names={q.name:q for q in t.getmembers() if q.isfile()};records=[];errors=[];processes=[];negative=[]
for n,q in names.items():
 if not n.endswith('/process.json') or not n.startswith(('gates/gate-04/','gates/gate-05/')):continue
 meta=json.load(t.extractfile(q));command=meta.get('command',[]);text_command=' '.join(map(str,command));directory=n.rsplit('/',1)[0];stdout=t.extractfile(names[directory+'/stdout.txt']).read().decode('utf8',errors='replace');entry={'process':n,'meta':meta};processes.append(entry)
 if '--dump-dom' in command:
  url=next((str(x) for x in command if 'qaScenario=' in str(x)),None)
  if not url:errors.append(n+' missing scenario URL');continue
  scenario=urllib.parse.parse_qs(urllib.parse.urlparse(url).query)['qaScenario'][0];obs,payload=h.raw_qa_observation(stdout,scenario);expected='fail' if n.startswith('gates/gate-05/') else 'pass'
  passed=meta.get('exitcode')==0 and not meta.get('timed_out') and obs['valid'] and obs['qa_status']==expected and (expected=='fail' or (not obs['runtime_markers'] and obs['runtime_error_count']==0))
  entry.update(scenario=scenario,observation=obs,payload=payload,valid=passed)
  (negative if expected=='fail' else records).append(entry)
  if not passed:errors.append(n+' invalid '+str(obs))
 elif 'negative-control=' in text_command or any('tests/behavioral/' in str(x) and str(x).endswith('.cjs') for x in command):
  payload=None
  for line in stdout.splitlines():
   try:
    v=json.loads(line)
    if isinstance(v,dict) and 'status' in v:payload=v
   except ValueError:pass
  entry['payload']=payload
  if payload is None:errors.append(n+' native status missing')
  elif payload.get('status')!='pass' or meta.get('exitcode')!=0 or meta.get('timed_out'):errors.append(n+' native invalid')
  else:records.append(entry)
 else:entry['non_browser']=True
out={'scope':'Own raw parsing of preserved worker subprocesses, not own browser replay. Final aggregate is complete; initial clipping failure is separate.','positive_results':len(records),'distinct_scenarios':len({x.get('scenario') or (x.get('payload')or{}).get('scenario') for x in records}),'negative_results':len(negative),'all_processes':len(processes),'errors':errors,'positive':records,'negative':negative,'processes':processes}
(r/'evidence/worker_raw_inspection.json').write_text(json.dumps(out,indent=2));print({k:v for k,v in out.items() if k not in ['positive','negative','processes']})
