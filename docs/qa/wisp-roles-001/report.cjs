'use strict';
const fs=require('node:fs'),path=require('node:path');
const r=JSON.parse(fs.readFileSync(path.join(__dirname,'results.json'),'utf8'));
const pct=n=>(n*100).toFixed(2)+'%';
const num=n=>n===null ? 'ikke dræbt inden 60s' : n.toLocaleString('da-DK',{maximumFractionDigits:2});
const lines=['# WISP_ROLES_001 — lokal baselineanalyse','',
  'Dette er måling og designforberedelse. Ingen produktændring, integration eller deviceaccept.',
  '',`Kilde: live main \`${r.provenance.liveMain}\`, produktblob \`${r.provenance.indexGitBlob}\`.`,
  `Produkt-SHA256: \`${r.provenance.indexSha256}\`. Node: ${r.provenance.tool}.`,
  '', '## Modtaget save og faktiske indstillinger', '',
  'Den bevarede og igen indsendte backup er efter Ascend: Ember 1, resten 0. MaxDepthEver 220; alle Rarity 5, Modules 20 og Ultimates. Kun Titan Auto-Empower er ON, Auto-Ascend target er 22 (clear 21). Presets er hensigt, ikke bevis for powered medlemmer.',
  '', '| Simulering fra save | Tid | Rift | Aktive levels | Empowers |', '| --- | ---: | ---: | --- | ---: |'];
for(const t of r.trajectories)lines.push(`| ${t.scenario} | ${t.seconds}s | ${t.snapshot.depth} | ${t.snapshot.activeParty.map(id=>id+' '+t.snapshot.spirits[id]).join(', ')} | ${t.summary.empowers} |`);
lines.push('', 'Uændrede indstillinger genopbygger ikke det gemte Boss-hold i disse vinduer. Med kun Auto-Ascend OFF opbygges Titan og startup-Ember; det er en eksplicit kontrolvariant, ikke et nyt bruger-save eller en foreslået indstillingsændring.',
  '', '## Equal-budget', '',
  'Hvert hold får samme Lumen-loft, fordelt lige pr. slot. Hele eksisterende afrundede køb købes fra level 0; restbudget beholdes som cash. Det er samme spend-cap, ikke præcis samme forbrug eller en optimal købsstrategi. Permanent collection holdes identisk; historisk betalt Rarity/Module/Ultimate-værdi kan ikke udledes af levels og er ikke hævdet lige.',
  '', 'Alle 56 fem-Wisp-hold undersøges for hvert af tre budgetter, to permanente profiler og tre kontekster (1.008 holdmålinger). Push/Farm her deler damage-konteksten Rift 99; Farm har også ressourcefrontier. Alle tre Boss traits prøves særskilt i fuldmotoren nedenfor.',
  '', '| Lumen-loft | Profil | Kontekst | Højeste målte DPS med Titan | Højeste målte DPS uden Titan | Uden / med |', '| ---: | --- | --- | ---: | ---: | ---: |');
