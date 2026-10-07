from pathlib import Path
import subprocess,os,json,datetime,time
r=Path(__file__).resolve().parent;head=r/'head';env=dict(os.environ,PATH=str(r/'bin')+os.pathsep+os.environ['PATH']);rows=[]
commands=[('source-gate',['bash',str(r/'source_gate.sh')])]
neg='self-test-bad-assertion self-test-uncaught-error self-test-unhandled-rejection self-test-parity-regression self-test-chronology-regression self-test-wisp-formula-regression self-test-wisp-pacing-regression self-test-endgame-currency-regression self-test-wisp-role-regression self-test-p1-05-selected self-test-p1-05-focus-return self-test-lifecycle-duplicate'.split()
commands.extend((s,['python',str(head/'tests/behavioral/run.py'),'--web-root',str(head),'--scenario',s,'--raw-artifacts',str(r/'raw_controls')]) for s in neg)
for name,cmd in commands:
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(cmd,cwd=head,env=env,capture_output=True,text=True,timeout=90);log=r/'evidence'/(name+'.log');log.write_text(p.stdout+'\nSTDERR\n'+p.stderr)
 expected=name!='source-gate';caught=p.returncode==1 and 'FAIL '+name in p.stdout;passed=caught if expected else p.returncode==0
 rows.append(dict(name=name,command=cmd,started_at=started,elapsed_seconds=time.monotonic()-t,exitcode=p.returncode,expected_failure=expected,passed=passed,log=log.name));print(name,p.returncode,passed,flush=True)
 (r/'evidence/control_receipts.json').write_text(json.dumps(rows,indent=2))
raise SystemExit(0 if all(x['passed'] for x in rows) else 1)
