from pathlib import Path
import subprocess, os, json, time, datetime

root=Path(__file__).resolve().parent
head=root/'head'
(root/'bin').mkdir(exist_ok=True)
link=root/'bin/chromium'
if not link.exists():link.symlink_to(root/'runtime/chrome-headless-shell-linux64/chrome-headless-shell')
env=dict(os.environ,PATH=str(root/'bin')+os.pathsep+os.environ['PATH'])
evidence=root/'evidence';evidence.mkdir(exist_ok=True)
scenarios='''lab-motes-numerical lab-motes-conservation lab-motes-contracts lab-motes-chronology lab-motes-ui lab-motes-save-reload lab-motes-backup-restore lab-motes-recovery lab-motes-reset inquiry-contracts inquiry-chronology inquiry-save-reload inquiry-backup-restore inquiry-recovery inquiry-reset inquiry-ui fresh-load legacy-load active-studies-load reset-roundtrip restore-roundtrip malformed-backup-rejection recovery-from-corrupt-primary unsupported-future-load future-backup-rejection recovery-offline-once save-failure-warning forge-contracts forge-chronology chronology-study-mid-window chronology-simultaneous-order lifecycle-long-study lifecycle-lab-queue lifecycle-background-resume lifecycle-repeated-resume lifecycle-cold-restart'''.split()
receipts=[]
for scenario in scenarios:
    cmd=['python',str(head/'tests/behavioral/run.py'),'--web-root',str(head),'--scenario',scenario,'--raw-artifacts',str(root/'raw')]
    now=datetime.datetime.now(datetime.timezone.utc).isoformat();start=time.monotonic()
    p=subprocess.run(cmd,env=env,capture_output=True,text=True,timeout=180)
    (evidence/(scenario+'.log')).write_text(p.stdout+'\nSTDERR\n'+p.stderr)
    receipts.append(dict(scenario=scenario,command=cmd,started_at=now,elapsed_seconds=round(time.monotonic()-start,3),exitcode=p.returncode,passed=p.returncode==0,log=scenario+'.log'))
    (evidence/'scenario_receipts.json').write_text(json.dumps(receipts,indent=2)+'\n')
    if p.returncode!=0:print('FAIL',scenario,flush=True)
print(json.dumps(dict(total=len(receipts),passed=sum(x['passed'] for x in receipts),elapsed_seconds=round(sum(x['elapsed_seconds'] for x in receipts),3))),flush=True)
raise SystemExit(0 if all(x['passed'] for x in receipts) else 1)
