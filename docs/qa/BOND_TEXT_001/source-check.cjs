const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const baseline=fs.readFileSync(process.argv[2],'utf8'),candidate=fs.readFileSync(process.argv[3],'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function definitions(src){const sandbox={};vm.runInNewContext(src.slice(src.indexOf('var SPIRITS = ['),src.indexOf('var RESOURCE_COLORS =')),sandbox);return JSON.parse(JSON.stringify({wisps:sandbox.SPIRITS,bonds:sandbox.FORMATION_BONDS,abilities:sandbox.ABILITY_DESC}));}
const before=definitions(baseline),after=definitions(candidate);
assert.deepEqual(before.wisps,after.wisps);
assert.deepEqual(before.bonds.map(({req,...bond})=>bond),after.bonds);
let a=baseline.replace(/, req:'[^']+'/g,'').replace('Heavy ability damage. Stone + Titan together activate the Duskguard boss-damage Bond; its Module boosts the hit and its Ultimate doubles it.','Heavy ability damage. Its Module boosts the hit; its Ultimate doubles it.').replace('heavy ability hits and the Stone + Titan Duskguard pair specializes against bosses','heavy ability hits').replaceAll('bond.req','PARTNERS');
let b=candidate.replace(/function formationBondPartners\(bond\)\{\n  return bond.ids.map\(function\(id\)\{\n    return SPIRITS.find\(function\(sp\)\{ return sp.id===id; \}\).name;\n  \}\).join\(' \+ '\);\n\}\n/,'').replaceAll('formationBondPartners(bond)','PARTNERS');
assert.equal(a,b,'No unreviewed gameplay/save/price/reward/lifecycle edits outside exact presentation delta');
const scripts=[...candidate.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'inline-'+i+'.js'}));
const ui=JSON.parse(fs.readFileSync(process.argv[4],'utf8')),baseUi=JSON.parse(fs.readFileSync(process.argv[5],'utf8'));
assert.deepEqual(ui.mechanics,baseUi.mechanics,'Real browser Bond activation/multipliers/average output unchanged');
// Contrast uses the measured row colors and a conservative bound on the dark
// enclosing card's RGB components (80 each); actual palette is darker.
function color(s){let m=s.match(/^rgb\(([^)]+)\)/);if(m)return m[1].split(/[,\s]+/).filter(Boolean).map(Number).concat(1).slice(0,4);m=s.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);assert(m,'Unsupported measured color '+s);return [Number(m[1])*255,Number(m[2])*255,Number(m[3])*255,m[4]===undefined?1:Number(m[4])];}
function lum(rgb){return rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
const contrasts=ui.profiles.flatMap(p=>p.rows.map(row=>{const ink=color(row.color),bg=color(row.background);const bound=bg.slice(0,3).map(v=>v*bg[3]+80*(1-bg[3]));const ratio=(lum(ink)+.05)/(lum(bound)+.05);assert(ratio>=4.5,'Partner text contrast');return {width:p.width,textScale:p.textScale,motion:p.motion,partner:row.partner,conservativeRatio:ratio};}));
console.log(JSON.stringify({status:'PASS',baselineSha256:hash(baseline),candidateSha256:hash(candidate),scriptsSyntaxChecked:scripts.length,mechanicsSamples:ui.mechanics.length,unchangedGameSavePriceRewardLifecycleBytes:true,minimumConservativePartnerContrast:Math.min(...contrasts.map(x=>x.conservativeRatio)),contrastAssumption:'Underlying dark card RGB components <=80; measured row alpha composited against [80,80,80]',contrasts},null,2));