for(const x of r.equalBudget.filter(x=>x.mode!=='farm'))lines.push(`| ${num(x.budget)} | ${x.profile} | ${x.mode} | ${num(x.withTitan.output.total)} | ${num(x.withoutTitan.output.total)} | ${pct(x.ratio)} |`);
lines.push('', 'Højeste betyder under den angivne lige slotfordeling. Det beviser ikke global optimalitet eller at Titan vinder under alle mulige købsfordelinger.',
  '', '## Dine presets under et fælles 10 mia. Lumen-loft', '',
  'Permanente køb følger den modtagne late-game-save. Run-levels er kontrollerede konstruktioner; ingen powered mid-game-save er modtaget.',
  '', '| Preset / Rift | Faktisk forbrug | Rest | Rå damage-DPS | Bond-ekstra | Support-ekstra | Samlet |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
for(const mode of ['push','farm','boss']){
  const x=r.equalBudget.find(x=>x.profile==='saved-permanent'&&x.budget===1e10&&x.mode===mode);
  const t=x.presets.find(t=>t.preset===mode),o=t.output;
  lines.push(`| ${mode} / ${x.depth} | ${num(t.spent)} | ${num(t.residual)} | ${num(o.ledger.rawDamageDps)} | ${num(o.ledger.bondExtraDps)} | ${num(o.ledger.supportExtraDps)} | ${num(o.total)} |`);
}
for(const mode of ['push','farm','boss']){
  const x=r.equalBudget.find(x=>x.profile==='saved-permanent'&&x.budget===1e10&&x.mode===mode);
  const o=x.presets.find(t=>t.preset===mode).output;
  lines.push('', `### ${mode} / Rift ${x.depth}`, '',
    '| Wisp | Level | Rå DPS | Ekstra support-DPS | Tab af hold-DPS ved fjernelse | Tab i % | Ability-Lumen/s | Ability-Shards/s | Motes-tab pr. Luminous kill |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for(const w of o.rows){const m=o.marginal.find(m=>m.id===w.id);lines.push(`| ${w.id} | ${w.level} | ${num(w.rawDamageDps)} | ${num(w.supportExtraDps)} | ${num(m.damageDelta)} | ${pct(m.fraction)} | ${num(w.rewards.lumen/o.cycle)} | ${num(w.rewards.shards/o.cycle)} | ${m.motesPerLuminousDelta} |`);}
  lines.push('', 'Bonds med additivt skadebidrag før support: '+o.bondLedger.map(b=>`${b.id} (${b.partners.join(' + ')}): ${num(b.damageDelta)} DPS`).join('; ')+'.',
    `Faktisk reward pr. Luminous kill ved denne Rift: ${o.motePerLuminous}. Ability-rewards afrundes pr. cast; kill-rewards er et separat flow.`);
}
lines.push('', '## Regnskab uden dobbeltoptælling', '',
  'Rå skade = passive skade + damaging abilities/cycle + Wisp-afledt Auto-Tap + Guardians faste grundbidrag. Permanente globale effekter er med. Bonds anvendes i fast kildeorden og deres inkrementer summeres. Support-ekstra er øgningen af passive skade og Auto-Tap efter Bonds; abilities buffes ikke. Rå skade + Bond-ekstra + support-ekstra matcher sustainedCombatDps i alle målte hold.',
  '', 'Tab ved fjernelse er en separat hvad-nu-hvis-måling med uændret investering, øvrige levels og permanent collection. Bond-partnere kan begge være nødvendige for samme effekt. Tallene må derfor aldrig summeres eller tegnes som en 100%-fordeling. I Farm-eksemplet bliver den fejlagtige sum '+pct(r.checks.overlappingRemovalRatio)+' af totalen; negativkontrollen fanger begge former for dobbeltoptælling.',
  '', 'Lumen, Shards og Motes omregnes ikke til DPS. Dawnpriest/Modules vises som betingede resource-effekter og marginalt tab. Uptime er sustained, ikke første cast eller et løfte om konkret kill-tid. Pending/Bench giver intet earned bidrag; legacy buffs kræver særskilt visning som eksisterende entitlement ved en fremtidig UI-implementation.',
  '', '## Observeret Boss-TTK fra fuldmotoren', '',
  'Samme 10 mia.-loft, eksisterende permanente køb, ingen køer eller nye upgrades i vinduet, ingen startbuff, resource 0. Tidspunkt observeres efter alle motor-events, så både ability- og tap-kills medtages. 60s vindue. Dette er genererede hold, ikke faktisk spillede snapshots.',
  '', '| Rift | Hold | Gennemsnitsestimat (s) | Første Boss-kill (s) |', '| ---: | --- | ---: | ---: |');
for(const x of r.bossRuns)lines.push(`| ${x.depth} | ${x.ids.join(', ')} | ${num(x.initial.bossEstimate)} | ${num(x.firstKillSec)} |`);
lines.push('', '## Åbne verifikationsfund', '',
  'Den nye måler returnerer exit 1, fordi whole/split Farm-parity ikke består. Alle 16 kontroller bevarer konkrete motor-exceptions. På main afsluttes de otte 60s-vinduer med save-clock, men første 10s-chunk staller ved en mikroskopisk windowEnd-rest. Aligned control staller ved farmGrid. Den præcise nyere B2-index er også prøvet; se b2-results.json. Dette accepterer eller ændrer ikke B2 og er ikke en rettelse i WISP-scope.',
  '', 'Den arkiverede formula_probe genkører PASS og matcher præcis sit gemte resultat. Pending-zero, read-purity og de to negative double-count-kontroller består. Browserchecks er forsøgt: sandbox blokerer localhost-socket; support-stacking med ekstra adgang og derefter escalation afslutter med 25s timeout og ingen QA-resultat. Ingen browser-, mobil- eller Androidaccept påstås.',
  '', 'Alle detaljer, eksakte køb, restbudgetter, reward-rater, next-purchase DPS/Lumen, summaries, Boss-eventspor og exceptions ligger i results.json. Produktionsdesign og fortsættelse står i ../../tasks/WISP_ROLES_001.md.', '');
const latestPath=path.join(__dirname,'latest-main-results.json');
if(fs.existsSync(latestPath)){
  const latest=JSON.parse(fs.readFileSync(latestPath,'utf8'));
  require('node:assert/strict').deepEqual(r.equalBudget,latest.equalBudget);
  lines.push('## Latest integrated main — current receipt','',
    `PR51 merged to main \`${latest.provenance.liveMain}\`. Exact product blob \`${latest.provenance.indexGitBlob}\`; SHA256 \`${latest.provenance.indexSha256}\`.`,
    '', 'All equal-budget and individual-Wisp outputs are unchanged. The numerical tables above remain applicable to this newer main. The old Farm failure summary above describes its explicitly named initial baseline.',
    '', `On current main, ${latest.finite.filter(x=>x.parityPass).length}/${latest.finite.length} Farm whole/split checks pass: all saved-fractional-clock cases pass; aligned-clock cases still throw at farmGrid. Aggregate exit remains 1. See latest-main-results.json.`,
    '', 'Current Node context check passes. Browser acceptance, actual powered mid/late-game snapshots, balance decisions, coordinated writer checkpoint and Wisp implementation/integration remain pending.', '');
}
fs.writeFileSync(path.join(__dirname,'REPORT.md'),lines.join('\n'));
console.log('Wrote REPORT.md from preserved measurements');
