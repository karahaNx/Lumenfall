from pathlib import Path
import json,sys
r=Path(__file__).resolve().parent;phase=sys.argv[1];d=json.loads((r/'evidence/b2_verification.json').read_text())
if phase=='baseline-R2':rows=[x for x in d['rows'] if x['version']=='r2']
else:rows=[x for x in d['rows'] if x['version']=='local' and x['phase']==phase]
assert len(rows)==12
failed=[x for x in rows if x['failures']]
print(json.dumps({'phase':phase,'rows':len(rows),'failures':len(failed),'scope':'Strict oracle phase evaluation of own preserved actual-motor replay','failedRows':failed},indent=2));raise SystemExit(1 if failed else 0)
