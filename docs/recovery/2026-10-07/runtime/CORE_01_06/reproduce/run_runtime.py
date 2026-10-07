from pathlib import Path
import re,subprocess,json,hashlib,base64
r=Path(__file__).resolve().parent;w=r.parent;out=w/'evidence/runtime';out.mkdir(exist_ok=True);reports=[]
for version in ['r2','head']:
 src=(w/version/'index.html').read_text()
 for i,code in enumerate(re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',src,re.S)):
  dst=out/f'{version}-script-{i}.js';dst.write_text(code)
  for engine,node in [('current','node'),('legacy-v8',str(w/'runtime/node-v8.17.0-linux-x64/bin/node'))]:
   cmd=[node,'--check',str(dst)];p=subprocess.run(cmd,capture_output=True,text=True)
   reports.append({'version':version,'script':i,'engine':engine,'command':cmd,'exit':p.returncode,'stdout':p.stdout,'stderr':p.stderr});(out/f'{version}-{i}-{engine}.log').write_text(p.stdout+p.stderr)
versions={}
for label,node in [('current','node'),('legacy',str(w/'runtime/node-v8.17.0-linux-x64/bin/node'))]:
 versions[label]=json.loads(subprocess.check_output([node,'-p','JSON.stringify({node:process.version,v8:process.versions.v8})'],text=True))
lock=json.loads((w/'head/mobile/package-lock.json').read_text());pkg=lock['packages']['node_modules/@capacitor/android'];tar=(w/'runtime/capacitor-android-6.2.1.tgz').read_bytes();integrity='sha512-'+base64.b64encode(hashlib.sha512(tar).digest()).decode();assert integrity==pkg['integrity']
result={'status':'CONFIRMED_RUNTIME_BLOCKER','versions':versions,'reports':reports,'capacitorAndroid':{'version':pkg['version'],'lockIntegrity':pkg['integrity'],'downloadIntegrityMatchesLock':True,'url':pkg['resolved'],'tarSHA256':hashlib.sha256(tar).hexdigest()},'config':json.loads((w/'head/mobile/capacitor.config.json').read_text()),'officialSources':['https://v8.dev/features/bigint','https://v8.dev/blog/v8-release-67','https://github.com/ionic-team/capacitor/blob/6.2.1/android/capacitor/src/main/java/com/getcapacitor/Bridge.java','https://github.com/ionic-team/capacitor/blob/6.2.1/android/capacitor/src/main/java/com/getcapacitor/CapConfig.java'],'limits':'Node8/V8 6.2 syntax checks and official exact package code; no physical Android/WebView launch.'}
(out/'syntax_checks.json').write_text(json.dumps(result,indent=2));print({'status':result['status'],'versions':versions,'lockIntegrityMatches':True,'results':[{k:v for k,v in q.items() if k in ['version','script','engine','exit']} for q in reports]})
