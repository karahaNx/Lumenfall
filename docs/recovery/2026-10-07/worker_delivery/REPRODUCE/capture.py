from pathlib import Path
import sys,subprocess,datetime,json,os
root=Path(__file__).resolve().parent;label=sys.argv[1];cmd=sys.argv[2:];out=root/'evidence'/label;out.mkdir(parents=True,exist_ok=True)
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
(out/'command.json').write_text(json.dumps({'command':cmd,'cwd':os.getcwd(),'started':start},indent=2))
with (out/'stdout.log').open('w') as stdout,(out/'stderr.log').open('w') as stderr:
 p=subprocess.run(cmd,stdout=stdout,stderr=stderr)
(out/'exit.json').write_text(json.dumps({'exitcode':p.returncode,'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2))
print(label,'exit',p.returncode,flush=True)
raise SystemExit(p.returncode)
