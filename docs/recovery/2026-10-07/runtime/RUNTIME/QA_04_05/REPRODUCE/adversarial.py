from pathlib import Path
import math,struct,json,subprocess
from fractions import Fraction as F
r=Path(__file__).resolve().parent;rows=[]
counts=[0,1,2,89,65537,*[2**p+d for p in [50,51,52] for d in [-3,-1,0,1,3,19]],2**53-101,2**53-3,2**53-2,2**53-1]
for H in [11.,13.,107.,196246.,5017085352268982000.,1e40,1e125,1e200,17.25,43.1]:
 for count in counts:
  pivot=H*count
  for D in [math.nextafter(pivot,0),pivot,math.nextafter(pivot,math.inf),pivot+H*.27,pivot+H*.81]:
   if D<=0 or not math.isfinite(D):continue
   for hp in [H,H*.37,H*.9999999999999999,1e-7,H*2**-40]:
    q=F(D)//F(H);k=0 if F(D)<F(hp) else 1+(F(D)-F(hp))//F(H)
    if k>2**53-1 or q>2**53-1:continue
    rem=F(hp)-F(D) if k==0 else F(H)-(F(D)-F(hp))%F(H)
    deficit=F(hp)+k*F(H)-F(D)
    rows.append({'H':H,'damage':D,'hp':hp,'expected':k,'q':q,'hpExpected':float(rem),'nextThresholdDeficit':float(deficit),'tolerance':max(1e-9,H*1e-12),'exactDamage':str(F(D))})
# Positive deficits are sufficiently far outside either old boundary tolerance.
for H in [11.,196246.,1e125]:
 for hp in [H,H*.37]:
  D=hp-max(1e-7,H*1e-10);rows.append({'H':H,'damage':D,'hp':hp,'expected':0,'q':0,'hpExpected':hp-D,'nextThresholdDeficit':hp-D,'tolerance':max(1e-9,H*1e-12),'exactDamage':str(F(D))})
(r/'evidence/adversarial-inputs.json').write_text(json.dumps(rows,separators=(',',':')))
print(json.dumps({'cases':len(rows),'oracle':'Python Fraction.from_float; exact binary represented inputs; independent of product BigInt decoder'}))
