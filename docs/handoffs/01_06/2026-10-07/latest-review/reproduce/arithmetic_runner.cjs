const fs=require('fs');function simulationWholeHpUnits(damage,maxHp){
  // A rounded division/subtraction cannot recover an exact integer quotient
  // near 2^53. Divide the represented values exactly, without a per-kill loop.
  // Game maximum HP is integral; floor(D)/H has the same floor as D/H.
  if(!Number.isFinite(damage) || !Number.isFinite(maxHp)) return Math.floor(damage/maxHp);
  if(Number.isInteger(maxHp)) return Number(BigInt(Math.floor(damage))/BigInt(maxHp));
  // Fractional finite HP uses its binary significand and exponent. The shifts
  // are bounded by the IEEE double exponent range, independent of kill count.
  var view = new DataView(new ArrayBuffer(16));
  view.setFloat64(0,damage);
  view.setFloat64(8,maxHp);
  var dhi=view.getUint32(0),hhi=view.getUint32(8);
  var de=(dhi>>>20)&2047,he=(hhi>>>20)&2047;
  var dn=(BigInt(dhi&1048575)<<32n)|BigInt(view.getUint32(4));
  var hn=(BigInt(hhi&1048575)<<32n)|BigInt(view.getUint32(12));
  if(de) dn+=1n<<52n;
  if(he) hn+=1n<<52n;
  var shift=(de?de-1075:-1074)-(he?he-1075:-1074);
  return Number(shift>=0 ? (dn<<BigInt(shift))/hn : dn/(hn<<BigInt(-shift)));
}
function num(hex){return Buffer.from(hex,'hex').readDoubleBE();} const rows=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); const out=rows.map(r=>{const D=num(r.D),H=num(r.H);return {...r,actual:simulationWholeHpUnits(D,H),oldR2:Math.round((D-D%H)/H)};});fs.writeFileSync(process.argv[3],JSON.stringify(out));