'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'../../..');
const {app,copy,parity,source}=require(root+'/tests/behavioral/formation-bonds.cjs');
const data=JSON.parse(fs.readFileSync(root+'/docs/qa/formation-bonds-001/equal-budget.json'));
assert.equal(data.sourceSha256,require('node:crypto').createHash('sha256').update(source).digest('hex'),'regenerate budgets for current product first');
const late=data.records[1],wall=late.bossWallWins.find(x=>x.depth===160);
assert(wall&&wall.winner.net>0,'documented utility window');
const probe=app().b,base=probe.fresh();base.depth=base.enemyDepth=160;base.maxDepthEver=400;
for(const [id,p]of Object.entries(late.ledger)){base.spirits[id]=p.level;base.heroRarity[id]=p.rarity;base.wispModules[id]=p.module;base.wispUltimate[id]=p.ultimate;}
const alternatives=late.rows.map(row=>{const s=copy(base);s.activeParty=row.boss.party.slice();s.formationPresets.push=s.activeParty.slice();probe.set(s);const hp=probe.hp(160),dps=probe.dps(160),regen=probe.regen(160);return {party:s.activeParty,bonds:probe.bonds().map(x=>x.id),hp,dps,regen,net:dps-hp*regen};}).filter(row=>!row.bonds.includes('vanguard')).sort((a,b)=>b.net-a.net);
assert(alternatives.every(row=>row.net<=0),'every non-Vanguard estimate remains walled');wall.bestWithoutVanguard=alternatives[0];
const bound=Math.ceil(wall.winner.estimatedSeconds*1.25+20),records=[];
for(const [label,team] of [['Vanguard',wall.winner.party],['highest net without Vanguard',wall.bestWithoutVanguard.party]]){
 const x=app(),b=x.b,s=b.fresh();s.depth=s.enemyDepth=160;s.maxDepthEver=400;
 s.activeParty=team.slice();s.formationPresets.push=team.slice();s.lastSeen=2000000000000;
 for(const [id,p] of Object.entries(late.ledger)){s.spirits[id]=p.level;s.heroRarity[id]=p.rarity;s.wispModules[id]=p.module;s.wispUltimate[id]=p.ultimate;}
 b.set(s);s.enemyHp=s.enemyMaxHp=b.hp(160);b.set(s);const initial=copy(b.get());let seconds=0;
 while(seconds<bound&&b.get().depth===160){b.advance(1,'live',2000000000000+seconds*1000);seconds++;}
 const final=copy(b.get());const direct=app();direct.b.set(initial);direct.b.advance(seconds,'live',2000000000000);
 parity(direct.b.get(),final,'whole/one-second Boss window');
 records.push({label,party:team,seconds,depth:final.depth,kills:final.totalKills-initial.totalKills,enemyHp:final.enemyHp,enemyMaxHp:final.enemyMaxHp,wholeOneSecondParity:true});
}
assert(records[0].depth>160&&records[0].kills>0,'Vanguard clears real Boss');
assert(records[1].depth===160&&records[1].kills===0,'estimated non-Vanguard winner remains walled in matched window');
const out={status:'pass',sourceSha256:data.sourceSha256,sharedAccountActualSpent:late.sharedAccountActualSpent,policy:'actual live chronology; zero shared upgrades/manual taps/Auto-Tap; same entire purchased account; bounded first Boss window, not campaign pacing',boundSeconds:bound,nonVanguardPartiesChecked:alternatives.length,highestNonVanguardNet:alternatives[0].net,records};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
