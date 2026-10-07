from pathlib import Path
import json,tarfile,hashlib
r=Path(__file__).resolve().parent;reports=[]
for af,mf in [('CORE_01_06/WORKER_RAW_CURRENT.tar.xz','CORE_01_06/WORKER_RAW_MANIFEST.json'),('CORE_01_06/OWN_RAW.tar.xz','CORE_01_06/OWN_RAW_MANIFEST.json'),('RUNTIME/QA_04_05/RAW_EVIDENCE.tar.xz','RUNTIME/QA_04_05/RAW_MANIFEST.json')]:
 a=json.loads((r/'input'/mf).read_text());seen=set();total=0
 with tarfile.open(r/'input'/af) as tar:
  for x in tar:
   if not x.isfile():continue
   assert x.name in a and x.name not in seen,x.name
   seen.add(x.name);b=tar.extractfile(x).read();v=a[x.name]
   assert len(b)==v.get('size',v.get('bytes')) and hashlib.sha256(b).hexdigest()==v['sha256'],x.name
   total+=len(b)
 assert seen==set(a)
 reports.append({'archive':af,'manifest':mf,'files':len(seen),'rawBytes':total,'hashes':'PASS','coverage':'PASS'})
(r/'evidence/raw-input-verification.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports))
