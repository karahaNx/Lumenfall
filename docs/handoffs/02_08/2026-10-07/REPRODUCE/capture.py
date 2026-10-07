from pathlib import Path
import subprocess,time,json,sys,os,datetime
r=Path(__file__).resolve().parent;name=sys.argv[1];cmd=sys.argv[2:];d=r/'evidence'/name;d.mkdir(parents=True,exist_ok=True)
meta={'command':cmd,'cwd':str(r),'started':datetime.datetime.now(datetime.timezone.utc).isoformat()};(d/'command.json').write_text(json.dumps(meta,indent=2));start=time.monotonic()
with (d/'stdout.log').open('w') as so,(d/'stderr.log').open('w') as se:p=subprocess.run(cmd,cwd=r,stdout=so,stderr=se)
meta.update(exitcode=p.returncode,seconds=time.monotonic()-start);(d/'exit.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta));raise SystemExit(p.returncode)
