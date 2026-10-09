#!/usr/bin/env node
'use strict';
// Reuse the accepted real Chromium transport; replace only its QA scenario.
// The temporary generated driver is never part of the production APK.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const sourcePath=path.resolve(process.argv[2]||'index.html'),evidence=path.resolve(process.argv[3]||'collection-price-evidence');
const expectBaseline=process.argv.includes('--expect-baseline-failure'),negatives=process.argv.includes('--negative');
const source=fs.readFileSync(sourcePath,'utf8'),sourceHash=crypto.createHash('sha256').update(source).digest('hex');
let driver=fs.readFileSync(path.join(__dirname,'prism-acceptance.cjs'),'utf8');
const marker='breakdown:ascendPrismBreakdown,keys:function(){return [SAVE_KEY,RECOVERY_SAVE_KEY];}';assert.equal(driver.split(marker).length,2);
driver=driver.replace(marker,`collectionSeed:function(){var s=freshState();s.maxDepthEver=250;s.questDay=todayStr();s.lastSeen=Date.now();s.owned={};s.activeStudies=[];
 s.nodes.starlight=7;s.nodes.steady=9;s.nodes.momentum=11;s.research.resolve=6;s.research.focus=3;s.research.sense=4;s.research.formation=5;
 s.longStudyLevels.riftattune=4;s.longStudyLevels.formationstudy=5;s.longStudyLevels.prismstudy=6;
 s.lumen=0;s.shards=0;s.prisms=0;s.comets=0;SPIRITS.forEach(function(sp){s.empowerQueue[sp.id]=false;});return s;},
 wallets:function(v){Object.keys(v).forEach(function(k){state[k]=v[k];});},
 refreshCosts:function(){lastAffordabilityAt=0;checkAffordability();},
 `+marker);
