from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,parse_qs
import ast,json,re,hashlib
root=Path(__file__).resolve().parent;repo=root/'repo';gates=root/'gates'
class Result(HTMLParser):
 def __init__(self):super().__init__();self.results=[];self.current=None;self.runtime=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'data-qa-runtime-error' in a:self.runtime.append(a['data-qa-runtime-error'])
  if a.get('id')=='qa-result':self.current={'tag':tag,'attrs':a,'text':'','closed':False};self.results.append(self.current)
 def handle_data(self,data):
  if self.current is not None:self.current['text']+=data
 def handle_endtag(self,tag):
  if self.current is not None and self.current['tag']==tag:self.current['closed']=True;self.current=None
tree=ast.parse((repo/'tests/behavioral/run.py').read_text());expected=None
for n in tree.body:
 if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SCENARIOS' for t in n.targets):expected=ast.literal_eval(n.value)
assert len(expected)==141
coverage=[];negatives=[];probes=[];details=[]
for gate in ['gate-04','gate-05']:
 for f in sorted((gates/gate/'processes').glob('*/process.json')):
  m=json.loads(f.read_text());cmd=m['command'];output=f.with_name('stdout.txt').read_text();urls=[x for x in cmd if isinstance(x,str) and 'qaScenario=' in x]
  if not urls:probes.append({'gate':gate,'path':str(f.relative_to(root)),'process':m});continue
  scenario=parse_qs(urlparse(urls[0]).query)['qaScenario'][0]
  assert m['exitcode']==0 and not m['timed_out'],(scenario,m)
  if '--dump-dom' in cmd:
   p=Result();p.feed(output);p.close();assert len(p.results)==1,(scenario,len(p.results));result=p.results[0];assert result['tag']=='pre' and result['closed'];payload=json.loads(result['text']);assert payload['scenario']==scenario;assert payload['status']==result['attrs']['data-status']
  else:payload=json.loads(output);assert payload['scenario']==scenario
  if gate=='gate-04':
   assert payload['status']=='pass' and not payload.get('runtimeErrors',[]);assert '--dump-dom' not in cmd or not p.runtime;coverage.append(scenario)
   details.append({'scenario':scenario,'path':str(f.relative_to(root)),'status':payload['status'],'detail':payload.get('detail') if scenario in ['lab-motes-numerical','lab-motes-conservation'] else None})
  else:assert payload['status']=='fail';negatives.append(scenario)
required=set(re.findall(r'self-test-[a-z0-9-]+',(gates/'gate-05/command.sh').read_text()))
assert len(negatives)==12 and set(negatives)==required
meta={'raw-process-contract','forge-ui-process-contract'}
assert set(coverage)|meta==set(expected),(set(expected)-set(coverage)-meta)
aggregate=(gates/'gate-04/stdout.log').read_text();assert aggregate.rstrip().endswith('Behavioral QA passed: 141 deterministic scenario(s).')
execution=json.loads((gates/'execution.json').read_text());assert len(execution)==7 and all(x['exitcode']==0 for x in execution)
frozen=json.loads((gates/'frozen-source.json').read_text());assert all(hashlib.sha256((repo/f).read_bytes()).hexdigest()==d for f,d in frozen.items())
out={'status':'PASS','defaultScenarios':141,'browserOrNativeInvocations':len(coverage),'realScenarios':len(set(coverage)),'metaContracts':2,'completeAggregate':True,'requiredNegatives':12,'negativeScenarios':negatives,'sourceUnchanged':True,'gates':execution,'records':details,'metaProbeReceipts':probes}
(root/'evidence/final-gate-verification.json').write_text(json.dumps(out,indent=2))
print(json.dumps({k:v for k,v in out.items() if k not in ['records','metaProbeReceipts','negativeScenarios','gates']}))