const start=driver.indexOf('  const samples=[];'),end=driver.indexOf("  await send('Target.disposeBrowserContext'",start);assert(start>0&&end>start);
const cases=String.raw`
  const samples=[];
  const specs=[
   {tab:'forge',button:'[data-research="arcanecal"]',card:'[data-forge-card="arcanecal"]',prices:{lumen:15000,shard:120},field:'research',id:'arcanecal'},
   {tab:'research',button:'[data-study="guardmastery"]',card:'[data-study-card="guardmastery"]',prices:{lumen:600,shard:40},field:'activeStudies',id:'guardmastery'},
   {tab:'ascend',button:'[data-node="swift"]',card:null,prices:{prism:3},field:'nodes',id:'swift'},
   {tab:'deeds',button:'[data-shop="autoascend"]',card:null,prices:{comet:100},field:'owned',id:'autoascend'}
  ];
  for(const spec of specs){
   await ev('prismQa.set(prismQa.collectionSeed());prismQa.ready();prismQa.tab('+JSON.stringify(spec.tab)+')');
   // Observe actual entry-animation completion before strict 44px geometry checks.
   await ev('Promise.all(document.getElementById('+JSON.stringify('tab-'+spec.tab)+').getAnimations().map(function(a){return a.finished;})).then(function(){return true;})');
   const wantedNames={lumen:'Lumen',shard:'Shards',prism:'Prisms',comet:'Comets'},walletKeys={lumen:'lumen',shard:'shards',prism:'prisms',comet:'comets'};
   async function observe(values,label){
    await ev('prismQa.wallets('+JSON.stringify(values)+')');const before=await ev('JSON.stringify(prismQa.get())');
    await ev('prismQa.refreshCosts()');ok(await ev('JSON.stringify(prismQa.get())')===before,'wallet refresh is presentation-only '+label);
    const observed=await ev('('+function(spec,names){
     var button=document.querySelector(spec.button),card=spec.card?document.querySelector(spec.card):button.closest('.node-card,.shop-card');if(!card)throw Error('missing actual card '+spec.tab);
     var probe=document.createElement('span');document.body.appendChild(probe);probe.style.color='var(--danger)';var red=getComputedStyle(probe).color;probe.style.color='var(--ink)';var white=getComputedStyle(probe).color;probe.remove();
     var costs={};Object.keys(spec.prices).forEach(function(kind){var icon=card.querySelector('.cost-icon[aria-label="'+names[kind]+'"]');if(!icon)throw Error('missing currency icon '+kind);var e=icon.parentElement;costs[kind]={color:getComputedStyle(e).color,text:e.textContent.trim(),scroll:e.scrollWidth,client:e.clientWidth};});
     var r=card.getBoundingClientRect();return {red:red,white:white,costs:costs,disabled:button.disabled,legacy:document.querySelectorAll('[data-legacy-upgrade]').length,
      overflow:card.scrollWidth>card.clientWidth+1||r.right>innerWidth+1||r.left<-.5,extra:Array.from(button.querySelectorAll('.control-state')).map(function(e){return e.textContent;}),label:button.getAttribute('aria-label')};
    }.toString()+')('+JSON.stringify(spec)+','+JSON.stringify(wantedNames)+')');
    ok(observed.legacy===0,'legacy shop cards must remain absent');ok(!observed.overflow,'price card fits '+JSON.stringify({width,scale,tab:spec.tab,label}));
    for(const [kind,amount] of Object.entries(spec.prices)){
     const want=values[walletKeys[kind]]<amount?observed.red:observed.white;
     ok(observed.costs[kind].color===want,'wallet color '+JSON.stringify({tab:spec.tab,label,kind,want,got:observed.costs[kind].color}));
     ok(observed.costs[kind].scroll<=observed.costs[kind].client+1,'price fits '+kind);ok(!/need|missing|short/i.test(observed.costs[kind].text),'no deficit text');
    }
    const can=Object.entries(spec.prices).every(([kind,amount])=>values[walletKeys[kind]]>=amount);
    ok(observed.disabled===!can,'button eligibility refresh '+spec.tab+' '+label);ok(observed.extra.length===0,'no additional shortage label '+spec.tab);
    samples.push({tab:spec.tab,label,colors:observed.costs});
   }
   const zero={},enough={};Object.keys(spec.prices).forEach(kind=>{zero[walletKeys[kind]]=0;enough[walletKeys[kind]]=spec.prices[kind];});
   await observe(zero,'initial insufficient');await observe(enough,'becomes affordable without rerender');
   for(const [kind,amount] of Object.entries(spec.prices))await observe({...enough,[walletKeys[kind]]:amount-1},'only '+kind+' missing');
   await observe(enough,'affordable again');await point(spec.button);await shot('prices-'+spec.tab+'-'+width+'-'+scale+'-'+motion);
   await ev('document.querySelector('+JSON.stringify(spec.button)+').focus();window.__priceFocus=document.activeElement;prismQa.refreshCosts()');
   ok(await ev('document.activeElement===window.__priceFocus'),'price refresh retains focus');
   const before=await ev('prismQa.get()');await tap(spec.button);const after=await ev('prismQa.get()');
   for(const kind of Object.keys(spec.prices))ok(after[walletKeys[kind]]===before[walletKeys[kind]]-spec.prices[kind],'real touch exact debit '+spec.tab+' '+kind);
   if(spec.field==='activeStudies')ok(after.activeStudies.some(s=>s.id===spec.id),'real paid Study starts');
   else ok(after[spec.field][spec.id]===(spec.field==='owned'?true:1),'real touch grants purchased value '+spec.tab);
   for(const key of ['nodes','research','longStudyLevels'])for(const id of Object.keys(before[key]))if(!(key===spec.field&&id===spec.id))ok(after[key][id]===before[key][id],'old paid levels retained '+key+' '+id);
   const saved=await ev('prismQa.keys().map(function(k){return JSON.parse(localStorage.getItem(k));})');ok(JSON.stringify(saved[0])===JSON.stringify(saved[1]),'two saved slots match after purchase');
   for(const kind of Object.keys(spec.prices))ok(saved[0][walletKeys[kind]]===after[walletKeys[kind]],'paid wallet saved '+kind);
   if(spec.id==='autoascend')ok(after.autoAscendEnabled===true&&after.autoAscendTargetDepth>=16,'Auto-Ascend unlock behavior retained');
  }
  await ev("prismQa.set(prismQa.collectionSeed());prismQa.ready();prismQa.wallets({prisms:1e16});prismQa.refreshCosts()");
  ok(await ev("document.querySelector('[data-node=\"swift\"]').disabled"),'unrepresentable debit still refused');
  ok(await ev("document.querySelector('[data-node=\"swift\"] .cost').style.color==='var(--ink)'"),'sufficient wallet stays white despite other purchase guard');
  ok((await ev('window.__prismErrors')).length===0,'no runtime error');records.push({width,scale,motion,samples,input:await ev('window.__prismInput')});
`;
driver=driver.slice(0,start)+cases+driver.slice(end);
fs.mkdirSync(evidence,{recursive:true});const tempDriver=path.join(__dirname,'.collection-price-generated-'+process.pid+'.cjs');fs.writeFileSync(tempDriver,driver);
const summaries=[];
function execute(name,text,shouldFail){
 const stage=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-price-')),dir=path.join(evidence,name);fs.mkdirSync(dir,{recursive:true});
 try{fs.writeFileSync(path.join(stage,'index.html'),text);for(const p of ['fonts','branding'])fs.cpSync(path.join(path.dirname(sourcePath),p),path.join(stage,p),{recursive:true});
  const r=spawnSync(process.execPath,[tempDriver,path.join(stage,'index.html'),dir],{encoding:'utf8',timeout:240000,maxBuffer:16*1024*1024});
  fs.writeFileSync(path.join(dir,'stdout.log'),r.stdout||'');fs.writeFileSync(path.join(dir,'stderr.log'),r.stderr||'');
  const receipt=path.join(dir,'receipt.json');assert(fs.existsSync(receipt),'missing actual browser receipt '+name);
  const v=JSON.parse(fs.readFileSync(receipt,'utf8'));
  const accepted=shouldFail?r.status===1&&v.status==='fail'&&v.checks>0&&/wallet color|legacy shop cards must remain absent/.test(v.error||''):
    r.status===0&&v.status==='pass'&&v.profiles.length===12;
  const summary={name,accepted,exitcode:r.status,checks:v.checks,sourceSha256:v.sourceSha256,profiles:v.profiles.length,error:v.error||null};summaries.push(summary);console.log(JSON.stringify(summary));
  assert(accepted,'actual price/visibility '+name+' acceptance failed');
 }finally{fs.rmSync(stage,{recursive:true,force:true});}
}
try{
 if(expectBaseline)execute('original-collection',source,true);
 else {
  execute('normal',source,false);
  if(negatives){
   const pairs=[['stale-refresh',"function updatePurchasePriceColors(root){","function updatePurchasePriceColors(root){ return;"],
    ['all-white',"state[key]<amount ? 'var(--danger)' : 'var(--ink)'","false ? 'var(--danger)' : 'var(--ink)'"],
    ['retired-card-returns',"replaceControlMarkup(els['node-list'],html);","replaceControlMarkup(els['node-list'],html+legacyUpgradeSection(legacyHtml));"]];
   for(const [name,from,to] of pairs){assert.equal(source.split(from).length,2,'unique real mutant marker');execute(name,source.replace(from,to),true);}
  }
 }
}finally{fs.unlinkSync(tempDriver);fs.writeFileSync(path.join(evidence,'summary.json'),JSON.stringify({sourceSha256:sourceHash,results:summaries},null,2)+'\n');}
